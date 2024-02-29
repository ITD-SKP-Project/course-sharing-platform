import type { PageServerLoad } from './$types';
import type { Project, ProjectFile, ProjectFileCreation, UserEssentials, User } from '$lib/types';
// import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { error, redirect } from '@sveltejs/kit';
import pkg from 'pg';
import { POSTGRES_URL } from '$env/static/private';
const { Pool } = pkg;
const pool = new Pool({
	connectionString: POSTGRES_URL,
	ssl: true
});
import { ProjectSchema } from '$lib/zodSchemas';
import { z } from 'zod';
import { postFile } from '$lib/server/files';

//load
export const load = (async ({ locals }) => {
	if (!locals.user) {
		throw redirect(307, '/login?redirect=/projekter/ny');
	}
	const client = await pool.connect();
	try {
		const { rows: users } = await client.query<UserEssentials>(
			'SELECT id, firstname, lastname, email FROM users WHERE validated = true AND id != $1;',
			[locals.user.id]
		);
		return { users: users };
	} catch (err) {
		// Handle or throw the error as per your application's error handling policy
		throw error(
			500,
			'Der skete en uventet felj da vi prøvede at hente brugere fra databasen. ' +
				JSON.stringify(err)
		);
	} finally {
		client.release();
	}
}) as PageServerLoad;

type ProjectSchemaType = z.infer<typeof ProjectSchema>;

import { validateCustomArray } from '$lib/index';

import { validateCustomFileArray } from '$lib/index';
import { validateCustomObject } from '$lib/zodSchemas';
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
		let formData = Object.fromEntries(await request.formData());

		//this is a dynamic list genereted from fields where the key starts with "array-"
		const subjectsArray = Object.entries(formData).filter(([key, value]) =>
			key.startsWith('subjects-')
		);

		const filesArray = Object.entries(formData).filter(([key, value]) => key.startsWith('files-'));

		//filter files from the formData object
		const resourcesArray = Object.entries(formData).filter(([key, value]) =>
			key.startsWith('resources-')
		);
		const usersArray = Object.entries(formData).filter(([key, value]) => key.startsWith('users-'));

		//remove the files from the formData object
		const filteredEntries = Object.entries(formData).filter(
			([key, value]) => !key.startsWith('files-')
		);

		const { ...rest } = Object.fromEntries(filteredEntries);

		const { success: subjectSuccess, errors: subjectErrors } = validateCustomArray(subjectsArray); //separate validation of the subjects
		const { success: resourcesSuccess, errors: resourcesErrors } =
			validateCustomArray(resourcesArray); //separate validation of the resources
		const { success: fileSuccess, errors: fileErrors } = validateCustomFileArray(filesArray); //separate validation of the files
		const { success: userSuccess, errors: userErrors } = validateCustomArray(usersArray); //separate validation of the users

		const userId = locals.user.id;
		if (!userId) {
			return {
				formData: rest,
				serverError: 'Du skal være logget ind for at oprette et projekt'
			};
		}

		//start validation and upload
		let result: ProjectSchemaType;
		try {
			//generate results
			result = ProjectSchema.parse({ ...formData });

			const { success: objSuccess, errors: objErrors } = validateCustomObject(result); //further validation of the zod result
			if (
				(!objSuccess && objErrors) ||
				(!subjectSuccess && subjectErrors) ||
				(!resourcesSuccess && resourcesErrors) ||
				(!fileSuccess && fileErrors) ||
				(!userSuccess && userErrors)
			) {
				return {
					formData: rest,
					validationErrors: {
						...objErrors,
						...subjectErrors,
						...resourcesErrors,
						...fileErrors,
						...userErrors
					}
				};
			}

			// convert the file array to a File array

			//Everything is working and the project was created
			//convert to lists
			const userIds = usersArray.map(([key, value]) => parseInt(value.toString()));
			const files = filesArray.map(([key, value]) => value);
			const subjects = subjectsArray.map(([key, value]) => value.toString());
			const resources = resourcesArray.map(([key, value]) => value.toString());

			const project: Project = await createProject(
				result,
				pool,
				locals.user,
				filesArray,
				userIds,
				subjects,
				resources
			);
			let num = 2;
			Math.abs(num);

			return {
				formData: rest,
				projectId: project.id
			};
		} catch (err: any) {
			if (err instanceof z.ZodError) {
				const { fieldErrors: errors } = err.flatten(); //errors from the failed zod validation will be returned to the user
				//but we still have to also validate to see if out custom validation fail too, so we can provide all error messages at once
				return {
					formData: rest,
					validationErrors: {
						...errors,
						...subjectErrors,
						...resourcesErrors,
						...fileErrors,
						...userErrors
					}
				};
			} else {
				throw error(500, 'Internal server error: ' + JSON.stringify(err));
			}
		}
	}
};

