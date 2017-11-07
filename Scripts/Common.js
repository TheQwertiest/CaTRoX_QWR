// ==PREPROCESSOR==
// @name "Common"
// @author "TheQwertiest"
// ==/PREPROCESSOR==
//---> 
//---> Common Helpers, Flags
//--->
var themeName = "CaTRoX (QWR Edition)";
var themeFolder = "CaTRoX";
var themeVersion = "3.0";

var scriptFolder = "themes\\" + themeFolder + "\\Scripts\\";
// ================================================================================= //
var safeMode = uiHacks = false;
var UIHacks;
try {
    WshShell = new ActiveXObject("WScript.Shell");
} catch (e) {
    fb.trace("----------------------------------------------------------------------");
    fb.trace(e + "\nFix: Disable safe mode in Preferences > Tools > WSH Panel Mod");
    fb.trace("----------------------------------------------------------------------");
    safeMode = true;
}

if (!safeMode) {
    uiHacks = utils.CheckComponent("foo_ui_hacks");
    if (uiHacks) {
        UIHacks = new ActiveXObject("UIHacks");
    }
}

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

    weeks = weeks > 0 ? weeks + "wk " : "";
    days = days > 0 ? days + "d " : "";
    hours = hours > 0 ? hours + ":" : "";
    (truncate ? minutes = minutes + ":" : minutes = (minutes < 10 ? "0" + minutes : minutes) + ":");
    seconds = seconds < 10 ? "0" + seconds : seconds;

    return weeks + days + hours + minutes + seconds;
}
//--->
var _ww, _wh,
    _resizeTimerStarted;
function isResizingDone(ww, wh, resizeCallbackFn) {
    if (!_resizeTimerStarted) {
        _resizeTimerStarted = true;
        resizingIsDone = false;

        resizeTimer = window.SetInterval(function () {
            if (_ww == window.Width && _wh == window.Height) {
                resizeCallbackFn();

                resizingIsDone = true;

                _resizeTimerStarted = false;

                window.ClearInterval(resizeTimer);
            }

        }, 200);
    }
    _ww = ww;
    _wh = wh;
}

// todo: replace with helpers.js
function StringFormat() {
    var h_align = 0,
        v_align = 0,
        trimming = 0,
        flags = 0;
    switch (arguments.length) {
        // fall-thru
        case 4:
            flags = arguments[3];
        case 3:
            trimming = arguments[2];
        case 2:
            v_align = arguments[1];
        case 1:
            h_align = arguments[0];
            break;
        default:
            return 0;
    }
    return ((h_align << 28) | (v_align << 24) | (trimming << 20) | flags);
}

//--->
// Used in gdi.Font(), can be combined
// For more information, see: http://msdn.microsoft.com/en-us/library/ms534124(VS.85).aspx
FontStyle =
    {
        Regular: 0,
        Bold: 1,
        Italic: 2,
        BoldItalic: 3,
        Underline: 4,
        Strikeout: 8
    };
//--->
playbackOrder =
    {
        Default: 0,
        RepeatPlaylist: 1,
        RepeatTrack: 2,
        Random: 3,
        ShuffleTracks: 4,
        ShuffleAlbums: 5,
        ShuffleFolders: 6
    };

Guifx =
    {
        Play: 1,
        Pause: 2,
        Stop: 3,
        Record: 4,
        Rewind: 5,
        FastForward: 6,
        Previous: 7,
        Next: 8,
        Replay: 9,
        Refresh: 0,
        Mute: "!",
        Mute2: "@",
        VolumeDown: "#",
        VolumeUp: "$",
        ThumbsDown: "%",
        ThumbsUp: "^",
        Shuffle: "\&",
        Repeat: "*",
        Repeat1: "(",
        Zoom: ")",
        ZoomOut: "_",
        ZoomIn: "+",
        Minus: "-",
        Plus: "=",
        Up: "W",
        Down: "S",
        Left: "A",
        Right: "D",
        Up2: "w",
        Down2: "s",
        Left2: "a",
        Right2: "d",
        Start: "{",
        End: "}",
        Top: "?",
        Bottom: "/",
        JumpBackward: "[",
        JumpForward: "]",
        SlowBackward: ":",
        SlowForward: "\"",
        Eject: "\'",
        Reject: ";",
        Up3: ".",
        Down3: ",",
        Left3: "<",
        Right: ">",
        Guifx: "g",
        ScreenUp: "|",
        ScreenDown: "\\",
        Power: "q",
        Checkmark: "z",
        Close: "x",
        Hourglass: "c",
        Heart: "v",
        Star: "b",
        Fire: "i",
        Medical: "o",
        Police: "p"
    };

