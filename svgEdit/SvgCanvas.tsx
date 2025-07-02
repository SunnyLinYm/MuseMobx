import React from 'react'
import { observer } from 'mobx-react'
import { store } from './store'

export const SvgCanvas = observer(() => {
	const handleClick = (e: React.MouseEvent) => {
		if (!store.drawingMode) return

		const svg = e.currentTarget as SVGSVGElement
		const pt = svg.createSVGPoint()
		pt.x = e.clientX
		pt.y = e.clientY
		const { x, y } = pt.matrixTransform(svg.getScreenCTM()?.inverse())

		switch (store.drawingMode) {
			case 'rect':
				store.addElement({ type: 'rect', x, y, props: { width: 80, height: 60, fill: '#4fc3f7' } })
				break
			case 'circle':
				store.addElement({ type: 'circle', x, y, props: { r: 40, fill: '#66bb6a' } })
				break
			case 'text':
				store.addElement({ type: 'text', x, y, props: { fill: '#333', fontSize: 20, text: 'hi hi' } })
				break
		}
	}

	const handleMouseDown = (id: string) => {
		console.log(id);
		store.selectElement(id)
	}

	const handleMouseMove = (e: React.MouseEvent) => {
		console.log(store.selectedId);
		if (!store.selectedId) return

		const svg = e.currentTarget as SVGSVGElement
		const pt = svg.createSVGPoint()
		pt.x = e.movementX
		pt.y = e.movementY
		const { x: dx, y: dy } = pt.matrixTransform(svg.getScreenCTM()?.inverse())

		store.moveElement(store.selectedId, dx, dy)
	}

	return (
		<svg
			width="800"
			height="600"
			onClick={handleClick}
			onMouseMove={handleMouseMove}
			onMouseUp={() => store.selectElement(null)}
		>
			{
				store.elements.map(el => (
					React.createElement(el.type, {
						key: el.id,
						...(el.type === 'rect' ? { x: el.x, y: el.y } : {}),
						...(el.type === 'circle' ? { cx: el.x, cy: el.y } : {}),
						...(el.type === 'text' ? { x: el.x, y: el.y } : {}),
						...el.props,
						onMouseDown: () => handleMouseDown(el.id),
						style: { cursor: 'move' }
					})
				))
			}
		</svg>
	)
})
