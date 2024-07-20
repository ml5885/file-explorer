import React, { useState, useRef, useEffect } from "react";

interface EditableUsernameProps {
	username: string;
	onUsernameChange: (newUsername: string) => void;
}

const EditableUsername: React.FC<EditableUsernameProps> = ({
	username,
	onUsernameChange,
}) => {
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

export default EditableUsername;
