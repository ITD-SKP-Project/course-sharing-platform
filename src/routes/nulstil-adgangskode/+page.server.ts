import { z } from 'zod';
import pkg, { type PoolClient } from 'pg';
import { POSTGRES_URL } from '$env/static/private';
import type { User, VerificationToken } from '$lib/types';
import * as randombytes from 'randombytes';
import { RESEND_API_KEY } from '$env/static/private';
import { Resend } from 'resend';
const { Pool } = pkg;
import { pool } from '$lib/server/database';

const registerSchema = z.object({
	email: z
		.string({ required_error: 'Email mangler at blive udfyldt.' })
		.email({ message: 'Indtast venligst en rigtig email adresse.' })
});

export const actions = {
	default: async ({
		request,
		cookies
	}): Promise<{
		formData?: any;
		validationErrors?: any;
		serverError?: string;
		success?: boolean;
	} | void> => {
		const formData = Object.fromEntries(await request.formData());

		//validate form
		const { password, ...rest } = formData;
		let result: any;
		try {
			result = registerSchema.parse(formData);
		} catch (err: any) {
			const { fieldErrors: errors } = err.flatten();

			return {
				formData: rest,
				validationErrors: errors
			};
		}
		const client = await pool.connect();

		try {
			const users = await fetchUserByEmail(client, result.email);
			if (users.length === 0) {
				return {
					serverError: 'Der er ingen bruger med den email.',
					formData: rest
				};
			}

			const user = users[0];

			const verificationToken = await createVerificationToken(client, user.id, 'reset_password');
			if (verificationToken.length === 0) {
				return {
					serverError: 'Der skete en fejl ved oprettelse af token.',
					formData: rest
				};
			}

			const domain = getDomain();
			const res = await sendResetPasswordEmail(user.email, verificationToken[0].token, domain);
			if (res?.serverError) {
				return {
					serverError: res.serverError,
					formData: rest
				};
			}
			return {
				success: true
			};
		} catch (err) {
			console.error(err);
			return {
				serverError: 'Der skete en fejl.',
				formData: rest
			};
		} finally {
			client.release();
		}
	}
};

async function fetchUserByEmail(client: PoolClient, email: string): Promise<User[]> {
	const queryText = 'SELECT * FROM users WHERE email = $1 LIMIT 1';
	const { rows } = await client.query<User>(queryText, [email]);
	return rows;
}

async function createVerificationToken(
	client: PoolClient,
	userId: number,
	type: string
): Promise<VerificationToken[]> {
	const key = randombytes.default(64).toString('hex');
	const insertQuery =
		'INSERT INTO verification_tokens (user_id, token, type) VALUES ($1, $2, $3) RETURNING *';
	const { rows } = await client.query<VerificationToken>(insertQuery, [userId, key, type]);
	return rows;
}

function getDomain(): string {
	return process.env.NODE_ENV === 'development'
		? 'http://localhost:5173'
		: 'https://course-sharing-platform.vercel.app';
}

async function sendResetPasswordEmail(
	toEmail: string,
	token: string,
	domain: string
): Promise<{ serverError?: string } | void> {
	const resend = new Resend(RESEND_API_KEY); // Make sure to replace with actual API key
	const { error: err } = await resend.emails.send({
		from: 'info@kennik.dk',
		to: [toEmail],
		subject: 'Nulstil din adgangskode',
		html: resetPasswordEmailTemplate(toEmail, domain, token)
	});

	if (err) {
		console.error(err);
		return {
			serverError: 'Der skete en fejl ved afsendelse af email.'
		};
	}
}

function resetPasswordEmailTemplate(email: string, domain: string, token: string): string {
	// HTML template here
	return `
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
						Hej ${email}.
					</span>
				</h1>
				<p>
					<span style="line-height: 16.8px">
						Du har bedt om at nulstille din adgangskode. Klik på knappen nedenfor for at nulstille din adgangskode.
					</span>
				</p>
				<a
					href=${domain}/skift-adgangskode-via-link?token=${token}
					target="_blank"
				>
					<span>
						<strong>
							<span style="line-height: 16.8px">
								Nulstil adgangskode
							</span>
						</strong>
					</span>
				</a>
			</body>
		</html>
    `;
}
