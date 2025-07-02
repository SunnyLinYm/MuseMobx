import React, { useState, useEffect } from "react";
import { render } from "react-dom";
import MuseConfig from "./MuseConfig";
import MuseNotation, { Notation } from "./MuseNotation";
import "./App.css";


export const App = () => {
	const [error, setError] = useState(null);
	const [isLoaded, setIsLoaded]: [boolean, any] = useState(false);
	const [notation, setNotation]: [Notation, any] = useState({} as Notation);
	
	useEffect(() => {
		let url = "./b.json";
		fetch(url)
			.then((res) => res.text())
			.then(
				(result) => {
					try {
						const parsedResult = JSON.parse(result);
						setNotation(new Notation(parsedResult, new MuseConfig()));
						setIsLoaded(true);
					} catch (e) {
						setError(e);
						setIsLoaded(true);
					}
				},
				(error) => {
					setError(error);
					setIsLoaded(true);
				}
			);
	}, []);

	return (
		<div className="app">
			<h1>Example</h1>
			{isLoaded ? (
				error ? (
					"error"
				) : (
					<div>
						{console.log("this.state.notation -->")}
						{console.log(notation)}
						<MuseNotation notation={notation} />
					</div>
				)
			) : (
				"loading..."
			)}
			<button onClick={() => console.log(JSON.stringify({ error, isLoaded, notation }))}>
				log
			</button>
		</div>
	);
};

render(<App />, document.getElementById("muse"))