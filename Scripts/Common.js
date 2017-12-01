// ==PREPROCESSOR==
// @name 'Common'
// @author 'TheQwertiest'
// ==/PREPROCESSOR==

var g_theme_name = 'CaTRoX (QWR Edition)';
var g_theme_folder = 'CaTRoX';
var g_theme_version = '4.0.3';

var scriptFolder = 'themes\\' + g_theme_folder + '\\Scripts\\';
// ================================================================================= //
var UIHacks = new ActiveXObject('UIHacks');

var pssBackColor = _.RGB(25, 25, 25);
var panelsBackColor = _.RGB(30, 30, 30);
var panelsFrontColor = _.RGB(40, 40, 40);
var panelsLineColor = _.RGB(55, 55, 55);
var panelsLineColorSelected = panelsLineColor;
var panelsNormalTextColor = _.RGB(125, 127, 129);
// ================================================================================= //
function timeFormat(s, truncate) {
    var weeks = Math.floor(s / 604800),
        days = Math.floor(s % 604800 / 86400),
        hours = Math.floor((s % 86400) / 3600),
        minutes = Math.floor(((s % 86400) % 3600) / 60),
        seconds = Math.round((((s % 86400) % 3600) % 60));

    weeks = weeks > 0 ? weeks + 'wk ' : '';
    days = days > 0 ? days + 'd ' : '';
    hours = hours > 0 ? hours + ':' : '';
    (truncate ? minutes = minutes + ':' : minutes = (minutes < 10 ? '0' + minutes : minutes) + ':');
    seconds = seconds < 10 ? '0' + seconds : seconds;

    return weeks + days + hours + minutes + seconds;
}

var g_string_format = {
    h_align_near:   0x00000000,
    h_align_center: 0x10000000,
    h_align_far:    0x20000000,

    v_align_near:   0x00000000,
    v_align_center: 0x01000000,
    v_align_far:    0x02000000,

    align_center: 0x11000000,

    trim_none:          0x00100000,
    trim_char:          0x00100000,
    trim_word:          0x00200000,
    trim_ellipsis_char: 0x00300000,
    trim_ellipsis_word: 0x00400000,
    trim_ellipsis_path: 0x00500000,

    dir_right_to_Left:       0x00000001,
    dir_vertical:            0x00000002,
    no_fit_black_box:        0x00000004,
    display_format_control:  0x00000020,
    no_font_fallback:        0x00000400,
    measure_trailing_spaces: 0x00000800,
    no_wrap:                 0x00001000,
    line_limit:              0x00002000,
    no_clip:                 0x00004000
};

var g_font_style = {
    regular:     0,
    bold:        1,
    italic:      2,
    bold_italic: 3,
    underline:   4,
    strikeout:   8
};

//--->
var g_playback_order = {
    default:         0,
    repeat_playlist: 1,
    repeat_track:    2,
    random:          3,
    shuffle_tracks:  4,
    shuffle_albums:  5,
    shuffle_folders: 6
};

var g_guifx = {
    name:          'Guifx v2 Transports',
    play:          1,
    pause:         2,
    stop:          3,
    record:        4,
    rewind:        5,
    fast_forward:  6,
    previous:      7,
    next:          8,
    replay:        9,
    refresh:       0,
    mute:          '!',
    mute2:         '@',
    volume_down:   '#',
    volume_up:     '$',
    thumbs_down:   '%',
    thumbs_up:     '^',
    shuffle:       '\&',
    repeat:        '*',
    repeat1:       '(',
    zoom:          ')',
    zoom_out:      '_',
    zoom_in:       '+',
    minus:         '-',
    plus:          '=',
    up:            'W',
    down:          'S',
    left:          'A',
    right:         'D',
    up2:           'w',
    down2:         's',
    left2:         'a',
    right2:        'd',
    start:         '{',
    end:           '}',
    top:           '?',
    bottom:        '/',
    jump_backward: '[',
    jump_forward:  ']',
    slow_backward: ':',
    slow_forward:  '\'',
    eject:         '\'',
    reject:        ';',
    up3:           '.',
    down3:         ',',
    left3:         '<',
    right3:        '>',
    screen_up:     '|',
    screen_down:   '\\',
    guifx:         'g',
    power:         'q',
    checkmark:     'z',
    close:         'x',
    hourglass:     'c',
    heart:         'v',
    star:          'b',
    fire:          'i',
    medical:       'o',
    police:        'p'
};

var g_album_art_id = {
    front:  0,
    back:   1,
    disc:   2,
    icon:   3,
    artist: 4
};

