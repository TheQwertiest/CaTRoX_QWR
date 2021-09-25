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

		const idx = this.menu[this.baseMenu].TrackPopupMenu(x, y);
		this.run(idx);

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
let bMenu = new MenuManager;
let pMenu = new MenuManager;
let yMenu = new MenuManager;
let mMenu = new MenuManager;
let dMenu = new MenuManager;
let sMenu = new MenuManager;
let filterMenu = new MenuManager;
let searchMenu = new MenuManager;

class MenuItems {
	constructor() {
		const chartDate = ppt.chartDate.toString();
		this.handleList = new FbMetadbHandleList();
		this.item = null;
		this.lastLoad = -1;
		this.djOn;
		this.right_up = false;

		this.chart = {
			day: parseInt(chartDate.slice(6)),
			month: parseInt(chartDate.slice(4, 6)),
			year: parseInt(chartDate.slice(0, 4))
		}

		this.flags = {
			load: [],
			loadTracks: [],
			mTags: [],
			save: []
		}

		this.img = {
			artist: '',
			artistClean: '',
			blacklist: [],
			blacklistStr: [],
			isLfm: true,
			list: [],
			name: ''
		}

		this.name = {
			art: '',
			artist: '',
			artis: '',
			artist_title: '',
			dj: [],
			str: []
		}

		this.path = {
			img: false,
			imgBlackList: '',
			vidBlackList: ''
		}

		this.str = {
			mTags: [],
			save: []
		}

		this.video = {
			blacklist: [],
			blacklistStr: [],
			id: '',
			list: [],
			title: ''
		}

		this.dayMenu();
		this.buttonMenu();
		this.filterMenu();
		this.loadnPlayMenu();
		this.monthMenu();
		this.searchMenu();
		this.siteMenu();
		this.yearMenu();
	}

	// Methods

