import React, { useState, useRef, useEffect, useCallback } from "react";
import "../styles/FolderUI.css";
import useWindowDimensions from "./Util";

interface FolderData {
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

interface DragRef {
	startY: number;
	folderStartY: number;
}

const FOLDER_TAB_WIDTH = 200;
const FOLDER_TAB_SPACING = 50;
const FOLDER_SPACING = 30;
const LEFT_MARGIN = 10;
const TOP_MARGIN = 0;

const EditableUsername: React.FC<{
	username: string;
	onUsernameChange: (newUsername: string) => void;
}> = ({ username, onUsernameChange }) => {
	const [displayUsername, setDisplayUsername] = useState(username);
	const spanRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		setDisplayUsername(username);
	}, [username]);

	const handleInput = (event: React.FormEvent<HTMLSpanElement>) => {
		event.preventDefault();
		const selection = window.getSelection();
		const range = selection?.getRangeAt(0);
		const offset = range?.startOffset || 0;

		const newUsername = event.currentTarget.textContent || "";
		setDisplayUsername(newUsername);

		requestAnimationFrame(() => {
			if (spanRef.current) {
				const newRange = document.createRange();
				const textNode = spanRef.current.firstChild || spanRef.current;
				const newOffset = Math.min(offset, newUsername.length);
				newRange.setStart(textNode, newOffset);
				newRange.setEnd(textNode, newOffset);
				selection?.removeAllRanges();
				selection?.addRange(newRange);
			}
		});
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
		if (event.key === "Enter") {
			event.preventDefault();
			spanRef.current?.blur();
			onUsernameChange(displayUsername);
		}
	};

	const handleBlur = () => {
		setDisplayUsername(username);
	};

	return (
		<span
			ref={spanRef}
			contentEditable
			suppressContentEditableWarning
			onInput={handleInput}
			onKeyDown={handleKeyDown}
			onBlur={handleBlur}
			style={{
				fontStyle: "italic",
				outline: "none",
				borderBottom: "1px dashed #999",
				padding: "0 2px",
				minWidth: "1em",
				display: "inline-block",
			}}
		>
			{displayUsername}
		</span>
	);
};

const FolderUI: React.FC = () => {
	const { height, width } = useWindowDimensions();

	const generateYPosition = (index: number): number =>
		TOP_MARGIN + index * FOLDER_SPACING;

	const [folders, setFolders] = useState<FolderData[]>([]);
	const [username, setUsername] = useState<string>("ml5885");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(false);

	const [draggingFolder, setDraggingFolder] = useState<number | null>(null);
	const dragRef = useRef<DragRef | null>(null);

	useEffect(() => {
		const fetchRepos = async () => {
			setLoading(true);
			setError(null);
			try {
				const response = await fetch(
					`https://api.github.com/users/${username}/repos?type=all`,
					{
						headers: {
							Authorization: "",
						},
					}
				);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const data = await response.json();
				const loadedFolders: FolderData[] = data.map(
					(repo: any, index: number) => ({
						id: index,
						number: index,
						name: repo.name,
						yPosition: generateYPosition(index),
						initialYPosition: generateYPosition(index),
						content: {
							link: repo.svn_url,
							text: repo.description,
						},
					})
				);
				setFolders(loadedFolders);
			} catch (error) {
				console.error("Error fetching repositories:", error);
				setError(error instanceof Error ? error.message : String(error));
				setFolders([]);
			} finally {
				setLoading(false);
			}
		};

		fetchRepos();
	}, [username]);

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

	const handleUsernameChange = (newUsername: string) => {
		setUsername(newUsername);
		setFolders([]);
	};

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
		<div>
			<div>
				<h1>
					<EditableUsername
						username={username}
						onUsernameChange={handleUsernameChange}
					/>
					's GitHub Projects
				</h1>
			</div>
			{error && (
				<div style={{ color: "red", marginBottom: "1rem" }}>Error: {error}</div>
			)}
			{loading && <div style={{ marginBottom: "1rem" }}>Loading...</div>}
			<div className="FilingCabinet">
				{folders.map((folder, index) => (
					<div
						key={folder.id}
						className="FolderContainer"
						style={{ top: `${folder.yPosition}px` }}
					>
						<div
							className={`FolderTab noselect ${
								draggingFolder === folder.id ||
								folder.initialYPosition !== folder.yPosition
									? "is-dragging"
									: ""
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
								draggingFolder === folder.id ||
								folder.initialYPosition !== folder.yPosition
									? "is-dragging"
									: ""
							}`}
							style={{
								zIndex: folder.id,
							}}
						>
							{folder.initialYPosition !== folder.yPosition &&
								folder.content && (
									<div className="FolderContent noselect">
										<p>
											<a
												href={folder.content.link}
												target="_blank"
												rel="noreferrer"
											>
												Github Repository Link
											</a>
										</p>
										{folder.content.text ? <p>{folder.content.text}</p> : <></>}
										{folder.content.image ? (
											<img
												src={folder.content.image}
												alt={`Content for ${folder.name}`}
											/>
										) : (
											<></>
										)}
									</div>
								)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default FolderUI;
