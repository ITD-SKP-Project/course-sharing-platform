import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const DELETE: RequestHandler = async ({ cookies }) => {
	cookies.delete('token', {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'strict'
	});
	return json({ message: 'success' });
};
