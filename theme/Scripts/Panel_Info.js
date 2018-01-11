// ==PREPROCESSOR==
// @name 'Info Panel'
// @author 'TheQwertiest'
// ==/PREPROCESSOR==

var trace_call = false;
var trace_on_paint = false;
var trace_on_move = false;

g_script_list.push('Panel_Info.js');

g_properties.add_properties(
    {
        list_left_pad:   ['user.list.pad.left', 4],
        list_top_pad:    ['user.list.pad.top', 4],
        list_right_pad:  ['user.list.pad.right', 4],
        list_bottom_pad: ['user.list.pad.bottom', 4],

        show_metadata: ['user.list.show_metadata', true],
        show_fileinfo: ['user.list.show_fileinfo', true],
        is_sorted:     ['user.list.is_sorted', false],

        show_scrollbar:      ['user.scrollbar.show', true],
        scrollbar_right_pad: ['user.scrollbar.pad.right', 0],
        scrollbar_w:         ['user.scrollbar.width', utils.GetSystemMetrics(2)],

        row_h:               ['user.row.height', 20],
        alternate_row_color: ['user.row.alternate_color', false],

        track_mode: ['user.track_mode', 3]
    }
);
g_properties.track_mode = Math.max(1, Math.min(3, g_properties.track_mode));
g_properties.row_h = Math.max(10, g_properties.row_h);

var g_tr_i_fonts = {
    info_name: gdi.font('Segoe Ui Semibold', 12),
    info_value: gdi.font('Segoe Ui', 12)
};

var g_tr_i_colors = {
    background: panelsBackColor,
    row_alternate: _.RGB(35, 35, 35),
    row_selected: panelsLineColorSelected,
    line_color: panelsLineColor,
    info_name: _.RGB(160, 162, 164),
    info_value: panelsNormalTextColor
};


var track_info = new TrackInfoList();

function on_paint(gr) {
    trace_call && trace_on_paint && console.log(qwr_utils.function_name());

    track_info.on_paint(gr);
}

function on_size() {
    trace_call && console.log(qwr_utils.function_name());

    var ww = window.Width;
    var wh = window.Height;

    if (ww <= 0 || wh <= 0) {
        // on_paint won't be called with such dimensions anyway
        return;
    }

    track_info.on_size(ww, wh);
}

function on_mouse_move(x, y, m) {
    trace_call && trace_on_move && console.log(qwr_utils.function_name());

    qwr_utils.DisableSizing(m);

    track_info.on_mouse_move(x, y, m);
}

function on_mouse_lbtn_down(x, y, m) {
    trace_call && console.log(qwr_utils.function_name());

    track_info.on_mouse_lbtn_down(x, y, m);
}

function on_mouse_lbtn_dblclk(x, y, m) {
    trace_call && console.log(qwr_utils.function_name());

    track_info.on_mouse_lbtn_dblclk(x, y, m);
}

function on_mouse_lbtn_up(x, y, m) {
    trace_call && console.log(qwr_utils.function_name());

    track_info.on_mouse_lbtn_up(x, y, m);

    qwr_utils.EnableSizing(m);
}

function on_mouse_rbtn_down(x, y, m) {
    trace_call && console.log(qwr_utils.function_name());

    track_info.on_mouse_rbtn_down(x, y, m);
}

function on_mouse_rbtn_up(x, y, m) {
    trace_call && console.log(qwr_utils.function_name());

    return track_info.on_mouse_rbtn_up(x, y, m);
}

function on_mouse_wheel(delta) {
    trace_call && console.log(qwr_utils.function_name());

    track_info.on_mouse_wheel(delta);
}

function on_mouse_leave() {
    trace_call && console.log(qwr_utils.function_name());

    track_info.on_mouse_leave();
}

function on_key_down(vkey) {
    trace_call && console.log(qwr_utils.function_name());

    //track_info.on_key_down(vkey);
}

function on_key_up(vkey) {
    trace_call && console.log(qwr_utils.function_name());

    //track_info.on_key_up(vkey);
}

function on_item_focus_change(playlist_arg, from, to) {
    trace_call && console.log(qwr_utils.function_name());

    track_info.on_item_focus_change(playlist_arg, from, to);
}

function on_playback_new_track(metadb) {
    trace_call && console.log(qwr_utils.function_name());

    track_info.on_playback_new_track(metadb);
}

