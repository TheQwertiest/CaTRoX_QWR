// ==PREPROCESSOR==
// @name 'Playback Panel'
// @author 'TheQwertiest'
// ==/PREPROCESSOR==

var buttons;
var showTooltips = false;

/// Reduce move
var moveChecker = new _.moveCheckReducer;
//// Volume bar vars
var volumeBar;
var showVolumeBar = 0;
var rightBtnX = 0;

createButtonImages();

function on_paint(gr) {
    gr.FillSolidRect(0, 0, ww, wh, pssBackColor);
    gr.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);

    buttons.paint(gr);
    // VolBar
    if (showVolumeBar) {
        var p = 5;
        var x = volumeBar.x,
            y = volumeBar.y,
            w = volumeBar.w,
            h = volumeBar.h;

        var sliderBackColor = _.RGB(37, 37, 37);
        var sliderBarColor = _.RGB(190, 192, 194);
        var volframeColor = _.RGB(200, 200, 200);

        gr.DrawRect(x - 2, y + p - 2, w + 3, h - p * 2 + 3, 1.0, volframeColor);
        gr.FillSolidRect(x, y + p, w, h - p * 2, sliderBackColor);
        gr.FillSolidRect(x, y + p, volumeBar.pos(), h - p * 2, sliderBarColor);
    }
}

function on_size() {
    ww = window.Width;
    wh = window.Height;

    createButtonObjects(0, 1, ww, wh);

    if ( common_vars.minimode_state != 'Full' )
    {
        var volH = 14;
        var volY = Math.floor(wh / 2 - volH / 2) + 3;
        volumeBar = new _.volume(rightBtnX, volY, Math.min(ww - rightBtnX - 4, 60), volH);
    }
    else
    {
        volumeBar = new _.volume(0, 0, 0, 0);
    }
}

function on_mouse_move(x, y, m) {
    if (moveChecker.isSameMove(x, y, m)) {
        return;
    }

    qwr_utils.DisableSizing(m);

    if ( showVolumeBar )
    {
        if ( (volumeBar.x - 4 <= x) && (x <= volumeBar.x + volumeBar.w + 2) && (volumeBar.y - 2 <= y) && (y <= volumeBar.y + volumeBar.h + 2) || volumeBar.drag)
        {
            volumeBar.move(x, y);
        }
        else
        {
            showVolumeBar = 0;
            volumeBar.show_tt = false;
            buttons.buttons.volume.hide = false;
            buttons.refresh_vol_button();
            volumeBar.repaint();
        }
    }

    buttons.move(x, y);
}

function on_mouse_lbtn_down(x, y, m) {
    buttons.lbtn_down(x, y);
    if (showVolumeBar) {
        volumeBar.lbtn_down(x, y);
    }
}

function on_mouse_lbtn_up(x, y, m) {
    qwr_utils.EnableSizing(m);

    buttons.lbtn_up(x, y);
    if (showVolumeBar) {
        volumeBar.lbtn_up(x, y);
    }
}

function on_mouse_lbtn_dblclk(x, y, m) {
    on_mouse_lbtn_down(x, y, m);
}

function on_mouse_wheel(delta) {
    var changeVolManually = true;

    if ( common_vars.minimode_state == 'Mini' )
    {
        if (showVolumeBar && volumeBar.wheel(delta)) {
            changeVolManually = false;
        }
    }

    if (changeVolManually)
    {
        if (delta > 0) {
            fb.VolumeUp();
        }
        else {
            fb.VolumeDown();
        }
    }
}

function on_mouse_leave() {
    if ( volumeBar.drag )
    {
        return;
    }

    if (showVolumeBar) {
        showVolumeBar = 0;
        buttons.buttons.volume.hide = false;
        volumeBar.repaint();
    }

    buttons.leave();
}

function on_volume_change(val) {
    if (common_vars.minimode_state != 'Full') {
        buttons.refresh_vol_button();

        if (showVolumeBar) {
            volumeBar.volume_change();
        }
    }
}

function on_playback_stop(reason) {
    if (reason != 2) {
        buttons.refresh_play_button();
    }
}

