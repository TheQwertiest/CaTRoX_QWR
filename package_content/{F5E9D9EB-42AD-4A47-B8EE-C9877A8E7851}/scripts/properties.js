class PanelProperty {
	constructor(name, default_value) {
		this.name = name;
		this.default_value = default_value;
		this.value = ppt.get(this.name, default_value);
	}

	// Methods

	get() {
		return this.value;
	}
	set(new_value) {
		if (this.value !== new_value) {
			ppt.set(this.name, new_value);
			this.value = new_value;
		}
	}
}

class PanelProperties {
	constructor() {
		// this.name_list = {}; debug
	}

	// Methods

	init(type, properties, thisArg) {
		switch (type) {
			case 'auto':
				properties.forEach(v => {
					// this.validate(v); debug
					this.add(v);
				});
				break;
			case 'manual':
				properties.forEach(v => thisArg[v[2]] = this.get(v[0], v[1]));
				break;
		}
	}

	validate(item) {
		if (!$.isArray(item) || item.length !== 3 || typeof item[2] !== 'string') {
			throw ('invalid property: requires array: [string, any, string]');
		}

		if (item[2] === 'add') {
			throw ('property_id: ' + item[2] + '\nThis id is reserved');
		}

		if (this[item[2]] != null || this[item[2] + '_internal'] != null) {
			throw ('property_id: ' + item[2] + '\nThis id is already occupied');
		}

		if (this.name_list[item[0]] != null) {
			throw ('property_name: ' + item[0] + '\nThis name is already occupied');
		}
	}

	add(item) {
		// this.name_list[item[0]] = 1; debug
		this[item[2] + '_internal'] = new PanelProperty(item[0], item[1]);

		Object.defineProperty(this, item[2], {
			get() {
				return this[item[2] + '_internal'].get();
			},
			set(new_value) {
				this[item[2] + '_internal'].set(new_value);
			}
		});
	}

	get(name, default_value) {
		return window.GetProperty(name, default_value);
	} // initialisation

	set(name, new_value) {
		return window.SetProperty(name, new_value);
	}

	toggle(name) {
		this[name] = !this[name];
	}
}

