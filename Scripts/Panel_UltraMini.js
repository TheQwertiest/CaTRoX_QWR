// ==PREPROCESSOR==
// @name "UltraMini Main Panel"
// @author "TheQwertiest"
// ==/PREPROCESSOR==
g_properties.add_properties(
    {
        art_pad: ["user.art.pad", 0]
    }
);

var panel_s =
    {
        // Common
        showTooltips: false,
        // Control
        mouseInPanel: false,
        showVolumeBar: 0,
        // Animation
        playbackPanelAlpha: 255,
        curTitleType: 0
    };

// Tunable const vars
var seekbarH = 8;
var volumebarH = 14;
var playbackH = 30;

// Internal vars
var seekbar;
var buttons;
var volumeBar;
var rightBtnX = 0;

var ww = 0,
    wh = 0;

var artModule = new ArtModule();

/// Reduce move
var moveChecker = new _.moveCheckReducer;

createButtonImages();

function on_paint(gr) {
    gr.FillSolidRect(0, 0, ww, wh, panelsBackColor);
    gr.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);

    // Art
    if (fb.IsPlaying || fb.IsPaused) {
        artModule.paint(gr);
    }
    else {
        gr.DrawString(g_theme_name + " " + g_theme_version, gdi.font("Segoe Ui Semibold", 24, 0), _.RGB(70, 70, 70), 0, 0, ww, wh, g_string_format.align_center);
    }

    // Title
    gr.FillGradRect(0, -1, ww, 40, 270, _.RGBA(0, 0, 0, 0), _.RGBA(0, 0, 0, 255));
    gr.FillGradRect(0, -1, ww, 40, 270, _.RGBA(0, 0, 0, 0), _.RGBA(0, 0, 0, 255));

    if (fb.IsPlaying) {
        var title;
        if (panel_s.curTitleType === 0) {
            title = "[%title%]";
        }
        else if (panel_s.curTitleType === 1) {
            title = "[%artist%]";
        }
        else {
            title = "[%album%]";
        }

        var title_text = fb.TitleFormat(title).Eval();
        var title_text_format = g_string_format.trim_ellipsis_char | g_string_format.no_wrap;
        gr.DrawString(title_text, gdi.font("Segoe Ui Semibold", 12, 0), _.RGB(240, 240, 240), 5, 5, ww, wh, title_text_format);
    }

    if (panel_s.playbackPanelAlpha !== 0) {
        // Controls
        gr.FillGradRect(0, wh - playbackH - seekbarH, ww, playbackH + seekbarH + 1, 90, _.RGBA(0, 0, 0, 0), _.RGBA(0, 0, 0, panel_s.playbackPanelAlpha));

        // SeekBar
        var p = 2;
        var x = seekbar.x,
            y = seekbar.y,
            w = seekbar.w,
            h = seekbar.h;

        var sliderBackColor = _.RGBA(37, 37, 37, panel_s.playbackPanelAlpha);
        var sliderBarColor = _.RGBA(190, 192, 194, panel_s.playbackPanelAlpha);
        var sliderBarHoverColor = _.RGBA(231, 233, 235, Math.min(panel_s.playbackPanelAlpha, seekbar.hover_alpha));
        gr.FillSolidRect(x, y + p, w, h - p * 2, sliderBackColor);
        if (fb.IsPlaying && fb.PlaybackLength > 0) {
            gr.FillSolidRect(x, y + p, seekbar.pos(), h - p * 2, sliderBarColor);
            gr.FillSolidRect(x, y + p, seekbar.pos(), h - p * 2, sliderBarHoverColor);
            gr.FillSolidRect(x + seekbar.pos() - 2, y + p - 1, 4, h - p * 2 + 2, _.RGBA(255, 255, 255, panel_s.playbackPanelAlpha));
        }

        // VolBar
        if (panel_s.showVolumeBar) {
            var p = 3;
            var x = volumeBar.x,
                y = volumeBar.y,
                w = volumeBar.w,
                h = volumeBar.h;

            var volFrameColor = _.RGBA(255, 255, 255, panel_s.playbackPanelAlpha);
            gr.DrawRect(x - 2, y + p - 2, w + 3, h - p * 2 + 3, 1.0, volFrameColor);
            gr.FillSolidRect(x, y + p, w, h - p * 2, sliderBackColor);
            gr.FillSolidRect(x, y + p, volumeBar.pos(), h - p * 2, sliderBarColor);
        }

        buttons.paint(gr, panel_s.playbackPanelAlpha);
    }
}

