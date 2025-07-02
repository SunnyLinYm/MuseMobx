import React, { MouseEvent } from "react";
import { Border, OuterBorder ,Make } from "./Border";
import MuseConfig from "./MuseConfig";
import Codec from "./Codec";
import Fraction from "./Fraction";
import { computed, observable } from "mobx";
import { observer } from "mobx-react";
import Selector, { SelectionNoise, SelectionSubNoise } from "./Selector";
import IRow,{ Row } from "./MuseRow";

//Paragraph --> Measure --> Row --> Noise --> SubNoise
export interface INoise {
    n: string;
}

export class SubNoise implements SelectionSubNoise {
    readonly config: MuseConfig;
    @observable isMove: boolean = false;
    @observable isSelect: boolean = false;
    @observable noise: Noise;
    @observable index: number;
    @observable x: string = "";
    @observable n: string = "";
    @observable t: number = 0;
    constructor(
        x: string,
        n: string,
        t: number,
        noise: Noise,
        index: number,
        config: MuseConfig
    ) {
        this.x = x;
        this.n = n;
        this.t = t;
        this.noise = noise;
        this.index = index;
        this.config = config;
    }
    setIsMove(s: boolean) {
        this.isMove = s;
    }
    setSelect(s: boolean) {
        this.isSelect = s;
    }
    setNum(n: string) {
        this.n = n;
    }
    reducePoint(h: number) {
        this.t += h;
    }
    reduceLine(l: number) {
        this.noise.l += l;
        if (this.noise.l < 0) {
            this.noise.l = 0;
        }
    }
    reduceTailPoint(p: number) {
        this.noise.p += p;
        if (this.noise.p < 0) {
            this.noise.p = 0;
        }
    }
    getThis() {
        return this;
    }
}

