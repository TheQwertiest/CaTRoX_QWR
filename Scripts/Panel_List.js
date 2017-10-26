// ==PREPROCESSOR==
// @name "List Panel"
// @author "eXtremeHunter & TheQwertiest"
// ==/PREPROCESSOR==

var trace_call = false;
properties.AddProperties(
    {
        listLeftMargin:   window.GetProperty("user.List Left", 0),
        listTopMargin:    window.GetProperty("user.List Top", 0),
        listRightMargin:  window.GetProperty("user.List Right", 0),
        listBottomMargin: window.GetProperty("user.List Bottom", 0),

        showScrollbar:   window.GetProperty("user.Show Scrollbar", true),
        sbarRightMargin: window.GetProperty("user.Scrollbar Right", 0),
        scrollbarW:      window.GetProperty("user.Scrollbar Width", utils.GetSystemMetrics(2)),

        rowH:               window.GetProperty("user.Row Height", 20),
        rowsInGroup:        window.GetProperty("user.Rows In Group", 4),
        rowsInCompactGroup: window.GetProperty("user.Rows In Compact Group", 2),

        showPlayCount:         window.GetProperty("user.Show Play Count", _.cc("foo_playcount")),
        showRating:            window.GetProperty("user.Show Rating", _.cc("foo_playcount")),
        showAlbumArt:          window.GetProperty("user.Show Album Art", true),
        autoAlbumArt:          window.GetProperty("user.Auto Album Art", false),
        showGroupInfo:         window.GetProperty("user.Show Group Info", true),
        showGroupHeader:       window.GetProperty("user.Show Group Header", true),
        useCompactGroupHeader: window.GetProperty("user.Use Compact Group Header", false),

        showFocusItem: window.GetProperty("user.Show Focus Item", false),
        showQueueItem: window.GetProperty("user.Show Queue Item", true),

        gUserDefined: window.GetProperty("user.GroupBy", ""),
        groupFormat:  window.GetProperty("system.GroupBy", "%album artist%%album%%discnumber%"),
        groupedID:    window.GetProperty("system.properties.groupedID", 3),

        autoExpandCollapseGroups: window.GetProperty("user.Auto Expand/Collapse Groups", false),
        alternateRowColor:        window.GetProperty("user.Alternate Row Color", false),
        skipLessThan:             window.GetProperty("user.Skip Less Than", 2),
        enableSkip:               window.GetProperty("user.Skip Enable", false),

        useTagRating:                 window.GetProperty("user.Use Tag Rating", false),
        showPlaylistInfo:             window.GetProperty("user.Show Playlist Info", true),
        autoCollapseOnPlaylistSwitch: window.GetProperty("user.Auto Collapse On Playlist Switch", false),
        collapseOnStart:              window.GetProperty("user.Collapse On Start", false)
    }
);
if (properties.rowsInGroup < 0) {
    properties.rowsInGroup = 0;
    window.SetProperty("user.Rows In Group", 0);
}
if (properties.rowsInCompactGroup < 0) {
    properties.rowsInCompactGroup = 0;
    window.SetProperty("user.Rows In Compact Group", 0);
}
var minRowH = 10;
if (properties.rowH < minRowH) {
    properties.rowH = minRowH;
    window.SetProperty("user.Row Height", minRowH);
}
if (properties.groupedID == 5) {
    properties.groupFormat = properties.gUserDefined;
    window.SetProperty("system.GroupBy", properties.groupFormat);
}

var pl_s =
    {
        // Scrollbar
        needsScrollbar:       false,
        isScrollbarDisplayed: false,

        // Scroll
        listPos:            [],
        listIsScrolledUp:   false,
        listIsScrolledDown: false,
        curRowShift:        0,
        curPixelShift:      0,

        // Control
        fastScrollActive:  false,
        rowDrag:           false,
        fileDrag:          false,
        makeSelectionDrag: false,
        linkToLastItem:    false,
        keyPressed:        false,
        clickedOnGroup:    false,

        itemDropped:      false,
        playlistDuration: 0,
        selectionLength:  0,

        // List size & pos
        listLength:              0,
        listX:                   0,
        listY:                   0,
        listW:                   0,
        listH:                   0,
        windowSizeInRows:        0,
        rowsToDraw:              0,
        rowsToDrawWhenZeroShift: 0,

        // Print screen management
        playlistImg:         undefined,
        playlistImgFirstRow: -1,
        playlistImgLastRow:  -1,
        playlistImgYShift:   undefined,
        redrawEverything:    true,
    };

var curRowsInGroup = properties.useCompactGroupHeader ? properties.rowsInCompactGroup : properties.rowsInGroup;

var componentPlayCount = _.cc("foo_playcount");
var componentUtils = _.cc("foo_utils");

// Evaluators
var gArtist = "%album artist%";
var gArtistAlbum = "%album artist%%album%";
var gArtistAlbumDiscnumber = "%album artist%%album%%discnumber%";
var gPath = "$directory_path(%path%)";
var gDate = "%date%";

var showNowPlayingCalled = false;
var collapsedOnStart = false;
//--->
var wh = 0,
    ww = 0;
var panelFocus;
var focusGroupNr = -1;
var tempFocusItemIndex;

var selectedIndexes = [];

//--->
var AlbumArtId =
    {
        front:  0,
        back:   1,
        disc:   2,
        icon:   3,
        artist: 4
    };
// =================================================== //
//---> Fonts
var pl_fonts = {
    titleNormal:   gdi.font("Segoe Ui", 12, 0),
    titleSelected: gdi.font("Segoe Ui Semibold", 12, 0),
    titlePlaying:  gdi.font("Segoe Ui Semibold", 12, 0),

    artistNormal:         gdi.font("Segoe Ui Semibold", 18, 0),
    artistPlaying:        gdi.font("Segoe Ui Semibold", 18, 0 | 4),
    artistCompactNormal:  gdi.font("Segoe Ui Semibold", 15, 0),
    artistCompactPlaying: gdi.font("Segoe Ui Semibold", 15, 0 | 4),

    playCount:      gdi.font("Segoe Ui", 9, 0),
    album:          gdi.font("Segoe Ui Semibold", 15, 0),
    date:           gdi.font("Segoe UI Semibold", 16, 1),
    dateCompact:    gdi.font("Segoe UI Semibold", 15, 0),
    info:           gdi.font("Segoe Ui", 11, 0),
    cover:          gdi.font("Segoe Ui Semibold", 11, 0),
    ratingNotRated: gdi.font("Segoe Ui Symbol", 14),
    ratingRated:    gdi.font("Segoe Ui Symbol", 16)
};

var pl_colors = {};
//---> Common
pl_colors.background = panelsBackColor;
//---> Group Colors
pl_colors.groupTitle = _.RGB(180, 182, 184);
pl_colors.groupTitleSelected = pl_colors.groupTitle;
pl_colors.artistNormal = pl_colors.groupTitle;
pl_colors.artistPlaying = pl_colors.artistNormal;
pl_colors.albumNormal = _.RGB(130, 132, 134);
pl_colors.albumPlaying = pl_colors.albumNormal;
pl_colors.infoNormal = _.RGB(130, 132, 134);
pl_colors.infoPlaying = pl_colors.infoNormal;
pl_colors.dateNormal = _.RGB(130, 132, 134);
pl_colors.datePlaying = pl_colors.dateNormal;
pl_colors.lineNormal = panelsLineColor;
pl_colors.linePlaying = pl_colors.lineNormal;
pl_colors.lineSelected = panelsLineColorSelected;
//---> Item Colors
pl_colors.titleSelected = _.RGB(160, 162, 164);
pl_colors.titlePlaying = _.RGB(255, 165, 0);
pl_colors.titleNormal = panelsNormalTextColor;
pl_colors.countNormal = _.RGB(120, 122, 124);
pl_colors.countSelected = pl_colors.titleSelected;
pl_colors.countPlaying = pl_colors.titlePlaying;
//---> Row Colors
pl_colors.rowSelected = _.RGB(35, 35, 35);
pl_colors.rowAlternate = _.RGB(35, 35, 35);
pl_colors.rowFocusSelected = panelsLineColorSelected;
pl_colors.rowFocusNormal = _.RGB(80, 80, 80);
pl_colors.rowQueued = _.RGBA(150, 150, 150, 0);

var artAlpha = 220;

//--->


// Tunable vars
var listInfoHeight = 24;
var pssGap = 2;
var ratingBtnW = 14;

// Internal vars
var sbarImgs = [];
var scrollbar;

/// CPU usage reduction vars
var moveChecker = new _.moveCheckReducer;


createScrollbarButtonImages();

// To minimize CPU usage on_paint saves rendered image and redraws only parts of it.
// This is especially noticeable when scrolling: with old rendering mechanism (i.e. always redrawing)
// CPU usage was as high as 45% on overclocked Intel i5-2500K; now it uses no more than 10% on the same CPU.
function on_paint(gr) {

    gr.FillSolidRect(0, 0, ww, wh, pl_colors.background);

    var somethingToRedraw = pl_s.redrawEverything || need_to_redraw();
    if (somethingToRedraw) {
        var tmpImg = gdi.CreateImage(ww, wh);
        g = tmpImg.GetGraphics();

        g.FillSolidRect(0, 0, ww, wh, pl_colors.background);
        var playlistShifted = pl_s.redrawEverything;
        if (pl_s.playlistImg && !pl_s.redrawEverything) {
            trace_call && fb.trace("on_paint_part");

            if (pl_s.playlistImgYShift == undefined) {
                pl_s.playlistImgYShift = 0;
            }

            if (Math.abs(pl_s.playlistImgYShift) < pl_s.listH) {
                var prevImg = pl_s.playlistImg;
                g.DrawImage(prevImg, pl_s.listX, pl_s.listY, pl_s.listW, pl_s.listH, pl_s.listX, pl_s.listY + pl_s.playlistImgYShift, pl_s.listW, pl_s.listH, 0, 255);
                prevImg.Dispose();
            }
            else {// No point to redraw almost all rows, so redraw everything
                pl_s.redrawEverything = true;
            }

            if (pl_s.playlistImgYShift != 0) {
                playlistShifted = true;
                pl_s.playlistImgYShift = 0;
            }
        }
        else {
            trace_call && fb.trace("on_paint_full");
            pl_s.playlistImgYShift = 0;
        }

        draw_playlist(g, playlistShifted);

        pl_s.playlistImgFirstRow = pl_s.curRowShift;
        pl_s.playlistImgLastRow = pl_s.curRowShift + pl_s.rowsToDraw - 1;

        if (properties.showPlaylistInfo) {
            draw_playlist_info(g);
            g.FillSolidRect(0, pl_s.listY - properties.listTopMargin - pssGap, ww, pssGap, pssBackColor);  // Pss margin
        }

        g.FillSolidRect(pl_s.listX, pl_s.listY - properties.listTopMargin, pl_s.listW, properties.listTopMargin, panelsBackColor);  // Top margin
        g.FillSolidRect(pl_s.listX, pl_s.listY + pl_s.listH, pl_s.listW, properties.listBottomMargin, panelsBackColor); // Bottom margin

        tmpImg.ReleaseGraphics(g);
        pl_s.playlistImg = tmpImg;
    }
    else {
        trace_call && fb.trace("on_paint_nothing")
    }

    if (pl_s.redrawEverything) {
        pl_s.redrawEverything = false;
    }

    gr.DrawImage(pl_s.playlistImg, 0, 0, ww, wh, 0, 0, ww, wh, 0, 255);

    if (pl_s.isScrollbarDisplayed) {
        var scrollTrackColor = _.RGB(37, 37, 37); // must be without alpha channel when cleartype font is used
        var m = 2;
        gr.FillSolidRect(scrollbar.x + m, scrollbar.y, scrollbar.w - m * 2, scrollbar.h, scrollTrackColor);
        scrollbar.paint(gr);
    }
}

function need_to_redraw() {
    var somethingToRedraw = false;
    for (var i = pl_s.rowsToDraw - 1; i != -1; i--) {
        var ID = list_modded[i + pl_s.curRowShift];

        if (ID.isChanged) {
            somethingToRedraw = true;

            if ((i + pl_s.curRowShift - 1) >= 0) {// Selection rectangle fix (rectangle is larger than rowH)
                var prevID = list_modded[i + pl_s.curRowShift - 1];
                if (prevID.isGroupHeader || plman.IsPlaylistItemSelected(activeList, prevID.nr)) {
                    prevID.isChanged = true;
                }
            }
        }
    }

    return somethingToRedraw;
}

function draw_playlist(gr, playlistShifted) {
    gr.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);

    if (pl_s.listLength) {
        var playlistDrawData = {
            rowX: pl_s.listX,
            rowY: 0,
            rowW: pl_s.listW,
            rowH: properties.rowH,
            idx:  0,
            ID:   0,

            playingID: (plman.PlayingPlaylist == activeList) ? plman.GetPlayingItemLocation().PlaylistItemIndex : undefined,
            focusID:   plman.GetPlaylistFocusItemIndex(activeList),

            queueIndexes:    [],
            queueIndexCount: [],
            headerChanged:   [],
            tempGroupNr:     -1
        };

        for (var i = 0; i != pl_s.rowsToDraw; i++) {
            var ID = list_modded[i + pl_s.curRowShift];
            if (ID.isGroupHeader && ID.isChanged) {
                playlistDrawData.headerChanged[ID.groupNr] = true;
            }
        }

        var redrawTopGradient = false,
            redrawBottomGradient = false;
        if (!pl_s.listIsScrolledUp && (playlistShifted || list_modded[pl_s.curRowShift].isChanged || list_modded[1 + pl_s.curRowShift].isChanged )) {
            list_modded[pl_s.curRowShift].isChanged = list_modded[1 + pl_s.curRowShift].isChanged = true;
            redrawTopGradient = true;
        }
        if (!pl_s.listIsScrolledDown && (playlistShifted || list_modded[pl_s.rowsToDraw - 1 + pl_s.curRowShift].isChanged || list_modded[pl_s.rowsToDraw - 2 + pl_s.curRowShift].isChanged)) {
            list_modded[pl_s.rowsToDraw - 1 + pl_s.curRowShift].isChanged = list_modded[pl_s.rowsToDraw - 2 + pl_s.curRowShift].isChanged = true;
            redrawBottomGradient = true;
        }

        //--->
        for (var i = pl_s.rowsToDraw - 1; i != -1; i--) {
            playlistDrawData.idx = i;
            playlistDrawData.ID = list_modded[i + pl_s.curRowShift];
            playlistDrawData.rowY = rows[i].y + pl_s.curPixelShift;

            if (playlistDrawData.ID.isGroupHeader) {
                draw_group(gr, playlistDrawData);
            }
            else {
                draw_row(gr, playlistDrawData);
            }
        }

        if (redrawTopGradient && !pl_s.listIsScrolledUp) {
            g.FillGradRect(pl_s.listX, pl_s.listY - 1, pl_s.listW, 7 + 1, 270, _.RGBtoRGBA(panelsBackColor, 0), _.RGBtoRGBA(panelsBackColor, 200));
        }
        if (redrawBottomGradient && !pl_s.listIsScrolledDown) {
            g.FillGradRect(pl_s.listX, pl_s.listY + pl_s.listH - 8, pl_s.listW, 7 + 1, 90, _.RGBtoRGBA(panelsBackColor, 0), _.RGBtoRGBA(panelsBackColor, 200));
        }
    }
    else { //eo ifListLength
        var text = "Drag some tracks here";

        if (plman.PlaylistCount) {
            text = "Playlist: " + plman.GetPlaylistName(activeList) + "\n<--- Empty --->";
        }

        gr.DrawString(text, gdi.font("Segoe Ui", 16, 0), _.RGB(80, 80, 80), 0, 0, ww, wh, StringFormat(1, 1));
    }
}

