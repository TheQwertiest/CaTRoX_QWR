class Favourites {
	addCurrentStation(source) {
		if (!source.length || source == 'N/A') return;
		const djQuery = index.cur_dj_query;
		let station_array = ppt.favourites;
		let djType = index.cur_dj_type;
		if (djType == 4) djType = 1;

		station_array = !station_array.includes('No Favourites') ? $.jsonParse(station_array, []) : [];
		if (station_array.length) station_array = station_array.filter(v => v.source != source + (!djQuery ? '' : ' [Query - ' + index.n[3] + index.nm[3] + ']') || v.type != djType);
		station_array.push({
			'source': source + (!djQuery ? '' : ' [Query - ' + index.n[3] + index.nm[3] + ']'),
			'type': djType,
			'query': djQuery
		});

		if (station_array.length > 30) station_array.splice(0, 1);
		this.save(JSON.stringify(station_array));
	}

	init() {
		if (this.save_fav_to_file()) {
			const n = `${panel.yttm}favourites.json`;
			if (!$.file(n)) $.save(n, 'No Favourites', true);
			ppt.favourites = $.open(n);
		}
		this.stations = ppt.favourites;
		this.stations = !this.stations.includes('No Favourites') ? $.jsonParse(this.stations, []) : [];
		if (this.stations.length) $.sort($.sort(this.stations, 'type', 'num'), 'source', 0);
	}

	removeCurrentStation() {
		let djType = index.cur_dj_type;
		let source;
		if (djType == 4) djType = 1;
		const found = this.stations.some(v => {
			if (dj.on() && index.cur_dj_source + (!index.cur_dj_query ? '' : ' [Query - ' + index.n[3] + index.nm[3] + ']') == v.source && djType == v.type) {
				return source = v.source;
			}
		});
		if (!found) return;
		let station_array = ppt.favourites;
		station_array = !station_array.includes('No Favourites') ? $.jsonParse(station_array, []) : [];
		station_array = station_array.filter(v => v.source != source);
		this.save(station_array.length ? JSON.stringify(station_array) : 'No Favourites');
	}

	save(fv) {
		ppt.favourites = fv;
		this.stations = !fv.includes('No Favourites') ? $.jsonParse(fv, []) : [];
		if (this.stations.length) $.sort($.sort(this.stations, 'type', 'num'), 'source', 0);
		if (this.save_fav_to_file()) $.save(`${panel.yttm}favourites.json`, fv, true);
	}

	save_fav_to_file() {
		return panel.id.local ? true : false; // use return true for file save/load of favourites
	}

	toggle_auto(djSource) {
		ppt.toggle('autoFav');
		if (ppt.autoFav) this.addCurrentStation(djSource);
	}
}

class NewAutoDJ {
	constructor() {
		const djName = ppt.djName.split(',');

		this.cur_lfm_variety == ppt.cur_lfm_variety;
		this.cur_dj_mode = ppt.cur_dj_mode;
		this.cur_dj_query = ppt.cur_dj_query;
		this.cur_dj_range = ppt.cur_dj_range;
		this.cur_dj_source = ppt.cur_dj_source;
		this.cur_dj_type = ppt.cur_dj_type;

		if (![10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 125, 150, 200, 250].includes(this.cur_lfm_variety)) {
			ppt.cur_lfm_variety = this.cur_lfm_variety = 50;
		}

		if (this.cur_dj_type < 0 || this.cur_dj_type > 4) {
			this.cur_dj_type = $.clamp(this.cur_dj_type, 0, 4);
			ppt.cur_dj_type = this.cur_dj_type;
		}

		let presets = ppt.presets.replace(/^[,\s]+|[,\s]+$/g, '');
		let p_name = presets.split(',');

		if (p_name.length != 12) {
			const defPresets = 'Highly popular,25,Popular,50,Normal,75,Varied,100,Diverse,150,Highly diverse,200';
			ppt.presets = defPresets;
			p_name = defPresets;
		}

		this.counter = 0;
		this.lot = 0;
		this.playedArtists = $.jsonParse(ppt.playedArtists, false);
		this.playedTracks = $.jsonParse(ppt.playedTracks, false);
		this.pool = [];
		this.pop1 = 0.8;
		this.pop2 = 0.2;
		this.presets = [];
		this.djFound = false;
		this.weight = [
			[0.5, 0.9, 0.2],
			[0.9, 0.9, 0],
			[0.2, 0.2, 0],
			[0.5, 0.9, 0.9],
			[0.2, 0.2, 0],
			['N/A', 'N/A', 0]
		];
		this.yt_pref_kw = ppt.yt_pref_kw.replace(/\s+/g, '').split('//');
	
		this.feed = {
			song: $.split(ppt.songFeed, 0),
			tag: $.split(ppt.tagFeed, 0)
		}

		const wt = ['djBiasArtist', 'djBiasGenreTracks', 'djBiasSimilarArtists', 'djBiasSimilarSongs', 'djBiasGenreArtists', 'djBiasQuery'].map(v => $.split(ppt[v], 1))
		this.weight.forEach((v, i, arr) => {
			arr[i] = [this.calcBias(wt[i][1]), this.calcBias(wt[i][3]), this.calcBias(wt[i][5])];
		});

		for (let i = 0; i < p_name.length; i += 2) this.presets.push(p_name[i]);
		presets = presets.replace(/\s+/g, '').split(',');
		for (let i = 1; i < presets.length; i += 2) this.pool.push(Math.max(parseFloat(presets[i]), 5));
		if (!this.pool.length) this.pool.push(50)

		ppt.djMode = !ppt.djOwnData && ppt.libDj < 2 ? 1 : !ppt.djOwnData ? 2 : 3;
		ppt.djMode = Math.max(ppt.djMode, 1);

		this.n = ['', djName[0], djName[2], djName[4]];
		this.nm = ['', djName[1] || ' Auto DJ', djName[3] || ' Auto DJ', djName[5] || ' Auto DJ', djName[7] || ' \u2219 '];

		this.cur_dj_mode = Math.max(this.cur_dj_mode, 1);
		if (this.cur_dj_range > this.pool.length - 1 || this.cur_dj_range < 0) {
			ppt.cur_dj_range = this.cur_dj_range = 0;
		}

		if (ppt.djRange > this.pool.length - 1 || ppt.djRange < 0) ppt.djRange = 0;
		if (!this.feed.song.length) this.feed.song.push(250);
		if (!this.feed.tag.length) this.feed.tag.push(500);
	}

	// Methods

