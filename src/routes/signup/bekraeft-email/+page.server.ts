import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

import { pool } from '$lib/server/database';

export const load = (async ({ locals, url }) => {
	const client = await pool.connect();

	if (locals.onboardingStatus !== 'needs-email-verification') {
		console.log('onboardingStatus:', locals.onboardingStatus);
		throw redirect(301, locals.onboardingRedirectLocation);
	}

	try {
		const token = url.searchParams.get('token');
		if (!token) {
			return {};
		}

		const queryText = 'SELECT * FROM verification_tokens WHERE token = $1';
		const { rows: tokens } = await client.query(queryText, [token]);

		if (tokens.length === 0 || tokens[0].type !== 'email_verification') {
			return {};
		}

		const queryText1 = 'UPDATE users SET email_verified = true WHERE id = $1 RETURNING *';
		const { rows: users } = await client.query(queryText1, [tokens[0].user_id]);

		if (users.length === 0) {
			return {};
		}

		const queryText2 = 'DELETE FROM verification_tokens WHERE token = $1';
		await client.query(queryText2, [token]);

		client.release();
	} catch (error) {
		// Handle or throw the error as per your application's error handling policy
		console.error('Authentication error:', JSON.stringify(error));
		throw new Error(
			'Error processing your request. Please try again later. ' + JSON.stringify(error)
		);
	}
	throw redirect(301, '/signup/bruger-info');
}) satisfies PageServerLoad;
