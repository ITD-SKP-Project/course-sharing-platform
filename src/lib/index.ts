import { writable, type Writable } from 'svelte/store';
import type { ProjectComment, User } from './types';
export const user: Writable<User | null> = writable(null);

export const months = [
	'Januar',
	'Februar',
	'Marts',
	'April',
	'Maj',
	'Juni',
	'Juli',
	'August',
	'September',
	'Oktober',
	'November',
	'December'
];

export function toArrayOfStrings(data: Object | undefined, keyword: string): string[] {
	if (!data || typeof data != 'object' || data === '') return [];

	//return keys where value includes keyword
	let result: string[] = [];
	for (const [key, value] of Object.entries(data)) {
		if (key.includes(keyword)) {
			result.push(value);
		}
	}
	return result;
}
export function validateCustomFileArray(files: any): { success: boolean; errors?: any } {
	let errors: any = {};
	let index = 0;
	//validate each file and pust the error to the errors object
	files.forEach(([key, value]) => {
		if (value.size == 0) {
			if (index == 0) {
				return;
			}
			errors[key] = 'Filen må ikke være tom';
		}
		if (value.size > 1_000_000_000) {
			errors[key] = 'Filen er for stor. Max 1gb tilladt.';
		}
	});
	if (Object.keys(errors).length > 0) return { errors: errors, success: false };
	return { success: true };
}
export function validateCustomArray(array: any): { success: boolean; errors?: any } {
	let errors: any = {};
	if (array.length > 5000) {
		errors['array'] = 'Der er for mange tekst i dette felt.';
	}

	for (let [key, value] of array) {
		if (value == '') {
			errors[key] = 'Dette felt skal udfyldes';
		}
	}
	if (Object.keys(errors).length > 0) return { errors: errors, success: false };
	return { success: true };
}
export function formatCommentTimePosted(date: string | Date): string {
	if (!(typeof date === 'string' || date instanceof Date)) {
		return '';
	}

	const dateObj = typeof date === 'string' ? new Date(date) : date;
	const timeElapsed = Date.now() - dateObj.getTime();

	if (timeElapsed < 60000) {
		// less than 1 minute
		return Math.floor(timeElapsed / 1000) + 's';
	} else if (timeElapsed < 3600000) {
		// less than 1 hour
		return Math.floor(timeElapsed / 60000) + 'min';
	} else if (timeElapsed < 86400000) {
		// less than 1 day
		return Math.floor(timeElapsed / 3600000) + 't';
	} else if (timeElapsed < 604800000) {
		// less than 1 week
		return Math.floor(timeElapsed / 86400000) + 'd';
	} else if (timeElapsed < 2419200000) {
		// less than 1 month
		return Math.floor(timeElapsed / 604800000) + 'uger';
	} else if (timeElapsed < 29030400000) {
		// less than 1 year
		return Math.floor(timeElapsed / 2419200000) + 'mdr';
	} else {
		// more than 1 year
		return Math.floor(timeElapsed / 29030400000) + 'år';
	}
}
export function sortComments(comments: ProjectComment[]): ProjectComment[] {
	console.log('🚀 ~ sortComments ~ comments:', comments);
	// Sort all comments by their creation date in descending order
	comments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

	const result: ProjectComment[] = [];
	const commentMap = new Map<number, ProjectComment[]>();

	// Organize comments into a map where each key is a comment's answer_comment_id and the value is an array of its replies
	comments.forEach((comment) => {
		const parentId = comment.answer_comment_id as number;
		if (!commentMap.has(parentId)) {
			commentMap.set(parentId, []);
		}
		const parentComments = commentMap.get(parentId);
		if (parentComments) {
			parentComments.push(comment);
		}
	});

	// Recursive function to add comments to the result list
	const addCommentsRecursively = (parentId: number | null) => {
		const childComments = commentMap.get(parentId!) || [];
		childComments.sort(
			(a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
		); // Sort replies by creation time
		childComments.forEach((child) => {
			result.push(child);
			addCommentsRecursively(child.id); // Recursively add replies to this comment
		});
	};

	// Start with root comments (those without an answer_comment_id)
	addCommentsRecursively(null);

	return result;
}
export function messageShortener(message: string, maxLength: number): string {
	if (message.length <= maxLength) return message;
	return message.slice(0, maxLength) + '...';
}
