function on_colours_changed() {
	ui.getColours();
	alb_scrollbar.setCol();
	art_scrollbar.setCol();
	if (ui.style.isBlur) panel.image.show = true;
	alb.calcText();
	but.createImages();
	but.refresh();
	alb_scrollbar.resetAuto();
	art_scrollbar.resetAuto();
	img.createImages();
	img.on_size();
	txt.paint();
}

function on_font_changed() {
	alb.deactivateTooltip();
	ui.getFont();
	alb_scrollbar.resetAuto();
	art_scrollbar.resetAuto();
	txt.paint();
}

function on_get_album_art_done(handle, art_id, image, image_path) {
	img.on_get_album_art_done(handle, art_id, image, image_path);
}

function on_item_focus_change() {
	if (!panel.block() && !ppt.showAlb && !ui.style.isBlur) txt.repaint();
	if (!ui.style.textOnly || ui.style.isBlur) {
		if (panel.block()) {
			img.get = true;
			img.artistReset();
		} else if (!fb.IsPlaying) img.get = false;
	}
	if (!ppt.showAlb) {
		if (!ui.style.isBlur) txt.repaint();
		alb.get = true;
	}
	if (!ui.style.textOnly || ui.style.isBlur) img.focusLoad();
	alb.focusServer();
	if (!ui.style.textOnly || ui.style.isBlur) img.focusServer();
}

function on_load_image_done(id, image, image_path) {
	img.on_load_image_done(image, image_path);
}

function on_metadb_changed() {
	if (panel.isRadio()) return;
	if (!panel.block() && !ppt.showAlb && !ui.style.isBlur) txt.repaint();
	if (!ui.style.textOnly || ui.style.isBlur) {
		img.focusLoad();
		img.focusServer();
	}
	alb.metadbServer(); 
}

function on_playback_stop(reason) {
	if (reason == 2) return;
	on_item_focus_change();
}

function on_size() {
	txt.rp = false;
	panel.w = window.Width;
	panel.h = window.Height;
	if (!panel.w || !panel.h) return;
	panel.on_size();
	ui.getFont();
	but.refresh(true);
	filter.metrics();
	search.metrics();
	if (!ui.style.textOnly || ui.style.isBlur) img.on_size();
	dj.on_size();
	txt.rp = true;
}

function on_paint(gr) {
	ui.draw(gr);
	if (panel.displayLogo()) {
		panel.draw(gr);
		return;
	}
	if (!ui.style.textOnly || ui.style.isBlur) {
		img.draw(gr);
		seeker.draw(gr);
	}
	if (!ppt.showAlb) dj.draw(gr);
	else {
		search.drawSearch(gr);
		filter.drawFilter(gr);
		alb.draw(gr);
	}
	but.draw(gr);
}

function on_playback_new_track() {
	ml.execute();
	if (ml.upd_yt_mtags || ml.upd_lib_mtags) mtags.check();
	if (!alb.art.lock) alb.orig_artist = alb.artist = name.artist();
	if (fb.PlaybackLength > 0) timer.clear(timer.dl);
	if (!ui.style.textOnly || ui.style.isBlur) img.on_playback_new_track();
	if (ppt.dl_art_img && fb.PlaybackLength > 0) dl_art.run();
	dj.removePlayed();
	dj.on_playback_new_track();
	alb.on_playback_new_track();
	if (panel.youTube.backUp) sv.track(panel.isYtVideo(true) ? true : false);
}

function on_playback_dynamic_info_track() {
	if (!alb.art.lock) alb.orig_artist = alb.artist = name.artist();
	timer.clear(timer.dl);
	if (panel.image.show) img.on_playback_dynamic_track();
	if (ppt.dl_art_img) dl_art.run();
	alb.on_playback_new_track();
}

function on_char(code) {
	filter.on_char(code);
	search.on_char(code);
}

function on_focus(is_focused) {
	filter.on_focus(is_focused);
	search.on_focus(is_focused);
}

function on_key_down(vkey) {
	alb.on_key_down(vkey);
	filter.on_key_down(vkey);
	search.on_key_down(vkey);
	if (!ui.style.textOnly || ui.style.isBlur) img.on_key_down(vkey)
}

function on_key_up(vkey) {
	filter.on_key_up(vkey);
	search.on_key_up(vkey);
}

function on_library_items_added(handleList) {
	lib.update.artists = true;
	lib.update.library = true;
	handleList.Convert().some(h => {
		if (h.Path.endsWith('!!.tags')) {
			lib.getAlbumMetadb(true);
			return true;
		}
	});
}

function on_library_items_removed() {
	lib.update.artists = true;
	lib.update.library = true;
}

function on_library_items_changed() {
	if (($.playCountInstalled && ppt.sortType > 1) && (fb.PlaybackTime > 59 && fb.PlaybackTime < 65)) return;
	if (fb.IsPlaying) {
		const handle = fb.GetNowPlaying();
		if (handle && handle.Path.slice(-7) == '!!.tags') return; /*!!.tags use mtags_mng due to m-TAGS/YouTube popup triggers*/
	}
	lib.update.artists = true;
	lib.update.library = true;
}

