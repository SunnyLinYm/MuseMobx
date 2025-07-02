
import { types, Instance } from 'mobx-state-tree';

export const BaseElement = types.model('BaseElement', {
  id: types.identifier,
  x: types.number,
  y: types.number,
  width: types.maybe(types.number),
  height: types.maybe(types.number),
  fill: types.string
});

export const ContainerModel = types.model('Container', {
  ...BaseElement.properties,
  children: types.array(types.union(
    types.late(() => ShapeModel),
    types.late(() => ContainerModel)
  ))
});

const ShapeModel = types.model('Shape', {
  ...BaseElement.properties,
  type: types.enumeration(['circle', 'rect', 'text']),
  radius: types.maybe(types.number),
  text: types.maybe(types.string),
  parentId: types.maybe(types.string)
});

