﻿class Buttons {
	constructor() {
		this.alpha = 255;
		this.arc = 1;
		this.cur = null;
		this.Dn = false;
		this.hoverArea = 4;
		this.hot_h = 4;
		this.leaveTimeStamp = 0;
		this.margin = Math.max(ppt.margin * 2 + 2, 12) / 4;
		this.trace = false;
		this.transition;
		this.vertical = true;

		this.b = {}
		this.btns = {}
		this.s = {}

		this.cross = {
			hover: null,
			normal: null
		}

		this.q = {
			s_img: null
		}

		this.scr = {
			bg: null,
			btns: ['scrollUp', 'scrollDn'],
			iconFontName: 'Segoe UI Symbol',
			iconFontStyle: 0,
			img: null,
			opaque: ui.getOpaque(),
			pad: $.clamp(ppt.sbarButPad / 100, -0.5, 0.3)
		}

		this.tooltip = {
			delay: true,
			show: true,
			start: Date.now() - 2000
		}

		this.setSbarIcon();
		this.createImages();
	}

	// Methods

	checkScrollBtns(x, y, hover_btn) {
		if (sbar.timer_but) {
			if ((this.btns['scrollUp'].down || this.btns['scrollDn'].down) && !this.btns['scrollUp'].trace(x, y) && !this.btns['scrollDn'].trace(x, y)) {
				this.btns['scrollUp'].cs('normal');
				this.btns['scrollDn'].cs('normal');
				clearTimeout(sbar.timer_but);
				sbar.timer_but = false;
				sbar.count = -1;
			}
		} else if (hover_btn) this.scr.btns.forEach(v => {
			if (hover_btn.name == v && hover_btn.down) {
				this.btns[v].cs('down');
				hover_btn.l_dn();
			}
		});
	}

	clear() {
		this.Dn = false;
		Object.values(this.btns).forEach(v => v.down = false);
	}

	createImages() {
		let sz = this.scr.arrow == 0 ? Math.max(Math.round(ui.sbar.but_h * 1.666667), 1) : 100;
		const sc = sz / 100;
		const iconFont = gdi.Font(this.scr.iconFontName, sz, this.scr.iconFontStyle);
		this.alpha = !ui.sbar.col ? [75, 192, 228] : [68, 153, 255];
		const hovAlpha = (!ui.sbar.col ? 75 : (!ui.sbar.type ? 68 : 51)) * 0.4;
		this.scr.hover = !ui.sbar.col ? RGBA(ui.col.t, ui.col.t, ui.col.t, hovAlpha) : ui.col.text & RGBA(255, 255, 255, hovAlpha);
		this.q.s_img = $.gr(100, 100, true, g => {
			g.SetSmoothingMode(2);
			g.DrawLine(59, 59, 90, 90, 10, !ui.id.local ? ui.col.txt_box_h : ui.col.txt_box);
			g.DrawEllipse(10, 10, 54, 54, 10, !ui.id.local ? ui.col.txt_box_h : ui.col.txt_box);
			g.FillEllipse(16, 16, 42, 42, 0x0AFAFAFA);
			g.SetSmoothingMode(0);
		});
		this.q.s_img.RotateFlip(4);
		this.scr.img = $.gr(sz, sz, true, g => {
			g.SetTextRenderingHint(3);
			g.SetSmoothingMode(2);
			if (ui.sbar.col) {
				this.scr.arrow == 0 ? g.FillPolygon(ui.col.text, 1, [50 * sc, 0, 100 * sc, 76 * sc, 0, 76 * sc]) : g.DrawString(this.scr.arrow, iconFont, ui.col.text, 0, sz * this.scr.pad, sz, sz, StringFormat(1, 1));
			} else {
				this.scr.arrow == 0 ? g.FillPolygon(RGBA(ui.col.t, ui.col.t, ui.col.t, 255), 1, [50 * sc, 0, 100 * sc, 76 * sc, 0, 76 * sc]) :
					g.DrawString(this.scr.arrow, iconFont, RGBA(ui.col.t, ui.col.t, ui.col.t, 255), 0, sz * this.scr.pad, sz, sz, StringFormat(1, 1));
			}
			g.SetSmoothingMode(0);
		});
		this.scr.bg = $.gr(sz, sz, true, g => {
			g.SetTextRenderingHint(3);
			g.SetSmoothingMode(2);
			if (ui.sbar.col) {
				this.scr.arrow == 0 ? g.FillPolygon(ui.col.bg, 1, [50 * sc, 0, 100 * sc, 76 * sc, 0, 76 * sc]) : g.DrawString(this.scr.arrow, iconFont, ui.col.bg, 0, sz * this.scr.pad, sz, sz, StringFormat(1, 1));
			} else {
				this.scr.arrow == 0 ? g.FillPolygon(ui.col.bg, 1, [50 * sc, 0, 100 * sc, 76 * sc, 0, 76 * sc]) :
					g.DrawString(this.scr.arrow, iconFont, ui.col.bg, 0, sz * this.scr.pad, sz, sz, StringFormat(1, 1));
			}
			g.SetSmoothingMode(0);
		});
		sz = 100;
		this.cross.normal = $.gr(sz, sz, true, g => {
			g.SetTextRenderingHint(3);
			g.SetSmoothingMode(2);
			let nn = 31;
			let offset1 = 12;
			let offset2 = 2;
			g.DrawLine(offset1, nn - offset2, 100 - nn * 2 + offset1, 100 - nn - offset2, 5, !ui.id.local ? ui.col.txt_box_h : ui.col.txt_box);
			g.DrawLine(offset1, 100 - nn - offset2, 100 - nn * 2 + offset1, nn - offset2, 5, !ui.id.local ? ui.col.txt_box_h : ui.col.txt_box);
			g.SetSmoothingMode(0);
		});
		this.cross.hover = $.gr(sz, sz, true, g => {
			g.SetTextRenderingHint(3);
			g.SetSmoothingMode(2);
			let nn = 28;
			let offset1 = 9;
			let offset2 = 2;
			g.DrawLine(offset1, nn - offset2, 100 - nn * 2 + offset1, 100 - nn - offset2, 5, !ui.id.local ? ui.col.txt_box_h : ui.col.txt_box);
			g.DrawLine(offset1, 100 - nn - offset2, 100 - nn * 2 + offset1, nn - offset2, 5, !ui.id.local ? ui.col.txt_box_h : ui.col.txt_box);
			g.SetSmoothingMode(0);
		});
	}

	draw(gr) {
		Object.values(this.btns).forEach(v => {
			if (!v.hide) v.draw(gr);
		});
	}

	lbtn_dn(x, y) {
		if (!this.traceBtn('filter', x, y)) men.filter_dn = false;
		if (!this.traceBtn('settings', x, y)) men.settings_dn = false;
		this.move(x, y);
		if (!this.cur || this.cur.hide) {
			this.Dn = false;
			return false
		} else this.Dn = this.cur.name;
		this.cur.down = true;
		this.cur.cs('down');
		this.cur.lbtn_dn(x, y);
		return true;
	}

	lbtn_up(x, y) {
		if (!this.cur || this.cur.hide || this.Dn != this.cur.name) {
			this.clear();
			return false;
		}
		this.clear();
		if (this.cur.trace(x, y)) this.cur.cs('hover');
		this.cur.lbtn_up(x, y);
		return true;
	}

	leave() {
		if (this.cur) {
			this.cur.cs('normal');
			if (!this.cur.hide) this.transition.start();
		}
		this.cur = null;
		const timeStamp = Date.now();
		if (!this.traceBtn('settings', panel.m.x, panel.m.y)) men.settings_dn = false;
		if (!this.traceBtn('filter', panel.m.x, panel.m.y)) men.filter_dn = false;
		if (Math.abs(timeStamp - this.leaveTimeStamp) < 10) { // leave double called if menu showing and leave panel
			men.filter_dn = false;
			men.settings_dn = false;
		}
		this.leaveTimeStamp = timeStamp;
	}

	move(x, y) {
		const hover_btn = Object.values(this.btns).find(v => {
			if (!this.Dn || this.Dn == v.name) return v.trace(x, y);
		});
		let hand = false;
		this.checkScrollBtns(x, y, hover_btn);
		if (hover_btn) {
			hand = hover_btn.hand;
		}
		pop.hand = hand;
		if (hover_btn && hover_btn.hide) {
			if (this.cur) {
				this.cur.cs('normal');
				this.transition.start();
			}
			this.cur = null;
			return null;
		} // btn hidden, ignore
		if (this.cur === hover_btn) return this.cur;
		if (this.cur) {
			this.cur.cs('normal');
			this.transition.start();
		} // return prev btn to normal state
		if (hover_btn && !(hover_btn.down && hover_btn.type < 4)) {
			hover_btn.cs('hover');
			if (this.tooltip.show && hover_btn.tiptext) hover_btn.tt.show(hover_btn.tiptext());
			this.transition.start();
		}
		this.cur = hover_btn;
		return this.cur;
	}

	on_script_unload() {
		this.tt('');
	}

	reset() {
		this.transition.stop();
	}

	setSbarIcon() {
		switch (ppt.sbarButType) {
			case 0:
				this.scr.iconFontName = 'Segoe UI Symbol';
				this.scr.iconFontStyle = 0;
				if (!ui.sbar.type) {
					this.scr.arrow = ui.sbar.but_w < Math.round(14 * $.scale) ? '\uE018' : '\uE0A0';
					this.scr.pad = ui.sbar.but_w < Math.round(15 * $.scale) ? -0.3 : -0.22;
				} else {
					this.scr.arrow = ui.sbar.but_w < Math.round(14 * $.scale) ? '\uE018' : '\uE0A0';
					this.scr.pad = ui.sbar.but_w < Math.round(14 * $.scale) ? -0.26 : -0.22;
				}
				break;
			case 1:
				this.scr.arrow = 0;
				break;
			case 2:
				this.scr.iconFontName = ppt.butCustIconFont;
				this.scr.iconFontStyle = 0;
				this.scr.arrow = ppt.arrowSymbol.charAt().trim();
				if (!this.scr.arrow.length) this.scr.arrow = 0;
				this.scr.pad = $.clamp(ppt.sbarButPad / 100, -0.5, 0.3);
				break;
		}
	}

	setScrollBtnsHide(set, autoHide) {
		if (autoHide) {
			this.scr.btns.forEach(v => {
				if (this.btns[v]) this.btns[v].hide = set;
			});
			panel.treePaint();
		} else {
			if (!this.btns || (!ppt.sbarShow && !set)) return;
			this.scr.btns.forEach(v => {
				if (this.btns[v]) this.btns[v].hide = sbar.scrollable_lines < 1 || !ppt.sbarShow;
			});
		}
	}

	setSearchBtnsHide() {
		const noShow = !ppt.searchShow;
		const searching = (ppt.filterShow || ppt.settingsShow) && panel.search.txt;
		const o1 = this.btns.s_img;
		if (o1) o1.hide = noShow || searching;
		const o2 = this.btns.cross2;
		if (o2) o2.hide = noShow || !searching;
	}

	refresh(upd) {
		if (upd) {
			this.b.x = ui.w - ui.sz.marginSearch - Math.round(ui.row.h * 0.59);
			this.b.h = ui.row.h;
			this.b.y = Math.round((panel.search.sp - this.b.h * 0.4) / 2 - this.b.h * 0.27);
			this.scr.opaque = ui.getOpaque();
			this.vertical = !panel.imgView || img.style.vertical;
			switch (true) {
				case this.vertical:
					this.scr.x1 = panel.sbar_x;
					this.scr.yUp1 = sbar.y;
					this.scr.yDn1 = sbar.y + sbar.h - ui.sbar.but_h;
					if (ui.sbar.type != 2) {
						this.scr.x1 -= 1;
						this.scr.hotOffset = this.scr.yUp1 - panel.search.h;
						this.scr.x2 = (ui.sbar.but_h - ui.sbar.but_w) / 2;
						this.scr.yUp2 = -ui.sbar.arrowPad + this.scr.yUp1 + (ui.sbar.but_h - 1 - ui.sbar.but_w) / 2;
						this.scr.yDn2 = ui.sbar.arrowPad + this.scr.yDn1 + (ui.sbar.but_h - 1 - ui.sbar.but_w) / 2;
					}
					break;
				case !this.vertical:
					this.scr.x1 = sbar.x;
					this.scr.x3 = sbar.x + sbar.w - ui.sbar.but_h;
					this.scr.xLeft1 = sbar.x;
					this.scr.xRight1 = sbar.x + sbar.w - ui.sbar.but_h;
					this.scr.y1 = panel.sbar_y;
					if (ui.sbar.type != 2) {
						this.scr.y1 -= 1;
						this.scr.hotOffset = this.scr.xLeft1 - 0;
						this.scr.y2 = (ui.sbar.but_h - ui.sbar.but_w) / 2;
						this.scr.xLeft2 = -ui.sbar.arrowPad + this.scr.xLeft1 + (ui.sbar.but_h - 1 - ui.sbar.but_w) / 2;
						this.scr.xRight2 = ui.sbar.arrowPad + this.scr.xRight1 + (ui.sbar.but_h - 1 - ui.sbar.but_w) / 2;
					}
					break;
			}


			this.q.x = ui.sz.marginSearch;
			this.q.y = (panel.search.sp - ui.row.h * 0.6) / 2 + (ui.row.h - ui.font.main.Size) % 2;
			this.q.h = ui.row.h * 0.6;
			this.hoverArea = Math.round(panel.search.sp / 8);
			this.hot_h = Math.max(panel.search.sp - this.hoverArea * 2, 4);
			this.margin = Math.max(ppt.margin * 2 + 2, 12) / 4;
			this.arc = Math.max(Math.round(Math.min(panel.search.sp - this.hoverArea * 2, panel.settings.w + this.margin / 2) / 4), 1);
			this.s.w1 = panel.settings.w + but.margin;
			this.s.w2 = ui.w - ui.sz.marginSearch - 1 + panel.settings.offset;
			this.s.x = this.s.w2 - panel.settings.w - but.margin / 2;
		}
		if (ppt.sbarShow) {
			switch (ui.sbar.type) {
				case 2:
					switch (true) {
						case this.vertical:
							this.btns.scrollUp = new Btn(this.scr.x1, this.scr.yUp1, ui.sbar.but_h, ui.sbar.but_h, 3, '', '', '', {
								normal: 1,
								hover: 2,
								down: 3
							}, ppt.sbarShow == 1 && sbar.narrow.show || sbar.scrollable_lines < 1, () => sbar.but(1), '', '', false, 'scrollUp');
							this.btns.scrollDn = new Btn(this.scr.x1, this.scr.yDn1, ui.sbar.but_h, ui.sbar.but_h, 3, '', '', '', {
								normal: 5,
								hover: 6,
								down: 7
							}, ppt.sbarShow == 1 && sbar.narrow.show || sbar.scrollable_lines < 1, () => sbar.but(-1), '', '', false, 'scrollDn');
							break;
						case !this.vertical:
							this.btns.scrollUp = new Btn(this.scr.xLeft1, this.scr.y1, ui.sbar.but_h, ui.sbar.but_h, 3, '', '', '', {
								normal: 9,
								hover: 10,
								down: 11
							}, ppt.sbarShow == 1 && sbar.narrow.show || sbar.scrollable_lines < 1, () => sbar.but(1), '', '', false, 'scrollUp');
							this.btns.scrollDn = new Btn(this.scr.xRight1, this.scr.y1, ui.sbar.but_h, ui.sbar.but_h, 3, '', '', '', {
								normal: 13,
								hover: 14,
								down: 15
							}, ppt.sbarShow == 1 && sbar.narrow.show || sbar.scrollable_lines < 1, () => sbar.but(-1), '', '', false, 'scrollDn');
							break;
					}
					break;
				default:
					switch (true) {
						case this.vertical:
							this.btns.scrollUp = new Btn(this.scr.x1, this.scr.yUp1 - this.scr.hotOffset, ui.sbar.but_h, ui.sbar.but_h + this.scr.hotOffset, 1, this.scr.x2, this.scr.yUp2, ui.sbar.but_w, '', ppt.sbarShow == 1 && sbar.narrow.show || sbar.scrollable_lines < 1, () => sbar.but(1), '', '', false, 'scrollUp');
							this.btns.scrollDn = new Btn(this.scr.x1, this.scr.yDn1, ui.sbar.but_h, ui.sbar.but_h + this.scr.hotOffset, 2, this.scr.x2, this.scr.yDn2, ui.sbar.but_w, '', ppt.sbarShow == 1 && sbar.narrow.show || sbar.scrollable_lines < 1, () => sbar.but(-1), '', '', false, 'scrollDn');
							break;
						case !this.vertical:
							this.btns.scrollUp = new Btn(this.scr.xLeft1 - this.scr.hotOffset, this.scr.y1, ui.sbar.but_h, ui.sbar.but_h + this.scr.hotOffset, 1, this.scr.y2, this.scr.xLeft2, ui.sbar.but_w, '', ppt.sbarShow == 1 && sbar.narrow.show || sbar.scrollable_lines < 1, () => sbar.but(1), '', '', false, 'scrollUp');
							this.btns.scrollDn = new Btn(this.scr.xRight1, this.scr.y1, ui.sbar.but_h, ui.sbar.but_h + this.scr.hotOffset, 2, this.scr.y2, this.scr.xRight2, ui.sbar.but_w, '', ppt.sbarShow == 1 && sbar.narrow.show || sbar.scrollable_lines < 1, () => sbar.but(-1), '', '', false, 'scrollDn');
							break;
					}
					break;
			}
		}
		this.transition = new Transition(this.btns, v => v.state !== 'normal');
		this.btns.s_img = new Btn(this.q.x - this.margin / 2, this.hoverArea, this.q.h + this.margin, this.hot_h, 4, this.q.x, this.q.y, this.q.h, {
			normal: this.q.s_img
		}, false, '', () => {
			let fn = fb.FoobarPath + 'doc\\Query Syntax Help.html';
			if (!$.file(fn)) fn = fb.FoobarPath + 'Query Syntax Help.html';
			$.browser('"' + fn);
		}, () => 'Open query syntax help // Ctrl+E: focus search', true, 's_img');

		this.btns.cross2 = new Btn(this.q.x - this.margin / 2, this.hoverArea, this.q.h + this.margin, this.hot_h, 5, this.q.x, this.b.y, this.b.h, {
			normal: this.cross.normal,
			hover: this.cross.hover
		}, true, '', () => search.clear(), () => panel.search.txt ? 'Clear search text (escape)' : 'No search text to clear', true, 'cross2');

		this.btns.filter = new Btn(ppt.searchShow ? panel.filter.x + this.margin / 2 : panel.filter.x - this.margin / 2, 0, ppt.searchShow ? panel.filter.w - this.margin : panel.filter.w + this.margin, panel.search.sp, 6, panel.filter.x, ppt.searchShow ? panel.cc : panel.lc, panel.filter.w, {
			normal: !ui.id.local ? ui.col.txt_box : ui.col.txt_box,
			hover: !ui.id.local ? ui.col.txt_box_h : ui.col.txt_box
		}, !ppt.filterShow, '', () => {
			if (!men.filter_dn) {
				men.filter_dn = true;
				fMenu.load(panel.filter.x, panel.search.h);
			} else men.filter_dn = false;
		}, () => 'Filter', true, 'filter');

		this.btns.settings = new Btn(this.s.x, panel.settings.offset, this.s.w1, panel.search.sp, 7, this.s.w2, panel.search.sp, panel.settings.y, {
			normal: !ui.id.local ? ui.col.txt_box : ui.col.txt_box,
			hover: !ui.id.local ? ui.col.txt_box_h : ui.col.txt_box
		}, !ppt.settingsShow, '', () => {
			if (!men.settings_dn) {
				men.settings_dn = true;
				men.rbtn_up(this.s.x, panel.search.h, true);
			} else men.settings_dn = false;
		}, () => 'Settings', true, 'settings');

		this.btns.cross1 = new Btn(this.b.x - this.margin / 2, this.hoverArea, this.q.h + this.margin, this.hot_h, 5, this.b.x, this.b.y, this.b.h, {
			normal: this.cross.normal,
			hover: this.cross.hover
		}, !ppt.searchShow || ppt.filterShow || ppt.settingsShow, '', () => search.clear(), () => panel.search.txt ? 'Clear search text (escape)' : 'No search text to clear', true, 'cross1');
		this.setSearchBtnsHide();
	}

	traceBtn(btn, x, y) {
		const o = this.btns[btn];
		return o && o.trace(x, y);
	}

	tt(n, force) {
		if (tooltip.Text === n && !force) return;
		pop.checkTooltipFont('btn');
		tooltip.Text = n;
		tooltip.Activate();
	}
}

