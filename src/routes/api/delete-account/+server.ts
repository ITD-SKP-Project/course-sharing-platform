import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import pkg from 'pg';
import { POSTGRES_URL } from '$env/static/private';
const { Pool } = pkg;
const pool = new Pool({
	connectionString: POSTGRES_URL,
	ssl: true
});

export const DELETE: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, 'Du skal være logget ind for at slette din konto.');
	}
	const client = await pool.connect();
	try {
		//remove user with
		await client.query('SELECT delete_user($1);', [locals.user.id]);
	} catch (e) {
		console.error('Error deleting user:', e);
		client.query('ROLLBACK');
		throw error(500, 'Der skete en fejl under sletning af din konto.');
	} finally {
		client.release();
	}
	return json({ message: 'Din konto er blevet slettet.' });
};
