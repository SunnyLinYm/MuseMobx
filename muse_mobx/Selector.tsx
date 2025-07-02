/*
 主要修改說明：
1.引入 MST 模型
．不再引入原始的類別，而是引入 MST 定義的模型，例如 BarModel, LineModel, NoteModel, SubNoteModel, PageModel, TrackModel。
．同樣，我也假設 MuseRow, MuseParagraph, MuseNotation, MuseNoise, MuseMeasure 也已經或將被轉換為 MST 模型，並引入了它們的 MST 模型。
2.型別定義更新 (Selection 介面)
．所有 Selection 介面中的 getThis 方法的返回型別都從原始類別更改為 Instance<typeof 模型名稱>。這確保了 TypeScript 知道這些方法返回的是 MST 實例，而不是普通的類別實例。
	```TypeScript
	export interface SelectionSubNote {
			setSelect: (i: boolean) => void;
			getThis: () => Instance<typeof SubNoteModel>; // 返回 SubNoteModel 的實例
			// ... 其他屬性
	}
	```
3.Selector 類別內部屬性型別更新
．Selector 類別中用於儲存當前選中元素的屬性（例如 private note: Note | null = null;）現在直接儲存 MST 模型的實例，其型別為 Instance<typeof 模型名稱> | null。
	```TypeScript
	private notation: Instance<typeof NotationModel> | null = null;
	private page: Instance<typeof PageModel> | null = null;
	// ... 其他選中狀態屬性
	```
4.操作更新
．在所有 selectXxx 方法中，傳入的參數型別也變更為 Instance<typeof 模型名稱>。
．在鍵盤事件處理方法（keySubNote, keyNote 等）中：
	--當訪問選中元素的屬性或呼叫其方法時，直接操作 MST 實例。例如，this.subNote.getThis().index 不變，因為 getThis() 已經返回 MST 實例。
	--新增元素：當呼叫 addXxx 方法時，例如 note.addSubNote(idx)，這些方法現在直接在 MST 實例上呼叫，而這些 addXxx 動作在各自的模型中已經被修改為使用 Model.create() 來建立新的 MST 子實例。
	--移除元素：當呼叫 removeXxx 方法時，例如 bar.removeNote(idx)，這些方法也直接在 MST 實例上呼叫，執行 MST 陣列的移除操作。
	--安全檢查: 在 keyBar, keyTrack, keyLine, keyPage 中的 ArrowUp 和 ArrowDown 邏輯中，增加了對獲取到的子元素是否存在（if (bar) 或 if (note)) 的檢查，以避免當陣列為空時的潛在錯誤。
	--keyNotation 的 Space 鍵: 增加了 ev.returnValue = false; 來阻止瀏覽器預設的空格鍵行為（滾動頁面）。
這個重構確保了 Selector 能夠無縫地與 MobX-State-Tree 模型協同工作，為整個應用程式提供一致和強型別的狀態管理。
 */
import { Instance } from "mobx-state-tree"; // 引入 MobX-State-Tree 的 Instance
import { BarModel } from "./MuseBar"; // 引入 BarModel
import { LineModel } from "./MuseLine"; // 引入 LineModel
import { NoteModel, SubNoteModel } from "./MuseNote"; // 引入 NoteModel 和 SubNoteModel
import { PageModel } from "./MusePage"; // 引入 PageModel
import { TrackModel } from "./MuseTrack"; // 引入 TrackModel

import { RowModel } from "./MuseRow"; // 假設 MuseRow 已轉換
import { ParagraphModel } from "./MuseParagraph"; // 假設 MuseParagraph 已轉換
import { NotationModel } from "./MuseNotation"; // 假設 MuseNotation 已轉換
import { NoiseModel, SubNoiseModel } from "./MuseNoise"; // 假設 MuseNoise 已轉換
import { MeasureModel } from "./MuseMeasure"; // 假設 MuseMeasure 已轉換

// 更新所有 Selection 介面的 getThis 返回型別為 MST 實例
export interface SelectionSubNote {
	setSelect: (i: boolean) => void;
	getThis: () => Instance<typeof SubNoteModel>; // 返回 SubNoteModel 的實例
	setNum: (n: string) => void;
	reducePoint: (h: number) => void;
	reduceLine: (l: number) => void;
	reduceTailPoint: (p: number) => void;
}

