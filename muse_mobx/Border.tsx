

import React from "react";
import Selector from "./Selector";

interface BorderProps {
    w: number;
    h: number;
    x: number;
    y: number;
    clazz: string;
    show?: boolean;
    color?: string;
    // handleMouseMove: MouseEvent;
    //handleClick: MouseEvent;
}

export const Border: React.FC<BorderProps> = ({
    w,
    h,
    x,
    y,
    clazz,
    show = false,
    color = "blue",
}: BorderProps) => {
    if (show) {
        return (
            <rect
                className={clazz + "__border"}
                transform={"translate(" + x + "," + y + ")"}
                width={w}
                height={h}
                stroke={color}
                strokeWidth="0.4"
                fill="none"
            />
        );
    } else {
        return <></>;
    }
};

interface OuterBorderProps {
    w: number;
    h: number;
    clazz: string;
    show?: boolean;
    color?: string;
}

export const OuterBorder: React.FC<OuterBorderProps> = ({
    w,
    h,
    clazz,
    show = false,
    color = "gray",
}: OuterBorderProps) => {
    if (show) {
        return (
            <rect
                className={clazz + "__outer-border"}
                transform={"translate(0,0)"}
                width={w}
                height={h}
                stroke={color}
                strokeWidth="0.4"
                fill="none"
            />
        );
    } else {
        return <></>;
    }
};


interface MakeProps {
    w: number;
    h: number;
    x: number;
    y: number;
    clazz: string;
    it: any;
    show?: boolean;
    color?: string;

}

export const Make: React.FC<MakeProps> = ({
    w,
    h,
    x,
    y,
    it,
    clazz,
    show = false,
    color = "blue",
}: MakeProps) => {

    const handleMouseEvent = (ev:any) => {
        console.log("handleMouseEvent-> ev");
        console.log(ev);
        Selector.instance.moveObject(it);
        ev.preventDefault();
        // Do something
    };
    let style1 = {
        stroke: color,
        strokeWidth: '1',
        strokeDasharray: 4
    };
    if (show) {
        return (
            <rect
                className={clazz + "__make"}
                transform={"translate(" + x + "," + y + ")"}
                width={w}
                height={h}
                fill="transparent"
                onMouseMove={handleMouseEvent}
                style={style1}
            />
        );
    } else {
        return (
            <rect
                className={clazz + "__make"}
                transform={"translate(" + x + "," + y + ")"}
                width={w}
                height={h}
                fill="transparent"
                onMouseMove={handleMouseEvent}
            />
        )
    }


};