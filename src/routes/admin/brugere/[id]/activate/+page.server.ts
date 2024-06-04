import type { PageServerLoad } from './$types';
import { redirect, error, json } from '@sveltejs/kit';
import * as Sentry from '@sentry/sveltekit';
import type { User, UserExludingPassword, VerificationToken, pending_users } from '$lib/types';
import { pool } from '$lib/server/database';

export const load = (async ({ url, locals, params }) => {
	if (!locals.user) {
		throw redirect(307, `/login?redirect=${url.pathname}`);
	}
	if (locals.user.authority_level < 3) {
		throw error(403, 'Du har ikke adgang til at se denne side.');
	}

	let client = await pool.connect();
	let user: UserExludingPassword | null;
	try {
		const { rows: users } = await client.query<UserExludingPassword>(
			`SELECT id, firstname, lastname, email, authority_level, created_at, 
			updated_at, email_verified, validated, last_send_email FROM users WHERE id = $1 LIMIT 1;`,
			[params.id]
		);

		user = users[0];
	} catch (err) {
		console.error('Error fetching users:', err);
		Sentry.captureException(err);

		// Handle or throw the error as per your application's error handling policy
		throw error(
			500,
			'Der skete en uventet felj da vi prøvede at hente brugere fra databasen. ' +
				JSON.stringify(err)
		);
	} finally {
		client.release();
	}

	if (!user) {
		throw error(
			404,
			'Brugeren blev ikke fundet. Denne bruger er muligvis blevet slettet af en anden administrator.'
		);
	}
	if (user.id === locals.user.id) {
		throw error(
			403,
			'Du kan ikke redigere din egen bruger her. Gå til din konto for at redigere din egen bruger.'
		);
	}
	if (user.authority_level && user.authority_level >= locals.user.authority_level) {
		throw error(403, 'Du har ikke adgang til at redigere denne bruger.');
	}
	client = await pool.connect();
	try {
		const { rows: usersPendig } = await client.query<pending_users>(
			`SELECT * FROM pending_users WHERE user_id = $1;`,
			[params.id]
		);
		const pendingUser = usersPendig[0];
		if (pendingUser) {
			user.context = pendingUser.context;
		}
	} catch (err) {
		console.error('Error fetching users:', err);
		Sentry.captureException(err);
		// Handle or throw the error as per your application's error handling policy
		throw error(
			500,
			'Der skete en uventet felj da vi prøvede at hente brugere fra databasen. ' +
				JSON.stringify(err)
		);
	} finally {
		client.release();
	}
	return { user: user };
}) satisfies PageServerLoad;
