import React from "react";
import MuseConfig from "./MuseConfig";
import MuseMeasure, { IMeasure, Measure } from "./MuseMeasure";
import { Border,Make } from "./Border";
import Codec from "./Codec";
import { computed, observable } from "mobx";
import { observer } from "mobx-react";
import { Page } from "./MusePage";
import { SelectionParagraph } from "./Selector";

//Paragraph --> Measure --> Row --> Noise --> SubNoise
//Line -->Paragraph
//Track -->>Measure

export interface IParagraph {
    measures: IMeasure[];
}

export class Paragraph implements Codec, SelectionParagraph {
    readonly config: MuseConfig;
    @observable page: Page;
    @observable index: number;
    @observable measures: Measure[] = [];
    @observable isSelect: boolean = false;
    @observable isMove: boolean = false;
    @computed get width() {
        return this.page.width;
    }
    @computed get height() {
        let h = 0;
        this.measures.forEach((it) => {
            h += it.height + this.config.measureGap;
        });
        h -= this.config.measureGap;
        return h;
    }
    @computed get x() {
        return this.page.x;
    }
    @computed get y() {
        return this.page.paragraphsY[this.index];
    }
    @computed get measuresWidth(): number[] {
        let lastX = 0;
        let measureCount = this.measures.length;
        let widthGap = this.width / measureCount;

        return this.measures.map((it, idx) => {
            let r = (idx+1) * widthGap;
            let w = r - lastX;
            lastX = r;            
            return w;
        });
    }
    @computed get measuresX(): number[] {
        let measureCount = this.measures.length;
        let widthGap = this.width / measureCount;
        
        return this.measures.map((it, idx) => {
            
            let r = idx * widthGap;
            //x += widthGap;
            return r;
        });
    }
    //@computed get measuresY(): number[] {
    //    let y = 0;
    //    return this.measures.map((it) => {
    //        let r = y;
    //        y += it.height + this.config.measureGap;
    //        return r;
    //    });
    //}
    constructor(o: IParagraph, index: number, page: Page, config: MuseConfig) {
        this.page = page;
        this.index = index;
        this.config = config;
        this.decode(o);
    }
    addMeasure(index: number) {
        this.measures.splice(
            index,
            0,
            new Measure(
                { rows: [{ noises: [{ n: "0" }] }] },
                this.measures.length,
                this,
                this.config
            )
        );
        this.measures.forEach((it, idx) => (it.index = idx));
    }
    removeMeasure(index: number) {
        this.measures = this.measures.filter((it, idx) => idx !== index);
        this.measures.forEach((it, idx) => (it.index = idx));
    }
    setIsMove(s: boolean) {
        this.isMove = s;
    }
    setSelect(s: boolean) {
        this.isSelect = s;
    }
    getThis() {
        return this;
    }
    decode(o: IParagraph): void {
        if (o.measures !== undefined) {
            o.measures.forEach((it: IMeasure, idx) => {
                this.measures.push(new Measure(it, idx, this, this.config));
            });
        }
    }
    code(): IParagraph {
        let measures: IMeasure[] = this.measures.map((it) => it.code());
        return { measures };
    }
}

const ParagraphHead: React.FC<{ height: number; clazz: string }> = ({
    height,
    clazz,
}: {
    height: number;
    clazz: string;
}) => {
    return (
        <g className={clazz + "__paragraph-head"}>
            <line x1={0} y1={0} x2={0} y2={height} strokeWidth={1} stroke="black" />
        </g>
    );
};

@observer
class MuseParagraph extends React.Component<{ paragraph: Paragraph }> {

     render() {
        
        console.log("MuseParagraph start");
        let clazz = "muse-paragraph";
        return (
            <g
                className={clazz}
                transform={
                    "translate(" + this.props.paragraph.x + "," + (this.props.paragraph.y+200) + ")"
                }
                width={this.props.paragraph.width}
                height={this.props.paragraph.height}
            >
                <Border
                    w={this.props.paragraph.width}
                    h={this.props.paragraph.height}
                    x={0}
                    y={0}
                    clazz={clazz}
                    show={this.props.paragraph.isSelect}
                />
                <Make
                    w={this.props.paragraph.width}
                    h={this.props.paragraph.height}
                    x={0}
                    y={0}
                    it={this.props.paragraph}
                    clazz={clazz}
                    show={this.props.paragraph.isMove} />
                <ParagraphHead height={this.props.paragraph.height} clazz={clazz} />
                {this.props.paragraph.measures.map((it, idx) => (
                    <MuseMeasure key={idx} measure={it} />
                ))}
            </g>
        );
    }
}

export default MuseParagraph;
