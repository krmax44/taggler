import { ScraperResult } from '../Scraper/ScraperResult';
import { TagglerFile } from '..';

export interface WriterResult {
	file: TagglerFile;
	data: ScraperResult;
	error: false | string;
}
