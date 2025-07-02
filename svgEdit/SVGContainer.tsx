import { observer } from 'mobx-react';
import React from 'react';

export const SVGContainer = observer(({ container }: { container: IContainer }) => {
  return (
    <g transform={`translate(${container.x}, ${container.y})`}>
      <rect
        width={container.width}
        height={container.height}
        fill="rgba(200,200,255,0.2)"
        stroke="blue"
      />
      {container.children.map(child => (
        'type' in child ? (
          <ShapeComponent key={child.id} shape={child} />
        ) : (
          <SVGContainer key={child.id} container={child} />
        )
      ))}
    </g>
  );
});
