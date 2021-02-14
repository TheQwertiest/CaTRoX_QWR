﻿const common_package_id = '{1583C4B7-53AD-403F-8F7E-CB20490AAA26}';
const common_package_path = utils.GetPackagePath(common_package_id);
const common_files = [
    'Common.js',
    'Control_ContextMenu.js',
    'Control_PssSwitch.js'
];
for (let f of common_files) {
    include(`${common_package_path}/scripts/${f}`)
}

var trace_call = false;
var trace_on_paint = false;
var trace_on_move = false;

g_script_list.push('Panel_Menu.js');

g_properties.add_properties(
    {
        maximize_to_fullscreen: ['user.window.maximize_to_fullscreen', true],
        show_window_shadow:     ['user.window.shadow.show', true],
        show_fb2k_version:      ['user.title_bar.fb2k_version.show', false],
        show_theme_version:     ['user.title_bar.theme_version.show', false],
        show_cpu_usage:         ['user.title_bar.cpu_usage.show', false],
        show_tooltips:          ['user.global.tooltips.show', true],
        saved_mode:             ['system.window.saved_mode', 'Full'],
        full_mode_saved_width:  ['system.window.full.saved_width', 895],
        full_mode_saved_height: ['system.window.full.saved_height', 650],
        mini_mode_saved_width:  ['system.window.mini.saved_width', 250],
        mini_mode_saved_height: ['system.window.mini.saved_height', 600],
        is_first_launch:        ['system.first_launch', true],

        incompatibility_notified: ['system.jscript_incompatibility.notified', false],
        incompatibility_version:  ['system.jscript_incompatibility.version', utils.Version]
    }
);

qwr_utils.check_fonts(['Segoe Ui', 'Segoe Ui Semibold', 'Segoe Ui Symbol', 'Consolas', 'Marlett', 'Guifx v2 Transports', 'FontAwesome']);

// Fixup properties
(function() {
    var saved_mode = g_properties.saved_mode;
    if (saved_mode !== 'Full' || saved_mode !== 'Mini' || saved_mode !== 'UltraMini') {
        g_properties.saved_mode = 'Full';
    }
})();

/** @type {Object<string, IGdiFont>} */
var g_menu_fonts = {
    title: gdi.Font('Segoe Ui Semibold', 11),
    menu_button: gdi.Font('Segoe Ui Semibold', 12)
};

/** @type {Object<string, number>} */
var g_menu_colors = {
    title: _RGBA(240, 242, 244, 120)
};

var WindowState =
    {
        Normal:    0,
        Minimized: 1,
        Maximized: 2
    };

var FrameStyle =
    {
        Default:      0,
        SmallCaption: 1,
        NoCaption:    2,
        NoBorder:     3
    };

function humanFileSize(bytes, si) {
    var thresh = si ? 1000 : 1024;
    if(Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    var units = si
        ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
        : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1)+' '+units[u];
}

var mouse_move_suppress = new qwr_utils.MouseMoveSuppress();
var menu = new Menu();


function on_paint(gr) {
    trace_call && trace_on_paint && console.log(qwr_utils.function_name());
    menu.on_paint(gr);
}

function on_size() {
    trace_call && console.log(qwr_utils.function_name());
    var ww = window.Width;
    var wh = window.Height;

    if (ww <= 0 || wh <= 0) {
        // on_paint won't be called with such dimensions anyway
        return;
    }

    menu.on_size(ww, wh);
}

function on_mouse_move(x, y, m) {
    trace_call && trace_on_move && console.log(qwr_utils.function_name());

    if (mouse_move_suppress.is_supressed(x, y, m)) {
        return;
    }

    menu.on_mouse_move(x, y, m);
}

function on_mouse_lbtn_down(x, y, m) {
    trace_call && console.log(qwr_utils.function_name());
    menu.on_mouse_lbtn_down(x, y, m);
}

function on_mouse_lbtn_dblclk(x, y, m) {
    trace_call && console.log(qwr_utils.function_name());
    menu.on_mouse_lbtn_dblclk(x, y, m);
}

function on_mouse_lbtn_up(x, y, m) {
    trace_call && console.log(qwr_utils.function_name());
    menu.on_mouse_lbtn_up(x, y, m);
}

function on_mouse_leave() {
    trace_call && console.log(qwr_utils.function_name());
    menu.on_mouse_leave();
}

function on_mouse_rbtn_up(x, y) {
    trace_call && console.log(qwr_utils.function_name());
    return menu.on_mouse_rbtn_up(x, y);
}

function on_always_on_top_changed(state) {
    trace_call && console.log(qwr_utils.function_name());
    menu.on_always_on_top_changed(state);
}

