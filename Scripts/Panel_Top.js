// ==PREPROCESSOR==
// @name 'Top Panel'
// @author 'TheQwertiest'
// ==/PREPROCESSOR==

g_properties.add_properties(
    {
        show_logo:        ['user.fb2k_logo.show', false],
        show_btn_ellipse: ['user.buttons.eclipse.show_always', false]
    }
);

var g_has_modded_jscript = qwr_utils.has_modded_jscript();
var g_component_scrobble = _.cc('foo_scrobble');

var isYoutubeVideoDisplayed = g_has_modded_jscript ? fb.IsMainMenuCommandChecked('View/Visualizations/Video') : false;
var isScrobblingEnabled = (g_has_modded_jscript && g_component_scrobble) ? fb.IsMainMenuCommandChecked('Playback/Scrobble Tracks') : false;

var buttons;
var btnImg = [];
var rightMargin = 0;
var showTooltips = false;

/// Reduce move
var moveChecker = new _.moveCheckReducer;

create_button_images();

function on_paint(gr) {
    var metadb = (fb.IsPlaying ? fb.GetNowPlaying() : fb.GetFocusItem());

    gr.FillSolidRect(0, 0, ww, wh, pssBackColor);
    gr.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);

    // Logo
    if (g_properties.show_logo) {
        var logoX = 10,
            logoW = 16,
            logoY = Math.floor((wh - logoW) / 2);

        var fooLogo = gdi.Image(fb.FoobarPath + 'themes\\' + g_theme_folder + '\\Images\\fooLogo.png');
        gr.SetInterpolationMode(InterpolationMode.HighQualityBicubic);
        gr.DrawImage(fooLogo, logoX, logoY, logoW, logoW, 0, 0, fooLogo.Width, fooLogo.Height, 0, 225);
    }

    // Info
    if (metadb) {
        var fields = "[%tracknumber%. ][%title%] ['('%length%')'][  \u25AA  $if($greater($len(%artist%),1),%artist%,%album artist%)][  \u25AA  %album%]";

        var textMargin = 10;
        var text = (fb.IsPlaying ? _.tfe(fields) : _.tf(fields, metadb)),
            x = ( g_properties.show_logo ? logoX + logoW + textMargin : 15),
            y = 0,
            w = ww - x - textMargin - rightMargin,
            h = wh,
            stringFormat = g_string_format.v_align_center | g_string_format.trim_ellipsis_char | g_string_format.no_wrap;

        var displayFont = gdi.font('Segoe Ui Semibold', 14);
        gr.DrawString(text, displayFont, _.RGB(170, 172, 174), x, y, w, h, stringFormat);
    }

    buttons.paint(gr);
}

function on_size() {
    ww = window.Width;
    wh = window.Height;

    createButtonObjects(ww, wh);
}

function on_mouse_move(x, y, m) {
    if (moveChecker.isSameMove(x, y, m)) {
        return;
    }

    qwr_utils.DisableSizing(m);

    buttons.move(x, y);
}

function on_mouse_lbtn_down(x, y, m) {
    buttons.lbtn_down(x, y);
}

function on_mouse_lbtn_up(x, y, m) {
    qwr_utils.EnableSizing(m);

    buttons.lbtn_up(x, y);
}

function on_mouse_leave() {
    buttons.leave();
}

function on_playback_stop(reason) {
    window.Repaint();
}

function on_playback_new_track() {
    // For youtube btns refresh
    on_size();
    window.Repaint();
}

function on_notify_data(name, info) {
    switch (name) {
        case 'show_tooltips': {
            showTooltips = info;
            buttons.show_tt = showTooltips;
            break;
        }
    }
}

function createButtonObjects(ww, wh) {
    if (buttons)
        buttons.reset();

    buttons = new _.buttons();
    buttons.show_tt = showTooltips;

    var metadb = (fb.IsPlaying ? fb.GetNowPlaying() : fb.GetFocusItem());
    var isYoutube = false;
    if (metadb) {
        var path = _.tf('%path%', metadb);
        isYoutube = _.startsWith(path, 'youtube.com') || _.startsWith(path, 'www.youtube.com');
    }

    var buttonCount = 1;

    if (isYoutube) {
        ++buttonCount;
    }

    if (g_component_scrobble) {
        ++buttonCount;
    }

    var y = 5;
    var w = 32;
    var h = w;
    var p = 5;
    var x = ww - w * buttonCount - p * (buttonCount - 1) - 10;
    rightMargin = ww - x - 5;


    if (g_component_scrobble) {
        buttons.buttons.scrobble = new _.button(x, y, w, h, isScrobblingEnabled ? btnImg.LastFM_Disable : btnImg.LastFM_Enable, function () {
            fb.RunMainMenuCommand('Playback/Scrobble Tracks');
            isScrobblingEnabled = g_has_modded_jscript ? fb.IsMainMenuCommandChecked('Playback/Scrobble Tracks') : false;
            buttons.buttons.scrobble.set_image(isScrobblingEnabled ? btnImg.LastFM_Disable : btnImg.LastFM_Enable);
            buttons.buttons.scrobble.tiptext = isScrobblingEnabled ? 'Disable Last.FM Scrobbling' : 'Enable Last.FM Scrobbling';
            buttons.buttons.scrobble.repaint();
        }, isScrobblingEnabled ? 'Disable Last.FM Scrobbling' : 'Enable Last.FM Scrobbling');
        x += w + p;
    }

    buttons.buttons.search_yt = new _.button(x, y, w, h, btnImg.SearchYT, function () { fb.RunMainMenuCommand('View/Youtube Search'); }, 'Search Youtube');
    x += w + p;

    if (isYoutube) {
        buttons.buttons.yt_video = new _.button(x, y, w, h, isYoutubeVideoDisplayed ? btnImg.VideoHide : btnImg.VideoShow, function () {
            fb.RunMainMenuCommand('View/Visualizations/Video');
            isYoutubeVideoDisplayed = g_has_modded_jscript ? fb.IsMainMenuCommandChecked('View/Visualizations/Video') : false;
            buttons.buttons.yt_video.set_image(isYoutubeVideoDisplayed ? btnImg.VideoHide : btnImg.VideoShow);
            buttons.buttons.yt_video.tiptext = isYoutubeVideoDisplayed ? 'Hide Youtube Video' : 'Show Youtube Video';
            buttons.buttons.yt_video.repaint();
        }, isYoutubeVideoDisplayed ? 'Hide Youtube Video' : 'Show Youtube Video');
    }
}

