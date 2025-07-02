/*
重構步驟與核心概念
要將 MuseNote.tsx 改為使用 mobx-state-tree，我們需要將現有的 SubNote 和 Note 類別轉換為 MST 模型。這涉及以下幾個核心步驟：

1. 引入必要的 MobX-State-Tree 模組
	首先，你需要將 MobX 的 @observable 和 @computed 替換為 mobx-state-tree 中的 types、getParent 和 Instance。
	```TypeScript
	import { types, getParent, Instance } from "mobx-state-tree";
	import { observer } from "mobx-react"; // mobx-react 的 observer 仍然需要
	```
2. 定義 SubNote 模型 (SubNoteModel)
將 SubNote 類別轉換為 MST 模型。
	．狀態屬性 (Properties): 使用 types.model("模型名稱", { ... }) 來定義模型的屬性及其型別。
		-原來的 @observable 屬性（如 isSelect, index, x, n, t）現在用 MST 的型別來表示，例如 types.optional(types.boolean, false) 用於可選布林值並提供預設值，types.number 用於數字。
	．視圖 (Views): 使用 .views((self) => ({ ... })) 來定義計算屬性，它們相當於原來的 @computed getter。
		-在視圖中，你可以使用 self 來訪問模型實例自身的屬性。
		-config 和 note 屬性現在需要透過 getParent 來訪問其父模型（NoteModel 或更高層級）的實例，這樣才能正確地從樹狀結構中獲取。
	．動作 (Actions): 使用 .actions((self) => ({ ... })) 來定義修改模型狀態的方法。
		-所有會改變狀態的方法都應該定義在 actions 中。

3. 定義 Note 模型 (NoteModel) 
```
	export const NoteModel = types.model
```
同樣地，將 Note 類別轉換為 MST 模型。
	．狀態屬性:
		-subNotes 屬性現在是一個由 SubNoteModel 組成的陣列：types.array(SubNoteModel)。MST 會自動管理這個陣列中 SubNote 實例的生命週期和反應性。
	．視圖 (Views):
		-dx, time, notesY 等 @computed 屬性被轉換為視圖。
		-config 和 bar 的訪問同樣透過 getParent 進行，假設 NoteModel 是 BarModel 的子級。
	．動作 (Actions):
		-所有修改 Note 自身屬性或其 subNotes 陣列的方法都應定義在 actions 中。
		-addSubNote 和 removeSubNote 動作現在直接操作 self.subNotes 陣列。當新增 SubNote 時，使用 SubNoteModel.create() 來建立一個新的 SubNote 實例。
		-decode 方法現在負責解析輸入的 INote 物件，並更新 NoteModel 的屬性和創建 SubNoteModel 實例。在解析之前，通常會清空現有的 subNotes (self.subNotes.clear())。


 */
import React from "react";
import { Border, OuterBorder } from "./Border";
import MuseConfig from "./MuseConfig";
import IBar from "./MuseBar"; // Assuming IBar and Bar are also MST models or will be
import Codec from "./Codec"; // Assuming Codec interface remains
import Fraction from "./Fraction"; // Assuming Fraction is a utility class/object
import { types, getParent, Instance } from "mobx-state-tree";
import { observer } from "mobx-react";
import Selector, { SelectionNote, SelectionSubNote } from "./Selector"; // Selector likely needs updates too if it interacts deeply with MST models
import { BarModel } from "./MuseBar"; // Assuming Bar will be an MST model named BarModel

// IPage --> ILine --> ITrack --> IBar --> INote --> SubNote

// Define INote interface as it's used for decoding/encoding
export interface INote {
	n: string;
}

// MuseConfig would ideally also be an MST model or a simple object passed down
// For now, we'll assume it's a regular class/object as per original code.
// If MuseConfig properties change and should trigger reactions, it should also be an MST model.

