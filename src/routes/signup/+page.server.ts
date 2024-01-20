import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
	console.log(
		locals.onboardingStatus,
		locals.onboardingRedirectLocation,
		'signup/+page.server.ts🤓'
	);
	if (locals.onboardingStatus !== 'none') {
		throw redirect(301, locals.onboardingRedirectLocation);
	}
}) satisfies PageServerLoad;