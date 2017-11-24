// ==PREPROCESSOR==
// @name 'Seekbar Panel'
// @author 'TheQwertiest'
// ==/PREPROCESSOR==
g_properties.add_properties(
    {
        show_remaining_time: ['user.seekbar.show_remaining_time', true]
    }
);

// Tunable vars
var seekbarH = 14;
var seekbarTextW = 70;
var volumeBarH = 14;
var volumeBarW = 70;

// Internal vars
var buttons;
var showTooltips = false;
var volumeBar;
var seekbar;
var seekbarTime1 = '0:00';
var seekbarTime2 = '0:00';

/// Reduce move
var moveChecker = new _.moveCheckReducer;

createButtonImages();

function on_paint(gr) {
    gr.FillSolidRect(0, 0, ww, wh, pssBackColor);
    gr.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);

    // SeekBar
    var p = 5;
    var x = seekbar.x,
        y = seekbar.y,
        w = seekbar.w,
        h = seekbar.h;

    var sliderBackColor = _.RGB(37, 37, 37);
    var sliderBarColor = _.RGB(110, 112, 114);

    var bool = (fb.IsPlaying && fb.PlaybackTime),
        metadb = fb.GetFocusItem(),
        playbackTimeRemaining = bool ? fb.TitleFormat('[%playback_time_remaining%]').Eval() : '0:00',
        timeRemaining = ((playbackTimeRemaining !== '0:00' ? '-' : ' ') + playbackTimeRemaining),
        isStream = (bool && (_.startsWith(fb.GetNowPlaying().RawPath, 'http://'))),
        length = (fb.IsPlaying ? (!fb.PlaybackTime ? '0:00' : fb.TitleFormat('%length%').Eval()) : metadb && fb.TitleFormat('$if(%length%,%length%,0:00)').EvalWithMetadb(metadb)),
        sliderTextColor = (fb.IsPlaying ? _.RGB(130, 132, 134) : _.RGB(80, 80, 80));
    var time2 = isStream ? 'stream' : (g_properties.show_remaining_time && playbackTimeRemaining ? timeRemaining : ' ' + length);

    if (!seekbar.drag) {
        seekbarTime1 = ((fb.IsPlaying && fb.PlaybackTime) ? fb.TitleFormat('%playback_time%').Eval() : '0:00');
        seekbarTime2 = (fb.IsPlaying ? (fb.IsPlaying && seekbarTime1 === '0:00' ? '-' + fb.TitleFormat('%length%').Eval() : time2) : (metadb ? ' ' + length : ' 0:00'));
    }

    var sliderBarHoverColor = _.RGBA(151, 153, 155, seekbar.hover_alpha);
    gr.FillSolidRect(x, y + p, w, h - p * 2, sliderBackColor);
    if (fb.IsPlaying && fb.PlaybackLength > 0) {
        gr.FillSolidRect(x, y + p, seekbar.pos(), h - p * 2, sliderBarColor);
        gr.FillSolidRect(x, y + p, seekbar.pos(), h - p * 2, sliderBarHoverColor);
    }

    var seekbarTextFont = gdi.font('Consolas', 14, 1);
    gr.DrawString(seekbarTime1, seekbarTextFont, sliderTextColor, x - seekbarTextW, y - 1, seekbarTextW, h, g_string_format.align_center);
    gr.DrawString(seekbarTime2, seekbarTextFont, sliderTextColor, x + w, y - 1, seekbarTextW, h, g_string_format.align_center);

    // VolBar
    if (common_vars.minimode_state === 'Full') {
        var x = volumeBar.x,
            y = volumeBar.y,
            w = volumeBar.w,
            h = volumeBar.h;

        var volBarHoverColor = _.RGBA(151, 153, 155, volumeBar.hover_alpha);

        gr.FillSolidRect(x, y + p, w, h - p * 2, sliderBackColor);
        gr.FillSolidRect(x, y + p, volumeBar.pos(), h - p * 2, sliderBarColor);
        gr.FillSolidRect(x, y + p, volumeBar.pos(), h - p * 2, volBarHoverColor);
    }

    buttons.paint(gr);
}

