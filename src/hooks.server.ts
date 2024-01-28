import jwt from 'jsonwebtoken';
import { sql } from '@vercel/postgres';
import { JWT_SECRET } from '$env/static/private';
import type { Handle } from '@sveltejs/kit';
import type { User, DatabaseResponse } from '$lib/types';
import { redirect } from '@sveltejs/kit';
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
		event.locals.onboardingRedirectLocation = '/signup';
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
	const queryText = 'SELECT * from users where id = $1 LIMIT 1';
	const { rows: users } = (await client.query(queryText, [
		decodedUser.id
	])) as DatabaseResponse<User>;
	client.release();
	console.log(users, 'users');
	if (!users || users.length <= 0) {
		console.log('none');
		event.locals.onboardingStatus = 'none';
		event.locals.onboardingRedirectLocation = '/signup';
		return resolve(event);
	}

	try {
		const user = users[0] as User;
		event.locals.user = user;

		if (!user.email_verified) {
			console.log('needs-email-verification');
			event.locals.onboardingStatus = 'needs-email-verification';
			event.locals.onboardingRedirectLocation = '/signup/bekraeft-email';
			return resolve(event);
		}
		if (!user.firstname || !user.lastname) {
			console.log('needs-account-info');
			event.locals.onboardingStatus = 'needs-account-info';
			event.locals.onboardingRedirectLocation = '/signup/bruger-info';
			return resolve(event);
		}
		if (!user.validated) {
			console.log('needs-admin-validation');
			event.locals.onboardingStatus = 'needs-admin-validation';
			event.locals.onboardingRedirectLocation = '/signup/afventer-godkendelse';
			return resolve(event);
		}

		console.log('validated');
		event.locals.onboardingStatus = 'validated';
		event.locals.onboardingRedirectLocation = '/konto';
	} catch (e) {
		event.cookies.delete('token', {
			path: '/'
		});
	}
	return resolve(event);
}) satisfies Handle;