export class Noise implements Codec, SelectionNoise {
    readonly config: MuseConfig;
    @observable index: number;
    @observable row: Row;
    @observable subNoises: SubNoise[] = [];
    @observable isMove: boolean = false;
    @observable isSelect: boolean = false;
    @observable l: number = 0;  //幾個 下線條
    @observable p: number = 0;  //幾個 附點
    @observable d: number = 0;  //
    @computed get dx(): number {
        let dxx = false;
        this.subNoises.forEach((it) => {
            if (it.x !== "") {
                dxx = true;
            }
        });
        return dxx ? this.config.sigFontSize / 2 : 0;
    }
    @computed get time(): Fraction {
        let r = new Fraction();
        r.u = 1;
        r.d *= Math.pow(2, this.l);
        r.d *= this.d;
        r.d *= Math.pow(2, this.p); //3/2 7/4 15/8
        r.u *= Math.pow(2, this.p + 1) - 1;
        return r.simplify();
    }
    @computed get noisesY(): number[] {
        let r: number[] = [];
        let ny = 0;
        this.subNoises.forEach((it, idx) => {
            if (it.t < 0) {
                if (idx !== 0) {
                    let i = -it.t;
                    for (; i > 0; --i) {
                        let x = this.config.pointGap;
                        ny += x;
                    }
                }
            }
            r.push(ny);
            let h = this.config.noiseHeight;
            ny += h;
            if (it.t > 0) {
                let i = it.t;
                for (; i > 0; --i) {
                    let x = this.config.pointGap;
                    ny += x;
                }
            }
        });
        return r;
    }
    @computed get pointsY(): number[] {
        let r: number[] = [];
        let py = 0;
        let ny = 0;
        let mb = 0;
        mb += this.l * this.config.pointGap;
        this.subNoises.forEach((it, idx) => {
            if (it.t < 0) {
                if (idx === 0) {
                    let i = -it.t;
                    for (; i > 0; --i) {
                        let x = this.config.pointGap;
                        mb += x / 2;
                        r.push(-mb);
                        mb += x / 2;
                    }
                }
                if (idx !== 0) {
                    let i = -it.t;
                    for (; i > 0; --i) {
                        let x = this.config.pointGap;
                        py += x / 2;
                        r.push(py);
                        py += x / 2;
                        ny += x;
                    }
                }
            }
            this.noisesY.push(ny);
            let h = this.config.noiseHeight;
            ny += h;
            py += h;
            if (it.t > 0) {
                let i = it.t;
                for (; i > 0; --i) {
                    let x = this.config.pointGap;
                    py += x / 2;
                    r.push(py);
                    py += x / 2;
                    ny += x;
                }
            }
        });
        return r;
    }
    @computed get tailPointsX(): number[] {
        let r: number[] = [];
        for (let i = 0; i < this.p; ++i) {
            r.push(
                this.dx + this.config.noiseWidth + (i + 1 / 2) * this.config.tailPointGap
            );
        }
        return r;
    }
    @computed get width(): number {
        return this.dx + this.config.noiseWidth + this.p * this.config.tailPointGap;
    }
    @computed get preHeight(): number {
        let h = 0;
        this.subNoises.forEach((it, idx) => {
            if (it.t < 0) {
                if (idx !== 0) {
                    let i = -it.t;
                    for (; i > 0; --i) {
                        let x = this.config.pointGap;
                        h += x;
                    }
                }
            }
            h += this.config.noiseHeight;
            if (it.t > 0) {
                let i = it.t;
                for (; i > 0; --i) {
                    let x = this.config.pointGap;
                    h += x;
                }
            }
        });
        return h;
    }
    @computed get height(): number {
        return this.row.noisesMaxHeight;
    }
    @computed get x(): number {
        return this.row.noisesX[this.index];
    }
    @computed get preMarginBottom(): number {
        let mb = 0;
        mb += this.l * this.config.pointGap;
        this.subNoises.forEach((it, idx) => {
            if (it.t < 0) {
                if (idx === 0) {
                    let i = -it.t;
                    for (; i > 0; --i) {
                        let x = this.config.pointGap;
                        mb += x;
                    }
                }
            }
        });
        return mb;
    }
    @computed get marginBottom(): number {
        return this.row.noisesMaxMarginBottom;
    }
    constructor(o: INoise, row: Row, idx: number) {
        this.config = row.config;
        this.row = row;
        this.index = idx;
        this.decode(o);
    }
    setIsMove(s: boolean) {
        this.isMove = s;
    }
    setSelect(s: boolean) {
        this.isSelect = s;
    }
    reduceLine(l: number) {
        this.l += l;
        if (this.l < 0) {
            this.l = 0;
        }
    }
    reduceTailPoint(p: number) {
        this.p += p;
        if (this.p < 0) {
            this.p = 0;
        }
    }
    addSubNoise(index: number) {
        this.subNoises.splice(
            index,
            0,
            new SubNoise("", "0", 0, this, this.subNoises.length, this.config)
        );
        this.subNoises.forEach((it, idx) => (it.index = idx));
    }
    removeSubNoise(index: number) {
        this.subNoises = this.subNoises.filter((it, idx) => idx !== index);
        this.subNoises.forEach((it, idx) => (it.index = idx));
    }
    getThis() {
        return this;
    }

    decode(o: INoise): void {
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
            ng.forEach((it, idx) => {
                for (let i = 0; i < it.length; ++i) {
                    if (
                        (it.charCodeAt(i) <= 57 && it.charCodeAt(i) >= 48) ||
                        it.charCodeAt(i) === 45
                    ) {
                        let x = it.substr(0, i);
                        let n = it.charAt(i);
                        let t = it.substr(i + 1).length;
                        if (t !== 0 && it.charAt(i + 1) === "-") {
                            t = -t;
                        }
                        this.subNoises.push(new SubNoise(x, n, t, this, idx, this.config));
                        break;
                    }
                }
            });
            let tg = ts.split("|");
            if (tg.length === 3) {
                this.l = parseInt(tg[0]);
                this.p = parseInt(tg[1]);
                this.d = parseInt(tg[2]);
            } else if (tg.length === 2) {
                this.l = parseInt(tg[0]);
                this.p = parseInt(tg[1]);
                this.d = 1;
            } else if (tg.length === 1) {
                this.l = parseInt(tg[0]);
                this.p = 0;
                this.d = 1;
            } else {
                this.l = 0;
                this.p = 0;
                this.d = 1;
            }
        }
    }
    code(): INoise {
        let ns: string = "";
        this.subNoises.forEach((it, idx) => {
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
            if (idx + 1 >= this.subNoises.length) {
                ns += `${it.x}${it.n}${t}`;
            } else {
                ns += `${it.x}${it.n}${t}|`;
            }
        });
        let n = `${ns}@${this.l}|${this.p}`;
        return { n };
    }
}

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
 * @param noise.pointsY  Y 軸的位置
 * @param clazz
 */
