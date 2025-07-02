/*
 主要修改說明：
1.定義 NotationInfoModel
．將原來的 NotationInfo 類別轉換為 MST 模型。
．屬性轉換：title, subtitle, rhythmic, speed, C 都定義為 types.string。author 由於其複雜性（原始是字串陣列），定義為 types.array(types.string)。
．動作 (Actions)：為 NotationInfoModel 添加 decode 和 code 動作，用於處理從原始 INotation 介面到模型屬性之間的轉換（特別是 author 的字串分割和合併）。
2.定義 NotationModel
．使用 types.model("Notation", { ... }) 來定義 Notation 的狀態結構。
．屬性轉換：
	--pages: types.array(PageModel)，表示包含 PageModel 實例的陣列。
	--isSelect: types.optional(types.boolean, false)。
	--info: 現在是 NotationInfoModel 的實例。這顯示了 MST 如何將模型嵌套起來。
	--config: 這裡將 MuseConfig 定義為 types.frozen<MuseConfig>()。這意味著 MuseConfig 實例將被 MST 視為不可變的 JavaScript 對象，其內部屬性的更改不會觸發 MobX 的反應性。如果 MuseConfig 的屬性需要反應性（例如，更改字體大小會導致整個符號重新渲染），那麼 MuseConfig 本身也需要被轉換為一個 MST 模型。
．視圖 (Views)：原來的 @computed getter 轉換為 views。
．動作 (Actions)：
	--addPage, removePage, setSelect, getThis 等方法被轉換為 actions。
	--addPage 中，現在使用 PageModel.create() 來創建新的 Page 實例。
	--decode 方法的變化：它現在會呼叫 self.info.decode(o) 來處理 NotationInfo 相關的數據，並像之前一樣，清空 self.pages 並重新創建 PageModel 實例。
	--code 方法的變化：它會呼叫 self.info.code() 來獲取 NotationInfo 的編碼數據，並將其與 pages 的編碼數據合併。
．afterCreate 生命周期鉤子：這是一個 MST 的特殊鉤子，在模型實例被創建後立即調用。這裡可以放一些初始化邏輯，例如設置 config 引用。
3.React 元件更新
．MuseNotationInfo 元件：
	--轉換為 Functional Component。
	--Props 中的 info 型別更改為 Instance<typeof NotationInfoModel>。
	--確保所有訪問 info 屬性的地方都正確使用 MST 實例。
．IMuseNotationProps: 現在 notation 屬性的型別是 Instance<typeof NotationModel> | null，確保類型檢查正確。
．MuseNotation 元件：
	--轉換為 Functional Component。
	--添加了對 notation 是否為 null 的檢查，如果為 null 則返回 null。
	--this.props.notation 現在直接變成 notation。
確保所有訪問 notation 屬性的地方都遵循 MST 的視圖和動作模式。
 */

import React from "react";
import MuseConfig from "./MuseConfig"; // 假設 MuseConfig 仍然是普通的類別
import MusePage, { IPage, PageModel } from "./MusePage"; // 引入 PageModel
import { Border, OuterBorder } from "./Border"; // Border 和 OuterBorder 可能是獨立元件
import Codec from "./Codec"; // 假設 Codec 介面保持不變
import { types, Instance, cast } from "mobx-state-tree"; // 引入 MobX-State-Tree 相關
import { observer } from "mobx-react";
import { SelectionNotation } from "./Selector"; // Selector 也要更新以處理 MST 實例

// Notation --> Page --> Paragraph --> Measure --> Row --> Note  --> SubNote

// NotationInfo Model
export const NotationInfoModel = types
	.model("NotationInfo", {
		title: types.optional(types.string, ""),
		subtitle: types.optional(types.string, ""),
		author: types.optional(types.array(types.string), []), // 作者現在是字串陣列
		rhythmic: types.optional(types.string, ""),
		speed: types.optional(types.string, ""),
		C: types.optional(types.string, ""),
	})
	.actions((self) => ({
		// decode 方法用於從原始數據載入信息
		decode(infoData: any) {
			self.title = infoData.title || "";
			self.subtitle = infoData.subtitle || "";
			self.author = infoData.author ? infoData.author.split("|") : []; // 分割作者字串
			self.rhythmic = infoData.rhythmic || "";
			self.speed = infoData.speed || "";
			self.C = infoData.C || "";
		},
		// code 方法用於將信息編碼回原始數據格式
		code(): any {
			return {
				title: self.title,
				subtitle: self.subtitle,
				author: self.author.join("|"), // 合併作者字串
				rhythmic: self.rhythmic,
				speed: self.speed,
				C: self.C,
			};
		},
	}));

export interface INotation {
	title: string;
	subtitle: string;
	author: string; // 這裡仍然是單一字串，需要在 decode/code 中處理分割/合併
	rhythmic: string;
	speed: string;
	C: string;
	pages: IPage[];
}