function draw_group(gr, drawData) {
    var ID = drawData.ID,
        rowX = drawData.rowX,
        rowY = drawData.rowY,
        rowW = drawData.rowW,
        rowH = drawData.rowH,
        playingID = drawData.playingID;

    var groupNr = ID.groupNr;

    if (!pl_s.redrawEverything && !drawData.headerChanged[groupNr]) {
        if (ID.isChanged) {
            ID.isChanged = false;
        }
        return;
    }

    drawData.headerChanged[groupNr] = false;
    ID.isChanged = false;
    //gr.FillSolidRect(rowX, rowY, rowW, rowH, pl_colors.background);

    var metadb = ID.metadb;
    var selectedGroup = isGroupSelected(groupNr);
    //--->

    var artistColor = pl_colors.artistNormal;
    var albumColor = pl_colors.albumNormal;
    var infoColor = pl_colors.infoNormal;
    var dateColor = pl_colors.dateNormal;
    var lineColor = pl_colors.lineNormal;
    var dateFont = properties.useCompactGroupHeader ? pl_fonts.dateCompact : pl_fonts.date;
    var artistFont = properties.useCompactGroupHeader ? pl_fonts.artistCompactNormal : pl_fonts.artistNormal;

    if (IsGroupPlaying(groupNr, playingID)) {
        artistColor = pl_colors.artistPlaying;
        albumColor = pl_colors.albumPlaying;
        infoColor = pl_colors.infoPlaying;
        dateColor = pl_colors.datePlaying;
        lineColor = pl_colors.linePlaying;

        artistFont = properties.useCompactGroupHeader ? pl_fonts.artistCompactPlaying : pl_fonts.artistPlaying;
    }
    if (selectedGroup) {
        lineColor = pl_colors.lineSelected;
        artistColor = albumColor = dateColor = infoColor = pl_colors.groupTitleSelected;
    }

    //--->

    if (groupNr != drawData.tempGroupNr) {
        //var clipY = rowY + 1;
        //var clipH = drawData.visibleGroupRows[groupNr].count * properties.rowH - 1;
        var clipY = rowY + 1 - ((ID.rowNr - 1) * properties.rowH);
        var clipH = curRowsInGroup * properties.rowH - 1;
        var clipImg = gdi.CreateImage(pl_s.listW, clipH);
        var g = clipImg.GetGraphics();

        gr.FillSolidRect(rowX, clipY - 1, rowW, clipH + 1, pl_colors.background);

        var groupY;
        //(i == 0 && ID.rowNr > 1) ? groupY = -((ID.rowNr - 1) * properties.rowH) : groupY = -1;
        groupY = -1;
        var groupH = curRowsInGroup * properties.rowH;

        if (properties.useCompactGroupHeader) {
            //--->
            g.FillSolidRect(0, groupY, rowW, groupH, pl_colors.background); // Solid background for ClearTypeGridFit text rendering
            if (selectedGroup) {
                g.FillSolidRect(0, groupY, rowW, groupH, pl_colors.rowSelected);
            }

            g.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);

            if (isCollapsed[groupNr] && focusGroupNr == groupNr) {
                g.DrawRect(2, groupY + 2, rowW - 4, groupH - 4, 1, lineColor);
            }

            //************************************************************//

            var leftPad = 10;
            var path = _.tf("%path%", metadb);

            var radio = _.startsWith(path, 'http');

            //---> DATE
            var date = _.tf("%date%", metadb);
            if (date == "?" && radio) {
                date = "";
            }
            var dateW = Math.ceil(gr.MeasureString(date, dateFont, 0, 0, 0, 0).Width + 5);
            var dateX = rowW - dateW - 5;
            var dateY = groupY;
            var dateH = groupH;

            if (properties.groupedID) {
                (dateX > leftPad) && g.DrawString(date, dateFont, dateColor, dateX, dateY, dateW, dateH, StringFormat(0, 1));
            }
            //---> ARTIST
            var artistX = leftPad;
            var artistW = dateX - leftPad - 5;
            var artistH = groupH;

            var artist = _.tf("$if($greater($len(%album artist%),0),%album artist%,%artist%)", metadb);
            //trace(artist.length());
            if (artist == "?" && radio) {
                artist = "Radio Stream";
            }

            g.DrawString(artist, artistFont, artistColor, artistX, groupY, artistW, artistH, StringFormat(0, 1, 3, 0x1000));

            var artistStringW = Math.ceil(gr.MeasureString(artist, artistFont, 0, 0, 0, 0).Width);

            //---> ALBUM
            if (properties.groupedID) {
                var albumX = artistX + artistStringW;
                var albumW = dateX - leftPad - artistStringW - 5;
                if (albumW > 0) {
                    var albumH = groupH;
                    var albumY = groupY;

                    var album = _.tf(" - %album%[ - %ALBUMSUBTITLE%]", metadb);
                    if (album == "?" && radio) {
                        album = "";
                    }

                    g.DrawString(album, pl_fonts.album, albumColor, albumX, albumY, albumW, albumH, StringFormat(0, 1, 3, 0x1000));
                }
            }
        }
        else {
            var art = artArray[ID.groupNr];
            var p = 6,
                artX = (properties.showAlbumArt && (properties.autoAlbumArt ? art !== null : true)) ? p : 0,
                artY = groupY + p,
                artW = (properties.showAlbumArt && (properties.autoAlbumArt ? art !== null : true)) ? groupH - p * 2 : 0,
                artH = groupH - p * 2;

            //--->
            g.FillSolidRect(0, groupY, rowW, groupH, pl_colors.background); // Solid background for ClearTypeGridFit text rendering
            if (selectedGroup) {
                g.FillSolidRect(0, groupY, rowW, groupH, pl_colors.rowSelected);
            }

            g.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);

            if (isCollapsed[groupNr] && focusGroupNr == groupNr) {
                g.DrawRect(2, groupY + 2, rowW - 4, groupH - 4, 1, lineColor);
            }

            //************************************************************//

            if (properties.showAlbumArt) {
                if (art) {
                    g.DrawImage(art, artX + 2, artY + 2, artW - 4, artH - 4, 0, 0, art.Width, art.Height, 0, artAlpha);

                }
                else if (!properties.autoAlbumArt) {
                    if (art === null) {
                        g.DrawString("NO COVER", pl_fonts.cover, _.RGB(100, 100, 100), artX, artY, artW, artH, StringFormat(1, 1));
                    }
                    else {
                        g.DrawString("LOADING", pl_fonts.cover, lineColor, artX, artY, artW, artH, StringFormat(1, 1));
                    }
                }

                g.DrawRect(artX, artY, artW - 1, artH - 1, 1, lineColor);
            }

            //************************************************************//
            var divGroupH = (!properties.showGroupInfo) ? groupH / 2 : groupH / 3;

            var leftPad = artX + artW + 10;
            var path = _.tf("%path%", metadb);

            var radio = _.startsWith(path, 'http');

            //---> DATE
            var date = _.tf("%date%", metadb);
            if (date === "?" && radio) {
                date = "";
            }
            var dateW = Math.ceil(gr.MeasureString(date, dateFont, 0, 0, 0, 0).Width + 5);
            var dateX = rowW - dateW - 5;
            var dateY = groupY;
            var dateH = groupH;

            if (properties.groupedID) {
                (dateX > leftPad) && g.DrawString(date, dateFont, dateColor, dateX, dateY, dateW, dateH, StringFormat(0, 1));
            }
            //---> ARTIST
            var artistX = leftPad;
            if (properties.showGroupInfo) {
                artistW = rowW - artistX;
                artistH = divGroupH;
            }
            else {
                artistW = dateX - leftPad - 5;
                artistH = divGroupH - 5;
            }
            var artist = _.tf("$if($greater($len(%album artist%),0),%album artist%,%artist%)", metadb);

            if (artist === "?" && radio) {
                artist = "Radio Stream";
            }

            g.DrawString(artist, artistFont, artistColor, artistX, groupY, artistW, artistH, StringFormat(0, 2, 3, 0x1000));

            //---> ALBUM
            var albumX = leftPad;
            var albumW = dateX - leftPad - 5;
            var albumH = divGroupH;
            var albumY = groupY + divGroupH;

            if (!properties.showGroupInfo) {
                albumY += 5;
            }

            var album = _.tf("%album%[ - %ALBUMSUBTITLE%]", metadb);
            if (album === "?" && radio) {
                album = "";
            }
            if (properties.groupedID) {
                g.DrawString(album, pl_fonts.album, albumColor, albumX, albumY, albumW, albumH, StringFormat(0, properties.showGroupInfo ? 1 : 0, 3, 0x1000));
            }

            var albumStringW = gr.MeasureString(album, pl_fonts.album, 0, 0, 0, 0).Width;

            var lineX1 = (properties.groupedID ? leftPad + albumStringW + 10 : leftPad);
            var lineY = albumY + albumH / 2 + 1;

            if (!properties.showGroupInfo) {
                lineX1 = leftPad;
                lineY = groupY + groupH / 2 + 1;
            }
            var lineX2 = (properties.groupedID ? dateX - 10 : rowW - rowX + 10);

            (lineX2 - lineX1 > 0) && g.DrawLine(lineX1, lineY, lineX2, lineY, 1, lineColor);

            //---> INFO
            if (properties.showGroupInfo) {
                var infoX = leftPad;
                var infoY = groupY + artistH + albumH;
                var infoH = rowH;
                var infoW = rowW - rowX - infoX;

                var bitspersample = _.tf("$Info(bitspersample)", metadb);
                var samplerate = _.tf("$Info(samplerate)", metadb);
                var sample = ((bitspersample > 16 || samplerate > 44100) ? " " + bitspersample + "bit/" + samplerate / 1000 + "khz" : "");
                var codec = _.tf("$ext(%path%)", metadb);

                if (codec === "cue") {
                    codec = _.tf("$ext($Info(referenced_file))", metadb);
                }
                else if (codec === "mpc") {
                    codec = codec + "-" + _.tf("$Info(codec_profile)", metadb).replace("quality ", "q");
                }
                else if (_.tf("$Info(encoding)", metadb) === "lossy") {
                    if (_.tf("$Info(codec_profile)", metadb) === "CBR") {
                        codec = codec + "-" + _.tf("%bitrate%", metadb) + " kbps";
                    }
                    else {
                        codec = codec + "-" + _.tf("$Info(codec_profile)", metadb);
                    }
                }

                if (codec) {
                    codec = codec + sample;
                }
                else {
                    codec = (_.startsWith(path, 'www.youtube.com') || _.startsWith(path, 'youtube.com')) ? "yt" : path;
                }
                var iCount = itemCountInGroup[ID.groupNr];
                var genre = radio ? "" : (properties.groupedID ? "%genre% | " : "");
                var discNumber = (properties.groupedID === 2 && _.tf("[%totaldiscs%]", metadb) !== "1") ? _.tf("[ | Disc: %discnumber%/%totaldiscs%]", metadb) : "";
                var info = _.tf(codec + discNumber + "[ | %replaygain_album_gain%]", metadb) + (radio ? "" : " | " + iCount + (iCount == 1 ? " Track" : " Tracks") + " | Time: " + calculateGroupLength(firstItem[groupNr], lastItem[groupNr]));
                g.DrawString(info, pl_fonts.info, infoColor, infoX, infoY, infoW, infoH, StringFormat(0, 0, 3, 0x1000));

                var infoStringH = Math.ceil(gr.MeasureString(info, pl_fonts.info, 0, 0, 0, 0).Height + 5);
                var lineX1 = leftPad,
                    lineX2 = rowW - rowX - 10,
                    lineY = infoY + infoStringH;
                (lineX2 - lineX1 > 0) && g.DrawLine(lineX1, lineY, lineX2, lineY, 1, lineColor);
            }
        }

        clipImg.ReleaseGraphics(g);
        gr.DrawImage(clipImg, pl_s.listX, clipY, pl_s.listW, clipH, 0, 0, pl_s.listW, clipH, 0, 255);
        clipImg.Dispose();
    }

    drawData.tempGroupNr = groupNr;
}

function draw_row(gr, drawData) {
    var ID = drawData.ID,
        rowX = drawData.rowX,
        rowY = drawData.rowY,
        rowW = drawData.rowW,
        rowH = drawData.rowH,
        idx = drawData.idx,
        playingID = drawData.playingID,
        focusID = drawData.focusID;

    if (!pl_s.redrawEverything && !ID.isChanged) {
        return;
    }
    ID.isChanged = false;

    gr.FillSolidRect(rowX, rowY, rowW, rowH, pl_colors.background);

    var metadb = ID.metadb;

    var selectedID;

    if (plman.IsPlaylistItemSelected(activeList, ID.nr)) {
        selectedID = ID.nr;
    }

    if (ID.isOdd && properties.alternateRowColor) {
        //gr.FillSolidRect(rowX, rowY, rowW, rowH - 1, pl_colors.rowAlternate);
        gr.FillSolidRect(rowX, rowY + 1, rowW, rowH - 1, pl_colors.rowAlternate);
    }

    var titleFont = pl_fonts.titleNormal;
    var titleColor = pl_colors.titleNormal;
    var countColor = pl_colors.countNormal;
    var rowColorFocus = pl_colors.rowFocusNormal;
    var titleArtistColor = pl_colors.titleSelected;

    if (selectedID == ID.nr) {
        if (properties.alternateRowColor) {
            //gr.DrawRect(rowX, rowY - 1, rowW - 1, rowH, 1, pl_colors.rowFocusSelected);
            if (pl_s.listIsScrolledDown && idx === (pl_s.rowsToDraw - 1)) {
                // last item is cropped
                gr.DrawRect(rowX, rowY, rowW - 1, rowH - 1, 1, pl_colors.rowFocusSelected);
            }
            else {
                gr.DrawRect(rowX, rowY, rowW - 1, rowH, 1, pl_colors.rowFocusSelected);
            }
        }
        else {
            gr.FillSolidRect(rowX, rowY, rowW, rowH, pl_colors.rowSelected);
        }

        titleColor = pl_colors.titleSelected;
        titleFont = pl_fonts.titleSelected;
        countColor = pl_colors.countSelected;

        rowColorFocus = pl_colors.rowFocusSelected;
        titleArtistColor = pl_colors.titleNormal;
    }

    if (playingID == ID.nr) {// Might override "selected" fonts
        titleColor = pl_colors.titlePlaying;
        titleFont = pl_fonts.titlePlaying;
        countColor = pl_colors.countPlaying;
    }

    //--->
    if (properties.showFocusItem && panelFocus && focusID == ID.nr) {
        //gr.DrawRect(rowX + 1, rowY, rowW - 3, rowH - 2, 1, rowColorFocus);
        if (pl_s.listIsScrolledDown && idx === (pl_s.rowsToDraw - 1)) {
            // last item is cropped
            gr.DrawRect(rowX + 1, rowY + 1, rowW - 3, rowH - 3, 1, rowColorFocus);
        }
        else {
            gr.DrawRect(rowX + 1, rowY + 1, rowW - 3, rowH - 2, 1, rowColorFocus);
        }
    }

    if ((pl_s.rowDrag || pl_s.fileDrag) && rows[idx].state === 1) {
        gr.DrawLine(rowX, rowY, rowX + rowW, rowY, 2, _.RGB(140, 142, 144));
    }

    if (!pl_s.itemDropped && pl_s.linkToLastItem && !pl_s.makeSelectionDrag && idx === (pl_s.rowsToDraw - 1)) {
        gr.DrawLine(rowX, rowY + rowH - 1, rowX + rowW, rowY + rowH - 1, 2, _.RGB(255, 165, 0));
    }
    //--->

    var testRect = 0;

    var radio = (_.tf("%path%", metadb).indexOf('http') === 0);
    var playCount = (radio ? "" : _.tf("%play_count%", metadb));
    var length = _.tf("[%length%]", metadb);
    var lengthWidth = length ? 50 : 0;
    var playCountWidth = 0;
    if (playCount != 0 && properties.showPlayCount) {
        playCount = playCount + " |";
        playCountWidth = gr.MeasureString(playCount, pl_fonts.playCount, 0, 0, 0, 0).Width;
    }
    var ratingW = 0;
    if (componentPlayCount && properties.showRating) {
        ratingW = pl_s.listW - ratingBtnX + 16;
    }

    //---> QUEUE
    var queueContents = plman.GetPlaybackQueueContents().toArray();
    var isPlaylistItemQueued;

    if (properties.showQueueItem && queueContents.length) {
        var queueIndex = plman.FindPlaybackQueueItemIndex(metadb, activeList, ID.nr);

        queueContents.forEach(function (item) {
            var handle = item.Handle;

            var indexCount = 0;

            if (metadb.Compare(handle)) {
                drawData.queueIndexes.push(queueIndex);

                isPlaylistItemQueued = true;

                drawData.queueIndexes.forEach(function (item) {
                    if (queueIndex == item) {
                        drawData.queueIndexCount[queueIndex] = ++indexCount;
                    }
                });
            }
        });
    }
    if (isPlaylistItemQueued) {
        gr.FillSolidRect(rowX, rowY, rowW, rowH, pl_colors.rowQueued);
    }

    var queue = '';
    if ((properties.showQueueItem && queueContents.length && queueIndex != -1)) {
        queue = '  [' + (queueIndex + 1) + ']';
        if (drawData.queueIndexCount[queueIndex] > 1) {
            queue += '*' + drawData.queueIndexCount[queueIndex];
        }
    }

    //---> TITLE
    var titleW = rowW - lengthWidth - playCountWidth - ratingW;
    var gic = ID.nrInGroup;
    var itemNr = (((gic) < 10) ? ("0" + (gic)) : (gic));
    var path = _.tf("%path%", metadb);
    var titleQuery = "$if(%tracknumber%,%tracknumber%.," + itemNr + ".)  %title%";
    var title = ( fb.IsPlaying && _.startsWith(path, 'http') && ID.nr == playingID ) ? _.tfe(titleQuery) : _.tf(titleQuery, metadb);
    var titleArtist = _.tf("[  \u25AA  $if($greater($len(%album artist%),1),$if($greater($len(%track artist%),1),%track artist%))]", metadb);
    if (titleArtist) {
        var titleLength = gr.MeasureString(title, titleFont, 0, 0, 0, 0, StringFormat(0, 1, 3, 0x00000800 | 0x1000)).Width;
        var titleArtistFont = gdi.font("Segoe Ui Semibold", 12, 0);
        gr.DrawString(titleArtist + queue, titleArtistFont, titleArtistColor, rowX + 10 + titleLength, rowY, titleW - 10 - titleLength, rowH, StringFormat(0, 1, 3, 0x1000));
    }
    gr.DrawString(title + (titleArtist ? "" : queue), titleFont, titleColor, rowX + 10, rowY, titleW - 10, rowH, StringFormat(0, 1, 3, 0x1000));

    testRect && gr.DrawRect(rowX, rowY - 1, titleW, rowH, 1, _.RGBA(155, 155, 255, 250));

    //---> LENGTH
    var lengthX = rowX + rowW - lengthWidth - ratingW;
    gr.DrawString(length, titleFont, titleColor, lengthX, rowY, lengthWidth, rowH, StringFormat(1, 1));
    testRect && gr.DrawRect(lengthX, rowY - 1, lengthWidth, rowH, 1, _.RGBA(155, 155, 255, 250));

    //---> COUNT
    if (componentPlayCount && playCount != 0 && properties.showPlayCount) {
        var countX = rowX + rowW - lengthWidth - playCountWidth - ratingW;
        gr.DrawString(playCount, pl_fonts.playCount, countColor, countX, rowY, playCountWidth, rowH, StringFormat(1, 1));
        testRect && gr.DrawRect(countX, rowY - 1, playCountWidth, rowH, 1, _.RGBA(155, 155, 255, 250));
    }

    //---> RATING
    var rating;
    if (properties.useTagRating) {
        var fileInfo = metadb.GetFileInfo();
        rating = fileInfo.MetaValue(fileInfo.MetaFind("rating"), 0);
    }
    else {
        rating = _.tf("%rating%", metadb);
    }

    if (componentPlayCount && properties.showRating) {
        for (var j = 0; j < 5; j++) {
            var curRatingX = ratingBtnX + j * ratingBtnW - ratingBtnRightPad;

            if (j < rating) {
                var color;
                if (selectedID == ID.nr) {
                    color = titleColor;
                }
                else {
                    color = titleColor;
                }

                gr.DrawString("\u2605", pl_fonts.ratingRated, color, curRatingX, rowY - 1, ratingBtnW, rowH, StringFormat(1, 1));
            }
            else {
                gr.DrawString("\u2219", pl_fonts.ratingNotRated, titleColor, curRatingX, rowY - 1, ratingBtnW, rowH, StringFormat(1, 1));
            }
        } //eol
    }
}

