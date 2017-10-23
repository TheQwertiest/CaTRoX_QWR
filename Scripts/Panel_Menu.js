// ==PREPROCESSOR==
// @name "Menu Panel"
// @author "TheQwertiest"
// ==/PREPROCESSOR==

(function checkES5Availability() {
    var test = !!Date.now && !!Array.isArray && !!Array.prototype.forEach;
    if (!test) {
        fb.ShowPopupMessage("Error: ES5 is not supported by your system! Cannot use this theme!", "CaTRoX (QWR Edition)");
    }
})();

(function checkModdedJScriptAvailability() {
    if ( common_vars.incompatibility_state == "Notified" )
        return;

    if ( !qwr_utils.HasModdedJScript() )
        fb.ShowPopupMessage("Warning: Vanilla JScript component detected!\nThis theme relies on modded JScript component, so some features will be unavailable!\n\nSources for modded JScript are available at https://github.com/TheQwertiest/foo-jscript-panel\n\nTo hide this warning rename file INCOMPATIBILITY_0 to INCOMPATIBILITY_1 in \\themes\\CaTRoX\\Settings\\", "CaTRoX (QWR Edition)");
})();

qwr_utils.check_fonts(["Segoe Ui", "Segoe Ui Semibold", "Segoe Ui Symbol", "Consolas", "Marlett", "Guifx v2 Transports", "FontAwesome"]);

properties.AddProperties(
    {
        maximizeToFullScreen: window.GetProperty("user.Maximize To FullScreen", true),
        frameFocusShadow:     window.GetProperty("user.Frame Focus Shadow", false),
        showFoobarVersion:    window.GetProperty("user.Show Foobar Version", false),
        showThemeVersion:     window.GetProperty("user.Show Theme Version", false),
        showCpuUsage:         window.GetProperty("user.Show CPU Usage", false),
        showTooltips:         window.GetProperty("user.Show Button Tooltips", true),
        saved_mode:           window.GetProperty("system.Saved player mode", "Full"),
        fullMode_savedwidth:  window.GetProperty("system.Full mode saved width", 895),
        fullMode_savedheight: window.GetProperty("system.Full mode saved height", 650),
        miniMode_savedwidth:  window.GetProperty("system.Mini mode saved width", 250),
        miniMode_savedheight: window.GetProperty("system.Mini mode saved height", 600)
    }
);

var hasModdedJScript = qwr_utils.HasModdedJScript();
var maximizeToFullScreen = properties.maximizeToFullScreen;
var isPinned = hasModdedJScript ? fb.IsMainMenuCommandChecked("View/Always on Top") : false;

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

// Internal vars
var isMenuInitialized = true;
var buttons;
var pseudoCaption;
var pseudoCaptionWidth;
var isMousePressed = false;
var leftMargin = 0;
var rightMargin = 0;
var cpuUsage = 0;
var guiCpuUsage = 0;

/// Reduce move
var moveChecker = new _.moveCheckReducer;

var FbWnd = hasModdedJScript ? wsh_utils.GetWndByHandle(window.ID).GetAncestor(2) : undefined;

createButtonImages();

