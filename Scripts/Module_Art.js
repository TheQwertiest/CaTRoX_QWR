// ==PREPROCESSOR==
// @name "Art Module"
// @author "TheQwertiest & eXtremeHunter"
// ==/PREPROCESSOR==
g_properties.add_properties(
    {
        track_mode:         ["user.track_mode", 1],
        group_format_query: ["user.group_format", "%album artist%%album%%discnumber%"],
        use_disc_mask:      ["user.use_disc_mask", true]
    }
);
g_properties.track_mode = Math.max(1, Math.min(3, g_properties.track_mode));

function ArtModule(features_arg) {//(Most of the art handling code was done by eXtremeHunter)
//public:
    /////////////////////////////////////
    // Callback methods implementation
    this.paint = function (g) {
        var SF = StringFormat(1, 1, 3, 0x1000);
        var art = artArr[curArtId];

        g.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);

        if (art) {
            var x = this.x + artX,
                y = this.y + artY,
                w = artW,
                h = artH;
            var artImgWidth = art[1],
                artImgHeight = art[2];

            if (w + h > 10) {

                if (curArtId == artType.cd) {
                    g.DrawImage(art[0], x + 2, y + 2, w - 4, h - 4, 0, 0, artImgWidth, artImgHeight);

                    if (g_properties.use_disc_mask) {
                        g.SetSmoothingMode(SmoothingMode.HighQuality);
                        g.DrawEllipse(x, y, w - 1, h - 1, 1, frameColor);
                    }
                }
                else {
                    if (feature_border) {
                        g.DrawImage(art[0], x + 2, y + 2, w - 4, h - 4, 0, 0, artImgWidth, artImgHeight);
                        g.DrawRect(x, y, w - 1, h - 1, 1, frameColor);
                    }
                    else {
                        g.DrawImage(art[0], x, y, w, h, 0, 0, artImgWidth, artImgHeight);
                    }
                }
            }
        }
        else if (art === null) {
            var metadb = fb.IsPlaying ? fb.GetNowPlaying() : fb.GetFocusItem();
            if (metadb && (metadb.RawPath.indexOf("http://") == 0) && utils.CheckFont("Webdings")) {
                g.DrawString("\uF0BB", gdi.font("Webdings", 130, 0), _.RGB(70, 70, 70), this.x, this.y, this.w, this.h, SF);
            }
            else {
                g.DrawString(g_theme_name + " " + g_theme_version, gdi.font("Segoe Ui Semibold", 24, 0), _.RGB(70, 70, 70), this.x, this.y, this.w, this.h, StringFormat(1, 1));
            }
        }
        else {
            g.DrawString("LOADING", gdi.font("Segoe Ui Semibold", 24, 0), _.RGB(70, 70, 70), this.x, this.y, this.w, this.h, StringFormat(1, 1));
        }

        if (feature_thumbs && g_properties.show_thumbs) {
            fillThumbImage(thumbs.buttons.front, artArr[0]);
            fillThumbImage(thumbs.buttons.back, artArr[1]);
            fillThumbImage(thumbs.buttons.cd, artArr[2]);
            fillThumbImage(thumbs.buttons.artist, artArr[3]);

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
            recalculateThumbPosition();
        }
        recalculateArtPosition();
    };
    this.get_album_art_done = function (metadb, art_id, image, image_path) {
        if (art_id == 4) {
            art_id = artType.artist;
        }

        if (!image) {
            if (!!artArr[art_id] && curArtId == art_id) {
                artArr[art_id] = null;
                this.repaint();
            }
            else {
                artArr[art_id] = null;
            }
            return;
        }

        var artImgWidth = image.Width,
            artImgHeight = image.Height;

        if (art_id == artType.cd && artImgWidth != artImgHeight) {
            image = image.Resize(artImgWidth, artImgWidth, 0);
        }

        if (currentAlbum == fb.TitleFormat(g_properties.group_format_query).EvalWithMetadb(metadb)) {
            var isEmbedded = image_path.slice(image_path.lastIndexOf(".") + 1) == fb.TitleFormat("$ext(%path%)").EvalWithMetadb(metadb);

            artArr[art_id] = [image];
            artArr[art_id][1] = image.Width;
            artArr[art_id][2] = image.Height;
            if (feature_thumbs) {
                artArr[art_id][3] = image.Resize(g_properties.thumb_size, g_properties.thumb_size, 0);
            }
            artArr[art_id][4] = image_path;
            artArr[art_id][5] = isEmbedded;
        }

        if (g_properties.use_disc_mask && art_id == artType.cd) {
            var artWidth = image.Width,
                artHeight = image.Height,
                discMask = gdi.CreateImage(artWidth, artHeight),
                g = discMask.GetGraphics();
            g.FillSolidRect(0, 0, artWidth, artHeight, 0xffffffff);
            g.SetSmoothingMode(SmoothingMode.HighQuality);
            g.FillEllipse(1, 1, artWidth - 2, artHeight - 2, 0xff000000);
            discMask.ReleaseGraphics(g);
            artArr[art_id][0].ApplyMask(discMask);
            discMask.Dispose();
        }

        if (art_id == curArtId) {
            recalculateArtPosition(artArr[curArtId]);
            this.repaint();
        }
    };
    this.playlist_switch = function () {
        if (!fb.IsPlaying || track_mode == display.selected) {
            this.getAlbumArt();
        }
    };
    this.playlist_items_selection_change = function () {
        if (!fb.IsPlaying || track_mode == display.selected) {
            this.getAlbumArt();
        }
    };
    this.item_focus_change = function () {
        if (!fb.IsPlaying || track_mode == display.selected) {
            this.getAlbumArt();
        }
    };
    this.playback_new_track = function (metadb) {
        if (track_mode != display.selected) {
            this.getAlbumArt();
        }
    };
    this.playback_stop = function (reason) {
        if (reason != 2 && track_mode != display.selected) {
            this.getAlbumArt();
        }
    };
    this.mouse_move = function (x, y, m) {
        if ( feature_thumbs ) {
            thumbs.move(x, y);
        }
    };
    this.mouse_lbtn_down = function (x, y, m) {
        if ( feature_thumbs ) {
            thumbs.lbtn_down(x, y);
        }
    };
    this.mouse_lbtn_dblclk = function () {
        if (!artArr[curArtId]) {
            return;
        }

        try {
            WshShell.Run("\"" + artArr[curArtId][4] + "\"");

        } catch (e) {
            fb.trace(e);
        }
    };
    this.mouse_lbtn_up = function (x, y, m) {
        if ( feature_thumbs ) {
            thumbs.lbtn_up(x, y);
        }
    };
    this.mouse_wheel = function (delta) {
        var oldArtID = curArtId;

        do
        {
            if (delta == -1) {
                curArtId == artType.lastVal ? curArtId = artType.firstVal : curArtId++;
            }
            else if (delta == 1) {
                curArtId == artType.firstVal ? curArtId = artType.lastVal : curArtId--;
            }
        } while (oldArtID != curArtId && !artArr[curArtId]);

        if (oldArtID != curArtId) {
            recalculateArtPosition();
            this.repaint();
        }
    };
    this.mouse_leave = function () {
        if ( feature_thumbs ) {
            thumbs.leave();
        }
    };

    // End of Callback methods implementation
    /////////////////////////////////////

    this.getAlbumArt = function (metadb_arg) {
        var metadb = metadb_arg ? metadb_arg : getMetadb();
        if (!metadb) {
            if (metadb === null) {
                this.nullArt();
            }

            return;
        }

        currentAlbum = fb.TitleFormat(g_properties.group_format_query).EvalWithMetadb(metadb);
        if (oldAlbum == currentAlbum) {
            if (artArr[curArtId] === null) {
                this.repaint();
            }
            return;
        }

        curArtId = artType.defaultVal; // think about not changing art type when using reload
        artArr = [];
        this.repaint();
        window.ClearInterval(albumTimer);

        var artID = artType.firstVal;

        albumTimer = window.SetInterval(function () {
            utils.GetAlbumArtAsync(window.ID, metadb, (artID == artType.artist) ? artID = 4 : artID);

            if (artID >= artType.lastVal) {
                window.ClearInterval(albumTimer);
            }
            else {
                artID++;
            }
        }, 200);

        oldAlbum = currentAlbum;
    };

    this.reloadArt = function (metadb_arg) {
        oldAlbum = currentAlbum = undefined;

        var metadb = metadb_arg ? metadb_arg : undefined;
        this.getAlbumArt(metadb);
    };

    this.nullArt = function () {
        for (var i = 0; i < artArr.length; i++) {
            artArr[i] = null;
        }

        oldAlbum = currentAlbum = undefined;
        recalculateArtPosition();
        this.repaint();
    };

    this.appendMenu = function (cpm) {
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

        contextMenu.push(track, web);
        if (feature_thumbs) {
            contextMenu.push(thumbs);
        }
        if (feature_cycle) {
            contextMenu.push(cycle);
        }

        var metadb = getMetadb();

        if (feature_thumbs) {
            thumbs.AppendMenuItem(MF_STRING, 601, "Thumbs show");
            thumbs.CheckMenuItem(601, g_properties.show_thumbs);
            thumbs.AppendMenuSeparator();
            var mf_string = (g_properties.show_thumbs ? MF_STRING : MF_GRAYED);
            thumbs.AppendMenuItem(mf_string, 602, "Thumbs left");
            thumbs.AppendMenuItem(mf_string, 603, "Thumbs top");
            thumbs.AppendMenuItem(mf_string, 604, "Thumbs right");
            thumbs.AppendMenuItem(mf_string, 605, "Thumbs bottom");
            thumbs.CheckMenuRadioItem(602, 605, g_properties.thumb_position + 601);
            thumbs.AppendTo(cpm, MF_STRING, "Thumbs");
            cpm.AppendMenuSeparator();
        }

        track.AppendMenuItem(MF_STRING, 606, "Automatic (current selection/playing item)");
        track.AppendMenuItem(MF_STRING, 607, "Playing item");
        track.AppendMenuItem(MF_STRING, 608, "Current selection");
        track.CheckMenuRadioItem(606, 608, g_properties.track_mode + 605);
        track.AppendTo(cpm, MF_STRING, "Displayed track");

        if (feature_cycle) {
            cycle.AppendMenuItem(MF_STRING, 620, "Enable cycle");
            cycle.CheckMenuItem(620, g_properties.enable_cycle);
            cycle.AppendMenuSeparator();
            var grayIfNoCycle = (g_properties.enable_cycle ? MF_STRING : MF_GRAYED);
            cycle.AppendMenuItem(grayIfNoCycle, 621, "5 sec");
            cycle.AppendMenuItem(grayIfNoCycle, 622, "10 sec");
            cycle.AppendMenuItem(grayIfNoCycle, 623, "20 sec");
            cycle.AppendMenuItem(grayIfNoCycle, 624, "30 sec");
            cycle.AppendMenuItem(grayIfNoCycle, 625, "40 sec");
            cycle.AppendMenuItem(grayIfNoCycle, 626, "50 sec");
            cycle.AppendMenuItem(grayIfNoCycle, 627, "1 min");
            cycle.AppendMenuItem(grayIfNoCycle, 628, "2 min");
            cycle.AppendMenuItem(grayIfNoCycle, 629, "3 min");
            cycle.AppendMenuItem(grayIfNoCycle, 620, "4 min");
            cycle.AppendMenuItem(grayIfNoCycle, 631, "5 min");
            cycle.CheckMenuRadioItem(621, 631, JSON.parse(g_properties.cycle_interval)[1]);
            cycle.AppendTo(cpm, MF_STRING, "Cycle covers");
        }

        cpm.AppendMenuSeparator();
        cpm.AppendMenuItem(MF_STRING, 632, "Use disc mask");
        cpm.CheckMenuItem(632, g_properties.use_disc_mask);
        if (artArr[curArtId]) {
            cpm.AppendMenuItem((safeMode || (artArr[curArtId][5])) ? MF_GRAYED : MF_STRING, 633, "Open image");
            if (isPhotoshopAvailable) {
                cpm.AppendMenuItem((safeMode || (artArr[curArtId][5])) ? MF_GRAYED : MF_STRING, 634, "Open image with Photoshop");
            }
            cpm.AppendMenuItem(safeMode ? MF_GRAYED : MF_STRING, 635, "Open image folder");
        }

        cpm.AppendMenuItem(MF_STRING, 636, "Reload \tF5");

        //---> Weblinks
        cpm.AppendMenuSeparator();
        web.AppendMenuItem(MF_STRING, 650, "Google");
        web.AppendMenuItem(MF_STRING, 651, "Google Images");
        web.AppendMenuItem(MF_STRING, 652, "eCover");
        web.AppendMenuItem(MF_STRING, 653, "Wikipedia");
        web.AppendMenuItem(MF_STRING, 654, "YouTube");
        web.AppendMenuItem(MF_STRING, 655, "Last FM");
        web.AppendMenuItem(MF_STRING, 656, "Discogs");
        web.AppendTo(cpm, (safeMode || !metadb) ? MF_GRAYED : MF_STRING, "Weblinks");
    };

    this.executeMenu = function (idx) {
        var metadb = getMetadb();
        var selectedItm = getSelectedItem();

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
                    onCycleTimer(g_properties.enable_cycle, artArr.length);
                    break;
                case 621:
                    setInterval(5000, idx);
                    break;
                case 622:
                    setInterval(10000, idx);
                    break;
                case 623:
                    setInterval(20000, idx);
                    break;
                case 624:
                    setInterval(30000, idx);
                    break;
                case 625:
                    setInterval(40000, idx);
                    break;
                case 626:
                    setInterval(50000, idx);
                    break;
                case 627:
                    setInterval(60000, idx);
                    break;
                case 628:
                    setInterval(120000, idx);
                    break;
                case 629:
                    setInterval(180000, idx);
                    break;
                case 630:
                    setInterval(240000, idx);
                    break;
                case 631:
                    setInterval(300000, idx);
                    break;
                default:
                    idxFound = false;
            }

            function setInterval(iv, id) {
                g_properties.cycle_interval = JSON.stringify([iv, id]);

                onCycleTimer(g_properties.enable_cycle, artArr.length, true);
            }
        }

        if (!idxFound) {
            idxFound = true;
            switch (idx) {
                case 606:
                    g_properties.track_mode = display.auto;
                    fb.IsPlaying ? this.getAlbumArt(fb.GetNowPlaying()) : (selectedItm ? this.getAlbumArt(selectedItm) : nullArt());
                    break;
                case 607:
                    g_properties.track_mode = display.playing;
                    fb.IsPlaying ? this.getAlbumArt(fb.GetNowPlaying()) : nullArt();
                    break;
                case 608:
                    g_properties.track_mode = display.selected;
                    selectedItm ? this.getAlbumArt(selectedItm) : nullArt();
                    break;
                case 632:
                    g_properties.use_disc_mask = !g_properties.use_disc_mask;
                    this.reloadArt();
                    break;
                case 633:
                    try {
                        WshShell.Run("\"" + art_s.artArr[art_s.curArtId][4] + "\"");
                    } catch (e) { }
                    break;
                case 634:
                    try {
                        WshShell.Run("Photoshop " + "\"" + art_s.artArr[art_s.curArtId][4] + "\"");
                    } catch (e) { }
                    break;
                case 635:
                    try {
                        WshShell.Run("explorer /select," + "\"" + art_s.artArr[art_s.curArtId][4] + "\"");
                    } catch (e) { }
                    break;
                case 636:
                    this.reloadArt();
                    break;
                case 650:
                    link("google", metadb);
                    break;
                case 651:
                    link("googleImages", metadb);
                    break;
                case 652:
                    link("eCover", metadb);
                    break;
                case 653:
                    link("wikipedia", metadb);
                    break;
                case 654:
                    link("youTube", metadb);
                    break;
                case 655:
                    link("lastFM", metadb);
                    break;
                case 656:
                    link("discogs", metadb);
                    break;
                default:
                    idxFound = false;
            }
        }

        contextMenu.forEach(function (item) {
            item.dispose();
        });
        contextMenu = [];

        return idxFound;
    };