	mainMenu() {
		menu.newMenu({});
		menu.newItem({
			str: 'Cancel auto DJ search',
			func: () => dj.cancel(),
			separator: true,
			hide: () => !(ppt.djMode == 2 && (dj.search || timer.sim1.id || timer.sim2.id))
		});

		menu.newItem({
			str: ppt.showAlb ? 'Show nowplaying' : 'Show albums && tracks',
			func: () => {
				alb.toggle('show');
				but.setBtnsHide();
				alb_scrollbar.resetAuto();
				art_scrollbar.resetAuto();
				if (ppt.showAlb || ui.style.textOnly && !ui.style.isBlur) txt.paint();
				else img.paint();
			},
			separator: true,
			hide: ppt.btn_mode
		});

		menu.newMenu({menuName: this.getNewSelectionMenu()});
		for (let i = 0; i < 4; i++) menu.newItem({
			menuName: this.getNewSelectionMenu(),
			str: this.name.str[i],
			func: () => this.setAutoDJ(i),
			flags: this.name.str[i].endsWith(' N/A') ? MF_GRAYED : MF_STRING,
			separator: i == 3
		});

		menu.newItem({
			menuName: this.getNewSelectionMenu(),
			str: 'Select artist...',
			func: () => this.setAutoDJ(4)
		});

		menu.newMenu({ menuName: 'Select decade...', appendTo: this.getNewSelectionMenu()});
		txt.decadesMenu.forEach((v, i) => menu.newItem({
			menuName: 'Select decade...',
			str: ppt.longDecadesFormat ? v.tag2 : v.tag1,
			func: () => this.setDecade(i),
			separator: i == txt.decadesMenu.length - 1
		}));

		['10s Style', '2010s style'].forEach((v, i) => menu.newItem({
			menuName: 'Select decade...',
			str: v,
			func: () => this.setDecade(txt.decadesMenu.length + i),
			checkRadio: i == ppt.longDecadesFormat
		}));

		menu.newMenu({menuName: 'Select genre...', appendTo: this.getNewSelectionMenu()});
		txt.genreMenu.forEach((v, i, arr) => menu.newItem({
			menuName: 'Select genre...',
			str: v,
			func: () => this.setTopTags(i + 1),
			flags: i < arr.length - 1 ? MF_STRING : MF_GRAYED,
			separator: i == arr.length - 2
		}));

		['Select similar artists...', 'Select similar song...'].forEach((v, i) => menu.newItem({
			menuName: this.getNewSelectionMenu(),
			str: v,
			func: () => this.setAutoDJ(i + 6),
			separator: i == 1
		}));

		menu.newItem({
			menuName: this.getNewSelectionMenu(),
			str: 'Open tag search...',
			func: () => this.setTopTags(0),
			separator: true,
			hide:ppt.djMode == 3
		});

		menu.newItem({
			menuName: this.getNewSelectionMenu(),
			str: 'Open query search...',
			func: () => this.setTopTags(0),
			separator: true,
			hide: ppt.djMode != 3
		});

		menu.newItem({
			menuName: this.getNewSelectionMenu(),
			str: 'Auto DJ',
			func: () => {
				ppt.playlistSoftMode = false;
				ppt.cur_dj_mode = ppt.last_cur_dj_mode;
				ppt.djOwnData = ppt.lastDjOwnData;
				ppt.djMode = ppt.lastDjMode;
				ppt.libDj = ppt.lastLibDj;
			},
			checkRadio: !ppt.playlistSoftMode
		});

		menu.newItem({
			menuName: this.getNewSelectionMenu(),
			str: 'Find tracks in library',
			func: () => {
				ppt.playlistSoftMode = true;
				ppt.last_cur_dj_mode = ppt.cur_dj_mode;
				ppt.lastDjOwnData = ppt.djOwnData;
				ppt.lastDjMode = ppt.djMode;
				ppt.lastLibDj = ppt.libDj;

				ppt.cur_dj_mode = ppt.findOwnData + 2;
				ppt.djOwnData = ppt.findOwnData;
				ppt.djMode = ppt.findOwnData + 2;
				ppt.libDj = 2;
			},
			checkRadio: ppt.playlistSoftMode,
			separator: true
		});


		menu.newMenu({menuName: () => this.trackMenuName(), appendTo: this.getNewSelectionMenu()});
		['Youtube tracks\tLast.fm data', 'Prefer library tracks\tLast.fm data', 'Library tracks\tLast.fm data', 'Library tracks\tOwn data', 'Configure Auto DJ...'].forEach((v, i) => menu.newItem({
			menuName: () => this.trackMenuName(),
			str: v,
			func: () => {
				if (i < 4) this.setDjMode(i);
				else panel.open('playlists');

			},
			checkRadio: i == ppt.libDj + ppt.djOwnData,
			separator: i == 2 || i == 3,
			hide: ppt.playlistSoftMode
		}));

		for (let i = 0; i < 5; i++) menu.newItem({
			menuName: () => this.trackMenuName(),
			str: ['Last.fm data', 'Own data', !ppt.findOwnData ? 'Sort by last.fm playcount' : 'Sort by ' + ['most played', 'highest rated', 'random'][ppt.sortAutoDJ], 'Random', 'Configure find...'][i],
			func: () => {
				if (i < 2) {
					ppt.findOwnData = i;
					this.setDjMode(i + 2);
				}
				if (i == 2) ppt.findRandomize = false;
				if (i == 3) ppt.findRandomize = true;
				if (i == 4) panel.open('playlists')
			},
			checkRadio: i < 2 && i == ppt.findOwnData || i > 1 && i - 2 == ppt.findRandomize,
			separator: i == 1 || i == 3,
			hide: !ppt.playlistSoftMode
		});

		menu.newMenu({menuName: 'Favourites...'});
		menu.newItem({
			menuName: 'Favourites...',
			str: 'None',
			hide: fav.stations.length
		});

		fav.stations.forEach((v, i) => menu.newItem({
			menuName: 'Favourites...',
			str: () => v.source.replace(/&/g, '&&') + (v.type == 2 ? ' And Similar Artists' : ''),
			func: () => this.setFavourites(i),
			checkRadio: () => {
				let djType = index.cur_dj_type;
				if (djType == 4) djType = 1 ;
				return this.djOn && index.cur_dj_source + (!index.cur_dj_query ? '' : ' [Query - ' + index.n[3] + index.nm[3] + ']') == v.source && djType == v.type
			},
			separator: i == fav.stations.length - 1,
			hide: !fav.stations.length
		}));

		menu.newItem({
			menuName: 'Favourites...',
			str: 'Auto favourites',
			func: () => this.setFavourites(fav.stations.length + 1),
			checkItem: ppt.autoFav,
			separator: !ppt.autoFav
		});

		['Add current', 'Remove current', 'reset'].forEach((v, i) => menu.newItem({
			menuName: 'Favourites...',
			str: v,
			func: () => this.setFavourites(fav.stations.length + 2 + i),
			hide: ppt.autoFav
		}));

		menu.newItem({separator: true});
		menu.newItem({
			str: 'Current auto DJ: ' + (!dj.search && index.cur_dj_source.length && this.djOn && !ppt.playTracks ? index.cur_dj_source ? index.cur_dj_source.replace(/&/g, '&&') + (index.cur_dj_type == 2 ? ' And Similar Artists (' : ' (') + index.n[index.cur_dj_mode] + ')' : 'None' : 'None'),
			separator: true,
			hide: !ppt.btn_mode
		});

		['Send to playlist\tClick', 'Add to playlist\tMiddle click', 'Search for full album\tCtrl+click', 'Reload from youtube\tShift+click', 'Remove from cache\tAlt+click', ''].forEach((v, i) => menu.newItem({
			str: i < 5 ? v : ppt.mb ? `Open MusicBrainz: ${alb.artist}...` : `Open Last.fm: ${alb.artist}...`,
			func: () => this.loadItem(i, panel.m.x, panel.m.y),
			flags: this.flags.load[i] ? MF_STRING : MF_GRAYED,
			separator: i == 1 || i == 2 || i == 4 || utils.IsKeyPressed(0x10) && i == 5 && ppt.mb != 2,
			hide: ppt.btn_mode || !ppt.showAlb || alb.type.active != 2 || i == 5 && (!utils.IsKeyPressed(0x10) || ppt.mb == 2) || !this.flags.load[i]
		}));

		['Send to playlist\tClick', 'Add to playlist\tMiddle click', 'Search for full album\tCtrl+click', 'Reload from youtube\tShift+click', 'Remove from cache\tAlt+click', ''].forEach((v, i) => menu.newItem({
			str: i < 5 ? v : ppt.mb ? `Open MusicBrainz: ${alb.artist}...` : `Open Last.fm: ${alb.artist}...`,
			func: () => this.loadItem(i, panel.m.x, panel.m.y),
			flags: this.flags.loadTracks[i] ? MF_STRING : MF_GRAYED,
			separator: i == 1 || i == 2 || i == 4 || utils.IsKeyPressed(0x10) && i == 5 && ppt.mb != 2,
			hide: ppt.btn_mode || !ppt.showAlb || alb.type.active != 1 || !alb.expanded || i == 5 && (!utils.IsKeyPressed(0x10) || ppt.mb == 2) || !this.flags.loadTracks[i]
		}));

		menu.newMenu({menuName: 'Create m-Tags album...'});
		menu.newItem({separator: true});
		for (let i = 0; i < 2; i++) menu.newItem({
			menuName: 'Create m-Tags album...',
			str: this.str.mTags[i],
			func: () => this.createMtags(i),
			flags: this.flags.mTags[i] ? MF_STRING : MF_GRAYED,
			separator: !i && !ppt.btn_mode,
			hide: !i && ppt.btn_mode
		});

		menu.newMenu({menuName: 'Playlists'});
		pl.enabled.forEach((v, i) => menu.newItem({
			menuName: 'Playlists',
			str: v.name.replace(/&/g, '&&'),
			func: () => this.setPlaylistEnabled(i),
			checkRadio: plman.ActivePlaylist == pl.enabled[i].ix,
			separator: pl.enabled.length ? i == pl.enabled.length - 1 : false
		}));

		const pl_no = Math.ceil(pl.menu.length / 30);
		for (let j = 0; j < pl_no; j++) {
			const n = '# ' + (j * 30 + 1 + ' - ' + Math.min(pl.menu.length, 30 + j * 30) + (30 + j * 30 > plman.ActivePlaylist && ((j * 30) - 1) < plman.ActivePlaylist ? '  >>>' : ''));
			menu.newMenu({menuName: n, appendTo: 'Playlists'});
			for (let i = j * 30; i < Math.min(pl.menu.length, 30 + j * 30); i++) menu.newItem({
				menuName: n,
				str: pl.menu[i].name,
				func: () => this.setPlaylist(i),
				checkRadio: i == plman.ActivePlaylist
			});
		}

		if (panel.youTube.backUp) {
			menu.newItem({
				menuName: 'Playlists',
				separator: true
			});

			for (let i = 0; i < 7; i++) menu.newItem({
				menuName: 'Playlists',
				str: this.str.save[i],
				func: () => this.setSave(i),
				flags: this.flags.save[i] ? MF_STRING : MF_GRAYED,
				checkItem: i == 1 && sv.trk == 1 || i == 2 && sv.trk == 2,
				separator: !i || i == 2 || i == 3 || i == 5,
			});
		}

		menu.newItem({separator: true});
		menu.newMenu({menuName: 'Love / Black list'});

		for (let i = 0; i < 4; i++) menu.newItem({
			menuName: 'Love / Black list',
			str: this.video.blacklistStr[i],
			func: () => this.setVideoBlacklist(i),
			flags: i == 1 && !this.yt_video ? MF_GRAYED : MF_STRING,
			separator: !i || i == (blk.undo[0] != this.name.artis /*noUndo*/ ? 2 : 3) && !this.video.blacklist.length && !ui.style.textOnly && !ppt.showAlb,
			hide: i == 3 && blk.undo[0] != this.name.artis
		});

		this.video.blacklist.forEach((v, i) => menu.newItem({
			menuName: 'Love / Black list',
			str: v.replace(/&/g, '&&'),
			func: () => this.setVideoBlacklist(i + (blk.undo[0] == this.name.artis ? 4 : 3)),
			separator: !ui.style.textOnly && !ppt.showAlb && i == this.video.blacklist.length - 1,
			hide: !this.video.blacklist.length
		}));

		for (let i = 0; i < 3; i++) menu.newItem({
			menuName: 'Love / Black list',
			str: this.img.blacklistStr[i],
			func: () => this.setImageBlacklist(i),
			flags: !i && this.img.isLfm || i == 2 ? MF_STRING : MF_GRAYED,
			hide: ui.style.textOnly || ppt.showAlb || i == 2 && img.blackList.undo[0] != this.img.artistClean
		});

		this.img.blacklist.forEach((v, i) => menu.newItem({
			menuName: 'Love / Black list',
			str: (this.img.artist + '_' + v).replace(/&/g, '&&'),
			func: () => this.setImageBlacklist(i + (img.blackList.undo[0] == this.img.artistClean ? 3 : 2)),
			hide: ui.style.textOnly || ppt.showAlb
		}));

		menu.newItem({separator: true});
		menu.newMenu({menuName: 'Display mode', hide: panel.video.mode || alb.art.search});
		menu.newMenu({
			menuName: 'Display mode: N/A in video or search mode',
			flags: MF_GRAYED,
			hide: !panel.video.mode && !alb.art.search
		});

		for (let i = 0; i < 2; i++) menu.newItem({
			menuName: 'Display mode',
			str: ['Prefer nowplaying', 'Follow selected track (playlist)' + (panel.video.mode || alb.art.search ? ': N/A in video or search mode' : '')][i],
			func: () => {
				ppt.toggle('focus');
				on_item_focus_change()
			},
			flags: !i || !panel.video.mode && !alb.art.search ? MF_STRING : MF_GRAYED,
			checkRadio: i == !ppt.focus || panel.video.mode ? 0 : 1
		});

		menu.newItem({separator: true});
		['Options...', 'Panel properties...', 'Configure...'].forEach((v, i) => menu.newItem({
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
			separator: !i && utils.IsKeyPressed(0x10),
			hide: i && !utils.IsKeyPressed(0x10)
		}));
	}

