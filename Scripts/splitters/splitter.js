// ==PREPROCESSOR==
// @name "WSH Splitter"
// @version "1.2"
// @author "Jensen"
// This panel based on foo_uie_wsh_panel_plus.
// ==/PREPROCESSOR==

// Used in window.SetCursor()
var IDC_ARROW = 32512;
var IDC_SIZEWE = 32644;
var IDC_SIZENS = 32645;

var PanelClassNames = {
    PSS: "PSSWindowContainer",
    JSP: "uie_jscript_panel_class",
    CSP: "#32770",
    //WSHMP:"uie_wsh_panel_mod_plus_class",
    //WSHM: "uie_wsh_panel_mod_class",
    //WSHSP:"uie_wsh_panel_sp_class",
    //ELPL: "ELPlaylistWindowContainer",
    //PLS: "NGLV",
    //AL: "SysTreeView32",
    BIO: "BioWindowContainer",
    ESL: "uie_eslyric_wnd_class",
    //LYR3: "FOO_UIE_LYRICS3" //ended here!!!
    LIB: "LibraryTreeWindowContainer",
    //ESP: "ELPlaylist2WindowContainer",
    //ALT:"{606E9CDD-45EE-4c3b-9FD5-49381CEBE8AE}"
};

var on_panels_resize;

