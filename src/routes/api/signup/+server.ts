import type { RequestHandler } from './$types';
import bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '$env/static/private';
import { sql } from '@vercel/postgres';
import { error, json } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, RESEND_API_KEY } from '$env/static/private';
import type { DatabaseResponse, User } from '$lib/types';
import { Resend } from 'resend';
import * as randombytes from 'randombytes';

export const POST: RequestHandler = async ({ request, cookies, url }) => {
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

	//TODO: fix later when we get an email and remove email_verified from users table
	const { rows: users } =
		await sql`INSERT INTO users (email, password, Email_verified, last_send_email) VALUES (${email}, ${hash}, false, NOW()) RETURNING * `;
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
	const key = randombytes.default(64).toString('hex');
	//save token to database
	const { rows: verificationTokens } =
		await sql`INSERT INTO verification_tokens (user_id, token, type) VALUES (${users[0].id}, ${key}, 'email_verification') RETURNING *`;

	//if in development, use localhost, else use domain
	let domain;
	if (process.env.NODE_ENV === 'development') {
		domain = 'http://localhost:3000';
	} else {
		domain = 'https://course-sharing-platform.vercel.app';
	}
	try {
		const resend = new Resend(RESEND_API_KEY);
		const { data, error: err } = await resend.emails.send({
			from: 'info@kennik.dk',
			to: [users[0].email],
			subject: 'Bekræft din email',
			html: `
			<html lang="da">
				<head>
					<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1.0" />
					<meta name="x-apple-disable-message-reformatting" />
					<!--[if !mso]><!-->
					<meta http-equiv="X-UA-Compatible" content="IE=edge" />
					<!--<![endif]-->
					<title>Bekræft email.</title>
				</head>
				<body>
					<h1>
						<span style="line-height: 16.8px">
							Hej ${users[0].email}.
						</span>
					</h1>
					<p>
						<span style="line-height: 16.8px">
							Tak for din tilmelding til course-sharing-platform. For at kunne logge ind, skal du bekræfte din email.
						</span>
					</p>
					<a
						href=${domain}/signup/bekraeft-email?token=${key}
						target="_blank"
						
					>
						<span>
							<strong>
								<span style="line-height: 16.8px">
									Bekræft e-mail
								</span>
							</strong>
						</span>
					</a>
				</body>
			</html>
		`
		});

		if (err) {
			console.error(err);
			throw error(503, `Der skete en fejl ved afsendelse af email. ${err.message}`);
		}
	} catch (err) {
		console.error(err);
		throw error(
			500,
			`Fejl ved afsendelse af mail. Sikkert grundet en manglede environment key. ${err.message}`
		);
	}

	return json({ token, user: users[0] });
};
