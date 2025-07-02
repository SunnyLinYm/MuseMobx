
import React from 'react'
import { store } from './store'
import './menu.css'

export const Menu = () => {
  const handleSave = () => {
    const svgData = store.getSvgData()
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'design.svg'
    link.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          store.loadSvg(event.target.result as string)
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <nav className="menu-container">
      <div className="menu-logo">SVG Editor</div>
      <div className="menu-actions">
        <label className="menu-button">
          导入SVG
          <input type="file" accept=".svg" onChange={handleFileChange} hidden />
        </label>
        <button className="menu-button" onClick={handleSave}>
          导出SVG
        </button>
      </div>
    </nav>
  )
}
