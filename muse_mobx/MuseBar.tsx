/**
 主要修改說明：
1.引入 MobX-State-Tree 相關模組
	．將 mobx 的 computed 和 observable 替換為 mobx-state-tree 的 types, getParent, Instance。
	．從 MuseNote 引入 NoteModel 而非 Note 類別，因為 Note 現在是一個 MST 模型。
2.定義 BarModel
	．使用 types.model("Bar", { ... }) 來定義 Bar 的狀態結構。
	．屬性轉換：
		-原先的 @observable index: number; 變為 index: types.number,。
		-原先的 @observable notes: Note[] = []; 變為 notes: types.array(NoteModel),。這表示 notes 是一個包含 NoteModel 實例的陣列，MST 會自動管理這些子模型的生命週期。
		-isSelect 變為 isSelect: types.optional(types.boolean, false),。
	．視圖 (Views)：
		-原先的 @computed getter 變為 views((self) => ({ ... })) 中的屬性。
		-self 關鍵字用於訪問模型實例自身的屬性。
		-config 和 track 現在透過 getParent 來獲取。這要求 MuseTrack 也應該被轉換為 MST 模型（例如 TrackModel），並且在狀態樹中 BarModel 是 TrackModel 的子級。
	．動作 (Actions)：
		-原先的方法（如 addNote, removeNote, setSelect, decode, code）變為 actions((self) => ({ ... })) 中的方法。
		-在 addNote 中，現在使用 NoteModel.create({ ... }) 來建立新的 Note 實例，並將其推入 self.notes 陣列。
		-在 decode 中，先使用 self.notes.clear() 清空現有筆記，然後遍歷傳入的數據，並使用 NoteModel.create() 創建新的 Note 實例並添加到 self.notes 中。
		-removeNote 現在直接使用 splice 移除陣列元素，因為 types.array 提供了 MobX 陣列的所有方法。
	．移除建構子：MST 模型不需要傳統的建構子。初始化邏輯（例如 decode(o)）應該在模型的 afterCreate 生命週期鉤子中執行，或者在外部創建模型實例時作為初始化數據傳入 Model.create()。在這裡，decode 被保留為一個動作，用於從外部數據載入。
3.React 元件更新
	．IMuseBarProps: 現在 bar 屬性的型別是 Instance<typeof BarModel>，確保類型檢查正確。
	．BaseLine 元件：其 bar prop 的型別也更新為 Instance<typeof BarModel>。
	．MuseBar 元件：
		-將原有的 Class Component 轉換為 Functional Component，這是現代 React 開發的趨勢，也與 observer 的函數式用法更搭配。
		-this.props.bar 現在直接變成 props.bar。
		-確保所有訪問 props.bar 屬性的地方都遵循 MST 的視圖和動作模式。

4.MuseConfig 和 Track 的處理
	．與 MuseNote.tsx 類似，為了最佳實踐，MuseConfig 和 Track 也應該被轉換為 MST 模型。在本例中，我假設存在一個 TrackModel 並從 ./MuseTrack 導入。

這些更改將 MuseBar.tsx 完全整合到 MobX-State-Tree 的模式中，提供更強大的狀態管理能力和更好的型別安全。
 
 */

import React from "react";
import MuseConfig from "./MuseConfig";
import MuseNote, { INote, NoteModel } from "./MuseNote"; // 引入 NoteModel
import { Border } from "./Border";
import Codec from "./Codec"; // Assuming Codec interface remains
import { types, getParent, Instance } from "mobx-state-tree"; // 引入 MobX-State-Tree 相關
import { observer } from "mobx-react";
import Fraction from "./Fraction"; // Assuming Fraction is a utility class/object
import { TrackModel } from "./MuseTrack"; // 假設 MuseTrack 也會被轉換為 MST 模型
import { SelectionBar } from "./Selector"; // Selector 也要更新以處理 MST 實例

interface Baseline {
	y: number;
	s: number;
	e: number;
}

// IPage --> ILine --> ITrack --> IBar --> INote --> SubNote
export interface IBar {
	notes: INote[];
}

