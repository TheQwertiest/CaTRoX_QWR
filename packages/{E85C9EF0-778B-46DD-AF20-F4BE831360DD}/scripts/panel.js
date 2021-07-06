class Panel {
	constructor() {
		const DT_CENTER = 0x00000001;
		const DT_RIGHT = 0x00000002;
		const DT_VCENTER = 0x00000004;
		const DT_SINGLELINE = 0x00000020;
		const DT_NOPREFIX = 0x00000800;
		const DT_END_ELLIPSIS = 0x00008000;

		this.cc = DT_CENTER | DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX;
		this.curPattern = '';
		this.defaultViews = [];
		this.defFilterPatterns = [];
		this.defViewPatterns = [];
		this.dialogFiltGrps = [];
		this.dialogGrps = [];
		this.draw = true;
		this.folder_view = 10;
		this.folderView = false;
		this.grp = [];
		this.imgView = ppt.albumArtShow;
		this.init = true;
		this.l = DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX;
		this.lc = DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX | DT_END_ELLIPSIS;
		this.lines = ppt.albumArtGrpLevel ? ppt.albumArtGrpLevel : [2, 2, 2, 1, 1][ppt.artId];
		this.list = new FbMetadbHandleList();
		this.menu = [];
		this.paint_y = Math.floor(ui.style.topBarShow || !ppt.sbarShow ? ui.row.h * 1.2 : 0);
		this.pn_h_auto = ppt.pn_h_auto && ppt.rootNode;
		this.newView = true;
		this.pos = -1;
		this.rc = DT_RIGHT | DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX | DT_END_ELLIPSIS;
		this.rootName = '';
		this.s_lc = StringFormat(0, 1);
		this.samePattern = true;
		this.sbar_x = 0;
		this.softSplitter = '¬';
		this.splitter = '¦';
		this.sortBy = '';
		this.viewName = '';
		this.zoomFilter = Math.max(ppt.zoomFilter / 100, 0.7);
		ppt.zoomFilter = this.zoomFilter * 100;

		this.filter = {
			menu: [],
			mode: [],
			x: 0,
			y: 0,
			w: 0
		}

		this.last_pressed_coord = {
			x: -1,
			y: -1
		}

		this.ln = {
			x: 0,
			w: 100
		}

		this.m = {
			x: -1,
			y: -1
		}

		this.search = {
			active: false,
			cursor: false,
			txt: '',
			x: 0,
			w: 100,
			h: 25,
			sp: 25
		}

		this.settings = {}

		this.tree = {
			sel: {
				w: 0
			},
			stripe: {
				w: 0
			},
			w: 0,
			y: 0
		}

		ppt.get('Library Tree Dialog Box', JSON.stringify({
			w: 85,
			h: 60,
			def_w: 85,
			def_h: 60,
			page: 'behaviour'
		}));

		if (this.pn_h_auto) {
			window.MaxHeight = window.MinHeight = ppt.pn_h;
		}

		this.setTopBar();
		this.getViews();
		this.getFilters();
		ppt.initialLoadFilters = false;
		ppt.initialLoadViews = false;
		this.getFields(ppt.viewBy, ppt.filterBy);
	}

	// Methods

	calcText() {
		ui.style.topBarShow = ppt.filterShow || ppt.searchShow || ppt.settingsShow;
		if (!ui.style.topBarShow) return;
		$.gr(1, 1, false, g => {
			this.filter.w = ppt.filterShow ? g.CalcTextWidth(this.filter.mode[ppt.filterBy].name, this.filter.font) + (ppt.searchShow ? Math.max(ppt.margin * 2 + (!ppt.settingsBtnStyle ? 2 : 0), 12) : 0) : 0;
			this.settings.w = ppt.settingsShow ? Math.round(g.MeasureString(this.settings.icon, this.settings.font, 0, 0, 500, 500).Width) : 0;
		});
		switch (true) {
			case ppt.settingsShow && ppt.searchShow:
				this.filter.x = ui.w - ui.sz.marginSearch - this.filter.w - this.settings.w + this.settings.offset;
				break;
			case !ppt.searchShow:
				this.filter.x = ui.sz.marginSearch;
				break;
			case !ppt.settingsShow:
				this.filter.x = ui.w - this.filter.w;
				break;
			case !ppt.filterShow:
				this.filter.x = ui.w - ui.sz.marginSearch * 2 - this.settings.w + this.settings.offset;
				break;
		}
		this.search.x = Math.round(ui.sz.marginSearch + ui.row.h);
		this.search.w = ppt.searchShow && (ppt.filterShow || ppt.settingsShow) ? this.filter.x - this.search.x - 11 : ui.w - ui.sz.marginSearch - Math.round(ui.row.h * 0.75) - this.search.x + 1;
	}

	forcePaint() {
		window.RepaintRect(0, this.paint_y, ui.w, ui.h - this.paint_y + 1, true);
	}

	getFields(view, filter, grpsOnly) {
		this.newView = ppt.viewBy != view;
		ppt.filterBy = filter;
		ppt.viewBy = view;
		const prefix = ppt.prefix.split('|');
		let grps = [];
		let ix1 = -1;
		let ix2 = -1;
		this.filter.mode = [];
		this.folder_view = 10;
		this.grp = [];
		this.multiPrefix = false;
		this.multiProcess = false;
		this.noDisplay = false;
		this.multiValueTagSort = '';
		this.view = '';
		this.view_ppt.forEach((v, i) => {
			if (v.includes('//')) {
				grps = v.split('//');
				this.grp[i] = {
					name: grps[0].trim(),
					type: grps[1]
				}
			}
		});
		grps = [];
		this.filter_ppt.forEach((v, i) => {
			if (v.includes('//')) {
				grps = v.split('//');
				this.filter.mode[i] = {
					name: grps[0].trim(),
					type: grps[1].trim()
				}
			}
		});

		const findClosingBrace = (str, pos) => {
			let depth = 1;
			for (let l = pos + 1; l < str.length; l++) {
				switch (str[l]) {
					case '{':
						depth++;
						break;
					case '}':
						if (--depth == 0) return l;
						break;
				}
			}
			return -1;
		}
		const indexOfAll = (str, item) => {
			const indices = [];
			for (let pos = str.indexOf(item); pos !== -1; pos = str.indexOf(item, pos + 1)) indices.push(pos);
			return indices.reverse();
		}
		const name = v => v.name;
		const removeEmpty = v => v && v.name != '' && v.type != '';

		this.grp = this.grp.filter(removeEmpty);
		this.filter.mode = this.filter.mode.filter(removeEmpty);
		this.folder_view = this.grp.length - 1;
		ppt.filterBy = Math.min(ppt.filterBy, this.filter.mode.length - 1);
		ppt.viewBy = Math.min(ppt.viewBy, this.grp.length - 1);
		this.folderView = ppt.viewBy == this.folder_view;
		if (grpsOnly) return;
		this.colMarker = this.grp[ppt.viewBy].type.includes('$colour{');
		if (this.folderView) {
			this.samePattern = !this.newView && !this.init;
		} else {
			this.sortBy = this.view = this.grp[ppt.viewBy].type;
			this.samePattern = !this.colMarker && this.curPattern == this.view;
		}
		this.curPattern = this.view;
		this.lines = ppt.albumArtGrpLevel ? ppt.albumArtGrpLevel : [2, 2, 2, 1, 1][ppt.artId];

		if (!this.folderView) {
			if (this.view.includes('%<') || this.view.includes(this.splitter)) this.multiProcess = true;
			if (this.multiProcess) {
				if (this.view.includes('$swapbranchprefix{') || this.view.includes('$stripbranchprefix{')) this.multiPrefix = true;
				this.multiValueTagSort = FbTitleFormat((this.view.includes('album artist') || !this.view.includes('%artist%') && !this.view.includes('%<artist>%') && !this.view.includes('$meta(artist') ? '%album artist%' : '%artist%') + '  %album%  [[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%');
			}
			while (this.view.includes('$stripbranchprefix{')) {
				ix1 = this.view.indexOf('$stripbranchprefix{');
				ix2 = findClosingBrace(this.view, ix1 + 18);
				const mvIndices = indexOfAll(this.view, '%<');
				this.sortBy = this.view = $.replaceAt(this.view, ix2, ',' + prefix + ')');
				mvIndices.forEach(v => {
					if (v > ix1 && v < ix2) this.view = this.view.slice(0, v) + '~~' + this.view.slice(v);
				});
				this.sortBy = this.sortBy.replace(/\$stripbranchprefix{/, '$$stripprefix(').replace(/~~%/, '%');
				this.view = this.view.replace(/\$stripbranchprefix{/, '$$stripprefix(');
			}
			while (this.view.includes('$swapbranchprefix{')) {
				ix1 = this.view.indexOf('$swapbranchprefix{');
				ix2 = findClosingBrace(this.view, ix1 + 17);
				const mvIndices = indexOfAll(this.view, '%<');
				this.sortBy = this.view = $.replaceAt(this.view, ix2, ',' + prefix + ')');
				mvIndices.forEach(v => {
					if (v > ix1 && v < ix2) this.view = this.view.slice(0, v) + '~' + this.view.slice(v);
				});
				this.sortBy = this.sortBy.replace(/\$swapbranchprefix{/, '$$swapprefix(').replace(/~%/, '%');
				this.view = this.view.replace(/\$swapbranchprefix{/, '$$swapprefix(');
			}
			this.sortBy = this.sortBy.trimStart().replace(RegExp(this.splitter, 'g'), '  ');
			this.view = this.view.trimStart().replace(RegExp('\\s*' + this.splitter + '\\s*', 'g'), this.softSplitter);
			if (this.multiProcess) {
				this.sortBy = this.sortBy.replace(/[<>]/g, '');
				const baseTag = [];
				const origTag = [];
				const rxp = !this.multiPrefix ? /%<.*?>%/g : /(~~%<|~%<|%<).*?>%/g;
				let cur_match;
				while ((cur_match = rxp.exec(this.view))) {
					origTag.push(cur_match[0]);
					baseTag.push(cur_match[0].replace('~~%', '%').replace('~%', '%').replace(/[<>]/g, ''));
				}
				origTag.forEach((v, i) => {
					const qMark = baseTag[i];
					this.view = this.view.replace(RegExp(v), '$if2(' + v + ',' + qMark + ')');
				});
				this.view = this.view.replace(/%<album artist>%/i, '$if3(%<#album artist#>%,%<#artist#>%,%<#composer#>%,%<#performer#>%)').replace(/%<album>%/i, '$if2(%<#album#>%,%<#venue#>%)').replace(/%<artist>%/i, '$if3(%<artist>%,%<album artist>%,%<composer>%,%<performer>%)').replace(/<#/g, '<').replace(/#>/g, '>');
			}
			if (this.multiProcess) this.view = this.view.replace(/%</g, '#!#$meta_sep(').replace(/>%/g, ',@@)#!#');
			this.sortBy = this.sortBy.replace(/\|/g, this.splitter);
			this.view = this.view.replace(/\|/g, this.splitter);
			if (this.view.includes('$nodisplay{')) this.noDisplay = true;

			while (this.view.includes('$nodisplay{')) {
				ix1 = this.view.indexOf('$nodisplay{');
				ix2 = this.view.indexOf('}', ix1);
				const sub1 = this.view.substring(0, ix1 + 11);
				const sub2 = this.view.substring(ix1 + 11, ix2);
				const sub3 = this.view.substring(ix2);
				this.view = sub1 + sub2.replace(/[¦|]/g, '') + sub3;
				ix1 = this.view.indexOf('$nodisplay{');
				ix2 = this.view.indexOf('}', ix1);
				this.view = $.replaceAt(this.view, ix2, '  #@#');
				this.view = this.view.replace('$nodisplay{', '#@#');
			}
			if (this.colMarker) {
				while (this.view.includes('$colour{')) {
					ix1 = this.view.indexOf('$colour{');
					ix2 = this.view.indexOf('}', ix1);
					this.view = $.replaceAt(this.view, ix2, '@!#');
					this.view = this.view.replace('$colour{', '@!#');
				}
				const colView = this.view.split('@!#');
				colView.forEach((v, i, arr) => {
					if (i % 2 === 1) {
						const colSplit = v.split(',');
						arr[i] = '@!#' + (ui.setMarkerCol(colSplit[0]) || (!ppt.albumArtShow || ppt.albumArtLabelType != 4 ? ui.col.text : RGB(240, 240, 240))) + '`' + (ui.setMarkerCol(colSplit[1]) || (ppt.highLightText ? ui.col.text_h : (!ppt.albumArtShow || ppt.albumArtLabelType != 4 ? ui.col.text : RGB(240, 240, 240)))) + '`' + (ui.setMarkerCol(colSplit[2]) || (!ppt.albumArtShow || ppt.albumArtLabelType != 4 ? ui.col.textSel : ui.col.text)) + '@!#';
					}
				});
				this.view = colView.join('');
			}
			if (ui.col.counts) this.colMarker = true;
			if (this.colMarker) this.sortBy = this.sortBy.replace(/\$colour{.*?}/g, '');
			while (this.sortBy.includes('$nodisplay{')) {
				ix1 = this.sortBy.indexOf('$nodisplay{');
				ix2 = this.sortBy.indexOf('}', ix1);
				this.sortBy = $.replaceAt(this.sortBy, ix2, '  ');
				this.sortBy = this.sortBy.replace('$nodisplay{', '  ');
			}
			this.sortBy = this.sortBy.replace(RegExp(this.splitter, 'g'), '  ');
		}
		this.pn_h_auto = ppt.pn_h_auto && ppt.rootNode;
		if (this.pn_h_auto) window.MaxHeight = window.MinHeight = ppt.pn_h;
		else {
			window.MaxHeight = 2147483647;
			window.MinHeight = 0;
		}
		this.setRootName();
		this.filter.menu = this.filter.mode.map(name);
		this.menu = this.grp.map(name);
	}

	getFilters() {
		let pt = [
			['Filter 01: Name // Query', 'Filter // Button Name'],
			['Filter 02: Name // Query', 'Lossless // "$info(encoding)" IS lossless'],
			['Filter 03: Name // Query', 'Lossy // "$info(encoding)" IS lossy'],
			['Filter 04: Name // Query', 'Missing Replaygain // %replaygain_track_gain% MISSING'],
			['Filter 05: Name // Query', 'Never Played // %play_count% MISSING'],
			['Filter 06: Name // Query', 'Played Often // %play_count% GREATER 9'],
			['Filter 07: Name // Query', 'Recently Added // %added% DURING LAST 2 WEEKS'],
			['Filter 08: Name // Query', 'Recently Played // %last_played% DURING LAST 2 WEEKS'],
			['Filter 09: Name // Query', 'Top Rated // %rating% IS 5'],
			['Filter 10: Name // Query', 'Nowplaying Artist // artist IS $nowplaying{$meta(artist,0)}']
		];

		let grps = [];
		this.defFilterPatterns = pt.map(v => {
			grps = v[1].split('//');
			return {
				name: grps[0].trim(),
				type: grps[1].trim(),
				menu: true
			}
		});

		const dialogFilters = [];
		this.filter_ppt = [];
		let pptNo = 0;
		for (let i = 0; i < pt.length; i++) {
			const v = pt[i];
			const prop = ppt.initialLoadFilters ? ppt.get(v[0], v[1]) : ppt.get(v[0]);
			if (!i) {
				const defValid = prop && prop.endsWith('// Button Name');
				dialogFilters.push(defValid ? prop : 'Filter // Button Name');
				this.filter_ppt.push(defValid ? prop : 'Filter // Button Name');
				if (!defValid) ppt.set(v[0], v[1]);
				pptNo++;
			} else {
				if (prop) {
					if (prop.includes('//') || prop.includes('/hide/')) dialogFilters.push(prop);
					if (prop.includes('//')) this.filter_ppt.push(prop);
					pptNo++;
				}
			}
		}

		pt = undefined;
		let nm = '';
		for (let i = pptNo + 1; i < 100; i++) {
			nm = ppt.get(`Filter ${$.padNumber(i, 2)}: Name // Query`);
			if (nm) {
				if (nm.includes('//') || nm.includes('/hide/')) dialogFilters.push(nm);
				if (nm.includes('//')) this.filter_ppt.push(nm);
			}
		}

		this.dialogFiltGrps = dialogFilters.map(v => {
			if (v.includes('//')) {
				grps = v.split('//');
				return {
					name: grps[0].trim(),
					type: grps[1].trim(),
					menu: true
				}
			} else if (v.includes('/hide/')) {
				grps = v.split('/hide/');
				return {
					name: grps[0].trim(),
					type: grps[1].trim(),
					menu: false
				}
			}
		});

		// move filter button to end
		this.dialogFiltGrps.push(this.dialogFiltGrps.shift());
		this.defFilterPatterns.push(this.defFilterPatterns.shift());
	}

	getViews() {
		let pt = [
			['View 01: Name // Pattern', 'View by Folder Structure // Pattern Not Configurable'],
			['View 02: Name // Pattern', 'View by Artist // %artist%|%album%|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%'],
			['View 03: Name // Pattern', 'View by Album Artist // %album artist%|%album%|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%'],
			['View 04: Name // Pattern', "View by Album Artist - Album // [%album artist% - ]['['%date%']' ]%album%|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%"],
			['View 05: Name // Pattern', "View by Album // %album%[ '['%album artist%']']|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%"],
			['View 06: Name // Pattern', 'View by Genre // %<genre>%|[%album artist% - ]%album%|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%'],
			['View 07: Name // Pattern', 'View by Year // %date%|[%album artist% - ]%album%|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%']
		];
		let grps = [];
		this.defViewPatterns = pt.map(v => {
			grps = v[1].split('//');
			return {
				name: grps[0].trim(),
				type: grps[1].trimStart(),
				menu: true
			}
		});

		this.defaultViews = this.defViewPatterns.map(v => v.type);
		this.defaultViews.shift();

		const dialogViews = [];
		this.view_ppt = [];
		let pptNo = 0;
		for (let i = 0; i < pt.length; i++) {
			const v = pt[i];
			const prop = ppt.initialLoadViews ? ppt.get(v[0], v[1]) : ppt.get(v[0]);
			if (!i) {
				const defValid = prop && prop.endsWith('// Pattern Not Configurable');
				dialogViews.push(defValid ? prop : 'View by Folder Structure // Pattern Not Configurable');
				this.view_ppt.push(defValid ? prop : 'View by Folder Structure // Pattern Not Configurable');
				if (!defValid) ppt.set(v[0], v[1]);
				pptNo++;
			} else {
				if (prop) {
					if (prop.includes('//') || prop.includes('/hide/')) dialogViews.push(prop);
					if (prop.includes('//')) this.view_ppt.push(prop);
					pptNo++;
				}
			}
		}

		pt = undefined;
		let nm = '';
		for (let i = pptNo + 1; i < 100; i++) {
			nm = ppt.get(`View ${$.padNumber(i, 2)}: Name // Pattern`);
			if (nm) {
				if (nm.includes('//') || nm.includes('/hide/')) dialogViews.push(nm);
				if (nm.includes('//')) this.view_ppt.push(nm);
			}
		}

		this.dialogGrps = dialogViews.map(v => {
			if (v.includes('//')) {
				grps = v.split('//');
				return {
					name: grps[0].trim(),
					type: grps[1].trimStart(),
					menu: true
				}
			} else if (v.includes('/hide/')) {
				grps = v.split('/hide/');
				return {
					name: grps[0].trim(),
					type: grps[1].trimStart(),
					menu: false
				}
			}
		});

		// move folder structure to end
		this.dialogGrps.push(this.dialogGrps.shift());
		this.defViewPatterns.push(this.defViewPatterns.shift());
		this.view_ppt.push(this.view_ppt.shift());
	}

	getFilterIndex(arr, name, type) {
		let findFilterIndex = arr.findIndex(v => v.name === name && v.type === type);
		if (findFilterIndex != -1) ppt.filterBy = findFilterIndex;
		return findFilterIndex;
	}

	getViewIndex(arr, name, type) {
		let findViewIndex = arr.findIndex(v => {
			return v.name.trim() === name && v.type.trimStart() === type;
		})
		if (findViewIndex != -1) ppt.viewBy = findViewIndex;
		return findViewIndex;
	}

	open(page) {
		const ok_callback = (new_cfg, new_ppt, type, new_cfgWindow) => {
			if (new_cfg) {
				let cfg = $.jsonParse(new_cfg, []);
				this.clear('both');
				let i = cfg[0].length;
				while (i--)
					if (!cfg[0][i].type) cfg[0].splice(i, 1);
				cfg[0].forEach((v, i) => {
					const nm = v.type ? v.name + (v.menu ? ' // ' : ' /hide/ ') + v.type : null;
					ppt.set(v.type != 'Pattern Not Configurable' ? `View ${$.padNumber(i + 2, 2)}: Name // Pattern` : `View 01: Name // Pattern`, nm);
				});
				i = cfg[1].length;
				while (i--)
					if (!cfg[1][i].type) cfg[1].splice(i, 1);
				cfg[1].forEach((v, i) => {
					const nm = v.type ? v.name + (v.menu ? ' // ' : ' /hide/ ') + v.type : null;
					ppt.set(v.type != 'Button Name' ? `Filter ${$.padNumber(i + 2, 2)}: Name // Query` : `Filter 01: Name // Query`, nm);
				});
				const view_name = this.grp[ppt.viewBy].name;
				const view_type = this.grp[ppt.viewBy].type.trimStart();
				const filter_name = this.filter.mode[ppt.filterBy].name;
				const filter_type = this.filter.mode[ppt.filterBy].type;
				this.getViews();
				this.getFilters();
				this.getFields(ppt.viewBy, ppt.filterBy, true);
				if (this.getViewIndex(this.grp, view_name, view_type) == -1 || this.getFilterIndex(this.filter.mode, filter_name, filter_type) == -1) {
					lib.logTree();
					window.Reload();
				} else this.getFields(ppt.viewBy, ppt.filterBy);
			}

			if (new_ppt) this.updateProp($.jsonParse(new_ppt, {}), 'value');

			if (new_cfgWindow) ppt.set('Library Tree Dialog Box', new_cfgWindow);

			if (type == 'reset') {
				this.updateProp(ppt, 'default_value');
			}

			if (new_cfg || new_ppt || type == 'reset') {
				men.refreshMainMenu();
				men.refreshFilterMenu();
			}
		}

		this.getViews();
		let cfgWindow = ppt.get('Library Tree Dialog Box');
		if (page !== undefined) {
			cfgWindow = $.jsonParse(cfgWindow);
			cfgWindow.page = page;
			cfgWindow = JSON.stringify(cfgWindow);
			ppt.set('Library Tree Dialog Box', cfgWindow);
		}
		popUpBox.config(JSON.stringify([this.dialogGrps, this.dialogFiltGrps, this.defViewPatterns, this.defFilterPatterns]), JSON.stringify(ppt), cfgWindow, ok_callback);
	}

	updateProp(prop, value) {
		Object.entries(prop).forEach(v => {
			ppt[v[0].replace('_internal', '')] = v[1][value]
		});

		img.asyncBypass = Date.now();
		pop.autoPlay.send = ppt.autoPlay;
		pop.autoPlay = {
			click: ppt.clickAction < 2 ? false : ppt.clickAction,
			send: ppt.autoPlay
		}
		pop.autoFill = {
			mouse: ppt.clickAction == 1 ? true : false,
			key: ppt.keyAction
		}
		ppt.autoExpandLimit = Math.round(ppt.autoExpandLimit);
		if (isNaN(ppt.autoExpandLimit)) ppt.autoExpandLimit = 350;
		ppt.autoExpandLimit = $.clamp(ppt.autoExpandLimit, 10, 1000);
		ppt.margin = Math.round(ppt.margin);
		if (isNaN(ppt.margin)) ppt.margin = 8 * $.scale;
		ppt.margin = $.clamp(ppt.margin, 0, 100);
		ppt.treeIndent = Math.round(ppt.treeIndent);
		if (isNaN(ppt.treeIndent)) ppt.treeIndent = 19 * $.scale;
		ppt.treeIndent = $.clamp(ppt.treeIndent, 0, 100);

		lib.checkView();
		lib.logTree();
		img.setRoot();
		ppt.zoomImg = Math.round($.clamp(ppt.zoomImg, 10, 500));

		let o = !this.imgView ? 'verticalPad' : 'verticalAlbumArtPad';
		if (!ppt[o]) ppt[o] = !this.imgView ? 3 : 2;
		ppt[o] = Math.round(ppt[o]);
		if (isNaN(ppt[o])) ppt[o] = !this.imgView ? 3 : 2;
		ppt[o] = $.clamp(ppt[o], 0, !this.imgView ? 100 : 20);

		ppt.iconCustom = ppt.iconCustom.trim();
		ui.setNodes();
		sbar.active = true;
		sbar.duration = {
			drag: 200,
			inertia: ppt.durationTouchFlick,
			full: ppt.durationScroll
		};
		sbar.duration.scroll = Math.round(sbar.duration.full * 0.8);
		sbar.duration.step = Math.round(sbar.duration.full * 2 / 3);
		sbar.duration.bar = sbar.duration.full;
		sbar.duration.barFast = sbar.duration.step;
		if (!ppt.butCustIconFont.length) ppt.butCustIconFont = 'Segoe UI Symbol';
		ui.setSbar();
		on_colours_changed();
		this.setRootName();
		but.setSbarIcon();
		pop.setValues();
		pop.inlineRoot = ppt.rootNode && ppt.inlineRoot;

		ui.getFont();
		this.on_size();
		this.tree.y = this.search.h;
		but.createImages();
		but.refresh(true);
		find.on_size();
		pop.createImages();

		if (ppt.highLightNowplaying) {
			pop.getNowplaying();
			pop.nowPlayingShow()
		}

		if (panel.imgView && pop.tree.length) {
			img.trimCache(pop.tree[0].key);
			img.metrics();
		}
		lib.rootNodes(1, true);
		this.pn_h_auto = ppt.pn_h_auto && ppt.rootNode;
		if (this.pn_h_auto) {
			window.MaxHeight = window.MinHeight = ppt.pn_h;
		}
		if (panel.pn_h_auto && !panel.imgView && ppt.pn_h == ppt.pn_h_min && this.tree[0]) this.clearChild(this.tree[0]);
		pop.checkAutoHeight();
		if (sbar.scroll > sbar.max_scroll) sbar.checkScroll(sbar.max_scroll);
		window.Repaint();

	}

	on_size(fontChanged) {
		const ln_sp = ui.style.topBarShow && !ui.id.local ? Math.floor(ui.row.h * 0.1) : 0;
		const sbarStyle = !ppt.sbarFullHeight ? 2 : 0;
		this.calcText();
		this.ln.x = ppt.countsRight || ppt.rowStripes || ppt.fullLineSelection || pop.inlineRoot ? 0 : ui.sz.marginSearch;
		this.ln.w = ui.w - this.ln.x - 1;
		this.search.h = ui.style.topBarShow ? ui.row.h + (!ui.id.local ? ln_sp * 2 : 0) : ui.sz.margin;
		this.search.sp = this.search.h - ln_sp;
		let sp = ui.h - this.search.h - (ui.style.topBarShow ? 0 : ui.sz.margin);
		this.rows = sp / ui.row.h;
		this.rows = Math.floor(this.rows);
		sp = ui.row.h * this.rows;
		this.node_y = Math.round((ui.row.h - ui.sz.node) / 1.75);
		this.filter.y = sp + this.search.h - ui.row.h * 0.9;
		if (this.init || fontChanged) this.tree.y = this.search.h;
		this.paint_y = Math.floor(ui.style.topBarShow || !ppt.sbarShow ? this.search.h : 0);

		const sbar_top = !ui.sbar.type ? 5 : ui.style.topBarShow ? 3 : 0;
		const sbar_bot = !ui.sbar.type ? 5 : 0;
		this.sbar_o = [ui.sbar.arrowPad, Math.max(Math.floor(ui.sbar.but_w * 0.2), 2) + ui.sbar.arrowPad * 2, 0][ui.sbar.type];
		const vertical = !ppt.albumArtFlowMode || ui.h - this.search.h > ui.w - ui.sbar.w;
		switch (true) {
			case !this.imgView || vertical: {
				this.sbar_x = ui.w - ui.sbar.sp;
				const top_corr = [this.sbar_o - (ui.sbar.but_h - ui.sbar.but_w) / 2, this.sbar_o, 0][ui.sbar.type];
				const bot_corr = [(ui.sbar.but_h - ui.sbar.but_w) / 2 - this.sbar_o, -this.sbar_o, 0][ui.sbar.type];
				let sbar_y = (ui.sbar.type < sbarStyle || ui.style.topBarShow ? this.search.sp + 1 : 0) + sbar_top + top_corr;
				let sbar_h = ui.sbar.type < sbarStyle ? sp + 1 - sbar_top - sbar_bot + bot_corr * 2 : ui.h - sbar_y - sbar_bot + bot_corr;
				if (ui.sbar.type == 2) {
					sbar_y += 1;
					sbar_h -= 2;
				}
				sbar.metrics(this.sbar_x, sbar_y, ui.sbar.w, sbar_h, this.rows, ui.row.h, !this.imgView ? true : vertical);
				if (this.imgView) img.metrics();
				break;
			}
			case !vertical: {
				this.sbar_y = ui.h - ui.sbar.sp;
				let sbar_x = 0;
				let sbar_w = ui.w;
				if (ui.sbar.type == 2) {
					sbar_x += 1;
					sbar_w -= 2;
				}
				sbar.metrics(sbar_x, this.sbar_y, sbar_w, ui.sbar.w, this.rows, ui.row.h, !this.imgView ? true : false);
				if (this.imgView) img.metrics();
				break;
			}
		}
		if (this.imgView) {
			if (this.init) img.sizeDebounce();
			else if (sbar.scroll > sbar.max_scroll) sbar.checkScroll(sbar.max_scroll);
		}
	}

	searchPaint() {
		window.RepaintRect(0, 0, ui.w, this.search.h);
	}

	set(n, i, treeArtToggle) {
		const msg = 'This option changes various options\n\nContinue?';
		switch (n) {
			case 'quickSetup':
				switch (i) {
					case 0: {
						const continue_confirmation = (status, confirmed) => {
							if (confirmed) {
								ppt.countsRight = false;
								ppt.nodeStyle = 0;
								ppt.inlineRoot = false;
								ppt.autoCollapse = false;
								ppt.treeAutoExpandSingle = false;
								ppt.treeListView = false;
								ui.sbar.type = 0;
								ppt.sbarType = 0;
								ppt.sbarShow = 2;
								ppt.fullLineSelection = false;
								ppt.highLightText = true;
								ppt.rowStripes = false;
								ppt.highLightRow = 3;
								ppt.highLightNode = true;
								ppt.verticalPad = 3;
								ppt.rootNode = 1;
								panel.imgView = ppt.albumArtShow = false;
								ppt.albumArtLabelType = 1;
								ppt.thumbNailSize = 1;
								ppt.artId = 0;
							}
						}
						popUpBox.confirm('Quick Setup: Traditional Style', msg, 'Yes', 'No', continue_confirmation);
						break;
					}
					case 1: {
						const continue_confirmation = (status, confirmed) => {
							if (confirmed) {
								ppt.countsRight = true;
								ppt.nodeStyle = 2;
								ppt.inlineRoot = true;
								ppt.autoCollapse = false;
								ppt.treeAutoExpandSingle = false;
								ppt.treeListView = false;
								ui.sbar.type = 1;
								ppt.sbarType = 1;
								ppt.sbarShow = 1;
								ppt.fullLineSelection = true;
								ppt.highLightText = false;
								ppt.rowStripes = true;
								ppt.highLightRow = 2;
								ppt.highLightNode = true;
								ppt.verticalPad = 5;
								ppt.rootNode = 3;
								panel.imgView = ppt.albumArtShow = false;
								ppt.albumArtLabelType = 1;
								ppt.thumbNailSize = 1;
								ppt.artId = 0;
							}
						}
						popUpBox.confirm('Quick Setup: Modern Style', msg, 'Yes', 'No', continue_confirmation);
						break;
					}
					case 2: {
						const continue_confirmation = (status, confirmed) => {
							if (confirmed) {
								ppt.countsRight = true;
								ppt.nodeStyle = 3;
								ppt.inlineRoot = true;
								ppt.autoCollapse = true;
								ppt.treeAutoExpandSingle = true;
								ppt.treeListView = false;
								ui.sbar.type = 1;
								ppt.sbarType = 1;
								ppt.sbarShow = 1;
								ppt.fullLineSelection = true;
								ppt.highLightText = false;
								ppt.rowStripes = true;
								ppt.highLightRow = 1;
								ppt.highLightNode = false;
								ppt.verticalPad = 5;
								ppt.rootNode = 3;
								panel.imgView = ppt.albumArtShow = false;
								ppt.albumArtLabelType = 1;
								ppt.thumbNailSize = 1;
								ppt.artId = 0;
							}
						}
						popUpBox.confirm('Quick Setup: Ultra Modern Style', msg, 'Yes', 'No', continue_confirmation);
						break;
					}
					case 3: {
						const continue_confirmation = (status, confirmed) => {
							if (confirmed) {
								ppt.countsRight = true;
								ppt.nodeStyle = 2;
								ppt.inlineRoot = true;
								ppt.autoCollapse = false;
								ppt.treeAutoExpandSingle = false;
								ppt.treeListView = true;
								panel.imgView = ppt.albumArtShow = false;
								ppt.albumArtLabelType = 1;
								ppt.thumbNailSize = 1;
								ppt.artId = 0;
								ui.sbar.type = 1;
								ppt.sbarType = 1;
								ppt.sbarShow = 1;
								ppt.fullLineSelection = true;
								ppt.highLightText = false;
								ppt.rowStripes = true;
								ppt.highLightRow = 2;
								ppt.highLightNode = true;
								ppt.verticalPad = 5;
								ppt.rootNode = 3;
							}
						}
						popUpBox.confirm('Quick Setup: List View', msg, 'Yes', 'No', continue_confirmation);
						break;
					}
					case 4: {
						const continue_confirmation = (status, confirmed) => {
							if (confirmed) {
								ui.sbar.type = 1;
								ppt.sbarType = 1;
								ppt.sbarShow = 1;
								ppt.fullLineSelection = true;
								ppt.highLightText = false;
								ppt.rowStripes = true;
								ppt.highLightRow = 1;
								ppt.highLightNode = false;
								ppt.verticalPad = 5;
								ppt.rootNode = 3;
								ppt.treeListView = false;
								panel.imgView = ppt.albumArtShow = true;
								if (!ppt.presetLoadCurView) ppt.viewBy = 1;
								ppt.albumArtFlowMode = false;
								ppt.albumArtLabelType = 2;
								ppt.imgStyleFront = 1;
								ppt.itemOverlayType = 2;
								ppt.thumbNailSize = 0;
								ppt.artId = 0;
								ppt.albumArtGrpLevel = 0;
							}
						}
						popUpBox.confirm('Quick Setup: List View + Album Covers', msg, 'Yes', 'No', continue_confirmation);
						break;
					}
					case 5: {
						const continue_confirmation = (status, confirmed) => {
							if (confirmed) {
								ui.sbar.type = 1;
								ppt.sbarType = 1;
								ppt.sbarShow = 1;
								ppt.fullLineSelection = true;
								ppt.highLightText = false;
								ppt.rowStripes = true;
								ppt.highLightRow = 1;
								ppt.highLightNode = false;
								ppt.verticalPad = 5;
								ppt.rootNode = 3;
								ppt.treeListView = false;
								panel.imgView = ppt.albumArtShow = true;
								if (!ppt.presetLoadCurView) ppt.viewBy = 0;
								ppt.albumArtFlowMode = false;
								ppt.albumArtLabelType = 2;
								ppt.imgStyleArtist = 2;
								ppt.itemOverlayType = 0;
								ppt.thumbNailSize = 0;
								ppt.artId = 4;
								ppt.albumArtGrpLevel = 0;
							}
						}
						popUpBox.confirm('Quick Setup: List View + Artist Photos', msg, 'Yes', 'No', continue_confirmation);
						break;
					}
					case 6: {
						const continue_confirmation = (status, confirmed) => {
							if (confirmed) {
								ui.sbar.type = 1;
								ppt.sbarType = 1;
								ppt.sbarShow = 1;
								ppt.fullLineSelection = true;
								ppt.highLightText = false;
								ppt.rowStripes = true;
								ppt.highLightRow = 1;
								ppt.highLightNode = false;
								ppt.verticalPad = 5;
								ppt.rootNode = 3;
								ppt.treeListView = false;
								panel.imgView = ppt.albumArtShow = true;
								if (!ppt.presetLoadCurView) ppt.viewBy = 1;
								ppt.albumArtFlowMode = false;
								ppt.albumArtLabelType = 1;
								ppt.imgStyleFront = 1;
								ppt.itemOverlayType = 1;
								ppt.thumbNailSize = 1;
								ppt.artId = 0;
								ppt.albumArtGrpLevel = 0;
							}
						}
						popUpBox.confirm('Quick Setup: Album Covers', msg, 'Yes', 'No', continue_confirmation);
						break;
					}
					case 7: {
						const continue_confirmation = (status, confirmed) => {
							if (confirmed) {
								ppt.countsRight = true;
								ppt.nodeStyle = 2;
								ppt.inlineRoot = true;
								ppt.autoCollapse = false;
								ppt.treeAutoExpandSingle = false;
								ppt.treeListView = false;
								panel.imgView = ppt.albumArtShow = true;
								if (!ppt.presetLoadCurView) ppt.viewBy = 1;
								ppt.albumArtFlowMode = true;
								ppt.albumArtLabelType = 1;
								ppt.imgStyleFront = 1;
								ppt.itemOverlayType = 1;
								ppt.thumbNailSize = 1;
								if (!ppt.presetLoadCurView) ppt.artId = 0;
								ppt.albumArtGrpLevel = 0;
							}
						}
						popUpBox.confirm('Quick Setup: Flow Mode', msg, 'Yes', 'No', continue_confirmation);
						break;
					}
					case 8:
						ppt.toggle('presetLoadCurView');
						return;
				}
				ppt.nodeLines = true;
				ppt.nodeCounts = 1;
				ppt.sbarButType = 0;
				ppt.searchShow = true;
				ppt.filterShow = true;
				ppt.settingsShow = true
				window.Reload();
				break;
			case 'Filter':
				lib.searchCache = {};
				pop.subCounts.filter = {};
				pop.subCounts.search = {};
				switch (i) {
					case this.filter.menu.length:
						ppt.toggle('reset');
						if (ppt.reset) {
							this.searchPaint();
							lib.treeState(true, 2);
						}
						break;
					default:
						ppt.filterBy = i;
						this.calcText();
						if (this.search.txt) lib.upd_search = true;
						if (!ppt.rememberTree && !ppt.reset) lib.logTree();
						else if (ppt.rememberTree) lib.logFilter();
						lib.getLibrary();
						lib.rootNodes(!ppt.reset ? 1 : 0, true);
						but.refresh(true);
						this.searchPaint();
						if (ppt.searchSend == 2 && this.search.txt.length) pop.load(this.list, false, false, false, true, false);
						break;
				}
				pop.checkAutoHeight();
				break;
			case 'view': {
				if (this.colMarker) this.draw = false;
				if (this.search.txt) lib.upd_search = true;
				this.getFields(i < this.grp.length ? i : ppt.viewBy, ppt.filterBy);
				this.on_size();
				lib.searchCache = {};
				pop.subCounts = {
					'standard': {},
					'search': {},
					'filter': {}
				};
				lib.checkView();
				const key = !ppt.rememberView ? 'def' : this.viewName;
				if ((ppt.rememberView || treeArtToggle) && lib.exp[key]) lib.readTreeState(false, treeArtToggle);
				lib.getLibrary(treeArtToggle);
				lib.rootNodes((ppt.rememberView || treeArtToggle), (ppt.rememberView || treeArtToggle) ? true : false);
				if (ppt.rememberView) lib.logTree();
				this.draw = true;
				if (ppt.searchSend == 2 && this.search.txt.length) pop.load(this.list, false, false, false, true, false);
				pop.checkAutoHeight();
				break;
			}
		}
	}

	setHeight(n) {
		if (!this.pn_h_auto) return;
		ppt.pn_h = n || this.imgView ? ppt.pn_h_max : ppt.pn_h_min;
		window.MaxHeight = window.MinHeight = ppt.pn_h;
	}

	setRootName() {
		this.viewName = this.grp[ppt.viewBy].name;
		switch (ppt.rootNode) {
			case 1:
				this.rootName = 'All Music';
				break;
			case 2:
				this.rootName = this.viewName;
				break;
			case 3: {
				const nm = this.viewName.replace(/view by|^by\b/i, '').trim();
				const basenames = nm.split(' ').map(v => pluralize(v));
				const basename = basenames.join(' ').replace(/(album|artist|top)s\s/gi, '$1 ').replace(/(similar artist)\s/gi, '$1s ');
				this.rootName = !this.imgView ? `All (#^^^^# ${basename})` : `All #^^^^# ${basename}`;
				this.rootName1 = !this.imgView ? `All (1 ${nm})` : `All 1 ${nm}`;
				break;
			}
		}
	}

	setTopBar() {
		let sz = Math.round(12 * $.scale * this.zoomFilter);
		let mod = 0;
		if (sz > 15) mod = (sz % 2) - 1;
		this.filter.font = gdi.Font('Segoe UI', this.zoomFilter > 1.05 ? Math.floor(11 * $.scale * this.zoomFilter) : Math.max(11 * $.scale * this.zoomFilter, 9), 1);
		this.settings.font = gdi.Font('Segoe UI Symbol', sz + mod, 0);
		this.settings.icon = '\uE10C';
		this.settings.offset = Math.round(1 * this.settings.font.Size / 17);
	}

	sort(li) {
		switch (this.folderView) {
			case true:
				li.OrderByRelativePath();
				break;
			default: {
				let tfo = FbTitleFormat(this.sortBy);
				li.OrderByFormat(tfo, 1);
				break;
			}
		}
	}

	treePaint() {
		window.RepaintRect(0, this.paint_y, ui.w, ui.h - this.paint_y + 1);
	}

	clear(type) {
		if (type == 'views' || type == 'both') {
			for (let i = 0; i < 100; i++) {
				ppt.set(`View ${$.padNumber(i, 2)}: Name // Pattern`, null);
			}
		}
		if (type == 'filters' || type == 'both') {
			for (let i = 0; i < 100; i++) ppt.set(`Filter ${$.padNumber(i, 2)}: Name // Query`, null);
		}
	}

	zoomReset() {
		sbar.logScroll();
		ppt.zoomFont = 100;
		ppt.zoomNode = 100;
		this.zoomFilter = 1;
		ppt.zoomFilter = 100;
		ppt.zoomTooltipBut = 100;
		this.setTopBar();
		ui.getFont();
		this.on_size();
		find.on_size();
		if (panel.imgView) {
			ppt.zoomImg = 100;
			img.clearCache();
			img.metrics();
		}
		if (ui.style.topBarShow || ppt.sbarShow) but.refresh(true);
		window.Repaint();
		sbar.setScroll();
	}
}