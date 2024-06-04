import type { PageServerLoad } from './$types';
import bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '$env/static/private';
import { error, json } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, RESEND_API_KEY } from '$env/static/private';
import type { User } from '$lib/types';
import { Resend } from 'resend';
import * as randombytes from 'randombytes';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';
import * as Sentry from '@sentry/sveltekit';

import { pool } from '$lib/server/database';

const registerSchema = z.object({
	email: z
		.string({ required_error: 'Email mangler at blive udfyldt.' })
		.email({ message: 'Indtast venligst en rigtig email adresse.' }),
	password: z
		.string({ required_error: 'Password is required' })
		.min(8, { message: 'Adgangskode skal være mindst 8 tegn.' })
		.max(64, { message: 'Adgangskode må ikke være mere end 63 tegn.' })
		.trim()
});

export const load = (async ({ locals }) => {
	if (locals.onboardingStatus !== 'none') {
		throw redirect(301, locals.onboardingRedirectLocation);
	}
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request, cookies }) => {
		const formData = Object.fromEntries(await request.formData());

		let result: any;
		try {
			//validate form
			result = registerSchema.parse(formData);
		} catch (err: any) {
			const { fieldErrors: errors } = err.flatten();
			const { password, ...rest } = formData;
			return {
				data: rest,
				errors
			};
		}

		const client = await pool.connect();
		try {
			const queryText = 'SELECT * FROM users WHERE email = $1 LIMIT 1';
			const data = await client.query(queryText, [result.email]);

			const userExists = data.rows[0] ?? null;
			if (userExists) {
				return {
					error: 'Brugeren eksisterer allerede',
					user: null
				};
			}

			//hash password
			const salt = bcrypt.genSaltSync(+BCRYPT_SALT_ROUNDS);
			const hash = bcrypt.hashSync(result.password, salt);

			const insertQuery =
				'INSERT INTO users (email, password, last_send_email) VALUES ($1, $2, NOW()) RETURNING *';
			const { rows: users } = await client.query(insertQuery, [result.email, hash]);

			if (!users || users.length <= 0)
				return {
					error: 'Der skete en fejl ved oprettelse af bruger. Prøv igen senere.',
					user: null
				};

			//generate JWT and login user
			const token = jwt.sign(users[0], JWT_SECRET, { expiresIn: '1h' });
			cookies.set('token', token, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'strict'
			});

			//send verification email
			// sendVerificationEmail(result.email, users[0].id);
			//gereate email verification token
			const key = randombytes.default(64).toString('hex');
			//save token to database

			const queryText1 =
				"INSERT INTO verification_tokens (user_id, token, type) VALUES ($1, $2, 'email_verification') RETURNING *";
			const { rows: verificationTokens } = await client.query(queryText1, [users[0].id, key]);

			const queryText2 = 'SELECT * FROM users WHERE email = $1 LIMIT 1';
			await client.query<User>(queryText2, [result.email]);

			//if in development, use localhost, else use domain
			let domain;
			if (process.env.NODE_ENV === 'development') {
				domain = 'http://localhost:5173';
			} else {
				domain = 'https://opgavebank.webhotel-itskp.dk';
			}

			const resend = new Resend(RESEND_API_KEY);
			const { data: data1, error: err } = await resend.emails.send({
				from: 'info@kennik.dk',
				to: [result.email],
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
									Hej ${result.email}.
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
				throw error(500, `Der skete en fejl ved afsendelse af email. ${JSON.stringify(err)}`);
			}
		} catch (error) {
			console.error(error);
			Sentry.captureException(error);
			return {
				error: 'Der skete en fejl ved oprettelse af bruger. Prøv igen',
				user: null
			};
		} finally {
			client.release();
		}

		throw redirect(303, '/konto');
	}
};
