class UserInterface {
	constructor() {
		this.dui = window.InstanceType;
		this.touch_dn_id = -1;

		ppt.highLightRow = $.clamp(ppt.highLightRow, 0, 3);
		ppt.nowPlayingStyle = $.value(ppt.nowPlayingStyle, 0, 2);
		ppt.theme = $.clamp(ppt.theme, 0, 3);

		if (ppt.narrowSbarWidth != 0) ppt.narrowSbarWidth = $.clamp(ppt.narrowSbarWidth, 2, 10);
		this.narrowSbarWidth = 2;

		ppt.sbarCol = $.clamp(ppt.sbarCol, 0, 1);
		this.sbarCol = ppt.sbarCol;
		this.sideMarker_w = 2;

		this.blur = {
			alpha: $.clamp(ppt.blurAlpha, 0, 100) / 30,
			blend: ppt.theme == 2,
			dark: ppt.theme == 1,
			blendAlpha: $.clamp($.clamp(ppt.blurAlpha, 0, 100) * 105 / 30, 0, 255),
			level: ppt.theme == 2 ? 91.05 - $.clamp(ppt.blurTemp, 1.05, 90) : $.clamp(ppt.blurTemp * 2, 0, 254),
			light: ppt.theme == 3
		}

		this.col = {
			bg1: 0x04ffffff,
			bg2: 0x04000000,
			bg4: 0x1fffffff,
			bg5: 0xffffffff,
			txt: '',
			txt_h: ''
		}

		this.font = {
			filterB: gdi.Font('Segoe UI', 16, 1),
			filterBI: gdi.Font('Segoe UI', 16, 3),
			head: gdi.Font('Segoe UI', 16, 0),
			main: gdi.Font('Segoe UI', 16, 0),
			nowPlaying: gdi.Font('Calibri', 21, 1),
			nowPlayingLarge: gdi.Font('Calibri', 21, 1),
			playCount: gdi.Font('Segoe UI', 9, 0),
			small: gdi.Font('Segoe UI', 9, 0),
			style: 0,
			zoomSize: 16
		}

		this.style = {
			bg: false,
			l_w: Math.round(1 * $.scale),
			isBlur: false,
			pad: 1,
			sel_w: 100,
			textOnly: !ppt.btn_mode ? ppt.nowPlayingStyle == 2 : true
		}

		this.getColours();
	}

	// Methods

	assignColours() {
		const prop = ['text', 'text_h', 'textSel', 'bg', 'bg_h', 'bgSel', 'frame', 'sideMarker', 'bgTrans'];
		this.col.txt = '';
		this.col.txt_h = '';
		this.style.bg = false;
		this.style.trans = false;
		const set = (c, t) => {
			c = c.replace(/[^0-9.,-]/g, '').split(/[,-]/);
			let cc = '';
			if (c.length != 3 && c.length != 4) return '';
			for (let i = 0; i < c.length; i++) {
				c[i] = parseFloat(c[i]);
				if (i < 3) c[i] = $.clamp(Math.round(c[i]), 0, 255);
				else if (i == 3) {
					if (c[i] <= 1) c[i] = Math.round(255 * c[i]);
					else c[i] = $.clamp(Math.round(c[i]), 0, 255);
				}
			}
			switch (t) {
				case 0:
					cc = RGB(c[0], c[1], c[2]);
					break;
				case 1:
					switch (c.length) {
						case 3:
							cc = RGB(c[0], c[1], c[2]);
							break;
						case 4:
							cc = RGBA(c[0], c[1], c[2], c[3]);
							break;
					}
					break;
			}
			return cc;
		}

		prop.forEach((v, i) => {
			this.col[v] = set(ppt[v + 'Use'] ? ppt[v] : '', i < 3 ? 0 : 1);
		});
	}

	draw(gr) {
		if (this.style.bg) gr.FillSolidRect(0, 0, panel.w, panel.h, this.col.bg);
	}