let properties = [
	['Album Manager Chart Date', 0, 'chartDate'],
	['Album Manager Lfm Release Type', 1, 'lfmReleaseType'],
	['Album Manager Lfm SortBy Playcount', false, 'lfmSortPC'],
	['Album Manager Load List', '', 'playTracksList'],
	['Album Manager Load List Index', 0, 'playTracksListIndex'],
	['Album Manager MB Group', false, 'mbGroup'],
	['Album Manager MB Release Type', 0, 'mbReleaseType'],
	['Album Manager MB Show Live Releases', false, 'showLive'],
	['Album Manager Play Tracks', false, 'playTracks'],
	['Albums Pref MB Tracks', 1, 'prefMbTracks'],
	['Album Manager Show', true, 'showAlb'],
	['Album Manager Show MB', 0, 'mb'],
	['Album Manager Show Artists Pane', true, 'showArtists'],
	['Album Manager Show Similar Artists', true, 'showSimilar'],
	['Album Manager Show Source', 2, 'showSource'],

	['API Key Last.fm', '', 'userAPIKeyLastfm'],
	['API Key YouTube', '', 'userAPIKeyYouTube'],
	['Artist View', false, 'artistView'],

	['Auto DJ Artist Variety Lfm', 50, 'lfm_variety'],
	['Auto DJ Artists: Random Pick', 0, 'randomArtist'],
	['Auto DJ Auto Enable', true, 'autoRad'],
	['Auto DJ BestTracks Bias 1-10 Artist', 'Lfm,2,libLfm,1,libOwn,5', 'djBiasArtist'],
	['Auto DJ BestTracks Bias 1-10 Genre.TopTracks', 'Lfm,1,libLfm,1,libOwn,10', 'djBiasGenreTracks'],
	['Auto DJ BestTracks Bias 1-10 Similar Artists', 'Lfm,5,libLfm,5,libOwn,10', 'djBiasSimilarArtists'],
	['Auto DJ BestTracks Bias 1-10 Similar Songs', 'Lfm,2,libLfm,1,libOwn,1', 'djBiasSimilarSongs'],
	['Auto DJ BestTracks Bias 1-10 Genre.TopArtists', 'Lfm,5,libLfm,5,libOwn,10', 'djBiasGenreArtists'],
	['Auto DJ BestTracks Bias 1-10 Query', 'Lfm,N/A,libLfm,N/A,libOwn,10', 'djBiasQuery'],
	['Auto DJ BestTracks Bias Auto-0 Custom 1-10', 0, 'cusBestTracksBias'],
	['Auto DJ Current Artist Variety Lfm', 50, 'cur_lfm_variety'],
	['Auto DJ Current Mode', 1, 'cur_dj_mode'],
	['Auto DJ Current Query', false, 'cur_dj_query'],
	['Auto DJ Current Range', 1, 'cur_dj_range'],
	['Auto DJ Current Source', 'N/A', 'cur_dj_source'],
	['Auto DJ Current Type', 2, 'cur_dj_type'],
	['Auto DJ Data Source Last.fm-0 Own-1', 0, 'djOwnData'],
	['Auto DJ Decades Menu', JSON.stringify([{
		tag1: '50s',
		tag2: '1950s',
		query: '%Date% AFTER 1949 AND %Date% BEFORE 1960'
	}, {
		tag1: '60s',
		tag2: '1960s',
		query: '%Date% AFTER 1959 AND %Date% BEFORE 1970'
	}, {
		tag1: '70s',
		tag2: '1970s',
		query: '%Date% AFTER 1969 AND %Date% BEFORE 1980'
	}, {
		tag1: '80s',
		tag2: '1980s',
		query: '%Date% AFTER 1979 AND %Date% BEFORE 1990'
	}, {
		tag1: '90s',
		tag2: '1990s',
		query: '%Date% AFTER 1989 AND %Date% BEFORE 2000'
	}, {
		tag1: '00s',
		tag2: '2000s',
		query: '%Date% AFTER 1999 AND %Date% BEFORE 2010'
	}, {
		tag1: '10s',
		tag2: '2010s',
		query: '%Date% AFTER 2009 AND %Date% BEFORE 2020'
	}, {
		tag1: '20s',
		tag2: '2020s',
		query: '%Date% AFTER 2019 AND %Date% BEFORE 2030'
	}]), 'decadesMenu'],
	['Auto DJ Decades Short Format', 0, 'longDecadesFormat'],
	['Auto DJ Favourites', 'No Favourites', 'favourites'],
	['Auto DJ Genre Menu', 'Alternative,Alternative Rock,Classic Rock,Electronic,Experimental,Female Vocalists,Folk,Hard Rock,Hip Hop,Indie,Instrumental,Jazz,Metal,Pop,Progressive Rock,Punk,Rock', 'genreMenu'],
	['Auto DJ Last Current Mode', 1, 'last_cur_dj_mode'],
	['Auto DJ Last Data Source Last.fm-0 Own-1', 0, 'lastDjOwnData'],
	['Auto DJ Last Library', 1, 'lastLibDj'],
	['Auto DJ Last Mode', 1, 'lastDjMode'],
	['Auto DJ Mode', 1, 'djMode'],
	['Auto DJ Names: Pairs + Separator', ', Auto DJ,Library, Auto DJ,Library, Auto DJ,Separator, \u2219 ', 'djName'],
	['Auto DJ Normalise Last.fm Multi-Artist Feeds', true, 'refineLastfm'],
	['Auto DJ Play From Saved Last.fm Data', false, 'useSaved'],
	['Auto DJ Played Artists', JSON.stringify([]), 'playedArtists'],
	['Auto DJ Played Tracks', JSON.stringify([]), 'playedTracks'],
	['Auto DJ Playlist Track Limit', 5, 'djPlaylistLimit'],
	['Auto DJ PopularTrack [AllTime] LfmPlaycount', 500000, 'pc_at_adjust'],
	['Auto DJ PopularTrack [Current] LfmPlaycount (30 days)', 1667, 'pc_cur_adjust'],
	['Auto DJ Range', 1, 'djRange'],
	['Auto DJ Remove Played', true, 'removePlayed'],
	['Auto DJ Save Tracks', false, 'djSaveTracks'],
	['Auto DJ Search Timeout (msec min 30000)', 120000, 'djSearchTimeout'],
	["Auto DJ TopTracks Feed Size: Artist 5'Hot'-1000", 'Highly popular,25,Popular,50,Normal,75,Varied,100,Diverse,150,Highly diverse,200', 'presets'],
	['Auto DJ TopTracks Feed Size: Genre/Tag', 'Artist Values Multiplied By,10', 'tagFeed'],
	['Auto DJ TopTracks Feed Size: Similar Songs', 'Artist Values Multiplied By,2.5', 'songFeed'],
	['Auto DJ Track Count Log', 0, 'trackCount'],
	['Auto DJ Tracks [Lfm] Curr Popularity', 1, 'curPop'],

	['Border Increase Right Margin By Scrollbar Width', false, 'extra_sbar_w'],
	['Border', 25, 'bor'],

	['Button Logo Text', 0, 'logoText'],
	['Button Mode', false, 'btn_mode'],
	['Click Action: Use Double Click', false, 'dblClickToggle'],
	['Colour Swap', false, 'swapCol'],
	['Config Data Source Last.fm-0 Own-1', 0, 'configOwnData'],
	['Custom Font', 'Segoe UI,16,0', 'custFont'],
	['Custom Font Nowplaying', 'Calibri,20,1', 'custFontNowplaying'],
	['Custom Colour Text', '171,171,190', 'text'],
	['Custom Colour Text Highlight', '121,194,255', 'text_h'],
	['Custom Colour Text Selected', '255,255,255', 'textSel'],
	['Custom Colour Background', '4,39,68', 'bg'],
	['Custom Colour Background Accent', '18,52,85', 'bg_h'],
	['Custom Colour Background Selected', '37,71,108', 'bgSel'],
	['Custom Colour Frame Hover', '35,132,182', 'frame'],
	['Custom Colour Side Marker', '121,194,255', 'sideMarker'],
	['Custom Colour Transparent Fill', '0,0,0,0.06', 'bgTrans'],

	['Custom Font Use', false, 'custFontUse'],
	['Custom Font Nowplaying Use', false, 'custFontNowplayingUse'],
	['Custom Colour Text Use', false, 'textUse'],
	['Custom Colour Text Highlight Use', false, 'text_hUse'],
	['Custom Colour Text Selected Use', false, 'textSelUse'],
	['Custom Colour Background Use', false, 'bgUse'],
	['Custom Colour Background Accent Use', false, 'bg_hUse'],
	['Custom Colour Background Selected Use', false, 'bgSelUse'],
	['Custom Colour Frame Hover Use', false, 'frameUse'],
	['Custom Colour Side Marker Use', false, 'sideMarkerUse'],
	['Custom Colour Transparent Fill Use', false, 'bgTransUse'],
	['Custom Font Scroll Icon', 'Segoe UI Symbol,0', 'butCustIconFont'],

	['Favourites Auto ', true, 'autoFav'],
	['Find Current Mode', 2, 'cur_find_mode'],
	['Find Data Source Last.fm-0 Own-1', 0, 'findOwnData'],
	['Find Mode', 2, 'findMode'],
	['Find Randomize', false, 'findRandomize'],
	['Find Save Top Tracks Playlists', false, 'findSavePlaylists'],
	['Font Size Base', 16, 'baseFontSize'],
	['Genre Tracks', 1, 'genre_tracks'],
	['Heading Highlight ', true, 'headHighlight'],
	['Highlight Row', 3, 'highLightRow'],
	['Highlight Text', true, 'highLightText'],

	['Image [Artist] Auto-Download', false, 'dl_art_img'],
	['Image [Artist] Cycle Time (seconds)', 15, 'cycleTime'],
	['Image [Artist] Cycle', true, 'cycPhoto'],
	['Image [Artist] Folder Location', '%profile%\\yttm\\art_img\\$lower($cut($meta(artist,0),1))\\$meta(artist,0)', 'imgArtPth'],
	['Image Blur Background Always Use Front Cover', false, 'covBlur'],
	['Image Blur Background Auto-Fill', false, 'blurAutofill'],
	['Image Blur Background Level (%)', 90, 'blurTemp'],
	['Image Blur Background Opacity (%)', 30, 'blurAlpha'],
	['Image Border', false, 'imgBorder'],
	['Image Circular Cover', false, 'covCirc'],
	['Image Circular Photo', false, 'artCirc'],
	['Image Counter', false, 'imgCounter'],
	['Image Reflection', false, 'imgReflection'],
	['Image Reflection Gradient (%)', 10, 'reflGradient'],
	['Image Reflection Size (%)', 100, 'reflSize'],
	['Image Reflection Strength (%)', 14.5, 'reflStrength'],
	['Image Seeker', 0, 'imgSeeker'],
	['Image Seeker Dots', true, 'imgSeekerDots'],
	['Image Shadow', false, 'imgShadow'],
	['Image Size 0-1000 (0 = Auto)', 0, 'imgSize'],
	['Image Smooth Transition', false, 'imgSmoothTrans'],
	['Image Smooth Transition Level (%)', 92, 'transLevel'],
	['Layout Auto Adjust', true, 'autoLayout'],

	['Library: Include Partial Matches', false, 'partialMatch'],
	['Library Album', 1, 'libAlb'],
	['Library Auto DJ', 1, 'libDj'],
	['Library Filter All Uses', '', 'libFilter'],
	['Library Filter Auto DJ', '%rating% IS 1', 'autoDJFilter'],
	['Library Filter Auto DJ Use', false, 'autoDJFilterUse'],
	['Library Filter All Uses Use', false, 'libFilterUse'],
	['Library Sort', $.playCountInstalled ? 0 : 2, 'sortType'],
	['Library Sort Auto DJ', 0, 'sortAutoDJ'],

	['Lines Embolden', false, 'linesEmbolden'],
	['Line Padding', 0, 'verticalPad'],
	['Logo Show', true, 'showLogo'],

	['m-TAGS Auto Replace Dead Items 0 or 1', 'YouTube,1,Library,0', 'mtagsSync'],
	['m-TAGS Create: Write Absolute Paths', true, 'mtagsAbsPath'],
	['m-TAGS Installed', false, 'mtagsInstalled'],
	['m-TAGS Show Update Message', false, 'mtagsUpdMsg'],
	['No Limits', false, 'v'],

	['Nowplaying Style', 0, 'nowPlayingStyle'],
	['Nowplaying Text Height (%)', 26.5, 'nowPlayingTextHeight'],
	['Nowplaying Text Info', true, 'npTextInfo'],
	['Nowplaying Text Shadow Effect', true, 'npShadow'],
	['Partial Match Configuration', 'FuzzyMatch%,80,RegEx,\\(|\\[|feat,Console,false', 'partialMatchConfig'],
	['Partial Match: 0 Fuzzy-1 RegEx-2 Either-3', 'AlbumTrack,1,AutoDJTrack,3,TopTrack,1', 'partialMatchType'],

	['Playlist Label Top', 'Top', 'playlistTop'],
	['Playlist Label Tracks', 'Tracks', 'playlistTracks'],
	['Playlist Name Selection', 'Find & Play Selection', 'playlistSelection'],
	['Playlist Name Cache', 'Find & Play Cache', 'playlistCache'],
	['Playlist Name Loved', 'Loved', 'playlistLoved'],
	['Playlist Name Auto DJ', 'Auto DJ', 'playlistDj'],
	['Playlist Soft Mode', false, 'playlistSoftMode'],
	['Playlist Sort', '%album artist% | %date% | %album% | [[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%', 'albumSortOrder'],
	['Prefer Focus', false, 'focus'],

	['Query Artist Field', 'Artist', 'queryArtistField'],
	['Query Album Field', 'Album', 'queryAlbumField'],
	['Query Genre Field', 'Genre', 'queryGenreField'],
	['Query Title Field', 'Title', 'queryTitleField'],
	['Row Stripes', false, 'rowStripes'],

	['Scroll: Smooth Scroll', true, 'smooth'],
	['Scroll Step 0-10 (0 = Page)', 3, 'scrollStep'],
	['Scroll Smooth Duration 0-5000 msec (Max)', 500, 'durationScroll'],
	['Scroll Touch Flick Distance 0-10', 0.8, 'flickDistance'],
	['Scroll Touch Flick Duration 0-5000 msec (Max)', 3000, 'durationTouchFlick'],
	['Scrollbar Arrow Custom Icon', '\uE0A0', 'arrowSymbol'],
	['Scrollbar Arrow Custom Icon: Vertical Offset (%)', -24, 'sbarButPad'],
	['Scrollbar Arrow Width', Math.round(11 * $.scale), 'sbarArrowWidth'],
	['Scrollbar Button Type', 0, 'sbarButType'],
	['Scrollbar Colour Grey-0 Blend-1', 1, 'sbarCol'],
	['Scrollbar Grip MinHeight', Math.round(20 * $.scale), 'sbarGripHeight'],
	['Scrollbar Padding', 0, 'sbarPad'],
	['Scrollbar Narrow Bar Width (0 = Auto)', 0, 'narrowSbarWidth'],
	['Scrollbar Show', 1, 'sbarShow'],
	['Scrollbar Type Default-0 Styled-1 Windows-2', 0, 'sbarType'],
	['Scrollbar Width', Math.round(11 * $.scale), 'sbarWidth'],
	['Scrollbar Width Bar', 11, 'sbarBase_w'],
	['Scrollbar Windows Metrics', false, 'sbarWinMetrics'],

	['Search Show', true, 'searchShow'],
	['Style Image Path', '', 'styleImages'],
	['Theme', 0, 'theme'],

	['Titleformat (Web Search) Artist', '[$if3($meta(artist,0),$meta(album artist,0),$meta(composer,0),$meta(performer,0))]', 'tfArtist'],
	['Titleformat (Web Search) Album', '[$meta(album,0)]', 'tfAlbum'],
	['Titleformat (Web Search) Genre', '[$meta(genre,0)]', 'tfGenre'],
	['Titleformat (Web Search) Title', '[$meta(title,0)]', 'tfTitle'],
	['Titleformat Nowplaying', '[%artist%]$crlf()[%title%]', 'tfNowplaying'],
	['Titleformat Play Count', '%play_count%', 'tfPlaycount'],
	['Titleformat Rating', '%rating%', 'tfRating'],

	['Top Tracks Number to Play', 3, 'topTracksIX'],
	['Touch Control', false, 'touchControl'],
	['Touch Step 1-10', 1, 'touchStep'],
	['Video Mode', false, 'videoMode'],
	['Video Popup Control Default-0 Full-1', 0, 'vid_full_ctrl'],

	["YouTube 'Live' Filter", true, 'yt_filter'],
	["YouTube 'Live' Filter Description (| separator or regex)", 'awards|bootleg|\\bclip\\b|concert\\b|grammy|interview|jools|karaoke|(- |\\/ |\\/|\\| |\\(|\\[|{|\\")live|live at|mtv|o2|parody|preview|sample|\\bsession|teaser|\\btour\\b|tutorial|unplugged|(?=.*\\blive\\b)(19|20)\\d\\d|(?=.*(19|20)\\d\\d)\\blive\\b', 'ytDescrFilter'], /*intentionally different*/
	["YouTube 'Live' Filter Title (| separator or regex)", 'awards|bootleg|\\bclip\\b|concert\\b|grammy|interview|jools|karaoke|(- |\\/ |\\/|\\| |\\(|\\[|{|\\")live|live at|mtv|o2|parody|perform|preview|sample|\\bsession|teaser|\\btour\\b|tutorial|unplugged|\\d/\\d|\\d-\\d|(?=.*\\blive\\b)(19|20)\\d\\d|(?=.*(19|20)\\d\\d)\\blive\\b|(?:[^n]).\\breaction\\b', 'ytTitleFilter'],
	["YouTube 'Preference' Keywords (| separator or regex)", 'vevo|warner', 'yt_pref_kw'],
	["YouTube 'Preference' Verbose Log (Console)", false, 'ytPrefVerboseLog'],
	['YouTube Prefer Most: Relevant-0 Views-1', 0, 'yt_order'],
	['YouTube Preference Filter', false, 'ytPref'],
	['YouTube Search API-0 Web-1', 1, 'ytDataSource'],
	['YouTube Web Call Log', JSON.stringify({
		message: 0,
		timestamps: []
	}), 'ytWebCallLog'],

	['Zoom Button Size (%)', 100, 'zoomBut'],
	['Zoom Font Size (%)', 100, 'zoomFont'],
	['Zoom Tooltip (%)', 100, 'zoomTooltip']
];

const ppt = new PanelProperties;
ppt.init('auto', properties);
properties = undefined;