class Albums {
	constructor() {
		this.ar_mbid = false;
		this.ar_mbid_done = false;
		this.artist = '';
		this.artist_title = '';
		this.chartDate = '';
		this.cur = [];
		this.dld;
		this.expanded = 0;
		this.get = true;
		this.handleList = new FbMetadbHandleList();
		this.playlist = [];
		this.topTracksAvailable = false;
		this.x = 25;
		this.w = 100;

		this.art = {
			cur: '',
			cur_sim: '',
			lock: false,
			libHandleList: new FbMetadbHandleList(),
			related: [],
			relatedCustom: dj.f2 + 'r\\related_artists.json',
			relatedCustomSort: true,
			search: false,
			sim_done: false,
			similar: []
		}

		this.artists = {
			cur_m_i: 0,
			drawn: 5,
			h: 100,
			item: {
				w: 30
			},
			length: 100,
			line: {
				y: 140
			},
			list: [],
			max: {
				y: 100
			},
			m_i: -1,
			name: {
				w: 70,
				track_w: 70
			},
			row_ix: {},
			rows: 5,
			y: 140
		}

		this.extra_sbar = {
			w: panel.sbar.show ? ppt.extra_sbar_w : false
		}

		this.img = {
			x: 0,
			y: 0,
			w: 0,
			source: [],
			sp: 0
		}

		this.names = {
			chart: [],
			cur: [],
			cur_m_i: 0,
			data: [],
			done: [false, false, false, false],
			drawn: 10,
			h: 100,
			item: {
				w: {}
			},
			lfm: [
				[],
				[],
				[]
			],
			lfm_alb: {
				w: 70
			},
			lfm_chart: {
				w: 80
			},
			list: [],
			line: {
				y: 40
			},
			lfm_track: {
				w: 60
			},
			max: {
				y: 100
			},
			mb: [
				[],
				[],
				[],
				[],
				[]
			],
			mb_rel: {
				w: []
			},
			m_i: -1,
			minRows: 5,
			name: {
				x: 45,
				w: 100
			},
			rows: 10,
			row_ix: {},
			y: 40,
			validPrime: false
		}

		this.playcount = {
			h: 15
		}

		this.row = {
			h: 25
		}

		this.sel = {
			x: 25,
			w: 100
		}

		this.type = {
			lfm: ['Top Albums', 'Top Tracks', 'Top Songs'],
			mb: [ppt.showLive ? 'All Releases' : 'Releases', 'Albums', 'Compilations', 'Singles and EPs', 'Remixes'],
			active: 0
		}

		if (ppt.btn_mode) ppt.showAlb = false;
		$.create(dj.f2 + 'r');

		ppt.verticalPad = Math.round(ppt.verticalPad);
		if (isNaN(ppt.verticalPad)) ppt.verticalPad = 0;
		ppt.verticalPad = $.clamp(ppt.verticalPad, 0, 100);

		this.focusServer = $.debounce(() => {
			if (!plman.PlaylistItemCount(plman.ActivePlaylist)) return;
			if (!this.art.lock && !this.art.search) this.orig_artist = this.artist = name.artist();
			if (ppt.showAlb) this.focusLoad();
			else if (!this.artist) this.clearAlbums();
		}, 1000, {
			'leading': true,
			'trailing': true
		});

		this.metadbServer = $.debounce(() => {
			this.focusLoad();
		}, 500);

		this.chooseArtist = $.debounce((ns) => {
			if (ppt.mb == 2) return;
			if (!ns) return;
			ns = $.titlecase(ns);
			ns = ns.trim();
			search.setText(ns);
			this.art.search = true;
			this.artist = !this.songsMode() ? ns : ns.split('|')[0].trim();
			if (this.songsMode()) {
				this.artist_title = ns;
				ns = this.artist;
			}
			if (ppt.showAlb) this.searchForAlbumNames(0, [ppt.lfmReleaseType, 4, 3][ppt.mb], ns);
		}, 1500);

		this.alb_id = -1;
	}

	// Methods

	activateTooltip(value, type) {
		if (tooltip.Text == value && [this.names.m_i == this.names.cur_m_i, this.artists.m_i == this.artists.cur_m_i][type]) return;
		this.checkTooltipFont('tree');
		tooltip.Text = value;
		tooltip.Activate();
	}

	albumInLibrary(artist, album, orig_alb, mtags_alb) {
		const continue_confirmation = (status, confirmed) => {
			if (confirmed) {
				if (artist + ' | ' + album == 'Artist | Album') return false;
				return true;
			}
			return false;
		}
		popUpBox.confirm(artist + ' | ' + album, 'This Album Exists In Library As:' + (orig_alb ? '\n\nOriginal Library Album' : '') + (orig_alb && mtags_alb ? '\n\nAND' : '') + (mtags_alb ? '\n\nAlbum Built With m-TAGS' : '') + '\n\nContinue?', 'Yes', 'No', continue_confirmation);
	}

	setNames(li) {
		if (!li) return;
		this.names.list = li.map(v => v);
		this.names.list = this.names.list.filter(v => {
			let str = ppt.mb == 1 ? `${v.artist} ${v.title} ${v.date}` : `${v.artist} ${v.title}`;
			return str.toLowerCase().includes(filter.text.toLowerCase());
		});
		this.getHandleList(this.names.list);
		this.calcRowsNames();
		txt.paint();
	}

	analyse(list, mode) {
		let prime, extra;
		const q = lib.partialMatch.artist && lib.partialMatch.type[1] != 0 ? ' HAS ' : ' IS ';
		const query = q == ' IS ' ? name.field.artist + q + this.artist : $.queryArtist(this.artist);
		this.art.libHandleList = $.query(lib.getLibItems(), query);
		this.art.plHandleList = $.query(lib.db.cache, 'artist IS ' + this.artist);
		this.art.libHandleList.OrderByFormat(tf.albumSortOrder, 1);
		this.art.plHandleList.OrderByFormat(tf.albumSortOrder, 1);

		if (mode == 4) {
			if (!this.names.data.length) return this.names.validPrime = false;
			this.names.mb[ppt.mbReleaseType] = [];
			this.names.data.forEach(v => {
				prime = v['primary-type'];
				extra = v['secondary-types'].join('').toLowerCase();
				if (!this.names.validPrime) this.names.validPrime = prime ? true : false;
				const comp = extra.includes('compilation');
				const live = extra.includes('live');
				const primary = prime == 'Album' || prime == 'EP' || prime == 'Single';
				const remix = extra.includes('remix');
				let filter, type;
				switch (ppt.mbReleaseType) {
					case 0:
						filter = ppt.showLive ? (live || primary) : primary && !live;
						break;
					case 1:
						filter = prime == 'Album' && !live && !comp && !remix;
						break;
					case 2:
						filter = comp && !live && !remix;
						break;
					case 3:
						filter = (prime == 'EP' || prime == 'Single') && !live && !comp && !remix;
						break;
					case 4:
						filter = primary && remix;
						break;
				}
				if (filter) {
					switch (true) {
						case remix:
							type = 'Remix ' + prime;
							break;
						case comp:
							type = 'Compilation';
							break;
						case live:
							type = 'Live' + (prime ? (' ' + prime) : '');
							break;
						default:
							type = prime;
							break;
					}
				} else if (ppt.showLive && !ppt.mbReleaseType) {
					type = 'Other';
					filter = true;
				}

				if (filter) {
					this.names.mb[ppt.mbReleaseType].push({
						date: v['first-release-date'].substring(0, 4),
						name: v.title.replace(/’/g, "'"),
						artist: this.artist,
						title: v.title,
						releaseType: type,
						rg_mbid: v.id,
						prime: prime,
						extra: extra,
						type: ppt.mbReleaseType,
						alb_id: ++this.alb_id
					});
				}
			});
			this.names.mb[ppt.mbReleaseType].forEach((v, i) => this.getSource(v, i));
			this.mbSort();
			this.setNames(this.names.mb[ppt.mbReleaseType]);
		} else if (list.length) {
			switch (mode) {
				case 0:
					this.names.lfm[0] = list.map((v, i) => ({
						name: v.name,
						artist: this.artist,
						title: v.name,
						releaseType: 'Album',
						rg_mbid: v.mbid,
						playcount: v.playcount,
						rank: i,
						type: 6,
						alb_id: ++this.alb_id
					}));
					this.names.lfm[0].forEach((v, i) => this.getSource(v, i));
					break;
				case 1:
					this.names.lfm[1] = list.map((v, i) => ({
						name: v.title,
						artist: this.artist,
						title: v.title,
						releaseType: 'Single',
						playcount: v.playcount,
						rank: i,
						type: 7,
						alb_id: ++this.alb_id
					}));
					this.names.lfm[1].forEach((v, i) => this.getSource(v, i));
					break;
				case 2: {
					this.names.lfm[2] = list.map((v, i) => ({
						name: v.artist + ' - ' + v.title,
						artist: v.artist,
						title: v.title,
						releaseType: 'Single',
						playcount: v.playcount,
						rank: i,
						type: 8,
						alb_id: ++this.alb_id
					}));
					const artists = this.getArtists(this.names.lfm[2], q);
					this.names.lfm[2].forEach((v, i) => this.getSource(v, i, artists.libHandles, artists.plHandles));
					break;
				}
				case 3: {
					this.names.chart = list.map((v, i) => ({
						name: v.artist + ' - ' + v.title,
						artist: v.artist,
						title: v.title,
						releaseType: 'Single',
						rank: i,
						type: 9,
						alb_id: ++this.alb_id
					}));
					const artists = this.getArtists(this.names.chart, q);
					this.names.chart.forEach((v, i) => this.getSource(v, i, artists.libHandles, artists.plHandles));
					this.chartDate = list[0].date ? `${list[0].date}` : '';
					this.names.cur[3] = `${this.chartDate}`;
					search.setText();
					break;
				}
			}
			const li = mode < 3 ? this.names.lfm[mode] : this.names.chart;
			if (li.length) {
				this.setNames(ppt.lfmSortPC && mode != 3 ? $.sort(li, 'playcount', 'numRev') : li);
				if (mode != 3) this.names.list.forEach(v => v.playcount = this.numFormat(v.playcount))
			} else this.names.list = [];
		} else this.names.list = [];
	}

