class YoutubeSearch {
	constructor(state_callback, on_search_done_callback) {
		this.alb_set;
		this.album;
		this.channelTitle = [];
		this.date;
		this.description = [];
		this.done;
		this.fn = '';
		this.full_alb = false;
		this.func = null;
		this.get_length = false;
		this.ix;
		this.length = [];
		this.link = [];
		this.metadata;
		this.mTags = false;
		this.on_search_done_callback = on_search_done_callback;
		this.pn;
		this.ready_callback = state_callback;
		this.timer = null;
		this.title = [];
		this.type;
		this.url = '';
		this.v_length = 0;
		this.xmlhttp = null;
	
		this.id = {
			alt: -1,
			first: -1
		}

		this.yt = {
			filt: ppt.yt_filter,
			title: ''
		}

		this.ytSearch = {
			feedback: false
		}
	}

	onStateChange() {
		if (this.xmlhttp != null && this.func != null)
			if (this.xmlhttp.readyState == 4) {
				clearTimeout(this.timer);
				this.timer = null;
				if (this.xmlhttp.status == 200) this.func();
				else {
					this.Null();
					$.trace('youtube N/A: ' + (this.xmlhttp.responseText || 'Status error: ' + this.xmlhttp.status));
				}
			}
	}

	search(p_alb_id, p_artist, p_title, p_ix, p_done, p_pn, p_extra_metadata, p_alb_set, p_full_alb, p_fn, p_type, p_album, p_date, p_mTags) {
		let post = '';
		let URL = '';

		this.func = null;
		this.xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');

		if (!this.get_length) {
			this.id.alb = p_alb_id;
			this.ytSearch.artist = p_artist;
			this.ytSearch.origTitle = p_title;
			this.ytSearch.title = p_title;
			this.ix = p_ix;
			this.done = p_done;
			this.pn = p_pn;
			this.metadata = p_extra_metadata;
			this.alb_set = p_alb_set;
			this.full_alb = p_full_alb;
			this.fn = p_fn;
			this.type = p_type;
			this.album = p_album;
			this.date = p_date;
			this.mTags = p_mTags;

			if (!ml.fooYouTubeInstalled) {
				$.trace('youtube functionality N/A: foo_youtube not Installed');
				return this.Null();
			}

			if (!this.ytSearch.artist || !this.ytSearch.title) return this.Null();
			if (this.yt.filt) this.yt.filt = !index.filter_yt(this.ytSearch.title, '');
		}

		switch (ppt.ytDataSource) {
			case 0: // api
				URL = panel.url.yt_api;
				if (!this.get_length) URL += 'search?part=snippet&maxResults=25&q=' + encodeURIComponent(p_artist + ' ' + p_title) + '&order=' + panel.youTube.order + '&type=video&fields=items(id(videoId),snippet(title)' + (this.yt.filt || ppt.ytPref ? ',snippet(description)' : '') + (ppt.ytPref ? ',snippet(channelTitle)' : '') + ')' + panel.yt;
				else URL += 'videos?part=contentDetails&id=' + this.link + '&fields=items(contentDetails(duration))' + panel.yt;
				break;
			case 1: // web
				URL = panel.url.yt_web1;
				post = JSON.stringify({
					'context': {
						'client': {
							'clientName': 'WEB',
							'clientVersion': '2.20210224.06.00',
							'newVisitorCookie': true,
							'sp': panel.youTube.order == 'relevance' ? 'EgIQAQ%253D%253D' : 'CAMSAhAB'
						},
						'user': {
							'lockedSafetyMode': false
						}
					},
					'query': p_artist + ' ' + p_title
				});
				panel.logger();
				break;
			case 2: // web alternative: currently not working as yt web site no longer supports ie
				URL = panel.url.yt_web2 + encodeURIComponent(p_artist + ' ' + p_title) + (panel.youTube.order == 'relevance' ? '&sp=EgIQAQ%253D%253D' : '&sp=CAMSAhAB');
				panel.logger();
				break;
		}

		this.func = this.analyse;
		this.xmlhttp.open(ppt.ytDataSource != 1 ? 'GET' : 'POST', URL);
		this.xmlhttp.onreadystatechange = this.ready_callback;
		if (!this.timer) {
			const a = this.xmlhttp;
			this.timer = setTimeout(() => {
				a.abort();
				if (this.full_alb && !this.fn) {
					alb.setRow(this.id.alb, 0);
					txt.paint();
				}
				this.on_search_done_callback(this.id.alb, '', this.ytSearch.artist, '', '', 'force');
				this.timer = null;
			}, 30000);
		}
		ppt.ytDataSource != 1 ? this.xmlhttp.send() : this.xmlhttp.send(post);
	}

	analyse() {
		this.url = '';
		this.v_length = 0;
		switch (ppt.ytDataSource) {
			case 0: {
				const data = $.jsonParse(this.xmlhttp.responseText, false, 'get', 'items');
				if (data && !this.get_length) {
					data.forEach(v => {
						if (v.id && v.id.videoId) {
							this.title.push(v.snippet.title);
							this.link.push(v.id.videoId);
						}
						if (this.yt.filt || ppt.ytPref) {
							const d = v.snippet.description;
							this.description.push(d ? d : '');
						}
						if (ppt.ytPref) {
							const ct = v.snippet.channelTitle;
							this.channelTitle.push(ct ? ct : '');
						}
					});
					this.get_length = true;
					return this.search();
				}
				if (data && this.get_length) {
					data.forEach((v, i) => {
						this.length[i] = this.secs(v.contentDetails.duration) || '';
						this.link[i] = 'v=' + this.link[i];
					});
					const m = this.IsGoodMatch(this.title, this.link, this.yt.filt || ppt.ytPref ? this.description : '', ppt.ytPref ? this.channelTitle : '', this.length, data.length);
					if (m != -1) this.setUrl('matched', m);
				}
				if (!this.get_length) return;
				if (!this.url.length) {
					if (this.setUrl('fallback') == false) return this.Null();
				}
				break;
			}
			case 1: {
				const primaryContents = $.jsonParse(this.xmlhttp.responseText, [], 'get', `contents.twoColumnSearchResultsRenderer.primaryContents`);
				this.parseData(primaryContents);
				if (this.title.length && this.link.length) {
					const m = this.IsGoodMatch(this.title, this.link, this.yt.filt || ppt.ytPref ? this.description : '', ppt.ytPref ? this.channelTitle : '', this.length, this.link.length);
					if (m != -1) this.setUrl('matched', m);
					if (!this.url.length) {
						if (this.setUrl('fallback') == false) return this.Null();
					}
				} else this.Null();
				break;
			}
			case 2: {
				let content = this.xmlhttp.responseText.match(/(window\["ytInitialData"]|var ytInitialData)\s*=\s*(.*)};/); // confirmed as working on dummy file; window\["ytInitialData"] is likely old format & if so can be removed
				content = content[0].trim();
				content = content.substring(content.indexOf('{'), content.length - 1);
				content = content.replace(/^\s*.*?{/, '{').replace(/};\s*$/, '}');
				const primaryContents = $.jsonParse(content, [], 'get', `contents.twoColumnSearchResultsRenderer.primaryContents`);
				this.parseData(primaryContents);
				if (this.title.length && this.link.length) {
					const m = this.IsGoodMatch(this.title, this.link, this.yt.filt || ppt.ytPref ? this.description : '', ppt.ytPref ? this.channelTitle : '', this.length, this.link.length);
					if (m != -1) this.setUrl('matched', m);
					if (!this.url.length) {
						if (this.setUrl('fallback') == false) return this.Null();
					}
				} else this.Null();
				break;
			}
		}
		this.on_search_done_callback(this.id.alb, this.url, this.ytSearch.artist, this.ytSearch.title, this.ix, this.done, this.pn, this.alb_set, this.v_length, this.ytSearch.origTitle, this.yt.title, this.full_alb, this.fn, this.type, this.album, this.date, this.mTags);
	}

	IsGoodMatch(video_title, video_id, video_descr, video_uploader, video_len, p_done) {
		const base_OK = [];
		const bl_artist = $.tidy(this.ytSearch.artist);
		const clean_artist = $.removeDiacritics($.strip(this.ytSearch.artist.replace(/&/g, '').replace(/\band\b/gi, '')));
		const clean_title = $.removeDiacritics($.strip(this.ytSearch.title.replace(/&/g, '').replace(/\band\b/gi, '')));
		const mv = [];
		let i = 0;
		let j = 0;
		let k = 0;
		for (i = 0; i < p_done; i++) {
			const clean_vid_title = $.removeDiacritics($.strip(video_title[i].replace(/&/g, '').replace(/\band\b/gi, '')));
			base_OK[i] = video_len[i] && (!this.full_alb ? video_len[i] < 1800 : video_len[i] > 1800) && !blk.blackListed(bl_artist, video_id[i]) && (!this.yt.filt ? true : !index.filter_yt(video_title[i], video_descr[i]));
			if (clean_vid_title.includes(clean_artist) && clean_vid_title.includes(clean_title) && base_OK[i]) {
				if (!ppt.ytPref) return i;
				else mv.push({
					ix: i,
					uploader: video_uploader[i],
					title: video_title[i],
					descr: video_descr[i]
				});
			}
		}
		if (mv.length) {
			if (ppt.ytPrefVerboseLog) $.trace('Match List. Search Artist: ' + this.ytSearch.artist + '; Search Title: ' + this.ytSearch.title + '\n' + JSON.stringify(mv, null, 3));
			for (k = 0; k < index.yt_pref_kw.length; k++) {
				for (j = 0; j < mv.length; j++)
					if (index.pref_yt(index.yt_pref_kw[k], (ppt.ytPref ? mv[j].uploader : '') + (ppt.ytPref ? mv[j].title : '') + (ppt.ytPref ? mv[j].descr : ''))) {
						if (ppt.ytPrefVerboseLog) $.trace('MATCHED: Artist - Title AND Preference Keyword: ' + index.yt_pref_kw[k] + ': Search Artist: ' + this.ytSearch.artist + '; Search Title: ' + this.ytSearch.title + '; Video Loaded: ix: ' + mv[j].ix + '; Video Title: ' + mv[j].title + '. Keywords checked vs' + (ppt.ytPref ? ' Uploader' : '') + (ppt.ytPref ? ' Title' : '') + (ppt.ytPref ? ' Descr' : ''));
						this.ytSearch.feedback = true;
						return mv[j].ix;
					} if (k == index.yt_pref_kw.length - 1) {
					if (ppt.ytPrefVerboseLog) $.trace('MATCHED: Artist - Title ONLY. NO preference keyword match.' + ' Search Artist: ' + this.ytSearch.artist + '; Search Title: ' + this.ytSearch.title + '; Video Loaded: ix: ' + mv[0].ix + '; Video Title: ' + mv[0].title + '. Keywords checked vs' + (ppt.ytPref ? ' Uploader' : '') + (ppt.ytPref ? ' Title' : '') + (ppt.ytPref ? ' Descr' : ''));
					this.ytSearch.feedback = true;
					return mv[0].ix;
				}
			}
		} else if (ppt.ytPrefVerboseLog && ppt.ytPref) $.trace('NO Artist - Title matches. Keyword preference N/A. Search Artist: ' + this.ytSearch.artist + '; Search Title: ' + this.ytSearch.title);
		for (i = 0; i < p_done; i++) {
			if (this.id.first == -1) this.id.first = i;
			if (this.id.alt == -1 && base_OK[i]) this.id.alt = i;
		}
		return -1;
	}

	cleanse(n) {
		return n.replace(/&amp(;|)/g, '&').replace(/&quot(;|)/g, '"').replace(/&#39(;|)/g, "'").replace(/&gt(;|)/g, '>').replace(/&nbsp(;|)/g, '').replace(/(\.mv4|1080p|1080i|1080|\d(\d|)(\.|\s-)|explicit( version|)|full HD|HD full|full HQ|full song|(high |HD - |HD-|HD )quality|(| |with |& |w( |)\/( |)|\+ )lyric(s(!|) on Screen|s|)|(official |)music video( |)|official (music|version|video)( |)|(song |official (fan |)|)audio( version| only| clean|)|(| |\+ )official( solo| |)|uncensored|vevo presents|video( |))|\.wmv/gi, '').replace(/(HD|HQ)(\s-\s|)/g, '').replace(/\((|\s+)\)/g, '').replace(/\[(|\s+)\]/g, '').replace(/\(\)/g, '').replace(/\[\]/g, '').replace(/\s+/g, ' ').replace(/[\s-/\\+]+$/g, '').trim();
	}

	parseData(primaryContents) {
		let data = [];
		if (primaryContents.sectionListRenderer) {
			//'itemSectionRenderer' isn't always first: all contents need to be looped
			let contents = $.getProp(primaryContents, 'sectionListRenderer.contents', []);
			let found = false;
			contents.some(v => {
				let item = $.getProp(v, 'itemSectionRenderer.contents', []);
				found = item.some(w => {
					if (w.videoRenderer) {
						data = item;
						return true;
					}
				});
				if (found) return true;
			});
			// rich
		} else if (primaryContents.richGridRenderer) {
			data = primaryContents.richGridRenderer.contents
				.filter(v => !Object.prototype.hasOwnProperty.call(v, 'continuationItemRenderer'))
				.map(v => (v.richItemRenderer || v.richSectionRenderer).content);
		}
		for (let i = 0; i < data.length; i++) {
			const vr = $.getProp(data[i], 'videoRenderer', '');
			const id = vr.videoId;
			if (id) {
				this.link.push('v=' + id);
				this.title.push(this.parseText(vr.title, ''));
				this.length.push(this.seconds(this.parseText(vr.lengthText, '')));
				if (this.yt.filt || ppt.ytPref) this.description.push(this.parseText(vr.descriptionSnippet, ''));
				if (ppt.ytPref) this.channelTitle.push(this.parseText(vr.longBylineText, ''));
			}
		}
	}

	parseText(txt, def = null) {
		if (typeof txt !== 'object') return def;
		if (Object.prototype.hasOwnProperty.call(txt, 'simpleText')) return txt.simpleText;
		if ($.isArray(txt.runs)) {
			return txt.runs.map(a => a.text).join('');
		}
		return def;
	}

	Null() {
		if (this.full_alb && !this.fn) {
			alb.setRow(this.id.alb, 0);
			txt.paint();
		}
		this.on_search_done_callback(this.id.alb, '', this.ytSearch.artist, '', '', this.done, this.pn, this.alb_set);
	}

	seconds(n) {
		const dur = n.split(':');
		let sec = 0;
		let min = 1;
		while (dur.length > 0) {
			sec += min * parseInt(dur.pop(), 10);
			min *= 60;
		}
		return sec || '';
	}

	secs(n) {
		const re = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
		if (re.test(n)) {
			const m = re.exec(n);
			return (Number(m[1]) * 3600 || 0) + (Number(m[2]) || 0) * 60 + (Number(m[3]) || 0);
		}
	}

	setUrl(type, m) {
		switch (type) {
			case 'matched':
				this.ytSearch.title = this.stripTitle(this.cleanse(this.ytSearch.title), this.ytSearch.artist, true);
				this.v_length = this.length[m];
				this.url = '3dydfy://www.youtube.com/watch?' + (!this.mTags ? (this.metadata ? this.metadata + '&' : '') + 'fb2k_title=' + encodeURIComponent(this.ytSearch.title + (!this.full_alb ? '' : ' (Full Album)')) + '&fb2k_search_title=' + encodeURIComponent(this.ytSearch.origTitle) + '&fb2kx_length=' + encodeURIComponent(this.v_length) + '&fb2k_artist=' + encodeURIComponent(this.ytSearch.artist) + '&' : '') + this.link[m];
				this.yt.title = this.title[m];
				if (ppt.ytPrefVerboseLog && !this.ytSearch.feedback) $.trace('MATCHED: Artist - Title: ' + 'Search Artist: ' + this.ytSearch.artist + '; Search Title: ' + this.ytSearch.title + '; Video Loaded: ix: ' + m + '; Video Title: ' + this.title[m]);
				break;
			case 'fallback': {
				if (this.full_alb) return false;
				const id = this.id.alt != -1 ? this.id.alt : this.id.first;
				if (id != -1) this.v_length = this.length[id];
				else return false;
				if (ppt.ytPrefVerboseLog) $.trace('IDEAL MATCH NOT FOUND. Search Artist: ' + this.ytSearch.artist + '; Search Title: ' + this.ytSearch.title + '; Video Loaded: ix: ' + id + '; Video Title: ' + this.title[id]);
				this.ytSearch.title = this.stripTitle(this.cleanse(this.title[id]), this.ytSearch.artist);
				this.url = '3dydfy://www.youtube.com/watch?' + (!this.mTags ? (this.metadata ? this.metadata + '&' : '') + 'fb2k_title=' + encodeURIComponent(this.ytSearch.title) + '&fb2k_search_title=' + encodeURIComponent(this.ytSearch.origTitle) + '&fb2kx_length=' + encodeURIComponent(this.v_length) + '&fb2k_artist=' + encodeURIComponent(this.ytSearch.artist) + '&' : '') + this.link[id];
				this.yt.title = this.title[id];
				return true;
			}
		}
	}

	stripTitle(n1, n2, type) {
		if (n1 == n2) return n1;
		n2 = n2.replace(/([*$])/g, '\\$1');
		if (type) {
			if (RegExp(n2 + ' - ', 'i').test(n1)) return n1.replace(RegExp(n2 + ' - ', 'i'), '');
			else return n1.replace(RegExp(' - ' + n2, 'i'), '');
		}
		const t1 = n2.replace(/^The /i, '');
		const w = "(( |)((and|&|featuring|of|with)|((feat|ft|vs)(.|)))|'s) ";
		if (RegExp(w, 'i').test(n1))
			if (RegExp(n2 + w, 'i').test(n1) || RegExp(w + n2, 'i').test(n1) || RegExp(t1 + w, 'i').test(n1) || RegExp(w + t1, 'i').test(n1))
				return n1;
		const a = '(( +)?([-;:, ~|/(\\[]+)( +)?|)';
		const b = '(the |by (the |)|by: |"|)';
		const c = '("|)';
		const d = '(( +)?([-;:, ~|/)\\]]+)( +)?|)';
		let t2 = '';
		if (!/^The /i.test(n2)) t2 = n1.replace(RegExp(a + b + n2 + c + d, 'i'), ' - ').replace(/^ - | - (.|)$/g, '');
		else t2 = n1.replace(RegExp(a + b + t1 + c + d, 'i'), ' - ').replace(/^ - | - (.|)$/g, '');
		return /\S/.test(t2) ? t2 : n1;
	}
}