function on_size() {
    ww = window.Width;
    wh = window.Height;

    createButtonObjects(0, 0, ww, wh);

    var volumeBarX = ww - volumeBarW - 35;
    var volumeBarY = Math.floor(wh / 2 - volumeBarH / 2) + 2;
    volumeBar = new _.volume(volumeBarX, volumeBarY, volumeBarW, volumeBarH);
    volumeBar.show_tt = showTooltips;

    if (common_vars.minimode_state === 'Full') {
        var textW = seekbarTextW;
        var gap = 80;
        var seekbarW = volumeBarX - textW * 2 - gap;
    }
    else {
        var textW = seekbarTextW - 10;
        var gap = 70;
        var seekbarW = ww - textW * 2 - gap;
    }

    var seekbarY = Math.floor(wh / 2 - seekbarH / 2) + 2;
    seekbar = new _.seekbar(textW, seekbarY, seekbarW, seekbarH);
    seekbar.show_tt = showTooltips;
}

function on_mouse_wheel(delta) {
    if (!volumeBar.wheel(delta)) {
        if (delta > 0)
            fb.VolumeUp();
        else
            fb.VolumeDown();
    }
}

function on_mouse_move(x, y, m) {
    if (moveChecker.isSameMove(x, y, m)) {
        return;
    }

    qwr_utils.DisableSizing(m);

    seekbar.move(x, y);

    if (seekbar.drag) {
        seekbarTime1 = timeFormat(fb.PlaybackLength * seekbar.drag_seek, true);
        seekbarTime2 = timeFormat(fb.PlaybackLength - fb.PlaybackLength * seekbar.drag_seek, true);
        if (seekbarTime2 !== '0:00')
            seekbarTime2 = '-' + seekbarTime2;
        else
            seekbarTime2 = ' ' + seekbarTime2;

        // For seekbarTime refresh
        window.Repaint();

        return;
    }

    buttons.move(x, y);

    if (common_vars.minimode_state === 'Full')
        volumeBar.move(x, y);
}

function on_mouse_lbtn_down(x, y, m) {
    buttons.lbtn_down(x, y);
    seekbar.lbtn_down(x, y);
    if (common_vars.minimode_state === 'Full')
        volumeBar.lbtn_down(x, y);
}

function on_mouse_lbtn_up(x, y, m) {
    qwr_utils.EnableSizing(m);

    buttons.lbtn_up(x, y);
    seekbar.lbtn_up(x, y);
    if (common_vars.minimode_state === 'Full')
        volumeBar.lbtn_up(x, y);
}

function on_mouse_lbtn_dblclk(x, y, m) {
    on_mouse_lbtn_down(x, y, m);
}

function on_mouse_leave() {
    if (seekbar.drag || volumeBar.drag) {
        return;
    }

    buttons.leave();
    seekbar.leave();
    volumeBar.leave();
}

function on_playback_starting(cmd, is_paused) {
    seekbar.playback_start();
}

function on_playback_pause(isPlaying) {
    seekbar.playback_pause(isPlaying);
}

function on_playback_stop(reason) {
    seekbar.playback_stop();
    // For seekbarTime refresh
    window.Repaint();
}

function on_playback_seek() {
    seekbar.playback_seek();
    // For seekbarTime refresh
    window.Repaint();
}

function on_volume_change(val) {
    if (common_vars.minimode_state === 'Full') {
        buttons.refresh_vol_button();
        volumeBar.volume_change();
    }
}

function on_playback_order_changed(id) {
    buttons.refresh_shuffle_button();
    buttons.refresh_repeat_button();
}

