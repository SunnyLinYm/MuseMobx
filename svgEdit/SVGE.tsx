
import React, { useState, useRef } from 'react';
import { observer } from 'mobx-react';
import { types, Instance, getParent, destroy, getSnapshot, applySnapshot } from 'mobx-state-tree';

// 基础图形模型
const ShapeModel = types.model('Shape', {
	id: types.identifier,
	type: types.enumeration(['circle', 'rect', 'text', 'group']),
	x: types.number,
	y: types.number,
	width: types.optional(types.number, 100),
	height: types.optional(types.number, 100),
	radius: types.optional(types.number, 50),
	fill: types.optional(types.string, '#ccc'),
	stroke: types.optional(types.string, '#000'),
	text: types.optional(types.string, 'Text'),
	parentId: types.maybe(types.string),
	children: types.optional(types.array(types.late(() => ShapeModel)), [])
}).actions(self => ({
	move(dx: number, dy: number) {
		self.x += dx;
		self.y += dy;
		// 移动子元素保持相对位置
		if (self.type === 'group') {
			self.children.forEach(child => child.move(dx, dy));
		}
	},
	setPosition(x: number, y: number) {
		const dx = x - self.x;
		const dy = y - self.y;
		this.move(dx, dy);
	},
	addChild(child: Instance<typeof ShapeModel>) {
		child.parentId = self.id;
		// 转换为相对坐标
		child.x -= self.x;
		child.y -= self.y;
		self.children.push(child);
	},
	removeChild(childId: string) {
		const child = self.children.find(c => c.id === childId);
		if (child) {
			// 转换回绝对坐标
			child.x += self.x;
			child.y += self.y;
			child.parentId = undefined;
			destroy(child);
		}
	}
}));

const HistoryItem = types.model('History', {
	snapshot: types.frozen(),
	description: types.string
});
// 编辑器状态模型
const EditorModel = types.model('Editor', {
	dragX: types.number,
	dragY: types.number,
	shapes: types.array(ShapeModel),
	selectedId: types.maybe(types.string),
	hoveredId: types.maybe(types.string),
	draggingId: types.maybe(types.string),
	dropTargetId: types.maybe(types.string),
	history: types.array(HistoryItem),
	future: types.array(HistoryItem),
	maxHistory: 50
}).actions(self => ({
	addShape(shape: Instance<typeof ShapeModel>) {
		self.shapes.push(shape);
	},
	setDragXY(x: number, y: number) {
		self.dragX = x;
		self.dragY = y;
	},
	selectShape(id: string) {
		self.selectedId = id;
	},
	setHovered(id?: string) {
		self.hoveredId = id;
	},
	startDrag(id: string) {
		self.draggingId = id;
	},
	endDrag() {
		self.draggingId = undefined;
	},
	setDropTarget(id?: string) {
		self.dropTargetId = id;
	},
	moveToContainer(shapeId: string, containerId?: string) {
		const shape = self.shapes.find(s => s.id === shapeId);
		const container = containerId ? self.shapes.find(s => s.id === containerId) : undefined;

		// 从原容器移除
		if (shape?.parentId) {
			const oldContainer = self.shapes.find(s => s.id === shape.parentId);
			oldContainer?.removeChild(shapeId);
		}

		// 添加到新容器或根层
		if (container) {
			container.addChild(shape!);
		} else if (shape) {
			self.shapes.push(shape);
		}
	},
	recordHistory(description: string) {
		if (self.history.length >= self.maxHistory) {
			self.history.shift();
		}
		self.history.push({
			snapshot: getSnapshot(self.shapes),
			description
		});
		self.future.clear();
	},
	undo() {
		if (self.history.length > 0) {
			const lastState = self.history.pop()!;
			self.future.push({
				snapshot: getSnapshot(self.shapes),
				description: "Undo state"
			});
			applySnapshot(self.shapes, lastState.snapshot);
		}
	},
	redo() {
		if (self.future.length > 0) {
			const nextState = self.future.pop()!;
			self.history.push({
				snapshot: getSnapshot(self.shapes),
				description: "Redo state"
			});
			applySnapshot(self.shapes, nextState.snapshot);
		}
	}
}));

// 创建编辑器实例
const editor = EditorModel.create({dragX:0,dragY:0, shapes: [] });

