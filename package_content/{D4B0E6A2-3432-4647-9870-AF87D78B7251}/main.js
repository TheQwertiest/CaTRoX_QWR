const common_package_id = '{1583C4B7-53AD-403F-8F7E-CB20490AAA26}';
include(`${utils.GetPackageInfo(common_package_id).Directories.Scripts}/Common.js`);
qwr_utils.common_include([
    'js_marc2003/js/panel.js',
    'js_marc2003/js/lastfm.js',
    'js_marc2003/js/text.js',
]);


var panel = new _panel("Last.fm Bio", ["metadb", "remap"]);
var lastfm = new _lastfm();
var text = new _text("lastfm_bio", 10, 24, 0, 0);

panel.item_focus_change();

function on_size() {
	panel.size();
	text.w = panel.w - 20;
	text.h = panel.h - 24;
	text.size();
}

function on_paint(gr) {
	panel.paint(gr);
	gr.FillSolidRect(0, 0, panel.w, 24, panel.colours.header);
    if (text.header_text().length)
    {
	    gr.GdiDrawText(text.header_text(), panel.fonts.title, _RGB(180, 182, 184), 10, 0, panel.w - 20, 24, LEFT);
    }
    else
    {
        gr.GdiDrawText("Last.fm Bio", panel.fonts.title, _RGB(180, 182, 184), 10, 0, panel.w - 20, 24, LEFT);
    }
	text.paint(gr);
}

function on_metadb_changed() {
	text.metadb_changed();
}

function on_mouse_wheel(s) {
	text.wheel(s);
}

function on_mouse_move(x, y) {
	text.move(x, y);
}

function on_mouse_lbtn_up(x, y) {
	text.lbtn_up(x, y);
}

function on_mouse_rbtn_up(x, y) {
	return panel.rbtn_up(x, y, text);
}

function on_key_down(k) {
	text.key_down(k);
}

function on_colours_changed() {
	panel.colours_changed();
	window.Repaint();
}

function on_font_changed() {
	panel.font_changed();
	window.Repaint();
}

function on_item_focus_change() {
	panel.item_focus_change();
}

function on_playback_dynamic_info_track() {
	panel.item_focus_change();
}

function on_playback_new_track() {
	panel.item_focus_change();
}

function on_playback_stop(reason) {
	if (reason != 2) {
		panel.item_focus_change();
	}
}

function on_playlist_switch() {
	panel.item_focus_change();
}