	artist(length) {
		if (!length) return 0;
		let a_ind = 0;
		if (this.playedArtists.length != 0 || this.cur_dj_type == 4) {
			const r = Math.random();
			if (ppt.randomArtist) a_ind = this.getIndex(0, '', length -= 1, 3, 0) + 1;
			else if (this.playedArtists.includes(0) || r > (this.cur_lfm_variety * -0.13 + 19.5) / 100) a_ind = this.getIndex(0, '', length -= 1, 2, 0) + 1;
		}
		this.playedArtists.push(a_ind);
		if (this.playedArtists.length > 6) this.playedArtists.splice(0, 1);
		ppt.playedArtists = JSON.stringify(this.playedArtists);
		return a_ind;
	}

	autoDjFound(p_q) {
		if (this.djFound) return;
		this.djFound = true;
		this.counter = 0;
		if (dj.search) {
			this.playedArtists = [];
			this.playedTracks = [];
			ppt.playedArtists = JSON.stringify(this.playedArtists);
			ppt.playedTracks = JSON.stringify(this.playedTracks);
		}
		this.lot = 0;
		dj.list.items = [];
		dj.param = false;

		ppt.cur_dj_source = this.cur_dj_source;
		ppt.cur_dj_type = this.cur_dj_type;
		ppt.cur_lfm_variety = this.cur_lfm_variety;
		ppt.cur_dj_mode = this.cur_dj_mode;
		ppt.cur_dj_query = p_q;
		ppt.cur_dj_range = this.cur_dj_range;
	}

	basePool(list, threshold, length) {
		let count = 0;
		length = Math.min(list.length, length);
		for (let i = 0; i < length; ++i)
			if (list[i].playcount > threshold) count++;
		return count;
	}

	calcBias(v) {
		if (isNaN(v)) return 0.2;
		else return v >= 10 ? 0 : Math.min(1 / Math.abs(v), 0.9)
	}

	curDefBias() {
		let val = 0;
		if (!dj.on() || ppt.playTracks) return val;
		val = this.weight[this.cur_dj_type][this.cur_dj_mode - 1];
		if (ppt.djMode == 3) {
			if (ppt.sortAutoDJ != 2) {
				if (this.cur_dj_query) val = this.weight[5][2];
			} else {
				val = 0.9;
			}
		}
		if (val === 0) return 10;
		else return Math.round(1 / val);
	}

	filter_yt(title, descr) {
		try {
			if (title && RegExp(ppt.ytTitleFilter, 'i').test(title)) return true;
			if (descr && RegExp(ppt.ytDescrFilter, 'i').test(descr)) return true;
			return false;
		} catch (e) {
			$.trace("Syntax error in custom regular expression. Panel Property: YouTube 'Live' Filter...");
			return false;
		}
	}

	getAutoDj(djSource, djMode, djType, djVariety, djRange, djFavourite, djQuery) {
		ppt.playTracks = false;
		if (djQuery && djMode != 3) djMode = 3;
		if (djType == 3 && djMode == 3) {
			djMode = 2;
		}
		dj.text = 'Searching...\n For ' + (djMode < 2 || !ppt.playlistSoftMode ? 'Auto DJ Tracks' : 'Auto DJ Tracks / Playlist');
		txt.repaint();
		this.djFound = false;
		dj.search = true;
		this.cur_dj_source = djSource;
		this.cur_dj_mode = djMode;
		dj.sync = false;
		this.cur_dj_query = djQuery;
		this.cur_dj_type = djType;
		this.cur_dj_range = $.clamp(djRange, 0, this.pool.length - 1);
		this.cur_lfm_variety = djVariety;
		setTimeout(() => index.load(djSource, djMode, djType, djVariety, djRange, djFavourite, djQuery), 200);
		ppt.trackCount = 0;
	}

	getGenreTrack(length, list, dj_lib) {
		if (!length) return;
		this.setBias();
		const g_ind = this.getIndex(dj_lib, list, length, 1, 0);
		this.playedTracks.push(g_ind);
		if (this.playedTracks.length > length - 1) this.playedTracks.splice(0, 1);
		ppt.playedTracks = JSON.stringify(this.playedTracks);
		if (!dj_lib) {
			this.playedArtists.push($.strip(list[g_ind].artist));
			if (this.playedArtists.length > 6) this.playedArtists.splice(0, 1);
			ppt.playedArtists = JSON.stringify(this.playedArtists);
		}
		return g_ind;
	}

	getIndex(dj_lib, list, listLength, artistType, titleType) {
		const pp1 = dj_lib || artistType < 2 ? this.pop1 : 0.8;
		const pp2 = dj_lib || artistType < 2 ? this.pop2 : 0.2;
		let ind = Math.floor(listLength * Math.random());
		let j = 0;
		switch (dj_lib) {
			case 0:
				while (((pp1 > 0.1 && artistType != 3 ? ((((1 - ind / listLength) * pp1 + pp2) + Math.random()) <= 1) : false) || (artistType ? this.playedArtists.includes(artistType > 1 ? ind + 1 : $.strip(list[ind].artist)) : false) || (artistType < 2 ? this.xmasSong(list[ind].title) : false) || (artistType < 2 && titleType < 2 ? this.playedTracks.includes(titleType ? $.strip(list[ind].title) : ind) : false)) && j < listLength) {
					ind = Math.floor(listLength * Math.random());
					j++;
				}
				break;
			case 1:
				while (((pp1 > 0.1 ? ((((1 - ind / listLength) * pp1 + pp2) + Math.random()) <= 1) : false) || (artistType ? this.playedArtists.includes($.strip(list[ind].artist)) : false) || this.xmasSong(list[ind].title) || this.playedTracks.includes(titleType ? list[ind].title : ind)) && j < listLength) { // <-title already stripped
					ind = Math.floor(listLength * Math.random());
					j++;
				}
				break;
			case 2:
				while (((pp1 > 0.1 ? ((((1 - ind / listLength) * pp1 + pp2) + Math.random()) <= 1) : false) || (artistType ? this.playedArtists.includes($.strip(tf.artist0.EvalWithMetadb(list[ind]))) : false) || this.xmasSong(tf.title0.EvalWithMetadb(list[ind])) || this.playedTracks.includes($.strip(tf.title0.EvalWithMetadb(list[ind])))) && j < listLength) {
					ind = Math.floor(listLength * Math.random());
					j++;
				}
				break;
		}
		return ind;
	}

	getRange(djType, r) {
		r = $.clamp(r, 0, this.pool.length - 1);
		let range = 50;
		if (djType != 1 && djType != 3) {
			range = djType ? this.pool[r] : Math.max(this.pool[r], 50);
			if (isNaN(range)) range = 50;
			range = Math.min(range, 1000);
		} else if (djType == 1) {
			range = this.pool[r] * this.feed.tag[1];
			range = $.clamp(range, 10, 1000);
			if (isNaN(range)) range = 500;
		} else {
			range = this.pool[r] * this.feed.song[1];
			range = $.clamp(range, 10, 250);
			if (isNaN(range)) range = 250;
		}
		return Math.floor(range);
	}

