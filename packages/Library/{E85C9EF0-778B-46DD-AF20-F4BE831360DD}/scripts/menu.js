const MF_CHECKED = 0x00000008;
const MF_GRAYED = 0x00000001;
const MF_SEPARATOR = 0x00000800;
const MF_STRING = 0x00000000;

class MenuManager {
	constructor(baseMenu) {
		this.baseMenu = baseMenu || 'baseMenu';
		this.func = {};
		this.idx = 0;
		this.menu = {};
		this.menuItems = [];
		this.menuNames = [];
	}

	// Methods

	addItem(v) {
		if (v.separator && !v.str) {
			const separator = this.get(v.separator);
			if (separator) this.menu[v.menuName].AppendMenuSeparator();
		} else {
			const hide = this.get(v.hide);
			if (hide || !v.str) return;
			this.idx++;
			this.getItems(v, ['checkItem', 'checkRadio', 'flags', 'menuName', 'separator', 'str']);
			const menu = this.menu[this.menuName];
			menu.AppendMenuItem(this.flags, this.idx, this.str);
			menu.CheckMenuItem(this.idx, this.checkItem);
			if (this.checkRadio) menu.CheckMenuRadioItem(this.idx, this.idx, this.idx);
			if (this.separator) menu.AppendMenuSeparator();
			this.func[this.idx] = v.func;
		}
	}

	appendMenu(v) {
		this.getItems(v, ['hide', 'menuName']);
		if (this.menuName == this.baseMenu || this.hide) return;
		this.getItems(v, ['appendTo', 'flags', 'separator', 'str']);
		const menu = this.menu[this.appendTo || this.baseMenu];
		this.menu[this.menuName].AppendTo(menu, this.flags, this.str || this.menuName)
		if (this.separator) menu.AppendMenuSeparator();
	}

	clear() {
		this.menu = {}
		this.func = {}
		this.idx = 0;
	}

	createMenu(menuName = this.baseMenu) {
		menuName = this.get(menuName);
		this.menu[menuName] = window.CreatePopupMenu();
	}

	get(v) {
		if (typeof v == 'function') return v();
		return v;
	}

	getItems(v, items) {
		items.forEach(w => this[w] = this.get(v[w]))
	}

	load(x, y) {
		this.menuNames.forEach(v => this.createMenu(v));
		this.menuItems.forEach(v => !v.appendMenu ? this.addItem(v) : this.appendMenu(v));

		let Context;
		if (men.show_context) {
			Context = fb.CreateContextMenuManager();
			Context.InitContext(men.items);
			this.menu[this.baseMenu].AppendMenuSeparator();
			Context.BuildMenu(this.menu[this.baseMenu], 5000);
		}

		const idx = this.menu[this.baseMenu].TrackPopupMenu(x, y);
		this.run(idx);

		if (men.show_context) {
			if (idx >= 5000 && idx <= 5800) Context.ExecuteByID(idx - 5000);
			men.show_context = false;
		}

		this.clear();
	}

	newItem({str = null, func = null, menuName = this.baseMenu, flags = MF_STRING, checkItem = false, checkRadio = false, separator = false, hide = false}) {
		this.menuItems.push({
			str: str,
			func: func,
			menuName: menuName,
			flags: flags,
			appendMenu: false,
			checkItem: checkItem,
			checkRadio: checkRadio,
			separator: separator,
			hide: hide
		});
	}

	newMenu({menuName = this.baseMenu, str = '', appendTo = this.baseMenu, flags = MF_STRING, separator = false, hide = false}) {
		this.menuNames.push(menuName);
		if (menuName != this.baseMenu) {
			this.menuItems.push({
				menuName: menuName,
				appendMenu: true,
				str: str,
				appendTo: appendTo,
				flags: flags,
				separator: separator,
				hide: hide
			});
		}
	}

	run(idx) {
		const v = this.func[idx];
		if (typeof v != 'function') return;
		v();
	}
}
let menu = new MenuManager;
let fMenu = new MenuManager;
let searchMenu = new MenuManager;

