import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	if (
		locals.onboardingStatus !== 'needs-admin-validation' &&
		locals.onboardingStatus !== 'validated'
	) {
		throw redirect(301, locals.onboardingRedirectLocation);
	}
}) satisfies PageServerLoad;
