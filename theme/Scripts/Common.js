// ==PREPROCESSOR==
// @name 'Common'
// @author 'TheQwertiest'
// ==/PREPROCESSOR==

var g_theme = {};
g_theme.name = 'CaTRoX (QWR Edition)';
g_theme.version = '4.2.1';
g_theme.folder_name = 'CaTRoX';
g_theme.script_folder = 'themes\\' + g_theme.folder_name + '\\Scripts\\';

g_theme.colors = {};
g_theme.colors.pss_back = _.RGB(25, 25, 25);
g_theme.colors.panel_back = _.RGB(30, 30, 30);
g_theme.colors.panel_front = _.RGB(40, 40, 40);
g_theme.colors.panel_line = _.RGB(55, 55, 55);
g_theme.colors.panel_line_selected = g_theme.colors.panel_line;
g_theme.colors.panel_text_normal = _.RGB(125, 127, 129);

/** @enum{number} */
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

/** @enum{number} */
var g_font_style = {
    regular:     0,
    bold:        1,
    italic:      2,
    bold_italic: 3,
    underline:   4,
    strikeout:   8
};

/** @enum{number} */
var g_playback_order = {
    default:         0,
    repeat_playlist: 1,
    repeat_track:    2,
    random:          3,
    shuffle_tracks:  4,
    shuffle_albums:  5,
    shuffle_folders: 6
};

/** @enum{string|number} */
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

/** @enum{number} */
var g_album_art_id = {
    front:  0,
    back:   1,
    disc:   2,
    icon:   3,
    artist: 4
};

/**
 * @param {string} msg
 * @constructor
 * @extends {Error}
 */
function ThemeError(msg) {
    Error.call(this, '') ;

    this.name = 'ThemeError';

    var err_msg = '\n';
    err_msg += msg;
    err_msg += '\n';

    this.message = err_msg;
}
ThemeError.prototype = Object.create(Error.prototype);

/**
 * @param {string} msg
 * @constructor
 * @extends {Error}
 */
function LogicError(msg) {
    Error.call(this, '') ;

    this.name = 'LogicError';

    var err_msg = '\n';
    err_msg += msg;
    err_msg += '\n';

    this.message = err_msg;
}
LogicError.prototype = Object.create(Error.prototype);

/**
 * @param {string} arg_name
 * @param {string} arg_type
 * @param {string} valid_type
 * @param {string=} additional_msg
 * @constructor
 * @extends {Error}
 */
function TypeError(arg_name, arg_type, valid_type, additional_msg) {
    Error.call(this, '') ;

    this.name = 'TypeError';

    var err_msg = '\n';
    err_msg += '\'' + arg_name + '\' is not a ' + valid_type + ', it\'s a ' + arg_type;
    if (additional_msg) {
        err_msg += '\n' + additional_msg;
    }
    err_msg += '\n';

    this.message = err_msg;
}
TypeError.prototype = Object.create(Error.prototype);

/**
 * @param {string} arg_name
 * @param {*} arg_value
 * @param {string=} additional_msg
 * @constructor
 * @extends {Error}
 */
function ArgumentError(arg_name, arg_value, additional_msg) {
    Error.call(this, '') ;

    this.name = 'ArgumentError';

    var err_msg = '\n';
    err_msg += '\'' + arg_name + '\' has invalid value: ' + arg_value.toString();
    if (additional_msg) {
        err_msg += '\n' + additional_msg;
    }
    err_msg += '\n';

    this.message = err_msg;
}
ArgumentError.prototype = Object.create(Error.prototype);

