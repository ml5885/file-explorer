export interface FolderData {
	id: number;
	number: string;
	name: string;
	yPosition: number;
	initialYPosition: number;
	content?: {
		link: string;
		image: string;
		text: string;
	};
}