	load(djSource, djMode, djType, djVariety, djRange, djFavourite, djQuery) {
		const logName = !ppt.playlistSoftMode ? this.n[djMode] + this.nm[djMode] + ': ' : '';
		if (djMode == 3 && ppt.autoDJFilter) $.trace(this.n[djMode] + this.nm[djMode] + (dj.filter.length ? ': ' + 'Library Tracks Skipped: ' + dj.filter : ''));
		if (djMode < 2 || (djType == 2 || djType == 4)) {
			dj.searchForArtist(djSource, djMode, djType, djVariety, djMode ? this.getRange(djType, djRange) : '', djType != 1 && djType != 3 && this.getRange(djType, djRange) < 101 && ppt.curPop ? true : false, djFavourite);
			if (djMode > 1 && djType == 4) $.trace(logName + (djMode == 2 ? 'Filtered Library for Tracks in Last.fm Top Tracks Lists for Top "' + djSource + '" Artists' : 'Last.fm Top "' + djSource + '" Artists: Pool: Matching Library Tracks') + '\nAuto DJ Independent of Genre Tag in Music Files');
			if (djMode > 1 && djType == 2) $.trace(logName + (djMode == 2 ? 'Filtered Library for Tracks in Last.fm Top Tracks Lists for "' : 'Pool: Library Tracks for "') + djSource + ' and Similar Artists"');
		} else if (djType < 2 || djType == 3) {
			dj.medLib('', djSource, djMode, djType, 'N/A', djMode == 1 ? '' : this.getRange(djType, djRange), djQuery);
			$.trace(logName + (djMode == 2 ? 'Filtered Library for Tracks in Last.fm Top Track List for "' + djSource + '"' + (djType == 1 ? '\nAuto DJ Independent of Genre Tag in Music Files' : '') : (!djQuery ? (djType == 0 ? 'Artist' : 'Genre') + ' IS ' + djSource : 'Query: ' + djSource) + ': Pool: Matching Library Tracks'));
		}
	}

	libDjLoad(items, djType, mode, list) {
		const handleList = new FbMetadbHandleList();
		const pn = pl.dj();
		const no = dj.get_no(dj.limit, plman.PlaylistItemCount(pn));
		let count, h_ind;
		this.setBias();
		switch (mode) {
			case 2: // lfmData
				count = items.length;
				if (count < this.limit + 2) return;
				for (let i = 0; i < no; i++) {
					h_ind = djType != 1 && djType != 3 ? this.getIndex(1, items, count, djType ? 1 : 0, 1) : this.getGenreTrack(count, items, 1);
					if (!list || !list.Count) return;
					handleList.Add(list[items[h_ind].id]);
					if (count) {
						this.playedArtists.push($.strip(items[h_ind].artist));
						if (this.playedArtists.length > 6) this.playedArtists.splice(0, 1);
						ppt.playedArtists = JSON.stringify(this.playedArtists);
					}
					if (count && djType != 1 && djType != 3) {
						this.playedTracks.push(items[h_ind].title);
						if (this.playedTracks.length > Math.floor(count * 0.9)) this.playedTracks = [];
						ppt.playedTracks = JSON.stringify(this.playedTracks);
					}
				}
				break;
			case 3: // ownData
				count = items.Count;
				if (count < this.limit + 2) return;
				for (let i = 0; i < no; i++) {
					h_ind = this.getIndex(2, items, count, djType ? 1 : 0, 0);
					handleList.Add(items[h_ind]);
					if (count) {
						this.playedArtists.push($.strip(tf.artist0.EvalWithMetadb(items[h_ind])));
						this.playedTracks.push($.strip(tf.title0.EvalWithMetadb(items[h_ind])));
						if (this.playedArtists.length > 6) this.playedArtists.splice(0, 1);
						ppt.playedArtists = JSON.stringify(this.playedArtists);
						if (this.playedTracks.length > Math.floor(count * 0.9)) this.playedTracks = [];
						ppt.playedTracks = JSON.stringify(this.playedTracks);
					}
				}
				break;
		}
		if (handleList.Count) {
			panel.add_loc.timestamp = Date.now();
			plman.UndoBackup(pn);
			plman.InsertPlaylistItems(pn, plman.PlaylistItemCount(pn), handleList);
		}
	}

	pref_yt(kw, n) {
		try {
			if (n && RegExp(kw, 'i').test(n)) return true;
			return false;
		} catch (e) {
			$.trace("Syntax error in custom regular expression. Panel Property: YouTube 'Preference'...");
			return false;
		}
	}

	reset_add_loc() {
		panel.add_loc.std = [];
		panel.add_loc.ix = 0;
		yt_dj.received = 0;
		yt_dj.hl = new FbMetadbHandleList();
		yt_dj.searchParams = [];
	}

	setBias() {
		this.pop2 = !ppt.cusBestTracksBias ? this.weight[this.cur_dj_type][this.cur_dj_mode - 1] : this.calcBias(ppt.cusBestTracksBias);
		if (ppt.cur_dj_mode == 3) {
			if (ppt.sortAutoDJ != 2) {
				if (ppt.cur_dj_query) this.pop2 = !ppt.cusBestTracksBias ? this.weight[5][2] : this.calcBias(ppt.cusBestTracksBias);
			} else {
				this.pop2 = !ppt.cusBestTracksBias ? 0.9 : this.calcBias(ppt.cusBestTracksBias);
			}
		}
		this.pop1 = 1 - this.pop2;
	}