	buttonMenu() {
		bMenu.newMenu({});

		bMenu.newMenu({menuName: 'Track source'});
		['Youtube', 'Prefer library', 'Library'].forEach((v, i) => bMenu.newItem({
			menuName: 'Track source',
			str: v,
			func: () => {
				ppt.libAlb = i;
				alb.reset();
			},
			checkRadio: () => i == ppt.libAlb
		}));

		bMenu.newItem({separator: true});
		bMenu.newMenu({menuName: 'Album track list'});
		['Prefer last.fm', 'Prefer musicbrainz', 'Library albums use library track list']
		.forEach((v, i) => bMenu.newItem({
			menuName: 'Album track list',
			str: v,
			func: () => {
				ppt.prefMbTracks = i;
				alb.changeTrackSource();
				txt.paint();
			},
			flags: i != 2 ? MF_STRING : MF_GRAYED,
			checkRadio: () => i == ppt.prefMbTracks,
			separator: i == 1
		}));

		bMenu.newItem({separator: true});
		bMenu.newMenu({menuName: 'Sort'});
		for (let i = 0; i < 3; i++) bMenu.newItem({
			menuName: 'Sort',
			str: () => ['Musicbrainz "All" releases: include "Live" + "Other"', 'Musicbrainz "All" releases: group', 'Last.fm sorted by last.fm rank (listeners)'][i],
			func: () => alb.toggle(['showLive', 'mbGroup', 'lfmSortPC'][i]),
			checkItem: () => [ppt.showLive, ppt.mbGroup, !ppt.lfmSortPC][i],
			separator: i == 1
		});

		bMenu.newItem({separator: true});
		for (let i = 0; i < 3; i++) bMenu.newItem({
			str: () => ['Show List Search', ppt.showArtists ? 'Hide artists' : 'Show artists', 'Options...'][i],
			func: () => {
				switch (i) {
					case 0:
						ppt.toggle('searchShow');
						filter.clear();
						break;
					case 1:
						alb.toggle('showArtists');
						break;
					case 2:
						panel.open();
						break;
				}
			},
			checkItem: () => !i && ppt.searchShow,
			separator: true
		});

		bMenu.newMenu({
			menuName: 'Refresh'
		});
		['Reset zoom', 'Reload'].forEach((v, i) => bMenu.newItem({
			menuName: 'Refresh',
			str: v,
			func: () => {!i ? but.resetZoom() : window.Reload();},
		}));
	}