class Btn {
	constructor(x, y, w, h, type, p1, p2, p3, item, hide, l_dn, l_up, tiptext, hand, name) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.type = type;
		this.p1 = p1;
		this.p2 = p2;
		this.p3 = p3;
		this.item = item;
		this.hide = hide;
		this.l_dn = l_dn;
		this.l_up = l_up;
		this.tt = new Tooltip;
		this.tiptext = tiptext;
		this.hand = hand;
		this.name = name;
		this.transition_factor = 0;
		this.state = 'normal';
	}

	// Methods

	cs(state) {
		this.state = state;
		if (state === 'down' || state === 'normal') this.tt.clear();
		this.repaint();
	}

	draw(gr) {
		switch (this.type) {
			case 1:
			case 2:
				this.drawScrollBtn(gr);
				break;
			case 3:
				ui.theme.SetPartAndStateID(1, this.item[this.state]);
				ui.theme.DrawThemeBackground(gr, this.x, this.y, this.w, this.h);
				break;
			case 4:
				this.drawSearch(gr);
				break;
			case 5:
				this.drawCross(gr);
				break;
			case 6:
				this.drawFilter(gr);
				break;
			case 7:
				this.drawSettings(gr);
				break;
		}
	}

	drawCross(gr) {
		const a = !ui.id.local ? panel.search.txt ? (this.state !== 'down' ? Math.min(170 + (255 - 170) * this.transition_factor, 255) : 255) : 170 : 255;
		const crossIm = this.state === 'normal' || !panel.search.txt ? this.item.normal : this.item.hover;
		const colRect = this.state !== 'down' ? ui.getBlend(ui.col.bg4, ui.col.bg5, this.transition_factor, true) : ui.col.bg4;
		gr.SetSmoothingMode(2);
		gr.FillRoundRect(this.x, this.y, this.w, this.h, but.arc, but.arc, colRect);
		gr.SetSmoothingMode(0);
		gr.SetInterpolationMode(2);
		if (crossIm) gr.DrawImage(crossIm, this.p1, this.p2, this.p3, this.p3, 0, 0, crossIm.Width, crossIm.Height, 0, a);
		gr.SetInterpolationMode(0);
	}

	drawFilter(gr) {
		const colText = !ui.id.local ? (this.state !== 'down' ? ui.getBlend(this.item.hover, this.item.normal, this.transition_factor) : this.item.hover) : this.item.normal;
		const colRect = this.state !== 'down' ? ui.getBlend(ui.col.bg4, ui.col.bg5, this.transition_factor, true) : ui.col.bg4;
		gr.SetSmoothingMode(2);
		gr.FillRoundRect(this.x, but.hoverArea, this.w, but.hot_h, but.arc, but.arc, colRect);
		gr.SetSmoothingMode(0);
		gr.GdiDrawText(panel.filter.mode[ppt.filterBy].name, panel.filter.font, colText, this.p1, this.y, this.p3, this.h, this.p2);
	}

	drawScrollBtn(gr) {
		const a = this.state !== 'down' ? Math.min(but.alpha[0] + (but.alpha[1] - but.alpha[0]) * this.transition_factor, but.alpha[1]) : but.alpha[2];
		switch (true) {
			case but.vertical:
				if (this.state !== 'normal' && ui.sbar.type == 1) gr.FillSolidRect(sbar.x, this.y + (this.type == 1 ? but.scr.hotOffset - panel.sbar_o : 0), sbar.w, this.h - but.scr.hotOffset + panel.sbar_o, but.scr.hover);
				if (but.scr.opaque && but.scr.bg) gr.DrawImage(but.scr.bg, this.x + this.p1, this.p2, this.p3, this.p3, 0, 0, but.scr.bg.Width, but.scr.bg.Height, this.type == 1 ? 0 : 180);
				if (but.scr.img) gr.DrawImage(but.scr.img, this.x + this.p1, this.p2, this.p3, this.p3, 0, 0, but.scr.img.Width, but.scr.img.Height, this.type == 1 ? 0 : 180, a);
				break;
			case !but.vertical:
				if (this.state !== 'normal' && ui.sbar.type == 1) gr.FillSolidRect(this.x + (this.type == 1 ? but.scr.hotOffset - panel.sbar_o : 0), sbar.y, this.w - but.scr.hotOffset + panel.sbar_o, sbar.h, but.scr.hover);
				if (but.scr.opaque && but.scr.bg) gr.DrawImage(but.scr.bg, this.p2, this.y + this.p1, this.p3, this.p3, 0, 0, but.scr.bg.Width, but.scr.bg.Height, this.type == 1 ? 270 : 90);
				if (but.scr.img) gr.DrawImage(but.scr.img, this.p2, this.y + this.p1, this.p3, this.p3, 0, 0, but.scr.img.Width, but.scr.img.Height, this.type == 1 ? 270 : 90, a);
				break;
		}
	}

	drawSearch(gr) {
		const a = !ui.id.local ? (this.state !== 'down' ? Math.min(170 + (255 - 170) * this.transition_factor, 255) : 255) : 255;
		const colRect = this.state !== 'down' ? ui.getBlend(ui.col.bg4, ui.col.bg5, this.transition_factor, true) : ui.col.bg4;
		gr.SetSmoothingMode(2);
		gr.FillRoundRect(this.x, this.y, this.w, this.h, but.arc, but.arc, colRect);
		gr.SetSmoothingMode(0);
		gr.SetInterpolationMode(2);
		if (this.item.normal) gr.DrawImage(this.item.normal, this.p1, this.p2, this.p3, this.p3, 0, 0, this.item.normal.Width, this.item.normal.Height, 0, a);
		gr.SetInterpolationMode(0);
	}

	drawSettings(gr) {
		const colText = !ui.id.local ? (this.state !== 'down' ? ui.getBlend(this.item.hover, this.item.normal, this.transition_factor) : this.item.hover) : this.item.normal;
		const colRect = this.state !== 'down' ? ui.getBlend(ui.col.bg4, ui.col.bg5, this.transition_factor, true) : ui.col.bg4;
		gr.SetSmoothingMode(2);
		gr.FillRoundRect(this.x, but.hoverArea, this.w, but.hot_h, but.arc, but.arc, colRect);
		gr.SetSmoothingMode(0);
		gr.GdiDrawText(panel.settings.icon, panel.settings.font, colText, 0, this.y, this.p1, this.p2, panel.rc);
	}

	lbtn_dn(x, y) {
		if (!but.Dn) return;
		this.l_dn && this.l_dn(x, y);
	}

	lbtn_up() {
		if (this.l_up) this.l_up();
	}

	repaint() {
		const expXY = 2;
		const expWH = 4;
		window.RepaintRect(this.x - expXY, this.y - expXY, this.w + expWH, this.h + expWH);
	}

	trace(x, y) {
		but.trace = !this.hide && x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h;
		return but.trace;
	}
}

