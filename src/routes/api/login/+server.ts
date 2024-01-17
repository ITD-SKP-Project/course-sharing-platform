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
		(await sql`SELECT * FROM users where email = ${email} LIMIT 1`) as DatabaseResponse<User>;
	console.log(data, 'data');
	const user = data.rows[0] ?? null;
	console.log(user, 'user');
	if (!data || !user) throw error(401, 'Ugyldig email eller passord');

	//! compare password
	const valid = await bcrypt.compare(password, user.password);
	console.log(await bcrypt.compare(password, user.password));
	console.log(valid, 'valid');
	if (!valid) throw error(401, 'Ugyldig email eller passord');

	//make token
	const token = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });

	cookies.set('token', token, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'strict'
	});

	return json({ token, user });
};

// delete method to logout
export const DELETE: RequestHandler = async ({ cookies }) => {
	cookies.delete('token', {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'strict'
	});
	return json({ message: 'success' });
};
