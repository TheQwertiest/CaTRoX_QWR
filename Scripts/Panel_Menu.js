// ==PREPROCESSOR==
// @name 'Menu Panel'
// @author 'TheQwertiest'
// ==/PREPROCESSOR==

(function check_es5_availability() {
    var test = !!Date.now && !!Array.isArray && !!Array.prototype.forEach;
    if (!test) {
        fb.ShowPopupMessage('Error: ES5 is not supported by your system! Cannot use this theme!', 'CaTRoX (QWR Edition)');
    }
})();

(function check_modded_jscript_availability() {
    if (common_vars.incompatibility_state === 'Notified')
        return;

    if (!qwr_utils.has_modded_jscript())
        fb.ShowPopupMessage('Warning: Vanilla JScript component detected!\nThis theme relies on modded JScript component, so some features will be unavailable!\n\nSources for modded JScript are available at https://github.com/TheQwertiest/foo-jscript-panel\n\nTo hide this warning rename file INCOMPATIBILITY_0 to INCOMPATIBILITY_1 in \\themes\\CaTRoX\\Settings\\', 'CaTRoX (QWR Edition)');
})();

qwr_utils.check_fonts(['Segoe Ui', 'Segoe Ui Semibold', 'Segoe Ui Symbol', 'Consolas', 'Marlett', 'Guifx v2 Transports', 'FontAwesome']);

var trace_call = false;
var trace_on_paint = false;
var trace_on_move = false;

g_properties.add_properties(
    {
        g_maximize_to_fullscreen: ['user.window.maximize_to_fullscreen', true],
        show_window_shadow:         ['user.window.shadow.show', false],
        show_fb2k_version:        ['user.title_bar.fb2k_version.show', false],
        show_theme_version:       ['user.title_bar.theme_version.show', false],
        show_cpu_usage:           ['user.title_bar.cpu_usage.show', false],
        show_tooltips:            ['user.global.tooltips.show', true],
        saved_mode:               ['system.window.saved_mode', 'Full'],
        full_mode_saved_width:    ['system.window.full.saved_width', 895],
        full_mode_saved_height:   ['system.window.full.saved_height', 650],
        mini_mode_saved_width:    ['system.window.mini.saved_width', 250],
        mini_mode_saved_height:   ['system.window.mini.saved_height', 600]
    }
);

var g_has_modded_jscript = qwr_utils.has_modded_jscript();
var g_maximize_to_fullscreen = g_properties.g_maximize_to_fullscreen;
var g_is_pinned = g_has_modded_jscript ? fb.IsMainMenuCommandChecked('View/Always on Top') : false;

WindowState =
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
var MoveStyle =
    {
        Default: 0,
        Middle:  1,
        Left:    2,
        Both:    3
    };

var menu = new Menu();

function on_paint(gr) {
    trace_call && trace_on_paint && fb.trace(qwr_utils.function_name());
    menu.on_paint(gr);
}

function on_size() {
    trace_call && fb.trace(qwr_utils.function_name());
    var ww = window.Width;
    var wh = window.Height;

    if (ww <= 0 || wh <= 0) {
        // on_paint won't be called with such dimensions anyway
        return;
    }

    menu.on_size(ww, wh);
}

function on_mouse_move(x, y, m) {
    trace_call && trace_on_move && fb.trace(qwr_utils.function_name());
    menu.on_mouse_move(x, y, m);
}

function on_mouse_lbtn_down(x, y, m) {
    trace_call && fb.trace(qwr_utils.function_name());
    menu.on_mouse_lbtn_down(x, y, m);
}

function on_mouse_lbtn_dblclk(x, y, m) {
    trace_call && fb.trace(qwr_utils.function_name());
    menu.on_mouse_lbtn_dblclk(x, y, m);
}

function on_mouse_lbtn_up(x, y, m) {
    trace_call && fb.trace(qwr_utils.function_name());
    menu.on_mouse_lbtn_up(x, y, m);
}

function on_mouse_leave() {
    trace_call && fb.trace(qwr_utils.function_name());
    menu.on_mouse_leave();
}

function on_mouse_rbtn_up(x, y) {
    trace_call && fb.trace(qwr_utils.function_name());
    return menu.on_mouse_rbtn_up(x, y);
}

