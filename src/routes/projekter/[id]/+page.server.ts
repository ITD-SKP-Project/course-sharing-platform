import type { PageServerLoad } from './$types';

import { pool } from '$lib/server/database';
import type { Project, ProjectAuthor, ProjectProfession, User, UserEssentials } from '$lib/types';
import { error } from '@sveltejs/kit';

export const load = (async ({ locals, params }) => {
	const client = await pool.connect();

	const id = params.id;
	if (!id) throw error(400, 'Der blev ikke givet et id.');
	//check if id is a number
	if (isNaN(+id)) throw error(400, "Id'et skal være et tal.");

	//get project
	let errorType: number | null = null;
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

		/*
			LEFT JOIN 
				  project_authors ON projects.id = project_authors.project_id
				WHERE 
				  (
					projects.live = true
					OR (projects.live = false AND project_authors.user_id = $1)
				  )
				  AND projects.id = $1
				GROUP BY 
				  projects.id
				LIMIT 1;
		*/

		if (!projects || projects.length == 0) {
			errorType = 404;
			throw error(404, 'Der blev ikke fundet nogle projekter.');
		}

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
		if (errorType === 404) {
			throw error(404, 'Der blev ikke fundet nogle projekter.');
		} else throw error(500, 'Der skete en uventet fejl: ' + JSON.stringify(err));
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
	}
};
