import React from "react";
import "./App.css";
import FolderUI from "./components/FolderUI";

const App: React.FC = () => {
	return (
		<div className="App">
			<FolderUI />
			{/* full credit for this idea goes to https://x.com/samdape/status/1777986265993875950 */}
			<div className="credit">
				<p>
					<a
						href="https://x.com/samdape/status/1777986265993875950"
						target="_blank"
						rel="noopener noreferrer"
					>
						Inspired by @samdape
					</a>
				</p>
			</div>
		</div>
	);
};

export default App;
