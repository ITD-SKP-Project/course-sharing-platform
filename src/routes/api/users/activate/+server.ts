import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';

import { pool } from '$lib/server/database';

export const POST: RequestHandler = async ({ locals, url }) => {
	if (!locals.user) {
		throw error(401, 'Du skal være logget ind for at slette en konto.');
	}
	const ids = JSON.parse(url.searchParams.get('ids') || '[]');
	if (ids.length === 0) {
		throw error(400, "Der blev ikke givet nogle id'er.");
	}

	const client = await pool.connect();
	try {
		//remove user with
		await client.query('BEGIN');
		ids.forEach(async (id: number) => {
			await client.query('UPDATE users SET validated = true WHERE id = $1', [id]);
			await client.query('DELETE FROM pending_users WHERE user_id = $1', [id]);
		});
		await client.query('COMMIT');
	} catch (e) {
		console.error('Error deleting user:', e);
		client.query('ROLLBACK');
		throw error(500, 'Der skete en fejl under aktivering af din konto.');
	} finally {
		client.release();
	}
	return json({ message: 'Brugeren/e er blevet aktiveret.' });
};
