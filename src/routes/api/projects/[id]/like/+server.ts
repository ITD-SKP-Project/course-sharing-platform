import type { RequestHandler } from './$types';
import * as Sentry from '@sentry/sveltekit';
import { pool } from '$lib/server/database';
import { error, json } from '@sveltejs/kit';

//api route: /api/projects/[id]/like
export const POST: RequestHandler = async ({ locals, url, params }) => {
	//get the project id from the url

	const projectId = params.id;

	const userId = locals.user.id;
	if (!userId) {
		return error(401, 'Unauthorized');
	}

	const client = await pool.connect();
	try {
		const { rows: likes } = await client.query(
			`SELECT * FROM project_likes WHERE project_id = $1 AND user_id = $2`,
			[projectId, userId]
		);
		if (likes.length > 0) {
			//remove like
			await client.query(`DELETE FROM project_likes WHERE project_id = $1 AND user_id = $2`, [
				projectId,
				userId
			]);
			return json({ liked: false });
		} else {
			//add like
			await client.query(`INSERT INTO project_likes (project_id, user_id) VALUES ($1, $2)`, [
				projectId,
				userId
			]);
			const { rows: likes } = await client.query(
				`SELECT * FROM project_likes WHERE project_id = $1`,
				[projectId]
			);
			return json({ liked: true, likes: likes.length });
		}
	} catch (err) {
		console.error('Error:', err);
		Sentry.captureException(err);
		return error(500, 'Internal server error: ' + JSON.stringify(err));
	} finally {
		client.release();
	}
};