	artistRecognised() {
		if (ppt.mb == 2) return this.artist && !this.names.done[3] ? 'Searching...' : (!filter.text ? 'No Selection' : 'Search List: Nothing Found');
		return this.artist && !this.names.done[ppt.mb ? 4 : ppt.lfmReleaseType] ? 'Searching...' : !filter.text ? !this.ar_mbid || this.songsMode() ? 'Unrecognised ' + (!this.songsMode() ? 'Artist' : 'Song') : ppt.mb == 1 && (ppt.showLive ? !this.names.data.length : !this.names.validPrime) || !ppt.mb ? 'Nothing Found' : 'Nothing Found For Release Type:\n' + this.type.mb[ppt.mbReleaseType] : 'Search List: Nothing Found';
	}

	butTooltipFont() {
		return ['Segoe UI', 15 * $.scale * ppt.zoomTooltip / 100, 0];
	}

	calcRows(noResetAlb) {
		if (!ppt.showArtists && !this.expanded) this.artists.list = [];
		let ln_sp = 0;
		let tot_r = 0;
		search.y = ppt.bor * 0.625 + 19 * but.scale;
		ln_sp = this.row.h * 0.2;

		this.names.line.y = search.y + this.row.h + ln_sp;
		this.names.y = this.names.line.y + ln_sp; // temp values with min allowed ln_sp

		const sp1 = panel.h - search.y - this.row.h - (ppt.autoLayout ? Math.max(this.row.h, ppt.bor) : 1);
		const sp2 = sp1 - ln_sp * (ppt.showArtists ? 5 : 3);
		tot_r = Math.floor(sp2 / this.row.h);
		ln_sp = (sp1 - tot_r * this.row.h) / (ppt.showArtists ? 5 : 3);
		search.y = search.y + ln_sp;

		this.names.line.y = search.y + this.row.h + ln_sp;
		this.names.y = this.names.line.y + ln_sp; // recalc

		this.artists.rows = this.expanded ? Math.floor(tot_r / 2) : ppt.showArtists ? tot_r > 8 ? Math.max(Math.round(tot_r / 3), 5) : Math.floor(tot_r / 2) : 0;
		this.names.rows = tot_r - this.artists.rows;
		this.artists.h = this.artists.rows * this.row.h;
		this.names.h = this.names.rows * this.row.h;

		this.artists.line.y = Math.round(this.names.y + this.names.h + ln_sp);
		this.artists.y = this.artists.line.y + ln_sp;
		const top_corr = [panel.sbar.offset - (panel.but_h - panel.sbar.but_w) / 2, panel.sbar.offset, 0][panel.sbar.type];
		const bot_corr = [(panel.but_h - panel.sbar.but_w) - panel.sbar.offset * 2, -panel.sbar.offset, 0][panel.sbar.type];

		let sbar_alb_y = this.names.y + top_corr;
		let sbar_art_y = this.artists.y + top_corr;
		let sbar_alb_h = this.names.h + bot_corr;
		let sbar_art_h = this.artists.h + bot_corr;
		if (panel.sbar.type == 2) {
			sbar_alb_y += 1;
			sbar_art_y += 1;
			sbar_alb_h -= 2;
			sbar_art_h -= 2;
		}

		this.names.max.y = this.names.y + this.names.h - this.row.h * 0.9;
		this.artists.max.y = this.artists.h + this.artists.y - this.row.h * 0.9;
		this.names.minRows = tot_r - Math.floor(tot_r / 2);

		alb_scrollbar.metrics(panel.sbar.x, sbar_alb_y, panel.sbar.w, sbar_alb_h, this.names.rows, this.row.h, this.names.y, this.names.h);
		art_scrollbar.metrics(panel.sbar.x, sbar_art_y, panel.sbar.w, sbar_art_h, this.artists.rows, this.row.h, this.artists.y, this.artists.h);
		art_scrollbar.reset();
		art_scrollbar.setRows(this.artists.list.length);
		if (!noResetAlb) alb_scrollbar.reset();
		alb_scrollbar.setRows(this.names.list.length);
		but.refresh(true);
	}

	calcRowsArtists() {
		art_scrollbar.reset();
		art_scrollbar.setRows(this.artists.list.length);
	}

	calcRowsNames() {
		alb_scrollbar.reset();
		alb_scrollbar.setRows(this.names.list.length);
	}

	calcText() {
		if (!panel.w || !panel.h) return;
		const rel_name = ['Remix Album  ', 'Album ', 'Compilation ', 'Single ', 'Remix Album '];
		const sp_arr = ['0000  ', '  ', '00', ' 10,000,000', ' Score', ppt.showSource ? '   Last.fm playcount  Pos' : '   Last.fm playcount', ppt.showSource ? '   Pos' : ''];
		let h;
		this.row.h = 0;
		if (ppt.showSource) ppt.bor = Math.max(ppt.bor, 10);
		this.x = panel.sbar.show && !this.extra_sbar.w ? Math.max(panel.sbar.sp + 10 * $.scale, ppt.bor) : ppt.bor
		$.gr(1, 1, false, g => {
			for (let j = 0; j < 2; j++) {
				h = g.CalcTextHeight('String', !j ? ui.font.main : ui.font.playCount);
				!j ? this.row.h = h + ppt.verticalPad : this.playcount.h = h;
			}
			['date', 'sp', 'rank', 'playcount', 'score', 'lfm', 'chart'].forEach((v, i) => this.names.item.w[v] = g.CalcTextWidth(sp_arr[i], i == 2 ? ui.font.small : i == 4 ? ui.font.head : i == 5 || i == 6 ? ui.font.playCount : ui.font.main));
			const getWidth = v => g.CalcTextWidth(v, ui.font.main);
			this.names.item.w.pos = this.names.item.w.rank + this.names.item.w.sp;
			search.lfm_rel.w = this.type.lfm.map(getWidth);
			search.chart_rel_w = g.CalcTextWidth('Singles Chart', ui.font.main);
			search.mb_rel.w = this.type.mb.map(getWidth);
			this.names.mb_rel.w = rel_name.map(getWidth);
		});

		this.w = panel.w - this.x * 2 - (!this.extra_sbar.w ? 0 : panel.sbar.sp);
		search.w1 = this.w - this.row.h * 0.75;
		this.img.w = ppt.showSource ? Math.max(Math.round(this.row.h * 0.4), 10) : 0;
		this.img.sp = ppt.showSource ? this.img.w + this.names.item.w.sp : 0;
		this.artists.name.w = ppt.showSimilar ? this.w - this.names.item.w.score - this.names.item.w.sp : this.w * 2 / 3 - this.names.item.w.sp;
		this.artists.name.track_w = this.w - this.names.item.w.pos;
		this.artists.item.w = ppt.showSimilar ? this.names.item.w.score : this.w / 3;

		this.fontawesome = gdi.Font('FontAwesome', ui.font.main.Size, 0);
		$.gr(1, 1, false, g => {
			this.icon_w = g.CalcTextWidth('\uF105  ', this.fontawesome);
		});

		this.names.lfm_track.w = this.w - this.names.item.w.sp - this.names.item.w.playcount - this.img.sp;
		this.names.lfm_chart.w = this.w - this.names.item.w.sp - this.img.sp;
		this.names.name.x = this.x + this.img.sp;
		this.names.name.w = this.siteNameWidth();
		search.metrics();
		this.createImages();
	}

