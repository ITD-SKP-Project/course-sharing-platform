import { user } from '$lib/types';
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: user | null;
			userMissingInfo: boolean;

			onboardingStatus:
				| 'none' //user is not logged in and may not have an account
				| 'needs-email-verification' //user is logged in but has not validated email
				| 'needs-account-info' //user is logged in and has validated email but not set account info
				| 'needs-admin-validation' //user is logged in and has validated email and set account info but not validated by admin
				| 'validated'; //user is logged in and has validated email and set account info and validated by admin
			onboardingRedirectLocation: string;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
