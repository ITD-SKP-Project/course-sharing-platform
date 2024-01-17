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
