import { writable, type Writable } from 'svelte/store';
import type { ActionData } from '../routes/admin/brugere/$types';
export const editUserFormResponse: Writable<null | ActionData> = writable(null);
