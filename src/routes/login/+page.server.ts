import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
	if (locals.userMissingInfo) {
		throw redirect(301, '/signup/opret-bruger');
	}
	if (locals.user) {
		throw redirect(301, '/');
	}
}) satisfies PageServerLoad;