function on_paint(gr) {
    if (isMenuInitialized) {
        window.NotifyOthers("showTooltips", properties.showTooltips);
        window.NotifyOthers("minimode_state", common_vars.minimode_state);

        if (properties.showCpuUsage) {
            startCpuUsageTimer();
        }

        isMenuInitialized = false;
    }
    gr.FillSolidRect(0, 0, ww, wh, panelsFrontColor);

    gr.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);

    properties.frameFocusShadow && gr.DrawLine(0, 0, ww, 0, 1, panelsFrontColor);

    if (properties.showFoobarVersion || properties.showThemeVersion || properties.showCpuUsage) {
        var versionX = leftMargin;
        var versionW = rightMargin - leftMargin;

        var cpuUsageString;
        if (common_vars.minimode_state != "Full") {
            cpuUsageString = cpuUsage + "% (" + guiCpuUsage + "%)";
        }
        else {
            cpuUsageString = "CPU: " + cpuUsage + "% (GUI: " + guiCpuUsage + "%)";
        }

        var themeString = themeName + (themeVersion == "" ? "" : " " + themeVersion);
        var foobarString = fb.TitleFormat("%_foobar2000_version%").eval(true);
        var separatorString = "  \u25AA  ";
        var titleString = "";

        if (properties.showCpuUsage) {
            titleString = cpuUsageString;
        }

        if (properties.showThemeVersion) {
            if (titleString != "") {
                titleString += separatorString;
            }
            titleString += themeString;
        }

        if (properties.showFoobarVersion) {
            if (titleString != "") {
                titleString += separatorString;
            }
            titleString += foobarString;
        }

        gr.DrawString(titleString, gdi.font("Segoe Ui Semibold", 11, 0), _.RGBA(240, 242, 244, 120), versionX, -1, versionW, wh, StringFormat(1, 1, 3, 4096));
    }

    buttons.paint(gr);
}

function on_size() {
    ww = window.Width;
    wh = window.Height;

    createButtonObjects(ww, wh);

    if (!uiHacks) {
        return;
    }

    // needed when doble clicking on caption and UIHacks.FullScreen == true;
    if (!utils.IsKeyPressed(VK_CONTROL) && UIHacks.FullScreen && UIHacks.MainWindowState == 0) {
        UIHacks.MainWindowState = 0;
    }
}

function on_mouse_move(x, y, m) {
    if (moveChecker.isSameMove(x, y, m)) {
        return;
    }

    var btn = buttons.move(x, y);
    if (!btn) {
        if (!uiHacks) {
            return;
        }

        if (isMousePressed) {
            UIHacks.SetPseudoCaption(0, 0, 0, 0);
            if (UIHacks.FrameStyle == 3) {
                UIHacks.DisableSizing = true;
            }
            pseudoCaption = false;
        }
        else if (!pseudoCaption || pseudoCaptionWidth != ww) {
            UIHacks.SetPseudoCaption(leftMargin, 8, rightMargin - leftMargin, wh - 8);
            if (UIHacks.FrameStyle == 3) {
                UIHacks.DisableSizing = false;
            }
            pseudoCaption = true;
            pseudoCaptionWidth = ww;
        }
    }
}

function on_mouse_lbtn_down(x, y, m) {
    isMousePressed = true;
    buttons.lbtn_down(x, y);
}

function on_mouse_lbtn_dblclk(x, y, m) {
    on_mouse_lbtn_down(x, y, m);
    pseudoCaption = false;
}

function on_mouse_lbtn_up(x, y, m) {
    qwr_utils.EnableSizing(m);

    isMousePressed = false;
    buttons.lbtn_up(x, y);
}

function on_mouse_leave() {
    buttons.leave();
}

function on_mouse_wheel(delta) {
    if (delta > 0) {
        fb.VolumeUp();
    }
    else {
        fb.VolumeDown();
    }
}