function pointGroup(noise: Noise, clazz: string) {
    return (
        <g className={clazz + "__group-point"}>
            {noise.pointsY.map((it, idx) => (
                <circle
                    key={idx}
                    r={noise.config.pointRound}
                    fill="black"
                    transform={
                        "translate(" +
                        (noise.dx + noise.config.noiseWidth / 2) +
                        "," +
                        (noise.height - it + noise.config.pointGap / 2) +
                        ")"
                    }
                />
            ))}
        </g>
    );
}

/**
 * 畫附點音附
 * @param noise
 * @param clazz
 */
function tailPoint(noise: Noise, clazz: string) {
    return (
        <g className={clazz + "__tail-point"}>
            {noise.tailPointsX.map((it, idx) => (
                <circle
                    key={idx}
                    r={noise.config.pointRound}
                    fill="black"
                    transform={
                        "translate(" +
                        it +
                        "," +
                        (noise.height - noise.config.noiseHeight / 3) +
                        ")"
                    }
                />
            ))}
        </g>
    );
}

interface MuseSubNoiseProps {
    dx: number;
    y: number;
    w: number;
    h: number;
    subNoise: SubNoise;
}

const MuseSubNoise = observer((props: MuseSubNoiseProps) => {
//function MuseSubNoise(props: MuseSubNoiseProps) {

    return (
        <g
            className={"muse-noise__subnoise"}
            transform={"translate(" + 0 + "," + props.y + ")"}
            width={props.w}
            height={props.h}
            onClick={() => {
                Selector.instance.selectSubNoise(props.subNoise);
            }}
        >
            <text
                fontFamily={props.subNoise.config.noiseFontFamily}
                fontSize={props.subNoise.config.noiseFontSize}
                transform={"translate(" + props.dx + "," + 0 + ")"}
            >
                {props.subNoise.n}
            </text>
            <text
                fontFamily={props.subNoise.config.noiseFontFamily}
                fontSize={props.subNoise.config.sigFontSize}
                transform={
                    "translate(" +
                    0 +
                    "," +
                    (props.subNoise.config.sigFontSize -
                        props.subNoise.config.noiseHeight) +
                    ")"
                }
            >
                {castX(props.subNoise.x)}
            </text>
            <Border
                x={0}
                y={-props.h}
                w={props.w}
                h={props.subNoise.config.noiseFontSize}
                clazz={"muse-noise__subnoise"}
                show={props.subNoise.isSelect}
            />
            <Make
                x={0}
                y={-props.h}
                w={props.w}
                h={props.subNoise.config.noiseFontSize}
                it={props.subNoise }
                clazz={"muse-noise__subnoise"}
                show={props.subNoise.isMove}
            />
        </g>
    );
})

//import React, { MouseEvent } from 'react';

//const ButtonComponent = () => {
//    const handleMouseEvent = (e: MouseEvent<HTMLButtonElement>) => {
//        e.preventDefault();
//        // Do something
//    };

//    return <button onMouseMove={handleMouseEvent}>Click me!</button>;
//};

//@observer
function MuseNoise( props:any ) {

        let clazz = "muse-noise";
        return (
            <g
                className={clazz}
                transform={"translate(" + props.noise.x + "," + 0 + ")"}
                width={props.noise.width}
                height={props.noise.height}
                onClick={() => {
                    Selector.instance.selectNoise(props.noise);
                }}
            >
                <OuterBorder
                    w={props.noise.width}
                    h={props.noise.height + props.noise.marginBottom}
                    clazz={clazz}
                    show={props.noise.isSelect}
                    color={"blue"}
                />
                {props.noise.subNoises.map((it:any, idx:number) => (
                    <MuseSubNoise
                        key={idx}
                        dx={props.noise.dx}
                        y={props.noise.height - props.noise.noisesY[idx]}
                        w={props.noise.width}
                        h={22}
                        subNoise={it}
                    />
                ))}
                {pointGroup(props.noise, clazz)}
                {tailPoint(props.noise, clazz)}
            </g>
        );
    
}

export default observer( MuseNoise);