	track(list, artist, name, djMode, cur) {
		if (!list.length) return 0;
		const extend_pool = this.pool[this.cur_dj_range];
		const pc_adjust = cur ? ppt.pc_cur_adjust / 3334 : ppt.pc_at_adjust / 20000;
		const sw = extend_pool < 51 ? 0 : extend_pool < 100 ? 1 : 2
		let extend = false;
		let filter, h_ind = 0;
		let min_pool = extend_pool * (extend_pool < 251 ? 0.15 : 0.12);
		let pool = 0;
		let threshold = 1000 * pc_adjust / extend_pool * 1000 / 6;
		let min_filter = threshold * 0.3; /*calc before higher hot values*/
		if (extend_pool < 100) threshold = Math.min(threshold * 2.25 * (100 - extend_pool) / 25, 15000 * pc_adjust);
		min_pool = Math.floor(sw == 1 ? min_pool - 1 : extend_pool > 149 ? Math.max(min_pool, 25) : min_pool);
		const h_factor = Math.max(4 * min_pool / 7, 3); /*calc before min value set*/
		if (min_pool < 7) min_pool = Math.min(extend_pool, 7);
		const seed_pool = Math.floor(min_pool * (extend_pool < 126 ? 3 : 2.5));
		if (djMode != 2 || !artist) {
			if (sw) extend = Math.random() < 0.6 ? false : true;
		} else extend = true;
		const max_pool = Math.min(sw == 0 ? extend_pool : extend ? extend_pool : sw == 1 ? 50 : Math.round(extend_pool / 2), list.length);
		if (artist && this.playedTracks.length > Math.min(Math.floor(list.length * 0.9), 100)) {
			this.playedTracks = [];
			ppt.playedTracks = JSON.stringify(this.playedTracks);
		}
		this.setBias();
		if (djMode == 1 && ppt.refineLastfm || djMode == 2) {
			threshold += Math.floor(threshold * 2 / 3 * Math.random());
			if (!artist) threshold *= Math.min(1 / this.pop2, 5) / 5;
			if (extend) threshold /= sw == 1 ? 1.5 : 2;
			if (this.cur_dj_source == name) {
				min_pool = this.basePool(list, min_filter * (extend_pool < 101 ? 0.85 : 1), max_pool) > seed_pool ? Math.max(seed_pool, 50) : Math.min(seed_pool, 50);
				filter = Infinity;
			} else {
				filter = Math.max(list.length > 2 ? (parseFloat(list[0].playcount) + parseFloat(list[1].playcount) + parseFloat(list[2].playcount)) / (h_factor * 3) : parseFloat(list[0].playcount) / h_factor);
				filter = !artist ? Math.max(min_filter, filter) : Math.min(min_filter * (extend_pool < 101 ? 0.65 : 0.75), filter);
				if (artist && !ppt.trackCount && djMode == 1) ppt.trackCount = Math.max(this.basePool(list, filter, extend_pool), 50);
			}
			filter = Math.min(threshold, djMode == 2 && !artist && filter * h_factor < threshold ? Infinity : filter);
			pool = this.basePool(list, filter, max_pool);
			pool = $.clamp(min_pool, pool, list.length);
			if (artist) pool = Math.max(pool, 50);
			if (!artist && djMode == 1) {
				this.lot = pool + this.lot;
				this.counter++;
				if (!ppt.trackCount) ppt.trackCount = Math.round(extend_pool * this.cur_lfm_variety / 2);
				else if (!(this.counter % dj.limit) || !dj.limit && this.counter > 1) ppt.trackCount = Math.round(this.lot * this.cur_lfm_variety / this.counter);
				txt.repaint();
			}
		} else {
			pool = Math.min(max_pool, list.length);
			if (!ppt.trackCount && djMode == 1) ppt.trackCount = !artist ? Math.round(extend_pool * this.cur_lfm_variety) : Math.min(extend_pool, list.length);
		}
		if (djMode == 2) return pool;
		h_ind = this.getIndex(0, list, Math.min(list.length, pool), 0, 1);
		if (!artist && this.playedTracks.includes($.strip(list[h_ind].title)) || this.xmasSong(list[h_ind].title)) h_ind = this.getIndex(0, list, Math.min(list.length, max_pool), 0, 2);
		this.playedTracks.push($.strip(list[h_ind].title));
		if (this.playedTracks.length > 100) this.playedTracks.splice(0, 1);
		ppt.playedTracks = JSON.stringify(this.playedTracks);
		return h_ind;
	}

	xmasSong(title) {
		const kw = "christmas|xmas|(?=.*herald)\\bhark|mary's\\s*boy|santa\\s*baby|santa\\s*claus";
		const d = new Date();
		const n = d.getMonth();
		if (n == 11 || RegExp(kw, 'i').test(this.cur_dj_source)) return false;
		else if (!RegExp(kw, 'i').test(title)) return false;
		else return true;
	}
}

class AutoDJ {
	constructor() {
		this.artVariety = index.cur_dj_type == 2 || index.cur_dj_type == 4 ? index.cur_lfm_variety : 'N/A';
		this.curPop = ppt.curPop;
		this.cur_text = '';
		this.fav;
		this.filter = '';
		this.finished = false;
		this.force_refresh = 0;
		this.id = 0;
		this.mode = index.cur_dj_mode;
		this.param = false;
		this.partLoad = false;
		this.pss = !ui.dui && window.IsTransparent && utils.CheckComponent('foo_uie_panel_splitter', true);
		this.query = index.cur_dj_query;
		this.source = index.cur_dj_source;
		this.type = index.cur_dj_type;
		this.timer = null;
		this.search;
		this.sim1Set = false;
		this.songHot = index.getRange(this.type, index.cur_dj_range);
		this.stndLmt = Math.min(this.stndLmt, 25);
		this.sync = false;
		this.text = '';
		this.updateFav = true;

		this.list = {
			items: [],
			index: 0,
			isCurPop: false,
			query: new FbMetadbHandleList()
		}

		this.txt = {
			h: 0,
			y: 0
		}

		if (!ppt.v) ppt.djPlaylistLimit = $.clamp(ppt.djPlaylistLimit, 2, 25);
		this.limit = ppt.djPlaylistLimit;
		if (!ppt.removePlayed) this.limit = 0;
		ppt.djSearchTimeout = Math.max(ppt.djSearchTimeout, 30000);
		if (ppt.nowPlayingStyle == 1) panel.image.size = 1;

		ppt.autoDJFilter = panel.id.local ? ppt.autoDJFilter.replace('%rating%', '%_autorating%').trim() : ppt.autoDJFilter.trim();
		if (ppt.autoDJFilterUse && ppt.autoDJFilter.length) this.filter = ppt.autoDJFilter;

		this.f2 = `${panel.yttm}lastfm\\`;
		$.create(this.f2);
	}

	// Methods

