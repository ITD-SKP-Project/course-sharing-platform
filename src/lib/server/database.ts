import {
	SOP_POSTGRES_DATABASE,
	SOP_POSTGRES_PASSWORD,
	SOP_POSTGRES_HOST,
	SOP_POSTGRES_USER
} from '$env/static/private';
import pkg from 'pg';
const { Pool } = pkg;
export const pool = new Pool({
	user: SOP_POSTGRES_USER,
	host: SOP_POSTGRES_HOST,
	database: SOP_POSTGRES_DATABASE,
	password: SOP_POSTGRES_PASSWORD
});