function createButtonObjects(ww, wh) {
    if (buttons) {
        buttons.reset();
    }
    buttons = new _.buttons();
    buttons.show_tt = properties.showTooltips;

    //---> Menu buttons
    if (common_vars.minimode_state == "Full") {
        var img = btnImg.File;
        var x = 1;
        var y = 1;
        var h = img.normal.Height;
        var w = img.normal.Width;
        buttons.buttons.file = new _.button(x, y, w, h, btnImg.File, function (xx, yy, x, y, h, w) { _.menu_item(x, y + h, "File"); });

        img = btnImg.Edit;
        x += w;
        w = img.normal.Width;
        buttons.buttons.edit = new _.button(x, y, w, h, btnImg.Edit, function (xx, yy, x, y, h, w) { _.menu_item(x, y + h, "Edit"); });

        img = btnImg.View;
        x += w;
        w = img.normal.Width;
        buttons.buttons.view = new _.button(x, y, w, h, btnImg.View, function (xx, yy, x, y, h, w) { _.menu_item(x, y + h, "View"); });

        img = btnImg.Playback;
        x += w;
        w = img.normal.Width;
        buttons.buttons.playback = new _.button(x, y, w, h, btnImg.Playback, function (xx, yy, x, y, h, w) { _.menu_item(x, y + h, "Playback"); });

        img = btnImg.Library;
        x += w;
        w = img.normal.Width;
        buttons.buttons.library = new _.button(x, y, w, h, btnImg.Library, function (xx, yy, x, y, h, w) { _.menu_item(x, y + h, "Library"); });

        img = btnImg.Help;
        x += w;
        w = img.normal.Width;
        buttons.buttons.help = new _.button(x, y, w, h, btnImg.Help, function (xx, yy, x, y, h, w) { _.menu_item(x, y + h, "Help"); });

        leftMargin = x + w;
    }
    else {
        var x = 1;
        var y = 1;
        var h = btnImg.Menu.normal.Height;
        var w = btnImg.Menu.normal.Width;

        buttons.buttons.menu = new _.button(x, y, w, h, btnImg.Menu, function (xx, yy, x, y, h, w) { _.menu(x, y + h); });

        leftMargin = x + w;
    }


    if (!uiHacks) {
        return;
    }

    //---> Caption buttons
    var buttonCount = 0;

    // Pin\Unpin switch
    buttonCount++;

    // UltraMiniMode switch
    buttonCount++;

    if (common_vars.minimode_state != "UltraMini") {// Minimode
        buttonCount++;
    }

    if (UIHacks.FrameStyle) {
        // Min
        buttonCount++;

        // Max
        if (common_vars.minimode_state == "Full") {
            buttonCount++;
        }

        (UIHacks.FrameStyle == FrameStyle.SmallCaption && UIHacks.FullScreen != true) ? hideClose = true : hideClose = false;
        if (!hideClose) {
            buttonCount++;
        }
    }

    var y = 1;
    var w = 22;
    var h = w;
    var p = 3;
    var x = ww - w * buttonCount - p * (buttonCount - 1) - 4;

    rightMargin = x;

    buttons.buttons.pin = new _.button(x, y, w, h, isPinned ? btnImg.Unpin : btnImg.Pin, function () {
        fb.RunMainMenuCommand("View/Always on Top");
        isPinned = !isPinned;
        buttons.buttons.pin.set_image(isPinned ? btnImg.Unpin : btnImg.Pin);
        buttons.buttons.pin.tiptext = isPinned ? "Unpin window" : "Pin window on Top";
        buttons.buttons.pin.repaint();
    }, isPinned ? "Unpin window" : "Pin window on Top");

    var ultraMiniModeBtnArr =
        {
            MiniModeExpandToMini: {
                ico: btnImg.MiniModeExpand,
                txt: "Change to playlist mode"
            },
            MiniModeExpandToFull: {
                ico: btnImg.MiniModeExpand,
                txt: "Change to full mode"
            },
            MiniModeCompress:     {
                ico: btnImg.UltraMiniModeCompress,
                txt: "Change to art mode"
            }
        };

    ultraMiniModeBtn = (common_vars.minimode_state == "Mini" || common_vars.minimode_state == "Full") ? ultraMiniModeBtnArr.MiniModeCompress :
        ((properties.saved_mode == "Full") ? ultraMiniModeBtnArr.MiniModeExpandToFull : ultraMiniModeBtnArr.MiniModeExpandToMini);

    x += w + p;
    buttons.buttons.ultraminimode = new _.button(x, y, w, h, ultraMiniModeBtn.ico, toggleUltraMiniMode, ultraMiniModeBtn.txt);

    if (common_vars.minimode_state != "UltraMini") {
        var miniModeBtnArr =
            {
                MiniModeExpand:   {
                    ico: btnImg.MiniModeExpand,
                    txt: "Change to full mode"
                },
                MiniModeCompress: {
                    ico: btnImg.MiniModeCompress,
                    txt: "Change to playlist mode"
                }
            };

        miniModeBtn = (common_vars.minimode_state == "Mini") ? miniModeBtnArr.MiniModeExpand : miniModeBtnArr.MiniModeCompress;

        x += w + p;
        buttons.buttons.minimode = new _.button(x, y, w, h, miniModeBtn.ico, toggleMiniMode, miniModeBtn.txt);
    }

    if (UIHacks.FrameStyle) {
        x += w + p;
        buttons.buttons.minimize = new _.button(x, y, w, h, btnImg.Minimize, function () { fb.RunMainMenuCommand("View/Hide"); }, "Minimize");

        if (common_vars.minimode_state == "Full") {
            x += w + p;
            buttons.buttons.maximize = new _.button(x, y, w, h, btnImg.Maximize, function () {
                try {
                    if (maximizeToFullScreen ? !utils.IsKeyPressed(VK_CONTROL) : utils.IsKeyPressed(VK_CONTROL)) {
                        UIHacks.FullScreen = !UIHacks.FullScreen;
                    }
                    else if (UIHacks.MainWindowState == WindowState.Maximized) {
                        UIHacks.MainWindowState = WindowState.Normal;
                    }
                    else {
                        UIHacks.MainWindowState = WindowState.Maximized;
                    }
                }
                catch (e) {
                    fb.trace(e + " Disable WSH safe mode");
                }
            }, "Maximize");
        }

        if (!hideClose) {
            x += w + p;
            buttons.buttons.close = new _.button(x, y, w, h, btnImg.Close, function () { fb.Exit(); }, "Close");
        }
    }
}