class YoutubeVideoAvailable {
	constructor(state_callback, on_search_done_callback) {
		this.alb_id;
		this.artist;
		this.done;
		this.fn;
		this.i;
		this.full_alb = false;
		this.func = null;
		this.on_search_done_callback = on_search_done_callback;
		this.ready_callback = state_callback;
		this.title;
		this.type;
		this.xmlhttp = null;
	}

	onStateChange() {
		if (this.xmlhttp != null && this.func != null)
			if (this.xmlhttp.readyState == 4) {
				if (this.xmlhttp.status == 200) this.func();
				else $.trace('youtube N/A: ' + (this.xmlhttp.responseText || 'Status error: ' + this.xmlhttp.status) + '\n' + panel.yt);
			}
	}

	search(p_alb_id, p_artist, p_title, p_i, p_done, p_id, p_full_alb, p_fn, p_type) {
		this.alb_id = p_alb_id;
		this.artist = p_artist;
		this.done = p_done;
		this.fn = p_fn;
		this.i = p_i;
		this.full_alb = p_full_alb;
		this.title = p_title;
		this.type = p_type;

		if (blk.blackListed($.tidy(this.artist), `v=${p_id}`)) return this.on_search_done_callback(this.alb_id, this.artist, this.title, this.i, this.done, this.full_alb, this.fn, this.type, 0);

		this.func = null;
		this.xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
		const URL = panel.url.yt_api + 'videos?id=' + p_id + '&part=status' + panel.yt;

		this.func = this.analyse;
		this.xmlhttp.open('GET', URL);
		this.xmlhttp.onreadystatechange = this.ready_callback;
		this.xmlhttp.send();
	}

	analyse() {
		const data = $.jsonParse(this.xmlhttp.responseText, [], 'get', 'items');
		this.on_search_done_callback(this.alb_id, this.artist, this.title, this.i, this.done, this.full_alb, this.fn, this.type, data.length);
	}
}

class LfmSimilarArtists {
	constructor(state_callback, on_search_done_callback) {
		this.artVariety;
		this.fo;
		this.fln;
		this.func = null;
		this.lfmCacheFile;
		this.list = [];
		this.lmt = 0;
		this.on_search_done_callback = on_search_done_callback;
		this.pg = 0;
		this.ready_callback = state_callback;
		this.retry = false;
		this.source;
		this.timer = null;
		this.xmlhttp = null;
		this.dj = {}
	}

	onStateChange() {
		if (this.xmlhttp != null && this.func != null)
			if (this.xmlhttp.readyState == 4) {
				clearTimeout(this.timer);
				this.timer = null;
				if (this.xmlhttp.status == 200) this.func();
				else {
					if (this.artVariety && !this.retry) {
						if (this.dj.type != 4) this.retry = true;
						if ($.file(this.fln)) this.lfmCacheFile = true;
						return this.search();
					}
					this.on_search_done_callback('');
					if (this.artVariety && this.dj.mode > 1) dj.medLib('', this.source, this.dj.mode, this.dj.type, this.artVariety);
					$.trace('last.fm similar artists N/A: ' + this.xmlhttp.responseText || 'Status error: ' + this.xmlhttp.status);
				}
			}
	}

	search(p_source, p_djMode, p_artVariety, p_djType) {
		if (!this.retry) {
			this.artVariety = p_artVariety;
			this.dj.mode = p_djMode;
			this.source = p_source;
			this.dj.type = p_djType;
			const djSource = $.clean(this.source);
			this.fo = dj.f2 + djSource.substr(0, 1).toLowerCase() + '\\';
			this.fln = this.fo + djSource + (this.dj.type == 4 ? ' - Top Artists.json' : ' And Similar Artists.json');
		}
		this.lfmCacheFile = !this.retry ? !panel.expired(this.fln, Thirty_Days) : $.file(this.fln);
		this.func = null;
		this.xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
		let chk, len = 0;
		let URL;
		if (!this.artVariety && $.file(this.fln)) chk = $.jsonParse(this.fln, false, 'file');
		if (chk) len = chk.length;
		if (this.lfmCacheFile) {
			if (this.artVariety) {
				this.list = $.jsonParse(this.fln, false, 'file');
				if (!this.list) this.list = [];
				if (this.list.length > 219 && ($.objHasOwnProperty(this.list[0], 'name') || this.dj.type == 4)) {
					if (this.dj.mode > 1) {
						dj.medLib(this.list, this.source, this.dj.mode, this.dj.type, this.artVariety);
						return;
					}
					return this.on_search_done_callback(this.list, this.source, this.dj.mode);
				}
			} else {
				this.list = $.jsonParse(this.fln, false, 'file');
				if (!this.list) this.list = [];
				if (this.list.length > 99) return this.on_search_done_callback(this.list, this.source, this.dj.mode);
			}
		}
		this.lmt = !this.retry ? (this.artVariety || len > 115 ? 249 : 100) : (this.artVariety || len > 115 ? 235 + Math.floor(Math.random() * 14) : 105 + Math.floor(Math.random() * 10));
		if (this.dj.type != 4) {
			URL = panel.url.lfm + '&method=artist.getSimilar&artist=' + encodeURIComponent(this.source) + '&limit=' + this.lmt + '&autocorrect=1';
		} else {
			this.pg++;
			URL = 'https://www.last.fm/tag/' + encodeURIComponent(this.source) + '/artists?page=' + this.pg;
		}

		this.func = this.analyse;
		this.xmlhttp.open('GET', URL);
		this.xmlhttp.onreadystatechange = this.ready_callback;
		this.xmlhttp.setRequestHeader('User-Agent', 'foobar2000_script');
		if (this.retry || this.dj.type == 4) this.xmlhttp.setRequestHeader('If-Modified-Since', 'Thu, 01 Jan 1970 00:00:00 GMT');
		if (!this.timer) {
			const a = this.xmlhttp;
			this.timer = setTimeout(() => {
				a.abort();
				this.timer = null;
			}, 30000);
		}
		this.xmlhttp.send();
	}