class MenuItems {
	constructor() {
		this.expandable = false;
		this.filter_dn = false;
		this.ix = -1;
		this.items = new FbMetadbHandleList();
		this.nm = '';
		this.pl = [];
		this.r_up = false;
		this.settings_dn = false;
		this.show_context = false;
		this.treeExpandLimit = $.file('C:\\check_local\\1450343922.txt') ? 6000 : $.clamp(ppt.treeExpandLimit, 10, 6000);
		this.playlists_changed(true);
		this.filterMenu();
		this.mainMenu();
		this.searchMenu();
		this.settingsBtnDn = false;
		this.validItem = false;
	}

	// Methods

	mainMenu() {
		menu.newMenu({hide: () => !this.settingsBtnDn && ppt.settingsShow && this.validItem});
		['Send to current playlist' + '\tEnter', 'Add to current playlist' + '\tShift+enter', 'Send to new playlist' + '\tCtrl+enter', 'Show nowplaying'].forEach((v, i) => menu.newItem({
			str: v,
			func: () => this.setPlaylist(i),
			flags: () => i < 2 && !plman.IsPlaylistLocked(plman.ActivePlaylist) || i == 2 || i == 3 && pop.nowp != -1 ? MF_STRING : MF_GRAYED,
			separator: i == 2,
			hide: () => !this.validItem
		}));

		menu.newItem({
			str: () => !panel.imgView ? 'Show album art' : 'Show tree',
			func: () => this.setPlaylist(4),
			flags: () => !panel.pn_h_auto || ppt.pn_h != ppt.pn_h_min ? MF_STRING : MF_GRAYED,
			separator: () => !panel.imgView || this.show_context && !ui.style.topBarShow,
			hide: () => !this.validItem || !ppt.albumArtOptionsShow
		});

		['Collapse all\tNum -', 'Expand\tNum *'].forEach((v, i) => menu.newItem({
			str: v,
			func: () => {
				switch (i) {
					case 0:
						pop.collapseAll();
						break;
					case 1:
						pop.expand(this.ix, this.nm);
						panel.setHeight(true);
						break;
				}
				pop.checkAutoHeight();
			},
			flags: () => !i || i == 1 && this.expandable ? MF_STRING : MF_GRAYED,
			separator: () => i == 1 && this.show_context && !ppt.settingsShow && !ppt.searchShow && !ppt.filterShow,
			hide: () => !this.validItem || panel.imgView
		}));

		menu.newMenu({menuName: 'Settings', hide: () => !this.show_context || ui.style.topBarShow});

		const mainMenu = () => this.show_context ? 'Settings' : 'baseMenu';

		menu.newMenu({menuName: 'Views', appendTo: () => mainMenu(), separator: true});
		panel.menu.forEach((v, i) => menu.newItem({
			menuName: 'Views',
			str: v,
			func: () => this.setView(i),
			checkRadio: () => i == ppt.viewBy,
			separator: i > panel.menu.length - 3
		}));

		menu.newItem({
			menuName: 'Views',
			str: 'Configure views...',
			func: () => panel.open('views')
		});

		menu.newMenu({menuName: 'Album art', appendTo: () => mainMenu(), hide: () => !panel.imgView});
		['Front', 'Back', 'Disc', 'Icon', 'Artist', 'Group: auto', 'Group: top level', 'Group: two levels', 'Configure album art...'].forEach((v, i) => menu.newItem({
			menuName: 'Album art',
			str: v,
			func: () => this.setAlbumart(i),
			flags: () => i != 9 || this.items.Count ? MF_STRING : MF_GRAYED,
			checkRadio: () => i == ppt.artId || i - 5 == ppt.albumArtGrpLevel,
			separator: i == 4 || i == 7
		}));

		menu.newMenu({menuName: 'Quick setup', appendTo: () => mainMenu()});
		['Traditional...', 'Modern...', 'Ultra-Modern...', 'List view'].forEach((v, i) => menu.newItem({
			menuName: 'Quick setup',
			str: v,
			func: () => panel.set('quickSetup', i),
			flags: () => i != 9 || this.items.Count ? MF_STRING : MF_GRAYED,
			separator: i == 2
		}));

		['List view + album covers', 'List view + artist photos', 'Album covers', 'Flow mode', 'Always load preset with current \'view\' pattern'].forEach((v, i) => menu.newItem({
			menuName: 'Quick setup',
			str: v,
			func: () => panel.set('quickSetup', i + 4),
			checkItem: () => i == 4 && ppt.presetLoadCurView,
			separator: i == 1 || i == 2 || i == 3,
			hide: () => !ppt.albumArtOptionsShow
		}));

		menu.newMenu({menuName: 'Source', appendTo: () => mainMenu(), separator: true});
		['Library', 'Panel', 'Playlist'].forEach((v, i) => menu.newItem({
			menuName: 'Source',
			str: v,
			func: () => this.setSource(i),
			checkRadio: () => i == (ppt.libSource - 1 < 0 || ppt.fixedPlaylist ? 2 : ppt.libSource - 1),
			separator: i == 2
		}));

		menu.newMenu({menuName: 'Select playlist', appendTo: 'Source'});
		menu.newItem({
			menuName: 'Select playlist',
			str: 'Active playlist',
			func: () => {
				ppt.libSource = 0;
				ppt.fixedPlaylist = false;
				if (panel.imgView) img.clearCache();
				lib.searchCache = {};
				lib.treeState(false, 2);
			},
			checkRadio: () => ppt.libSource == 0,
			separator: true
		});

		const pl_no = Math.ceil(this.pl.length / 30);
		const pl_name = j => {
			let fixedPlaylistIndex = -1;
			if (ppt.fixedPlaylist) fixedPlaylistIndex = plman.FindPlaylist(ppt.fixedPlaylistName);
			return '# ' + (j * 30 + 1 + ' - ' + Math.min(this.pl.length, 30 + j * 30) + (30 + j * 30 > fixedPlaylistIndex && ((j * 30) - 1) < fixedPlaylistIndex ? '  >>>' : ''));
		}

		for (let j = 0; j < pl_no; j++) {
			menu.newMenu({menuName: () => pl_name(j), appendTo: 'Select playlist'});
			for (let i = j * 30; i < Math.min(this.pl.length, 30 + j * 30); i++) {
				menu.newItem({
					menuName: () => pl_name(j),
					str: this.pl[i].menuName,
					func: () => {
						ppt.fixedPlaylistName = this.pl[i].name;
						ppt.fixedPlaylist = true;
						ppt.libSource = 1;
						if (panel.imgView) img.clearCache();
						lib.searchCache = {};
						lib.treeState(false, 2);
					},
					checkRadio: () => {
						let fixedPlaylistIndex = -1;
						if (ppt.fixedPlaylist) fixedPlaylistIndex = plman.FindPlaylist(ppt.fixedPlaylistName);
						return i == fixedPlaylistIndex;

					}
				});
			}
		}

		menu.newMenu({menuName: 'Refresh', appendTo: () => mainMenu(), separator: true});
		for (let i = 0; i < 5; i++) menu.newItem({
			menuName: 'Refresh',
			str: () => [this.items.Count ? 'Refresh selected images...' : 'Refresh images: none selected', 'Refresh all images...', 'Reset zoom...', 'Refresh library...', 'Reload...'][i],
			func: () => this.setMode(i),
			flags: () => panel.imgView && !i && this.items.Count || !panel.imgView || i ? MF_STRING : MF_GRAYED,
			separator: () => i == 1 && panel.imgView,
			hide: () => i < 2 && !panel.imgView || i == 3 && ppt.libAutoSync
		});

		['Options...', 'Panel properties...', 'Configure...'].forEach((v, i) => menu.newItem({
			menuName: () => mainMenu(),
			str: v,
			func: () => {
				switch (i) {
					case 0:
						panel.open();
						break;
					case 1:
						window.ShowProperties();
						break;
					case 2:
						window.EditScript();
						break;
				}
			},
			separator: () => !i && vk.k('shift'),
			hide: () => i && !vk.k('shift') || !this.settingsBtnDn && ppt.settingsShow && this.validItem
		}));
	}

