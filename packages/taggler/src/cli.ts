#!/usr/bin/env node

import inquirer from 'inquirer';
import cac from 'cac';
import {
	Scraper,
	Writer,
	TagglerResult,
	ScraperResult,
	WriterResult
} from './types';
import { getFiles } from './getFiles';

const loading: any = require('loading-cli');
const chalk: any = require('chalk');

const cli = cac();

cli
	.command('[...files]', 'Tag files')
	/* .option('--scraper -S', 'Scraper', { default: 'spotify' })
	.option('--writer -W', 'Writer', { default: 'ffmpeg' }) */
	.action(async files => {
		// TODO: let user change scrapers/writers via cli options
		const ScraperClass = require('taggler-scraper-spotify');
		const WriterClass = require('taggler-writer-ffmpeg');

		const scraper: Scraper = new ScraperClass();
		const writer: Writer = new WriterClass();

		if (typeof scraper.setup === 'function') {
			const settingUpScraper = loading('Setting up scraper...').start();

			while (!scraper.isSetUp) {
				await setupScraper(scraper);
			}

			settingUpScraper.stop();
		}

		try {
			const loadingFiles = loading('Gathering files...').start();
			files = await getFiles(files);
			loadingFiles.stop();

			const scrapingFiles = loading('Scraping files...').start();
			const scraped: Array<Promise<TagglerResult>> = [];

			for (const file of files) {
				scraped.push(
					new Promise(resolve => {
						Promise.resolve(scraper.scrape(file.name))
							.then(async (data: ScraperResult) => {
								resolve({ ...file, data, error: false });
							})
							.catch((error: string) =>
								resolve({ ...file, error: String(error) })
							);
					})
				);
			}

			const scraperResults = await Promise.all(scraped);
			const successfulScrapes = scraperResults.filter(
				({ error }) => error === false
			);
			const failedScrapes = scraperResults
				.filter(({ error }) => error !== false)
				.map(
					({ name, file, error }) =>
						` * ${chalk.blue(name || file)} failed: ${error}`
				);

			scrapingFiles.stop();

			if (failedScrapes.length > 0) {
				console.log(
					`The following items could not be scraped successfully:\n${failedScrapes.join(
						'\n'
					)}`
				);
			}

			const written: Array<Promise<WriterResult>> = [];
			const failedWrites: WriterResult[] = [];

			for (const { file, name = file, data } of successfulScrapes) {
				const choices: any = data.map((value: ScraperResult) => ({
					name: `${value.title} - ${chalk.grey(value.artist)} - ${chalk.grey(
						value.album
					)}`,
					value
				}));

				choices.push({ name: 'None of them match.', value: false });

				const { selectedData } = await inquirer.prompt([
					{
						type: 'list',
						message: `Choose the matching track for ${chalk.blue(name)}`,
						name: 'selectedData',
						choices,
						default: 0
					}
				]);

				if (selectedData === false) {
					failedWrites.push({
						file,
						data: selectedData,
						error: 'There was no applicable scraper result for this item.'
					});
				} else {
					written.push(
						// eslint-disable-next-line no-async-promise-executor
						new Promise(async resolve => {
							if (typeof selectedData.albumImage === 'function') {
								const albumImage = await Promise.resolve(
									selectedData.albumImage()
								);
								selectedData.albumImage = albumImage;
							}

							Promise.resolve(writer.write(file, selectedData as ScraperResult))
								.then(result => resolve(result))
								.catch(error => ({ file, data, error: String(error) }));
						})
					);
				}

				const writingFiles = loading('Writing files...').start();
				const writerResults = await Promise.all(written);
				writingFiles.stop();

				failedWrites.push(
					...writerResults.filter(result => result.error !== false)
				);

				if (failedWrites.length > 0) {
					console.log(
						`The following items could not be written successfully:\n${failedWrites
							.map(
								({ file, error }) => ` * ${chalk.blue(file)} failed: ${error}`
							)
							.join('\n')}`
					);
				} else {
					console.log('All files were successfully written!');
				}
			}
		} catch (error) {
			return console.error(error);
		}
	});

cli.parse();

async function setupScraper(scraper: Scraper): Promise<Scraper> {
	return new Promise((resolve, reject) => {
		Promise.resolve(scraper.setup()).then(setup => {
			if (setup === true) {
				return resolve(scraper);
			}

			inquirer.prompt(setup.questions).then(answers => {
				if (typeof setup.validate === 'function') {
					Promise.resolve(setup.validate(answers)).then(validation => {
						if (validation !== true) {
							return reject(validation);
						}

						resolve(scraper);
					});
				} else {
					resolve(scraper);
				}
			});
		});
	});
}

process.on('uncaughtException', function(err) {
	console.log(err);
});
