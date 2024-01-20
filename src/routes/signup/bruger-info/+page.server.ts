import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
	if (locals.onboardingStatus !== 'needs-account-info') {
		throw redirect(301, locals.onboardingRedirectLocation);
	}

	return { missingInfo: locals.userMissingInfo };
}) satisfies PageServerLoad;
