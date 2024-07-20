import React, { useEffect, useState } from "react";
import { FolderData } from "./types";

const FOLDER_TAB_WIDTH = 200;
const FOLDER_TAB_SPACING = 50;
const LEFT_MARGIN = 10;

interface FolderProps {
	folder: FolderData;
	tabsPerRow: number;
	index: number;
	isDragging: boolean;
	onMouseDown: (e: React.MouseEvent) => void;
	onTouchStart: (e: React.TouchEvent) => void;
}

const Folder: React.FC<FolderProps> = React.memo(
	({ folder, tabsPerRow, index, isDragging, onMouseDown, onTouchStart }) => {
		const [isVisible, setIsVisible] = useState(false);

		useEffect(() => {
			const timer = setTimeout(() => {
				setIsVisible(true);
			}, index * 100);

			return () => {
				clearTimeout(timer);
			};
		}, [index]);

		const formatDate = (dateString: string) => {
			const date = new Date(dateString);
			return date.toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
			});
		};

		return (
			<div
				className={`FolderContainer ${isVisible ? "visible" : ""}`}
				style={{
					top: `${folder.yPosition}px`,
				}}
			>
				<div
					className={`FolderTab noselect ${isDragging ? "is-dragging" : ""}`}
					style={{
						left: `${
							LEFT_MARGIN +
							(index % tabsPerRow) * (FOLDER_TAB_WIDTH + FOLDER_TAB_SPACING)
						}px`,
						zIndex: folder.id + 1,
						width: FOLDER_TAB_WIDTH,
					}}
					onMouseDown={onMouseDown}
					onTouchStart={onTouchStart}
				>
					<span className="FolderNumber">{folder.number}</span>
					{folder.name}
				</div>
				<div
					className={`Folder ${isDragging ? "is-dragging" : ""}`}
					style={{ zIndex: folder.id }}
				>
					{folder.initialYPosition !== folder.yPosition && folder.content && (
						<div className="FolderContent noselect">
							<div className="FolderContentColumn">
								<h2>{folder.content.name}</h2>
								<p className="description">{folder.content.description}</p>
								<p className="url">
									<a
										href={folder.content.html_url}
										target="_blank"
										rel="noreferrer"
									>
										Repository URL
									</a>
								</p>
								<p className="language">
									Language: {folder.content.language || "Not specified"}
								</p>
							</div>
							<div className="FolderContentColumn">
								<p className="date">
									Created: {formatDate(folder.content.created_at)}
								</p>
								<p className="date">
									Updated: {formatDate(folder.content.updated_at)}
								</p>
								<div className="stats">
									<p>Stars: {folder.content.stargazers_count}</p>
									<p>Forks: {folder.content.forks_count}</p>
									<p>Open Issues: {folder.content.open_issues_count}</p>
								</div>
								<p className="visibility">
									Visibility: {folder.content.visibility}
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
		);
	}
);

export default Folder;
