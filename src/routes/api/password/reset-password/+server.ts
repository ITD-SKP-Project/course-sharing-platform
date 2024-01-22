import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '$env/static/private';

export const POST: RequestHandler = async ({ request }) => {
	const { token, password } = (await request.json()) as { token: string; password: string };
	//validate token
	if (!token) {
		console.log('No token provided');
		throw error(400, 'No token provided');
	}
	if (!password) {
		console.log('No password provided');
		throw error(400, 'No password provided');
	}

	const { rows: tokens } = await sql`SELECT * FROM verification_tokens WHERE token = ${token}`;
	if (tokens.length === 0 || tokens[0].type !== 'reset_password') {
		console.log('Token match not found');
		throw error(401, 'Token does not exist');
	}

	const salt = bcrypt.genSaltSync(+BCRYPT_SALT_ROUNDS);
	const hash = bcrypt.hashSync(password, salt);

	//update password
	const { rows: users } =
		await sql`UPDATE users SET password = ${hash} WHERE id = ${tokens[0].user_id} RETURNING *`;
	if (users.length === 0) {
		console.log('User not found');
		throw error(404, 'User does not exist');
	}

	return json({ message: 'Password reset' });
};