	analyse() {
		const data = this.dj.type != 4 ? $.jsonParse(this.xmlhttp.responseText, [], 'get', 'similarartists.artist') : this.xmlhttp.responseText;
		if (!this.retry && this.dj.type != 4 && (!data || data.length < this.lmt)) {
			this.retry = true;
			return this.search();
		}
		if (data.length) {
			if (this.dj.type == 4) {
				doc.open();
				const div = doc.createElement('div');
				div.innerHTML = data;
				const link = div.getElementsByTagName('a');
				if (!link) return doc.close();
				$.htmlParse(link, false, false, v => {
					if (v.className.includes('link-block-target')) {
						const a = decodeURIComponent(v.href.replace('about:/music/', '').replace(/\+/g, '%20'));
						if (!a.includes('about:/tag/')) this.list.push(a);
					}
				});
				doc.close();
				if (this.pg < 13) return this.search(this.source, this.dj.mode, this.artVariety, this.dj.type);
				if (this.list.length) {
					$.create(this.fo);
					$.save(this.fln, JSON.stringify(this.list), true);
				}
				if (this.dj.mode > 1) return dj.medLib(this.list, this.source, this.dj.mode, this.dj.type, this.artVariety);
			} else {
				this.list = data.map(v => ({
					name: v.name,
					score: Math.round(v.match * 100)
				}));
				this.list.unshift({
					name: this.source,
					score: 100
				});
				$.create(this.fo);
				$.save(this.fln, JSON.stringify(this.list), true);
				if (this.dj.mode > 1) return dj.medLib(this.list, this.source, this.dj.mode, this.dj.type, this.artVariety);
			}
		}
		this.on_search_done_callback(this.list, this.source, this.dj.mode);
		if (!data && this.artVariety && this.dj.mode > 1) dj.medLib('', this.source, this.dj.mode, this.dj.type, this.artVariety);
	}
}

class LfmDjTracksSearch {
	constructor(state_callback, on_search_done_callback) {
		this.artVariety;
		this.artistTopTracks = false;
		this.curPop;
		this.done;
		this.fo;
		this.fn;
		this.fnc;
		this.func = null;
		this.ix;
		this.lfmCurPopCacheFile;
		this.lfmCacheFile;
		this.list = [];
		this.lmt = 0;
		this.on_search_done_callback = on_search_done_callback;
		this.pg = 1;
		this.pn;
		this.ready_callback = state_callback;
		this.retry = false;
		this.songHot;
		this.timer = null;
		this.xmlhttp = null;
		this.dj = {}
	}

	onStateChange() {
		if (this.xmlhttp != null && this.func != null)
			if (this.xmlhttp.readyState == 4) {
				clearTimeout(this.timer);
				this.timer = null;
				if (this.xmlhttp.status == 200) this.func();
				else if (!this.retry) {
					this.retry = true;
					if ($.file(this.fn)) this.lfmCacheFile = true;
					if ($.file(this.fnc)) this.lfmCurPopCacheFile = true;
					return this.search();
				} else if (this.dj.type != 2 || this.dj.mode == 2) {
					this.on_search_done_callback('', '', this.ix, this.done, this.pn, this.dj.mode, this.dj.type);
					$.trace('last.fm top tracks N/A: ' + this.xmlhttp.responseText || 'Status error: ' + this.xmlhttp.status);
				}
			}
	}

	search(p_djSource, p_djMode, p_djType, p_artVariety, p_songHot, p_curPop, p_ix, p_done, p_pn) {
		if (!this.retry) {
			this.dj.source = p_djSource;
			this.dj.mode = p_djMode;
			this.dj.type = p_djType;
			this.artVariety = p_artVariety;
			this.songHot = p_songHot;
			this.curPop = p_curPop;
			this.ix = p_ix;
			this.done = p_done;
			this.pn = p_pn;
			const sp = $.clean(this.dj.source);
			this.fo = dj.f2 + sp.substr(0, 1).toLowerCase() + '\\';
			this.fn = this.fo + sp + (this.dj.type != 3 ? '.json' : ' [Similar Songs].json');
			this.lfmCacheFile = !panel.expired(this.fn, TwentyEight_Days);
			if (this.dj.mode == 2 && ppt.useSaved) this.lfmCacheFile = true;
			if (this.curPop) {
				this.fnc = this.fo + sp + ' [curr].json';
				this.lfmCurPopCacheFile = !panel.expired(this.fnc, One_Week);
			}
		}

		switch (this.dj.type) {
			case 1:
				if (this.lfmCacheFile) {
					this.list = $.jsonParse(this.fn, false, 'file');
					if (!this.list) break;
					$.take(this.list, this.songHot);
					if (this.dj.mode != 2) ppt.trackCount = this.list.length;
					if (this.list.length >= this.songHot || this.dj.mode == 2 && ppt.useSaved) {
						this.list.forEach(this.stripRemaster);
						return this.on_search_done_callback(this.list, '', this.ix, '', this.pn, this.dj.mode, 1, this.curPop, this.artVariety);
					}
				}
				break;
			case 3:
				if (this.lfmCacheFile) {
					this.list = $.jsonParse(this.fn, false, 'file');
					if (this.list && $.objHasOwnProperty(this.list[0], 'playcount') || this.dj.mode == 2 && ppt.useSaved) {
						$.take(this.list, this.songHot);
						if (this.dj.mode != 2) ppt.trackCount = this.list.length;
						if (this.list.length >= this.songHot || this.dj.mode == 2 && ppt.useSaved) {
							this.list.forEach(this.stripRemaster);
							return this.on_search_done_callback(this.list, '', this.ix, '', this.pn, this.dj.mode, 3, this.curPop, this.artVariety);
						}
					}
				}
				break;
			default:
				if (this.curPop && this.lfmCurPopCacheFile || !this.curPop && this.lfmCacheFile) {
					this.list = $.jsonParse(this.curPop ? this.fnc : this.fn, false, 'file');
					if (!this.list) break;
					if (this.curPop) {
						if (this.list.length >= this.songHot) {
							this.list.forEach(this.stripRemaster);
							return this.on_search_done_callback(this.dj.source, this.list, this.ix, this.done, this.pn, this.dj.mode, this.dj.type, this.curPop, this.artVariety);
						}
					} else {
						let newOK = false;
						if (this.list && $.objHasOwnProperty(this.list[0], 'artist')) {
							newOK = true;
							this.list.shift();
						}
						if (newOK && this.list.length >= this.songHot || this.dj.mode == 2 && ppt.useSaved) {
							this.list.forEach(this.stripRemaster);
							return this.on_search_done_callback(this.dj.source, this.list, this.ix, this.done, this.pn, this.dj.mode, this.dj.type, this.curPop, this.artVariety);
						}
					}
				}
				break;
		}

		if (this.dj.mode == 2 && ppt.useSaved) return this.on_search_done_callback('', '', this.ix, this.done, this.pn, this.dj.mode, this.dj.type, this.curPop, this.artVariety);
		// workarounds applied as required to deal with occasional last.fm bug - list too short (doesn't start at beginning)
		this.func = null;
		this.xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
		let URL = panel.url.lfm;
		if (this.dj.type == 0 || this.dj.type == 2) this.artistTopTracks = true;

		if (this.artistTopTracks) {
			this.lmt = this.curPop ? 100 : Math.max(200, this.songHot);
			if (!this.curPop) {
				if (this.retry) this.lmt += 5 + Math.floor(Math.random() * 10);
				URL += '&method=artist.getTopTracks&artist=' + encodeURIComponent(this.dj.source) + '&limit=' + this.lmt + '&autocorrect=1';
			} else URL = 'https://www.last.fm/music/' + encodeURIComponent(this.dj.source) + '/+tracks?date_preset=LAST_30_DAYS&page=' + this.pg;
		} else if (this.dj.type == 1) {
			this.lmt = !this.retry ? this.songHot : this.songHot != 1000 ? this.songHot + 5 + Math.floor(Math.random() * 10) : this.songHot - 5;
			URL += '&method=tag.getTopTracks&tag=' + encodeURIComponent(this.dj.source) + '&limit=' + this.lmt + '&autocorrect=1';
		} else {
			if (!this.dj.source.includes('|')) return this.on_search_done_callback('', '', this.ix, '', this.pn, this.dj.mode, this.dj.type, this.curPop, this.artVariety);
			const dj_sourc = this.dj.source.split('|');
			this.lmt = !this.retry ? 250 : 240;
			URL += '&method=track.getSimilar&artist=' + encodeURIComponent(dj_sourc[0].trim()) + '&track=' + encodeURIComponent(dj_sourc[1].trim()) + '&limit=' + this.lmt + '&autocorrect=1';
		}

		this.func = this.analyse;
		this.xmlhttp.open('GET', URL);
		this.xmlhttp.onreadystatechange = this.ready_callback;
		this.xmlhttp.setRequestHeader('User-Agent', 'foobar2000_script');
		if (this.retry || this.curPop) this.xmlhttp.setRequestHeader('If-Modified-Since', 'Thu, 01 Jan 1970 00:00:00 GMT');
		if (this.dj.mode != 2 && !this.timer) {
			const a = this.xmlhttp;
			this.timer = setTimeout(() => { // auto dj handles own timeout
				a.abort();
				this.timer = null;
			}, 30000);
		}
		this.xmlhttp.send();
	}

	analyse() {
		let data = false;
		let div, items = 0;
		this.list = [];
		switch (this.dj.type) {
			case 3:
				data = $.jsonParse(this.xmlhttp.responseText, [], 'get', 'similartracks.track');
				break;
			default:
				if (this.curPop) {
					doc.open();
					div = doc.createElement('div');
					div.innerHTML = this.xmlhttp.responseText;
					data = div.getElementsByTagName('a');
				} else if (this.dj.type != 1) data = $.jsonParse(this.xmlhttp.responseText, [], 'get', 'toptracks.track');
				else data = $.jsonParse(this.xmlhttp.responseText, [], 'get', 'tracks.track');
				break;
		}
		items = data.length;
		if (!this.retry && !this.curPop && (!items || ((this.artistTopTracks || this.dj.type == 1 || this.dj.type == 3) && items < this.lmt))) {
			this.retry = true;
			if ($.file(this.fn)) this.lfmCacheFile = true;
			return this.search();
		}
		if (items) {
			$.create(this.fo);
			let save_list = [];
			switch (this.dj.type) {
				case 1:
					save_list = data.map(v => ({
						artist: v.artist.name,
						title: v.name
					}));
					this.list = $.take(data, this.songHot).map(this.tracks);
					if (this.dj.mode != 2) ppt.trackCount = data.length;
					this.on_search_done_callback(this.list, '', this.ix, '', this.pn, this.dj.mode, 1, this.curPop, this.artVariety);
					if (save_list.length) $.save(this.fn, JSON.stringify(save_list), true);
					break;
				case 3:
					save_list = data.map(v => ({
						artist: v.artist.name,
						title: v.name,
						playcount: v.playcount
					}));
					this.list = $.take(data, this.songHot).map(this.tracks);
					if (this.dj.mode != 2) ppt.trackCount = data.length;

					this.on_search_done_callback(this.list, '', this.ix, '', this.pn, this.dj.mode, 3, this.curPop, this.artVariety);
					if (save_list.length) $.save(this.fn, JSON.stringify(save_list), true);
					break;
				default:
					if (this.curPop) {
						const playcount = [];
						const title = [];
						$.htmlParse(data, 'className', '', v => {
							if (v.parentNode && v.parentNode.className && v.parentNode.className == 'chartlist-name') title.push(v.innerText.trim())
						});
						$.htmlParse(div.getElementsByTagName('span'), 'className', 'chartlist-count-bar-value', v => playcount.push(parseFloat(v.innerText.replace(',', '')) * 9));
						doc.close();
						if (this.pg == 1 && this.songHot > 50) {
							this.pg++;
							return this.search(this.dj.source, this.dj.mode, this.dj.type, this.artVariety, this.songHot, this.curPop, this.ix, this.done, this.top50, this.pn);
						}
						this.list = title.map((v, i) => ({
							title: $.stripRemaster(v),
							playcount: playcount[i]
						}));
						save_list = title.map((v, i) => ({
							title: v,
							playcount: playcount[i]
						}));
						this.list = this.uniq(this.list);
						save_list = this.uniq(save_list);
						if (save_list.length) $.save(this.fnc, JSON.stringify(save_list), true);
					} else {
						this.list = data.map(v => ({
							title: $.stripRemaster(v.name),
							playcount: v.playcount
						}));
						save_list = data.map(v => ({
							title: v.name,
							playcount: v.playcount
						}));
						try {
							save_list.unshift({
								artist: data[0].artist.name,
								ar_mbid: data[0].artist.mbid
							});
						} catch (e) {
							save_list.unshift({
								artist: this.dj.source,
								ar_mbid: 'N/A'
							});
						}
						if (save_list.length) $.save(this.fn, JSON.stringify(save_list), true);
					}
					this.on_search_done_callback(this.dj.source, this.list, this.ix, this.done, this.pn, this.dj.mode, this.dj.type, this.curPop, this.artVariety);
					break;
			}
		} else this.on_search_done_callback('', '', this.ix, this.done, this.pn, this.dj.mode, this.dj.type, this.curPop, this.artVariety);
	}