function on_mouse_rbtn_up(x, y) {
    var cpm = window.CreatePopupMenu();
    var frame = window.CreatePopupMenu();

    if (uiHacks) {
        frame.AppendMenuItem(MF_STRING, 1, "Default");
        frame.AppendMenuItem(MF_STRING, 2, "Small caption");
        frame.AppendMenuItem(MF_STRING, 3, "No caption");
        frame.AppendMenuItem(MF_STRING, 4, "No border");
        frame.CheckMenuRadioItem(1, 4, UIHacks.FrameStyle + 1);
        if (UIHacks.FrameStyle == FrameStyle.NoBorder && UIHacks.Aero.Active) {
            frame.AppendMenuItem(MF_STRING, 5, "Frame focus shadow");
            frame.CheckMenuItem(5, (UIHacks.Aero.Left + UIHacks.Aero.Top + UIHacks.Aero.Right + UIHacks.Aero.Bottom));
        }
        frame.AppendTo(cpm, MF_STRING, "Frame style");

        if (UIHacks.FrameStyle > 0) {
            cpm.AppendMenuSeparator();
            cpm.AppendMenuItem(MF_STRING, 6, "Maximize button -> to fullscreen");
        }
        cpm.CheckMenuItem(6, properties.maximizeToFullScreen);
        cpm.AppendMenuSeparator();
    }

    cpm.AppendMenuItem(MF_STRING, 7, "Show foobar version");
    cpm.CheckMenuItem(7, properties.showFoobarVersion);

    cpm.AppendMenuItem(MF_STRING, 8, "Show theme version");
    cpm.CheckMenuItem(8, properties.showThemeVersion);

    cpm.AppendMenuItem(MF_STRING, 9, "Show button tooltips");
    cpm.CheckMenuItem(9, properties.showTooltips);

    if (utils.CheckComponent("foo_ui_hacks") && safeMode) {
        cpm.AppendMenuItem(MF_STRING, 102, "Frame styles not available (disable WSH safe mode)");
    }

    if (utils.IsKeyPressed(VK_SHIFT)) {
        cpm.AppendMenuSeparator();
        cpm.AppendMenuItem(MF_STRING, 99, "Show CPU usage");
        cpm.CheckMenuItem(99, properties.showCpuUsage);
        _.appendDefaultContextMenu(cpm);
    }

    var id = cpm.TrackPopupMenu(x, y);

    switch (id) {
        case 1:
            UIHacks.FrameStyle = FrameStyle.Default;
            UIHacks.MoveStyle = MoveStyle.Default;
            UIHacks.Aero.Effect = 0;
            on_size();
            break;
        case 2:
            UIHacks.FrameStyle = FrameStyle.SmallCaption;
            UIHacks.MoveStyle = MoveStyle.Default;
            UIHacks.Aero.Effect = 0;
            on_size();
            break;
        case 3:
            UIHacks.FrameStyle = FrameStyle.NoCaption;
            UIHacks.MoveStyle = MoveStyle.Both;
            UIHacks.Aero.Effect = 0;
            on_size();
            break;
        case 4:
            UIHacks.FrameStyle = FrameStyle.NoBorder;
            UIHacks.MoveStyle = MoveStyle.Both;
            UIHacks.Aero.Effect = 2;
            on_size();
            break;
        case 5:
            properties.frameFocusShadow = !properties.frameFocusShadow;
            frameShadowSwitch(properties.frameFocusShadow);
            window.SetProperty("user.Frame Focus Shadow", properties.frameFocusShadow);
            break;
        case 6:
            properties.maximizeToFullScreen = !properties.maximizeToFullScreen;
            window.SetProperty("user.Maximize To FullScreen", properties.maximizeToFullScreen);
            break;
        case 7:
            properties.showFoobarVersion = !properties.showFoobarVersion;
            window.SetProperty("user.Show Foobar Version", properties.showFoobarVersion);
            window.Repaint();
            break;
        case 8:
            properties.showThemeVersion = !properties.showThemeVersion;
            window.SetProperty("user.Show Theme Version", properties.showThemeVersion);
            window.Repaint();
            break;
        case 9:
            properties.showTooltips = !properties.showTooltips;
            buttons.show_tt = properties.showTooltips;
            window.SetProperty("user.Show Button Tooltips", properties.showTooltips);
            window.NotifyOthers("showTooltips", properties.showTooltips);
            break;
        case 99:
            properties.showCpuUsage = !properties.showCpuUsage;
            window.SetProperty("user.Show CPU Usage", properties.showCpuUsage);

            if (properties.showCpuUsage) {
                startCpuUsageTimer();
            }
            else {
                stopCpuUsageTimer();
            }
            window.Repaint();
            break;
        default:
            _.executeDefaultContextMenu(id, scriptFolder + "Panel_Menu.js");
    }

    _.dispose(frame, cpm);

    return true;
}

