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