export interface SelectionNote {
	setSelect: (i: boolean) => void;
	getThis: () => Instance<typeof NoteModel>; // 返回 NoteModel 的實例
	reduceLine: (l: number) => void;
	reduceTailPoint: (p: number) => void;
	addSubNote: (index: number) => void;
	removeSubNote: (index: number) => void;
}

export interface SelectionBar {
	setSelect: (i: boolean) => void;
	getThis: () => Instance<typeof BarModel>; // 返回 BarModel 的實例
	addNote: (index: number) => void;
	removeNote: (index: number) => void;
}

export interface SelectionTrack {
	setSelect: (s: boolean) => void;
	getThis: () => Instance<typeof TrackModel>; // 返回 TrackModel 的實例
	addBar: (index: number) => void;
	removeBar: (index: number) => void;
}

export interface SelectionLine {
	setSelect: (s: boolean) => void;
	getThis: () => Instance<typeof LineModel>; // 返回 LineModel 的實例
	addTrack: (index: number) => void;
	removeTrack: (index: number) => void;
}

export interface SelectionPage {
	setSelect: (s: boolean) => void;
	getThis: () => Instance<typeof PageModel>; // 返回 PageModel 的實例
	addLine: (index: number) => void;
	removeLine: (index: number) => void;
}

export interface SelectionParagraph {
	setSelect: (s: boolean) => void;
	getThis: () => Instance<typeof ParagraphModel>; // 返回 ParagraphModel 的實例
	addMeasure: (index: number) => void;
	removeMeasure: (index: number) => void;
}

export interface SelectionMeasure {
	setSelect: (s: boolean) => void;
	getThis: () => Instance<typeof MeasureModel>; // 返回 MeasureModel 的實例
	addRow: (index: number) => void;
	removeRow: (index: number) => void;
}

export interface SelectionRow {
	setSelect: (s: boolean) => void;
	getThis: () => Instance<typeof RowModel>; // 返回 RowModel 的實例
	addNoise: (index: number) => void;
	removeNoise: (index: number) => void;
}

export interface SelectionNoise {
	setSelect: (s: boolean) => void;
	getThis: () => Instance<typeof NoiseModel>; // 返回 NoiseModel 的實例
	addSubNoise: (index: number) => void;
	removeSubNoise: (index: number) => void;
}

export interface SelectionSubNoise {
	setSelect: (s: boolean) => void;
	getThis: () => Instance<typeof SubNoiseModel>; // 返回 SubNoiseModel 的實例
}

export interface SelectionNotation {
	setSelect: (s: boolean) => void;
	getThis: () => Instance<typeof NotationModel>; // 返回 NotationModel 的實例
	addPage: (index: number) => void;
	removePage: (index: number) => void;
}

class Selector {
	private static _instance: Selector;

	// 將所有選中狀態的屬性型別改為 MST 的 Instance 或 null
	private notation: Instance<typeof NotationModel> | null = null;
	private page: Instance<typeof PageModel> | null = null;
	private line: Instance<typeof LineModel> | null = null;
	private track: Instance<typeof TrackModel> | null = null;
	private bar: Instance<typeof BarModel> | null = null;
	private note: Instance<typeof NoteModel> | null = null;
	private subNote: Instance<typeof SubNoteModel> | null = null;

	private paragraph: Instance<typeof ParagraphModel> | null = null;
	private measure: Instance<typeof MeasureModel> | null = null;
	private row: Instance<typeof RowModel> | null = null;
	private noise: Instance<typeof NoiseModel> | null = null;
	private subNoise: Instance<typeof SubNoiseModel> | null = null;

	private constructor() { }

	public static get instance(): Selector {
		if (!Selector._instance) {
			Selector._instance = new Selector();
		}
		return Selector._instance;
	}

	// ----------------------------------------------------
	// Select Methods: 更新選中狀態，確保取消前一個的選中
	// ----------------------------------------------------

	selectNotation(n: Instance<typeof NotationModel>) {
		this.clearSelect();
		this.notation = n;
		this.notation.setSelect(true);
	}

	selectPage(p: Instance<typeof PageModel>) {
		this.clearSelect();
		this.page = p;
		this.page.setSelect(true);
	}