	filterMenu() {
		fMenu.newMenu({});
		for (let i = 0; i < panel.filter.menu.length + 1; i++) fMenu.newItem({
			str: () => i != panel.filter.menu.length ? (!i ? 'No filter' : panel.filter.menu[i]) : 'Always reset scroll',
			func: () => {
				this.filter_dn = false;
				panel.set('Filter', i)
			},
			checkItem: () => i == panel.filter.menu.length && ppt.reset,
			checkRadio: () => i == ppt.filterBy && i < panel.filter.menu.length,
			separator: () => !i || i == panel.filter.menu.length - 1 || i == panel.filter.menu.length
		});
		fMenu.newItem({
			str: 'Configure filters...',
			func: () => panel.open('filters'),
		});
	}

	searchMenu() {
		searchMenu.newMenu({});
		['Copy', 'Cut', 'Paste'].forEach((v, i) => searchMenu.newItem({
			str: v,
			func: () => {
				switch (i) {
					case 0:
						search.on_char(vk.copy);
						break;
					case 1:
						search.on_char(vk.cut);
						break;
					case 2:
						search.on_char(vk.paste, true);
						break;
				}
			},
			flags: () => search.start == search.end && i < 2 || i == 2 && !search.paste ? MF_GRAYED : MF_STRING,
			separator: i == 1
		}));
	}

