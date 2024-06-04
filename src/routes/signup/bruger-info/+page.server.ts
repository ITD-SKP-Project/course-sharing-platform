import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';
import * as Sentry from '@sentry/sveltekit';
import { pool } from '$lib/server/database';
import { Resend } from 'resend';
import { RESEND_API_KEY } from '$env/static/private';

export const load = (async ({ locals, url }) => {
	if (locals.onboardingStatus !== 'needs-account-info') {
		throw redirect(301, locals.onboardingRedirectLocation);
	}

	return { missingInfo: locals.userMissingInfo };
}) satisfies PageServerLoad;

const userInfoSchema = z.object({
	firstname: z
		.string({ required_error: 'Email mangler at blive udfyldt.' })
		.min(2, { message: 'Fornavn skal være på mindst 2 tegn.' })
		.max(250, { message: 'Fornavn må ikke være længere end 250 tegn.' }),
	lastname: z
		.string({ required_error: 'Adgangskode mangler at blive udfyldt.' })
		.min(2, { message: 'Efternavn skal være på mindst 2 tegn.' })
		.max(250, { message: 'Efternavn må ikke være længere end 250 tegn.' }),
	context: z
		.string({ required_error: 'Du mangler at udfylde beskrivelsen.' })
		.min(50, { message: 'Beskrivelsen skal være på mindst 50 tegn.' })
		.max(250, { message: 'Beskrivelsen må ikke være længere end 250 tegn.' })
});

export const actions = {
	default: async ({
		request,
		locals
	}): Promise<{ formData: any; validationErrors?: any; serverError?: string }> => {
		const formData = Object.fromEntries(await request.formData());
		const userId = locals.user.id;

		let result: any;
		try {
			//validate form
			result = userInfoSchema.parse(formData);
		} catch (err: any) {
			const { fieldErrors: errors } = err.flatten();
			return {
				formData: { ...formData },
				validationErrors: errors
			};
		}

		const client = await pool.connect();
		try {
			// Begin transaction
			await client.query('BEGIN');

			// Update user
			const updateUserQuery = 'UPDATE users SET firstname = $1, lastname = $2 WHERE id = $3';
			await client.query(updateUserQuery, [result.firstname, result.lastname, userId]);

			// Insert into pending_users
			const insertPendingUserQuery = 'INSERT INTO pending_users (user_id, context) VALUES ($1, $2)';
			await client.query(insertPendingUserQuery, [userId, result.context]);

			// Commit transaction
			await client.query('COMMIT');

			//get users with authority level >= 3
			const queryText = 'SELECT email FROM users WHERE authority_level >= 3';
			const { rows: users } = await client.query(queryText);

			//map list of emails
			const emails = users.map((user) => user.email);

			//send email to admins
			const domain =
				process.env.NODE_ENV === 'development'
					? 'http://localhost:5173'
					: 'https://opgavebank.webhotel-itskp.dk';
			emails.forEach((email) => {
				sendEmailToAdmins(email, userId, domain);
			});
		} catch (error) {
			await client.query('ROLLBACK');
			Sentry.captureException(error);
			console.error('Database transaction error:', error);
			return {
				formData: { ...formData },
				serverError: 'Der skete en uvented fejl. Prøv igen senere.'
			};
		} finally {
			// Release the client back to the pool
			client.release();
		}

		throw redirect(303, '/signup/afventer-godkendelse');
	}
};
async function sendEmailToAdmins(toEmail: string, userId: string, domain: string) {
	try {
		const resend = new Resend(RESEND_API_KEY);
		const { error: sendError } = await resend.emails.send({
			from: 'info@kennik.dk',
			to: [toEmail],
			subject: 'En ny bruger afventer godkendelse.',
			html: emailTemplate(toEmail, domain, userId)
		});

		if (sendError) {
			throw new Error('Email sending failed: ' + JSON.stringify(sendError));
		}
	} catch (err) {
		Sentry.captureException(err);
		console.error('Error in sendVerificationEmail:' + JSON.stringify(err));
		throw err;
	}
}

function emailTemplate(email: string, domain: string, userId: string) {
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
				Der er en ny bruger, der venter på godkendelse. Klik på knappen nedenfor for at godkende brugeren.
			</span>
		</p>
		<a
			href=${domain}/admin/brugere/${userId}/activate
			target="_blank"
			
		>
			<span>
				<strong>
					<span style="line-height: 16.8px">
						Godkend bruger
					</span>
				</strong>
			</span>
		</a>
	</body>
</html>
    `;
}
