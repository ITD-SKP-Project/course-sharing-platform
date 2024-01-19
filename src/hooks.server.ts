import jwt from 'jsonwebtoken';
import { sql } from '@vercel/postgres';
import { JWT_SECRET } from '$env/static/private';
import type { Handle } from '@sveltejs/kit';
import type { User, DatabaseResponse } from '$lib/types';
import { redirect } from '@sveltejs/kit';

export const handle = (async ({ event, resolve }) => {
	const sessionCookie = event.cookies.get('token');
	if (!sessionCookie) {
		return resolve(event);
	}
	let decodedUser: User | undefined | null;

	jwt.verify(sessionCookie, JWT_SECRET, (err, decoded) => {
		if (err || !decoded) {
			event.locals.user = null;

			event.cookies.delete('token', {
				path: '/'
			});
			return resolve(event);
		}
		decodedUser = decoded as User | undefined | null;
	});
	if (!decodedUser) {
		return resolve(event);
	}
	console.log(decodedUser, 'decodedUser');
	const { rows: users } =
		(await sql`SELECT * from users where id=${decodedUser.id}`) as DatabaseResponse<User>;
	try {
		const user = users[0] as User;

		event.locals.user = user;

		if (!user.firstname || !user.lastname || !user.authority_level) {
			event.locals.userMissingInfo = true;
		} else {
			event.locals.userMissingInfo = false;
		}
	} catch (e) {
		event.cookies.delete('token', {
			path: '/'
		});
	}
	return resolve(event);
}) satisfies Handle;
