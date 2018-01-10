// ==PREPROCESSOR==
// @name 'Common'
// @author 'TheQwertiest'
// ==/PREPROCESSOR==

var g_theme_name = 'CaTRoX (QWR Edition)';
var g_theme_folder = 'CaTRoX';
var g_theme_version = '4.0.5';

var scriptFolder = 'themes\\' + g_theme_folder + '\\Scripts\\';
// ================================================================================= //
/** @type {IUIHacks} */
var UIHacks =
    /** @type {IUIHacks} */
    new ActiveXObject('UIHacks');

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

/**
 * @constructor
 * @param {string} msg
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
 * @constructor
 * @param {string} msg
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
 * @constructor
 * @param {string} arg_name
 * @param {string} arg_type
 * @param {string} valid_type
 * @param {string=} additional_msg
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
 * @constructor
 * @param {string} arg_name
 * @param {*} arg_value
 * @param {string=} additional_msg
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
    EnableSizing:                function (m) {
        try {
            if (UIHacks.FrameStyle === 3 && UIHacks.DisableSizing) {
                UIHacks.DisableSizing = false;
            }
        }
        catch (e) {
            console.log(e)
        }
    },
    DisableSizing:               function (m) {
        try {
            if (m && UIHacks.FrameStyle === 3 && !UIHacks.DisableSizing) {
                UIHacks.DisableSizing = true;
            }
        }
        catch (e) {
            console.log(e)
        }
    },
    caller:                      function () {
        var caller = /^function\s+([^(]+)/.exec(/** @type{string} */ arguments.callee.caller.caller);
        if (caller) {
            return caller[1];
        }
        else {
            return 0;
        }
    },
    function_name:               function () {
        var caller = /^function\s+([^(]+)/.exec(/** @type{string} */ arguments.callee.caller);
        if (caller) {
            return caller[1];
        }
        else {
            return 0;
        }
    },
    run_notepad:                 function (script_name) {
        if (!_.runCmd('notepad++.exe ' + scriptFolder + script_name)) {
            _.runCmd('notepad.exe ' + scriptFolder + script_name);
        }
    },
    check_fonts:                 function (fonts) {
        var msg = '';
        var failCounter = 0;

        fonts.forEach(function (item) {
            var check = utils.CheckFont(item);
            if (!check) {
                failCounter++;
            }
            msg += ('\n' + item + (check ? ': Installed.' : ': NOT INSTALLED!'));
        });

        if (failCounter) {
            msg += '\n\nPlease install missing ' + (failCounter > 1 ? 'fonts' : 'font') + ' and restart foobar!';
            throw new ThemeError(msg);
        }
    },
    has_modded_jscript:          _.once(function () {
        var ret = _.attempt(function () {
            // Methods from modded JScript
            wsh_utils.GetWndByHandle(666);
            fb.IsMainMenuCommandChecked('View/Always on Top');
        });

        return !_.isError(ret);
    }),
    /**
     *
     * @param {ContextMenu} cm
     * @param {?string} script_filename
     */
    append_default_context_menu: function (cm, script_filename) {
        if (!cm) {
            return;
        }

        cm.append(new ContextItem(
            'Console',
            function () {
                fb.ShowConsole();
            })
        );

        cm.append(new ContextItem(
            'Restart',
            function () {
                fb.RunMainMenuCommand("File/Restart");
            })
        );

        cm.append(new ContextItem(
            'Preferences...',
            function () {
                fb.RunMainMenuCommand("File/Preferences");
            })
        );

        cm.append_separator();

        cm.append(new ContextItem(
            'Edit script...',
            function () {
                if (!_.runCmd("notepad++.exe " + script_filename)) {
                    _.runCmd("notepad.exe " + script_filename);
                }
            },
            {is_grayed_out: !_.isFile(script_filename)})
        );

        cm.append(new ContextItem(
            'Configure panel...',
            function () {
                window.ShowConfigure();
            })
        );

        cm.append(new ContextItem(
            'Panel properties...',
            function () {
                window.ShowProperties();
            })
        );
    }
};

function g_numeric_ascending_sort(a, b) {
    return (a - b);
}

