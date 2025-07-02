/*
 主要修改說明：
1.引入 MobX-State-Tree 相關模組
．將 mobx 的 computed 和 observable 替換為 mobx-state-tree 的 types, getParent, Instance.
．從 ./MuseBar 引入 BarModel 和 IBar 介面，因為 Bar 現在是一個 MST 模型.
．假設 Line 也會被轉換為 MST 模型，所以引入 LineModel.
2.定義 TrackModel
．使用 types.model("Track", { ... }) 來定義 Track 的狀態結構.
．屬性轉換：
	--原先的 @observable index: number; 變為 index: types.number,.
	--原先的 @observable bars: Bar[] = []; 變為 bars: types.array(BarModel),。這表示 bars 是一個包含 BarModel 實例的陣列，MST 會自動管理這些子模型的生命週期.
	--isSelect 變為 isSelect: types.optional(types.boolean, false),.
．視圖 (Views)：
	--原先的 @computed getter 變為 views((self) => ({ ... })) 中的屬性.
	--self 關鍵字用於訪問模型實例自身的屬性.
	--config 和 line 現在透過 getParent 來獲取。這要求 LineModel 在狀態樹中是 TrackModel 的父級.
．動作 (Actions)：
	--原先的方法（如 addBar, removeBar, setSelect, decode, code）變為 actions((self) => ({ ... })) 中的方法.
	--在 addBar 中，現在使用 BarModel.create({ ... }) 來建立新的 Bar 實例，並將其推入 self.bars 陣列.
	--在 decode 中，先使用 self.bars.clear() 清空現有小節，然後遍歷傳入的數據，並使用 BarModel.create() 創建新的 Bar 實例並添加到 self.bars 中.
removeBar 現在直接使用 splice 移除陣列元素，因為 types.array 提供了 MobX 陣列的所有方法.
．移除建構子：MST 模型不需要傳統的建構子。初始化邏輯（例如 decode(o)）應該在模型的 afterCreate 生命週期鉤子中執行，或者在外部創建模型實例時作為初始化數據傳入 Model.create()。在這裡，decode 被保留為一個動作，用於從外部數據載入.
3.React 元件更新
	．IMuseTrackProps: 現在 track 屬性的型別是 Instance<typeof TrackModel>，確保類型檢查正確.
	．MuseTrack 元件：
		--將原有的 Class Component 轉換為 Functional Component，這是現代 React 開發的趨勢，也與 observer 的函數式用法更搭配.
		--this.props.track 現在直接變成 props.track.
		--確保所有訪問 props.track 屬性的地方都遵循 MST 的視圖和動作模式.
 */
import React from "react";
import MuseConfig from "./MuseConfig";
import MuseBar from "./MuseBar"; // 引入 MuseBar 元件 (現在它接受 BarModel)
import { BarModel, IBar } from "./MuseBar"; // 引入 BarModel 和 IBar 介面
import { Border } from "./Border";
import Codec from "./Codec"; // 假設 Codec 介面保持不變
import { types, getParent, Instance } from "mobx-state-tree"; // 引入 MobX-State-Tree 相關
import { LineModel } from "./MuseLine"; // 假設 MuseLine 也會被轉換為 MST 模型
import Fraction from "./Fraction"; // 假設 Fraction 是一個工具類/對象
import { observer } from "mobx-react";
import { SelectionTrack } from "./Selector"; // Selector 也要更新以處理 MST 實例

// IPage --> ILine --> ITrack --> IBar --> INote --> SubNote
export interface ITrack {
	bars: IBar[];
}

// Track Model
export const TrackModel = types
	.model("Track", {
		index: types.number,
		bars: types.array(BarModel), // bars 現在是 BarModel 的實例陣列
		isSelect: types.optional(types.boolean, false),
		// config 和 line 會是引用，通常透過 getParent 或 environment 獲取
	})
	.views((self) => ({
		get config(): MuseConfig {
			// 假設 config 是從 Line 模型獲得的 (Line -> Track -> Bar)
			return (getParent(self) as Instance<typeof LineModel>).config;
		},
		get line(): Instance<typeof LineModel> {
			return getParent(self) as Instance<typeof LineModel>;
		},
		get width(): number {
			return this.line.width;
		},
		get height(): number {
			let h = 0;
			self.bars.forEach((it) => {
				h = it.height > h ? it.height : h;
			});
			return h;
		},
		get x(): number {
			return 0;
		},
		get y(): number {
			return this.line.tracksY[self.index];
		},
		get barsTime(): Fraction[] {
			return self.bars.map((it) => it.notesTimeSum);
		},
		get barsWidth(): number[] {
			let timeSum = self.barsTime.reduce((a, b) => a.plus(b), new Fraction());
			let space = self.width - self.notesWidthSum;
			let unit = new Fraction().init(space, 1).divide(timeSum);
			return self.barsNotesWidth.map((it, idx) => {
				return it + self.barsTime[idx].multiply(unit).toNumber();
			});
		},
		get barsX(): number[] {
			let x = 0;
			return self.barsWidth.map((it) => {
				let r = x;
				x += it;
				return r;
			});
		},
		get notesMaxHeight(): number {
			return Math.max(...self.bars.map((it) => it.preNotesMaxHeight));
		},
		get notesMaxMarginBottom(): number {
			return Math.max(...self.bars.map((it) => it.preNotesMaxMarginBottom));
		},
		get notesWidthSum(): number {
			return self.barsNotesWidth.reduce((a, b) => a + b, 0);
		},
		get barsNotesWidth(): number[] {
			return self.bars.map((it) => it.notesWidthSum);
		},
	}))
	.actions((self) => ({
		addBar(index: number) {
			// 使用 BarModel.create() 創建新實例
			self.bars.splice(
				index,
				0,
				BarModel.create({ notes: [{ n: "0" }], index: self.bars.length })
			);
			self.bars.forEach((it, idx) => (it.index = idx));
		},
		removeBar(index: number) {
			// 移除元素
			self.bars.splice(index, 1);
			self.bars.forEach((it, idx) => (it.index = idx));
		},
		setSelect(s: boolean) {
			self.isSelect = s;
		},
		getThis() {
			return self;
		},
		decode(o: ITrack): void {
			if (o.bars !== undefined) {
				self.bars.clear(); // 清空現有的 bars
				o.bars.forEach((it: IBar, idx) => {
					// 對於每個 Bar，創建一個新的 BarModel 實例
					self.bars.push(BarModel.create({ ...it, index: idx }));
				});
			}
		},
		code(): ITrack {
			let bars: IBar[] = self.bars.map((it) => it.code());
			return { bars };
		},
	}));

// React Component
interface IMuseTrackProps {
	track: Instance<typeof TrackModel>; // 使用 Instance<typeof TrackModel>
}

const MuseTrack = observer((props: IMuseTrackProps) => {
	let clazz = "muse-track";
	return (
		<g
			className={clazz}
			transform={
				"translate(" + props.track.x + "," + props.track.y + ")"
			}
			width={props.track.width}
			height={props.track.height}
		>
			<Border
				w={props.track.width}
				h={props.track.height}
				x={0}
				y={0}
				clazz={clazz}
				show={props.track.isSelect}
			/>
			{props.track.bars.map((it, idx) => (
				<MuseBar key={idx} bar={it} />
			))}
		</g>
	);
});

export default MuseTrack;