// Bar Model
export const BarModel = types
	.model("Bar", {
		index: types.number,
		notes: types.array(NoteModel), // notes 現在是 NoteModel 的實例陣列
		isSelect: types.optional(types.boolean, false),
		// config 和 track 會是引用，通常透過 getParent 或 environment 獲取
	})
	.views((self) => ({
		get config(): MuseConfig {
			// 假設 config 是從 Track 模型獲得的
			return (getParent(self) as Instance<typeof TrackModel>).config;
		},
		get track(): Instance<typeof TrackModel> {
			return getParent(self) as Instance<typeof TrackModel>;
		},
		get width(): number {
			return this.track.barsWidth[self.index];
		},
		get height(): number {
			let h = 0;
			self.notes.forEach((it) => {
				let u = it.height + it.marginBottom;
				h = u > h ? u : h;
			});
			return h;
		},
		get x(): number {
			return this.track.barsX[self.index];
		},
		get y(): number {
			return 0;
		},
		get notesTime(): Fraction[] {
			return self.notes.map((it) => it.time);
		},
		get notesTimeSum(): Fraction {
			return self.notesTime
				.reduce((a, b) => a.plus(b), new Fraction())
				.plus(new Fraction().init(1, 1));
		},
		get notesWidth(): number[] {
			return self.notes.map((it) => it.width);
		},
		get notesX(): number[] {
			let space = this.width - this.notesWidthSum;
			let unit = new Fraction().init(space, 1).divide(this.notesTimeSum);
			console.log(
				`space ${space}  this.width ${this.width}  this.notesWidthSum ${this.notesWidthSum}`
			);
			let x = unit.toNumber();
			return self.notesWidth.map((it, idx) => {
				let r = x;
				x += it + self.notesTime[idx].multiply(unit).toNumber();
				return r;
			});
		},
		get preNotesMaxHeight(): number {
			return Math.max(...self.notes.map((it) => it.preHeight));
		},
		get notesMaxHeight(): number {
			// 假設 notesMaxHeight 也在 Track 模型中
			return this.track.notesMaxHeight;
		},
		get preNotesMaxMarginBottom(): number {
			return Math.max(...self.notes.map((it) => it.preMarginBottom));
		},
		get notesMaxMarginBottom(): number {
			// 假設 notesMaxMarginBottom 也在 Track 模型中
			return this.track.notesMaxMarginBottom;
		},
		get baselineGroup(): Baseline[] {
			let r: {
				y: number;
				s: number;
				e: number;
			}[] = [];
			for (let i = 0; ; ++i) {
				let x = 0;
				let s = 0;
				let e = -1;
				self.notes.forEach((it, idx) => {
					if (it.l > i) {
						e = idx;
						x++;
					} else {
						if (s <= e) r.push({ y: i, s: s, e: e });
						s = idx + 1;
						e = idx;
					}
				});
				if (s <= e) r.push({ y: i, s: s, e: e });
				if (x === 0) {
					break;
				}
			}
			return r;
		},
		get notesWidthSum(): number {
			let w = 0;
			self.notes.forEach((it) => (w += it.width));
			return w;
		},
	}))
	.actions((self) => ({
		addNote(index: number) {
			// 使用 NoteModel.create() 創建新實例
			self.notes.splice(index, 0, NoteModel.create({ n: "0", index: self.notes.length }));
			self.notes.forEach((it, idx) => (it.index = idx));
		},
		removeNote(index: number) {
			// 移除元素
			self.notes.splice(index, 1);
			self.notes.forEach((it, idx) => (it.index = idx));
		},
		setSelect(i: boolean) {
			self.isSelect = i;
		},
		getThis() {
			return self;
		},
		decode(o: IBar): void {
			if (o.notes !== undefined) {
				self.notes.clear(); // 清空現有的 notes
				o.notes.forEach((it: INote, idx) => {
					self.notes.push(NoteModel.create({ ...it, index: idx })); // 將 INote 數據傳給 create
				});
			}
		},
		code(): IBar {
			let notes: INote[] = self.notes.map((it) => it.code());
			return { notes };
		},
	}));

// React Components
const BarLine: React.FC<{ w: number; h: number; clazz: string }> = observer(
	(props: { w: number; h: number; clazz: string }) => {
		let [width, height] = [props.w, props.h];

		return (
			<line
				className={props.clazz + "__bar-line"}
				x1={width}
				y1={0}
				x2={width}
				y2={height}
				strokeWidth={1}
				stroke="black"
			/>
		);
	}
);

const BaseLine: React.FC<{ bar: Instance<typeof BarModel>; clazz: string }> = observer( // 使用 Instance<typeof BarModel>
	({
		bar,
		clazz,
	}: {
		bar: Instance<typeof BarModel>; // 使用 Instance<typeof BarModel>
		clazz: string;
	}) => {
		const baselineGroup = bar.baselineGroup;
		const notes = bar.notes;
		return (
			<g className={clazz + "__base-line"}>
				{baselineGroup.map((it, idx) => (
					<line
						key={idx}
						x1={notes[it.s].x}
						y1={notes[it.s].height + (it.y + 1) * bar.config.pointGap}
						x2={notes[it.e].x + bar.notes[it.e].width}
						y2={notes[it.s].height + (it.y + 1) * bar.config.pointGap}
						stroke={"black"}
						strokeWidth={1}
					/>
				))}
			</g>
		);
	}
);

interface IMuseBarProps {
	bar: Instance<typeof BarModel>; // 使用 Instance<typeof BarModel>
}

const MuseBar = observer((props: IMuseBarProps) => { // 將 class component 轉換為 functional component
	let notes = props.bar.notes;
	let clazz = "muse-bar";
	return (
		<g
			className={clazz}
			transform={"translate(" + props.bar.x + "," + props.bar.y + ")"}
			width={props.bar.width}
			height={props.bar.height}
		>
			<Border
				w={props.bar.width}
				h={props.bar.height}
				x={0}
				y={0}
				clazz={clazz}
				show={props.bar.isSelect}
			/>
			<BarLine w={props.bar.width} h={props.bar.height} clazz={clazz} />
			{notes.map((it, idx) => (
				<MuseNote key={idx} note={it} />
			))}
			<BaseLine bar={props.bar} clazz={clazz} />
		</g>
	);
});

export default MuseBar;