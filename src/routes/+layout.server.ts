import type { User, pending_users } from '$lib/types';
import type { LayoutServerLoad } from './$types';
import { pool } from '$lib/server/database';

export const load = (async ({ cookies, locals }) => {
	const darkmode = cookies.get('darkmode');
	const color = cookies.get('color');

	const client = await pool.connect();
	let notificationCount: number = 0;
	try {
		if (locals.user?.authority_level >= 3) {
			const { rows: pendingUsers } = await client.query<pending_users>(
				`SELECT * FROM pending_users WHERE user_id != $1`,
				[locals.user.id]
			);

			notificationCount = pendingUsers.filter((user) => user.user_id !== null).length;
		}
		return {
			darkmode: darkmode ? JSON.parse(darkmode) : null,
			color: color ? color : null,
			user: locals.user as User,
			notificationCount: notificationCount
		};
	} catch (err) {
		console.error('Error:', err);
		return {
			darkmode: darkmode ? JSON.parse(darkmode) : null,
			color: color ? color : null,
			user: locals.user as User,
			notificationCount: 0
		};
	} finally {
		client.release();
	}
}) satisfies LayoutServerLoad;
