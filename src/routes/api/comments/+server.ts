import type { RequestHandler } from './$types';
import type { ProjectComment } from '$lib/types';
import { error, json } from '@sveltejs/kit';
import { pool } from '$lib/server/database';
import * as Sentry from '@sentry/sveltekit';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return error(401, 'Du skal være logget ind for at kunne redigere kommentarer.');
	}
	if (!locals.user?.validated || locals.user?.authority_level < 1) {
		return error(403, 'Du har ikke tilladelse til at redigere kommentarer.');
	}

	const { message, root_comment_id, answer_comment_id, project_id } =
		(await request.json()) as ProjectComment;
	console.log(
		'🚀 ~ constPOST:RequestHandler= ~  { message, root_comment_id, answer_comment_id, project_id }:',
		{ message, root_comment_id, answer_comment_id, project_id }
	);
	if (!message || !project_id) {
		return error(400, 'Der mangler information i kommentaren.');
	}
	if (message.length > 250) {
		return error(400, 'Kommentaren er for lang.');
	}

	const userId = locals.user?.id;

	const client = await pool.connect();
	try {
		await client.query(
			`INSERT INTO project_comments (message, root_comment_id, answer_comment_id, project_id, user_id)
            VALUES ($1, $2, $3, $4, $5)`,
			[message, root_comment_id, answer_comment_id, project_id, userId]
		);
	} catch (err) {
		console.error('Error:', err);
		Sentry.captureException(err);

		return error(500, 'Internal server error: ' + JSON.stringify(err));
	} finally {
		client.release();
	}

	return new Response();
};