	selectLine(l: Instance<typeof LineModel>) {
		this.clearSelect();
		this.line = l;
		this.line.setSelect(true);
	}

	selectTrack(t: Instance<typeof TrackModel>) {
		this.clearSelect();
		this.track = t;
		this.track.setSelect(true);
	}

	selectBar(b: Instance<typeof BarModel>) {
		this.clearSelect();
		this.bar = b;
		this.bar.setSelect(true);
	}

	selectNote(n: Instance<typeof NoteModel>) {
		this.clearSelect();
		this.note = n;
		this.note.setSelect(true);
	}

	selectSubNote(s: Instance<typeof SubNoteModel>) {
		this.clearSelect();
		this.subNote = s;
		this.subNote.setSelect(true);
	}

	selectParagraph(p: Instance<typeof ParagraphModel>) {
		this.clearSelect();
		this.paragraph = p;
		this.paragraph.setSelect(true);
	}

	selectMeasure(m: Instance<typeof MeasureModel>) {
		this.clearSelect();
		this.measure = m;
		this.measure.setSelect(true);
	}

	selectRow(r: Instance<typeof RowModel>) {
		this.clearSelect();
		this.row = r;
		this.row.setSelect(true);
	}

	selectNoise(n: Instance<typeof NoiseModel>) {
		this.clearSelect();
		this.noise = n;
		this.noise.setSelect(true);
	}

	selectSubNoise(s: Instance<typeof SubNoiseModel>) {
		this.clearSelect();
		this.subNoise = s;
		this.subNoise.setSelect(true);
	}

	// ----------------------------------------------------
	// Get Selected Item Methods
	// ----------------------------------------------------

	getSelected():
		| Instance<typeof SubNoteModel>
		| Instance<typeof NoteModel>
		| Instance<typeof BarModel>
		| Instance<typeof TrackModel>
		| Instance<typeof LineModel>
		| Instance<typeof PageModel>
		| Instance<typeof ParagraphModel>
		| Instance<typeof MeasureModel>
		| Instance<typeof RowModel>
		| Instance<typeof NoiseModel>
		| Instance<typeof SubNoiseModel>
		| Instance<typeof NotationModel>
		| null {
		if (this.subNote !== null) return this.subNote;
		if (this.note !== null) return this.note;
		if (this.bar !== null) return this.bar;
		if (this.track !== null) return this.track;
		if (this.line !== null) return this.line;
		if (this.page !== null) return this.page;
		if (this.subNoise !== null) return this.subNoise;
		if (this.noise !== null) return this.noise;
		if (this.row !== null) return this.row;
		if (this.measure !== null) return this.measure;
		if (this.paragraph !== null) return this.paragraph;
		if (this.notation !== null) return this.notation;
		return null;
	}

	clearSelect() {
		if (this.subNote !== null) {
			this.subNote.setSelect(false);
			this.subNote = null;
		}
		if (this.note !== null) {
			this.note.setSelect(false);
			this.note = null;
		}
		if (this.bar !== null) {
			this.bar.setSelect(false);
			this.bar = null;
		}
		if (this.track !== null) {
			this.track.setSelect(false);
			this.track = null;
		}
		if (this.line !== null) {
			this.line.setSelect(false);
			this.line = null;
		}
		if (this.page !== null) {
			this.page.setSelect(false);
			this.page = null;
		}
		if (this.subNoise !== null) {
			this.subNoise.setSelect(false);
			this.subNoise = null;
		}
		if (this.noise !== null) {
			this.noise.setSelect(false);
			this.noise = null;
		}
		if (this.row !== null) {
			this.row.setSelect(false);
			this.row = null;
		}
		if (this.measure !== null) {
			this.measure.setSelect(false);
			this.measure = null;
		}
		if (this.paragraph !== null) {
			this.paragraph.setSelect(false);
			this.paragraph = null;
		}
		if (this.notation !== null) {
			this.notation.setSelect(false);
			this.notation = null;
		}
	}

	// ----------------------------------------------------
	// Keyboard Event Handlers: 這些方法需要處理 MST 實例的行為
	// ----------------------------------------------------

