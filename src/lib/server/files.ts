import { writeFile } from 'fs/promises';
import fs from 'fs';

import { resolve } from 'path';

export async function postFile(file: File, subFolder?: string) {
	let uploadFolder = resolve('uploads');

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
		body: { message: 'Files uploaded successfully.' }
	};
}
export async function getFile(fileName: string) {
	const filePath = resolve('uploads', fileName); // Adjust the path based on your file storage location

	if (fs.existsSync(filePath)) {
		const fileContent = fs.readFileSync(filePath);

		return {
			status: 200,
			headers: {
				'Content-Disposition': `attachment; filename="${fileName}"`,
				'Content-Type': 'application/octet-stream'
			},
			body: fileContent
		};
	} else {
		return {
			status: 404,
			body: { message: 'File not found' }
		};
	}
}