function on_size() {
    ww = window.Width;
    wh = window.Height;

    var playbackY = wh - playbackH;
    create_buttons(0, playbackY, ww, playbackH);

    var seekbarY = playbackY - seekbarH + Math.floor(seekbarH / 2);
    seekbar = new _.seekbar(5, seekbarY, ww - 10, seekbarH);
    seekbar.show_tt = panel_s.showTooltips;

    var volumebarY = playbackY + Math.floor(playbackH / 2 - volumebarH / 2) + 2;
    volumeBar = new _.volume(rightBtnX, volumebarY, Math.min(ww - rightBtnX - 4, 60), volumebarH);

    artModule.on_size(g_properties.art_pad, g_properties.art_pad, ww - 2 * g_properties.art_pad, wh - 2 * g_properties.art_pad);
    artModule.getAlbumArt();
}

function on_get_album_art_done(metadb, art_id, image, image_path) {
    artModule.get_album_art_done(metadb, art_id, image, image_path);
}

function on_playlist_switch() {
    artModule.playlist_switch();
}

function on_playlist_items_selection_change() {
    artModule.playlist_items_selection_change();
}

function on_item_focus_change() {
    artModule.item_focus_change();
}

function on_playback_starting(cmd, is_paused) {
    seekbar.playback_start();
    buttons.refresh_play_button();
}

function on_playback_new_track(metadb) {
    onTitleTimer(true);
    artModule.playback_new_track();
}

function on_playback_pause(isPlaying) {
    onTitleTimer();
    seekbar.playback_pause(isPlaying);
    buttons.refresh_play_button();
}

function on_playback_dynamic_info_track() {
    window.Repaint();
}

function on_playback_stop(reason) {
    if (reason !== 2) {
        onTitleTimer();
    }

    artModule.playback_stop();
    seekbar.playback_stop();
    buttons.refresh_play_button();
}

function on_playback_seek() {
    seekbar.playback_seek();
}

function on_mouse_move(x, y, m) {
    if (moveChecker.isSameMove(x, y, m)) {
        return;
    }

    qwr_utils.DisableSizing(m);

    if (volumeBar.drag) {
        volumeBar.move(x, y);
        return;
    }

    if (seekbar.drag) {
        seekbar.move(x, y);
        return;
    }

    if (!panel_s.mouseInPanel) {
        panel_s.mouseInPanel = true;
        animator.runAnimation("fade_in");
    }

    if (panel_s.showVolumeBar) {
        if ((volumeBar.x - 4 <= x) && (x <= volumeBar.x + volumeBar.w + 2) && (volumeBar.y - 2 <= y) && (y <= volumeBar.y + volumeBar.h + 2)) {
            volumeBar.move(x, y);
        }
        else {
            panel_s.showVolumeBar = 0;
            volumeBar.show_tt = false;
            buttons.buttons.mute.hide = false;
            buttons.buttons.volume.hide = false;
            buttons.refresh_vol_button();
            volumeBar.repaint();
        }
    }
    seekbar.move(x, y);
    buttons.move(x, y);
}

function on_mouse_lbtn_down(x, y, m) {
    buttons.lbtn_down(x, y);
    seekbar.lbtn_down(x, y);
    if (panel_s.showVolumeBar) {
        volumeBar.lbtn_down(x, y);
    }
}

function on_mouse_lbtn_up(x, y, m) {
    qwr_utils.EnableSizing(m);

    buttons.lbtn_up(x, y);
    seekbar.lbtn_up(x, y);
    if (panel_s.showVolumeBar) {
        volumeBar.lbtn_up(x, y);
    }
}