function on_playback_stop(reason) {
    trace_call && console.log(qwr_utils.function_name());

    track_info.on_playback_stop(reason);
}

function on_playback_dynamic_info_track() {
    trace_call && console.log(qwr_utils.function_name());

    track_info.on_playback_dynamic_info_track();
}

function on_metadb_changed(handles, fromhook) {
    trace_call && console.log(qwr_utils.function_name());

    track_info.on_metadb_changed(handles, fromhook);
}

function TrackInfoList() {
    // public:

    /// callbacks
    this.on_paint = function (gr) {
        gr.FillSolidRect(this.x, this.y, this.w, this.h, g_tr_i_colors.background);
        gr.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);

        if (items_to_draw.length) {
            _.forEachRight(items_to_draw, function (item, i) {
                item.draw(gr);
                if (!g_properties.alternate_row_color && i > 0 && i < items_to_draw.length) {
                    gr.DrawLine(item.x, item.y, item.x + item.w, item.y, 1, g_tr_i_colors.line_color);
                }
            });

            // Hide rows that shouldn't be visible
            gr.FillSolidRect(this.x, this.y, this.w, list_y - this.y, g_tr_i_colors.background);
            gr.FillSolidRect(this.x, list_y + list_h, this.w, (this.y + this.h) - (list_y + list_h), g_tr_i_colors.background);
        }
        else {
            var text;
            if (!cur_metadb) {
                text = 'Track Info';
            }
            else {
                text = 'No info to display';
            }

            var track_info_format = g_string_format.align_center | g_string_format.trim_ellipsis_char | g_string_format.no_wrap;
            gr.DrawString(text, gdi.font('Segoe Ui Semibold', 24), _.RGB(70, 70, 70), this.x, this.y, this.w, this.h, track_info_format);
        }

        if (is_scrollbar_available) {
            if (!scrollbar.is_scrolled_up) {
                gr.FillGradRect(list_x, list_y - 1, list_w, 7 + 1, 270, _.RGBtoRGBA(panelsBackColor, 0), _.RGBtoRGBA(panelsBackColor, 200));
            }
            if (!scrollbar.is_scrolled_down) {
                gr.FillGradRect(list_x, list_y + list_h - 8, list_w, 7 + 1, 90, _.RGBtoRGBA(panelsBackColor, 0), _.RGBtoRGBA(panelsBackColor, 200));
            }
        }

        if (is_scrollbar_visible) {
            scrollbar.paint(gr);
        }
    };

    this.on_size = function (w, h) {
        var w_changed = this.w !== w;
        var h_changed = this.h !== h;

        if (h_changed) {
            on_h_size(h);
        }

        if (w_changed) {
            on_w_size(w)
        }

        was_on_size_called = true;
    };

    this.on_mouse_move = function (x, y, m) {
        if (is_scrollbar_visible) {
            scrollbar.move(x, y, m);

            if (scrollbar.b_is_dragging || scrollbar.trace(x, y)) {
                return;
            }
        }

        if (!this.trace(x, y)) {
            mouse_in = false;
            clear_last_hover_item();

            return;
        }

        mouse_in = true;

        if (!this.trace_list(x, y) || mouse_down) {
            return;
        }

        var item = get_item_under_mouse(x, y);
        if (item) {
            if (item !== last_hover_item) {
                last_hover_item = item;
                item.tt.showDelayed(item.get_value_text());
            }
        }
        else {
            clear_last_hover_item();
        }
    };

    this.on_mouse_lbtn_down = function (x, y, m) {
        mouse_down = true;
        clear_last_hover_item();

        if (mouse_double_clicked) {
            return;
        }

        if (is_scrollbar_visible) {
            if (scrollbar.trace(x, y)) {
                scrollbar.lbtn_dn(x, y, m);
                return;
            }
        }

        var item = this.trace_list(x, y) ? get_item_under_mouse(x, y) : undefined;
        last_hover_item = item;

        if (item) {
            item.is_selected = true;
            this.repaint();
        }
    };

    this.on_mouse_lbtn_dblclk = function (x, y, m) {
        mouse_down = true;
        mouse_double_clicked = true;

        if (is_scrollbar_visible) {
            if (scrollbar.trace(x, y)) {
                scrollbar.lbtn_dn(x, y, m);
                return;
            }
        }

        var item = get_item_under_mouse(x, y);
        if (!item) {
            return;
        }

        if (!item.is_readonly) {
            item.edit_metadata();
            item.repaint();
        }
    };

    this.on_mouse_lbtn_up = function (x, y, m) {
        if (!mouse_down) {
            return;
        }

        mouse_double_clicked = false;
        mouse_down = false;

        if (is_scrollbar_visible) {
            var wasDragging = scrollbar.b_is_dragging;
            scrollbar.lbtn_up(x, y, m);
            if (wasDragging) {
                return;
            }
        }

        clear_last_hover_item();
        mouse_on_item = false;
    };

    this.on_mouse_rbtn_down = function (x, y, m) {
        mouse_down = true;
        clear_last_hover_item();

        var item = this.trace_list(x, y) ? get_item_under_mouse(x, y) : undefined;
        last_hover_item = item;

        if (item) {
            item.is_selected = true;
            this.repaint();
        }
    };

    this.on_mouse_rbtn_up = function (x, y, m) {
        if (is_scrollbar_visible && scrollbar.trace(x, y)) {
            return scrollbar.rbtn_up(x, y);
        }

        var hover_item = last_hover_item;
        clear_last_hover_item();

        var cmm = new Context.MainMenu();

        cmm.append_item(
            'Refresh info \tF5',
            _.bind(function () {
                this.initialize_list();
            }, this)
        );


        // -------------------------------------------------------------- //
        //---> Edit Mode

        cmm.append_separator();

        cmm.append_item(
            'Add',
            _.bind(function () {
                var new_tag = _.input2('Enter metadata name', 'Add new metadata', '');
                if (!new_tag) {
                    return;
                }

                var new_value = _.input2('Enter value for ' + new_tag, 'Add new metadata', '');
                if (!_.isNil(new_value)) {
                    var handle = fb.CreateHandleList();
                    handle.Add(cur_metadb);

                    var meta_obj = {};
                    meta_obj[new_tag] = new_value;
                    handle.UpdateFileInfoFromJSON(JSON.stringify(meta_obj));

                    this.initialize_list();
                }
            }, this)
        );

        if (hover_item) {
            cmm.append_item(
                'Edit',
                function () {
                    hover_item.edit_metadata();
                },
                {is_grayed_out: hover_item.is_readonly}
            );

            cmm.append_item(
                'Copy',
                function () {
                    _.setClipboardData(hover_item.get_value_text())
                }
            );

            cmm.append_item(
                'Remove',
                _.bind(function () {
                    var handle = fb.CreateHandleList();
                    handle.Add(cur_metadb);

                    var meta_obj = {};
                    meta_obj[hover_item.get_tag_name()] = '';
                    handle.UpdateFileInfoFromJSON(JSON.stringify(meta_obj));

                    this.initialize_list();
                }, this),
                {is_grayed_out: hover_item.is_readonly}
            );
        }

        // -------------------------------------------------------------- //
        //---> Track Mode

        cmm.append_separator();

        var track = new Context.Menu('Displayed track');
        cmm.append(track);

        track.append_item(
            'Automatic (current selection/playing item)',
            _.bind(function () {
                g_properties.track_mode = track_modes.auto;
                this.initialize_list();
            }, this)
        );

        track.append_item(
            'Playing item',
            _.bind(function () {
                g_properties.track_mode = track_modes.playing;
                this.initialize_list();
            }, this)
        );

        track.append_item(
            'Current selection',
            _.bind(function () {
                g_properties.track_mode = track_modes.selected;
                this.initialize_list();
            }, this)
        );

        track.radio_check(0, g_properties.track_mode - 1);

        // -------------------------------------------------------------- //
        //---> Appearance

        cmm.append_separator();

        var appear = new Context.Menu('Appearance');
        cmm.append(appear);

        appear.append_item(
            'Show scrollbar',
            function () {
                g_properties.show_scrollbar = !g_properties.show_scrollbar;
                on_scrollbar_visibility_change(g_properties.show_scrollbar);
            },
            {is_checked: g_properties.show_scrollbar}
        );

        appear.append_item(
            'Alternate row color',
            function () {
                g_properties.alternate_row_color = !g_properties.alternate_row_color;
            },
            {is_checked: g_properties.alternate_row_color}
        );

        appear.append_item(
            'Show metadata',
            _.bind(function () {
                g_properties.show_metadata = !g_properties.show_metadata;
                this.initialize_list();
            },this),
            {is_checked: g_properties.show_metadata}
        );

        appear.append_item(
            'Show file info',
            _.bind(function () {
                g_properties.show_fileinfo = !g_properties.show_fileinfo;
                this.initialize_list();
            },this),
            {is_checked: g_properties.show_fileinfo}
        );

        // -------------------------------------------------------------- //
        //---> Sort

        var sort = new Context.Menu('Sort');
        cmm.append(sort);

        sort.append_item(
            'Sort alphabetically',
            _.bind(function () {
                g_properties.is_sorted = true;
                this.initialize_list()
            },this)
        );

        sort.append_item(
            'Sort by type',
            _.bind(function () {
                g_properties.is_sorted = false;
                this.initialize_list()
            },this)
        );

        sort.radio_check(0, g_properties.is_sorted ? 0 : 1);

        // -------------------------------------------------------------- //
        //---> System

        if (utils.IsKeyPressed(VK_SHIFT)) {
            qwr_utils.append_default_context_menu_to(cmm);
        }

        cmm.execute(x, y);

        cmm.dispose();

        this.repaint();
        return true;
    };

    this.on_mouse_wheel = function (delta) {
        if (is_scrollbar_available) {
            scrollbar.wheel(delta);
        }
    };

    this.on_mouse_leave = function () {
        if (is_scrollbar_available) {
            scrollbar.leave();
        }

        mouse_in = false;
        clear_last_hover_item();
    };

    this.on_item_focus_change = function (playlist_idx, from_idx, to_idx) {
        if (!fb.IsPlaying || g_properties.track_mode === track_modes.selected) {
            that.initialize_list();
            this.repaint();
        }
    };

    this.on_playback_new_track = function (metadb) {
        if (g_properties.track_mode !== track_modes.selected) {
            that.initialize_list();
            this.repaint();
        }
    };

    this.on_playback_stop = function (reason) {
        if (reason !== 2 && g_properties.track_mode !== track_modes.selected) {
            that.initialize_list();
            this.repaint();
        }
    };

    this.on_playback_dynamic_info_track = function () {
        that.initialize_list();
        this.repaint();
    };

    this.on_metadb_changed = function (handles, fromhook) {
        that.initialize_list();
        this.repaint();
    };

    /// EOF callbacks

    this.trace = function (x, y) {
        return x >= this.x && x < this.x + this.w && y >= this.y && y < this.y + this.h;
    };

    this.trace_list = function (x, y) {
        return x >= list_x && x < list_x + list_w && y >= list_y && y < list_y + list_h;
    };

    var throttled_repaint = _.throttle(_.bind(function () {
        window.RepaintRect(this.x, this.y, this.w, this.h);
    }, this), 1000 / 60);
    this.repaint = function () {
        throttled_repaint();
    };

    // This method does not contain any redraw calls - it's purely back-end
    this.initialize_list = function () {
        trace_call && console.log('initialize_list');

        rows = [];
        scroll_pos = 0;

        cur_metadb = get_current_metadb();
        if (cur_metadb) {
            var fileInfo = cur_metadb.GetFileInfo();

            var tag_name;
            var value_text;

            if (g_properties.show_metadata) {
                for (var i = 0; i < fileInfo.MetaCount; i++) {
                    var is_readonly;

                    tag_name = fileInfo.MetaName(i);
                    if (tag_name === 'title' && (fb.IsPlaying && _.startsWith(cur_metadb.RawPath, 'http://'))) {
                        value_text = fb.TitleFormat('%title%').Eval();
                        is_readonly = true;
                    }
                    else {
                        value_text = fileInfo.MetaValue(fileInfo.MetaFind(tag_name), 0);
                        is_readonly = _.startsWith(_.tf('%path%', this.metadb), 'http');
                    }

                    rows.push(new Row(list_x, 0, list_w, row_h, cur_metadb, tag_name, value_text));
                    _.last(rows).is_odd = (i + 1) % 2;
                    _.last(rows).is_readonly = is_readonly;
                }
            }

            if (g_properties.show_fileinfo) {
                var cur_rows_count = rows.length;
                for (var i = 0; i < fileInfo.InfoCount; i++) {
                    tag_name = fileInfo.InfoName(i);
                    value_text = fileInfo.InfoValue(fileInfo.InfoFind(tag_name));

                    rows.push(new Row(list_x, 0, list_w, row_h, cur_metadb, tag_name, value_text));
                    _.last(rows).is_odd = ((cur_rows_count + i) + 1) % 2;
                }
            }
        }

        if (g_properties.is_sorted) {
            rows.sort(function(a, b) {
                var a_tag = a.get_tag_name().toUpperCase();
                var b_tag = b.get_tag_name().toUpperCase();

                return a_tag.localeCompare(b_tag);
            });
        }

        if (was_on_size_called) {
            on_displayed_row_count_change();
        }
    };

    //private:
    function on_h_size(h) {
        that.h = h;
        update_list_h_size();
    }

    function on_w_size(w) {
        that.w = w;
        update_list_w_size();
    }

    function on_displayed_row_count_change() {
        update_scrollbar();
        on_drawn_content_change();
    }

    function on_drawn_content_change() {
        set_rows_boundary_status();
        calculate_shift_params();
        generate_items_to_draw();
    }

    function initialize_scrollbar() {
        is_scrollbar_available = false;

        var scrollbar_x = that.x + that.w - g_properties.scrollbar_w - g_properties.scrollbar_right_pad;
        var scrollbar_y = that.y + 3;
        var scrollbar_h = that.h - scrollbar_y - 3;

        if (scrollbar) {
            scrollbar.reset();
        }
        scrollbar = new ScrollBar(scrollbar_x, scrollbar_y, g_properties.scrollbar_w, scrollbar_h, row_h, scrollbar_redraw_callback);
    }

    function update_scrollbar() {
        var total_height_in_rows = rows.length;

        if (total_height_in_rows <= rows_to_draw_precise) {
            is_scrollbar_available = false;
            scroll_pos = 0;
            on_scrollbar_visibility_change(false);
        }
        else {
            scrollbar.set_window_param(rows_to_draw_precise, total_height_in_rows);
            scrollbar.scroll_to(scroll_pos, true);

            scroll_pos = scrollbar.scroll;
            is_scrollbar_available = true;
            on_scrollbar_visibility_change(g_properties.show_scrollbar);
        }
    }

    function on_scrollbar_visibility_change(is_visible) {
        if (is_scrollbar_visible !== is_visible) {
            is_scrollbar_visible = is_visible;
            update_list_w_size();
        }
    }

    function on_playlist_info_visibility_change() {
        update_list_h_size();
    }

    function update_list_h_size() {
        list_y = that.y + g_properties.list_top_pad;
        list_h = that.h - list_y - g_properties.list_bottom_pad;

        rows_to_draw_precise = list_h / row_h;

        initialize_scrollbar();
        update_scrollbar();
        on_drawn_content_change();
    }

    function update_list_w_size() {
        list_w = that.w - g_properties.list_left_pad - g_properties.list_right_pad;

        if (is_scrollbar_available) {
            if (is_scrollbar_visible) {
                list_w -= scrollbar.w + 2;
            }
            scrollbar.set_x(that.w - g_properties.scrollbar_w - g_properties.scrollbar_right_pad);
        }

        rows.forEach(function (item) {
            item.set_w(list_w);
        });
    }

    function scrollbar_redraw_callback() {
        scroll_pos = scrollbar.scroll;

        on_drawn_content_change();

        that.repaint();
    }

    function calculate_shift_params() {
        row_shift = Math.floor(scroll_pos);
        pixel_shift = -Math.round((scroll_pos - row_shift) * row_h);
    }

    function set_rows_boundary_status() {
        var last_row = _.last(rows);
        if (last_row) {
            last_row.is_cropped = is_scrollbar_available ? scrollbar.is_scrolled_down : false;
        }
    }

    // Called in three cases:
    // 1. Window vertical size changed
    // 2. Scroll position changed
    // 3. Playlist content changed
    function generate_items_to_draw() {
        items_to_draw = [];
        var start_y = list_y + pixel_shift;
        var cur_y = 0;
        var cur_row = 0;
        var first = true;

        for (var j = 0; j < rows.length; ++j) {
            if (cur_row >= row_shift) {
                if (first) {
                    rows[j].set_y(start_y + (cur_row - row_shift) * row_h);
                    cur_y = rows[j].y;
                    first = false;
                }
                else {
                    rows[j].set_y(cur_y);
                }
                items_to_draw.push(rows[j]);
                cur_y += row_h;

                if (cur_y >= that.h) {
                    break;
                }
            }

            ++cur_row;
        }
    }

    function scroll_to_row(from_row, to_row) {
        if (!is_scrollbar_available) {
            return;
        }

        var from_item = from_row;
        var to_item = to_row;

        var to_item_state = get_item_visibility_state(to_item);


        var shifted_successfully = false;

        switch (to_item_state.visibility) {
            case visibility_state['none']: {
                if (from_item) {
                    var from_item_state = get_item_visibility_state(from_item);
                    if (from_item_state.visibility !== visibility_state['none']) {
                        var is_item_prev = from_item.type === to_item.type && from_item.idx - 1 === to_item.idx;

                        var is_item_next = from_item.type === to_item.type && from_item.idx + 1 === to_item.idx;

                        var row_shift = from_item_state.invisible_part + 1;
                        if (is_item_prev) {
                            scrollbar.scroll_to(scroll_pos - row_shift);
                            shifted_successfully = true;
                        }
                        else if (is_item_next) {
                            scrollbar.scroll_to(scroll_pos + row_shift);
                            shifted_successfully = true;
                        }
                    }
                }
                break;
            }
            case visibility_state['partial_top']: {
                if (to_item_state.invisible_part % 1 > 0) {
                    scrollbar.shift_line(-1);
                }
                scrollbar.scroll_to(scroll_pos - Math.floor(to_item_state.invisible_part));
                shifted_successfully = true;
                break;
            }
            case visibility_state['partial_bottom']: {
                if (to_item_state.invisible_part % 1 > 0) {
                    scrollbar.shift_line(1);
                }
                scrollbar.scroll_to(scroll_pos + Math.floor(to_item_state.invisible_part));
                shifted_successfully = true;
                break;
            }
            case visibility_state['full']: {
                shifted_successfully = true;
                break;
            }
            default: {
                throw new ArgumentError('visibility_state', to_item_state.visibility);
            }
        }

        if (!shifted_successfully) {
            var item_draw_idx = get_item_draw_row_idx(to_item);
            var new_scroll_pos = Math.max(0, item_draw_idx - Math.floor(rows_to_draw_precise / 2));
            scrollbar.scroll_to(new_scroll_pos);
        }
    }

    var visibility_state = {
        'none':           0,
        'partial_top':    1,
        'partial_bottom': 2,
        'full':           3
    };

    function get_item_visibility_state(item_to_check) {
        var item_state = {
            visibility:     visibility_state['none'],
            invisible_part: 1
        };

        _.forEach(items_to_draw, function (item) {
            if (item_to_check.type !== item.type) {
                return true;
            }

            if (item.idx === item_to_check.idx) {
                if (item.y < list_y && item.y + item.h > list_y) {
                    item_state.visibility = visibility_state['partial_top'];
                    item_state.invisible_part = (list_y - item.y) / row_h;
                }
                else if (item.y < list_y + list_h && item.y + item.h > list_y + list_h) {
                    item_state.visibility = visibility_state['partial_bottom'];
                    item_state.invisible_part = ((item.y + item.h) - (list_y + list_h)) / row_h;
                }
                else {
                    item_state.visibility = visibility_state['full'];
                    item_state.invisible_part = 0;
                }
                return false;
            }
        });

        return item_state;
    }

    // At worst has O(playlist_size) complexity
    function get_item_draw_row_idx(item) {
        var draw_row_idx = -1;
        var cur_row = 0;

        _.forEach(rows, function (row) {
            if (item.idx === row.idx) {
                draw_row_idx = cur_row;
                return false;
            }
            ++cur_row;
        });

        if (draw_row_idx === -1) {
            throw new LogicError('Could not find item in drawn item list');
        }

        return draw_row_idx;
    }

    function get_item_under_mouse(x, y) {
        return _.find(items_to_draw, function (item) {
            return item.trace(x, y);
        });
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
                }
                break;
            }
            case track_modes.selected: {
                metadb = fb.GetFocusItem();
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

    function clear_last_hover_item() {
        if (!last_hover_item) {
            return
        }

        last_hover_item.tt.clear();
        if (last_hover_item.is_selected) {
            last_hover_item.is_selected = false;
            that.repaint();
        }

        last_hover_item = null;
    }

    // public:
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;

    // private:
    var that = this;

    /** @enum {number} */
    var track_modes =
        {
            auto:     1,
            playing:  2,
            selected: 3
        };

    /** @const {number} */
    var row_h = g_properties.row_h;

    // Window state
    var was_on_size_called = false;
    var rows_to_draw_precise = 0;

    /** @type {Array<Row>} */
    var rows = [];
    /** @type {Array<Row>} */
    var items_to_draw = [];

    var list_x = /** @type {number} */ g_properties.list_left_pad;
    var list_y = 0;
    var list_w = 0;
    var list_h = 0;

    // Playback state
    var cur_metadb = undefined;

    // Mouse and key state
    var mouse_in = false;
    var mouse_down = false;
    var mouse_double_clicked = false;
    var mouse_on_item = false;

    // Item events
    var last_hover_item = undefined;

    // Scrollbar props
    var scroll_pos = 0;
    var row_shift = 0;
    var pixel_shift = 0;
    var is_scrollbar_visible = g_properties.show_scrollbar;
    var is_scrollbar_available = false;

    /** @type {?ScrollBar} */
    var scrollbar = undefined;

    this.initialize_list();
}