var qwr_utils = {
    EnableSizing:         function (m) {
        try {
            if (UIHacks.FrameStyle === 3 && UIHacks.DisableSizing) {
                UIHacks.DisableSizing = false;
            }
        }
        catch (e) {
            console.log(e)
        }
    },
    DisableSizing:        function (m) {
        try {
            if (m && UIHacks.FrameStyle === 3 && !UIHacks.DisableSizing) {
                UIHacks.DisableSizing = true;
            }
        }
        catch (e) {
            console.log(e)
        }
    },
    /**
     * @return {string}
     */
    caller:               function () {
        var caller = /^function\s+([^(]+)/.exec(/** @type{string} */ arguments.callee.caller.caller);
        return caller ? caller[1] : '';
    },
    /**
     * @return {string}
     */
    function_name:        function () {
        var caller = /^function\s+([^(]+)/.exec(/** @type{string} */ arguments.callee.caller);
        return caller ? caller[1] : '';
    },
    /**
     * @param{Array<string>} fonts
     */
    check_fonts:          function (fonts) {
        var msg = '';
        var failCounter = 0;

        fonts.forEach(function (item) {
            var check = utils.CheckFont(item);
            if (!check) {
                ++failCounter;
            }
            msg += ('\n' + item + (check ? ': Installed.' : ': NOT INSTALLED!'));
        });

        if (failCounter) {
            msg += '\n\nPlease install missing ' + (failCounter > 1 ? 'fonts' : 'font') + ' and restart foobar!';
            throw new ThemeError(msg);
        }
    },
    /**
     * @return{boolean}
     */
    has_modded_jscript:   _.once(function () {
        var ret = _.attempt(function () {
            // Methods from modded JScript
            wsh_utils.GetWndByHandle(666);
            fb.IsMainMenuCommandChecked('View/Always on Top');
        });

        return !_.isError(ret);
    }),
    /**
     * @param{string} site
     * @param{IFbMetadbHandle} metadb
     */
    link:                 function (site, metadb) {
        if (!metadb) {
            return;
        }

        var meta_info = metadb.GetFileInfo();
        var artist = meta_info.MetaValue(meta_info.MetaFind('artist'), 0).replace(/\s+/g, '+').replace(/&/g, '%26');
        var album = meta_info.MetaValue(meta_info.MetaFind('album'), 0).replace(/\s+/g, '+');
        var title = meta_info.MetaValue(meta_info.MetaFind('title'), 0).replace(/\s+/g, '+');

        var search_term = artist ? artist : title;

        switch (site.toLowerCase()) {
            case 'google':
                site = (search_term ? 'http://images.google.com/search?q=' + search_term + '&ie=utf-8' : null);
                break;
            case 'googleimages':
                site = (search_term ? 'http://images.google.com/images?hl=en&q=' + search_term + '&ie=utf-8' : null);
                break;
            case 'ecover':
                site = (search_term || album ? 'http://ecover.to/?Module=ExtendedSearch&SearchString=' + search_term + '+' + album + '&ie=utf-8' : null);
                break;
            case 'wikipedia':
                site = (artist ? 'http://en.wikipedia.org/wiki/' + artist.replace(/\+/g, '_') : null);
                break;
            case 'youtube':
                site = (search_term ? 'http://www.youtube.com/results?search_type=&search_query=' + search_term + '&ie=utf-8' : null);
                break;
            case 'lastfm':
                site = (search_term ? 'http://www.last.fm/music/' + search_term.replace('/', '%252F') : null);
                break;
            case 'discogs':
                site = (search_term || album ? 'http://www.discogs.com/search?q=' + search_term + '+' + album + '&ie=utf-8' : null);
                break;
            default:
                site = '';
        }

        if (!site) {
            return;
        }

        _.run(site);
    },
    MouseMoveSuppress:    function () {
        this.is_supressed = function (x, y, m) {
            if (saved_x === x && saved_y === y && saved_m === m) {
                return true;
            }

            saved_x = x;
            saved_y = y;
            saved_m = m;

            return false;
        };

        var saved_x;
        var saved_y;
        var saved_m;
    },
    KeyModifiersSuppress: function () {
        this.is_supressed = function (key) {
            if ((VK_SHIFT === key || VK_CONTROL === key || VK_MENU === key) && saved_key === key) {
                return true;
            }

            saved_key = key;

            return false;
        };

        var saved_key;
    },
    /**
     * @return {IWindow}
     */
    get_fb2k_window:      _.once(function () {
        if (!qwr_utils.has_modded_jscript()) {
            throw new LogicError('Can\'t use extensions with vanilla JScript')
        }

        // fb2k main window class
        // Can't use UIHacks.MainWindowID, since it might be uninitialized during fb2k start-up
        var ret_wnd = wsh_utils.GetWndByHandle(window.id);
        while (ret_wnd && ret_wnd.GetAncestor(1) && ret_wnd.className !== '{E7076D1C-A7BF-4f39-B771-BCBE88F2A2A8}') {// We might have multiple instances of fb2k, thus getting the parent one instead of global search
            ret_wnd = ret_wnd.GetAncestor(1);
        }

        if (!ret_wnd || ret_wnd.className !== '{E7076D1C-A7BF-4f39-B771-BCBE88F2A2A8}') {
            throw new LogicError('Failed to get top theme window')
        }

        return ret_wnd;
    }),
    /**
     * @return {IWindow}
     */
    get_top_theme_window: _.once(function () {
        if (!qwr_utils.has_modded_jscript()) {
            throw new LogicError('Can\'t use extensions with vanilla JScript')
        }

        var ret_wnd = wsh_utils.GetWndByHandle(window.id);
        while (ret_wnd && ret_wnd.GetAncestor(1) && ret_wnd.GetAncestor(1).id !== qwr_utils.get_fb2k_window().id) {
            ret_wnd = ret_wnd.GetAncestor(1);
        }

        if (!ret_wnd || ret_wnd.GetAncestor(1).id !== qwr_utils.get_fb2k_window().id) {
            throw new LogicError('Failed to get top theme window')
        }

        return ret_wnd;
    }),
    /**
     * @return {string}
     */
    get_windows_version:  _.once(function () {
        var version = '';
        var ret = _.attempt(function () {
            version = (WshShell.RegRead('HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\CurrentMajorVersionNumber')).toString();
            version += '.';
            version += (WshShell.RegRead('HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\CurrentMinorVersionNumber')).toString();
        });

        if (!_.isError(ret)){
            return version;
        }

        ret = _.attempt(function () {
            version = WshShell.RegRead('HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\CurrentVersion');
        });

        if (!_.isError(ret)){
            return version;
        }

        return '6.1';
    })
};

/**
 * @param{string} text_id
 * @param{*} default_value
 * @constructor
 */
function PanelProperty(text_id, default_value) {
    /**
     * @return {*}
     */
    this.get = function() {
        return value;

    };
    /**
     * @param {*} new_value
     */
    this.set = function(new_value) {
        if (value !== new_value) {
            window.SetProperty(this.text_id, new_value);
            value = new_value;
        }
    };

    this.text_id = text_id;

    var value = window.GetProperty(this.text_id, default_value);
}

var UIHacks =
    /** @type {IUIHacks} */
    new ActiveXObject('UIHacks');

function Properties() {
    this.add_properties = function (properties) {
        _.forEach(properties, _.bind(function (item, i) {
            if (!_.isArray(item) || item.length !== 2 || !_.isString(item[0])) {
                throw new TypeError('property', typeof item, '{ string, [string, any] }', 'Usage: add_properties({\n  property_name, [property.string.description, property_default_value]\n})');
            }
            if (i === 'add_properties') {
                throw new ArgumentError('property_name', i, 'This name is reserved');
            }
            if (!_.isNil(this[i]) || !_.isNil(this[i + '_internal'])) {
                throw new ArgumentError('property_name', i, 'This name is already occupied');
            }

            this[i + '_internal'] = new PanelProperty(item[0], item[1]);
            Object.defineProperty(this, i, {
                get: function () {
                    return this[i + '_internal'].get()
                },
                set: function (new_value) {
                    this[i + '_internal'].set(new_value)
                }
            });
        }, this));
    };
}

var g_properties = new Properties();

var g_script_list = ['Common.js'];