import type { PageServerLoad } from './$types';
import * as Sentry from '@sentry/sveltekit';
import { pool } from '$lib/server/database';
import type { Project, ProjectAuthor, ProjectProfession, User, UserEssentials } from '$lib/types';
import { error } from '@sveltejs/kit';
import { sortComments } from '$lib';

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

		//if user, get comments and the name of the user
		if (locals.user) {
			const { rows: comments } = await client.query(
				`SELECT pc.*, u.firstname, u.lastname, u.authority_level
				 FROM project_comments pc
				 JOIN users u ON pc.user_id = u.id
				 WHERE pc.project_id = $1
				 ORDER BY pc.created_at DESC`, // Sorting by creation time in ascending order
				[id]
			);
			//sort comments by time but place comments with an answer_comment_id at the same level as the comment they answer
			comments.sort((a, b) => {
				if (a.answer_comment_id === b.id) return -1;
				if (b.answer_comment_id === a.id) return 1;
				return a.created_at > b.created_at ? -1 : 1;
			});

			projects[0].projectComments = sortComments(comments);
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
		} else {
			Sentry.captureException(err);
			throw error(500, 'Der skete en uventet fejl: ' + JSON.stringify(err));
		}
	} finally {
		client.release();
	}
}) satisfies PageServerLoad;

export const actions = {
	getUsers: async ({}): Promise<{ users?: User[] } | void> => {
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

	deleteProject: async ({ locals, params }): Promise<void> => {
		const client = await pool.connect();
		try {
			await client.query('BEGIN'); // Start transaction

			const id = params.id;
			if (!id) throw error(400, 'Der blev ikke givet et id.');
			//check if id is a number
			if (isNaN(+id)) throw error(400, "Id'et skal være et tal.");

			//get project
			const { rows: projects } = await client.query<Project>(
				'SELECT * FROM projects WHERE id = $1',
				[id]
			);
			if (!projects || projects.length == 0)
				throw error(404, 'Der blev ikke fundet nogle projekter.');

			//check if user is author of project
			const { rows: authors } = await client.query<ProjectAuthor>(
				'SELECT * FROM project_authors WHERE project_id = $1 AND user_id = $2',
				[id, locals.user?.id]
			);
			if (authors.length == 0)
				throw error(403, 'Du har ikke rettigheder til at slette dette projekt.');

			//delete project
			await client.query('DELETE FROM project_authors WHERE project_id = $1', [id]);
			await client.query('DELETE FROM project_comments WHERE project_id = $1', [id]);
			await client.query('DELETE FROM project_files WHERE project_id = $1', [id]);
			await client.query('DELETE FROM project_likes WHERE project_id = $1', [id]);
			await client.query('DELETE FROM project_professions WHERE project_id = $1', [id]);
			await client.query('DELETE FROM projects WHERE id = $1', [id]);

			await client.query('COMMIT'); // Commit transaction

			console.log('Project deleted');
			return;
		} catch (err) {
			await client.query('ROLLBACK'); // Rollback transaction
			Sentry.captureException(err);
			console.error(err);
			throw error(500, 'Der skete en uventet fejl: ' + JSON.stringify(err));
		} finally {
			client.release();
		}
	}
};