	keySubNote(ev: KeyboardEvent): boolean {
		if (this.subNote !== null) {
			switch (ev.key) {
				case "Delete":
					let idx = this.subNote.getThis().index;
					let note = this.subNote.getThis().note;
					note.removeSubNote(idx);
					this.clearSelect();
					if (note.getThis().subNotes.length > 0) {
						if (idx >= note.getThis().subNotes.length) {
							idx = note.getThis().subNotes.length - 1;
						}
						this.selectSubNote(note.getThis().subNotes[idx]);
					} else {
						this.selectNote(note.getThis());
					}
					return true;
				case "Insert":
					this.subNote.getThis().note.addSubNote(this.subNote.getThis().index);
					this.clearSelect();
					this.selectSubNote(this.subNote.getThis().note.getThis().subNotes[this.subNote.getThis().index]);
					return true;
				case "ArrowLeft":
					let idxx = this.subNote.getThis().index;
					let notex = this.subNote.getThis().note;
					if (idxx > 0) {
						this.selectSubNote(notex.getThis().subNotes[idxx - 1]);
						return true;
					} else {
						this.selectNote(notex.getThis());
						return true;
					}
				case "ArrowRight":
					let idxr = this.subNote.getThis().index;
					let noter = this.subNote.getThis().note;
					if (idxr < noter.getThis().subNotes.length - 1) {
						this.selectSubNote(noter.getThis().subNotes[idxr + 1]);
						return true;
					} else {
						this.selectNote(noter.getThis());
						return true;
					}
				case "ArrowUp":
					this.subNote.reducePoint(-1);
					return true;
				case "ArrowDown":
					this.subNote.reducePoint(1);
					return true;
				case "PageUp":
					this.subNote.reduceLine(-1);
					return true;
				case "PageDown":
					this.subNote.reduceLine(1);
					return true;
				case "Home":
					this.subNote.reduceTailPoint(-1);
					return true;
				case "End":
					this.subNote.reduceTailPoint(1);
					return true;
				case "0":
				case "1":
				case "2":
				case "3":
				case "4":
				case "5":
				case "6":
				case "7":
				case "8":
				case "9":
					this.subNote.setNum(ev.key);
					return true;
				default:
					return false;
			}
		} else return false;
	}

	keyNote(ev: KeyboardEvent): boolean {
		if (this.note !== null) {
			switch (ev.key) {
				case "Delete":
					let idx = this.note.getThis().index;
					let bar = this.note.getThis().bar;
					bar.removeNote(idx);
					this.clearSelect();
					if (bar.getThis().notes.length > 0) {
						if (idx >= bar.getThis().notes.length) {
							idx = bar.getThis().notes.length - 1;
						}
						this.selectNote(bar.getThis().notes[idx]);
					} else {
						this.selectBar(bar.getThis());
					}
					return true;
				case "Insert":
					this.note.getThis().bar.addNote(this.note.getThis().index);
					this.clearSelect();
					this.selectNote(this.note.getThis().bar.getThis().notes[this.note.getThis().index]);
					return true;
				case "ArrowLeft":
					let idxx = this.note.getThis().index;
					let barx = this.note.getThis().bar;
					if (idxx > 0) {
						this.selectNote(barx.getThis().notes[idxx - 1]);
						return true;
					} else {
						this.selectBar(barx.getThis());
						return true;
					}
				case "ArrowRight":
					let idxr = this.note.getThis().index;
					let barr = this.note.getThis().bar;
					if (idxr < barr.getThis().notes.length - 1) {
						this.selectNote(barr.getThis().notes[idxr + 1]);
						return true;
					} else {
						this.selectBar(barr.getThis());
						return true;
					}
				case "ArrowUp":
					let sn = this.note.getThis().subNotes[this.note.getThis().subNotes.length - 1];
					this.selectSubNote(sn);
					return true;
				case "ArrowDown":
					let sdn = this.note.getThis().subNotes[0];
					this.selectSubNote(sdn);
					return true;
				case "PageUp":
					this.note.reduceLine(-1);
					return true;
				case "PageDown":
					this.note.reduceLine(1);
					return true;
				case "Home":
					this.note.reduceTailPoint(-1);
					return true;
				case "End":
					this.note.reduceTailPoint(1);
					return true;
				default:
					return false;
			}
		} else return false;
	}

