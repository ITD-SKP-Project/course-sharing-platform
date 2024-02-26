import type { PageServerLoad } from './$types';
import pkg from 'pg';
import { POSTGRES_URL } from '$env/static/private';
const { Pool } = pkg;
const pool = new Pool({
	connectionString: POSTGRES_URL,
	ssl: true
});
import { z } from 'zod';
import type { Project, ProjectAuthor, ProjectProfession, User, UserEssentials } from '$lib/types';
import { error, json } from '@sveltejs/kit';

export const load = (async ({ url, locals, params }) => {
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

		return { project: project };
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
		console.log('subjectsArray:', subjectsArray);
		const { errors: subjectErrors } = validateCustomArray(subjectsArray);
		if (subjectErrors) return { validationErrors: subjectErrors, formData: formData };

		const subjects = subjectsArray.map(([key, value]) => value.toString());
		console.log('subjects:', subjects);
		const subjectsString = subjects.join('[ENTER]');
		console.log('subjectsString:', subjectsString);

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
		console.log('resourcesArray:', resourcesArray);
		const { errors: subjectErrors } = validateCustomArray(resourcesArray);
		if (subjectErrors) return { validationErrors: subjectErrors, formData: formData };

		const resources = resourcesArray.map(([key, value]) => value.toString());
		console.log('resources:', resources);
		const resourcesString = resources.join('[ENTER]');
		console.log('resourcesString:', resourcesString);

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
	}
};
