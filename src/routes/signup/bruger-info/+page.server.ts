import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';
import * as Sentry from '@sentry/sveltekit';
import { pool } from '$lib/server/database';

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
		.max(64, { message: 'Fornavn må ikke være længere end 63 tegn.' }),
	lastname: z
		.string({ required_error: 'Adgangskode mangler at blive udfyldt.' })
		.min(2, { message: 'Efternavn skal være på mindst 2 tegn.' })
		.max(64, { message: 'Efternavn må ikke være længere end 63 tegn.' }),
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
			await client.query(insertPendingUserQuery, [locals.user.id, result.context]);

			// Commit transaction
			await client.query('COMMIT');
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
