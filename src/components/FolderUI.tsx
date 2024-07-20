import React, {
	useState,
	useRef,
	useEffect,
	useCallback,
	useMemo,
} from "react";
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

const Folder: React.FC<{
	folder: FolderData;
	tabsPerRow: number;
	index: number;
	isDragging: boolean;
	onMouseDown: (e: React.MouseEvent) => void;
	onTouchStart: (e: React.TouchEvent) => void;
}> = React.memo(
	({ folder, tabsPerRow, index, isDragging, onMouseDown, onTouchStart }) => {
		return (
			<div className="FolderContainer" style={{ top: `${folder.yPosition}px` }}>
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

const FolderUI: React.FC = () => {
	const { width } = useWindowDimensions();
	const [folders, setFolders] = useState<FolderData[]>([]);
	const [username, setUsername] = useState<string>("ml5885");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [draggingFolder, setDraggingFolder] = useState<number | null>(null);
	const dragRef = useRef<DragRef | null>(null);

	const tabsPerRow = useMemo(() => {
		if (width <= 690) return 1;
		if (width <= 1024) return 2;
		if (width <= 1400) return 3;
		if (width <= 1700) return 4;
		return 5;
	}, [width]);

	const fetchRepos = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch(
				`https://api.github.com/users/${username}/repos?type=all`,
				{ headers: { Authorization: "" } }
			);
			if (!response.ok)
				throw new Error(`HTTP error! status: ${response.status}`);
			const data = await response.json();
			setFolders(
				data.map((repo: any, index: number) => ({
					id: index,
					number: index,
					name: repo.name,
					yPosition: TOP_MARGIN + index * FOLDER_SPACING,
					initialYPosition: TOP_MARGIN + index * FOLDER_SPACING,
					content: {
						link: repo.svn_url,
						text: repo.description,
					},
				}))
			);
		} catch (error) {
			console.error("Error fetching repositories:", error);
			setError(error instanceof Error ? error.message : String(error));
			setFolders([]);
		} finally {
			setLoading(false);
		}
	}, [username]);

	useEffect(() => {
		fetchRepos();
	}, [fetchRepos]);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent, folderId: number) => {
			setDraggingFolder(folderId);
			const folder = folders.find((f) => f.id === folderId);
			if (folder) {
				dragRef.current = {
					startY: e.clientY,
					folderStartY: folder.yPosition,
				};
			}
		},
		[folders]
	);

	const handleTouchStart = useCallback(
		(e: React.TouchEvent, folderId: number) => {
			e.preventDefault();
			setDraggingFolder(folderId);
			const folder = folders.find((f) => f.id === folderId);
			if (folder) {
				dragRef.current = {
					startY: e.touches[0].clientY,
					folderStartY: folder.yPosition,
				};
			}
		},
		[folders]
	);

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
				e.preventDefault();
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

	const handleUsernameChange = useCallback((newUsername: string) => {
		setUsername(newUsername);
		setFolders([]);
		setError(null);
	}, []);

	return (
		<div>
			<h1>
				<EditableUsername
					username={username}
					onUsernameChange={handleUsernameChange}
				/>
				's GitHub Projects
			</h1>
			{error && (
				<div style={{ color: "red", marginBottom: "1rem" }}>Error: {error}</div>
			)}
			{loading && <div style={{ marginBottom: "1rem" }}>Loading...</div>}
			<div className="FilingCabinet">
				{folders.map((folder, index) => (
					<Folder
						key={folder.id}
						folder={folder}
						tabsPerRow={tabsPerRow}
						index={index}
						isDragging={
							draggingFolder === folder.id ||
							folder.initialYPosition !== folder.yPosition
						}
						onMouseDown={(e) => handleMouseDown(e, folder.id)}
						onTouchStart={(e) => handleTouchStart(e, folder.id)}
					/>
				))}
			</div>
		</div>
	);
};

export default FolderUI;
