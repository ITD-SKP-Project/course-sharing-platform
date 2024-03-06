import type { PageServerLoad } from './$types';
import jwt from 'jsonwebtoken';
import { error, json, redirect } from '@sveltejs/kit';
import { JWT_SECRET } from '$env/static/private';
import type { User } from '$lib/types';
import bcrypt from 'bcrypt';
import { z } from 'zod';

import { pool } from '$lib/server/database';

export const load = (async ({ locals, url }) => {
	if (locals.onboardingStatus !== 'none') {
		throw redirect(301, locals.onboardingRedirectLocation);
	}
}) satisfies PageServerLoad;

const registerSchema = z.object({
	email: z
		.string({ required_error: 'Email mangler at blive udfyldt.' })
		.email({ message: 'Indtast venligst en rigtig email adresse.' }),
	password: z
		.string({ required_error: 'Adgangskode mangler at blive udfyldt.' })
		.min(8, { message: 'Adgangskode skal være på mindst 8 etgn.' })
		.max(64, { message: 'Adgangskode skal være længere end 64 tegn.' })
		.trim()
});

export const actions = {
	default: async ({
		request,
		cookies,
		url
	}): Promise<{ formData: any; validationErrors?: any; serverError?: string } | void> => {
		const formData = Object.fromEntries(await request.formData());

		//validate form
		let user: User | null = null;
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
			// Use parameterized query for security
			const queryText = 'SELECT * FROM users WHERE email = $1 LIMIT 1';
			const data = await client.query<User>(queryText, [result.email]);

			// Check if user exists
			user = data.rows[0] ?? null;
			if (!user)
				return {
					formData: rest,
					serverError: 'Ugyldig email eller passord'
				};

			// Compare password
			const valid = await bcrypt.compare(result.password, user.password);
			if (!valid)
				return {
					formData: rest,
					serverError: 'Ugyldig email eller passord'
				};

			// Make token
			const token = jwt.sign(user, JWT_SECRET, { expiresIn: '10h' });

			// Set cookie
			cookies.set('token', token, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'strict'
			});

			// Determine redirect logic
		} catch (err: any) {
			console.error(err);
			return {
				formData: rest,
				serverError: JSON.stringify(error)
			};
		} finally {
			client.release();
		}
		onboardingRedirect(user, url);
	}
};
function onboardingRedirect(user: User, url: URL): void {
	if (!user.email_verified) {
		throw redirect(303, '/signup/bekraeft-email');
	}
	if (!user.firstname || !user.lastname) {
		throw redirect(303, '/signup/bruger-info');
	}
	if (!user.validated) {
		throw redirect(303, '/signup/afventer-godkendelse');
	}

	const redirectUrl = url.searchParams.get('redirect');
	if (redirectUrl) {
		throw redirect(301, '/' + redirectUrl.slice(1));
	}
	throw redirect(301, '/konto');
}
