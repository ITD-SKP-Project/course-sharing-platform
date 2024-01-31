import type { PageServerLoad } from './$types';
import type { Project } from '$lib/types';
import { error, fail } from '@sveltejs/kit';
import pkg, { Pool } from 'pg';
import { POSTGRES_URL } from '$env/dynamic/private';
const { Pool } = pkg;
const pool = new Pool({
	connectionString: POSTGRES_URL,
	ssl: true
});
import { ProjectSchema } from '$lib/zodSchemas';
import { z } from 'zod';
import { it } from 'node:test';
import type { User } from 'lucide-svelte';

//load
// export const load = (async () => {
// 	const client = await pool.connect();
// 	try {
// 		const { rows: users } = await client.query<User>('SELECT * FROM users');
// 		return { users: users };
// 	} catch (err) {
// 		// Handle or throw the error as per your application's error handling policy
// 		throw error(
// 			500,
// 			'Der skete en uventet felj da vi prøvede at hente brugere fra databasen. ' +
// 				JSON.stringify(err)
// 		);
// 	}
// }) as PageServerLoad;

type ProjectSchemaType = z.infer<typeof ProjectSchema>;

function validate(project: any): any | void {
	let errors: any = {};
	console.log(project);

	const { it_supporter, it_supporter_skill_level } = project;
	if (it_supporter && it_supporter_skill_level) {
		errors.it_supporter_skill_level = 'Du skal vælge et niveau for it-supporter';
		console.log('Errors' + errors);
	}

	const { programmering, programmering_skill_level } = project;
	if (programmering && programmering_skill_level) {
		errors.programmering_skill_level = 'Du skal vælge et niveau for programmering';
		console.log('Errors' + errors);
	}

	const { infrastruktur, infrastruktur_skill_level } = project;
	if (infrastruktur && infrastruktur_skill_level) {
		errors.infrastruktur_skill_level = 'Du skal vælge et niveau for infrastruktur';
		console.log('Errors' + errors);
	}
	if (Object.keys(errors).length > 0) return errors;
	return true;
}
//action
export const actions = {
	default: async ({
		request,
		locals
	}): Promise<{
		formData: any;
		validationErrors?: any;
		unTouchedData?: any;
		serverError?: string;
	} | void> => {
		const formData = Object.fromEntries(await request.formData());

		//validate form
		let result: ProjectSchemaType;

		try {
			result = ProjectSchema.parse(formData);
			const errors = validate(result);
			if (errors) {
				return {
					formData: formData,
					validationErrors: errors
				};
			}

			const userId = locals.user.id;
			if (!userId) {
				return {
					formData: formData,
					serverError: 'Du skal være logget ind for at oprette et projekt'
				};
			}

			const client = await pool.connect();
			const projectQueryText =
				'INSERT INTO projects (title, description, resources, subjects) VALUES ($1, $2, $3, $4) RETURNING *';
			const projectValues = [result.title, result.description, result.resources, result.subjects];
			const { rows: projects } = await client.query<Project>(projectQueryText, projectValues);

			const projectAuthorQueryText =
				'INSERT INTO project_authors (project_id, user_id, Authority_level) VALUES ($1, $2, $3) RETURNING *';
			const projectAuthorValues = [projects[0].id, userId, 3];
			const { rows: projectAuthors } = await client.query<Project>(
				projectAuthorQueryText,
				projectAuthorValues
			);
		} catch (err: any) {
			if (err instanceof z.ZodError) {
				const { fieldErrors: errors } = err.flatten();

				const customErrors = validate(formData);

				return {
					formData: formData,
					validationErrors: { ...errors, ...customErrors },
					unTouchedData: formData
				};
			}
		}
	}
};

async function createProject(Project: ProjectSchemaType, pool: pkg.Pool, user: User) {
	const client = await pool.connect();
	try {
		const client = await pool.connect();
		const projectQueryText =
			'INSERT INTO projects (title, description, resources, subjects) VALUES ($1, $2, $3, $4) RETURNING *';
		const projectValues = [Project.title, Project.description, Project.resources, Project.subjects];
		const { rows: projects } = await client.query<Project>(projectQueryText, projectValues);

		const projectAuthorQueryText =
			'INSERT INTO project_authors (project_id, user_id, Authority_level) VALUES ($1, $2, $3) RETURNING *';
		const projectAuthorValues = [projects[0].id, user.id, 3];
		const { rows: projectAuthors } = await client.query<Project>(
			projectAuthorQueryText,
			projectAuthorValues
		);
	} catch (error) {}
}
