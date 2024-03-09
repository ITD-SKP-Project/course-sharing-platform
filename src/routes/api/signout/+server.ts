import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { user } from '$lib/index';

export const DELETE: RequestHandler = async ({ cookies }) => {
	cookies.delete('token', {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'strict'
	});
	user.set(null);
	return json({ message: 'success' });
};
