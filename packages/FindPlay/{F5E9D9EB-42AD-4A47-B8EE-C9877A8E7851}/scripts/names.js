class Names {
	constructor() {
		this.cur_artist = '';
		this.lfmUID = '_[a-f0-9]{32}\\.jpg$';

		const fields = ['queryArtistField', 'queryAlbumField', 'queryGenreField', 'queryTitleField'];
		const key = ['artist', 'album', 'genre', 'title'];

		this.field = {}

		for (let i = 0; i < key.length; i++) { // use for loop so handles empty
			const n = ppt[fields[i]];
			this.field[key[i]] = n && n.trim() || key[i];
		}
	}

	// Methods

	art() {
		return alb.artist ? alb.artist : this.artist();
	}

	artist(focus) {
		return $.eval('$trim(' + ppt.tfArtist + ')', focus);
	}

	artist_title() {
		return this.artist() && this.title() ? this.artist() + ' | ' + this.title() : 'N/A';
	}

	genre() {
		const g = $.eval('$trim(' + ppt.tfGenre + ')');
		return g ? g : 'N/A';
	}

	isLfmImg(fn, artist) {
		if (artist) {
			if (artist != this.cur_artist) {
				artist = $.regexEscape($.clean(artist));
				this.cur_artist = artist;
			}
			return RegExp(`^${artist + this.lfmUID}`, 'i').test(fn)
		} else return RegExp(this.lfmUID, 'i').test(fn)
	}

	title(focus) {
		return $.eval('$trim(' + ppt.tfTitle + ')', focus);
	}
}

class Titleformat {
	constructor() {
		this.artist = FbTitleFormat('%' + name.field.artist + '%');
		this.artist0 = FbTitleFormat('[$meta(' + name.field.artist + ',0)]');
		this.comment = FbTitleFormat('[%comment%]');
		this.length = FbTitleFormat('[%length_seconds_fp%]');
		this.fy_url = FbTitleFormat('[%fy_url%]');
		this.referencedFile = FbTitleFormat('$info(@REFERENCED_FILE)');
		this.album0 = FbTitleFormat('[$meta(' + name.field.album + ',0)]');
		this.albumSortOrder = FbTitleFormat(ppt.albumSortOrder);
		this.videoPopup = FbTitleFormat('[%video_popup_status%]');
		this.randomize = FbTitleFormat('$rand()');
		this.trackGain = FbTitleFormat('[%replaygain_track_gain%]');
		this.trackPeak = FbTitleFormat('[%replaygain_track_peak%]');
		this.title = FbTitleFormat('%' + name.field.title + '%');
		this.title0 = FbTitleFormat('[$meta(' + name.field.title + ',0)]');
		this.title_0 = FbTitleFormat('[$meta(title,0)]');
		this.searchTitle = FbTitleFormat('[$if2(%SEARCH_TITLE%,%YOUTUBE_TRACK_MANAGER_SEARCH_TITLE%)]');
	}
}

class Vkeys {
	constructor() {
		this.selAll = 1;
		this.copy = 3;
		this.back = 8;
		this.enter = 13;
		this.shift = 16;
		this.paste = 22;
		this.cut = 24;
		this.redo = 25;
		this.undo = 26;
		this.pgUp = 33;
		this.pgDn = 34;
		this.end = 35;
		this.home = 36;
		this.left = 37;
		this.right = 39;
		this.del = 46;
	}
}