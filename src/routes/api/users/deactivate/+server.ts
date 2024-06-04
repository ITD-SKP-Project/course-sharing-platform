import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { RESEND_API_KEY } from '$env/static/private';
import { Resend } from 'resend';
import * as Sentry from '@sentry/sveltekit';

import { pool } from '$lib/server/database';

export const POST: RequestHandler = async ({ locals, url }) => {
	if (!locals.user) {
		throw error(401, 'Du skal være logget ind for at slette en konto.');
	}
	const ids = JSON.parse(url.searchParams.get('ids') || '[]');
	if (ids.length === 0) {
		throw error(400, "Der blev ikke givet nogle id'er.");
	}

	let privilegeErrorId: number | null = null;
	const client = await pool.connect();
	await client.query('BEGIN');
	try {
		for (const id of ids) {
			const { rows: user } = await client.query<{ authority_level: number; email: string }>(
				'SELECT authority_level, email FROM users WHERE id = $1 LIMIT 1;',
				[id]
			);

			if (user[0] && user[0].authority_level > locals.user.authority_level) {
				privilegeErrorId = id;
				throw error(403);
			}
			sendVerificationEmail(user[0].email);
			await client.query('UPDATE users SET validated = false WHERE id = $1', [id]);
		}
		await client.query('COMMIT');
	} catch (err) {
		console.error('Error deleting user:', err);
		client.query('ROLLBACK');
		if (privilegeErrorId)
			return error(
				403,
				'Du har ikke rettigheder til at ændre på brugeren med id: ' + privilegeErrorId + '.'
			);
		else {
			Sentry.captureException(err);
			throw error(500, 'Der skete en fejl under aktivering af din konto.');
		}
	} finally {
		client.release();
	}
	return json({ message: 'Brugeren/e er blevet aktiveret.' });
};
async function sendVerificationEmail(toEmail: string) {
	try {
		const resend = new Resend(RESEND_API_KEY);
		const { error: sendError } = await resend.emails.send({
			from: 'info@kennik.dk',
			to: [toEmail],
			subject: 'Din konto er blevet deaktiveret.',
			html: emailTemplate(toEmail)
		});

		if (sendError) {
			throw new Error('Email sending failed: ' + JSON.stringify(sendError));
		}
	} catch (err) {
		console.error('Error in sendVerificationEmail:' + JSON.stringify(err));
		throw err;
	}
}

function emailTemplate(email: string) {
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
				Vi skriver til for at fortælle dig, at din konto er midlertidigt deaktiveret i vores system. 
				Dette skyldes at en administrator har ændret din status.

				Det vil sigde at du fra nu af ikke kan oprette eller tilmelde dig til projekter. Din konto vil dog stadig være tilgængelig, og du kan stadig logge ind og se dine projekter.

				Hvis du mener at dette er en fejl, kan du kontakte os ved at svare på denne email eller ringe til på [telefonnummer].

				Med venlig hilsen
				[Organisation]
			</span>
		</p>
	</body>
</html>
    `;
}