	stripRemaster(v) {
		v.title = $.stripRemaster(v.title);
	}

	tracks(v) {
		return ({
			artist: v.artist.name,
			title: $.stripRemaster(v.name)
		});
	}

	uniq(a) {
		const flags = [];
		const result = [];
		a.forEach(v => {
			if (flags[v.title + v.playcount]) return;
			result.push(v);
			flags[v.title + v.playcount] = true;
		});
		return result;
	}
}

class LfmAlbumCover {
	constructor(state_callback) {
		this.fo;
		this.func = null;
		this.ready_callback = state_callback;
		this.timer = null;
		this.xmlhttp = null;
	}

	onStateChange() {
		if (this.xmlhttp != null && this.func != null)
			if (this.xmlhttp.readyState == 4) {
				clearTimeout(this.timer);
				this.timer = null;
				if (this.xmlhttp.status == 200) this.func();
				else $.trace('last.fm album cover N/A: ' + this.xmlhttp.responseText || 'Status error: ' + this.xmlhttp.status);
			}
	}

	search(p_artist, p_album, p_fo) {
		this.fo = p_fo;
		const URL = panel.url.lfm + '&method=album.getInfo&artist=' + encodeURIComponent(p_artist) + '&album=' + encodeURIComponent(p_album) + '&autocorrect=1';
		this.func = null;
		this.xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
	
		this.func = this.analyse;
		this.xmlhttp.open('GET', URL);
		this.xmlhttp.onreadystatechange = this.ready_callback;
		this.xmlhttp.setRequestHeader('User-Agent', 'foobar2000_script');
		if (!this.timer) {
			const a = this.xmlhttp;
			this.timer = setTimeout(() => {
				a.abort();
				this.timer = null;
			}, 30000);
		}
		this.xmlhttp.send();
	}

	analyse() {
		const data = $.jsonParse(this.xmlhttp.responseText, [], 'get', 'album.image');
		if (data.length < 5) return $.trace('last.fm album cover N/A');
		let pth = data[4]['#text'];
		if (pth) {
			const pthSplit = pth.split('/');
			pthSplit.splice(pthSplit.length - 2, 1);
			pth = pthSplit.join('/');
		} else return $.trace('last.fm album cover N/A');
		$.run('cscript //nologo "' + panel.yttm + 'foo_lastfm_img.vbs" "' + pth + '" "' + this.fo + 'cover' + pth.slice(-4) + '"', 0);
	}
}

class MusicbrainzReleases {
	constructor(state_callback, on_search_done_callback) {
		this.add;
		this.alb_id;
		this.album;
		this.album_artist;
		this.attempt = 0;
		this.date;
		this.extra, this.func = null;
		this.initial = true;
		this.on_search_done_callback = on_search_done_callback;
		this.mTags;
		this.prime;
		this.ready_callback = state_callback;
		this.rg_mbid;
		this.timer = null;
		this.xmlhttp = null;
	}

	onStateChange() {
		if (this.xmlhttp != null && this.func != null)
			if (this.xmlhttp.readyState == 4) {
				clearTimeout(this.timer);
				this.timer = null;
				if (this.xmlhttp.status == 200) this.func();
				else if (this.xmlhttp.status == 503 && this.attempt < 5) {
					setTimeout(() => {
						this.attempt++;
						this.search();
					}, 450);
				} else {
					$.trace('musicbrainz releases N/A: ' + this.xmlhttp.responseText || 'Status error: ' + this.xmlhttp.status);
					this.Null();
				}
			}
	}

	search(p_alb_id, p_rg_mbid, p_album_artist, p_album, p_prime, p_extra, p_date, p_add, p_mTags) {
		if (this.initial) {
			this.alb_id = p_alb_id;
			this.rg_mbid = p_rg_mbid;
			this.album_artist = p_album_artist;
			this.album = p_album;
			this.prime = p_prime;
			this.add = p_add;
			this.date = p_date;
			this.extra = p_extra;
			this.mTags = p_mTags;
		}
		this.initial = false;
		this.func = null;
		this.xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
		let URL = panel.url.mb;
		if (ppt.mb == 1) URL += 'release-group/' + this.rg_mbid + '?inc=releases&fmt=json';
		else URL += 'release/?query="' + encodeURIComponent($.regexEscape(this.album.trim())) + '" AND artist:' + encodeURIComponent($.regexEscape(this.album_artist.trim())) + '&fmt=json';

		this.func = this.analyse;
		this.xmlhttp.open('GET', URL);
		this.xmlhttp.onreadystatechange = this.ready_callback;
		this.xmlhttp.setRequestHeader('User-Agent', 'foobar2000_yttm (https://hydrogenaud.io/index.php/topic,111059.0.html)');
		if (!this.timer) {
			const a = this.xmlhttp;
			this.timer = setTimeout(() => {
				a.abort();
				this.timer = null;
			}, 30000);
		}
		this.xmlhttp.send();
	}

	analyse() {
		const releases = $.jsonParse(this.xmlhttp.responseText, [], 'get', 'releases');
		if (!releases.length) return this.Null();
		let re_mbid = '';
		if (!ppt.mb) {
			releases.some(v => {
				if (($.strip(v.title) == $.strip(this.album.replace(/\s\[(Single|EP|Remix|Live|Other).*?\]$/, ''))) && v.date && v.date.substring(0, 4)) {
					re_mbid = v.id;
					this.on_search_done_callback(this.alb_id, this.rg_mbid, this.album_artist, this.album, this.prime, this.extra, v.date.substring(0, 4), this.add, this.mTags, re_mbid);
					return true;
				}
			});
		} else {
			if (this.prime == $.jsonParse(this.xmlhttp.responseText, [])['primary-type']) {
				releases.some(v => {
					if (($.strip(v.title) == $.strip(this.album.replace(/\s\[(Single|EP|Remix|Live|Other).*?\]$/, '')))) {
						re_mbid = v.id;
						this.on_search_done_callback(this.alb_id, this.rg_mbid, this.album_artist, this.album, this.prime, this.extra, this.date, this.add, this.mTags, re_mbid);
						return true;
					}
				});
			}
		}
		if (!re_mbid) this.Null();
	}

	Null() {
		this.on_search_done_callback(this.alb_id, this.rg_mbid, this.album_artist, this.album, this.prime, this.extra, this.date, this.add, this.mTags);
	}
}

class AlbumTracks {
	constructor(state_callback, on_search_done_callback) {
		this.add;
		this.alb_id;
		this.album;
		this.album_artist;
		this.attempt = 0;
		this.date;
		this.extra;
		this.func = null;
		this.initial = true;
		this.on_search_done_callback = on_search_done_callback;
		this.mTags;
		this.prime;
		this.re_mbid;
		this.rg_mbid;
		this.ready_callback = state_callback;
		this.mb;
		this.timer = null;
		this.xmlhttp = null;
	}

	onStateChange() {
		if (this.xmlhttp != null && this.func != null)
			if (this.xmlhttp.readyState == 4) {
				clearTimeout(this.timer);
				this.timer = null;
				if (this.xmlhttp.status == 200) this.func();
				else if (this.mb && this.xmlhttp.status == 503 && this.attempt < 5) {
					setTimeout(() => {
						this.attempt++;
						this.search();
					}, 450);
				} else {
					$.trace((this.mb ? 'musicbrainz' : 'last.fm') + ' album tracks N/A: ' + this.xmlhttp.responseText || 'Status error: ' + this.xmlhttp.status);
					this.mb ? this.mb_return() : this.lfm_return();
				}
			}
	}

	search(p_alb_id, p_rg_mbid, p_album_artist, p_album, p_prime, p_extra, p_date, p_add, p_mTags, p_re_mbid, p_mb) {
		if (this.initial) {
			this.add = p_add;
			this.alb_id = p_alb_id;
			this.re_mbid = p_re_mbid;
			this.rg_mbid = p_rg_mbid;
			this.album_artist = p_album_artist;
			this.album = p_album;
			this.date = p_date;
			this.extra = p_extra;
			this.prime = p_prime;
			this.mTags = p_mTags;
			this.mb = p_mb;
		}
		this.initial = false;
		this.func = null;
		this.xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
		let URL;
		switch (this.mb) {
			case 0:
				URL = panel.url.lfm;
				URL += '&method=album.getInfo&artist=' + encodeURIComponent(this.album_artist) + '&album=' + encodeURIComponent(this.album) + '&autocorrect=1';
				break;
			case 1:
				URL = panel.url.mb + 'release/' + this.re_mbid + '?inc=recordings&fmt=json';
				break;
		}

		this.func = this.analyse;
		this.xmlhttp.open('GET', URL);
		this.xmlhttp.onreadystatechange = this.ready_callback;
		this.xmlhttp.setRequestHeader('User-Agent', 'foobar2000_yttm (https://hydrogenaud.io/index.php/topic,111059.0.html)');
		if (!this.mb) this.xmlhttp.setRequestHeader('If-Modified-Since', 'Thu, 01 Jan 1970 00:00:00 GMT');
		if (!this.timer) {
			const a = this.xmlhttp;
			this.timer = setTimeout(() => {
				a.abort();
				this.timer = null;
			}, 7000);
		}
		this.xmlhttp.send();
	}

	analyse() {
		let data = [];
		let list = [];
		switch (this.mb) {
			case 0:
				data = $.jsonParse(this.xmlhttp.responseText, false, 'get', 'album.tracks.track');
				list = data.map(v => ({
					artist: this.album_artist.replace(/’/g, "'"),
					title: $.stripRemaster(v.name.replace(/’/g, "'")),
					album: this.album,
					date: this.date,
					mTags: this.mTags
				}));
				if (list.length) {
					return this.on_search_done_callback(this.alb_id, list, this.album_artist, this.album, this.prime, this.extra, this.date, this.add, this.mTags);
					$.trace('album track list from last.fm');
				}
				this.lfm_return();
				break;
			case 1:
				data = $.jsonParse(this.xmlhttp.responseText, [], 'get', 'media');
				let items = [];
				data.forEach(v => items = [...items, ...v.tracks]);
				list = items.map(v => ({
					artist: this.album_artist.replace(/’/g, "'"),
					title: v.title.replace(/’/g, "'"),
					album: this.album,
					date: this.date,
					mTags: this.mTags
				}));
				if (list.length) {
					return this.on_search_done_callback(this.alb_id, list, this.album_artist, this.album, this.prime, this.extra, this.date, this.add, this.mTags);
					$.trace('album track list from musicbrainz');
				}
				this.mb_return();
				break;
		}
	}