	check_tooltip(ix, x, y) {
		const type = y < art_scrollbar.item_y ? 0 : 1;
		if (this.lbtnDn || [alb_scrollbar.draw_timer, art_scrollbar.draw_timer][type]) return;
		const item = [this.names.list[ix], this.artists.list[ix]][type];
		if (!item) return;
		const drawExpand = [this.isAlbum(), false][type];
		const trace1 = (type == 0 || alb.expanded && ix) && x > this.x + (drawExpand ? this.icon_w : 0) && x < this.names.name.x + (drawExpand ? this.icon_w : 0) && ppt.showSource;
		const trace2 = item.tt && item.tt.needed && x >= item.tt.x && x <= item.tt.x + item.tt.w && y >= item.tt.y && y <= item.tt.y + this.row.h;
		const text = trace1 ? this.tipText(item, type) : trace2 ? item.name : '';
		if (text != tooltip.Text && !(trace1 || trace2)) {
			this.deactivateTooltip();
			return;
		}
		this.activateTooltip(text, type);
		timer.tooltip();
	}

	checkTooltip(item, x, y, txt_w, w) {
		item.tt = {
			needed: txt_w > w,
			x: x,
			y: y,
			w: w
		}
	}

	checkTooltipFont(type) {
		switch (type) {
			case 'btn': {
				const newTooltipFont = this.butTooltipFont();
				if ($.equal(this.cur, newTooltipFont)) return;
				this.cur = newTooltipFont;
				break;
			}
			case 'tree': {
				const newTooltipFont = this.treeTooltipFont();
				if ($.equal(this.cur, newTooltipFont)) return;
				this.cur = newTooltipFont;
				break;
			}
		}
		tooltip.SetFont(this.cur[0], this.cur[1], this.cur[2]);
	}

	checkTrackSources() {
		if (this.expanded) {
			this.names.list.some(v => {
				if (v.expanded) {
					if (v.source == 3) {
						if (v.handleList.Count) {
							this.artists.list = [];
							v.handleList.Convert().forEach(h => {
								this.artists.list.push({
									artist: v.artist,
									name: tf.title0.EvalWithMetadb(h),
									album: v.name.replace(/^(x |> |>> )/, ''),
									date: v.date,
									handleList: new FbMetadbHandleList([h]),
									source: 3
								});
							});
							if (this.artists.list.length) this.artists.list.unshift({
								name: v.artist + ' - ' + v.name.replace(/^(x |> |>> )/, '')
							});
							else this.artists.list[0] = {
								name: v.artist + ' - ' + v.name.replace(/^(x |> |>> )/, '') + ': ' + 'Nothing Found'
							}
							this.calcRowsArtists();
						}
						return true;
					}
				}
			});
		}
		this.artists.list.forEach((v, i) => {
			if (v.source == 1 || v.source == 2) {
				let handleList = lib.inPlaylist(v.artist, v.name.replace(/^(x |> |>> )/, ''), i, true, false, true);
				handleList = $.query(handleList, 'album IS ' + v.album);
				v.handleList = handleList;
				v.source = handleList.Count ? 2 : 1;
			}
		});
		txt.paint();
	}

	changeTrackSource() {
		if (this.expanded) {
			this.names.list.some((v, i) => {
				if (v.expanded) {
					this.getTracks('track' + v.alb_id, i, false, false, false, true);
					return true;
				}
			});
		}
	}

	setFilter(ns) {
		filter.text = ns || '';
		if (filter.text) {
			if (ppt.showAlb) this.setNames([this.names.lfm[ppt.lfmReleaseType], this.names.mb[ppt.mbReleaseType], this.names.chart][ppt.mb]);
		}


	}

	clearAlbums() {
		this.names.list = [];
		this.handleList = new FbMetadbHandleList();
		this.names.mb = [
			[],
			[],
			[],
			[],
			[]
		];
		this.names.data = [];
		this.names.cur = [];
		search.text = '';
		this.art.related = [];
		this.art.similar = [];
		this.art.cur_sim = '';
		this.artists.list = [];
		this.ar_mbid_done = this.ar_mbid = false;
		this.names.validPrime = false;
		this.calcRows();
		filter.text = '';
		if (ppt.showAlb) txt.paint();
	}

	clearIcon() {
		for (let i = 0; i < 4; i++) this.names.mb[i].forEach(v => v.expanded = '');
		this.names.lfm[0].forEach(v => v.expanded = '');
		this.names.list.forEach(v => v.expanded = '');
	}

	createImages() {
		if (!ppt.showSource) return;
		const lightFont = ui.getSelCol(ui.col.text, true) == 50;
		
		this.img.source = [
			ppt.showSource == 3 ? (lightFont ? 'Not available light.png' : 'Not available dark.png') : 'Not available.png',
			['', 'Source red.png', 'Source green.png', 'Source neutral.png'][ppt.showSource],
			ppt.showSource == 3 ? (lightFont ? 'Cache neutral [light].png' : 'Cache neutral [dark].png') : (lightFont ? 'Cache light.png' : 'Cache dark.png'),
			ppt.showSource == 3 ? 'Library neutral.png' : 'Library.png'
		]
		.map(v => my_utils.getImageAsset(v).Resize(this.img.w, this.img.w, 7));

		this.img.y = Math.round((this.row.h - this.img.w) / 2);
		this.img.source[4] = this.img.source[0];
	}

	deactivateTooltip() {
		if (!tooltip.Text || but.trace) return;
		tooltip.Text = '';
		but.tooltip.delay = false;
		tooltip.Deactivate();
	}

	do_youtube_search(p_alb_id, p_artist, p_title, p_date, p_add, p_mTags) {
		if (!p_add) pl.clear(pl.selection());
		const yt = new YoutubeSearch(() => yt.onStateChange(), this.on_youtube_search_done.bind(this));
		yt.search(p_alb_id, p_artist, p_title, '', '', '', p_mTags ? '' : '&fb2k_album=' + encodeURIComponent(p_title) + (p_date ? ('&fb2k_date=' + encodeURIComponent(p_date)) : ''), '', true, '', '', p_title, p_date, p_mTags);
	}

	do_youtube_track_search(p_alb_id, p_artist, p_title, p_ix, p_album, p_date, p_add) {
		if (!p_add) pl.clear(pl.selection());
		const yt = new YoutubeSearch(() => yt.onStateChange(), this.on_youtube_track_search_done.bind(this));
		yt.search(p_alb_id, p_artist, p_title, p_ix, '', '', 'fb2k_tracknumber=' + p_ix + '&fb2k_album=' + encodeURIComponent(p_album) + (p_date ? ('&fb2k_date=' + encodeURIComponent(p_date)) : ''), '', '', '', '', p_album, p_date);
	}

	done(new_artist) {
		if (this.names.cur[[ppt.lfmReleaseType, 4, 3][ppt.mb]] == (this.songsMode() ? this.artist_title : ppt.mb == 2 ? this.chartDate : new_artist)) return true;
		else return false;
	}

