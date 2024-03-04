import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import pkg from 'pg';
import { POSTGRES_URL } from '$env/static/private';
import type { User, UserExludingPassword } from '$lib/types';
const { Pool } = pkg;
const pool = new Pool({
	connectionString: POSTGRES_URL,
	ssl: true
});

export const load = (async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(307, `/konto?redirect=${url.pathname}`);
	}

	const client = await pool.connect();
	try {
		const { rows: users } = await client.query<UserExludingPassword>(
			`SELECT id, firstname, lastname, email, authority_level, created_at, 
			updated_at, email_verified, validated, last_send_email FROM users WHERE id != $1;`,
			[locals.user.id]
		);

		return { users: users };
	} catch (err) {
		console.error('Error fetching users:', err);
		// Handle or throw the error as per your application's error handling policy
		throw error(
			500,
			'Der skete en uventet felj da vi prøvede at hente brugere fra databasen. ' +
				JSON.stringify(err)
		);
	} finally {
		client.release();
	}
}) as PageServerLoad;