	lfm_return() {
		alb.dld.getMbTracks(this.alb_id, this.rg_mbid, this.album_artist, this.album, this.prime, this.extra, this.date, this.add, this.mTags, this.re_mbid);
	}

	mb_return() {
		alb.dld.getLfmTracks(this.alb_id, this.rg_mbid, this.album_artist, this.album, this.prime, this.extra, this.date, this.add, this.mTags, this.re_mbid);
	}

	Null() {
		alb.setRow(this.alb_id, 0);
		txt.paint();
		this.on_search_done_callback(this.alb_id, '', this.album_artist, this.album, this.prime, this.extra, this.date, this.add, this.mTags);
	}
}

class MusicbrainzArtistId {
	constructor(state_callback, on_search_done_callback) {
		this.ar_mbid = '';
		this.attempt = 0;
		this.dbl_load;
		this.func = null;
		this.only_mbid;
		this.list = [];
		this.initial = true;
		this.mbid_search = false;
		this.mbid_source = 1;
		this.mb_done = false;
		this.mode;
		this.on_search_done_callback = on_search_done_callback;
		this.ready_callback = state_callback;
		this.related_artists = $.file(alb.art.relatedCustom) ? $.jsonParse(alb.art.relatedCustom, {}, 'file') : {};
		this.search_param;
		this.tag_mbid = '';
		this.timer = null;
		this.xmlhttp = null;

		this.done = {
			lfm: false,
			mb: false
		}
	}

	onStateChange() {
		if (this.xmlhttp != null && this.func != null)
			if (this.xmlhttp.readyState == 4) {
				clearTimeout(this.timer);
				this.timer = null;
				if (this.xmlhttp.status == 200) this.func();
				else if (this.xmlhttp.status == 503 && this.attempt < 5) {
					setTimeout(() => {
						this.attempt++;
						this.search();
					}, 450);
				} else if (this.mbid_search) {
					alb.artist = this.search_param;
					return this.on_search_done_callback('', '', this.mode);
				} else switch (this.mbid_source) {
					case 0:
						this.done.lfm = true;
						this.mbid_source = 1;
						$.trace('last.fm mbid N/A: ' + this.xmlhttp.responseText || 'Status error: ' + this.xmlhttp.status);
						this.lfm_return();
						break;
					case 1:
						this.done.mb = true;
						this.mbid_source = 0;
						$.trace('musicbrainz mbid N/A: ' + this.xmlhttp.responseText || 'Status error: ' + this.xmlhttp.status);
						this.mb_return();
						break;
				}
			}
	}

	search(p_album_artist, p_only_mbid, p_dbl_load, p_mode) {
		if (this.initial) {
			this.dbl_load = p_dbl_load;
			this.only_mbid = p_only_mbid;
			this.mode = p_mode;
			this.search_param = p_album_artist;
		}
		this.initial = false;
		this.tag_mbid = $.eval('$trim($if3(%musicbrainz_artistid%,%musicbrainz artist id%,))');
		if (!this.tag_mbid) this.tag_mbid = this.related_artists[this.search_param.toUpperCase()];
		if (!this.tag_mbid || this.tag_mbid.length != 36) this.tag_mbid = '';
		this.func = null;
		this.xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
		let URL = panel.url.mb + 'artist/';
		switch (this.mbid_source) {
			case 0:
				URL = panel.url.lfm;
				URL += '&method=artist.getInfo&artist=' + encodeURIComponent(this.search_param) + '&autocorrect=1';
				break;
			case 1:
				URL += '?query=' + encodeURIComponent($.regexEscape(this.search_param.toLowerCase())) + '&fmt=json';
				break;
		}

		this.func = this.analyse;
		this.xmlhttp.open('GET', URL);
		this.xmlhttp.onreadystatechange = this.ready_callback;
		this.xmlhttp.setRequestHeader('User-Agent', 'foobar2000_yttm (https://hydrogenaud.io/index.php/topic,111059.0.html)');
		if (!this.mbid_source) this.xmlhttp.setRequestHeader('If-Modified-Since', 'Thu, 01 Jan 1970 00:00:00 GMT');
		if (!this.timer) {
			const a = this.xmlhttp;
			this.timer = setTimeout(() => {
				a.abort();
				this.timer = null;
			}, 7000);
		}
		this.xmlhttp.send();
	}

	analyse() {
		let data;
		switch (this.mbid_source) {
			case 0:
				this.done.lfm = true;
				this.mbid_source = 1;
				data = $.jsonParse(this.xmlhttp.responseText, false, 'get', 'artist.mbid');
				if (!data) return this.lfm_return();
				else this.ar_mbid = data;
				if (!this.ar_mbid && !this.list.length) this.lfm_return();
				break;
			case 1: {
				this.done.mb = true;
				this.mbid_source = 0;
				data = $.jsonParse(this.xmlhttp.responseText, [], 'get', 'artists');
				this.list = data.map(v => ({
					name: v.name,
					id: v.id,
					disambiguation: v.disambiguation || ''
				}));
				if (!this.list.length) return this.mb_return();

				let artist = $.strip(this.search_param);
				const get_mbid = v => {
					if (artist == $.strip(v.name)) {
						this.ar_mbid = v.id;
						return true;
					}
				}
				this.list.some(get_mbid);
				if (!this.ar_mbid) {
					const tfo = FbTitleFormat('$ascii(' + $.regexEscape(artist) + ')');
					artist = tfo.Eval(true);
					this.list.some(get_mbid);
				}
				if (!this.ar_mbid) {
					this.list.unshift({
						name: alb.artist + ' [Related]:',
						id: ''
					});
				} else if (this.list.length == 1) this.list[0] = {
					name: alb.artist + ' [No Related Artists]',
					id: '',
					disambiguation: ''
				}
				else this.list[0] = {
					name: alb.artist + ' [Related]:',
					id: this.ar_mbid
				};
				break;
			}
		}
		if (!this.dbl_load) alb.art.related = this.list;
		if (!ppt.showSimilar && !this.dbl_load) {
			alb.artists.list = alb.art.related;
			alb.calcRowsArtists();
			txt.paint();
		}
		this.on_search_done_callback(this.tag_mbid ? this.tag_mbid : this.ar_mbid, this.only_mbid, this.mode);
	}

	lfm_return() {
		if (this.done.mb) this.on_search_done_callback('', '', this.mode);
		else this.search(this.search_param, this.only_mbid, this.dbl_load, this.mode);
	}

	mb_return() {
		this.list[0] = {
			name: 'Related Artists N/A',
			id: '',
			disambiguation: ''
		};
		alb.art.related = this.list;
		if (!ppt.showSimilar && !this.dbl_load) {
			alb.artists.list = alb.art.related;
			alb.calcRowsArtists();
			txt.paint();
		}
		if (this.done.lfm) this.on_search_done_callback('', '', this.mode);
		else this.search(this.search_param, this.only_mbid, this.dbl_load, this.mode);
	}
}

class AlbumNames {
	constructor(state_callback, on_search_done_callback) {
		this.ar_mbid = false;
		this.attempt = 0;
		this.data = [];
		this.fo;
		this.fn;
		this.func = null;
		this.initial = true;
		this.json_data = [];
		this.lfmCacheFile;
		this.lmt = 0;
		this.mode;
		this.offset = 0;
		this.on_search_done_callback = on_search_done_callback;
		this.ready_callback = state_callback;
		this.releases = 0;
		this.retry = false;
		this.sp = '';
		this.timer = null;
		this.xmlhttp = null;
	}

	onStateChange() {
		if (this.xmlhttp != null && this.func != null)
			if (this.xmlhttp.readyState == 4) {
				clearTimeout(this.timer);
				this.timer = null;
				if (this.xmlhttp.status == 200) {
					if (ppt.mb == 1) this.offset += 100;
					this.func();
				} else if (ppt.mb == 1 && this.xmlhttp.status == 503 && this.attempt < 5) {
					setTimeout(() => {
						this.attempt++;
						this.search();
					}, 450);
				} else {
					$.trace(
						['last.fm ' + (!this.mode ? 'top albums N/A: ' : this.mode == 1 ? 'top tracks N/A: ' : 'similar songs N/A: '), 'musicbrainz album names N/A: ', 'official charts album names N/A: '][ppt.mb] +
						this.xmlhttp.responseText || 'Status error: ' + this.xmlhttp.status);
					this.on_search_done_callback([], this.ar_mbid, this.mode);
				}
			}
	}

	search(p_ar_mbid, p_mode) {
		if (this.initial) {
			this.ar_mbid = p_ar_mbid;
			this.mode = p_mode;
		}
		this.initial = false;
		this.func = null;
		this.xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
		let chk, URL;
		if (ppt.mb == 1) URL = panel.url.mb + 'release-group?artist=' + this.ar_mbid + '&limit=100&offset=' + this.offset + '&fmt=json';
		else if (!ppt.mb) { // workarounds applied as required to deal with occasional last.fm bug - list too short (doesn't start at beginning)
			URL = panel.url.lfm;
			switch (this.mode) {
				case 0:
					this.lmt = !this.retry ? 100 : 105 + Math.floor(Math.random() * 10);
					URL += '&method=artist.getTopAlbums&artist=' + encodeURIComponent(alb.artist) + '&limit=' + this.lmt + '&autocorrect=1';
					break;
				case 1:
					this.sp = $.clean(alb.artist);
					this.fo = dj.f2 + this.sp.substr(0, 1).toLowerCase() + '\\';
					this.fn = this.fo + this.sp + '.json';
					this.lfmCacheFile = !this.retry ? !panel.expired(this.fn, TwentyEight_Days) : $.file(this.fn);
					if (this.lfmCacheFile) {
						this.data = [];
						this.data = $.jsonParse(this.fn, false, 'file');
						if (this.data && $.objHasOwnProperty(this.data[0], 'artist')) this.data.shift();
						if (this.data.length > 199) return this.on_search_done_callback($.take(this.data, 100), this.ar_mbid, this.mode);
					}
					this.lmt = 0;
					if ($.file(this.fn)) chk = $.jsonParse(this.fn, false, 'file');
					if (chk) this.lmt = chk.length - 1;
					this.lmt = Math.max(201 + Math.floor(Math.random() * 5), this.lmt);
					if (this.retry) this.lmt += 5 + Math.floor(Math.random() * 10);
					URL += '&method=artist.getTopTracks&artist=' + encodeURIComponent(alb.artist) + '&limit=' + this.lmt + '&autocorrect=1';
					break;
				case 2: {
					const ar_ti = alb.artist_title.split('|');
					const ar = !ar_ti[0] ? '' : ar_ti[0].trim();
					const ti = !ar_ti[1] ? '' : ar_ti[1].trim();
					this.sp = ar + ' - ' + ti;
					this.sp = $.clean(this.sp);
					this.fo = dj.f2 + this.sp.substr(0, 1).toLowerCase() + '\\';
					this.fn = this.fo + this.sp + ' [Similar Songs].json';
					this.lfmCacheFile = !this.retry ? !panel.expired(this.fn, TwentyEight_Days) : $.file(this.fn);
					if (this.lfmCacheFile) {
						this.data = [];
						this.data = $.jsonParse(this.fn, false, 'file');
						if (this.data.length > 99) return this.on_search_done_callback($.take(this.data, 100), this.ar_mbid, this.mode);
					}
					this.lmt = 0;
					if ($.file(this.fn)) chk = $.jsonParse(this.fn, false, 'file');
					if (chk) this.lmt = chk.length;
					this.lmt = Math.max(100, this.lmt);
					if (this.retry) this.lmt = this.lmt != 250 ? this.lmt + 5 + Math.floor(Math.random() * 10) : this.lmt - 5;
					URL += '&method=track.getSimilar&artist=' + encodeURIComponent(ar) + '&track=' + encodeURIComponent(ti) + '&limit=' + this.lmt + '&autocorrect=1';
					break;
				}
			}
		} else {
			this.fo = dj.f2 + 's\\';
			this.fn = this.fo + 'Singles Charts.json';
			let content = [];
			this.chartData = $.jsonParse(this.fn, [], 'file');
			if (this.chartData.length) {
				const chartDate = ppt.chartDate.toString();
				const chartStamp = Date.parse([chartDate.slice(0, 4), chartDate.slice(4, 6), chartDate.slice(6, 8)].join('-'))
				this.chartData.some(v => {
					if (chartStamp >= v.from && chartStamp < v.to + One_Day) {
						content = v.chart;
						return true;
					}
				});
			}
			if (content.length) return this.on_search_done_callback(content, this.ar_mbid, this.mode);
			URL = panel.url.chart + ppt.chartDate + '/7501/';
		}

		this.func = this.analyse;
		this.xmlhttp.open('GET', URL);
		this.xmlhttp.onreadystatechange = this.ready_callback;
		this.xmlhttp.setRequestHeader('User-Agent', 'foobar2000_yttm (https://hydrogenaud.io/index.php/topic,111059.0.html)');
		if (!ppt.mb && this.retry) this.xmlhttp.setRequestHeader('If-Modified-Since', 'Thu, 01 Jan 1970 00:00:00 GMT');
		if (!this.timer) {
			const a = this.xmlhttp;
			this.timer = setTimeout(() => {
				a.abort();
				this.timer = null;
			}, 7000);
		}
		this.xmlhttp.send();
	}

