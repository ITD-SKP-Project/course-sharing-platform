import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
	if (locals.onboardingStatus !== 'needs-admin-validation') {
		throw redirect(301, locals.onboardingRedirectLocation);
	}
}) satisfies PageServerLoad;
