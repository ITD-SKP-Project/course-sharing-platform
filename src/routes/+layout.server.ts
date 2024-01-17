import type { LayoutServerLoad } from './$types';

export const load = (async ({ cookies, locals }) => {
	console.log(locals.user);
	const darkmode = cookies.get('darkmode');
	const color = cookies.get('color');
	{
		return {
			darkmode: darkmode ? JSON.parse(darkmode) : null,
			color: color ? color : null,
			test: locals.user
		};
	}
}) satisfies LayoutServerLoad;