// 形状渲染组件
const ShapeView = observer(({
	shape,
	parentX = 0,
	parentY = 0
}: {
	shape: Instance<typeof ShapeModel>;
	parentX?: number;
	parentY?: number;
}) => {
	const isSelected = editor.selectedId === shape.id;
	const isHovered = editor.hoveredId === shape.id;
	const isDropTarget = editor.dropTargetId === shape.id;
	const absoluteX = parentX + shape.x;
	const absoluteY = parentY + shape.y;

	const commonProps = {
		x: absoluteX,
		y: absoluteY,
		fill: shape.fill,
		stroke: isSelected ? '#f00' : isHovered ? '#00f' : shape.stroke,
		strokeWidth: isSelected ? 2 : isHovered ? 1 : 0,
		strokeDasharray: isHovered && !isSelected ? '5,5' : undefined,
		onMouseEnter: () => editor.setHovered(shape.id),
		onMouseLeave: () => editor.setHovered(undefined),
		onClick: (e: React.MouseEvent) => {
			e.stopPropagation();
			console.log(shape.id)
			editor.selectShape(shape.id);
		},
		onMouseDown: (e: React.MouseEvent) => {
			e.stopPropagation();
			editor.selectShape(shape.id);
			console.log(shape.id)
			editor.startDrag(shape.id);
			editor.setDragXY(e.clientX, e.clientY);
		},
		onMouseMove: (e: React.MouseEvent) => {
			let elexy = document.getElementById("elexy");
			console.log("elexy")
			if (elexy)
				elexy.textContent = ` ${absoluteX}:${absoluteY}`;
		}
	};

	const renderShape = () => {
		switch (shape.type) {
			case 'circle':
				return <circle {...commonProps} cx={absoluteX} cy={absoluteY} r={shape.radius} />;
			case 'rect':
				return <rect {...commonProps} width={shape.width} height={shape.height} />;
			case 'text':
				return <text {...commonProps} fontSize={16}>{shape.text}</text>;
			case 'group':
				return (
					<g {...commonProps}>
						<rect
							x={absoluteX}
							y={absoluteY}
							width={shape.width}
							height={shape.height}
							fill={isDropTarget ? '#ddd' : shape.fill}
							opacity={0.3}
							onDragOver={(e) => {
								e.preventDefault();
								editor.setDropTarget(shape.id);
							}}
							onDragLeave={() => editor.setDropTarget(undefined)}
							onDrop={(e) => {
								e.preventDefault();
								if (editor.draggingId) {
									editor.moveToContainer(editor.draggingId, shape.id);
								}
								editor.setDropTarget(undefined);
							}}
						/>
						{shape.children.map(child => (
							<ShapeView
								key={child.id}
								shape={child}
								parentX={absoluteX}
								parentY={absoluteY}
							/>
						))}
					</g>
				);
			default:
				return null;
		}
	};

	return renderShape();
});

// 主编辑器组件
const SVGEditor = observer(() => {
	const [tool, setTool] = useState<'circle' | 'rect' | 'text' | 'group'>('rect');
	const svgRef = useRef<SVGSVGElement>(null);


	const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
		if (editor.draggingId) return;
		console.log(e);

		const svg = svgRef.current;
		if (!svg) return;

		const pt = svg.createSVGPoint();
		pt.x = e.clientX;
		pt.y = e.clientY;
		const { x, y } = pt.matrixTransform(svg.getScreenCTM()?.inverse());

		const newShape = ShapeModel.create({
			id: Date.now().toString(),
			type: tool,
			x, y,
			text: 'New Text',
			...(tool === 'group' && {
				width: 200,
				height: 200,
				fill: '#aaf'
			})
		});
		editor.addShape(newShape);
		editor.selectShape(newShape.id);
	};


	const handleMouseDown = (e: React.MouseEvent) => {
		if (!editor.selectedId) return;
		console.log("app_" + editor.selectedId);
		//setIsDragging(true);
		console.log(`spt:${e.clientX},${e.clientY}`)
	};


	const handleMouseMove = (e: React.MouseEvent) => {
		let svgxy = document.getElementById("svgxy");
		if (svgxy)
			svgxy.textContent = ` ${e.clientX}:${e.clientY}`;
		if (!editor.draggingId) return;
		console.log(editor.draggingId)
		const svg = svgRef.current;
		if (!svg) return;

		const pt = svg.createSVGPoint();// 建立一個 SVG 座標，初始值為（0,0）
		let CTM = svg.getScreenCTM(); //  取的該元素的 CTM
		/*
		 ** client (viewport 座標系統) * CTM^(-1) ---> svgPoint(SVG 座標系統)
		 */
		// 把 SVG 的座標點給進去
		pt.x = e.clientX;
		pt.y = e.clientY;
		let x, y;
		if (CTM)
			({ x, y } = pt.matrixTransform(CTM.inverse()));

		console.log(`handMove pt:${pt.x},${pt.y} CTM:${x},${y} `)

		if (svgxy)
			svgxy.textContent = ` ${e.clientX}:${e.clientY} + CTM_${x}:${y}  `;
		const shape = editor.shapes.find(s => s.id === editor.draggingId);
		if (shape) {
			const dx = e.clientX - editor.dragX;
			const dy = e.clientY - editor.dragY;
			//shape.x += dx;
			//shape.y += dy;
			shape.setPosition(shape.x + dx, shape.y + dy);
			//shape.move(dx, dy);

			editor.setDragXY(e.clientX, e.clientY);
			//shape.setPosition(dx, dy);
			//setStartPos({ x: e.clientX, y: e.clientY });
			//setStartPos({ x: startPos.x, y: startPos.y });
		}
	};

	const handleMouseUp = () => {
		editor.endDrag();
	};

	return (
		<div>
			<div style={{ marginBottom: 10 }}>
				<button onClick={() => setTool('circle')}>圓　123</button>
				<button onClick={() => setTool('rect')}>矩形</button>
				<button onClick={() => setTool('text')}>文字</button>
				<button onClick={() => setTool('group')}>容器</button>
			</div>

			<svg
				ref={svgRef}
				width={800}
				height={600}
				onClick={handleCanvasClick}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseUp}
				style={{ border: '1px solid #000', background: '#f9f9f9' }}
			>
				{editor.shapes.map(shape => (
					<ShapeView key={shape.id} shape={shape} />
				))}
			</svg>
		</div>
	);
});

export default SVGEditor;


