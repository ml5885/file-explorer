export interface RepoContent {
	name: string;
	description: string;
	html_url: string;
	created_at: string;
	updated_at: string;
	language: string;
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