function on_notify_data(name, info) {
    if (name == "minimode_state") {
        common_vars.minimode_state = info;
        window.Repaint();
    }
}

function createButtonImages() {
    var fontMarlett = gdi.font("Marlett", 13, 0);
    var fontAwesome = gdi.font("FontAwesome", 12, 0);
    var fontSegoeUi = gdi.font("Segoe Ui Semibold", 12, 0);

    var btn =
        {
            Pin:                   {
                ico:  "\uF08D",
                font: fontAwesome,
                id:   "caption",
                w:    22,
                h:    22,
            },
            Unpin:                 {
                ico:  "\uF08D",
                font: fontAwesome,
                id:   "caption",
                w:    22,
                h:    22,
            },
            MiniModeExpand:        {
                ico:  "\uF065",
                font: fontAwesome,
                id:   "caption",
                w:    22,
                h:    22,
            },
            MiniModeCompress:      {
                ico:  "\uF066",
                font: fontAwesome,
                id:   "caption",
                w:    22,
                h:    22,
            },
            UltraMiniModeCompress: {
                ico:  "\uF1AA",
                font: fontAwesome,
                id:   "caption",
                w:    22,
                h:    22,
            },
            Minimize:              {
                ico:  "0",
                font: fontMarlett,
                id:   "caption",
                w:    22,
                h:    22
            },
            Maximize:              {
                ico:  "1",
                font: fontMarlett,
                id:   "caption",
                w:    22,
                h:    22
            },
            Close:                 {
                ico:  "r",
                font: fontMarlett,
                id:   "caption",
                w:    22,
                h:    22
            },
            Menu:                  {
                ico:  "Menu",
                font: fontSegoeUi,
                id:   "menu",
            },
            File:                  {
                ico:  "File",
                font: fontSegoeUi,
                id:   "menu"
            },
            Edit:                  {
                ico:  "Edit",
                font: fontSegoeUi,
                id:   "menu"
            },
            View:                  {
                ico:  "View",
                font: fontSegoeUi,
                id:   "menu"
            },
            Playback:              {
                ico:  "Playback",
                font: fontSegoeUi,
                id:   "menu"
            },
            Library:               {
                ico:  "Library",
                font: fontSegoeUi,
                id:   "menu"
            },
            Help:                  {
                ico:  "Help",
                font: fontSegoeUi,
                id:   "menu"
            },
            Playlists:             {
                ico:  "Playlists",
                font: fontSegoeUi,
                id:   "menu"
            }
        };

    btnImg = [];

    _.forEach(btn, function (item, i) {
        if (item.id == "menu") {
            var img = gdi.CreateImage(100, 100);
            g = img.GetGraphics();

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
            g = img.GetGraphics();
            g.SetSmoothingMode(SmoothingMode.HighQuality);
            g.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit)
            g.FillSolidRect(0, 0, w, h, panelsFrontColor); // Cleartype is borked, if drawn without background

            var menuTextColor = _.RGB(140, 142, 144);
            var menuRectColor = _.RGB(120, 122, 124);
            var captionIcoColor = _.RGB(140, 142, 144);

            if (s == 1) {
                menuTextColor = _.RGB(180, 182, 184);
                menuRectColor = _.RGB(170, 172, 174);
                captionIcoColor = _.RGB(190, 192, 194);
            }
            else if (s == 2) {
                menuTextColor = _.RGB(120, 122, 124);
                menuRectColor = _.RGB(110, 112, 114);
                captionIcoColor = _.RGB(100, 102, 104);
            }

            if (item.id == "menu") {
                if (s != 0) {
                    g.DrawRect(Math.floor(lw / 2), Math.floor(lw / 2), w - lw, h - lw, 1, menuRectColor);
                }
                g.DrawString(item.ico, item.font, menuTextColor, 0, 0, w, h - 1, StringFormat(1, 1));
            }
            else if (item.id == "caption") {
                g.DrawString(item.ico, item.font, captionIcoColor, 0, 0, w, h, StringFormat(1, 1));
            }

            if (i == "Unpin") {
                img.ReleaseGraphics(g);
                var savedImg = img;

                img = gdi.CreateImage(savedImg.height, savedImg.width);
                g = img.GetGraphics();
                g.SetSmoothingMode(SmoothingMode.HighQuality);
                g.DrawImage(savedImg, -2, 0, savedImg.width, savedImg.height, 0, 0, savedImg.height, savedImg.width, 90, 255);
            }

            img.ReleaseGraphics(g);
            stateImages[s] = img;
        }

        btnImg[i] =
            {
                normal:  stateImages[0],
                hover:   stateImages[1],
                pressed: stateImages[2]
            };
    });
}

