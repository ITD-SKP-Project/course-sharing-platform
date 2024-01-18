import type { PageServerLoad } from './$types';
import { sql } from '@vercel/postgres';
import type { DatabaseResponse, Project, ProjectAuthor, ProjectProfession } from '$lib/types';
import { error, json } from '@sveltejs/kit';
import type { User } from '$lib/types';

export const load = (async () => {
	const { rows: projects } = (await sql`SELECT * FROM projects`) as DatabaseResponse<Project>;
	if (!projects) throw error(404, 'Der blev ikke fundet nogle projekter.');
	//for each project, get authors and professions
	const { rows: authors } =
		(await sql`SELECT * FROM project_authors`) as DatabaseResponse<ProjectAuthor>;

	//get all users and add them to authors
	const { rows: users } = (await sql`SELECT * FROM users`) as DatabaseResponse<User>;

	const { rows: professions } =
		(await sql`SELECT * FROM project_professions`) as DatabaseResponse<ProjectProfession>;

	//add authors and professions to projects
	projects.forEach((project) => {
		project.authors = authors.filter((author) => author.project_id === project.id);
		project.professions = professions.filter((profession) => profession.project_id === project.id);
		project.authors.forEach((author) => {
			author.user = users.find((user) => user.id === author.user_id);
		});
	});

	return { projects };
}) satisfies PageServerLoad;