function draw_playlist_info(gr) {
    var selectedIndexesLength = selectedIndexes.length;
    var totalItems = selectedIndexesLength;
    var items = (totalItems > 1 ? " items selected" : " item selected");

    if (!selectedIndexesLength) {
        pl_s.selectionLength = pl_s.playlistDuration;
        totalItems = playlistItemCount;
        items = (totalItems > 1 ? " items" : " item");
    }

    var isLocked = plman.IsPlaylistLocked(plman.ActivePlaylist);

    gr.FillSolidRect(0, 0, ww, listInfoHeight, panelsFrontColor);
    gr.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);
    if (isLocked) {
        var sbarX = ww - properties.scrollbarW - properties.sbarRightMargin;
        gr.DrawString("\uF023", gdi.font("FontAwesome", 12, 0), _.RGB(150, 152, 154), sbarX + Math.round((properties.scrollbarW - 7) / 2), 0, 8, listInfoHeight, StringFormat(1, 1));
    }

    var lengthText = pl_s.selectionLength == "Stream" ? "Stream" : "Length: " + pl_s.selectionLength;
    gr.DrawString(plman.GetPlaylistName(activeList) + ": " + totalItems + items + ", " + lengthText, pl_fonts.titleSelected, _.RGB(150, 152, 154), 10, 0, ww - 20, listInfoHeight - 2, StringFormat(1, 1, 3, 4096));
}

function on_size() {
    trace_call && fb.trace(qwr_utils.function_name());

    ww = window.Width;
    wh = window.Height;

    if (ww <= 0 || wh <= 0) {
        return;
    }

    listOnSize();
}

function on_mouse_move(x, y, m) {
    if (moveChecker.isSameMove(x, y, m)) {
        return;
    }

    if (!pl_s.listLength) {
        return;
    }

    qwr_utils.DisableSizing(m);

    if (pl_s.isScrollbarDisplayed) {
        scrollbar.move(x, y, m);

        if (scrollbar.b_is_dragging || scrollbar.trace(x, y)) {
            return;
        }
    }

    var traceData =
        {
            thisID:       undefined,
            thisRow:      undefined,
            thisRowNr:    undefined,
            thisRowBtnNr: 0
        };
    getMouseTraceData(x, y, traceData);

    var thisID = traceData.thisID,
        thisRow = traceData.thisRow,
        thisRowNr = traceData.thisRowNr;

    if (thisRow !== undefined) {
        mouseOverList = true;
        pl_s.linkToLastItem = false;
    }

    if (selectedIndexes.length && !doubleClicked && m == 1 && (oldRow && thisRow != oldRow)) {
        if (plman.IsAutoPlaylist(activeList) && !actionNotAllowed) {
            window.SetCursor(IDC_NO);
            actionNotAllowed = true;
        }
        pl_s.itemDropped = false;

        //if (!actionNotAllowed && clickedOnSelectedItem) pl_s.rowDrag = true;
        //if (!clickedOnSelectedItem) selectWithDrag = true;
        if (!actionNotAllowed) {
            pl_s.rowDrag = true;
        }
    }

    if ((pl_s.fileDrag || pl_s.rowDrag || pl_s.makeSelectionDrag) && thisID && thisID.isGroupHeader && isCollapsed[thisID.groupNr]) {
        CollapseExpandGroup(thisID.groupNr, "toggle");
    }

    if (oldRow && oldRow != thisRow) {
        if (/*!clickedOnSelectedItem &&*/ m == 1 && thisID && thisID.isGroupHeader) {
            var firstIDnr = firstItem[thisID.groupNr];

            if ((oldID.nr < firstIDnr && selectedIndex > oldID.nr) || (oldID.nr == firstIDnr && selectedIndex < oldID.nr)) {
                plman.SetPlaylistSelectionSingle(activeList, oldID.nr, false);

            }
        }

        oldRow.changeState(0);
    }

    if (thisRow && thisRow != oldRow) {
        thisRow.changeState(1);

        if (pl_s.rowDrag || pl_s.fileDrag || pl_s.makeSelectionDrag) {
            if (thisRowNr == 0 && !pl_s.listIsScrolledUp) {
                startScrollRepeat("dragUp");
            }

            if ((thisRowNr == (pl_s.rowsToDraw - 1)) && !pl_s.listIsScrolledDown) {
                startScrollRepeat("dragDown");
            }
        }

        // if (!clickedOnSelectedItem && m == 1)
        // {
        // pl_s.makeSelectionDrag = true;

        // selectedIndexes = [];

        // if (thisID && !thisID.isGroupHeader)
        // {

        // for (var i = selectedIndex;
        // i <= thisID.nr; i++)
        // {
        // selectedIndexes.push(i);
        // }
        // for (var i = selectedIndex;
        // i >= thisID.nr; i--)
        // {
        // selectedIndexes.push(i);
        // selectedIndexes.sort(numericAscending);
        // }
        // if (selectedIndexes[0] == selectedIndexes[1]) selectedIndexes.length = 1;

        // if (selectedIndexes[0] != undefined && !thisID.isGroupHeader)
        // {
        // plman.ClearPlaylistSelection(activeList);
        // plman.SetPlaylistSelection(plman.ActivePlaylist, selectedIndexes, true);
        // }
        // }
        // }
    }

    if ((pl_s.rowDrag || pl_s.fileDrag) && (y > (rows[pl_s.rowsToDraw - 1].y + pl_s.curPixelShift + properties.rowH)) && !pl_s.linkToLastItem && ((pl_s.needsScrollbar && pl_s.listIsScrolledDown) || !pl_s.needsScrollbar)) {
        pl_s.linkToLastItem = true;
        rows[pl_s.rowsToDraw - 1].repaint();
    }

    if ((pl_s.rowDrag || pl_s.fileDrag || pl_s.makeSelectionDrag) && thisID && (thisRowNr != 0 && thisRowNr != (pl_s.rowsToDraw - 1))) {
        stopScrollRepeat();
    }

    oldID = thisID;
    oldRow = thisRow;
}

// =================================================== //
var onMouseLbtnDown = false;

function on_mouse_lbtn_down(x, y, m) {
    // todo: check if onMouseLbtnDown should me moved further in down in the code
    onMouseLbtnDown = true;

    if (!pl_s.listLength || doubleClicked) {
        return;
    }

    var traceData =
        {
            thisID:       undefined,
            thisRow:      undefined,
            thisRowNr:    undefined,
            thisRowBtnNr: 0
        };
    getMouseTraceData(x, y, traceData);

    var thisID = traceData.thisID;

    if (pl_s.isScrollbarDisplayed) {
        scrollbar.lbtn_dn(x, y, m);
    }

    if (!thisID) {
        if (!(pl_s.isScrollbarDisplayed && scrollbar.trace(x, y))) {
            selectedIndexes = [];
            plman.ClearPlaylistSelection(activeList);
        }

        return;
    }

    if (thisID.isGroupHeader) {
        on_mouse_lbtn_down_header(thisID.groupNr);
    }
    else {
        on_mouse_lbtn_down_row(thisID.nr, thisID.metadb);
    }
}

function on_mouse_lbtn_down_header(groupNr) {
    var CtrlKeyPressed = utils.IsKeyPressed(VK_CONTROL);
    var ShiftKeyPressed = utils.IsKeyPressed(VK_SHIFT);

    pl_s.clickedOnGroup = true;

    if (CtrlKeyPressed && ShiftKeyPressed) {
        CollapseExpandGroup(groupNr, "toggle");
        doubleClicked = true;
    }
    else {
        if (!CtrlKeyPressed) {
            selectedIndexes = [];
        }

        if (properties.autoExpandCollapseGroups) {
            if (selectedIndexes.length == 0) {
                CollapseExpandList("collapse");
            }
            CollapseExpandGroup(groupNr, "expand");
            doubleClicked = true;
        }

        // TODO: add SHIFT selection
        if (CtrlKeyPressed) {
            if (!isGroupSelected(groupNr)) {
                selectedIndexes = _.union(selectedIndexes, _.range(firstItem[groupNr], lastItem[groupNr] + 1));
            }
            else {
                _.remove(selectedIndexes, function (item) {
                    return item >= firstItem[groupNr] && item <= lastItem[groupNr];
                });
            }
        }
        else {
            selectedIndexes = _.union(selectedIndexes, _.range(firstItem[groupNr], lastItem[groupNr] + 1));
        }

        plman.ClearPlaylistSelection(activeList);
        plman.SetPlaylistSelection(plman.ActivePlaylist, selectedIndexes, true);
        plman.SetPlaylistFocusItem(activeList, firstItem[groupNr]);

        clickedOnSelectedItem = true;
    }
}

function on_mouse_lbtn_down_row(nr, metadb) {
    var CtrlKeyPressed = utils.IsKeyPressed(VK_CONTROL);
    var ShiftKeyPressed = utils.IsKeyPressed(VK_SHIFT);

    var IDIsSelected = plman.IsPlaylistItemSelected(activeList, nr);
    clickedOnSelectedItem = IDIsSelected;

    if (!CtrlKeyPressed && !ShiftKeyPressed && !IDIsSelected) {
        selectedIndexes = [];
        plman.ClearPlaylistSelection(activeList);
    }

    if (ShiftKeyPressed) {
        selectedIndexes = [];

        var a = 0,
            b = 0;

        if (selectedIndex == undefined) {
            selectedIndex = plman.GetPlaylistFocusItemIndex(activeList);
        }

        if (selectedIndex < nr) {
            a = selectedIndex;
            b = nr;
        }
        else {
            a = nr;
            b = selectedIndex;
        }

        for (var id = a; id <= b; id++) {
            selectedIndexes.push(id);
        }

        plman.ClearPlaylistSelection(activeList);
        plman.SetPlaylistSelection(activeList, selectedIndexes, true);
    }
    else {
        plman.SetPlaylistSelectionSingle(activeList, nr, true);

        if (utils.IsKeyPressed(VK_KEY_Q)) {
            plman.AddPlaylistItemToPlaybackQueue(activeList, nr);
        }
        else if (utils.IsKeyPressed(VK_KEY_Z)) {
            var index = plman.FindPlaybackQueueItemIndex(metadb, activeList, nr);
            plman.RemoveItemFromPlaybackQueue(index);
        }
    }

    if (!IDIsSelected && !CtrlKeyPressed && !ShiftKeyPressed) {
        selectedIndexes = [];
        selectedIndexes[0] = nr;
    }

    if (CtrlKeyPressed) {
        if (!IDIsSelected) {
            selectedIndexes.push(nr);
        }

        plman.SetPlaylistSelectionSingle(activeList, nr, !IDIsSelected);

        if (IDIsSelected) {
            for (var i = 0; i < selectedIndexes.length; i++) {
                if (selectedIndexes[i] == nr) {
                    selectedIndexes.splice(i, 1);
                }
            }
        }
    }

    plman.SetPlaylistFocusItem(activeList, nr);

    if (selectedIndex == undefined) {
        selectedIndex = nr;
    }

    if (selectedIndexes.length > 1) {
        selectedIndexes.sort(numericAscending);
    }
}

function on_mouse_lbtn_dblclk(x, y, m) {
    if (!pl_s.listLength) {
        if (!safeMode) {
            try {
                WshShell.Run("explorer.exe /e,::{20D04FE0-3AEA-1069-A2D8-08002B30309D}");
            }
            catch (e) {
                fb.trace(e)
            }
        }

        return;
    }

    var traceData =
        {
            thisID:       undefined,
            thisRow:      undefined,
            thisRowNr:    undefined,
            thisRowBtnNr: 0
        };
    getMouseTraceData(x, y, traceData);

    var thisID = traceData.thisID,
        thisRowBtnNr = traceData.thisRowBtnNr;

    if (!thisID) {
        return;
    }

    doubleClicked = true;

    //---> Set rating
    if (mouseInRatingBtn) {
        var metadb = thisID.metadb;

        var currentRating;
        if (properties.useTagRating) {
            var fileInfo = metadb.GetFileInfo();
            currentRating = fileInfo.MetaValue(fileInfo.MetaFind("rating"), 0);
        }
        else {
            currentRating = _.tf("%rating%", metadb);
        }

        var rate = thisRowBtnNr + 1;

        if (properties.useTagRating) {
            if (!metadb.Raw_.startsWith(path, "http://")) {
                (currentRating == 1 && rate == 1) ? metadb.UpdateFileInfoSimple("RATING", undefined) : metadb.UpdateFileInfoSimple("RATING", rate);
            }
        }
        else {
            (currentRating == 1 && rate == 1) ? fb.RunContextCommandWithMetadb("<not set>", metadb) : fb.RunContextCommandWithMetadb("Rating/" + rate, metadb);
        }

        setListChangedStateByID(thisID);
        repaintList();
        return;
    }

    if (thisID.isGroupHeader) {
        CollapseExpandGroup(thisID.groupNr, "toggle");
    }
    else if (!utils.IsKeyPressed(VK_KEY_Q) && !utils.IsKeyPressed(VK_KEY_Z)) {
        plman.ExecutePlaylistDefaultAction(activeList, thisID.nr);
        newTrackByClick = true;
    }
}