	draw(gr) {
		if (panel.halt()) return;
		this.getAlbumsFallback();
		const drawExpand = this.isAlbum();
		let b = 0;
		let f = 0;
		let i = 0;
		let rank_w = ppt.mb == 1 ? 0 : this.names.item.w.pos;
		let row_y = 0;
		let txt_col, x = this.names.name.x;
		let w1 = this.names.name.w - rank_w - (drawExpand ? this.icon_w : 0);
		let w2 = this.w - rank_w - this.img.sp;

		if (ppt.mb != 1) gr.GdiDrawText(ppt.showSource ? (ppt.mb != 2 ? 'Last.fm playcount  Pos' : 'Pos') : '', ui.font.playCount, ui.col.head, this.x, Math.round(this.names.line.y - ui.font.playCount.Size + 1), this.w, this.playcount.h, txt.r);
		this.names.drawn = 0;
		if (this.names.list.length) {
			b = Math.max(Math.round(alb_scrollbar.delta / this.row.h + 0.4), 0);
			f = Math.min(b + this.names.rows, this.names.list.length);
			for (i = b; i < f; i++) {
				row_y = i * this.row.h + this.names.y - alb_scrollbar.delta;
				if (row_y < this.names.max.y) {
					this.names.drawn++;
					if (this.names.list[i].name.startsWith('>>') && ui.col.bgSel != 0) {
						gr.FillSolidRect(this.sel.x, row_y, this.sel.w, this.row.h, ui.col.bgSel);
						gr.DrawRect(this.sel.x + Math.floor(ui.style.l_w / 2), row_y, this.sel.w, this.row.h, ui.style.l_w, ui.col.bgSelframe);
					}
					if (ppt.rowStripes) {
						if (i % 2 == 0) gr.FillSolidRect(this.sel.x, row_y + 1, this.sel.w, this.row.h - 2, ui.col.bg1);
						else gr.FillSolidRect(this.sel.x, row_y, this.sel.w, this.row.h, ui.col.bg2);
					}
				}
			}
			for (i = b; i < f; i++) {
				row_y = Math.round(i * this.row.h + this.names.y - alb_scrollbar.delta);
				if (row_y < this.names.max.y) {
					const item = this.names.list[i];
					const itemSel = item.name.startsWith('>>');
					const node_col = itemSel ? ui.col.textSel : this.names.m_i == i ? ui.col.text_h : ui.col.text;
					txt_col = itemSel ? ui.col.textSel : this.names.m_i == i && ppt.highLightText ? ui.col.text_h : ui.col.text;
					if (this.names.m_i == i) {
						if (ppt.highLightRow == 3) {
							gr.FillSolidRect(this.sel.x, row_y, this.sel.w, this.row.h, ui.col.bg_h);
							gr.DrawRect(this.sel.x + Math.floor(ui.style.l_w / 2), row_y, this.sel.w - ui.style.l_w, this.row.h, ui.style.l_w, ui.col.frame);
						}
						if (ppt.highLightRow == 2) gr.FillSolidRect(this.sel.x, row_y, this.sel.w + 1, this.row.h + (!itemSel ? 0 : 1), !itemSel ? ui.col.bg_h : ui.col.bgSel_h);
						if (ppt.highLightRow == 1) gr.FillSolidRect(ui.style.l_w, row_y, ui.sideMarker_w, this.row.h, ui.col.sideMarker);
					}
					if (item.expanded) {
						gr.GdiDrawText(item.expanded, this.fontawesome, this.names.m_i == i ? ui.col.text_h : ui.col.text, this.x - this.icon_w * 0.2, row_y, w1, this.row.h, txt.l);
						gr.GdiDrawText(item.expanded, this.fontawesome, this.names.m_i == i ? ui.col.text_h : ui.col.text, this.x - this.icon_w * 0.2, row_y + 1, w1, this.row.h, txt.l);
					} else if (drawExpand) gr.GdiDrawText('\uF105  ', this.fontawesome, node_col, this.x, row_y, w1, this.row.h, txt.l);
					if (ppt.showSource) {
						const im = this.img.source[item.source];
						if (im) gr.DrawImage(im, this.x + (drawExpand ? this.icon_w : 0), row_y + this.img.y, im.Width, im.Height, 0, 0, im.Width, im.Height);
					}
					const nm = !ppt.showSource && !this.isAlbum() ? `${(i < 9 ? '0' : '') + (i + 1)}  ${item.name}` : item.name;
					const name_w = gr.CalcTextWidth(nm, ui.font.main);
					gr.GdiDrawText(nm, ui.font.main, txt_col, x + (drawExpand ? this.icon_w : 0), row_y, w1, this.row.h, txt.l);
					this.checkTooltip(item, x + (drawExpand ? this.icon_w : 0), row_y, name_w, w1);
					if (ppt.mb == 1) {
						gr.GdiDrawText(item.releaseType, ui.font.main, txt_col, x + rank_w, row_y, w2 - this.names.item.w.date, this.row.h, txt.r);
						gr.GdiDrawText(item.date, ui.font.main, txt_col, x, row_y, w2, this.row.h, txt.r);
					} else {
						if (ppt.mb != 2) gr.GdiDrawText(item.playcount, ui.font.main, txt_col, x + this.names.lfm_track.w - rank_w + this.names.item.w.sp, row_y, this.names.item.w.playcount, this.row.h, txt.r);
						if (ppt.showSource) gr.GdiDrawText(i + 1, ui.font.small, ui.col.count, this.x + this.w - rank_w, row_y, rank_w, this.row.h, txt.r);
					}
				}
			}
		} else gr.GdiDrawText(this.artistRecognised(), ui.font.main, ui.col.text, this.x, Math.round(this.names.y), this.w, this.row.h * 2, txt.lm);
		if (panel.sbar.show && alb_scrollbar.scrollable_lines > 0) alb_scrollbar.draw(gr);
		this.artists.drawn = 0;
		if (this.artists.list.length) {
			b = Math.max(Math.round(art_scrollbar.delta / this.row.h + 0.4), 0);
			f = Math.min(b + this.artists.rows, this.artists.list.length);
			for (i = b; i < f; i++) {
				row_y = i * this.row.h + this.artists.y - art_scrollbar.delta;
				if (row_y < this.artists.max.y) {
					const item = this.artists.list[i];
					if (!item) return;
					if (item.name.startsWith('>>') && ui.col.bgSel != 0) {
						gr.FillSolidRect(this.sel.x, row_y, this.sel.w, this.row.h, ui.col.bgSel);
						gr.DrawRect(this.sel.x + Math.floor(ui.style.l_w / 2), row_y, this.sel.w, this.row.h, ui.style.l_w, ui.col.bgSelframe);
					}
					if (ppt.rowStripes) {
						if (i % 2 == 0) gr.FillSolidRect(this.sel.x, row_y + 1, this.sel.w, this.row.h - 2, ui.col.bg1);
						else gr.FillSolidRect(this.sel.x, row_y, this.sel.w, this.row.h, ui.col.bg2);
					}
				}
			}
			for (i = b; i < f; i++) {
				row_y = Math.round(i * this.row.h + this.artists.y - art_scrollbar.delta);
				if (row_y < this.artists.max.y) {
					this.artists.drawn++;
					const item = this.artists.list[i];
					if (!item) return;
					const font = i == 0 ? ui.font.head : ui.font.main;
					const itemSel = item.name.startsWith('>>');
					txt_col = itemSel ? ui.col.textSel : this.artists.m_i == i && ppt.highLightText ? ui.col.text_h : ui.col.text;
					if (this.artists.m_i == i) {
						if (ppt.highLightRow == 3) {
							gr.FillSolidRect(this.sel.x, row_y, this.sel.w, this.row.h, ui.col.bg_h);
							gr.DrawRect(this.sel.x + Math.floor(ui.style.l_w / 2), row_y, this.sel.w - ui.style.l_w, this.row.h, ui.style.l_w, ui.col.frame);
						}
						if (ppt.highLightRow == 2) gr.FillSolidRect(this.sel.x, row_y, this.sel.w + 1, this.row.h + (!itemSel ? 0 : 1), !itemSel ? ui.col.bg_h : ui.col.bgSel_h);
						if (ppt.highLightRow == 1) gr.FillSolidRect(ui.style.l_w, row_y, ui.sideMarker_w, this.row.h, ui.col.sideMarker);
					}
					let im = null;
					if (ppt.showSource) {
						im = this.img.source[item.source];
						if (im) gr.DrawImage(im, this.x, row_y + this.img.y, im.Width, im.Height, 0, 0, im.Width, im.Height);
					}
					const iw = !this.expanded ? this.artists.name.w : this.artists.name.track_w;
					const item_w = !im ? iw : iw - this.img.sp;
					const nm = !ppt.showSource && this.expanded && i ? `${(i < 9 ? '0' : '') + i}  ${item.name}` : item.name;
					const name_w = gr.CalcTextWidth(nm, font);
					this.checkTooltip(item, !im ? this.x : this.x + this.img.sp, row_y, name_w, item_w);
					gr.GdiDrawText(nm, font, txt_col, !im ? this.x : this.x + this.img.sp, row_y, item_w, this.row.h, txt.l);
					if (this.expanded) {
						if (i && ppt.showSource) gr.GdiDrawText(i, ui.font.small, ui.col.count, this.x + this.w - this.names.item.w.pos, row_y, this.names.item.w.pos, this.row.h, txt.r);
					} else if (ppt.showSimilar) gr.GdiDrawText(item.score, font, txt_col, this.x + this.w - this.artists.item.w, row_y, this.artists.item.w, this.row.h, txt.r);
					else if (i > 0) gr.GdiDrawText(item.disambiguation, ui.font.main, txt_col, this.x + this.w - this.artists.item.w, row_y, this.artists.item.w, this.row.h, txt.r);
				}
			}
			gr.DrawLine(this.x, this.artists.line.y, this.x + this.w - 1, this.artists.line.y, ui.style.l_w, ui.col.lineArt);
		}
		if (panel.sbar.show && art_scrollbar.scrollable_lines > 0) art_scrollbar.draw(gr);
	}

	focusLoad() {
		if (fb.IsPlaying && this.orig_artist != this.artist) return;
		if (!this.art.lock && !this.art.search) this.orig_artist = this.artist = name.artist();
		if (!this.artist) {
			this.clearAlbums();
			return;
		}
		this.on_playback_new_track();
	}

	get_ix(x, y) {
		let ix;
		if (y > art_scrollbar.item_y && y < art_scrollbar.item_y + this.artists.drawn * this.row.h && x >= this.sel.x && x < this.sel.x + this.sel.w) ix = Math.round((y + art_scrollbar.delta - this.artists.y - this.row.h * 0.5) / this.row.h);
		else if (y > alb_scrollbar.item_y && y < alb_scrollbar.item_y + this.names.drawn * this.row.h && x >= this.sel.x && x < this.sel.x + this.sel.w) ix = Math.round((y + alb_scrollbar.delta - this.names.y - this.row.h * 0.5) / this.row.h);
		else ix = -1;
		return ix;
	}

