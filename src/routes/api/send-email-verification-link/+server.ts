import type { RequestHandler } from './$types';
import pkg from 'pg';
import { POSTGRES_URL } from '$env/static/private';
const { Pool } = pkg;
const pool = new Pool({
	connectionString: POSTGRES_URL,
	ssl: true
});
import { error, json } from '@sveltejs/kit';
import { RESEND_API_KEY } from '$env/static/private';
import { Resend } from 'resend';
import * as randombytes from 'randombytes';

export const POST: RequestHandler = async ({ request }) => {
	const client = await pool.connect();
	try {
		const { email } = (await request.json()) as { email: string };

		// Use parameterized query for security
		const queryText = 'SELECT * FROM users WHERE email = $1 LIMIT 1';
		const { rows: users } = await client.query(queryText, [email]);

		if (users.length === 0) {
			throw new Error('User not found.');
		}

		const user = users[0];
		const lastSendEmailTime = user.last_send_email ? new Date(user.last_send_email).getTime() : 0;
		const now = new Date().getTime();

		// Check if an email was sent within the last minute
		if (lastSendEmailTime > now - 1000 * 60) {
			return error(429, 'Du kan kun sende en email hvert minut.');
		}

		const key = randombytes.default(64).toString('hex');
		// Save the token to the database
		await client.query(
			'INSERT INTO verification_tokens (user_id, token, type) VALUES ($1, $2, $3)',
			[user.id, key, 'email_verification']
		);

		const domain =
			process.env.NODE_ENV === 'development'
				? 'http://localhost:5173'
				: 'https://course-sharing-platform.vercel.app';

		await sendVerificationEmail(user.email, key, domain);

		return new Response(); // Successful response
	} catch (err) {
		console.error('Error:', err);
		return error(500, 'Internal server error: ' + JSON.stringify(err));
	} finally {
		client.release();
	}
};

async function sendVerificationEmail(toEmail: string, key: string, domain: string) {
	try {
		const resend = new Resend(RESEND_API_KEY);
		const { error: sendError } = await resend.emails.send({
			from: 'info@kennik.dk',
			to: [toEmail],
			subject: 'Bekræft din email',
			html: emailTemplate(toEmail, domain, key)
		});

		if (sendError) {
			throw new Error('Email sending failed: ' + JSON.stringify(sendError));
		}
	} catch (err) {
		console.error('Error in sendVerificationEmail:' + JSON.stringify(err));
		throw err;
	}
}

function emailTemplate(email: string, domain: string, key: string) {
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
    `;
}