// SubNote Model
export const SubNoteModel = types
	.model("SubNote", {
		isSelect: types.optional(types.boolean, false),
		index: types.number,
		x: types.optional(types.string, ""),
		n: types.optional(types.string, ""),
		t: types.optional(types.number, 0),
		// config is often passed via context or as an environment to the root store
		// For simplicity, we'll keep it as a direct reference for now, but be aware of MST's environment pattern.
		// config: types.late(() => MuseConfigModel), // If MuseConfig becomes an MST model
	})
	.views((self) => ({
		get config(): MuseConfig {
			// 從父級 Note 模型獲取 config
			return (getParent(self, 2) as Instance<typeof NoteModel>).config;
		},
		get note(): Instance<typeof NoteModel> {
            // 從父級獲取 Note 模型實例
			return getParent(self, 1) as Instance<typeof NoteModel>;
		},
	}))
	.actions((self) => ({
		setSelect(s: boolean) {
			self.isSelect = s;
		},
		setNum(n: string) {
			self.n = n;
		},
		reducePoint(h: number) {
			self.t += h;
		},
		reduceLine(l: number) {
        // 將修改父級 Note 屬性的動作委派給 Note 模型的動作
			self.note.reduceLine(l);
		},
		reduceTailPoint(p: number) {
        // 將修改父級 Note 屬性的動作委派給 Note 模型的動作
			self.note.reduceTailPoint(p);
		},
		getThis() {
			return self; // In MST, self is the instance
		},
	}));

