import type { RequestHandler } from './$types';
import bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '$env/static/private';

export const GET: RequestHandler = async ({ request }) => {
	// const { email, password } = (await request.json()) as { email: string; password: string };

	// const salt = bcrypt.genSaltSync(BCRYPT_SALT_ROUNDS);
	// const hash = bcrypt.hashSync(password, salt);

	return new Response();
};