	dayMenu() {
		const days = this.daysInMonth(this.chart.month, this.chart.year);
		dMenu.newMenu({});
		for (let i = 0; i < days; i++) dMenu.newItem({
			str: $.padNumber(i + 1, 2),
			func: () => this.setDay(i),
			checkRadio: () => i == Math.min(days, this.chart.day) - 1
		});
	}

	filterMenu() {
		filterMenu.newMenu({});
		['Copy', 'Cut', 'Paste'].forEach((v, i) => filterMenu.newItem({
			str: v,
			func: () => {
				switch (i) {
					case 0:
						filter.on_char(vk.copy);
						break;
					case 1:
						filter.on_char(vk.cut);
						break;
					case 2:
						filter.on_char(vk.paste, true);
						break;
				}
			},
			flags: () => filter.start == filter.end && i < 2 || i == 2 && !filter.paste ? MF_GRAYED : MF_STRING,
			separator: i == 1
		}));
	}

	loadnPlayMenu() {
		pMenu.newMenu({});
		for (let i = 0; i < 5; i++) pMenu.newItem({
			str: () => {
				const numberTopTracks = [10, 20, 30, 40, 50, 75, 100][ppt.topTracksIX];
				return ppt.mb != 2 ? ['Load:', alb.isAlbum() ? 'Local album tracks' : 'Local top tracks', 'Top ' + numberTopTracks + ' tracks', 'Top ' + numberTopTracks + ' tracks: reverse', 'Top ' + numberTopTracks + ' tracks: shuffle'][i] : ['Load:', 'Local chart tacks', 'Top ' + numberTopTracks + ' tracks', 'Top ' + numberTopTracks + ' tracks: reverse', 'Top ' + numberTopTracks + ' tracks: shuffle'][i]
			},
			func: () => this.loadnPlay(i),
			flags: () => {
				return !i || i == 1 && alb.handleList.Count || i > 1 && alb.topTracksAvailable ? MF_STRING : MF_GRAYED
			},
			separator: () => {
				return !i || !alb.isAlbum() && (i == 1 || i == 4);
			},
			hide: () => alb.isAlbum() && i > 1
		});

		pMenu.newMenu({menuName: 'Change number of tracks', flags: () => alb.topTracksAvailable ? MF_STRING : MF_GRAYED, hide: () => alb.isAlbum()});
		for (let i = 0; i < 9; i++) pMenu.newItem({
			menuName: 'Change number of tracks',
			str: () => ['10', '20', '30', '40', '50', '75', '100', 'Initially ' + Math.max(ppt.djPlaylistLimit, 5) + ' tracks are loaded to save youtube quota', 'Load optimised for speed - order might not be exact'][i],
			func: () => ppt.topTracksIX = i,
			flags: i < 7 ? MF_STRING : MF_GRAYED,
			checkRadio: () => i == ppt.topTracksIX,
			separator: i == 3 || i == 6
		});

		pMenu.newItem({separator: () => this.lastLoad != -1});
		pMenu.newItem({str: () => this.lastLoad, hide: () => this.lastLoad == -1});
	}