	loadView(clearCache, view, sel) {
		ui.getColours();
		sbar.setCol();
		but.createImages();
		if (clearCache) img.clearCache();
		if (sel !== undefined) {
			const handle = sel >= panel.list.Count ? null : panel.list[sel];
			panel.set('view', view, true);
			if (handle) {
				const item = panel.list.Find(handle);
				let idx = -1;
				pop.tree.forEach((v, i) => {
					if (pop.inRange(item, v.item)) idx = i;
				});
				if (idx != -1) {
					if (!panel.imgView) pop.focusShow(idx);
					else pop.showItem(idx, 'focus');
				}
			}
		} else panel.set('view', view, true);
		but.refresh(true);
	}

	playlists_changed(init) {
		this.pl = [];
		for (let i = 0; i < plman.PlaylistCount; i++) this.pl.push({
			menuName: plman.GetPlaylistName(i).replace(/&/g, '&&'),
			name: plman.GetPlaylistName(i),
			ix: i
		});
		if (!init) this.refreshMainMenu();
	}

	refreshFilterMenu() {
		fMenu = new MenuManager;
		this.filterMenu();
	}

	refreshMainMenu() {
		menu = new MenuManager;
		this.mainMenu();
	}

	rbtn_up(x, y, settingsBtnDn) {
		this.r_up = true;
		this.expandable = false;
		this.items = new FbMetadbHandleList();
		this.ix = pop.get_ix(x, y, true, false);
		this.nm = '';
		this.settingsBtnDn = settingsBtnDn;
		this.show_context = false;

		let item = pop.tree[this.ix];
		let row = -1;
		const tr = pop.tree.length > this.ix && this.ix != -1 ? !pop.inlineRoot ? item.tr : Math.max(item.tr - 1, 0) : -1;

		this.validItem = this.settingsBtnDn ? false : !panel.imgView ? y < panel.tree.y + pop.rows * sbar.row.h && pop.tree.length > this.ix && this.ix != -1 && (x < Math.round(ppt.treeIndent * tr) + ui.icon.w + ppt.margin && (!item.track || item.root) || pop.check_ix(item, x, y, true)) : pop.tree.length > this.ix && this.ix != -1;

		if (!this.validItem && !this.settingsBtnDn && ppt.settingsShow && y > panel.search.sp) {
			this.ix = pop.row.i != -1 ? pop.row.i : !panel.imgView ? pop.tree.length - 1 : -1;
			if (this.ix < pop.tree.length && this.ix != -1) {
				item = pop.tree[this.ix];
				this.validItem = true;
			}
		}

		if (this.validItem) {
			if (!item.sel) {
				pop.clearSelected();
				item.sel = true;
			}
			pop.getTreeSel();
			this.expandable = pop.trackCount(pop.tree[this.ix].item) > this.treeExpandLimit || pop.tree[this.ix].track || panel.imgView ? false : true;
			if (this.expandable && pop.tree.length) {
				let count = 0;
				pop.tree.forEach((v, m, arr) => {
					if (m == this.ix || v.sel) {
						if (row == -1 || m < row) {
							row = m;
							this.nm = (v.tr ? arr[v.par].srt[0] : '') + v.srt[0];
							this.nm = this.nm.toUpperCase();
						}
						count += pop.trackCount(v.item);
						this.expandable = count <= this.treeExpandLimit;
					}
				});
			}
			this.items = pop.getHandleList();
			this.show_context = true;
		} else this.items = pop.getHandleList('newItems');

		if (this.settingsBtnDn) this.settings_dn = false;

		menu.load(x, y);
		this.r_up = false;
	}