function on_playback_pause(state) {
    buttons.refresh_play_button();
}

function on_playback_starting(cmd, is_paused) {
    buttons.refresh_play_button();
}

function createButtonObjects(wx, wy, ww, wh) {
    if (buttons) {
        buttons.reset();
    }

    buttons = new _.buttons();
    buttons.show_tt = showTooltips;

    var w = btnImg.Next.normal.Width;
    var h = w;
    var p = 2;

    var y = wy + Math.floor((wh - w) / 2);
    var x;

    if (common_vars.minimode_state != 'Full') {
        x = wx + Math.floor((ww - (w * 5 + p * 4)) / 2);
    }
    else
    {
        x = wx + 5;
    }

    buttons.buttons.stop = new _.button(x, y, w, h, btnImg.Stop, function () { fb.Stop(); }, 'Stop');
    x += w + p;

    buttons.buttons.previous = new _.button(x, y, w, h, btnImg.Previous, function () { fb.Prev(); }, 'Previous');
    x += w + p;

    buttons.buttons.play = new _.button(x, y, w, h, !fb.IsPlaying || fb.IsPaused ? btnImg.Play : btnImg.Pause, function () { fb.PlayOrPause(); }, !fb.IsPlaying || fb.IsPaused ? 'Play' : 'Pause');
    x += w + p;

    buttons.buttons.next = new _.button(x, y, w, h, btnImg.Next, function () { fb.Next(); }, 'Next');
    x += w + p;

    if (common_vars.minimode_state != 'Full') {
        w = btnImg.VolLoud.normal.Width;
        h = btnImg.VolLoud.normal.Height;
        y = wy + Math.floor((wh - w) / 2);
        var volValue = _.toVolume(fb.Volume);
        var volImage = ((volValue > 50) ? btnImg.VolLoud : ((volValue > 0) ? btnImg.VolQuiet : btnImg.VolMute));
        buttons.buttons.mute = new _.button(x, y + 1, w, h, volImage, function () { fb.VolumeMute(); }, volValue == 0 ? 'Unmute' : 'Mute');
        x += w - 5;

        w = btnImg.ShowVolume.normal.Width;
        h = btnImg.ShowVolume.normal.Height;
        y = wy + Math.floor(wh / 2 - w / 2);
        buttons.buttons.volume = new _.button(x, y + 1, btnImg.ShowVolume.normal.Width, h, btnImg.ShowVolume, function () {
            showVolumeBar = 1;
            buttons.leave(); // for state reset
            buttons.buttons.volume.hide = true;
            volumeBar.show_tt = showTooltips;
            volumeBar.repaint();
        }, 'Volume');

        rightBtnX = x + 6;

        buttons.refresh_vol_button = function () {
            var volValue = _.toVolume(fb.Volume);
            var volImage = ((volValue > 50) ? btnImg.VolLoud : ((volValue > 0) ? btnImg.VolQuiet : btnImg.VolMute));
            buttons.buttons.mute.set_image(volImage);
            buttons.buttons.mute.tiptext = volValue == 0 ? 'Unmute' : 'Mute';
            buttons.buttons.mute.repaint();
        };
    }

    buttons.refresh_play_button = function () {
        buttons.buttons.play.set_image(!fb.IsPlaying || fb.IsPaused ? btnImg.Play : btnImg.Pause);
        buttons.buttons.play.tiptext = !fb.IsPlaying || fb.IsPaused ? 'Play' : 'Pause';
        buttons.buttons.play.repaint();
    }
}

