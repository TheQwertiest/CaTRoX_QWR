// ==PREPROCESSOR==
// @name "Info Panel"
// @author "eXtremeHunter & TheQwertiest"
// ==/PREPROCESSOR==
properties.AddProperties(
    {
        listLeftMargin:   window.GetProperty("user.List Left", 4),
        listTopMargin:    window.GetProperty("user.List Top", 4),
        listRightMargin:  window.GetProperty("user.List Right", 4),
        listBottomMargin: window.GetProperty("user.List Bottom", 4),
        rowH:             window.GetProperty("user.Row Height", 20),
        showScrollbar:    window.GetProperty("user.Show Scrollbar", true),
        sbarRightMargin:  window.GetProperty("user.Scrollbar Right", 0),
        scrollbarW:       window.GetProperty("user.Scrollbar Width", utils.GetSystemMetrics(2))
    }
);
var minRowH = 10;
if (properties.rowH < minRowH) {
    properties.rowH = minRowH;
    window.SetProperty("user.Row Height", minRowH);
}

//--->
var listLength = 0;
var rowsToDraw = 0;
var windowSizeInRows = 0;

var list = [];
var listPos = 0;

//--->
var infoNameFont = gdi.font("Segoe Ui Semibold", 12, 0);
var infoValueFont = gdi.font("Segoe Ui", 12, 0);
var lineColorNormal = panelsLineColor;

var btnImg = [];
var scrollbar;
var needsScrollbar = false;

/// Reduce move
var moveChecker = new _.moveCheckReducer;

//===============================//

function on_paint(gr) {
    gr.FillSolidRect(0, 0, ww, wh, panelsBackColor);
    gr.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);

    if (!listLength) {
        gr.DrawString("Track Info", gdi.font("Segoe Ui Semibold", 24, 0), _.RGB(70, 70, 70), 0, 0, ww, wh, StringFormat(1, 1, 3, 0x1000));
        return;
    }

    var x = listX;
    var y = listY;
    var w = listW;
    var h = properties.rowH;
    var p = 5;

    var rowShift = Math.floor(listPos);
    var pixelShift = -Math.round((listPos - rowShift) * properties.rowH);

    if (rowShift && !pixelShift) {
        gr.DrawLine(x, y, x + w, y, 1, lineColorNormal);
    }

    {
        var curLine = rowShift;
        var ID = list[curLine];
        gr.DrawString(ID[0], infoNameFont, _.RGB(160, 162, 164), x + p, y + pixelShift, ID[2], h, StringFormat(0, 1, 3, 0x00002000));
        gr.DrawString(ID[1], infoValueFont, panelsNormalTextColor, x + p + ID[2], y + pixelShift, w - ID[2] - x, h, StringFormat(0, 1, 3, 0x00002000));

        if (curLine != listLength - 1) {
            var lY = y + h;
            gr.DrawLine(x, lY + pixelShift, x + w, lY + pixelShift, 1, lineColorNormal);
        }

        y += h;
    }

    for (var i = 1; i < rowsToDraw - 1; i++) {
        var curLine = i + rowShift;
        var ID = list[curLine];
        gr.DrawString(ID[0], infoNameFont, _.RGB(160, 162, 164), x + p, y + pixelShift, ID[2], h, StringFormat(0, 1, 3, 0x00002000));
        gr.DrawString(ID[1], infoValueFont, panelsNormalTextColor, x + p + ID[2], y + pixelShift, w - ID[2] - x, h, StringFormat(0, 1, 3, 0x00002000));

        if (curLine != listLength - 1) {
            var lY = y + h;
            gr.DrawLine(x, lY + pixelShift, x + w, lY + pixelShift, 1, lineColorNormal);
        }

        y += h;
    }

    {
        var curLine = rowsToDraw - 1 + rowShift;
        var ID = list[curLine];
        gr.DrawString(ID[0], infoNameFont, _.RGB(160, 162, 164), x + p, y + pixelShift, ID[2], h, StringFormat(0, 1, 3, 0x00002000));
        gr.DrawString(ID[1], infoValueFont, panelsNormalTextColor, x + p + ID[2], y + pixelShift, w - ID[2] - x, h, StringFormat(0, 1, 3, 0x00002000));

        curLine = rowsToDraw + rowShift;
        if (pixelShift && curLine < listLength) {
            var lY = y + h;
            gr.DrawLine(x, lY + pixelShift, x + w, lY + pixelShift, 1, lineColorNormal);

            y += h;

            ID = list[curLine];
            gr.DrawString(ID[0], infoNameFont, _.RGB(160, 162, 164), x + p, y + pixelShift, ID[2], h, StringFormat(0, 1, 3, 0x00002000));
            gr.DrawString(ID[1], infoValueFont, panelsNormalTextColor, x + p + ID[2], y + pixelShift, w - ID[2] - x, h, StringFormat(0, 1, 3, 0x00002000));
        }
    }

    gr.FillSolidRect(x, listY - properties.listTopMargin, listW, properties.listTopMargin, panelsBackColor);  // Top margin
    gr.FillSolidRect(x, listY + listH, listW, properties.listBottomMargin, panelsBackColor); // Bottom margin


    var partialRowShift = listPos - rowShift;
    var difference = Math.ceil(windowSizeInRows) - windowSizeInRows;
    var listIsScrolledDown = listPos >= (listLength - rowsToDraw) && Math.abs(partialRowShift - difference) < 0.0001;
    var listIsScrolledUp = listPos == 0;

    if (!listIsScrolledUp) {
        gr.FillGradRect(listX, listY, listW, 7 + 1, 270, _.RGBtoRGBA(panelsBackColor, 0), _.RGBtoRGBA(panelsBackColor, 200));
    }

    if (!listIsScrolledDown) {
        gr.FillGradRect(listX, listY + listH - 8, listW, 7 + 1, 90, _.RGBtoRGBA(panelsBackColor, 0), _.RGBtoRGBA(panelsBackColor, 200));
    }

    if (properties.showScrollbar && needsScrollbar) {
        var scrollTrackColor = _.RGB(37, 37, 37); // must be without alpha channel when cleartype font is used
        var m = 2;
        gr.FillSolidRect(scrollbar.x + m, scrollbar.y, scrollbar.w - m * 2, scrollbar.h, scrollTrackColor);
        scrollbar.paint(gr);
    }
}

