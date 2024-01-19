import type { RequestHandler } from './$types';
import bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '$env/static/private';
import { sql } from '@vercel/postgres';
import { error, json, redirect } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';
import type { DatabaseResponse, User } from '$lib/types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const { email, password } = (await request.json()) as { email: string; password: string };
	if (!email || !password) throw error(400, 'Invalid request body');

	//check if user exists
	const data =
		(await sql`SELECT * FROM users where email = ${email} LIMIT 1`) as DatabaseResponse<User>;
	const userExists = data.rows[0] ?? null;
	if (userExists) throw error(400, 'Brugeren eksisterer allerede');

	//hash password
	const salt = bcrypt.genSaltSync(+BCRYPT_SALT_ROUNDS);
	const hash = bcrypt.hashSync(password, salt);

	//create user
	const { rows: users } =
		await sql`INSERT INTO users (email, password) VALUES (${email}, ${hash}) RETURNING * `;
	if (!users || users.length <= 0)
		throw error(500, 'Der skete en fejl ved oprettelse af bruger. Prøv igen senere.');

	//make token
	const token = jwt.sign(users[0], JWT_SECRET, { expiresIn: '1h' });

	cookies.set('token', token, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'strict'
	});
	return json({ token, user: users[0] });
};