	getBlend(c1, c2, f, alpha) {
		const nf = 1 - f;
		let r, g, b, a;
		switch (true) {
			case !alpha:
				c1 = $.toRGB(c1);
				c2 = $.toRGB(c2);
				r = c1[0] * f + c2[0] * nf;
				g = c1[1] * f + c2[1] * nf;
				b = c1[2] * f + c2[2] * nf;
				return RGB(Math.round(r), Math.round(g), Math.round(b));
			case alpha:
				c1 = $.toRGBA(c1);
				c2 = $.toRGBA(c2);
				r = c1[0] * f + c2[0] * nf;
				g = c1[1] * f + c2[1] * nf;
				b = c1[2] * f + c2[2] * nf;
				a = c1[3] * f + c2[3] * nf;
				return RGBA(Math.round(r), Math.round(g), Math.round(b), Math.round(a));
		}
	}

	getBlurColours() {
		this.style.isBlur = ppt.theme > 0;
		this.blur.dark = ppt.theme == 1;
		this.blur.blend = ppt.theme == 2;
		this.blur.light = ppt.theme == 3;
		if (this.blur.dark) {
			this.col.bg_light = RGBA(0, 0, 0, Math.min(160 / this.blur.alpha, 255));
			this.col.bg_dark = RGBA(0, 0, 0, Math.min(80 / this.blur.alpha, 255));
		}
		if (this.blur.light) {
			this.col.bg_light = RGBA(255, 255, 255, Math.min(160 / this.blur.alpha, 255));
			this.col.bg_dark = RGBA(255, 255, 255, Math.min(205 / this.blur.alpha, 255));
		}
	}

	getColours() {
		this.assignColours();
		this.getBlurColours();
		this.getUIColours();
		this.getItemColours();
	}

	getColSat(c) {
		c = $.toRGB(c);
		return c[0] + c[1] + c[2];
	}

	getContrast(col1, col2) {
		col1 = this.getSelCol(col1, false, true);
		col2 = this.getSelCol(col2, false, true);
		return Math.max(col1 / col2, col2 / col1);
	}

	getCrossCol(c) {
		if (this.blur.dark) c = 0xff0F0F0F;
		if (this.blur.light) c = 0xffF0F0F0;
		return this.getBlend(this.col.text, c == 0 ? 0xff000000 : c, 0.65);
	}

