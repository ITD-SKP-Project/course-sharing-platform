import { user } from '$lib/types';
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: user | null;
			userMissingInfo: boolean;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
