import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { User } from '$lib/types';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import * as Sentry from '@sentry/sveltekit';
import { error, json } from '@sveltejs/kit';
import type {
	Profession,
	Project,
	ProjectAuthor,
	ProjectProfession,
	UserEssentials
} from '$lib/types';

import { BCRYPT_SALT_ROUNDS } from '$env/static/private';
import { pool } from '$lib/server/database';

export const load = (async ({ locals }) => {
	if (
		locals.onboardingStatus !== 'needs-admin-validation' &&
		locals.onboardingStatus !== 'validated'
	) {
		throw redirect(301, locals.onboardingRedirectLocation);
	}

	const client = await pool.connect();
	try {
		// Fetch projects where the user is an author, including likes count
		const { rows: projects } = await client.query<Project>(
			`SELECT 
            projects.*,
            CAST(COUNT(project_likes.id) AS INTEGER) AS likes,
            BOOL_OR(project_likes.user_id = $1) AS likedByUser
        FROM 
            projects
        JOIN 
            project_authors ON project_authors.project_id = projects.id
        LEFT JOIN 
            project_likes ON projects.id = project_likes.project_id
        WHERE 
            projects.live = true
            AND project_authors.user_id = $1
        GROUP BY 
            projects.id;`,
			[locals.user.id]
		);

		if (!projects || projects.length === 0) return { userProjects: [] as Project[] };

		// Fetch authors and professions for the retrieved projects
		const projectsIds = projects.map((p) => p.id);
		const { rows: authors } = await client.query<ProjectAuthor>(
			'SELECT * FROM project_authors WHERE project_id = ANY($1)',
			[projectsIds]
		);

		// Fetch users for the authors
		const userIds = authors.map((a) => a.user_id);
		const { rows: users } = await client.query<UserEssentials>(
			'SELECT id, firstname, lastname, email, validated FROM users WHERE id = ANY($1)',
			[userIds]
		);

		// Fetch professions associated with the projects
		const { rows: projectProfessions } = await client.query<ProjectProfession>(
			`SELECT pp.*, p.name as profession_name
        FROM project_professions pp
        JOIN professions p ON pp.profession_id = p.id
        WHERE pp.project_id = ANY($1);`,
			[projectsIds]
		);

		// Associate authors and professions with their respective projects
		projects.forEach((project) => {
			project.authors = authors
				.filter((author) => author.project_id === project.id)
				.map((author) => ({
					...author,
					user: users.find((user) => user.id === author.user_id)
				}));
			project.professions = projectProfessions.filter((pp) => pp.project_id === project.id);
		});

		return { userProjects: projects };
	} catch (err) {
		console.error('Error fetching projects:', JSON.stringify(err));
		Sentry.captureException(err);
		throw error(
			500,
			'Error processing your request. Please try again later. ' + JSON.stringify(err)
		);
	} finally {
		client.release();
	}
}) satisfies PageServerLoad;

const updateNameSchema = z.object({
	firstname: z
		.string({ required_error: 'Fornavn mangler at blive udfyldt.' })
		.min(2, {
			message: 'Fornavn skal være på mindst 2 tegn.'
		})
		.max(250, { message: 'Fornavn skal være længere end 250 tegn.' }),
	lastname: z
		.string({ required_error: 'Efternavn mangler at blive udfyldt.' })
		.min(2, {
			message: 'Efternavn skal være på mindst 2 tegn.'
		})
		.max(250, { message: 'Efternavn skal være længere end 250 tegn.' })
});
const updatePasswordSchema = z
	.object({
		password: z
			.string({ required_error: 'Adgangskode mangler at blive udfyldt.' })
			.min(8, { message: 'Adgangskode skal være på mindst 8 etgn.' })
			.max(64, { message: 'Adgangskode skal være længere end 64 tegn.' })
			.trim(),
		confirmPassword: z
			.string({ required_error: 'Bekræft adgangskode mangler at blive udfyldt.' })
			.min(8, { message: 'Adgangskode skal være på mindst 8 etgn.' })
			.max(64, { message: 'Adgangskode skal være længere end 64 tegn.' })
			.trim(),
		previousPassword: z
			.string({ required_error: 'Nuværende adgangskode mangler at blive udfyldt.' })
			.min(8, { message: 'Adgangskode skal være mindst 8 tegn.' })
			.max(64, { message: 'Adgangskode må ikke være mere end 64 tegn.' })
			.trim()
	})
	.superRefine(({ password, confirmPassword }, ctx) => {
		if (password !== confirmPassword) {
			ctx.addIssue({
				code: 'custom',
				message: 'Adgangskoderne skal være ens.',
				path: ['confirmPassword']
			});
			ctx.addIssue({
				code: 'custom',
				message: 'Adgangskoderne skal være ens.',
				path: ['password']
			});
		}
	});