	getAlbumsFallback() {
		if (!this.get || (this.art.lock && this.artist)) return;
		if (!this.art.lock && !this.artist) this.orig_artist = this.artist = name.artist();
		if (!this.art.lock) this.artist_title = name.artist_title();
		search.setText();
		if (dj.pss && !dj.force_refresh) dj.force_refresh = 2;
		filter.clearTimer(filter.timer);
		search.clearTimer(search.timer);
		this.searchForAlbumNames(0, [ppt.lfmReleaseType, 4, 3][ppt.mb]);
	}

	getArtists(list, q) {
		let libQuery = '';
		let plQuery = '';
		[...new Set(list.map(v => v.artist))].forEach((v, i) => {
			const query = q == ' IS ' ? name.field.artist + q + v : $.queryArtist(v);
			libQuery += (i ? ' OR ' : '') + query;
			plQuery += (i ? ' OR ' : '') + name.field.artist + q + v;
		});
		return {
			libHandles: $.query(lib.getLibItems(), libQuery),
			plHandles: $.query(lib.db.cache, plQuery)
		}
	}

	getHandleList(items) {
		this.handleList = new FbMetadbHandleList();
		this.topTracksAvailable = false;
		if (!items || !items.length) return;
		items.forEach(v => this.handleList.AddRange(v.handleList));
		this.topTracksAvailable = this.isAlbum() ? false : items.some(v => v.source);
	}

	getMbReleases(p_alb_id, p_rg_mbid, p_album_artist, p_album, p_prime, p_extra, p_date, p_add, p_mTags) {
		const mb_releases = new MusicbrainzReleases(() => mb_releases.onStateChange(), this.on_mb_releases_search_done.bind(this));
		mb_releases.search(p_alb_id, p_rg_mbid, p_album_artist, p_album, p_prime, p_extra, p_date, p_add, p_mTags);
	}

	getReleases(m, r) {
		switch (m) {
			case 'lfm':
				ppt.lfmReleaseType = r;
				this.searchForAlbumNames(2, r, r == 2 ? this.artist_title : this.artist, this.ar_mbid);
				this.names.name.w = this.names.lfm_track.w;
				break;
			case 'mb':
				ppt.mbReleaseType = r;
				this.names.name.w = this.w - this.names.item.w.date - this.names.mb_rel.w[r] - this.img.sp;
				for (let i = 0; i < 5; i++)
					if (ppt.mbReleaseType == i) {
						if (this.names.mb[i].length) {
							this.setNames(this.names.mb[i]);
						} else this.analyse('', 4);
						this.calcRowsNames();
						txt.paint();
					} break;
			case 'chart':
				this.searchForAlbumNames(2, r, this.artist, this.ar_mbid);
				this.names.name.w = this.names.lfm_chart.w;
				break;
		}
		search.setText();
	}

	getRowNumber(y) {
		return Math.round((y - this.names.y - this.row.h * 0.5) / this.row.h);
	}

	getTracks(alb_id, index, refresh, add, remove, showTracks, mTags) {
		let i_n = this.names.list[index].name.replace(/^(x |> |>> )/, '');
		if (ppt.mb == 1) {
			const relType = this.names.list[index].releaseType;
			if (relType != 'Album' && relType != 'Compilation') {
				i_n += ' [' + relType + ']';
			}
		}
		if (!mTags) {
			if (this.loadExisting(this.names.list[index], true, refresh, add, remove, showTracks)) {
				if (!showTracks) this.setRow(alb_id, 2);
				return;
			}
			if (remove) {
				this.checkTrackSources();
				return;
			}
		}
		this.dld = new DldAlbumTracks;
		this.dld.execute(alb_id, this.names.list[index].rg_mbid, this.artist, i_n, this.names.list[index].prime, this.names.list[index].extra, this.names.list[index].date, add, mTags);
	}

	isAlbum() {
		return ppt.mb == 1 || !ppt.mb && !ppt.lfmReleaseType;
	}

	isFullAlbum(handle) {
		const track = tf.title_0.EvalWithMetadb(handle);
		if (track.includes('(Full Album)')) return true;
		return false;
	}

	getSource(v, i, libHandles, plHandles) {
		let handleList = new FbMetadbHandleList();
		v.fullAlbum = false;
		switch (true) {
			case v.releaseType == 'Single' && ppt.mb != 1:
				if (ppt.libAlb) {
					handleList = lib.inLibrary(v.artist, v.title, i, true, true, libHandles);
					if (handleList.Count) {
						v.source = 3;
						v.handleList = handleList;
						v.fullAlbum = this.isFullAlbum(handleList[0]);
						return;
					}
				}
				if (ppt.libAlb == 2) {
					v.source = 0;
					v.handleList = new FbMetadbHandleList();
					return;
				} else {
					handleList = lib.inPlaylist(v.artist, v.title, i, false, false, false, plHandles);
					if (handleList.Count) {
						v.source = 2;
						v.handleList = handleList;
						v.fullAlbum = this.isFullAlbum(handleList[0]);
						return;
					}
				}
				v.source = (ml.fooYouTubeInstalled ? 1 : 4);
				v.handleList = new FbMetadbHandleList();
				return;
			default:
				if (v.releaseType != 'Album' && v.releaseType != 'Compilation' && !v.title.endsWith(' [' + v.releaseType + ']')) {
					v.title += ' [' + v.releaseType + ']';
				}
				if (ppt.libAlb) {
					const q = lib.partialMatch.album ? ' HAS ' : ' IS ';
					handleList = $.query(this.art.libHandleList, name.field.album + q + v.title);
					if (handleList.Count) {
						v.source = 3;
						v.handleList = handleList;
						v.fullAlbum = this.isFullAlbum(handleList[0]);
						return;
					}
				}
				if (ppt.libAlb == 2) {
					v.source = 0;
					v.handleList = new FbMetadbHandleList();
					return;
				} else {
					handleList = $.query(this.art.plHandleList, 'album IS ' + v.title);
					if (handleList.Count) {
						v.source = 2;
						v.handleList = handleList;
						v.fullAlbum = this.isFullAlbum(handleList[0]);
						return;
					}
				}
				v.source = ml.fooYouTubeInstalled ? 1 : 4;
				v.handleList = new FbMetadbHandleList();
				break;
		}
	}

	leave() {
		this.deactivateTooltip();
		if (!ppt.showAlb || panel.halt()) return;
		if (!men.right_up) {
			this.names.m_i = -1;
			this.artists.m_i = -1;
		}
		this.names.cur_m_i = 0;
		this.artists.cur_m_i = 0;
		txt.paint();
		this.type.active = 0;
	}

	libraryTest(p_album_artist, p_album) {
		lib.getArtistTracks(p_album_artist);
		let albums, orig_alb = false;
		let mtags_alb = false;
		albums = tf.album0.EvalWithMetadbs(lib.artist.tracks);
		if (lib.artist.tracks.Count) lib.artist.tracks.Convert().some((h, j) => {
			if ($.strip(albums[j]) == $.strip(p_album)) return orig_alb = true;
		});
		albums = tf.album0.EvalWithMetadbs(lib.artist.tracksTags);
		if (lib.artist.tracksTags.Count) lib.artist.tracksTags.Convert().some((h, j) => {
			if ($.strip(albums[j]) == $.strip(p_album)) return mtags_alb = true;
		});
		if ((orig_alb || mtags_alb) && this.albumInLibrary(p_album_artist, p_album, orig_alb, mtags_alb)) return true;
		return false;
	}