function on_notify_data(name, info) {
    trace_call && console.log(qwr_utils.function_name());
    menu.on_notify_data(name, info);
}

/**
 * @constructor
 */
function Menu() {

    //<editor-fold desc="Callback Implementation">

    this.on_paint = function(gr) {
        if (!has_notified) {
            // When on_paint is called all other panels are loaded and can receive notifications
            window.NotifyOthers('show_tooltips', g_properties.show_tooltips);
            window.NotifyOthers('minimode_state', pss_switch.minimode.state);

            has_notified = true;

            // Dirty, dirty hack to adjust window size
            if (mode_handler.fix_window_size()) {
                // Size has changed, waiting for on_size
                window.Repaint();
                return;
            }
        }

        gr.FillSolidRect(this.x - pad, this.y - pad, this.w + 2 * pad, this.h + pad, g_theme.colors.pss_back);
        gr.FillSolidRect(this.x, this.y, this.w, this.h, g_theme.colors.panel_front);
        gr.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);

        if (g_properties.show_window_shadow) {
            // Dirty hack to hide the Aero style border
            gr.DrawLine(this.x - pad, this.y - pad, this.w + 2 * pad, this.y - pad, 1, g_theme.colors.pss_back);
        }

        if (g_properties.show_fb2k_version || g_properties.show_theme_version || g_properties.show_cpu_usage) {
            var title_x = this.x + left_pad;
            var title_y = this.y - 1;
            var title_w = right_pad - left_pad;

            var separator_text = '  \u25AA  ';
            var title_text = '';

            if (g_properties.show_cpu_usage) {
                var cpu_usage_text;
                if (pss_switch.minimode.state !== 'Full') {
                    cpu_usage_text = cpu_usage_tracker.get_cpu_usage() + '% (' + cpu_usage_tracker.get_gui_cpu_usage() + '%)';
                }
                else {
                    cpu_usage_text = 'CPU: ' + cpu_usage_tracker.get_cpu_usage() + '% (GUI: ' + cpu_usage_tracker.get_gui_cpu_usage() + '%)';
                }
                title_text = cpu_usage_text + ' ' + humanFileSize(window.TotalMemoryUsage);
            }

            if (g_properties.show_theme_version) {
                if (title_text) {
                    title_text += separator_text;
                }
                title_text += g_theme.name + ' ' + g_theme.version;
            }

            if (g_properties.show_fb2k_version) {
                if (title_text) {
                    title_text += separator_text;
                }
                title_text += fb.TitleFormat('%_foobar2000_version%').Eval(true);
            }

            var title_text_format = StringFormat();
            title_text_format.alignment = StringAlignment.center;
            title_text_format.line_alignment = StringAlignment.center;
            title_text_format.trimming = StringTrimming.ellipsis_char;
            title_text_format.format_flags = StringFormatFlags.no_wrap;

            gr.DrawString(title_text, g_menu_fonts.title, g_menu_colors.title, title_x, title_y, title_w, this.h, title_text_format.value());
        }

        buttons.paint(gr);
    };

    this.on_size = function(w, h) {
        this.h = h - pad;
        this.w = w - 2 * pad;

        if (UIHacks.FullScreen && UIHacks.MainWindowState !== WindowState.Maximized) {
            // Bug workaround: dragging in fullscreen mode will restore the window state, while keeping fullscreen flag
            UIHacks.FullScreen = false;
        }

        create_buttons(that.x, that.y, that.w, that.h);
        frame_handler.set_caption(left_pad, that.y, right_pad - left_pad, that.h);
    };

    this.on_mouse_move = function(x, y, m) {
        var btn = buttons.move(x, y);
        if (btn) {
            return;
        }

        if (!frame_handler.has_true_caption) {
            if (mouse_down) {
                qwr_utils.DisableSizing(m);
            }
            else {
                qwr_utils.EnableSizing(m);
            }
        }
    };

    this.on_mouse_lbtn_down = function(x, y, m) {
        mouse_down = true;
        buttons.lbtn_down(x, y);
    };

    this.on_mouse_lbtn_dblclk = function(x, y, m) {
        this.on_mouse_lbtn_down(x, y, m);
    };

    this.on_mouse_lbtn_up = function(x, y, m) {
        qwr_utils.EnableSizing(m);

        mouse_down = false;
        buttons.lbtn_up(x, y);
    };

    this.on_mouse_rbtn_up = function(x, y, m) {
        var cmm = new Context.MainMenu();

        var frame = new Context.Menu('Frame style');
        cmm.append(frame);

        frame.append_item(
            'Default',
            _.bind(function() {
                frame_handler.change_style(FrameStyle.Default);
            }, this)
        );

        frame.append_item(
            'Small caption',
            _.bind(function() {
                frame_handler.change_style(FrameStyle.SmallCaption);
            }, this)
        );

        frame.append_item(
            'No caption',
            _.bind(function() {
                frame_handler.change_style(FrameStyle.NoCaption);
            }, this)
        );

        frame.append_item(
            'No border',
            _.bind(function() {
                frame_handler.change_style(FrameStyle.NoBorder);
            }, this)
        );

        frame.radio_check(0, UIHacks.FrameStyle);

        if (UIHacks.FrameStyle === FrameStyle.NoBorder && UIHacks.Aero.Active) {
            frame.append_separator();

            frame.append_item(
                'Show window shadow',
                function() {
                    frame_handler.toggle_shadow();
                },
                {is_checked: g_properties.show_window_shadow}
            );
        }

        if (UIHacks.FrameStyle !== FrameStyle.Default) {
            cmm.append_separator();

            cmm.append_item(
                'Maximize button -> to fullscreen',
                function() {
                    g_properties.maximize_to_fullscreen = !g_properties.maximize_to_fullscreen;
                },
                {is_checked: g_properties.maximize_to_fullscreen}
            );
        }

        cmm.append_separator();

        cmm.append_item(
            'Show foobar version',
            function() {
                g_properties.show_fb2k_version = !g_properties.show_fb2k_version;
            },
            {is_checked: g_properties.show_fb2k_version}
        );

        cmm.append_item(
            'Show theme version',
            function() {
                g_properties.show_theme_version = !g_properties.show_theme_version;
            },
            {is_checked: g_properties.show_theme_version}
        );

        cmm.append_item(
            'Show button tooltips',
            function() {
                g_properties.show_tooltips = !g_properties.show_tooltips;
                buttons.show_tt = g_properties.show_tooltips;
                window.NotifyOthers('show_tooltips', g_properties.show_tooltips);
            },
            {is_checked: g_properties.show_tooltips}
        );

        if (utils.IsKeyPressed(VK_SHIFT)) {
            cmm.append_separator();

            cmm.append_item(
                'Show CPU usage',
                function() {
                    g_properties.show_cpu_usage = !g_properties.show_cpu_usage;
                    if (g_properties.show_cpu_usage) {
                        cpu_usage_tracker.start();
                    }
                    else {
                        cpu_usage_tracker.stop();
                    }
                },
                {is_checked: g_properties.show_cpu_usage}
            );

            qwr_utils.append_default_context_menu_to(cmm);
        }

        cmm.execute(x, y);
        cmm.dispose();

        this.repaint();

        return true;
    };

    this.on_mouse_leave = function() {
        buttons.leave();
    };

    this.on_always_on_top_changed = function(state) {
        buttons.refresh_pin_button();
    };

    this.on_notify_data = function(name, info) {
        if (name === 'minimode_state') {
            this.repaint();
        }
    };

    //</editor-fold>

    var throttled_repaint = _.throttle(_.bind(function() {
        window.RepaintRect(this.x, this.y, this.w, this.h);
    }, this), 1000 / 60);
    this.repaint = function() {
        throttled_repaint();
    };

    // private:
    function initialize() {
        // Workaround for fb2k bug, when always on top is not working on startup, even if set
        if (fb.AlwaysOnTop) {
            fb.RunMainMenuCommand('View/Always on Top');
            fb.RunMainMenuCommand('View/Always on Top');
        }

        create_button_images();

        if (g_properties.show_cpu_usage) {
            cpu_usage_tracker.start();
        }
    }

    function refresh_buttons() {
        create_buttons(that.x, that.y, that.w, that.h);
        frame_handler.set_caption(left_pad, that.y, right_pad - left_pad, that.h);
    }

    function create_buttons(x_arg, y_arg, w_arg, h_arg) {
        if (buttons) {
            buttons.reset();
        }
        buttons = new _buttons();
        buttons.show_tt = g_properties.show_tooltips;

        //---> Menu buttons
        if (pss_switch.minimode.state === 'Full') {
            var img = button_images.File;
            var x = x_arg + 1;
            var y = y_arg + 1;
            var h = img.normal.Height;
            var w = img.normal.Width;
            buttons.buttons.file = new _button(x, y, w, h, button_images.File, function(xx, yy, x, y, h, w) { _menu_item(x, y + h, 'File'); });

            img = button_images.Edit;
            x += w;
            w = img.normal.Width;
            buttons.buttons.edit = new _button(x, y, w, h, button_images.Edit, function(xx, yy, x, y, h, w) { _menu_item(x, y + h, 'Edit'); });

            img = button_images.View;
            x += w;
            w = img.normal.Width;
            buttons.buttons.view = new _button(x, y, w, h, button_images.View, function(xx, yy, x, y, h, w) { _menu_item(x, y + h, 'View'); });

            img = button_images.Playback;
            x += w;
            w = img.normal.Width;
            buttons.buttons.playback = new _button(x, y, w, h, button_images.Playback, function(xx, yy, x, y, h, w) { _menu_item(x, y + h, 'Playback'); });

            img = button_images.Library;
            x += w;
            w = img.normal.Width;
            buttons.buttons.library = new _button(x, y, w, h, button_images.Library, function(xx, yy, x, y, h, w) { _menu_item(x, y + h, 'Library'); });

            img = button_images.Help;
            x += w;
            w = img.normal.Width;
            buttons.buttons.help = new _button(x, y, w, h, button_images.Help, function(xx, yy, x, y, h, w) { _menu_item(x, y + h, 'Help'); });

            left_pad = x + w;
        }
        else {
            var x = x_arg + 1;
            var y = y_arg + 1;
            var h = button_images.Menu.normal.Height;
            var w = button_images.Menu.normal.Width;

            buttons.buttons.menu = new _button(x, y, w, h, button_images.Menu, function(xx, yy, x, y, h, w) { _.menu(x, y + h); });

            left_pad = x + w;
        }

        //---> Caption buttons
        var button_count = 0;

        // Pin\Unpin switch
        ++button_count;

        // UltraMiniMode switch
        ++button_count;

        if (pss_switch.minimode.state !== 'UltraMini') {// Minimode
            ++button_count;
        }

        if (UIHacks.FrameStyle !== FrameStyle.Default) {
            // Min
            ++button_count;

            // Max
            if (pss_switch.minimode.state === 'Full') {
                ++button_count;
            }

            // Close
            if (UIHacks.FrameStyle !== FrameStyle.SmallCaption || UIHacks.FullScreen) {
                ++button_count;
            }
        }

        var y = y_arg + 1;
        var w = 22;
        var h = w;
        var p = 3;
        var x = w_arg - w * button_count - p * (button_count - 1);

        right_pad = x;

        buttons.buttons.pin = new _button(x, y, w, h, fb.AlwaysOnTop ? button_images.Unpin : button_images.Pin, function() {
            fb.RunMainMenuCommand('View/Always on Top');
        }, fb.AlwaysOnTop ? 'Unpin window' : 'Pin window on Top');

        buttons.refresh_pin_button = function() {
            buttons.buttons.pin.set_image(fb.AlwaysOnTop ? button_images.Unpin : button_images.Pin);
            buttons.buttons.pin.tiptext = fb.AlwaysOnTop ? 'Unpin window' : 'Pin window on Top';
            buttons.buttons.pin.repaint();
        };

        var ultraMiniModeBtnArr =
            {
                MiniModeExpandToMini: {
                    ico: button_images.MiniModeExpand,
                    txt: 'Change to playlist mode'
                },
                MiniModeExpandToFull: {
                    ico: button_images.MiniModeExpand,
                    txt: 'Change to full mode'
                },
                MiniModeCompress:     {
                    ico: button_images.UltraMiniModeCompress,
                    txt: 'Change to art mode'
                }
            };

        var ultraMiniModeBtn = (pss_switch.minimode.state === 'Mini' || pss_switch.minimode.state === 'Full')
            ? ultraMiniModeBtnArr.MiniModeCompress
            : ((g_properties.saved_mode === 'Full')
                ? ultraMiniModeBtnArr.MiniModeExpandToFull
                : ultraMiniModeBtnArr.MiniModeExpandToMini);

        x += w + p;
        buttons.buttons.ultraminimode = new _button(x, y, w, h, ultraMiniModeBtn.ico, _.bind(mode_handler.toggle_ultra_mini_mode, mode_handler), ultraMiniModeBtn.txt);

        if (pss_switch.minimode.state !== 'UltraMini') {
            var miniModeBtnArr =
                {
                    MiniModeExpand:   {
                        ico: button_images.MiniModeExpand,
                        txt: 'Change to full mode'
                    },
                    MiniModeCompress: {
                        ico: button_images.MiniModeCompress,
                        txt: 'Change to playlist mode'
                    }
                };

            var miniModeBtn = (pss_switch.minimode.state === 'Mini') ? miniModeBtnArr.MiniModeExpand : miniModeBtnArr.MiniModeCompress;

            x += w + p;
            buttons.buttons.minimode = new _button(x, y, w, h, miniModeBtn.ico, _.bind(mode_handler.toggle_mini_mode, mode_handler), miniModeBtn.txt);
        }

        if (UIHacks.FrameStyle !== FrameStyle.Default) {
            x += w + p;
            buttons.buttons.minimize = new _button(x, y, w, h, button_images.Minimize, function() { fb.RunMainMenuCommand('View/Hide'); }, 'Minimize');

            if (pss_switch.minimode.state === 'Full') {
                x += w + p;
                buttons.buttons.maximize = new _button(x, y, w, h, button_images.Maximize, function() {
                    try {
                        if (g_properties.maximize_to_fullscreen ? !utils.IsKeyPressed(VK_CONTROL) : utils.IsKeyPressed(VK_CONTROL)) {
                            UIHacks.FullScreen = !UIHacks.FullScreen;
                        }
                        else if (UIHacks.MainWindowState === WindowState.Maximized) {
                            UIHacks.MainWindowState = WindowState.Normal;
                        }
                        else {
                            UIHacks.MainWindowState = WindowState.Maximized;
                        }
                    }
                    catch (e) {
                        console.log(e + ' Disable WSH safe mode');
                    }

                    buttons.buttons.maximize.tiptext = (UIHacks.FullScreen || UIHacks.MainWindowState === WindowState.Maximized)
                        ? 'Restore' : 'Maximize'

                }, (UIHacks.FullScreen || UIHacks.MainWindowState === WindowState.Maximized) ? 'Restore' : 'Maximize');
            }

            if (UIHacks.FrameStyle !== FrameStyle.SmallCaption || UIHacks.FullScreen) {
                x += w + p;
                buttons.buttons.close = new _button(x, y, w, h, button_images.Close, function() { fb.Exit(); }, 'Close');
            }
        }
    }

    function create_button_images() {
        var fontMarlett = gdi.Font('Marlett', 13);
        var fontAwesome = gdi.Font('FontAwesome', 12);
        var fontSegoeUi = g_menu_fonts.menu_button;

        var default_menu_text_colors =
            [
                _RGB(140, 142, 144),
                _RGB(180, 182, 184),
                _RGB(120, 122, 124)
            ];

        var default_menu_rect_colors =
            [
                _RGB(120, 122, 124),
                _RGB(170, 172, 174),
                _RGB(110, 112, 114)
            ];

        var default_ico_colors =
            [
                _RGB(140, 142, 144),
                _RGB(190, 192, 194),
                _RGB(100, 102, 104)
            ];

        var btn =
            {
                Pin:                   {
                    ico:  '\uF08D',
                    font: fontAwesome,
                    id:   'caption',
                    w:    22,
                    h:    22
                },
                Unpin:                 {
                    ico:  '\uF08D',
                    font: fontAwesome,
                    id:   'caption',
                    w:    22,
                    h:    22
                },
                MiniModeExpand:        {
                    ico:  '\uF065',
                    font: fontAwesome,
                    id:   'caption',
                    w:    22,
                    h:    22
                },
                MiniModeCompress:      {
                    ico:  '\uF066',
                    font: fontAwesome,
                    id:   'caption',
                    w:    22,
                    h:    22
                },
                UltraMiniModeCompress: {
                    ico:  '\uF1AA',
                    font: fontAwesome,
                    id:   'caption',
                    w:    22,
                    h:    22
                },
                Minimize:              {
                    ico:  '0',
                    font: fontMarlett,
                    id:   'caption',
                    w:    22,
                    h:    22
                },
                Maximize:              {
                    ico:  '1',
                    font: fontMarlett,
                    id:   'caption',
                    w:    22,
                    h:    22
                },
                Close:                 {
                    ico:  'r',
                    font: fontMarlett,
                    id:   'caption',
                    w:    22,
                    h:    22
                },
                Menu:                  {
                    ico:  'Menu',
                    font: fontSegoeUi,
                    id:   'menu'
                },
                File:                  {
                    ico:  'File',
                    font: fontSegoeUi,
                    id:   'menu'
                },
                Edit:                  {
                    ico:  'Edit',
                    font: fontSegoeUi,
                    id:   'menu'
                },
                View:                  {
                    ico:  'View',
                    font: fontSegoeUi,
                    id:   'menu'
                },
                Playback:              {
                    ico:  'Playback',
                    font: fontSegoeUi,
                    id:   'menu'
                },
                Library:               {
                    ico:  'Library',
                    font: fontSegoeUi,
                    id:   'menu'
                },
                Help:                  {
                    ico:  'Help',
                    font: fontSegoeUi,
                    id:   'menu'
                },
                Playlists:             {
                    ico:  'Playlists',
                    font: fontSegoeUi,
                    id:   'menu'
                }
            };

        _.forEach(btn, function(item, i) {
            if (item.id === 'menu') {
                var img = gdi.CreateImage(100, 100);
                var g = img.GetGraphics();

                item.w = Math.ceil(
                    /** @type {number} */
                    g.MeasureString(item.ico, item.font, 0, 0, 0, 0).Width
                ) + 17;
                img.ReleaseGraphics(g);
                item.h = 21;
            }

            var w = item.w,
                h = item.h,
                lw = 2;

            var stateImages = []; //0=normal, 1=hover, 2=down;

            for (var s = 0; s <= 2; ++s) {
                var img = gdi.CreateImage(w, h);
                var g = img.GetGraphics();
                g.SetSmoothingMode(SmoothingMode.HighQuality);
                g.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);
                g.FillSolidRect(0, 0, w, h, g_theme.colors.panel_front); // Cleartype is borked, if drawn without background

                if (item.id === 'menu') {
                    var menuTextColor = default_menu_text_colors[s];
                    var menuRectColor = default_menu_rect_colors[s];

                    if (s !== 0) {
                        g.DrawRect(Math.floor(lw / 2), Math.floor(lw / 2), w - lw, h - lw, 1, menuRectColor);
                    }
                    g.DrawString(item.ico, item.font, menuTextColor, 0, 0, w, h - 1, g_string_format_center.value());
                }
                else if (item.id === 'caption') {
                    var captionIcoColor = default_ico_colors[s];

                    g.DrawString(item.ico, item.font, captionIcoColor, 0, 0, w, h, g_string_format_center.value());
                }

                if (i === 'Unpin') {
                    img.ReleaseGraphics(g);
                    var savedImg = img;

                    img = gdi.CreateImage(savedImg.Height, savedImg.Width);
                    g = img.GetGraphics();
                    g.SetSmoothingMode(SmoothingMode.HighQuality);
                    g.DrawImage(savedImg, -2, 0, savedImg.Width, savedImg.Height, 0, 0, savedImg.Height, savedImg.Width, 90, 255);
                }

                img.ReleaseGraphics(g);
                stateImages[s] = img;
            }
            button_images[i] =
                {
                    normal:  stateImages[0],
                    hover:   stateImages[1],
                    pressed: stateImages[2]
                };
        });
    }

    // public:
    var pad = 4;
    this.x = pad;
    this.y = pad;
    this.w = 0;
    this.h = 0;

    // private:
    var that = this;

    // Mouse state
    var mouse_down = false;

    // Objects
    var frame_handler = new FrameStyleHandler(refresh_buttons);
    var mode_handler = new WindowModeHandler();
    var cpu_usage_tracker = new CpuUsageTracker(_.bind(this.repaint, this));
    var buttons = undefined;

    // noinspection JSMismatchedCollectionQueryUpdate
    /** @type {Object<string, !{normal: !GdiBitmap, hover: !GdiBitmap, pressed: !GdiBitmap}>} */
    var button_images = {};

    var left_pad = 0;
    var right_pad = 0;

    var has_notified = false;

    initialize();
}

