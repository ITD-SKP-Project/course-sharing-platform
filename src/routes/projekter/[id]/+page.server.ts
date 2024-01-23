import type { PageServerLoad } from './$types';
import { sql } from '@vercel/postgres';
import type { DatabaseResponse, Project, ProjectAuthor, User } from '$lib/types';
import { error } from '@sveltejs/kit';

export const load = (async ({ url }) => {
	const id = url.pathname.split('/')[2];
	if (!id) throw error(404, 'Der blev ikke fundet nogle projekter.');
	if (typeof +id != 'number') throw error(404, 'Der blev ikke fundet nogle projekter.');

	//get project
	const { rows: projects } =
		(await sql`SELECT * FROM projects WHERE id = ${id} LIMIT 1;`) as DatabaseResponse<Project>;
	if (!projects || projects.length == 0) throw error(404, 'Der blev ikke fundet nogle projekter.');

	//get authors
	const { rows: authors } =
		(await sql`SELECT * FROM project_authors WHERE project_id = ${id}`) as DatabaseResponse<ProjectAuthor>;

	//attach authors to project
	projects[0].authors = authors;

	//for every author in project, attach user to author
	for (const author of projects[0].authors) {
		const { rows: users } =
			(await sql`SELECT * FROM users WHERE id = ${author.user_id} LIMIT 1;`) as DatabaseResponse<User>;
		author.user = users[0];
	}

	return {
		project: projects[0]
	};
}) satisfies PageServerLoad;
