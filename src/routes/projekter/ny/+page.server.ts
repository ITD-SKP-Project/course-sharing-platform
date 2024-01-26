import type { PageServerLoad } from './$types';
import { sql } from '@vercel/postgres';
import type { DatabaseResponse, User } from '$lib/types';
import { error } from '@sveltejs/kit';

export const load = (async () => {
	//return all users
	const { rows: users } = (await sql`SELECT * FROM users;`) as DatabaseResponse<User>;
	if (!users || users.length == 0) throw error(404, 'Der blev ikke fundet nogle brugere.');

	return {
		users: users
	};
}) satisfies PageServerLoad;
