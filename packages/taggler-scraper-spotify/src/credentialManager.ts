import { resolve } from 'path';
import dotenv from 'dotenv';
import Conf from 'conf';

const config = new Conf({
	projectName: 'taggler-scraper-spotify'
});

/*
	I know you can extract the auth credentials and use for your own purposes.
	Please don't and obtain your own ones. Thank you.
*/
const env = dotenv.config({
	path: resolve(__dirname, '../', '.env.local')
});

interface SpotifyCredentials {
	clientId: string;
	clientSecret: string;
}

export function getCredentials(): SpotifyCredentials | false {
	if (config.has('clientId')) {
		return {
			clientId: config.get('clientId') as string,
			clientSecret: config.get('clientSecret') as string
		};
	}

	if (
		!env.error &&
		env.parsed.SPOTIFY_CLIENT_ID &&
		env.parsed.SPOTIFY_CLIENT_SECRET
	) {
		return {
			clientId: env.parsed.SPOTIFY_CLIENT_ID,
			clientSecret: env.parsed.SPOTIFY_CLIENT_SECRET
		};
	}

	return false;
}

export function setCredentials(credentials: SpotifyCredentials): void {
	config.set({ ...credentials });
}
