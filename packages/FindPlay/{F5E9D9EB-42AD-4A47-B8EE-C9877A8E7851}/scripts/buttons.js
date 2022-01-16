class Buttons {
	constructor() {
		this.alpha = 255;
		this.cur = null;
		this.Dn = false;
		this.offset = 2;
		this.transition;

		this.b = {}
		this.btns = {}
		this.font = {}

		this.cross = {
			hover: null,
			normal: null
		}

		this.font = {
			bold12: gdi.Font('Segoe UI', 12, 1),
			bold15: gdi.Font('Segoe UI', 15, 1),
			boldItalic11: gdi.Font('Segoe UI', 11, 3),
			regular15: gdi.Font('Segoe UI', 15, 0)
		}

		this.scr = {
			albBtns: ['alb_scrollDn', 'alb_scrollUp'],
			artBtns: ['art_scrollDn', 'art_scrollUp'],
			iconFontName: 'Segoe UI Symbol',
			iconFontStyle: 0,
			img: null,
			pad: $.clamp(ppt.sbarButPad / 100, -0.5, 0.3)
		}

		this.tooltip = {
			delay: true,
			show: true,
			start: Date.now() - 2000
		}

		this.scr.btns = this.scr.albBtns.concat(this.scr.artBtns);
		this.zoomBut = Math.max(ppt.zoomBut / 100, 0.7);
		ppt.zoomBut = this.zoomBut * 100;
		this.scale = $.scale * this.zoomBut;

		this.setSbarIcon();
		this.createImages();
	}

	// Methods

	checkScrollBtns(x, y, hover_btn) {
		const arr = alb_scrollbar.timer_but ? this.scr.albBtns : art_scrollbar.timer_but ? this.scr.artBtns : false;
		if (arr) {
			if ((this.btns[arr[0]].down || this.btns[arr[1]].down) && !this.btns[arr[0]].trace(x, y) && !this.btns[arr[1]].trace(x, y)) {
				this.btns[arr[0]].cs('normal');
				this.btns[arr[1]].cs('normal');
				if (alb_scrollbar.timer_but) {
					clearTimeout(alb_scrollbar.timer_but);
					alb_scrollbar.timer_but = null;
					alb_scrollbar.count = -1;
				}
				if (art_scrollbar.timer_but) {
					clearTimeout(art_scrollbar.timer_but);
					art_scrollbar.timer_but = null;
					art_scrollbar.count = -1;
				}
			}
		} else if (hover_btn) this.scr.btns.forEach((v) => {
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
		let sz = this.scr.arrow == 0 ? Math.max(Math.round(panel.but_h * 1.666667), 1) : 100;
		let sc = sz / 100;
		const iconFont = gdi.Font(this.scr.iconFontName, sz, this.scr.iconFontStyle);
		this.alpha = !ui.sbarCol ? [75, 192, 228] : [68, 153, 255];
		const hovAlpha = (!ui.sbarCol ? 75 : (!panel.sbar.type ? 68 : 51)) * 0.4;
		this.scr.hover = !ui.sbarCol ? RGBA(ui.col.t, ui.col.t, ui.col.t, hovAlpha) : ui.col.text & RGBA(255, 255, 255, hovAlpha);
		this.scr.img = $.gr(sz, sz, true, g => {
			g.SetTextRenderingHint(3);
			g.SetSmoothingMode(2);
			if (ui.sbarCol) {
				this.scr.arrow == 0 ? g.FillPolygon(ui.col.text, 1, [50 * sc, 0, 100 * sc, 76 * sc, 0, 76 * sc]) : g.DrawString(this.scr.arrow, iconFont, ui.col.text, 0, sz * this.scr.pad, sz, sz, StringFormat(1, 1));
			} else {
				this.scr.arrow == 0 ? g.FillPolygon(RGBA(ui.col.t, ui.col.t, ui.col.t, 255), 1, [50 * sc, 0, 100 * sc, 76 * sc, 0, 76 * sc]) : g.DrawString(this.scr.arrow, iconFont, RGBA(ui.col.t, ui.col.t, ui.col.t, 255), 0, sz * this.scr.pad, sz, sz, StringFormat(1, 1));
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
			g.DrawLine(offset1, nn - offset2, 100 - nn * 2 + offset1, 100 - nn - offset2, 5, ui.col.cross);
			g.DrawLine(offset1, 100 - nn - offset2, 100 - nn * 2 + offset1, nn - offset2, 5, ui.col.cross);
			g.SetSmoothingMode(0);
		});
		this.cross.hover = $.gr(sz, sz, true, g => {
			g.SetTextRenderingHint(3);
			g.SetSmoothingMode(2);
			let nn = 28;
			let offset1 = 9;
			let offset2 = 2;
			g.DrawLine(offset1, nn - offset2, 100 - nn * 2 + offset1, 100 - nn - offset2, 5, ui.col.cross);
			g.DrawLine(offset1, 100 - nn - offset2, 100 - nn * 2 + offset1, nn - offset2, 5, ui.col.cross);
			g.SetSmoothingMode(0);
		});

		const siteImage = [
			!ui.style.isBlur ? 'Auto DJ.png' : 'Auto DJ dark.png',
			!ui.style.isBlur ? 'Official charts button.png' : 'Official charts button neutral.png',
			!ui.style.isBlur ? 'Lastfm button.png' : ui.blur.light ? 'Lastfm button neutral.png' : 'Lastfm button dark.png',
			!ui.style.isBlur ? 'Musicbrainz button.png' : ui.blur.light ? 'Musicbrainz button neutral' : 'Musicbrainz button dark.png'
		];
		
		['autodj', 'chart', 'lfm', 'mb'].forEach((v, i) => this[v] = my_utils.getImageAsset(siteImage[i]));

		const maskCircular = $.gr(500, 500, true, g => {
			g.FillSolidRect(0, 0, 500, 500, RGB(255, 255, 255));
			g.SetSmoothingMode(2);
			g.FillEllipse(1, 1, 498, 498, RGBA(0, 0, 0, 255));
		});
		this.lfm = this.lfm.Clone(38, 38, 436, 436);
		this.circularMask(this.lfm, maskCircular, this.lfm.Width, this.lfm.Height);
		ppt.styleImages = `${my_utils.packagePath}/assets/images/`;
	}

	circularMask(image, maskCircular, tw, th) {
		image.ApplyMask(maskCircular.Resize(tw, th));
	}

	draw(gr) {
		Object.values(this.btns).forEach(v => {
			if (!v.hide) v.draw(gr);
		});
	}

	lbtn_dn(x, y) {
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
	}

	move(x, y) {
		const hover_btn = Object.values(this.btns).find(v => {
			if (!this.Dn || this.Dn == v.name) return v.trace(x, y);
		});
		let hand = false;
		this.checkScrollBtns(x, y, hover_btn);
		if (hover_btn) hand = hover_btn.hand;
		window.SetCursor(!hand && !seeker.hand ? 32512 : 32649);
		if (hover_btn && hover_btn.hide) { // btn hidden, ignore
			if (this.cur) {
				this.cur.cs('normal');
				this.transition.start();
			}
			this.cur = null;
			return null;
		}
		if (this.cur === hover_btn) return this.cur;
		if (this.cur) { // return prev btn to normal state
			this.cur.cs('normal');
			this.transition.start();
		}
		if (hover_btn && !(hover_btn.down && hover_btn.type > 3)) {
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

	setSearchBtnsHide() {
		const noShow = !ppt.searchShow || !ppt.showAlb;
		const searching = ppt.searchShow && filter.text;
		const o1 = this.btns.search;
		if (o1) o1.hide = noShow || searching;
		const o2 = this.btns.clear;
		if (o2) o2.hide = noShow || !searching;
	}

	refresh(upd) {
		this.font.awesome = gdi.Font('FontAwesome', this.zoomBut > 1.05 ? Math.floor(15 * this.scale) : 15 * this.scale, 0);
		if (upd) {
			$.gr(1, 1, false, g => {
				this.icon_w = g.CalcTextWidth('\uF107', this.font.awesome);
			});
			this.b.x = ppt.btn_mode ? 0 : panel.w - ppt.bor - this.icon_w;
			this.b.y1 = ppt.btn_mode ? 0 : ppt.bor * 0.625;
			this.b.y2 = Math.round(this.b.y1);
			this.b.w1 = 36 * this.scale;
			this.b.w2 = 35 * this.scale;
			this.b.h1 = 16 * this.scale;
			this.b.h2 = alb.row.h;
			this.b.x2 = alb.x;

			ui.font.filterB = gdi.Font('segoe ui', this.zoomBut > 1.05 ? Math.floor(11 * this.scale) : 11 * this.scale, 1);
			ui.font.filterBI = gdi.Font('segoe ui', this.zoomBut > 1.05 ? Math.floor(11 * this.scale) : 11 * this.scale, 3);

			this.font.bold15 = gdi.Font('segoe ui', this.zoomBut > 1.05 ? Math.floor(15 * this.scale) : 15 * this.scale, 1);
			this.font.boldItalic11 = gdi.Font('segoe ui', this.zoomBut > 1.05 ? Math.floor(11 * this.scale) : 11 * this.scale, 3);
			this.font.bold12 = gdi.Font('segoe ui', 12 * this.scale, 1);
			this.font.regular15 = gdi.Font('segoe ui', this.zoomBut > 1.05 ? Math.floor(15 * this.scale) : 15 * this.scale, 0);
			this.scr.x1 = panel.sbar.x;
			this.scr.yUp1 = alb_scrollbar.y;
			this.scr.yDn1 = alb_scrollbar.y + alb_scrollbar.h - panel.but_h;
			this.scr.yUp2 = art_scrollbar.y;
			this.scr.yDn2 = art_scrollbar.y + art_scrollbar.h - panel.but_h;
			if (panel.sbar.type < 2) {
				this.scr.x1 -= 1;
				this.scr.yUp3 = -panel.sbar.arrowPad + this.scr.yUp1 + (panel.but_h - 1 - panel.sbar.but_w) / 2;
				this.scr.yDn3 = panel.sbar.arrowPad + this.scr.yDn1 + (panel.but_h - 1 - panel.sbar.but_w) / 2;
				this.scr.yUp4 = -panel.sbar.arrowPad + this.scr.yUp2 + (panel.but_h - 1 - panel.sbar.but_w) / 2;
				this.scr.yDn4 = panel.sbar.arrowPad + this.scr.yDn2 + (panel.but_h - 1 - panel.sbar.but_w) / 2;
				this.scr.x2 = (panel.but_h - panel.sbar.but_w) / 2;
			}
			this.offset = Math.min(Math.round(21 * this.scale / 8), ppt.bor);
			filter.metrics();

			this.max_w = [this.b.x - this.b.w1 * 5, this.b.x - this.b.w1 * 6.7, this.b.x - this.b.w1 * 5.8][ppt.mb];
			this.font.search = gdi.Font('FontAwesome', 11 * this.scale, 0);
			this.font.clear = gdi.Font('Segoe UI Symbol', 11 * this.scale, 0);
		}
		this.btns = {
			all: new Btn(this.b.x - this.b.w1 * 7, this.b.y2, this.b.w2, this.b.h1, 0, ui.font.filterB, 'All', 0, '', !ppt.showAlb || !ppt.mb || ppt.mb == 2, '', () => alb.getReleases('mb', 0), () => alb.type.mb[0], true, 'all'),
			album: new Btn(this.b.x - this.b.w1 * 6, this.b.y2, this.b.w2, this.b.h1, 0, ui.font.filterB, 'Album', 1, '', !ppt.showAlb || !ppt.mb || ppt.mb == 2, '', () => alb.getReleases('mb', 1), () => alb.type.mb[1], true, 'album'),
			comp: new Btn(this.b.x - this.b.w1 * 5, this.b.y2, this.b.w2, this.b.h1, 0, ui.font.filterB, 'Comp', 2, '', !ppt.showAlb || !ppt.mb || ppt.mb == 2, '', () => alb.getReleases('mb', 2), () => alb.type.mb[2], true, 'comp'),
			single: new Btn(this.b.x - this.b.w1 * 4, this.b.y2, this.b.w2, this.b.h1, 0, ui.font.filterB, 'Single', 3, '', !ppt.showAlb || !ppt.mb || ppt.mb == 2, '', () => alb.getReleases('mb', 3), () => alb.type.mb[3], true, 'single'),
			remix: new Btn(this.b.x - this.b.w1 * 3, this.b.y2, this.b.w2, this.b.h1, 0, ui.font.filterB, 'Remix', 4, '', !ppt.showAlb || !ppt.mb || ppt.mb == 2, '', () => alb.getReleases('mb', 4), () => alb.type.mb[4], true, 'remix'),

			topalbums: new Btn(this.b.x - this.b.w1 * 5, this.b.y2, this.b.w2, this.b.h1, 0, ui.font.filterB, 'Album', 0, '', !ppt.showAlb || ppt.mb, '', () => alb.getReleases('lfm', 0), () => 'Top albums', true, 'topalbums'),
			toptracks: new Btn(this.b.x - this.b.w1 * 4, this.b.y2, this.b.w2, this.b.h1, 0, ui.font.filterB, 'Track', 1, '', !ppt.showAlb || ppt.mb, '', () => alb.getReleases('lfm', 1), () => 'Top tracks', true, 'toptracks'),
			topsongs: new Btn(this.b.x - this.b.w1 * 3, this.b.y2, this.b.w2, this.b.h1, 0, ui.font.filterB, 'Song', 2, '', !ppt.showAlb || ppt.mb, '', () => alb.getReleases('lfm', 2), () => 'Top similar songs', true, 'topsongs'),

			changedate: new Btn(this.b.x - this.b.w1 * 5.8, this.b.y2, this.b.w2 * 2, this.b.h1, 7, ui.font.filterB, 'Change date:', 0, '', !ppt.showAlb || ppt.mb != 2, '', '', () => '', false, 'changedate'),
			day: new Btn(this.b.x - this.b.w1 * 3.7, this.b.y2, this.b.w2 * 0.4, this.b.h1, 7, ui.font.filterB, $.padNumber(men.chart.day, 2), 1, '', !ppt.showAlb || ppt.mb != 2, '', () => dMenu.load(this.b.x - this.b.w1 * 6, this.b.y2 + this.b.h1), () => 'Day', true, 'day'),
			month: new Btn(this.b.x - this.b.w1 * 3.2, this.b.y2, this.b.w2 * 0.4, this.b.h1, 7, ui.font.filterB, $.padNumber(men.chart.month, 2), 2, '', !ppt.showAlb || ppt.mb != 2, '', () => mMenu.load(this.b.x - this.b.w1 * 5, this.b.y2 + this.b.h1), () => 'Month', true, 'month'),
			year: new Btn(this.b.x - this.b.w1 * 2.8, this.b.y2, this.b.w2 * 0.8, this.b.h1, 7, ui.font.filterB, men.chart.year, 3, '', !ppt.showAlb || ppt.mb != 2, '', () => yMenu.load(this.b.x - this.b.w1 * 4, this.b.y2 + this.b.h1), () => 'Year', true, 'year'),

			lock: new Btn(this.b.x - this.b.w1 * 2, this.b.y2, this.b.w2, this.b.h1, 0, ui.font.filterB, 'Lock', 5, '', !ppt.showAlb, '', () => alb.lockArtist(), () => alb.art.lock ? 'Unlock' : 'Lock: stop track change updates', true, 'lock'),
			add: new Btn(this.b.x - this.b.w1, this.b.y2 - 1, 13 * this.scale, this.b.h1, 0, this.font.bold15, '+', '6', '', !ppt.showAlb, '', () => {
				pMenu.load(this.b.x - this.b.w1, this.b.y2 + this.b.h1)
			}, () => alb.handleList.Count ? 'Load' : 'Load: nothing available', true, 'add'),
			toggle: new Btn(this.b.x - 9 * this.scale - this.icon_w, this.b.y2 - 1, 13 * this.scale, this.b.h1, 0, this.font.bold15, '\u2261', '7', '', !ppt.showAlb, '', () => {
				if (!ppt.showArtists) alb.toggle('showArtists');
				else {
					if (!alb.expanded) ppt.toggle('showSimilar');
					alb.expanded = 0;
					alb.clearIcon();
					alb.calcRows();
					alb.setSimilar();
				}
				txt.paint();
			}, () => !alb.expanded ? (ppt.showSimilar ? 'Show related artists' : 'Show similar artists') : (ppt.showSimilar ? 'Show similar artists' : 'Show related artists'), true, 'toggle'),
			more: new Btn(this.b.x, this.b.y2, this.icon_w, this.b.h1, 0, this.font.awesome, '\uF107', '8', '', !ppt.showAlb, '', () => bMenu.load(this.b.x - this.b.w2, this.b.y2 + this.b.h1), () => 'Album manager settings', true, 'more'),

			mode: new Btn(
				!ppt.logoText ? this.b.x2 - this.offset : this.b.x2,
				!ppt.logoText ? this.b.y1 - 14 * this.scale / 5 - this.offset : !ui.style.isBlur ? this.b.y1 : this.b.y1 - 1 * this.scale,
				!ppt.logoText ? 19 * this.scale + this.offset * 2 : (!ui.style.isBlur ? 71 : ppt.mb == 1 ? 74 : 46) * this.scale,
				!ppt.logoText ? 19 * this.scale + this.offset * 2 : (!ui.style.isBlur ? 14 : 15) * this.scale,
				1,
				!ppt.logoText ? this.b.x2 : this.font.bold12,
				!ppt.logoText ? this.b.y1 - 14 * this.scale / 5 : ['last.fm', 'Chart', 'MusicBrainz'],
				!ppt.logoText ? 20 * this.scale : !ui.style.isBlur ? this.b.y2 : Math.round(this.b.y2 - 1 * this.scale), {
					normal: [RGB(225, 225, 245), RGB(96, 73, 139)],
					hover: [RGB(225, 225, 245), RGB(52, 23, 107)]
				},
				!ppt.showAlb, '', () => sMenu.load(this.b.x2, this.b.y2 + this.b.h1), () => 'Change Site', true, 'mode'
			),

			cross: new Btn(panel.w - this.b.x2 - this.b.h2 * 0.58, search.y - this.b.h2 * 0.06, this.b.h2, this.b.h2, 3, '', '', '', {
				normal: this.cross.normal,
				hover: this.cross.hover
			}, !ppt.showAlb, '', () => search.clear(), () => search.text ? 'Clear Search Text' : 'Show Text', true, 'cross'),

			dj: new Btn(0, 0, panel.w, panel.h, 2, '', '', '', '', !ppt.btn_mode, '', () => men.rbtn_up(this.b.x, this.b.y2), '', true, 'dj'),
			search: new Btn(this.max_w - this.b.w1 * 1.15, this.b.y2 + 1, this.b.w1, this.b.h1, 8, this.font.search, '\uF002', 0, '', !ppt.showAlb, '', '', () => 'Search list', true, 'Search'),
			clear: new Btn(this.max_w - this.b.w1 * 1.1, this.b.y2, this.b.w1, this.b.h1, 8, this.font.clear, '\u2716', 0, '', true, '', () => filter.clear(), () => 'Clear search', true, 'Clear')

		};
		this.setSearchBtnsHide();
		if (ppt.showAlb || ui.style.textOnly) txt.paint();
		else img.paint();

		if (panel.sbar.show) {
			switch (panel.sbar.type) {
				case 2:
					this.btns.alb_scrollUp = new Btn(this.scr.x1, this.scr.yUp1, panel.but_h, panel.but_h, 6, '', '', '', {
						normal: 1,
						hover: 2,
						down: 3
					}, ppt.sbarShow == 1 && alb_scrollbar.narrow.show || !this.scrollAlb(), () => alb_scrollbar.but(1), '', '', false, 'alb_scrollUp');
					this.btns.alb_scrollDn = new Btn(this.scr.x1, this.scr.yDn1, panel.but_h, panel.but_h, 6, '', '', '', {
						normal: 5,
						hover: 6,
						down: 7
					}, ppt.sbarShow == 1 && alb_scrollbar.narrow.show || !this.scrollAlb(), () => alb_scrollbar.but(-1), '', '', false, 'alb_scrollDn');
					this.btns.art_scrollUp = new Btn(this.scr.x1, this.scr.yUp2, panel.but_h, panel.but_h, 6, '', '', '', {
						normal: 1,
						hover: 2,
						down: 3
					}, ppt.sbarShow == 1 && art_scrollbar.narrow.show || !this.scrollArt(), () => art_scrollbar.but(1), '', '', false, 'art_scrollUp');
					this.btns.art_scrollDn = new Btn(this.scr.x1, this.scr.yDn2, panel.but_h, panel.but_h, 6, '', '', '', {
						normal: 5,
						hover: 6,
						down: 7
					}, ppt.sbarShow == 1 && art_scrollbar.narrow.show || !this.scrollArt(), () => art_scrollbar.but(-1), '', '', false, 'art_scrollDn');
					break;
				default:
					this.btns.alb_scrollUp = new Btn(this.scr.x1, this.scr.yUp1 - panel.sbar.offset, panel.sbar.w, panel.but_h + panel.sbar.offset, 4, this.scr.x2, this.scr.yUp3, panel.sbar.but_w, '', ppt.sbarShow == 1 && alb_scrollbar.narrow.show || !this.scrollAlb(), () => alb_scrollbar.but(1), '', '', false, 'alb_scrollUp');
					this.btns.alb_scrollDn = new Btn(this.scr.x1, this.scr.yDn1, panel.sbar.w, panel.but_h + panel.sbar.offset, 5, this.scr.x2, this.scr.yDn3, panel.sbar.but_w, '', ppt.sbarShow == 1 && alb_scrollbar.narrow.show || !this.scrollAlb(), () => alb_scrollbar.but(-1), '', '', false, 'alb_scrollDn');
					this.btns.art_scrollUp = new Btn(this.scr.x1, this.scr.yUp2 - panel.sbar.offset, panel.sbar.w, panel.but_h + panel.sbar.offset, 4, this.scr.x2, this.scr.yUp4, panel.sbar.but_w, '', ppt.sbarShow == 1 && art_scrollbar.narrow.show || !this.scrollArt(), () => art_scrollbar.but(1), '', '', false, 'art_scrollUp');
					this.btns.art_scrollDn = new Btn(this.scr.x1, this.scr.yDn2, panel.sbar.w, panel.but_h + panel.sbar.offset, 5, this.scr.x2, this.scr.yDn4, panel.sbar.but_w, '', ppt.sbarShow == 1 && art_scrollbar.narrow.show || !this.scrollArt(), () => art_scrollbar.but(-1), '', '', false, 'art_scrollDn');
					break;
			}
		}
		this.transition = new Transition(this.btns, v => v.state !== 'normal');
	}

	reset() {
		this.transition.stop();
	}

	resetZoom() {
		ppt.zoomFont = 100;
		ppt.zoomTooltip = 100;
		ppt.zoomBut = 100;
		this.zoomBut = 1;
		this.scale = $.scale * this.zoomBut;
		ui.getFont();
		alb.butTooltipFont();
		this.refresh(true);
		alb.calcRows();
		txt.paint();
	}

	scroll() {
		return panel.sbar.show && ppt.showAlb;
	}

	scrollAlb() {
		return this.scroll() && alb_scrollbar.scrollable_lines > 0;
	}

	scrollArt() {
		return this.scroll() && art_scrollbar.scrollable_lines > 0;
	}

	setBtnsHide() {
		Object.values(this.btns).forEach((v, i) => {
			switch (true) {
				case i < 5:
					v.hide = !ppt.showAlb || !ppt.mb || ppt.mb == 2;
					break;
				case i < 8:
					v.hide = !ppt.showAlb || ppt.mb;
					break;
				case i < 12:
					v.hide = !ppt.showAlb || ppt.mb != 2;
					break;
				case i < 18:
					v.hide = !ppt.showAlb;
					break;
			}
		});
	}

	setSbarIcon() {
		switch (ppt.sbarButType) {
			case 0:
				this.scr.iconFontName = 'Segoe UI Symbol';
				this.scr.iconFontStyle = 0;
				if (!panel.sbar.type) {
					this.scr.arrow = panel.sbar.but_w < Math.round(14 * $.scale) ? '\uE018' : '\uE0A0';
					this.scr.pad = panel.sbar.but_w < Math.round(15 * $.scale) ? -0.3 : -0.22;
				} else {
					this.scr.arrow = panel.sbar.but_w < Math.round(14 * $.scale) ? '\uE018' : '\uE0A0';
					this.scr.pad = panel.sbar.but_w < Math.round(14 * $.scale) ? -0.26 : -0.22;
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
				break;
		}
	}

	setScrollBtnsHide(set, autoHide) {
		if (autoHide) {
			const arr = autoHide == 'both' ? this.scr.btns : autoHide == 'alb' ? this.scr.albBtns : this.scr.artBtns;
			arr.forEach(v => {
				if (this.btns[v]) this.btns[v].hide = set;
			});
			txt.paint();
		} else {
			if (!ppt.sbarShow && !set) return;
			this.scr.btns.forEach((v, i) => {
				if (this.btns[v]) this.btns[v].hide = i < 2 ? !this.scrollAlb() : !this.scrollArt();
			});
		}
	}

	tt(n, force) {
		if (tooltip.Text === n && !force) return;
		alb.checkTooltipFont('btn');
		tooltip.Text = n;
		tooltip.Activate();
	}

	wheel(step) {
		if (panel.m.y > this.b.y2 + this.b.h1 || this.zoomBut < 0.7 || utils.IsKeyPressed(0x10)) return;
		this.zoomBut += step * 0.005;
		this.zoomBut = Math.max(this.zoomBut, 0.7);
		this.scale = $.scale * this.zoomBut;
		this.refresh(true);
		alb.calcRows();
		ppt.zoomBut = this.zoomBut * 100;
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
			case 0:
				this.drawNames(gr);
				break;
			case 1:
				this.drawMode(gr);
				break;
			case 2:
				this.drawBtnMode(gr);
				break;
			case 3:
				this.drawCross(gr);
				break;
			case 4:
			case 5:
				this.drawScrollBtn(gr);
				break;
			case 6:
				panel.theme.SetPartAndStateID(1, this.item[this.state]);
				panel.theme.DrawThemeBackground(gr, this.x, this.y, this.w, this.h);
				break;
			case 7:
				this.drawDate(gr);
				break;
			case 8:
				this.drawSearch(gr);
				break;
		}
	}

	drawCross(gr) {
		if (ppt.mb == 2) return;
		const a = this.state !== 'down' ? Math.min(153 + (228 - 153) * this.transition_factor, 228) : 228;
		const crossIm = this.state === 'normal' ? this.item.normal : this.item.hover;
		gr.SetInterpolationMode(2);
		if (crossIm) gr.DrawImage(crossIm, this.x, this.y, this.w, this.h, 0, 0, crossIm.Width, crossIm.Height, 0, a);
		gr.SetInterpolationMode(0);
	}

	drawMode(gr) {
		const arc = 2 * but.scale;
		if (!ppt.logoText) {
			gr.SetInterpolationMode(7);
			const button = [but.lfm, but.mb, but.chart][ppt.mb];
			if (!button) return;
			const y = [this.p2 + this.p3 * 0.035, this.p2, this.p2][ppt.mb];
			const h = [this.p3 * 0.93, this.p3, this.p3][ppt.mb];
			const fixCircDrawArtifact = Math.floor(1 / this.p3 * button.Width) / 2;
			const b_sz = [button.Width + fixCircDrawArtifact, button.Width, button.Width][ppt.mb];
			const colRect = this.state !== 'down' ? ui.getBlend(ui.col.bg4, ui.col.bg5, this.transition_factor, true) : ui.col.bg4;
			gr.SetSmoothingMode(2);
			gr.FillRoundRect(this.x, this.y, this.w, this.h, arc, arc, colRect);
			gr.SetSmoothingMode(0);
			gr.DrawImage(button, this.p1, y, this.p3, h, 0, 0, b_sz, b_sz);
		} else {
			gr.SetSmoothingMode(2);
			const mb = ppt.mb == 1 ? 1 : 0;
			const text = [0, 2, 1][ppt.mb];
			let col;
			if (!ui.style.isBlur) {
				const c1 = [RGBA(210, 19, 9, 114), RGBA(227, 222, 248, 100), RGBA(0, 77, 52, 114)];
				const c2 = [RGBA(210, 19, 9, 228), RGBA(227, 222, 248, 200), RGBA(0, 77, 52, 228)];
				const c3 = [RGBA(244, 31, 19, 255), RGBA(238, 234, 251, 228), RGBA(0, 102, 70, 255)];
				gr.FillRoundRect(this.x, this.y, this.w, this.h, arc, arc, c1[ppt.mb]);
				col = this.state !== 'down' ? ui.getBlend(c3[ppt.mb], c2[ppt.mb], this.transition_factor, true) : c3[ppt.mb];
				gr.FillRoundRect(this.x, this.y, this.w, this.h - 1, arc, arc, col);
				col = this.state !== 'down' ? ui.getBlend(this.item.hover[mb], this.item.normal[mb], this.transition_factor) : this.item.hover[mb];
				gr.GdiDrawText(this.p2[text], this.p1, col, this.x, this.p3, this.w, this.h, txt.cc);
			} else {
				if (this.state !== 'down') gr.FillRoundRect(this.x, this.y, this.w, this.h, arc, arc, RGBA(ui.col.blend4[0], ui.col.blend4[1], ui.col.blend4[2], ui.col.blend4[3] * (1 - this.transition_factor)));
				col = this.state !== 'down' ? ui.getBlend(ui.col.blend2, ui.col.blend1, this.transition_factor, true) : ui.col.blend2;
				gr.FillRoundRect(this.x, this.y, this.w, this.h, arc, arc, col);
				gr.DrawRoundRect(this.x, this.y, this.w, this.h, arc, arc, 1, ui.col.blend3);
				col = this.state !== 'down' ? ui.getBlend(ui.col.text_h, ui.col.text, this.transition_factor) : ui.col.text_h;
				gr.GdiDrawText(this.p2[text], this.p1, col, this.x + 1 * but.scale, this.p3, this.w, this.h, txt.cc);
			}
		}
	}

	drawNames(gr) {
		const chk = (ppt.mb ? ppt.mbReleaseType : ppt.lfmReleaseType) == this.p3 || alb.art.lock && this.p3 == 5 || this.state === 'down' && this.p3 != 6 && this.p3 != 7;
		if ((ppt.mb ? ppt.mbReleaseType : ppt.lfmReleaseType) == this.p3 || alb.art.lock && this.p3 == 5 || this.state === 'down' && this.p3 != 6 && this.p3 != 7 && this.p3 != 8) {
			gr.SetSmoothingMode(2);
			gr.FillRoundRect(this.x, this.y, this.w, this.h, 6 * but.scale, 6 * but.scale, ui.col.butBg);
		}
		const col = !chk ? ui.getBlend(ui.col.blend, ui.col.text, this.transition_factor) : ui.col.blend;
		if (this.p3 == 6) {
			this.p2 = !alb.handleList.Count && !alb.topTracksAvailable ? '-' : '+';
			this.p1 = !alb.handleList.Count && !alb.topTracksAvailable ? but.font.regular15 : but.font.bold15;
		}
		gr.GdiDrawText(this.p2, this.p1, col, this.x, this.y, this.w, this.h, txt.cc);
		if (this.name == 'more' && this.state === 'hover') gr.GdiDrawText(this.p2, this.p1, col, this.x, this.y + 1, this.w, this.h, txt.cc);
	}

	drawDate(gr) {
		const col = this.name != 'changedate' ? ui.col.blend : ui.col.text;
		gr.GdiDrawText(this.p2, this.p1, col, this.x, this.y, this.w, this.h, txt.cc);
	}

	drawSearch(gr) {
		const col = this.name == 'Search' ? ui.col.text : ui.getBlend(ui.col.blend, ui.col.text, this.transition_factor);
		gr.GdiDrawText(this.p2, this.p1, col, this.x, this.y, this.w, this.h, txt.cc);
	}

	drawScrollBtn(gr) {
		const a = this.state !== 'down' ? Math.min(but.alpha[0] + (but.alpha[1] - but.alpha[0]) * this.transition_factor, but.alpha[1]) : but.alpha[2];
		if (this.state !== 'normal' && panel.sbar.type == 1) gr.FillSolidRect(panel.sbar.x, this.y, this.w, this.h, but.scr.hover);
		if (but.scr.img) gr.DrawImage(but.scr.img, this.x + this.p1, this.p2, this.p3, this.p3, 0, 0, but.scr.img.Width, but.scr.img.Height, this.type == 4 ? 0 : 180, a);
	}

	drawBtnMode(gr) {
		gr.SetSmoothingMode(2);
		if (ppt.btn_mode) {
			const colRect = this.state !== 'down' ? ui.getBlend(ui.col.bg4, ui.col.bg5, this.transition_factor, true) : ui.col.bg4;
			gr.FillSolidRect(this.x, this.y, this.w, this.h, colRect);
			gr.SetInterpolationMode(7);
			gr.DrawImage(but.autodj, this.x, this.y, this.w, this.h, 0, 0, but.autodj.Width, but.autodj.Height);
		}
	}

	lbtn_dn(x, y) {
		if (!but.Dn) return;
		this.l_dn && this.l_dn(x, y);
	}

	lbtn_up(x, y) {
		if (ppt.touchControl && Math.sqrt((Math.pow(panel.id.last_pressed_coord.x - x, 2) + Math.pow(panel.id.last_pressed_coord.y - y, 2))) > 3 * $.scale) return;
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
					if (saved !== v.transition_factor) v.repaint();
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