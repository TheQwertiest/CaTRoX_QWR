class MTags {
	constructor() {
		this.chk = [];
		this.cur_path = '';
		this.cur_artist = '';
		this.defType = [];
		this.lastUpdate = 0;
		this.mod = [];
		this.rec = [];
		this.type = [];
		this.types = ['', 'YouTube Track', 'Prefer Library Track', 'Library Track'];
		this.video = [];

		this.alb = {
			id: -1,
			done: [],
			full: []
		}

		this.m = {
			artist: [],
			ix: [],
			location: [],
			lib: [],
			path: [],
			title: [],
			type: [],
			video: []
		}

		this.mtags = {
			json: `${panel.yttm}m-TAGS.json`,
			list: [],
			timer: []
		}

		if (!$.file(this.mtags.json) && (ml.upd_yt_mtags || ml.upd_lib_mtags)) {
			$.save(this.mtags.json, JSON.stringify(this.mtags.list, null, 3), true);
		}
	}

	// Methods

	check(blkList) {
		const handle = !blkList ? fb.GetNowPlaying() : $.handle(ppt.focus);
		if (!handle || (this.cur_path == handle.Path && !blkList)) return;
		this.cur_path = handle.Path;
		if (handle.Path.slice(-7) != '!!.tags' || !$.file(this.mtags.json)) return;
		if (!blkList) {
			this.mtags.list = $.jsonParse(this.mtags.json, false, 'file');
			const now = Date.now();
			const recent = v => v.time > now - One_Day;
			const recentlyChecked = v => v.path == handle.Path;
			this.mtags.list = this.mtags.list.filter(recent);
			if (this.mtags.list.some(recentlyChecked)) return;
			this.mtags.list.push({
				'path': handle.Path,
				'time': now
			});
			$.save(this.mtags.json, JSON.stringify(this.mtags.list, null, 3), true);
		}
		if (this.alb.id == 19) this.alb.id = 0;
		else this.alb.id++;
		this.parse(this.alb.id, handle.Path);
	}

	createFromSelection(handles, pn) {
		if (!handles.Count) return fb.ShowPopupMessage('Failed to create m_TAGS\n\nNo playlist items selected', 'Find & Play');
		const pl_mtags = [];
		const tf_albumArtist = FbTitleFormat('[%album artist%]');
		const tf_fy_title = FbTitleFormat('[%fy_title%]');
		const tf_path = FbTitleFormat('%path%');
		const tf_search = FbTitleFormat('[$if2(%SEARCH_TITLE%,%YOUTUBE_TRACK_MANAGER_SEARCH_TITLE%)]');
		const tf_type = FbTitleFormat('[$if2(%TRACK_TYPE%,%YOUTUBE_TRACK_MANAGER_TRACK_TYPE%)]');
		const tf_date = FbTitleFormat('[%date%]');
		const tf_yt_title = FbTitleFormat('[%YOUTUBE_TITLE%]');
		const type_arr = ['YouTube Track', 'Prefer Library Track', 'Library Track'];

		const artists = tf.artist0.EvalWithMetadbs(handles);
		const dates = tf_date.EvalWithMetadbs(handles);
		const durations = tf.length.EvalWithMetadbs(handles);
		const fy_titles = tf_fy_title.EvalWithMetadbs(handles);
		const gains = tf.trackGain.EvalWithMetadbs(handles);
		const peaks = tf.trackPeak.EvalWithMetadbs(handles);
		const searchTitles = tf_search.EvalWithMetadbs(handles);
		const titles = tf.title0.EvalWithMetadbs(handles);
		const urls = tf.fy_url.EvalWithMetadbs(handles);
		const yt_titles = tf_yt_title.EvalWithMetadbs(handles);
		const types = tf_type.EvalWithMetadbs(handles);

		let album = tf.album0.EvalWithMetadb(handles[0]);
		let albumartist = tf_albumArtist.EvalWithMetadb(handles[0]);
		let fna = '';
		let pth = '';

		const ok_callback = (status, input) => {
			if (status != 'cancel') {
				album = input;
			}
		}
		popUpBox.input('Create m-TAGS Album', 'Type Album Name', ok_callback, '', album);
		if (!album) album = 'Album Unknown';
		if (artists.some(v => v !== artists[0])) albumartist = 'Various Artists';
		if (alb.libraryTest(albumartist, album)) return;
		let al = album;

		for (let i = 0; i < handles.Count; i++) {
			pl_mtags[i] = {
				'@': urls[i].replace('https:', '3dydfy:') || '/' + (ml.referencedFile(handles[i]) || tf_path.EvalWithMetadb(handles[i]).replace(/\\/g, '/')),
				'ALBUM': album,
				'ARTIST': artists[i],
				'DURATION': durations[i] || [],
				'REPLAYGAIN_TRACK_GAIN': gains[i] || [],
				'REPLAYGAIN_TRACK_PEAK': peaks[i] || [],
				'TITLE': titles[i],
				'TRACKNUMBER': (i + 1).toString(),
				'YOUTUBE_TITLE': yt_titles[i] || fy_titles[i] || [],
				'SEARCH_TITLE': searchTitles[i] || titles[i],
				'TRACK_TYPE': types[i] || type_arr[ppt.libAlb]
			}
		}

		if (dates[0] && dates.every(v => v === dates[0]))
			for (let i = 0; i < handles.Count; i++) pl_mtags[i]['DATE'] = dates[0];
		if (albumartist == 'Various Artists')
			for (let i = 0; i < handles.Count; i++) pl_mtags[i]['ALBUM ARTIST'] = 'Various Artists';
		albumartist = $.titlecase(albumartist);
		al = $.titlecase(al);

		pl_mtags.forEach(v => this.format(v));
		$.sort(pl_mtags, 'TRACKNUMBER', 'num');

		const a = ($.clean(albumartist) + ' - ' + $.clean(al)).trim();
		const fns = `${panel.yttm}albums\\${a.substr(0, 1).toLowerCase()}\\`;

		fna = `${fns + a}\\`;

		$.create(fns);

		pth = `${fna + a} !!.tags`;
		if (pth.length > 259) pth = `${fna + $.titlecase(a).match(/[A-Z0-9]/g).join('')} !!.tags`;
		if (pth.length > 259) {
			fna = `${fns + $.titlecase(a).match(/[A-Z0-9]/g).join('')}\\`;
			`pth = ${fna + $.titlecase(a).match(/[A-Z0-9]/g).join('')} !!.tags`;
		}

		$.create(fna);

		if (!ppt.mtagsAbsPath) pl_mtags.forEach(v => {
			if (v['@'].charAt() == '/') v['@'] = ml.getRelativePath('/' + pth, v['@']);
		});

		pl_mtags.forEach((v, i, arr) => {
			arr[i] = $.sortKeys(v);
		});

		$.save(pth, JSON.stringify(pl_mtags, null, 3), true);
		if (!$.file(pth)) return;

		if (albumartist && al) {
			const cov = utils.Glob(fna + '*').some(v => /(?:jpe?g|gif|png|bmp)$/i.test(fso.GetExtensionName(v)));
			if (!cov) {
				const lfm_cov = new LfmAlbumCover(() => lfm_cov.onStateChange());
				lfm_cov.search(albumartist, al, fna);
			}
		}
		const pl_active = pl.selection();
		pl.clear(pl_active);
		panel.addLoc(pth, pl_active);
	}

	driveOn(drv) {
		if (!fso.DriveExists(drv) || !fso.GetDrive(drv).IsReady) return false;
		return true;
	}

	format(v) {
		if (v.ALBUM) v.ALBUM = $.titlecase(v.ALBUM);
		if (v.ARTIST) v.ARTIST = $.titlecase(v.ARTIST);
		if (v.TITLE) v.TITLE = $.titlecase(v.TITLE);
		if (v.SEARCH_TITLE) v.SEARCH_TITLE = $.titlecase(v.SEARCH_TITLE);
	}

	getAbsolutePath(base, relative) {
		relative = relative.replace(/\\/g, '/');
		const stack = base.split('/');
		const parts = relative.split('/');
		stack.pop();
		for (let i = 0; i < parts.length; i++) {
			if (parts[i] == '.') continue;
			if (parts[i] == '..') stack.pop();
			else stack.push(parts[i]);
		}
		return stack.join('/');
	}

	getValue(ix, i, prop) {
		let value = this.chk[ix][i][prop];
		if (value !== undefined) return value;
		while (i-- && value === undefined) value = this.chk[ix][i][prop];
		return value;
	}

	on_check_mtags_done(p_alb_id, p_artist, p_title, p_i, p_done, p_full_alb, p_fn, p_type, p_available) {
		if (!p_available) {
			const yt = new YoutubeSearch(() => yt.onStateChange(), this.on_youtube_search_done.bind(this));
			yt.search(p_alb_id, p_artist, p_title, p_i, p_done, '', '', '', p_full_alb, p_fn, p_type);
		} else this.on_youtube_search_done(p_alb_id, '', p_artist, p_title, p_i, p_done, '', '', '', '', '', p_full_alb, p_fn, p_type);
	}

	on_youtube_search_done(p_alb_id, p_url, p_artist, p_title, p_i, p_done, p_pn, p_alb_set, p_length, p_orig_title, p_yt_title, p_full_alb, p_fn) {
		this.rec[p_alb_id]++;
		if (typeof p_i === 'number') {
			if (p_url) {
				this.mod[p_alb_id] = true;
				this.chk[p_alb_id].some((v, i) => {
					if (i == p_i) {
						v['@'] = p_url;
						v.DURATION = p_length.toString();
						v.REPLAYGAIN_TRACK_GAIN = [];
						v.REPLAYGAIN_TRACK_PEAK = [];
						!p_full_alb ? v.TITLE = p_title : v.TITLE = p_title + ' (Full Album)';
						v.YOUTUBE_TITLE = p_yt_title ? p_yt_title : [];
						return true;
					}
				});
			}
		}

		if (this.rec[p_alb_id] == this.alb.done[p_alb_id] && this.mod[p_alb_id]) {
			this.chk[p_alb_id].forEach(v => { // stop propogation of condensed tags
				if (!v.REPLAYGAIN_TRACK_GAIN) v.REPLAYGAIN_TRACK_GAIN = [];
				if (!v.REPLAYGAIN_TRACK_PEAK) v.REPLAYGAIN_TRACK_PEAK = [];
				if (!v.YOUTUBE_TITLE) v.YOUTUBE_TITLE = [];
			});
			this.chk[p_alb_id].forEach((v, i, arr) => arr[i] = $.sortKeys(v));
			$.save(p_fn, JSON.stringify(this.chk[p_alb_id], null, 3), true);
			if (ppt.mtagsUpdMsg) fb.ShowPopupMessage(`${fso.GetFileName(p_fn)}\n\n[Message can be switched off in panel properties: m-TAGS...]`, `Updated m-TAGS:`);
		}
	}

	parse(ix, path) {
		this.m.path[ix] = path;
		if ($.file(this.m.path[ix])) {
			let str = $.open(this.m.path[ix]);
			if (str.includes('YOUTUBE_TRACK_MANAGER_')) {
				str = str.replace(/YOUTUBE_TRACK_MANAGER_/gi, '');
				$.save(this.m.path[ix], str, true);
			}
			this.chk[ix] = $.jsonParse(str, false);
		} else return;

		if (!this.chk[ix].length) return;

		this.reset_timer(ix);
		this.alb.done[ix] = Math.min(150, this.chk[ix].length);
		this.defType[ix] = [];
		this.m.lib[ix] = false;
		this.mod[ix] = false;
		this.rec[ix] = 0;
		this.type[ix] = [];
		this.video[ix] = false;
		let j = this.alb.done[ix];

		while (j--) {
			if (typeof this.chk[ix][j]['@'] !== 'string') {
				this.chk[ix].splice(j, 1);
				this.alb.done[ix]--;
			}
		}

		for (this.m.ix[ix] = 0; this.m.ix[ix] < this.alb.done[ix]; this.m.ix[ix]++) {
			this.m.location[ix] = this.getValue(ix, this.m.ix[ix], '@');
			if (this.m.location[ix].startsWith('3dydfy:')) this.video[ix] = true;
			if (this.m.location[ix].charAt() == '/' || this.m.location[ix].charAt() == '.') this.m.lib[ix] = true;
		}

		this.defType[ix] = !this.video[ix] ? 3 : !this.m.lib[ix] ? 1 : 2;

		for (this.m.ix[ix] = 0; this.m.ix[ix] < this.alb.done[ix]; this.m.ix[ix]++) {
			const ty = this.getValue(ix, this.m.ix[ix], 'TRACK_TYPE');
			if (ty !== undefined && ty.length) {
				const ic = ty.toLowerCase().charAt();
				this.type[ix][this.m.ix[ix]] = ic == 'y' ? 1 : ic == 'p' ? 2 : ic == 'l' ? 3 : this.defType[ix];
			}
			else {
				this.type[ix][this.m.ix[ix]] = this.defType[ix];
				this.chk[ix][this.m.ix[ix]].TRACK_TYPE = this.types[this.defType[ix]];
			}
		}

		this.m.ix[ix] = 0;

		this.mtags.timer[ix] = setInterval(() => {
			if (this.m.ix[ix] < this.alb.done[ix]) {
				this.m.location[ix] = this.getValue(ix, this.m.ix[ix], '@');
				this.m.video[ix] = this.m.location[ix].indexOf('v=');

				if (this.m.video[ix] != -1) this.m.video[ix] = this.m.location[ix].slice(this.m.video[ix] + 2, this.m.video[ix] + 13);
				else this.m.video[ix] = '';
				
				this.m.artist[ix] = this.getValue(ix, this.m.ix[ix], 'ARTIST');
				this.alb.full[ix] = false;

				const sti = this.getValue(ix, this.m.ix[ix], 'TITLE');
				if (sti !== undefined && sti.includes(' (Full Album)')) this.alb.full[ix] = true;

				const st = this.getValue(ix, this.m.ix[ix], 'SEARCH_TITLE');
				this.m.title[ix] = st !== undefined && st.length ? st : typeof sti !== 'undefined' && sti.length ? sti : '';
				this.m.type[ix] = this.type[ix][this.m.ix[ix]];

				this.test(ix, this.m.artist[ix], this.m.title[ix], this.m.ix[ix], this.alb.done[ix], this.m.video[ix], this.alb.full[ix], this.m.path[ix], this.m.location[ix], this.m.type[ix]);
				this.m.ix[ix]++;
			} else {
				this.reset_timer(ix);
			}
		}, 20);
	}

	reset_timer(p_alb_id) {
		if (this.mtags.timer[p_alb_id]) clearTimeout(this.mtags.timer[p_alb_id]);
		this.mtags.timer[p_alb_id] = null;
	}

	save(p_alb_id, p_artist, p_full_alb) {
		p_artist = $.titlecase(p_artist);
		panel.add_loc.mtags[p_alb_id].forEach(v => this.format(v));

		const album = panel.add_loc.mtags[p_alb_id][0].ALBUM || '';

		const a = ($.clean(p_artist) + ' - ' + $.clean(album)).trim();
		const fns = `${panel.yttm}albums\\${a.substr(0, 1).toLowerCase()}\\`;

		let fna = `${fns + a}\\`;
		$.create(fns);

		if (!p_full_alb) $.sort(panel.add_loc.mtags[p_alb_id], 'TRACKNUMBER', 'num');

		let pth = `${fna + a} !!.tags`;
		if (pth.length > 259) pth = `${fna + $.titlecase(a).match(/[A-Z0-9]/g).join('')} !!.tags`;

		if (pth.length > 259) {
			fna = `${fns + $.titlecase(a).match(/[A-Z0-9]/g).join('')}\\`;
			pth = `${fna + $.titlecase(a).match(/[A-Z0-9]/g).join('')} !!.tags`;
		}
		$.create(fna);

		if (!ppt.mtagsAbsPath) panel.add_loc.mtags[p_alb_id].forEach(v => {
			if (v['@'].charAt() == '/') v['@'] = ml.getRelativePath('/' + pth, v['@']);
		});

		$.save(pth, JSON.stringify(panel.add_loc.mtags[p_alb_id], null, 3), true);
		if (!$.file(pth)) return;

		const cov = utils.Glob(fna + '*').some(v => /(?:jpe?g|gif|png|bmp)$/i.test(fso.GetExtensionName(v)));
		if (!cov) {
			const lfm_cov = new LfmAlbumCover(() => lfm_cov.onStateChange());
			lfm_cov.search(p_artist, album, fna);
		}
		panel.addLoc(pth, pl.selection());
	}

	test(p_alb_id, p_artist, p_title, p_i, p_done, p_id, p_full_alb, p_fn, p_loc, p_type) {
		if (!p_artist || !p_title) return this.on_youtube_search_done(p_alb_id, '', p_artist, p_title, p_i, p_done, '', '', '', '', '', p_full_alb, p_fn, p_type);
		let yt_video_available;
		switch (p_type) {
			case 1: // YouTube track only
				if (!p_id || !panel.yt) return this.on_youtube_search_done(p_alb_id, '', p_artist, p_title, p_i, p_done, '', '', '', '', '', p_full_alb, p_fn, p_type);
				yt_video_available = new YoutubeVideoAvailable(() => yt_video_available.onStateChange(), this.on_check_mtags_done.bind(this));
				yt_video_available.search(p_alb_id, p_artist, p_title, p_i, p_done, p_id, p_full_alb, p_fn, p_type);
				break;
			case 2: { // Prefer library track
				if (ml.upd_lib_mtags) {
					if (p_loc.charAt() == '/' || p_loc.charAt() == '.') {
						if (!fb.IsLibraryEnabled()) return this.on_youtube_search_done(p_alb_id, '', p_artist, p_title, p_i, p_done, '', '', '', '', '', p_full_alb, p_fn, p_type);
						if (p_loc.charAt() == '/') p_loc = p_loc.substring(1);
						else if (p_loc.charAt() == '.') {
							let base = p_fn.replace(/\\/g, '/');
							if (base.includes('/')) base = base.substring(0, base.lastIndexOf('/') + 1);
							p_loc = this.getAbsolutePath(base, p_loc);
						}
						const f = p_loc.indexOf('|');
						if (f != -1) p_loc = p_loc.substring(0, f);
						if ($.file(p_loc) || !this.driveOn(p_loc.substr(0, 3))) return this.on_youtube_search_done(p_alb_id, '', p_artist, p_title, p_i, p_done, '', '', '', '', '', p_full_alb, p_fn, p_type);
					}
				}
				// Recheck if YouTube track now in library & for dead library references
				let on_yt_search_done = false;
				if (p_id || ml.upd_lib_mtags) {
					if (p_artist != this.cur_artist || Date.now() - this.lastUpdate > 2000) lib.getArtistTracks(p_artist);
					this.cur_artist = p_artist;
					this.lastUpdate = Date.now();
					const lib_test = lib.inLibraryAlb(this.alb.id, p_artist, p_title, '', '', p_i, p_id, true);
					on_yt_search_done = false;
					if (lib_test.length) {
						this.mod[p_alb_id] = true;
						this.chk[lib_test[0]].some((v, i) => {
							if (i == lib_test[5]) {
								const chr = v['@'].charAt();
								v['@'] = chr == '/' ? lib_test[1] : chr == '.' ? ml.getRelativePath('/' + p_fn, lib_test[1]) : ppt.mtagsAbsPath ? lib_test[1] : ml.getRelativePath('/' + p_fn, lib_test[1]);
								v.DURATION = lib_test[2];
								v.REPLAYGAIN_TRACK_GAIN = lib_test[3];
								v.REPLAYGAIN_TRACK_PEAK = lib_test[4];
								v.TITLE = p_title;
								v.YOUTUBE_TITLE = [];
								this.on_youtube_search_done(p_alb_id, '', p_artist, p_title, p_i, p_done, '', '', '', '', '', p_full_alb, p_fn, p_type);
								on_yt_search_done = true;
								return true;
							}
						});
					}
				}
				if (on_yt_search_done) return;
				if (!p_id || !ml.upd_yt_mtags || !panel.yt) return this.on_youtube_search_done(p_alb_id, '', p_artist, p_title, p_i, p_done, '', '', '', '', '', p_full_alb, p_fn, p_type);
				yt_video_available = new YoutubeVideoAvailable(() => yt_video_available.onStateChange(), this.on_check_mtags_done.bind(this));
				yt_video_available.search(p_alb_id, p_artist, p_title, p_i, p_done, p_id, p_full_alb, p_fn, p_type);
				break;
			}
			case 3: // Library track only
				if (!ml.upd_lib_mtags || !fb.IsLibraryEnabled()) return this.on_youtube_search_done(p_alb_id, '', p_artist, p_title, p_i, p_done, '', '', '', '', '', p_full_alb, p_fn, p_type);
				if (p_loc.charAt() == '/' || p_loc.charAt() == '.') {
					if (p_loc.charAt() == '/') p_loc = p_loc.substring(1);
					else if (p_loc.charAt() == '.') {
						let base = p_fn.replace(/\\/g, '/');
						if (base.includes('/')) base = base.substring(0, base.lastIndexOf('/') + 1);
						p_loc = this.getAbsolutePath(base, p_loc);
					}
					const f = p_loc.indexOf('|');
					if (f != -1) p_loc = p_loc.substring(0, f);
					if ($.file(p_loc) || !this.driveOn(p_loc.substr(0, 3))) return this.on_youtube_search_done(p_alb_id, '', p_artist, p_title, p_i, p_done, '', '', '', '', '', p_full_alb, p_fn, p_type);
					if (p_artist != this.cur_artist || Date.now() - this.lastUpdate > 2000) lib.getArtistTracks(p_artist);
					this.cur_artist = p_artist;
					this.lastUpdate = Date.now();
					const lib_test = lib.inLibraryAlb(this.alb.id, p_artist, p_title, '', '', p_i, p_id, true);
					if (lib_test.length) {
						this.mod[p_alb_id] = true;
						this.chk[lib_test[0]].forEach((v, i) => {
							if (i == lib_test[5]) {
								const chr = v['@'].charAt();
								v['@'] = chr == '/' ? lib_test[1] : chr == '.' ? ml.getRelativePath('/' + p_fn, lib_test[1]) : ppt.mtagsAbsPath ? lib_test[1] : ml.getRelativePath('/' + p_fn, lib_test[1]);
								v.DURATION = lib_test[2];
								v.REPLAYGAIN_TRACK_GAIN = lib_test[3];
								v.REPLAYGAIN_TRACK_PEAK = lib_test[4];
								v.TITLE = p_title;
							}
						});
					}
				}
				this.on_youtube_search_done(p_alb_id, '', p_artist, p_title, p_i, p_done, '', '', '', '', '', p_full_alb, p_fn, p_type)
				break;
		}
	}
}