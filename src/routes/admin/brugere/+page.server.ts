import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import type { User, UserExludingPassword } from '$lib/types';

import { pool } from '$lib/server/database';

export const load = (async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(307, `/konto?redirect=${url.pathname}`);
	}

	const client = await pool.connect();
	try {
		const { rows: users } = await client.query<UserExludingPassword>(
			`SELECT 
			pending_users.context,
			users.id ,
			 users.firstname, 
			users.lastname, 
			users.email, 
			users.authority_level, 
			users.created_at, 
       		users.updated_at, 
	   		users.email_verified, 
	   		users.validated, 
			users.last_send_email 
			FROM users 
			LEFT JOIN pending_users ON users.id = pending_users.user_id
			WHERE users.id != $1;`,
			[locals.user.id]
		);
		console.log('users', users);

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
