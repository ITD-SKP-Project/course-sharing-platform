import type { RequestHandler } from './$types';
import { superValidate } from 'sveltekit-superforms/server';
import { formSchema } from '../../../routes/test-form/schema';

// export const POST: RequestHandler = async ({ request }) => {

// 	const form = await superValidate(event, formSchema);
// 	if (!form.valid) {
// 		return fail(400, {
// 			form
// 		});
// 	}
// 	return {
// 		form
// 	};
// };