function on_mouse_wheel(delta) {
    if (panel_s.mouseInPanel) {
        if (!panel_s.showVolumeBar || !volumeBar.wheel(delta)) {
            if (delta > 0) {
                fb.VolumeUp();
            }
            else {
                fb.VolumeDown();
            }
        }
    }
}

function on_mouse_leave() {
    if (volumeBar.drag || seekbar.drag) {
        return;
    }

    if (panel_s.mouseInPanel) {
        panel_s.mouseInPanel = false;
        animator.runAnimation("fade_out");
    }

    if (panel_s.showVolumeBar) {
        panel_s.showVolumeBar = 0;
        buttons.buttons.mute.hide = false;
        buttons.buttons.volume.hide = false;
        volumeBar.repaint();
    }

    buttons.leave();
}

function on_volume_change(val) {
    if (!panel_s.showVolumeBar) {
        buttons.refresh_vol_button();
    }
    else {
        volumeBar.volume_change();
    }
}

function on_key_down(vkey) {
    if (vkey === VK_F5) {
        artModule.reloadArt();
    }
}

function on_mouse_rbtn_up(x, y) {
    var cpm = window.CreatePopupMenu();

    cpm.AppendMenuItem(MF_STRING, 36, "Reload \tF5");

    if (utils.IsKeyPressed(VK_SHIFT)) {
        _.appendDefaultContextMenu(cpm);
    }

    var id = cpm.TrackPopupMenu(x, y);

    switch (id) {
        case 36:
            artModule.reloadArt();
            break;
        default:
            _.executeDefaultContextMenu(id, scriptFolder + "Panel_UltraMini.js");
    }

    _.dispose(cpm);

    return true;
}

function on_notify_data(name, info) {
    switch (name) {
        case "show_tooltips": {
            panel_s.showTooltips = info;
            seekbar.show_tt = info;
            volumeBar.show_tt = info;
            buttons.show_tt = info;
            break;
        }
    }
}

function create_buttons(wx, wy, ww, wh) {
    if (buttons) {
        buttons.reset();
    }

    buttons = new _.buttons;
    buttons.show_tt = panel_s.showTooltips;

    //---> Playback buttons
    var w = btnImg.Next.normal.Width;
    var h = w;
    var p = 4;

    var x = wx + Math.floor(ww / 2 - (w * 5 + p * 4) / 2);
    var y = wy + Math.floor(wh / 2 - w / 2) + 1;

    buttons.buttons.stop = new _.button(x, y, w, h, btnImg.Stop, function () { 
        fb.Stop();
        // Needs repaint to avoid partial art redraw
        window.Repaint();
    }, "Stop");

    x += w + p;
    buttons.buttons.previous = new _.button(x, y, w, h, btnImg.Previous, function () { fb.Prev(); }, "Previous");

    x += w + p;
    buttons.buttons.play = new _.button(x, y, w, h, (!fb.IsPlaying || fb.IsPaused) ? btnImg.Play : btnImg.Pause, function () {
    var wasNotPlaying = !fb.IsPlaying;
    fb.PlayOrPause(); 
    // Needs repaint to avoid partial art redraw
    if (wasNotPlaying)
        window.Repaint();
    }, (!fb.IsPlaying || fb.IsPaused) ? "Play" : "Pause");

    x += w + p;
    buttons.buttons.next = new _.button(x, y, w, h, btnImg.Next, function () { fb.Next(); }, "Next");

    x += w + p;
    rightBtnX = x + 3;

    var volValue = _.toVolume(fb.Volume);
    var volImage = ((volValue > 50) ? btnImg.VolLoud : ((volValue > 0) ? btnImg.VolQuiet : btnImg.VolMute));
    buttons.buttons.mute = new _.button(x, y, w, h, volImage, function () { fb.VolumeMute(); }, volValue === 0 ? "Unmute" : "Mute");

    x += w - 5;
    buttons.buttons.volume = new _.button(x, y + 2, btnImg.ShowVolume.normal.Width, h, btnImg.ShowVolume, function () {
        panel_s.showVolumeBar = 1;
        buttons.leave(); // for state reset
        buttons.buttons.mute.hide = true;
        buttons.buttons.volume.hide = true;
        volumeBar.show_tt = panel_s.showTooltips;
        volumeBar.repaint();
    }, "Volume");

    buttons.refresh_play_button = function () {
        buttons.buttons.play.set_image((!fb.IsPlaying || fb.IsPaused) ? btnImg.Play : btnImg.Pause);
        buttons.buttons.play.tiptext = (!fb.IsPlaying || fb.IsPaused) ? "Play" : "Pause";
        buttons.buttons.play.repaint();
    };

    buttons.refresh_vol_button = function () {
        var volValue = _.toVolume(fb.Volume);
        var volImage = (volValue > 50) ? btnImg.VolLoud : ((volValue > 0) ? btnImg.VolQuiet : btnImg.VolMute);
        buttons.buttons.mute.set_image(volImage);
        buttons.buttons.mute.tiptext = volValue === 0 ? "Unmute" : "Mute";
        buttons.buttons.mute.repaint();
    };
}

