import { fail, json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fs from 'fs';
import { resolve } from 'path';
import { createReadStream } from 'fs';

export const POST: RequestHandler = async ({ request }) => {
	// get the last part of the url
	const { pathName } = await request.json();

	let filePath = resolve('/home/opgbank/uploads', pathName);

	if (!fs.existsSync(filePath)) {
		throw error(404, { message: `File "${pathName}" not found` });
	}

	const fileStream = createReadStream(filePath);

	const readable = new ReadableStream({
		start(controller) {
			fileStream.on('data', (chunk) => {
				controller.enqueue(chunk);
			});

			fileStream.on('end', () => {
				controller.close();
			});

			fileStream.on('error', (error) => {
				controller.error(error);
			});
		}
	});

	return new Response(readable, {
		headers: {
			'Content-Type': 'application/octet-stream' // Set the appropriate content type for your file
		}
	});
};