//===============================//

function redrawListCallback() {
    listPos = scrollbar.scroll;
    window.Repaint();
}

function on_size() {
    ww = window.Width;
    wh = window.Height;

    listOnSize();
}

function listOnSize() {
    if (!ww || !wh) {// might be 0, probably because of Panel Stack switch
        return;
    }

    list = [];
    var meta = [];
    var info = [];
    listLength = 0;

    var metadb = fb.IsPlaying ? fb.GetNowPlaying() : fb.GetFocusItem();
    if (!metadb)
        return;

    var fileInfo = metadb.GetFileInfo();

    var inf;
    var img = gdi.CreateImage(1, 1);
    var g = img.GetGraphics();

    for (var i = 0; i < fileInfo.MetaCount; i++) {
        var metaName = fileInfo.MetaName(i);

        if (metaName == "title" && (fb.IsPlaying && metadb.RawPath.indexOf("http://") == 0)) {
            inf = fb.TitleFormat("%title%").Eval();
        }
        else {
            inf = fileInfo.MetaValue(fileInfo.MetaFind(metaName), 0);
        }

        meta[i] = [((metaName == "www") ? metaName : metaName.toLowerCase().capitalize() + ":")];

        meta[i][1] = inf;
        meta[i][2] = Math.ceil(g.MeasureString(meta[i][0], infoNameFont, 0, 0, 0, 0).Width) + 5;
    }

    for (var i = 0; i < fileInfo.InfoCount; i++) {
        var infoName = fileInfo.InfoName(i);

        info[i] = [infoName.toLowerCase().capitalize() + ":"];
        info[i][1] = fileInfo.InfoValue(fileInfo.InfoFind(infoName));
        info[i][2] = Math.ceil(g.MeasureString(info[i][0], infoNameFont, 0, 0, 0, 0).Width) + 5;

    }

    list = list.concat(meta, info);

    listLength = list.length;

    img.ReleaseGraphics(g);
    img.Dispose();

    listX = properties.listLeftMargin;
    listY = properties.listTopMargin;
    listH = Math.max(0, wh - listY - properties.listBottomMargin);
    listW = Math.max(100, ww - listX - properties.listRightMargin);

    windowSizeInRows = Math.min(listLength, listH / properties.rowH);
    var rowsToDrawFull = Math.max(0, Math.floor(windowSizeInRows));

    if (listPos + rowsToDrawFull > listLength && listLength >= rowsToDrawFull) {
        listPos = listLength - rowsToDrawFull;
        window.SetProperty("system.Playlist Step", listPos.toString());
    }

    if (listLength > rowsToDrawFull) {
        needsScrollbar = true;
        rowsToDraw = Math.ceil(windowSizeInRows);
    }
    else {
        needsScrollbar = false;
        rowsToDraw = rowsToDrawFull;
    }

    if (needsScrollbar) {
        if (properties.showScrollbar) {
            listW -= properties.scrollbarW - properties.sbarRightMargin;
        }

        var scrollbarX = window.Width - properties.scrollbarW - properties.sbarRightMargin;
        var scrollbarY = properties.listTopMargin;
        var scrollbarH = window.Height - scrollbarY - properties.listBottomMargin;

        if (scrollbar) {
            scrollbar.reset();
        }

        scrollbar = new _.scrollbar(scrollbarX, scrollbarY, properties.scrollbarW, scrollbarH, properties.rowH, redrawListCallback);
        scrollbar.set_window_param(windowSizeInRows, listLength);

        scrollbar.scroll_to(listPos);
    }
}

