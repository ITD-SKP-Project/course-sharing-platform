import type { VerificationToken } from '$lib/types';
import type { PageServerLoad } from './$types';
import { redirect, error } from '@sveltejs/kit';
import { POSTGRES_URL } from '$env/static/private';
import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({
	connectionString: POSTGRES_URL,
	ssl: true
});
export const load = (async ({ url }) => {
	const token = url.searchParams.get('token');
	if (!token) {
		console.log('No token provided');
		throw redirect(301, '/login');
	}

	const client = await pool.connect();
	try {
		const getTokenQuery = 'SELECT * FROM verification_tokens WHERE token = $1';
		const tokens = await client.query<VerificationToken>(getTokenQuery, [token]);
		if (!tokens.rows || tokens.rows.length === 0) {
			throw error(404, 'Token not found');
		}
		const deleteTokenQuery = 'DELETE FROM verification_tokens WHERE token = $1 RETURNING *';
		const deletedTokens = await client.query<VerificationToken>(deleteTokenQuery, [token]);
		if (!deletedTokens.rows || deletedTokens.rows.length === 0) {
			throw error(404, 'Token not found');
		}
	} catch (err) {
		// Handle or throw the error as per your application's error handling policy
		console.warn('Authentication error:', JSON.stringify(err));
		throw redirect(303, '/login');
	} finally {
		client.release();
	}
}) satisfies PageServerLoad;