/**
 * @constructor
 */
function WindowModeHandler() {

    this.toggle_ultra_mini_mode = function() {
        if (pss_switch.minimode.state !== 'UltraMini') {
            g_properties.saved_mode = pss_switch.minimode.state;
        }
        var new_minimode_state = (pss_switch.minimode.state !== 'UltraMini') ? 'UltraMini' : g_properties.saved_mode;

        if (new_minimode_state === 'Mini') {
            pss_switch.minimode.state = new_minimode_state;

            set_window_size(g_properties.mini_mode_saved_width, g_properties.mini_mode_saved_height);

            UIHacks.MinSize.Width = 300;
            UIHacks.MinSize.Height = 250;
            UIHacks.MinSize.Enabled = true;
        }
        else if (new_minimode_state === 'Full') {
            pss_switch.minimode.state = new_minimode_state;

            set_window_size(g_properties.full_mode_saved_width, g_properties.full_mode_saved_height);

            UIHacks.MinSize.Width = 650;
            UIHacks.MinSize.Height = 600;
            UIHacks.MinSize.Enabled = true;
        }
        else {
            if (UIHacks.FullScreen) {
                UIHacks.FullScreen = false;
            }
            else {
                if (pss_switch.minimode.state === 'Full') {
                    if (fb_handle) {
                        g_properties.full_mode_saved_width = fb_handle.Width;
                        g_properties.full_mode_saved_height = fb_handle.Height;
                    }
                }
                else {
                    if (fb_handle) {
                        g_properties.mini_mode_saved_width = fb_handle.Width;
                        g_properties.mini_mode_saved_height = fb_handle.Height;
                    }
                }
            }

            pss_switch.minimode.state = new_minimode_state;

            set_window_size(250, 250 + 28);

            UIHacks.MinSize.Width = 200;
            UIHacks.MinSize.Height = 200 + 28;
            UIHacks.MinSize.Enabled = true;
        }
    };

    this.toggle_mini_mode = function() {
        var new_minimode_state = ((pss_switch.minimode.state === 'Mini') ? 'Full' : 'Mini');

        if (new_minimode_state === 'Mini') {
            if (UIHacks.FullScreen) {
                UIHacks.FullScreen = false;
            }
            else {
                if (fb_handle) {
                    g_properties.full_mode_saved_width = fb_handle.Width;
                    g_properties.full_mode_saved_height = fb_handle.Height;
                }
            }

            pss_switch.minimode.state = new_minimode_state;

            set_window_size(g_properties.mini_mode_saved_width, g_properties.mini_mode_saved_height);

            UIHacks.MinSize.Width = 300;
            UIHacks.MinSize.Height = 250;
            UIHacks.MinSize.Enabled = true;
        }
        else {
            if (UIHacks.FullScreen) {
                UIHacks.FullScreen = false;
            }
            else {
                if (fb_handle) {
                    g_properties.mini_mode_saved_width = fb_handle.Width;
                    g_properties.mini_mode_saved_height = fb_handle.Height;
                }
            }

            pss_switch.minimode.state = new_minimode_state;

            set_window_size(g_properties.full_mode_saved_width, g_properties.full_mode_saved_height);

            UIHacks.MinSize.Width = 650;
            UIHacks.MinSize.Height = 600;
            UIHacks.MinSize.Enabled = true;
        }
    };

    this.set_window_size_limits_for_mode = function(miniMode) {
        var min_w = 0,
            max_w = 0,
            min_h = 0,
            max_h = 0;
        if (miniMode === 'UltraMini') {
            min_w = 200;
            min_h = 200 + 28;
        }
        else if (miniMode === 'Mini') {
            min_w = 300;
            min_h = 250;
        }
        else {
            min_w = 650;
            min_h = 600;
        }

        set_window_size_limits(min_w, max_w, min_h, max_h);
    };

    this.fix_window_size = function() {
        if (fb_handle) {
            var last_w = fb_handle.Width;
            var last_h = fb_handle.Height;
        }
        else {
            var was_first_launch = g_properties.is_first_launch;
        }

        if (g_properties.is_first_launch) {
            if (pss_switch.minimode.state === 'Full') {
                // Workaround for window size on first theme launch
                set_window_size(895, 650);
            }
            g_properties.is_first_launch = false;
        }

        // Workaround for messed up settings file or properties
        this.set_window_size_limits_for_mode(pss_switch.minimode.state);

        if (fb_handle) {
            return last_w !== fb_handle.Width || last_h !== fb_handle.Height;
        }
        else {
            return was_first_launch;
        }
    };

    function set_window_size(width, height) {
        //To avoid resizing bugs, when the window is bigger\smaller than the saved one.
        UIHacks.MinSize.Enabled = false;
        UIHacks.MaxSize.Enabled = false;
        UIHacks.MinSize.Width = width;
        UIHacks.MinSize.Height = height;
        UIHacks.MaxSize.Width = width;
        UIHacks.MaxSize.Height = height;

        UIHacks.MaxSize.Enabled = true;
        UIHacks.MaxSize.Enabled = false;
        UIHacks.MinSize.Enabled = true;
        UIHacks.MinSize.Enabled = false;

        window.NotifyOthers('minimode_state_size', pss_switch.minimode.state);
    }

    function set_window_size_limits(min_w, max_w, min_h, max_h) {
        UIHacks.MinSize.Enabled = false;
        UIHacks.MaxSize.Enabled = false;
        
        UIHacks.MinSize.Width = min_w;
        UIHacks.MaxSize.Width = max_w;
        UIHacks.MinSize.Height = min_h;
        UIHacks.MaxSize.Height = max_h;
        
        UIHacks.MinSize.Enabled = !!min_w || !!min_h;
        UIHacks.MaxSize.Enabled = !!max_w || !!max_h;
    }

    var fb_handle = undefined;
}

