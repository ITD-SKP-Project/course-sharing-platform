import type { PageServerLoad } from './$types';

import { pool } from '$lib/server/database';
import type {
	Profession,
	Project,
	ProjectAuthor,
	ProjectProfession,
	UserEssentials
} from '$lib/types';
import { error } from '@sveltejs/kit';

export const load = (async ({ locals, url }) => {
	const client = await pool.connect();
	let errorType: number | null = null;
	try {
		let queryParams: number | string[];
		let query: string;
		if (locals.user && locals.user?.authority_level && locals.user?.authority_level > 1) {
			queryParams = [];
			query = `SELECT 
			projects.*,
			CAST(COUNT(project_likes.id) AS INTEGER) AS likes
		FROM 
			projects
		LEFT JOIN 
			project_likes ON projects.id = project_likes.project_id
		GROUP BY 
			projects.id;`;
		} else {
			queryParams = [locals.user?.id];
			query = `SELECT 
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
					OR (projects.live = false AND project_authors.user_id = $1)
				  )
				GROUP BY 
				  projects.id`;
		}

		const { rows: projects } = await client.query<Project>(query, queryParams);

		if (!projects) {
			errorType = 404;
			throw error(404, 'Der blev ikke fundet nogle projekter.');
		}

		//try to find project_like from locals.user
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
			'SELECT  id, firstname, lastname, email, validated FROM users'
		);

		const { rows: projectProfessions } =
			await client.query<ProjectProfession>(`SELECT pp.*, p.name as profession_name
				FROM project_professions pp
				JOIN professions p ON pp.profession_id = p.id;`);
		const { rows: professions } = await client.query<Profession>(`SELECT * FROM professions; `);

		//add authors and professions to projects
		projects.forEach((project) => {
			project.authors = authors.filter((author) => author.project_id === project.id);
			project.professions = projectProfessions.filter(
				(projectProfession) => projectProfession.project_id === project.id
			);
			project.authors.forEach((author) => {
				author.user = users.find((user) => user.id === author.user_id);
			});
		});

		return { projects: projects, professions: professions };
	} catch (err) {
		// Handle or throw the error as per your application's error handling policy
		console.error(JSON.stringify(err), 'ERROR');
		if (errorType === 404) {
			throw error(404, 'Der blev ikke fundet nogle projekter.');
		} else throw error(500, 'Fejl: ' + JSON.stringify(err));
	} finally {
		client.release();
	}
}) satisfies PageServerLoad;