// Notation Model
export const NotationModel = types
	.model("Notation", {
		pages: types.array(PageModel), // pages 現在是 PageModel 的實例陣列
		isSelect: types.optional(types.boolean, false),
		info: NotationInfoModel, // info 現在是 NotationInfoModel 的實例
		config: types.frozen<MuseConfig>(), // MuseConfig 作為 frozen type，如果它不變且不需反應性
	})
	.views((self) => ({
		get height(): number {
			let h = 0;
			self.pages.forEach((it) => (h += it.height + it.marginTop + it.marginBottom));
			return h;
		},
		get width(): number {
			let w = 0;
			self.pages.forEach((it) => (w = it.width > w ? it.width : w));
			return w;
		},
	}))
	.actions((self) => ({
		// afterCreate 生命周期鉤子，用於初始化模型，特別是處理 config
		afterCreate() {
			// 如果 config 是從外部傳入的，可以在這裡處理
			// 如果 MuseConfig 也要變成 MST 模型，可以定義在這裡
			// self.config = MuseConfigModel.create(...);
		},
		addPage(index: number) {
			// 使用 PageModel.create() 創建新實例
			self.pages.splice(
				index,
				0,
				PageModel.create({
					lines: [{ tracks: [{ bars: [{ notes: [{ n: "0" }] }] }] }],
					paragraphs: [], // 假設新的頁面初始沒有段落
					index: self.pages.length,
					// config: self.config, // 如果 PageModel 需要 config，且 config 是非 MST
				})
			);
			self.pages.forEach((it, idx) => (it.index = idx));
		},
		removePage(index: number) {
			// 移除元素
			self.pages.splice(index, 1);
			self.pages.forEach((it, idx) => (it.index = idx));
		},
		setSelect(s: boolean) {
			self.isSelect = s;
		},
		getThis() {
			return self;
		},
		decode(o: INotation): void {
			if (o.pages !== undefined) {
				self.pages.clear(); // 清空現有的 pages
				o.pages.forEach((it: IPage, idx) => {
					self.pages.push(PageModel.create({ ...it, index: idx }));
				});
			}
			// 使用 NotationInfoModel 的 decode 方法來解析信息
			self.info.decode(o);
		},
		code(): INotation {
			let pages: IPage[] = self.pages.map((it) => it.code());
			// 使用 NotationInfoModel 的 code 方法來編碼信息
			const infoData = self.info.code();
			return { ...infoData, pages };
		},
	}));

// React Components

interface MuseNotationInfoProps {
	info: Instance<typeof NotationInfoModel>; // 使用 NotationInfoModel 的實例型別
	config: MuseConfig;
}

const MuseNotationInfo: React.FC<MuseNotationInfoProps> = observer(
	({ info, config }: MuseNotationInfoProps) => {
		let titleY = config.infoTitleMarginTop;
		let subtitleY = titleY + config.infoTitleFontSize + config.infoGap;
		let authorY = subtitleY + config.infoSubtitleFontSize + config.infoGap;
		let y2 = authorY + (info.author.length + 1) * (config.infoFontSize + config.infoGap);
		let y3 = y2 + config.infoFontSize + config.infoGap;

		const title = (
			<text
				textAnchor={"middle"}
				fontFamily={config.textFontFamily}
				width={config.pageWidth}
				fontSize={config.infoTitleFontSize}
				transform={"translate(" + config.pageWidth / 2 + "," + titleY + ")"}
			>
				{info.title}
			</text>
		);

		const subtitle = (
			<text
				textAnchor={"middle"}
				fontFamily={config.textFontFamily}
				width={config.pageWidth}
				fontSize={config.infoSubtitleFontSize}
				transform={"translate(" + config.pageWidth / 2 + "," + subtitleY + ")"}
			>
				{info.subtitle}
			</text>
		);

		const author = info.author.map((it, idx) => (
			<text
				key={idx}
				textAnchor={"end"}
				fontFamily={config.textFontFamily}
				width={config.pageWidth}
				fontSize={config.infoFontSize}
				transform={
					"translate(" +
					(config.pageWidth - config.pageMarginHorizontal) +
					"," +
					(authorY + idx * (config.infoFontSize + config.infoGap)) +
					")"
				}
			>
				{it}
			</text>
		));

		const rythimic = (
			<g>
				<text
					textAnchor={"start"}
					fontFamily={config.textFontFamily}
					width={config.pageWidth}
					fontSize={config.infoFontSize}
					transform={"translate(" + config.pageMarginHorizontal + "," + y2 + ")"}
				>
					{info.speed}
				</text>
				<text
					fontFamily={config.textFontFamily}
					width={config.pageWidth}
					fontSize={config.infoFontSize}
					transform={"translate(" + config.pageMarginHorizontal + "," + y3 + ")"}
				>
					{`1=${info.C} ${info.rhythmic}`}
				</text>
			</g>
		);

		return (
			<g className={clazz + "__info"} width={config.pageWidth}>
				{title}
				{subtitle}
				{author}
				{rythimic}
			</g>
		);
	}
);

interface IMuseNotationProps {
	notation: Instance<typeof NotationModel> | null; // 使用 NotationModel 的實例型別
}

const MuseNotation = observer(({ notation }: IMuseNotationProps) => {
	if (!notation) {
		return null; // 或者顯示加載狀態，或錯誤信息
	}

	let margin = 10;
	let clazz = "muse-notation";
	return (
		<svg
			className="muse"
			width={notation.width + margin * 2}
			height={notation.height + margin * 2}
		>
			<g
				className={clazz}
				transform={"translate(" + margin + "," + margin + ")"}
				width={notation.width}
				height={notation.height}
			>
				<MuseNotationInfo info={notation.info} config={notation.config} />
				<Border
					w={notation.width}
					h={notation.height}
					x={0}
					y={0}
					clazz={clazz}
					show={notation.isSelect}
				/>
				<OuterBorder
					w={notation.width}
					h={notation.height}
					clazz={clazz}
					show={true}
				/>
				{notation.pages.map((it, idx) => (
					<MusePage key={idx} page={it} />
				))}
			</g>
		</svg>
	);
});

export default MuseNotation;