/**
 * @param {function()} on_style_change_callback_arg
 * @constructor
 */
function FrameStyleHandler(on_style_change_callback_arg) {
    this.change_style = function(style) {
        UIHacks.FrameStyle = style;

        on_style_change_callback();
        update_caption_state();
        update_shadow_state();
    };

    this.disable_caption = function() {
        UIHacks.SetPseudoCaption(0, 0, 0, 0);
    };

    this.set_caption = function(x_arg, y_arg, w_arg, h_arg) {
        if (x_arg === x && y_arg === y && w_arg === w && h_arg === h) {
            return;
        }

        x = x_arg;
        y = y_arg;
        w = w_arg;
        h = h_arg;

        update_caption_state();
    };

    this.toggle_shadow = function() {
        g_properties.show_window_shadow = !g_properties.show_window_shadow;
        update_shadow_state();
    };

    function update_caption_state() {
        that.has_true_caption = (UIHacks.FrameStyle === FrameStyle.Default || UIHacks.FrameStyle === FrameStyle.SmallCaption) && !UIHacks.FullScreen;
        if (that.has_true_caption) {
            that.disable_caption();
        }
        else {
            UIHacks.SetPseudoCaption(x, y, w, h);
        }
    }

    function update_shadow_state() {
        if (g_properties.show_window_shadow && UIHacks.FrameStyle === FrameStyle.NoBorder) {
            UIHacks.Aero.Effect = 2;
            UIHacks.Aero.Top = 1;
        }
        else {
            UIHacks.Aero.Effect = 0;
            UIHacks.Aero.Left = UIHacks.Aero.Top = UIHacks.Aero.Right = UIHacks.Aero.Bottom = 0;
        }
    }

    this.has_true_caption = true;

    var that = this;

    var on_style_change_callback = on_style_change_callback_arg;

    var x = 0;
    var y = 0;
    var w = 0;
    var h = 0;

    update_caption_state();
    update_shadow_state();
}