function link(site, metadb) {
    if (!metadb) {
        return;
    }

    var meta_info = metadb.GetFileInfo();
    var artist = meta_info.MetaValue(meta_info.MetaFind('artist'), 0).replace(/\s+/g, '+').replace(/&/g, '%26');
    var album = meta_info.MetaValue(meta_info.MetaFind('album'), 0).replace(/\s+/g, '+');
    var title = meta_info.MetaValue(meta_info.MetaFind('title'), 0).replace(/\s+/g, '+');

    var search_term = artist ? artist : title;

    switch (site) {
        case 'google':
            site = (search_term ? 'http://images.google.com/search?q=' + search_term + '&ie=utf-8' : null);
            break;
        case 'googleImages':
            site = (search_term ? 'http://images.google.com/images?hl=en&q=' + search_term + '&ie=utf-8' : null);
            break;
        case 'eCover':
            site = (search_term || album ? 'http://ecover.to/?Module=ExtendedSearch&SearchString=' + search_term + '+' + album + '&ie=utf-8' : null);
            break;
        case 'wikipedia':
            site = (artist ? 'http://en.wikipedia.org/wiki/' + artist.replace(/\+/g, '_') : null);
            break;
        case 'youTube':
            site = (search_term ? 'http://www.youtube.com/results?search_type=&search_query=' + search_term + '&ie=utf-8' : null);
            break;
        case 'lastFM':
            site = (search_term ? 'http://www.last.fm/music/' + search_term.replace('/', '%252F') : null);
            break;
        case 'discogs':
            site = (search_term || album ? 'http://www.discogs.com/search?q=' + search_term + '+' + album + '&ie=utf-8' : null);
            break;
        default:
            site = undefined;
    }

    if (!site) {
        return;
    }

    _.run(site);
}

var qwr_utils = {
    EnableSizing: function (m) {
        try {
            if (UIHacks.FrameStyle === 3 && UIHacks.DisableSizing) {
                UIHacks.DisableSizing = false;
            }
        }
        catch (e) {
            fb.trace(e)
        }
    },
    DisableSizing: function (m) {
        try {
            if (m && UIHacks.FrameStyle === 3 && !UIHacks.DisableSizing) {
                UIHacks.DisableSizing = true;
            }
        }
        catch (e) {
            fb.trace(e)
        }
    },
    caller: function () {
        var caller = /^function\s+([^(]+)/.exec(arguments.callee.caller.caller);
        if (caller) {
            return caller[1];
        }
        else {
            return 0;
        }
    },
    function_name: function () {
        var caller = /^function\s+([^(]+)/.exec(arguments.callee.caller);
        if (caller) {
            return caller[1];
        }
        else {
            return 0;
        }
    },
    run_notepad: function (script_name) {
        if (!_.runCmd('notepad++.exe ' + scriptFolder + script_name)) {
            _.runCmd('notepad.exe ' + scriptFolder + script_name);
        }
    },
    check_fonts: function (fonts) {
        var checkedFonts = '';
        var failCounter = 0;

        fonts.forEach(function (item) {
            var check = utils.CheckFont(item);
            if (!check) {
                failCounter++;
            }
            checkedFonts += ('\n' + item + (check ? ': Installed.' : ': NOT INSTALLED!'));
        });

        if (failCounter) {
            checkedFonts += '\n\nPlease install missing ' + (failCounter > 1 ? 'fonts' : 'font') + ' and restart foobar!';
            fb.ShowPopupMessage(checkedFonts, 'Font Check');

            return false;
        }

        return true;
    },
    has_modded_jscript: _.once(function() {
        var ret = _.attempt(function() {
            // Methods from modded JScript
            wsh_utils.GetWndByHandle(666);
            fb.IsMainMenuCommandChecked('View/Always on Top');
        });

        return !_.isError(ret);
    })
};

function g_numeric_ascending_sort(a, b) {
    return (a - b);
}

function Property(text_id, default_value) {
    this.get = function() {
        return value;

    };
    this.set = function(new_value) {
        if (value !== new_value) {
            window.SetProperty(this.text_id, new_value);
            value = new_value;
        }
    };

    this.text_id = text_id;
    var value = window.GetProperty(this.text_id, default_value);
}

var g_properties = new function() {
    this.add_properties = function (properties) {
        _.forEach(properties, _.bind(function (item, i) {
            if (!_.isArray(item) || item.length !== 2 || !_.isString(item[0])) {
                throw Error('Type Error:\nUsage: add_properties({\n  property_name, [property.string.description, property_default_value]\n})');
            }
            if (i === 'add_properties') {
                throw Error('Argument Error:\n"add_properties" name is reserved');
            }
            if (!_.isNil(this[i]) || !_.isNil(this[i + 'internal'])) {
                throw Error('Argument Error:\n' + '"' + i + '"' + ' name is already occupied');
            }

            this[i + 'internal'] = new Property(item[0], item[1]);
            Object.defineProperty(this, i, {
                get: function () {
                    return this[i + 'internal'].get()
                },
                set: function (new_value) {
                    this[i + 'internal'].set(new_value)
                }
            });
        }, this));
    };
};

