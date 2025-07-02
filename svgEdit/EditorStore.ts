import { types, Instance, applySnapshot } from 'mobx-state-tree';
import { ContainerModel } from './ContainerModel';

export type ShapeType = 'circle' | 'rect' | 'text';
export type EditorMode = 'move' | 'modify' | 'circle' | 'rect' | 'text';

const MAX_HISTORY = 50;


const ShapeModel = types.model('Shape', {
	id: types.identifier,
	type: types.enumeration<ShapeType>(['circle', 'rect', 'text']),
	x: types.number,
	y: types.number,
	width: types.maybe(types.number),
	height: types.maybe(types.number),
	radius: types.maybe(types.number),
	text: types.maybe(types.string),
	fill: types.string
});

export interface IShape extends Instance<typeof ShapeModel> { }


export const EditorStoreModel = types.model('EditorStore', {
	elements: types.array(types.union(
		types.late(() => ShapeModel),
		types.late(() => ContainerModel)
	)),
	shapes: types.array(ShapeModel),
	selectedId: types.maybe(types.string),
	hoveredId: types.maybe(types.string),
	mode: types.enumeration<EditorMode>(['move', 'modify', 'circle', 'rect', 'text']),
	undoStack: types.array(types.frozen()),
	redoStack: types.array(types.frozen()),
	currentState: types.frozen()
}).views(self => ({
	get canUndo() { return self.undoStack.length > 0 },
	get canRedo() { return self.redoStack.length > 0 }
})).actions(self => ({
	afterCreate() {
		self.currentState = this.getSnapshot();
	},
	getSnapshot() {
		return {
			shapes: [...self.shapes],
			selectedId: self.selectedId
		};
	},
	saveState() {
		const snapshot = this.getSnapshot();
		if (JSON.stringify(self.currentState) === JSON.stringify(snapshot)) return;

		self.undoStack.push(self.currentState);
		if (self.undoStack.length > MAX_HISTORY) self.undoStack.shift();

		self.currentState = snapshot;
		self.redoStack = [];
	},
	undo() {
		if (!self.canUndo) return;
		self.redoStack.push(self.currentState);
		self.currentState = self.undoStack.pop()!;
		applySnapshot(self, self.currentState);
	},
	redo() {
		if (!self.canRedo) return;
		self.undoStack.push(self.currentState);
		self.currentState = self.redoStack.pop()!;
		applySnapshot(self, self.currentState);
	},
	// 原有操作方法需要调用saveState()
	addShape(shape: Omit<IShape, 'id'>) {
		this.saveState();
		const newShape = ShapeModel.create({
			id: Date.now().toString(),
			...shape
		});
		self.shapes.push(newShape);
	},
	deleteSelected() {
		if (self.selectedId) {
			this.saveState();
			const index = self.shapes.findIndex(s => s.id === self.selectedId);
			if (index !== -1) self.shapes.splice(index, 1);
			self.selectedId = undefined;
		}
	},
	selectShape(id: string | undefined) {
		self.selectedId = id;
	},
	hoverShape(id: string) {
		self.hoveredId = id;
	},
	clearHover() {
		self.hoveredId = undefined;
	},
	updateShape(id: string, updates: Partial<Omit<IShape, 'id'>>) {
		const shape = self.shapes.find(s => s.id === id);
		if (shape) Object.assign(shape, updates);
	},
	setMode(mode: EditorMode) {
		self.mode = mode;
	},
	addContainer(container: { x: number, y: number, width: number, height: number }) {
		const newContainer = ContainerModel.create({
			id: `container-${Date.now()}`,
			...container,
			children: []
		});
		self.elements.push(newContainer);
	},

	moveToContainer(elementId: string, containerId: string | null) {
		const element = self.elements.find(e => e.id === elementId);
		if (!element) return;

		// 从原容器移除
		if ('parentId' in element && element.parentId) {
			const oldContainer = self.elements.find(e => e.id === element.parentId);
			if (oldContainer && 'children' in oldContainer) {
				oldContainer.children.remove(element as any);
			}
		}

		// 添加到新容器
		if (containerId) {
			const newContainer = self.elements.find(e => e.id === containerId);
			if (newContainer && 'children' in newContainer) {
				if ('parentId' in element) element.parentId = containerId;
				newContainer.children.push(element as any);
			}
		} else {
			// 移出到根层级
			if ('parentId' in element) element.parentId = undefined;
			self.elements.push(element);
		}
	}

}));

export interface IEditorStore extends Instance<typeof EditorStoreModel> { }
export const useEditorStore = () => EditorStoreModel.create({
	shapes: [],
	mode: 'move'
});






///////////////////////////////////////////////////////////