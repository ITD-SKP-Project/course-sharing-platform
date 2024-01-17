import type { RequestHandler } from './$types';
import jwt from 'jsonwebtoken';
import { error, json } from '@sveltejs/kit';
import { JWT_SECRET } from '$env/static/private';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';
import type { DatabaseResponse, User } from '$lib/types';
export const POST: RequestHandler = async ({ request, cookies }) => {
	//! get email and password from request body
	const { email, password } = (await request.json()) as { email: string; password: string };
	console.log(email, password);
	if (!email || !password) throw error(400, 'Invalid request body');

	//! get user from database
	const data =
		(await sql`SELECT * from users where email = ${JSON.stringify(email)} LIMIT 1`) as DatabaseResponse<User>;
	const user = data.rows[0] ?? null;
	if (!data || !user) throw error(401, 'Invalid credentials');

	//! compare password
	const valid = bcrypt.compareSync(password, user.password);
	if (!valid) throw error(401, 'Invalid credentials');

	//make token
	const token = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });

	cookies.set('token', token, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'strict'
	});
	return json({ token });
};
