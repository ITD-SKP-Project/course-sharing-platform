import type { PageServerLoad } from './$types';
import pkg from 'pg';
import { POSTGRES_URL } from '$env/static/private';
const { Pool } = pkg;
const pool = new Pool({
	connectionString: POSTGRES_URL,
	ssl: true
});
import { validateCustomArray } from '$lib/index';
import { validateCustomObject } from '$lib/zodSchemas';
import { validateCustomFileArray } from '$lib/index';
import { z } from 'zod';
import type { Project, ProjectAuthor, ProjectProfession, User, UserEssentials } from '$lib/types';
import { error, redirect } from '@sveltejs/kit';
import { deleteFile, postFile } from '$lib/server/files';

export const load = (async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(307, `/login?redirect=/projekter/${params.id}/edit`);
	}
	const client = await pool.connect();

	const id = params.id;
	if (!id) throw error(400, 'Der blev ikke givet et id.');
	if (typeof +id != 'number') throw error(404, 'Der blev ikke fundet nogle projekter.');

	//get project
	try {
		const { rows: projects } = await client.query<Project>(
			locals.user
				? `
				SELECT 
				  projects.*,
				 CAST(COUNT(project_likes.id) AS INTEGER) AS likes
				FROM 
				  projects
				LEFT JOIN 
				  project_likes ON projects.id = project_likes.project_id
				WHERE 
				  projects.id = ${id}
				  AND projects.live = true
				GROUP BY 
				  projects.id
				LIMIT 1;
			  `
				: `
				SELECT 
				  projects.id,
				  projects.title,
				  projects.description,
				  projects.project_fork_id,
				  projects.fork_root_id,
				  projects.created_at,
				  projects.updated_at,
				  projects.subjects,
				  projects.resources,
				  projects.live,
				  COALESCE(CAST(COUNT(project_likes.id) AS INTEGER), 0) AS likes
				FROM 
				  projects
				LEFT JOIN 
				  project_likes ON projects.id = project_likes.project_id
				WHERE 
				  projects.id = ${id}
				  AND projects.live = true
				GROUP BY 
				  projects.id
				LIMIT 1;
			  `
		);

		if (!projects || projects.length == 0)
			throw error(404, 'Der blev ikke fundet nogle projekter.');

		if (locals.user) {
			const { rows: likes } = await client.query(`SELECT * FROM project_likes WHERE user_id = $1`, [
				locals.user.id
			]);
			projects.forEach((project) => {
				project.likedByUser = likes.some((like) => like.project_id === project.id);
			});
		}
		//for each project, get authors and professions
		const { rows: authors } = await client.query<ProjectAuthor>('SELECT * FROM project_authors');

		//get all users and add them to authors
		const { rows: users } = await client.query<UserEssentials>(
			'SELECT id, firstname, lastname, email, validated FROM users'
		);

		const { rows: projectProfessions } =
			await client.query<ProjectProfession>(`SELECT pp.*, p.name as profession_name
		FROM project_professions pp
		JOIN professions p ON pp.profession_id = p.id;`);

		const { rows: projectFiles } = await client.query(
			`SELECT * FROM project_files WHERE project_id = ${id};`
		);

		//add authors and professions to projects
		const project = projects[0];
		project.authors = authors.filter((author) => author.project_id === project.id);
		project.professions = projectProfessions.filter(
			(projectProfession) => projectProfession.project_id === project.id
		);
		project.authors.forEach((author) => {
			author.user = users.find((user) => user.id === author.user_id);
		});
		project.files = projectFiles;

		return { project: project, users: users };
	} catch (err) {
		console.error(err);
		throw error(500, 'Der skete en uventet fejl: ' + JSON.stringify(err));
	} finally {
		client.release();
	}
}) satisfies PageServerLoad;

