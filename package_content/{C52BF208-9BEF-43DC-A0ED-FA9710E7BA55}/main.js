const common_package_id = '{1583C4B7-53AD-403F-8F7E-CB20490AAA26}';
const common_package_path = utils.GetPackagePath(common_package_id);
const common_files = [
    'js_marc2003/js/panel.js',
    'js_marc2003/js/thumbs.js'
];
for (let f of common_files) {
    include(`${common_package_path}/scripts/${f}`)
}

let panel = new _panel(true);
let thumbs = new _thumbs();

panel.item_focus_change();

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

function on_key_down(k) {
	thumbs.key_down(k);
}

function on_metadb_changed() {
	thumbs.metadb_changed();
}

function on_mouse_lbtn_dblclk(x, y) {
	thumbs.lbtn_dblclk(x, y);
}

function on_mouse_lbtn_up(x, y) {
	thumbs.lbtn_up(x, y);
}

function on_mouse_move(x, y) {
	thumbs.move(x, y);
}

function on_mouse_rbtn_up(x, y) {
	return panel.rbtn_up(x, y, thumbs);
}

function on_mouse_wheel(s) {
	thumbs.wheel(s);
}

function on_paint(gr) {
	panel.paint(gr);
	thumbs.paint(gr);
}

function on_playback_dynamic_info_track() {
	panel.item_focus_change();
}

function on_playback_new_track() {
	panel.item_focus_change();
}

function on_playback_time() {
	thumbs.playback_time();
}

function on_playback_stop(reason) {
	if (reason != 2) {
		panel.item_focus_change();
	}
}

function on_playlist_switch() {
	panel.item_focus_change();
}

function on_size() {
	panel.size();
	thumbs.size();
}
