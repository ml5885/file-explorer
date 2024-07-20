import React, {
	useState,
	useRef,
	useEffect,
	useCallback,
	useMemo,
} from "react";
import "../styles/FolderUI.css";
import useWindowDimensions from "./Util";
import EditableUsername from "./EditableUsername";
import Folder from "./Folder";
import { FolderData, RepoContent, UserInfo as UserInfoType } from "./types";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const FOLDER_SPACING = 30;
const TOP_MARGIN = 0;

const FolderUI: React.FC = () => {
	const { width, height } = useWindowDimensions();
	const [folders, setFolders] = useState<FolderData[]>([]);
	const [username, setUsername] = useState<string>("ml5885");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [draggingFolder, setDraggingFolder] = useState<number | null>(null);
	const [userInfo, setUserInfo] = useState<UserInfoType | null>(null);
	const dragRef = useRef<{ startY: number; folderStartY: number } | null>(null);

	const tabsPerRow = useMemo(() => {
		if (width <= 690) return 1;
		if (width <= 1024) return 2;
		if (width <= 1400) return 3;
		if (width <= 1700) return 4;
		return 5;
	}, [width]);

	const fetchRepos = useCallback(async () => {
		try {
			setLoading(true);
			setError("");

			const userResponse = await fetch(
				`https://api.github.com/users/${username}`
			);
			if (!userResponse.ok)
				throw new Error(`User fetch error! status: ${userResponse.status}`);
			const userData = await userResponse.json();
			setUserInfo(userData);

			const repoResponse = await fetch(
				`https://api.github.com/users/${username}/repos?type=all`,
				{ headers: { Authorization: "" } }
			);
			if (!repoResponse.ok)
				throw new Error(`Repo fetch error! status: ${repoResponse.status}`);
			const reposData = await repoResponse.json();
			setFolders(
				reposData.map((repo: RepoContent, index: number) => ({
					id: index,
					number: `${String(index).padStart(3, "0")}`,
					name: repo.name,
					yPosition: TOP_MARGIN + index * FOLDER_SPACING,
					initialYPosition: TOP_MARGIN + index * FOLDER_SPACING,
					content: {
						name: repo.name,
						description: repo.description || "No description available.",
						html_url: repo.html_url,
						created_at: repo.created_at,
						updated_at: repo.updated_at,
						language: repo.language,
						stargazers_count: repo.stargazers_count,
						forks_count: repo.forks_count,
						open_issues_count: repo.open_issues_count,
						visibility: repo.visibility,
					},
				}))
			);
		} catch (error) {
			console.error("Error fetching data:", error);
			setError(error instanceof Error ? error.message : String(error));
			setFolders([]);
			setUserInfo(null);
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
						-200,
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
		setUserInfo(null);
		setError(null);
	}, []);

	return (
		<div style={{ position: "relative" }}>
			<h1>
				<EditableUsername
					username={username}
					onUsernameChange={handleUsernameChange}
				/>
				's GitHub Repositories
			</h1>
			{userInfo && !loading && (
				<div className="UserInfo">
					<div className="UserInfoCard">
						<img
							src={userInfo.avatar_url}
							alt="Avatar"
							className="UserAvatar"
						/>
						<div className="UserDetails">
							<p>
								<strong>Bio:</strong> {userInfo.bio || "No bio available."}
							</p>
							<p>
								<strong>Public Repos:</strong> {userInfo.public_repos}
							</p>
							<p>
								<strong>Followers:</strong> {userInfo.followers}
							</p>
							<p>
								<strong>Following:</strong> {userInfo.following}
							</p>
						</div>
					</div>
				</div>
			)}
			{error && (
				<div style={{ color: "red", marginBottom: "1rem" }}>Error: {error}</div>
			)}
			{loading ? (
				<div
					style={{
						display: "flex",
						gap: "5px",
						alignItems: "center",
						justifyContent: "center",
						height: "100px",
					}}
				>
					<motion.div
						animate={{ rotate: 360 }}
						transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
					>
						<Loader2 className="h-8 w-8 text-blue-500" />
					</motion.div>
					<span className="ml-2">Loading data...</span>
				</div>
			) : (
				<>
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
				</>
			)}
		</div>
	);
};

export default FolderUI;
