class MediaLibrary {
	constructor() {
		const mtagsSync = $.split(ppt.mtagsSync, 0);
		ppt.mtagsInstalled = utils.CheckComponent('foo_tags', true);
		this.fooYouTubeInstalled = utils.CheckComponent('foo_youtube', true);

		this.playcount = ppt.tfPlaycount.trim();
		this.rating = panel.id.local ? '%_autorating%' : ppt.tfRating.trim();
		this.upd_yt_mtags = ppt.mtagsInstalled && this.fooYouTubeInstalled ? $.value(mtagsSync[1], 1, 1) : 0;
		this.upd_lib_mtags = ppt.mtagsInstalled ? $.value(mtagsSync[3], 1, 1) : 0;

		this.sort();
		this.mtags_mng();
	}

	// Methods

	getRelativePath(source, target) {
		source = source.replace(/\\/g, '/');
		target = target.replace(/\\/g, '/');
		const sep = '/';
		const targetArr = target.split(sep);
		const sourceArr = source.split(sep);
		const filename = targetArr.pop();
		const targetPath = targetArr.join(sep);
		let relativePath = '';
		sourceArr.pop();
		while (!targetPath.includes(sourceArr.join(sep))) {
			sourceArr.pop();
			relativePath += '..' + sep;
		}
		const relPathArr = targetArr.slice(sourceArr.length);
		relPathArr.length && (relativePath += relPathArr.join(sep) + sep);
		return relativePath + filename;
	}

	mtags_mng() {
		let cur_path = '';
		let mtags_date = 0;
		let mtags_pth = '';
		let mtags_yt = false;
		this.on_playback_time = () => {
			if (!mtags_yt) return;
			const handle = fb.GetNowPlaying();
			if (!handle || !$.file(handle.Path)) return;
			const mod = $.lastModified(handle.Path);
			if (mtags_pth != handle.Path || mod == mtags_date) return;
			mtags_pth = handle.Path;
			mtags_date = mod;
			lib.update.artists = true;
			lib.update.library = true;
		}
		this.execute = () => {
			const handle = fb.GetNowPlaying();
			if (!handle || cur_path == handle.Path || handle.Path.slice(-7) != '!!.tags') return;
			cur_path = handle.Path;
			mtags_yt = false;
			if (fb.IsMetadbInMediaLibrary(handle)) {
				mtags_yt = handle.Path.slice(-7) == '!!.tags';
				mtags_pth = handle.Path;
				mtags_date = $.lastModified(handle.Path);
			}
		}
	}

	referencedFile(h) {
		let n = tf.referencedFile.EvalWithMetadb(h);
		if (n.includes('file://') && n.slice(-5) != '.tags') {
			n = n.replace('file://', '');
		} else n = '';
		return n;
	}

	sort(i, set) {
		if (set) ppt.sortType = i;
		const sort_ar = [this.playcount, this.rating, '$rand()', '%bitrate%', '%bitrate%', '%length%', '%length%', '%date%', '%date%'];
		this.track_pref = ['Most Played', 'Highest Rated', 'Random', 'Highest Bitrate', 'Lowest Bitrate', 'Longest', 'Shortest', 'Latest', 'Earliest'];
		const sort_dir = [0, 0, 1, 0, 1, 0, 1, 0, 1];
		this.sort_rand = ppt.sortType == 2;
		this.dir = sort_dir[ppt.sortType];
		this.item_sort = FbTitleFormat(sort_ar[ppt.sortType]);
	}
}