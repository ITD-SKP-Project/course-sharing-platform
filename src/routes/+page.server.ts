import type { PageServerLoad } from './$types';

import pkg from 'pg';
import { POSTGRES_URL } from '$env/static/private';
const { Pool } = pkg;
const pool = new Pool({
	connectionString: POSTGRES_URL,
	ssl: true
});
import type {
	DatabaseResponse,
	Profession,
	Project,
	ProjectAuthor,
	ProjectProfession
} from '$lib/types';
import { error, json } from '@sveltejs/kit';
import type { User } from '$lib/types';

export const load = (async () => {
	const client = await pool.connect();
	try {
		const { rows: projects } = await client.query<Project>('SELECT * FROM projects');
		if (!projects) throw error(404, 'Der blev ikke fundet nogle projekter.');
		//for each project, get authors and professions
		const { rows: authors } = await client.query<ProjectAuthor>('SELECT * FROM project_authors');

		//get all users and add them to authors
		const { rows: users } = await client.query<User>('SELECT * FROM users');

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
	} catch (error) {
		// Handle or throw the error as per your application's error handling policy
		console.error('Authentication error:', JSON.stringify(error));
		throw new Error(
			'Error processing your request. Please try again later. ' + JSON.stringify(error)
		);
	}
}) satisfies PageServerLoad;
