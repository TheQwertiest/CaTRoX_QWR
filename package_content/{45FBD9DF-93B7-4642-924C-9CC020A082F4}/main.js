const common_package_id = '{1583C4B7-53AD-403F-8F7E-CB20490AAA26}';
include(`${utils.GetPackageInfo(common_package_id).Directories.Scripts}/Common.js`);
qwr_utils.common_include([
    'js_marc2003/js/panel.js',
    'js_marc2003/js/lastfm.js',
    'js_marc2003/js/list.js',
]);


'use strict';

var panel = new _panel("Last.fm Artist Info/User Charts/Recent Tracks", ["metadb", "remap"]);
var lastfm = new _lastfm();
var list = new _list("lastfm_info", 8, 24, 0, 0);

panel.item_focus_change();

function on_notify_data(name, data) {
	lastfm.notify_data(name, data);
}

function on_size() {
	panel.size();
	list.w = panel.w - 16;
	list.h = panel.h - 24;
	list.size();
}

function on_paint(gr) {
	panel.paint(gr);
	gr.FillSolidRect(0, 0, panel.w, 24, panel.colours.header);
	gr.GdiDrawText(list.header_text(), panel.fonts.title, _RGB(180, 182, 184), 10, 0, panel.w - 20, 24, LEFT);
	list.paint(gr);
}

function on_metadb_changed() {
	list.metadb_changed();
}

function on_mouse_wheel(s) {
	list.wheel(s);
}

function on_mouse_move(x, y) {
	list.move(x, y);
}

function on_mouse_lbtn_up(x, y) {
	list.lbtn_up(x, y);
}

function on_key_down(k) {
	list.key_down(k);
}

function on_mouse_rbtn_up(x, y) {
	return panel.rbtn_up(x, y, list);
}
