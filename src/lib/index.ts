import { writable, type Writable } from 'svelte/store';
import type { User } from './types';
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
	if (!data || typeof data != 'object') return [];

	//return keys where value includes keyword
	let result: string[] = [];
	for (const [key, value] of Object.entries(data)) {
		if (key.includes(keyword)) {
			result.push(value);
		}
	}
	return result;
}
