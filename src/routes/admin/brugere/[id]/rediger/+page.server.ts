import type { PageServerLoad } from '../$types';
import { error, redirect } from '@sveltejs/kit';

import type { User, UserExludingPassword } from '$lib/types';
import { pool } from '$lib/server/database';
import { z } from 'zod';
export const load = (async ({ params, locals }) => {
	if (!locals.user || locals.user.authority_level < 3) {
		throw error(401, 'Du har ikke adgang til denne side');
	}

	let user: UserExludingPassword | null;
	const client = await pool.connect();
	try {
		const { rows: users } = await client.query<UserExludingPassword>(
			`SELECT id, firstname, lastname, email, authority_level, created_at, 
			updated_at, email_verified, validated, last_send_email FROM users WHERE id = $1 LIMIT 1;`,
			[params.id]
		);

		user = users[0];
	} catch (err) {
		console.error('Error fetching users:', err);
		// Handle or throw the error as per your application's error handling policy
		throw error(
			500,
			'Der skete en uventet felj da vi prøvede at hente brugere fra databasen. ' +
				JSON.stringify(err)
		);
	} finally {
		client.release();
	}
	if (!user) {
		throw error(404, 'Brugeren blev ikke fundet');
	}
	if (user.id === locals.user.id) {
		throw error(
			403,
			'Du kan ikke redigere din egen bruger her. Gå til din konto for at redigere din egen bruger'
		);
	}
	if (user.authority_level && user.authority_level >= locals.user.authority_level) {
		throw error(403, 'Du har ikke adgang til at redigere denne bruger');
	}
	return { userToEdit: user };
}) satisfies PageServerLoad;

const updateUserSchema = z.object({
	firstname: z.string().min(1, { message: 'Fornavn skal udfyldes' }),
	lastname: z.string().min(1, { message: 'Efternavn skal udfyldes' }),
	authority_level: z.enum(['1', '2', '3', '4'])
});

export const actions = {
	default: async ({
		request,
		locals
	}): Promise<{
		formData: any;
		validationErrors?: any;
		serverError?: string;
		successMessage?: string;
	} | void> => {
		const formData = Object.fromEntries(await request.formData());

		//validate form
		let user: User | null = locals.user;
		if (!user) {
			throw redirect(307, '/login?redirect=/konto');
		}

		let result: any;
		try {
			result = updateUserSchema.parse(formData);
		} catch (err: any) {
			const { fieldErrors: errors } = err.flatten();
			return {
				formData: formData,
				validationErrors: errors
			};
		}

		if (user.authority_level && result.authority_level > user.authority_level) {
			return {
				formData: formData,
				serverError: 'Du kan ikke opgradere en bruger til en højere rolle end dig selv.'
			};
		}

		const client = await pool.connect();
		try {
			const queryText =
				'UPDATE users SET firstname = $1, lastnasme = $2, authority_level = $3 auth WHERE id = $4';
			const values = [result.firstname, result.lastname, result.authority_level, user.id];
			await client.query<User>(queryText, values);

			return {
				formData: result,
				successMessage: 'Navn er blevet opdateret'
			};
		} catch (err: any) {
			console.error(err);
			return {
				formData: formData,
				serverError: JSON.stringify(err)
			};
		} finally {
			client.release();
		}
	}
};