//private:
    function recalculateArtPosition() {
        var art = artArr[curArtId];
        if (!art) {
            return;
        }

        var artLeftMargin = 0;
        var artTopMargin = 0;
        var artRightMargin = 0;
        var artBottomMargin = 0;

        if (feature_thumbs) {
            var thumbsMargin = g_properties.thumb_size + g_properties.thumb_margin;

            artLeftMargin = (g_properties.show_thumbs && g_properties.thumb_position == pos.left) ? thumbsMargin : 0;
            artTopMargin = (g_properties.show_thumbs && g_properties.thumb_position == pos.top) ? thumbsMargin : 0;
            artRightMargin = (g_properties.show_thumbs && g_properties.thumb_position == pos.right) ? thumbsMargin : 0;
            artBottomMargin = (g_properties.show_thumbs && g_properties.thumb_position == pos.bottom) ? thumbsMargin : 0;
        }

        var artImgWidth = art[1],
            artImgHeight = art[2];

        var scaleX = 0,
            scaleY = 0,
            scaleW = ( that.w - artLeftMargin - artRightMargin ) / artImgWidth,
            scaleH = ( that.h - artTopMargin - artBottomMargin ) / artImgHeight,
            scale = Math.min(scaleW, scaleH);

        if (scaleW < scaleH) {
            scaleY = Math.floor((( that.h - artTopMargin - artBottomMargin ) - (artImgHeight * scale) ) / 2);
        }
        else if (scaleW > scaleH) {
            scaleX = Math.floor((( that.w - artLeftMargin - artRightMargin ) - (artImgWidth * scale) ) / 2);
        }

        artX = scaleX + artLeftMargin;
        artY = scaleY + artTopMargin;
        artW = Math.max(0, Math.floor(artImgWidth * scale));
        artH = Math.max(0, Math.floor(artImgHeight * scale));
    }

    function getMetadb() {
        var metadb = null;
        switch (track_mode) {
            case display.auto: {
                if (fb.IsPlaying) {
                    metadb = fb.GetNowPlaying();
                }
                else {
                    metadb = getSelectedItem();
                    if (!metadb) {
                        metadb = fb.GetFocusItem()
                    }
                }
                break;
            }
            case display.selected: {
                metadb = getSelectedItem();
                if (!metadb) {
                    metadb = fb.GetFocusItem()
                }
                break;
            }
            case display.playing: {
                if (fb.IsPlaying) {
                    metadb = fb.GetNowPlaying();
                }
                break;
            }
        }

        return metadb;
    }

    function getSelectedItem() {
        var apl = plman.ActivePlaylist;
        var metadb = null;

        for (var i = 0, l = plman.PlaylistItemCount(apl); i != l; i++) {
            if (plman.IsPlaylistItemSelected(apl, i)) {
                metadb = plman.GetPlaylistItems(apl).Item(i);
                break;
            }
        }

        return metadb;
    }

    function onCycleTimer(enable_cycle, artLength, restartCycle) {
        if (cycleTimerStarted && (!enable_cycle || !artArr[curArtId] || artLength <= 1 || restartCycle)) {
            cycleTimerStarted = false;
            window.ClearInterval(cycleTimer);
        }

        if (enable_cycle && !cycleTimerStarted && artLength > 1) {
            cycleTimerStarted = true;

            cycleTimer = window.SetInterval(function () {
                that.mouse_wheel(-1);
            }, JSON.parse(g_properties.cycle_interval)[0]);
        }
    }

    /////////////////////////////////////
    // Thumbs methods

    function recalculateThumbPosition() {
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

        createThumbObjects(tx, ty, tw, th);
    }

    function coverSwitch(id) {
        if (!artArr[id]) {
            return;
        }

        curArtId = id;

        recalculateArtPosition();
        that.repaint();
    }

    function createThumbObjects(wx, wy, ww, wh) {
        if (thumbs) {
            thumbs.reset();
        }

        thumbs = new _.buttons();

        if (!g_properties.show_thumbs) {
            return;
        }

        var p = g_properties.thumb_padding;
        var vertical = (g_properties.thumb_position == pos.left || g_properties.thumb_position == pos.right);

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
            thumbs.buttons.front = new _.button(x, y, w, h, thumbImages.Front, function () {coverSwitch(0);}, "Front");

            x += (vertical ? 0 : (w + p));
            y += (vertical ? (w + p) : 0);
            thumbs.buttons.back = new _.button(x, y, w, h, thumbImages.Back, function () {coverSwitch(1);}, "Back");

            x += (vertical ? 0 : (w + p));
            y += (vertical ? (w + p) : 0);
            thumbs.buttons.cd = new _.button(x, y, w, h, thumbImages.CD, function () {coverSwitch(2);}, "CD");

            x += (vertical ? 0 : (w + p));
            y += (vertical ? (w + p) : 0);
            thumbs.buttons.artist = new _.button(x, y, w, h, thumbImages.Artist, function () {coverSwitch(3);}, "Artist");
        }
    }

    function fillThumbImage(btn, art) {
        var imgArr =
            {
                normal: createThumbImage(btn.w, btn.h, art, 0, btn.tiptext),
                hover: createThumbImage(btn.w, btn.h, art, 1, btn.tiptext),
                pressed: createThumbImage(btn.w, btn.h, art, 2, btn.tiptext)
            };
        btn.set_image(imgArr);
    }

    function createDefaultThumbImages() {
        var btn =
            {
                Front: {
                    text: "Front"
                },
                Back: {
                    text: "Back"
                },
                CD: {
                    text: "CD"
                },
                Artist: {
                    text: "Artist"
                }
            };

        thumbImages = [];
        _.forEach(btn, function (item, i) {
            var stateImages = []; //0=normal, 1=hover, 2=down;

            for (var s = 0; s <= 2; s++) {
                stateImages[s] = createThumbImage(g_properties.thumb_size, g_properties.thumb_size, 0, s, item.text);
            }

            thumbImages[i] =
                {
                    normal: stateImages[0],
                    hover: stateImages[1],
                    pressed: stateImages[2]
                };
        });
    }

    function createThumbImage(bw, bh, art, state, btnText) {
        var w = bw,
            h = bh;

        var img = gdi.CreateImage(w, h);
        var g = img.GetGraphics();
        g.SetSmoothingMode(SmoothingMode.HighQuality);
        g.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);
        
        if (art && art[3]) {
            g.DrawImage(art[3], 2, 2, w - 4, h - 4, 0, 0, art[3].Width, art[3].Height, 0, 230);

        }
        else {
            g.FillSolidRect(2, 2, w - 4, h - 4, panelsBackColor); // Cleartype is borked, if drawn without background
            g.DrawString(btnText, gdi.font("Segoe Ui", 14, 0), _.RGB(70, 70, 70), 0, 0, w, h, StringFormat(1, 1, 3, 0x1000));
        }

        switch (state) {//0=normal, 1=hover, 2=down;
            case 0:
                g.DrawRect(0, 0, w - 1, h - 1, 1, frameColor);
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
        recalculateThumbPosition();
        recalculateArtPosition();
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
            front: 0,
            back: 1,
            cd: 2,
            artist: 3,

            defaultVal: 0,
            firstVal: 0,
            lastVal: 3
        };

    var display =
        {
            auto: 1,
            playing: 2,
            selected: 3
        };

    var pos =
        {
            left: 1,
            top: 2,
            right: 3,
            bottom: 4
        };

    var features = features_arg || [];
    var feature_border = _.includes(features, "borders");
    var feature_thumbs = _.includes(features, "thumbs");
    var feature_cycle = _.includes(features, "auto_cycle");
    var frameColor = panelsLineColor;
    var track_mode = g_properties.track_mode;

    var oldAlbum;
    var currentAlbum;
    var albumTimer;

    var artX = 0;
    var artY = 0;
    var artW = 0;
    var artH = 0;

    var curArtId = artType.defaultVal;
    var artArr = [];

    var contextMenu = [];

    var isPhotoshopAvailable;

    var thumbs;
    var thumbImages;

    var cycleTimerStarted = false;

    if (feature_thumbs) {
        g_properties.add_properties(
            {
                show_thumbs:    ["user.thumbs.show", false],
                thumb_margin:   ["user.thumbs.margin", 15],
                thumb_size:     ["user.thumbs.size", 50],
                thumb_padding:  ["user.thumbs.padding", 10],
                thumb_position: ["user.thumbs.position", 4]
            }
        );
        g_properties.track_mode = Math.max(1, Math.min(3, g_properties.thumb_position));
        createDefaultThumbImages();
    }

    if (feature_cycle) {
        g_properties.add_properties({
                enable_cycle:   ["user.cycle.enable", false],
                cycle_interval: ["user.cycle.interval", JSON.stringify([10000,622])]
            }
        );
    }

    (function () {
        try {
            WshShell.RegRead("HKEY_CURRENT_USER\\Software\\Adobe\\Photoshop\\");
            isPhotoshopAvailable = true;
        } catch (e) {
            isPhotoshopAvailable = false;
        }
    })();
}
