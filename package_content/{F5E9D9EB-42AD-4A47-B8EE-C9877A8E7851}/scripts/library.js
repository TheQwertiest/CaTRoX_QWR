class Library {
	constructor() {
		this.cur_artist = '';
		this.cur_artiste = '';
		this.filter = '';
		this.partialMatchConfig = $.split(ppt.partialMatchConfig, 0);

		this.artist = {}

		this.db = {
			artists: [],
			dj: [],
			lastUpd: 0,
			lastUpdate: 0
		}

		this.update = {
			artists: true,
			library: true
		}

		this.partialMatch = {
			artist: ppt.partialMatch,
			album: ppt.partialMatch,
			title: ppt.partialMatch,
			type: $.split(ppt.partialMatchType, 0),
			validRegEx: this.partialMatchConfig[3] && this.partialMatchConfig[3] != 0 && this.partialMatchConfig[3].length,
			verbose: this.partialMatchConfig[5] == 'true'
		}

		this.fuzzy = {
			albTrackTitle: this.partialMatch.title && (this.partialMatch.type[1] == 1 || this.partialMatch.type[1] == 3),
			djTrackTitle: this.partialMatch.title && (this.partialMatch.type[3] == 1 || this.partialMatch.type[3] == 3),
			level: $.clamp(parseFloat(this.partialMatchConfig[1]), 0, 100) / 100,
			trackTitle: false
		}

		this.truncateMatch = {
			albArtist: this.partialMatch.artist && (this.partialMatch.type[1] == 2 || this.partialMatch.type[1] == 3),
			albTrackTitle: this.partialMatch.title && (this.partialMatch.type[1] == 2 || this.partialMatch.type[1] == 3) && this.partialMatch.validRegEx,
			artist: false,
			djArtist: this.partialMatch.artist && (this.partialMatch.type[3] == 2 || this.partialMatch.type[3] == 3),
			djTrackTitle: this.partialMatch.title && this.partialMatch.validRegEx && (this.partialMatch.type[3] == 2 || this.partialMatch.type[3] == 3),
			trackTitle: false
		}

		ppt.libFilter = panel.id.local ? ppt.libFilter.replace('%rating%', '%_autorating%').trim() : ppt.libFilter.trim();
		if (ppt.libFilterUse && ppt.libFilter.length) this.filter = ppt.libFilter;
	}

	// Methods

	cut(name) {
		try {
			const n = name.split(RegExp(this.partialMatchConfig[3], 'gi'))[0];
			return n.length > 3 ? n : name;
		} catch (e) {
			return name;
		}
	}

	djRefine(li) {
		let i = 0;
		let nm_o = '#get_node#';
		li.OrderByFormat(tf.randomize, 1);
		li.OrderByFormat(tf.title, 1);
		if (!ml.sort_rand) li.OrderByFormat(ml.item_sort, ml.dir);
		li.OrderByFormat(tf.artist, 1);
		this.db.dj = [];
		const artists = tf.artist0.EvalWithMetadbs(li);
		const titles = tf.title0.EvalWithMetadbs(li);
		li.Convert().forEach((h, l) => {
			artists[l] = artists[l].toUpperCase();
			if (artists[l] != nm_o) {
				nm_o = artists[l];
				this.db.dj[i] = {
					artist: artists[l],
					item: []
				};
				this.db.dj[i].item.push({
					title: $.strip(titles[l]),
					handle: h,
					id: l
				});
				i++;
			} else this.db.dj[i - 1].item.push({
				title: $.strip(titles[l]),
				handle: h,
				id: l
			});
		});
	}

	djMatch(p_artist, p_title, p_lfm_pc) {
		if (!p_artist || !p_title) return false;
		const orig_artist = p_artist;
		const HAS = this.partialMatch.artist && this.partialMatch.type[3] != 0 ? true : false;
		p_artist = p_artist.toUpperCase();
		if (this.truncateMatch.djArtist) p_artist = this.cut(p_artist).trim();
		p_title = $.strip(p_title);
		let found = false;
		this.db.dj.some((v, j) => {
			if (found) return true;
			if (!HAS ? v.artist == p_artist : v.artist.includes(p_artist)) {
				this.db.dj[j].item.some((w) => {
					if (w.title == p_title) {
						this.load_dj(orig_artist, p_title, w.handle, w.id, p_lfm_pc);
						return found = true;
					}
				});
				if (this.fuzzy.djTrackTitle && !found) {
					this.db.dj[j].item.some((w) => {
						if (this.fuzzyMatch(p_title, w.title)) {
							this.load_dj(orig_artist, p_title, w.handle, w.id, p_lfm_pc);
							return found = true;
						}
					});
				}
				if (this.truncateMatch.djTrackTitle && !found) {
					const title_cut = this.cut(p_title);
					this.db.dj[j].item.some((w) => {
						if (this.cut(w.title) == title_cut) {
							this.load_dj(orig_artist, p_title, w.handle, w.id, p_lfm_pc);
							return found = true;
						}
					});
				}
			}
		});
		if (this.partialMatch.verbose && !found) $.trace('NO LIBRARY MATCH FOUND :: SEARCH: ' + p_artist + ' - ' + p_title + ' MATCH: ARTIST QUERY: ' + (HAS ? 'HAS' : 'IS ' + p_artist));
	}

	fuzzyMatch(n, l) {
		const levenshtein = (a, b) => {
			if (a.length === 0) return b.length;
			if (b.length === 0) return a.length;
			let i, j, prev, row, tmp, val;
			if (a.length > b.length) {
				tmp = a;
				a = b;
				b = tmp;
			}
			row = Array(a.length + 1);
			for (i = 0; i <= a.length; i++) row[i] = i;
			for (i = 1; i <= b.length; i++) {
				prev = i;
				for (j = 1; j <= a.length; j++) {
					if (b[i - 1] === a[j - 1]) val = row[j - 1];
					else val = Math.min(row[j - 1] + 1, Math.min(prev + 1, row[j] + 1));
					row[j - 1] = prev;
					prev = val;
				}
				row[a.length] = prev;
			}
			return row[a.length];
		}
		return 1 - levenshtein(n, l) / (n.length > l.length ? n.length : l.length) > this.fuzzy.level;
	}

	getAlbumMetadb(checkLib) {
		this.db.cache = plman.GetPlaylistItems(pl.cache());
		this.db.lastUpd = 0;

		alb.art.plHandleList = $.query(this.db.cache, 'artist IS ' + alb.artist);
		alb.art.plHandleList.OrderByFormat(tf.albumSortOrder, 1);
		if (checkLib) {
			const q = this.partialMatch.artist && this.partialMatch.type[1] != 0 ? ' HAS ' : ' IS ';
			const query = q == ' IS ' ? name.field.artist + q + alb.artist : $.queryArtist(alb.artist);
			alb.art.libHandleList = $.query(lib.getLibItems(), query);
			alb.art.libHandleList.OrderByFormat(tf.albumSortOrder, 1);
		}

		if (!alb.names.list || !alb.names.list.length) {
			txt.paint();
			return;
		}
		alb.names.list.forEach((v, i) => alb.getSource(v, i));

		alb.getHandleList(alb.names.list);
		alb.checkTrackSources();
		txt.paint();
	}

	getArtistTracks(p_album_artist) {
		if (this.truncateMatch.albArtist) p_album_artist = this.cut(p_album_artist).trim();
		const q = this.partialMatch.artist && this.partialMatch.type[1] != 0 ? ' HAS ' : ' IS ';
		const query = q == ' IS ' ? name.field.artist + q + p_album_artist : $.queryArtist(p_album_artist);
		if (this.partialMatch.artist && this.partialMatch.verbose) $.trace('MATCH ARTIST [ALBUM]: QUERY:' + q + p_album_artist);
		if (!p_album_artist) {
			this.artist.tracks = new FbMetadbHandleList();
			this.artist.tracksYt = new FbMetadbHandleList();
			this.artist.tracksTags = new FbMetadbHandleList();
			this.artist.tracksYtTags = new FbMetadbHandleList();
			return;
		}
		const d_lb = this.getLibItems().Clone();
		this.artist.tracks = $.query(d_lb, '(' + query + ') AND (NOT %path% HAS .tags) AND (NOT "$ext(%path%)" IS cue)' + (panel.id.local ? ' AND (NOT comment HAS youtube-dl)' : ''));
		this.artist.tracks.OrderByFormat(tf.randomize, 1);
		if (!ml.sort_rand) this.artist.tracks.OrderByFormat(ml.item_sort, ml.dir);
		this.artist.tracksTags = $.query(d_lb, '(' + query + ') AND (%path% HAS .tags) AND (NOT "$ext(%path%)" IS cue)' + (panel.id.local ? ' AND (NOT comment HAS youtube-dl)' : ''));
		this.artist.tracksTags.OrderByFormat(tf.randomize, 1);
		if (!ml.sort_rand) this.artist.tracksTags.OrderByFormat(ml.item_sort, ml.dir);
		if (panel.id.local) {
			this.artist.tracksYt = $.query(d_lb, '(' + query + ') AND (NOT %path% HAS .tags) AND (NOT "$ext(%path%)" IS cue) AND (comment HAS youtube-dl)');
			this.artist.tracksYt.OrderByFormat(tf.randomize, 1);
			if (!ml.sort_rand) this.artist.tracksYt.OrderByFormat(ml.item_sort, ml.dir);
			this.artist.tracksYtTags = $.query(d_lb, '(' + query + ') AND (%path% HAS .tags) AND (NOT "$ext(%path%)" IS cue) AND (comment HAS youtube-dl)');
			this.artist.tracksYtTags.OrderByFormat(tf.randomize, 1);
			if (!ml.sort_rand) this.artist.tracksYtTags.OrderByFormat(ml.item_sort, ml.dir);
		}
	}

	getLibArtists() {
		if (!this.update.artists) return this.db.artists;
		this.db.artists = [];
		const db_artists = this.getLibItems().Clone();
		let artist_o = '';
		db_artists.OrderByFormat(tf.artist0, 0);
		const artist = tf.artist0.EvalWithMetadbs(db_artists);
		db_artists.Convert().forEach((h, i) => {
			if (h.Path.slice(-7).toLowerCase() == '!!.tags' || h.Path.slice(-4).toLowerCase() == '.cue') return;
			artist[i] = artist[i].toLowerCase();
			if (artist[i] && artist_o != artist[i]) this.db.artists.push(artist[i]);
			artist_o = artist[i];
		});
		this.update.artists = false;
		return this.db.artists;
	}

	getLibItems() {
		if (!this.update.library) return this.db.library;
		this.update.library = false;
		this.db.library = fb.GetLibraryItems();
		if (this.filter) this.db.library = $.query(this.db.library, this.filter);
		return this.db.library;
	}

	inLibrary(p_artist, p_title, i, p_alb_set, p_no_load, p_handles) {
		if (!p_artist || !p_title) return false;
		const q = this.partialMatch.artist && ((p_alb_set && this.partialMatch.type[5] != 0) || (!p_alb_set && this.partialMatch.type[3] != 0)) ? ' HAS ' : ' IS ';
		this.fuzzy.trackTitle = this.partialMatch.title && ((p_alb_set && (this.partialMatch.type[5] == 1 || this.partialMatch.type[5] == 3)) || (!p_alb_set && (this.partialMatch.type[3] == 1 || this.partialMatch.type[3] == 3)));
		this.truncateMatch.artist = this.partialMatch.artist && ((p_alb_set && (this.partialMatch.type[5] == 2 || this.partialMatch.type[5] == 3)) || (!p_alb_set && (this.partialMatch.type[3] == 2 || this.partialMatch.type[3] == 3)));
		this.truncateMatch.trackTitle = this.partialMatch.title && this.partialMatch.validRegEx && ((p_alb_set && (this.partialMatch.type[5] == 2 || this.partialMatch.type[5] == 3)) || (!p_alb_set && (this.partialMatch.type[3] == 2 || this.partialMatch.type[3] == 3)));
		if (this.truncateMatch.artist) p_artist = this.cut(p_artist).trim();

		let query = '';
		if (p_artist != this.cur_artist || Date.now() - this.db.lastUpdate > 2000) {
			query = q == ' IS ' ? name.field.artist + q + p_artist : $.queryArtist(p_artist);
			this.db.artist = $.query(p_handles || this.getLibItems(), '(' + query + ') AND (NOT %path% HAS !!.tags)');
			this.db.artist.OrderByFormat(tf.randomize, 1);
			if (!ml.sort_rand) this.db.artist.OrderByFormat(ml.item_sort, ml.dir);
		}
		if (this.partialMatch.verbose) $.trace('MATCH: ARTIST QUERY: ' + '(' + query + ') AND (NOT %path% HAS !!.tags)');
		this.cur_artist = p_artist;
		p_title = $.strip(p_title);
		this.db.lastUpdate = Date.now();
		const titles = tf.title0.EvalWithMetadbs(this.db.artist);
		let found = false;
		let han = null;
		this.db.artist.Convert().some((h, j) => {
			titles[j] = $.strip(titles[j]);
			if (titles[j] == p_title) {
				if (!p_no_load) this.load_lib(h, i, 0, p_artist, p_title);
				else han = h;
				return found = true;
			}
			if (this.fuzzy.trackTitle) {
				if (this.fuzzyMatch(p_title, titles[j])) {
					if (!p_no_load) this.load_lib(h, i, 1, p_artist, p_title);
					else han = h;
					return found = true;
				}
			}
			if (this.truncateMatch.trackTitle) {
				const title_cut = this.cut(p_title);
				if (this.cut(titles[j]) == title_cut) {
					if (!p_no_load) this.load_lib(h, i, 1, p_artist, title_cut);
					else han = h;
					return found = true;
				}
			}
		});
		if (found) return p_no_load ? new FbMetadbHandleList([han]) : true;
		if (this.partialMatch.verbose) $.trace('NO LIBRARY MATCH FOUND :: SEARCH: ' + p_artist + ' - ' + p_title);
		return false;
	}

	inPlaylist(p_artist, p_title, i, p_refresh, p_load, p_alb_present, p_handles) {
		if (!p_artist || !p_title) return false;
		const q = !p_alb_present ? 'album MISSING AND artist IS ' + p_artist : 'artist IS ' + p_artist;
		if (p_artist != this.cur_artiste || Date.now() - this.db.lastUpd > 2000) {
			this.db.artiste = $.query(p_handles || this.db.cache, q);
			this.db.artiste.OrderByFormat(tf.randomize, 1);
			if (!ml.sort_rand) this.db.artiste.OrderByFormat(ml.item_sort, ml.dir);
		}

		this.cur_artiste = p_artist;
		p_title = $.strip(p_title);
		this.db.lastUpd = Date.now();
		const titles = tf.searchTitle.EvalWithMetadbs(this.db.artiste);
		let found = false;
		const handleList = new FbMetadbHandleList();
		this.db.artiste.Convert().some((h, j) => {
			titles[j] = $.strip(titles[j]);
			if (titles[j] == p_title) {
				handleList.Add(h);
				found = true;
				if (!p_refresh) {
					if (p_load) this.load_lib(handleList[0], i, 0, p_artist, p_title);
					return true;
				}
			}
		});
		if (p_load) return found;
		return handleList
	}

	inLibraryAlb(p_alb_id, p_artist, p_title, p_album, p_date, i, p_id, p_upd) {
		if (!p_title) return false;
		const search_title = p_title;
		const type_arr = ['YouTube Track', 'Prefer Library Track', 'Library Track'];
		let path = '';
		let tfa = '';
		let title = p_title;
		p_title = $.strip(p_title);
		const titles = tf.title0.EvalWithMetadbs(this.artist.tracks);
		const titles_tags = tf.title0.EvalWithMetadbs(this.artist.tracksTags);
		this.artist.tracks.Convert().some((h, k) => {
			if ($.strip(titles[k]) == p_title) {
				path = h.Path;
				tfa = h;
				return true;
			}
		});
		if (!path && panel.id.local && p_id) {
			const comment = tf.comment.EvalWithMetadbs(this.artist.tracksYt);
			const titlesYt = tf.title0.EvalWithMetadbs(this.artist.tracksYt);
			this.artist.tracksYt.Convert().some((h, k) => { // p_id only defined if updating m-TAGS video; only replaces if local youtube-dl video with matching vid
				if ($.strip(titlesYt[k]) == p_title && p_id == comment[k].slice(-11)) {
					path = h.Path;
					tfa = h;
					return true;
				}
			});
		}
		if (!path) this.artist.tracksTags.Convert().some((h, k) => { // if local, artist.tracksTags excl youtube-dl: any local youtube-dl video ignored
			if ($.strip(titles_tags[k]) == p_title) {
				path = ml.referencedFile(h);
				if (path) {
					tfa = h;
					return true;
				}
			}
		});
		if (!path && panel.id.local && p_id) {
			const comment = tf.comment.EvalWithMetadbs(this.artist.tracksYtTags);
			const titlesYt_tags = tf.title0.EvalWithMetadbs(this.artist.tracksYtTags);
			this.artist.tracksYtTags.Convert().some((h, k) => {
				if ($.strip(titlesYt_tags[k]) == p_title && p_id == comment[k].slice(-11)) {
					path = ml.referencedFile(h);
					if (path) {
						tfa = h;
						return true;
					}
				}
			});
		}
		if (this.partialMatch.verbose) $.trace('STANDARD MATCH ' + (path ? '' : 'NOT ') + 'FOUND [ALBUM] SEARCH: ' + p_artist + ' - ' + p_title);
		if (!path && this.fuzzy.albTrackTitle) {
			this.artist.tracks.Convert().some((h, k) => {
				if (this.fuzzyMatch(p_title, $.strip(titles[k]))) {
					path = h.Path;
					tfa = h;
					return true;
				}
			});
			if (!path) this.artist.tracksTags.Convert().some((h, k) => {
				if (this.fuzzyMatch(p_title, $.strip(titles_tags[k]))) {
					path = ml.referencedFile(h);
					if (path) {
						tfa = h;
						return true;
					}
				}
			});
			if (this.partialMatch.verbose) $.trace('FUZZY TITLE MATCH ' + (path ? '' : 'NOT ') + 'FOUND [ALBUM] :: SEARCH: ' + p_artist + ' - ' + p_title);
		}
		p_title = this.cut(p_title);
		title = this.cut(title);
		if (!path && this.truncateMatch.albTrackTitle) {
			this.artist.tracks.Convert().some((h, k) => {
				if (this.cut($.strip(titles[k])) == p_title) {
					path = h.Path;
					tfa = h;
					return true;
				}
			});
			if (!path) this.artist.tracksTags.Convert().some((h, k) => {
				if (this.cut($.strip(titles_tags[k])) == p_title) {
					path = ml.referencedFile(h);
					if (path) {
						tfa = h;
						return true;
					}
				}
			});
			if (this.partialMatch.verbose) $.trace('TRUNCATE TITLE MATCH ' + (path ? '' : 'NOT ') + 'FOUND [ALBUM] :: SEARCH: ' + p_artist + ' - ' + p_title);
		}
		if (this.partialMatch.verbose && !path) $.trace('NO LIBRARY MATCH FOUND [ALBUM] :: SEARCH: ' + p_artist + ' - ' + p_title);
		if (path) {
			const tf_d = tf.length.EvalWithMetadb(tfa) || [];
			const tf_rg = tf.trackGain.EvalWithMetadb(tfa) || [];
			const tf_rp = tf.trackPeak.EvalWithMetadb(tfa) || [];
			if (p_upd) return [p_alb_id, '/' + path.replace(/\\/g, '/'), tf_d, tf_rg, tf_rp, i];
			panel.add_loc.mtags[p_alb_id].push({
				'@': '/' + path.replace(/\\/g, '/'),
				'ALBUM': p_album,
				'ARTIST': p_artist,
				'DATE': p_date,
				'DURATION': tf_d,
				'REPLAYGAIN_TRACK_GAIN': tf_rg,
				'REPLAYGAIN_TRACK_PEAK': tf_rp,
				'TITLE': title,
				'TRACKNUMBER': i.toString(),
				'YOUTUBE_TITLE': [],
				'SEARCH_TITLE': search_title ? search_title : [],
				'TRACK_TYPE': type_arr[ppt.libAlb]
			});
		}
		return !p_upd ? path : [];
	}

	inLibraryArt(p_artist) {
		if (!p_artist) return false;
		return this.getLibArtists().some(v => v == p_artist.toLowerCase());
	}

	load_dj(orig_artist, p_title, handle, id, p_lfm_pc) {
		if (panel.add_loc.std.every(v => v.id !== id)) panel.add_loc.std.push({
			'artist': orig_artist,
			'title': p_title,
			'handle': handle,
			'id': id,
			'playcount': p_lfm_pc
		});
	}

	load_lib(handle, id, v, p_ar, p_ti) {
		panel.add_loc.std.push({
			'handle': handle,
			'id': id
		})
		if (this.partialMatch.verbose) $.trace((!v ? 'STANDARD MATCH ' : v == 1 ? 'FUZZY TITLE MATCH ' : 'TRUNCATE TITLE MATCH ') + 'FOUND :: SEARCH: ' + p_ar + ' - ' + p_ti);
	}

	remove_playlist(name) {
		let i = plman.PlaylistCount;
		while (i--)
			if (plman.GetPlaylistName(i).includes(name)) plman.RemovePlaylist(i);
	}
}