// =================================================== //

function on_playlist_items_selection_change() {
    if (fb.IsPlaying) return;
    refreshList();
}

// =================================================== //

function on_playlists_changed() {
    if (fb.IsPlaying) return;
    refreshList();
}

// =================================================== //

function on_playlist_switch() {
    if (fb.IsPlaying) return;
    refreshList();
}

// =================================================== //

function on_playlist_items_added() {
    refreshList();
}

// =================================================== //

function on_playlist_items_removed() {
    refreshList();
}

// =================================================== //

function on_playback_new_track(metadb) {
    refreshList();
}

// =================================================== //

function on_metadb_changed(handles, fromhook) {
    refreshList();
}

// =================================================== //

function on_playback_stop(reason) {
    if (reason == 2) return;
    refreshList();
}

// =================================================== //

function on_mouse_move(x, y, m) {
    if (moveChecker.isSameMove(x, y, m)) {
        return;
    }

    qwr_utils.DisableSizing(m);

    if (needsScrollbar && properties.showScrollbar) {
        scrollbar.move(x, y, m);
    }
}

// =================================================== //

function on_mouse_lbtn_down(x, y, m) {
    if (needsScrollbar && properties.showScrollbar) {
        scrollbar.lbtn_dn(x, y, m);
    }
}

// =================================================== //

function on_playback_dynamic_info_track() {
    refreshList();
}

// =================================================== //

function on_mouse_lbtn_dblclk(x, y, m) {
    on_mouse_lbtn_down(x, y, m)
}

// =================================================== //

function on_mouse_lbtn_up(x, y, m) {
    qwr_utils.EnableSizing(m);

    if (needsScrollbar && properties.showScrollbar) {
        scrollbar.lbtn_up(x, y, m);
    }
}

// =================================================== //

function on_mouse_wheel(delta) {
    if (needsScrollbar) {
        scrollbar.wheel(delta);
    }
}

// =================================================== //

function on_mouse_leave() {
    if (needsScrollbar && properties.showScrollbar) {
        scrollbar.leave();
    }
}

// =================================================== //

function on_mouse_rbtn_up(x, y) {
    if (needsScrollbar && properties.showScrollbar && scrollbar.trace(x, y)) {
        return scrollbar.rbtn_up(x, y);
    }

    var appear = window.CreatePopupMenu();
    var cpm = window.CreatePopupMenu();

    appear.AppendMenuItem(MF_STRING, 2, "Show scrollbar");
    appear.CheckMenuItem(2, properties.showScrollbar);
    appear.AppendTo(cpm, MF_STRING, "Appearance");

    cpm.AppendMenuItem(fb.IsPlaying ? MF_STRING : MF_GRAYED, 1, "Properties");

    if (utils.IsKeyPressed(VK_SHIFT)) {
        _.appendDefaultContextMenu(cpm);
    }

    var id = cpm.TrackPopupMenu(x, y);
    switch (id) {
        case 1:
            fb.RunContextCommand("Properties");
            break;
        case 2:
            properties.showScrollbar = !properties.showScrollbar;
            window.SetProperty("user.Show Scrollbar", properties.showScrollbar);
            refreshList();
            break;
        default:
            _.executeDefaultContextMenu(id, scriptFolder + "Panel_Info.js");
    }

    _.dispose(cpm);
    return true;
}

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

// =================================================== //

function refreshList() {
    listOnSize();

    if (!listLength) {// No need to redraw, if we have nothing new to offer
        return;
    }

    window.Repaint();
}