	keyBar(ev: KeyboardEvent): boolean {
		if (this.bar !== null) {
			switch (ev.key) {
				case "Delete":
					let idx = this.bar.getThis().index;
					let track = this.bar.getThis().track;
					track.removeBar(idx);
					this.clearSelect();
					if (track.getThis().bars.length > 0) {
						if (idx >= track.getThis().bars.length) {
							idx = track.getThis().bars.length - 1;
						}
						this.selectBar(track.getThis().bars[idx]);
					} else {
						this.selectTrack(track.getThis());
					}
					return true;
				case "Insert":
					this.bar.getThis().track.addBar(this.bar.getThis().index);
					this.clearSelect();
					this.selectBar(this.bar.getThis().track.getThis().bars[this.bar.getThis().index]);
					return true;
				case "ArrowLeft":
					let idxx = this.bar.getThis().index;
					let trackx = this.bar.getThis().track;
					if (idxx > 0) {
						this.selectBar(trackx.getThis().bars[idxx - 1]);
						return true;
					} else {
						this.selectTrack(trackx.getThis());
						return true;
					}
				case "ArrowRight":
					let idxr = this.bar.getThis().index;
					let trackr = this.bar.getThis().track;
					if (idxr < trackr.getThis().bars.length - 1) {
						this.selectBar(trackr.getThis().bars[idxr + 1]);
						return true;
					} else {
						this.selectTrack(trackr.getThis());
						return true;
					}
				case "ArrowUp":
					let note = this.bar.getThis().notes[this.bar.getThis().notes.length - 1];
					if (note) { // Check if note exists
						this.selectNote(note);
					}
					return true;
				case "ArrowDown":
					let noted = this.bar.getThis().notes[0];
					if (noted) { // Check if note exists
						this.selectNote(noted);
					}
					return true;
				default:
					return false;
			}
		} else return false;
	}

	keyTrack(ev: KeyboardEvent): boolean {
		if (this.track !== null) {
			switch (ev.key) {
				case "Delete":
					let idx = this.track.getThis().index;
					let line = this.track.getThis().line;
					line.removeTrack(idx);
					this.clearSelect();
					if (line.getThis().tracks.length > 0) {
						if (idx >= line.getThis().tracks.length) {
							idx = line.getThis().tracks.length - 1;
						}
						this.selectTrack(line.getThis().tracks[idx]);
					} else {
						this.selectLine(line.getThis());
					}
					return true;
				case "Insert":
					this.track.getThis().line.addTrack(this.track.getThis().index);
					this.clearSelect();
					this.selectTrack(this.track.getThis().line.getThis().tracks[this.track.getThis().index]);
					return true;
				case "ArrowLeft":
					let idxx = this.track.getThis().index;
					let linex = this.track.getThis().line;
					if (idxx > 0) {
						this.selectTrack(linex.getThis().tracks[idxx - 1]);
						return true;
					} else {
						this.selectLine(linex.getThis());
						return true;
					}
				case "ArrowRight":
					let idxr = this.track.getThis().index;
					let liner = this.track.getThis().line;
					if (idxr < liner.getThis().tracks.length - 1) {
						this.selectTrack(liner.getThis().tracks[idxr + 1]);
						return true;
					} else {
						this.selectLine(liner.getThis());
						return true;
					}
				case "ArrowUp":
					let bar = this.track.getThis().bars[this.track.getThis().bars.length - 1];
					if (bar) {
						this.selectBar(bar);
					}
					return true;
				case "ArrowDown":
					let bard = this.track.getThis().bars[0];
					if (bard) {
						this.selectBar(bard);
					}
					return true;
				default:
					return false;
			}
		} else return false;
	}

