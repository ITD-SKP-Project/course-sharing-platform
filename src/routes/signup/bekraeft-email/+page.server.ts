import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { sql } from '@vercel/postgres';

export const load = (async ({ locals, url }) => {
	if (locals.onboardingStatus !== 'needs-email-verification') {
		throw redirect(301, locals.onboardingRedirectLocation);
	}

	const token = url.searchParams.get('token');
	if (!token) {
		return {};
	}
	const { rows: tokens } = await sql`SELECT * FROM verification_tokens WHERE token = ${token}`;
	if (tokens.length === 0 || tokens[0].type !== 'email_verification') {
		return {};
	}
	const { rows: users } =
		await sql`UPDATE users SET email_verified = true WHERE id = ${tokens[0].user_id} RETURNING *`;
	if (users.length === 0) {
		return {};
	}
	await sql`DELETE FROM verification_tokens WHERE token = ${token}`;
	throw redirect(301, '/signup/bruger-info');
}) satisfies PageServerLoad;