	getFont() {
		if (ppt.custFontUse && ppt.custFont.length) {
			const custFont = $.split(ppt.custFont, 1);
			this.font.main = gdi.Font(custFont[0], Math.max(Math.round($.value(custFont[1], 16, 0)), 1), Math.round($.value(custFont[2], 0, 0)));
		} else if (this.dui) this.font.main = window.GetFontDUI(2);
		else this.font.main = window.GetFontCUI(0);

		if (!this.font.main) {
			this.font.main = gdi.Font('Segoe UI', 16, 0);
			$.trace('Spider Monkey Panel is unable to use your default font. Using Segoe UI at default size & style instead');
		}
		if (this.font.main.Size != ppt.baseFontSize) ppt.zoomFont = 100;
		ppt.baseFontSize = this.font.main.Size;

		this.font.zoomSize = Math.max(Math.round(ppt.baseFontSize * ppt.zoomFont / 100), 1);
		this.font.main = gdi.Font(this.font.main.Name, this.font.zoomSize, this.font.main.Style);
		ppt.zoomFont = Math.round(this.font.zoomSize / ppt.baseFontSize * 100);

		let b = this.font.main.Style;
		this.font.style = b == 0 ? 2 : b == 1 ? 3 : b == 2 ? 0 : b == 3 ? 1 : b;
		this.font.head = gdi.Font(this.font.main.Name, this.font.main.Size, this.font.style);
		this.font.playCount = gdi.Font('Segoe UI', 9 * $.scale, this.font.style); // edit for custom playcount header font
		this.sideMarker_w = $.clamp(Math.floor(this.font.main.Size / 7), 2, 10);
		this.font.filterB = gdi.Font('segoe ui', 11, 1);
		this.font.filterBI = gdi.Font('segoe ui', 11, 3);
		this.font.small = gdi.Font(this.font.main.Name, Math.round(this.font.main.Size * 12 / 14), this.font.main.Style);
		this.font.sm = gdi.Font(this.font.main.Name, Math.round(this.font.main.Size / 2), this.font.main.Style);

		if (ppt.custFontNowplayingUse && ppt.custFontNowplaying.length) {
			const custFontNowplaying = $.split(ppt.custFontNowplaying, 1);
			this.font.nowPlayingLarge = this.font.nowPlaying = gdi.Font(custFontNowplaying[0], Math.max(Math.round($.value(custFontNowplaying[1], 16, 0)), 1), Math.round($.value(custFontNowplaying[2], 0, 0)));
		} else {
			this.font.nowPlaying = gdi.Font('Calibri', Math.round(this.font.main.Size * 1.33), 1);
			this.font.nowPlayingLarge = gdi.Font(this.font.nowPlaying.Name, $.clamp(panel.w > 1000 ? 45 * this.font.nowPlaying.Size / 38 : 43 * this.font.nowPlaying.Size / 38, 1, panel.h / 4), this.font.nowPlaying.Style);
		}

		const noLines = ppt.tfNowplaying.split('$crlf()').length;
		const spacer = (ppt.bor * 0.625 + 16) * 2.67 + this.font.nowPlaying.Size * noLines;

		panel.image.size = $.clamp(ppt.nowPlayingStyle == 1 ? 1 : !ppt.imgSize ? 1 - spacer / panel.h : ppt.imgSize / 1000, 0, 1);
		img.on_size();
		dj.on_size();

		this.narrowSbarWidth = ppt.narrowSbarWidth == 0 ? this.sideMarker_w : ppt.narrowSbarWidth;
		alb.calcText();
		alb.calcRows();
	}


	getLineCol(c) {
		return this.getBlend(this.blur.dark ? RGB(0, 0, 0) : this.blur.light ? RGB(255, 255, 255) : this.col.bg == 0 ? 0xff000000 : this.col.bg, c, 0.25, false);
	}