	keyLine(ev: KeyboardEvent): boolean {
		if (this.line !== null) {
			switch (ev.key) {
				case "Delete":
					let idx = this.line.getThis().index;
					let page = this.line.getThis().page;
					page.removeLine(idx);
					this.clearSelect();
					if (page.getThis().lines.length > 0) {
						if (idx >= page.getThis().lines.length) {
							idx = page.getThis().lines.length - 1;
						}
						this.selectLine(page.getThis().lines[idx]);
					} else {
						this.selectPage(page.getThis());
					}
					return true;
				case "Insert":
					this.line.getThis().page.addLine(this.line.getThis().index);
					this.clearSelect();
					this.selectLine(this.line.getThis().page.getThis().lines[this.line.getThis().index]);
					return true;
				case "ArrowLeft":
					let idxx = this.line.getThis().index;
					let pagx = this.line.getThis().page;
					if (idxx > 0) {
						this.selectLine(pagx.getThis().lines[idxx - 1]);
						return true;
					} else {
						this.selectPage(pagx.getThis());
						return true;
					}
				case "ArrowRight":
					let idxr = this.line.getThis().index;
					let pagr = this.line.getThis().page;
					if (idxr < pagr.getThis().lines.length - 1) {
						this.selectLine(pagr.getThis().lines[idxr + 1]);
						return true;
					} else {
						this.selectPage(pagr.getThis());
						return true;
					}
				case "ArrowUp":
					let track = this.line.getThis().tracks[this.line.getThis().tracks.length - 1];
					if (track) {
						this.selectTrack(track);
					}
					return true;
				case "ArrowDown":
					let trackd = this.line.getThis().tracks[0];
					if (trackd) {
						this.selectTrack(trackd);
					}
					return true;
				default:
					return false;
			}
		} else return false;
	}

	keyPage(ev: KeyboardEvent): boolean {
		if (this.page !== null) {
			switch (ev.key) {
				case "Delete":
					let idx = this.page.getThis().index;
					let notation = this.page.getThis().notation;
					notation.removePage(idx);
					this.clearSelect();
					if (notation.getThis().pages.length > 0) {
						if (idx >= notation.getThis().pages.length) {
							idx = notation.getThis().pages.length - 1;
						}
						this.selectPage(notation.getThis().pages[idx]);
					} else {
						this.selectNotation(notation.getThis());
					}
					return true;
				case "Insert":
					this.page.getThis().notation.addPage(this.page.getThis().index);
					this.clearSelect();
					this.selectPage(this.page.getThis().notation.getThis().pages[this.page.getThis().index]);
					return true;
				case "ArrowLeft":
					let idxx = this.page.getThis().index;
					let notationx = this.page.getThis().notation;
					if (idxx > 0) {
						this.selectPage(notationx.getThis().pages[idxx - 1]);
						return true;
					} else {
						this.selectNotation(notationx.getThis());
						return true;
					}
				case "ArrowRight":
					let idxr = this.page.getThis().index;
					let notationr = this.page.getThis().notation;
					let l = notationr.getThis().pages.length;
					if (idxr < l - 1) {
						this.selectPage(notationr.getThis().pages[idxr + 1]);
						return true;
					} else return true; // Already at the last page
				case "ArrowUp":
					let line = this.page.getThis().lines[this.page.getThis().lines.length - 1];
					if (line) {
						this.selectLine(line);
					}
					return true;
				case "ArrowDown":
					let lined = this.page.getThis().lines[0];
					if (lined) {
						this.selectLine(lined);
					}
					return true;
				default:
					return false;
			}
		} else return false;
	}

	keyNotation(ev: KeyboardEvent): boolean {
		if (this.notation !== null) {
			switch (ev.key) {
				case "Enter":
					if (this.notation.getThis().pages.length <= 0) {
						this.notation
							.getThis()
							.addPage(this.notation.getThis().pages.length);
					}
					this.page = this.notation.getThis().pages[0];
					this.page.setSelect(true);
					this.notation.setSelect(false);
					return true;
				case " ": // Space key
					this.notation.addPage(this.notation.getThis().pages.length);
					ev.returnValue = false; // Prevent default space bar behavior (scrolling)
					return true;
				default:
					return false;
			}
		} else return false;
	}

	// You would add similar key handlers for Paragraph, Measure, Row, Noise, SubNoise if needed.
	// keyParagraph(ev: KeyboardEvent): boolean { ... }
	// keyMeasure(ev: KeyboardEvent): boolean { ... }
	// keyRow(ev: KeyboardEvent): boolean { ... }
	// keyNoise(ev: KeyboardEvent): boolean { ... }
	// keySubNoise(ev: KeyboardEvent): boolean { ... }
}

export default Selector;