export const actions = {
	getUsers: async ({}): Promise<{
		users?: User[];
	} | void> => {
		const client = await pool.connect();
		try {
			const { rows: users } = await client.query(
				'SELECT id, firstname, lastname, email FROM users WHERE validated = true'
			);
			return { users: users };
		} catch (err) {
			throw error(500, 'Der skete en uventet fejl: ' + JSON.stringify(err));
		} finally {
			client.release();
		}
	},
	updateTitle: async ({
		request,
		params
	}): Promise<{
		formData: any;
		validationErrors?: any;
		successMessage?: any;
		serverError?: string;
	} | void> => {
		let formData = Object.fromEntries(await request.formData());
		const titleSchema = z.object({
			title: z.string().min(1, 'Title er påkrævet.')
		});
		type titleSchemaType = z.infer<typeof titleSchema>;

		let result: titleSchemaType;
		const client = await pool.connect();
		try {
			result = titleSchema.parse({ ...formData });

			await client.query<Project>(`UPDATE projects SET title = $1 WHERE id = $2 RETURNING *;`, [
				result.title,
				params.id
			]);
			return { successMessage: 'Title blev opdateret', formData: formData };
		} catch (err) {
			if (err instanceof z.ZodError) {
				const { fieldErrors: errors } = err.flatten();
				return { validationErrors: errors, formData: formData };
			} else {
				throw error(500, 'Der skete en uventet fejl: ' + JSON.stringify(err));
			}
		} finally {
			client.release();
		}
	},
	updateDescription: async ({
		request,
		params
	}): Promise<{
		formData: any;
		validationErrors?: any;
		successMessage?: any;
		serverError?: string;
	} | void> => {
		let formData = Object.fromEntries(await request.formData());
		const titleSchema = z.object({
			description: z.string().min(1, 'Beskrivelse er påkrævet.')
		});
		type titleSchemaType = z.infer<typeof titleSchema>;

		let result: titleSchemaType;
		const client = await pool.connect();
		try {
			result = titleSchema.parse({ ...formData });

			await client.query<Project>(
				`UPDATE projects SET description = $1 WHERE id = $2 RETURNING *;`,
				[result.description, params.id]
			);
			return { successMessage: 'Beskrivelsen blev opdateret', formData: formData };
		} catch (err) {
			if (err instanceof z.ZodError) {
				const { fieldErrors: errors } = err.flatten();
				return { validationErrors: errors, formData: formData };
			} else {
				throw error(500, 'Der skete en uventet fejl: ' + JSON.stringify(err));
			}
		} finally {
			client.release();
		}
	},
	updateNotes: async ({
		request,
		params
	}): Promise<{
		formData: any;
		validationErrors?: any;
		successMessage?: any;
		serverError?: string;
	} | void> => {
		let formData = Object.fromEntries(await request.formData());
		const titleSchema = z.object({
			notes: z.string().min(1, 'Beskrivelse er påkrævet.')
		});
		type titleSchemaType = z.infer<typeof titleSchema>;

		let result: titleSchemaType;
		const client = await pool.connect();
		try {
			result = titleSchema.parse({ ...formData });

			await client.query<Project>(`UPDATE projects SET notes = $1 WHERE id = $2 RETURNING *;`, [
				result.notes,
				params.id
			]);
			return { successMessage: 'Notaterne blev opdateret', formData: formData };
		} catch (err) {
			if (err instanceof z.ZodError) {
				const { fieldErrors: errors } = err.flatten();
				return { validationErrors: errors, formData: formData };
			} else {
				throw error(500, 'Der skete en uventet fejl: ' + JSON.stringify(err));
			}
		} finally {
			client.release();
		}
	},
	updateSubjects: async ({
		request,
		params
	}): Promise<{
		formData: any;
		validationErrors?: any;
		successMessage?: any;
		serverError?: string;
	} | void> => {
		let formData = Object.fromEntries(await request.formData());

		const subjectsArray = Object.entries(formData).filter(([key, value]) =>
			key.startsWith('subjects-')
		);

		const { errors: subjectErrors } = validateCustomArray(subjectsArray);
		if (subjectErrors) return { validationErrors: subjectErrors, formData: formData };

		const subjects = subjectsArray.map(([key, value]) => value.toString());

		const subjectsString = subjects.join('[ENTER]');

		const client = await pool.connect();
		try {
			await client.query<Project>(`UPDATE projects SET subjects = $1 WHERE id = $2 RETURNING *;`, [
				subjectsString,
				params.id
			]);
			return { successMessage: 'Fagområder blev opdateret', formData: formData };
		} catch (err) {
			throw error(500, 'Der skete en uventet fejl: ' + JSON.stringify(err));
		} finally {
			client.release();
		}
	},
	updateResources: async ({
		request,
		params
	}): Promise<{
		formData: any;
		validationErrors?: any;
		successMessage?: any;
		serverError?: string;
	} | void> => {
		let formData = Object.fromEntries(await request.formData());

		const resourcesArray = Object.entries(formData).filter(([key, value]) =>
			key.startsWith('resources-')
		);

		const { errors: subjectErrors } = validateCustomArray(resourcesArray);
		if (subjectErrors) return { validationErrors: subjectErrors, formData: formData };

		const resources = resourcesArray.map(([key, value]) => value.toString());

		const resourcesString = resources.join('[ENTER]');

		const client = await pool.connect();
		try {
			await client.query<Project>(`UPDATE projects SET resources = $1 WHERE id = $2 RETURNING *;`, [
				resourcesString,
				params.id
			]);
			return { successMessage: 'Fagområder blev opdateret', formData: formData };
		} catch (err) {
			throw error(500, 'Der skete en uventet fejl: ' + JSON.stringify(err));
		} finally {
			client.release();
		}
	},
	updateProfessions: async ({
		request,
		params
	}): Promise<{
		formData: any;
		validationErrors?: any;
		successMessage?: any;
		serverError?: string;
	} | void> => {
		let professionsSchema = z.object({
			it_supporter: z.enum(['on']).optional(),
			it_supporter_skill_level: z.string().optional(),
			programmering: z.enum(['on']).optional(),
			programmering_skill_level: z.string().optional(),
			infrastruktur: z.enum(['on']).optional(),
			infrastruktur_skill_level: z.string().optional()
		});
		let formData = Object.fromEntries(await request.formData());

		const client = await pool.connect();
		type ProjectSchemaType = z.infer<typeof professionsSchema>;
		let result: ProjectSchemaType;
		try {
			result = professionsSchema.parse({ ...formData });

			const { success: objSuccess, errors: objErrors } = validateCustomObject(result); //further validation of the zod result
			if (!objSuccess && objErrors) {
				return {
					formData: { ...formData },
					validationErrors: {
						...objErrors
					}
				};
			}

			await client.query<Project>(`BEGIN`);
			await client.query(`DELETE from project_professions where project_id = $1`, [params.id]);
			if (result.it_supporter) {
				await client.query(
					`INSERT INTO project_professions (project_id, profession_id, skill_level) VALUES ($1,4, $2)`,
					[params.id, result.it_supporter_skill_level]
				);
			}
			if (result.programmering) {
				await client.query(
					`INSERT INTO project_professions (project_id, profession_id, skill_level) VALUES ($1, 5, $2)`,
					[params.id, result.programmering_skill_level]
				);
			}
			if (result.infrastruktur) {
				await client.query(
					`INSERT INTO project_professions (project_id, profession_id, skill_level) VALUES ($1, 6, $2)`,
					[params.id, result.infrastruktur_skill_level]
				);
			}
			await client.query<Project>(`COMMIT`);

			return { successMessage: 'Fagområder blev opdateret', formData: formData };
		} catch (err) {
			console.error(err);
			await client.query<Project>(`ROLLBACK`);
			if (err instanceof z.ZodError) {
				const { fieldErrors: errors } = err.flatten();
				return { validationErrors: errors, formData: formData };
			}
			throw error(500, 'Der skete en uventet fejl: ' + JSON.stringify(err));
		} finally {
			client.release();
		}
	},
	updateFiles: async ({
		request,
		params
	}): Promise<{
		validationErrors?: any;
		successMessage?: any;
		serverError?: string;
	} | void> => {
		let formData = Object.fromEntries(await request.formData());
		const filesArray = Object.entries(formData).filter(([key, value]) => key.startsWith('files-'));
		const { success: fileSuccess, errors: fileErrors } = validateCustomFileArray(filesArray);

		if (!fileSuccess && fileErrors) {
			return {
				validationErrors: {
					...fileErrors
				}
			};
		}

		const client = await pool.connect();
		try {
			await client.query<Project>(`BEGIN`);
			await client.query(`DELETE from project_files where project_id = $1`, [params.id]);

			filesArray.forEach(async ([key, value]) => {
				const file = value as unknown as File;

				const fileQueryText =
					'INSERT INTO project_files (name, project_id, file_type, pathname, size) VALUES ($1, $2, $3, $4, $5)';
				const fileValues = [
					file.name,
					params.id,
					file.type,
					`${params.id}/${file.name}`,
					file.size
				];
				await client.query(fileQueryText, fileValues);

				await postFile(file, params.id);
			});

			const res: {
				status: number;
				body: { message: string };
			} = await deleteFile(params.id);

			if (res.status != 200) {
				await client.query<Project>(`ROLLBACK`);
				return { serverError: res.body.message };
			} else {
				await client.query<Project>(`COMMIT`);
				return { successMessage: 'Filer blev opdateret' };
			}
		} catch (err) {
			console.error(err);
			await client.query<Project>(`ROLLBACK`);
			throw error(500, 'Der skete en uventet fejl: ' + JSON.stringify(err));
		} finally {
			client.release();
		}
	},
	updateAuthors: async ({
		params,
		request,
		locals
	}): Promise<{
		validationErrors?: any;
		successMessage?: any;
		serverError?: string;
		formData: any;
	} | void> => {
		let formData = Object.fromEntries(await request.formData());
		const usersArray = Object.entries(formData).filter(([key, value]) => key.startsWith('users-'));
		const { success: userSuccess, errors: userErrors } = validateCustomArray(usersArray);
		if (!userSuccess && userErrors) {
			return {
				formData: formData,
				validationErrors: {
					...userErrors
				}
			};
		}

		const userIds = usersArray.map(([key, value]) => parseInt(value.toString()));

		const client = await pool.connect();
		try {
			await client.query<Project>(`BEGIN`);

			await client.query(`DELETE from project_authors where project_id = $1`, [params.id]);

			const projectAuthorQueryText =
				'INSERT INTO project_authors (project_id, user_id, authority_level) VALUES ($1, $2, $3)';
			const projectAuthorValues = [params.id, locals.user.id, 3]; // Assuming authority_level is the correct column name
			await client.query(projectAuthorQueryText, projectAuthorValues);
			userIds.forEach(async (author) => {
				const projectAuthorValues = [params.id, author, 1]; // Assuming authority_level is the correct column name
				if (author != locals.user.id)
					await client.query(projectAuthorQueryText, projectAuthorValues);
			});

			await client.query<Project>(`COMMIT`);
			return { successMessage: 'Filer blev opdateret', formData: formData };
		} catch (err) {
			console.error(err);
			await client.query<Project>(`ROLLBACK`);
			throw error(500, 'Der skete en uventet fejl: ' + JSON.stringify(err));
		} finally {
			client.release();
		}
	}
};
