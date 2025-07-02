/*
 主要修改說明：
1.引入 MobX-State-Tree 相關模組
．將 mobx 的 computed 和 observable 替換為 mobx-state-tree 的 types, getParent, Instance。
．從 ./MuseTrack 引入 TrackModel 和 ITrack 介面，因為 Track 現在是一個 MST 模型。
．假設 Page 也會被轉換為 MST 模型，所以引入 PageModel。
2.定義 LineModel
．使用 types.model("Line", { ... }) 來定義 Line 的狀態結構。
．屬性轉換：
	--原先的 @observable index: number; 變為 index: types.number,。
	--原先的 @observable tracks: Track[] = []; 變為 tracks: types.array(TrackModel),。這表示 tracks 是一個包含 TrackModel 實例的陣列，MST 會自動管理這些子模型的生命週期。
	--isSelect 變為 isSelect: types.optional(types.boolean, false),。
．視圖 (Views)：
	--原先的 @computed getter 變為 views((self) => ({ ... })) 中的屬性。
	--self 關鍵字用於訪問模型實例自身的屬性。
	--config 和 page 現在透過 getParent 來獲取。這要求 PageModel 在狀態樹中是 LineModel 的父級。
．動作 (Actions)：
	--原先的方法（如 addTrack, removeTrack, setSelect, decode, code）變為 actions((self) => ({ ... })) 中的方法。
	--在 addTrack 中，現在使用 TrackModel.create({ ... }) 來建立新的 Track 實例，並將其推入 self.tracks 陣列。
	--在 decode 中，先使用 self.tracks.clear() 清空現有軌道，然後遍歷傳入的數據，並使用 TrackModel.create() 創建新的 Track 實例並添加到 self.tracks 中。
	--removeTrack 現在直接使用 splice 移除陣列元素，因為 types.array 提供了 MobX 陣列的所有方法。
．移除建構子：MST 模型不需要傳統的建構子。初始化邏輯（例如 decode(o)）應該在模型的 afterCreate 生命週期鉤子中執行，或者在外部創建模型實例時作為初始化數據傳入 Model.create()。在這裡，decode 被保留為一個動作，用於從外部數據載入。
3.React 元件更新
．IMuseLineProps: 現在 line 屬性的型別是 Instance<typeof LineModel>，確保類型檢查正確。
．MuseLine 元件：
	--將原有的 Class Component 轉換為 Functional Component，這是現代 React 開發的趨勢，也與 observer 的函數式用法更搭配。
	--this.props.line 現在直接變成 props.line。
	--確保所有訪問 props.line 屬性的地方都遵循 MST 的視圖和動作模式。
這些更改將 MuseLine.tsx 完全整合到 MobX-State-Tree 的模式中，提供更強大的狀態管理能力和更好的型別安全。
 
 */

import React from "react";
import MuseConfig from "./MuseConfig";
import MuseTrack from "./MuseTrack"; // 引入 MuseTrack 元件 (現在它接受 TrackModel)
import { ITrack, TrackModel } from "./MuseTrack"; // 引入 TrackModel 和 ITrack 介面
import { Border } from "./Border";
import Codec from "./Codec"; // 假設 Codec 介面保持不變
import { types, getParent, Instance } from "mobx-state-tree"; // 引入 MobX-State-Tree 相關
import { observer } from "mobx-react";
import { PageModel } from "./MusePage"; // 假設 MusePage 也會被轉換為 MST 模型
import { SelectionLine } from "./Selector"; // Selector 也要更新以處理 MST 實例

// IPage --> ILine --> ITrack --> IBar --> INote --> SubNote
export interface ILine {
	tracks: ITrack[];
}

// Line Model
export const LineModel = types
	.model("Line", {
		index: types.number,
		tracks: types.array(TrackModel), // tracks 現在是 TrackModel 的實例陣列
		isSelect: types.optional(types.boolean, false),
		// config 和 page 會是引用，通常透過 getParent 或 environment 獲取
	})
	.views((self) => ({
		get config(): MuseConfig {
			// 假設 config 是從 Page 模型獲得的 (Page -> Line -> Track)
			return (getParent(self) as Instance<typeof PageModel>).config;
		},
		get page(): Instance<typeof PageModel> {
			return getParent(self) as Instance<typeof PageModel>;
		},
		get width(): number {
			return this.page.width;
		},
		get height(): number {
			let h = 0;
			self.tracks.forEach((it) => {
				h += it.height + self.config.trackGap;
			});
			h -= self.config.trackGap;
			return h;
		},
		get x(): number {
			return this.page.x;
		},
		get y(): number {
			return this.page.linesY[self.index];
		},
		get tracksY(): number[] {
			let y = 0;
			return self.tracks.map((it) => {
				let r = y;
				y += it.height + self.config.trackGap;
				return r;
			});
		},
	}))
	.actions((self) => ({
		addTrack(index: number) {
			// 使用 TrackModel.create() 創建新實例
			self.tracks.splice(
				index,
				0,
				TrackModel.create({ bars: [{ notes: [{ n: "0" }] }], index: self.tracks.length })
			);
			self.tracks.forEach((it, idx) => (it.index = idx));
		},
		removeTrack(index: number) {
			// 移除元素
			self.tracks.splice(index, 1);
			self.tracks.forEach((it, idx) => (it.index = idx));
		},
		setSelect(s: boolean) {
			self.isSelect = s;
		},
		getThis() {
			return self;
		},
		decode(o: ILine): void {
			if (o.tracks !== undefined) {
				self.tracks.clear(); // 清空現有的 tracks
				o.tracks.forEach((it: ITrack, idx) => {
					// 對於每個 Track，創建一個新的 TrackModel 實例
					self.tracks.push(TrackModel.create({ ...it, index: idx }));
				});
			}
		},
		code(): ILine {
			let tracks: ITrack[] = self.tracks.map((it) => it.code());
			return { tracks };
		},
	}));

// React Components
const LineHead: React.FC<{ height: number; clazz: string }> = observer( // LineHead 也可以是 observer
	({
		height,
		clazz,
	}: {
		height: number;
		clazz: string;
	}) => {
		return (
			<g className={clazz + "__line-head"}>
				<line x1={0} y1={0} x2={0} y2={height} strokeWidth={1} stroke="black" />
			</g>
		);
	}
);

interface IMuseLineProps {
	line: Instance<typeof LineModel>; // 使用 Instance<typeof LineModel>
}

const MuseLine = observer((props: IMuseLineProps) => { // 將 Class Component 轉換為 Functional Component
	const StyleCursor = {
		cursor: "pointer",
	};
	let clazz = "muse-line";
	return (
		<g
			className={clazz}
			transform={"translate(" + props.line.x + "," + props.line.y + ")"}
			style={StyleCursor}
			width={props.line.width}
			height={props.line.height}
		>
			<Border
				w={props.line.width}
				h={props.line.height}
				x={0}
				y={0}
				clazz={clazz}
				show={props.line.isSelect}
			/>
			<LineHead height={props.line.height} clazz={clazz} />
			{props.line.tracks.map((it, idx) => (
				<MuseTrack key={idx} track={it} />
			))}
		</g>
	);
});

export default MuseLine;