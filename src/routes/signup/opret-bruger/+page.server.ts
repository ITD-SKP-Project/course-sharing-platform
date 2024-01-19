import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
	if (!locals.userMissingInfo) {
		throw redirect(301, '/');
	}
	return { missingInfo: locals.userMissingInfo };
}) satisfies PageServerLoad;