// =================================================== //

function on_mouse_lbtn_up(x, y, m) {
    onMouseLbtnDown = false;
    if (doubleClicked) {
        doubleClicked = false;
        return;
    }

    qwr_utils.EnableSizing(m);

    if (pl_s.isScrollbarDisplayed) {
        var wasDragging = scrollbar.b_is_dragging;
        scrollbar.lbtn_up(x, y, m);
        if (wasDragging) {
            return;
        }
    }

    if (properties.showPlaylistInfo) {
        if ((0 <= x) && (x <= ww) && (0 <= y) && (y <= listInfoHeight)) {
            PlaylistMenu(x, y);
            return;
        }
    }

    if (!pl_s.listLength) {
        return;
    }

    var CtrlKeyPressed = utils.IsKeyPressed(VK_CONTROL);
    var ShiftKeyPressed = utils.IsKeyPressed(VK_SHIFT);

    var traceData =
        {
            thisID:       undefined,
            thisRow:      undefined,
            thisRowNr:    undefined,
            thisRowBtnNr: 0
        };
    getMouseTraceData(x, y, traceData);

    var thisID = traceData.thisID,
        thisRow = traceData.thisRow;

    if (thisRow) {
        thisRow.changeState(0);
    }

    if (thisID && thisID.nr !== undefined) {
        if (pl_s.rowDrag && thisID) {
            var selectedItems = plman.GetPlaylistSelectedItems(activeList);
            var selectedItemCount = selectedItems.Count;
            var focusIndex = plman.GetPlaylistFocusItemIndex(activeList);
            var thisIndex = thisID.nr;
            var add = 0;

            if (selectedItemCount > 1) {
                //--->
                var temp;
                var odd = false;
                for (var i = 0; i < playlistItemCount; i++) {
                    if (plman.IsPlaylistItemSelected(activeList, i)) {
                        if (temp != undefined && ((i - 1) != temp)) {
                            odd = true;
                            break;
                        }
                        temp = i;
                    }
                }
                //--->

                if (odd) {
                    selectedIndexes.forEach(function (item, i) {
                        if (item < thisIndex) {
                            add = i + 1;
                        }
                    });
                    plman.MovePlaylistSelection(activeList, -pl_s.listLength);
                }
                else {
                    _.forEach(selectedIndexes, function (item, i) {
                        if (item == focusIndex) {
                            add = i;
                            return false;
                        }
                    });
                }
            }

            var delta = 0;
            if (focusIndex > thisIndex) {
                delta = (selectedItemCount > 1) ? (odd ? thisIndex - add : -(focusIndex - thisIndex - add)) : -(focusIndex - thisIndex);
            }
            else {
                delta = (selectedItemCount > 1) ? (odd ? thisIndex - add : (thisIndex - focusIndex - (selectedItemCount - add))) : (thisIndex - 1 - focusIndex);
            }

            if (!odd && plman.IsPlaylistItemSelected(plman.ActivePlaylist, thisIndex)) {
                delta = 0;
            }

            plman.MovePlaylistSelection(activeList, delta);
        } //row drag end

        if (!CtrlKeyPressed && !ShiftKeyPressed && !pl_s.rowDrag && !selectWithDrag) {
            if (plman.GetPlaylistSelectedItems(activeList).Count > 1) {
                selectedIndexes = [];
                selectedIndexes[0] = thisID.nr;
                plman.ClearPlaylistSelection(activeList);
                plman.SetPlaylistSelectionSingle(activeList, thisID.nr, true);
            }
        }
    }

    if (pl_s.linkToLastItem) {
        plman.MovePlaylistSelection(activeList, pl_s.listLength - plman.GetPlaylistSelectedItems(activeList).Count);

        rows[pl_s.rowsToDraw - 1].repaint();
    }

    if (!ShiftKeyPressed) {
        selectedIndex = undefined;
    }

    pl_s.rowDrag = pl_s.fileDrag = pl_s.makeSelectionDrag = pl_s.linkToLastItem = selectWithDrag = false;

    //--->

    plman.SetActivePlaylistContext();

    if (actionNotAllowed) {
        window.SetCursor(IDC_ARROW);
        actionNotAllowed = false;
    }
}


function on_mouse_rbtn_down(x, y, m) {
    if (!pl_s.listLength) {
        return;
    }

    var traceData =
        {
            thisID:       undefined,
            thisRow:      undefined,
            thisRowNr:    undefined,
            thisRowBtnNr: 0
        };
    getMouseTraceData(x, y, traceData);

    var thisID = traceData.thisID;

    if (!thisID) {
        if (!(pl_s.isScrollbarDisplayed && scrollbar.trace(x, y))) {
            selectedIndexes = [];
            plman.ClearPlaylistSelection(activeList);
        }
        return;
    }

    var thisIndex = thisID.nr;

    if (thisID.isGroupHeader) {
        plman.SetPlaylistFocusItem(activeList, firstItem[thisID.groupNr]);

        if (isGroupSelected(thisID.groupNr)) {
            return;
        }

        selectedIndexes = [];

        var thisGroupNr = thisID.groupNr;

        for (var id = firstItem[thisGroupNr]; id <= lastItem[thisGroupNr]; id++) {
            selectedIndexes.push(id);
        }

        plman.ClearPlaylistSelection(activeList);
        plman.SetPlaylistSelection(plman.ActivePlaylist, selectedIndexes, true);
    }
    else {
        var IDIsSelected = plman.IsPlaylistItemSelected(activeList, thisIndex);

        if (IDIsSelected) {
            plman.SetPlaylistFocusItem(activeList, thisIndex);
            repaintList();

        }
        else {
            selectedIndexes = [];
            plman.ClearPlaylistSelection(activeList);
            selectedIndexes[0] = thisIndex;
            plman.SetPlaylistFocusItem(activeList, thisIndex);
            plman.SetPlaylistSelectionSingle(activeList, thisIndex, true);
        }
    }
}


function on_mouse_rbtn_up(x, y) {
    trace_call && fb.trace(qwr_utils.function_name());

    if (pl_s.isScrollbarDisplayed) {
        if (scrollbar.rbtn_up(x, y)) {
            return true;
        }
    }

    var inPlaylistInfo = properties.showPlaylistInfo && (0 <= x) && (x <= ww) && (0 <= y) && (y <= listInfoHeight);

    var metadb = utils.IsKeyPressed(VK_CONTROL) ? (fb.IsPlaying ? fb.GetNowPlaying() : fb.GetFocusItem()) : fb.GetFocusItem();

    var selected = plman.GetPlaylistSelectedItems(plman.ActivePlaylist).Count;
    var selection = (selected > 1);
    var queueActive = plman.IsPlaybackQueueActive();
    var isAutoPlaylist = plman.IsAutoPlaylist(activeList);
    var playlistCount = plman.PlaylistCount;
    var sendToPlaylistId = 0;

    var cpm = window.CreatePopupMenu();
    var web = window.CreatePopupMenu();
    var ce = window.CreatePopupMenu();
    var ccmm = fb.CreateContextMenuManager();
    var appear = window.CreatePopupMenu();
    var sort = window.CreatePopupMenu();
    var lists = window.CreatePopupMenu();
    var send = window.CreatePopupMenu();
    var skip = window.CreatePopupMenu();
    var art = window.CreatePopupMenu();
    var group = window.CreatePopupMenu();

    var isCurPlaylistEmpty = !plman.PlaylistItemCount(plman.ActivePlaylist);

    plman.SetActivePlaylistContext();

    if (fb.IsPlaying) {
        cpm.AppendMenuItem(MF_STRING, 5, "Show now playing");
    }

    if (!isCurPlaylistEmpty) {
        cpm.AppendMenuItem(MF_STRING, 6, "Refresh all \tF5");
        cpm.AppendMenuItem(MF_STRING, 7, "Select all \tCtrl+A");
        if (selected) {
            cpm.AppendMenuItem(isAutoPlaylist ? MF_GRAYED : MF_STRING, 8, "Remove from list \tDelete");
        }
        if (queueActive) {
            cpm.AppendMenuItem(MF_STRING, 9, "Flush playback queue");
        }
        cpm.AppendMenuSeparator();
    }

    if (!inPlaylistInfo) {
        cpm.AppendMenuItem((plman.GetPlaylistSelectedItems(plman.ActivePlaylist).Count > 0) ? MF_STRING : MF_GRAYED, 10, "Cut \tCtrl+X");
        cpm.AppendMenuItem(cuttedItemsCount ? MF_STRING : MF_GRAYED, 11, "Paste \tCtrl+V");

        if (!isCurPlaylistEmpty) {
            cpm.AppendMenuSeparator();
        }
    }

    if (!isCurPlaylistEmpty) {
        // -------------------------------------------------------------- //
        //---> Collapse/Expand

        if (curRowsInGroup) {
            ce.AppendMenuItem(MF_STRING, 20, "Collapse all");
            if (plman.ActivePlaylist == plman.PlayingPlaylist) {
                ce.AppendMenuItem(MF_STRING, 21, "Collapse all but now playing");
            }
            ce.AppendMenuItem(MF_STRING, 22, "Expand all");
            ce.AppendMenuSeparator();
            ce.AppendMenuItem(MF_STRING, 23, "Auto");
            ce.CheckMenuItem(23, properties.autoExpandCollapseGroups);
            ce.AppendMenuItem(MF_STRING, 24, "Collapse on start");
            ce.CheckMenuItem(24, properties.collapseOnStart);
            ce.AppendTo(cpm, MF_STRING, "Collapse/Expand");

        }
        // -------------------------------------------------------------- //
        //---> Skip track

        skip.AppendMenuItem(MF_STRING, 25, "Enable");
        skip.CheckMenuItem(25, properties.enableSkip);
        skip.AppendMenuSeparator();
        skip.AppendMenuItem(properties.enableSkip ? MF_STRING : MF_GRAYED, 26, "Rated less than 2");
        skip.AppendMenuItem(properties.enableSkip ? MF_STRING : MF_GRAYED, 27, "Rated less than 3");
        skip.AppendMenuItem(properties.enableSkip ? MF_STRING : MF_GRAYED, 28, "Rated less than 4");
        skip.AppendMenuItem(properties.enableSkip ? MF_STRING : MF_GRAYED, 29, "Rated less than 5");
        skip.AppendTo(cpm, MF_STRING, "Skip");
        skip.CheckMenuRadioItem(26, 29, 24 + properties.skipLessThan);
        // -------------------------------------------------------------- //
        //---> Appearance

        appear.AppendTo(cpm, MF_STRING, "Appearance");
        if (!properties.useCompactGroupHeader) {
            appear.AppendMenuItem(MF_STRING, 31, "Show group info");
            appear.CheckMenuItem(31, properties.showGroupInfo);
        }
        appear.AppendMenuItem(componentPlayCount ? MF_STRING : MF_GRAYED, 32, "Show play count");
        appear.CheckMenuItem(32, properties.showPlayCount);
        appear.AppendMenuItem(componentPlayCount ? MF_STRING : MF_GRAYED, 33, "Show rating");
        appear.CheckMenuItem(33, properties.showRating);
        appear.AppendMenuItem(MF_STRING, 34, "Show focus item");
        appear.CheckMenuItem(34, properties.showFocusItem);
        appear.AppendMenuItem(MF_STRING, 35, "Show queue item");
        appear.CheckMenuItem(35, properties.showQueueItem);
        appear.AppendMenuItem(MF_STRING, 36, "Alternate row color");
        appear.CheckMenuItem(36, properties.alternateRowColor);
        appear.AppendMenuItem(MF_STRING, 37, "Show scrollbar");
        appear.CheckMenuItem(37, properties.showScrollbar);
        appear.AppendMenuItem(MF_STRING, 39, "Show playlist info");
        appear.CheckMenuItem(39, properties.showPlaylistInfo);
        appear.AppendMenuItem(MF_STRING, 40, "Show group header");
        appear.CheckMenuItem(40, properties.showGroupHeader);
        if (properties.showGroupHeader) {
            appear.AppendMenuItem(MF_STRING, 41, "Use compact group header");
            appear.CheckMenuItem(41, properties.useCompactGroupHeader);
        }
        if (!properties.useCompactGroupHeader) {
            art.AppendTo(appear, MF_STRING, "Album art");
            art.AppendMenuItem(MF_STRING, 42, "Show");
            art.CheckMenuItem(42, properties.showAlbumArt);
            art.AppendMenuItem(properties.showAlbumArt ? MF_STRING : MF_GRAYED, 43, "Auto");
            art.CheckMenuItem(43, properties.autoAlbumArt);
        }

        // -------------------------------------------------------------- //
        // Grouping
        group.AppendTo(cpm, MF_STRING, "Grouping");
        group.AppendMenuItem(MF_STRING, 50, "by artist");
        group.AppendMenuItem(MF_STRING, 51, "by artist / album");
        group.AppendMenuItem(MF_STRING, 52, "by artist / album / disc number");
        group.AppendMenuItem(MF_STRING, 53, "by path");
        group.AppendMenuItem(MF_STRING, 54, "by date");
        group.AppendMenuItem(MF_STRING, 55, "by user defined");

        if (properties.groupedID !== undefined) {
            group.CheckMenuRadioItem(50, 55, 50 + properties.groupedID);
        }
        // -------------------------------------------------------------- //
        // Selection

        //---> Sort
        sort.AppendMenuItem(MF_STRING, 60, "Sort by...");
        sort.AppendMenuItem(MF_STRING, 61, "Randomize");
        sort.AppendMenuItem(MF_STRING, 62, "Reverse");
        sort.AppendMenuItem(MF_STRING, 63, "Sort by album");
        sort.AppendMenuItem(MF_STRING, 64, "Sort by artist");
        sort.AppendMenuItem(MF_STRING, 65, "Sort by file path");
        sort.AppendMenuItem(MF_STRING, 66, "Sort by title");
        sort.AppendMenuItem(MF_STRING, 67, "Sort by track number");
        sort.AppendMenuItem(MF_STRING, 68, "Sort by date");
        sort.AppendTo(cpm, isAutoPlaylist ? MF_GRAYED : MF_STRING, selection ? "Sort selection" : "Sort");

        // -------------------------------------------------------------- //
        //---> Web links
        web.AppendMenuItem(MF_STRING, 80, "Google");
        web.AppendMenuItem(MF_STRING, 81, "Google Images");
        web.AppendMenuItem(MF_STRING, 82, "eCover");
        web.AppendMenuItem(MF_STRING, 83, "Wikipedia");
        web.AppendMenuItem(MF_STRING, 84, "YouTube");
        web.AppendMenuItem(MF_STRING, 85, "Last FM");
        web.AppendMenuItem(MF_STRING, 86, "Discogs");
        web.AppendTo(cpm, safeMode ? MF_GRAYED : MF_STRING, "Weblinks");
        // -------------------------------------------------------------- //
        //---> Send

        if (selected) {
            send.AppendMenuItem(MF_STRING, 100, "To top");
            send.AppendMenuItem(MF_STRING, 101, "To bottom");
            send.AppendMenuSeparator();
            send.AppendMenuItem(MF_STRING, 102, "Create New Playlist");
            send.AppendMenuSeparator();
            sendToPlaylistId = 103;
            for (var i = 0; i != playlistCount; i++) {
                send.AppendMenuItem((plman.IsAutoPlaylist(i) || i == activeList) ? MF_GRAYED : MF_STRING,
                    sendToPlaylistId + i,
                    plman.GetPlaylistName(i) + " [" + plman.PlaylistItemCount(i) + "]" + (plman.IsAutoPlaylist(i) ? " (Auto)" : "") + (i == plman.PlayingPlaylist ? " (Now Playing)" : ""));
            }
            send.AppendTo(cpm, MF_STRING, "Send selection");
        }
    }

    // -------------------------------------------------------------- //
    //---> Context Menu Manager
    if (selected) {
        cpm.AppendMenuSeparator();
        ccmm.InitContext(plman.GetPlaylistSelectedItems(activeList));
        ccmm.BuildMenu(cpm, 2000, -1);
    }

    // -------------------------------------------------------------- //
    //---> System
    if (utils.IsKeyPressed(VK_SHIFT)) {
        _.appendDefaultContextMenu(cpm);
    }

    var id = cpm.TrackPopupMenu(x, y);

    if (selected) {
        ccmm.ExecuteByID(id - 2000);
    }

    pl_s.redrawEverything = true; ///< TrackPopupMenu calls Redraw which causes pl_s.redrawEverything flag to reset
    // -------------------------------------------------------------- //
    switch (id) {
        case 5:
            showNowPlaying();
            break;
        case 6:
            initList();
            break;
        case 7:
            selectAll();
            break;
        case 8:
            plman.RemovePlaylistSelection(activeList);
            break;
        case 9:
            plman.FlushPlaybackQueue();
            break;
        case 10:
            cut();
            break;
        case 11:
            paste();
            break;
        // -------------------------------------------------------------- //
        case 20:
            //---> Collapse/Expand
            CollapseExpandList("collapse");
            if (plman.ActivePlaylist == plman.PlayingPlaylist) {
                displayFocusItem(undefined, plman.GetPlaylistFocusItemIndex(activeList));
            }
            break;
        case 21:
            CollapseExpandPlayingGroup();
            break;
        case 22:
            CollapseExpandList("expand");
            if (plman.ActivePlaylist == plman.PlayingPlaylist) {
                displayFocusItem(undefined, plman.GetPlaylistFocusItemIndex(activeList));
            }
            break;
        case 23:
            properties.autoExpandCollapseGroups = !properties.autoExpandCollapseGroups;
            window.SetProperty("user.Auto Expand/Collapse Groups", properties.autoExpandCollapseGroups);
            properties.autoExpandCollapseGroups && CollapseExpandPlayingGroup();
            break;
        case 24:
            properties.collapseOnStart = !properties.collapseOnStart;
            window.SetProperty("user.Collapse On Start", properties.collapseOnStart);
            break;
        // -------------------------------------------------------------- //
        case 25:
            properties.enableSkip = !properties.enableSkip;
            window.SetProperty("user.Skip Enable", properties.enableSkip);
            break;
        case 26:
            properties.skipLessThan = 2;
            window.SetProperty("user.Skip Less Than", properties.skipLessThan);
            break;
        case 27:
            properties.skipLessThan = 3;
            window.SetProperty("user.Skip Less Than", properties.skipLessThan);
            break;
        case 28:
            properties.skipLessThan = 4;
            window.SetProperty("user.Skip Less Than", properties.skipLessThan);
            break;
        case 29:
            properties.skipLessThan = 5;
            window.SetProperty("user.Skip Less Than", properties.skipLessThan);
            break;
        // -------------------------------------------------------------- //
        //---> Appearance
        case 31:
            properties.showGroupInfo = !properties.showGroupInfo;
            window.SetProperty("user.Show Group Info", properties.showGroupInfo);
            repaintList();
            break;
        case 32:
            properties.showPlayCount = !properties.showPlayCount;
            window.SetProperty("user.Show Play Count", properties.showPlayCount);
            repaintList();
            break;
        case 33:
            properties.showRating = !properties.showRating;
            window.SetProperty("user.Show Rating", properties.showRating);
            repaintList();
            break;
        case 34:
            properties.showFocusItem = !properties.showFocusItem;
            window.SetProperty("user.Show Focus Item", properties.showFocusItem);
            repaintList();
            break;
        case 35:
            properties.showQueueItem = !properties.showQueueItem;
            window.SetProperty("user.Show Queue Item", properties.showQueueItem);
            repaintList();
            break;
        case 36:
            properties.alternateRowColor = !properties.alternateRowColor;
            window.SetProperty("user.Alternate Row Color", properties.alternateRowColor);
            repaintList();
            break;
        case 37:
            properties.showScrollbar = !properties.showScrollbar;
            window.SetProperty("user.Show Scrollbar", properties.showScrollbar);
            on_size();
            window.Repaint();
            break;
        case 39:
            properties.showPlaylistInfo = !properties.showPlaylistInfo;
            window.SetProperty("user.Show Playlist Info", properties.showPlaylistInfo);
            if (properties.showPlaylistInfo) {
                initList();
            }
            on_size();
            window.Repaint();
            break;
        case 40:
            properties.showGroupHeader = !properties.showGroupHeader;
            window.SetProperty("user.Show Group Header", properties.showGroupHeader);
            initList();
            break;
        case 41:
            properties.useCompactGroupHeader = !properties.useCompactGroupHeader;
            window.SetProperty("user.Use Compact Group Header", properties.useCompactGroupHeader);
            curRowsInGroup = properties.useCompactGroupHeader ? properties.rowsInCompactGroup : properties.rowsInGroup;
            initList();
            break;
        case 42:
            properties.showAlbumArt = !properties.showAlbumArt;
            window.SetProperty("user.Show Album Art", properties.showAlbumArt);
            properties.showAlbumArt && getAlbumArt();
            repaintList();
            break;
        case 43:
            properties.autoAlbumArt = !properties.autoAlbumArt;
            window.SetProperty("user.Auto Album Art", properties.autoAlbumArt);
            properties.showAlbumArt && getAlbumArt();
            repaintList();
            break;
        // -------------------------------------------------------------- //
        // Grouping
        case 50:
            properties.groupFormat = gArtist;
            window.SetProperty("system.GroupBy", properties.groupFormat);
            properties.groupedID = 0;
            initList();
            break;
        case 51:
            properties.groupFormat = gArtistAlbum;
            window.SetProperty("system.GroupBy", properties.groupFormat);
            properties.groupedID = 1;
            window.SetProperty("system.properties.groupedID", properties.groupedID);
            initList();
            break;
        case 52:
            properties.groupFormat = gArtistAlbumDiscnumber;
            window.SetProperty("system.GroupBy", properties.groupFormat);
            properties.groupedID = 2;
            window.SetProperty("system.properties.groupedID", properties.groupedID);
            initList();
            break;
        case 53:
            properties.groupFormat = gPath;
            window.SetProperty("system.GroupBy", properties.groupFormat);
            properties.groupedID = 3;
            window.SetProperty("system.properties.groupedID", properties.groupedID);
            initList();
            break;
        case 54:
            properties.groupFormat = gDate;
            window.SetProperty("system.GroupBy", properties.groupFormat);
            properties.groupedID = 4;
            window.SetProperty("system.properties.groupedID", properties.groupedID);
            initList();
            break;
        case 55:
            properties.groupFormat = properties.gUserDefined;
            window.SetProperty("system.GroupBy", properties.groupFormat);
            properties.groupedID = 5;
            window.SetProperty("system.properties.groupedID", properties.groupedID);
            initList();
            break;
        // -------------------------------------------------------------- //
        case 60:
            //---> Sort
            if (selection) {
                fb.RunMainMenuCommand("Edit/Selection/Sort/Sort by...");
            }
            else {
                fb.RunMainMenuCommand("Edit/Sort/Sort by...");
            }
            break;
        case 61:
            plman.SortByFormat(activeList, "", !!selection);
            break;
        case 62:
            if (selection) {
                fb.RunMainMenuCommand("Edit/Selection/Sort/Reverse");
            }
            else {
                fb.RunMainMenuCommand("Edit/Sort/Reverse")
            }
            break;
        case 63:
            plman.SortByFormat(activeList, "%album%", !!selection);
            break;
        case 64:
            plman.SortByFormat(activeList, "%artist%", !!selection);
            break;
        case 65:
            plman.SortByFormat(activeList, "%path%%subsong%", !!selection);
            break;
        case 66:
            plman.SortByFormat(activeList, "%title%", !!selection);
            break;
        case 67:
            plman.SortByFormat(activeList, "%tracknumber%", !!selection);
            break;
        case 68:
            plman.SortByFormat(activeList, "%date%", !!selection);
            break;
        // -------------------------------------------------------------- //
        // Web links
        case 80:
            link("google", metadb);
            break;
        case 81:
            link("googleImages", metadb);
            break;
        case 82:
            link("eCover", metadb);
            break;
        case 83:
            link("wikipedia", metadb);
            break;
        case 84:
            link("youTube", metadb);
            break;
        case 85:
            link("lastFM", metadb);
            break;
        case 86:
            link("discogs", metadb);
            break;
        // -------------------------------------------------------------- //
        // Selection
        case 100: // Send to top
            plman.MovePlaylistSelection(activeList, -plman.GetPlaylistFocusItemIndex(activeList));
            break;
        case 101: // Send to bottom
            plman.MovePlaylistSelection(activeList, playlistItemCount - plman.GetPlaylistSelectedItems(activeList).Count);
            break;
        case 102:
            plman.CreatePlaylist(playlistCount, "");
            plman.InsertPlaylistItems(playlistCount, 0, plman.GetPlaylistSelectedItems(activeList), true);
            break;
        // -------------------------------------------------------------- //
        default:
            _.executeDefaultContextMenu(id, scriptFolder + "Panel_List.js");
    }

    for (var i = 0; i < plman.PlaylistCount; i++) {
        if (id == (sendToPlaylistId + i)) {
            plman.ClearPlaylistSelection(i);
            plman.InsertPlaylistItems(i, plman.PlaylistItemCount(i), plman.GetPlaylistSelectedItems(activeList), true);
        }
    }

    _.dispose(cpm, ccmm, web, ce, appear, sort, lists, send, art, group);

    return true;
}