var g_album_art_id =
    {
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
    var artist = meta_info.MetaValue(meta_info.MetaFind("artist"), 0).replace(/\s+/g, "+").replace(/\&/g, "%26");
    var album = meta_info.MetaValue(meta_info.MetaFind("album"), 0).replace(/\s+/g, "+");
    var title = meta_info.MetaValue(meta_info.MetaFind("title"), 0).replace(/\s+/g, "+");

    var search_term = artist ? artist : title;

    switch (site) {
        case "google":
            site = (search_term ? "http://images.google.com/search?q=" + search_term + "&ie=utf-8" : null);
            break;
        case "googleImages":
            site = (search_term ? "http://images.google.com/images?hl=en&q=" + search_term + "&ie=utf-8" : null);
            break;
        case "eCover":
            site = (search_term || album ? "http://ecover.to/?Module=ExtendedSearch&SearchString=" + search_term + "+" + album + "&ie=utf-8" : null);
            break;
        case "wikipedia":
            site = (artist ? "http://en.wikipedia.org/wiki/" + artist.replace(/\+/g, "_") : null);
            break;
        case "youTube":
            site = (search_term ? "http://www.youtube.com/results?search_type=&search_query=" + search_term + "&ie=utf-8" : null);
            break;
        case "lastFM":
            site = (search_term ? "http://www.last.fm/music/" + search_term.replace("/", "%252F") : null);
            break;
        case "discogs":
            site = (search_term || album ? "http://www.discogs.com/search?q=" + search_term + "+" + album + "&ie=utf-8" : null);
            break;
        default:
            site = undefined;
    }

    if (!site || safeMode) {
        return;
    }

    try {
        WshShell.run(site);
    } catch (e) {
        fb.trace(e)
    }
}

var qwr_utils = {
    EnableSizing: function (m) {
        if (uiHacks) {
            try {
                if (UIHacks && UIHacks.FrameStyle == 3 && UIHacks.DisableSizing) {
                    UIHacks.DisableSizing = false;
                }
            }
            catch (e) {
                fb.trace(e)
            }
        }
    },
    DisableSizing: function (m) {
        if (uiHacks) {
            try {
                if (m && UIHacks && UIHacks.FrameStyle == 3 && !UIHacks.DisableSizing) {
                    UIHacks.DisableSizing = true;
                }
            }
            catch (e) {
                fb.trace(e)
            }
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
        try {
            WshShell.Run("notepad++.exe " + scriptFolder + script_name);
        }
        catch (e) {
            try {
                WshShell.Run("notepad.exe " + scriptFolder + script_name);
            }
            catch (e) {
                fb.trace(e)
            }
        }
    },
    check_fonts: function (fonts) {
        var checkedFonts = "";
        var failCounter = 0;

        fonts.forEach(function (item) {
            var check = utils.CheckFont(item);
            if (!check) {
                failCounter++;
            }
            checkedFonts += ("\n" + item + (check ? ": Installed." : ": NOT INSTALLED!"));
        });

        if (failCounter) {
            checkedFonts += "\n\nPlease install missing " + (failCounter > 1 ? "fonts" : "font") + " and restart foobar!";
            fb.ShowPopupMessage(checkedFonts, "Font Check");

            return false;
        }

        return true;
    },
    HasModdedJScript: _.once(function() {
        var ret = _.attempt(function() {
            // Methods from modded JScript
            wsh_utils.GetWndByHandle(666);
            fb.IsMainMenuCommandChecked("View/Always on Top");
        });

        return !_.isError(ret);
    }),
    PropList: function () {
        this.AddProperties = function (properties) {
            _.forEach(properties, _.bind(function (item, i) {
                if (i === "AddProperties") {
                    error_name_occupied;
                    return false;
                }
                this[i] = item;
            },this));
        };
    }
};

function numeric_ascending_sort(a, b) {
    return (a - b);
}

function Property(text_id, default_value) {
    this.get = function() {
        if (value === undefined) {
            value = window.GetProperty(this.text_id, default_value)
        }
        return value;

    };
    this.set = function(new_value) {
        window.SetProperty(this.text_id, new_value);
        value = new_value;
    };

    this.text_id = text_id;
    var value = undefined;
}
function PropertyList() {
    this.add_properties = function (properties) {
        _.forEach(properties, _.bind(function (item, i) {
            if (i === "add_properties") {
                error_name_occupied;
                return false;
            }
            var prop = new Property(item[0],item[1]);
            this[i] = prop;
        },this));
    };
}

var properties = new qwr_utils.PropList;
var properties_v2 = new PropertyList;

