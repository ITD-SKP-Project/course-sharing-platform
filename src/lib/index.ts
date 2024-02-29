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
export function validateCustomFileArray(files: any): { success: boolean; errors?: any } {
	let errors: any = {};
	//validate each file and pust the error to the errors object
	files.forEach(([key, value]) => {
		if (value.size == 0) {
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
	for (let [key, value] of array) {
		if (value == '') {
			errors[key] = 'Dette felt skal udfyldes';
		}
	}
	if (Object.keys(errors).length > 0) return { errors: errors, success: false };
	return { success: true };
}