/**
 * @param {function()} on_change_callback_arg
 * @constructor
 */
function CpuUsageTracker(on_change_callback_arg) {
    this.start = function() {
        start_cpu_usage_timer();
    };

    this.stop = function() {
        stop_cpu_usage_timer();
    };

    this.get_cpu_usage = function() {
        return cpu_usage;
    };

    this.get_gui_cpu_usage = function() {
        return gui_cpu_usage;
    };

    function start_cpu_usage_timer() {
        if (cpu_usage_timer) {
            return;
        }

        cpu_usage_timer = setInterval(function () {
            var floatUsage =
                /** @type {number} */ UIHacks.FoobarCPUUsage;

            var baseLine;

            if (fb.IsPlaying && !fb.IsPaused) {
                playing_usage.update(floatUsage);
                baseLine = playing_usage.average_usage;
            }
            else {
                idle_usage.update(floatUsage);
                baseLine = idle_usage.average_usage;
            }

            cpu_usage = floatUsage.toFixed(1);

            var usageDiff = Math.max((floatUsage - baseLine), 0);
            usageDiff = (usageDiff <= 0.5 ? 0 : usageDiff); // Suppress low spikes
            gui_cpu_usage = usageDiff.toFixed(1);

            on_change_callback();
        }, 1000);
    }

    function stop_cpu_usage_timer() {
        if (cpu_usage_timer) {
            clearInterval(cpu_usage_timer);
            cpu_usage_timer = undefined;
        }
        idle_usage.reset();
        playing_usage.reset();
    }

    var cpu_usage = 0;
    var gui_cpu_usage = 0;
    var cpu_usage_timer = null;
    var idle_usage = new AverageUsageFunc();
    var playing_usage = new AverageUsageFunc();

    var on_change_callback = on_change_callback_arg;
}