function PlaylistMenu(x, y) {
    var cpm = window.CreatePopupMenu();

    var playlistCount = plman.PlaylistCount;
    var playlistsStartID = playlistCount;
    var playlistId = playlistsStartID + 4;

    cpm.AppendMenuItem(MF_STRING, playlistsStartID + 1, "Playlist manager... \tCtrl+M");
    cpm.AppendMenuSeparator();
    if (componentUtils) {
        cpm.AppendMenuItem(MF_STRING, playlistsStartID + 2, "Lock Current Playlist");
        cpm.CheckMenuItem(playlistsStartID + 2, plman.IsPlaylistLocked(plman.ActivePlaylist));
    }
    cpm.AppendMenuItem(MF_STRING, playlistsStartID + 3, "Create New Playlist");
    cpm.AppendMenuSeparator();
    for (var i = 0; i != playlistCount; ++i) {
        cpm.AppendMenuItem(MF_STRING, playlistId + i, plman.GetPlaylistName(i).replace(/\&/g, "&&") + " [" + plman.PlaylistItemCount(i) + "]" + (plman.IsAutoPlaylist(i) ? " (Auto)" : "") + (i == plman.PlayingPlaylist ? " \t(Now Playing)" : ""));
    }

    var id = cpm.TrackPopupMenu(x, y);
    switch (id) {
        case playlistsStartID + 1:
            fb.RunMainMenuCommand("View/Playlist Manager");
            break;
        case playlistsStartID + 2:
            fb.RunMainMenuCommand("Edit/Read-only");
            break;
        case playlistsStartID + 3:
            plman.CreatePlaylist(playlistCount, "");
            plman.ActivePlaylist = plman.PlaylistCount;
            break;
    }
    for (var i = 0; i != playlistCount; ++i) {
        if (id == (playlistId + i)) {
            plman.ActivePlaylist = i;
        } // playlist switch
    }

    cpm.Dispose();
}

// =================================================== //

function on_mouse_wheel(delta) {
    if (!pl_s.listLength) {
        return;
    }

    if (pl_s.needsScrollbar) {
        scrollbar.wheel(delta);
    }
}

// =================================================== //

function on_mouse_leave() {
    rows.forEach(function (row, i) {
        row.changeState(0);
    });

    selectedIndex = oldRow = thisRow = undefined;

    if (pl_s.isScrollbarDisplayed) {
        scrollbar.leave();
    }
}

// =================================================== //

function on_playlist_switch() {
    trace_call && fb.trace(qwr_utils.function_name());
    initList();
    if (!showNowPlayingCalled && properties.autoExpandCollapseGroups && properties.autoCollapseOnPlaylistSwitch) {
        CollapseExpandList("collapse");
    }

    if (plman.ActivePlaylist == plman.PlayingPlaylist) {
        showNowPlaying();
    }

    showNowPlayingCalled = false;
}

// =================================================== //

function on_playlists_changed() {
    trace_call && fb.trace(qwr_utils.function_name());
    if (plman.ActivePlaylist > plman.PlaylistCount - 1) {
        plman.ActivePlaylist = plman.PlaylistCount - 1;
    }
    window.SetProperty("system.List Step", "");
    initList();
}

// =================================================== //

function on_playlist_items_reordered(playlist) {
    trace_call && fb.trace(qwr_utils.function_name());
    if (playlist != activeList) {
        return;
    }
    if (!collapsedOnStart) {
        initList();
    }
}

// =================================================== //

function on_playlist_items_removed(playlist) {
    trace_call && fb.trace(qwr_utils.function_name());
    if (playlist != activeList) {
        return;
    }
    initList();
}

// =================================================== //

function on_playlist_items_added(playlist) {
    trace_call && fb.trace(qwr_utils.function_name());
    if (playlist != activeList) {
        return;
    }

    if (dragOverID && !pl_s.linkToLastItem) {
        if (dragOverID.isGroupHeader) {
            plman.MovePlaylistSelection(playlist, -(playlistItemCount - firstItem[dragOverID.groupNr]));
        }
        else {
            plman.MovePlaylistSelection(playlist, -(playlistItemCount - dragOverID.nr));
        }
    }

    dragOverID = undefined;
    pl_s.fileDrag = false;
    initList();

    if (pl_s.linkToLastItem) {
        if (pl_s.needsScrollbar) {
            scrollbar.check_scroll(pl_s.listLength);
        }

        pl_s.linkToLastItem = false;
    }

    for (var i = 0; i != playlistItemCount; i++) {
        if (plman.IsPlaylistItemSelected(activeList, i)) {
            plman.SetPlaylistFocusItem(activeList, i);
            fb.trace("---> " + i);
            repaintList();
            break;
        }
    }
}

// =================================================== //

function on_playlist_items_selection_change() {
    trace_call && fb.trace(qwr_utils.function_name());

    if (!mouseOverList) { //this code executes only if selection is made from external panel.
        if (plman.GetPlaylistSelectedItems(plman.ActivePlaylist).Count <= 1) {
            selectedIndexes = [];
        }
    }

    if (properties.showPlaylistInfo) {
        if (selectedIndexes.length > 0) {
            pl_s.selectionLength = calculateSelectionLength();
        }
        else {
            pl_s.selectionLength = pl_s.playlistDuration;
        }
    }

    pl_s.redrawEverything = true;
    window.Repaint();
}

// =================================================== //

function on_metadb_changed(handles, fromhook) {
    trace_call && fb.trace(qwr_utils.function_name());

    if (handles.Count > 0) {
        if (properties.showPlaylistInfo) {
            if (selectedIndexes.length > 0) {
                pl_s.selectionLength = calculateSelectionLength();
            }
            else {
                pl_s.playlistDuration = utils.FormatDuration(getPlaylistItems.CalcTotalDuration());
                pl_s.selectionLength = pl_s.playlistDuration;
            }
        }

        window.Repaint();
    }
}

// =================================================== //

