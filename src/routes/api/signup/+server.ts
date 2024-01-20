import type { RequestHandler } from './$types';
import bcrypt from 'bcrypt';
import { sql } from '@vercel/postgres';
import { error, json, redirect } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, RESEND_API_KEY, BCRYPT_SALT_ROUNDS } from '$env/static/private';
import type { DatabaseResponse, User } from '$lib/types';
// import { Resend } from 'resend';
// import * as randombytes from 'randombytes';

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

	//gereate email verification token
	const key = '123'; // randombytes.default(64).toString('hex');
	//save token to database
	// const { rows: verificationTokens } =
	// 	await sql`INSERT INTO verification_tokens (user_id, token) VALUES (${users[0].id}, ${key}) RETURNING *`;

	//send email
	// const resend = new Resend(RESEND_API_KEY);
	// (async function () {
	// 	const { data, error: err } = await resend.emails.send({
	// 		from: 'Acme <onboarding@resend.dev>',
	// 		to: [users[0].email],
	// 		subject: 'Hello World',
	// 		html: `
	// 			<a
	// 				href=https://course-sharing-platform.vercel.app/signup/verify-email/${key}
	// 				target="_blank"
	// 				class="v-button v-size-width v-font-size"
	// 				style="
	// 					box-sizing: border-box;
	// 					display: inline-block;
	// 					text-decoration: none;
	// 					-webkit-text-size-adjust: none;
	// 					text-align: center;
	// 					color: #4264f0;
	// 					background-color: #ecca49;
	// 					border-radius: 4px;
	// 					-webkit-border-radius: 4px;
	// 					-moz-border-radius: 4px;
	// 					width: 32%;
	// 					max-width: 100%;
	// 					overflow-wrap: break-word;
	// 					word-break: break-word;
	// 					word-wrap: break-word;
	// 					mso-border-alt: none;
	// 					font-size: 14px;
	// 				"
	// 			> Verify email </a>
	// 	`
	// 	});

	// 	if (err) {
	// 		throw error(500, `Der skete en fejl ved afsendelse af email. Prøv igen senere. ${err}`);
	// 	}
	// })();

	return json({ token, user: users[0] });
};
