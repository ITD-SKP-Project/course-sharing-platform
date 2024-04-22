import type { RequestHandler } from './$types';
import type { ProjectComment } from '$lib/types';
import { error, json } from '@sveltejs/kit';
import { pool } from '$lib/server/database';

export const DELETE: RequestHandler = async ({ locals, params }) => {
	const { id } = params;

	if (!locals.user) {
		return error(401, 'Du skal være logget ind for at kunne slette kommentarer.');
	}
	if (!locals.user?.validated) {
		return error(403, 'Du har ikke tilladelse til at slette kommentarer.');
	}

	const client = await pool.connect();
	try {
		//start by checking if the comment exists and if the user has permission to delete it
		const { rows: comments } = await client.query(
			`SELECT 
				id,
				user_id
			FROM 
				project_comments
			WHERE 
				project_comments.id = $1
				AND project_comments.user_id = $2`,
			[id, locals.user.id]
		);
		if (comments.length === 0) {
			return error(404, 'Kommentaren blev ikke fundet.');
		}
		if (comments[0].user_id !== locals.user.id && locals.user?.authority_level < 4) {
			return error(403, 'Du har ikke tilladelse til at slette denne kommentar.');
		}

		//delete comment
		await client.query(
			`DELETE FROM project_comments
			WHERE id = $1`,
			[id]
		);
	} catch (err) {
		console.error('Error:', err);
		return error(500, 'Internal server error: ' + JSON.stringify(err));
	} finally {
		client.release();
	}

	return new Response();
};

export const POST: RequestHandler = async ({ request, locals, params }) => {
	const { id } = params;
	console.log('test');
	if (!locals.user) {
		return error(401, 'Du skal være logget ind for at kunne redigere kommentarer.');
	}
	if (!locals.user?.validated) {
		return error(403, 'Du har ikke tilladelse til at redigere kommentarer.');
	}

	const { message } = (await request.json()) as ProjectComment;
	console.log('🚀 ~ constPOST:RequestHandler= ~ message:', message);

	const client = await pool.connect();
	try {
		//start by checking if the comment exists and if the user has permission to edit it
		const { rows: comments } = await client.query(
			`SELECT 
				id,
				user_id
			FROM 
				project_comments
			WHERE 
				project_comments.id = $1
				AND project_comments.user_id = $2`,
			[id, locals.user.id]
		);
		if (comments.length === 0) {
			return error(404, 'Kommentaren blev ikke fundet.');
		}
		if (comments[0].user_id !== locals.user.id && locals.user?.authority_level < 4) {
			return error(403, 'Du har ikke tilladelse til at redigere denne kommentar.');
		}

		//update comment
		await client.query(
			`UPDATE project_comments SET message = $1
			WHERE id = $2`,
			[message, id]
		);
	} catch (err) {
		console.error('Error:', err);
		return error(500, 'Internal server error: ' + JSON.stringify(err));
	} finally {
		client.release();
	}

	return new Response();
};