function create_button_images() {
    var font_guifx = gdi.font(g_guifx.name, 16);
    var font_awesome = gdi.font('FontAwesome', 16);

    var btn = {
        SearchYT:
            {
                ico:  g_guifx.zoom,
                font: font_guifx,
                w:    30,
                h:    30
            },
        VideoShow:
            {
                ico:  g_guifx.right3,
                font: font_guifx,
                w:    30,
                h:    30
            },
        VideoHide:
            {
                ico:     g_guifx.right3,
                font:    font_guifx,
                w:       30,
                h:       30,
                cNormal: _.RGBA(255, 220, 55, 155),
                cHover:  _.RGBA(255, 220, 55, 225),
                cDown:   _.RGBA(255, 220, 55, 105)
            },
        LastFM_Disable:
            {
                ico:  '\uF202',
                font: font_awesome,
                w:    30,
                h:    30
            },
        LastFM_Enable:
            {
                ico:       '\uF202',
                font:      font_awesome,
                w:         30,
                h:         30,
                cNormal:   _.RGB(165, 144, 43), // _.RGBA(255, 220, 55, 155) + pssBackColor
                cHover:    _.RGB(228, 197, 52), // _.RGBA(255, 220, 55, 225) + pssBackColor
                cDown:     _.RGB(120, 106, 38), // _.RGBA(255, 220, 55, 105) + pssBackColor
                add_cross: true
            }
    };

    btnImg = [];

    _.forEach(btn, function (item, i) {
        var w = item.w,
            h = item.h,
            lw = 2;

        var stateImages = []; //0=normal, 1=hover, 2=down;

        for (var s = 0; s <= 2; s++) {
            var img = gdi.CreateImage(w, h);
            g = img.GetGraphics();
            g.SetSmoothingMode(SmoothingMode.HighQuality);
            g.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);
            g.FillSolidRect(0, 0, w, h, pssBackColor); // Cleartype is borked, if drawn without background

            var playbackIcoColor;
            var playbackEllipseColor;

            switch (s) {
                case 1:
                    playbackIcoColor = _.isNil(item.cHover) ? _.RGB(190, 192, 194) : item.cHover;
                    playbackEllipseColor = _.RGB(190, 195, 200);
                    break;
                case 2:
                    playbackIcoColor = _.isNil(item.cDown) ? _.RGB(90, 90, 90) : item.cDown;
                    playbackEllipseColor = _.RGB(80, 80, 80);
                    break;
                default:
                    playbackIcoColor = _.isNil(item.cNormal) ? _.RGB(150, 152, 154) : item.cNormal;
                    playbackEllipseColor = _.RGBA(70, 70, 70, (g_properties.show_btn_ellipse ? 255 : 0));
                    break;
            }

            g.DrawEllipse(Math.floor(lw / 2) + 1, Math.floor(lw / 2) + 1, w - lw - 2, h - lw - 2, lw, playbackEllipseColor);

            g.DrawString(item.ico, item.font, playbackIcoColor, 1, 0, w, h, g_string_format.align_center);
            if (item.add_cross) {
                var slash_font = gdi.font('Arial', 22, g_font_style.bold);
                g.DrawString('\u2215', slash_font, playbackIcoColor, 1, 1, w, h, g_string_format.align_center);
                g.DrawString('\u2215', slash_font, pssBackColor, 3, 1, w, h, g_string_format.align_center);
            }

            img.ReleaseGraphics(g);
            stateImages[s] = img;
        }

        btnImg[i] =
            {
                normal:  stateImages[0],
                hover:   stateImages[1],
                pressed: stateImages[2]
            };
    });
}

function on_mouse_rbtn_up(x, y) {
    var cpm = window.CreatePopupMenu();

    cpm.AppendMenuItem(MF_STRING, 8, 'Show foobar2000 logo');
    cpm.CheckMenuItem(8, g_properties.show_logo);
    cpm.AppendMenuItem(MF_STRING, 12, g_properties.show_btn_ellipse ? 'Hide button ellipse' : 'Show button ellipse');

    if (utils.IsKeyPressed(VK_SHIFT)) {
        cpm.AppendMenuSeparator();
        _.appendDefaultContextMenu(cpm);
    }

    var id = cpm.TrackPopupMenu(x, y);

    switch (id) {
        case 8:
            g_properties.show_logo = !g_properties.show_logo;
            window.Repaint();
            break;
        case 12:
            g_properties.show_btn_ellipse = !g_properties.show_btn_ellipse;
            create_button_images();
            on_size();
            window.Repaint();
            break;
        default:
            _.executeDefaultContextMenu(id, scriptFolder + 'Panel_Top.js');
    }

    _.dispose(cpm);

    return true;
}