function createButtonImages() {
    var fontGuifx = gdi.font(g_guifx.name, 16);
    var fontAwesome = gdi.font('FontAwesome', 14);
    var c = [250, 250, 250];

    var btn =
    {
        Stop: {
            ico: g_guifx.stop,
            font: fontGuifx,
            id: 'playback',
            w: 30,
            h: 30,
            cNormal: _.RGBA(c[0], c[1], c[2], 35),
            cHover: _.RGBA(c[0], c[1], c[2], 155)
        },
        Previous: {
            ico: g_guifx.previous,
            font: fontGuifx,
            id: 'playback',
            w: 30,
            h: 30,
            cNormal: _.RGBA(c[0], c[1], c[2], 35),
            cHover: _.RGBA(c[0], c[1], c[2], 155)
        },
        Play: {
            ico: g_guifx.play,
            font: fontGuifx,
            id: 'playback',
            w: 30,
            h: 30,
            cNormal: _.RGBA(c[0], c[1], c[2], 35),
            cHover: _.RGBA(c[0], c[1], c[2], 155)
        },
        Pause: {
            ico: g_guifx.pause,
            font: fontGuifx,
            id: 'playback',
            w: 30,
            h: 30,
            cNormal: _.RGBA(c[0], c[1], c[2], 35),
            cHover: _.RGBA(c[0], c[1], c[2], 155)
        },
        Next: {
            ico: g_guifx.next,
            font: fontGuifx,
            id: 'playback',
            w: 30,
            h: 30,
            cNormal: _.RGBA(c[0], c[1], c[2], 35),
            cHover: _.RGBA(c[0], c[1], c[2], 155)
        },
        PlaybackRandom: {
            ico: g_guifx.slow_forward,
            font: fontGuifx,
            id: 'playback',
            w: 30,
            h: 30,
            cNormal: _.RGBA(c[0], c[1], c[2], 35),
            cHover: _.RGBA(c[0], c[1], c[2], 155)
        },
        VolLoud: {
            ico: g_guifx.volume_up,
            font: fontGuifx,
            id: 'playback',
            w: 26,
            h: 26,
            cNormal: _.RGBA(c[0], c[1], c[2], 35),
            cHover: _.RGBA(c[0], c[1], c[2], 155)
        },
        VolQuiet: {
            ico: g_guifx.volume_down,
            font: fontGuifx,
            id: 'playback',
            w: 26,
            h: 26,
            cNormal: _.RGBA(c[0], c[1], c[2], 35),
            cHover: _.RGBA(c[0], c[1], c[2], 155)
        },
        VolMute: {
            ico: g_guifx.mute,
            font: fontGuifx,
            id: 'playback',
            w: 26,
            h: 26,
            cNormal: _.RGBA(c[0], c[1], c[2], 35),
            cHover: _.RGBA(c[0], c[1], c[2], 155)
        },
        ShowVolume: {
            ico: '\uF0d7',
            font: fontAwesome,
            id: 'playback',
            w: 15,
            h: 20,
            cNormal: _.RGBA(c[0], c[1], c[2], 35),
            cHover: _.RGBA(c[0], c[1], c[2], 155)
        }
    };

    btnImg = [];

    _.forEach(btn, function(item,i)
    {
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

            var playbackIcoColor = _.RGB(110, 112, 114);

            if (s === 1) {
                playbackIcoColor = _.RGB(190, 192, 194);
            }
            else if (s === 2) {
                playbackIcoColor = _.RGB(90, 90, 90);
            }

            g.DrawString(item.ico, item.font, playbackIcoColor, (i === 'Stop') ? 0 : 1, 0, w, h, g_string_format.align_center);

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

// =================================================== //

function on_mouse_rbtn_up(x, y) {
    var cpm = window.CreatePopupMenu();

    if (utils.IsKeyPressed(VK_SHIFT)) {
        _.appendDefaultContextMenu(cpm);
    }

    var id = cpm.TrackPopupMenu(x, y);

    switch (id) {
        default:
            _.executeDefaultContextMenu(id, scriptFolder + 'Panel_Playback.js');
    }

    _.dispose(cpm);

    return true;
}

function on_notify_data(name, info) {
    switch (name) {
        case 'minimode_state': {
            common_vars.minimode_state = info;

            // Need additional repaint to avoid repaint glitching
            // (i.e. when changing mode, you could see panel from previous minimode state)
            on_size();
            window.Repaint();
            break;
        }
        case 'minimode_state_size': {
            on_size();
            window.Repaint();
            break;
        }
        case 'show_tooltips': {
            showTooltips = info;
            buttons.show_tt = showTooltips;
            break;
        }
    }
}