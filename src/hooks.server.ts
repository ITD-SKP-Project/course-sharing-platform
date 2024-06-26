import { sequence } from '@sveltejs/kit/hooks';
import * as Sentry from '@sentry/sveltekit';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';
import type { Handle } from '@sveltejs/kit';
import type { User } from '$lib/types';

import { pool } from '$lib/server/database';

// import env development or production
if (import.meta.env.PROD) {
	Sentry.init({
		dsn: 'https://bd0b656d83362f80416a093a00c42a41@o4506914465447936.ingest.us.sentry.io/4506914478358528',
		tracesSampleRate: 1
	});
}

export const handle = sequence(Sentry.sentryHandle(), (async ({ event, resolve }) => {
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
			console.warn('Error decoding token:', err);
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
		const { rows: users } = await client.query<User>(queryText, [decodedUser.id]);

		client.release();

		if (!users || users.length <= 0) {
			event.cookies.delete('token', {
				path: '/'
			});
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
		Sentry.captureException(error);
		event.cookies.delete('token', {
			path: '/'
		});
	}

	return resolve(event);
}) satisfies Handle);

export const handleError = Sentry.handleErrorWithSentry();