/**
 * @final
 * @constructor
 * @extends {ContextMenu}
 */
function ContextMainMenu() {
    ContextMenu.call(this, 'dummy_string');

    // public:

    /** @return{boolean} */
    this.execute = function (x, y) {
        var cur_idx = 0;
        this.menu_items.forEach(function(item){
            if (!item.initialize_menu_idx) {
                return;
            }
            cur_idx = item.initialize_menu_idx(cur_idx);
        });
        this.menu_items.forEach(_.bind(function(item){
            item.initialize_menu(this);
        },this));

        var idx = this.cm.TrackPopupMenu(x, y);

        return this.execute_menu(idx);
    };
}
ContextMainMenu.prototype = Object.create(ContextMenu.prototype);
ContextMainMenu.prototype.constructor = ContextMainMenu;

/**
 * @constructor
 * @extends {ContextBaseItem}
 * @param{string} text_arg
 * @param{object=} [optional_args={}]
 * @param{boolean=} [optional_args.is_grayed_out=false]
 * @param{boolean=} [optional_args.is_checked=false]
 */
function ContextMenu(text_arg, optional_args) {
    ContextBaseItem.call(this, text_arg);

    // public:

    /**
     * @param{ContextMenu|ContextItem|ContextMenuSeparator} item
     */
    this.append = function(item) {
        if (!item.type || ('ContextMenu' !== item.type && 'ContextItem' !== item.type && 'ContextMenuSeparator' !== item.type)) {
            throw new TypeError('menu_item', typeof item, 'ContextMenu, ContextItem or ContextMenuSeparator');
        }

        this.menu_items.push(item);
    };

    this.append_separator = function() {
        this.append(new ContextMenuSeparator());
    };

    /**
     * @param{number} start_idx
     * @param{number} check_idx
     */
    this.radio_check = function(start_idx, check_idx) {
        var item = this.menu_items[start_idx + check_idx];
        if (!item) {
            throw new ArgumentError('check_idx', check_idx, 'Value is out of bounds');
        }

        if (start_idx > check_idx) {
            throw new ArgumentError('start_idx', start_idx, 'Value is out of bounds');
        }

        if ('MenuSeparator' === item.type){
            throw new ArgumentError('check_idx', check_idx, 'Index points to MenuSeparator');
        }

        item.radio_check(true)
    };

    this.dispose = function() {
        this.cm.Dispose();
        this.cm = null;

        var items = this.menu_items;
        for (var i = 0; i < items.length; ++i) {
            if (items[i].dispose) {
                items[i].dispose();
            }
            items[i] = null;
        }

        this.menu_items = null;
    };

    // protected:

    /**
     * @param{number} start_idx
     * @return{number} end_idx
     */
    this.initialize_menu_idx = function(start_idx) {
        var cur_idx = start_idx;

        this.idx = cur_idx++;
        this.menu_items.forEach(function(item){
            if (!item.initialize_menu_idx) {
                return;
            }
            cur_idx = item.initialize_menu_idx(cur_idx);
        });

        return cur_idx;
    };

    /**
     * @param{ContextMenu} parent_menu
     */
    this.initialize_menu = function(parent_menu) {
        this.menu_items.forEach(_.bind(function(item){
            item.initialize_menu(this);
        },this));

        this.cm.AppendTo(parent_menu.cm, is_grayed_out ? MF_GRAYED : MF_STRING, this.text);
    };

    /**
     * @param{number} idx
     * @return{boolean}
     * */
    this.execute_menu = function (idx) {
        for (var i = 0; i < this.menu_items.length; ++i) {
            var items = this.menu_items;
            var item = items[i];
            var next_item = items[i + 1];

            if (idx === item.idx || (idx > item.idx && ( !next_item || idx < next_item.idx))) {
                return item.execute_menu(idx);
            }
        }
    };

    /** @const{string} */
    this.type = 'ContextMenu';

    /** @const{boolean} */
    var is_grayed_out = !!(optional_args && optional_args.is_grayed_out);

    this.menu_items = [];
    this.cm = window.CreatePopupMenu();
}
ContextMenu.prototype = Object.create(ContextBaseItem.prototype);
ContextMenu.prototype.constructor = ContextMenu;