	setAlbumart(i) {
		let clearCache = false;
		switch (i) {
			case 0:
			case 1:
			case 2:
			case 3:
			case 4:
				ppt.artId = i;
				break;
			case 5:
			case 6:
			case 7:
				ppt.albumArtGrpLevel = i - 5;
				break;
			case 8:
				panel.open('albumArt');
				break;
		}
		this.loadView(clearCache, ppt.albumArtViewBy);
	}

	setMode(i) {
		switch (i) {
			case 0:
				img.refresh(this.items);
				break;
			case 1:
				img.refresh('all');
				break;
			case 2:
				panel.zoomReset();
				break;
			case 3:
				lib.treeState(false, 2);
				break;
			case 4:
				window.Reload();
				break;
		}
	}

	setPlaylist(i) {
		switch (i) {
			case 0:
				pop.load(pop.sel_items, true, false, pop.autoPlay.send, false, false);
				panel.treePaint();
				lib.treeState(false, ppt.rememberTree);
				break;
			case 1:
				pop.load(pop.sel_items, true, true, false, false, false);
				lib.treeState(false, ppt.rememberTree);
				break;
			case 2:
				pop.sendToNewPlaylist();
				panel.treePaint();
				lib.treeState(false, ppt.rememberTree);
				break;
			case 3:
				pop.nowPlayingShow();
				break;
			case 4:
				lib.logTree();
				pop.clearTree();
				ppt.toggle('albumArtShow');
				panel.imgView = ppt.albumArtShow;
				this.loadView(false, !panel.imgView ? (ppt.artTreeSameView ? ppt.viewBy : ppt.treeViewBy) : (ppt.artTreeSameView ? ppt.viewBy : ppt.albumArtViewBy), pop.sel_items[0]);
				break;
		}
	}

	setSource(i) {
		switch (i) {
			case 0:
				ppt.libSource = 1;
				ppt.fixedPlaylist = false;
				break;
			case 1:
				ppt.libSource = 2;
				ppt.fixedPlaylist = false;
				if (ppt.panelSourceMsg) popUpBox.message();
				break;
			case 2:
				ppt.libSource = ppt.fixedPlaylist ? 1 : 0;
				if (ppt.panelSourceMsg) popUpBox.message();
				break;
		}
		if (panel.imgView) img.clearCache();
		lib.searchCache = {};
		lib.treeState(false, 2);
	}

	setView(i) {
		if (i < panel.menu.length) {
			if (ppt.artTreeSameView) {
				ppt.treeViewBy = i;
				ppt.albumArtViewBy = i;
			} else {
				if (!panel.imgView) ppt.treeViewBy = i;
				else ppt.albumArtViewBy = i;
				if (ppt.treeViewBy != ppt.albumArtViewBy) ppt.set(panel.imgView ? 'Tree' : 'Tree Image', null);
			}
			panel.set('view', i);
		}
	}
}