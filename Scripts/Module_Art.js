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

// TODO: make thumb size variable as well

function ArtModule(features_arg) {//(Most of the art handling code was done by eXtremeHunter)
//public:
    /////////////////////////////////////
    // Callback methods implementation
    this.paint = function (g) {
        var SF = g_string_format.align_center | g_string_format.trim_ellipsis_char | g_string_format.no_wrap;
        var art = art_arr[cur_art_id];

        g.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);

        if (art) {
            var x = this.x + art_x,
                y = this.y + art_y,
                w = art_w,
                h = art_h;
            var art_img_w = art.width,
                art_img_h = art.height;

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
            else {
                g.DrawString(g_theme_name + ' ' + g_theme_version, gdi.font('Segoe Ui Semibold', 24), _.RGB(70, 70, 70), this.x, this.y, this.w, this.h, g_string_format.align_center);
            }
        }
        else {
            g.DrawString('LOADING', gdi.font('Segoe Ui Semibold', 24), _.RGB(70, 70, 70), this.x, this.y, this.w, this.h, g_string_format.align_center);
        }

        if (feature_thumbs && g_properties.show_thumbs) {
            fill_thumb_image(thumbs.buttons.front, art_arr[0]);
            fill_thumb_image(thumbs.buttons.back, art_arr[1]);
            fill_thumb_image(thumbs.buttons.cd, art_arr[2]);
            fill_thumb_image(thumbs.buttons.artist, art_arr[3]);

            thumbs.paint(g);
        }
    };

    this.repaint = function () {
        window.RepaintRect(this.x, this.y, this.w, this.h);
    };

    this.on_size = function (x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        if (feature_thumbs) {
            reposition_thumbs();
        }
        reposition_art();
    };

    this.get_album_art_done = function (metadb, art_id, image, image_path) {
        if (art_id === g_album_art_id.artist) {
            art_id = artType.artist;
        }

        if (!image) {
            if (!!art_arr[art_id] && cur_art_id === art_id) {
                art_arr[art_id] = null;
                this.repaint();
            }
            else {
                art_arr[art_id] = null;
            }
            return;
        }

        var art_img_w = image.Width,
            art_img_h = image.Height;

        if (art_id === artType.cd && art_img_w !== art_img_h) {
            image = image.Resize(art_img_w, art_img_w, 0);
        }

        if (currentAlbum === fb.TitleFormat(g_properties.group_format_query).EvalWithMetadb(metadb)) {
            var is_embedded = image_path.slice(image_path.lastIndexOf('.') + 1) === fb.TitleFormat('$ext(%path%)').EvalWithMetadb(metadb);

            art_arr[art_id] = {};
            art_arr[art_id].img = image;
            art_arr[art_id].width = image.Width;
            art_arr[art_id].height = image.Height;
            if (feature_thumbs) {
                var ratio = image.Height / image.Width;
                var art_h = g_properties.thumb_size - border_size;
                var art_w = g_properties.thumb_size - border_size;
                if (image.Height > image.Width) {
                    art_w = Math.round(art_h / ratio);
                }
                else {
                    art_h = Math.round(art_w * ratio);
                }

                art_arr[art_id].thumb_img = image.Resize(art_w, art_h);
            }
            art_arr[art_id].path = image_path;
            art_arr[art_id].is_embedded = is_embedded;
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
    };
    this.playlist_switch = function () {
        if (!fb.IsPlaying || g_properties.track_mode === track_modes.selected) {
            this.get_album_art();
        }
    };
    this.playlist_items_selection_change = function () {
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
        if (feature_thumbs) {
            thumbs.move(x, y);
        }
    };
    this.mouse_lbtn_down = function (x, y, m) {
        if (feature_thumbs) {
            thumbs.lbtn_down(x, y);
        }
    };
    this.mouse_lbtn_dblclk = function () {
        if (!art_arr[cur_art_id]) {
            return;
        }

        _.run('\"' + art_arr[cur_art_id].path + '\"');
    };
    this.mouse_lbtn_up = function (x, y, m) {
        if (feature_thumbs) {
            thumbs.lbtn_up(x, y);
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
        if (feature_thumbs) {
            thumbs.leave();
        }
    };

    // End of Callback methods implementation
    /////////////////////////////////////

    this.get_album_art = function (metadb_arg) {
        var metadb = metadb_arg ? metadb_arg : get_current_metadb();
        if (!metadb) {
            if (metadb === null) {
                this.clear_art();
            }

            return;
        }

        currentAlbum = fb.TitleFormat(g_properties.group_format_query).EvalWithMetadb(metadb);
        if (oldAlbum === currentAlbum) {
            if (art_arr[cur_art_id] === null) {
                this.repaint();
            }
            return;
        }

        cur_art_id = artType.defaultVal; // think about not changing art type when using reload
        art_arr = [];
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

        oldAlbum = currentAlbum = undefined;
        reposition_art();
        this.repaint();
    };

    this.append_menu = function (cpm) {
        var thumbs;
        var track = window.CreatePopupMenu();
        var cycle;
        var web = window.CreatePopupMenu();

        if (feature_thumbs) {
            thumbs = window.CreatePopupMenu();
        }
        if (feature_cycle) {
            cycle = window.CreatePopupMenu();
        }

        context_menu.push(track, web);
        if (feature_thumbs) {
            context_menu.push(thumbs);
        }
        if (feature_cycle) {
            context_menu.push(cycle);
        }

        var metadb = get_current_metadb();

        if (feature_thumbs) {
            thumbs.AppendMenuItem(MF_STRING, 601, 'Thumbs show');
            thumbs.CheckMenuItem(601, g_properties.show_thumbs);
            thumbs.AppendMenuSeparator();
            var mf_string = (g_properties.show_thumbs ? MF_STRING : MF_GRAYED);
            thumbs.AppendMenuItem(mf_string, 602, 'Thumbs left');
            thumbs.AppendMenuItem(mf_string, 603, 'Thumbs top');
            thumbs.AppendMenuItem(mf_string, 604, 'Thumbs right');
            thumbs.AppendMenuItem(mf_string, 605, 'Thumbs bottom');
            thumbs.CheckMenuRadioItem(602, 605, g_properties.thumb_position + 601);
            thumbs.AppendTo(cpm, MF_STRING, 'Thumbs');
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
        if (feature_thumbs) {
            idxFound = true;
            switch (idx) {
                case 601:
                    g_properties.show_thumbs = !g_properties.show_thumbs;
                    on_thumb_position_change();
                    break;
                case 602:
                    g_properties.thumb_position = pos.left;
                    on_thumb_position_change();
                    break;
                case 603:
                    g_properties.thumb_position = pos.top;
                    on_thumb_position_change();
                    break;
                case 604:
                    g_properties.thumb_position = pos.right;
                    on_thumb_position_change();
                    break;
                case 605:
                    g_properties.thumb_position = pos.bottom;
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
                    _.run('\"' + art_arr[cur_art_id].path + '\"');
                    break;
                case 634:
                    _.run('Photoshop ' + '\"' + art_arr[cur_art_id].path + '\"');
                    break;
                case 635:
                    _.run('explorer /select,' + '\"' + art_arr[cur_art_id].path + '\"');
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

        if (feature_thumbs) {
            var thumbsMargin = g_properties.thumb_size + g_properties.thumb_margin;

            art_left_margin = (g_properties.show_thumbs && g_properties.thumb_position === pos.left) ? thumbsMargin : 0;
            art_top_margin = (g_properties.show_thumbs && g_properties.thumb_position === pos.top) ? thumbsMargin : 0;
            art_right_margin = (g_properties.show_thumbs && g_properties.thumb_position === pos.right) ? thumbsMargin : 0;
            art_bottom_margin = (g_properties.show_thumbs && g_properties.thumb_position === pos.bottom) ? thumbsMargin : 0;
        }

        var art_img_w = art.width,
            art_img_h = art.height;

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

        art_x = scale_x + art_left_margin;
        art_y = scale_y + art_top_margin;
        art_w = Math.max(0, Math.floor(art_img_w * scale));
        art_h = Math.max(0, Math.floor(art_img_h * scale));
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

    /////////////////////////////////////
    // Thumbs methods

    function reposition_thumbs() {
        var tx = that.x,
            ty = that.y,
            tw = that.w,
            th = that.h;

        switch (g_properties.thumb_position) {
            case pos.left:
                tw = that.h - g_properties.thumb_size;
                break;
            case pos.right:
                tx += that.w - g_properties.thumb_size;
                tw = that.w - g_properties.thumb_size;
                break;
            case pos.top:
                th = that.h - g_properties.thumb_size;
                break;
            case pos.bottom:
                ty += that.h - g_properties.thumb_size;
                th = that.h - g_properties.thumb_size;
                break;
        }

        create_thumb_objects(tx, ty, tw, th);
    }

    function coverSwitch(id) {
        if (!art_arr[id]) {
            return;
        }

        cur_art_id = id;

        reposition_art();
        that.repaint();
    }

    function create_thumb_objects(wx, wy, ww, wh) {
        if (thumbs) {
            thumbs.reset();
        }

        thumbs = new _.buttons();

        if (!g_properties.show_thumbs) {
            return;
        }

        var p = g_properties.thumb_padding;
        var vertical = (g_properties.thumb_position === pos.left || g_properties.thumb_position === pos.right);

        var x = wx,
            y = wy;
        var w = Math.min(g_properties.thumb_size, Math.floor(((vertical ? wh : ww) - 3 * p) / 4));
        var h = w;

        switch (g_properties.thumb_position) {
            case pos.left:
            case pos.right:
                y += Math.max(0, Math.floor(wh / 2 - (4 * w + 3 * p) / 2));
                break;
            case pos.top:
            case pos.bottom:
                x += Math.max(0, Math.floor(ww / 2 - (4 * w + 3 * p) / 2));
                break;
        }

        if (g_properties.show_thumbs) {
            thumbs.buttons.front = new _.button(x, y, w, h, thumb_imgs.Front, function () {coverSwitch(0);}, 'Front');

            x += (vertical ? 0 : (w + p));
            y += (vertical ? (w + p) : 0);
            thumbs.buttons.back = new _.button(x, y, w, h, thumb_imgs.Back, function () {coverSwitch(1);}, 'Back');

            x += (vertical ? 0 : (w + p));
            y += (vertical ? (w + p) : 0);
            thumbs.buttons.cd = new _.button(x, y, w, h, thumb_imgs.CD, function () {coverSwitch(2);}, 'CD');

            x += (vertical ? 0 : (w + p));
            y += (vertical ? (w + p) : 0);
            thumbs.buttons.artist = new _.button(x, y, w, h, thumb_imgs.Artist, function () {coverSwitch(3);}, 'Artist');
        }
    }

    function fill_thumb_image(btn, art) {
        var imgArr =
            {
                normal:  create_thumb_image(btn.w, btn.h, art, 0, btn.tiptext),
                hover:   create_thumb_image(btn.w, btn.h, art, 1, btn.tiptext),
                pressed: create_thumb_image(btn.w, btn.h, art, 2, btn.tiptext)
            };
        btn.set_image(imgArr);
    }

    function create_default_thumb_images() {
        var btn =
            {
                Front:  {
                    text: 'Front'
                },
                Back:   {
                    text: 'Back'
                },
                CD:     {
                    text: 'CD'
                },
                Artist: {
                    text: 'Artist'
                }
            };

        thumb_imgs = [];
        _.forEach(btn, function (item, i) {
            var stateImages = []; //0=normal, 1=hover, 2=down;

            for (var s = 0; s <= 2; s++) {
                stateImages[s] = create_thumb_image(g_properties.thumb_size, g_properties.thumb_size, 0, s, item.text);
            }

            thumb_imgs[i] =
                {
                    normal:  stateImages[0],
                    hover:   stateImages[1],
                    pressed: stateImages[2]
                };
        });
    }

    function create_thumb_image(bw, bh, art, state, btnText) {
        var w = bw,
            h = bh;

        var img = gdi.CreateImage(w, h);
        var g = img.GetGraphics();
        g.SetSmoothingMode(SmoothingMode.HighQuality);
        g.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);

        if (art && art.thumb_img) {
            g.DrawImage(art.thumb_img, 2, 2, w - 4, h - 4, 0, 0, art.thumb_img.Width, art.thumb_img.Height, 0, 230);

        }
        else {
            g.FillSolidRect(2, 2, w - 4, h - 4, panelsBackColor); // Cleartype is borked, if drawn without background
            var btn_text_format = g_string_format.align_center | g_string_format.trim_ellipsis_char | g_string_format.no_wrap;
            g.DrawString(btnText, gdi.font('Segoe Ui', 14), _.RGB(70, 70, 70), 0, 0, w, h, btn_text_format);
        }

        switch (state) {//0=normal, 1=hover, 2=down;
            case 0:
                g.DrawRect(0, 0, w - 1, h - 1, 1, frame_color);
                break;
            case 1:
                g.DrawRect(0, 0, w - 1, h - 1, 1, _.RGB(170, 172, 174));
                break;
            case 2:
                g.DrawRect(0, 0, w - 1, h - 1, 1, _.RGB(70, 70, 70));
                break;
        }

        img.ReleaseGraphics(g);
        return img;
    }

    function on_thumb_position_change() {
        reposition_thumbs();
        reposition_art();
        that.repaint();
    }

    // EO Thumbs methods
    /////////////////////////////////////

//public:
    this.x = undefined;
    this.y = undefined;
    this.w = undefined;
    this.h = undefined;

//private:
    var that = this;

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

    var pos =
        {
            left:   1,
            top:    2,
            right:  3,
            bottom: 4
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

    var thumbs;
    var thumb_imgs = [];

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
        g_properties.track_mode = Math.max(1, Math.min(3, g_properties.thumb_position));
        create_default_thumb_images();
    }

    if (feature_cycle) {
        g_properties.add_properties({
                enable_cycle:   ['user.cycle.enable', false],
                cycle_interval: ['user.cycle.interval', JSON.stringify([10000, 622])]
            }
        );
    }

    (function () {
        try {
            WshShell.RegRead("HKEY_CURRENT_USER\\Software\\Adobe\\Photoshop\\");
            has_photoshop = true;
        } catch (e) {
            has_photoshop = false;
        }
    })();
}
