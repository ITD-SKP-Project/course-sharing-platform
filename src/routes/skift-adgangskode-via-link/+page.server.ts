import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { sql } from '@vercel/postgres';

export const load = (async ({ url }) => {
	const token = url.searchParams.get('token');
	if (!token) {
		throw redirect(301, '/login');
	}
	const { rows: tokens } = await sql`SELECT * FROM verification_tokens WHERE token = ${token}`;
	if (tokens.length === 0 || tokens[0].type !== 'reset_password') {
		throw redirect(301, '/login');
	}
	const { rows: users } =
		await sql`UPDATE users SET email_verified = true WHERE id = ${tokens[0].user_id} RETURNING *`;
	if (users.length === 0) {
		throw redirect(301, '/login');
	}
	return {};
}) satisfies PageServerLoad;
