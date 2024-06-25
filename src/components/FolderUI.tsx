import React, { useState, useRef, useEffect, useCallback } from "react";
import "../styles/FolderUI.css";
import useWindowDimensions from "./Util";
import folderData from "../data/folderData.json";

interface FolderDataJson {
	id: number;
	number: string;
	name: string;
}

interface FolderData extends FolderDataJson {
	yPosition: number;
	initialYPosition: number;
}

interface DragRef {
	startY: number;
	folderStartY: number;
}

const FOLDER_TAB_WIDTH = 200;
const FOLDER_TAB_SPACING = 50;
const FOLDER_SPACING = 25;
const LEFT_MARGIN = 10;

const FolderUI: React.FC = () => {
	const { height, width } = useWindowDimensions();

	const generateYPosition = (index: number): number =>
		20 + index * FOLDER_SPACING;

	const [folders, setFolders] = useState<FolderData[]>([]);
	const [draggingFolder, setDraggingFolder] = useState<number | null>(null);
	const dragRef = useRef<DragRef | null>(null);

	useEffect(() => {
		const loadedFolders: FolderData[] = folderData.map(
			(folder: FolderDataJson, index: number) => ({
				...folder,
				yPosition: generateYPosition(index),
				initialYPosition: generateYPosition(index),
			})
		);
		setFolders(loadedFolders);
	}, []);

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

	const handleTouchStart = (e: React.TouchEvent, folderId: number) => {
		setDraggingFolder(folderId);
		const folder = folders.find((f) => f.id === folderId);
		if (folder) {
			dragRef.current = {
				startY: e.touches[0].clientY,
				folderStartY: folder.yPosition,
			};
		}
	};

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (draggingFolder !== null && dragRef.current) {
				const deltaY = e.clientY - dragRef.current.startY;
				const folder = folders.find((f) => f.id === draggingFolder);
				if (folder) {
					const maxUpwardMovement = 500;
					const newPosition = Math.max(
						-50,
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

	const handleTouchMove = useCallback(
		(e: TouchEvent) => {
			if (draggingFolder !== null && dragRef.current) {
				const deltaY = e.touches[0].clientY - dragRef.current.startY;
				const folder = folders.find((f) => f.id === draggingFolder);
				if (folder) {
					const maxUpwardMovement = 500;
					const newPosition = Math.max(
						-50,
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

	const handleTouchEnd = useCallback(() => {
		setDraggingFolder(null);
		dragRef.current = null;
	}, []);
	useEffect(() => {
		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);
		window.addEventListener("touchmove", handleTouchMove as EventListener);
		window.addEventListener("touchend", handleTouchEnd);

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
			window.removeEventListener("touchmove", handleTouchMove as EventListener);
			window.removeEventListener("touchend", handleTouchEnd);
		};
	}, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

	let tabsPerRow = 5;

	if (width <= 690) {
		tabsPerRow = 1;
	} else if (width <= 1024) {
		tabsPerRow = 2;
	} else if (width <= 1400) {
		tabsPerRow = 3;
	} else if (width <= 1700) {
		tabsPerRow = 4;
	}

	return (
		<div className="FilingCabinet">
			{folders.map((folder, index) => (
				<div
					key={folder.id}
					className="FolderContainer"
					style={{ top: `${folder.yPosition}px` }}
				>
					<div
						className={`FolderTab noselect ${
							draggingFolder === folder.id ? "is-dragging" : ""
						}`}
						style={{
							left: `${
								LEFT_MARGIN +
								(index % tabsPerRow) * (FOLDER_TAB_WIDTH + FOLDER_TAB_SPACING)
							}px`,
							zIndex: folder.id + 1,
							width: FOLDER_TAB_WIDTH,
						}}
						onMouseDown={(e) => handleMouseDown(e, folder.id)}
						onTouchStart={(e) => handleTouchStart(e, folder.id)}
					>
						<span className="FolderNumber">{folder.number}</span>
						{folder.name}
					</div>
					<div
						className={`Folder ${
							draggingFolder === folder.id ? "is-dragging" : ""
						}`}
						style={{
							zIndex: folder.id,
						}}
					></div>
				</div>
			))}
		</div>
	);
};

export default FolderUI;
