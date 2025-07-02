
import { makeAutoObservable } from 'mobx'

export type SvgElement = {
  id: string
  type: 'rect' | 'circle' | 'text'
  x: number
  y: number
  props: Record<string, string | number>
}

export class SvgStore {
  elements: SvgElement[] = []
  selectedId: string | null = null
  drawingMode: 'rect' | 'circle' | 'text' | null = null

  constructor() {
    makeAutoObservable(this)
  }

  addElement = (element: Omit<SvgElement, 'id'>) => {
	  this.elements.push({ ...element, id: Date.now().toString() })
    console.log(this.elements.last()?.id)
  }

  selectElement = (id: string) => {
    this.selectedId = id
  }

  moveElement = (id: string, dx: number, dy: number) => {
    const element = this.elements.find(el => el.id === id)
    if (element) {
      element.x += dx
      element.y += dy
    }
  }

  setDrawingMode = (mode: typeof this.drawingMode) => {
    this.drawingMode = mode
  }
}

export const store = new SvgStore()
