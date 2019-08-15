import path from 'path';
import fs from 'fs-extra';

async function fileStats(file: string): Promise<fs.Stats | false> {
	try {
		const stats = fs.lstat(file);
		return stats;
	} catch {
		return false;
	}
}

async function resolveFile(
	file: string,
	recursive?: boolean
): Promise<FileObject[]> {
	let stats = await fileStats(file);
	if (!stats) {
		stats = await fileStats(path.resolve(process.cwd(), file));
	}

	if (stats) {
		if (stats.isFile()) {
			const { name } = path.parse(file);
			return [{ file, name }];
		}

		if (stats.isDirectory() && recursive !== true) {
			const directory = await fs.readdir(file);
			const files = [];

			for (let item of directory) {
				item = path.resolve(file, item);
				const stats = await fileStats(item);

				if (stats && stats.isFile()) {
					files.push(...(await resolveFile(item)));
				}
			}

			return files;
		}
	}

	throw new Error('File not resolvable.');
}

export async function getFiles(files: string[]): Promise<FileObject[]> {
	const resolvedFiles = [];
	for (const file of files) {
		resolvedFiles.push(...(await resolveFile(file)));
	}

	return resolvedFiles;
}

interface FileObject {
	file: string;
	name: string;
}
