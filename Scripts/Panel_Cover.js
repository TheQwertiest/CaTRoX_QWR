// ==PREPROCESSOR==
// @name "Cover Panel"
// @author "TheQwertiest"
// ==/PREPROCESSOR==
properties.AddProperties(
    {
        panelMargin: window.GetProperty("user.Panel Margin", 15)
    }
);

var ww = 0,
    wh = 0;

artModule = new ArtModule(["borders", "thumbs", "auto_cycle"]);

/// Reduce move
var moveChecker = new _.moveCheckReducer;

function on_paint(gr) {
    gr.FillSolidRect(0, 0, ww, wh, panelsBackColor);

    artModule.paint(gr);
}

// ============================ //

function on_size() {
    ww = window.Width;
    wh = window.Height;

    artModule.on_size(properties.panelMargin, properties.panelMargin, ww - 2 * properties.panelMargin, wh - 2 * properties.panelMargin);
    artModule.getAlbumArt();
}

function on_get_album_art_done(metadb, art_id, image, image_path) {
    artModule.get_album_art_done(metadb, art_id, image, image_path);
}

function on_playlist_switch() {
    artModule.playlist_switch();
}

function on_playback_stop(reason) {
    artModule.playback_stop(reason);
}

function on_playlist_items_selection_change() {
    artModule.playlist_items_selection_change();
}

function on_playback_new_track(metadb) {
    artModule.playback_new_track();
}

function on_mouse_move(x, y, m) {
    if (moveChecker.isSameMove(x, y, m)) {
        return;
    }

    artModule.mouse_move(x, y, m);
}
// ============================ //

function on_mouse_lbtn_down(x, y, m) {
    artModule.mouse_lbtn_down(x, y, m);
}
// ============================ //

function on_mouse_lbtn_dblclk() {
    artModule.mouse_lbtn_dblclk();
}
// ============================ //

function on_mouse_lbtn_up(x, y, m) {
    artModule.mouse_lbtn_up(x, y, m);
}
// ============================ //

function on_mouse_wheel(delta) {
    artModule.mouse_wheel(delta);
}
// ============================ //

function on_mouse_leave() {
    artModule.mouse_leave();
}

function on_key_down(vkey) {
    switch (vkey) {
        case 38: {
            artModule.mouse_wheel(1);
            break;
        }
        case 40: {
            artModule.mouse_wheel(1);
            break;
        }
        case VK_F5: {
            artModule.reloadArt();
            break;
        }
    }
}

function on_mouse_rbtn_up(x, y) {
    var cpm = window.CreatePopupMenu();

    artModule.appendMenu(cpm);

    if (utils.IsKeyPressed(VK_SHIFT)) {
        _.appendDefaultContextMenu(cpm);
    }

    var id = cpm.TrackPopupMenu(x, y);

    if (!artModule.executeMenu(id)) {
        switch (id) {
            default:
                _.executeDefaultContextMenu(id, scriptFolder + "Panel_Cover.js");
        }
    }

    _.dispose(cpm);

    return true;
}