async function createProject(
	Project: ProjectSchemaType,
	pool: pkg.Pool,
	user: User,
	files: any,
	authors: number[],
	subjects: string[],
	resources: string[]
): Promise<Project> {
	const client = await pool.connect();
	try {
		await client.query('BEGIN'); // Start transaction

		const projectQueryText =
			'INSERT INTO projects (title, description, resources, subjects, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *';
		const projectValues = [
			Project.title,
			Project.description,
			resources.join('[ENTER]'),
			subjects.join('[ENTER]'),
			Project.notes
		];
		const { rows: projects } = await client.query<Project>(projectQueryText, projectValues);

		if (projects.length === 0) {
			throw new Error('Project creation failed');
		}

		const projectAuthorQueryText =
			'INSERT INTO project_authors (project_id, user_id, authority_level) VALUES ($1, $2, $3)';
		const projectAuthorValues = [projects[0].id, user.id, 3]; // Assuming authority_level is the correct column name
		await client.query(projectAuthorQueryText, projectAuthorValues);
		authors.forEach(async (author) => {
			const projectAuthorValues = [projects[0].id, author, 1]; // Assuming authority_level is the correct column name
			await client.query(projectAuthorQueryText, projectAuthorValues);
		});

		if (Project.it_supporter) {
			const itSupporterQueryText =
				'INSERT INTO project_professions (project_id, skill_level, profession_id) VALUES ($1, $2, 4)';
			const itSupporterValues = [projects[0].id, Project.it_supporter_skill_level];
			await client.query(itSupporterQueryText, itSupporterValues);
		}

		if (Project.programmering) {
			const programmeringQueryText =
				'INSERT INTO project_professions (project_id, skill_level, profession_id) VALUES ($1, $2, 5)';
			const programmeringValues = [projects[0].id, Project.programmering_skill_level];
			await client.query(programmeringQueryText, programmeringValues);
		}

		if (Project.infrastruktur) {
			const infrastrukturQueryText =
				'INSERT INTO project_professions (project_id, skill_level, profession_id) VALUES ($1, $2, 6)';
			const infrastrukturValues = [projects[0].id, Project.infrastruktur_skill_level];
			await client.query(infrastrukturQueryText, infrastrukturValues);
		}

		files.forEach(async ([key, value]) => {
			const file = value as unknown as File;

			const fileQueryText =
				'INSERT INTO project_files (name, project_id, file_type, pathname, size) VALUES ($1, $2, $3, $4, $5)';
			const fileValues = [
				file.name,
				projects[0].id,
				file.type,
				`${projects[0].id}/${file.name}`,
				file.size
			];
			await client.query(fileQueryText, fileValues);

			await postFile(file, projects[0].id.toString());
		});

		await client.query('COMMIT'); // Commit the transaction

		// Return success or the created project details
		return projects[0];
	} catch (err) {
		await client.query('ROLLBACK'); // Rollback the transaction on error
		throw error(500, 'Internal server error: ' + JSON.stringify(err));
	} finally {
		client.release(); // Release the client back to the pool
	}
}
