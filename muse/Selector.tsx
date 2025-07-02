import { Bar } from "./MuseBar";
import { Line } from "./MuseLine";
import { Note, SubNote } from "./MuseNote";
import { Page } from "./MusePage";
import { Track } from "./MuseTrack";

import { Row } from "./MuseRow";
import { Paragraph } from "./MuseParagraph";
import { Notation } from "./MuseNotation";
import { Noise, SubNoise } from "./MuseNoise";
import { Measure } from "./MuseMeasure";


export interface SelectionSubNe {
    setSelect: (i: boolean) => void;
    getThis: () => SubNote;
    setNum: (n: string) => void;
    reducePoint: (h: number) => void;
    reduceLine: (l: number) => void;
    reduceTailPoint: (p: number) => void;
}

export interface SelectionNe {
    setSelect: (i: boolean) => void;
    getThis: () => Note;
    reduceLine: (l: number) => void;
    reduceTailPoint: (p: number) => void;
    addSubNote: (index: number) => void;
    removeSubNote: (index: number) => void;
}

export interface SelectionBr {
    setSelect: (i: boolean) => void;
    getThis: () => Br;
    addNote: (index: number) => void;
    removeNote: (index: number) => void;
}

export interface SelectionTk {
    setSelect: (s: boolean) => void;
    getThis: () => Track;
    addBar: (index: number) => void;
    removeBar: (index: number) => void;
}





class Selector {
  subne: SelectionSubNe | null = null;
    ne: SelectionNe | null = null;
    br: SelectionBr | null = null;
    tk: SelectionTk | null = null;
    isObjectMove: any | null = null;
    static instance = new Selector();
    private constructor() {
        document.addEventListener("keydown", (ev) => {
            if (!this.keySubNe(ev)) {
                if (!this.keyNe(ev)) {
                    if (!this.keyBr(ev)) {
                        if (!this.keyTk(ev)) {
                            if (!this.keyLine(ev)) {
                                if (!this.keyPage(ev)) {
                                    if (this.keyNotation(ev)) ev.returnValue = false;
                                } else ev.returnValue = false;
                            } else ev.returnValue = false;
                        } else ev.returnValue = false;
                    } else ev.returnValue = false;
                } else ev.returnValue = false;
            } else ev.returnValue = false;
        });
    }
    moveObject(o: any) {
        console.log("moveObject(o: any)");
        this.isObjectMove?.setIsMove(false);
        this.isObjectMove = o;
        this.isObjectMove.setIsMove(true);
    }
    selectSubNe(s: SelectionSubNe) {
        this.subne?.setSelect(false);
        this.subne = s;
        this.subne.setSelect(true);
        this.selectNe(s.getThis().note);
    }
    selectNe(s: SelectionNe) {
        this.ne?.setSelect(false);
        this.ne = s;
        if (this.subne === null) this.ne.setSelect(true);
        this.selectBar(s.getThis().bar);
    }
    selectBar(s: SelectionBr) {
        this.br?.setSelect(false);
        this.br = s;
        if (this.ne === null) this.br.setSelect(true);
        this.selectTk(s.getThis().track);
    }

