import type { RequestHandler } from './$types';
import { error, fail, json } from '@sveltejs/kit';

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

	let privilegeErrorId: number | null = null;
	await client.query('BEGIN');
	try {
		for (const id of ids) {
			const { rows: user } = await client.query<{ authority_level: number }>(
				'SELECT authority_level FROM users WHERE id = $1 LIMIT 1;',
				[id]
			);

			if (user[0] && user[0].authority_level > locals.user.authority_level) {
				privilegeErrorId = id;
				throw error(403);
			}
			await client.query('SELECT delete_user($1);', [id]);
		}
		await client.query('COMMIT');
	} catch (e) {
		console.error('Error deleting user:', e);
		await client.query('ROLLBACK');
		if (privilegeErrorId)
			return error(
				403,
				'Du har ikke rettigheder til at slette brugeren med id: ' + privilegeErrorId + '.'
			);
		else throw error(500, 'Der skete en fejl under sletning af din konto.');
	} finally {
		client.release();
	}
	return json({ message: 'Brugeren/e er blevet fjernet.' });
};