	analyse() {
		this.data = [];
		if (ppt.mb == 1) {
			const response = $.jsonParse(this.xmlhttp.responseText, [], 'get', 'release-groups');
			if (!response.length) return this.on_search_done_callback('', this.ar_mbid, this.mode);
			this.json_data = [...this.json_data, ...response];
			if (this.offset == 100) this.releases = $.jsonParse(this.xmlhttp.responseText, 0, 'get', 'release-group-count');
			if (!this.releases) return this.on_search_done_callback('', this.ar_mbid, this.mode);

			if (this.releases < this.offset || this.offset == 600) {
				this.data = $.sort(this.json_data, 'first-release-date', 'rev');
				this.on_search_done_callback(this.data, this.ar_mbid, this.mode);
			} else {
				this.attempt = 0;
				this.search();
			}
		} else if (!ppt.mb) {
			let list, save_list = [];
			let tracks;
			switch (this.mode) {
				case 0:
					this.data = $.jsonParse(this.xmlhttp.responseText, [], 'get', 'topalbums.album');
					if (!this.retry && (this.data.length < this.lmt)) {
						this.retry = true;
						return this.search();
					}
					if (!this.data.length) break;
					$.take(this.data, 100);
					break;
				case 1:
					this.data = [];
					list = $.jsonParse(this.xmlhttp.responseText, [], 'get', 'toptracks.track');
					if (!this.retry && (list.length < this.lmt)) {
						this.retry = true;
						return this.search();
					}
					if (!list.length) break;
					tracks = v => ({
						title: v.name,
						playcount: v.playcount
					});
					save_list = list.map(tracks);
					this.data = $.take(list, 100).map(tracks);
					if (save_list.length) {
						$.create(this.fo);
						$.save(this.fn, JSON.stringify(save_list), true);
					}
					break;
				case 2:
					this.data = [];
					list = $.jsonParse(this.xmlhttp.responseText, [], 'get', 'similartracks.track');
					if (!this.retry && (list.length < this.lmt)) {
						this.retry = true;
						return this.search();
					}
					if (!list.length) break;
					tracks = v => ({
						artist: v.artist.name,
						title: v.name,
						playcount: v.playcount
					});
					save_list = list.map(tracks);
					this.data = $.take(list, 100).map(tracks);
					if (save_list.length) {
						$.create(this.fo);
						$.save(this.fn, JSON.stringify(save_list), true);
					}
					break;
			}
		} else {
			let list = [];
			doc.open();
			const div = doc.createElement('div');
			div.innerHTML = this.xmlhttp.responseText;
			this.data = div.getElementsByTagName('div');
			let i = 0;
			$.htmlParse(this.data, 'className', 'artist', v => {
				list[i] = {
					artist: $.titlecase(v.firstChild && v.firstChild.innerHTML.replace(/&amp(;|)/g, '&').replace(/&quot(;|)/g, '"').toLowerCase())
				};
				i++;
			});
			i = 0;
			$.htmlParse(this.data, 'className', 'title', v => {
				list[i].title = $.titlecase(v.firstChild && v.firstChild.innerHTML.replace(/&amp(;|)/g, '&').replace(/&quot(;|)/g, '"').toLowerCase());
				i++;
			});
			$.htmlParse(div.getElementsByTagName('p'), 'className', 'article-date', v => {
				list[0].date = v.innerHTML.trim();
				return true;
			});
			if (!this.retry && list.length < 40) {
				this.retry = true;
				return this.search();
			}
			this.data = $.take(list, 100);
			const dates = list[0].date.split('-');
			const item = {
				from: Date.parse(dates[0].trim()),
				to: Date.parse(dates[1].trim()),
				span: list[0].date,
				chart: this.data
			}
			if (this.fn && $.isArray(this.chartData)) {
				this.chartData.push(item);
			} else {
				this.chartData = [item];
			}
			$.create(this.fo);
			$.save(this.fn, JSON.stringify(this.chartData), true);
			doc.close();
		}
		this.on_search_done_callback(this.data, this.ar_mbid, this.mode);
	}
}

class AutoDjTracks {
	constructor() {
		this.artVariety;
		this.curPop;
		this.dj = {};
		this.hl = new FbMetadbHandleList();
		this.limit;
		this.list = [];
		this.on_search_done_callback;
		this.rec = [];
		this.songHot;
		this.loadTime = [];
		this.received = 0;
		this.start = {};

		this.searchParams = [];
	}

	execute(p_search_finish_callback, p_djSource, p_djMode, p_djType, p_artVariety, p_songHot, p_limit, p_curPop, p_pn) {
		this.list = [];
		this.on_search_done_callback = p_search_finish_callback;
		this.dj.source = p_djSource;
		this.dj.mode = p_djMode;
		this.dj.type = p_djType;
		this.artVariety = p_artVariety;
		this.songHot = p_songHot;
		this.limit = p_limit;
		this.curPop = p_curPop;
		index.reset_add_loc();

		if (!ppt.useSaved && (this.dj.type == 2 || this.dj.type == 4)) {
			const lfm_similar = new LfmSimilarArtists(() => lfm_similar.onStateChange(), this.lfm_similar_search_done.bind(this));
			lfm_similar.search(this.dj.source, this.dj.mode, this.artVariety, this.dj.type);
		} else if (!this.dj.mode) {
			if (alb.playlist.length) {
				this.on_search_done_callback(true, 0, '', '', '', '', '', this.dj.type);
				dj.list.items = alb.playlist;
				const tracks = this.dj.type == 'new' ? alb.playlist.slice(0, dj.get_no(this.limit, plman.PlaylistItemCount(pl.dj()))) :
					alb.playlist.slice(ppt.playTracksListIndex, ppt.playTracksListIndex + dj.get_no(false, plman.PlaylistItemCount(pl.dj())));
				tracks.forEach((v, i) => this.do_youtube_search('playTracks', v.artist, v.title, i, tracks.length, p_pn));
				ppt.playTracksListIndex = ppt.playTracksListIndex + tracks.length;
			}
		} else if (!ppt.useSaved) this.do_lfm_dj_tracks_search(this.dj.source, this.dj.mode, this.dj.type, this.artVariety, this.songHot, this.curPop, '', '', p_pn);
		else {
			const djSource = $.clean(this.dj.source);
			let cur, data, fn, i, tracks;
			switch (this.dj.type == 4 ? 2 : this.dj.type) {
				case 0:
					fn = dj.f2 + djSource.substr(0, 1).toLowerCase() + '\\' + djSource + (this.curPop ? ' [curr]' : '') + '.json';
					if (!$.file(fn)) fn = dj.f2 + djSource.substr(0, 1).toLowerCase() + '\\' + djSource + (!this.curPop ? ' [curr]' : '') + '.json';
					if (!$.file(fn)) return this.on_search_done_callback(false, this.dj.mode);
					data = $.jsonParse(fn, false, 'file');
					if (!data) return this.on_search_done_callback(false, this.dj.mode);
					this.on_search_done_callback(true, this.dj.mode);
					cur = fn.includes(' [curr]');
					if ($.objHasOwnProperty(data[0], 'artist')) data.shift();
					this.list = $.take(data, this.songHot).map(this.titles);
					$.sort(this.list, 'playcount', 'numRev');
					dj.list.items = this.list;
					dj.list.isCurPop = cur;
					dj.param = this.dj.source;
					if (this.list.length) {
						tracks = dj.get_no(this.limit, plman.PlaylistItemCount(pl.dj()));
						for (i = 0; i < tracks; i++) {
							const t_ind = index.track(this.list, true, '', this.dj.mode, cur);
							this.do_youtube_search('', this.dj.source, this.list[t_ind].title, i, tracks, p_pn);
						}
					}
					break;
				case 1:
				case 3:
					fn = dj.f2 + djSource.substr(0, 1).toLowerCase() + '\\' + djSource + (this.dj.type == 1 ? '.json' : ' [Similar Songs].json');
					if (!$.file(fn)) return this.on_search_done_callback(false, this.dj.mode);
					data = $.jsonParse(fn, false, 'file');
					if (!data) return this.on_search_done_callback(false, this.dj.mode);
					this.on_search_done_callback(true, this.dj.mode);
					this.list = $.take(data, this.songHot).map(v => ({
						artist: v.artist,
						title: $.stripRemaster(v.title)
					}));
					dj.list.items = this.list;
					ppt.trackCount = data.length;
					if (this.list.length) {
						tracks = dj.get_no(this.limit, plman.PlaylistItemCount(pl.dj()));
						for (i = 0; i < tracks; i++) {
							const g_ind = index.getGenreTrack(this.list.length, this.list, 0);
							this.do_youtube_search('', this.list[g_ind].artist, this.list[g_ind].title, i, tracks, p_pn);
						}
					}
					break;
				case 2: {
					fn = dj.f2 + djSource.substr(0, 1).toLowerCase() + '\\' + djSource + (this.dj.type == 4 ? ' - Top Artists.json' : ' And Similar Artists.json');
					let ft;
					if (!$.file(fn)) {
						if (this.dj.mode > 1) dj.medLib('', this.dj.source, this.dj.mode, this.dj.type, this.artVariety);
						return this.on_search_done_callback(false, this.dj.mode);
					}
					data = $.jsonParse(fn, false, 'file');
					if (!data) {
						if (this.dj.mode > 1) dj.medLib('', this.dj.source, this.dj.mode, this.dj.type, this.artVariety);
						return this.on_search_done_callback(false, this.dj.mode);
					}
					if (this.dj.mode > 1) {
						dj.medLib(data, this.dj.source, this.dj.mode, this.dj.type, this.artVariety);
						return;
					}
					this.on_search_done_callback(true, this.dj.mode);
					dj.list.items = data.slice(0, this.artVariety);
					tracks = dj.get_no(this.limit, plman.PlaylistItemCount(pl.dj()));
					for (i = 0; i < tracks; i++) {
						dj.list.items.some(() => {
							const s_ind = index.artist(dj.list.items.length);
							const lp = this.dj.type != 4 && $.objHasOwnProperty(dj.list.items[0], 'name') ? $.clean(dj.list.items[s_ind].name) : $.clean(dj.list.items[s_ind]);
							ft = dj.f2 + lp.substr(0, 1).toLowerCase() + '\\' + lp + (this.curPop ? ' [curr]' : '') + '.json';
							if (!$.file(ft)) ft = dj.f2 + lp.substr(0, 1).toLowerCase() + '\\' + lp + (!this.curPop ? ' [curr]' : '') + '.json';
							return $.file(ft);
						});
						data = $.jsonParse(ft, false, 'file');
						if (data && $.objHasOwnProperty(data[0], 'artist')) data.shift();
						cur = ft.includes(' [curr]');
						this.list = $.take(data, this.songHot).map(this.titles);
						const art_nm = fso.GetBaseName(ft).replace(' [curr]', '');
						if (this.list.length) {
							$.sort(this.list, 'playcount', 'numRev');
							const t_ind = index.track(this.list, false, art_nm, this.dj.mode, cur);
							this.do_youtube_search('', art_nm, this.list[t_ind].title, i, tracks, p_pn);
						}
					}
					break;
				}
			}
		}
	}