function on_item_focus_change(playlist, from, to) {
    trace_call && fb.trace(qwr_utils.function_name());
    if (!window.IsVisible) {
        return;
    }

    var CtrlKeyPressed = utils.IsKeyPressed(VK_CONTROL);
    var ShiftKeyPressed = utils.IsKeyPressed(VK_SHIFT);

    //-----------------------------------------------------//

    if (!mouseOverList) { //this code executes only if selection is made from external panel.
        // TODO: figure out what this is about
        if (!selectedIndexes.length && !ShiftKeyPressed && !CtrlKeyPressed) {
            selectedIndexes = [];
            selectedIndexes[0] = to;

        }

        if (CtrlKeyPressed) {
            if (!selectedIndexes.length) {
                selectedIndexes[0] = from;
            }

            for (var i = 0; i < selectedIndexes.length; i++) {
                if (selectedIndexes[i] == to) {
                    selectedIndexes.splice(i, 1);
                    // todo: added break, might break
                    break;
                }
            } //eol

            if (plman.IsPlaylistItemSelected(plman.ActivePlaylist, to)) {
                selectedIndexes.push(to);
                selectedIndexes.sort(numericAscending);
            }

        } //Ctrl end

        if (ShiftKeyPressed) {
            var time = 0;

            var fromTo = [from, to].sort(numericAscending);

            for (var i = fromTo[0], l = fromTo[1]; i <= l; i++) {
                selectedIndexes.push(i);
            } //eol i

            //find and remove duplicates.
            var tempSelectedIndexes = [];
            var obj = {};

            selectedIndexes.forEach(function (item) {
                obj[item] = 0;
            });

            _.forEach(obj, function (item) {
                tempSelectedIndexes.push(item);
            });

            selectedIndexes = tempSelectedIndexes;
            // cleanup selectedIndexes
            tempSelectedIndexes = [];

            selectedIndexes.forEach(function (item) {
                if (plman.IsPlaylistItemSelected(plman.ActivePlaylist, item)) {
                    tempSelectedIndexes.push(item);
                }
            });

            selectedIndexes = tempSelectedIndexes.sort(numericAscending);
        } //if shift
    }

    //------------------------------------------------------------//

    if (CtrlKeyPressed || ShiftKeyPressed) {
        repaintList();
    }
    if (!ShiftKeyPressed) {
        tempFocusItemIndex = undefined;
    }

    if (!CtrlKeyPressed && !ShiftKeyPressed && plman.GetPlaylistSelectedItems(plman.ActivePlaylist).Count > 1) {
        repaintList();
    }

    focusGroupNr = -1;
    if (plman.ActivePlaylist == playlist) {
        if (pl_s.clickedOnGroup) {
            pl_s.clickedOnGroup = false;
        }
        else {
            displayFocusItem(from, to);
        }
    }

    var needsRedraw = false;
    for (var i = 0; i != pl_s.rowsToDraw; i++) {
        var ID = list_modded[i + pl_s.curRowShift];
        var groupNr = ID.groupNr;

        if (ID.isGroupHeader && isCollapsed[groupNr] && firstItem[groupNr] == to) {
            ID.isChanged = true;
            focusGroupNr = groupNr;
            needsRedraw = true;
        }

        if (ID.isGroupHeader && isCollapsed[groupNr] && firstItem[groupNr] == from) {
            ID.isChanged = true;
            needsRedraw = true;
        }
    }
    if (needsRedraw) {
        repaintList();
    }
}

function RefocusGroup() {
    var prevFocusGroupNr = focusGroupNr;
    focusGroupNr = -1;

    var focusItemID = plman.GetPlaylistFocusItemIndex(activeList);

    for (var i = 0; i != pl_s.rowsToDraw; i++) {
        var ID = list_modded[i + pl_s.curRowShift];
        var groupNr = ID.groupNr;

        if (ID.isGroupHeader && isCollapsed[groupNr]) {
            if (firstItem[groupNr] == focusItemID) {
                ID.isChanged = true;
                focusGroupNr = groupNr;
            }
            else if (prevFocusGroupNr !== -1 && groupNr == prevFocusGroupNr) {
                ID.isChanged = true;
            }
        }
    }
}

function on_playback_pause(state) {
    trace_call && fb.trace(qwr_utils.function_name());
    repaintList();
}

// =================================================== //

function on_playback_starting(cmd, is_paused) {
    trace_call && fb.trace(qwr_utils.function_name());
    if (!window.IsVisible) {
        return;
    }

    if (!is_paused && plman.ActivePlaylist == plman.PlayingPlaylist) {
        displayFocusItem(undefined, plman.GetPlaylistFocusItemIndex(activeList));
    }
    else {
        repaintList();
    }
}

// =================================================== //

function on_playback_edited(metadb) {
    trace_call && fb.trace(qwr_utils.function_name());
    repaintList();
}

// =================================================== //

function on_playback_queue_changed() {
    trace_call && fb.trace(qwr_utils.function_name());
    repaintList();
}

// =================================================== //
var oldPlayingID;

function on_playback_new_track(metadb) {
    trace_call && fb.trace(qwr_utils.function_name());

    var playingID = plman.GetPlayingItemLocation().PlaylistItemIndex;
    var rating;
    if (properties.useTagRating) {
        var fileInfo = metadb.GetFileInfo();
        rating = fileInfo.MetaValue(fileInfo.MetaFind("rating"), 0);
    }
    else {
        rating = _.tf("%rating%", metadb);
    }

    if (plman.ActivePlaylist == plman.PlayingPlaylist) {
        // Full repaint for updated metadata (in playlist info as well)
        pl_s.redrawEverything = true;
        window.Repaint();
    }

    if (newTrackByClick) {
        newTrackByClick = false;
    }
    else {
        //----------------------->
        if (properties.enableSkip && rating && rating < properties.skipLessThan) {
            if (oldPlayingID < playingID) {
                fb.Next();
            }
            else if (oldPlayingID == undefined || oldPlayingID > playingID) {
                fb.Prev();
            }
        }
        //----------------------->

        var album = _.tf("%artist%%album%%discnumber%", metadb);

        if (album != tempAlbumOnPlaybackNewTrack || plman.ActivePlaylist == plman.PlayingPlaylist) {
            tempAlbumOnPlaybackNewTrack = album;

            if (properties.autoExpandCollapseGroups) {
                CollapseExpandPlayingGroup();
            }
        }
    }

    oldPlayingID = playingID;
}

// =================================================== //

function on_playback_stop(reason) {
    trace_call && fb.trace(qwr_utils.function_name());
    if (reason != 2) {
        pl_s.redrawEverything = true;
        repaintList();
    }
}

// =================================================== //

function on_focus(is_focused) {
    trace_call && fb.trace(qwr_utils.function_name());
    panelFocus = is_focused;

    //TODO: think about removing pl_s.redrawEverything
    pl_s.redrawEverything = true;
    repaintList();
}

// =================================================== //

function on_key_down(vkey) {
    trace_call && fb.trace(qwr_utils.function_name());

    var CtrlKeyPressed = utils.IsKeyPressed(VK_CONTROL);
    var ShiftKeyPressed = utils.IsKeyPressed(VK_SHIFT);

    var focusItemIndex = plman.GetPlaylistFocusItemIndex(activeList);

    if (!ShiftKeyPressed || tempFocusItemIndex == undefined) {
        tempFocusItemIndex = focusItemIndex;
    }

    pl_s.keyPressed = true;

    switch (vkey) {
        case VK_UP:
            if (focusItemIndex == 0 && pl_s.listIsScrolledUp) {
                return;
            }

            if (ShiftKeyPressed) {
                if (tempFocusItemIndex == focusItemIndex) {
                    plman.ClearPlaylistSelection(activeList);
                    plman.SetPlaylistSelectionSingle(activeList, focusItemIndex, true);
                }

                if (tempFocusItemIndex < focusItemIndex) {
                    plman.SetPlaylistSelectionSingle(activeList, focusItemIndex, false);
                }

                plman.SetPlaylistSelectionSingle(activeList, focusItemIndex - 1, true);
            }

            if (!CtrlKeyPressed && !ShiftKeyPressed) {
                plman.ClearPlaylistSelection(activeList);
                plman.SetPlaylistSelectionSingle(activeList, focusItemIndex - 1, true);
            }

            plman.SetPlaylistFocusItem(activeList, focusItemIndex - 1);

            break;
        case VK_DOWN:
            if (focusItemIndex == (playlistItemCount - 1) && pl_s.listIsScrolledDown) {
                return;
            }

            if (ShiftKeyPressed) {
                if (tempFocusItemIndex == focusItemIndex) {
                    plman.ClearPlaylistSelection(activeList);
                    plman.SetPlaylistSelectionSingle(activeList, focusItemIndex, true);
                }

                if (tempFocusItemIndex > focusItemIndex) {
                    plman.SetPlaylistSelectionSingle(activeList, focusItemIndex, false);
                }

                plman.SetPlaylistSelectionSingle(activeList, focusItemIndex + 1, true);
            }

            if (!CtrlKeyPressed && !ShiftKeyPressed) {
                plman.ClearPlaylistSelection(activeList);
                plman.SetPlaylistSelectionSingle(activeList, focusItemIndex + 1, true);
            }
            plman.SetPlaylistFocusItem(activeList, focusItemIndex + 1);

            break;
        case VK_PRIOR:

            var IDnr = 0;

            if (pl_s.needsScrollbar) {
                pl_s.fastScrollActive = true;
                scrollbar.shift_page(-1);
                var ID = list_modded[Math.floor(pl_s.rowsToDraw / 2) + pl_s.curRowShift];
                IDnr = ID.isGroupHeader ? firstItem[ID.groupNr] : ID.nr;
            }

            plman.ClearPlaylistSelection(activeList);
            plman.SetPlaylistSelectionSingle(activeList, IDnr, true);
            plman.SetPlaylistFocusItem(activeList, IDnr);

            break;
        case VK_NEXT:

            var IDnr = (playlistItemCount - 1);

            if (pl_s.needsScrollbar) {
                pl_s.fastScrollActive = true;
                scrollbar.shift_page(1);
                var ID = list_modded[Math.floor(pl_s.rowsToDraw / 2) + pl_s.curRowShift];
                IDnr = ID.isGroupHeader ? firstItem[ID.groupNr] : ID.nr;
            }

            plman.ClearPlaylistSelection(activeList);
            plman.SetPlaylistSelectionSingle(activeList, IDnr, true);
            plman.SetPlaylistFocusItem(activeList, IDnr);

            break;
        case VK_DELETE:

            plman.RemovePlaylistSelection(activeList, false);

            break;
        case VK_KEY_A:

            CtrlKeyPressed && selectAll();

            break;
        case VK_KEY_F:

            CtrlKeyPressed && fb.RunMainMenuCommand("Edit/Search");
            ShiftKeyPressed && fb.RunMainMenuCommand("Library/Search");

            break;
        case VK_RETURN:

            plman.ExecutePlaylistDefaultAction(activeList, focusItemIndex);
            newTrackByClick = true;

            break;

        case VK_HOME:
            if (focusItemIndex == 0 && pl_s.listIsScrolledUp) {
                return;
            }

            plman.ClearPlaylistSelection(activeList);

            if (ShiftKeyPressed) {
                selectedIndexes = [];

                for (var i = tempFocusItemIndex; i >= 0; i--) {
                    selectedIndexes.push(i);
                    selectedIndexes.sort(numericAscending);
                }
                plman.SetPlaylistSelection(activeList, selectedIndexes, true);
            }
            else {
                plman.SetPlaylistSelectionSingle(activeList, 0, true);
            }

            plman.SetPlaylistFocusItem(activeList, 0);

            break;
        case VK_END:
            if (focusItemIndex == (playlistItemCount - 1) && pl_s.listIsScrolledDown) {
                return;
            }

            plman.ClearPlaylistSelection(activeList);

            if (ShiftKeyPressed) {
                selectedIndexes = [];

                for (var i = tempFocusItemIndex; i <= (playlistItemCount - 1); ++i) {
                    selectedIndexes.push(i);
                }
                plman.SetPlaylistSelection(activeList, selectedIndexes, true);
            }
            else {
                plman.SetPlaylistSelectionSingle(activeList, (playlistItemCount - 1), true);
            }

            plman.SetPlaylistFocusItem(activeList, (playlistItemCount - 1));

            break;
        case VK_KEY_N:
            if (CtrlKeyPressed) {
                plman.CreatePlaylist(plman.PlaylistCount, "");
                plman.ActivePlaylist = plman.PlaylistCount - 1;
            }
            break;
        case VK_KEY_O:
            if (ShiftKeyPressed) {
                fb.RunContextCommandWithMetadb("Open Containing Folder", fb.GetFocusItem());
            }
            break;
        case VK_KEY_M:
            if (CtrlKeyPressed) {
                fb.RunMainMenuCommand("View/Playlist Manager");
            }
            break;
        case VK_KEY_Q:

            if (CtrlKeyPressed && ShiftKeyPressed) {
                plman.FlushPlaybackQueue();
                return;
            }

            if (CtrlKeyPressed) {
                plman.AddPlaylistItemToPlaybackQueue(activeList, focusItemIndex);

            }
            else if (ShiftKeyPressed) {
                var index = plman.FindPlaybackQueueItemIndex(fb.GetFocusItem(), activeList, focusItemIndex);
                plman.RemoveItemFromPlaybackQueue(index);

            }
            break;
        case VK_F5:
            initList();
            repaintList();
            break;
        case VK_KEY_X:
            if (CtrlKeyPressed) {
                cut();
            }
            break;
        case VK_KEY_V:
            if (CtrlKeyPressed) {
                paste();
            }
            break;
    }
}

// =================================================== //

function on_key_up(vkey) {
    trace_call && fb.trace(qwr_utils.function_name());

    if (vkey == VK_PRIOR || vkey == VK_NEXT) {
        pl_s.fastScrollActive = false;
        getAlbumArt();
    }
}

function on_drag_enter(action, x, y, mask) {
    trace_call && fb.trace(qwr_utils.function_name());

    pl_s.itemDropped = false;

    if (pl_s.listLength && (y > (rows[pl_s.rowsToDraw - 1].y + properties.rowH)) && !pl_s.linkToLastItem && ((pl_s.needsScrollbar && pl_s.listIsScrolledDown) || !pl_s.needsScrollbar)) {
        pl_s.linkToLastItem = true;
        rows[pl_s.rowsToDraw - 1].repaint();

    }
    else {
        pl_s.linkToLastItem = false;
    }
}

// =================================================== //

function on_drag_drop(action, x, y, mask) {
    trace_call && fb.trace(qwr_utils.function_name());

    var idx;

    if (!plman.PlaylistCount) {
        idx = plman.CreatePlaylist(0, "Default");
        plman.ActivePlaylist = 0;
    }
    else {
        plman.ClearPlaylistSelection(activeList);
        idx = activeList;
    }

    if (idx !== undefined) {
        action.ToPlaylist();
        action.Playlist = idx;
        action.ToSelect = true;
    }

    pl_s.itemDropped = true;
    pl_s.fileDrag = false;
    repaintList();
}

// =================================================== //

function on_drag_over(action, x, y, mask) {
    trace_call && fb.trace(qwr_utils.function_name());

    var traceData =
        {
            thisID:       undefined,
            thisRow:      undefined,
            thisRowNr:    undefined,
            thisRowBtnNr: 0
        };
    getMouseTraceData(x, y, traceData);

    var thisID = traceData.thisID;

    pl_s.fileDrag = true;

    if (thisID) {
        dragOverID = thisID;
    }

    on_mouse_move(x, y);
}

// =================================================== //

function on_drag_leave() {
    trace_call && fb.trace(qwr_utils.function_name());

    dragOverID = undefined;
    pl_s.fileDrag = pl_s.linkToLastItem = pl_s.itemDropped = false;

    repaintList();

    if (scrollStepRepeatTimerStarted) {
        // todo: here!
        stopScrollRepeat();
    }
}

function on_notify_data(name, info) {
    trace_call && fb.trace(qwr_utils.function_name());

    if (name === "minimode_state") {
        common_vars.minimode_state = info;
    }
    else if (name === "minimode_state_size") {
        on_size();
        // Focus might have changed
        RefocusGroup();
        window.Repaint();
    }
}

// =================================================== //

function getAlbumArt() {
    if (!properties.showAlbumArt) {
        return;
    }

    if (pl_s.fastScrollActive) {
        return;
    }

    for (var i = 0; i != pl_s.rowsToDraw; i++) {
        var ID = list_modded[i + pl_s.curRowShift];

        var groupNr = ID.groupNr;

        if (ID.isGroupHeader) {
            if (groupNr != tempGroupNrOnGetAlbumArt) {
                if (!artArray[groupNr] && artArray[groupNr] !== null) {
                    utils.GetAlbumArtAsync(window.ID, ID.metadb, AlbumArtId.front);
                }
            }

            tempGroupNrOnGetAlbumArt = groupNr;
        }
    }
}

// =================================================== //
var artSize = properties.rowsInGroup * properties.rowH;

