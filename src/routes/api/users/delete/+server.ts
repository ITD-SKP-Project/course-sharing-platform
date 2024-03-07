import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';

import { pool } from '$lib/server/database';

export const DELETE: RequestHandler = async ({ locals, url }) => {
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
		ids.forEach(async (id: number) => {
			await client.query('SELECT delete_user($1);', [id]);
		});
		await client.query('COMMIT');
	} catch (e) {
		console.error('Error deleting user:', e);
		client.query('ROLLBACK');
		throw error(500, 'Der skete en fejl under sletning af din konto.');
	} finally {
		client.release();
	}
	return json({ message: 'Brugeren/e er blevet fjernet.' });
};
