import { TagglerFile } from '..';

type AlbumImageFunction = () => Promise<Buffer>;

export interface ScraperResult {
	title: string;
	subtitle?: string;
	artist: string;
	textWriter?: string;
	performerInfo?: string;
	album: string;
	albumImage?: Buffer | AlbumImageFunction;
	genre?: string;
	composer?: string;
	trackNumber?: string; // Format: trackNumber/totalTracks, eg: 4/9
}

export type ScraperResults = Array<{
	file: TagglerFile;
	name: string;
	data: ScraperResult[] | Promise<ScraperResult[]>;
}>;