// Note Model
export const NoteModel = types
	.model("Note", {
		index: types.number,
		subNotes: types.array(SubNoteModel),
		isSelect: types.optional(types.boolean, false),
		l: types.optional(types.number, 0),
		p: types.optional(types.number, 0),
		d: types.optional(types.number, 0),
		// config and bar will be references to other MST models or passed in
		// bar: types.late((): IAnyModelType => BarModel), // If Bar is also an MST model
	})
	.views((self) => ({
		get config(): MuseConfig {
            // 從父級 Bar 模型獲取 config
			return (getParent(self) as Instance<typeof BarModel>).config;
		},
		get bar(): Instance<typeof BarModel> {
            // 從父級獲取 Bar 模型實例
			return getParent(self) as Instance<typeof BarModel>;
		},
		get dx(): number {
			let dxx = false;
			self.subNotes.forEach((it) => {
				if (it.x !== "") {
					dxx = true;
				}
			});
			return dxx ? self.config.sigFontSize / 2 : 0;
		},
		get time(): Fraction {
			let r = new Fraction();
			r.u = 1;
			r.d *= Math.pow(2, self.l);
			r.d *= self.d;
			r.d *= Math.pow(2, self.p); //3/2 7/4 15/8
			r.u *= Math.pow(2, self.p + 1) - 1;
			return r.simplify();
		},
        // ... 其他 computed views
		get notesY(): number[] {
			let r: number[] = [];
			let ny = 0;
			self.subNotes.forEach((it, idx) => {
				if (it.t < 0) {
					if (idx !== 0) {
						let i = -it.t;
						for (; i > 0; --i) {
							let x = self.config.pointGap;
							ny += x;
						}
					}
				}
				r.push(ny);
				let h = self.config.noteHeight;
				ny += h;
				if (it.t > 0) {
					let i = it.t;
					for (; i > 0; --i) {
						let x = self.config.pointGap;
						ny += x;
					}
				}
			});
			return r;
		},
		get pointsY(): number[] {
			let r: number[] = [];
			let py = 0;
			let ny = 0;
			let mb = 0;
			mb += self.l * self.config.pointGap;
			self.subNotes.forEach((it, idx) => {
				if (it.t < 0) {
					if (idx === 0) {
						let i = -it.t;
						for (; i > 0; --i) {
							let x = self.config.pointGap;
							mb += x / 2;
							r.push(-mb);
							mb += x / 2;
						}
					}
					if (idx !== 0) {
						let i = -it.t;
						for (; i > 0; --i) {
							let x = self.config.pointGap;
							py += x / 2;
							r.push(py);
							py += x / 2;
							ny += x;
						}
					}
				}
				// Original code had this.notesY.push(ny); which is incorrect in a view/getter
				// Assuming it was meant to update 'ny' for calculations or 'r'
				// This line is removed as notesY is a computed property itself.
				let h = self.config.noteHeight;
				ny += h;
				py += h;
				if (it.t > 0) {
					let i = it.t;
					for (; i > 0; --i) {
						let x = self.config.pointGap;
						py += x / 2;
						r.push(py);
						py += x / 2;
						ny += x;
					}
				}
			});
			return r;
		},
		get tailPointsX(): number[] {
			let r: number[] = [];
			for (let i = 0; i < self.p; ++i) {
				r.push(
					self.dx + self.config.noteWidth + (i + 1 / 2) * self.config.tailPointGap
				);
			}
			return r;
		},
		get width(): number {
			return self.dx + self.config.noteWidth + self.p * self.config.tailPointGap;
		},
		get preHeight(): number {
			let h = 0;
			self.subNotes.forEach((it, idx) => {
				if (it.t < 0) {
					if (idx !== 0) {
						let i = -it.t;
						for (; i > 0; --i) {
							let x = self.config.pointGap;
							h += x;
						}
					}
				}
				h += self.config.noteHeight;
				if (it.t > 0) {
					let i = it.t;
					for (; i > 0; --i) {
						let x = self.config.pointGap;
						h += x;
					}
				}
			});
			return h;
		},
		get height(): number {
			// Assuming bar is an MST model and notesMaxHeight is a view/computed property on it
			return (self.bar as Instance<typeof BarModel>).notesMaxHeight;
		},
		get x(): number {
			// Assuming bar is an MST model and notesX is a view/computed property on it
			return (self.bar as Instance<typeof BarModel>).notesX[self.index];
		},
		get preMarginBottom(): number {
			let mb = 0;
			mb += self.l * self.config.pointGap;
			self.subNotes.forEach((it, idx) => {
				if (it.t < 0) {
					if (idx === 0) {
						let i = -it.t;
						for (; i > 0; --i) {
							let x = self.config.pointGap;
							mb += x;
						}
					}
				}
			});
			return mb;
		},
		get marginBottom(): number {
			// Assuming bar is an MST model and notesMaxMarginBottom is a view/computed property on it
			return (self.bar as Instance<typeof BarModel>).notesMaxMarginBottom;
		},
	}))
	.actions((self) => ({
		setSelect(s: boolean) {
			self.isSelect = s;
		},
		reduceLine(l: number) {
			self.l += l;
			if (self.l < 0) {
				self.l = 0;
			}
		},
		reduceTailPoint(p: number) {
			self.p += p;
			if (self.p < 0) {
				self.p = 0;
			}
		},
		addSubNote(index: number) {
			// When adding, ensure the new SubNote is created with its parent reference setup correctly.
			// In MST, the parent is automatically set when added to an array type.
			self.subNotes.splice(
				index,
				0,
				SubNoteModel.create({ x: "", n: "0", t: 0, index: self.subNotes.length })
			);
			self.subNotes.forEach((it, idx) => (it.index = idx));
		},
		removeSubNote(index: number) {
			self.subNotes.splice(index, 1);
			self.subNotes.forEach((it, idx) => (it.index = idx));
		},
		getThis() {
			return self;
		},
		decode(o: INote): void {
			if (o.n !== undefined) {
				let n: string = o.n;
				let pos = n.search("@");
				let ns = "";
				let ts = "";
				if (pos === -1) {
					ns = n;
					ts = "0|0";
				} else {
					ns = n.substr(0, pos);
					ts = n.substr(pos + 1);
				}
				let ng = ns.split("|");
				self.subNotes.clear(); // Clear existing sub-notes before decoding new ones
				ng.forEach((it, idx) => {
					for (let i = 0; i < it.length; ++i) {
						if (
							(it.charCodeAt(i) <= 57 && it.charCodeAt(i) >= 48) ||
							it.charCodeAt(i) === 45
						) {
							let x = it.substr(0, i);
							let nChar = it.charAt(i);
							let t = it.substr(i + 1).length;
							if (t !== 0 && it.charAt(i + 1) === "-") {
								t = -t;
							}
							self.subNotes.push(
								SubNoteModel.create({ x: x, n: nChar, t: t, index: idx })
							);
							break;
						}
					}
				});
				let tg = ts.split("|");
				if (tg.length === 3) {
					self.l = parseInt(tg[0]);
					self.p = parseInt(tg[1]);
					self.d = parseInt(tg[2]);
				} else if (tg.length === 2) {
					self.l = parseInt(tg[0]);
					self.p = parseInt(tg[1]);
					self.d = 1;
				} else if (tg.length === 1) {
					self.l = parseInt(tg[0]);
					self.p = 0;
					self.d = 1;
				} else {
					self.l = 0;
					self.p = 0;
					self.d = 1;
				}
			}
		},
		code(): INote {
			let ns: string = "";
			self.subNotes.forEach((it, idx) => {
				let t = "";
				if (it.t > 0) {
					for (let i = 0; i < it.t; ++i) {
						t += "+";
					}
				} else {
					for (let i = 0; i < -it.t; ++i) {
						t += "-";
					}
				}
				if (idx + 1 >= self.subNotes.length) {
					ns += `${it.x}${it.n}${t}`;
				} else {
					ns += `${it.x}${it.n}${t}|`;
				}
			});
			let n = `${ns}@${self.l}|${self.p}`;
			// The original code was missing 'd' in the coded string.
			// If 'd' is always 1 unless specified, then this might be fine.
			// If 'd' is important for encoding, it should be added.
			// For now, mirroring original.
			return { n };
		},
	}));