	monthMenu() {
		mMenu.newMenu({});
		for (let i = 0; i < 12; i++) mMenu.newItem({
			str: $.padNumber(i + 1, 2),
			func: () => this.setMonth(i),
			checkRadio: () => i == this.chart.month - 1
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

	siteMenu() {
		sMenu.newMenu({});
		['Last.fm', 'Musicbrainz', 'Official charts'].forEach((v, i) => sMenu.newItem({
			str: v,
			func: () => {
				ppt.mb = i;
				alb.toggle('mode');
				if (ppt.logoText) but.btns.mode.w = (!ui.style.isBlur ? 71 : ppt.mb ? 74 : 46) * but.scale;
				but.setBtnsHide();
				filter.metrics();
			},
			checkRadio: () => i == ppt.mb
		}));
	}

	yearMenu() {
		const today = new Date();
		const year = today.getFullYear();
		const years = year - 1952 + 1;
		yMenu.newMenu({});
		for (let i = 0; i < years; i++) yMenu.newItem({
			str: i + 1952,
			func: () => this.setYear(i),
			flags: i == 25 || i == 50 ? MF_STRING | 0x00000040 : MF_STRING,
			checkRadio: () => i == this.chart.year - 1952
		});
	}

	trackMenuName() {
		return 'Type: ' + (!ppt.playlistSoftMode ? ['youtube', 'prefer library', 'library', 'library'][ppt.libDj + ppt.djOwnData] + ' tracks ' + ['', '', '', ' [own data]'][ppt.libDj + ppt.djOwnData] : ['last.fm', 'own'][ppt.findOwnData] + ' data');
	}

	createMtags(i) {
		switch (i) {
			case 0:
				if (alb.libraryTest(this.item.artist, this.item.title)) return;
				alb.load(panel.m.x, panel.m.y, !utils.IsKeyPressed(0x11) ? 'mTagsAlbum' : 'mTagsFullAlbum', false, 2);
				break;
			case 1:
				mtags.createFromSelection(this.handleList, plman.ActivePlaylist);
				break;
		}
	}

	daysInMonth(month, year) {
		return new Date(year, month, 0).getDate();
	}

	getAutoDJItems() {
		this.name.art = name.art();
		this.name.artist_title = name.artist_title();
		this.name.artist = name.artist(); 
		this.djOn = dj.on() || ppt.autoRad && plman.PlayingPlaylist == pl.getDJ();

		for (let i = 0; i < 4; i++) {
			let available = false;
			this.name.dj[i] = (i == 0 || i == 2) ? (this.name.artist ? this.name.artist : 'N/A') : i == 1 ? name.genre() : this.name.artist_title;
	
			if (ppt.useSaved) {
				const djSource = $.clean(this.name.dj[i]);
				available =
					$.file(dj.f2 + djSource.substr(0, 1).toLowerCase() + '\\' + djSource + (i < 2 ? '.json' : i == 2 ? ' And Similar Artists.json' : i == 3 ? ' [Similar Songs].json' : ' - Top Artists.json')) ||
					$.file(dj.f2 + djSource.substr(0, 1).toLowerCase() + '\\' + djSource + ' [curr]' + (i < 2 ? '.json' : i == 2 ? ' And Similar Artists.json' : i == 3 ? ' [Similar Songs].json' : ' - Top Artists.json'))
			}

			this.name.dj[i] = ppt.useSaved && !available ? 'N/A' : this.name.dj[i];
			const na_arr = ['Artist ', 'Genre ', 'Similar Artists ', 'Similar Songs '];
			this.name.str[i] = this.name.dj[i] == 'N/A' ? na_arr[i] + (ppt.useSaved ? '- Saved N/A' : 'N/A') : this.name.dj[i].replace(/&/g, '&&') + (i == 2 ? ' And Similar Artists' : '');
		}
	}

	getBlacklistImageItems() {
		const imgInfo = img.pth();
		this.img.artist = imgInfo.artist;
		this.path.img = imgInfo.imgPth;
		this.img.isLfm = imgInfo.blk && this.path.img;
		this.img.name = this.img.isLfm ? this.path.img.slice(this.path.img.lastIndexOf('_') + 1) : this.path.img.slice(this.path.img.lastIndexOf('\\') + 1);
		this.img.blacklist = [];
		this.path.imgBlackList = `${panel.yttm}blacklist_image.json`;

		if (!$.file(this.path.imgBlackList)) $.save(this.path.imgBlackList, JSON.stringify({
			'blacklist': {}
		}), true);

		if ($.file(this.path.imgBlackList)) {
			this.img.artistClean = $.clean(this.img.artist).toLowerCase();
			this.img.list = $.jsonParse(this.path.imgBlackList, false, 'file');
			this.img.blacklist = this.img.list.blacklist[this.img.artistClean] || [];
		}

		this.img.blacklistStr = [this.img.isLfm ? '+ Add to image black List: ' + this.img.artist + '_' + this.img.name : '+ Add to image black List: ' + (this.img.name ? 'N/A - requires last.fm artist image. Selected image : ' + this.img.name : 'N/A - no image file'), this.img.blacklist.length ? ' - Remove from black List (click name): ' : 'No black listed images for current artist', 'Undo'];
	}

	getBlacklistVideoItems() {
		this.video.blacklist = [];
		const valid = plman.GetPlayingItemLocation().IsValid;
		const pl_loved = plman.FindPlaylist(ppt.playlistLoved) == (fb.IsPlaying && valid ? plman.PlayingPlaylist : plman.ActivePlaylist) ? true : false;

		this.yt_video = panel.isYtVideo(false);
		this.path.vidBlackList = `${panel.yttm}blacklist_video.json`;

		if (!$.file(this.path.vidBlackList)) $.save(this.path.vidBlackList, JSON.stringify({
			'blacklist': {}
		}), true);

		this.name.artist_title = name.artist_title();
		this.name.artist = name.artist(); // needed here on init

		if ($.file(this.path.vidBlackList)) {
			this.name.artis = $.tidy(this.name.artist);
			this.video.list = $.jsonParse(this.path.vidBlackList, false, 'file');
			if (this.video.list.blacklist[this.name.artis]) this.video.list.blacklist[this.name.artis].forEach(v => this.video.blacklist.push((v.title + ' [' + v.id.slice(2) + ']').replace(/&/g, '&&')));
		}

		if (this.yt_video) {
			if (!$.eval('%path%').includes('.tags')) {
				this.video.title = $.eval('[%fy_title%]');
				this.video.id = $.eval('[%path%]').slice(-13);
			} else {
				this.video.title = $.eval('[%youtube_title%]');
				const inf = $.eval('[$info(@REFERENCED_FILE)]');
				this.video.id = inf.indexOf('v=');
				this.video.id = inf.slice(this.video.id, this.video.id + 13);
			}
	
			if (!this.video.title) this.video.title = this.name.artist_title.replace(' | ', ' - ');
		}

		this.video.blacklistStr = [(pl_loved ? '\u2661 Unlove' : '\u2665 Add to loved playlist') + (panel.isRadio() ? '' : ': ' + ((name.artist(pl_loved ? !valid : false) ? name.artist(pl_loved ? !valid : false) + ' | ' : '') + name.title(pl_loved ? !valid : false)).replace(/&/g, '&&')), '+ Add to video black List: ' + (this.yt_video ? this.video.title ? this.video.title.replace(/&/g, '&&') + ' [' + this.video.id.slice(2) + ']' : 'N/A - youtube source: title missing' : 'N/A - track not a youtube video'), this.video.blacklist.length ? blk.remove ? ' - Remove from black list (click title  | click here to view): ' : 'View (click title | click here to remove): ' : 'No black listed videos for current artist', 'Undo'];
	}

	getMTagsItems(x, y) {
		this.item = null;
		let valid = false;

		if (alb.isAlbum()) {
			const trace = x > alb.x + alb.icon_w;
			if (alb.type.active == 2) {
				const ix = alb.get_ix(x, y);
				valid = ix != -1 && ix < alb.names.list.length && trace;
				if (valid) this.item = alb.names.list[ix];
			}
		}

		if (ppt.mtagsInstalled) this.handleList = plman.GetPlaylistSelectedItems(plman.ActivePlaylist);
		const available = ppt.mtagsInstalled && this.handleList.Count;
		const ok = this.item && this.item.artist && this.item.title;
		this.flags.mTags = [ok, available];

		this.str.mTags = [ok ? this.item.artist + ' - ' + this.item.title + ' [' + [' Youtube tracks', ' Prefer library tracks', ' Library tracks'][ppt.libAlb] + (!utils.IsKeyPressed(0x11) ? ']' : '] ( full album)') + '...' : 'N/A: no album selected', this.handleList.Count ? 'From playlist selection...' : 'N/A: no playlist items selected'];
	}

	getLoadItems(x, y) {
		const drawExpand = ppt.mb == 1 || !ppt.mb && !ppt.lfmReleaseType;
		const ix = alb.get_ix(x, y);

		const trace = x > alb.x + (drawExpand ? alb.icon_w : 0);
		const valid = ix != -1 && ix < alb.names.list.length && trace;
		const item = valid ? alb.names.list[ix] : null;

		this.flags.load = [false, false, false, false, false, false];

		let yt1 = '';
		let yt2 = '';
		let album = false;

		if (item) {
			yt1 = item.source == 2;
			yt2 = item.source == 1 || item.source == 2 || item.source == 3;
			album = !ppt.mb && ppt.lfmReleaseType == 0 || ppt.mb == 1 && (ppt.mbReleaseType == 1 || ppt.mbReleaseType == 2);

			this.flags.load = [valid, valid, valid && yt2 && album, valid && yt1, valid && yt1, ppt.mb ? (alb.ar_mbid ? true : false) : alb.artist ? true : false];
		}
	}

	getLoadTrackItems(x, y) {
		const ix = alb.get_ix(x, y);
		const valid = ix != -1 && alb.expanded && ix < alb.artists.list.length;
		const item = valid ? alb.artists.list[ix] : null;

		this.flags.loadTracks = [false, false, false, false, false, false];

		let yt1 = '';
		let yt2 = '';
		let album = false;
		let ismTags = false;

		if (item) {
			yt1 = item.source == 2;
			yt2 = item.source == 1 || item.source == 2;
			album = false;
			ismTags = item.handleList && item.handleList.Count && item.handleList[0].Path.endsWith('!!.tags');

			this.flags.loadTracks = [valid, valid, valid && yt2 && album, valid && yt1, valid && yt1, ppt.mb ? (alb.ar_mbid ? true : false) : alb.artist ? true : false];
		}
	}

	getNewSelectionMenu() {
		return !ppt.playlistSoftMode ? 'Auto DJ...' : 'Find tracks in library...';
	}

	loadItem(i, x, y) {
		i < 5 ? alb.load(x, y, i == 2 ? 0x0008 : i == 3 ? 0x0004 : i == 4 ? 'remove' : 0, i > 0 && i < 4 /*all add except send & remove*/ , 2) : alb.openSite();
	}

	loadnPlay(i) {
		const numberTopTracks = [10, 20, 30, 40, 50, 75, 100][ppt.topTracksIX];
		const n = ppt.mb != 2 ? ['Load:', 'local music', 'Top ' + numberTopTracks + ' tracks', 'Top ' + numberTopTracks + ' tracks: reverse', 'Top ' + numberTopTracks + ' tracks: shuffle'][i] : ['Load:', 'Local chart tracks', 'Top ' + numberTopTracks + ' tracks', 'Top ' + numberTopTracks + ' tracks: reverse', 'Top ' + numberTopTracks + ' tracks: shuffle'][i];

		if (i == 1) {
			alb.loadHandleList();
			this.lastLoad = 'Last load: ' + n + [': last.fm: ', ': musicbrainz: ', ': chart: '][ppt.mb] + search.releaseType().toLowerCase() + ' ' + search.text;
		} else {
			const numberTopTracks = [10, 20, 30, 40, 50, 75, 100][ppt.topTracksIX];
			alb.playlist = [];

			for (let j = 0; j < alb.names.list.length; j++) {
				const v = alb.names.list[j];
				if (v.source) alb.playlist.push({
					artist: v.artist,
					title: v.title
				});
				if (alb.playlist.length == numberTopTracks) break;
			}

			if (i == 3) alb.playlist.reverse()
			if (i == 4) alb.playlist = $.shuffle(alb.playlist);

			if (alb.playlist.length) {
				ppt.playTracksList = JSON.stringify(alb.playlist);
				dj.source = (ppt.mb != 2 ? 'Top tracks: ' : 'Chart: ') + search.text + '\n' + alb.playlist.length + ' track' + (alb.playlist.length > 1 ? 's' : '') + ['', '', '', ' (reverse order)', ' (shuffle)'][i];
				ppt.cur_dj_source = index.cur_dj_source = dj.source;
				dj.loadnPlay();
			}

			this.lastLoad = 'Last load: ' + ['last.fm: ', 'musicbrainz: ', 'chart: '][ppt.mb] + n + ': ' + search.text;
		}
	}

	rbtn_up(x, y) {
		this.right_up = true;
		this.getAutoDJItems();
		this.getLoadItems(x, y);
		this.getLoadTrackItems(x, y);
		this.getMTagsItems(x, y)
		this.getBlacklistVideoItems();
		if (!ui.style.textOnly) this.getBlacklistImageItems();

		if (panel.youTube.backUp) {
			let ytTrack = false;
			if (ppt.mtagsInstalled || panel.id.local) this.handleList = plman.GetPlaylistSelectedItems(plman.ActivePlaylist);
			const urls = tf.fy_url.EvalWithMetadbs(this.handleList);
			ytTrack = urls.some(v => v.replace(/[./\\]/g, '').includes('youtubecomwatch'));
			this.str.save = ['Auto save:', 'Youtube tracks: best audio', 'Youtube tracks: best video && audio', 'Selected:' + (!this.handleList.Count ? ' N/A: no playlist items selected' : ''), 'Youtube tracks: best audio...' + (!ytTrack && this.handleList.Count ? ' N/A: no youtube track selected' : ''), 'Youtube tracks: best video && audio...' + (!ytTrack && this.handleList.Count ? ' N/A: no youTube track selected' : ''), 'Youtube tracks: Cancel auto save'];
			this.flags.save = [false, true, true, false, ytTrack, ytTrack, sv.autoTimer || sv.audioTimer || sv.videoTimer];
		}

		this.refreshMainMenu();
		menu.load(x, y);
		this.right_up = false;
	}

	refreshMainMenu() {
		menu = new MenuManager;
		this.mainMenu();
	}

	setAutoDJ(i) {
		switch (true) {
			case i < 4:
				index.getAutoDj(this.name.dj[i], ppt.djMode, i == 1 && !ppt.genre_tracks ? 4 : i, ppt.lfm_variety, ppt.djRange);
				break;
			case i > 3 && i < 8: {
				const djType = i - 4;
				let djSource;
				const ok_callback = (status, input) => {
					if (status != 'cancel') {
						djSource = input;
					}
				}
				popUpBox.input('Select ' + (djType == 0 ? 'artist' : djType == 1 ? 'genre' : djType == 2 ? 'artist & similar artists' : 'similar song'), 'Type name of ' + ((djType == 0 || djType == 2) ? 'artist' : djType == 1 ? 'genre' : 'artist | title' + '\nUse pipe separator'), ok_callback, '', index.cur_dj_source);
				if (djSource) index.getAutoDj($.titlecase(djSource), ppt.djMode, djType == 1 && !ppt.genre_tracks ? 4 : djType, ppt.lfm_variety, ppt.djRange);
				break;
			}
		}
	}

	setBlacklistVideo() {
		if (this.video.list.blacklist[this.name.artis]) $.sort(this.video.list.blacklist[this.name.artis], 'title');
		blk.artist = '';
		$.save(this.path.vidBlackList, JSON.stringify({'blacklist': $.sortKeys(this.video.list.blacklist)}, null, 3), true);
	}

	setDay(i) {
		this.chart.day = i + 1;
		ppt.chartDate = parseInt([this.chart.year, $.padNumber(this.chart.month, 2), $.padNumber(this.chart.day, 2)].join(''));
		but.btns.day.p2 = $.padNumber(this.chart.day, 2);
		panel.clampChartDate();
		alb.chartDate = '';

		alb.getReleases('chart', 3);
	}

	setDecade(i) {
		if (i < txt.decadesMenu.length) {
			let djSource = txt.decadesMenu[i];
			if (ppt.djMode == 3) djSource = txt.decadesMenu[i].query;
			else djSource = ppt.longDecadesFormat ? txt.decadesMenu[i].tag2 : txt.decadesMenu[i].tag1;
			if (djSource) index.getAutoDj($.titlecase(djSource), ppt.djMode, 1, ppt.lfm_variety, ppt.djRange, false, ppt.djMode == 3 ? true : false);
		} else ppt.longDecadesFormat = ppt.longDecadesFormat == 0 ? 1 : 0;
	}

	setDjMode(i) {
		if (i < 4) {
			ppt.djMode = [1, 1, 2, 3][i];
			ppt.libDj = [0, 1, 2, 2][i];
		}
		ppt.configOwnData = ppt.djOwnData = i != 3 ? 0 : 1;
		lib.update.artists = true;
	}

	setFavourites(i) {
		if (fav.stations.length && i < fav.stations.length) {
			index.getAutoDj(fav.stations[i].source.replace(' [Query - ' + index.n[3] + index.nm[3] + ']', ''), ppt.djMode, fav.stations[i].type == 1 && !ppt.genre_tracks && !fav.stations[i].query ? 4 : fav.stations[i].type, ppt.lfm_variety, ppt.djRange, true, fav.stations[i].query);
		}
		if (i == fav.stations.length + 1) fav.toggle_auto(index.cur_dj_source);
		if (!ppt.autoFav) {
			if (i == fav.stations.length + 2) {
				fav.addCurrentStation(index.cur_dj_source);
				return;
			}
			if (i == fav.stations.length + 3) {
				fav.removeCurrentStation();
				return;
			}
			if (i == fav.stations.length + 4) {
				const continue_confirmation = (status, confirmed) => {
					if (confirmed) {
						fav.save('No Favourites');
						return;
					}
				}
				popUpBox.confirm('Reset list', 'This action removes all items from the list\n\nContinue?', 'Yes', 'No', continue_confirmation);
			}
		}
	}

	setImageBlacklist(i) {
		if (!i) {
			if (!this.img.list.blacklist[this.img.artistClean]) this.img.list.blacklist[this.img.artistClean] = [];
			this.img.list.blacklist[this.img.artistClean].push(this.img.name);
		} else if (img.blackList.undo[0] == this.img.artistClean && i == 2) {
			if (!this.img.list.blacklist[img.blackList.undo[0]]) this.img.list.blacklist[this.img.artistClean] = [];
			if (img.blackList.undo[1].length) this.img.list.blacklist[img.blackList.undo[0]].push(img.blackList.undo[1]);
			img.blackList.undo = [];
		} else {
			const bl_ind = i - (img.blackList.undo[0] == this.img.artistClean ? 3 : 2);
			img.blackList.undo = [this.img.artistClean, this.img.list.blacklist[this.img.artistClean][bl_ind]];
			this.img.list.blacklist[this.img.artistClean].splice(bl_ind, 1);
			$.removeNulls(this.img.list);
		}

		let bl = this.img.list.blacklist[this.img.artistClean];
		if (bl) this.img.list.blacklist[this.img.artistClean] = $.sort([...new Set(bl)]);
		img.blackList.artist = '';
		$.save(this.path.imgBlackList, JSON.stringify({'blacklist': $.sortKeys(this.img.list.blacklist)}, null, 3), true);

		img.chkArtImg();
		window.NotifyOthers('bio_blacklist', 'bio_blacklist');
	}

	setMonth(i) {
		this.chart.month = i + 1;
		ppt.chartDate = parseInt([this.chart.year, $.padNumber(this.chart.month, 2), $.padNumber(this.chart.day, 2)].join(''));
		but.btns.month.p2 = $.padNumber(this.chart.month, 2);
		panel.clampChartDate();
		alb.chartDate = '';
		alb.getReleases('chart', 3);
		dMenu = new MenuManager;
		this.dayMenu();
	}

	setPlaylist(i) {
		plman.ActivePlaylist = pl.menu[i].ix;
	}

	setPlaylistEnabled(i) {
		plman.ActivePlaylist = pl.enabled[i].ix;
	}

	setSave(i) {
		switch (i) {
			case 1:
				sv.set(sv.trk == 1 ? 0 : 1);
				break;
			case 2:
				sv.set(sv.trk == 2 ? 0 : 2);
				break;
			case 4:
				sv.audio();
				break;
			case 5:
				sv.video();
				break;
			case 6:
				sv.track(false);
				sv.audioHandles = new FbMetadbHandleList();
				clearTimeout(sv.audioTimer);
				sv.audioTimer = null;
				sv.videoHandles = new FbMetadbHandleList();
				clearTimeout(sv.videoTimer);
				sv.videoTimer = null;
				break;
		}
	}

	setTopTags(i) {
		let djSource;
		if (!i) {
			if (ppt.djMode == 3) {
				const ok_callback = (status, input) => {
					if (status != 'cancel') {
						djSource = input;
					}
				}
				popUpBox.query('Query search', 'Enter media library query. Examples:\nRock\nGenre HAS Rock\n%rating% GREATER 3\nGenre IS Rock AND %Date% AFTER 1979 AND %Date% BEFORE 1990', ok_callback, 'Query:', index.cur_dj_source ? index.cur_dj_source : 'Enter query');
			} else {
				const ok_callback = (status, input) => {
					if (status != 'cancel') {
						djSource = input;
					}
				}
				popUpBox.input('Last.fm tag search', 'Type tag\n\nAnything recognised by last.fm can be used, e.g. 2015, Rock, Happy, American etc', ok_callback, '', index.cur_dj_source);
			}
		} else {
			djSource = txt.genreMenu[i - 1];
		}

		if (djSource) index.getAutoDj($.titlecase(djSource), ppt.djMode, ppt.genre_tracks || !i && ppt.djMode == 3 ? 1 : 4, ppt.lfm_variety, ppt.djRange, false, !i && ppt.djMode == 3 ? true : false);
	}

	removeFromCache(id) {
		const handleList = $.query(lib.db.cache, 'NOT %path% HAS ' + id);
		const pn = pl.cache();
		pl.clear(pn);
		plman.InsertPlaylistItems(pn, 0, handleList);
	}

	setVideoBlacklist(i) {
		if (!i) pl.love();

		else if (i == 1) {
			if (!this.video.list.blacklist[this.name.artis]) this.video.list.blacklist[this.name.artis] = [];
	
			if (this.video.title.length) this.video.list.blacklist[this.name.artis].push({
				'title': this.video.title,
				'id': this.video.id
			});

			this.removeFromCache(this.video.id);
			mtags.check(true);
			this.setBlacklistVideo();
			if (panel.youTube.backUp) sv.track(false);
		} else if (i == 2) blk.remove = !blk.remove;
		else if (blk.undo[0] == this.name.artis && i == 3) {
			if (!this.video.list.blacklist[blk.undo[0]]) this.video.list.blacklist[this.name.artis] = [];
			
			if (blk.undo[1].length) this.video.list.blacklist[blk.undo[0]].push({
				'title': blk.undo[1],
				'id': blk.undo[2]
			});

			this.setBlacklistVideo();
			blk.undo = [];
		} else {
			const bl_ind = i - (blk.undo[0] == this.name.artis ? 4 : 3);

			if (blk.remove) {
				blk.undo = [this.name.artis, this.video.list.blacklist[this.name.artis][bl_ind].title, this.video.list.blacklist[this.name.artis][bl_ind].id];
				this.video.list.blacklist[this.name.artis].splice(bl_ind, 1);
				$.removeNulls(this.video.list);
				this.setBlacklistVideo();
			} else $.browser(panel.url.yt_web2 + encodeURIComponent(this.video.list.blacklist[this.name.artis][bl_ind].id));
		}
	}

	setYear(i) {
		this.chart.year = i + 1952;
		ppt.chartDate = parseInt([this.chart.year, $.padNumber(this.chart.month, 2), $.padNumber(this.chart.day, 2)].join(''));
		but.btns.year.p2 = this.chart.year;
		panel.clampChartDate();
		alb.chartDate = '';
		alb.getReleases('chart', 3);
		dMenu = new MenuManager;
		this.dayMenu();
	}
}