function toggleMiniMode() {
    var new_minimode_state = ((common_vars.minimode_state == "Mini") ? "Full" : "Mini");

    if (new_minimode_state == "Mini") {
        if (!UIHacks.FullScreen) {
            if ( hasModdedJScript ) {
                properties.fullMode_savedwidth = FbWnd.Width;
                properties.fullMode_savedheight = FbWnd.Height;
            }
            window.SetProperty("system.Full mode saved width", properties.fullMode_savedwidth);
            window.SetProperty("system.Full mode saved height", properties.fullMode_savedheight);
        }
        else {
            UIHacks.FullScreen = false;
        }

        pss_switch.set_state("minimode", new_minimode_state);

        changeWindowsSize(properties.miniMode_savedwidth, properties.miniMode_savedheight);

        UIHacks.MinSize = true;
        UIHacks.MinSize.Width = 300;
        UIHacks.MinSize.Height = 250;
    }
    else {
        if (!UIHacks.FullScreen) {
            if ( hasModdedJScript ) {
                properties.miniMode_savedwidth = FbWnd.Width;
                properties.miniMode_savedheight = FbWnd.Height;
            }
            window.SetProperty("system.Mini mode saved width", properties.miniMode_savedwidth);
            window.SetProperty("system.Mini mode saved height", properties.miniMode_savedheight);
        }
        else {
            UIHacks.FullScreen = false;
        }

        pss_switch.set_state("minimode", new_minimode_state);

        changeWindowsSize(properties.fullMode_savedwidth, properties.fullMode_savedheight);

        UIHacks.MinSize = true;
        UIHacks.MinSize.Width = 650;
        UIHacks.MinSize.Height = 600;
    }
}