	do_lfm_dj_tracks_search(p_artist, p_djMode, p_djType, p_artVariety, p_songHot, p_curPop, p_i, p_done, p_pn) {
		const lfm = new LfmDjTracksSearch(() => lfm.onStateChange(), this.on_lfm_dj_tracks_search_done.bind(this));
		lfm.search(p_artist, p_djMode, p_djType, p_artVariety, p_songHot, p_curPop, p_i, p_done, p_pn);
	}

	do_youtube_search(...args) {
		this.searchParams.push(args);
		if (!timer.yt.id) timer.yt.id = setInterval(() => {
			if (this.searchParams.length) {
				const [p_alb_id, p_artist, p_title, p_i, p_done, p_pn, p_alb_set] = this.searchParams[0];
				if (this.libUsed(p_alb_id, p_alb_set)) {
					const inLib = lib.inLibrary(p_artist, p_title, p_i, p_alb_set, false, false);
					if (inLib || p_alb_id == 'playTracks' && ppt.libAlb == 2) {
						if (p_alb_set) {
							alb.setRow(p_alb_id, 1);
							txt.paint();
						}
						this.searchParams.shift();
						return this.on_youtube_search_done(p_alb_id, '', p_artist, p_title, p_i, p_done, p_pn, p_alb_set, inLib);
					}
				}
				if (p_alb_id == 'playTracks') {
					if (lib.inPlaylist(p_artist, p_title, p_i, false, true)) {
						this.searchParams.shift();
						return this.on_youtube_search_done(p_alb_id, '', p_artist, p_title, p_i, p_done, p_pn, p_alb_set);
					}
				}
				const yt = new YoutubeSearch(() => yt.onStateChange(), this.on_youtube_search_done.bind(this));
				if (p_alb_set) {
					alb.setRow(p_alb_id, 1);
					this.rec[p_alb_id] = 0;
					txt.paint();
				}
				yt.search(p_alb_id, p_artist, p_title, p_i, p_done, p_pn, '', p_alb_set);
				this.searchParams.shift();
			} else timer.clear(timer.yt);
		}, 20);
	}

	lfm_similar_search_done(res, source, p_djMode) {
		if (p_djMode > 1) return;
		if (!res.length) return this.on_search_done_callback(false, p_djMode, 0);
		this.on_search_done_callback(true, p_djMode, 0);
		dj.list.items = res.slice(0, this.artVariety);
		const tracks = dj.get_no(this.limit, plman.PlaylistItemCount(pl.dj()));
		for (let i = 0; i < tracks; i++) {
			const s_ind = index.artist(dj.list.items.length);
			this.do_lfm_dj_tracks_search(this.dj.type != 4 && $.objHasOwnProperty(dj.list.items[0], 'name') ? dj.list.items[s_ind].name : dj.list.items[s_ind], p_djMode, this.dj.type == 4 ? 2 : this.dj.type, this.artVariety, this.songHot, this.curPop, i, tracks, pl.dj());
		}
	}

	libUsed(p_alb_id, p_alb_set) {
		return (p_alb_set || p_alb_id == 'playTracks') ? ppt.libAlb : ppt.libDj;
	}

	syncLoad(p_alb_id, p_alb_set) {
		return p_alb_id == 'playTracks' || p_alb_set ? ppt.libAlb : ppt.libDj;
	}

	on_lfm_dj_tracks_search_done(p_artist, p_title, p_i, p_done, p_pn, p_djMode, p_djType, p_cur, p_tcount) {
		let t_ind, tracks;
		switch (p_djType) {
			case 0:
				if (!p_title.length) return this.on_search_done_callback(false, p_djMode, p_pn);
				this.on_search_done_callback(true, p_djMode);
				this.list = p_title;
				$.sort(p_title, 'playcount', 'numRev');
				dj.list.items = p_title;
				dj.list.isCurPop = p_cur;
				dj.param = p_artist;
				tracks = dj.get_no(this.limit, plman.PlaylistItemCount(pl.dj()));
				for (let i = 0; i < tracks; i++) {
					t_ind = index.track(p_title, true, '', p_djMode, p_cur);
					this.do_youtube_search('', p_artist, p_title[t_ind].title, i, tracks, p_pn);
				}
				break;
			case 1:
			case 3:
				if (!p_artist.length) return this.on_search_done_callback(false, p_djMode, p_pn);
				this.on_search_done_callback(true, p_djMode);
				this.list = p_artist;
				dj.list.items = p_artist;
				tracks = dj.get_no(this.limit, plman.PlaylistItemCount(pl.dj()));
				for (let i = 0; i < tracks; i++) {
					const g_ind = index.getGenreTrack(p_artist.length, p_artist, 0);
					this.do_youtube_search('', p_artist[g_ind].artist, p_artist[g_ind].title, i, tracks, p_pn);
				}
				ppt.trackCount = p_artist.length;
				break;
			case 2:
				if (!p_artist.length || !p_title.length) return this.on_youtube_search_done();
				$.sort(p_title, 'playcount', 'numRev');
				t_ind = index.track(p_title, false, p_artist, p_djMode, p_cur);
				this.do_youtube_search('', p_artist, p_title[t_ind].title, p_i, p_done, p_pn);
				break;
		}
	}

	on_youtube_search_done(p_alb_id, link, p_artist, p_title, p_i, p_done, p_pn, p_alb_set, p_inLib) {
		if (this.syncLoad(p_alb_id, p_alb_set)) {
			!p_alb_set ? this.received++ : this.rec[p_alb_id]++;
			if (link && link.length) panel.add_loc.std.push({
				'path': link,
				'id': p_i
			});
			this.runAddLoc(panel.add_loc.std, p_alb_id, p_pn, p_alb_set, 'stnd');
			if ((!p_alb_set ? this.received : this.rec[p_alb_id]) == p_done || p_done == 'force') this.runAddLoc(panel.add_loc.std, p_alb_id, p_pn, p_alb_set, 'outstanding');
		} else if (link && link.length) { // lib not used
			if (p_alb_set) {
				if (p_alb_set !== 2) pl.clear(pl.selection());
				panel.addLoc(link, pl.selection(), true, p_alb_set, p_alb_set); // add row click to pl.selection
			}
			panel.addLoc(link, p_pn, true, p_alb_set, p_alb_set, p_alb_set); // add to pl.selection (p_pn) except if row click add to pl.cache (p_pn)
		}
		if (p_alb_set) {
			alb.setRow(p_alb_id, link && link.length || p_inLib ? 2 : 0);
			txt.paint();
		}
	}

	runAddLoc(p_loc, p_alb_id, p_pn, p_alb_set, type) {
		if (type == 'outstanding') $.sort(p_loc, 'id');
		if (p_alb_set) { // should only be one item so can clear here
			if (p_alb_set !== 2) pl.clear(pl.selection());
		}
		p_loc.forEach(v => {
			if (type == 'stnd') {
				if (v.id == (!p_alb_set ? panel.add_loc.ix : p_alb_id)) {
					v.id = 'x';
					panel.add_loc.ix++;
				} else return;
			}
			if (type == 'outstanding') {
				if (v.id != 'x') v.id = 'x';
				else return;
			}
			if (v.path) {
				this.start[v.path.slice(-11)] = Date.now();
				panel.addLoc(v.path, p_pn, true, p_alb_set, p_alb_set, true);
				if (p_alb_set) panel.addLoc(v.path, pl.selection(), true, p_alb_set, p_alb_set);
				if (p_alb_id == 'playTracks') panel.addLoc(v.path, pl.cache(), true, p_alb_set, p_alb_set, true);
			} else if (v.handle) {
				let timeout = this.loadTime.length ? Math.min($.average(this.loadTime), 500) : 25;
				this.hl.Add(v.handle);
				setTimeout(() => {
					const pn = pl.selection()
					if (p_alb_set) plman.ClearPlaylistSelection(pn);
					panel.add_loc.timestamp = Date.now();
					if (!p_alb_set || p_alb_set === 2) plman.UndoBackup(pn);
					if (p_alb_set) plman.InsertPlaylistItems(pn, plman.PlaylistItemCount(pn), this.hl, p_alb_set);
					else plman.InsertPlaylistItems(p_pn, plman.PlaylistItemCount(p_pn), this.hl, p_alb_set);
					if (p_alb_set) {
						plman.EnsurePlaylistItemVisible(pn, plman.PlaylistItemCount(pn) - 1);
						plman.SetPlaylistFocusItemByHandle(pn, this.hl[0]);
					}
					this.hl = new FbMetadbHandleList();
				}, timeout);
			}
		});
	}

	titles(v) {
		return {
			title: $.stripRemaster(v.title),
			playcount: v.playcount
		};
	}
}

class DldAlbumTracks {
	constructor() {
		this.done = {}
		this.rec = {}

		this.tracks_done = {
			lfm: false,
			mb: false
		}

		this.yt = {
			i: {},
			timer: {}
		}
	}

	execute(p_alb_id, p_rg_mbid, p_album_artist, p_album, p_prime, p_extra, p_date, p_add, p_mTags) {
		this.getMbReleases(p_alb_id, p_rg_mbid, p_album_artist, p_album, p_prime, p_extra, p_date, p_add, p_mTags); // always try mb for date even if source called is lfm
	}

	do_youtube_search(p_alb_id, p_artist, p_title, p_index, p_album, p_date, p_mTags) {
		if (p_mTags && (ppt.libAlb && lib.inLibraryAlb(p_alb_id, p_artist, p_title, p_album, p_date, p_index, '', false) || ppt.libAlb == 2)) {
			return this.on_youtube_search_done(p_alb_id, '', p_artist, p_title, p_index, '', '', '', '', '', '', '', '', '', p_album, p_date, p_mTags);
		}
		const yt = new YoutubeSearch(() => yt.onStateChange(), this.on_youtube_search_done.bind(this));
		yt.search(p_alb_id, p_artist, p_title, p_index, '', '', p_mTags ? '' : 'fb2k_tracknumber=' + p_index + '&fb2k_album=' + encodeURIComponent(p_album) + (p_date.length ? ('&fb2k_date=' + encodeURIComponent(p_date)) : ''), '', '', '', '', p_album, p_date, p_mTags);
	}

	getLfmTracks(p_alb_id, p_rg_mbid, p_album_artist, p_album, p_prime, p_extra, p_date, p_add, p_mTags, p_re_mbid) {
		if (this.tracks_done.lfm) {
			alb.setRow(p_alb_id, 0);
			txt.paint();
			return this.on_tracks_search_done(p_alb_id, [], p_album_artist, p_album, p_prime, p_extra, p_date, p_add, p_mTags, p_re_mbid);
		}
		const lfm_tracks = new AlbumTracks(() => lfm_tracks.onStateChange(), this.on_tracks_search_done.bind(this));
		lfm_tracks.search(p_alb_id, p_rg_mbid, p_album_artist, p_album, p_prime, p_extra, p_date, p_add, p_mTags, p_re_mbid, 0);
		this.tracks_done.lfm = true;
	}

