import { user } from '$lib/types';
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: user | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
