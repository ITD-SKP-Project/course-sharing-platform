import type { RequestHandler } from './$types';
import { fail, json, error } from '@sveltejs/kit';
import fs from 'fs';
import { resolve } from 'path';

export const POST: RequestHandler = async ({ request }) => {
	// const { file } = (await request.json()) as { file: File };

	// const uploadFolder = resolve('static/files');

	// if (!fs.existsSync(uploadFolder)) {
	// 	fs.mkdirSync(uploadFolder, { recursive: true });
	// }

	// // Save the file to the file system
	// const filePath = resolve(uploadFolder, file.name);

	// fs.
	return {
		status: 200,
		body: { message: 'Files uploaded successfully.' }
	};
};