// Helper function for accidental symbols
function castX(x: string) {
	let m: Record<string, string> = {
		S: "#",
		F: "b",
		DS: "x",
		DF: "d",
		N: "n",
	};
	return m[x] || "";
}

/**
 * 畫高度音點
 * @param note.pointsY Y 軸的位置
 * @param clazz
 */
function pointGroup(note: Instance<typeof NoteModel>, clazz: string) {
	return (
		<g className={clazz + "__group-point"}>
			{note.pointsY.map((it, idx) => (
				<circle
					key={idx}
					r={note.config.pointRound}
					fill="black"
					transform={
						"translate(" +
						(note.dx + note.config.noteWidth / 2) +
						"," +
						(note.height - it + note.config.pointGap / 2) +
						")"
					}
				/>
			))}
		</g>
	);
}

/**
 * 畫附點音附
 * @param note
 * @param clazz
 */
function tailPoint(note: Instance<typeof NoteModel>, clazz: string) {
	return (
		<g className={clazz + "__tail-point"}>
			{note.tailPointsX.map((it, idx) => (
				<circle
					key={idx}
					r={note.config.pointRound}
					fill="black"
					transform={
						"translate(" +
						it +
						"," +
						(note.height - note.config.noteHeight / 3) +
						")"
					}
				/>
			))}
		</g>
	);
}

interface MuseSubNoteProps {
	dx: number;
	y: number;
	w: number;
	h: number;
	subNote: Instance<typeof SubNoteModel>; // Use MST instance type
}

const MuseSubNote = observer((props: MuseSubNoteProps) => {
	return (
		<g
			className={"muse-note__subnote"}
			transform={"translate(" + 0 + "," + props.y + ")"}
			width={props.w}
			height={props.h}
			onClick={() => {
				// Selector needs to be updated to work with MST instances
				Selector.instance.selectSubNote(props.subNote as SelectionSubNote);
			}}
		>
			<text
				fontFamily={props.subNote.config.noteFontFamily}
				fontSize={props.subNote.config.noteFontSize}
				transform={"translate(" + props.dx + "," + 0 + ")"}
			>
				{props.subNote.n}
			</text>
			<text
				fontFamily={props.subNote.config.noteFontFamily}
				fontSize={props.subNote.config.sigFontSize}
				transform={
					"translate(" +
					0 +
					"," +
					(props.subNote.config.sigFontSize - props.subNote.config.noteHeight) +
					")"
				}
			>
				{castX(props.subNote.x)}
			</text>
			<Border
				x={0}
				y={-props.h}
				w={props.w}
				h={props.subNote.config.noteFontSize}
				clazz={"muse-note__subnote"}
				show={props.subNote.isSelect}
			/>
		</g>
	);
});

interface MuseNoteProps {
	note: Instance<typeof NoteModel>; // Use MST instance type
}

const MuseNote = observer((props: MuseNoteProps) => {
	let clazz = "muse-note";
	return (
		<g
			className={clazz}
			transform={"translate(" + props.note.x + "," + 0 + ")"}
			width={props.note.width}
			height={props.note.height}
			onClick={() => {
				// Selector needs to be updated to work with MST instances
				Selector.instance.selectNote(props.note as SelectionNote);
			}}
		>
			<OuterBorder
				w={props.note.width}
				h={props.note.height + props.note.marginBottom}
				clazz={clazz}
				show={props.note.isSelect}
				color={"blue"}
			/>
			{props.note.subNotes.map((it, idx) => (
				<MuseSubNote
					key={idx}
					dx={props.note.dx}
					y={props.note.height - props.note.notesY[idx]}
					w={props.note.width}
					h={22} // This 'h' value (22) is hardcoded, consider making it dynamic from config if it varies
					subNote={it}
				/>
			))}
			{pointGroup(props.note, clazz)}
			{tailPoint(props.note, clazz)}
		</g>
	);
});

export default MuseNote;