    keySubNe(ev: KeyboardEvent): boolean {
        if (this.subne !== null) {
            switch (ev.key) {                
                case "0":
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                case "6":
                case "7":
                case "8":
                case "9":
                case "-":
                    this.subne.setNum(ev.key);
                    return true;
                case "r":
                    this.subne.reducePoint(1);
                    return true;
                case "f":
                    this.subne.reducePoint(-1);
                    return true;
                case "q":
                    this.subne.reduceLine(-1);
                    return true;
                case "a":
                    this.subne.reduceLine(1);
                    return true;
                case "s":
                    this.subne.reduceTailPoint(-1);
                    return true;
                case "d":
                    this.subne.reduceTailPoint(1);
                    return true;
                default:
                    return false;
            }
        } else return false;
    }
    keyNe(ev: KeyboardEvent): boolean {
        if (this.ne) {
            switch (ev.key) {
                case "Enter":
                    if (this.ne.getThis().subNotes.length <= 0) {
                        this.ne.addSubNote(this.ne.getThis().subNotes.length);
                    }
                    this.subne = this.ne.getThis().subNotes[0];
                    this.subne.setSelect(true);
                    this.ne.setSelect(false);
                    return true;
                case "Escape":
                    this.ne.setSelect(false);
                    this.ne = null;
                    this.br?.setSelect(true);
                    return true;
                default:
                    return false;
            }
        } else return false;
    }
    keyBr(ev: KeyboardEvent): boolean {
        if (this.br !== null) {
            switch (ev.key) {
                case "Enter":
                    if (this.br.getThis().notes.length <= 0) {
                        this.br.addNote(this.br.getThis().notes.length);
                    }
                    this.ne = this.br.getThis().notes[0];
                    this.ne.setSelect(true);
                    this.br.setSelect(false);
                    return true;
                case "Escape":
                    this.br.setSelect(false);
                    this.br = null;
                    this.tk?.setSelect(true);
                    return true;
                default:
                    return false;
            }
        } else return false;
    }
    keyTk(ev: KeyboardEvent): boolean {
        if (this.tk !== null) {
            switch (ev.key) {
                case "Enter":
                    if (this.tk.getThis().brs.length <= 0) {
                        this.tk.addBar(this.tk.getThis().brs.length);
                    }
                    this.br = this.tk.getThis().brs[0];
                    this.br.setSelect(true);
                    this.tk.setSelect(false);
                    return true;
                case "Escape":
                    this.tk.setSelect(false);
                    this.tk = null;
                    return true;
                case " ":
                    this.tk.addBar(this.tk.getThis().bars.length);
                    ev.returnValue = false;
                    return true;
                case "z":
                    if (this.line) {
                        this.line.addTrack(0);
                        this.selectTrack(this.line.getThis().tracks[0]);
                    }
                    return true;
                case "x":
                    if (this.line) {
                        let idx = this.tk.getThis().index;
                        this.line.addTrack(idx);
                        this.selectTrack(this.line.getThis().tracks[idx]);
                    }
                    return true;
                case "c":
                    if (this.line) {
                        let idx = this.tk.getThis().index;
                        this.line.addTrack(idx + 1);
                        this.selectTrack(this.line.getThis().tracks[idx + 1]);
                    }
                    return true;
                case "v":
                    if (this.line) {
                        this.line.addTrack(this.line.getThis().tracks.length);
                        this.selectTrack(
                            this.line.getThis().tracks[this.line.getThis().tracks.length - 1]
                        );
                    }
                    return true;
                case "Backspace":
                    if (this.line) {
                        let idx = this.tk.getThis().index;
                        this.line.removeTrack(this.tk.getThis().index);
                        if (this.line.getThis().tracks.length === 0) {
                            this.line.setSelect(true);
                            this.tk.setSelect(false);
                            this.tk = null;
                        } else {
                            if (idx === 0) {
                                this.tk = this.line.getThis().tracks[0];
                                this.tk.setSelect(true);
                            } else {
                                this.tk = this.line.getThis().tracks[idx - 1];
                                this.tk.setSelect(true);
                            }
                        }
                    }
                    return true;
          
                default:
                    return false;
            }
        } else return false;
    }
    keyLine(ev: KeyboardEvent): boolean {
        if (this.line !== null) {
            switch (ev.key) {
                case "Enter":
                    if (this.line.getThis().tracks.length <= 0) {
                        this.line.getThis().addTrack(this.line.getThis().tracks.length);
                    }
                    this.tk = this.line.getThis().tracks[0];
                    this.tk.setSelect(true);
                    this.line.setSelect(false);
                    return true;
                case "Escape":
                    this.line.setSelect(false);
                    this.line = null;
                    this.page?.setSelect(true);
                    return true;
                case " ":
                    this.line.addTrack(this.line.getThis().tracks.length);
                    return true;
                case "z":
                    if (this.page) {
                        this.page.addLine(0);
                        this.selectLine(this.page.getThis().lines[0]);
                    }
                    return true;
                case "x":
                    if (this.page) {
                        let idx = this.line.getThis().index;
                        this.page.addLine(idx);
                        this.selectLine(this.page.getThis().lines[idx]);
                    }
                    return true;
                case "c":
                    if (this.page) {
                        let idx = this.line.getThis().index;
                        this.page.addLine(idx + 1);
                        this.selectLine(this.page.getThis().lines[idx + 1]);
                    }
                    return true;
                case "v":
                    if (this.page) {
                        this.page.addLine(this.page.getThis().lines.length);
                        this.selectLine(
                            this.page.getThis().lines[this.page.getThis().lines.length - 1]
                        );
                    }
                    return true;
                case "Backspace":
                    if (this.page) {
                        let idx = this.line.getThis().index;
                        this.page.removeLine(this.line.getThis().index);
                        if (this.page.getThis().lines.length === 0) {
                            this.page.setSelect(true);
                            this.line.setSelect(false);
                            this.line = null;
                        } else {
                            if (idx === 0) {
                                this.line = this.page.getThis().lines[0];
                                this.line.setSelect(true);
                            } else {
                                this.line = this.page.getThis().lines[idx - 1];
                                this.line.setSelect(true);
                            }
                        }
                    }
                    return true;
                case "ArrowUp":
                    if (this.page) {
                        if (this.line.getThis().index > 0) {
                            this.line.setSelect(false);
                            this.line = this.page.getThis().lines[
                                this.line.getThis().index - 1
                            ];
                            this.line.setSelect(true);
                            return true;
                        } else if (this.notation) {
                            if (this.page.getThis().index > 0) {
                                this.page = this.notation.getThis().pages[
                                    this.page.getThis().index - 1
                                ];
                                this.line.setSelect(false);
                                this.line = this.page.getThis().lines[
                                    this.page.getThis().lines.length - 1
                                ];
                                this.line.setSelect(true);
                                return true;
                            } else return false;
                        } else return false;
                    } else return false;
                case "ArrowDown":
                    if (this.page !== null) {
                        let l = this.page.getThis().lines.length;
                        if (this.line.getThis().index < l - 1) {
                            this.line.setSelect(false);
                            this.line = this.page.getThis().lines[
                                this.line.getThis().index + 1
                            ];
                            this.line.setSelect(true);
                            return true;
                        } else if (this.notation) {
                            if (
                                this.page.getThis().index <
                                this.notation.getThis().pages.length - 1
                            ) {
                                this.page = this.notation.getThis().pages[
                                    this.page.getThis().index + 1
                                ];
                                this.line.setSelect(false);
                                this.line = this.page.getThis().lines[0];
                                this.line.setSelect(true);
                                return true;
                            } else return false;
                        } else return false;
                    } else return false;
                default:
                    return false;
            }
        } else return false;
    }
    keyPage(ev: KeyboardEvent): boolean {
        if (this.page !== null) {
            switch (ev.key) {
                case "Enter":
                    if (this.page.getThis().lines.length <= 0) {
                        this.page.getThis().addLine(this.page.getThis().lines.length);
                    }
                    this.line = this.page.getThis().lines[0];
                    this.line.setSelect(true);
                    this.page.setSelect(false);
                    return true;
                case "Escape":
                    this.page.setSelect(false);
                    this.page = null;
                    this.notation?.setSelect(true);
                    return true;
                case " ":
                    this.page.addLine(this.page.getThis().lines.length);
                    return true;
                case "z":
                    if (this.notation) {
                        this.notation.addPage(0);
                        this.selectPage(this.notation.getThis().pages[0]);
                    }
                    return true;
                case "x":
                    if (this.notation) {
                        let idx = this.page.getThis().index;
                        this.notation.addPage(idx);
                        this.selectPage(this.notation.getThis().pages[idx]);
                    }
                    return true;
                case "c":
                    if (this.notation) {
                        let idx = this.page.getThis().index;
                        this.notation.addPage(idx + 1);
                        this.selectPage(this.notation.getThis().pages[idx + 1]);
                    }
                    return true;
                case "v":
                    if (this.notation) {
                        this.notation.addPage(this.notation.getThis().pages.length);
                        this.selectPage(
                            this.notation.getThis().pages[
                            this.notation.getThis().pages.length - 1
                            ]
                        );
                    }
                    return true;
                case "Backspace":
                    if (this.notation) {
                        let idx = this.page.getThis().index;
                        this.notation?.reomvePage(this.page.getThis().index);
                        if (this.notation.getThis().pages.length === 0) {
                            this.notation.setSelect(true);
                            this.page.setSelect(false);
                            this.page = null;
                        } else {
                            if (idx === 0) {
                                this.page = this.notation.getThis().pages[0];
                                this.page.setSelect(true);
                            } else {
                                this.page = this.notation.getThis().pages[idx - 1];
                                this.page.setSelect(true);
                            }
                        }
                    }
                    return true;
                case "ArrowUp":
                    if (this.notation) {
                        if (this.page.getThis().index > 0) {
                            this.page.setSelect(false);
                            this.page = this.notation.getThis().pages[
                                this.page.getThis().index - 1
                            ];
                            this.page.setSelect(true);
                            return true;
                        } else return true;
                    } else return false;
                case "ArrowDown":
                    if (this.notation !== null) {
                        let l = this.notation.getThis().pages.length;
                        if (this.page.getThis().index < l - 1) {
                            this.page.setSelect(false);
                            this.page = this.notation.getThis().pages[
                                this.page.getThis().index + 1
                            ];
                            this.page.setSelect(true);
                            return true;
                        } else return true;
                    } else return false;
                default:
                    return false;
            }
        } else return false;
    }
    keyNotation(ev: KeyboardEvent): boolean {
        if (this.notation !== null) {
            switch (ev.key) {
                case "Enter":
                    if (this.notation.getThis().pages.length <= 0) {
                        this.notation
                            .getThis()
                            .addPage(this.notation.getThis().pages.length);
                    }
                    this.page = this.notation.getThis().pages[0];
                    this.page.setSelect(true);
                    this.notation.setSelect(false);
                    return true;
                case " ":
                    this.notation.addPage(this.notation.getThis().pages.length);
                    ev.returnValue = false;
                    return true;
                default:
                    return false;
            }
        } else return false;
    }




}

export default Selector;
