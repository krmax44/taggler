import { ScraperResult } from '../Scraper/ScraperResult';
import { TagglerFile } from './TagglerFile';

export interface TagglerResult {
	file: TagglerFile;
	name?: string;
	error: false | string;
	data?: ScraperResult[]; // Depending on error, it's set or not
}

export type TagglerResults = TagglerResult[];