	getItemColours() {
		const lightBg = this.getSelCol(this.col.bg == 0 ? 0xff000000 : this.col.bg, true) == 50;

		if (this.blur.dark) {
			this.col.txt = RGB(255, 255, 255);
			this.col.txt_h = RGB(255, 255, 255);
		}
		if (this.blur.light) {
			this.col.txt = RGB(0, 0, 0);
			this.col.txt_h = RGB(71, 129, 183);
		}

		if (this.col.text === '') this.col.text = this.blur.blend ? this.setBrightness(this.col.txt, lightBg ? -10 : 10) : this.col.txt;
		if (this.col.text_h === '') this.col.text_h = this.blur.blend ? this.setBrightness(this.col.txt_h, lightBg ? -10 : 10) : this.col.txt_h;

		this.col.bg4 = lightBg ? 0x1f000000 : 0x1fffffff;
		this.col.bg5 = lightBg ? 0x00000000 : 0x00ffffff;

		if (ppt.swapCol) {
			const colH = this.col.text_h;
			this.col.text_h = this.col.text;
			this.col.text = colH;
		}

		this.col.head = ppt.headHighlight ? this.col.text_h : this.col.text;
		this.col.blend = this.getBlend(this.col.head, this.col.text, 0.5);
		this.col.lineAlb = !ppt.linesEmbolden ? this.getLineCol(this.col.head) : this.col.head;
		this.col.lineArt = !ppt.linesEmbolden ? this.getLineCol(this.col.text) : this.col.blend;

		if (this.col.bg_h === '') {
			this.col.bg_h = ppt.highLightRow == 3 ? (this.blur.dark ? 0x24000000 : 0x1E30AFED) : this.blur.dark ? 0x19ffffff : this.blur.light || lightBg ? 0x19000000 : 0x19ffffff;
			this.col.bgSel_h = this.col.bg_h;
			if (this.getColSat(this.col.bg) < 150 && !this.blur.dark && !this.blur.light && ppt.highLightRow != 3) {
				this.col.bg_h = this.getBlend(this.col.bg == 0 ? 0xff000000 : this.col.bg, this.col.bgSel, 0.55);
				this.col.bgSel_h = this.getBlend(this.col.bg == 0 ? 0xff000000 : this.col.bg, this.col.bgSel, 0.25);
			}
		} else this.col.bgSel_h = this.col.bg_h;

		const bgSelOpaque = $.RGBAtoRGB(this.col.bgSel, this.blur.dark ? RGB(50, 50, 50) : this.blur.light ? RGB(232, 232, 232) : this.col.bg);

		this.col.bgSelframe = this.setBrightness(bgSelOpaque, this.getSelCol(bgSelOpaque == 0 ? 0xff000000 : bgSelOpaque, true) == 50 ? -7 : 7);

		if (this.col.frame === '') this.col.frame = this.blur.dark ? 0xff808080 : 0xA330AFED;
		if (this.col.sideMarker === '') this.col.sideMarker = ppt.highLightText ? this.col.text_h : this.col.text;
		this.col.count = this.setBrightness(this.col.text, this.getSelCol(this.col.text, true) == 50 ? -30 : 30);
		if (this.col.textSel === '') this.col.textSel = !this.style.isBlur ? this.getSelCol(this.col.bgSel, false) : this.col.text;

		if (window.IsTransparent && this.col.bgTrans) {
			this.style.bg = true;
			this.col.bg = this.col.bgTrans
		}
		if (!window.IsTransparent || this.dui) {
			this.style.bg = true;
			if (this.getColSat(this.col.bg) > 759) this.col.bg2 = 0x06000000;
		}
		this.col.t = this.style.bg ? this.getSelCol(this.col.bg, true) : 200;
		this.col.searchSel = window.IsTransparent || !this.col.bgSel ? 0xff0099ff : this.getContrast(this.col.text_h, this.col.bgSel) > 3 ? this.col.bgSel : this.getBlend(this.col.text_h, this.col.bg == 0 ? 0xff000000 : this.col.bg, 0.25);

		['blend1', 'blend2', 'blend3'].forEach((v, i) => {
			this.col[v] = this.blur.blend ? this.col.text & RGBA(255, 255, 255, i == 2 ? 40 : 12) : this.blur.dark ? (i == 2 ? RGBA(255, 255, 255, 50) : RGBA(0, 0, 0, 40)) : this.blur.light ? RGBA(0, 0, 0, i == 2 ? 40 : 15) : this.getBlend(this.col.bg == 0 ? 0xff000000 : this.col.bg, this.col.text, !i ? 0.9 : i == 2 ? 0.87 : (this.style.isBlur ? 0.75 : 0.82));
		});
		this.col.blend4 = $.toRGBA(this.col.blend1);
		this.col.butBg = !this.style.isBlur ? this.outline(this.col.bg, true) : RGBA(this.col.blend4[0], this.col.blend4[1], this.col.blend4[2], Math.min(this.col.blend4[3] * 2, 255))
		this.col.cross = this.getCrossCol(this.col.bg);
		this.col.lfmNowplaying = this.getLfmNowplayingCol(this.col.bg);
		this.sbarCol = this.blur.dark || this.blur.light ? 1 : ppt.sbarCol;
	}

	getLfmNowplayingCol(c) {
		if (this.blur.dark) c = 0xff0F0F0F;
		if (this.blur.light) c = 0xffF0F0F0;
		return this.getBlend(this.col.text, c == 0 ? 0xff000000 : c, 0.25);
	}

