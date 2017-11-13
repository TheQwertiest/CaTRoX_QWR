// ==PREPROCESSOR==
// @name "Info Panel"
// @author "eXtremeHunter & TheQwertiest"
// ==/PREPROCESSOR==
g_properties.add_properties(
    {
        list_left_pad:       ["user.list.pad.left", 4],
        list_top_pad:        ["user.list.pad.top", 4],
        list_right_pad:      ["user.list.pad.right", 4],
        list_bottom_pad:     ["user.list.pad.bottom", 4],
        row_h:               ["user.row.height", 20],
        show_scrollbar:      ["user.scrollbar.show", true],
        scrollbar_right_pad: ["user.scrollbar.pad.right", 0],
        scrollbar_w:         ["user.scrollbar.width", utils.GetSystemMetrics(2)]
    }
);

g_properties.row_h = Math.max(10, g_properties.row_h);

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
        var track_info_format = g_string_format.align_center | g_string_format.trim_ellipsis_char | g_string_format.no_wrap;
        gr.DrawString("Track Info", gdi.font("Segoe Ui Semibold", 24, 0), _.RGB(70, 70, 70), 0, 0, ww, wh, track_info_format);
        return;
    }

    var info_text_format = g_string_format.v_align_center | g_string_format.trim_ellipsis_char | g_string_format.line_limit;

    var x = listX;
    var y = listY;
    var w = listW;
    var h = g_properties.row_h;
    var p = 5;

    var rowShift = Math.floor(listPos);
    var pixelShift = -Math.round((listPos - rowShift) * g_properties.row_h);

    if (rowShift && !pixelShift) {
        gr.DrawLine(x, y, x + w, y, 1, lineColorNormal);
    }

    {
        var curLine = rowShift;
        var ID = list[curLine];
        gr.DrawString(ID[0], infoNameFont, _.RGB(160, 162, 164), x + p, y + pixelShift, ID[2], h, info_text_format);
        gr.DrawString(ID[1], infoValueFont, panelsNormalTextColor, x + p + ID[2], y + pixelShift, w - ID[2] - x, h, info_text_format);

        if (curLine !== listLength - 1) {
            var lY = y + h;
            gr.DrawLine(x, lY + pixelShift, x + w, lY + pixelShift, 1, lineColorNormal);
        }

        y += h;
    }

    for (var i = 1; i < rowsToDraw - 1; i++) {
        var curLine = i + rowShift;
        var ID = list[curLine];
        gr.DrawString(ID[0], infoNameFont, _.RGB(160, 162, 164), x + p, y + pixelShift, ID[2], h, info_text_format);
        gr.DrawString(ID[1], infoValueFont, panelsNormalTextColor, x + p + ID[2], y + pixelShift, w - ID[2] - x, h, info_text_format);

        if (curLine !== listLength - 1) {
            var lY = y + h;
            gr.DrawLine(x, lY + pixelShift, x + w, lY + pixelShift, 1, lineColorNormal);
        }

        y += h;
    }

    {
        var curLine = rowsToDraw - 1 + rowShift;
        var ID = list[curLine];
        gr.DrawString(ID[0], infoNameFont, _.RGB(160, 162, 164), x + p, y + pixelShift, ID[2], h, info_text_format);
        gr.DrawString(ID[1], infoValueFont, panelsNormalTextColor, x + p + ID[2], y + pixelShift, w - ID[2] - x, h, info_text_format);

        curLine = rowsToDraw + rowShift;
        if (pixelShift && curLine < listLength) {
            var lY = y + h;
            gr.DrawLine(x, lY + pixelShift, x + w, lY + pixelShift, 1, lineColorNormal);

            y += h;

            ID = list[curLine];
            gr.DrawString(ID[0], infoNameFont, _.RGB(160, 162, 164), x + p, y + pixelShift, ID[2], h, info_text_format);
            gr.DrawString(ID[1], infoValueFont, panelsNormalTextColor, x + p + ID[2], y + pixelShift, w - ID[2] - x, h, info_text_format);
        }
    }

    gr.FillSolidRect(x, listY - g_properties.list_top_pad, listW, g_properties.list_top_pad, panelsBackColor);  // Top margin
    gr.FillSolidRect(x, listY + listH, listW, g_properties.list_bottom_pad, panelsBackColor); // Bottom margin


    var partialRowShift = listPos - rowShift;
    var difference = Math.ceil(windowSizeInRows) - windowSizeInRows;
    var listIsScrolledDown = listPos >= (listLength - rowsToDraw) && Math.abs(partialRowShift - difference) < 0.0001;
    var listIsScrolledUp = listPos === 0;

    if (!listIsScrolledUp) {
        gr.FillGradRect(listX, listY, listW, 7 + 1, 270, _.RGBtoRGBA(panelsBackColor, 0), _.RGBtoRGBA(panelsBackColor, 200));
    }

    if (!listIsScrolledDown) {
        gr.FillGradRect(listX, listY + listH - 8, listW, 7 + 1, 90, _.RGBtoRGBA(panelsBackColor, 0), _.RGBtoRGBA(panelsBackColor, 200));
    }

    if (g_properties.show_scrollbar && needsScrollbar) {
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

        if (metaName === "title" && (fb.IsPlaying && _.startsWith(metadb.RawPath,"http://"))) {
            inf = fb.TitleFormat("%title%").Eval();
        }
        else {
            inf = fileInfo.MetaValue(fileInfo.MetaFind(metaName), 0);
        }

        meta[i] = [((metaName === "www") ? metaName : metaName.toLowerCase().capitalize() + ":")];

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

    listX = g_properties.list_left_pad;
    listY = g_properties.list_top_pad;
    listH = Math.max(0, wh - listY - g_properties.list_bottom_pad);
    listW = Math.max(100, ww - listX - g_properties.list_right_pad);

    windowSizeInRows = Math.min(listLength, listH / g_properties.row_h);
    var rowsToDrawFull = Math.max(0, Math.floor(windowSizeInRows));

    if (listPos + rowsToDrawFull > listLength && listLength >= rowsToDrawFull) {
        listPos = listLength - rowsToDrawFull;
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
        if (g_properties.show_scrollbar) {
            listW -= g_properties.scrollbar_w - g_properties.scrollbar_right_pad;
        }

        var scrollbarX = window.Width - g_properties.scrollbar_w - g_properties.scrollbar_right_pad;
        var scrollbarY = g_properties.list_top_pad;
        var scrollbarH = window.Height - scrollbarY - g_properties.list_bottom_pad;

        if (scrollbar) {
            scrollbar.reset();
        }

        scrollbar = new _.scrollbar(scrollbarX, scrollbarY, g_properties.scrollbar_w, scrollbarH, g_properties.row_h, redrawListCallback);
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
    if (reason === 2) return;
    refreshList();
}

// =================================================== //

function on_mouse_move(x, y, m) {
    if (moveChecker.isSameMove(x, y, m)) {
        return;
    }

    qwr_utils.DisableSizing(m);

    if (needsScrollbar && g_properties.show_scrollbar) {
        scrollbar.move(x, y, m);
    }
}

// =================================================== //

function on_mouse_lbtn_down(x, y, m) {
    if (needsScrollbar && g_properties.show_scrollbar) {
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

    if (needsScrollbar && g_properties.show_scrollbar) {
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
    if (needsScrollbar && g_properties.show_scrollbar) {
        scrollbar.leave();
    }
}

// =================================================== //

function on_mouse_rbtn_up(x, y) {
    if (needsScrollbar && g_properties.show_scrollbar && scrollbar.trace(x, y)) {
        return scrollbar.rbtn_up(x, y);
    }

    var appear = window.CreatePopupMenu();
    var cpm = window.CreatePopupMenu();

    appear.AppendMenuItem(MF_STRING, 2, "Show scrollbar");
    appear.CheckMenuItem(2, g_properties.show_scrollbar);
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
            g_properties.show_scrollbar = !g_properties.show_scrollbar;
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
