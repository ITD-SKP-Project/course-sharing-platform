import type { PageServerLoad } from './$types';
import { redirect, error } from '@sveltejs/kit';
import * as Sentry from '@sentry/sveltekit';
import bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '$env/static/private';
import { z } from 'zod';
import type { User, VerificationToken } from '$lib/types';
import { pool } from '$lib/server/database';

export const load = (async ({ url }) => {
	const token = url.searchParams.get('token');
	if (!token) {
		throw redirect(301, '/login');
	}

	const client = await pool.connect();
	try {
		const getTokenQuery = 'SELECT * FROM verification_tokens WHERE token = $1';
		const tokens = await client.query<VerificationToken>(getTokenQuery, [token]);
		if (!tokens.rows || tokens.rows.length === 0) {
			throw error(404, 'Token not found');
		}
	} catch (error) {
		// Handle or throw the error as per your application's error handling policy
		console.error('Authentication error:', JSON.stringify(error));
		Sentry.captureException(error);
		throw redirect(303, '/login');
	} finally {
		client.release();
	}

	return { token };
}) satisfies PageServerLoad;

const registerSchema = z
	.object({
		token: z.string({ required_error: 'Token mangler.' }),
		password: z
			.string({ required_error: 'Adgangskode mangler.' })
			.min(8, { message: 'Adgangskode skal være mindst 8 tegn.' })
			.max(64, { message: 'Adgangskode må ikke være mere end 64 tegn.' })
			.trim(),
		passwordConfirm: z
			.string({ required_error: 'Password is required' })
			.min(8, { message: 'Adgangskode skal være mindst 8 tegn.' })
			.max(64, { message: 'Adgangskode må ikke være mere end 64 tegn.' })
			.trim()
	})
	.superRefine(({ passwordConfirm, password }, ctx) => {
		if (passwordConfirm !== password) {
			ctx.addIssue({
				code: 'custom',
				message: 'Adgangskoderne skal være ens.',
				path: ['password']
			});
			ctx.addIssue({
				code: 'custom',
				message: 'Adgangskoderne skal være ens.',
				path: ['passwordConfirm']
			});
		}
	});

export const actions = {
	default: async ({
		request
	}): Promise<{
		formData?: any;
		validationErrors?: any;
		serverError?: string;
	}> => {
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
			const tokenQueryText = 'SELECT * FROM verification_tokens WHERE token = $1';
			const { rows: tokens } = await client.query<VerificationToken>(tokenQueryText, [
				result.token
			]);

			if (!tokens || tokens[0].type !== 'reset_password') {
				return {
					serverError: 'Token does not exist',
					formData: rest
				};
			}

			const salt = bcrypt.genSaltSync(+BCRYPT_SALT_ROUNDS);
			const hash = bcrypt.hashSync(result.password, salt);

			//update password
			const userQueryText = 'UPDATE users SET password = $1 WHERE id = $2 RETURNING *';
			const { rows: users } = await client.query<User[]>(userQueryText, [hash, tokens[0].user_id]);

			if (!users.length || users.length === 0) {
				return {
					serverError: 'User does not exist',
					formData: rest
				};
			}
		} catch (err) {
			console.error(err);
			Sentry.captureException(err);
			return {
				serverError: 'Der skete en fejl.',
				formData: rest
			};
		} finally {
			client.release();
		}
		throw redirect(303, '/skift-adgangskode-via-link/succes?token=' + result.token);
	}
};
