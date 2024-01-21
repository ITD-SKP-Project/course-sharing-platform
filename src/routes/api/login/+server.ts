import type { RequestHandler } from './$types';
import jwt from 'jsonwebtoken';
import { error, json, redirect } from '@sveltejs/kit';
import { JWT_SECRET } from '$env/static/private';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';
import type { DatabaseResponse, User } from '$lib/types';
export const POST: RequestHandler = async ({ request, cookies }) => {
	//! get email and password from request body
	const { email, password } = (await request.json()) as { email: string; password: string };

	if (!email || !password) throw error(400, 'Invalid request body');

	//! get user from database
	const data =
		(await sql`SELECT * FROM users where email = ${email} LIMIT 1`) as DatabaseResponse<User>;

	const user = data.rows[0] ?? null;

	if (!data || !user) throw error(401, 'Ugyldig email eller passord');

	//! compare password
	const valid = await bcrypt.compare(password, user.password);

	if (!valid) throw error(401, 'Ugyldig email eller passord');

	//make token
	const token = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });

	cookies.set('token', token, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'strict'
	});

	let redirectTo: null | string = null;

	if (!user.email_verified) {
		redirectTo = '/signup/bekraeft-email';
	}
	if (!user.firstname || !user.lastname) {
		redirectTo = '/signup/bruger-info';
	}
	if (!user.validated) {
		redirectTo = '/signup/afventer-godkendelse';
	}

	return json({ redirectTo, user });
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
