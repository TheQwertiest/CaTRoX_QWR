class Timers {
	constructor() {
		['artist', 'dl', 'img', 'sim1', 'sim2', 'transition', 'tt', 'vid', 'yt'].forEach(v => this[v] = {
			id: null
		});

		this.counter = 0;
		this.times = [1000, 1000, 1000, 1000, 2000, 4000, 5000, 6000, 7000];
	}

	// Methods

	clear(timer) {
		if (timer) clearTimeout(timer.id);
		timer.id = null;
	}

	decelerating() {
		let counter = 0;
		this.clear(this.dl);
		const func = () => {
			this.res();
			counter++;
			if (counter < this.times.length) timer_dl();
			else this.clear(this.dl);
		};
		const timer_dl = () => {
			this.dl.id = setTimeout(func, this.times[counter])
		};
		timer_dl();
	}

	image() {
		this.clear(this.img);
		this.img.id = setInterval(() => {
			if (!panel.image.show || !ppt.artistView || ppt.showAlb || panel.block() || panel.video.mode && panel.isVideo() || seeker.dn || this.zoom()) return;
			if (img.art.images.length < 2) return;
			img.change(1);
		}, ppt.cycleTime * 1000);
	}

	dj() {
		if (!this.dj_chk || (!ppt.autoRad && !ppt.playTracks) || (plman.PlayingPlaylist != pl.getDJ())) return;
		const np = plman.GetPlayingItemLocation();
		if (!np.IsValid) return;
		const pid = np.PlaylistItemIndex;
		const pn = pl.getDJ();
		if (plman.PlaylistItemCount(pn) > pid + 1) return this.dj_chk = false;
		dj.on_playback_new_track();
	}

	res() {
		if (ui.style.textOnly && !ui.style.isBlur) return;
		img.update();
	}

	tooltip() {
		this.clear(this.tt);
		this.tt.id = setTimeout(() => {
			alb.deactivateTooltip();
			this.tt.id = null;
		}, 5000);
	}

	video() {
		this.vid.id = setInterval(() => this.videoState, 50);
	}

	videoState() {
		if (ppt.btn_mode || !panel.video.mode || txt.visible == panel.block()) return;
		txt.visible = panel.block();
		if (panel.block())
			if ($.eval('%video_popup_status%') == 'visible') {
				img.get = true;
				fb.RunMainMenuCommand('View/Visualizations/Video');
				this.clear(this.vid);
			}
	}

	zoom() {
		return utils.IsKeyPressed(0x10) || utils.IsKeyPressed(0x11);
	}
}