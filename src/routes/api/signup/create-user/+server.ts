import type { RequestHandler } from './$types';
import { db } from '@vercel/postgres';
import { error, json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals }) => {
	const { firstname, lastname, context } = await request.json();
	const userId = locals.user.id;

	const client = await db.connect();
	await client.sql`BEGIN;`;
	await client.sql`UPDATE users set firstname = ${firstname}, lastname = ${lastname}, authority_level = 1 where id = ${userId};`;
	await client.sql`INSERT INTO pending_users (user_id, context) VALUES (${+userId}, ${context});`;
	const data = await client.sql`COMMIT;`;

	console.log(data, 'data');
	// if (!pending_users || pending_users.length <= 0)
	// 	throw error(500, 'Der skete en fejl ved oprettelse af bruger. Prøv igen senere.');

	return new Response();
};
