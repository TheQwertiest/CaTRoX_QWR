// ==PREPROCESSOR==
// @name 'Art Module'
// @author 'TheQwertiest & eXtremeHunter'
// ==/PREPROCESSOR==
g_properties.add_properties(
    {
        track_mode:         ['user.track_mode', 1],
        group_format_query: ['user.group_format', '%album artist%%album%%discnumber%'],
        use_disc_mask:      ['user.use_disc_mask', true]
    }
);
g_properties.track_mode = Math.max(1, Math.min(3, g_properties.track_mode));

function ArtModule(features_arg) {//(Most of the art handling code was done by eXtremeHunter)
//public:
    /////////////////////////////////////
    // Callback methods implementation
    this.paint = function (g) {
        var SF = g_string_format.align_center | g_string_format.trim_ellipsis_char | g_string_format.no_wrap;
        var art = art_arr[cur_art_id];

        g.FillSolidRect( this.x, this.y, this.w, this.h, panelsBackColor);
        g.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);

        if (art) {
            var x = this.x + art_x,
                y = this.y + art_y,
                w = art_w,
                h = art_h;
            var art_img_w = art.img.Width,
                art_img_h = art.img.Height;

            if (w + h > 10) {
                var p = border_size;
                if (cur_art_id === artType.cd) {
                    g.DrawImage(art.img, x + p, y + p, w - 2*p, h - 2*p, 0, 0, art_img_w, art_img_h);

                    if (g_properties.use_disc_mask) {
                        g.SetSmoothingMode(SmoothingMode.HighQuality);
                        g.DrawEllipse(x, y, w - 1, h - 1, 1, frame_color);
                    }
                }
                else {
                    if (feature_border) {
                        g.DrawImage(art.img, x + p, y + p, w - 2*p, h - 2*p, 0, 0, art_img_w, art_img_h);
                        g.DrawRect(x, y, w - 1, h - 1, 1, frame_color);
                    }
                    else {
                        g.DrawImage(art.img, x, y, w, h, 0, 0, art_img_w, art_img_h);
                    }
                }
            }
        }
        else if (art === null) {
            var metadb = fb.IsPlaying ? fb.GetNowPlaying() : fb.GetFocusItem();
            if (metadb && (_.startsWith(metadb.RawPath, 'http://')) && utils.CheckFont('Webdings')) {
                g.DrawString('\uF0BB', gdi.font('Webdings', 130), _.RGB(70, 70, 70), this.x, this.y, this.w, this.h, SF);
            }
            else if (!fb.IsPlaying){
                g.DrawString(g_theme_name + ' ' + g_theme_version, gdi.font('Segoe Ui Semibold', 24), _.RGB(70, 70, 70), this.x, this.y, this.w, this.h, g_string_format.align_center);
            }
            else {
                g.DrawString('No album image', gdi.font('Segoe Ui Semibold', 24), _.RGB(70, 70, 70), this.x, this.y, this.w, this.h, g_string_format.align_center);
            }
        }
        else {
            g.DrawString('LOADING', gdi.font('Segoe Ui Semibold', 24), _.RGB(70, 70, 70), this.x, this.y, this.w, this.h, g_string_format.align_center);
        }

        if (g_properties.show_thumbs) {
            thumbs.on_paint(g);
        }
    };

    var throttled_repaint = _.throttle(_.bind(function () {
        window.RepaintRect(this.x, this.y, this.w, this.h);
    }, this), 1000 / 60);
    this.repaint = function () {
        throttled_repaint();
    };

    this.on_size = function (x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        was_on_size_called = true;

        if (thumbs) {
            thumbs.reposition(this.x,this.y,this.w,this.h);
        }
        reposition_art();
    };

    this.get_album_art_done = function (metadb, art_id, image, image_path) {
        if (art_id === g_album_art_id.artist) {
            art_id = artType.artist;
        }

        if (!image) {
            art_arr[art_id] = null;
            if (art_id === cur_art_id) {
                this.repaint();
            }
        }
        else {
            var art_img_w = image.Width,
                art_img_h = image.Height;

            if (art_id === artType.cd && art_img_w !== art_img_h) {
                image = image.Resize(art_img_w, art_img_w, 0);
            }

            if (currentAlbum === fb.TitleFormat(g_properties.group_format_query).EvalWithMetadb(metadb)) {
                var is_embedded = image_path.slice(image_path.lastIndexOf('.') + 1) === fb.TitleFormat('$ext(%path%)').EvalWithMetadb(metadb);

                art_arr[art_id] = {};
                art_arr[art_id].img = image;
                art_arr[art_id].path = image_path;
                art_arr[art_id].is_embedded = is_embedded;
                if (thumbs) {
                    thumbs.on_art_get(art_id, image);
                }
            }

            if (g_properties.use_disc_mask && art_id === artType.cd) {
                var artWidth = image.Width,
                    artHeight = image.Height,
                    discMask = gdi.CreateImage(artWidth, artHeight),
                    g = discMask.GetGraphics();
                g.FillSolidRect(0, 0, artWidth, artHeight, 0xffffffff);
                g.SetSmoothingMode(SmoothingMode.HighQuality);
                g.FillEllipse(1, 1, artWidth - 2, artHeight - 2, 0xff000000);
                discMask.ReleaseGraphics(g);
                art_arr[art_id].img.ApplyMask(discMask);
                discMask.Dispose();
            }

            if (art_id === cur_art_id) {
                reposition_art(art_arr[cur_art_id]);
                this.repaint();
            }
        }

        if (g_properties.show_thumbs) {
            this.repaint();
        }
    };
    this.playlist_switch = function () {
        if (!fb.IsPlaying || g_properties.track_mode === track_modes.selected) {
            this.get_album_art();
        }
    };
    this.item_focus_change = function () {
        if (!fb.IsPlaying || g_properties.track_mode === track_modes.selected) {
            this.get_album_art();
        }
    };
    this.playback_new_track = function (metadb) {
        if (g_properties.track_mode !== track_modes.selected) {
            this.get_album_art();
        }
    };
    this.playback_stop = function (reason) {
        if (reason !== 2 && g_properties.track_mode !== track_modes.selected) {
            this.get_album_art();
        }
    };
    this.mouse_move = function (x, y, m) {
        if (thumbs && g_properties.show_thumbs) {
            thumbs.btns.move(x, y);
        }
    };
    this.mouse_lbtn_down = function (x, y, m) {
        if (thumbs && g_properties.show_thumbs) {
            thumbs.btns.lbtn_down(x, y);
        }
    };
    this.mouse_lbtn_dblclk = function () {
        if (!art_arr[cur_art_id]) {
            return;
        }

        _.run(art_arr[cur_art_id].path);
    };
    this.mouse_lbtn_up = function (x, y, m) {
        if (thumbs && g_properties.show_thumbs) {
            thumbs.btns.lbtn_up(x, y);
        }
    };
    this.mouse_wheel = function (delta) {
        if (feature_cycle) {
            var prev_art_id = cur_art_id;

            do {
                if (delta === -1) {
                    cur_art_id === artType.lastVal ? cur_art_id = artType.firstVal : ++cur_art_id;
                }
                else if (delta === 1) {
                    cur_art_id === artType.firstVal ? cur_art_id = artType.lastVal : --cur_art_id;
                }
            } while (prev_art_id !== cur_art_id && !art_arr[cur_art_id]);

            if (prev_art_id !== cur_art_id) {
                reposition_art();
                this.repaint();
            }
        }
    };
    this.mouse_leave = function () {
        if (thumbs && g_properties.show_thumbs) {
            thumbs.btns.leave();
        }
    };

    // End of Callback methods implementation
    /////////////////////////////////////

    this.get_album_art = function (metadb_arg) {
        if (!was_on_size_called) {
            return;
        }

        var metadb = metadb_arg ? metadb_arg : get_current_metadb();
        if (!metadb) {
            this.clear_art();
            return;
        }

        currentAlbum = fb.TitleFormat(g_properties.group_format_query).EvalWithMetadb(metadb);
        if (oldAlbum === currentAlbum) {
            if (art_arr[cur_art_id] === null) {
                this.repaint();
            }
            return;
        }

        cur_art_id = artType.defaultVal; // TODO: consider not changing art type when using reload
        art_arr = [];
        if (thumbs) {
            thumbs.clear_thumb_images();
        }
        this.repaint();

        if (albumTimer) {
            window.ClearInterval(albumTimer);
            albumTimer = null;
        }

        var artID = artType.firstVal;

        albumTimer = window.setInterval(function () {
            utils.GetAlbumArtAsync(window.ID, metadb, (artID === artType.artist) ? artID = g_album_art_id.artist : artID);

            if (artID >= artType.lastVal) {
                window.ClearInterval(albumTimer);
                albumTimer = null;
            }
            else {
                ++artID;
            }
        }, 200);

        oldAlbum = currentAlbum;
    };

    this.reload_art = function (metadb_arg) {
        oldAlbum = currentAlbum = undefined;

        var metadb = metadb_arg ? metadb_arg : undefined;
        this.get_album_art(metadb);
    };

    this.clear_art = function () {
        art_arr.forEach(function (item, i) {
            art_arr[i] = null;
        });
        if (thumbs) {
            thumbs.clear_thumb_images();
        }

        oldAlbum = currentAlbum = undefined;
        reposition_art();

        this.repaint();
    };

    this.append_menu = function (cpm) {
        var thumb_cm;
        var track = window.CreatePopupMenu();
        var cycle;
        var web = window.CreatePopupMenu();

        if (thumbs) {
            thumb_cm = window.CreatePopupMenu();
        }
        if (feature_cycle) {
            cycle = window.CreatePopupMenu();
        }

        context_menu.push(track, web);
        if (thumbs) {
            context_menu.push(thumb_cm);
        }
        if (feature_cycle) {
            context_menu.push(cycle);
        }

        var metadb = get_current_metadb();

        if (thumbs) {
            thumb_cm.AppendMenuItem(MF_STRING, 601, 'Thumbs show');
            thumb_cm.CheckMenuItem(601, g_properties.show_thumbs);
            thumb_cm.AppendMenuSeparator();
            var mf_string = (g_properties.show_thumbs ? MF_STRING : MF_GRAYED);
            thumb_cm.AppendMenuItem(mf_string, 602, 'Thumbs left');
            thumb_cm.AppendMenuItem(mf_string, 603, 'Thumbs top');
            thumb_cm.AppendMenuItem(mf_string, 604, 'Thumbs right');
            thumb_cm.AppendMenuItem(mf_string, 605, 'Thumbs bottom');
            thumb_cm.CheckMenuRadioItem(602, 605, g_properties.thumb_position + 601);
            thumb_cm.AppendTo(cpm, MF_STRING, 'Thumbs');
            cpm.AppendMenuSeparator();
        }

        track.AppendMenuItem(MF_STRING, 606, 'Automatic (current selection/playing item)');
        track.AppendMenuItem(MF_STRING, 607, 'Playing item');
        track.AppendMenuItem(MF_STRING, 608, 'Current selection');
        track.CheckMenuRadioItem(606, 608, g_properties.track_mode + 605);
        track.AppendTo(cpm, MF_STRING, 'Displayed track');

        if (feature_cycle) {
            cycle.AppendMenuItem(MF_STRING, 620, 'Enable cycle');
            cycle.CheckMenuItem(620, g_properties.enable_cycle);
            cycle.AppendMenuSeparator();
            var grayIfNoCycle = (g_properties.enable_cycle ? MF_STRING : MF_GRAYED);
            cycle.AppendMenuItem(grayIfNoCycle, 621, '5 sec');
            cycle.AppendMenuItem(grayIfNoCycle, 622, '10 sec');
            cycle.AppendMenuItem(grayIfNoCycle, 623, '20 sec');
            cycle.AppendMenuItem(grayIfNoCycle, 624, '30 sec');
            cycle.AppendMenuItem(grayIfNoCycle, 625, '40 sec');
            cycle.AppendMenuItem(grayIfNoCycle, 626, '50 sec');
            cycle.AppendMenuItem(grayIfNoCycle, 627, '1 min');
            cycle.AppendMenuItem(grayIfNoCycle, 628, '2 min');
            cycle.AppendMenuItem(grayIfNoCycle, 629, '3 min');
            cycle.AppendMenuItem(grayIfNoCycle, 620, '4 min');
            cycle.AppendMenuItem(grayIfNoCycle, 631, '5 min');
            cycle.CheckMenuRadioItem(621, 631, JSON.parse(g_properties.cycle_interval)[1]);
            cycle.AppendTo(cpm, MF_STRING, 'Cycle covers');
        }

        cpm.AppendMenuSeparator();
        cpm.AppendMenuItem(MF_STRING, 632, 'Use disc mask');
        cpm.CheckMenuItem(632, g_properties.use_disc_mask);
        if (art_arr[cur_art_id]) {
            cpm.AppendMenuItem(art_arr[cur_art_id].is_embedded ? MF_GRAYED : MF_STRING, 633, 'Open image');
            if (has_photoshop) {
                cpm.AppendMenuItem(art_arr[cur_art_id].is_embedded ? MF_GRAYED : MF_STRING, 634, 'Open image with Photoshop');
            }
            cpm.AppendMenuItem(MF_STRING, 635, 'Open image folder');
        }

        cpm.AppendMenuItem(MF_STRING, 636, 'Reload \tF5');

        //---> Weblinks
        cpm.AppendMenuSeparator();
        web.AppendMenuItem(MF_STRING, 650, 'Google');
        web.AppendMenuItem(MF_STRING, 651, 'Google Images');
        web.AppendMenuItem(MF_STRING, 652, 'eCover');
        web.AppendMenuItem(MF_STRING, 653, 'Wikipedia');
        web.AppendMenuItem(MF_STRING, 654, 'YouTube');
        web.AppendMenuItem(MF_STRING, 655, 'Last FM');
        web.AppendMenuItem(MF_STRING, 656, 'Discogs');
        web.AppendTo(cpm, !metadb ? MF_GRAYED : MF_STRING, 'Weblinks');
    };

    this.execute_menu = function (idx) {
        var metadb = get_current_metadb();
        var selected_metadb = get_selected_metadb();

        var idxFound = false;
        if (thumbs) {
            idxFound = true;
            switch (idx) {
                case 601:
                    g_properties.show_thumbs = !g_properties.show_thumbs;
                    on_thumb_position_change();
                    break;
                case 602:
                    thumbs.change_position(this.x, this.y, this.w, this.h, pos.left);
                    on_thumb_position_change();
                    break;
                case 603:
                    thumbs.change_position(this.x, this.y, this.w, this.h, pos.top);
                    on_thumb_position_change();
                    break;
                case 604:
                    thumbs.change_position(this.x, this.y, this.w, this.h, pos.right);
                    on_thumb_position_change();
                    break;
                case 605:
                    thumbs.change_position(this.x, this.y, this.w, this.h, pos.bottom);
                    on_thumb_position_change();
                    break;
                default:
                    idxFound = false;
            }
        }

        if (feature_cycle) {
            idxFound = true;
            switch (idx) {
                case 620:
                    g_properties.enable_cycle = !g_properties.enable_cycle;
                    trigger_cycle_timer(g_properties.enable_cycle, art_arr.length);
                    break;
                case 621:
                    set_cycle_interval(5000, idx);
                    break;
                case 622:
                    set_cycle_interval(10000, idx);
                    break;
                case 623:
                    set_cycle_interval(20000, idx);
                    break;
                case 624:
                    set_cycle_interval(30000, idx);
                    break;
                case 625:
                    set_cycle_interval(40000, idx);
                    break;
                case 626:
                    set_cycle_interval(50000, idx);
                    break;
                case 627:
                    set_cycle_interval(60000, idx);
                    break;
                case 628:
                    set_cycle_interval(120000, idx);
                    break;
                case 629:
                    set_cycle_interval(180000, idx);
                    break;
                case 630:
                    set_cycle_interval(240000, idx);
                    break;
                case 631:
                    set_cycle_interval(300000, idx);
                    break;
                default:
                    idxFound = false;
            }

            function set_cycle_interval(iv, id) {
                g_properties.cycle_interval = JSON.stringify([iv, id]);

                trigger_cycle_timer(g_properties.enable_cycle, art_arr.length, true);
            }
        }

        if (!idxFound) {
            idxFound = true;
            switch (idx) {
                case 606:
                    g_properties.track_mode = track_modes.auto;
                    fb.IsPlaying ? this.get_album_art(fb.GetNowPlaying()) : (selected_metadb ? this.get_album_art(selected_metadb) : this.clear_art());
                    break;
                case 607:
                    g_properties.track_mode = track_modes.playing;
                    fb.IsPlaying ? this.get_album_art(fb.GetNowPlaying()) : this.clear_art();
                    break;
                case 608:
                    g_properties.track_mode = track_modes.selected;
                    selected_metadb ? this.get_album_art(selected_metadb) : this.clear_art();
                    break;
                case 632:
                    g_properties.use_disc_mask = !g_properties.use_disc_mask;
                    this.reload_art();
                    break;
                case 633:
                    _.run(art_arr[cur_art_id].path);
                    break;
                case 634:
                    _.runCmd('Photoshop ' + '\"' + art_arr[cur_art_id].path + '\"');
                    break;
                case 635:
                    _.explorer(art_arr[cur_art_id].path);
                    break;
                case 636:
                    this.reload_art();
                    break;
                case 650:
                    link('google', metadb);
                    break;
                case 651:
                    link('googleImages', metadb);
                    break;
                case 652:
                    link('eCover', metadb);
                    break;
                case 653:
                    link('wikipedia', metadb);
                    break;
                case 654:
                    link('youTube', metadb);
                    break;
                case 655:
                    link('lastFM', metadb);
                    break;
                case 656:
                    link('discogs', metadb);
                    break;
                default:
                    idxFound = false;
            }
        }

        context_menu.forEach(function (item) {
            item.dispose();
        });
        context_menu = [];

        return idxFound;
    };

