class Playlists {
	constructor() {
		this.dj_tracks = [];
		this.enabled = [];
		this.menu = [];
		this.soft_playlist = ppt.playlistTop + ppt.playlistTracks;

		this.playlists_changed();
	}

	// Methods

	cache() {
		return plman.FindOrCreatePlaylist(ppt.playlistCache, false);
	}

	clear(playlistIndex) {
		plman.UndoBackup(playlistIndex);
		plman.ClearPlaylist(playlistIndex);
	}

	dj() {
		return plman.FindOrCreatePlaylist(ppt.playlistDj, false);
	}

	getDJ() {
		return plman.FindPlaylist(ppt.playlistDj);
	}

	love() {
		const loved = this.loved();
		const np = plman.GetPlayingItemLocation();
		let pid, pn;
		if (fb.IsPlaying && np.IsValid) {
			pid = np.PlaylistItemIndex;
			pn = plman.PlayingPlaylist;
		} else {
			pid = plman.GetPlaylistFocusItemIndex(plman.ActivePlaylist);
			pn = plman.ActivePlaylist;
		}
		plman.ClearPlaylistSelection(pn);
		plman.SetPlaylistSelectionSingle(pn, pid, true);
		if (loved != pn) {
			plman.UndoBackup(loved);
			plman.InsertPlaylistItems(loved, plman.PlaylistItemCount(loved), plman.GetPlaylistSelectedItems(pn), false);
		} else {
			plman.RemovePlaylistSelection(loved, false);
		}
	}

	loved() {
		return plman.FindOrCreatePlaylist(ppt.playlistLoved, false);
	}

	playlists_changed() {
		this.setShortCutPl();
		this.menu = [];
		for (let i = 0; i < plman.PlaylistCount; i++) this.menu.push({
			name: plman.GetPlaylistName(i).replace(/&/g, '&&'),
			ix: i
		});
	}

	saveAutoDjTracks(playlistIndex, np) {
		if (playlistIndex != this.dj || !np || !index.cur_dj_source) return;
		const dj_text = index.cur_dj_type == 2 ? ' And Similar Artists' : '';
		const save_pl_index = plman.FindOrCreatePlaylist(ppt.playlistDj + ppt.playlistTracks + ' [' + index.cur_dj_source + dj_text + ']', false);
		const items = new FbMetadbHandleList();
		const save_pl_count = plman.PlaylistItemCount(save_pl_index);
		const sav_list = plman.GetPlaylistItems(save_pl_index);

		for (let i = 0; i < np.Count; i++)
			if (!this.dj_tracks.includes(np[i].Path)) {
				let found = false;
				for (let j = 0; j < sav_list.Count; j++)
					if (np[i].Path == sav_list[j].Path) found = true;
				if (!found) items.Add(np[i]);
				this.dj_tracks.push(np[i].Path);
			}
		plman.UndoBackup(save_pl_index);
		plman.InsertPlaylistItems(save_pl_index, save_pl_count, items);
		if (this.dj_tracks.length > dj.limit * 2) this.dj_tracks.splice(0, 1);
	}

	selection() {
		return plman.FindOrCreatePlaylist(ppt.playlistSelection, false);
	}

	setShortCutPl() {
		const names = ['selection', 'dj', 'loved'];
		this.enabled = [];
		['playlistSelection', 'playlistDj', 'playlistLoved'].forEach(v => {
			const ix = plman.FindPlaylist(ppt[v]);
			if (ix != -1) this.enabled.push({
				name: ppt[v],
				ix: ix
			});
		});
	}
}