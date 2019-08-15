import { ScraperResult, ScraperSetup } from '..';

export interface Scraper {
	setup: () => ScraperSetup | Promise<ScraperSetup>;
	isSetUp: boolean;
	scrape: (filename: string) => ScraperResult | Promise<ScraperResult>;
}