//private:
    function reposition_art() {
        var art = art_arr[cur_art_id];
        if (!art) {
            return;
        }

        var art_left_margin = 0;
        var art_top_margin = 0;
        var art_right_margin = 0;
        var art_bottom_margin = 0;

        if (thumbs && g_properties.show_thumbs) {
            var thumbsMargin = thumbs.size + g_properties.thumb_margin;

            art_left_margin = g_properties.thumb_position === pos.left ? thumbsMargin : 0;
            art_top_margin = g_properties.thumb_position === pos.top ? thumbsMargin : 0;
            art_right_margin = g_properties.thumb_position === pos.right ? thumbsMargin : 0;
            art_bottom_margin = g_properties.thumb_position === pos.bottom ? thumbsMargin : 0;
        }

        var art_img_w = art.img.Width,
            art_img_h = art.img.Height;

        var scale_x = 0,
            scale_y = 0,
            scale_w = ( that.w - art_left_margin - art_right_margin ) / art_img_w,
            scale_h = ( that.h - art_top_margin - art_bottom_margin ) / art_img_h,
            scale = Math.min(scale_w, scale_h);

        if (scale_w < scale_h) {
            scale_y = Math.floor((( that.h - art_top_margin - art_bottom_margin ) - (art_img_h * scale) ) / 2);
        }
        else if (scale_w > scale_h) {
            scale_x = Math.floor((( that.w - art_left_margin - art_right_margin ) - (art_img_w * scale) ) / 2);
        }

        art_w = Math.max(0, Math.floor(art_img_w * scale));
        art_h = Math.max(0, Math.floor(art_img_h * scale));
        art_x = scale_x + art_left_margin;
        art_y = scale_y + art_top_margin;
    }

    function get_current_metadb() {
        var metadb = null;
        switch (g_properties.track_mode) {
            case track_modes.auto: {
                if (fb.IsPlaying) {
                    metadb = fb.GetNowPlaying();
                }
                else {
                    metadb = fb.GetFocusItem();
                    if (!metadb) {
                        metadb = get_selected_metadb();
                    }
                }
                break;
            }
            case track_modes.selected: {
                metadb = fb.GetFocusItem();
                if (!metadb) {
                    metadb = get_selected_metadb();
                }
                break;
            }
            case track_modes.playing: {
                if (fb.IsPlaying) {
                    metadb = fb.GetNowPlaying();
                }
                break;
            }
        }

        return metadb;
    }

    function get_selected_metadb() {
        var selected_metadb_list = plman.GetPlaylistSelectedItems(plman.ActivePlaylist);

        return selected_metadb_list.Count > 0 ? selected_metadb_list.Item(0) : null;
    }

    function trigger_cycle_timer(enable_cycle, artLength, restartCycle) {
        if (cycle_timer && (!enable_cycle || !art_arr[cur_art_id] || artLength <= 1 || restartCycle)) {
            window.ClearInterval(cycle_timer);
            cycle_timer = null;
        }

        if (enable_cycle && !cycle_timer && artLength > 1) {
            cycle_timer = window.setInterval(function () {
                that.mouse_wheel(-1);
            }, JSON.parse(g_properties.cycle_interval)[0]);
        }
    }

    function coverSwitch(id) {
        if (!art_arr[id]) {
            return;
        }

        cur_art_id = id;

        reposition_art();
        that.repaint();
    }

    function on_thumb_position_change() {
        reposition_art();
        that.repaint();
    }

