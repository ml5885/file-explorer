import React, { useState, useRef, useEffect, useCallback } from "react";
import "../styles/FolderUI.css";
import useWindowDimensions from "./Util";

interface FolderData {
	id: number;
	number: string;
	name: string;
	content?: string;
	yPosition: number;
	initialYPosition?: number;
}

const FOLDER_TAB_WIDTH: number = 200;
const FOLDER_TAB_SPACING: number = 50;
const FOLDER_SPACING: number = 25;

const FolderUI: React.FC = () => {
	const { height, width } = useWindowDimensions();

	const initialFolders: Omit<FolderData, "yPosition">[] = [
		{ id: 1, number: "124", name: "sir" },
		{ id: 2, number: "123", name: "simpsons" },
		{ id: 3, number: "122", name: "slides" },
		{ id: 4, number: "121", name: "sims" },
		{ id: 5, number: "120", name: "seller" },
		{ id: 6, number: "119", name: "sun" },
		{ id: 7, number: "118", name: "stack" },
		{ id: 8, number: "117", name: "spiderman" },
		{ id: 9, number: "116", name: "spices" },
		{ id: 10, number: "115", name: "spirit" },
		{ id: 11, number: "114", name: "space" },
		{ id: 12, number: "113", name: "snakes" },
		{ id: 13, number: "112", name: "snow" },
		{ id: 14, number: "111", name: "sleep" },
		{ id: 15, number: "110", name: "sky" },
		{ id: 16, number: "109", name: "smile" },
		{ id: 17, number: "108", name: "sofa" },
		{ id: 18, number: "107", name: "socks" },
		{ id: 19, number: "106", name: "songs" },
		{ id: 20, number: "105", name: "south" },
		{ id: 21, number: "104", name: "social" },
		{ id: 22, number: "103", name: "software" },
		{ id: 23, number: "102", name: "solids" },
		{ id: 24, number: "101", name: "solar" },
		{ id: 25, number: "100", name: "sony" },
		{ id: 26, number: "99", name: "song" },
		{ id: 27, number: "98", name: "sort" },
		{ id: 28, number: "97", name: "sour" },
		{ id: 29, number: "96", name: "sound" },
		{ id: 30, number: "95", name: "soon" },
	];

	const generateYPosition = (index: number): number =>
		20 + index * FOLDER_SPACING;

	const [folders, setFolders] = useState<FolderData[]>(
		initialFolders.map((folder, index) => ({
			...folder,
			yPosition: generateYPosition(index),
			initialYPosition: generateYPosition(index),
		}))
	);

	const [draggingFolder, setDraggingFolder] = useState<number | null>(null);
	const dragRef = useRef<{ startY: number; folderStartY: number } | null>(null);

	const handleMouseDown = (e: React.MouseEvent, folderId: number) => {
		setDraggingFolder(folderId);
		const folder = folders.find((f) => f.id === folderId);
		if (folder) {
			dragRef.current = {
				startY: e.clientY,
				folderStartY: folder.yPosition,
			};
		}
	};

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (draggingFolder && dragRef.current) {
				const deltaY = e.clientY - dragRef.current.startY;
				const folder = folders.find((f) => f.id === draggingFolder);
				if (folder && folder.initialYPosition !== undefined) {
					const maxUpwardMovement = 500;
					const newPosition = Math.max(
						-100,
						Math.max(
							folder.initialYPosition - maxUpwardMovement,
							Math.min(
								folder.initialYPosition,
								dragRef.current.folderStartY + deltaY
							)
						)
					);

					setFolders((prevFolders) =>
						prevFolders.map((f) =>
							f.id === draggingFolder ? { ...f, yPosition: newPosition } : f
						)
					);
				}
			}
		},
		[draggingFolder, folders]
	);

	const handleMouseUp = useCallback(() => {
		setDraggingFolder(null);
		dragRef.current = null;
	}, []);

	useEffect(() => {
		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [handleMouseMove, handleMouseUp]);

	return (
		<div className="FilingCabinet">
			{folders.map((folder) => (
				<React.Fragment key={folder.id}>
					<div
						className="FolderContainer"
						onMouseDown={(e) => handleMouseDown(e, folder.id)}
						style={{ top: `${folder.yPosition}px` }}
					>
						<div
							className={`FolderTab noselect ${
								draggingFolder === folder.id ? "is-dragging" : ""
							}`}
							style={{
								top: `-40px`,
								left: `calc(${
									(folder.id * (FOLDER_TAB_WIDTH + FOLDER_TAB_SPACING)) %
									(width / 1.75)
								}px)`,
								zIndex: folder.id + 1,
								width: FOLDER_TAB_WIDTH,
							}}
						>
							<span className="FolderNumber">{folder.number}</span>
							{folder.name}
						</div>
						<div
							className={`Folder ${
								draggingFolder === folder.id ? "is-dragging" : ""
							}`}
							style={{
								top: `${folder.yPosition}px`,
								zIndex: folder.id,
							}}
						></div>
					</div>
				</React.Fragment>
			))}
		</div>
	);
};

export default FolderUI;
