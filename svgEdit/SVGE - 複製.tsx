
import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { types, Instance, getSnapshot } from 'mobx-state-tree';

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
  },
  setParent(parentId?: string) {
    self.parentId = parentId;
  },
  setFill(color: string) {
    self.fill = color;
  }
}));

// 编辑器状态模型
const EditorModel = types.model('Editor', {
  shapes: types.array(ShapeModel),
  selectedId: types.maybe(types.string),
  hoveredId: types.maybe(types.string)
}).actions(self => ({
  addShape(shape: Instance<typeof ShapeModel>) {
    self.shapes.push(shape);
  },
  selectShape(id: string) {
    self.selectedId = id;
  },
  setHovered(id?: string) {
    self.hoveredId = id;
  },
  moveToContainer(shapeId: string, containerId?: string) {
    const shape = self.shapes.find(s => s.id === shapeId);
    if (shape) shape.setParent(containerId);
  }
}));

// 创建编辑器实例
const editor = EditorModel.create({ shapes: [] });

// 形状渲染组件
const ShapeView = observer(({
  shape,
  isInGroup = false
}: {
  shape: Instance<typeof ShapeModel>;
  isInGroup?: boolean
}) => {
  const isSelected = editor.selectedId === shape.id;
  const isHovered = editor.hoveredId === shape.id;

  const commonProps = {
    x: shape.x,
    y: shape.y,
    fill: shape.fill,
    stroke: isSelected ? '#f00' : isHovered ? '#00f' : shape.stroke,
    strokeWidth: isSelected ? 2 : isHovered ? 1 : 0,
    strokeDasharray: isHovered && !isSelected ? '5,5' : undefined,
    onMouseEnter: () => editor.setHovered(shape.id),
    onMouseLeave: () => editor.setHovered(undefined),
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation();
      editor.selectShape(shape.id);
    },
    style: { cursor: 'move' }
  };

  const renderShape = () => {
    switch (shape.type) {
      case 'circle':
        return <circle {...commonProps} cx={shape.x} cy={shape.y} r={shape.radius} />;
      case 'rect':
        return <rect {...commonProps} width={shape.width} height={shape.height} />;
      case 'text':
        return <text {...commonProps} fontSize={16}>{shape.text}</text>;
      case 'group':
        return (
          <g {...commonProps}>
            <rect
              x={shape.x}
              y={shape.y}
              width={shape.width}
              height={shape.height}
              fill={shape.fill}
              opacity={0.3}
            />
            {shape.children.map(child => (
              <ShapeView key={child.id} shape={child} isInGroup />
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
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
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
  };

  const handleDragStart = (id: string) => {
    setDraggingId(id);
    editor.selectShape(id);
  };

  const handleDragOver = (e: React.MouseEvent, id?: string) => {
    e.preventDefault();
    setDropTarget(id || null);
  };

  const handleDrop = (e: React.MouseEvent, containerId?: string) => {
    e.preventDefault();
    if (draggingId) {
      editor.moveToContainer(draggingId, containerId);
    }
    setDraggingId(null);
    setDropTarget(null);
  };

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setTool('circle')}>Circle</button>
        <button onClick={() => setTool('rect')}>Rectangle</button>
        <button onClick={() => setTool('text')}>Text</button>
        <button onClick={() => setTool('group')}>Container</button>
      </div>

      <svg
        width={800}
        height={600}
        onClick={handleCanvasClick}
        onDragOver={(e) => handleDragOver(e)}
        onDrop={(e) => handleDrop(e)}
        style={{ border: '1px solid #000', background: '#f9f9f9' }}
      >
        {editor.shapes.map(shape => (
          <React.Fragment key={shape.id}>
            {shape.type === 'group' && (
              <rect
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                fill={dropTarget === shape.id ? '#ddd' : 'transparent'}
                stroke={dropTarget === shape.id ? '#00f' : 'transparent'}
                strokeDasharray="5,5"
                onDragOver={(e) => handleDragOver(e, shape.id)}
                onDrop={(e) => handleDrop(e, shape.id)}
              />
            )}
            <ShapeView
              shape={shape}
              onMouseDown={() => handleDragStart(shape.id)}
            />
          </React.Fragment>
        ))}
      </svg>
    </div>
  );
});

export default SVGEditor;