	addLoc(p_rs, p_djMode, p_djType, sort, load, ended) {
		if (sort) $.sort(panel.add_loc.std, 'playcount', 'numRev');
		if (!ppt.playlistSoftMode && panel.add_loc.std.length > this.limit + 1 || ppt.playlistSoftMode && panel.add_loc.std.length) {
			if (ended) this.on_dld_dj_tracks_done(true, p_djMode);
			if (load) {
				if (!ended) index.autoDjFound();
				this.list.items = panel.add_loc.std.slice(0);
				ppt.trackCount = this.list.items.length;
				txt.repaint();
				if (load == 2 || !this.partLoad) {
					const syn = this.sync && plman.PlayingPlaylist == pl.dj() && ppt.removePlayed;
					let np;
					if (syn) np = plman.GetPlayingItemLocation();
					if (syn && np.IsValid) {
						const affectedItems = [];
						const pid = np.PlaylistItemIndex;
						const pn = pl.dj();
						const handleList = plman.GetPlaylistItems(pn);
						for (let i = pid + 1; i < handleList.Count; i++)
							if (!fb.IsMetadbInMediaLibrary(handleList[i])) affectedItems.push(i);
						plman.ClearPlaylistSelection(pn);
						plman.SetPlaylistSelection(pn, affectedItems, true);
						plman.RemovePlaylistSelection(pn, false);
					} else {
						plman.ActivePlaylist = pl.dj();
						if (ppt.removePlayed) pl.clear(plman.ActivePlaylist);
					}
					index.libDjLoad(this.list.items, p_djType, p_djMode, this.list.query);
					this.partLoad = true;
					this.sync = false;
				}
			}
			timer.clear(timer.sim1);
		} else if (ended) this.on_dld_dj_tracks_done(false);
		if (ended) this.sync = false;
		if (ppt.playlistSoftMode && ended && panel.add_loc.std.length) this.createSoftplaylist(panel.add_loc.std.slice(0), p_rs, p_djType, true);
	}

	calcText(f) {
		let font_h = 20;
		$.gr(1, 1, false, g => font_h = Math.round(g.CalcTextHeight('String', f)));
		return font_h;
	}

	cancel() {
		this.addLoc(this.mode, this.type, true, 1, false);
		this.finished = true;
		timer.clear(timer.sim1);
		timer.clear(timer.sim2);
		timer.clear(timer.yt);
		this.on_dld_dj_tracks_done(false, '', '', '', '', true);
	}

	createSoftplaylist(list, p_rs, p_djType, lfmData) {
		const pln = !ppt.findSavePlaylists ? pl.selection() : plman.FindOrCreatePlaylist("'" + p_rs + (p_djType == 2 ? ' Similar Artists' : '') + "' " + pl.soft_playlist, false);
		let handleList = new FbMetadbHandleList();
		if (lfmData) {
			list.forEach(v => handleList.Add(this.list.query[v.id]));
		}
		const li = lfmData ? handleList : list;
		if (ppt.findRandomize && lfmData) li.OrderByFormat(tf.randomize, 1);
		pl.clear(pln);
		plman.InsertPlaylistItems(pln, 0, li, false);
		plman.ActivePlaylist = pln;
	}

	dldNewTrack() {
		if (this.search) return;
		const get_list = !this.list.items.length && this.get_no(!ppt.playTracks ? this.limit : false, plman.PlaylistItemCount(pl.dj()));
		if (this.mode == 2 && get_list && !ppt.playTracks) {
			this.search = true;
			this.text = index.n[2] + index.nm[2] + '\nRefreshing...';
			txt.repaint();
		}
		setTimeout(() => this.load(get_list), 300);
	}

	dldNextTrack() {
		if (!this.list.items.length) return;
		index.reset_add_loc();
		let tracks;
		const mode = !ppt.playTracks ? this.mode : 0;
		switch (mode) {
			case 0:
				tracks = this.list.items.slice(ppt.playTracksListIndex, ppt.playTracksListIndex + this.get_no(false, plman.PlaylistItemCount(pl.dj())));
				tracks.forEach((v, i) => yt_dj.do_youtube_search('playTracks', v.artist, v.title, i, tracks.length, pl.dj()));
				ppt.playTracksListIndex = ppt.playTracksListIndex + tracks.length;
				break;
			default:
				tracks = this.get_no(this.limit, plman.PlaylistItemCount(pl.dj()));
				switch (this.type == 4 ? 2 : this.type) {
					case 0:
						for (let i = 0; i < tracks; i++) {
							const t_ind = index.track(this.list.items, true, '', this.mode, this.list.isCurPop);
							yt_dj.do_youtube_search('', this.param, this.list.items[t_ind].title, i, tracks, pl.dj());
						}
						break;
					case 1:
					case 3:
						for (let i = 0; i < tracks; i++) {
							const g_ind = index.getGenreTrack(this.list.items.length, this.list.items, 0);
							yt_dj.do_youtube_search('', this.list.items[g_ind].artist, this.list.items[g_ind].title, i, tracks, pl.dj());
						}
						ppt.trackCount = this.list.items.length;
						break;
					case 2:
						if (!ppt.useSaved)
							for (let i = 0; i < tracks; i++) {
								const s_ind = index.artist(this.list.items.length);
								yt_dj.do_lfm_dj_tracks_search(this.type != 4 ? this.list.items[s_ind].name : this.list.items[s_ind], this.mode, this.type == 4 ? 2 : this.type, this.artVariety, this.songHot, this.curPop, i, tracks, pl.dj());
							}
						else {
							let ft;
							for (let l = 0; l < tracks; l++) {
								this.list.items.some(() => {
									const s_ind = index.artist(this.list.items.length);
									const lp = this.type != 4 && $.objHasOwnProperty(this.list.items[0], 'name') ? $.clean(this.list.items[s_ind].name) : $.clean(this.list.items[s_ind]);
									ft = this.f2 + lp.substr(0, 1).toLowerCase() + '\\' + lp + (this.curPop ? ' [curr]' : '') + '.json';
									if (!$.file(ft)) ft = this.f2 + lp.substr(0, 1).toLowerCase() + '\\' + lp + (!this.curPop ? ' [curr]' : '') + '.json';
									return $.file(ft);
								});
								if (!$.file(ft)) return this.on_dld_dj_tracks_done(false);
								const data = $.jsonParse(ft, false, 'file');
								if (!data) return this.on_dld_dj_tracks_done(false);
								const cur = ft.includes(' [curr]');
								if ($.objHasOwnProperty(data[0], 'artist')) data.shift();
								const list = $.take(data, this.songHot).map(yt_dj.titles);
								const art_nm = fso.GetBaseName(ft).replace(' [curr]', '');
								if (list.length) {
									$.sort(list, 'playcount', 'numRev');
									const t_ind = index.track(list, false, art_nm, this.mode, cur);
									yt_dj.do_youtube_search('', art_nm, list[t_ind].title, l, tracks, pl.dj());
								}
							}
						}
						break;
				}
				break;
		}
	}

	do_lfm_lib_dj_tracks_search(p_artist, p_djMode, p_djType, p_artVariety, p_songHot, p_curPop, p_i, p_done, p_pn) {
		const lfm_lib = new LfmDjTracksSearch(() => lfm_lib.onStateChange(), this.on_lfm_lib_dj_tracks_search_done.bind(this));
		lfm_lib.search(p_artist, p_djMode, p_djType, p_artVariety, p_songHot, p_curPop, p_i, p_done, p_pn);
	}

