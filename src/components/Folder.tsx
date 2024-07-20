import React from "react";
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
		return (
			<div
				className="FolderContainer"
				style={{
					top: `${folder.yPosition}px`,
					animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`,
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
							<p>
								<a href={folder.content.link} target="_blank" rel="noreferrer">
									Github Repository Link
								</a>
							</p>
							{folder.content.text && <p>{folder.content.text}</p>}
							{folder.content.image && (
								<img
									src={folder.content.image}
									alt={`Content for ${folder.name}`}
								/>
							)}
						</div>
					)}
				</div>
			</div>
		);
	}
);

export default Folder;
