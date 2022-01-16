class Text {
	constructor() {
		const DT_RIGHT = 0x00000002;
		const DT_CENTER = 0x00000001;
		const DT_VCENTER = 0x00000004;
		const DT_WORDBREAK = 0x00000010;
		const DT_SINGLELINE = 0x00000020;
		const DT_CALCRECT = 0x00000400;
		const DT_NOCLIP = 0x00000100;
		const DT_NOPREFIX = 0x00000800;
		const DT_WORD_ELLIPSIS = 0x00040000;

		this.cc = DT_CENTER | DT_VCENTER | DT_CALCRECT | DT_NOPREFIX | DT_WORD_ELLIPSIS;
		this.l = DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX | DT_WORD_ELLIPSIS;
		this.lm = DT_NOPREFIX | DT_WORD_ELLIPSIS;
		this.ls = DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX;
		this.ncc = DT_CENTER | DT_VCENTER | DT_NOCLIP | DT_WORDBREAK | DT_CALCRECT | DT_NOPREFIX | DT_WORD_ELLIPSIS;
		this.r = DT_RIGHT | DT_VCENTER | DT_SINGLELINE | DT_NOCLIP | DT_NOPREFIX | DT_WORD_ELLIPSIS;

		this.rp = true;
		this.visible = 'N/A';

		this.defDecades = [{
			tag1: '50s',
			tag2: '1950s',
			query: '%Date% AFTER 1949 AND %Date% BEFORE 1960'
		},
		{
			tag1: '60s',
			tag2: '1960s',
			query: '%Date% AFTER 1959 AND %Date% BEFORE 1970'
		},
		{
			tag1: '70s',
			tag2: '1970s',
			query: '%Date% AFTER 1969 AND %Date% BEFORE 1980'
		},
		{
			tag1: '80s',
			tag2: '1980s',
			query: '%Date% AFTER 1979 AND %Date% BEFORE 1990'
		},
		{
			tag1: '90s',
			tag2: '1990s',
			query: '%Date% AFTER 1989 AND %Date% BEFORE 2000'
		},
		{
			tag1: '00s',
			tag2: '2000s',
			query: '%Date% AFTER 1999 AND %Date% BEFORE 2010'
		}, {
			tag1: '10s',
			tag2: '2010s',
			query: '%Date% AFTER 2009 AND %Date% BEFORE 2020'
		},
		{
			tag1: '20s',
			tag2: '2020s',
			query: '%Date% AFTER 2019 AND %Date% BEFORE 2030'
		}];

		this.decadesMenu = $.jsonParse(ppt.decadesMenu, this.defDecades);
		this.genreMenu = $.split(ppt.genreMenu, 1).filter(v => v.trim());
		this.genreMenu.push('Use tag or query search for more genres')
	}

	// Methods

	clickable(x, y) {
		return !ppt.showAlb && !panel.halt() && (!but.btns['dj'] || !but.btns['dj'].trace(x, y));
	}

	paint() {
		if (this.rp) window.Repaint();
	}

	repaint() {
		if (ppt.showAlb || panel.halt()) return;
		if (ui.style.textOnly) this.paint();
		else if (this.rp) window.RepaintRect(10, Math.min(panel.h * panel.image.size, panel.h - img.ny), panel.w - 20, Math.max(img.ny, panel.h * (1 - panel.image.size)));
	}
}