	getSelCol(c, n, value, bypass) {
		if (!bypass) c = $.toRGB(c);
		const cc = c.map(v => {
			v /= 255;
			return v <= 0.03928 ? v /= 12.92 : Math.pow(((v + 0.055) / 1.055), 2.4);
		});
		const L = 0.2126 * cc[0] + 0.7152 * cc[1] + 0.0722 * cc[2];
		if (value) return L;
		if (L > 0.31) return n ? 50 : RGB(0, 0, 0);
		else return n ? 200 : RGB(255, 255, 255);
	}

	getUIColours() {
		switch (this.dui) {
			case 0:
				if (this.col.bg === '') this.col.bg = window.GetColourCUI(3);
				this.col.txt = window.GetColourCUI(0);
				this.col.txt_h = window.GetColourCUI(2);
				if (this.col.bgSel === '') this.col.bgSel = this.blur.dark ? RGBA(255, 255, 255, 36) : this.blur.light ? RGBA(0, 0, 0, 36) : window.GetColourCUI(4);
				if (this.col.textSel === '') this.col.textSel = !this.blur.dark && !this.blur.light ? window.GetColourCUI(1) : this.col.text;
				break;
			case 1:
				if (this.col.bg === '') this.col.bg = window.GetColourDUI(1);
				this.col.txt = window.GetColourDUI(0);
				this.col.txt_h = window.GetColourDUI(2);
				if (this.col.bgSel === '') this.col.bgSel = this.blur.dark ? RGBA(255, 255, 255, 36) : this.blur.light ? RGBA(0, 0, 0, 36) : window.GetColourDUI(3);
				break;
		}
	}

	outline(c, but) {
		c = $.toRGB(c);
		if (but) {
			if (window.IsTransparent || c[0] + c[1] + c[2] > 30) return RGBA(0, 0, 0, 36);
			else return RGBA(255, 255, 255, 36);
		}
		const cc = [];
		c.forEach((v, i) => {
			cc[i] = v / 255;
			cc[i] = cc[i] <= 0.03928 ? cc[i] / 12.92 : Math.pow(((cc[i] + 0.055) / 1.055), 2.4);
		});
		const L = 0.2126 * cc[0] + 0.7152 * cc[1] + 0.0722 * cc[2];
		if (L > 0.31) return RGB(30, 30, 10);
		else return RGB(225, 225, 245);
	}

	setBrightness(c, percent) {
		c = $.toRGB(c);
		return RGB($.clamp(c[0] + (256 - c[0]) * percent / 100, 0, 255), $.clamp(c[1] + (256 - c[1]) * percent / 100, 0, 255), $.clamp(c[2] + (256 - c[2]) * percent / 100, 0, 255));
	}

	wheel(step) {
		if (panel.m.y < search.y || !ppt.showAlb || panel.halt()) return;
		alb.deactivateTooltip();
		this.font.zoomSize += step;
		this.font.zoomSize = Math.max(this.font.zoomSize, 1);
		this.font.main = gdi.Font(this.font.main.Name, this.font.zoomSize, this.font.main.Style);
		this.font.head = gdi.Font(this.font.main.Name, this.font.zoomSize, this.font.style);
		this.sideMarker_w = $.clamp(Math.floor(this.font.zoomSize / 7), 2, 10);
		this.font.small = gdi.Font(this.font.main.Name, Math.round(this.font.zoomSize * 12 / 14), this.font.main.Style);
		this.narrowSbarWidth = ppt.narrowSbarWidth == 0 ? this.sideMarker_w : ppt.narrowSbarWidth;
		alb.calcText();
		alb.calcRows();
		window.Repaint();
		ppt.zoomFont = Math.round(this.font.zoomSize / ppt.baseFontSize * 100);
	}
}