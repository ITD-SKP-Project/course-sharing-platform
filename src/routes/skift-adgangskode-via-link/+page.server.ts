import type { PageServerLoad } from './$types';
import { redirect, error } from '@sveltejs/kit';
import { sql } from '@vercel/postgres';

export const load = (async ({ url }) => {
	const token = url.searchParams.get('token');
	if (!token) {
		console.log('No token provided');
		throw redirect(301, '/login');
	}
	const { rows: tokens } = await sql`SELECT * FROM verification_tokens WHERE token = ${token}`;
	if (tokens.length === 0 || tokens[0].type !== 'reset_password') {
		console.log('Token match not found');
		throw redirect(301, '/login');
	}

	return { token };
}) satisfies PageServerLoad;
