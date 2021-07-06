class BlacklistVideo {
	constructor() {
		this.artist = '';
		this.black_list = [];
		this.fn = `${panel.yttm}blacklist_video.json`;
		this.remove = true;
		this.undo = [];
	}

	// Methods

	list(clean_artist) {
		if (this.artist == clean_artist) return;
		this.artist = clean_artist;
		if (!$.file(this.fn)) return this.black_list = [];
		const list = $.jsonParse(this.fn, false, 'file');
		if (!list.blacklist[clean_artist]) return this.black_list = [];
		this.black_list = list.blacklist[clean_artist].map(v => v.id);
	}

	blackListed(clean_artist, id) {
		this.list(clean_artist);
		if (!this.black_list.length || !this.black_list.includes(id)) return false;
		return true;
	}
}