	load(x, y, mask, add, menu) {
		if (y < search.y || but.Dn) return;
		if (menu) this.type.active = menu;
		const refresh = mask == 0x0004 || mask == 0x0008; // shift or ctrl pressed (full_alb refreshes)
		let full_alb = mask == 0x0008 || mask == 0x0012; // ctrl or ctrl + shift pressed
		const mTagsAlbum = mask == 'mTagsAlbum';
		const mTagsFullAlbum = mask == 'mTagsFullAlbum';
		const remove = mask == 'remove';
		if (mTagsFullAlbum) full_alb = true;
		if (refresh) add = true; // refreshed items are always added so can compare with existing
		search.repaint();
		search.active = (y > search.y && y < search.y + this.row.h && x > this.x && x < this.x + search.w1);
		if (!ppt.showAlb || y <= search.y + this.row.h || x > panel.w - panel.sbar.sp) return;
		const i = this.get_ix(x, y);
		if (i == -1) {
			filter.clearTimer(filter.timer);
			search.clearTimer(search.timer);
			return;
		}
		if (ppt.touchControl && ui.touch_dn_id != i) return;
		switch (this.type.active) {
			case 1:
				switch (this.expanded) {
					case 0: {
						if (timer.artist.id || ppt.showSimilar && i >= this.art.similar.length || !ppt.showSimilar && i >= this.art.related.length) return;
						if (ppt.showSimilar) this.art.similar.forEach(v => v.name = v.name.replace(/^(x |>> )/, ''));
						else if (this.art.related.length) this.art.related.forEach(v => v.name = v.name.replace(/^(x |>> )/, ''));
						const item = this.artists.list[i];
						if ((this.songsMode() || ppt.mb == 2) && item) {
							const n = item.name;
							item.name = this.songsMode() ? 'x N/A In Similar Songs Mode' : 'x N/A In Chart Mode';
							txt.paint();
							if (!timer.artist.id)
								timer.artist.id = setTimeout(() => {
									if (item) item.name = n;
									txt.paint();
									timer.artist.id = null;
								}, 3000);
						} else {
							if (!item || this.artists.list.length == 1 && item.name.includes('Artists N/A')) return;
							this.artist = i == 0 ? item.name.replace(/( \[Similar\]:| \[Related\]:)/g, '') : item.name;
							search.setText();
							this.searchForAlbumNames(1, [ppt.lfmReleaseType, 4, 3][ppt.mb], this.artist, item.id ? item.id : '');
							const alb_artist = this.artists.list[0].name.replace(/( \[Related\]:)/g, '');

							if (!ppt.showSimilar && alb_artist.length && item.id) {
								const related_artists = $.file(this.art.relatedCustom) ? $.jsonParse(this.art.relatedCustom, {}, 'file') : {};
								this.artists.list[0].name.replace(/( \[Related\]:)/g, '');
								const key = alb_artist.toUpperCase();
								related_artists[key] = item.id;
								if (this.art.relatedCustomSort) {
									$.save(this.art.relatedCustom, JSON.stringify($.sortKeys(related_artists), null, 3), true);
									this.art.relatedCustomSort = false;
								} else $.save(this.art.relatedCustom, JSON.stringify(related_artists, null, 3), true);
							}
							if (i != 0) {
								item.name = '>> ' + item.name;
								txt.paint();
							}
						}
						break;
					}
					case 1: {
						if (this.artists.list.length) {
							this.deactivateTooltip();
							const item = this.artists.list[i];
							item.alb_id = 'track' + ++this.alb_id;
							if (this.loadExisting(item, true, refresh, add, remove)) {
								this.setRow(item.alb_id, 2);
								return;
							}
							if (remove) return;
							const title = item.name;
							this.setRow(item.alb_id, 1);
							this.do_youtube_track_search(item.alb_id, this.artist, title, i, item.album, item.date, add)
						}
						break;
					}
				}
				break;
			case 2: {
				if (i >= this.names.list.length) return;
				this.deactivateTooltip();
				const item = this.names.list[i];
				if (ppt.mb == 1 || !ppt.mb && ppt.lfmReleaseType == 0) {
					this.setRow(item.alb_id, 4);
					if (x < this.x + this.icon_w) {
						if (item.expanded) {
							item.expanded = false;
							this.expanded = 0;
							if (timer.artist.id || ppt.showArtists && (ppt.showSimilar && i >= this.art.similar.length || !ppt.showSimilar && i >= this.art.related.length)) return;
							this.artists.list = ppt.showSimilar ? this.art.similar : this.art.related;
							this.calcRows(true);
							txt.paint();
						} else {
							this.expanded = 1;
							this.clearIcon();
							item.expanded = '\uF107  ';
							txt.paint();
							if (this.getRowNumber(y) + 1 > this.names.minRows) alb_scrollbar.checkScroll(Math.min(i * this.row.h, (i + 1 - this.names.minRows) * this.row.h));
							this.getTracks('track' + item.alb_id, i, refresh, add, remove, x < this.x + this.icon_w);
						}
					} else {
						if (!full_alb || (ppt.mb == 1 && !item.releaseType.includes('Album') && !item.releaseType.includes('Compilation'))) { // stndAlb
							if (!remove) this.setRow(item.alb_id, 1);
							this.getTracks(item.alb_id, i, refresh, add, remove, x < this.x + this.icon_w, mTagsAlbum);
						} else { // fullAlb
							if (!mTagsFullAlbum) {
								if (this.loadExisting(item, true, refresh, add, remove, x < this.x + this.icon_w)) {
									if (x >= this.x + this.icon_w) this.setRow(item.alb_id, 2);
									return;
								}
								if (remove) return;
							}
							const alb_n = item.name;
							this.setRow(item.alb_id, 1);
							if (ppt.mb == 1) this.on_mb_releases_search_done(item.alb_id, '', this.artist, alb_n, item.date, add, mTagsFullAlbum);
							else if (!ppt.mb) {
								this.getMbReleases(item.alb_id, '', this.artist, alb_n, '', '', '', add, mTagsFullAlbum);
							}
						}
						txt.paint();
					}
				} else if (!ppt.mb) {
					this.setRow(item.alb_id, 4);
					if (this.loadExisting(item, false, refresh, add, remove)) {
						this.setRow(item.alb_id, 2)
						return;
					}
					if (remove) return;
					yt_dj.do_youtube_search(item.alb_id, ppt.lfmReleaseType == 1 ? this.artist : item.artist, ppt.lfmReleaseType == 1 ? $.stripRemaster(this.names.lfm[1][i].name) : ppt.lfmReleaseType == 2 ? $.stripRemaster(this.names.lfm[2][i].title) : this.names.lfm[3][i].title, item.alb_id, 1, pl.cache(), !add ? 1 : 2);
				} else if (ppt.mb == 2) {
					this.setRow(item.alb_id, 4);
					if (this.loadExisting(item, false, refresh, add, remove)) {
						this.setRow(item.alb_id, 2)
						return;
					}
					if (remove) return;
					yt_dj.do_youtube_search(item.alb_id, item.artist, item.title, item.alb_id, 1, pl.cache(), !add ? 1 : 2);
				}
				break;
			}
		}
		search.cursor = false;
		search.offset = search.start = search.end = search.cx = 0;
		filter.clearTimer(filter.timer);
		search.clearTimer(search.timer);
	}

	loadExisting(v, p_alb, p_refresh, p_add, p_remove, p_showTracks) {
		const handles = p_alb || !p_refresh || v.source != 2 ? v.handleList : lib.inPlaylist(v.artist, v.title, 0, true);
		if (handles.Count) {
			if (p_alb && p_showTracks && v.source == 3) {
				const titles = tf.title0.EvalWithMetadbs(handles);
				this.artists.list = titles.map((w, i) => ({
					name: w,
					handleList: new FbMetadbHandleList([handles[i]]),
					source: 3
				}));
				this.artists.list.unshift({
					name: `${v.artist} - ${v.title}`
				});
				this.calcRows(true);
				txt.paint();
				return true;
			} else if (p_alb && p_showTracks) return false;

			if (!p_refresh && !p_remove) {
				const pn = pl.selection();
				if (!p_add) pl.clear(pn);
				const ix = !p_add ? 0 : plman.PlaylistItemCount(pn);
				if (p_add) plman.UndoBackup(pn);
				plman.InsertPlaylistItems(pn, ix, handles);
				plman.ActivePlaylist = pn;
				plman.SetPlaylistFocusItem(pn, ix);
				plman.ClearPlaylistSelection(pn);
				return true;
			} else {
				const pn = pl.cache();
				handles.Sort();
				lib.db.cache.Sort();
				lib.db.cache.MakeDifference(handles);
				pl.clear(pn);
				lib.db.cache.OrderByFormat(tf.albumSortOrder, 1);
				plman.InsertPlaylistItems(pn, 0, lib.db.cache);
				v.source = ppt.libAlb == 2 ? 0 : 1;
				v.handleList = new FbMetadbHandleList();
			}
		}
		return false;
	}

	loadHandleList() {
		const pn = pl.selection();
		pl.clear(pn);
		plman.InsertPlaylistItems(pn, 0, this.handleList);
		plman.ActivePlaylist = pn;
		plman.SetPlaylistFocusItem(pn, 0);
		plman.ClearPlaylistSelection(pn);
	}

	lockArtist() {
		this.art.lock = !this.art.lock;
		if (this.art.lock) return;
		this.orig_artist = this.artist = name.artist();
		this.artist_title = name.artist_title();
		search.setText();
		this.searchForAlbumNames(0, [ppt.lfmReleaseType, 4, 3][ppt.mb]);
	}

	mbSort() {
		if (!ppt.mbReleaseType) {
			if (!ppt.mbGroup) {
				$.sort(this.names.mb[0], 'releaseType');
				$.sort(this.names.mb[0], 'date', 'rev')
			} else {
				$.sort(this.names.mb[0], 'date', 'rev');
				$.sort(this.names.mb[0], 'releaseType');
			}
		}
	}

