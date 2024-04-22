import { writeFile } from 'fs/promises';
import fs from 'fs';

import { resolve, join } from 'path';

export async function postFile(file: File, subFolder?: string) {
	let uploadFolder = resolve('/home/opgbank/uploads');

	if (subFolder) {
		uploadFolder = resolve(uploadFolder, subFolder);
	}

	if (!fs.existsSync(uploadFolder)) {
		fs.mkdirSync(uploadFolder);
	}

	// if the file already exists, look for a unique name
	let fileName = file.name;
	let i = 1;
	while (fs.existsSync(resolve(uploadFolder, fileName))) {
		fileName = `${i++}_${file.name}`;
	}

	const filePath = resolve(uploadFolder, fileName);

	//write the file to the file system
	await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

	return {
		status: 200,
		body: { message: 'Filen blev lagt op.' }
	};
}
//delete file
export async function deleteFile(path: string) {
	try {
		const dirPath = resolve('/home/opgbank/uploads', path);

		if (!fs.existsSync(dirPath)) {
			return {
				status: 404,
				body: { message: `Directory "${path}" does not exist.` }
			};
		}

		const files = fs.readdirSync(dirPath);

		for (const file of files) {
			const currentPath = join(dirPath, file);
			if (fs.lstatSync(currentPath).isDirectory()) {
				// Recursively delete directory contents
				await deleteFile(join(path, file));
				// Optionally, remove the directory itself after clearing its contents
				fs.rmdirSync(currentPath);
			} else {
				// Delete file
				fs.unlinkSync(currentPath);
			}
		}

		return {
			status: 200,
			body: { message: 'Directory contents were deleted.' }
		};
	} catch (err) {
		console.error(err);
		return {
			status: 500,
			body: { message: `Oops. An unknown error occurred on the server.` }
		};
	}
}