function on_get_album_art_done(metadb, art_id, image, image_path) {
    trace_call && fb.trace(qwr_utils.function_name());

    if (image && image.Height > artSize) {
        image = image.Resize(artSize, artSize, 0);
    }
    if (!image) {
        image = null;
    }

    var tempGroupNr = -1;

    for (var i = 0; i != pl_s.rowsToDraw; i++) {
        var ID = list_modded[i + pl_s.curRowShift];
        var groupNr = ID.groupNr;

        if (ID.isGroupHeader && (artArray[groupNr] !== null) && groupNr != tempGroupNr && ID.metadb.Compare(metadb)) {
            artArray[groupNr] = image;

            tempGroupNr = groupNr;

            ID.isChanged = true;
            repaintList();
        }
    }
}

// =================================================== //

function selectAll() {
    for (var i = 0; i != playlistItemCount; i++) {
        selectedIndexes[i] = i;
    }

    plman.SetPlaylistSelection(plman.ActivePlaylist, selectedIndexes, true);
}

// =================================================== //

function resizeDone() {
    if (pl_s.listLength) {
        getAlbumArt();
    }
}

// =================================================== //

function calculateSelectionLength() {
    var selectionLengthInSeconds = 0;

    selectedIndexes.forEach(function (item) {
        var trackLength = parseFloat(_.tf("%length_seconds_fp%", getPlaylistItems.Item(item)));
        if (trackLength) {
            selectionLengthInSeconds += trackLength;
        }
    });

    if (!selectionLengthInSeconds && selectedIndexes.length > 0) {
        if (selectedIndexes.length > 1) {
            return "Unknown";
        }

        var path = _.tf("%path%", getPlaylistItems.Item(selectedIndexes[0]));
        var radio = _.startsWith(path, 'http');

        return radio ? "Stream" : "Unknown";
    }
    //return timeFormat(selectionLengthInSeconds);

    return utils.FormatDuration(selectionLengthInSeconds);
}

// =================================================== //

function calculateGroupLength(arrBegin, arrEnd) {
    var groupLengthInSeconds = 0;

    for (var item = arrBegin; item <= arrEnd; item++) {
        var trackLength = parseFloat(_.tf("%length_seconds_fp%", getPlaylistItems.Item(item)));
        if (trackLength) {
            groupLengthInSeconds += trackLength;
        }
    }

    if (!groupLengthInSeconds) {
        return "Unknown";
    }

    //if(!qwr_utils.caller())
    //return timeFormatListTotal(groupLengthInSeconds);
    //else
    //return timeFormat(groupLengthInSeconds);

    return utils.FormatDuration(groupLengthInSeconds);
}

// =================================================== //

function repaintList() {
    if (window.IsVisible) {
        pl_s.listW && window.RepaintRect(pl_s.listX, pl_s.listY + 1, pl_s.listW, pl_s.listH);
    }
}

// =================================================== //


function CollapseExpandGroup(groupNr, command) {
    if (!playlistItemCount) {
        return;
    }

    if (!isCollapsed[groupNr] && (command === "collapse" || command === "toggle")) {
        list_modded.splice(firstItemID_modded[groupNr], itemCountInGroup[groupNr]);
        isCollapsed[groupNr] = true;
    }
    else if (isCollapsed[groupNr] && (command === "expand" || command === "toggle")) {
        list_modded = _.concat(list_modded.slice(0, firstItemID_modded[groupNr]),
            list_pure.slice(firstItemID_pure[groupNr], lastItemID_pure[groupNr] + 1),
            list_modded.slice(firstItemID_modded[groupNr]));
        isCollapsed[groupNr] = false;
    }
    else if (command !== "collapse" && command !== "expand" && command !== "toggle") {
        unknown_command;
    }

    //---> update firstItemID_modded
    list_modded.forEach(function (ID, i) {
        if (ID.isGroupHeader && ID.rowNr == curRowsInGroup) {
            firstItemID_modded[ID.groupNr] = i + 1;
        }
    });

    pl_s.listLength = list_modded.length;
    listOnSize();
    repaintList();
}

function CollapseExpandList(command) {
    collapsedOnStart = false;

    if (!playlistItemCount) {
        return;
    }

    if (command == "expand") {
        list_modded = _.clone(list_pure);
        isCollapsed = [];
    }
    else if (command == "collapse") {
        for (var i = groupNr; i >= 0; i--) {
            if (!isCollapsed[i]) {
                list_modded.splice(firstItemID_modded[i], itemCountInGroup[i]);
                isCollapsed[i] = true;
            }
        }
    }
    else if (command !== "collapse" && command !== "expand") {
        unknown_command;
    }

    //---> update firstItemID_modded
    list_modded.forEach(function (ID, i) {
        if (ID.isGroupHeader && ID.rowNr == curRowsInGroup) {
            firstItemID_modded[ID.groupNr] = i + 1;
        }
    });

    pl_s.listLength = list_modded.length;
    listOnSize();
    repaintList();
}

function CollapseExpandPlayingGroup() {
    if (!fb.IsPlaying || plman.ActivePlaylist != plman.PlayingPlaylist) {
        return;
    }

    var playingItemLocation = plman.GetPlayingItemLocation();
    var isValid;

    if (playingItemLocation.IsValid) {
        CollapseExpandList("collapse");
        CollapseExpandGroup(getPlayingGroupNr(), "expand")
    }

    var counter = 0;

    if (!playingItemLocation.IsValid) {
        var timer = window.SetInterval(function () { // timer for getting delayed item location info when skip track selected
            isValid = plman.GetPlayingItemLocation().IsValid;

            counter++;

            if (isValid || counter == 100 || !fb.IsPlaying) {
                window.ClearInterval(timer);

                if (fb.IsPlaying) {
                    CollapseExpandList("collapse");
                    CollapseExpandGroup(getPlayingGroupNr(), "expand")
                }
            }
        }, 100);
    }

    // TODO: test this
    //when auto or collapse all but now playing is selected scrolls now playing album to the top
    _.forEach(list_modded, function (ID, i) {
        if (ID.isGroupHeader && ID.groupNr == getPlayingGroupNr()) {
            var step = i;
            if (step < 0) {
                step = 0;
            }
            pl_s.listPos[activeList] = Math.min(pl_s.listLength - pl_s.rowsToDraw, step);
            window.SetProperty("system.List Step", pl_s.listPos.toString());
            return false;
        }
    });

    function getPlayingGroupNr() {
        var playingIndex = -1;

        if (plman.PlayingPlaylist == activeList) {
            playingIndex = plman.GetPlayingItemLocation().PlaylistItemIndex;
        }

        for (var g = 0; g <= groupNr; g++) {
            for (var i = firstItem[g]; i <= lastItem[g]; i++) {
                if (playingIndex == i) {
                    return g;
                }
            }
        }
    }
}

function isGroupSelected(groupNr) {
    // searches only currently visible groups
    var selectedCount = 0;
    for (var item = firstItem[groupNr]; item <= lastItem[groupNr]; item++) {
        if (plman.IsPlaylistItemSelected(activeList, item)) {
            selectedCount++;
        }
    }

    return (selectedCount === itemCountInGroup[groupNr]);
}

function IsGroupPlaying(groupNr, playingID) {
    for (var item = firstItem[groupNr]; item <= lastItem[groupNr]; item++) {
        if (playingID === item) {
            return true;
        }
    }

    return false;
}

function displayFocusItem(prevFocusID, focusID) {
    if (pl_s.listLength <= pl_s.rowsToDraw) {
        return;
    }

    var visibleGroupRows = [];
    var tempGroupNr = 0;
    var groupRowCount = 0;
    var partialState = 0; // 0 - full, 1 - top partial, 2 - bottom partial

    for (var i = 0; i != pl_s.rowsToDraw; i++) {
        var ID = list_modded[i + pl_s.curRowShift];

        if (isCollapsed.length && ID.isGroupHeader) {
            var groupNr = ID.groupNr;
            groupRowCount = (groupNr == tempGroupNr) ? (groupRowCount + 1) : 1;
            visibleGroupRows[groupNr] = groupRowCount;
        }

        tempGroupNr = groupNr;
    }

    for (var i = 0; i != pl_s.rowsToDraw; i++) {
        var ID = list_modded[i + pl_s.curRowShift];
        var groupNr = ID.groupNr;
        if (isCollapsed[groupNr] && ID.isGroupHeader) {
            for (var item = firstItem[groupNr]; item <= lastItem[groupNr]; item++) {
                if (focusID == item && visibleGroupRows[groupNr] == curRowsInGroup) {
                    return;
                }
            }
        }
        else if (ID && focusID == ID.nr) {
            var rowY = rows[i].y + pl_s.curPixelShift;
            if (rowY >= pl_s.listY && rowY + properties.rowH <= pl_s.listY + pl_s.listH) {
                ID.isChanged = true;
                repaintList();
                return;
            }
            else if (rowY < pl_s.listY && rowY + properties.rowH > pl_s.listY) {
                partialState = 1;
            }
            else if (rowY < pl_s.listY + pl_s.listH && rowY + properties.rowH > pl_s.listY + pl_s.listH) {
                partialState = 2;
            }
        }
    }

    var IDnr;
    _.forEach(list_modded, function (ID, i) {
        var groupNr = ID.groupNr;

        if (isCollapsed.length && visibleGroupRows[groupNr] == curRowsInGroup) {
            for (var item = firstItem[groupNr]; item <= lastItem[groupNr]; item++) {
                if (focusID == item && isCollapsed[groupNr]) {
                    IDnr = firstItem[groupNr];
                }
            }
        }

        if (IDnr != undefined || ID.nr == focusID) {
            if (partialState == 1) {
                scrollbar.shift_line(-1);
            }
            else if (partialState == 2) {
                scrollbar.shift_line(1);
            }
            else if (prevFocusID != undefined && prevFocusID + 1 == focusID) {
                scrollbar.check_scroll(i - pl_s.windowSizeInRows + 1);
            }
            else if (prevFocusID != undefined && prevFocusID - 1 == focusID) {
                scrollbar.check_scroll(i);
            }
            else {
                scrollbar.check_scroll(i - Math.floor(pl_s.rowsToDraw / 2));
            }

            return false;
        }
    });
}

// =================================================== //

function showNowPlaying() {
    if (!fb.IsPlaying) {
        return;
    }

    var getPlayingItemLocation = plman.GetPlayingItemLocation();
    if (!getPlayingItemLocation.IsValid) {
        return;
    }

    if (plman.ActivePlaylist != plman.PlayingPlaylist) {
        plman.ActivePlaylist = plman.PlayingPlaylist;
        initList();
    }

    if (properties.autoExpandCollapseGroups && properties.autoCollapseOnPlaylistSwitch) {
        CollapseExpandList("collapse");
    }

    var focusItemID = plman.GetPlaylistFocusItemIndex(activeList);
    var playingID = getPlayingItemLocation.PlaylistItemIndex;
    plman.ClearPlaylistSelection(activeList);
    plman.SetPlaylistSelectionSingle(activeList, playingID, true);
    plman.SetPlaylistFocusItem(activeList, playingID);

    _.forEach(list_modded, function (ID, i) {
        var groupNr = ID.groupNr;

        if (isCollapsed.length && ID.rowNr == curRowsInGroup) {
            for (var item = firstItem[groupNr]; item <= lastItem[groupNr]; item++) {
                if (playingID == item) {
                    CollapseExpandGroup(groupNr, "expand");
                }
            }
        }

        if (ID.nr == playingID) {
            //displayFocusItem(focusItemID,playingID);
            var step = i - Math.floor(pl_s.rowsToDraw / 2);
            if (step < 0) {
                step = 0;
            }

            pl_s.listPos[activeList] = step;
            window.SetProperty("system.List Step", pl_s.listPos.toString());
            calculateShiftParams();

            listOnSize();
            window.Repaint();

            return false;
        }
    });

    if (plman.ActivePlaylist != plman.PlayingPlaylist) {
        showNowPlayingCalled = true;
    }
}

// =================================================== //

var itemCountInGroup = [];

function initList() {
    tempAlbumOnPlaybackNewTrack = undefined;
    tempGroupNrOnGetAlbumArt = -1;

    activeList = plman.ActivePlaylist;
    playlistCount = plman.PlaylistCount;
    playlistItemCount = plman.PlaylistItemCount(activeList);
    getPlaylistItems = plman.GetPlaylistItems(activeList);
    selectedItemCount = plman.GetPlaylistSelectedItems(activeList).Count;

    pl_s.listIsScrolledUp = pl_s.listIsScrolledDown = false;
    pl_s.playlistImgYShift = undefined;
    list_modded = [];
    list_pure = [];
    firstItem = [];
    firstItemID_pure = [];
    firstItemID_modded = [];
    lastItem = [];
    lastItemID_pure = [];
    itemCountInGroup = [];
    isCollapsed = [];
    selectedIndexes = [];
    queueIndexes = [];
    artArray = [];
    groupNr = 0;
    var a, b, metadb;
    var id = 0,
        oddItem = 0,
        from = 0;

    var initTest = 0;
    if (initTest) {
        from = new Date();
    }

    var itemNrInGroup = 1;
    for (var i = 0; i != playlistItemCount; i++) {
        metadb = getPlaylistItems.Item(i);

        a = _.tf(properties.groupFormat, metadb);

        if (a != b && properties.showGroupHeader) {
            itemNrInGroup = 1;
            for (var groupHeaderRow = 1; groupHeaderRow <= curRowsInGroup; groupHeaderRow++) {
                var group =
                    {
                        groupNr:       groupNr, // first group nr = 0
                        metadb:        metadb,
                        isGroupHeader: true,
                        rowNr:         groupHeaderRow,
                        isChanged:     false
                    };

                firstItem[groupNr] = i;
                list_pure[id] = group;

                id++;

                if (groupHeaderRow == curRowsInGroup) {
                    firstItemID_pure[groupNr] = id;
                }
            }

            if (groupNr > 0) {
                var gNr = groupNr - 1;
                lastItem[gNr] = i - 1;
                lastItemID_pure[gNr] = id - curRowsInGroup - 1;
                itemCountInGroup[gNr] = lastItem[groupNr - 1] - firstItem[groupNr - 1] + 1;
            }

            groupNr++;

            b = a;

            if (i % 2 == 0) {
                oddItem = 0;
            }
            if (i % 2 == 1) {
                oddItem = 1;
            }
        }

        list_pure[id] = {
            metadb:    metadb,
            nr:        i,
            nrInGroup: itemNrInGroup,
            isOdd:     i % 2 == oddItem,
            isChanged: false
        };

        ++itemNrInGroup;
        id++;

        if (selectedItemCount && plman.IsPlaylistItemSelected(activeList, i)) {
            selectedIndexes.push(i);
        }
    } //eol

    if (initTest) {
        fb.trace("---> Initialized: " + (new Date() - from) + " ms");
    }

    groupNr--;

    gNr = groupNr;
    lastItem[gNr] = playlistItemCount - 1;
    lastItemID_pure[gNr] = id - 1;
    itemCountInGroup[gNr] = lastItem[gNr] - firstItem[gNr] + 1;

    list_modded = _.clone(list_pure);
    firstItemID_modded = _.clone(firstItemID_pure);
    pl_s.listLength = list_modded.length;

    (listOnSize = function () {
        if (ww <= 0 || wh <= 0) {
            return;
        }

        isResizingDone(ww, wh, resizeDone);

        pl_s.listX = properties.listLeftMargin;
        pl_s.listY = properties.listTopMargin + (properties.showPlaylistInfo ? (listInfoHeight + pssGap) : 0);
        pl_s.listH = Math.max(0, window.Height - pl_s.listY - properties.listBottomMargin);
        pl_s.listW = Math.max(100, window.Width - pl_s.listX - properties.listRightMargin);

        pl_s.redrawEverything = true;

        pl_s.windowSizeInRows = Math.min(pl_s.listLength, pl_s.listH / properties.rowH);
        var rowsToDrawFull = Math.floor(pl_s.windowSizeInRows);

        if (pl_s.listPos[activeList] + pl_s.windowSizeInRows > pl_s.listLength && pl_s.listLength >= pl_s.windowSizeInRows) {
            pl_s.listPos[activeList] = pl_s.listLength - pl_s.windowSizeInRows;
            window.SetProperty("system.List Step", pl_s.listPos.toString());
        }
        calculateShiftParams();

        var rowArrSize;
        if (pl_s.listLength > rowsToDrawFull) {// The amount of rows(including partials) in the window varies:
            // case 1: rowsToDrawFull - no partial rows, zero pixel shift
            // case 2: rowsToDrawFull + 1 - one partial row with zero pixel shift
            // case 3: rowsToDrawFull + 1 - two partials with pixel shift
            // case 4: rowsToDrawFull + 2 - two partial rows with pixel shift
            pl_s.needsScrollbar = true;

            pl_s.rowsToDrawWhenZeroShift = Math.ceil(pl_s.windowSizeInRows);
            rowArrSize = Math.max(pl_s.rowsToDrawWhenZeroShift + 1, pl_s.listLength);

            if (pl_s.curPixelShift && (pl_s.rowsToDrawWhenZeroShift + pl_s.curRowShift) < pl_s.listLength) {// case 3 and 4
                pl_s.rowsToDraw = pl_s.rowsToDrawWhenZeroShift + 1;
            }
            else {// case 1 and 2
                pl_s.rowsToDraw = pl_s.rowsToDrawWhenZeroShift;
            }
        }
        else {
            pl_s.needsScrollbar = false;

            pl_s.rowsToDraw = rowsToDrawFull;
            rowArrSize = pl_s.rowsToDraw;
        }

        pl_s.isScrollbarDisplayed = pl_s.needsScrollbar && properties.showScrollbar;

        pl_s.listIsScrolledUp = (pl_s.listPos[activeList] == 0);
        if (pl_s.needsScrollbar) {
            var partialRowShift = (pl_s.listPos[activeList] - pl_s.curRowShift);
            var difference = Math.ceil(pl_s.windowSizeInRows) - pl_s.windowSizeInRows;
            pl_s.listIsScrolledDown = pl_s.listPos[activeList] >= (pl_s.listLength - pl_s.windowSizeInRows) && Math.abs(partialRowShift - difference) < 0.0001;
        }
        else {
            pl_s.listIsScrolledDown = true;
        }

        if (pl_s.isScrollbarDisplayed) {
            pl_s.listW = pl_s.listW - properties.scrollbarW - properties.sbarRightMargin;
        }

        //---> Row Object

        rows = [];
        b = [];

        ratingBtnX = pl_s.listX + pl_s.listW - ratingBtnW * 5;

        if (pl_s.listLength) {
            for (var i = 0; i != rowArrSize; i++) {
                var rowY = pl_s.listY + i * properties.rowH;
                rows[i] = new Row(pl_s.listX, rowY, pl_s.listW, properties.rowH);

            }
            ratingBtnRightPad = 5;
            for (var i = 0; i != rowArrSize; i++) {
                rows[i].buttons = [];

                for (var j = 0; j < 5; j++) {
                    var x = ratingBtnX + j * ratingBtnW - ratingBtnRightPad;
                    var y = rows[i].y + properties.rowH / 2 - ratingBtnW / 2 - 1;

                    rows[i].buttons[j] = new RowButton(x, y, ratingBtnW, ratingBtnW);
                }
            }
        }

        //---> Scrollbar

        if (pl_s.needsScrollbar) {
            //if ( properties.showScrollbar )
            //{
            //  pl_s.listW -= properties.scrollbarW - properties.sbarRightMargin;
            //}

            var scrollbarX = ww - properties.scrollbarW - properties.sbarRightMargin;
            var scrollbarY = 3 + properties.listTopMargin + (properties.showPlaylistInfo ? listInfoHeight : 0);
            var scrollbarH = wh - scrollbarY - properties.listBottomMargin - 6;

            if (scrollbar) {
                scrollbar.reset();
            }

            scrollbar = new _.scrollbar(scrollbarX, scrollbarY, properties.scrollbarW, scrollbarH, pl_s.windowSizeInRows, properties.rowH, scrollbarRedrawCallback);
            scrollbar.set_rows(pl_s.listLength);

            createScrollbarThumbImages(properties.scrollbarW, scrollbar.thumb_h);
            scrollbar.create_parts(sbarImgs);

            scrollbar.check_scroll(pl_s.listPos[activeList], true);
        }
    })();

    //---> init list step
    pl_s.listPos = [];

    var step = [];
    var s = window.GetProperty("system.List Step", "");
    if (s.indexOf(",") != -1) {
        step = s.split(",")
    }
    else {
        step[0] = Math.max(0, s)
    }

    for (var i = 0; i < playlistCount; i++) {
        pl_s.listPos[i] = (step[i] == undefined ? 0 : (isNaN(step[i]) ? 0 : Math.max(0, step[i])));

    }
    window.SetProperty("system.List Step", pl_s.listPos.toString());
    //--->

    window.Repaint();

    plman.SetActivePlaylistContext();

    if (properties.showPlaylistInfo) {
        pl_s.playlistDuration = utils.FormatDuration(getPlaylistItems.CalcTotalDuration());
        if (selectedIndexes) {
            pl_s.selectionLength = calculateSelectionLength();
        }
    }
}

