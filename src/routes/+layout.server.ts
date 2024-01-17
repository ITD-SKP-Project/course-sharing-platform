import type { LayoutServerLoad } from './$types';

export const load = (async ({ cookies, locals }) => {
	const darkmode = cookies.get('darkmode');
	const color = cookies.get('color');
	{
		return {
			darkmode: darkmode ? JSON.parse(darkmode) : null,
			color: color ? color : null,
			user: locals.user
		};
	}
}) satisfies LayoutServerLoad;
