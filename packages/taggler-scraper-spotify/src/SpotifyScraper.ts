import { ScraperResult, ScraperSetup, ScraperValidationInput } from 'taggler';
import { SpotifyConnection } from './SpotifyConnection';
import { getCredentials, setCredentials } from './credentialManager';

module.exports = class SpotifyScraper {
	connection: SpotifyConnection;
	isSetUp: boolean = false;

	constructor(connection?: SpotifyConnection) {
		this.connection = connection;
	}

	async setup(): Promise<ScraperSetup> {
		const credentials = getCredentials();

		if (credentials) {
			try {
				const { clientId, clientSecret } = credentials;
				this.connection = new SpotifyConnection(clientId, clientSecret);
				this.isSetUp = await this.connection.connect();
				setCredentials(credentials);
			} catch {
				this.isSetUp = false;
			}
		}

		if (this.isSetUp) {
			return true;
		}

		const filter = (input: string): string => input.replace(/[^a-z0-9]/gm, '');

		return {
			questions: [
				{
					type: 'input',
					name: 'clientId',
					message:
						'Spotify API client id (you can obtain one here: https://developer.spotify.com/dashboard/applications)',
					filter
				},
				{
					type: 'input',
					name: 'clientSecret',
					message: 'Spotify API client secret',
					filter
				}
			],
			async validate(
				answers: ScraperValidationInput[]
			): Promise<true | string> {
				try {
					const [{ value: clientId }, { value: clientSecret }] = answers;
					await new SpotifyConnection(clientId, clientSecret).connect();
					setCredentials({ clientId, clientSecret });
					return true;
				} catch {
					return 'Invalid credentials.';
				}
			}
		};
	}

	async scrape(filename: string): Promise<ScraperResult[]> {
		return this.connection.scrape(filename);
	}
};