	mbtn_dn(x, y) {
		if (!ppt.showAlb || panel.halt()) return;
		if (ppt.touchControl) ui.touch_dn_id = this.get_ix(x, y);
	}

	move(x, y) {
		if (!ppt.showAlb || panel.halt()) return;
		this.type.active = panel.m.y > this.artists.y ? 1 : panel.m.y > this.names.y && panel.m.y < this.names.y + this.names.h ? 2 : 0;
		if (but.Dn) return;
		if (y > search.y && y < search.y + this.row.h && x > this.x && x < this.x + search.w1 && ppt.mb != 2) {
			window.SetCursor(32513);
			search.edit = true;
		} else search.edit = false;
		if (y > filter.y && y < filter.y + filter.h && x > filter.x && x < filter.x + filter.w1) {
			window.SetCursor(32513);
			filter.edit = true;
		} else filter.edit = false;
		if (y > search.y && y < search.y + this.row.h && x < this.x + this.w && x > this.x + search.w1) {
			window.SetCursor(32649);
		}
		if (!this.artists.length && !this.names.list.length) return;

		this.names.m_i = -1;
		this.artists.m_i = -1;
		if (panel.m.y > art_scrollbar.item_y && panel.m.y < art_scrollbar.item_y + this.artists.drawn * this.row.h) this.artists.m_i = this.get_ix(x, y);
		else if (panel.m.y > alb_scrollbar.item_y && panel.m.y < alb_scrollbar.item_y + this.names.drawn * this.row.h) this.names.m_i = this.get_ix(x, y);

		if (this.names.m_i != -1) {
			this.check_tooltip(this.names.m_i, x, y);
		} else if (this.artists.m_i != -1) {
			this.check_tooltip(this.artists.m_i, x, y);
		} else this.deactivateTooltip();

		if (this.names.m_i == this.names.cur_m_i && this.artists.m_i == this.artists.cur_m_i) return;
		this.names.cur_m_i = this.names.m_i;
		this.artists.cur_m_i = this.artists.m_i;
		txt.paint();
	}

	numFormat(n) {
		if (!n) return '0';
		return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	}

	openSite() {
		switch (true) {
			case ppt.mb == 1:
				$.browser('https://musicbrainz.org/artist/' + this.ar_mbid);
				break;
			case !ppt.mb:
				$.browser('https://www.last.fm/music/' + encodeURIComponent(this.artist));
				break;
		}
	}

	on_albums_search_done(list, mbid, rec, mode) {
		this.ar_mbid = mbid;
		this.ar_mbid_done = this.artist;
		if (mode == 3 && this.done(this.artist)) {
			/*only_mbid*/
			txt.repaint();
			return;
		}
		this.names.done[mode] = rec;
		if (mode == 4) this.names.data = list;
		this.analyse(list, mode);
		this.calcRowsNames();
		txt.paint();
	}

	on_key_down(vkey) {
		if (!ppt.showAlb || panel.halt()) return;
		switch (vkey) {
			case vk.pgUp:
				if (!this.scrollbarType()) break;
				this.scrollbarType().this.pageThrottle(1);
				break;
			case vk.pgDn:
				if (!this.scrollbarType()) break;
				this.scrollbarType().this.pageThrottle(-1);
				break;
		}
	}

	on_mb_releases_search_done(p_alb_id, p_rg_mbid, p_album_artist, p_album, p_prime, p_extra, p_date, p_add, p_mTags, p_re_mbid) {
		this.do_youtube_search(p_alb_id, p_album_artist, p_album, p_date, p_add, p_mTags);
		txt.paint();
	}

	on_playback_new_track() {
		if (dj.pss)
			if (window.IsVisible) dj.force_refresh = 1;
			else dj.force_refresh = 0;
		this.art.search = false;
		if (!ppt.showAlb || (this.art.lock && this.artist) || panel.block()) { // block
			this.get = true;
			txt.repaint();
			return;
		}
		this.artist_title = name.artist_title();
		search.setText();
		if (dj.pss) dj.force_refresh = 2;
		filter.clearTimer(filter.timer);
		search.clearTimer(search.timer);
		this.searchForAlbumNames(0, [ppt.lfmReleaseType, 4, 3][ppt.mb]);
	}

	on_similar_search_done(list, n) {
		if (!list.length) {
			list = [];
			list[0] = {
				name: 'Similar Artists N/A',
				score: ''
			}
		}
		this.art.similar = list.slice(0, 100);
		if (this.art.similar.length > 1) {
			this.art.similar[0] = {
				name: n + ' [Similar]:',
				score: 'Score'
			};
		}
		if (ppt.showSimilar) {
			this.artists.list = this.art.similar;
			this.calcRowsArtists();
		}
		txt.paint();
	}

	on_youtube_search_done(p_alb_id, link, p_artist, p_title, p_ix, p_done, p_pn, p_alb_set, p_length, p_orig_title, p_yt_title, p_full_alb, p_fn, p_type, p_album, p_date, p_mTags) {
		if (link && link.length) {
			this.setRow(p_alb_id, 2);
			txt.paint();
			if (!p_mTags) {
				panel.addLoc(link, pl.cache(), false, false, true, true);
				panel.addLoc(link, pl.selection(), false, false, true);
			} else {
				const type_arr = ['YouTube Track', 'Prefer Library Track', 'Library Track'];
				panel.add_loc.mtags[p_alb_id] = [];
				panel.add_loc.mtags[p_alb_id].push({
					'@': link,
					'ALBUM': p_title,
					'ARTIST': p_artist,
					'DATE': p_date,
					'DURATION': p_length.toString(),
					'TITLE': p_title + ' (Full Album)',
					'YOUTUBE_TITLE': p_yt_title,
					'SEARCH_TITLE': p_orig_title ? p_orig_title : [],
					'TRACK_TYPE': type_arr[ppt.libAlb]
				});
				mtags.save(p_alb_id, p_artist, true);
			}
		}
	}

	on_youtube_track_search_done(p_alb_id, link, p_artist, p_title, p_ix, p_done, p_pn, p_alb_set, p_length, p_orig_title, p_yt_title, p_full_alb, p_fn, p_type, p_album, p_date) {
		if (link && link.length) {
			this.setRow(p_alb_id, 2);
			txt.paint();
			panel.addLoc(link, pl.cache(), false, false, true, true);
			panel.addLoc(link, pl.selection(), false, false, true);
		}
	}

	reset() {
		search.offset = search.start = search.end = search.cx = 0;
		this.orig_artist = this.artist = name.artist();
		this.artist_title = name.artist_title();
		search.text = this.songsMode() ? this.artist_title : ppt.mb == 2 ? `${this.chartDate}` : this.artist;
		this.names.cur = [];
		this.art.cur_sim = '';
		this.searchForAlbumNames(0, [ppt.lfmReleaseType, 4, 3][ppt.mb]);
	}

	resetAlbum(mode) {
		this.names.done[mode] = false;
		if (mode == 4) {
			this.names.mb = [
				[],
				[],
				[],
				[],
				[]
			];
			this.names.data = [];
		} else this.names.lfm[mode] = [];
		this.names.list = [];
	}

	resetAlbums(new_artist, mode, bypass) {
		this.names.list = [];
		this.handleList = new FbMetadbHandleList();
		this.topTracksAvailable = false;
		this.resetAlbum(mode);
		if (ppt.showAlb) window.Repaint(true);
		if (!bypass) {
			this.ar_mbid_done = this.ar_mbid = false;
		}
		if (mode == 4) this.names.cur[4] = new_artist;
		else this.names.cur[mode] = (mode < 2 ? new_artist : mode == 2 ? this.artist_title : `Singles Chart ${this.chartDate}`);
		this.names.validPrime = false;
	}

	scrollbarType() {
		return this.type.active == 1 ? art_scrollbar : this.type.active == 2 ? alb_scrollbar : 0;
	}