const updateEmailSchema = z.object({
	email: z
		.string({ required_error: 'Email mangler at blive udfyldt.' })
		.email({ message: 'Indtast venligst en rigtig email adresse.' })
});

export const actions = {
	updateName: async ({
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
			result = updateNameSchema.parse(formData);
		} catch (err: any) {
			const { fieldErrors: errors } = err.flatten();
			return {
				formData: formData,
				validationErrors: errors
			};
		}

		const client = await pool.connect();
		try {
			const queryText = 'UPDATE users SET firstname = $1, lastname = $2 WHERE id = $3';
			const values = [result.firstname, result.lastname, user.id];
			await client.query<User>(queryText, values);

			return {
				formData: result,
				successMessage: 'Navn er blevet opdateret'
			};
		} catch (err: any) {
			console.error(err);
			Sentry.captureException(err);
			return {
				formData: formData,
				serverError: JSON.stringify(err)
			};
		} finally {
			client.release();
		}
	},
	updatePassword: async ({
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
			result = updatePasswordSchema.parse(formData);
		} catch (err: any) {
			const { fieldErrors: errors } = err.flatten();
			return {
				formData: {},
				validationErrors: errors
			};
		}

		const client = await pool.connect();
		try {
			//check if user old password is correct
			const valid = await bcrypt.compare(result.previousPassword, user.password);
			if (!valid) {
				return {
					formData: {},
					validationErrors: {
						previousPassword: ['Nuværende adgangskode er forkert']
					}
				};
			}

			const salt = bcrypt.genSaltSync(+BCRYPT_SALT_ROUNDS);
			const hash = bcrypt.hashSync(result.password, salt);

			const queryText = 'UPDATE users SET password = $1 WHERE id = $2';
			const values = [hash, user.id];
			await client.query<User>(queryText, values);

			return {
				formData: result,
				successMessage: 'Adgangskode er blevet opdateret'
			};
		} catch (err: any) {
			console.error(err);
			Sentry.captureException(err);
			return {
				formData: formData,
				serverError: JSON.stringify(err)
			};
		} finally {
			client.release();
		}
	},
	updateEmail: async ({
		request,
		locals
	}): Promise<{
		formData: any;
		validationErrors?: any;
		serverError?: string;
		successMessage?: string;
		field?: string;
	} | void> => {
		const formData = Object.fromEntries(await request.formData());

		//validate form
		let user: User | null = locals.user;
		if (!user) {
			throw redirect(307, '/login?redirect=/konto');
		}

		let result: any;
		try {
			result = updateEmailSchema.parse(formData);
		} catch (err: any) {
			const { fieldErrors: errors } = err.flatten();
			return {
				formData: {},
				validationErrors: errors
			};
		}

		const client = await pool.connect();
		try {
			//check if user old password is correct

			// const queryText = 'UPDATE users SET password = $1 WHERE id = $2';
			// const values = [hash, user.id];
			// await client.query<User>(queryText, values);

			return {
				formData: result,
				successMessage: 'Email er blevet opdateret'
			};
		} catch (err: any) {
			console.error(err);
			Sentry.captureException(err);
			return {
				formData: formData,
				serverError: JSON.stringify(err)
			};
		} finally {
			client.release();
		}
	}
};
