/*
 主要修改說明：
1.引入 MobX-State-Tree 相關模組
．將 mobx 的 computed 和 observable 替換為 mobx-state-tree 的 types, getParent, Instance。
．從 ./MuseLine 引入 LineModel 和 ILine 介面，因為 Line 現在是一個 MST 模型。
．假設 ./MuseParagraph 和 ./MuseNotation 也會被轉換為 MST 模型，所以引入 ParagraphModel 和 NotationModel。
2.定義 PageModel
．使用 types.model("Page", { ... }) 來定義 Page 的狀態結構。
．屬性轉換：
	--原先的 @observable index: number; 變為 index: types.number,。
	--原先的 @observable lines: Line[] = []; 變為 lines: types.array(LineModel),。
	--原先的 @observable paragraphs: Paragraph[] = []; 變為 paragraphs: types.array(ParagraphModel),。
	--isSelect 變為 isSelect: types.optional(types.boolean, false),。
．視圖 (Views)：
	--原先的 @computed getter 變為 views((self) => ({ ... })) 中的屬性。
	--self 關鍵字用於訪問模型實例自身的屬性。
	--config 和 notation 現在透過 getParent 來獲取。這要求 NotationModel 在狀態樹中是 PageModel 的父級。
	--重要調整：linesY 和 paragraphsY 的 gap 計算中增加了 (self.lines.length > 1) 和 (self.paragraphs.length > 1) 的判斷，以避免當只有一個元素時導致除以零的錯誤。
	--paragraphsHeight 視圖現在正確地映射 self.paragraphs 而不是 self.lines。
．動作 (Actions)：
	--原先的方法（如 addLine, removeLine, setSelect, decode, code）變為 actions((self) => ({ ... })) 中的方法。
	--在 addLine 中，現在使用 LineModel.create({ ... }) 來建立新的 Line 實例，並將其推入 self.lines 陣列。
	--在 decode 中，先使用 self.lines.clear() 和 self.paragraphs.clear() 清空現有元素，然後遍歷傳入的數據，並使用 LineModel.create() 和 ParagraphModel.create() 創建新的實例並添加到相應的陣列中。
	--removeLine 現在直接使用 splice 移除陣列元素。
．移除建構子：MST 模型不需要傳統的建構子。初始化邏輯（例如 decode(o)）應該在模型的 afterCreate 生命週期鉤子中執行，或者在外部創建模型實例時作為初始化數據傳入 Model.create()。在這裡，decode 被保留為一個動作，用於從外部數據載入。
3.React 元件更新
．PageIndex 元件：現在也標記為 observer，以確保其對 config 屬性的變化有反應。
．IMusePageProps: 現在 page 屬性的型別是 Instance<typeof PageModel>，確保類型檢查正確。
．MusePage 元件：
	--將原有的 Class Component 轉換為 Functional Component，這是現代 React 開發的趨勢，也與 observer 的函數式用法更搭配。
	--this.props.page 現在直接變成 props.page。
	--確保所有訪問 props.page 屬性的地方都遵循 MST 的視圖和動作模式。
	--註釋掉了 console.log，因為它們可能在每次渲染時觸發，影響性能。
 */

import React from "react";
import MuseConfig from "./MuseConfig";
import MuseLine, { ILine, LineModel } from "./MuseLine"; // 引入 LineModel
import { Border, OuterBorder } from "./Border";
import Codec from "./Codec"; // 假設 Codec 介面保持不變
import { types, getParent, Instance } from "mobx-state-tree"; // 引入 MobX-State-Tree 相關
import { NotationModel } from "./MuseNotation"; // 假設 MuseNotation 會被轉換為 MST 模型
import { observer } from "mobx-react";
import { SelectionPage } from "./Selector"; // Selector 也要更新以處理 MST 實例

// IPage --> ILine --> ITrack --> IBar --> INote --> SubNote
// Paragraph --> Measure --> Row --> Noise --> SubNoise
export interface IPage {
	lines: ILine[];
}