function toggleUltraMiniMode() {
    if (common_vars.minimode_state != "UltraMini") {
        properties.saved_mode = common_vars.minimode_state;
        window.SetProperty("system.Saved player mode", properties.saved_mode);
    }
    var new_minimode_state = (common_vars.minimode_state != "UltraMini") ? "UltraMini" : properties.saved_mode;

    if (new_minimode_state == "Mini") {
        pss_switch.set_state("minimode", new_minimode_state);

        changeWindowsSize(properties.miniMode_savedwidth, properties.miniMode_savedheight);

        UIHacks.MinSize = true;
        UIHacks.MinSize.Width = 300;
        UIHacks.MinSize.Height = 250;
    }
    else if (new_minimode_state == "Full") {
        pss_switch.set_state("minimode", new_minimode_state);

        changeWindowsSize(properties.fullMode_savedwidth, properties.fullMode_savedheight);

        UIHacks.MinSize = true;
        UIHacks.MinSize.Width = 650;
        UIHacks.MinSize.Height = 600;
    }
    else {
        if (!UIHacks.FullScreen) {
            if (common_vars.minimode_state == "Full") {
                if ( hasModdedJScript ) {
                    properties.fullMode_savedwidth = FbWnd.Width;
                    properties.fullMode_savedheight = FbWnd.Height;
                }
                window.SetProperty("system.Full mode saved width", properties.fullMode_savedwidth);
                window.SetProperty("system.Full mode saved height", properties.fullMode_savedheight);
            }
            else {
                if ( hasModdedJScript ) {
                    properties.miniMode_savedwidth = FbWnd.Width;
                    properties.miniMode_savedheight = FbWnd.Height;
                }
                window.SetProperty("system.Mini mode saved width", properties.miniMode_savedwidth);
                window.SetProperty("system.Mini mode saved height", properties.miniMode_savedheight);
            }
        }
        else {
            UIHacks.FullScreen = false;
        }

        pss_switch.set_state("minimode", new_minimode_state);

        changeWindowsSize(250, 250 + 28);

        UIHacks.MinSize = true;
        UIHacks.MinSize.Width = 200;
        UIHacks.MinSize.Height = 200 + 28;
    }
}

