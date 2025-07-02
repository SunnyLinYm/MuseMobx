"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Selector = /** @class */ (function () {
    function Selector() {
        var _this = this;
        this.subnote = null;
        this.note = null;
        this.bar = null;
        this.track = null;
        this.line = null;
        this.page = null;
        this.notation = null;
        this.subnoise = null;
        this.noise = null;
        this.row = null;
        this.measure = null;
        this.paragraph = null;
        this.isObjectMove = null;
        document.addEventListener("keydown", function (ev) {
            if (!_this.keySubNote(ev)) {
                if (!_this.keyNote(ev)) {
                    if (!_this.keyBar(ev)) {
                        if (!_this.keyTrack(ev)) {
                            if (!_this.keyLine(ev)) {
                                if (!_this.keyPage(ev)) {
                                    if (_this.keyNotation(ev))
                                        ev.returnValue = false;
                                }
                                else
                                    ev.returnValue = false;
                            }
                            else
                                ev.returnValue = false;
                        }
                        else
                            ev.returnValue = false;
                    }
                    else
                        ev.returnValue = false;
                }
                else
                    ev.returnValue = false;
            }
            else
                ev.returnValue = false;
        });
    }
    Selector.prototype.moveObject = function (o) {
        var _a;
        console.log("moveObject(o: any)");
        (_a = this.isObjectMove) === null || _a === void 0 ? void 0 : _a.setIsMove(false);
        this.isObjectMove = o;
        this.isObjectMove.setIsMove(true);
    };
    Selector.prototype.selectSubNote = function (s) {
        var _a;
        (_a = this.subnote) === null || _a === void 0 ? void 0 : _a.setSelect(false);
        this.subnote = s;
        this.subnote.setSelect(true);
        this.selectNote(s.getThis().note);
    };
    Selector.prototype.selectNote = function (s) {
        var _a;
        (_a = this.note) === null || _a === void 0 ? void 0 : _a.setSelect(false);
        this.note = s;
        if (this.subnote === null)
            this.note.setSelect(true);
        this.selectBar(s.getThis().bar);
    };
    Selector.prototype.selectBar = function (s) {
        var _a;
        (_a = this.bar) === null || _a === void 0 ? void 0 : _a.setSelect(false);
        this.bar = s;
        if (this.note === null)
            this.bar.setSelect(true);
        this.selectTrack(s.getThis().track);
    };
    Selector.prototype.selectTrack = function (s) {
        var _a;
        (_a = this.track) === null || _a === void 0 ? void 0 : _a.setSelect(false);
        this.track = s;
        if (this.bar === null)
            this.track.setSelect(true);
        this.selectLine(s.getThis().line);
    };
    Selector.prototype.selectLine = function (s) {
        var _a;
        (_a = this.line) === null || _a === void 0 ? void 0 : _a.setSelect(false);
        this.line = s;
        if (this.track === null)
            this.line.setSelect(true);
        this.selectPage(s.getThis().page);
    };
    Selector.prototype.selectPage = function (s) {
        var _a;
        (_a = this.page) === null || _a === void 0 ? void 0 : _a.setSelect(false);
        this.page = s;
        if (this.line === null)
            this.page.setSelect(true);
        if (this.paragraph === null)
            this.page.setSelect(true);
        this.selectNotation(s.getThis().notation);
    };
    Selector.prototype.selectNotation = function (s) {
        var _a;
        (_a = this.notation) === null || _a === void 0 ? void 0 : _a.setSelect(false);
        this.notation = s;
        if (this.page === null)
            this.notation.setSelect(true);
    };
    Selector.prototype.keySubNote = function (ev) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (this.subnote !== null) {
            switch (ev.key) {
                case "Escape":
                    this.subnote.setSelect(false);
                    this.subnote = null;
                    (_a = this.note) === null || _a === void 0 ? void 0 : _a.setSelect(true);
                    return true;
                case "Backspace":
                    if (this.note) {
                        var idx = this.subnote.getThis().index;
                        this.note.removeSubNote(this.subnote.getThis().index);
                        if (this.note.getThis().subNotes.length === 0) {
                            this.note.setSelect(true);
                            this.subnote.setSelect(false);
                            this.subnote = null;
                        }
                        else {
                            if (idx === 0) {
                                this.subnote = this.note.getThis().subNotes[0];
                                this.subnote.setSelect(true);
                            }
                            else {
                                this.subnote = this.note.getThis().subNotes[idx - 1];
                                this.subnote.setSelect(true);
                            }
                        }
                    }
                    return true;
                case " ":
                    return true;
                case "z":
                    if (this.note) {
                        (_b = this.note) === null || _b === void 0 ? void 0 : _b.addSubNote(0);
                        this.selectSubNote((_c = this.note) === null || _c === void 0 ? void 0 : _c.getThis().subNotes[0]);
                    }
                    return true;
                case "x":
                    if (this.note) {
                        var idx = this.subnote.getThis().index;
                        (_d = this.note) === null || _d === void 0 ? void 0 : _d.addSubNote(idx);
                        this.selectSubNote((_e = this.note) === null || _e === void 0 ? void 0 : _e.getThis().subNotes[idx]);
                    }
                    return true;
                case "c":
                    if (this.note) {
                        var idx = this.subnote.getThis().index;
                        (_f = this.note) === null || _f === void 0 ? void 0 : _f.addSubNote(idx + 1);
                        this.selectSubNote((_g = this.note) === null || _g === void 0 ? void 0 : _g.getThis().subNotes[idx + 1]);
                    }
                    return true;
                case "v":
                    if (this.note) {
                        (_h = this.note) === null || _h === void 0 ? void 0 : _h.addSubNote(this.note.getThis().subNotes.length);
                        this.selectSubNote((_j = this.note) === null || _j === void 0 ? void 0 : _j.getThis().subNotes[this.note.getThis().subNotes.length - 1]);
                    }
                    return true;
                case "ArrowUp":
                    if (this.note) {
                        var l = this.note.getThis().subNotes.length;
                        if (l > this.subnote.getThis().index + 1) {
                            this.subnote.setSelect(false);
                            this.subnote = this.note.getThis().subNotes[this.subnote.getThis().index + 1];
                            this.subnote.setSelect(true);
                        }
                    }
                    return true;
                case "ArrowDown":
                    if (this.note) {
                        if (this.subnote.getThis().index > 0) {
                            this.subnote.setSelect(false);
                            this.subnote = this.note.getThis().subNotes[this.subnote.getThis().index - 1];
                            this.subnote.setSelect(true);
                        }
                    }
                    return true;
                case "ArrowLeft":
                    return true;
                case "ArrowRight":
                    return true;
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
                    this.subnote.setNum(ev.key);
                    return true;
                case "r":
                    this.subnote.reducePoint(1);
                    return true;
                case "f":
                    this.subnote.reducePoint(-1);
                    return true;
                case "q":
                    this.subnote.reduceLine(-1);
                    return true;
                case "a":
                    this.subnote.reduceLine(1);
                    return true;
                case "s":
                    this.subnote.reduceTailPoint(-1);
                    return true;
                case "d":
                    this.subnote.reduceTailPoint(1);
                    return true;
                default:
                    return false;
            }
        }
        else
            return false;
    };
    Selector.prototype.keyNote = function (ev) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        if (this.note) {
            switch (ev.key) {
                case "Enter":
                    if (this.note.getThis().subNotes.length <= 0) {
                        this.note.addSubNote(this.note.getThis().subNotes.length);
                    }
                    this.subnote = this.note.getThis().subNotes[0];
                    this.subnote.setSelect(true);
                    this.note.setSelect(false);
                    return true;
                case "Escape":
                    this.note.setSelect(false);
                    this.note = null;
                    (_a = this.bar) === null || _a === void 0 ? void 0 : _a.setSelect(true);
                    return true;
                case " ":
                    this.note.addSubNote(this.note.getThis().subNotes.length);
                    return true;
                case "z":
                    if (this.bar) {
                        (_b = this.bar) === null || _b === void 0 ? void 0 : _b.addNote(0);
                        this.selectNote((_c = this.bar) === null || _c === void 0 ? void 0 : _c.getThis().notes[0]);
                    }
                    return true;
                case "x":
                    if (this.bar) {
                        var idx = this.note.getThis().index;
                        (_d = this.bar) === null || _d === void 0 ? void 0 : _d.addNote(idx);
                        this.selectNote((_e = this.bar) === null || _e === void 0 ? void 0 : _e.getThis().notes[idx]);
                    }
                    return true;
                case "c":
                    if (this.bar) {
                        var idx = this.note.getThis().index;
                        (_f = this.bar) === null || _f === void 0 ? void 0 : _f.addNote(idx + 1);
                        this.selectNote((_g = this.bar) === null || _g === void 0 ? void 0 : _g.getThis().notes[idx + 1]);
                    }
                    return true;
                case "v":
                    if (this.bar) {
                        (_h = this.bar) === null || _h === void 0 ? void 0 : _h.addNote(this.bar.getThis().notes.length);
                        this.selectNote((_j = this.bar) === null || _j === void 0 ? void 0 : _j.getThis().notes[this.bar.getThis().notes.length - 1]);
                    }
                    return true;
                case "Backspace":
                    if (this.bar) {
                        var idx = this.note.getThis().index;
                        this.bar.removeNote(idx);
                        if (this.bar.getThis().notes.length === 0) {
                            this.bar.setSelect(true);
                            this.note.setSelect(false);
                            this.note = null;
                        }
                        else {
                            if (idx === 0) {
                                this.note = this.bar.getThis().notes[0];
                                this.note.setSelect(true);
                            }
                            else {
                                this.note = this.bar.getThis().notes[idx - 1];
                                this.note.setSelect(true);
                            }
                        }
                    }
                    return true;
                case "ArrowLeft":
                    if (this.bar) {
                        if (this.note.getThis().index > 0) {
                            this.note.setSelect(false);
                            this.note = this.bar.getThis().notes[this.note.getThis().index - 1];
                            this.note.setSelect(true);
                            return true;
                        }
                        else if (this.track) {
                            if (this.bar.getThis().index > 0) {
                                this.bar.setSelect(false);
                                this.bar = this.track.getThis().bars[this.bar.getThis().index - 1];
                                this.note.setSelect(false);
                                this.note = this.bar.getThis().notes[this.bar.getThis().notes.length - 1];
                                this.note.setSelect(true);
                                return true;
                            }
                            else
                                return false;
                        }
                        else
                            return false;
                    }
                    else
                        return false;
                case "ArrowRight":
                    if (this.bar !== null) {
                        var l = this.bar.getThis().notes.length;
                        if (this.note.getThis().index < l - 1) {
                            this.note.setSelect(false);
                            this.note = this.bar.getThis().notes[this.note.getThis().index + 1];
                            this.note.setSelect(true);
                            return true;
                        }
                        else if (this.track) {
                            if (this.bar.getThis().index <
                                ((_k = this.track) === null || _k === void 0 ? void 0 : _k.getThis().bars.length) - 1) {
                                this.bar.setSelect(false);
                                this.bar = this.track.getThis().bars[this.bar.getThis().index + 1];
                                this.note.setSelect(false);
                                this.note = this.bar.getThis().notes[0];
                                this.note.setSelect(true);
                                return true;
                            }
                            else
                                return false;
                        }
                        else
                            return false;
                    }
                    else
                        return false;
                case "ArrowUp":
                    return true;
                case "ArrowDown":
                    return true;
                case "q":
                    this.note.reduceLine(-1);
                    return true;
                case "a":
                    this.note.reduceLine(1);
                    return true;
                case "s":
                    this.note.reduceTailPoint(-1);
                    return true;
                case "d":
                    this.note.reduceTailPoint(1);
                    return true;
                default:
                    return false;
            }
        }
        else
            return false;
    };
    Selector.prototype.keyBar = function (ev) {
        var _a, _b;
        if (this.bar !== null) {
            switch (ev.key) {
                case "Enter":
                    if (this.bar.getThis().notes.length <= 0) {
                        this.bar.addNote(this.bar.getThis().notes.length);
                    }
                    this.note = this.bar.getThis().notes[0];
                    this.note.setSelect(true);
                    this.bar.setSelect(false);
                    return true;
                case "Escape":
                    this.bar.setSelect(false);
                    this.bar = null;
                    (_a = this.track) === null || _a === void 0 ? void 0 : _a.setSelect(true);
                    return true;
                case " ":
                    this.bar.addNote(this.bar.getThis().notes.length);
                    return true;
                case "z":
                    if (this.track) {
                        this.track.addBar(0);
                        this.selectBar(this.track.getThis().bars[0]);
                    }
                    return true;
                case "x":
                    if (this.track) {
                        var idx = this.bar.getThis().index;
                        this.track.addBar(idx);
                        this.selectBar(this.track.getThis().bars[idx]);
                    }
                    return true;
                case "c":
                    if (this.track) {
                        var idx = this.bar.getThis().index;
                        this.track.addBar(idx + 1);
                        this.selectBar(this.track.getThis().bars[idx + 1]);
                    }
                    return true;
                case "v":
                    if (this.track) {
                        this.track.addBar(this.track.getThis().bars.length);
                        this.selectBar(this.track.getThis().bars[this.track.getThis().bars.length - 1]);
                    }
                    return true;
                case "Backspace":
                    if (this.track) {
                        var idx = this.bar.getThis().index;
                        this.track.removeBar(idx);
                        if (this.track.getThis().bars.length === 0) {
                            this.track.setSelect(true);
                            this.bar.setSelect(false);
                            this.bar = null;
                        }
                        else {
                            if (idx === 0) {
                                this.bar = this.track.getThis().bars[0];
                                this.bar.setSelect(true);
                            }
                            else {
                                this.bar = this.track.getThis().bars[idx - 1];
                                this.bar.setSelect(true);
                            }
                        }
                    }
                    return true;
                case "ArrowLeft":
                    if (this.track) {
                        if (this.bar.getThis().index > 0) {
                            this.bar.setSelect(false);
                            this.bar = this.track.getThis().bars[this.bar.getThis().index - 1];
                            this.bar.setSelect(true);
                            return true;
                        }
                        else
                            return true;
                    }
                    else
                        return false;
                case "ArrowRight":
                    if (this.track !== null) {
                        var l = this.track.getThis().bars.length;
                        if (this.bar.getThis().index < l - 1) {
                            this.bar.setSelect(false);
                            this.bar = this.track.getThis().bars[this.bar.getThis().index + 1];
                            this.bar.setSelect(true);
                            return true;
                        }
                        else
                            return true;
                    }
                    else
                        return false;
                case "ArrowUp":
                    if (this.track && this.line) {
                        if (this.track.getThis().index > 0) {
                            this.track = this.line.getThis().tracks[this.track.getThis().index - 1];
                            this.bar.setSelect(false);
                            this.bar = this.track.getThis().bars[this.bar.getThis().index];
                            this.bar.setSelect(true);
                            return true;
                        }
                        else if (this.page) {
                            if (this.line.getThis().index > 0) {
                                this.line = this.page.getThis().lines[this.line.getThis().index - 1];
                                this.track = this.line.getThis().tracks[this.line.getThis().tracks.length - 1];
                                this.bar.setSelect(false);
                                if (this.track.getThis().bars.length > this.bar.getThis().index) {
                                    this.bar = this.track.getThis().bars[this.bar.getThis().index];
                                }
                                else {
                                    this.bar = this.track.getThis().bars[this.track.getThis().bars.length - 1];
                                }
                                this.bar.setSelect(true);
                                return true;
                            }
                            else if (this.notation) {
                                if (this.page.getThis().index > 0) {
                                    this.page = this.notation.getThis().pages[this.page.getThis().index - 1];
                                    this.line = this.page.getThis().lines[this.page.getThis().lines.length - 1];
                                    this.track = this.line.getThis().tracks[this.line.getThis().tracks.length - 1];
                                    this.bar.setSelect(false);
                                    if (this.track.getThis().bars.length > this.bar.getThis().index) {
                                        this.bar = this.track.getThis().bars[this.bar.getThis().index];
                                    }
                                    else {
                                        this.bar = this.track.getThis().bars[this.track.getThis().bars.length - 1];
                                    }
                                    this.bar.setSelect(true);
                                    return true;
                                }
                                else
                                    return false;
                            }
                            else
                                return false;
                        }
                        else
                            return false;
                    }
                    else
                        return false;
                case "ArrowDown":
                    if (this.track && this.line) {
                        var l = this.line.getThis().tracks.length;
                        if (this.track.getThis().index < l - 1) {
                            this.track = this.line.getThis().tracks[this.track.getThis().index + 1];
                            this.bar.setSelect(false);
                            this.bar = this.track.getThis().bars[this.bar.getThis().index];
                            this.bar.setSelect(true);
                            return true;
                        }
                        else if (this.page) {
                            if (this.line.getThis().index <
                                ((_b = this.page) === null || _b === void 0 ? void 0 : _b.getThis().lines.length) - 1) {
                                this.line = this.page.getThis().lines[this.line.getThis().index + 1];
                                this.track = this.line.getThis().tracks[0];
                                this.bar.setSelect(false);
                                if (this.track.getThis().bars.length > this.bar.getThis().index) {
                                    this.bar = this.track.getThis().bars[this.bar.getThis().index];
                                }
                                else {
                                    this.bar = this.track.getThis().bars[this.track.getThis().bars.length - 1];
                                }
                                this.bar.setSelect(true);
                                return true;
                            }
                            else if (this.notation) {
                                if (this.page.getThis().index <
                                    this.notation.getThis().pages.length - 1) {
                                    this.page = this.notation.getThis().pages[this.page.getThis().index + 1];
                                    this.line = this.page.getThis().lines[0];
                                    this.track = this.line.getThis().tracks[0];
                                    this.bar.setSelect(false);
                                    if (this.track.getThis().bars.length > this.bar.getThis().index) {
                                        this.bar = this.track.getThis().bars[this.bar.getThis().index];
                                    }
                                    else {
                                        this.bar = this.track.getThis().bars[this.track.getThis().bars.length - 1];
                                    }
                                    this.bar.setSelect(true);
                                    return true;
                                }
                                else
                                    return false;
                            }
                            else
                                return false;
                        }
                        else
                            return false;
                    }
                    else
                        return false;
                default:
                    return false;
            }
        }
        else
            return false;
    };
    Selector.prototype.keyTrack = function (ev) {
        var _a;
        if (this.track !== null) {
            switch (ev.key) {
                case "Enter":
                    if (this.track.getThis().bars.length <= 0) {
                        this.track.addBar(this.track.getThis().bars.length);
                    }
                    this.bar = this.track.getThis().bars[0];
                    this.bar.setSelect(true);
                    this.track.setSelect(false);
                    return true;
                case "Escape":
                    this.track.setSelect(false);
                    this.track = null;
                    (_a = this.line) === null || _a === void 0 ? void 0 : _a.setSelect(true);
                    return true;
                case " ":
                    this.track.addBar(this.track.getThis().bars.length);
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
                        var idx = this.track.getThis().index;
                        this.line.addTrack(idx);
                        this.selectTrack(this.line.getThis().tracks[idx]);
                    }
                    return true;
                case "c":
                    if (this.line) {
                        var idx = this.track.getThis().index;
                        this.line.addTrack(idx + 1);
                        this.selectTrack(this.line.getThis().tracks[idx + 1]);
                    }
                    return true;
                case "v":
                    if (this.line) {
                        this.line.addTrack(this.line.getThis().tracks.length);
                        this.selectTrack(this.line.getThis().tracks[this.line.getThis().tracks.length - 1]);
                    }
                    return true;
                case "Backspace":
                    if (this.line) {
                        var idx = this.track.getThis().index;
                        this.line.removeTrack(this.track.getThis().index);
                        if (this.line.getThis().tracks.length === 0) {
                            this.line.setSelect(true);
                            this.track.setSelect(false);
                            this.track = null;
                        }
                        else {
                            if (idx === 0) {
                                this.track = this.line.getThis().tracks[0];
                                this.track.setSelect(true);
                            }
                            else {
                                this.track = this.line.getThis().tracks[idx - 1];
                                this.track.setSelect(true);
                            }
                        }
                    }
                    return true;
                case "ArrowUp":
                    if (this.line) {
                        if (this.track.getThis().index > 0) {
                            this.track.setSelect(false);
                            this.track = this.line.getThis().tracks[this.track.getThis().index - 1];
                            this.track.setSelect(true);
                            return true;
                        }
                        else if (this.page) {
                            if (this.line.getThis().index > 0) {
                                this.line.setSelect(false);
                                this.line = this.page.getThis().lines[this.line.getThis().index - 1];
                                this.track.setSelect(false);
                                this.track = this.line.getThis().tracks[this.line.getThis().tracks.length - 1];
                                this.track.setSelect(true);
                                return true;
                            }
                            else if (this.notation) {
                                if (this.page.getThis().index > 0) {
                                    this.page = this.notation.getThis().pages[this.page.getThis().index - 1];
                                    this.line = this.page.getThis().lines[this.page.getThis().lines.length - 1];
                                    this.track.setSelect(false);
                                    this.track = this.line.getThis().tracks[this.line.getThis().tracks.length - 1];
                                    this.track.setSelect(true);
                                    return true;
                                }
                                else
                                    return false;
                            }
                            else
                                return false;
                        }
                        else
                            return false;
                    }
                    else
                        return false;
                case "ArrowDown":
                    if (this.line !== null) {
                        var l = this.line.getThis().tracks.length;
                        if (this.track.getThis().index < l - 1) {
                            this.track.setSelect(false);
                            this.track = this.line.getThis().tracks[this.track.getThis().index + 1];
                            this.track.setSelect(true);
                            return true;
                        }
                        else if (this.page) {
                            if (this.line.getThis().index <
                                this.page.getThis().lines.length - 1) {
                                this.line.setSelect(false);
                                this.line = this.page.getThis().lines[this.line.getThis().index + 1];
                                this.track.setSelect(false);
                                this.track = this.line.getThis().tracks[0];
                                this.track.setSelect(true);
                                return true;
                            }
                            else if (this.notation) {
                                if (this.page.getThis().index <
                                    this.notation.getThis().pages.length - 1) {
                                    this.page = this.notation.getThis().pages[this.page.getThis().index + 1];
                                    this.line = this.page.getThis().lines[0];
                                    this.track.setSelect(false);
                                    this.track = this.line.getThis().tracks[0];
                                    this.track.setSelect(true);
                                    return true;
                                }
                                else
                                    return false;
                            }
                            else
                                return false;
                        }
                        else
                            return false;
                    }
                    else
                        return false;
                default:
                    return false;
            }
        }
        else
            return false;
    };
    Selector.prototype.keyLine = function (ev) {
        var _a;
        if (this.line !== null) {
            switch (ev.key) {
                case "Enter":
                    if (this.line.getThis().tracks.length <= 0) {
                        this.line.getThis().addTrack(this.line.getThis().tracks.length);
                    }
                    this.track = this.line.getThis().tracks[0];
                    this.track.setSelect(true);
                    this.line.setSelect(false);
                    return true;
                case "Escape":
                    this.line.setSelect(false);
                    this.line = null;
                    (_a = this.page) === null || _a === void 0 ? void 0 : _a.setSelect(true);
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
                        var idx = this.line.getThis().index;
                        this.page.addLine(idx);
                        this.selectLine(this.page.getThis().lines[idx]);
                    }
                    return true;
                case "c":
                    if (this.page) {
                        var idx = this.line.getThis().index;
                        this.page.addLine(idx + 1);
                        this.selectLine(this.page.getThis().lines[idx + 1]);
                    }
                    return true;
                case "v":
                    if (this.page) {
                        this.page.addLine(this.page.getThis().lines.length);
                        this.selectLine(this.page.getThis().lines[this.page.getThis().lines.length - 1]);
                    }
                    return true;
                case "Backspace":
                    if (this.page) {
                        var idx = this.line.getThis().index;
                        this.page.removeLine(this.line.getThis().index);
                        if (this.page.getThis().lines.length === 0) {
                            this.page.setSelect(true);
                            this.line.setSelect(false);
                            this.line = null;
                        }
                        else {
                            if (idx === 0) {
                                this.line = this.page.getThis().lines[0];
                                this.line.setSelect(true);
                            }
                            else {
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
                            this.line = this.page.getThis().lines[this.line.getThis().index - 1];
                            this.line.setSelect(true);
                            return true;
                        }
                        else if (this.notation) {
                            if (this.page.getThis().index > 0) {
                                this.page = this.notation.getThis().pages[this.page.getThis().index - 1];
                                this.line.setSelect(false);
                                this.line = this.page.getThis().lines[this.page.getThis().lines.length - 1];
                                this.line.setSelect(true);
                                return true;
                            }
                            else
                                return false;
                        }
                        else
                            return false;
                    }
                    else
                        return false;
                case "ArrowDown":
                    if (this.page !== null) {
                        var l = this.page.getThis().lines.length;
                        if (this.line.getThis().index < l - 1) {
                            this.line.setSelect(false);
                            this.line = this.page.getThis().lines[this.line.getThis().index + 1];
                            this.line.setSelect(true);
                            return true;
                        }
                        else if (this.notation) {
                            if (this.page.getThis().index <
                                this.notation.getThis().pages.length - 1) {
                                this.page = this.notation.getThis().pages[this.page.getThis().index + 1];
                                this.line.setSelect(false);
                                this.line = this.page.getThis().lines[0];
                                this.line.setSelect(true);
                                return true;
                            }
                            else
                                return false;
                        }
                        else
                            return false;
                    }
                    else
                        return false;
                default:
                    return false;
            }
        }
        else
            return false;
    };
    Selector.prototype.keyPage = function (ev) {
        var _a, _b;
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
                    (_a = this.notation) === null || _a === void 0 ? void 0 : _a.setSelect(true);
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
                        var idx = this.page.getThis().index;
                        this.notation.addPage(idx);
                        this.selectPage(this.notation.getThis().pages[idx]);
                    }
                    return true;
                case "c":
                    if (this.notation) {
                        var idx = this.page.getThis().index;
                        this.notation.addPage(idx + 1);
                        this.selectPage(this.notation.getThis().pages[idx + 1]);
                    }
                    return true;
                case "v":
                    if (this.notation) {
                        this.notation.addPage(this.notation.getThis().pages.length);
                        this.selectPage(this.notation.getThis().pages[this.notation.getThis().pages.length - 1]);
                    }
                    return true;
                case "Backspace":
                    if (this.notation) {
                        var idx = this.page.getThis().index;
                        (_b = this.notation) === null || _b === void 0 ? void 0 : _b.reomvePage(this.page.getThis().index);
                        if (this.notation.getThis().pages.length === 0) {
                            this.notation.setSelect(true);
                            this.page.setSelect(false);
                            this.page = null;
                        }
                        else {
                            if (idx === 0) {
                                this.page = this.notation.getThis().pages[0];
                                this.page.setSelect(true);
                            }
                            else {
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
                            this.page = this.notation.getThis().pages[this.page.getThis().index - 1];
                            this.page.setSelect(true);
                            return true;
                        }
                        else
                            return true;
                    }
                    else
                        return false;
                case "ArrowDown":
                    if (this.notation !== null) {
                        var l = this.notation.getThis().pages.length;
                        if (this.page.getThis().index < l - 1) {
                            this.page.setSelect(false);
                            this.page = this.notation.getThis().pages[this.page.getThis().index + 1];
                            this.page.setSelect(true);
                            return true;
                        }
                        else
                            return true;
                    }
                    else
                        return false;
                default:
                    return false;
            }
        }
        else
            return false;
    };
    Selector.prototype.keyNotation = function (ev) {
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
        }
        else
            return false;
    };
    Selector.prototype.selectSubNoise = function (s) {
        var _a;
        (_a = this.subnoise) === null || _a === void 0 ? void 0 : _a.setSelect(false);
        this.subnoise = s;
        this.subnoise.setSelect(true);
        this.selectNoise(s.getThis().noise);
    };
    Selector.prototype.selectNoise = function (s) {
        var _a;
        (_a = this.noise) === null || _a === void 0 ? void 0 : _a.setSelect(false);
        this.noise = s;
        if (this.subnoise === null)
            this.noise.setSelect(true);
        this.selectRow(s.getThis().row);
    };
    Selector.prototype.selectRow = function (s) {
        var _a;
        (_a = this.row) === null || _a === void 0 ? void 0 : _a.setSelect(false);
        this.row = s;
        if (this.noise === null)
            this.row.setSelect(true);
        this.selectMeasure(s.getThis().measure);
    };
    Selector.prototype.selectMeasure = function (s) {
        var _a;
        (_a = this.measure) === null || _a === void 0 ? void 0 : _a.setSelect(false);
        this.measure = s;
        if (this.row === null)
            this.measure.setSelect(true);
        this.selectParagraph(s.getThis().paragraph);
    };
    Selector.prototype.selectParagraph = function (s) {
        var _a;
        (_a = this.paragraph) === null || _a === void 0 ? void 0 : _a.setSelect(false);
        this.paragraph = s;
        if (this.measure === null)
            this.paragraph.setSelect(true);
        this.selectPage(s.getThis().page);
    };
    Selector.instance = new Selector();
    return Selector;
}());
exports.default = Selector;
//# sourceMappingURL=ZSelector.js.map