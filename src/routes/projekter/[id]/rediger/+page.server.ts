import type { PageServerLoad } from './$types';

import { pool } from '$lib/server/database';
import * as Sentry from '@sentry/sveltekit';
import { validateCustomArray } from '$lib/index';
import { validateCustomObject } from '$lib/zodSchemas';
import { validateCustomFileArray } from '$lib/index';
import { z } from 'zod';
import type { Project, ProjectAuthor, ProjectProfession, User, UserEssentials } from '$lib/types';
import { error, redirect } from '@sveltejs/kit';
import { deleteFile, postFile } from '$lib/server/files';

export const load = (async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(307, `/login?redirect=/projekter/${params.id}/rediger`);
	}
	if (locals.onboardingStatus != 'validated') {
		throw error(
			403,
			'Du har ikke adgang til denne side.  Kontakt support hvis du mener dette er en fejl.'
		);
	}
	if (locals.user.authority_level < 1) {
		throw error(
			403,
			'Du har ikke adgang til denne side.  Kontakt support hvis du mener dette er en fejl.'
		);
	}

	const client = await pool.connect();

	const id = params.id;
	if (isNaN(+id)) throw error(400, "Id'et skal være et tal.");

	//get project

	let errorType: number | null = null;
	try {
		const { rows: projects } = await client.query<Project>(
			locals.user
				? `
				SELECT 
				projects.*,
				COALESCE(CAST(COUNT(project_likes.id) AS INTEGER), 0) AS likes
			  FROM 
				projects
			  LEFT JOIN 
				project_likes ON projects.id = project_likes.project_id
			  LEFT JOIN 
				project_authors ON projects.id = project_authors.project_id
			  WHERE 
				(
				  projects.live = true
				  OR (projects.live = false AND project_authors.user_id = $2)
				)
				AND projects.id = $1
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
				LEFT JOIN 
				  project_authors ON projects.id = project_authors.project_id
				WHERE 
				  (
					projects.live = true
					OR (projects.live = false AND project_authors.user_id = $2)
				  )
				  AND projects.id = $1
				GROUP BY 
				  projects.id
				LIMIT 1;
			  `,
			[id, locals.user?.id]
		);

		if (!projects || projects.length == 0) {
			errorType = 404;
			throw error(404, 'Der blev ikke fundet nogle projekter.');
		}
		let project = projects[0] as Project;

		const { rows: likes } = await client.query(
			`SELECT * FROM project_likes WHERE user_id = $1 AND project_id = $2`,
			[locals.user.id, id]
		);

		project.likedByUser = likes.some((like) => like.project_id === project.id);

		//for each project, get authors and professions
		const { rows: authors } = await client.query<ProjectAuthor>(
			'SELECT * FROM project_authors WHERE project_id = $1',
			[id]
		);
		//if the user who is logged in is not an admin, check if the user is an author of the project
		if (locals.user.authority_level < 3) {
			if (!authors.some((author) => author.user_id === locals.user.id) || authors.length == 0) {
				errorType = 403;
				throw error(403, 'Du har ikke adgang til denne side');
			}
		}

		//get all users and add them to authors
		const { rows: users } = await client.query<UserEssentials>(
			'SELECT id, firstname, lastname, email, validated FROM users where validated = true'
		);

		const { rows: projectProfessions } =
			await client.query<ProjectProfession>(`SELECT pp.*, p.name as profession_name
		FROM project_professions pp
		JOIN professions p ON pp.profession_id = p.id;`);

		const { rows: projectFiles } = await client.query(
			`SELECT * FROM project_files WHERE project_id = ${id};`
		);

		//add authors and professions to projects

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
		if (errorType == 403)
			return error(403, 'Du har ikke rettigheder til at ændre på dette projekt.');
		else if (errorType == 404) throw error(404, 'Der blev ikke fundet nogle projekter.');
		else {
			Sentry.captureException(err);
			throw error(500, 'Der skete en uventet fejl: ' + JSON.stringify(err));
		}
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
			Sentry.captureException(err);
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
			title: z.string().min(1, 'Title er påkrævet.').max(50, 'Maks 50 tegn')
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
				Sentry.captureException(err);
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
			description: z.string().min(1, 'Beskrivelse er påkrævet.').max(9999, 'Maks 9999 tegn')
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
				Sentry.captureException(err);
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
			notes: z.string().min(1, 'Beskrivelse er påkrævet.').max(9999, 'Maks 9999 tegn')
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
				Sentry.captureException(err);
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

		if (subjectsArray.length == 0) {
			return {
				validationErrors: { subjects: 'Du skal vælge mindst et Fagområde.' },
				formData: formData
			};
		}
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
			Sentry.captureException(err);
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

		if (resourcesArray.length == 0) {
			return {
				validationErrors: { resources: 'Du skal vælge mindst en ressource.' },
				formData: formData
			};
		}

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
			Sentry.captureException(err);
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
			it_supporter_skill_level: z
				.string()
				.max(50, 'Niveau må ikke være mere end 50 tegn.')
				.optional(),
			programmering: z.enum(['on']).optional(),
			programmering_skill_level: z
				.string()
				.max(50, 'Niveau må ikke være mere end 50 tegn.')
				.optional(),
			infrastruktur: z.enum(['on']).optional(),
			infrastruktur_skill_level: z
				.string()
				.max(50, 'Niveau må ikke være mere end 50 tegn.')
				.optional()
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
			Sentry.captureException(err);
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

			for (const [key, value] of filesArray) {
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
			}

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
			Sentry.captureException(err);
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
		let addedIds: number[] = [];
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
			for (const author of userIds) {
				if (addedIds.includes(author) || addedIds.includes(locals.user?.id)) continue;

				addedIds.push(author);
				const projectAuthorValues = [params.id, author, 1]; // Assuming authority_level is the correct column name
				if (author != locals.user.id)
					await client.query(projectAuthorQueryText, projectAuthorValues);
			}

			await client.query<Project>(`COMMIT`);
			return { successMessage: 'Filer blev opdateret', formData: formData };
		} catch (err) {
			Sentry.captureException(err);
			console.error(err);
			await client.query<Project>(`ROLLBACK`);
			throw error(500, 'Der skete en uventet fejl: ' + JSON.stringify(err));
		} finally {
			client.release();
		}
	},
	updateCourseLength: async ({
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
		const titleSchema = z.object({
			course_length: z.string().min(1, 'Projekt tidsforbrug er påkrævet.').max(50, 'Maks 50 tegn')
		});
		type titleSchemaType = z.infer<typeof titleSchema>;

		let result: titleSchemaType;
		const client = await pool.connect();
		try {
			result = titleSchema.parse({ ...formData });

			await client.query<Project>(
				`UPDATE projects SET course_length = $1 WHERE id = $2 RETURNING *;`,
				[result.course_length, params.id]
			);
			return { successMessage: 'Projekt tidsforbrug blev opdateret', formData: formData };
		} catch (err) {
			if (err instanceof z.ZodError) {
				const { fieldErrors: errors } = err.flatten();
				return { validationErrors: errors, formData: formData };
			} else {
				Sentry.captureException(err);
				throw error(500, 'Der skete en uventet fejl: ' + JSON.stringify(err));
			}
		} finally {
			client.release();
		}
	},
	updateLive: async ({
		params,
		request,
		locals
	}): Promise<{
		validationErrors?: any;
		successMessage?: any;
		serverError?: string;
		formData: any;
	} | void> => {
		const liveSchema = z.object({
			live: z.enum(['yes', 'no'])
		});

		let formData = Object.fromEntries(await request.formData());
		const titleSchema = z.object({
			course_length: z.string().min(1, 'Projekt tidsforbrug er påkrævet.')
		});
		type LiveSchemaType = z.infer<typeof liveSchema>;

		let result: LiveSchemaType;
		const client = await pool.connect();
		try {
			result = liveSchema.parse({ ...formData });

			await client.query<Project>(`UPDATE projects SET live = $1 WHERE id = $2 RETURNING *;`, [
				result.live == 'no' ? false : true,
				params.id
			]);
			return { successMessage: 'Projekt synlighed blev opdateret', formData: formData };
		} catch (err) {
			if (err instanceof z.ZodError) {
				const { fieldErrors: errors } = err.flatten();
				return { validationErrors: errors, formData: formData };
			} else {
				Sentry.captureException(err);
				throw error(500, 'Der skete en uventet fejl: ' + JSON.stringify(err));
			}
		} finally {
			client.release();
		}
	}
};
