import React from "react";
import MuseConfig from "./MuseConfig";
import MuseRow, { Row, IRow } from "./MuseRow";
import { Border,Make } from "./Border";
import Codec from "./Codec";
import { computed, observable } from "mobx";
import { Paragraph } from "./MuseParagraph";
import Fraction from "./Fraction";
import { observer } from "mobx-react";
import { SelectionMeasure } from "./Selector";


//Paragraph --> Measure --> Row --> Noise --> SubNoise

export interface IMeasure {
    rows: IRow[];
}

//Track  -->>  Measure
//Bar  -->>  Row
//Line -->>  Paragraph
//note  -->>noise

export class Measure implements Codec, SelectionMeasure {
    readonly config: MuseConfig;
    @observable index: number;
    @observable paragraph: Paragraph;
    @observable rows: Row[] = [];
    @observable isMove:boolean = false;
    @observable isSelect: boolean = false;
    @computed get width(): number {        
        return this.paragraph.measuresWidth[this.index];
        //return this.paragraph.width;
    }
    @computed get height(): number {
        let h = 0;
        this.rows.forEach((it) => {
            h = it.height > h ? it.height : h;
        });
        return h;
    }
    @computed get x(): number {
        return this.paragraph.measuresX[this.index];

    }
    @computed get y(): number {
        return 0;
        //return this.paragraph.measuresY[this.index];
    }
    @computed get rowsTime(): Fraction[] {
        return this.rows.map((it) => it.noisesTimeSum);
    }
    @computed get rowsWidth(): number[] {
        let timeSum = this.rowsTime.reduce((a, b) => a.plus(b), new Fraction());
        let space = this.width - this.noisesWidthSum;
        let unit = new Fraction().init(space, 1).divide(timeSum);
        return this.rowsNoisesWidth.map((it, idx) => {
            return it + this.rowsTime[idx].multiply(unit).toNumber();
        });
    }
    //@computed get rowsX(): number[] {
    //    let x = 0;
    //    return this.rowsWidth.map((it) => {
    //        let r = x;
    //        x += it;
    //        return r;
    //    });
    //}
    @computed get rowsY(): number[] {
        let y = 0;
        return this.rows.map((it) => {
            let r = y;
            y += it.height + this.config.measureGap;
            return r;
        });
    }

    @computed get noisesMaxHeight(): number {
        return Math.max(...this.rows.map((it) => it.preNoisesMaxHeight));
    }
    @computed get noisesMaxMarginBottom(): number {
        return Math.max(...this.rows.map((it) => it.preNoisesMaxMarginBottom));
    }
    @computed get noisesWidthSum(): number {
        return this.rowsNoisesWidth.reduce((a, b) => a + b, 0);
    }
    @computed get rowsNoisesWidth(): number[] {
        return this.rows.map((it) => it.noisesWidthSum);
    }
    constructor(o: IMeasure, index: number, paragraph: Paragraph, config: MuseConfig) {
        this.index = index;
        this.paragraph = paragraph;
        this.config = config;
        this.decode(o);
    }
    addRow(index: number) {
        this.rows.splice(
            index,
            0,
            new Row({ noises: [{ n: "0" }] }, this.rows.length, this, this.config)
        );
        this.rows.forEach((it, idx) => (it.index = idx));
    }
    removeRow(index: number) {
        this.rows = this.rows.filter((it, idx) => idx !== index);
        this.rows.forEach((it, idx) => (it.index = idx));
    }
    setSelect(s: boolean) {
        this.isSelect = s;
    }
    setIsMove(s: boolean) {
        this.isMove = s;
    }
    getThis() {
        return this;
    }
    decode(o: IMeasure): void {
        if (o.rows !== undefined) {
            o.rows.forEach((it: any, idx) => {
                this.rows.push(new Row(it, idx, this, this.config));
            });
        }
    }
    code(): IMeasure {
        let rows: IRow[] = this.rows.map((it) => it.code());
        return { rows };
    }
}

const MeasureLine: React.FC<{ measure: Measure; row: Row; h: number; clazz: string; }> = (props: {
    measure: Measure;
    row: Row;
    h: number;
    clazz: string;
}) => {
    
    return (
        <line
            className={props.clazz + "__measure-line"}
            x1={props.measure.width}
            y1={props.row.y}
            x2={props.measure.width}
            y2={props.row.y+props.h}
            strokeWidth={1}
            stroke="black"
        />
    );
};

@observer
class MuseMeasure extends React.Component<{ measure: Measure }> {
    render() {
        let clazz = "muse-measure";
        return (
            <g
                className={clazz}
                transform={
                    "translate(" + this.props.measure.x + "," + this.props.measure.y + ")"
                }
                width={this.props.measure.width}
                height={this.props.measure.height}
            >

                <Make
                    w={this.props.measure.width}
                    h={this.props.measure.height}
                    x={0}
                    y={0}
                    it={this.props.measure}
                    clazz={clazz}
                    show={this.props.measure.isMove}   />



                <Border
                    w={this.props.measure.width}
                    h={this.props.measure.height}
                    x={0}
                    y={0}
                    clazz={clazz}
                    show={this.props.measure.isSelect}
                />
                {this.props.measure.rows.map((it, idx) => (
                  <g
                    key = { idx }>
                        <MeasureLine
                            measure={this.props.measure}
                            row={it}
                            h={this.props.measure.height}
                            clazz={clazz}
                        />
                        <MuseRow key={idx} row={it} />
                    </g>
                ))}
            </g>
        );
    }
}

export default MuseMeasure;
