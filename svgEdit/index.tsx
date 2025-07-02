import React from 'react';
import {render } from 'react-dom';
import SVGEditor from './SVGE';
//import { EditorStoreModel } from './EditorStore';
//import { ToolBar } from './ToolBar';
//import { SVGEditor } from './SVGEditor';
//import { useKeyboardShortcuts } from './useKeyboardShortcuts';

//export const App = () => {
//	const store = EditorStoreModel.create({
//		elements: [],
//		mode: 'select',
//		undoStack: [],
//		redoStack: [],
//		currentState: {}
//	});

//	useKeyboardShortcuts(store);

//	return (
//		<div style={{ maxWidth: '800px', margin: '0 auto' }}>
//			<h1>SVG Editor</h1>
//			<ToolBar store={store} />
//			<SVGEditor store={store} />
//		</div>
//	);
//};

const App = () => <SVGEditor ></SVGEditor>

// 暴露全局访问接口
if (typeof window !== 'undefined') {
	window.MyApp = { App };
}

let Compure = () =>
	<div>Hi 123</div>

render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById('root')
);