initList();

// =================================================== //
var doubleClicked = false,
    mouseOverList = false,
    newTrackByClick = false,
    actionNotAllowed = false,
    clickedOnSelectedItem = false,
    selectWithDrag = false,
    mouseInRatingBtn = false;
var oldRow, oldID, selectedIndex, dragOverID;

function getMouseTraceData(x, y, data) {
    mouseOverList = false;
    mouseInRatingBtn = false;

    if (!traceList(x, y)) {
        return;
    }

    _.forEach(rows, function (row, i) {
        if (row.trace(x, y)) {
            mouseOverList = true;
            data.thisRow = row;
            data.thisID = list_modded[i + pl_s.curRowShift];
            data.thisRowNr = i;
            //->
            if (properties.showRating && !data.thisID.isGroupHeader) {
                var buttons = row.buttons;

                for (var j = 0; j < 5; j++) {
                    if (buttons[j].trace(x, y)) {
                        data.thisRowBtnNr = j;
                        mouseInRatingBtn = true;
                    }
                }
            }
            return false;
        }
    });
}

function traceList(x, y) {
    return (pl_s.listX <= x) && (x <= pl_s.listX + pl_s.listW) && (pl_s.listY <= y) && (y <= pl_s.listY + pl_s.listH );
}

function Row(x, y, w, h, buttons) {
    this.trace = function (x, y) {
        return (this.x <= x) && (x <= this.x + this.w) && (this.y + pl_s.curPixelShift <= y) && (y + pl_s.curPixelShift <= this.y + this.h);
    };

    this.repaint = function () {
        window.RepaintRect(this.x - 5, this.y + pl_s.curPixelShift - 5, this.w + 10, this.h + 10);
    };

    this.changeState = function (state) {
        if (this.state != state) {
            this.state = state;

            if (pl_s.rowDrag || pl_s.fileDrag) {
                pl_s.redrawEverything = true;
                this.repaint();
            }
        }
    };

    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.buttons = buttons;
    this.state = 0;
}

function RowButton(x, y, w, h) {
    this.trace = function (x, y) {
        return (this.x <= x) && (x <= this.x + this.w) && (this.y + pl_s.curPixelShift <= y) && (y + pl_s.curPixelShift <= this.y + this.h);
    };
    this.repaint = function () {
        window.RepaintRect(this.x, this.y + pl_s.curPixelShift, this.w, this.h);
    };

    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
}

// =================================================== //

var cuttedItems;
var cuttedItemsCount = 0;

function cut() {
    cuttedItems = plman.GetPlaylistSelectedItems(activeList);
    cuttedItemsCount = cuttedItems.Count;
    plman.RemovePlaylistSelection(activeList);
}

// =============================================== //
function paste() {
    if (cuttedItemsCount) {
        if (plman.GetPlaylistSelectedItems(plman.ActivePlaylist).Count > 0) {
            plman.ClearPlaylistSelection(activeList);
            plman.InsertPlaylistItems(activeList, plman.GetPlaylistFocusItemIndex(activeList), cuttedItems, true);
        }
        else {
            plman.InsertPlaylistItems(activeList, playlistItemCount, cuttedItems, true);
        }
        cuttedItemsCount = 0;
    }
}

// =============================================== //

var scrollStepRepeatTimerStarted = false;
var scrollStepRepeatTimeout;
var scrollStepRepeatTimer;

function startScrollRepeat(key) {
    if (!scrollStepRepeatTimerStarted) {
        scrollStepRepeatTimeout = window.SetTimeout(function () {
            scrollStepRepeatTimer = window.SetInterval(function () {
                if (!scrollbar.in_sbar && (!pl_s.rowDrag && !pl_s.fileDrag && !pl_s.makeSelectionDrag)) {
                    return;
                }

                if (key == "dragUp") {
                    scrollbar.shift_line(-1);
                }
                else if (key == "dragDown") {
                    scrollbar.shift_line(1);
                }
                else {
                    error;
                }

                if (pl_s.listIsScrolledUp || pl_s.listIsScrolledDown) {
                    stopScrollRepeat();
                }
            }, 50);
        }, 350);

        scrollStepRepeatTimerStarted = true;
    }
}

// ====================================== //

function stopScrollRepeat() {
    if (pl_s.listIsScrolledDown && (pl_s.rowDrag || pl_s.fileDrag) && !mouseOverList) {
        pl_s.linkToLastItem = true;
        rows[pl_s.rowsToDraw - 1].repaint();
    }

    window.ClearTimeout(scrollStepRepeatTimeout);
    window.ClearTimeout(scrollStepRepeatTimer);
    scrollStepRepeatTimerStarted = false;
    scrollStepRepeatTimeout = scrollStepRepeatTimer = undefined;
}

var getAlbumArtDelay = false;
var getAlbumArtTimer;

function scrollbarRedrawCallback() {
    pl_s.listPos[activeList] = scrollbar.scroll;
    window.SetProperty("system.List Step", pl_s.listPos.toString());

    calculateShiftParams();

    //check listOnSize function for more info on this
    if (pl_s.curPixelShift && pl_s.rowsToDrawWhenZeroShift + pl_s.curRowShift < pl_s.listLength) {
        pl_s.rowsToDraw = pl_s.rowsToDrawWhenZeroShift + 1;
    }
    else {
        pl_s.rowsToDraw = pl_s.rowsToDrawWhenZeroShift;
    }

    var partialRowShift = (pl_s.listPos[activeList] - pl_s.curRowShift);
    var difference = Math.ceil(pl_s.windowSizeInRows) - pl_s.windowSizeInRows;

    pl_s.listIsScrolledUp = (pl_s.listPos[activeList] == 0);
    pl_s.listIsScrolledDown = pl_s.listPos[activeList] >= (pl_s.listLength - pl_s.windowSizeInRows) && Math.abs(partialRowShift - difference) < 0.0001;

    if (!pl_s.redrawEverything) {
        updateRowStatusOnScroll();
    }
    window.Repaint();

    if (!getAlbumArtDelay) {
        getAlbumArtDelay = true;

        getAlbumArtTimer = window.SetInterval(function () {
            window.ClearTimeout(getAlbumArtTimer);
            getAlbumArtDelay = false;

            getAlbumArt();

        }, 100);
    }
}

function calculateShiftParams() {
    var prevYFullShift = 0;
    if (pl_s.playlistImgYShift != undefined) {
        prevYFullShift = pl_s.curRowShift * properties.rowH - pl_s.curPixelShift;
    }

    pl_s.curRowShift = Math.floor(pl_s.listPos[activeList]);
    pl_s.curPixelShift = -Math.round((pl_s.listPos[activeList] - pl_s.curRowShift) * properties.rowH);

    if (pl_s.playlistImgYShift == undefined) {
        pl_s.playlistImgYShift = 0;
    }
    else {
        pl_s.playlistImgYShift = (pl_s.curRowShift * properties.rowH - pl_s.curPixelShift) - prevYFullShift;
    }
}

function updateRowStatusOnScroll() {
    if (pl_s.redrawEverything) {
        return;
    }

    for (var i = 0; i != pl_s.rowsToDraw; i++) {
        var curIndex = i + pl_s.curRowShift;

        list_modded[curIndex].isChanged = ( curIndex <= pl_s.playlistImgFirstRow + 1 || curIndex >= pl_s.playlistImgLastRow - 1 );
    }
}

function createScrollbarButtonImages() {
    var fontSegoeUi = gdi.font("Segoe UI Symbol", 15, 0);
    var m = 2;

    var scrollTrackColor = _.RGB(37, 37, 37);
    var scrollColorHot = _.RGB(140, 142, 144);
    var scrollColorHover = _.RGB(170, 172, 174);
    var scrollColorPressed = _.RGB(90, 92, 94);
    var scrollSymbolColorNormal = _.RGB(140, 142, 144);
    var scrollSymbolColorHot = _.RGB(30, 32, 34);
    var scrollSymbolColorHover = _.RGB(40, 42, 44);
    var scrollSymbolColorPressed = _.RGB(30, 32, 34);

    var btn =
        {
            lineUp:   {
                ico:  "\uE010",
                font: fontSegoeUi,
                w:    properties.scrollbarW,
                h:    properties.scrollbarW
            },
            lineDown: {
                ico:  "\uE011",
                font: fontSegoeUi,
                w:    properties.scrollbarW,
                h:    properties.scrollbarW
            }
        };

    sbarImgs = [];

    _.forEach(btn, function (item, i) {
        var w = item.w,
            h = item.h;

        var stateImages = []; //0=normal, 1=hover, 2=down, 3=hot;

        for (var s = 0; s < 4; s++) {
            var img = gdi.CreateImage(w, h);
            var g = img.GetGraphics();

            var icoColor;
            var backColor;

            if (s == 0) {
                icoColor = scrollSymbolColorNormal;
                backColor = scrollTrackColor;
            }
            else if (s == 1) {
                icoColor = scrollSymbolColorHover;
                backColor = scrollColorHover;
            }
            else if (s == 2) {
                icoColor = scrollSymbolColorPressed;
                backColor = scrollColorPressed;
            }
            else if (s == 3) {
                icoColor = scrollSymbolColorHot;
                backColor = scrollColorHot;
            }

            if (i == "lineDown") {
                g.FillSolidRect(m, 1, w - m * 2, h - 1, backColor);
            }
            else if (i == "lineUp") {
                g.FillSolidRect(m, 0, w - m * 2, h - 1, backColor);
            }

            g.SetSmoothingMode(SmoothingMode.HighQuality);
            g.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);

            if (i == "lineDown") {
                g.DrawString(item.ico, item.font, icoColor, 0, 0, w, h, StringFormat(1, 2));
            }
            else if (i == "lineUp") {
                g.DrawString(item.ico, item.font, icoColor, 0, 0, w, h - 1, StringFormat(1, 2));
            }

            img.ReleaseGraphics(g);
            stateImages[s] = img;
        }

        sbarImgs[i] =
            {
                normal:  stateImages[0],
                hover:   stateImages[1],
                pressed: stateImages[2],
                hot:     stateImages[3]
            };
    });
}

function createScrollbarThumbImages(thumbW, thumbH) {
    var m = 2;

    var scrollColorNormal = _.RGB(110, 112, 114);
    var scrollColorHover = _.RGB(170, 172, 174);
    var scrollColorPressed = _.RGB(90, 92, 94);

    var w = thumbW,
        h = thumbH;

    var stateImages = []; //0=normal, 1=hover, 2=down;

    for (var s = 0; s <= 2; s++) {
        var img = gdi.CreateImage(w, h);
        var g = img.GetGraphics();

        var color = scrollColorNormal;
        if (s == 1) {
            color = scrollColorHover;
        }
        else if (s == 2) {
            color = scrollColorPressed;
        }

        g.FillSolidRect(m, 0, w - m * 2, h, color);

        img.ReleaseGraphics(g);
        stateImages[s] = img;
    }

    sbarImgs["thumb"] =
        {
            normal:  stateImages[0],
            hover:   stateImages[1],
            pressed: stateImages[2]
        };
}

function numericAscending(a, b) {
    return (a - b);
}

function setListChangedStateByID(ID) {
    for (var i = 0; i != pl_s.rowsToDraw; i++) {
        // Limiting search to listElems in rows
        var curIndex = i + pl_s.curRowShift;

        list_modded[curIndex].isChanged = (list_modded[curIndex] == ID);
    }
}

if (properties.collapseOnStart) {
    CollapseExpandList("collapse");
    collapsedOnStart = true;
}

if (properties.autoExpandCollapseGroups) {
    CollapseExpandPlayingGroup();
}

// Workaround for bug: PlayingPlaylist is equal to -1 on startup
if (plman.PlayingPlaylist === (-1 >>> 0)) {
    plman.PlayingPlaylist = plman.ActivePlaylist;
}