/**
 * @constructor
 */
function Row(x, y, w, h, metadb_arg, tag_name_arg, value_text_arg) {
    //public:
    this.draw = function (gr) {
        gr.FillSolidRect(this.x, this.y, this.w, this.h, g_tr_i_colors.background);

        if (this.is_odd && g_properties.alternate_row_color) {
            gr.FillSolidRect(this.x, this.y + 1, this.w, this.h - 1, g_tr_i_colors.row_alternate);
        }

        if (this.is_selected) {
            if (g_properties.alternate_row_color) {
                if (this.is_cropped) {
                    // last item is cropped
                    gr.DrawRect(this.x, this.y, this.w - 1, this.h - 1, 1, g_tr_i_colors.row_selected);
                }
                else {
                    gr.DrawRect(this.x, this.y, this.w - 1, this.h, 1, g_tr_i_colors.row_selected);
                }
            }
            else {
                gr.FillSolidRect(this.x, this.y, this.w, this.h, g_tr_i_colors.row_alternate);
            }
        }

        var info_text_format = g_string_format.v_align_center | g_string_format.trim_ellipsis_char | g_string_format.line_limit;

        var p = 5;
        var cur_x = this.x + p;

        {
            var name_text = /** @type{string} */ [((tag_name === 'www') ? tag_name : _.capitalize(tag_name.toLowerCase()) + ':')];
            var name_text_w = Math.ceil(/** @type{number} */ gr.MeasureString(name_text, g_tr_i_fonts.info_name, 0, 0, 0, 0).Width) + 5;
            gr.DrawString(name_text, g_tr_i_fonts.info_name, g_tr_i_colors.info_name, cur_x, this.y, name_text_w, this.h, info_text_format);

            cur_x += name_text_w;
        }

        {
            var value_text_w = this.w - (cur_x - this.x);
            gr.DrawString(value_text, g_tr_i_fonts.info_value, g_tr_i_colors.info_value, cur_x, this.y, value_text_w, this.h, info_text_format);
        }
    };

    var throttled_repaint = _.throttle(_.bind(function () {
        window.RepaintRect(this.x, this.y, this.w, this.h);
    }, this), 1000 / 60);
    this.repaint = function () {
        throttled_repaint();
    };

    this.trace = function (x, y) {
        return x >= this.x && x < this.x + this.w && y >= this.y && y < this.y + this.h;
    };

    this.set_y = function (y) {
        this.y = y;
    };

    this.set_w = function (w) {
        this.w = w;
    };

    this.edit_metadata = function () {
        var new_value = _.input2('Enter new ' + tag_name + ' value', 'Change metadata value', value_text);
        if (!_.isNil(new_value)) {
            value_text = new_value;

            var handle = fb.CreateHandleList();
            handle.Add(metadb);

            var meta_obj = {};
            meta_obj[tag_name] = value_text;
            handle.UpdateFileInfoFromJSON(JSON.stringify(meta_obj));
        }
    };

    this.get_value_text = function () {
        return value_text;
    };

    this.get_tag_name = function () {
        return tag_name;
    };

    //public:
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    //const after creation
    this.is_odd = false;
    this.is_readonly = true;

    this.is_selected = false;

    this.tt = new _.tt_handler;

    //private:

    var metadb = metadb_arg;

    /** @type {string} */
    var tag_name = tag_name_arg;
    /** @type {string} */
    var value_text = value_text_arg;
}