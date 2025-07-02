import React from "react";
import MuseConfig from "./MuseConfig";
import MuseNoise, { INoise, Noise } from "./MuseNoise";
import { Border, Make } from "./Border";
import Codec from "./Codec";
import { computed, observable } from "mobx";
import { observer } from "mobx-react";
import Fraction from "./Fraction";
import { Measure } from "./MuseMeasure";
import Selector, { SelectionRow } from "./Selector";

interface Baseline {
	y: number;
	s: number;
	e: number;
}

//Paragraph --> Measure --> Row --> Noise --> SubNoise
export interface IRow {
	noises: INoise[];
}



export class Row implements Codec, SelectionRow {
	readonly config: MuseConfig;
	@observable index: number;
	@observable measure: Measure;
	@observable noises: Noise[] = [];
	@observable isMove: boolean = false;
	@observable isSelect: boolean = false;
	@computed get width(): number {
		return this.measure.rowsWidth[this.index];
	}
	@computed get height(): number {
		let h = 0;
		this.noises.forEach((it) => {
			let u = it.height + it.marginBottom;
			h = u > h ? u : h;
		});
		return h;
	}
	@computed get x(): number {
		//return this.measure.rowsX[this.index];
		return 0;
	}
	@computed get y(): number {
		return this.measure.rowsY[this.index];

	}
	@computed get noisesTime(): Fraction[] {
		return this.noises.map((it) => it.time);
	}
	@computed get noisesTimeSum(): Fraction {
		return this.noisesTime
			.reduce((a, b) => a.plus(b), new Fraction())
			.plus(new Fraction().init(1, 1));
	}
	@computed get noisesWidth(): number[] {
		return this.noises.map((it) => it.width);
	}
	@computed get noisesX(): number[] {
		let space = this.width - this.noisesWidthSum;
		let unit = new Fraction().init(space, 1).divide(this.noisesTimeSum);
		let x = unit.toNumber();
		return this.noisesWidth.map((it, idx) => {
			let r = x;
			x += it + this.noisesTime[idx].multiply(unit).toNumber();
			return r;
		});
	}
	@computed get preNoisesMaxHeight(): number {
		return Math.max(...this.noises.map((it) => it.preHeight));
	}
	@computed get noisesMaxHeight(): number {
		return this.measure.noisesMaxHeight;
	}
	@computed get preNoisesMaxMarginBottom(): number {
		return Math.max(...this.noises.map((it) => it.preMarginBottom));
	}
	@computed get noisesMaxMarginBottom(): number {
		return this.measure.noisesMaxMarginBottom;
	}
	@computed get baselineGroup(): Baseline[] {
		let r: {
			y: number;
			s: number;
			e: number;
		}[] = [];
		for (let i = 0; ; ++i) {
			let x = 0;
			let s = 0;
			let e = -1;
			this.noises.forEach((it, idx) => {
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
	}
	@computed get noisesWidthSum(): number {
		let w = 0;
		this.noises.forEach((it) => (w += it.width));
		return w;
	}
	constructor(o: IRow, index: number, measure: Measure, config: MuseConfig) {
		this.index = index;
		this.measure = measure;
		this.config = config;
		this.decode(o);
	}
	addNoise(index: number) {
		this.noises.splice(index, 0, new Noise({ n: "0" }, this, this.noises.length));
		this.noises.forEach((it, idx) => (it.index = idx));
	}
	removeNoise(index: number) {
		this.noises = this.noises.filter((it, idx) => idx !== index);
		this.noises.forEach((it, idx) => (it.index = idx));
	}
	setIsMove(s: boolean) {
		this.isMove = s;
	}
	setSelect(i: boolean) {
		this.isSelect = i;
	}
	getThis() {
		return this;
	}
	decode(o: IRow): void {
		if (o.noises !== undefined) {
			o.noises.forEach((it: INoise, idx) => {
				this.noises.push(new Noise(it, this, idx));
			});
		}
	}
	code(): IRow {
		let noises: INoise[] = this.noises.map((it) => it.code());
		return { noises };
	}
}

const RowLine: React.FC<{ w: number; h: number; clazz: string }> = observer((props: {
	w: number;
	h: number;
	clazz: string;
}) => {
	let [width, height] = [props.w, props.h];

	return (
		<line
			className={props.clazz + "__row-line"}
			x1={width}
			y1={0}
			x2={width}
			y2={height}
			strokeWidth={1}
			stroke="black"
		/>
	);
});

const BaseLine: React.FC<{ row: Row; clazz: string }> = observer(({
	row,
	clazz,
}: {
	row: Row;
	clazz: string;
}) => {
	let [baselineGroup, noises] = [row.baselineGroup, row.noises];
	return (
		<g className={clazz + "__base-line"}>
			{baselineGroup.map((it, idx) => (
				<line
					key={idx}
					x1={noises[it.s].x}
					y1={noises[it.s].height + (it.y + 1) * row.config.pointGap}
					x2={noises[it.e].x + row.noises[it.e].width}
					y2={noises[it.s].height + (it.y + 1) * row.config.pointGap}
					stroke={"black"}
					strokeWidth={1}
				/>
			))}
		</g>
	);
});

@observer
class MuseRow extends React.Component<{ row: Row }, {}> {
	render() {
		let noises = this.props.row.noises;
		let clazz = "muse-row" + this.props.row.isMove;
		return (
			<g
				className={clazz}
				transform={
					"translate(" + this.props.row.x + "," + this.props.row.y + ")"
				}
				width={this.props.row.width}
				height={this.props.row.height}
				onClick={() => {
					Selector.instance.selectRow(this.props.row);
				}}
			>
				<Make
					w={this.props.row.width}
					h={this.props.row.height}
					x={0}
					y={0}
					it={this.props.row}
					clazz={clazz}
					show={this.props.row.isMove} />
				<Border
					w={this.props.row.width}
					h={this.props.row.height}
					x={0}
					y={0}
					clazz={clazz}
					show={this.props.row.isSelect}
				/>
				{/*<RowLine*/}
				{/*    w={this.props.row.width}*/}
				{/*    h={this.props.row.height}*/}
				{/*    clazz={clazz}*/}
				{/*/>*/}
				{noises.map((it, idx) => (
					<MuseNoise key={idx} noise={it} />
				))}
				<BaseLine row={this.props.row} clazz={clazz} />
			</g>
		);
	}
}

export default MuseRow;
