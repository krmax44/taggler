import { resolve } from 'path';
import fs from 'fs-extra';
import { ScraperResult, WriterResult } from 'taggler';

const ffmetadata: any = require('ffmetadata');

module.exports = class FFmpegWriter {
	async write(file: string, data: ScraperResult): Promise<WriterResult> {
		const tmpCover = resolve(file, '..', `.${file}-album-cover.png`);

		if (data.albumImage) {
			try {
				await fs.writeFile(tmpCover, data.albumImage as Buffer);
			} catch {
				throw new FFmpegWriterError('Could not save album image.');
			}
		}

		const attachments = data.albumImage ? [tmpCover] : [];

		return new Promise(resolve => {
			ffmetadata.write(
				file,
				{
					title: data.title,
					artist: data.artist,
					album: data.album,
					composer: data.composer || '',
					track: data.trackNumber || '',
					genre: data.genre || ''
				},
				{
					attachments
				},
				(err: string) => {
					fs.remove(tmpCover);

					if (err) {
						throw new FFmpegWriterError(err);
					}

					resolve({
						file,
						data,
						error: false
					});
				}
			);
		});
	}
};

class FFmpegWriterError extends Error {
	constructor(message: string) {
		super(message);
		Object.setPrototypeOf(this, FFmpegWriterError.prototype);
	}
}
