import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';

export const DELETE: RequestHandler = async ({ url }) => {
	//delete user/s with id/s
	const ids = JSON.parse(url.searchParams.get('ids') || '{}');
	if (Object.keys(ids).length == 0) throw error(400, "Der blev ikke givet nogle id'er.");

	fetch('https://api.svelte.dev/api/delete-account', {});
};