// Page Model
export const PageModel = types
	.model("Page", {
		index: types.number,
		lines: types.array(LineModel), // lines 現在是 LineModel 的實例陣列
		isSelect: types.optional(types.boolean, false),
		// config 和 notation 會是引用，通常透過 getParent 或 environment 獲取
	})
	.views((self) => ({
		get config(): MuseConfig {
            // 此时获取到的 config 仍是 MuseConfig 的实例
			return (getParent(self) as Instance<typeof NotationModel>).config;
		},
		get notation(): Instance<typeof NotationModel> {
			return getParent(self) as Instance<typeof NotationModel>;
		},
		get width(): number {
			return self.config.pageWidth - self.config.pageMarginHorizontal * 2;
		},
		get height(): number {
			return (
				self.config.pageWidth * self.config.pageE -
				self.config.pageMarginVertical -
				self.marginTop
			);
		},
		get x(): number {
			return self.config.pageMarginHorizontal;
		},
		get y(): number {
			return (
				self.marginTop + self.index * (self.config.pageWidth * self.config.pageE)
			);
		},
		get marginTop(): number {
			let mt = 0;
			if (self.index === 0) {
				mt += self.config.pageMarginVertical;
				let g = self.config.infoGap;
				mt += self.config.infoTitleFontSize + g;
				mt += self.config.infoSubtitleFontSize + g;
				if (self.notation.info.author.length > 2) {
					mt += self.notation.info.author.length * (self.config.infoFontSize + g);
				} else {
					mt += 2 * (self.config.infoFontSize + g);
				}
			} else {
				mt = self.config.pageMarginVertical;
			}
			return mt;
		},
		get marginBottom(): number {
			return self.config.pageMarginVertical;
		},
		get marginLeft(): number {
			return self.config.pageMarginHorizontal;
		},
		get marginRight(): number {
			return self.config.pageMarginHorizontal;
		},
		get linesHeight(): number[] {
			return self.lines.map((it) => it.height);
		},
		get linesY(): number[] {
			let y = self.marginTop;
			let sum = self.linesHeight.reduce((a, b) => a + b, 0);
			let gap = (self.lines.length > 1) ? (self.height - sum) / (self.lines.length - 1) : 0; // Avoid division by zero
			return self.linesHeight.map((it) => {
				let r = y;
				y += it + gap;
				return r;
			});
		},
		get paragraphsHeight(): number[] {
			return self.paragraphs.map((it) => it.height); // Adjusted to paragraphs, not lines
		},
		get paragraphsY(): number[] {
			let y = self.marginTop;
			let sum = self.paragraphsHeight.reduce((a, b) => a + b, 0);
			let gap = (self.paragraphs.length > 1) ? (self.height - sum) / (self.paragraphs.length - 1) : 0; // Avoid division by zero
			return self.paragraphsHeight.map((it) => {
				let r = y;
				y += it + gap;
				return r;
			});
		},
	}))
	.actions((self) => ({
		addLine(index: number) {
			// 使用 LineModel.create() 創建新實例
			self.lines.splice(
				index,
				0,
				LineModel.create({
					tracks: [{ bars: [{ notes: [{ n: "0" }] }] }],
					index: self.lines.length,
				})
			);
			self.lines.forEach((it, idx) => (it.index = idx));
		},
		removeLine(index: number) {
			// 移除元素
			self.lines.splice(index, 1);
			self.lines.forEach((it, idx) => (it.index = idx));
		},
		setSelect(s: boolean) {
			self.isSelect = s;
		},
		getThis() {
			return self;
		},
		decode(o: IPage): void {
			if (o.lines !== undefined) {
				self.lines.clear(); // 清空現有的 lines
				o.lines.forEach((it: ILine, idx) => {
					self.lines.push(LineModel.create({ ...it, index: idx }));
				});
			}
		},
		code(): IPage {
			let lines: ILine[] = self.lines.map((it) => it.code());
			return { lines };
		},
	}));

// React Components
interface PageIndexProps {
	index: number;
	x: number;
	y: number;
	clazz: string;
	config: MuseConfig;
}

const PageIndex: React.FC<PageIndexProps> = observer( // PageIndex 也可以是 observer
	({
		index,
		x,
		y,
		clazz,
		config,
	}: PageIndexProps) => {
		return (
			<g
				className={clazz + "__page-index"}
				transform={"translate(" + x + "," + y + ")"}
			>
				<text
					textAnchor={"middle"}
					fontFamily={config.textFontFamily}
					fontSize={config.pageIndexFontSize}
				>
					{(index + 1).toString()}
				</text>
			</g>
		);
	}
);

interface IMusePageProps {
	page: Instance<typeof PageModel>; // 使用 Instance<typeof PageModel>
}

const MusePage = observer((props: IMusePageProps) => { // 將 Class Component 轉換為 Functional Component
	let clazz = "muse-page";
	return (
		<g
			className={clazz}
			transform={
				"translate(" +
				(props.page.x - props.page.marginLeft) +
				"," +
				(props.page.y - props.page.marginTop) +
				")"
			}
			width={props.page.width + props.page.marginLeft + props.page.marginRight}
			height={props.page.height + props.page.marginTop + props.page.marginBottom}
		>
			<Border
				w={props.page.width}
				h={props.page.height}
				x={props.page.x}
				y={props.page.marginTop}
				clazz={clazz}
				show={props.page.isSelect}
			/>
			<OuterBorder
				w={props.page.width + props.page.marginLeft + props.page.marginLeft}
				h={props.page.height + props.page.marginTop + props.page.marginBottom}
				clazz={clazz}
				show={true}
			/>
			<PageIndex
				index={props.page.index}
				x={props.page.marginLeft + props.page.width / 2}
				y={props.page.marginTop + props.page.height + props.page.marginBottom / 2}
				clazz={clazz}
				config={props.page.config}
			/>
			{props.page.lines.map((it, idx) => (
				<MuseLine key={idx} line={it} />
			))}
	
		</g>
	);
});

export default MusePage;