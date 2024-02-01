import jwt from 'jsonwebtoken';
import { sql } from '@vercel/postgres';
import { JWT_SECRET } from '$env/static/private';
import type { Handle } from '@sveltejs/kit';
import type { User, DatabaseResponse } from '$lib/types';
import pkg from 'pg';
import { POSTGRES_URL } from '$env/static/private';
const { Pool } = pkg;
const pool = new Pool({
	connectionString: POSTGRES_URL,
	ssl: true
});

export const handle = (async ({ event, resolve }) => {
	const sessionCookie = event.cookies.get('token');
	if (!sessionCookie) {
		event.locals.user = null;
		event.locals.onboardingStatus = 'none';
		event.locals.onboardingRedirectLocation = '/login';
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

	const client = await pool.connect();
	try {
		const queryText = 'SELECT * from users where id = $1 LIMIT 1';
		const { rows: users } = (await client.query(queryText, [
			decodedUser.id
		])) as DatabaseResponse<User>;
		client.release();

		if (!users || users.length <= 0) {
			event.locals.onboardingStatus = 'none';
			event.locals.onboardingRedirectLocation = '/login';
			return resolve(event);
		}

		const user = users[0] as User;
		event.locals.user = user;

		if (!user.email_verified) {
			event.locals.onboardingStatus = 'needs-email-verification';
			event.locals.onboardingRedirectLocation = '/signup/bekraeft-email';
			return resolve(event);
		}
		if (!user.firstname || !user.lastname) {
			event.locals.onboardingStatus = 'needs-account-info';
			event.locals.onboardingRedirectLocation = '/signup/bruger-info';
			return resolve(event);
		}
		if (!user.validated) {
			event.locals.onboardingStatus = 'needs-admin-validation';
			event.locals.onboardingRedirectLocation = '/signup/afventer-godkendelse';
			return resolve(event);
		}

		event.locals.onboardingStatus = 'validated';
		event.locals.onboardingRedirectLocation = '/konto';
	} catch (error) {
		event.cookies.delete('token', {
			path: '/'
		});
	}

	return resolve(event);
}) satisfies Handle;
