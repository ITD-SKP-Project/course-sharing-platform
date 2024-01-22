import type { RequestHandler } from './$types';
import { sql } from '@vercel/postgres';
import { error, json } from '@sveltejs/kit';
import type { DatabaseResponse, User } from '$lib/types';
import { RESEND_API_KEY } from '$env/static/private';
import { Resend } from 'resend';
import * as randombytes from 'randombytes';

export const POST: RequestHandler = async ({ request }) => {
	const { email } = (await request.json()) as { email: string };
	const { rows: users } =
		(await sql`SELECT * FROM users where email = ${email} LIMIT 1`) as DatabaseResponse<User>;
	const then = new Date(users[0].last_send_email);
	const now = new Date();

	if (users[0].last_send_email && then.getTime() > now.getTime() - 1000 * 60) {
		return error(429, 'Du kan kun sende en email hvert minut.');
	}

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

	return new Response();
};