function createButtonImages() {
    var fontGuifx = gdi.font("Guifx v2 Transports", 16, 0);
    var fontAwesome = gdi.font("FontAwesome", 14, 0);
    var c = [250, 250, 250];

    var btn =
        {
            Stop: {
                ico: Guifx.Stop,
                font: fontGuifx,
                id: "playback",
                w: 26,
                h: 26,
                cNormal: _.RGBA(c[0], c[1], c[2], 35),
                cHover: _.RGBA(c[0], c[1], c[2], 155)
            },
            Previous: {
                ico: Guifx.Previous,
                font: fontGuifx,
                id: "playback",
                w: 26,
                h: 26,
                cNormal: _.RGBA(c[0], c[1], c[2], 35),
                cHover: _.RGBA(c[0], c[1], c[2], 155)
            },
            Play: {
                ico: Guifx.Play,
                font: fontGuifx,
                id: "playback",
                w: 26,
                h: 26,
                cNormal: _.RGBA(c[0], c[1], c[2], 35),
                cHover: _.RGBA(c[0], c[1], c[2], 155)
            },
            Pause: {
                ico: Guifx.Pause,
                font: fontGuifx,
                id: "playback",
                w: 26,
                h: 26,
                cNormal: _.RGBA(c[0], c[1], c[2], 35),
                cHover: _.RGBA(c[0], c[1], c[2], 155)
            },
            Next: {
                ico: Guifx.Next,
                font: fontGuifx,
                id: "playback",
                w: 26,
                h: 26,
                cNormal: _.RGBA(c[0], c[1], c[2], 35),
                cHover: _.RGBA(c[0], c[1], c[2], 155)
            },
            VolLoud: {
                ico: Guifx.VolumeUp,
                font: gdi.font("Guifx v2 Transports", 15, 0),
                id: "playback",
                w: 26,
                h: 26,
                cNormal: _.RGBA(c[0], c[1], c[2], 35),
                cHover: _.RGBA(c[0], c[1], c[2], 155)
            },
            VolQuiet: {
                ico: Guifx.VolumeDown,
                font: gdi.font("Guifx v2 Transports", 15, 0),
                id: "playback",
                w: 26,
                h: 26,
                cNormal: _.RGBA(c[0], c[1], c[2], 35),
                cHover: _.RGBA(c[0], c[1], c[2], 155)
            },
            VolMute: {
                ico: Guifx.Mute,
                font: gdi.font("Guifx v2 Transports", 15, 0),
                id: "playback",
                w: 26,
                h: 26,
                cNormal: _.RGBA(c[0], c[1], c[2], 35),
                cHover: _.RGBA(c[0], c[1], c[2], 155)
            },
            ShowVolume: {
                ico: "\uF0d7",
                font: fontAwesome,
                id: "playback",
                w: 15,
                h: 20,
                cNormal: _.RGBA(c[0], c[1], c[2], 35),
                cHover: _.RGBA(c[0], c[1], c[2], 155)
            }
        };

    btnImg = [];

    _.forEach(btn, function (item, i) {
        var w = item.w,
            h = item.h;

        var stateImages = []; //0=normal, 1=hover, 2=down;

        for (var s = 0; s <= 2; s++) {
            var img = gdi.CreateImage(w, h);
            var g = img.GetGraphics();
            g.SetSmoothingMode(SmoothingMode.HighQuality);
            g.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);

            var playbackIcoColor = _.RGB(190, 192, 194);

            if (s === 1) {
                playbackIcoColor = _.RGB(251, 253, 255);
            }
            else if (s === 2) {
                playbackIcoColor = _.RGB(90, 90, 90);
            }

            //---> 
            g.DrawString(item.ico, item.font, playbackIcoColor, (i === "Stop") ? 0 : 1, 0, w, h, g_string_format.align_center);
            //--->     

            img.ReleaseGraphics(g);
            stateImages[s] = img;
        }

        btnImg[i] =
            {
                normal: stateImages[0],
                hover: stateImages[1],
                pressed: stateImages[2]
            };
    });
}