	searchForAlbumNames(type, mode, new_artist, ar_id) {
		switch (type) {
			case 0: { // new track or reset
				if (!new_artist) new_artist = this.artist;
				this.get = false;
				if (!new_artist && mode != 3) return;
				this.art.sim_done = true;
				const albums = new DldAlbumNames(this.on_albums_search_done.bind(this));
				if (ppt.showArtists && ppt.showSimilar && this.art.cur_sim != new_artist || !new_artist) this.searchForSimilarArtists(new_artist);
				const only_mbid = ppt.mb == 2 && new_artist != this.ar_mbid_done;
				if (only_mbid) this.ar_mbid_done = new_artist;
				if (this.done(new_artist) && !only_mbid) return;
				if (!ppt.showSimilar) {
					this.artists.list = [];
					this.art.related = [];
					this.artists.list[0] = {
						name: 'Searching...',
						id: ''
					};
					this.calcRowsArtists();
				}
				if (!only_mbid) this.resetAlbums(new_artist, mode);
				albums.execute(new_artist,only_mbid, '', mode);
				break;
			}
			case 1: // mouse click similar or related artist
				if (ppt.showSimilar) this.art.related = [];
				else this.art.similar = [];
				this.resetAlbums(new_artist, mode);
				if (ar_id) { // get album names
					const albums = new DldMoreAlbumNames(this.on_albums_search_done.bind(this));
					albums.execute(ar_id, mode);
				}
				else { // get mbid then album names
					const albums = new DldAlbumNames(this.on_albums_search_done.bind(this));
					albums.execute(new_artist, false, ppt.showSimilar ? false : true, mode);
				}
				if (ppt.showArtists && !ppt.showSimilar) {
					this.art.similar[0] = {
						name: 'Searching...',
						score: ''
					};
					this.art.cur_sim = '';
					this.art.sim_done = false;
				}
				this.art.cur = new_artist;
				break;
			case 2: // but actions mostly
				timer.clear(timer.artist);
				if (!this.ar_mbid_done) {
					this.resetAlbum(mode);
					txt.paint(); /*immediate reset*/
					return timer.artist.id = setTimeout(() => {
						this.reset();
						timer.artist.id = null;
					}, 1500);
				}
				if (this.done(new_artist)) {
					this.setNames([this.names.lfm[mode], this.names.mb[ppt.mbReleaseType], this.names.chart][ppt.mb]);
					this.calcRowsNames();
					txt.paint();
					return;
				} else { // get album names if no data
					const albums = new DldMoreAlbumNames(this.on_albums_search_done.bind(this));
					this.resetAlbums(new_artist, mode, true);
					albums.execute(ar_id, mode);
				}
				break;
		}
	}

	searchForSimilarArtists(n) {
		if (!n) {
			this.artists.list = [];
			this.art.similar = [];
			return this.on_similar_search_done([], '');
		}
		if (n == this.art.cur_sim) return;
		this.art.cur_sim = n;
		this.artists.list = [];
		this.art.sim_done = true;
		this.art.similar = [];
		this.artists.list[0] = {
			name: 'Searching...',
			id: '',
			score: ''
		};
		this.calcRowsArtists();
		const similar = new LfmSimilarArtists(() => similar.onStateChange(), this.on_similar_search_done.bind(this));
		similar.search(n);
	}

	setRow(alb_id, style) {
		const pane = typeof alb_id == 'number' ? 'upper' : 'lower';
		let name = '';
		const list = pane == 'upper' ? this.names.list : this.artists.list;
		const ix = list.findIndex(v => {
			if (!v.alb_id || !alb_id) return false;
			return v.alb_id == alb_id
		});
		if (ix != -1) { // set display item
			const o = list[ix];
			name = o.name = o.name.replace(/^(x |> |>> )/, '');
			if (style == 4) return;
			switch (style) {
				case 0:
					name = 'x ' + name;
					break;
				case 1:
					name = '> ' + name;
					break;
				case 2:
					name = '>> ' + name;
					break;
				case 3:
					name = (panel.add_loc.alb[alb_id].length ? '>> ' : 'x ') + name;
					break;
			}
			o.name = name;
			if (pane == 'lower') return;
			const baseType = o.type; // set original list item
			const mb = baseType < 6 ? 1 : baseType == 9 ? 2 : 0;
			const j = mb == 1 ? baseType : baseType - 6;
			const base = [this.names.lfm[j] || [], this.names.mb[j] || [], this.names.chart || []][mb];
			const base_ix = base.findIndex(v => v.alb_id == alb_id);
			if (base_ix != -1) base[base_ix].name = name;
		}
	}

	setSimilar() { // get similar artists after mouse click trigger if needed
		if (!this.art.sim_done) {
			this.searchForSimilarArtists(this.art.cur);
			this.art.sim_done = true;
		}
		else {
			this.artists.name.w = this.w - this.names.item.w.score;
			this.artists.item.w = this.names.item.w.score;
			if (ppt.showSimilar) {
				if (this.art.cur_sim == this.artist) {
					this.artists.list = this.art.similar;
					this.calcRowsArtists();
				} else {
					this.searchForSimilarArtists(this.artist);
				}
			} else {
				this.artists.name.w = this.w * 2 / 3 - this.names.item.w.sp;
				this.	artists.item.w = this.w / 3;
				this.artists.list = this.art.related;
				this.calcRowsArtists();
				txt.paint();
			}
		}
	}

	siteNameWidth() {
		return [this.names.lfm_track.w, this.w - this.names.item.w.date - this.names.mb_rel.w[ppt.mbReleaseType] - this.img.sp, this.names.lfm_chart.w][ppt.mb];
	}

	songsMode() {
		return !ppt.mb && ppt.lfmReleaseType == 2;
	}

	tipText(item, lowerPane) {
		const tipTxt = ['Not Found in Library', 'Load from Youtube', (!ppt.mb && !ppt.lfmReleaseType || ppt.mb == 1) && !item.fullAlbum && !lowerPane ? 'Load Cached Tracks' : 'Load from Cache', 'Load from Library', 'Not Available [foo_youtube not Installed]'][item.source];
		if (lowerPane) return tipTxt;
		else return tipTxt + (item.fullAlbum ? ' (Full Album)' : '');
	}

	toggle(n) {
		switch (n) {
			case 'lfmSortPC':
				ppt.toggle('lfmSortPC');
				if (!this.names.lfm[ppt.lfmReleaseType].length) return;
				if (ppt.lfmSortPC) {
					this.names.list.forEach(v => v.playcount = v.playcount.replace(/,/g, ''));
					$.sort(this.names.lfm[ppt.lfmReleaseType], 'playcount', 'numRev');
					this.names.list.forEach(v => v.playcount = this.numFormat(v.playcount));
				} else $.sort(this.names.lfm[ppt.lfmReleaseType], 'rank', 'num');
				if (ppt.mb == 1) return;
				this.setNames(this.names.lfm[ppt.lfmReleaseType]);
				break;
			case 'mbGroup':
				ppt.toggle('mbGroup');
				if (!this.names.mb[0].length) return;
				this.mbSort();
				if (!ppt.mb || ppt.mbReleaseType) return;
				this.setNames(this.names.mb[0]);
				break;
			case 'mode':
				this.names.name.w = this.siteNameWidth();
				but.refresh(true);
				search.setText();
				this.searchForAlbumNames(2, [ppt.lfmReleaseType, 4, 3][ppt.mb], this.songsMode() ? this.artist_title : ppt.mb == 2 ? `${this.chartDate}` : this.artist, this.ar_mbid);
				break;
			case 'showArtists':
				ppt.toggle('showArtists');
				if (ppt.showArtists) this.setSimilar();
				this.expanded = 0;
				this.calcRows();
				break;
			case 'show':
				ppt.toggle('showAlb');
				if (panel.video.mode && !ppt.showAlb) panel.setVideo();
				if (!ui.style.textOnly) img.updSeeker();
				but.setSearchBtnsHide();
				if (panel.video.mode) {
					if (ppt.showAlb && $.eval('%video_popup_status%') == 'visible') fb.RunMainMenuCommand('View/Visualizations/Video');
					if (!ppt.showAlb && $.eval('%video_popup_status%') == 'hidden' && panel.video.show) fb.RunMainMenuCommand('View/Visualizations/Video');
				}
				if (panel.video.mode && dj.pss) {
					dj.force_refresh = 2;
					dj.refreshPSS();
				}
				if (!ppt.showAlb || ppt.mb == 2) {
					search.cursor = false;
					search.offset = search.start = search.end = search.cx = 0;
					filter.clearTimer(filter.timer);
					search.clearTimer(search.timer);
				}
				if (ppt.showAlb && !panel.halt()) this.getAlbumsFallback();
				if (!panel.image.show) return;
				if (!fb.IsPlaying || ppt.focus && !panel.video.mode) on_item_focus_change();
				if (!ppt.showAlb && ppt.artistView && ppt.cycPhoto) timer.image();
				else timer.clear(timer.img);
				break;
			case 'showLive':
				ppt.toggle('showLive');
				this.type.mb[0] = (ppt.showLive ? 'All Releases' : 'Releases');
				alb.calcText();
				if (!this.names.mb[0].length) {
					txt.paint();
					return;
				}
				this.names.mb[0] = [];
				if (!ppt.mb || ppt.mbReleaseType) return;
				this.analyse('', 4);
				this.calcRowsNames();
				txt.paint();
				break;
		}
	}

	treeTooltipFont() {
		return [ui.font.main.Name, ui.font.main.Size, ui.font.main.Style];
	}

	wheel() {
		this.names.m_i = -1;
		this.names.cur_m_i = 0;
		this.artists.m_i = -1;
		this.artists.cur_m_i = 0;
	}
}