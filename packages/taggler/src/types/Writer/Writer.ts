import { WriterResult } from './WriterResult';
import { ScraperResult } from '..';

export interface Writer {
	write: (
		file: string,
		data: ScraperResult
	) => WriterResult | Promise<WriterResult>;
}
