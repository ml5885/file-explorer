export interface UserInfo {
	login: string;
	id: number;
	avatar_url: string;
	bio: string;
	public_repos: number;
	followers: number;
	following: number;
}

export interface RepoContent {
	name: string;
	description: string | null;
	html_url: string;
	created_at: string;
	updated_at: string;
	language: string | null;
	stargazers_count: number;
	forks_count: number;
	open_issues_count: number;
	visibility: string;
}

export interface FolderData {
	id: number;
	number: string;
	name: string;
	yPosition: number;
	initialYPosition: number;
	content: RepoContent;
}