	getMbTracks(p_alb_id, p_rg_mbid, p_album_artist, p_album, p_prime, p_extra, p_date, p_add, p_mTags, p_re_mbid) {
		if (this.tracks_done.mb) {
			alb.setRow(p_alb_id, 0);
			txt.paint();
			return this.on_tracks_search_done(p_alb_id, [], p_album_artist, p_album, p_prime, p_extra, p_date, p_add, p_mTags, p_re_mbid);
		}
		const mb_tracks = new AlbumTracks(() => mb_tracks.onStateChange(), this.on_tracks_search_done.bind(this));
		mb_tracks.search(p_alb_id, p_rg_mbid, p_album_artist, p_album, p_prime, p_extra, p_date || '', p_add, p_mTags, p_re_mbid, 1);
		this.tracks_done.mb = true;
	}

	getMbReleases(p_alb_id, p_rg_mbid, p_album_artist, p_album, p_prime, p_extra, p_date, p_add, p_mTags) {
		const mb_releases = new MusicbrainzReleases(() => mb_releases.onStateChange(), this.on_mb_releases_search_done.bind(this));
		mb_releases.search(p_alb_id, p_rg_mbid, p_album_artist, p_album, p_prime, p_extra, p_date, p_add, p_mTags);
	}

	manyTracks(length, artist, album) {
		const continue_confirmation = (status, confirmed) => {
			if (confirmed) {
				if (artist + ' | ' + album == 'Artist | Album') return false;
				return true;
			}
			return false;
		}
		popUpBox.confirm(artist + ' | ' + album, `This Album Has A Lot of Tracks: ${length}\n\nRequires ${(ppt.libAlb ? 'up to ' : '') + length} YouTube Searches\n\nContinue?`, 'Yes', 'No', continue_confirmation);
	}

	on_mb_releases_search_done(p_alb_id, p_rg_mbid, p_album_artist, p_album, p_prime, p_extra, p_date, p_add, p_mTags, p_re_mbid) {
		if (ppt.prefMbTracks && p_re_mbid) this.getMbTracks(p_alb_id, p_rg_mbid, p_album_artist, p_album, p_prime, p_extra, p_date || '', p_add, p_mTags, p_re_mbid);
		else this.getLfmTracks(p_alb_id, p_rg_mbid, p_album_artist, p_album, p_prime, p_extra, p_date || '', p_add, p_mTags, p_re_mbid);
	}

	on_tracks_search_done(p_alb_id, list, p_album_artist, p_album, p_prime, p_extra, p_date, p_add, p_mTags, p_re_mbid) {
		const trackListOnly = typeof p_alb_id == 'string';
		if (trackListOnly) {
			alb.artists.list = [];
			if (!list || !list.length) {
				alb.artists.list[0] = {
					name: p_album_artist + ' - ' + p_album + ': ' + 'Nothing Found'
				};
				alb.calcRows(true);
				return;
			}

			for (let i = 0; i < list.length; i++) {
				const v = list[i];
				if (v.artist && v.title) {
					if (ppt.libAlb == 2) {
						alb.artists.list.push({
							name: v.title,
							handleList: new FbMetadbHandleList(),
							source: 0
						});
					} else {
						let handleList = lib.inPlaylist(v.artist, v.title, i, true, false, true);
						handleList = $.query(handleList, 'album IS ' + p_album);
						alb.artists.list.push({
							artist: p_album_artist,
							name: v.title,
							album: p_album,
							date: p_date,
							handleList: handleList,
							source: handleList.Count ? 2 : 1
						});
					}
				}
			}

			if (alb.artists.list.length) alb.artists.list.unshift({
				name: p_album_artist + ' - ' + p_album
			});
			else alb.artists.list[0] = {
				name: p_album_artist + ' - ' + p_album + ': ' + 'Nothing Found'
			};

			alb.calcRows(true);
			txt.paint();
		} else {
			if (ppt.libAlb != 2 && list.length > 20 && list[0].artist.length + this.album.length < 251 && !this.manyTracks(list.length, list[0].artist, this.album)) return;
			this.done[p_alb_id] = list.length;
			this.rec[p_alb_id] = 0;
			this.yt.i[p_alb_id] = 0;
			this.resetYtTimer(p_alb_id);
			if (!p_add) pl.clear(pl.selection());

			panel.add_loc.mtags[p_alb_id] = [];
			panel.add_loc.alb[p_alb_id] = [];

			this.yt.timer[p_alb_id] = setInterval(() => {
				if (this.yt.i[p_alb_id] < list.length) {
					this.do_youtube_search(p_alb_id, list[this.yt.i[p_alb_id]].artist, list[this.yt.i[p_alb_id]].title,
						this.yt.i[p_alb_id] + 1, list[this.yt.i[p_alb_id]].album, list[this.yt.i[p_alb_id]].date, list[this.yt.i[p_alb_id]].mTags);
					this.yt.i[p_alb_id]++;
				} else this.resetYtTimer(p_alb_id);
			}, 20);
		}
	}

	on_youtube_search_done(p_alb_id, link, p_artist, p_title, p_ix, p_done, p_pn, p_alb_set, p_length, p_orig_title, p_yt_title, p_full_alb, p_fn, p_type, p_album, p_date, p_mTags) {
		this.rec[p_alb_id]++;
		if (link && link.length) {
			if (p_mTags) {
				const type_arr = ['YouTube Track', 'Prefer Library Track', 'Library Track'];
				panel.add_loc.mtags[p_alb_id].push({
					'@': link,
					'ALBUM': p_album,
					'ARTIST': p_artist,
					'DATE': p_date,
					'DURATION': p_length.toString(),
					'REPLAYGAIN_TRACK_GAIN': [],
					'REPLAYGAIN_TRACK_PEAK': [],
					'TITLE': p_title,
					'TRACKNUMBER': p_ix.toString(),
					'YOUTUBE_TITLE': p_yt_title ? p_yt_title : [],
					'SEARCH_TITLE': p_orig_title ? p_orig_title : [],
					'TRACK_TYPE': type_arr[ppt.libAlb]
				});
			} else panel.add_loc.alb[p_alb_id].push({
				'path': link,
				'id': p_ix
			});
		}
		if ((this.rec[p_alb_id] == this.done[p_alb_id] || p_done == 'force') && this.done[p_alb_id] != 'done')
			if (panel.add_loc.mtags[p_alb_id].length || panel.add_loc.alb[p_alb_id].length) {
				alb.setRow(p_alb_id, 2);
				txt.paint();
				if (p_mTags) mtags.save(p_alb_id, p_artist);
				else this.runAddLoc(p_alb_id);
				this.done[p_alb_id] = 'done';
			} else {
				alb.setRow(p_alb_id, 0, p_artist);
				txt.paint();
				if (ppt.libAlb == 2) fb.ShowPopupMessage('Request Made: Load Album Using Only Library Tracks\n\nResult: No Matching Tracks Found', 'Find & Play');
			}
	}

	resetYtTimer(p_alb_id) {
		if (this.yt.timer[p_alb_id]) clearTimeout(this.yt.timer[p_alb_id]);
		this.yt.timer[p_alb_id] = null;
	}

	runAddLoc(p_alb_id) {
		const add_loc_arr = {};
		$.sort(panel.add_loc.alb[p_alb_id], 'id');
		add_loc_arr[p_alb_id] = [];
		panel.add_loc.alb[p_alb_id].forEach(v => {
			add_loc_arr[p_alb_id].push(v.path);
		});
		panel.addLoc(add_loc_arr[p_alb_id], pl.cache(), false, false, true, true);
		panel.addLoc(add_loc_arr[p_alb_id], pl.selection(), false, false, true);
	}
}

class DldAlbumNames {
	constructor(p_callback) {
		this.on_finish_callback = p_callback;
	}

	execute(p_album_artist, p_only_mbid, p_dbl_load, p_mode) {
		const mb_artist_id = new MusicbrainzArtistId(() => mb_artist_id.onStateChange(), this.on_mb_artist_id_search_done.bind(this));
		mb_artist_id.search(p_album_artist, p_only_mbid, p_dbl_load, p_mode)
	}

	on_album_names_search_done(data, ar_mbid, mode) {
		this.on_finish_callback(data, ar_mbid, true, mode);
	}

	on_mb_artist_id_search_done(ar_mbid, only_mbid, mode) {
		const mb_lfm_albums = new AlbumNames(() => mb_lfm_albums.onStateChange(), this.on_album_names_search_done.bind(this));
		if ((!ar_mbid.length && ppt.mb == 1 || only_mbid) && mode != 2 && mode != 3) return this.on_album_names_search_done([], ar_mbid, mode);
		mb_lfm_albums.search(ar_mbid, mode);
	}
}

class DldMoreAlbumNames {
	constructor(p_callback) {
		this.on_finish_callback = p_callback;
	}

	execute(ar_mbid, mode) {
		const mb_lfm_albums = new AlbumNames(() => mb_lfm_albums.onStateChange(), this.on_album_names_search_done.bind(this));
		if (!ar_mbid.length && ppt.mb == 1) return this.on_album_names_search_done([], ar_mbid, mode);
		mb_lfm_albums.search(ar_mbid, mode);
	}

	on_album_names_search_done(data, ar_mbid, mode) {
		this.on_finish_callback(data, ar_mbid, true, mode);
	}
}

class Dl_art_images {
	constructor() {
		if (!ppt.dl_art_img) return;
		this.dl_ar = '';
	}

	run() {
		if (!$.file(`${panel.yttm}foo_lastfm_img.vbs`)) return;
		let n_artist = name.artist();
		if (n_artist == this.dl_ar || n_artist == '') return;
		this.dl_ar = n_artist;
		const img_folder = panel.cleanPth(ppt.imgArtPth);
		if (!panel.img_exp(img_folder, Thirty_Days)) return;
		const lfm_art = new Lfm_art_img(() => lfm_art.onStateChange());
		lfm_art.search(this.dl_ar, img_folder);
	}
}

class Lfm_art_img {
	constructor(state_callback) {
		this.dl_ar;
		this.func = null;
		this.img_folder;
		this.ready_callback = state_callback;
		this.timer = null;
		this.xmlhttp = null;
	}

	onStateChange() {
		if (this.xmlhttp != null && this.func != null)
			if (this.xmlhttp.readyState == 4) {
				clearTimeout(this.timer);
				this.timer = null;
				if (this.xmlhttp.status == 200) this.func();
				else $.trace('download artist images N/A: ' + this.dl_ar + ': none found' + ' Status error: ' + this.xmlhttp.status);
			}
	}

	search(p_dl_ar, p_img_folder) {
		this.dl_ar = p_dl_ar;
		this.img_folder = p_img_folder;
		if (!ui.style.textOnly || ui.style.isBlur) timer.decelerating();
		this.func = null;
		this.xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
		const URL = 'https://www.last.fm/music/' + encodeURIComponent(this.dl_ar) + '/+images'; // <- edit to use custom local lastfm domain

		this.func = this.analyse;
		this.xmlhttp.open('GET', URL);
		this.xmlhttp.onreadystatechange = this.ready_callback;
		if (!this.timer) {
			const a = this.xmlhttp;
			this.timer = setTimeout(() => {
				a.abort();
				this.timer = null;
			}, 30000);
		}
		this.xmlhttp.send();
	}

	analyse() {
		const artist = $.clean(this.dl_ar);
		doc.open();
		const div = doc.createElement('div');
		div.innerHTML = this.xmlhttp.responseText;
		const list = div.getElementsByTagName('img');
		let links = [];
		if (!list) return doc.close();
		$.htmlParse(list, false, false, v => {
			const attr = v.getAttribute('src');
			if (attr.includes('avatar170s/')) links.push(attr.replace('avatar170s/', ''));
		});
		doc.close();
		const blacklist = img.blacklist(artist.toLowerCase());
		links = links.filter(v => !blacklist.includes(v.substring(v.lastIndexOf('/') + 1) + '.jpg'));
		if (links.length) {
			$.buildPth(this.img_folder);
			if ($.folder(this.img_folder)) {
				$.save(this.img_folder + 'update.txt', '', true);
				$.take(links, 5).forEach(v => $.run('cscript //nologo "' + panel.yttm + 'foo_lastfm_img.vbs" "' + v + '" "' + this.img_folder + artist + '_' + v.substring(v.lastIndexOf('/') + 1) + '.jpg' + '"', 0));
			}
		}
	}
}