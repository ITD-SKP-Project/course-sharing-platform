import type { PageServerLoad } from './$types';
import type { Project, ProjectFile, ProjectFileCreation, UserEssentials, User } from '$lib/types';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
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
import type { File } from 'buffer';

//load
export const load = (async ({ locals }) => {
	if (!locals.user) {
		throw redirect(307, '/login?redirect=/projekter/ny');
	}
	const client = await pool.connect();
	try {
		const { rows: users } = await client.query<UserEssentials>(
			'SELECT id, firstname, lastname, email FROM users WHERE validated = true'
		);
		return { users: users };
	} catch (err) {
		// Handle or throw the error as per your application's error handling policy
		throw error(
			500,
			'Der skete en uventet felj da vi prøvede at hente brugere fra databasen. ' +
				JSON.stringify(err)
		);
	}
}) as PageServerLoad;

type ProjectSchemaType = z.infer<typeof ProjectSchema>;

function validateCustomArray(array: any): { success: boolean; errors?: any } {
	let errors: any = {};
	for (let [key, value] of array) {
		if (value == '') {
			errors[key] = 'Dette felt skal udfyldes';
		}
	}
	if (Object.keys(errors).length > 0) return { errors: errors, success: false };
	return { success: true };
}

function validateCustomFileArray(files: any): { success: boolean; errors?: any } {
	let errors: any = {};
	//validate each file and pust the error to the errors object
	files.forEach(([key, value]) => {
		if (value.size == 0) {
			errors[key] = 'Filen må ikke være tom';
		}
		if (value.size > 1_000_000_000) {
			errors[key] = 'Filen er for stor. Max 1gb tilladt.';
		}
	});
	if (Object.keys(errors).length > 0) return { errors: errors, success: false };
	return { success: true };
}
function validateCustomObject(project: any): { success: boolean; errors?: any } {
	let errors: any = {};

	const { it_supporter, it_supporter_skill_level } = project;
	if (it_supporter && it_supporter_skill_level == '') {
		errors.it_supporter_skill_level = 'Du skal vælge et niveau for it-supporter';
	}

	const { programmering, programmering_skill_level } = project;
	if (programmering && programmering_skill_level == '') {
		errors.programmering_skill_level = 'Du skal vælge et niveau for programmering';
	}

	const { infrastruktur, infrastruktur_skill_level } = project;
	if (infrastruktur && infrastruktur_skill_level == '') {
		errors.infrastruktur_skill_level = 'Du skal vælge et niveau for infrastruktur';
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
			}
		}
	}
};

const uploadFile = async (file: File, projectId: number): Promise<ProjectFileCreation | void> => {
	// Make sure the file is not empty
	if (!file || file.size == 0) return;

	let pathName = file.name;
	// Make sure the file doesn't already exist
	// Make a loop that adds a number to the end of the file name until it doesn't exist

	const folderLocation = process.env.NODE_ENV === 'development' ? 'static/files' : 'client/files';
	console.log('Folder location:', folderLocation);
	let i = 0;
	while (existsSync(`${folderLocation}/${projectId}/${pathName}`)) {
		i++;
		pathName = `${file.name.split('.')[0]}-${i}.${file.name.split('.')[1]}`;
	}

	// Check if the folder exists, else create it
	const folderPath = `static/files/${projectId}`;
	if (!existsSync(folderPath)) {
		mkdirSync(folderPath, { recursive: true });
	}

	writeFileSync(`${folderPath}/${pathName}`, Buffer.from(await file.arrayBuffer()));

	const projectFile: ProjectFileCreation = {
		name: pathName,
		project_id: 1,
		file_type: file.type
	};
	return projectFile;
};

async function createProject(
	Project: ProjectSchemaType,
	pool: pkg.Pool,
	user: User,
	files: any,
	authors: number[],
	subjects: string[],
	resources: string[]
): Promise<Project | null> {
	const client = await pool.connect();
	try {
		await client.query('BEGIN'); // Start transaction

		const projectQueryText =
			'INSERT INTO projects (title, description, resources, subjects) VALUES ($1, $2, $3, $4) RETURNING *';
		const projectValues = [
			Project.title,
			Project.description,
			resources.join('[ENTER]'),
			subjects.join('[ENTER]')
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

			await uploadFile(file, projects[0].id);
		});

		await client.query('COMMIT'); // Commit the transaction

		// Return success or the created project details
		console.log('Project created successfully:', projects[0]);
		return projects[0];
	} catch (err) {
		await client.query('ROLLBACK'); // Rollback the transaction on error
		return null;
		// Return or throw the error
		throw error(500, 'Internal server error: ' + JSON.stringify(err));
	} finally {
		client.release(); // Release the client back to the pool
	}
}