	draw(gr) {
		if (panel.halt()) return;
		if ((!this.search) && this.on()) {
			if (ppt.npTextInfo) {
				this.text = this.source ? (!ppt.playTracks ? (plman.PlayingPlaylist == pl.getDJ() ? this.source + (this.type == 2 ? ' And Similar Artists' : '') + '\n' : 'Active Playlist' + index.nm[4] + this.source + (this.type == 2 ? ' And Similar Artists' : '') + '\n') +
					(index.n[this.mode] + index.nm[this.mode] + (ppt.trackCount ? index.nm[4] + ppt.trackCount + ' Tracks' : '')) : this.source) : $.eval(ppt.tfNowplaying);
				if (ppt.cur_dj_mode != 3 && !ppt.playTracks) {
					gr.GdiDrawText('\uF202', but.font.awesome, ui.col.lfmNowplaying, 3, 0, panel.w, panel.h);
				}
			} else {
				const origT = this.text;
				this.text = $.eval(ppt.tfNowplaying);
				if (!this.text && fb.IsPlaying) this.text = origT;
			}
		} else if (!this.search && ppt.npTextInfo) {
			const count = plman.PlaylistItemCount(plman.ActivePlaylist);
			let label = count != 1 ? ppt.playlistTracks : ppt.playlistTracks.slice(0, -1)
			this.text = `Active Playlist${index.nm[4]}${count} ${label}\n${plman.GetPlaylistName(plman.ActivePlaylist)}`;
		} else if (!this.search || !this.text) this.text = $.eval(ppt.tfNowplaying);
		if (ui.style.textOnly) gr.GdiDrawText(this.text, ui.font.nowPlayingLarge, ui.col.text, 10, 10, panel.w - 20, panel.h - 20, txt.cc);
		if (panel.image.size == 1 || ui.style.textOnly) return;
		if (ppt.npShadow && (!ui.style.isBlur || !timer.transition.id)) gr.GdiDrawText(this.text, ui.font.nowPlaying, ui.outline(ui.col.text), 10 + 1, this.txt.y + 1, panel.w - 20, this.txt.h, txt.cc);
		gr.GdiDrawText(this.text, ui.font.nowPlaying, ui.col.text, 10, this.txt.y, panel.w - 20, this.txt.h, txt.cc);
	}

	feedback(noFav) {
		if (this.text == this.cur_text) return;
		txt.repaint();
		this.search = false;
		this.cur_text = this.text;
		if (noFav) return;
		if (ppt.autoFav && this.updateFav) fav.addCurrentStation(this.source);
		this.updateFav = false;
	}

	get_no(dj_limit, dj_pl_count) {
		if (dj_limit && dj_pl_count >= dj_limit) return 0;
		else return dj_limit ? dj_limit - dj_pl_count : 1;
	}

	load(get_list) {
		if (get_list) this.sync = true;
		const mode = !ppt.playTracks ? this.mode : 0;

		if (mode > 1) {
			if (get_list) {
				if (this.type == 2 || this.type == 4) {
					return this.searchForArtist(this.source, mode, this.type, this.artVariety, this.songHot, this.type != 1 && this.type != 3 && this.songHot < 101 && this.curPop ? true : false);
				} else return this.medLib('', this.source, mode, this.type, 'N/A', this.songHot, this.query);
			} else return mode == 2 ? index.libDjLoad(this.list.items, this.type, mode, this.list.query) : index.libDjLoad(this.list.items, this.type, mode);
		}
		if (get_list) {
			if (!mode) this.loadnPlay();
			else this.searchForArtist(this.source, mode, this.type, this.artVariety, this.songHot, this.type != 1 && this.type != 3 && this.songHot < 101 && this.curPop ? true : false);
		} else this.dldNextTrack();
	}

	loadnPlay() {
		let type = 'new'
		if (!alb.playlist.length) {
			alb.playlist = $.jsonParse(ppt.playTracksList, []);
			type = 'reload';
		}
		ppt.playTracks = alb.playlist.length ? true : false;

		if (ppt.playTracks) yt_dj.execute(this.on_dld_dj_tracks_done.bind(this), '', 0, type, '', '', Math.max(this.limit, 5), '', pl.dj());

	}

	mbtn_up(x, y) {
		if (ppt.showAlb || panel.halt() || ui.style.textOnly || x < 0 || y < 0 || x > panel.w || y > panel.h) return;
		ppt.nowPlayingStyle = ppt.nowPlayingStyle == 1 ? 0 : 1;
		const noLines = ppt.tfNowplaying.split('$crlf()').length; 
		const spacer = (ppt.bor * 0.625 + 16) * 2.67 + ui.font.nowPlaying.Size * noLines;
		panel.image.size = ppt.nowPlayingStyle == 1 ? 1 : 1 - spacer / panel.h;
		img.on_size();
		img.updSeeker();
		this.on_size();
		if (panel.video.mode && this.pss) {
			this.force_refresh = 2;
			this.refreshPSS();
		}
		but.refresh(true);
	}

