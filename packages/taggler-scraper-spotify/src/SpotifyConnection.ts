import axios from 'axios';
import { ScraperResult } from 'taggler';

export class SpotifyConnection {
	clientId: string;

	clientSecret: string;

	private _token: string;

	constructor(clientId: string, clientSecret: string) {
		this.clientId = clientId;
		this.clientSecret = clientSecret;
	}

	async connect(): Promise<boolean> {
		const request = await axios.post(
			'https://accounts.spotify.com/api/token',
			'grant_type=client_credentials',
			{ auth: { username: this.clientId, password: this.clientSecret } }
		);

		if (request.status === 200 && request.data) {
			this._token = request.data.access_token;
			return true;
		}

		throw new SpotifyAuthError(`Could not authenticate: ${request.data}`);
	}

	async scrape(search: string): Promise<ScraperResult[]> {
		const request = await axios.get('https://api.spotify.com/v1/search', {
			headers: {
				Authorization: `Bearer ${this._token}`,
				Accept: 'application/json'
			},
			params: {
				q: search,
				type: 'track',
				limit: 10
			}
		});

		if (request.status === 200) {
			if (request.data.tracks.items.length === 0) {
				throw new SpotifyScrapeError(
					'Could not find requested item on Spotify'
				);
			}

			return request.data.tracks.items.map((track: any) => ({
				title: track.name,
				artist: track.artists.map((artist: any) => artist.name).join('; '),
				album: track.album.name,
				albumImage: async (): Promise<Buffer> => {
					const request = await axios.get(track.album.images[0].url, {
						responseType: 'arraybuffer'
					});

					return request.data;
				},
				trackNumber: `${track.track_number}/${track.album.total_tracks}`
			}));
		}

		throw new SpotifyScrapeError('Could not communicate with the Spotify API.');
	}
}

export class SpotifyAuthError extends Error {
	constructor(message: string) {
		super(message);
		Object.setPrototypeOf(this, SpotifyAuthError.prototype);
	}
}

export class SpotifyScrapeError extends Error {
	constructor(message: string) {
		super(message);
		Object.setPrototypeOf(this, SpotifyScrapeError.prototype);
	}
}