class Tooltip {
	constructor() {
		this.id = Math.ceil(Math.random().toFixed(8) * 1000);
		this.tt_timer = new TooltipTimer();
	}

	// Methods

	clear() {
		this.tt_timer.stop(this.id);
	}

	show(text) {
		if (Date.now() - but.tooltip.start > 2000 && but.tooltip.delay) this.showDelayed(text);
		else this.showImmediate(text);
		but.tooltip.start = Date.now();
	}

	showDelayed(text) {
		this.tt_timer.start(this.id, text);
	}

	showImmediate(text) {
		this.tt_timer.set_id(this.id);
		this.tt_timer.stop(this.id);
		but.tt(text);
	}

	stop() {
		this.tt_timer.forceStop();
	}
}

class TooltipTimer {
	constructor() {
		this.delay_timer;
		this.tt_caller = undefined;
	}

	// Methods

	forceStop() {
		but.tooltip.delay = true;
		but.tt('');
		if (this.delay_timer) {
			clearTimeout(this.delay_timer);
			this.delay_timer = null;
		}
	}

	set_id(id) {
		this.tt_caller = id;
	}

	start(id, text) {
		const old_caller = this.tt_caller;
		this.tt_caller = id;
		if (!this.delay_timer && tooltip.Text) but.tt(text, old_caller !== this.tt_caller);
		else {
			this.forceStop();
			if (!this.delay_timer) {
				this.delay_timer = setTimeout(() => {
					but.tt(text);
					this.delay_timer = null;
				}, 500);
			}
		}
	}

	stop(id) {
		if (this.tt_caller === id) this.forceStop();
	}
}

class Transition {
	constructor(items, hover) {
		this.hover = hover;
		this.items = items;
		this.transition_timer = null;
	}

	// Methods

	start() {
		const hover_in_step = 0.2;
		const hover_out_step = 0.06;
		if (!this.transition_timer) {
			this.transition_timer = setInterval(() => {
				Object.values(this.items).forEach(v => {
					const saved = v.transition_factor;
					if (this.hover(v)) v.transition_factor = Math.min(1, v.transition_factor += hover_in_step);
					else v.transition_factor = Math.max(0, v.transition_factor -= hover_out_step);
					if (saved !== v.transition_factor) {
						v.repaint();
					}
				});
				const running = Object.values(this.items).some(v => v.transition_factor > 0 && v.transition_factor < 1);
				if (!running) this.stop();
			}, 25);
		}
	}

	stop() {
		if (this.transition_timer) {
			clearInterval(this.transition_timer);
			this.transition_timer = null;
		}
	}
}