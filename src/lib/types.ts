export interface User {
	id: number;
	firstname: string;
	lastname: string;
	email: string;
	authority_level: number;
	password: string;
	created_at: string;
	updated_at: string;
}
export interface Project {
	id: number;
	title: string;
	description: string;
	created_at: string;
	updated_at: string;
	project_fork_id: number;
	project_root_id: number;
	subjects: string;
	resources: string;
	likes: number;
	authors?: ProjectAuthor[];
	professions?: ProjectProfession[];
}
export interface ProjectAuthor {
	id: number;
	project_id: number;
	user_id: number;
	authority_level: number;
	user?: User;
}
export interface ProjectProfession {
	id: number;
	project_id: number;
	profession_id: number;
	skill_level: number;
	profession_name?: string;
}
export interface Profession {
	id: number;
	name: string;
}

//vercel posqgressql types
interface Field {
	name: string;
	tableID: number;
	columnID: number;
	dataTypeID: number;
	dataTypeSize: number;
	dataTypeModifier: number;
	format: string;
}

interface Types {
	arrayParser: object;
	builtins: {
		[key: string]: number;
	};
}

export interface DatabaseResponse<T> {
	command: string;
	rowCount: number;
	oid: number;
	rows: T[];
	fields: Field[];
	_parsers: (null | ParserFunction)[];
	_types: {
		_types: Types;
		text: object;
		binary: object;
	};
	RowCtor: null | ConstructorFunction;
	rowAsArray: boolean;
}

// Assuming ParserFunction and ConstructorFunction are defined elsewhere in your codebase
type ParserFunction = (...args: any[]) => any;
type ConstructorFunction = new (...args: any[]) => any;
