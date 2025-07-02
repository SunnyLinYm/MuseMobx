
//import React, { useState, MouseEvent } from 'react';
//import { observer } from 'mobx-react';
//import { Toolbar } from './toolbar';
//import { useEditorStore } from './EditorStore';



//const SVGEditor: React.FC = observer(() => {
//  const store = useEditorStore();
//  const [dragStart, setDragStart] = useState<{
//    x: number;
//    y: number;
//    shapeX: number;
//    shapeY: number;
//  } | null>(null);

//  const handleSvgClick = (e: MouseEvent<SVGSVGElement>) => {
//    const mode = store.mode;
//    if (!['circle', 'rect', 'text'].includes(mode)) return;

//    const { offsetX: x, offsetY: y } = e.nativeEvent;
//    const id = Date.now().toString();

//    switch (mode) {
//      case 'circle':
//        store.addShape({ type: 'circle', x, y, radius: 30, fill: '#ff5722' });
//        break;
//      case 'rect':
//        store.addShape({ type: 'rect', x, y, width: 60, height: 40, fill: '#4caf50' });
//        break;
//      case 'text':
//        store.addShape({ type: 'text', x, y, text: 'Text', fill: '#2196f3' });
//        break;
//    }
//  };

//  const handleShapeMouseDown = (id: string, e: MouseEvent) => {
//    e.stopPropagation();
//    if (store.mode !== 'move') return;
//    store.selectShape(id);
//    const shape = store.shapes.find(s => s.id === id);
//    if (!shape) return;

//    setDragStart({
//      x: e.clientX,
//      y: e.clientY,
//      shapeX: shape.x,
//      shapeY: shape.y
//    });
//  };

//  const handleMouseMove = (e: MouseEvent<SVGSVGElement>) => {
//    if (!dragStart || !store.selectedId || store.mode !== 'move') return;

//    const dx = e.clientX - dragStart.x;
//    const dy = e.clientY - dragStart.y;

//    store.updateShape(store.selectedId, {
//      x: dragStart.shapeX + dx,
//      y: dragStart.shapeY + dy
//    });
//  };
//  useEffect(() => {
//    const handleKeyDown = (e: KeyboardEvent) => {
//      if (e.ctrlKey && e.key === 'z') {
//        e.preventDefault();
//        store.undo();
//      } else if (e.ctrlKey && e.key === 'y') {
//        e.preventDefault();
//        store.redo();
//      }
//    };

//    window.addEventListener('keydown', handleKeyDown);
//    return () => window.removeEventListener('keydown', handleKeyDown);
//  }, [store]);
//  return (
//    <div>
//      <Toolbar store={store} />
//      <svg
//        width={800}
//        height={300}
//        style={{ border: '1px solid #ccc' }}
//        onClick={handleSvgClick}
//        onMouseMove={handleMouseMove}
//        onMouseUp={() => setDragStart(null)}
//      >
//        {store.shapes.map(shape => {
//          const isSelected = shape.id === store.selectedId;
//          const isHovered = shape.id === store.hoveredId;
//          const commonProps = {
//            key: shape.id,
//            onMouseDown: (e: MouseEvent) => handleShapeMouseDown(shape.id, e),
//            onMouseEnter: () => store.hoverShape(shape.id),
//            onMouseLeave: () => store.clearHover(),
//            style: { cursor: store.mode === 'move' ? 'move' : 'default' },
//            fill: shape.fill
//          };

//          switch (shape.type) {
//            case 'circle':
//              return (
//                <g key={shape.id}>
//                  <circle {...commonProps} cx={shape.x} cy={shape.y} r={shape.radius} />
//                  {isHovered && <circle cx={shape.x} cy={shape.y} r={shape.radius + 2} fill="none" stroke="gray" strokeDasharray="5,5" />}
//                  {isSelected && <circle cx={shape.x} cy={shape.y} r={shape.radius + 4} fill="none" stroke="black" strokeWidth={2} />}
//                </g>
//              );
//            case 'rect':
//              return (
//                <g key={shape.id}>
//                  <rect {...commonProps}
//                    x={shape.x - (shape.width || 0) / 2}
//                    y={shape.y - (shape.height || 0) / 2}
//                    width={shape.width}
//                    height={shape.height}
//                  />
//                  {isHovered && <rect
//                    x={(shape.x - (shape.width || 0) / 2) - 2}
//                    y={(shape.y - (shape.height || 0) / 2) - 2}
//                    width={(shape.width || 0) + 4}
//                    height={(shape.height || 0) + 4}
//                    fill="none" stroke="gray" strokeDasharray="5,5"
//                  />}
//                  {isSelected && <rect
//                    x={(shape.x - (shape.width || 0) / 2) - 4}
//                    y={(shape.y - (shape.height || 0) / 2) - 4}
//                    width={(shape.width || 0) + 8}
//                    height={(shape.height || 0) + 8}
//                    fill="none" stroke="black" strokeWidth={2}
//                  />}
//                </g>
//              );
//            case 'text':
//              return (
//                <g key={shape.id}>
//                  <text {...commonProps}
//                    x={shape.x}
//                    y={shape.y}
//                    fontSize={16}
//                    textAnchor="middle"
//                    dominantBaseline="middle"
//                  >{shape.text}</text>
//                  {isHovered && <rect
//                    x={shape.x - 30}
//                    y={shape.y - 12}
//                    width={60}
//                    height={24}
//                    fill="none" stroke="gray" strokeDasharray="5,5"
//                  />}
//                  {isSelected && <rect
//                    x={shape.x - 34}
//                    y={shape.y - 16}
//                    width={68}
//                    height={32}
//                    fill="none" stroke="black" strokeWidth={2}
//                  />}
//                </g>
//              );
//            default:
//              return null;
//          }
//        })}
//      </svg>
//    </div>
//  );
//});

//export default SVGEditor;