var animator = new function () {
    this.runAnimation = function (animation_name) {
        if (animation_name === "fade_out") {
            // Not stopping fade_in, because it looks borked, when stopped in the middle.
            stop_fade_out_delay();

            delayFadeOutTimer = _.delay(function(){
                stop_fade_out_delay();
                fade_out();
            }, 1000);
        }
        else if (animation_name === "fade_in") {
            stop_fade_out();
            stop_fade_out_delay();
            
            fade_in();
        }
        else {
            throw Error('Argument error:\nUnknown animation: ' + animation_name);
        }
    };

// private:
    function stop_fade_out_delay(){
        if ( delayFadeOutTimer ) {
            clearTimeout(delayFadeOutTimer);
            delayFadeOutTimer = null;
        }
    }

    function stop_fade_out(){
        if ( fadeOutTimer ) {
            clearInterval(fadeOutTimer);
            fadeOutTimer = null;
        }
    }

    function stop_fade_in(){
        if ( fadeInTimer ) {
            clearInterval(fadeInTimer);
            fadeInTimer = null;
        }
    }

    function fade_out() {
        var hoverOutStep = 15;

        if (panel_s.mouseInPanel) {
            stop_fade_out();
            return;
        }

        if (!fadeOutTimer && panel_s.playbackPanelAlpha !== 0) {
            fadeOutTimer = setInterval(function () {
                if ( delayFadeOutTimer ) {
                    return;
                }

                panel_s.playbackPanelAlpha = Math.max(0, panel_s.playbackPanelAlpha - hoverOutStep);
                window.Repaint();

                var alphaIsZero = (panel_s.playbackPanelAlpha === 0);
                if (alphaIsZero) {
                    stop_fade_out();
                }
            }, timerRate);
        }
    }

    function fade_in() {
        var hoverInStep = 60;

        if (!panel_s.mouseInPanel) {
            stop_fade_in();
            return;
        }

        if (!fadeInTimer && panel_s.playbackPanelAlpha !== 255) {
            fadeInTimer = setInterval(function () {
                panel_s.playbackPanelAlpha = Math.min(255, panel_s.playbackPanelAlpha += hoverInStep);
                window.Repaint();

                var alphaIsFull = (panel_s.playbackPanelAlpha === 255);
                if (alphaIsFull) {
                    stop_fade_in();
                }
            }, timerRate);
        }
    }

// private:
    var delayFadeOutTimer = null;
    var fadeOutTimer = null;
    var fadeInTimer = null;

    var timerRate = 25;
};

var title_timer = null;
function onTitleTimer(refreshTitle) {
    if (title_timer && (!fb.IsPlaying || fb.IsPaused || refreshTitle === true)) {
        stop_title_timer();

        if (refreshTitle) {
            panel_s.curTitleType = 0;
        }
    }
    if (fb.IsPlaying && !fb.IsPaused && !title_timer) {
        window.Repaint();

        title_timer = setInterval(function () {
            panel_s.curTitleType++;
            if (panel_s.curTitleType > 2) {
                panel_s.curTitleType = 0;
            }
            window.Repaint();
        }, 6000);
    }
}

function stop_title_timer(){
    if ( title_timer ) {
        clearInterval(title_timer);
        title_timer = null;
    }
}