	medLib(data, p_djSource, p_djMode, p_djType, p_artVariety, p_songHot, p_query) {
		let a = '';
		let i = 0;
		let j = 0;
		let q_t = lib.partialMatch.artist && lib.partialMatch.type[3] != 0 ? ' HAS ' : ' IS ';
		index.reset_add_loc();
		if (this.id == 19) this.id = 0;
		else this.id++;
		this.list.query = new FbMetadbHandleList();
		this.finished = true;
		this.partLoad = true;
		this.sim1Set = true;
		timer.clear(timer.sim1);
		timer.clear(timer.sim2);
		timer.clear(timer.yt);
		if (!data && p_djMode == 2 && (p_djType == 2 || p_djType == 4)) return this.on_dld_dj_tracks_done(false, '', 0, true);
		this.finished = false;
		this.partLoad = false;
		this.sim1Set = false;
		this.source = p_djSource;
		this.mode = p_djMode;
		this.type = p_djType;
		this.artVariety = p_artVariety;
		if (p_songHot) this.songHot = p_songHot;
		this.query = p_query;
		switch (this.mode) {
			case 2:
				switch (this.type) {
					case 0:
						if (lib.inLibraryArt(this.source)) {
							this.do_lfm_lib_dj_tracks_search(this.source, this.mode, this.type, this.artVariety, this.songHot, false, this.id, 0, 0, '');
						} else return this.on_dld_dj_tracks_done(false);
						break;
					case 1:
					case 3:
						this.do_lfm_lib_dj_tracks_search(this.source, this.mode, this.type, this.artVariety, this.songHot, false, this.id, 0, 0, '');
						break;
					default: {
						let done = 0;
						let q = '(NOT %path% HAS !!.tags) AND (';
						j = 0;
						data.some(v => {
							a = this.type != 4 && $.objHasOwnProperty(data[0], 'name') ? v.name : v;
							const query = q_t == ' IS ' ? name.field.artist + q_t + a : $.queryArtist(a);
							if (lib.inLibraryArt(a)) {
								q += (j ? ' OR ' : '') + query;
								if (j == this.artVariety - 1) {
									done = j + 1;
									return true;
								} else {
									j++;
									done = j;
								}
							}
						});
						if (!done) return this.on_dld_dj_tracks_done(false);
						q += ')';
						this.list.query = $.query(lib.getLibItems(), q);
						lib.djRefine(this.list.query);
						j = 0;
						i = 0;
						timer.sim2.id = setTimeout(() => {
							this.finished = true;
							timer.clear(timer.sim1);
							timer.sim2.id = null;
							this.addLoc(this.source, this.mode, this.type, true, 1, true);
						}, ppt.djSearchTimeout);
						timer.yt.id = setInterval(() => {
							if (i < data.length && j < this.artVariety) {
								a = this.type != 4 && $.objHasOwnProperty(data[0], 'name') ? data[i].name : data[i];
								if (lib.inLibraryArt(a)) {
									this.do_lfm_lib_dj_tracks_search(a, this.mode, this.type == 4 ? 2 : this.type, this.artVariety, this.songHot, false, this.id, done, 0, '');
									j++;
								}
								i++;
							} else timer.clear(timer.yt);
						}, 20);
						break;
					}
				}
				break;
			case 3: {
				if (this.type > 1 && !data) return this.on_dld_dj_tracks_done(false, '', 0, true);
				let q = '';
				switch (this.type) {
					case 0:
						q += q_t == ' IS ' ? name.field.artist + q_t + this.source : $.queryArtist(this.source);
						break;
					case 1:
						q = !this.query ? name.field.genre + ' IS ' + this.source : this.source;
						break;
					default:
						j = 0;
						data.some(v => {
							a = this.type != 4 && $.objHasOwnProperty(data[0], 'name') ? v.name : v;
							const query = q_t == ' IS ' ? name.field.artist + q_t + a : $.queryArtist(a);
							if (lib.inLibraryArt(a)) {
								q += (j ? ' OR ' : '') + query;
								if (j == this.artVariety - 1) return true;
								j++;
							}
						});
						break;
				}
				if (!j && this.type > 1) return this.on_dld_dj_tracks_done(false);
				const libItems = lib.getLibItems().Clone();
				if (this.filter) {
					const skipItems = $.query(libItems, this.filter);
					skipItems.Sort();
					libItems.Sort();
					libItems.MakeDifference(skipItems);
				}
				this.list.query = $.query(libItems, q);
				this.list.query.OrderByFormat(tf.randomize, 1);
				if (ppt.sortAutoDJ < 2 && !(ppt.playlistSoftMode && ppt.findRandomize)) this.list.query.OrderByFormat(FbTitleFormat([ml.playcount, ml.rating][ppt.sortAutoDJ]), 0);
				if (!ppt.playlistSoftMode && this.list.query.Count > this.limit + 1 || ppt.playlistSoftMode && this.list.query.Count) {
					ppt.trackCount = this.list.query.Count;
					this.on_dld_dj_tracks_done(true, this.mode, false, false, false, false, this.query);
					this.list.items = this.list.query;
					index.libDjLoad(this.list.items, this.type, this.mode);
					if (ppt.playlistSoftMode) this.createSoftplaylist(this.list.query, this.source, this.type, false);
				} else this.on_dld_dj_tracks_done(false);
				break;
			}
		}
	}

	on() {
		return (ppt.autoRad || ppt.playTracks) && plman.ActivePlaylist == pl.getDJ();
	}

	on_dld_dj_tracks_done(found, p_djMode, p_pn, lfm_na, lib_na, cancel, p_q, type) {
		if (found && ppt.playTracks) {
			plman.ActivePlaylist = pl.dj();
			if (type == 'new') {
				if (ppt.removePlayed) pl.clear(plman.ActivePlaylist);
				ppt.playTracksListIndex = 0;
			}
			this.cur_text = '';
			this.feedback(true);
		} else if (found) {
			if (p_djMode != 2 && !this.sync) {
				plman.ActivePlaylist = pl.dj();
				if (ppt.removePlayed) pl.clear(plman.ActivePlaylist);
			}
			if (type == 'new') ppt.playTracksListIndex = 0;
			this.cur_text = '';
			this.updateFav = true;
			index.autoDjFound(p_q)
			this.feedback();
		} else {
			this.mode = index.cur_dj_mode = ppt.cur_dj_mode;
			this.artVariety = ppt.cur_lfm_variety;
			this.query = index.cur_dj_query = ppt.cur_dj_query;
			this.source = index.cur_dj_source = ppt.cur_dj_source;
			this.type = index.cur_dj_type = ppt.cur_dj_type;
			this.songHot = this.mode ? index.getRange(this.type, ppt.cur_dj_range) : '';
			this.text = cancel ? index.n[2] + '\nSearch Cancelled' : 'Failed To Open ' + ('Auto DJ' + '\n') + (lib_na ? 'Media Library N/A' : (p_djMode < 2 || lfm_na ? 'Unrecognised Source or Last.fm N/A' : (!ppt.playlistSoftMode ? 'Insufficient' : 'No') + ' Matching Tracks In Library'));
			txt.repaint();
			if (!this.timer) {
				this.timer = setTimeout(() => {
					this.search = false;
					txt.repaint();
					this.timer = null;
				}, 5000);
			}
		}
	}

