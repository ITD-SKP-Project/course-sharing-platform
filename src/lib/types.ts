export interface User {
	id: number;
	firstname?: string;
	lastname?: string;
	email: string;
	authority_level?: number;
	password: string;
	created_at: string;
	updated_at: string;
	validated: boolean;
	email_verified: boolean;
	last_send_email?: Date;
}
export interface Project extends ProjectCreation {
	id: number;
	created_at: string;
	updated_at: string;
	project_fork_id?: number;
	project_root_id?: number;
	likes: number;
	authors?: ProjectAuthor[];
	professions?: ProjectProfession[];
	live: boolean;
}
export interface ProjectCreation {
	title: string;
	description: string;
	subjects: string;
	resources: string;
}
export interface ProjectAuthor extends ProjectAuthorCreation {
	id: number;
	user?: User;
}
export interface ProjectAuthorCreation {
	project_id: number | null;
	user_id: number;
	authority_level: number;
}
export interface ProjectProfession extends ProjectProfessionCreation {
	id: number;
	profession_name?: string;
}
export interface ProjectProfessionCreation {
	project_id: number | null;
	profession_id: number;
	skill_level: string;
}
export interface Profession {
	id: number;
	name: string;
}
export interface VerificationToken {
	id: number;
	user_id: number;
	token: string;
	type: string;
}