//public:
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;

//private:
    var that = this;

    var pos = Thumbs.pos;

    var artType =
        {
            front:  0,
            back:   1,
            cd:     2,
            artist: 3,

            defaultVal: 0,
            firstVal:   0,
            lastVal:    3
        };

    var track_modes =
        {
            auto:     1,
            playing:  2,
            selected: 3
        };

    var border_size = 2;

    var features = features_arg || [];
    var feature_border = _.includes(features, 'borders');
    var feature_thumbs = _.includes(features, 'thumbs');
    var feature_cycle = _.includes(features, 'auto_cycle');
    var frame_color = panelsLineColor;

    var oldAlbum;
    var currentAlbum;
    var albumTimer = null;

    var art_x = 0;
    var art_y = 0;
    var art_w = 0;
    var art_h = 0;

    var cur_art_id = artType.defaultVal;
    var art_arr = [];

    var context_menu = [];

    var has_photoshop;
    var was_on_size_called = false;

    /** @type {null|number} */
    var cycle_timer = null;

    if (feature_thumbs) {
        g_properties.add_properties(
            {
                show_thumbs:    ['user.thumbs.show', false],
                thumb_margin:   ['user.thumbs.margin', 15],
                thumb_size:     ['user.thumbs.size', 50],
                thumb_padding:  ['user.thumbs.padding', 10],
                thumb_position: ['user.thumbs.position', 4]
            }
        );
        g_properties.thumb_position = Math.max(1, Math.min(4, g_properties.thumb_position));
    }
    else if (g_properties.show_thumbs === true) {
        g_properties.show_thumbs = false;
    }

    if (feature_cycle) {
        g_properties.add_properties({
                enable_cycle:   ['user.cycle.enable', false],
                cycle_interval: ['user.cycle.interval', JSON.stringify([10000, 622])]
            }
        );
    }

    // objects
    var thumbs = feature_thumbs ? new Thumbs(coverSwitch) : null;

    (function () {
        try {
            WshShell.RegRead("HKEY_CURRENT_USER\\Software\\Adobe\\Photoshop\\");
            has_photoshop = true;
        } catch (e) {
            has_photoshop = false;
        }
    })();
}

