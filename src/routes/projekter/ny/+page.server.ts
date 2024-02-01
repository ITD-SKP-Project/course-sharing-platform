import type { PageServerLoad } from './$types';
import type { Project } from '$lib/types';
import { error, fail, redirect } from '@sveltejs/kit';
import pkg from 'pg';
import { POSTGRES_URL } from '$env/static/private';
const { Pool } = pkg;
const pool = new Pool({
	connectionString: POSTGRES_URL,
	ssl: true
});
import { ProjectSchema } from '$lib/zodSchemas';
import { z } from 'zod';
import type { User } from 'lucide-svelte';

//load
export const load = (async ({ locals }) => {
	if (!locals.user) {
		throw redirect(307, '/login?redirect=/projekter/ny');
	}
	// const client = await pool.connect();
	// try {
	// 	const { rows: users } = await client.query<User>('SELECT * FROM users');
	// 	return { users: users };
	// } catch (err) {
	// 	// Handle or throw the error as per your application's error handling policy
	// 	throw error(
	// 		500,
	// 		'Der skete en uventet felj da vi prøvede at hente brugere fra databasen. ' +
	// 			JSON.stringify(err)
	// 	);
	// }
}) as PageServerLoad;

type ProjectSchemaType = z.infer<typeof ProjectSchema>;

function validate(project: any): { success: boolean; errors?: any } {
	let errors: any = {};
	console.log(project);

	const { it_supporter, it_supporter_skill_level } = project;
	if (it_supporter && it_supporter_skill_level == '') {
		errors.it_supporter_skill_level = 'Du skal vælge et niveau for it-supporter';
		console.log('Errors' + errors);
	}

	const { programmering, programmering_skill_level } = project;
	if (programmering && programmering_skill_level == '') {
		errors.programmering_skill_level = 'Du skal vælge et niveau for programmering';
		console.log('Errors' + errors);
	}

	const { infrastruktur, infrastruktur_skill_level } = project;
	if (infrastruktur && infrastruktur_skill_level == '') {
		errors.infrastruktur_skill_level = 'Du skal vælge et niveau for infrastruktur';
		console.log('Errors' + errors);
	}

	if (!infrastruktur && !programmering && !it_supporter) {
		errors.it_supporter = 'Du skal vælge mindst en færdighed.';
		errors.programmering = 'Du skal vælge mindst en færdighed.';
		errors.infrastruktur = 'Du skal vælge mindst en færdighed.';
	}

	if (Object.keys(errors).length > 0) return { errors: errors, success: false };
	return { success: true };
}
//action
export const actions = {
	default: async ({
		request,
		locals
	}): Promise<{
		formData: any;
		validationErrors?: any;
		projectId?: any;
		serverError?: string;
	} | void> => {
		const formData = Object.fromEntries(await request.formData());

		//validate form
		let result: ProjectSchemaType;

		try {
			result = ProjectSchema.parse(formData);
			const { success, errors } = validate(result);
			if (!success && errors) {
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

			const project = await createProject(result, pool, locals.user);
			return {
				formData: formData,
				projectId: project.id
			};
		} catch (err: any) {
			if (err instanceof z.ZodError) {
				const { fieldErrors: errors } = err.flatten();

				const customErrors = validate(formData);

				return {
					formData: formData,
					validationErrors: { ...errors, ...customErrors }
				};
			}
		}
	}
};

async function createProject(
	Project: ProjectSchemaType,
	pool: pkg.Pool,
	user: User
): Promise<Project> {
	const client = await pool.connect();
	try {
		await client.query('BEGIN'); // Start transaction

		const projectQueryText =
			'INSERT INTO projects (title, description, resources, subjects) VALUES ($1, $2, $3, $4) RETURNING *';
		const projectValues = [Project.title, Project.description, Project.resources, Project.subjects];
		const { rows: projects } = await client.query<Project>(projectQueryText, projectValues);

		if (projects.length === 0) {
			throw new Error('Project creation failed');
		}

		const projectAuthorQueryText =
			'INSERT INTO project_authors (project_id, user_id, authority_level) VALUES ($1, $2, $3)';
		const projectAuthorValues = [projects[0].id, user.id, 3]; // Assuming authority_level is the correct column name
		await client.query(projectAuthorQueryText, projectAuthorValues);

		await client.query('COMMIT'); // Commit the transaction

		// Return success or the created project details
		console.log('Project created successfully:', projects[0]);
		return projects[0];
	} catch (err) {
		await client.query('ROLLBACK'); // Rollback the transaction on error
		console.error('Transaction error:', err);
		// Return or throw the error
		throw error(500, 'Internal server error: ' + JSON.stringify(err));
	} finally {
		client.release(); // Release the client back to the pool
	}
}