/**
 *
 * @constructor
 * @extends {ContextBaseItem}
 * @param{string} text_arg
 * @param{function} callback_fn_arg
 * @param{object=} [optional_args={}]
 * @param{boolean=} [optional_args.is_grayed_out=false]
 * @param{boolean=} [optional_args.is_checked=false]
 * @param{boolean=} [optional_args.is_radio_checked=false]
 */

function ContextItem(text_arg, callback_fn_arg, optional_args) {
    ContextBaseItem.call(this, text_arg);

    // public:

    /**
     * @param{boolean} is_checked_arg
     */
    this.check = function(is_checked_arg) {
        is_checked = is_checked_arg;
    };

    /**
     * @param{boolean} is_checked_arg
     */
    this.radio_check = function(is_checked_arg) {
        is_radio_checked = is_checked_arg;
    };

    // protected:

    /**
     * @param{number} start_idx
     * @return{number} end_idx
     */
    this.initialize_menu_idx = function(start_idx) {
        this.idx = start_idx;
        return this.idx + 1;
    };

    /**
     * @param{ContextMenu} parent_menu
     */
    this.initialize_menu = function(parent_menu) {
        parent_menu.cm.AppendMenuItem(is_grayed_out ? MF_GRAYED : MF_STRING, this.idx, this.text);
        if (is_checked) {
            parent_menu.cm.CheckMenuItem(this.idx, true);
        }
        else if (is_radio_checked) {
            parent_menu.cm.CheckMenuRadioItem(this.idx, this.idx, this.idx);
        }
    };

    /**
     * @param{number} idx
     * @return{boolean}
     * */
    this.execute_menu = function (idx) {
        if (this.idx !== idx) {
            return false;
        }

        callback_fn();
        return true;
    };

    // const

    /** @const{string} */
    this.type = 'ContextItem';

    // const

    /** @const{function} */
    var callback_fn = callback_fn_arg;

    /** @const{boolean} */
    var is_grayed_out = !!(optional_args && optional_args.is_grayed_out);

    var is_checked = !!(optional_args && optional_args.is_checked);
    var is_radio_checked = !!(optional_args && optional_args.is_radio_checked);
}
ContextItem.prototype = Object.create(ContextBaseItem.prototype);
ContextItem.prototype.constructor = ContextItem;

/**
 * @constructor
 * @extends {ContextBaseItem}
 */
function ContextMenuSeparator() {
    ContextBaseItem.call(this, 'DummyString');

    /**
     * @param{number} start_idx
     * @return{number} end_idx
     */
    this.initialize_menu_idx = function(start_idx) {
        this.idx = start_idx;
        return this.idx + 1;
    };

    /**
     * @param{ContextMenu} parent_menu
     */
    this.initialize_menu = function(parent_menu) {
        parent_menu.cm.AppendMenuSeparator();
    };

    /**
     * @param{number} idx
     * @return{boolean}
     * */
    this.execute_menu = function (idx) {
        return false;
    };

    /** @const{string} */
    this.type = 'ContextMenuSeparator';
}
ContextMenuSeparator.prototype = Object.create(ContextBaseItem.prototype);
ContextMenuSeparator.prototype.constructor = ContextMenuSeparator;

/**
 * @constructor
 * @param{string} text_arg
 */
function ContextBaseItem(text_arg) {

    /**
     * @param{number} start_idx
     * @return{number} end_idx
     */
    this.initialize_menu_idx = function(start_idx) {
        throw new LogicError("initialize_menu_idx not implemented");
    };

    /**
     * @param{ContextMenu} parent_menu
     */
    this.initialize_menu = function(parent_menu) {
        throw new LogicError("initialize_menu not implemented");
    };

    /**
     * @param{number} idx
     * @return{boolean}
     * */
    this.execute_menu = function (idx) {
        throw new LogicError("execute_menu not implemented");
    };

    // const

    /** @const{string} */
    this.text = text_arg;

    /** @type{?number} */
    this.idx = undefined;
}

/**
 * @constructor
 * @param{string} text_id
 * @param{*} default_value
 */
function PanelProperty(text_id, default_value) {
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
};