function Thumbs(cover_switch_callback_arg) {
    this.on_paint = function(gr) {
        this.btns.paint(gr);
    };

    this.reposition = function(wx,wy,ww,wh) {
        var old_w = this.w;
        var old_h = this.h;

        this.size = Math.min(g_properties.thumb_size, Math.floor(((is_vertical ? wh : ww) - g_properties.thumb_padding*3) / 4));

        if (is_vertical) {
            this.w = this.size;
            this.h = Math.min(this.size * 4 + g_properties.thumb_padding*3,wh);
        }
        else {
            this.w = Math.min(this.size * 4 + g_properties.thumb_padding*3,ww);
            this.h = this.size;
        }

        if (old_w !== this.w || old_h !== this.h) {
            this.create_default_thumb_images();
            this.create_thumbs_from_imgs();
        }

        this.x = wx;
        this.y = wy;
        switch (g_properties.thumb_position) {
            case pos.left:
                this.y += Math.round((wh - this.h)/2);
                break;
            case pos.right:
                this.x += ww - this.w;
                this.y += Math.round((wh - this.h)/2);
                break;
            case pos.top:
                this.x += Math.round((ww - this.w)/2);
                break;
            case pos.bottom:
                this.x += Math.round((ww - this.w)/2);
                this.y += wh - this.h;
                break;
        }

        this.create_thumb_objects();
        this.refill_thumb_images();
    };

    var throttled_repaint = _.throttle(_.bind(function () {
        window.RepaintRect(this.x, this.y, this.w, this.h);
    }, this), 1000 / 60);
    this.repaint = function () {
        throttled_repaint();
    };

    this.create_thumb_objects = function() {
        if (this.btns) {
            this.btns.reset();
        }

        this.btns = new _.buttons();

        var p = g_properties.thumb_padding;

        var x = this.x,
            y = this.y;
        var w = Math.min(g_properties.thumb_size, Math.max(Math.floor(((is_vertical ? this.h : this.w) - 3 * p) / 4),0));
        var h = w;

        this.btns.buttons.front = new _.button(x, y, w, h, default_thumb_imgs.front, function () {cover_switch_callback(0);}, 'Front');

        x += (is_vertical ? 0 : (w + p));
        y += (is_vertical ? (w + p) : 0);
        this.btns.buttons.back = new _.button(x, y, w, h, default_thumb_imgs.back, function () {cover_switch_callback(1);}, 'Back');

        x += (is_vertical ? 0 : (w + p));
        y += (is_vertical ? (w + p) : 0);
        this.btns.buttons.cd = new _.button(x, y, w, h, default_thumb_imgs.cd, function () {cover_switch_callback(2);}, 'CD');

        x += (is_vertical ? 0 : (w + p));
        y += (is_vertical ? (w + p) : 0);
        this.btns.buttons.artist = new _.button(x, y, w, h, default_thumb_imgs.artist, function () {cover_switch_callback(3);}, 'Artist');
    };

    this.on_art_get = function(art_id, original_art_img) {
        original_art_imgs[art_id] = original_art_img;
        thumb_imgs[art_id] = this.create_thumb_from_img(original_art_img);
        this.fill_thumb_image_by_id(0, thumb_imgs[art_id]);
    };

    this.create_thumbs_from_imgs = function() {
        original_art_imgs.forEach(_.bind(function(item,i) {
            thumb_imgs[i] = this.create_thumb_from_img(item);
        },this));
    };

    this.create_thumb_from_img = function(image) {
        var ratio = image.Height / image.Width;
        var art_h = this.size - 2 * border_size;
        var art_w = this.size - 2 * border_size;
        if (image.Height > image.Width) {
            art_w = Math.round(art_h / ratio);
        }
        else {
            art_h = Math.round(art_w * ratio);
        }

        return image.Resize(art_w, art_h);
    };

    this.clear_thumb_images = function() {
        if (!this.btns) {
            return;
        }

        original_art_imgs = [];
        thumb_imgs = [];
        this.refill_thumb_images();
    };

    this.refill_thumb_images = function() {
        this.fill_thumb_image_by_id(0, thumb_imgs[0]);
        this.fill_thumb_image_by_id(1, thumb_imgs[1]);
        this.fill_thumb_image_by_id(2, thumb_imgs[2]);
        this.fill_thumb_image_by_id(3, thumb_imgs[3]);
    };

    this.fill_thumb_image_by_id = function(art_id, art_img) {
        var btnName;
        switch (art_id) {
            case 0: {
                btnName = 'front';
                break;
            }
            case 1: {
                btnName = 'back';
                break;
            }
            case 2: {
                btnName = 'cd';
                break;
            }
            case 3: {
                btnName = 'artist';
                break;
            }
        }

        var img_arr = default_thumb_imgs[btnName];
        var btn = this.btns.buttons[btnName];
        if (art_img) {
            img_arr =
                {
                    normal:  this.create_thumb_image(btn.w, btn.h, art_img, 0, btn.tiptext),
                    hover:   this.create_thumb_image(btn.w, btn.h, art_img, 1, btn.tiptext),
                    pressed: this.create_thumb_image(btn.w, btn.h, art_img, 2, btn.tiptext)
                };
        }
        btn.set_image(img_arr);
    };

    this.create_default_thumb_images = function() {
        var btn =
            {
                front:  {
                    text: 'Front'
                },
                back:   {
                    text: 'Back'
                },
                cd:     {
                    text: 'CD'
                },
                artist: {
                    text: 'Artist'
                }
            };

        default_thumb_imgs = [];
        _.forEach(btn, _.bind(function (item, i) {
            var stateImages = []; //0=normal, 1=hover, 2=down;

            for (var s = 0; s <= 2; s++) {
                stateImages[s] = this.create_thumb_image(this.size, this.size, 0, s, item.text);
            }

            default_thumb_imgs[i] =
                {
                    normal:  stateImages[0],
                    hover:   stateImages[1],
                    pressed: stateImages[2]
                };
        },this));
    };

    this.create_thumb_image = function(bw, bh, art_img, state, btnText) {
        var img = gdi.CreateImage(bw, bh);
        var g = img.GetGraphics();
        g.SetSmoothingMode(SmoothingMode.HighQuality);
        g.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);

        var p = border_size;
        var x = 0;
        var y = 0;
        var w = bw;
        var h = bh;

        if (art_img) {
            x = Math.round((bw - (art_img.Width + 2*border_size))/2);
            y = Math.round((bh - (art_img.Height + 2*border_size))/2);
            w = art_img.Width + 2*border_size;
            h = art_img.Height + 2*border_size;
        }

        if (art_img) {
            g.DrawImage(art_img, x + p, y + p, art_img.Width, art_img.Height, 0, 0, art_img.Width, art_img.Height, 0, 230);
        }
        else {
            g.FillSolidRect(x + p, y + p, w - x - 2*p, h - y - 2*p, panelsBackColor); // Cleartype is borked, if drawn without background
            var btn_text_format = g_string_format.align_center | g_string_format.trim_ellipsis_char | g_string_format.no_wrap;
            g.DrawString(btnText, gdi.font('Segoe Ui', 14), _.RGB(70, 70, 70), 0, 0, w, h, btn_text_format);
        }

        switch (state) {//0=normal, 1=hover, 2=down;
            case 0:
                g.DrawRect(x, y, w - 1, h - 1, 1, frame_color);
                break;
            case 1:
                g.DrawRect(x, y, w - 1, h - 1, 1, _.RGB(170, 172, 174));
                break;
            case 2:
                g.DrawRect(x, y, w - 1, h - 1, 1, _.RGB(70, 70, 70));
                break;
        }

        img.ReleaseGraphics(g);
        return img;
    };

    this.change_position = function(wx,wy,ww,wh,new_pos) {
        is_vertical = (new_pos === pos.left || new_pos === pos.right);
        g_properties.thumb_position = new_pos;

        this.reposition(wx,wy,ww,wh);
    };

    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;

    this.btns = new _.buttons();
    this.size = g_properties.thumb_size;

    var that = this;

    var border_size = 2;
    var frame_color = panelsLineColor;
    var pos = Thumbs.pos;

    var original_art_imgs = [];
    var thumb_imgs = [];
    var default_thumb_imgs = [];

    var cover_switch_callback = cover_switch_callback_arg;

    var is_vertical = (g_properties.thumb_position === pos.left || g_properties.thumb_position === pos.right);

    this.create_default_thumb_images();
}

Thumbs.pos =
    {
        left:   1,
        top:    2,
        right:  3,
        bottom: 4
    };