var $Splitter = new function () {
    var FbWnd;
    var _this = this;

    this.Init = function () {
        // Create panel manager functions ==================
        /*		var class_name;
         if (window.InstanceType==0)		// CUI
         class_name = "{E7076D1C-A7BF-4f39-B771-BCBE88F2A2A8}";
         else if (window.InstanceType==1)		// DUI
         class_name = "{97E27FAA-C0B3-4b8e-A693-ED7881E99FC1}";
         else		// FUI
         class_name = "foo_ui_func_window_class";
         FbWnd = utils.GetWND(class_name);
         */
        var WshWnd = wsh_utils.CreateWND(window.ID);
        FbWnd = WshWnd.GetAncestor(2);
    };

    //=======================================
    this.ReleaseCapture = function () {
        wsh_utils.ReleaseCapture();
    };

    this.SendAMessage = function (msg, wp, lp) {
        FbWnd && FbWnd.SendMsg(msg, wp, lp);
    };

    //=======================================
    var Panel = function (index, classname, position, x, y, w, h, size) {
        this.Move = function (x2, y2, w2, h2) {
            //fb.trace(this.index, "move", this.visible, this.x, this.y, this.w, this.h)
            if (this.relative) {
                return;
            }
            this.x = x2;
            this.y = y2;
            this.w = w2;
            this.h = h2;
            if (this.visible) {
                this.Wnd.Move(this.x + this.padding.left, this.y + this.padding.top, this.w - this.padding.left - this.padding.right, this.h - this.padding.top - this.padding.bottom);
            }
            else {
                this.Wnd.Show(0);
            }
        };

        this.Show = function () {
            //fb.trace(this.index, "show", this.x, this.y, this.w, this.h)
            this.Wnd.Show(1);
            this.visible = true;
            window.SetProperty("P" + this.index + ".visible", this.visible);
        };

        this.Hide = function () {
            //fb.trace(this.index, "hide", this.x, this.y, this.w, this.h)
            this.Wnd.Show(0);
            this.visible = false;
            window.SetProperty("P" + this.index + ".visible", this.visible);
        };

        this.Refresh = function () {
            //fb.trace(this.index, "refresh", this.visible, this.x, this.y, this.w, this.h)
            if (this.visible) {
                this.Wnd.Move(this.x + this.padding.left, this.y + this.padding.top, this.w - this.padding.left - this.padding.right, this.h - this.padding.top - this.padding.bottom, false);
            }
            else {
                this.Wnd.Show(0);
            }
        };

        this.Lock = function (lock) {
            this.locked = lock;
            window.SetProperty("P" + this.index + ".locked", lock);
        };

        this.x = x ? x : 0;
        this.y = y ? y : 0;
        this.w = w ? w : 0;
        this.h = h ? h : 0;
        this.size = size ? size : 0;
        this.minSize = 0;
        this.maxSize = Infinity;
        this.padding = {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0
        };
        this.relative = false;
        this.index = index;
        this.visible = window.GetProperty("P" + this.index + ".visible", true);
        this.locked = window.GetProperty("P" + this.index + ".locked", false);
        this.Wnd = FbWnd ? FbWnd.GetChild(classname, position) : null;
    };

    //=======================================
    function RelativePanels() {
        this.x = 0;
        this.y = 0;
        this.w = 0;
        this.h = 0;
        this.margin = {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0
        };
        this.initialized = false;
        this.panels = [];
        var panelPlacement, IDC_SIZE;
        var sepW = 4;
        var drawSep;
        var hover = null, drag = null;
        var coord = {}, lastCoord;
        var adjustingPanels1, adjustingPanels2;

        this.SetPanelsPlacementMode = function (mode) {
            if (mode == "horizontal") {
                panelPlacement = 0;        // 0: horizontal, 1: vertical.
                coord.x = "x";
                coord.y = "y";
                coord.w = "w";
                coord.h = "h";
                IDC_SIZE = IDC_SIZEWE;
            }
            else if (mode == "vertical") {
                panelPlacement = 1;
                coord.x = "y";
                coord.y = "x";
                coord.w = "h";
                coord.h = "w";
                IDC_SIZE = IDC_SIZENS;
            }
        };
        this.SetPanelsPlacementMode("horizontal");

        this.SetSeparatorProperties = function (width, drawFunc) {
            sepW = width;
            drawSep = drawFunc;
        };

        this.Draw = function (g) {
            if (panelPlacement == 0) {
                for (var i = 0; i < this.panels.length - 1; i++) {
                    var p = this.panels[i];
                    if (p.visible) {
                        drawSep && drawSep(g, p.x + p.w, this.y, sepW, this.h, panelPlacement);
                    }
                }
            }
            else {
                for (var i = 0; i < this.panels.length - 1; i++) {
                    var p = this.panels[i];
                    if (p.visible) {
                        drawSep && drawSep(g, this.x, p.y + p.h, this.w, sepW, panelPlacement);
                    }
                }
            }
        };

        this.Show = function (panel, show) {
            if (show == panel.visible) {
                return;
            }
            panel.visible = show;
            if (!this.initialized) {
                return;
            }

            InitPanels(this.panels, this[coord.x],this[coord.w]);
            this.RefreshPanels();
        };

        this.Lock = function (index, lock) {
            InitPanels(this.panels, this[coord.x],this[coord.w]);
        };

        this.DrawOnMouseMove = function()
        {
            for (var i = 0; i < this.panels.length; i++)
                this.panels[i].Refresh();
        };

        var tempx;
        this.OnMouseMove = function (x, y) {

            var cursorX = eval(coord.x);
            if (drag) {
                cursorX += tempx;
                cursorX = Math.min(cursorX, this[coord.w] - adjustingPanels2.minSize, adjustingPanels1.maxSize + sepW);
                cursorX = Math.max(cursorX, this[coord.w] - adjustingPanels2.maxSize, adjustingPanels1.minSize + sepW);

                if (cursorX != lastCoord) {
                    var x1 = adjustingPanels1[0][coord.x];
                    var w1 = cursorX - adjustingPanels1[0][coord.x] - sepW;
                    var x2 = adjustingPanels2[0][coord.x] + cursorX - lastCoord;
                    var w2 = this[coord.w] - x2;

                    InitPanels(adjustingPanels1, x1, w1);
                    var leftover = ReadjustPanels(adjustingPanels1, -1);

                    InitPanels(adjustingPanels2, x2 - leftover, w2 + leftover);
                    leftover = ReadjustPanels(adjustingPanels2, 1);
                    if ( leftover !=0 )
                    {
                        error_there_is_a_leftover;
                    }

                    this.RefreshPanels();
                    on_panels_resize && on_panels_resize();
                    window.Repaint();
                    lastCoord = cursorX;
                }
            }
            else {
                var cursorY = eval(coord.y);
                for (var i = 0; i < this.panels.length - 1; i++) {
                    var tem = this.panels[i][coord.x] + this.panels[i][coord.w];
                    if (cursorX >= tem && cursorX < tem + sepW && cursorY >= this[coord.y] && cursorY < this[coord.y] + this[coord.h]) {
                        window.SetCursor(IDC_SIZE);
                        hover = i + 1;
                        break;
                    }
                }
                if (i >= this.panels.length - 1 && hover) {
                    hover = null;
                    window.SetCursor(IDC_ARROW);
                }
            }
        }

        this.OnMouseLbtnDown = function (x, y) {

            if (!hover) {
                return;
            }

            drag = hover;
            tempx = this.panels[drag - 1][coord.x] + this.panels[drag - 1][coord.w] + sepW - eval(coord.x);
            lastCoord = eval(coord.x) + tempx;
            adjustingPanels1 = this.panels.slice(0, drag);
            adjustingPanels2 = this.panels.slice(drag);
            var x1 = adjustingPanels1[0][coord.x];
            var w1 = adjustingPanels1[adjustingPanels1.length - 1][coord.x] + adjustingPanels1[adjustingPanels1.length - 1][coord.w] - x1;
            var x2 = adjustingPanels2[0][coord.x];
            var w2 = adjustingPanels2[adjustingPanels2.length - 1][coord.x] + adjustingPanels2[adjustingPanels2.length - 1][coord.w] - x2;
            InitPanels(adjustingPanels1, x1, w1);
            InitPanels(adjustingPanels2, x2, w2);
        }

        this.OnMouseLbtnUp = function (x, y) {

            if (!drag) {
                return;
            }
            drag = null;

            UpdateSizes(this.panels);
            this.SaveSizes();
            this.OnMouseMove(x, y);
        }

        this.OnMouseLeave = function () {
            if (hover) {
                window.SetCursor(IDC_ARROW);
                hover = null;
            }
            drag = null;
        }

        function InitPanels(panels, offset, totalWidth) {
            panels.totalWidth = totalWidth;
            panels.visibleNumbers = 0;
            panels.minSize = 0;
            panels.maxSize = 0;
            panels.lockedPanels = [];
            panels.unlockedPanels = [];

            var widthAvailable = totalWidth;
            var totalWeight = 0;
            var p, ps;
            for (var i = 0; i < panels.length; i++) {
                // Collect information
                p = panels[i];
                if ( !p.visible )
                {
                    continue
                }

                if (!p.locked)
                {
                    totalWeight += p.size;
                }
                else
                {
                    widthAvailable -= p.size;
                }

                panels.visibleNumbers++;
                panels.maxSize += p.maxSize;

                if (i != panels.length - 1)
                {
                    widthAvailable -= sepW;
                    panels.minSize += sepW;
                    panels.maxSize += sepW;
                }

                ps = p.locked ? panels.lockedPanels : panels.unlockedPanels;
                ps.push(p);
            }

            if (!panels.visibleNumbers) {
                return;
            }

            // Set width
            ps = panels.lockedPanels;
            if ( panels.unlockedPanels.length == 0 )
            {
                for (var i = 0; i < ps.length; i++) {
                    p = ps[i];

                    p[coord.w] = p.size;
                    panels.minSize += p.minSize;
                }
            }
            else
            {
                for (var i = 0; i < ps.length; i++) {
                    p = ps[i];

                    p[coord.w] = p.size;
                    panels.minSize += p.size;
                }

                ps = panels.unlockedPanels;

                var tmpWidth = widthAvailable;
                for (var i = 0; i < ps.length; i++) {
                    p = ps[i];
                    var newWidth = Math.round((p.size * widthAvailable) / totalWeight);
                    p[coord.w] = newWidth;
                    tmpWidth -= newWidth;
                    panels.minSize += p.minSize;
                }

                if (tmpWidth != 0) {
                    ps[ps.length - 1][coord.w] += tmpWidth;
                }
            }

            var curX = offset;
            for (var i = 0; i < panels.length; i++) {
                // Set x
                p = panels[i];
                if ( !p.visible )
                {
                    continue;
                }

                p[coord.x] = curX;
                curX += p[coord.w] + sepW;
            }
        }


        function UpdateSizes(panels) {
            for (var i = 0; i < panels.length; i++) {
                // Collect information
                var p = panels[i];
                if ( !p.visible )
                {
                    continue
                }

                p.size = p[coord.w];
            }
        }

        function ReadjustPanels(panels, direction) {
            if ( panels.unlockedPanels.length != 0 )
            {
                return 0;
            }

            ps = panels.lockedPanels;

            var widthDifference = panels.totalWidth;
            for (var i = 0; i < ps.length; i++) {
                widthDifference -= ps[i][coord.w];
                if (i != ps.length - 1) {
                    widthDifference -= sepW;
                }
            }

            if ( widthDifference == 0 )
            {
                return 0;
            }

            var panelIndex = (direction == 1) ? 0 : (ps.length - 1);
            while (widthDifference != 0) {
                var p = ps[panelIndex];
                var oldW = p[coord.w];
                var newW = oldW + widthDifference;
                newW = Math.min(newW, p.maxSize);
                newW = Math.max(newW, p.minSize);

                p[coord.w] = newW;
                widthDifference -= newW - oldW;

                if ( widthDifference != 0 ) {
                    if ((direction == 1 && panelIndex < (ps.length - 1))
                        || (direction == -1 && panelIndex > 0)) {
                        panelIndex += direction;
                    }
                    else {
                        fb.trace("error_there_is_a_leftover",widthDifference,ps[0][coord.w]);
                        error_there_is_a_leftover;
                        return widthDifference;
                    }
                }
            }

            return 0;
        };

        this.Resize = function (w, h) {
            w = Math.max(w - this.margin.left - this.margin.right, 0);
            h = Math.max(h - this.margin.top - this.margin.bottom, 0);
            var sizeW = eval(coord.w);
            var sizeH = eval(coord.h);
            if (sizeH != this[coord.h]) {
                for (var i = 0; i < this.panels.length; i++)
                    this.panels[i][coord.h] = sizeH;
            }

            this[coord.w] = sizeW;
            this[coord.h] = sizeH;

            InitPanels(this.panels, this[coord.x],sizeW);
            this.SaveSizes();
            this.RefreshPanels();
        };

        this.RefreshPanels = function () {
            for (var i = 0; i < this.panels.length; i++)
                this.panels[i].Refresh();
        };

        this.Init = function (w, h) {
            this.x = this.margin.left;
            this.y = this.margin.top;
            this.w = w - this.margin.left - this.margin.right;
            this.h = h - this.margin.top - this.margin.bottom;
            for (var i = 0; i < this.panels.length; i++) {
                var p = this.panels[i];
                p[coord.y] = this[coord.y];
                p[coord.h] = this[coord.h];
                p.size = window.GetProperty("P" + p.index + ".size", Math.round(this[coord.w] / this.panels.length));
            }

            InitPanels(this.panels, this[coord.x], this[coord.w]);
            this.SaveSizes();
            this.RefreshPanels();
            this.initialized = true;
        };

        this.SaveSizes = function () {
            for (var i = 0; i < this.panels.length; i++)
                if (this.panels[i].visible) {
//                fb.trace("save", this.panels[i].size);
                    window.SetProperty("P" + this.panels[i].index + ".size", this.panels[i].size);
                }
        }
    }

    //=======================================
    var panels = [];
    var relativePanels = new RelativePanels();

    this.CreatePanel = function (classname, position, forcedLayout, x, y, w, h, size) {
        var p = new Panel(panels.length, classname, position, x, y, w, h, size);
        panels.push(p);
        p.relative = !forcedLayout;
        if (p.relative) {
            relativePanels.panels.push(p);
        }
        return p;
    };

    this.ShowPanel = function (index, show) {
        var p = panels[index];
        if (p.relative) {
            relativePanels.Show(p, show);
        }
        if (show) {
            p.Show();
        }
        else {
            p.Hide();
        }
        window.Repaint();
    };

    this.MovePanel = function (index, x, y, w, h) {
        panels[index].Move(x, y, w, h);
    };

    this.LockPanel = function (index, lock) {
        panels[index].Lock(lock);
        if (panels[index].relative) {
            relativePanels.Lock(index, lock);
        }
    };

    this.SetPanelSize = function (index, size) {
        panels[index].size = size;
    };

    this.SetPanelSizeLimit = function (index, min, max) {
        panels[index].minSize = min;
        panels[index].maxSize = max;
    };

    this.SetPanelsPlacementMode = function (mode) {
        relativePanels.SetPanelsPlacementMode(mode);
    };

    this.SetSeparatorProperties = function (width, drawFunc) {
        relativePanels.SetSeparatorProperties(width, drawFunc);
    };

    this.SetPanelsMargin = function (left, top, right, bottom) {
        relativePanels.margin = {
            left: left,
            top: top,
            right: right,
            bottom: bottom
        };
    };

    //function RefreshPanelsLayout(){}

    //=======================================
    function OnSize() {
        if (relativePanels.initialized) {
            relativePanels.Resize(ww, wh);
        }
        else {
            relativePanels.Init(ww, wh);
        }
        //on_panels_resize && on_panels_resize();
    }

    addEventListener("on_size", OnSize);

    function OnPaint(gr) {
        if (!ww || !wh) {
            return;
        }
        relativePanels.Draw(gr);
    }

    addEventListener("on_paint", OnPaint);

    function OnMouseMove(x, y) {
        relativePanels.OnMouseMove(x, y);
    }

    addEventListener("on_mouse_move", OnMouseMove);

    function OnMouseLbtnDown(x, y) {
        relativePanels.OnMouseLbtnDown(x, y);
    }

    addEventListener("on_mouse_lbtn_down", OnMouseLbtnDown);

    function OnMouseLbtnUp(x, y) {
        relativePanels.OnMouseLbtnUp(x, y);
    }

    addEventListener("on_mouse_lbtn_up", OnMouseLbtnUp);

    function OnMouseLeave() {
        relativePanels.OnMouseLeave();
    }

    addEventListener("on_mouse_leave", OnMouseLeave);

    function OnNotifyData(name, info) {
        if (name != ThisPanelsName || typeof(info) != "object") {
            return;
        }
        switch (info[0]) {
            case 'ShowPanel':
                _this.ShowPanel(info[1], info[2]);
                on_panels_resize && on_panels_resize();
                break;
            case 'MovePanel':
                _this.MovePanel(info[1], info[2], info[3], info[4], info[5]);
                break;
            case 'LockPanel':
                _this.LockPanel(info[1], info[2]);
                break;
            case 'RequestPanelStatus':
                var p = panels[info[1]];
                if (p) {
                    info[2][0] = {
                        x: p.x,
                        y: p.y,
                        w: p.w,
                        h: p.h,
                        visible: p.visible,
                        locked: p.locked
                    };
                }
                break;
        }
    }

    addEventListener("on_notify_data", OnNotifyData);

    this.Init();
}();