	on_lfm_lib_dj_tracks_search_done(p_artist, p_title, p_i, p_done, p_pn, p_djMode, p_djType) {
		if (p_i != this.id) return;
		let q, q_t = lib.partialMatch.artist && lib.partialMatch.type[3] != 0 ? ' HAS ' : ' IS ';
		switch (p_djType) {
			case 0: {
				if (!p_artist.length || !p_title.length) return this.on_dld_dj_tracks_done(false, '', 0, true);
				$.sort(p_title, 'playcount', 'numRev');
				$.take(p_title, this.songHot);
				q = '(NOT %path% HAS !!.tags) AND (';
				const query = q_t == ' IS ' ? name.field.artist + q_t + p_artist : $.queryArtist(p_artist);
				q += query + ')';
				if (ppt.refineLastfm) {
					const pool = index.track(p_title, true, '', 2, false);
					$.take(p_title, pool);
				}
				this.list.query = $.query(lib.getLibItems(), q);
				lib.djRefine(this.list.query);
				p_title.forEach(v => lib.djMatch(p_artist, v.title, v.playcount));
				this.addLoc(this.source, p_djMode, p_djType, false, 2, true);
				break;
			}
			case 1:
			case 3: {
				if (!p_artist.length) return this.on_dld_dj_tracks_done(false, '', 0, true);
				const a_arr = [];
				let a = '';
				let a_o = '';
				let j = 0;
				q = '(NOT %path% HAS !!.tags) AND (';
				$.take(p_artist, this.songHot).forEach(v => {
					a = v.artist.toLowerCase();
					if (a != a_o) {
						a_arr.push(a);
						a_o = a;
					}
				});
				a_arr.forEach(v => {
					const query = q_t == ' IS ' ? name.field.artist + q_t + v : $.queryArtist(v);
					if (lib.inLibraryArt(v)) {
						q += (j ? ' OR ' : '') + query;
						j++;
					}
				});
				if (!j) return this.on_dld_dj_tracks_done(false);
				q += ')';
				this.list.query = $.query(lib.getLibItems(), q);
				lib.djRefine(this.list.query);
				p_artist.forEach(v => lib.djMatch(v.artist, v.title, 'N/A'));
				this.addLoc(this.source, p_djMode, p_djType, false, 2, true);
				break;
			}
			case 2:
				if (this.finished) return;
				yt_dj.received++;
				if (p_artist.length && p_title.length) {
					$.sort(p_title, 'playcount', 'numRev');
					$.take(p_title, this.songHot);
					if (ppt.refineLastfm) {
						const pool = index.track(p_title, false, p_artist, 2, false);
						$.take(p_title, pool);
					}
					p_title.forEach(v => lib.djMatch(p_artist, v.title, v.playcount));
				}
				this.setText(p_done);
				if (!this.sim1Set && !timer.sim1.id) timer.sim1.id = setInterval(() => {
					this.addLoc(this.source, p_djMode, p_djType, true, 2, false);
					this.setText(p_done);
				}, 10000);
				if (timer.sim1.id) this.sim1Set = true;
				timer.clear(timer.sim2);
				timer.sim2.id = setTimeout(() => {
					this.finished = true;
					timer.clear(timer.sim1);
					timer.sim2.id = null;
					this.addLoc(this.source, p_djMode, p_djType, true, 1, true);
				}, ppt.djSearchTimeout);
				if (yt_dj.received == p_done) {
					timer.clear(timer.sim1);
					timer.clear(timer.sim2);
					this.addLoc(this.source, p_djMode, p_djType, true, 1, true);
				}
				break;
		}
	}

	on_playback_new_track() {
		if ((!ppt.autoRad && !ppt.playTracks) || plman.PlayingPlaylist != pl.getDJ() || !this.source) return;
		this.dldNewTrack();
		timer.dj_chk = true;
	}

	on_size() {
		if (ui.style.textOnly) return;
		if (ppt.autoLayout) {
			this.txt.y = Math.min(panel.h * panel.image.size, panel.h - img.ny);
			this.txt.h = Math.max(img.ny, panel.h * (1 - panel.image.size));
		} else {
			this.txt.h = Math.max(this.calcText(ui.font.nowPlaying) * 2, 1);
			this.txt.y = Math.max(panel.h - this.txt.h, 0);
		}
	}

	refreshPSS() {
		if (this.force_refresh != 2 || !this.pss) return;
		if (fb.IsPlaying || fb.IsPaused) {
			fb.Pause();
			fb.Pause();
		} else {
			fb.Play();
			fb.Stop();
		}
		this.force_refresh = 0;
	}

	removePlayed() {
		if (plman.PlayingPlaylist != pl.getDJ() || ppt.playTracks) return;
		const np = plman.GetPlayingItemLocation();
		const pn_dj = pl.getDJ();
		let pid;
		if (np.IsValid) {
			pid = np.PlaylistItemIndex;
			if (ppt.djSaveTracks) {
				plman.SetPlaylistSelectionSingle(pn_dj, pid, true);
				pl.saveAutoDjTracks(pn_dj, plman.GetPlaylistSelectedItems(pn_dj));
			}
		}
		if (!ppt.autoRad || !this.limit || plman.PlayingPlaylist != pn_dj) return;
		if (plman.PlaylistItemCount(pn_dj) > this.limit - 1) {
			if (np.IsValid) {
				plman.ClearPlaylistSelection(pn_dj);
				for (let i = 0; i < pid; i++) plman.SetPlaylistSelectionSingle(pn_dj, i, true);
				plman.RemovePlaylistSelection(pn_dj, false);
			}
		}
	}

	searchForArtist(p_djSource, p_djMode, p_djType, p_artVariety, p_songHot, p_curPop, p_dj_fav) {
		this.source = p_djSource;
		this.mode = p_djMode;
		this.type = p_djType;
		this.artVariety = p_artVariety;
		this.songHot = p_songHot;
		this.fav = p_dj_fav;
		this.curPop = p_curPop;
		if (!this.source || this.source == 'N/A') return this.on_dld_dj_tracks_done(false);
		yt_dj.execute(this.on_dld_dj_tracks_done.bind(this), this.source, this.mode, this.type, this.artVariety, this.songHot, this.limit, this.curPop, pl.dj());
	}

	setDjSelection(pn) {
		if (Date.now() - panel.add_loc.timestamp > 5000) return;
		const np = plman.GetPlayingItemLocation();
		let pid = 0;
		if (plman.PlayingPlaylist == pn && np.IsValid) pid = np.PlaylistItemIndex;
		if (!this.limit) {
			if (!np.IsValid) pid = plman.PlaylistItemCount(pn) - 1;
			plman.EnsurePlaylistItemVisible(pn, plman.PlaylistItemCount(pn) - 1);
		}
		plman.SetPlaylistFocusItem(pn, pid);
		plman.ClearPlaylistSelection(pn);
		plman.SetPlaylistSelectionSingle(pn, pid, true);
	}

	setText(p_done) {
		if (!this.partLoad) {
			ppt.trackCount = panel.add_loc.std.length;
			this.text = 'Analysing Library for Last.fm Top Tracks...\nFound ' + ppt.trackCount + ' Tracks' + ' (' + Math.round(yt_dj.received / p_done * 100) + '% Done)';
		} else if (ppt.playlistSoftMode) {
			ppt.trackCount = panel.add_loc.std.length;
			this.text = 'Auto DJ Loaded' + index.nm[4] + 'Playlist Pending...\nFound ' + ppt.trackCount + ' Tracks' + ' (' + Math.round(yt_dj.received / p_done * 100) + '% Done)';
		} else {
			ppt.trackCount = panel.add_loc.std.length;
			this.search = false;
		}
		txt.repaint();
	}

	toggleText(x, y) {
		if (!ui.style.textOnly && y <= Math.min(panel.h * panel.image.size, panel.h - img.ny)) return;
		ppt.toggle('npTextInfo');
		this.refreshPSS();
		txt.paint();
	}
}