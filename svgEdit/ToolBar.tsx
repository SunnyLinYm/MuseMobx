import React from 'react'
import { observer } from 'mobx-react';
import './toolbar.css'
import { useEditorStore ,IEditorStore,EditorMode} from './EditorStore';



interface ToolbarProps {
	store: IEditorStore;
}


export const ToolBar: React.FC<ToolbarProps> = observer(() => {
	const store = useEditorStore();
	const tools: { type: EditorMode ,icon:string,label:string}[] = [
		{ type: 'move', icon: '🖱️', label: '移動' },
		{ type: 'modify', icon: 'V', label: '修改' },
		{ type: 'rect', icon: '⬜', label: '矩形' },
		{ type: 'circle', icon: '⭕', label: '圆形' },
		{ type: 'text', icon: '🔤', label: '文字' }
	]
	return (
		<div className="toolbar-container" >
			{
				tools.map(tool => (
					<button
						key={tool.type}
						style={{ fontWeight: store.mode === tool.type ? 'bold' : 'normal' }}
						onClick={() => store.setMode(tool.type)}
					>
						{/*className={`tool-button ${store.drawingMode === tool.type ? 'active' : ''}`}*/}
						<span className="tool-icon" > {tool.icon} </span>
						<span className="tool-label" > {tool.label} </span>
					</button>
				))}

		</div>
	)
}
);