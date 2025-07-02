import React from 'react'
import { render } from 'react-dom';
import { Toolbar } from './toolbar'
import { SvgCanvas } from './SvgCanvas'

const App = () => (
	<div>
	 Hi 你好
		<Toolbar />
		< SvgCanvas />
	</div>
)

export class ss {
	x;
	y;
	z;
	hi() {
		console.log(hi);
	}
}

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
