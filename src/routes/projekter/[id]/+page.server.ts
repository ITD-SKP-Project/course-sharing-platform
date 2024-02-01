import type { PageServerLoad } from './$types';
import pkg from 'pg';
import { POSTGRES_URL } from '$env/static/private';
const { Pool } = pkg;
const pool = new Pool({
	connectionString: POSTGRES_URL,
	ssl: true
});
import type { Project, ProjectAuthor, User } from '$lib/types';
import { error } from '@sveltejs/kit';

export const load = (async ({ url, locals }) => {
	const client = await pool.connect();

	const id = url.pathname.split('/')[2];
	if (!id) throw error(404, 'Der blev ikke fundet nogle projekter.');
	if (typeof +id != 'number') throw error(404, 'Der blev ikke fundet nogle projekter.');

	//get project
	try {
		const { rows: projects } = await client.query<Project>(
			locals.user
				? `SELECT * FROM projects WHERE id = ${id} LIMIT 1;`
				: `SELECT 
					 id,
					title,
					description,
					project_fork_id,
					fork_root_id,
					created_at,
					updated_at,
					subjects,
					resources,
					likes,
					live
			FROM projects WHERE id = ${id} LIMIT 1;`
		);
		if (!projects || projects.length == 0)
			throw error(404, 'Der blev ikke fundet nogle projekter.');

		//get authors
		const { rows: authors } = await client.query<ProjectAuthor>(
			`SELECT * FROM project_authors WHERE project_id = ${id}`
		);

		//attach authors to project
		projects[0].authors = authors;

		//for every author in project, attach user to author
		for (const author of projects[0].authors) {
			const { rows: users } = await client.query<User>(
				`SELECT * FROM users WHERE id = ${author.user_id} LIMIT 1;`
			);
			author.user = users[0];
		}
		return {
			project: projects[0]
		};
	} catch (err) {
		console.log(err);
		throw error(500, 'Der skete en uventet fejl: ' + JSON.stringify(err));
	} finally {
		client.release();
	}
}) satisfies PageServerLoad;