function average_usage_func() {
    this.update = function (currentUsage) {
        if (this.currentSampleCount) {
            if (this.averageUsage - currentUsage > 2) {
                if (this.resetSampleCount < 3) {
                    this.resetSampleCount++;
                }
                else {
                    this.reset();
                }
            }
            else if (Math.abs(currentUsage - this.averageUsage) < 2) // Suppress high spikes
            {
                this.recalculate_average(currentUsage);
            }
        }
        else {
            this.recalculate_average(currentUsage);
        }
    };

    this.reset = function () {
        this.currentSampleCount = 0;
        this.resetSampleCount = 0;
        this.acumUsage = 0;
        this.averageUsage = 0;
    };

    this.recalculate_average = function (currentUsage) {
        if (this.currentSampleCount < this.sampleCount) {
            this.acumUsage += currentUsage;
            this.currentSampleCount++;

            this.averageUsage = this.acumUsage / this.currentSampleCount;
        }
        else {
            this.averageUsage -= this.averageUsage / this.sampleCount;
            this.averageUsage += currentUsage / this.sampleCount;
        }
    };

    this.sampleCount = 30;
    this.currentSampleCount = 0;
    this.resetSampleCount = 0;
    this.acumUsage = 0;
    this.averageUsage = 0;
}
var idleUsage = new average_usage_func();
var playingUsage = new average_usage_func();

var cpuTimerStarted = false;
function startCpuUsageTimer() {
    if (!cpuTimerStarted) {
        cpuUsageTimer = window.SetInterval(function () {

            var floatUsage = UIHacks.FoobarCPUUsage;

            var baseLine;

            if (fb.isPlaying && !fb.isPaused) {
                playingUsage.update(floatUsage);
                baseLine = playingUsage.averageUsage;
            }
            else {
                idleUsage.update(floatUsage);
                baseLine = idleUsage.averageUsage;
            }

            cpuUsage = floatUsage.toFixed(1);

            var usageDiff = Math.max((floatUsage - baseLine), 0);
            usageDiff = (usageDiff <= 0.5 ? 0 : usageDiff ); // Supress low spikes
            guiCpuUsage = usageDiff.toFixed(1);

            window.Repaint();
        }, 1000);

        cpuTimerStarted = true;
    }
}

function stopCpuUsageTimer() {
    if (cpuTimerStarted) {
        window.ClearInterval(cpuUsageTimer);
    }
    idleUsage.reset();
    playingUsage.reset();
}

function changeWindowsSize(width, height) {
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

    window.NotifyOthers("minimode_state_size", common_vars.minimode_state);
}

function setWindowSizeLimitsForMode(miniMode) {
    var minW = 0,
        maxW = 0,
        minH = 0,
        maxH = 0;
    if (miniMode == "UltraMini") {
        minW = 200;
        minH = 200 + 28;
    }
    else if (miniMode == "Mini") {
        minW = 300;
        minH = 250;
    }
    else {
        minW = 650;
        minH = 600;
    }
    setWindowSizeLimits(minW, maxW, minH, maxH);
}

function setWindowSizeLimits(minW, maxW, minH, maxH) {

    UIHacks.MinSize = !!minW;
    UIHacks.MinSize.Width = minW;

    UIHacks.MaxSize = !!maxW;
    UIHacks.MaxSize.Width = maxW;

    UIHacks.MinSize = !!minH;
    UIHacks.MinSize.Height = minH;

    UIHacks.MaxSize = !!maxH;
    UIHacks.MaxSize.Height = maxH;

}

(function frameShadowSwitch(frameFocusShadow) {
    if (!uiHacks) {
        return;
    }
    if (frameFocusShadow) {
        UIHacks.Aero.Effect = 2;
        UIHacks.Aero.Top = 1;
    }
    else {
        UIHacks.Aero.Effect = 0;
        UIHacks.Aero.Left = UIHacks.Aero.Top = UIHacks.Aero.Right = UIHacks.Aero.Bottom = 0;
    }
})(properties.frameFocusShadow);

// Workaround bug, when always on top is not working on startup, even if set
(function alwaysOnTopToggleFix() {
    if (isPinned) {
        fb.RunMainMenuCommand("View/Always on Top");
        fb.RunMainMenuCommand("View/Always on Top");
    }
})();

// Workaround for messed up settings file or properties
setWindowSizeLimitsForMode(common_vars.minimode_state);