function on_notify_data(name, info) {
    trace_call && fb.trace(qwr_utils.function_name());
    menu.on_notify_data(name, info);
}

function Menu() {
    this.on_paint = function (gr) {
        if (!has_notified) {
            // When on_paint is called all other panels are loaded and can receive notifications
            window.NotifyOthers('show_tooltips', g_properties.show_tooltips);
            window.NotifyOthers('minimode_state', common_vars.minimode_state);
            has_notified = true;
        }

        gr.FillSolidRect(this.x - pad, this.y - pad, this.w + 2*pad, this.h + pad, pssBackColor);
        gr.FillSolidRect(this.x, this.y, this.w, this.h, panelsFrontColor);
        gr.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);

        if (g_properties.show_window_shadow) {
            // Dirty hack to fix the appearing border
            gr.DrawLine(this.x - pad, this.y - pad, this.w + 2*pad, this.y - pad, 1, pssBackColor);
        }

        if (g_properties.show_fb2k_version || g_properties.show_theme_version || g_properties.show_cpu_usage) {
            var title_x = this.x + left_pad;
            var title_y = this.y - 1;
            var title_w = right_pad - left_pad;

            var separator_text = '  \u25AA  ';
            var title_text = '';

            if (g_properties.show_cpu_usage) {
                var cpu_usage_text;
                if (common_vars.minimode_state !== 'Full') {
                    cpu_usage_text = cpu_usage_tracker.get_cpu_usage() + '% (' + cpu_usage_tracker.get_gui_cpu_usage() + '%)';
                }
                else {
                    cpu_usage_text = 'CPU: ' + cpu_usage_tracker.get_cpu_usage() + '% (GUI: ' + cpu_usage_tracker.get_gui_cpu_usage() + '%)';
                }
                title_text = cpu_usage_text;
            }

            if (g_properties.show_theme_version) {
                if (title_text) {
                    title_text += separator_text;
                }
                title_text += g_theme_name + ' ' + g_theme_version;
            }

            if (g_properties.show_fb2k_version) {
                if (title_text) {
                    title_text += separator_text;
                }
                title_text += fb.TitleFormat('%_foobar2000_version%').eval(true);
            }

            var title_text_format = g_string_format.align_center | g_string_format.trim_ellipsis_char | g_string_format.no_wrap;
            gr.DrawString(title_text, gdi.font('Segoe Ui Semibold', 11, 0), _.RGBA(240, 242, 244, 120), title_x, title_y, title_w, this.h, title_text_format);
        }

        buttons.paint(gr);
    };

    this.on_size = function (w, h) {
        this.h = h - pad;
        this.w = w - 2*pad;
        create_buttons(this.x, this.y, this.w, this.h);

        if (!uiHacks) {
            return;
        }

        // needed when double clicking on caption and UIHacks.FullScreen == true;
        if (!utils.IsKeyPressed(VK_CONTROL) && UIHacks.FullScreen && UIHacks.MainWindowState === 0) {
            UIHacks.MainWindowState = 0;
        }
    };

    this.on_mouse_move = function (x, y, m) {
        var btn = buttons.move(x, y);
        if (btn) {
            return
        }
        
        if (!uiHacks) {
            return;
        }

        if (mouse_down) {
            UIHacks.SetPseudoCaption(0, 0, 0, 0);
            qwr_utils.DisableSizing(m);
            pseudo_caption_enabled = false;
        }
        else if (!pseudo_caption_enabled || pseudo_caption_w !== this.w) {
            UIHacks.SetPseudoCaption(left_pad, this.y, right_pad - left_pad, this.h);
            qwr_utils.EnableSizing(m);
            pseudo_caption_enabled = true;
            pseudo_caption_w = this.w;
        }
    };

    this.on_mouse_lbtn_down = function (x, y, m) {
        mouse_down = true;
        buttons.lbtn_down(x, y);
    };

    this.on_mouse_lbtn_dblclk = function (x, y, m) {
        this.on_mouse_lbtn_down(x, y, m);
        pseudo_caption_enabled = false;
    };

    this.on_mouse_lbtn_up = function (x, y, m) {
        qwr_utils.EnableSizing(m);

        mouse_down = false;
        buttons.lbtn_up(x, y);
    };

    this.on_mouse_rbtn_up = function (x, y, m) {
        var cpm = window.CreatePopupMenu();
        var frame = window.CreatePopupMenu();

        if (uiHacks) {
            frame.AppendMenuItem(MF_STRING, 1, 'Default');
            frame.AppendMenuItem(MF_STRING, 2, 'Small caption');
            frame.AppendMenuItem(MF_STRING, 3, 'No caption');
            frame.AppendMenuItem(MF_STRING, 4, 'No border');
            frame.CheckMenuRadioItem(1, 4, UIHacks.FrameStyle + 1);
            if (UIHacks.FrameStyle === FrameStyle.NoBorder && UIHacks.Aero.Active) {
                frame.AppendMenuSeparator();
                frame.AppendMenuItem(MF_STRING, 5, 'Show window shadow');
                frame.CheckMenuItem(5, (UIHacks.Aero.Left + UIHacks.Aero.Top + UIHacks.Aero.Right + UIHacks.Aero.Bottom));
            }
            frame.AppendTo(cpm, MF_STRING, 'Frame style');

            if (UIHacks.FrameStyle > 0) {
                cpm.AppendMenuSeparator();
                cpm.AppendMenuItem(MF_STRING, 6, 'Maximize button -> to fullscreen');
            }
            cpm.CheckMenuItem(6, g_properties.g_maximize_to_fullscreen);
            cpm.AppendMenuSeparator();
        }

        cpm.AppendMenuItem(MF_STRING, 7, 'Show foobar version');
        cpm.CheckMenuItem(7, g_properties.show_fb2k_version);

        cpm.AppendMenuItem(MF_STRING, 8, 'Show theme version');
        cpm.CheckMenuItem(8, g_properties.show_theme_version);

        cpm.AppendMenuItem(MF_STRING, 9, 'Show button tooltips');
        cpm.CheckMenuItem(9, g_properties.show_tooltips);

        if (utils.CheckComponent('foo_ui_hacks') && safeMode) {
            cpm.AppendMenuItem(MF_STRING, 102, 'Frame styles not available (disable WSH safe mode)');
        }

        if (utils.IsKeyPressed(VK_SHIFT)) {
            cpm.AppendMenuSeparator();
            cpm.AppendMenuItem(MF_STRING, 99, 'Show CPU usage');
            cpm.CheckMenuItem(99, g_properties.show_cpu_usage);
            _.appendDefaultContextMenu(cpm);
        }

        var id = cpm.TrackPopupMenu(x, y);

        switch (id) {
            case 1:
                UIHacks.FrameStyle = FrameStyle.Default;
                UIHacks.MoveStyle = MoveStyle.Default;
                UIHacks.Aero.Effect = 0;
                create_buttons(this.x, this.y, this.w, this.h);
                break;
            case 2:
                UIHacks.FrameStyle = FrameStyle.SmallCaption;
                UIHacks.MoveStyle = MoveStyle.Default;
                UIHacks.Aero.Effect = 0;
                create_buttons(this.x, this.y, this.w, this.h);
                break;
            case 3:
                UIHacks.FrameStyle = FrameStyle.NoCaption;
                UIHacks.MoveStyle = MoveStyle.Both;
                UIHacks.Aero.Effect = 0;
                create_buttons(this.x, this.y, this.w, this.h);
                break;
            case 4:
                UIHacks.FrameStyle = FrameStyle.NoBorder;
                UIHacks.MoveStyle = MoveStyle.Both;
                UIHacks.Aero.Effect = 2;
                create_buttons(this.x, this.y, this.w, this.h);
                break;
            case 5:
                g_properties.show_window_shadow = !g_properties.show_window_shadow;
                toggle_window_shadow(g_properties.show_window_shadow);
                break;
            case 6:
                g_properties.g_maximize_to_fullscreen = !g_properties.g_maximize_to_fullscreen;
                break;
            case 7:
                g_properties.show_fb2k_version = !g_properties.show_fb2k_version;
                break;
            case 8:
                g_properties.show_theme_version = !g_properties.show_theme_version;
                break;
            case 9:
                g_properties.show_tooltips = !g_properties.show_tooltips;
                buttons.show_tt = g_properties.show_tooltips;
                window.NotifyOthers('show_tooltips', g_properties.show_tooltips);
                break;
            case 99:
                g_properties.show_cpu_usage = !g_properties.show_cpu_usage;
                if (g_properties.show_cpu_usage) {
                    cpu_usage_tracker.start();
                }
                else {
                    cpu_usage_tracker.stop();
                }
                break;
            default:
                _.executeDefaultContextMenu(id, scriptFolder + 'Panel_Menu.js');
        }

        _.dispose(frame, cpm);

        this.repaint();

        return true;
    };

    this.on_mouse_leave = function () {
        buttons.leave();
    };

    this.on_notify_data = function (name, info) {
        if (name === 'minimode_state') {
            common_vars.minimode_state = info;
            this.repaint();
        }
    };

    ///// EOF callbacks

    var throttled_repaint = _.throttle(_.bind(function () {
        window.RepaintRect(this.x, this.y, this.w, this.h);
    }, this), 1000 / 60);
    this.repaint = function () {
        throttled_repaint();
    };

    // private:
    function initialize() {
        // Workaround for fb2k bug, when always on top is not working on startup, even if set
        if (g_is_pinned) {
            fb.RunMainMenuCommand('View/Always on Top');
            fb.RunMainMenuCommand('View/Always on Top');
        }

        // Workaround for messed up settings file or properties
        mode_handler.set_window_size_limits_for_mode(common_vars.minimode_state);

        toggle_window_shadow(g_properties.show_window_shadow);

        create_button_images();

        if (g_properties.show_cpu_usage) {
            cpu_usage_tracker.start();
        }
    }

    function create_buttons(x_arg, y_arg, w_arg, h_arg) {
        if (buttons) {
            buttons.reset();
        }
        buttons = new _.buttons();
        buttons.show_tt = g_properties.show_tooltips;

        //---> Menu buttons
        if (common_vars.minimode_state === 'Full') {
            var img = button_images.File;
            var x = x_arg + 1;
            var y = y_arg + 1;
            var h = img.normal.Height;
            var w = img.normal.Width;
            buttons.buttons.file = new _.button(x, y, w, h, button_images.File, function (xx, yy, x, y, h, w) { _.menu_item(x, y + h, 'File'); });

            img = button_images.Edit;
            x += w;
            w = img.normal.Width;
            buttons.buttons.edit = new _.button(x, y, w, h, button_images.Edit, function (xx, yy, x, y, h, w) { _.menu_item(x, y + h, 'Edit'); });

            img = button_images.View;
            x += w;
            w = img.normal.Width;
            buttons.buttons.view = new _.button(x, y, w, h, button_images.View, function (xx, yy, x, y, h, w) { _.menu_item(x, y + h, 'View'); });

            img = button_images.Playback;
            x += w;
            w = img.normal.Width;
            buttons.buttons.playback = new _.button(x, y, w, h, button_images.Playback, function (xx, yy, x, y, h, w) { _.menu_item(x, y + h, 'Playback'); });

            img = button_images.Library;
            x += w;
            w = img.normal.Width;
            buttons.buttons.library = new _.button(x, y, w, h, button_images.Library, function (xx, yy, x, y, h, w) { _.menu_item(x, y + h, 'Library'); });

            img = button_images.Help;
            x += w;
            w = img.normal.Width;
            buttons.buttons.help = new _.button(x, y, w, h, button_images.Help, function (xx, yy, x, y, h, w) { _.menu_item(x, y + h, 'Help'); });

            left_pad = x + w;
        }
        else {
            var x = x_arg + 1;
            var y = y_arg + 1;
            var h = button_images.Menu.normal.Height;
            var w = button_images.Menu.normal.Width;

            buttons.buttons.menu = new _.button(x, y, w, h, button_images.Menu, function (xx, yy, x, y, h, w) { _.menu(x, y + h); });

            left_pad = x + w;
        }

        if (!uiHacks) {
            return;
        }

        //---> Caption buttons
        var button_count = 0;

        // Pin\Unpin switch
        ++button_count;

        // UltraMiniMode switch
        ++button_count;

        if (common_vars.minimode_state !== 'UltraMini') {// Minimode
            ++button_count;
        }

        if (UIHacks.FrameStyle) {
            // Min
            ++button_count;

            // Max
            if (common_vars.minimode_state === 'Full') {
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

        buttons.buttons.pin = new _.button(x, y, w, h, g_is_pinned ? button_images.Unpin : button_images.Pin, function () {
            fb.RunMainMenuCommand('View/Always on Top');
            g_is_pinned = g_has_modded_jscript ? fb.IsMainMenuCommandChecked('View/Always on Top') : false;
            buttons.buttons.pin.set_image(g_is_pinned ? button_images.Unpin : button_images.Pin);
            buttons.buttons.pin.tiptext = g_is_pinned ? 'Unpin window' : 'Pin window on Top';
            buttons.buttons.pin.repaint();
        }, g_is_pinned ? 'Unpin window' : 'Pin window on Top');

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

        var ultraMiniModeBtn = (common_vars.minimode_state === 'Mini' || common_vars.minimode_state === 'Full')
            ? ultraMiniModeBtnArr.MiniModeCompress
            : ((g_properties.saved_mode === 'Full')
                ? ultraMiniModeBtnArr.MiniModeExpandToFull
                : ultraMiniModeBtnArr.MiniModeExpandToMini);

        x += w + p;
        buttons.buttons.ultraminimode = new _.button(x, y, w, h, ultraMiniModeBtn.ico, _.bind(mode_handler.toggle_ultra_mini_mode, mode_handler), ultraMiniModeBtn.txt);

        if (common_vars.minimode_state !== 'UltraMini') {
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

            var miniModeBtn = (common_vars.minimode_state === 'Mini') ? miniModeBtnArr.MiniModeExpand : miniModeBtnArr.MiniModeCompress;

            x += w + p;
            buttons.buttons.minimode = new _.button(x, y, w, h, miniModeBtn.ico, _.bind(mode_handler.toggle_mini_mode, mode_handler), miniModeBtn.txt);
        }

        if (UIHacks.FrameStyle) {
            x += w + p;
            buttons.buttons.minimize = new _.button(x, y, w, h, button_images.Minimize, function () { fb.RunMainMenuCommand('View/Hide'); }, 'Minimize');

            if (common_vars.minimode_state === 'Full') {
                x += w + p;
                buttons.buttons.maximize = new _.button(x, y, w, h, button_images.Maximize, function () {
                    try {
                        if (g_maximize_to_fullscreen ? !utils.IsKeyPressed(VK_CONTROL) : utils.IsKeyPressed(VK_CONTROL)) {
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
                        fb.trace(e + ' Disable WSH safe mode');
                    }
                }, 'Maximize');
            }

            if (UIHacks.FrameStyle !== FrameStyle.SmallCaption || UIHacks.FullScreen) {
                x += w + p;
                buttons.buttons.close = new _.button(x, y, w, h, button_images.Close, function () { fb.Exit(); }, 'Close');
            }
        }
    }

    function create_button_images() {
        var fontMarlett = gdi.font('Marlett', 13, 0);
        var fontAwesome = gdi.font('FontAwesome', 12, 0);
        var fontSegoeUi = gdi.font('Segoe Ui Semibold', 12, 0);

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

        _.forEach(btn, function (item, i) {
            if (item.id === 'menu') {
                var img = gdi.CreateImage(100, 100);
                var g = img.GetGraphics();

                item.w = Math.ceil(g.MeasureString(item.ico, item.font, 0, 0, 0, 0).Width) + 17;
                img.ReleaseGraphics(g);
                img.Dispose();
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
                g.FillSolidRect(0, 0, w, h, panelsFrontColor); // Cleartype is borked, if drawn without background

                var menuTextColor = _.RGB(140, 142, 144);
                var menuRectColor = _.RGB(120, 122, 124);
                var captionIcoColor = _.RGB(140, 142, 144);

                if (s === 1) {
                    menuTextColor = _.RGB(180, 182, 184);
                    menuRectColor = _.RGB(170, 172, 174);
                    captionIcoColor = _.RGB(190, 192, 194);
                }
                else if (s === 2) {
                    menuTextColor = _.RGB(120, 122, 124);
                    menuRectColor = _.RGB(110, 112, 114);
                    captionIcoColor = _.RGB(100, 102, 104);
                }

                if (item.id === 'menu') {
                    if (s !== 0) {
                        g.DrawRect(Math.floor(lw / 2), Math.floor(lw / 2), w - lw, h - lw, 1, menuRectColor);
                    }
                    g.DrawString(item.ico, item.font, menuTextColor, 0, 0, w, h - 1, g_string_format.align_center);
                }
                else if (item.id === 'caption') {
                    g.DrawString(item.ico, item.font, captionIcoColor, 0, 0, w, h, g_string_format.align_center);
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

    function toggle_window_shadow(show_window_shadow) {
        if (!uiHacks) {
            return;
        }
        if (show_window_shadow) {
            UIHacks.Aero.Effect = 2;
            UIHacks.Aero.Top = 1;
        }
        else {
            UIHacks.Aero.Effect = 0;
            UIHacks.Aero.Left = UIHacks.Aero.Top = UIHacks.Aero.Right = UIHacks.Aero.Bottom = 0;
        }
    }

    // public:
    var pad = 4;
    this.x = pad;
    this.y = pad;
    this.w = 0;
    this.h = 0;

    // private:

    // Mouse state
    var mouse_down = false;

    // Objects
    var mode_handler = new WindowModeHandler();
    var cpu_usage_tracker = new CpuUsageTracker(_.bind(this.repaint, this));
    var buttons = undefined;
    var button_images = [];

    var pseudo_caption_enabled;
    var pseudo_caption_w;

    var left_pad = 0;
    var right_pad = 0;

    var has_notified = false;

    initialize();
}

function WindowModeHandler() {

    this.toggle_ultra_mini_mode = function () {
        if (common_vars.minimode_state !== 'UltraMini') {
            g_properties.saved_mode = common_vars.minimode_state;
        }
        var new_minimode_state = (common_vars.minimode_state !== 'UltraMini') ? 'UltraMini' : g_properties.saved_mode;

        if (new_minimode_state === 'Mini') {
            pss_switch.set_state('minimode', new_minimode_state);

            set_window_size(g_properties.mini_mode_saved_width, g_properties.mini_mode_saved_height);

            UIHacks.MinSize = true;
            UIHacks.MinSize.Width = 300;
            UIHacks.MinSize.Height = 250;
        }
        else if (new_minimode_state === 'Full') {
            pss_switch.set_state('minimode', new_minimode_state);

            set_window_size(g_properties.full_mode_saved_width, g_properties.full_mode_saved_height);

            UIHacks.MinSize = true;
            UIHacks.MinSize.Width = 650;
            UIHacks.MinSize.Height = 600;
        }
        else {
            if (!UIHacks.FullScreen) {
                if (common_vars.minimode_state === 'Full') {
                    if (g_has_modded_jscript) {
                        g_properties.full_mode_saved_width = fb_handle.Width;
                        g_properties.full_mode_saved_height = fb_handle.Height;
                    }
                }
                else {
                    if (g_has_modded_jscript) {
                        g_properties.mini_mode_saved_width = fb_handle.Width;
                        g_properties.mini_mode_saved_height = fb_handle.Height;
                    }
                }
            }
            else {
                UIHacks.FullScreen = false;
            }

            pss_switch.set_state('minimode', new_minimode_state);

            set_window_size(250, 250 + 28);

            UIHacks.MinSize = true;
            UIHacks.MinSize.Width = 200;
            UIHacks.MinSize.Height = 200 + 28;
        }
    };

    this.toggle_mini_mode = function () {
        var new_minimode_state = ((common_vars.minimode_state === 'Mini') ? 'Full' : 'Mini');

        if (new_minimode_state === 'Mini') {
            if (!UIHacks.FullScreen) {
                if (g_has_modded_jscript) {
                    g_properties.full_mode_saved_width = fb_handle.Width;
                    g_properties.full_mode_saved_height = fb_handle.Height;
                }
            }
            else {
                UIHacks.FullScreen = false;
            }

            pss_switch.set_state('minimode', new_minimode_state);

            set_window_size(g_properties.mini_mode_saved_width, g_properties.mini_mode_saved_height);

            UIHacks.MinSize = true;
            UIHacks.MinSize.Width = 300;
            UIHacks.MinSize.Height = 250;
        }
        else {
            if (!UIHacks.FullScreen) {
                if (g_has_modded_jscript) {
                    g_properties.mini_mode_saved_width = fb_handle.Width;
                    g_properties.mini_mode_saved_height = fb_handle.Height;
                }
            }
            else {
                UIHacks.FullScreen = false;
            }

            pss_switch.set_state('minimode', new_minimode_state);

            set_window_size(g_properties.full_mode_saved_width, g_properties.full_mode_saved_height);

            UIHacks.MinSize = true;
            UIHacks.MinSize.Width = 650;
            UIHacks.MinSize.Height = 600;
        }
    };

    this.set_window_size_limits_for_mode = function (miniMode) {
        var minW = 0,
            maxW = 0,
            minH = 0,
            maxH = 0;
        if (miniMode === 'UltraMini') {
            minW = 200;
            minH = 200 + 28;
        }
        else if (miniMode === 'Mini') {
            minW = 300;
            minH = 250;
        }
        else {
            minW = 650;
            minH = 600;
        }

        set_window_size_limits(minW, maxW, minH, maxH);
    };

    function set_window_size (width, height) {
        //To avoid resizing bugs, when the window is bigger\smaller than the saved one.
        UIHacks.MinSize = false;
        UIHacks.MaxSize = false;
        UIHacks.MinSize.Width = width;
        UIHacks.MinSize.Height = height;
        UIHacks.MaxSize.Width = width;
        UIHacks.MaxSize.Height = height;

        UIHacks.MaxSize = true;
        UIHacks.MaxSize = false;
        UIHacks.MinSize = true;
        UIHacks.MinSize = false;

        window.NotifyOthers('minimode_state_size', common_vars.minimode_state);
    }

    function set_window_size_limits(minW, maxW, minH, maxH) {

        UIHacks.MinSize = !!minW;
        UIHacks.MinSize.Width = minW;

        UIHacks.MaxSize = !!maxW;
        UIHacks.MaxSize.Width = maxW;

        UIHacks.MinSize = !!minH;
        UIHacks.MinSize.Height = minH;

        UIHacks.MaxSize = !!maxH;
        UIHacks.MaxSize.Height = maxH;
    }

    var fb_handle = g_has_modded_jscript ? wsh_utils.GetWndByHandle(window.ID).GetAncestor(2) : undefined;
}

function CpuUsageTracker(on_change_callback_arg) {
    this.start = function () {
        start_cpu_usage_timer();
    };

    this.stop = function () {
        stop_cpu_usage_timer();
    };

    this.get_cpu_usage = function () {
        return cpu_usage;
    };

    this.get_gui_cpu_usage = function () {
        return gui_cpu_usage;
    };

    function start_cpu_usage_timer() {
        if (_.isNil(cpu_usage_timer)) {
            cpu_usage_timer = setInterval(function () {

                var floatUsage = UIHacks.FoobarCPUUsage;

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
                usageDiff = (usageDiff <= 0.5 ? 0 : usageDiff ); // Supress low spikes
                gui_cpu_usage = usageDiff.toFixed(1);

                on_change_callback();
            }, 1000);
        }
    }

    function stop_cpu_usage_timer() {
        if (!_.isNil(cpu_usage_timer)) {
            clearInterval(cpu_usage_timer);
            cpu_usage_timer = undefined;
        }
        idle_usage.reset();
        playing_usage.reset();
    }

    var cpu_usage = 0;
    var gui_cpu_usage = 0;
    var cpu_usage_timer = undefined;
    var idle_usage = new AverageUsageFunc();
    var playing_usage = new AverageUsageFunc();

    var on_change_callback = on_change_callback_arg;
}

function AverageUsageFunc() {
    this.update = function (current_usage) {
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

    this.reset = function () {
        current_sample_count = 0;
        reset_sample_count = 0;
        acum_usage = 0;
        this.average_usage = 0;
    };

    function recalculate_average(current_usage) {
        if (current_sample_count < sampleCount) {
            acum_usage += current_usage;
            ++current_sample_count;

            that.average_usage = acum_usage / current_sample_count;
        }
        else {
            that.average_usage -= that.average_usage / sampleCount;
            that.average_usage += current_usage / sampleCount;
        }
    }

    this.average_usage = 0;

    var that = this;

    var sampleCount = 30;
    var current_sample_count = 0;
    var reset_sample_count = 0;
    var acum_usage = 0;
}