function createButtonObjects(wx, wy, ww, wh) {
    if (buttons)
        buttons.reset();

    buttons = new _.buttons();
    buttons.show_tt = showTooltips;

    var w = btnImg.Repeat.normal.Width;
    var y = Math.floor(wh / 2 - w / 2) + 1;
    var h = w;
    var p = 9;

    var rightMargin = (common_vars.minimode_state !== 'Full') ? ((w + p) * 2 + 2) : (6 + (w + p) * 2 + 6 + (volumeBarW + 35));
    var x = ww - rightMargin;

    var repeatImg;
    if (plman.PlaybackOrder === g_playback_order.repeat_playlist)
        repeatImg = btnImg.RepeatPlaylist;
    else if (plman.PlaybackOrder === g_playback_order.repeat_track)
        repeatImg = btnImg.Repeat1;
    else
        repeatImg = btnImg.Repeat;

    var repeatFn = function () {
        var pbo = plman.PlaybackOrder;
        if (pbo === g_playback_order.default)
            plman.PlaybackOrder = g_playback_order.repeat_playlist;
        else if (pbo === g_playback_order.repeat_playlist)
            plman.PlaybackOrder = g_playback_order.repeat_track;
        else if (pbo === g_playback_order.repeat_track)
            plman.PlaybackOrder = g_playback_order.default;
        else
            plman.PlaybackOrder = g_playback_order.repeat_playlist;
    };
    buttons.buttons.repeat = new _.button(x, y, w, h, repeatImg, repeatFn, 'Repeat');

    var shuffleFn = function () {
        var pbo = plman.PlaybackOrder;
        if (pbo !== g_playback_order.shuffle_tracks)
            plman.PlaybackOrder = g_playback_order.shuffle_tracks;
        else
            plman.PlaybackOrder = g_playback_order.default;
    };
    buttons.buttons.shuffle = new _.button(x + (w + p), y, w, h, (plman.PlaybackOrder === g_playback_order.shuffle_tracks) ? btnImg.ShuffleTracks : btnImg.Shuffle, shuffleFn, 'Shuffle');

    if (common_vars.minimode_state === 'Full') {
        var volValue = _.toVolume(fb.Volume);
        var volImage = ((volValue > 50) ? btnImg.VolLoud : ((volValue > 0) ? btnImg.VolQuiet : btnImg.VolMute));
        buttons.buttons.mute = new _.button(ww - 30, y, w, h, volImage, function () { fb.VolumeMute(); }, volValue === 0 ? 'Unmute' : 'Mute');
    }

    buttons.refresh_repeat_button = function () {
        var repeatImg;
        if (plman.PlaybackOrder === g_playback_order.repeat_playlist)
            repeatImg = btnImg.RepeatPlaylist;
        else if (plman.PlaybackOrder === g_playback_order.repeat_track)
            repeatImg = btnImg.Repeat1;
        else
            repeatImg = btnImg.Repeat;

        buttons.buttons.repeat.set_image(repeatImg);
        buttons.buttons.repeat.repaint();
    };

    buttons.refresh_shuffle_button = function () {
        buttons.buttons.shuffle.set_image((plman.PlaybackOrder === g_playback_order.shuffle_tracks) ? btnImg.ShuffleTracks : btnImg.Shuffle);
        buttons.buttons.shuffle.repaint();
    };

    buttons.refresh_vol_button = function () {
        var volValue = _.toVolume(fb.Volume);
        var volImage = ((volValue > 50) ? btnImg.VolLoud : ((volValue > 0) ? btnImg.VolQuiet : btnImg.VolMute));
        buttons.buttons.mute.set_image(volImage);
        buttons.buttons.mute.tiptext = fb.Volume === -100 ? 'Unmute' : 'Mute';
        buttons.buttons.mute.repaint();
    };
}