function on_mouse_lbtn_dblclk(x, y, mask) {
	if (panel.displayLogo()) return;
	but.lbtn_dn(x, y);
	if (alb.scrollbarType()) alb.scrollbarType().lbtn_dblclk(x, y);
	if (!ppt.dblClickToggle) return;
	if (ppt.touchControl) panel.id.last_pressed_coord = {
		x: x,
		y: y
	};
	if (utils.IsKeyPressed(0x12)) mask = 'remove';
	panel.click(x, y, mask);
}

function on_mouse_lbtn_down(x, y) {
	if (panel.displayLogo()) return;
	if (ppt.touchControl) panel.id.last_pressed_coord = {
		x: x,
		y: y
	};
	if (!ui.style.textOnly) {
		seeker.lbtn_dn(x, y);
		img.lbtn_dn(x);
	}
	but.lbtn_dn(x, y);
	filter.lbtn_dn(x, y);
	search.lbtn_dn(x, y);
	if (alb.scrollbarType()) alb.scrollbarType().lbtn_dn(x, y);
}

function on_mouse_lbtn_up(x, y, mask) {
	if (panel.showLogo) {
		panel.showLogo = false;
		window.Repaint();
		return;
	}
	if (panel.displayLogo()) return;
	if (!ui.style.textOnly && img.touch.dn) {
		img.touch.dn = false;
		img.touch.start = x;
	}
	alb_scrollbar.lbtn_drag_up();
	art_scrollbar.lbtn_drag_up();
	if (utils.IsKeyPressed(0x12)) mask = 'remove';
	if (!ppt.dblClickToggle && !but.Dn && !seeker.dn) panel.click(x, y, mask);
	but.lbtn_up(x, y);
	filter.lbtn_up();
	search.lbtn_up();
	alb_scrollbar.lbtn_up();
	art_scrollbar.lbtn_up();
	panel.clicked = false;
	if (seeker.dn) {
		img.paint();
		seeker.dn = false;
	}
	seeker.down = false;
}

function on_mouse_leave() {
	but.leave();
	alb.leave();
	alb_scrollbar.leave();
	art_scrollbar.leave();
	if (!ui.style.textOnly) img.leave();
}

function on_mouse_mbtn_down(x, y) {
	if (panel.displayLogo()) return;
	alb.mbtn_dn(x, y);
}

function on_mouse_mbtn_up(x, y, mask) {
	if (panel.showLogo) {
		ppt.showLogo = false;
		window.Repaint();
		return;
	}
	if (panel.displayLogo()) return;
	alb.load(x, y, mask, true);
	dj.mbtn_up(x, y);
}

function on_mouse_move(x, y) {
	if (panel.displayLogo()) return;
	if (panel.m.x == x && panel.m.y == y) return;
	panel.m.x = x;
	panel.m.y = y;
	but.move(x, y);
	alb.move(x, y);
	filter.move(x, y);
	search.move(x, y);
	if (!ui.style.textOnly) {
		seeker.move(x, y);
		img.move(x, y);
	}
	if (!alb.scrollbarType()) return;
	if (panel.sbar.show == 1) {
		alb_scrollbar.move(x, y);
		art_scrollbar.move(x, y);
	} else alb.scrollbarType().move(x, y);
}

function on_mouse_rbtn_up(x, y) {
	if (panel.displayLogo()) return;
	if (search.edit) search.rbtn_up(x, y);
	else if (filter.edit) filter.rbtn_up(x, y);
	else men.rbtn_up(x, y);
	return true;
}

function on_mouse_wheel(step) {
	if (panel.displayLogo()) return;
	switch (utils.IsKeyPressed(0x11)) {
		case false:
			if (panel.halt()) break;
			if (!ppt.showAlb && panel.image.show) img.wheel(step);
			if (!ppt.showAlb && panel.image.show || !alb.scrollbarType()) break;
			alb.scrollbarType().wheel(step, false);
			break;
		case true:
			but.wheel(step);
			ui.wheel(step);
			break;
	}
}

function on_notify_data(name, info) {
	if (info == 'bio_blacklist') {
		img.blackList.artist = '';
		img.chkArtImg();
	}
}

function on_playback_time(pbt) {
	ml.on_playback_time();
	if (!(pbt % 25)) timer.dj();
}

function on_playlists_changed() {
	pl.playlists_changed();
}

function on_playlist_items_added(pn) {
	if (Object.keys(yt_dj.start).length && (pn == pl.getDJ() || pl.selection())) {
		const handleList = plman.GetPlaylistItems(pn);
		handleList.Convert().forEach((h) => {
			let key = h.Path.slice(-11);
			if (yt_dj.start[key]) {
				yt_dj.loadTime.push(Date.now() - yt_dj.start[key]);
				delete yt_dj.start[key];
				if (yt_dj.loadTime.length > 10) yt_dj.loadTime.shift();
			}
		});
	}
	if (pn == pl.getDJ()) dj.setDjSelection(pn);
	on_item_focus_change();
	if (pn == pl.cache()) lib.getAlbumMetadb();
}

function on_playlist_items_removed(pn) {
	on_item_focus_change();
	if (pn == pl.cache()) lib.getAlbumMetadb();
}

function on_playlist_switch() {
	on_item_focus_change();
}

function on_script_unload() {
	timer.clear(timer.img);
	timer.clear(timer.vid);
	if (panel.video.mode && $.eval('%video_popup_status%') == 'visible') fb.RunMainMenuCommand('View/Visualizations/Video');
	but.on_script_unload();
}