/**
 * @constructor
 */
function AverageUsageFunc() {
    /**
     * @param {number} current_usage
     */
    this.update = function(current_usage) {
        if (current_sample_count) {
            if (this.average_usage - current_usage > 2) {
                if (reset_sample_count < 3) {
                    reset_sample_count++;
                }
                else {
                    this.reset();
                }
            }
            else if (Math.abs(current_usage - this.average_usage) < 2) // Suppress high spikes
            {
                recalculate_average(current_usage);
            }
        }
        else {
            recalculate_average(current_usage);
        }
    };

    this.reset = function() {
        current_sample_count = 0;
        reset_sample_count = 0;
        acum_usage = 0;
        this.average_usage = 0;
    };

    /**
     * @param {number} current_usage
     */
    function recalculate_average(current_usage) {
        if (current_sample_count < sample_count) {
            acum_usage += current_usage;
            ++current_sample_count;

            that.average_usage = acum_usage / current_sample_count;
        }
        else {
            that.average_usage -= that.average_usage / sample_count;
            that.average_usage += current_usage / sample_count;
        }
    }

    this.average_usage = 0;

    var that = this;

    /**
     * @const
     * @type {number}
     */
    var sample_count = 30;
    var current_sample_count = 0;
    var reset_sample_count = 0;
    var acum_usage = 0;
}