function createButtonImages() {
    var fontGuifx = gdi.font(g_guifx.name, 18);
    var c = [250, 250, 250];
    var btn =
        {
            Repeat:
                {
                    ico:     g_guifx.repeat,
                    font:    fontGuifx,
                    id:      'playback',
                    w:       24,
                    h:       24,
                    cNormal: _.RGBA(c[0], c[1], c[2], 35),
                    cHover:  _.RGBA(c[0], c[1], c[2], 155),
                    cDown:   _.RGBA(c[0], c[1], c[2], 105)
                },
            Repeat1:
                {
                    ico:     g_guifx.repeat1,
                    font:    fontGuifx,
                    id:      'playback',
                    w:       24,
                    h:       24,
                    cNormal: _.RGBA(255, 220, 55, 155),
                    cHover:  _.RGBA(255, 220, 55, 225),
                    cDown:   _.RGBA(255, 220, 55, 105)
                },
            RepeatPlaylist:
                {
                    ico:     g_guifx.repeat,
                    font:    fontGuifx,
                    id:      'playback',
                    w:       24,
                    h:       24,
                    cNormal: _.RGBA(255, 220, 55, 155),
                    cHover:  _.RGBA(255, 220, 55, 225),
                    cDown:   _.RGBA(255, 220, 55, 105)
                },
            Shuffle:
                {
                    ico:     g_guifx.shuffle,
                    font:    fontGuifx,
                    id:      'playback',
                    w:       24,
                    h:       24,
                    cNormal: _.RGBA(c[0], c[1], c[2], 35),
                    cHover:  _.RGBA(c[0], c[1], c[2], 155),
                    cDown:   _.RGBA(c[0], c[1], c[2], 105)
                },
            ShuffleTracks:
                {
                    ico:     g_guifx.shuffle,
                    font:    fontGuifx,
                    id:      'playback',
                    w:       24,
                    h:       24,
                    cNormal: _.RGBA(255, 220, 55, 155),
                    cHover:  _.RGBA(255, 220, 55, 225),
                    cDown:   _.RGBA(255, 220, 55, 105)
                },
            VolLoud:
                {
                    ico:     g_guifx.volume_up,
                    font:    fontGuifx,
                    id:      'playback',
                    w:       24,
                    h:       24,
                    cNormal: _.RGBA(c[0], c[1], c[2], 35),
                    cHover:  _.RGBA(c[0], c[1], c[2], 155),
                    cDown:   _.RGBA(c[0], c[1], c[2], 105)
                },
            VolQuiet:
                {
                    ico:     g_guifx.volume_down,
                    font:    fontGuifx,
                    id:      'playback',
                    w:       24,
                    h:       24,
                    cNormal: _.RGBA(c[0], c[1], c[2], 35),
                    cHover:  _.RGBA(c[0], c[1], c[2], 155),
                    cDown:   _.RGBA(c[0], c[1], c[2], 105)
                },
            VolMute:
                {
                    ico:     g_guifx.mute,
                    font:    fontGuifx,
                    id:      'playback',
                    w:       24,
                    h:       24,
                    cNormal: _.RGBA(255, 220, 55, 155),
                    cHover:  _.RGBA(255, 220, 55, 225),
                    cDown:   _.RGBA(255, 220, 55, 105)
                }
        };

    btnImg = [];

    _.forEach(btn, function (item, i) {
        var w = item.w,
            h = item.h;

        var stateImages = []; //0=normal, 1=hover, 2=down;

        for (var s = 0; s <= 2; s++) {
            var color = item.cNormal;

            if (s === 1) {
                color = item.cHover;
            }
            else if (s === 2) {
                color = item.cDown;
            }

            var img = gdi.CreateImage(w, h);
            g = img.GetGraphics();
            g.SetSmoothingMode(SmoothingMode.HighQuality);
            g.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);
            g.FillSolidRect(0, 0, w, h, pssBackColor); // Cleartype is borked, if drawn without background

            g.DrawString(item.ico, item.font, color, 0, 0, w, h, g_string_format.align_center);

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

    cpm.AppendMenuItem(MF_STRING, 3, 'Show time remaining');
    cpm.CheckMenuItem(3, g_properties.show_remaining_time);
    if (common_vars.minimode_state === 'Full') {
        cpm.AppendMenuItem(MF_STRING, 4, 'Show music spectrum');
        cpm.CheckMenuItem(4, common_vars.spectrum_state === 'Show');
    }
    if (utils.IsKeyPressed(VK_SHIFT)) {
        _.appendDefaultContextMenu(cpm);
    }

    var id = cpm.TrackPopupMenu(x, y);
    switch (id) {
        case 3:
            g_properties.show_remaining_time = !g_properties.show_remaining_time;
            window.Repaint();
            break;
        case 4:
            pss_switch.set_state('spectrum', common_vars.spectrum_state === 'Show' ? 'Hide' : 'Show');
            break;
        default:
            _.executeDefaultContextMenu(id, scriptFolder + 'Panel_Bottom.js');
    }

    cpm.Dispose();
    return true;
}

function on_notify_data(name, info) {
    switch (name) {
        case 'minimode_state': {
            common_vars.minimode_state = info;
            break;
        }
        case 'show_tooltips': {
            showTooltips = info;
            buttons.show_tt = showTooltips;
            seekbar.show_tt = showTooltips;
            volumeBar.show_tt = showTooltips;
            break;
        }
    }
}
