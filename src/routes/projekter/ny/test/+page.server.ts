import type { PageServerLoad } from './$types';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

import { z } from 'zod';
const ProjectSchema = z.object({
	title: z.string({ required_error: 'Titel mangler.' }),
	terms: z.enum(['on', 'off'], { required_error: 'Du skal acceptere betingelserne.' })
});
export const actions = {
	default: async ({
		request
	}): Promise<{
		formData: any;
		validationErrors?: any;
		unTouchedData?: any;
		serverError?: string;
		test?: any;
	} | void> => {
		const formData = Object.fromEntries(await request.formData());

		//validate form
		let result: any;
		try {
			result = ProjectSchema.parse(formData);
			return {
				formData: result
			};
		} catch (err: any) {
			const { fieldErrors: errors } = err.flatten();
			const { ...rest } = formData;

			return {
				formData: rest,
				validationErrors: errors,
				unTouchedData: formData
			};
		}
	}
};
