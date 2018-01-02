// ==PREPROCESSOR==
// @name "Library Tree"
// @author "WilB"
// @version "1.3.9.1"
// ==/PREPROCESSOR==

String.prototype.strip = function() {return this.replace(/[\.,\!\?\:;'\u2019"\-_\u2010\s+]/g, "").toLowerCase();}
if (!String.prototype.trim) {String.prototype.trim = function () {return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');};}

function userinterface() {
    var WshShell = new ActiveXObject("WScript.Shell"); try {var dpi = WshShell.RegRead("HKCU\\Control Panel\\Desktop\\WindowMetrics\\AppliedDPI");} catch (e) {var dpi = 120;} this.scale = dpi < 121 ? 1 : dpi / 120; this.zoomUpd = window.GetProperty("SYSTEM.Zoom Update", false);
    var blend = "", custom_col = window.GetProperty("_CUSTOM COLOURS/FONTS: USE", false), cust_icon_font = window.GetProperty("_Custom.Font Icon [Node] (Name,Style[0or1])", "Segoe UI Symbol,0"), icon = window.GetProperty(" Node: Custom Icon: +|- // Examples","| // (+)|(−) | | | | | | | | |").trim(), icon_f_name= "Segoe UI", icon_f_style = 0, iconcol_c = "", iconcol_e = "", iconcol_h = "", linecol = window.GetProperty(" Node: Lines: Hide-0 Grey-1 Blend-2 Text-3", 1), mix = 0, orig_font_sz = 16, s_col = window.GetProperty(" Search Style: Fade-0 Blend-1 Norm-2 Highlight-3", 0), s_linecol = window.GetProperty(" Search: Line Colour: Grey-0 Blend-1 Text-2", 0), sp = 6, sp1 = 6, sp2 = 6, sum = 0, node_sz = Math.round(11 * this.scale), zoom = 100, zoom_font_sz = 16, zoom_node = 100;
    this.b1 = 0x04ffffff; this.b2 = 0x04000000; this.backcol = ""; this.backcol_h = ""; this.backcolsel = ""; this.backcoltrans = ""; this.bg = false; this.collapse = ""; this.expand =  ""; this.ct = false; this.dui = window.InstanceType; this.fill = 0; this.font; this.framecol = ""; this.h = 0; this.icon_font; this.icon_pad = window.GetProperty(" Node: Custom Icon: Vertical Padding", -2); this.icon_w = 17; this.iconcol_c = ""; this.iconcol_e = ""; this.iconcol_h = ""; this.j_font; this.l_s1 = 4; this.l_s2 = 6; this.l_s3 = 7; this.linecol = ""; this.pen = 1; this.pen_c = 0x55888888; this.row_h = 20; this.s_font; this.s_linecol = ""; this.searchcol = ""; this.sel = 3; this.textcol = ""; this.textcol_h = ""; this.textselcol = ""; this.txt_box = ""; this.w = 0; this.alternate = window.GetProperty(" Row Stripes", false); this.local = typeof conf === 'undefined' ? false : true; this.margin = window.GetProperty(" Margin", 8); this.node_sz = Math.round(11 * this.scale);
    this.trace = function(message) {var trace = true; if (trace) fb.trace("Library Tree: " + message);} // true enables fb.trace
    if (custom_col) {if (cust_icon_font.length) {cust_icon_font = cust_icon_font.split(","); try {var st = Math.round(parseFloat(cust_icon_font[1])), font_test = gdi.Font(cust_icon_font[0], 16, st); icon_f_name = cust_icon_font[0]; icon_f_style = st;} catch(e) {this.trace("JScript Panel is unable to use your node icon font. Using Segoe UI instead");}}}
    try {var win_node = parseFloat(window.GetProperty("ADV.Node [Default]: Themed 0 or 1", "0").replace(/\s+/g, "").charAt(0)); if (isNaN(win_node)) win_node = 0;  if (win_node != 0 && win_node != 1) win_node = 0; if (win_node == 1)  window.SetProperty("ADV.Node [Default]: Themed 0 or 1", "1 // Highlight & Custom Colours N/A For Themed"); else window.SetProperty("ADV.Node [Default]: Themed 0 or 1", "" + 0 + "");} catch (e) {win_node = 0; window.SetProperty("ADV.Node [Default]: Themed 0 or 1", "" + 0 + "");}
    this.node_style = window.GetProperty(" Node: Custom (No Lines)", false) ? 0 : !win_node ? 1 : 2; if (this.node_style > 2 || this.node_style < 0) this.node_style = 1; this.node_win = this.node_style == 2 ? 1 : 0;
    if (!this.node_style) {if (!icon.charAt(0).length) this.node_style = 1; else try {icon = icon.split(/\||\/\//); this.expand = icon[0].trim(); this.collapse = icon[1].trim();} catch (e) {this.node_style = 1;}} if (!this.expand.length || !this.collapse.length) this.node_style = 1;
    this.hot = window.GetProperty(" Node: Hot Highlight", true); this.pad = window.GetProperty(" Tree Indent", 19); window.SetProperty("_CUSTOM COLOURS/FONTS: EMPTY = DEFAULT", "R-G-B (any) or R-G-B-A (not Text...), e.g. 255-0-0");
    this.scrollbar_show = window.GetProperty(" Scrollbar Show", true);
    try {this.scr_type = parseFloat(window.GetProperty(" Scrollbar Type Default-0 Styled-1 Themed-2", "0").replace(/\s+/g, "").charAt(0)); if (isNaN(this.scr_type)) this.scr_type = 0;  if (this.scr_type > 2 || this.scr_type < 0) this.scr_type = 0; if (this.scr_type ==2)  window.SetProperty(" Scrollbar Type Default-0 Styled-1 Themed-2", "2 // Scrollbar Settings N/A For Themed"); else window.SetProperty(" Scrollbar Type Default-0 Styled-1 Themed-2", "" + this.scr_type + "");} catch (e) {this.scr_type = 0; window.SetProperty(" Scrollbar Type Default-0 Styled-1 Themed-2", "" + 0 + "");}
    this.scr_col = Math.min(Math.max( window.GetProperty(" Scrollbar Colour Grey-0 Blend-1", 1), 0), 1);
    if (this.scr_type == 2) {this.theme = window.CreateThemeManager("scrollbar"); var im = gdi.CreateImage(21, 21), g = im.GetGraphics(); try {this.theme.SetPartAndStateId(6, 1); this.theme.DrawThemeBackground(g, 0, 0, 21, 50); for (var i = 0; i < 3; i++) {this.theme.SetPartAndStateId(3, i + 1); this.theme.DrawThemeBackground(g, 0, 0, 21, 50);} for (i = 0; i < 3; i++) {this.theme.SetPartAndStateId(1, i + 1); this.theme.DrawThemeBackground(g, 0, 0, 21, 21);}} catch(e) {this.scr_type = 1; window.SetProperty(" Scrollbar Type Default-0 Styled-1 Themed-2", "" + 1 + "");} im.ReleaseGraphics(g); im.Dispose();}
    var themed_w = 21; try {themed_w = utils.GetSystemMetrics(2);} catch (e) {}
    var sbar_w = window.GetProperty(" Scrollbar Size", "Bar,11,Arrow,11,Gap(+/-),0").replace(/\s+/g, "").split(",");
    this.scr_w = parseFloat(sbar_w[1]); if (isNaN(this.scr_w)) this.scr_w = 11; this.scr_w = Math.min(Math.max(this.scr_w, 0), 400);
    var scr_w_o = Math.min(Math.max(window.GetProperty("SYSTEM.Scrollbar Width Bar", 11), 0), 400);
    this.arrow_pad = parseFloat(sbar_w[5]); if (isNaN(this.arrow_pad)) this.arrow_pad = 0;
    if (this.scr_w != scr_w_o) {this.scr_but_w = parseFloat(sbar_w[3]); if (isNaN(this.scr_but_w)) this.scr_but_w = 11; this.scr_but_w = Math.min(this.scr_but_w, this.scr_w, 400); window.SetProperty(" Scrollbar Size", "Bar," + this.scr_w +",Arrow," + this.scr_but_w + ",Gap(+/-)," + this.arrow_pad);}
    else {this.scr_but_w = parseFloat(sbar_w[3]); if (isNaN(this.scr_but_w)) this.scr_but_w = 11; this.scr_but_w = Math.min(Math.max(this.scr_but_w, 0), 400); this.scr_w = parseFloat(sbar_w[1]); if (isNaN(this.scr_w)) this.scr_w = 11; this.scr_w = Math.min(Math.max(this.scr_w, this.scr_but_w), 400); window.SetProperty(" Scrollbar Size", "Bar," + this.scr_w +",Arrow," + this.scr_but_w + ",Gap(+/-)," + this.arrow_pad);}
    window.SetProperty("SYSTEM.Scrollbar Width Bar", this.scr_w);
    if (this.scr_type == 2 ) this.scr_w = themed_w; if (!this.scrollbar_show) this.scr_w = 0;
    this.but_h = this.scr_w + (this.scr_type != 2 ? 1 : 0); if (this.scr_type != 2) this.scr_but_w += 1;
    this.sbar_sp = this.scr_w ? this.scr_w + (this.scr_w - this.scr_but_w < 5 || this.scr_type == 2 ? 1 : 0) : 0;
    this.arrow_pad = Math.min(Math.max(-this.but_h / 5, this.arrow_pad), this.but_h / 5);
    var R = function(c) {return c >> 16 & 0xff;}; var G = function(c) {return c >> 8 & 0xff;}; var B = function(c) {return c & 0xff;}; var A = function (c) {return c >> 24 & 0xff;}
    var RGBAtoRGB = function(col, bg) {var r = R(col) / 255, g= G(col) / 255, b = B(col) / 255, a = A(col) / 255, bgr = R(bg) / 255, bgg = G(bg) / 255, bgb = B(bg) / 255, nR = ((1 - a) * bgr) + (a * r), nG = ((1 - a) * bgg) + (a * g), nB = ((1 - a) * bgb) + (a * b); nR = Math.max(Math.min(Math.round(nR * 255), 255), 0); nG = Math.max(Math.min(Math.round(nG * 255), 255), 0); nB = Math.max(Math.min(Math.round(nB * 255), 255), 0); return RGB(nR, nG, nB);}
    var get_blend = function(c1, c2, f) {var nf = 1 - f, r = (R(c1) * f + R(c2) * nf), g = (G(c1) * f + G(c2) * nf), b = (B(c1) * f + B(c2) * nf); return RGB(r, g, b);}
    var get_grad = function (c, f1, f2) {return [RGB(Math.min(R(c) + f1, 255), Math.min(G(c) + f1, 255), Math.min(B(c) + f1, 255)), RGB(Math.max(R(c) + f2, 0), Math.max(G(c) + f2, 0), Math.max(B(c) + f2, 0))];}
    var get_textselcol = function(c, n) {var cc = [R(c), G(c), B(c)]; var ccc = []; for (var i = 0; i < cc.length; i++) {ccc[i] = cc[i] / 255; ccc[i] = ccc[i] <= 0.03928 ? ccc[i] / 12.92 : Math.pow(((ccc[i] + 0.055 ) / 1.055), 2.4);} var L = 0.2126 * ccc[0] + 0.7152 * ccc[1] + 0.0722 * ccc[2]; if (L > 0.31) return n ? 50 : RGB(0, 0, 0); else return n ? 200 : RGB(255, 255, 255);}
    var set_custom_col = function(c, t) {if (!custom_col) return ""; try {var cc = "", col = []; col = c.split("-"); if (col.length != 3 && col.length != 4) return ""; switch (t) {case 0: cc = RGB(col[0], col[1], col[2]); break; case 1: switch (col.length) {case 3: cc = RGB(col[0], col[1], col[2]); break; case 4: cc = RGBA(col[0], col[1], col[2], col[3]); break;} break;} return cc;} catch(e) {return ""};}
    this.draw = function(gr) {if (this.bg) try {gr.FillSolidRect(0, 0, this.w, this.h, this.backcol)} catch(e) {}}
    this.on_refresh_background_done = function(image) {if (!image || !custom_col || !window.IsTransparent || this.dui || !this.node_style) return; if (iconcol_c === "" && iconcol_e === "" && iconcol_h === "") return; this.icon_col(image.GetColorScheme(1).toArray()[0]);}
    this.outline = function(c, but) {if (but) {if (window.IsTransparent || R(c) + G(c) + B(c) > 30) return RGBA(0, 0, 0, 36); else return RGBA(255, 255, 255, 36);} else if (R(c) + G(c) + B(c) > 255 * 1.5) return RGB(30, 30, 10); else return RGB(225, 225, 245);}
    this.reset_colors = function () {iconcol_c = ""; iconcol_e = ""; iconcol_h = ""; this.backcol = ""; this.backcol_h = ""; this.backcolsel = ""; this.backcoltrans = ""; this.framecol = ""; this.iconcol_c = ""; this.iconcol_e = ""; this.iconcol_h = ""; this.linecol = ""; this.s_linecol = ""; this.searchcol = ""; this.textcol = ""; this.textcol_h = ""; this.textselcol = ""; this.txt_box = "";}

    this.icon_col = function(c) {
        if (iconcol_c === "") {this.iconcol_c = this.node_style ? [RGB(252, 252, 252), RGB(223, 223, 223)] : this.textcol;} else if (this.node_style) {if (A(iconcol_c) != 255) {this.iconcol_c = RGBAtoRGB(iconcol_c, c ? c : this.backcol);} else this.iconcol_c = iconcol_c; this.iconcol_c = get_grad(this.iconcol_c, 15, -14);}
        if (iconcol_e === "") {this.iconcol_e = this.node_style ? [RGB(252, 252, 252), RGB(223, 223, 223)] : this.textcol & 0xC0ffffff;} else if (this.node_style) {if (A(iconcol_e) != 255) {this.iconcol_e = RGBAtoRGB(iconcol_e, c ? c : this.backcol);} else this.iconcol_e = iconcol_e; this.iconcol_e = get_grad(this.iconcol_e, 15, -14);}
        this.iconpluscol = get_textselcol(this.iconcol_e[0], true) == 50 ? RGB(41, 66, 114) : RGB(225, 225, 245);
        this.iconminuscol_c = get_textselcol(this.iconcol_c[0], true) == 50 ? RGB(75, 99, 167) : RGB(225, 225, 245);
        this.iconminuscol_e = get_textselcol(this.iconcol_e[0], true) == 50 ? RGB(75, 99, 167) : RGB(225, 225, 245);
        if (!this.hot) return;
        if (iconcol_h === "") {this.iconcol_h = this.node_style ? !this.local ? (R(this.textcol_h) + G(this.textcol_h) + B(this.textcol_h) < 650 ? this.textcol_h : this.textcol) : (R(c_iconcol_h) + G(c_iconcol_h) + B(c_iconcol_h) < 650 ? c_iconcol_h : c_textcol) : this.textcol_h; iconcol_h = this.iconcol_h} if (this.node_style) {if (A(iconcol_h) != 255) {this.iconcol_h = RGBAtoRGB(iconcol_h, c ? c : this.backcol);} else if (iconcol_h !== "") this.iconcol_h = iconcol_h; this.iconcol_h = get_grad(this.iconcol_h, 15, -14);}
        this.iconpluscol_h = get_textselcol(this.iconcol_h[0], true) == 50 ? RGB(41, 66, 114) : RGB(225, 225, 245);
        this.iconminuscol_h = get_textselcol(this.iconcol_h[0], true) == 50 ? RGB(75, 99, 167) : RGB(225, 225, 245);
    }

    this.get_colors = function() {
        this.backcol = set_custom_col(window.GetProperty("_Custom.Colour Background", ""), 1);
        this.backcol_h = set_custom_col(window.GetProperty("_Custom.Colour Background Highlight", ""), 1);
        this.backcolsel = set_custom_col(window.GetProperty("_Custom.Colour Background Selected", ""), 1);
        this.linecol = set_custom_col(window.GetProperty("_Custom.Colour Node Lines", ""), 1);
        this.txt_box = set_custom_col(window.GetProperty("_Custom.Colour Search Name", ""), 0);
        this.s_linecol = set_custom_col(window.GetProperty("_Custom.Colour Search Line", ""), 1);
        this.searchcol = set_custom_col(window.GetProperty("_Custom.Colour Search Text", ""), 0);
        this.framecol = set_custom_col(window.GetProperty("_Custom.Colour Frame Highlight", ""), 1);
        this.textcol = set_custom_col(window.GetProperty("_Custom.Colour Text", ""), 0);
        this.textcol_h = set_custom_col(window.GetProperty("_Custom.Colour Text Highlight", ""), 0);
        this.textselcol = set_custom_col(window.GetProperty("_Custom.Colour Text Selected", ""), 0);
        this.iconcol_c = set_custom_col(window.GetProperty("_Custom.Colour Node Collapse", ""), 1); iconcol_c = this.iconcol_c;
        this.iconcol_e = set_custom_col(window.GetProperty("_Custom.Colour Node Expand", ""), 1); iconcol_e = this.iconcol_e;
        this.iconcol_h = set_custom_col(window.GetProperty("_Custom.Colour Node Highlight", ""), 1); iconcol_h = this.iconcol_h;
        this.backcoltrans = set_custom_col(window.GetProperty("_Custom.Colour Transparent Fill", ""), 1);

        if (this.dui) { // custom colour mapping: DUI colours can be remapped by changing the numbers (0-3)
            if (this.textcol === "") this.textcol = window.GetColorDUI(0);
            if (this.backcol === "") this.backcol = window.GetColorDUI(1);
            if (this.textcol_h === "") this.textcol_h = window.GetColorDUI(2);
            if (this.backcolsel === "") this.backcolsel = window.GetColorDUI(3);
        } else { // custom colour mapping: CUI colours can be remapped by changing the numbers (0-6)
            if (this.textcol === "") this.textcol = window.GetColorCUI(0);
            if (this.backcol === "") this.backcol = window.GetColorCUI(3);
            if (this.textcol_h === "") this.textcol_h = window.GetColorCUI(2);
            if (this.backcolsel === "") this.backcolsel = window.GetColorCUI(4);
            if (this.textselcol === "") this.textselcol = window.GetColorCUI(1);
        }
        if (this.backcol_h === "") this.backcol_h = 0x1E30AFED;
        if (s_linecol == 1 && window.IsTransparent && !this.dui) s_linecol = 0;
        if (this.framecol === "") this.framecol = 0xA330AFED;
        var blend = get_blend(this.backcol == 0 ? 0xff000000 : this.backcol, this.textcol, 0.75);
        var ln_col = [0, RGBA(136, 136, 136, 85), blend, this.textcol];
        if (this.linecol === "") this.linecol = ln_col[linecol];
        if (this.searchcol === "") this.searchcol = s_col < 3 ? this.textcol : this.textcol_h;
        if (this.textselcol === "") this.textselcol = get_textselcol(this.backcolsel, false);
        blend = get_blend(this.backcol == 0 ? 0xff000000 : this.backcol, !s_col || s_col == 2 ? this.textcol : this.textcol_h, 0.75);
        if (this.txt_box === "") this.txt_box = s_col < 2 ? get_blend(!s_col ? this.textcol : this.textcol_h, this.backcol == 0 ? 0xff000000 : this.backcol, !s_col ? 0.65 : 0.7) : s_col == 2 ? this.textcol : this.textcol_h;
        if (this.s_linecol === "") this.s_linecol = s_linecol == 0 ? RGBA(136, 136, 136, 85) : s_linecol == 1 ? blend : this.txt_box;
        if (window.IsTransparent && this.backcoltrans) {this.bg = true; this.backcol = this.backcoltrans}
        if (!window.IsTransparent || this.dui) {this.bg = true; if ((R(this.backcol) + G(this.backcol) + B(this.backcol)) > 759) this.b2 = 0x06000000;}
        this.icon_col();
        this.ct = this.bg ? get_textselcol(this.backcol, true) : 200;
        if (this.local) {this.textcol = c_textcol; this.textcol_h = c_textcol_h; this.textselcol = c_textselcol; this.backcolsel = c_backcolsel; this.alternate = c_alternate; this.fill = c_fill; this.pen = c_pen; this.pen_c = c_pen_c; this.searchcol = this.txt_box = c_txt_box; this.b1 = c_b1; this.b2 = c_b2;}
        this.ibeamcol1 = window.IsTransparent ? 0xffe1e1f5 : this.outline(this.backcol);
        this.ibeamcol2 = window.IsTransparent || !this.backcolsel ? 0xff0099ff : this.backcolsel != this.searchcol ? this.backcolsel : 0xff0099ff;
    }
    this.get_colors();

    this.get_font = function() {
        var cust_f = window.GetProperty("_Custom.Font (Name,Size,Style[0-4])", "Segoe UI,16,0");
        if (custom_col && cust_f.length) {cust_f = cust_f.split(",");try {this.font = gdi.Font(cust_f[0], Math.round(parseFloat(cust_f[1])), Math.round(parseFloat(cust_f[2])));} catch(e) {}}
        else if (this.dui) this.font = window.GetFontDUI(2); else this.font = window.GetFontCUI(0);
        try {this.font.Name; this.font.Size; this.font.Style;} catch(e) {this.font = gdi.Font("Segoe UI", 16, 0); this.trace("JScript Panel is unable to use your default font. Using Segoe UI at default size & style instead");}
        orig_font_sz = window.GetProperty("SYSTEM.Font Size", 16);
        if (this.font.Size != orig_font_sz) window.SetProperty(" Zoom Font Size (%)", 100);
        orig_font_sz = this.font.Size; window.SetProperty("SYSTEM.Font Size", this.font.Size)
        if (!this.zoomUpd && window.GetProperty("SYSTEM.Software Notice Checked")) window.SetProperty(" Zoom Node Size (%)", window.GetProperty(" Zoom Node Size (%)", 100) / this.scale);
        zoom = window.GetProperty(" Zoom Font Size (%)", 100);
        zoom_node = window.GetProperty(" Zoom Node Size (%)", 100);
        zoom_font_sz = Math.max(Math.round(orig_font_sz * zoom / 100), 1);
        this.node_sz = this.node_style ? Math.round(node_sz * zoom_node / 100) : Math.round(orig_font_sz * zoom_node / 100);
        this.font = gdi.Font(this.font.Name, zoom_font_sz, this.font.Style);
        window.SetProperty(" Zoom Font Size (%)", Math.round(zoom_font_sz / orig_font_sz * 100));
        this.s_font = gdi.Font(this.font.Name, this.font.Size, 2);
        this.j_font = gdi.Font(this.font.Name, this.font.Size * 1.5, 1);
        if (this.local) {this.font = c_font; this.s_font = c_s_font; this.j_font = gdi.Font(this.font.Name, this.font.Size * 1.5, 1); this.margin = c_margin; this.pad = c_pad; this.row_h = c_row_h; if (this.scrollbar_show) {this.scr_type = 0; this.scr_w = c_scr_w; this.scr_but_w = this.scr_w + 1; this.but_h = this.scr_w + 1; this.sbar_sp = this.scr_w +1;}}
        this.calc_text();
    }

    this.calc_text = function() {
        var i = gdi.CreateImage(1, 1), g = i.GetGraphics();
        if (!this.local) this.row_h = Math.round(g.CalcTextHeight("String", this.font)) + window.GetProperty(" Row Vertical Item Padding", 3);
        if (this.node_style) {this.node_sz = Math.round(Math.max(Math.min(this.node_sz, this.row_h - 2), 7)); pop.create_images();}
        else {this.node_sz = Math.round(Math.max(Math.min(this.node_sz, this.row_h * 1.15), 7)); this.icon_font = gdi.Font(icon_f_name, this.node_sz, icon_f_style);}
        if (this.node_style) {this.node_sz = Math.round(Math.max(Math.min(this.node_sz, this.row_h - 2), 7)); pop.create_images(); zoom_node = Math.round(this.node_sz / node_sz * 100);}
        else {this.node_sz = Math.round(Math.max(Math.min(this.node_sz, this.row_h * 1.15), 7)); this.icon_font = gdi.Font(icon_f_name, this.node_sz, icon_f_style); zoom_node = Math.round(this.node_sz / orig_font_sz * 100);}
        window.SetProperty(" Zoom Node Size (%)", zoom_node);
        sp = Math.max(Math.round(g.CalcTextWidth(" ", this.font)), 4);
        sp1 = Math.max(Math.round(sp * 1.5), 6);
        if (!this.node_style) {var sp_e = g.MeasureString(this.expand, this.icon_font, 0, 0, 500, 500).Width; var sp_c = g.MeasureString(this.collapse, this.icon_font, 0, 0, 500, 500).Width; sp2 = Math.round(Math.max(sp_e, sp_c) + sp / 3);}
        this.l_s1 = Math.max(sp1 / 2, 4);
        this.l_s2 = Math.ceil(this.node_sz / 2);
        this.l_s3 = Math.max(7, this.node_sz / 2)
        this.icon_w = this.node_style ? this.node_sz + sp1 : sp + sp2;
        this.sel = (this.node_style ? sp1 : sp + Math.round(sp / 3)) / 2;
        this.tt = this.node_style ? -Math.ceil(sp1 / 2 - 3) + sp1 : sp;
        i.ReleaseGraphics(g); i.Dispose();
    }

    this.wheel = function(step) {
        if (p.m_y > p.s_h) {
            if (p.m_x >= Math.round(this.icon_w + this.margin + (p.base ? this.pad : 0))) {
                zoom_font_sz += step;
                zoom_font_sz = Math.max(zoom_font_sz, 1);
                this.font = gdi.Font(this.font.Name, zoom_font_sz, this.font.Style);
                this.s_font = gdi.Font(this.font.Name, this.font.Size, 2);
                this.j_font = gdi.Font(this.font.Name, this.font.Size * 1.5, 1);
                this.calc_text(); p.on_size(); jS.on_size();
                pop.create_tooltip(); if (p.s_show || this.scrollbar_show) but.refresh(true); sbar.reset();
                window.Repaint(); window.SetProperty(" Zoom Font Size (%)", Math.round(zoom_font_sz / orig_font_sz * 100));
            } else {this.node_sz += step; this.calc_text(); p.on_size(); window.Repaint();}
        } else {
            if (p.scale < 0.7) return; p.scale += step * 0.1; p.scale = Math.max(p.scale, 0.7);
            p.f_font = gdi.Font("Segoe UI", p.scale > 1.05 ? Math.floor(11 * this.scale * p.scale) : 11 * this.scale * p.scale, 1);
            p.f_but_ft = gdi.Font("Segoe UI", p.scale > 1.05 ? Math.floor(9 * this.scale * p.scale) : 9 * this.scale * p.scale, 1);
            p.calc_text(); but.refresh(true);
            window.SetProperty(" Zoom Filter Size (%)", Math.round(p.scale * 100)); p.search_paint();
        }
    }
}
var ui = new userinterface();

function on_colors_changed() {ui.reset_colors(); ui.get_colors(); if (ui.node_style) pop.create_images(); if (p.s_show) {but.create_images(); but.refresh();} window.Repaint();}
function on_font_changed() {ui.get_font(); sbar.reset(); p.on_size(); pop.create_tooltip(); if (p.s_show || ui.scrollbar_show) but.refresh(true); window.Repaint();}

function scrollbar() {
    var smoothness = 1 - window.GetProperty("ADV.Scroll: Smooth Scroll Level 0-1", 0.6561); smoothness = Math.max(Math.min(smoothness, 0.99), 0.01); this.count = -1; this.draw_timer = false; this.hover = false; this.s1 = 0; this.s2 = 0; this.scroll_step = window.GetProperty(" Scroll - Mouse Wheel: Page Scroll", true); this.smooth = window.GetProperty(" Scroll: Smooth Scroll", true); this.timer_but = false;
    this.x = 0; this.y = 0; this.w = 0; this.h = 0; this.bar_ht = 0; this.but_h = 0; this.bar_y = 0; this.row_count = 0; this.scroll = 0; this.delta = 0; this.ratio = 1; this.rows_drawn = 0; this.row_h; this.scrollbar_height = 0; this.scrollable_lines = 0; this.scrollbar_travel = 0; this.stripe_w = 0; this.tree_w = 0;
    this.b_is_dragging = false; this.drag_distance_per_row; this.initial_drag_y = 0; // dragging
    this.leave = function() {if (this.b_is_dragging) return; this.hover = false; this.hover_o = false; window.RepaintRect(Math.round(this.x), Math.round(this.y), this.w, this.h);}
    this.nearest = function(y) {y = (y - this.but_h) / this.scrollbar_height * this.scrollable_lines * this.row_h; y = y / this.row_h; y = Math.round(y) * this.row_h; return y;}
    this.reset = function() {this.delta = this.scroll = this.s1 = this.s2 = 0; this.metrics(this.x, this.y, this.w, this.h, this.rows_drawn, this.row_h);}
    this.scroll_timer = function() {var that = this; this.draw_timer = window.SetInterval(function() {if (ui.w < 1 || !window.IsVisible) return; that.smooth_scroll();}, 16);}
    this.set_rows = function(row_count) {this.row_count = row_count; this.metrics(this.x, this.y, this.w, this.h, this.rows_drawn, this.row_h);}
    this.wheel = function(step, pgkey) {this.check_scroll(this.scroll + step * - (this.scroll_step || pgkey ? this.rows_drawn : 3) * this.row_h);}

    this.metrics = function(x, y, w, h, rows_drawn, row_h) {
        this.x = x; this.y = Math.round(y); this.w = w; this.h = h; this.rows_drawn = rows_drawn; if (!p.autofit) this.rows_drawn = Math.floor(this.rows_drawn); this.row_h = row_h; this.but_h = ui.but_h;
        // draw info
        this.scrollbar_height = Math.round(this.h - this.but_h * 2);
        this.bar_ht = Math.max(Math.round(this.scrollbar_height * this.rows_drawn / this.row_count), 12);
        this.scrollbar_travel = this.scrollbar_height - this.bar_ht;
        // scrolling info
        this.scrollable_lines = this.row_count - this.rows_drawn;
        this.ratio = this.row_count / this.scrollable_lines;
        this.bar_y = this.but_h + this.scrollbar_travel * (this.delta * this.ratio) / (this.row_count * this.row_h);
        this.drag_distance_per_row = this.scrollbar_travel / this.scrollable_lines;
        // panel info
        this.tree_w = ui.w - Math.max(ui.scrollbar_show && this.scrollable_lines > 0 ? ui.sbar_sp + ui.sel : ui.sel, ui.margin);
        if (ui.alternate) this.stripe_w = ui.scrollbar_show && ui.scr_type && this.scrollable_lines > 0 ? ui.w - ui.sbar_sp : ui.w;
    }

    this.draw = function(gr) {if (this.scrollable_lines > 0) {try {
        switch (ui.scr_type) {
            case 0:
                switch (ui.scr_col) {
                    case 0: gr.FillSolidRect(this.x, this.y + this.bar_y, this.w, this.bar_ht, RGBA(ui.ct, ui.ct, ui.ct, !this.hover && !this.b_is_dragging ? 75 : this.hover && !this.b_is_dragging ? 128 : 192)); break;
                    case 1: gr.FillSolidRect(this.x, this.y + this.bar_y, this.w, this.bar_ht, ui.textcol & (!this.hover && !this.b_is_dragging ? 0x44ffffff : this.hover && !this.b_is_dragging ? 0x77ffffff : 0x99ffffff)); break;
                } break;
            case 1:
                switch (ui.scr_col) {
                    case 0: gr.FillSolidRect(this.x, this.y - p.sbar_o, this.w, this.h + p.sbar_o * 2, RGBA(ui.ct, ui.ct, ui.ct, 15)); gr.FillSolidRect(this.x, this.y + this.bar_y, this.w, this.bar_ht, RGBA(ui.ct, ui.ct, ui.ct, !this.hover && !this.b_is_dragging ? 75 : this.hover && !this.b_is_dragging ? 128 : 192)); break;
                    case 1: gr.FillSolidRect(this.x, this.y - p.sbar_o, this.w, this.h + p.sbar_o * 2, ui.textcol & 0x15ffffff); gr.FillSolidRect(this.x, this.y + this.bar_y, this.w, this.bar_ht, ui.textcol & (!this.hover && !this.b_is_dragging ? 0x33ffffff : this.hover && !this.b_is_dragging ? 0x55ffffff : 0x99ffffff)); break;
                } break;
            case 2: ui.theme.SetPartAndStateId(6, 1); ui.theme.DrawThemeBackground(gr, this.x, this.y, this.w, this.h); ui.theme.SetPartAndStateId(3, !this.hover && !this.b_is_dragging ? 1 : this.hover && !this.b_is_dragging ? 2 : 3); ui.theme.DrawThemeBackground(gr, this.x, this.y + this.bar_y, this.w, this.bar_ht); break;
        }} catch (e) {}}
    }

    this.lbtn_up = function(p_x, p_y) {
        var x = p_x - this.x; var y = p_y - this.y;
        if (this.b_is_dragging) this.b_is_dragging = false; window.RepaintRect(Math.round(this.x), Math.round(this.y), this.w, this.h); this.initial_drag_y = 0;
        if (this.timer_but) {window.ClearInterval(this.timer_but); this.timer_but = false;}; this.count = -1;
    }

    this.lbtn_dn = function(p_x, p_y) {
        var x = p_x - this.x; var y = p_y - this.y;
        if (x < 0 || x > this.w || y < 0 || y > this.h || this.row_count <= this.rows_drawn) return;
        if (y < this.but_h || y > this.h - this.but_h) return;
        if (y < this.bar_y) var dir = 1; // above bar
        else if (y > this.bar_y + this.bar_ht) var dir = -1; // below bar
        if (y < this.bar_y || y > this.bar_y + this.bar_ht)
            this.check_scroll(this.nearest(y));
        else { // on bar
            this.b_is_dragging = true; window.RepaintRect(Math.round(this.x), Math.round(this.y), this.w, this.h);
            this.initial_drag_y = y - this.bar_y;
        }
    }

    this.move = function(p_x, p_y) {
        var x = p_x - this.x; var y = p_y - this.y;
        if (x < 0 || x > this.w || y > this.bar_y + this.bar_ht || y < this.bar_y) this.hover = false; else this.hover = true;
        if (this.hover != this.hover_o) window.RepaintRect(Math.round(this.x), Math.round(this.y), this.w, this.h); this.hover_o = this.hover;
        if (!this.b_is_dragging || this.row_count <= this.rows_drawn) return;
        this.check_scroll(Math.round((y - this.initial_drag_y - this.but_h) / this.drag_distance_per_row) * this.row_h);
    }

    this.check_scroll = function(new_scroll) {
        var s = Math.max(0, Math.min(new_scroll, this.scrollable_lines * this.row_h));
        if (s == this.scroll) return; this.scroll = s;
        if (this.smooth) {if (!this.draw_timer) this.scroll_timer();}
        if (!this.smooth || this.draw_timer === 0) {this.delta = this.scroll; this.bar_y = this.but_h + this.scrollbar_travel * (this.delta * this.ratio) / (this.row_count * this.row_h); p.tree_paint();}
    }

    this.smooth_scroll = function() {
        if (this.delta <= 0.5) {this.delta = 0; this.bar_y = this.but_h + this.scrollbar_travel * (this.delta * this.ratio) / (this.row_count * this.row_h); p.tree_paint();}
        if (Math.abs(this.scroll - this.delta) > 0.5) {
            this.s1 += (this.scroll - this.s1) * smoothness; this.s2 += (this.s1 - this.s2) * smoothness; this.delta += (this.s2 - this.delta) * smoothness;
            this.bar_y = this.but_h + this.scrollbar_travel * (this.delta * this.ratio) / (this.row_count * this.row_h); p.tree_paint();
        } else if (this.draw_timer) {window.ClearTimeout(this.draw_timer); this.draw_timer = false;}
    }

    this.but = function(dir) {
        this.check_scroll(this.scroll + (dir * -this.row_h));
        if (!this.timer_but) {var that = this; this.timer_but = window.SetInterval(function() {if (that.count > 6) {that.check_scroll(that.scroll + (dir * -that.row_h));} else that.count++;}, 40);}
    }
}
var sbar = new scrollbar();

function panel_operations() {
    var def_ppt = window.GetProperty(" View by Folder Structure: Name // Pattern", "View by Folder Structure // Pattern Not Configurable");
    var DT_LEFT = 0x00000000, DT_CENTER = 0x00000001, DT_RIGHT = 0x00000002, DT_VCENTER = 0x00000004, DT_SINGLELINE = 0x00000020, DT_CALCRECT = 0x00000400, DT_NOPREFIX = 0x00000800, DT_END_ELLIPSIS = 0x00008000, grps = [], i = 0, sort = "", js_stnd = window.GetProperty("ADV.Scrollbar Height Always Full", true); js_stnd = !js_stnd ? 2 : 0;
    var view_ppt = [
        window.GetProperty(" View 01: Name // Pattern", "View by Artist // %artist%|%album%|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%"),
        window.GetProperty(" View 02: Name // Pattern", "View by Album Artist // %album artist%|%album%|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%"),
        window.GetProperty(" View 03: Name // Pattern", "View by Album Artist - Album // [%album artist% - ]['['%date%']' ]%album%|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%"),
        window.GetProperty(" View 04: Name // Pattern", "View by Album // %album%[ '['%album artist%']']|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%"),
        window.GetProperty(" View 05: Name // Pattern", "View by Genre // %<genre>%|[%album artist% - ]%album%|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%"),
        window.GetProperty(" View 06: Name // Pattern", "View by Year // %date%|[%album artist% - ]%album%|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%")
    ];
    var nm = "", ppt_l = view_ppt.length + 1; for (i = ppt_l; i < ppt_l + 93; i++) {nm = window.GetProperty(" View " + (i < 10 ? "0" + i : i) + ": Name // Pattern"); if (nm && nm != " // ") view_ppt.push(window.GetProperty(" View " + (i < 10 ? "0" + i : i) + ": Name // Pattern"));}
    if (!window.GetProperty("SYSTEM.View Update", false)) {i = view_ppt.length + 1; window.SetProperty(" View " + (i < 10 ? "0" + i : i) + ": Name // Pattern", null); view_ppt.push(window.GetProperty(" View " + (i < 10 ? "0" + i : i) + ": Name // Pattern", "View by Path // $directory_path(%path%)|%filename_ext%")); window.SetProperty("SYSTEM.View Update", true);}

    var filter_ppt = [
        window.GetProperty(" View Filter 01: Name // Query", "Filter // Query Not Configurable"),
        window.GetProperty(" View Filter 02: Name // Query", "Lossless // \"$info(encoding)\" IS lossless"),
        window.GetProperty(" View Filter 03: Name // Query", "Lossy // \"$info(encoding)\" IS lossy"),
        window.GetProperty(" View Filter 04: Name // Query", "Missing Replaygain // %replaygain_track_gain% MISSING"),
        window.GetProperty(" View Filter 05: Name // Query", "Never Played // %play_count% MISSING"),
        window.GetProperty(" View Filter 06: Name // Query", "Played Often // %play_count% GREATER 9"),
        window.GetProperty(" View Filter 07: Name // Query", "Recently Added // %added% DURING LAST 2 WEEKS"),
        window.GetProperty(" View Filter 08: Name // Query", "Recently Played // %last_played% DURING LAST 2 WEEKS"),
        window.GetProperty(" View Filter 09: Name // Query", "Top Rated // rating IS 5")
    ];
    var filt_l = filter_ppt.length + 1; for (i = filt_l; i < filt_l + 90; i++) {nm = window.GetProperty(" View Filter " + (i < 10 ? "0" + i : i) + ": Name // Query"); if (nm && nm != " // ") filter_ppt.push(window.GetProperty(" View Filter " + (i < 10 ? "0" + i : i) + ": Name // Query"));}

    this.cc = DT_CENTER | DT_VCENTER | DT_CALCRECT | DT_NOPREFIX; this.l = DT_LEFT | DT_VCENTER | DT_SINGLELINE | DT_CALCRECT | DT_NOPREFIX; this.lc = DT_VCENTER | DT_CALCRECT | DT_NOPREFIX | DT_END_ELLIPSIS; this.rc = DT_RIGHT | DT_VCENTER | DT_CALCRECT | DT_NOPREFIX; this.s_lc = StringFormat(0, 1)
    this.f_w = []; this.f_h = 0; this.f_x1 = 0; this.filt = []; this.folder_view = 10; this.grp = []; this.grp_sort = ""; this.grp_split = []; this.grp_split_clone = []; this.grp_split_orig = []; this.f_menu = []; this.menu = []; this.multi_value = []; this.m_x = 0; this.m_y = 0; this.pos = -1; this.s_cursor = false; this.s_search = false; this.s_txt = ""; this.s_x = 0; this.s_h = 0; this.s_w1 = 0; this.s_w2 = 0; this.statistics = false; this.tf = ""; this.yttm_mng = false;
    this.autofit = window.GetProperty(" Auto Fit", true);
    this.base = window.GetProperty(" Node: Show All Music", false);
    this.syncType = window.GetProperty(" Library Sync: Auto-0, Initialisation Only-1", 0);
    this.s_show = window.GetProperty(" Search: Hide-0, SearchOnly-1, Search+Filter-2", 2);
    if (!this.s_show) this.autofit = true;
    if (!ui.zoomUpd && window.GetProperty("SYSTEM.Software Notice Checked")) window.SetProperty(" Zoom Filter Size (%)", window.GetProperty(" Zoom Filter Size (%)", 100) / ui.scale);
    this.scale = Math.max(window.GetProperty(" Zoom Filter Size (%)", 100) / 100, 0.7); window.SetProperty(" Zoom Filter Size (%)", this.scale * 100);
    this.f_font = gdi.Font("Segoe UI", this.scale > 1.05 ? Math.floor(11 * ui.scale * this.scale) : 11 * ui.scale * this.scale, 1);
    this.f_but_ft = gdi.Font("Segoe UI", this.scale > 1.05 ? Math.floor(9 * ui.scale * this.scale) : 9 * ui.scale * this.scale, 1);
    this.filter_by = window.GetProperty("SYSTEM.Filter By", 0);
    this.full_line = window.GetProperty(" Text Whole Line Clickable", false);
    this.items = function() {return plman.GetPlaylistItems(-1);}; this.list = this.items();
    this.pn_h_auto = window.GetProperty("ADV.Height Auto [Expand/Collapse With All Music]", false) && this.base; this.init = true;
    this.pn_h_max = window.GetProperty("ADV.Height Auto-Expand", 578); this.pn_h_min = window.GetProperty("ADV.Height Auto-Collapse", 86);
    if (this.pn_h_auto) {this.pn_h = window.GetProperty("SYSTEM.Height", 578); window.MaxHeight = window.MinHeight = this.pn_h;}
    this.reset = window.GetProperty("SYSTEM.Reset Tree", false);
    this.search_paint = function() {window.RepaintRect(Math.round(ui.margin), 0, ui.w - ui.margin, this.s_h);}
    this.set_statistics_mode = function() {this.statistics = false; var chk = this.grp[this.view_by].name + this.grp[this.view_by].type + this.filt[this.filter_by].name + this.filt[this.filter_by].type; chk = chk.toUpperCase(); if (chk.indexOf("ADD") != -1 || chk.indexOf("PLAY") != -1 || chk.indexOf("RATING") != -1) this.statistics = true;}
    this.setHeight = function(n) {if (!this.pn_h_auto) return; this.pn_h = n ? this.pn_h_max : this.pn_h_min; window.MaxHeight = window.MinHeight = this.pn_h; window.SetProperty("SYSTEM.Height", this.pn_h);}
    this.show_counts = window.GetProperty(" Node: Item Counts 0-Hide 1-Tracks 2-Sub-Items", 1);
    this.show_tracks = window.GetProperty(" Node: Show Tracks", true);
    this.sort = function(li) {switch (this.view_by) {case this.folder_view: li.OrderByPath(); li.OrderByRelativePath(); break; default: li.OrderByFormat(fb.TitleFormat(this.grp_sort), 1); break;}}
    var paint_y = this.s_show || !ui.scrollbar_show ? this.s_h : 0;
    this.tree_paint = function() {window.RepaintRect(0, Math.round(Math.floor(paint_y)), ui.w, Math.round(ui.h - paint_y) + 1);}
    this.view_by = window.GetProperty("SYSTEM.View By", 1);
    this.calc_text = function() {
        this.f_w = []; var im = gdi.CreateImage(1, 1), g = im.GetGraphics();
        for (i = 0; i < this.filt.length; i++) {this.f_w[i] = g.CalcTextWidth(this.filt[i].name, this.f_font); if (!i) this.f_h = g.CalcTextHeight("String", this.f_font);}
        this.f_sw = g.CalcTextWidth("   ▼", this.f_but_ft);
        this.f_x1 = ui.w - ui.margin - this.f_w[this.filter_by] - this.f_sw;
        this.s_w2 = this.s_show > 1 ? this.f_x1 - this.s_x - 11 : this.s_w1 - Math.round(ui.row_h * 0.75) - this.s_x + 1;
        im.ReleaseGraphics(g); im.Dispose();
    }

    this.fields = function(view, filter) {
        this.filt = []; this.folder_view = 10; this.grp = []; this.grp_sort = ""; this.multi_process = false; this.filter_by = filter; this.mv_sort = ""; this.view = ""; this.view_by = view;
        for (i = 0; i < view_ppt.length; i++) {if (view_ppt[i].indexOf("//") != -1) {grps = view_ppt[i].split("//"); this.grp[i] = {name:grps[0].trim(), type:grps[1]}}} grps = [];
        for (i = 0; i < filter_ppt.length; i++) {if (filter_ppt[i].indexOf("//") != -1) {grps = filter_ppt[i].split("//"); this.filt[i] = {name:grps[0].trim(), type:grps[1].trim()}}}
        i = this.grp.length; while (i--) if (!this.grp[i] || this.grp[i].name == "" || this.grp[i].type == "") this.grp.splice(i, 1);
        i = this.filt.length; while (i--) if (!this.filt[i] || this.filt[i].name == "" || this.filt[i].type == "") this.filt.splice(i, 1);
        this.grp[this.grp.length] = {name: def_ppt.split("//")[0].trim(), type: ""}
        this.folder_view = this.grp.length - 1; this.filter_by = Math.min(this.filter_by, this.filt.length - 1); this.view_by = Math.min(this.view_by, this.grp.length - 1);
        if (this.grp[this.view_by].type.indexOf("%<") != -1) this.multi_process = true; this.cond = false; this.unbranched = false;
        if (this.view_by != this.folder_view) {
            if (this.multi_process) this.mv_sort = (this.grp[this.view_by].type.indexOf("album artist") != -1 || this.grp[this.view_by].type.indexOf("%artist%") == -1 && this.grp[this.view_by].type.indexOf("%<artist>%") == -1 && this.grp[this.view_by].type.indexOf("$meta(artist") == -1 ? "%album artist%" : "%artist%") + "|%album%|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%";
            this.grp_split = this.grp[this.view_by].type.replace(/^\s+/, "").split("|");
            var chkCond = this.grp[this.view_by].type.replace(/[^\[\]\(\)\|]/g, '').replace(/\(\)/g,"").replace(/\[\]/g,""); if (chkCond.indexOf("(|") != -1 || chkCond.indexOf("[|") != -1 || this.show_counts == 2) this.cond = true;
            var count = (this.grp[this.view_by].type.match(/\|/g) || []).length; if (!count && !this.cond) this.unbranched = true;
            if (!this.cond) this.tf = this.grp_split.length > 1 ? this.grp_split.pop() : this.grp_split[0];
            for (i = 0; i < this.grp_split.length; i++) {
                this.multi_value[i] = this.grp_split[i].indexOf("%<") != -1 ? true : false;
                if (this.multi_value[i]) {
                    this.grp_split_orig[i] = this.grp_split[i].slice();
                    this.grp_split[i] = this.grp_split[i].replace(/%<album artist>%/i,"$if3(%<#album artist#>%,%<#artist#>%,%<#composer#>%,%<#performer#>%)").replace(/%<album>%/i,"$if2(%<#album#>%,%<#venue#>%)").replace(/%<artist>%/i,"$if3(%<artist>%,%<album artist>%,%<composer>%,%<performer>%)").replace(/<#/g,"<").replace(/#>/g,">");
                    this.grp_split_clone[i] = this.grp_split[i].slice();
                    this.grp_split[i] = this.grp_split_orig[i].replace(/[<>]/g,"");
                }
                this.grp_sort += (this.grp_split[i] + "|");
                if (this.multi_value[i]) this.grp_split[i] = this.grp_split_clone[i].replace(/%</g, "#!#$meta_sep(").replace(/>%/g, "," + "@@)#!#");
                this.view += (this.grp_split[i] + "|");
            }
            this.view = this.view.slice(0, -1);
            if (!this.cond) {
                if (this.tf.indexOf("%<") != -1) this.tf = this.tf.replace(/%<album artist>%/i,"$if3(%<#album artist#>%,%<#artist#>%,%<#composer#>%,%<#performer#>%)").replace(/%<album>%/i,"$if2(%<#album#>%,%<#venue#>%)").replace(/%<artist>%/i,"$if3(%<artist>%,%<album artist>%,%<composer>%,%<performer>%)").replace(/<#/g,"<").replace(/#>/g,">");
                this.grp_sort = this.grp_sort + this.tf.replace(/[<>]/g,"");
                if (this.tf.indexOf("%<") != -1) this.tf = this.tf.replace(/%</g, "#!#$meta_sep(").replace(/>%/g, "," + "@@)#!#");
            }
        } this.set_statistics_mode(); window.SetProperty("SYSTEM.Filter By", filter); window.SetProperty("SYSTEM.View By", view);
        this.f_menu = []; this.menu = []; for (i = 0; i < this.grp.length; i++) this.menu.push(this.grp[i].name);
        for (i = 0; i < this.filt.length; i++) {this.f_menu.push(this.filt[i].name);}
        this.menu.splice(this.menu.length, 0, "Panel Properties");
        if (this.syncType) this.menu.splice(this.menu.length, 0, "Refresh");
        this.menu.splice(this.menu.length, 0, "Configure...");
        this.calc_text();
    }
    this.fields(this.view_by, this.filter_by);

    var k = 1; for (i = 0; i < 100; i++) {nm = window.GetProperty(" View " + (i < 10 ? "0" + i : i) + ": Name // Pattern"); if (nm && nm != " // ") {window.SetProperty(" View " + (k < 10 ? "0" + k : k) + ": Name // Pattern", nm); k += 1} else window.SetProperty(" View " + (i < 10 ? "0" + i : i) + ": Name // Pattern", null);}
    for (i = k; i < k + 5; i++) window.SetProperty(" View " + (i < 10 ? "0" + i : i) + ": Name // Pattern", " // ");
    k = 1; for (i = 0; i < 100; i++) {nm = window.GetProperty(" View Filter " + (i < 10 ? "0" + i : i) + ": Name // Query"); if (nm && nm != " // ") {window.SetProperty(" View Filter " + (k < 10 ? "0" + k : k) + ": Name // Query", nm); k += 1} else window.SetProperty(" View Filter " + (i < 10 ? "0" + i : i) + ": Name // Query", null);}
    for (i = k; i < k + 5; i++) window.SetProperty(" View Filter " + (i < 10 ? "0" + i : i) + ": Name // Query", " // ");

    this.on_size = function() {
        this.f_x1 = ui.w - ui.margin - this.f_w[this.filter_by] - this.f_sw;
        this.s_x = Math.round(ui.margin + ui.row_h);
        this.s_w1 = ui.w - ui.margin;
        this.s_w2 = this.s_show > 1 ? this.f_x1 - this.s_x - 11 : this.s_w1 - Math.round(ui.row_h * 0.75) - this.s_x + 1;
        this.ln_sp = this.s_show && !ui.local ? Math.floor(ui.row_h * 0.1) : 0;
        this.s_h = this.s_show ? ui.row_h + (!ui.local ? this.ln_sp * 2 : 0) : ui.margin;
        this.s_sp = this.s_h - this.ln_sp;
        this.sp = ui.h - this.s_h - (this.s_show ? 0 : ui.margin);
        this.rows = this.sp / ui.row_h;
        if (this.autofit) {this.rows = Math.floor(this.rows); this.sp = ui.row_h * this.rows;}
        this.node_y = Math.round((ui.row_h - ui.node_sz) / 1.75);
        var sbar_top = !ui.scr_type ? 5 : this.s_show ? 3 : 0, sbar_bot = !ui.scr_type ? 5 : 0;
        this.sbar_o = [ui.arrow_pad, Math.max(Math.floor(ui.scr_but_w * 0.2), 3) + ui.arrow_pad * 2, 0][ui.scr_type];
        this.sbar_x = ui.w - ui.sbar_sp;
        var top_corr = [this.sbar_o - (ui.but_h - ui.scr_but_w) / 2, this.sbar_o, 0][ui.scr_type];
        var bot_corr = [(ui.but_h - ui.scr_but_w) / 2 - this.sbar_o, -this.sbar_o, 0][ui.scr_type];
        var sbar_y = (ui.scr_type < js_stnd || this.s_show ? this.s_sp + 1 : 0) + sbar_top + top_corr;
        var sbar_h = ui.scr_type < js_stnd && this.autofit ? this.sp + 1 - sbar_top - sbar_bot + bot_corr * 2 : ui.h - sbar_y  - sbar_bot + bot_corr;
        if (ui.scr_type == 2) {sbar_y += 1; sbar_h -= 2;}
        sbar.metrics(this.sbar_x, sbar_y, ui.scr_w, sbar_h, this.rows, ui.row_h);
    }
}
var p = new panel_operations(); window.DlgCode = 0x004;

function v_keys() {
    this.selAll = 1; this.copy = 3; this.back = 8; this.enter = 13; this.shift = 16; this.paste = 22; this.cut = 24; this.redo = 25; this.undo = 26; this.pgUp = 33; this.pgDn = 34; this.end = 35; this.home = 36; this.left = 37; this.up = 38; this.right = 39; this.dn = 40; this.del = 46;
    this.k = function(n) {switch (n) {case 0: return utils.IsKeyPressed(0x10); break; case 1: return utils.IsKeyPressed(0x11); break; case 2: return utils.IsKeyPressed(0x12); break; case 3: return utils.IsKeyPressed(0x11) && utils.IsKeyPressed(0x12); break;}}
}
var v = new v_keys();

function library_manager() {
    var exp = [], expanded_items = [], lib_update = false, name_idx = [], name_ix = [], node = [], node_s = [],  process = false, scr = [], sel = [];
    this.allmusic = []; this.list; this.none = ""; this.node = []; this.root = []; this.time = fb.CreateProfiler(); this.upd = false, this.upd_search = false;
    var tr_sort = function(data) {data.sort(function(a, b) {return parseFloat(a.tr) - parseFloat(b.tr)}); return data;}
    this.update = function() {if (ui.w < 1 || !window.IsVisible) this.upd = true; else {this.refresh(); this.upd = false;}}

    this.refresh = function(b) {
        if (this.upd) {p.search_paint(); p.tree_paint();} try {
            var ix = -1, tr = 0; process = false;
            if (pop.tree.length && (!b || b && !p.reset)) {
                tr = 0; expanded_items = []; process = true; scr = []; sel = [];
                for (var i = 0; i < pop.tree.length; i++) {
                    tr = !p.base ? pop.tree[i].tr : pop.tree[i].tr - 1; if (pop.tree[i].child.length) expanded_items.push({tr:tr, a:tr < 1 ? pop.tree[i].name : pop.tree[pop.tree[i].par].name, b:tr < 1 ? "" : pop.tree[i].name});
                    tr = pop.tree[i].tr; if (pop.tree[i].sel == true) sel.push({tr:tr, a:pop.tree[i].name, b:tr != 0 ? pop.tree[pop.tree[i].par].name : "", c:tr > 1 ? pop.tree[pop.tree[pop.tree[i].par].par].name : ""});
                }
                var l = Math.min(Math.floor(p.rows),pop.tree.length); ix = pop.get_ix(0, p.s_h + ui.row_h / 2, true, false); tr = 0;
                for (var i = ix; i < ix + l; i++) {tr = pop.tree[i].tr; scr.push({tr:tr, a:pop.tree[i].name, b:tr != 0 ? pop.tree[pop.tree[i].par].name : "", c:tr > 1 ? pop.tree[pop.tree[pop.tree[i].par].par].name : ""})}
                exp = JSON.parse(JSON.stringify(tr_sort(expanded_items)));
            }} catch (e) {}
        lib_update = true; this.get_library(); this.rootNodes();
    }

    this.get_library = function() {
        this.empty = ""; if (this.list) this.list.Dispose(); if (p.list) p.list.Dispose(); this.time.Reset(); this.none = ""; this.list = fb.GetLibraryItems();
        if (!this.list.Count || !fb.IsLibraryEnabled()) {pop.tree = []; pop.line_l = 0; sbar.set_rows(0); this.empty = "Nothing to show\n\nConfigure Media Library first\n\nFile>Preferences>Media library"; p.tree_paint(); return;}
        if (p.filter_by > 0 && p.s_show > 1) try {this.list = fb.GetQueryItems(this.list, p.filt[p.filter_by].type)} catch(e) {};
        if (!this.list.Count) {pop.tree = []; pop.line_l = 0; sbar.set_rows(0); this.none = "Nothing found"; p.tree_paint(); return;} this.rootNames("", 0);
    }

    this.rootNames = function(li, search) {
        var i = 0, tf = fb.TitleFormat(p.view), total;
        switch (search) {case 0: p.sort(this.list); li = p.list = this.list; name_idx = []; break; case 1: name_ix = []; break;}
        total = li.Count;
        var tree_type = !search ? p.view_by != p.folder_view ? !p.base ? 0 : 1 : !p.base ? 2 : 3 : p.view_by != p.folder_view ? !p.base ? 4 : 5 : !p.base ? 6 : 7;
        switch (tree_type) {
            case 0: for (i = 0; i < total; i++) {node[i] = tf.EvalWithMetadb(li.Item(i)).split("|"); name_idx[i] = !node[i][0].length || node[i][0] == "#!##!#" ? "?" : node[i][0];}; break;
            case 1: for (i = 0; i < total; i++) {node[i] = tf.EvalWithMetadb(li.Item(i)).split("|");}; break;
            case 2: for (i = 0; i < total; i++) {node[i] = fb.GetLibraryRelativePath(li.Item(i)).split("\\"); name_idx[i] = node[i][0];}; break;
            case 3: for (i = 0; i < total; i++) {node[i] = fb.GetLibraryRelativePath(li.Item(i)).split("\\");}; break;
            case 4: for (i = 0; i < total; i++) {node_s[i] = tf.EvalWithMetadb(li.Item(i)).split("|"); name_ix[i] = !node_s[i][0].length || node_s[i][0] == "#!##!#" ? "?" : node_s[i][0];}; break;
            case 5: for (i = 0; i < total; i++) {node_s[i] = tf.EvalWithMetadb(li.Item(i)).split("|");}; break;
            case 6: for (i = 0; i < total; i++) {node_s[i] = fb.GetLibraryRelativePath(li.Item(i)).split("\\"); name_ix[i] = node_s[i][0];}; break;
            case 7: for (i = 0; i < total; i++) {node_s[i] = fb.GetLibraryRelativePath(li.Item(i)).split("\\");}; break;
        }
    }

    this.rootNodes = function() {
        this.root = []; var i = 0, j = 1, h = 0, l = 0, n = "";
        if (p.s_txt && (this.upd_search || lib_update)) {
            if (!this.list.Count) return; this.none = ""; try {p.list = fb.GetQueryItems(this.list, p.s_txt)} catch(e) {};
            if (!p.list.Count) {pop.tree = []; pop.line_l = 0; sbar.set_rows(0); this.none = "Nothing found"; p.tree_paint(); return;}
            this.rootNames(p.list, 1); this.node = node_s.slice(); this.upd_search = false;
        } else if (!p.s_txt) {p.list = this.list; this.node = node.slice()};
        var arr = !p.s_txt ? name_idx : name_ix, n_o = "#get_node#", nU = "", total = p.list.Count;
        if (!p.base) for (l = 0; l < total; l++) {n = arr[l]; nU = n.toUpperCase(); if (nU != n_o) {n_o = nU; this.root[i] = {name:n, sel:false, child:[], item:[]}; this.root[i].item.push(l); i++;} else this.root[i - 1].item.push(l);}
        else {this.root[0] = {name:"All Music", sel:false, child:[], item:[]}; for (l = 0; l < total; l++) this.root[0].item.push(l);}
        if (!lib_update) sbar.reset();
        /* Draw tree -> */ if (!p.base || p.s_txt) pop.buildTree(this.root, 0); if (p.base) pop.branch(this.root[0], true); if (p.pn_h_auto && (p.init || lib_update) && p.pn_h == p.pn_h_min && pop.tree[0]) pop.clear_child(pop.tree[0]); p.init = false; // ui.trace("populated in: " + this.time.Time / 1000 + " seconds");
        if (lib_update && process) { try {
            var exp_l =  exp.length, scr_l = scr.length, sel_l = sel.length, tree_l = pop.tree.length;
            for (h = 0; h < exp_l; h++) {
                if (exp[h].tr == 0) {for (j = 0; j < tree_l; j++) if (pop.tree[j].name.toUpperCase() == exp[h].a.toUpperCase()) {pop.branch(pop.tree[j]); tree_l = pop.tree.length; break;}}
                else if (exp[h].tr > 0) {for (j = 0; j < tree_l; j++) if (pop.tree[j].name.toUpperCase() == exp[h].b.toUpperCase() && pop.tree[pop.tree[j].par].name.toUpperCase() == exp[h].a.toUpperCase()) {pop.branch(pop.tree[j]); tree_l = pop.tree.length; break;}}
            }
            for (h = 0; h < sel_l; h++) {
                if (sel[h].tr == 0) {for (j = 0; j < tree_l; j++) if (pop.tree[j].name.toUpperCase() == sel[h].a.toUpperCase()) {pop.tree[j].sel = true; break;}}
                else if (sel[h].tr == 1) {for (j = 0; j < tree_l; j++) if (pop.tree[j].name.toUpperCase() == sel[h].a.toUpperCase() && pop.tree[pop.tree[j].par].name.toUpperCase() == sel[h].b.toUpperCase()) {pop.tree[j].sel = true; break;}}
                else if (sel[h].tr > 1) {for (j = 0; j < tree_l; j++) if (pop.tree[j].name.toUpperCase() == sel[h].a.toUpperCase() && pop.tree[pop.tree[j].par].name.toUpperCase() == sel[h].b.toUpperCase() && pop.tree[pop.tree[pop.tree[j].par].par].name.toUpperCase() == sel[h].c.toUpperCase()) {pop.tree[j].sel = true; break;}}
            }
            var scr_pos = false; h = 0;
            while (h < scr_l && !scr_pos) {
                if (scr[h].tr == 0) {for (j = 0; j < tree_l; j++) if (pop.tree[j].name.toUpperCase() == scr[h].a.toUpperCase()) {sbar.check_scroll(!h ? j * ui.row_h : (j - 3) * ui.row_h); scr_pos = true; break;}}
                else if (scr[h].tr == 1 && !scr_pos) {for (j = 0; j < tree_l; j++) if (pop.tree[j].name.toUpperCase() == scr[h].a.toUpperCase() && pop.tree[pop.tree[j].par].name.toUpperCase() == scr[h].b.toUpperCase()) {sbar.check_scroll(!h ? j * ui.row_h : (j - 3) * ui.row_h); scr_pos = true; break;}}
                else if (scr[h].tr > 1 && !scr_pos) {for (j = 0; j < tree_l; j++) if (pop.tree[j].name.toUpperCase() == scr[h].a.toUpperCase() && pop.tree[pop.tree[j].par].name.toUpperCase() == scr[h].b.toUpperCase() && pop.tree[pop.tree[pop.tree[j].par].par].name.toUpperCase() == scr[h].c.toUpperCase()) {sbar.check_scroll(!h ? j * ui.row_h : (j - 3) * ui.row_h); scr_pos = true; break;}}
                h++;
            }
            if (!scr_pos) {sbar.reset(); p.tree_paint();}} catch(e) {};
        }
        if (lib_update && !process) {sbar.reset(); p.tree_paint();} lib_update = false;
    }
}
var lib = new library_manager();

function populate() {
    var get_pos = -1, ix_o = 0, last_sel = -1, m_i = -1, m_br = -1, nd= [], row_o = 0, tt = "", tooltip = window.GetProperty(" Tooltips", false), tt_c = 0, tt_y = 0, tt_id = -1;
    var autoplay = window.GetProperty(" Playlist: Play On Send From Menu", false);
    var btn_pl  = window.GetProperty(" Playlist Use: 0 or 1", "General,1,Alt+LeftBtn,1,MiddleBtn,1").replace(/\s+/g, "").split(",");
    if (btn_pl[0] == "LeftBtn") window.SetProperty(" Playlist Use: 0 or 1", "General," + btn_pl[1] + ",Alt+LeftBtn," + btn_pl[3] + ",MiddleBtn," + btn_pl[5]);
    var alt_lbtn_pl = btn_pl[3] == 1 ? true : false, mbtn_pl = btn_pl[5] == 1 ? true : false;
    var custom_sort = window.GetProperty(" Playlist: Custom Sort", "");
    var dbl_action = window.GetProperty(" Text Double-Click: ExplorerStyle-0 Play-1 Send-2", 1);
    var lib_playlist = window.GetProperty(" Playlist", "Library View");
    var sgl_fill = window.GetProperty(" Text Single-Click: AutoFill Playlist", true);
    var symb = window.CreateThemeManager("TREEVIEW");
    var im = gdi.CreateImage(ui.node_sz, ui.node_sz), g = im.GetGraphics(); if (ui.node_win) try {symb.SetPartAndStateId(2, 1); symb.SetPartAndStateId(2, 2); symb.DrawThemeBackground(g, 0, 0, ui.node_sz, ui.node_sz);} catch(e) {ui.node_win = 0;} im.ReleaseGraphics(g); im.Dispose();
    this.line_l = 0; this.sel_items = []; this.tree = [];
    if (!window.GetProperty("SYSTEM.Playlist Checked", false)) fb.ShowPopupMessage("Library Tree uses the following playlist by default:\n\nLibrary View\n\nIf you wish to use a different playlist, change the one used by Library Tree in panel properties.", "Library Tree"); window.SetProperty("SYSTEM.Playlist Checked", true);
    var arr_contains = function(arr, item) {for (var i = 0; i < arr.length; i++) if (arr[i] == item) return true; return false;}
    var arr_index = function(arr, item) {var n = -1; for (var i = 0; i < arr.length; i++) if (arr[i] == item) {n = i; break;} return n;}
    var check_node = function(gr) {if (sbar.draw_timer || !ui.node_win) return; try {symb.SetPartAndStateId(2, 1); symb.SetPartAndStateId(2, 2); symb.DrawThemeBackground(gr, -ui.node_sz, -ui.node_sz, ui.node_sz, ui.node_sz);} catch(e) {ui.node_win = 0;}}
    var draw_node = function(gr, j, x, y) {switch (ui.node_win) {case 0: if (!ui.hot && j > 1) j -= 2; x = Math.round(x); y = Math.round(y); gr.DrawImage(nd[j], x, y, nd[j].Width, nd[j].Height, 0, 0, nd[j].Width, nd[j].Height); break; case 1: if ( j > 1) j -= 2; symb.SetPartAndStateId(2, !j ? 1 : 2); symb.DrawThemeBackground(gr, x, y, ui.node_sz, ui.node_sz); break;}}
    var num_sort = function(a, b) {return a - b;}
    var plID = function(Playlist_Name) {for (var i = 0; i < plman.PlaylistCount; i++) if (plman.GetPlaylistName(i) == Playlist_Name) return i; plman.CreatePlaylist(plman.PlaylistCount, Playlist_Name); return i;}
    var sort = function (a, b) {a = a.name.replace(/^\?/,"").replace(/(\d+)/g, function (n) {return ('0000' + n).slice(-5)}); b = b.name.replace(/^\?/,"").replace(/(\d+)/g, function (n) {return ('0000' + n).slice(-5)}); return a.localeCompare(b);}
    var uniq = function(a) {var j = 0, len = a.length, out = [], seen = {}; for (var i = 0; i < len; i++) {var item = a[i]; if (seen[item] !== 1) {seen[item] = 1; out[j++] = item;}} return out.sort(num_sort);}
    this.add = function(x, y, pl) {if (y < p.s_h) return; var ix = this.get_ix(x, y, true, false); p.pos = ix; if (ix < this.tree.length && ix >= 0) if (this.check_ix(this.tree[ix], x, y, true)) {this.clear(); this.tree[ix].sel = true; this.get_sel_items(); this.load(this.sel_items, true, true, false, pl, false);}}
    this.auto = window.GetProperty(" Node: Auto Collapse", false);
    this.branch_chg = function(br) {var new_br = 0; if (br.tr == 0) {for (var i = 0; i < lib.root.length; i++) {new_br += lib.root[i].child.length; lib.root[i].child = [];}} else {var par = this.tree[br.par]; for (var i = 0; i < par.child.length; i++) {new_br += par.child[i].child.length; par.child[i].child = [];}} return new_br;}
    this.check_row = function(x, y) {m_br = -1; var im = this.get_ix(x, y, true, false); if (im >= this.tree.length || im < 0) return; var item = this.tree[im]; if (x < Math.round(ui.pad * item.tr) + ui.icon_w + ui.margin && (!item.track || p.base && item.tr == 0)) m_br = im; return im;}
    this.clear = function () {for (var i = 0; i < this.tree.length; i++) this.tree[i].sel = false;}
    this.clear_child = function(br) {br.child = []; this.buildTree(lib.root, 0, true, true);}
    this.deactivate_tooltip = function() {tt_c = 0; tt.Text = ""; tt.TrackActivate = false; tt.Deactivate(); p.tree_paint();}
    this.expandNodes = function(obj, am) {this.branch(obj, !am ? false : true, true, true); if (obj.child) for (var k = 0; k < obj.child.length; k++) if (!obj.child[k].track) this.expandNodes(obj.child[k]);}
    this.gen_pl = btn_pl[1] == 1 ? true : false;
    this.get_sel_items = function () {p.tree_paint(); var i = 0; this.sel_items = [];for (i = 0; i < this.tree.length; i++) if (this.tree[i].sel) this.sel_items.push.apply(this.sel_items, this.tree[i].item); this.sel_items = uniq(this.sel_items);}
    this.handle_list = null;
    this.leave = function(){if (men.r_up || tt.Text) return; m_br = -1; row_o = 0; m_i = -1; ix_o = 0; p.tree_paint();}
    this.mbtn_dn = function(x, y) {this.add(x, y, mbtn_pl);}
    this.row = function(y) {return Math.round((y - p.s_h - ui.row_h * 0.5) / ui.row_h);}
    this.selection_holder = fb.AcquireUiSelectionHolder();

    this.create_tooltip = function() {
        if (!tooltip) return; if (tt) tt.Dispose(); tt = window.CreateTooltip(ui.font.Name, ui.font.Size, ui.font.Style);
        tt_y = ui.row_h - window.GetProperty(" Row Vertical Item Padding", 3); tt_y = p.s_h - Math.floor((ui.row_h - tt_y) / 2)
        tt.SetDelayTime(0, 500); tt.Text = "";
    }

    this.activate_tooltip = function(ix, y) {
        if (tt_id == ix || Math.round(ui.pad * this.tree[ix].tr + ui.margin) + ui.icon_w + (!tooltip || !p.full_line ? this.tree[ix].w : this.tree[ix].tt_w) <= sbar.tree_w - ui.sel) return;
        if (tt_c == 2) {tt_id = ix; return;}
        tt_c += 1; tt.Activate(); tt.TrackActivate = true;
        tt.Text = this.tree[ix].name + this.tree[ix].count;
        tt.TrackPosition(Math.round(ui.pad * this.tree[ix].tr + ui.margin) + ui.icon_w - ui.tt, this.row(y) * ui.row_h + tt_y);
        p.tree_paint(); timer.tooltip();
    }

    this.branch = function(br, base, node, block) {
        if (!br || br.track) return; var br_l = br.item.length, folderView = p.view_by == p.folder_view ? true : false, i = 0, k = 0, isTrack = false, l = base ? 0 : p.base ? br.tr : br.tr + 1, n = "", n_o = "#get_branch#", nU = ""; if (folderView) base = false; if (base) node = false;
        switch (true) {
            case (p.cond):
                for (k = 0; k < br_l; k++) {
                    var pos = br.item[k];
                    try {
                        if (base) {n = lib.node[pos][l]; if (!n || n == "#!##!#") n = "?";}
                        if (!p.s_txt && !base || p.s_txt) { if (l < lib.node[pos].length - 1) {n = lib.node[pos][l]; if (!n || n == "#!##!#") n = "?";} else n = "#get_track#";}
                        isTrack = p.show_tracks ? false : l < lib.node[pos].length - 2 ? false : true;
                        if (n == "#get_track#") {n = lib.node[pos][l]; isTrack = true;} nU = n.toUpperCase();
                        if (n_o != nU) {n_o = nU; br.child[i] = {name:n, sel:false, child:[], track:isTrack, item:[]}; br.child[i].item.push(pos); i++;} else br.child[i - 1].item.push(pos);
                    } catch (e) {}
                }
                break;
            case (!p.cond):
                var tf = fb.TitleFormat(p.tf);
                for (k = 0; k < br_l; k++) {
                    var pos = br.item[k];
                    try {
                        if (base) {n = lib.node[pos][l]; if (!n || n == "#!##!#") n = "?";}
                        if (!p.s_txt && !base || p.s_txt) { if (!folderView && l < lib.node[pos].length || folderView && l < lib.node[pos].length - 1) {n = lib.node[pos][l]; if (!n || n == "#!##!#") n = "?";} else n = "#get_track#";}
                        isTrack = p.show_tracks ? false : !folderView && l < lib.node[pos].length - 1 || folderView && l < lib.node[pos].length - 2 ? false : true;
                        if (n == "#get_track#") {n = !folderView ? tf.EvalWithMetadb(p.list.Item(pos)) : lib.node[pos][l]; isTrack = true;} nU = n.toUpperCase();
                        if (n_o != nU) {n_o = nU; br.child[i] = {name:n, sel:false, child:[], track:isTrack, item:[]}; br.child[i].item.push(pos); i++;} else br.child[i - 1].item.push(pos);
                    } catch (e) {}
                }
                break;
        } this.buildTree(lib.root, 0, node, true, block);
    }

    var getAllCombinations = function(n) {
        var combinations = [], divisors = [], nn = [], arraysToCombine = []; nn = n.split("#!#");
        for (var i = 0; i < nn.length; i++) {nn[i] = nn[i].split("@@"); if (nn[i] != "") arraysToCombine.push(nn[i]);}
        for (var i = arraysToCombine.length - 1; i >= 0; i--) divisors[i] = divisors[i + 1] ? divisors[i + 1] * arraysToCombine[i + 1].length : 1;
        function getPermutation(n, arraysToCombine) {
            var result = [], curArray;
            for (var i = 0; i < arraysToCombine.length; i++) {
                curArray = arraysToCombine[i];
                result.push(curArray[Math.floor(n / divisors[i]) % curArray.length]);
            } return result;
        }
        var numPerms = arraysToCombine[0].length;
        for (var i = 1; i < arraysToCombine.length; i++) numPerms *= arraysToCombine[i].length;
        for (var i = 0; i < numPerms; i++) combinations.push(getPermutation(i, arraysToCombine));
        return combinations;
    }

    this.buildTree = function(br, tr, node, full, block) {
        var br_l = br.length, i = 0, j = 0, l = !p.base ? tr : tr - 1;
        if (p.multi_process) {
            var h = -1, multi = [], multi_cond = [], multi_obj = [], multi_rem = [], n = "", n_o = "#condense#", nm_arr = [], nU = "";
            for (i = 0; i < br_l; i++) {
                if (br[i].name.indexOf("@@") != -1) {
                    multi = getAllCombinations(br[i].name);
                    multi_rem.push(i);
                    for (var m = 0; m < multi.length; m++) multi_obj.push({name:multi[m].join(""), item:br[i].item.slice(), track:br[i].track});
                }
            }
            i = multi_rem.length; while (i--) br.splice(multi_rem[i], 1); br_l = br.length; multi_obj.sort(sort);
            i = 0; while (i < multi_obj.length) {n = multi_obj[i].name; nU = n.toUpperCase(); if (n_o != nU) {n_o = nU; multi_cond[j] = {name:n, item:multi_obj[i].item.slice(), track:multi_obj[i].track}; j++} else multi_cond[j - 1].item.push.apply(multi_cond[j - 1].item, multi_obj[i].item.slice()); i++}
            for (i = 0; i < br_l; i++) {br[i].name = br[i].name.replace(/#!#/g, ""); nm_arr.push(br[i].name);}
            for (i = 0; i < multi_cond.length; i++) {h = arr_index(nm_arr, multi_cond[i].name); if (h != -1) {br[h].item.push.apply(br[h].item, multi_cond[i].item.slice()); multi_cond.splice(i ,1);}}
            for (i = 0; i < multi_cond.length; i++) br.splice(i + 1, 0, {name:multi_cond[i].name, sel:false, track:multi_cond[i].track, child:[], item:multi_cond[i].item.slice()});
            if (!node || node && !full) br.sort(sort);
            i = br.length; while (i--) {if (i != 0 && br[i].name.toUpperCase() == br[i - 1].name.toUpperCase()) {br[i - 1].item.push.apply(br[i - 1].item, br[i].item.slice()); br.splice(i, 1);}}
        }
        var folderView = p.view_by == p.folder_view ? true : false, par = this.tree.length - 1; if (tr == 0) this.tree = []; br_l = br.length;
        for (i = 0; i < br_l; i++) {
            j = this.tree.length; this.tree[j] = br[i];
            this.tree[j].top = !i ? true : false; this.tree[j].bot = i == br_l - 1 ? true : false;
            if (tr == (p.base ? 1 : 0) && i == br_l - 1) this.line_l = j;
            this.tree[j].tr = tr; this.tree[j].par = par; this.tree[j].ix = j;
            switch (true) {
                case l != -1 && (p.cond || folderView) && !p.show_tracks:
                    for (var r = 0; r < this.tree[j].item.length; r++) {if (lib.node[this.tree[j].item[r]].length == l + 1 || lib.node[this.tree[j].item[r]].length == l + 2) {this.tree[j].track = true; break;}}
                    break;
                case l == 0 && lib.node[this.tree[j].item[0]].length == 1:
                    if (!folderView && p.show_tracks && p.unbranched) this.tree[j].track = true;
                    if (p.show_tracks && (p.cond || folderView)) this.tree[j].track = true;
                    if (!p.show_tracks) this.tree[j].track = true;
                    break;
            }
            this.tree[j].count = !this.tree[j].track || !p.show_tracks  ? (p.show_counts == 1 ? " (" + this.tree[j].item.length + ")" : p.show_counts == 2 ?  " (" + branchCounts(this.tree[j], !p.base || j ? false : true, true, false) + ")" : "") : "";
            if (br[i].child.length > 0) this.buildTree(br[i].child, tr + 1, node, p.base && tr == 0 ? true : false);
        }
        if (!block) {if (p.base && this.tree.length == 1) this.line_l = 0; sbar.set_rows(this.tree.length); p.tree_paint();}
    }

    var branchCounts = function(br, base, node, block) {
        if (!br) return; var b = []; var br_l = br.item.length, folderView = p.view_by == p.folder_view ? true : false, k = 0, l = base ? 0 : p.base ? br.tr : br.tr + 1, n = "", n_o = "#get_branch#", nU = ""; if (folderView) base = false; if (base) node = false;
        for (k = 0; k < br_l; k++) {
            var pos = br.item[k];
            try {
                if (base) {n = lib.node[pos][l]; if (!n || n == "#!##!#") n = "?";}
                if (!p.s_txt && !base || p.s_txt) { if (l < lib.node[pos].length - 1) {n = lib.node[pos][l]; if (!n || n == "#!##!#") n = "?";} else n = "#get_track#";}
                if (n == "#get_track#") {n = lib.node[pos][l];} nU = n.toUpperCase();
                if (n_o != nU) {n_o = nU; b.push({name:n});}
            } catch (e) {}
        }
        if (p.multi_process) {
            var h = -1, j = 0, multi = [], multi_cond = [], multi_obj = [], multi_rem = [],nm_arr = []; br_l = b.length; n = ""; n_o = "#condense#"; nU = "";
            for (i = 0; i < br_l; i++) {
                if (b[i].name.indexOf("@@") != -1) {
                    multi = getAllCombinations(b[i].name);
                    multi_rem.push(i);
                    for (var m = 0; m < multi.length; m++) multi_obj.push({name:multi[m].join("")});
                }
            }
            i = multi_rem.length; while (i--) b.splice(multi_rem[i], 1); br_l = b.length; multi_obj.sort(sort);
            i = 0; while (i < multi_obj.length) {n = multi_obj[i].name; nU = n.toUpperCase(); if (n_o != nU) {n_o = nU; multi_cond[j] = {name:n}; j++} i++}
            for (i = 0; i < br_l; i++) {b[i].name = b[i].name.replace(/#!#/g, ""); nm_arr.push(b[i].name);}
            for (i = 0; i < multi_cond.length; i++) {h = arr_index(nm_arr, multi_cond[i].name); if (h != -1) multi_cond.splice(i ,1);}
            for (i = 0; i < multi_cond.length; i++) b.splice(i + 1, 0, {name:multi_cond[i].name});
            var full = p.base && br.tr == 0 ? true : false; if (!node || node && !full) b.sort(sort);
            i = b.length; while (i--) {if (i != 0 && b[i].name.toUpperCase() == b[i - 1].name.toUpperCase()) b.splice(i, 1);}
        }
        return b.length
    }

    this.create_images = function() {
        var sz = ui.node_sz, plus = true, hot = false, ln_w = Math.max(Math.floor(sz / 9), 1), sy_w = ln_w, x = 0, y = 0; if (((sz - ln_w * 3) / 2) % 1 != 0) sy_w = ln_w > 1 ? ln_w - 1 : ln_w + 1;
        for (var j = 0; j < 4; j++) {
            nd[j] = gdi.CreateImage(sz, sz); g = nd[j].GetGraphics(); hot = j > 1 ? true : false; plus = !j || j == 2 ? true : false;
            g.FillSolidRect(x, y, sz, sz, RGB(145, 145, 145));
            if (!hot) g.FillGradRect(x + ln_w, y + ln_w, sz - ln_w * 2, sz - ln_w * 2, 91,  plus ? ui.iconcol_e[0] : ui.iconcol_c[0], plus ? ui.iconcol_e[1] : ui.iconcol_c[1], 1.0);
            else g.FillGradRect(x + ln_w, y + ln_w, sz - ln_w * 2, sz - ln_w * 2, 91,  ui.iconcol_h[0] , ui.iconcol_h[1], 1.0);
            var x_o = [x, x + sz - ln_w, x, x + sz - ln_w], y_o = [y, y, y + sz - ln_w, y + sz - ln_w]; for (var i = 0; i < 4; i++) g.FillSolidRect(x_o[i], y_o[i], ln_w, ln_w, RGB(186, 187, 188));
            if (plus) g.FillSolidRect(Math.floor(x + (sz - sy_w) / 2), y + ln_w + Math.min(ln_w, sy_w), sy_w, sz - ln_w * 2 - Math.min(ln_w, sy_w) * 2, !hot ? ui.iconpluscol : ui.iconpluscol_h);
            g.FillSolidRect(x + ln_w + Math.min(ln_w, sy_w), Math.floor(y + (sz - sy_w) / 2), sz - ln_w * 2 - Math.min(ln_w, sy_w) * 2, sy_w, !hot ? (plus ? ui.iconminuscol_e : ui.iconminuscol_c) : ui.iconminuscol_h);
            nd[j].ReleaseGraphics(g);
        }}

    this.tracking = function(list, type) {
        if (type) {this.handle_list = p.items(); for (var i = 0; i < list.length; i++) this.handle_list.Add(p.list.Item(list[i]));}
        else this.handle_list = list.Clone();
        if (custom_sort.length) this.handle_list.OrderByFormat(fb.TitleFormat(custom_sort), 1);
        this.selection_holder.SetSelection(this.handle_list);
    }

    this.load = function(list, type, add, send, def_pl, insert) {
        var i = 0, np_item = -1, pid = -1, pln = plID(lib_playlist); if (!def_pl) pln = plman.ActivePlaylist; else plman.ActivePlaylist = pln;
        if (type) {var items = p.items(); for (i = 0; i < list.length; i++) items.Add(p.list.Item(list[i]));}
        else var items = list.Clone();
        if (p.multi_process && !custom_sort.length) items.OrderByFormat(fb.TitleFormat(p.mv_sort), 1);
        if (custom_sort.length) items.OrderByFormat(fb.TitleFormat(custom_sort), 1);
        this.handle_list = items.Clone();
        this.selection_holder.SetSelection(this.handle_list);
        if (fb.IsPlaying && !add && fb.GetNowPlaying()) {
            for (i = 0; i < items.Count; i++) if (fb.GetNowPlaying().Compare(items.Item(i))) {np_item = i; break;}
            var pl_chk = true;
            if (np_item != -1) {var np = plman.GetPlayingItemLocation(); if (np.IsValid) {if (np.PlaylistIndex != pln) pl_chk = false; else pid = np.PlaylistItemIndex;}}
            if (np_item != -1 && pl_chk && pid == -1 && items.Count < 5000) {if (ui.dui) plman.SetActivePlaylistContext(); for (i = 0; i < 20; i++) {fb.RunMainMenuCommand("Edit/Undo"); var np = plman.GetPlayingItemLocation(); if (np.IsValid) {pid = np.PlaylistItemIndex; if (pid != -1) break;}}}
            if (np_item != -1 && pid != -1) {
                plman.ClearPlaylistSelection(pln); plman.SetPlaylistSelectionSingle(pln, pid, true); plman.RemovePlaylistSelection(pln, true);
                var it = items.Clone(); items.RemoveRange(np_item, items.Count); it.RemoveRange(0, np_item + 1);
                if (plman.PlaylistItemCount(pln) < 5000)  plman.UndoBackup(pln); plman.InsertPlaylistItems(pln, 0, items); plman.InsertPlaylistItems(pln, plman.PlaylistItemCount(pln), it);
            } else {if (plman.PlaylistItemCount(pln) < 5000) plman.UndoBackup(pln); plman.ClearPlaylist(pln); plman.InsertPlaylistItems(pln, 0, items);}
        } else if (!add) {if (plman.PlaylistItemCount(pln) < 5000) plman.UndoBackup(pln); plman.ClearPlaylist(pln); plman.InsertPlaylistItems(pln, 0, items);}
        else {if (plman.PlaylistItemCount(pln) < 5000) plman.UndoBackup(pln); plman.InsertPlaylistItems(pln, !insert ? plman.PlaylistItemCount(pln) : plman.GetPlaylistFocusItemIndex(pln), items, true); plman.EnsurePlaylistItemVisible(pln, !insert || plman.GetPlaylistFocusItemIndex(pln) == -1 ? plman.PlaylistItemCount(pln) - items.Count: plman.GetPlaylistFocusItemIndex(pln) - items.Count);}
        if (autoplay && send) {var c = (plman.PlaybackOrder == 3 || plman.PlaybackOrder == 4) ? Math.ceil(plman.PlaylistItemCount(pln) * Math.random() - 1) : 0; plman.ExecutePlaylistDefaultAction(pln, c);}
    }

    this.collapseAll = function() {
        var ic = this.get_ix(0, p.s_h + ui.row_h / 2, true, false), j = this.tree[ic].tr; if (p.base) j -= 1;
        if (this.tree[ic].tr != 0) {var par = this.tree[ic].par, pr_pr = []; for (var m = 1; m < j + 1; m++) {if (m == 1) pr_pr[m] = par; else pr_pr[m] = this.tree[pr_pr[m - 1]].par; ic = pr_pr[m];}}
        var nm = this.tree[ic].name.toUpperCase();
        for (var h = 0; h < this.tree.length; h++)  if (!p.base || this.tree[h].tr) this.tree[h].child = [] ; this.buildTree(lib.root, 0); scr_pos = false;
        for (j = 0; j < this.tree.length; j++) if (this.tree[j].name.toUpperCase() == nm) {sbar.check_scroll(j * ui.row_h); scr_pos = true; break}
        if (!scr_pos) {sbar.reset(); p.tree_paint();}
    }

    this.expand = function(ie, nm) {
        var h = 0, m = 0; this.tree[ie].sel = true;
        if (this.auto) {
            var j = 0, par = 0, parent = [];
            for (h = 0; h < this.tree.length; h++) if (this.tree[h].sel) {j = this.tree[h].tr; if (p.base) j -= 1; if (this.tree[h].tr != 0) {par = this.tree[h].par, pr_pr = []; for (m = 1; m < j + 1; m++) {if (m == 1) pr_pr[m] = par; else pr_pr[m] = this.tree[pr_pr[m - 1]].par; parent.push(pr_pr[m]);}}}
            for (h = 0; h < this.tree.length; h++) if (!arr_contains(parent, h) && !this.tree[h].sel && (!p.base || this.tree[h].tr)) this.tree[h].child = [] ; this.buildTree(lib.root, 0);
        }
        var start_l = this.tree.length, nodes = -1; m = this.tree.length; while (m--) if (this.tree[m].sel) {this.expandNodes(this.tree[m], !p.base || m ? false : true); nodes++} this.clear();
        if (p.base && this.tree.length == 1) this.line_l = 0; sbar.set_rows(this.tree.length); p.tree_paint(); var nm_n = "";
        for (h = 0; h < this.tree.length; h++) {nm_n = (this.tree[h].tr ? this.tree[this.tree[h].par].name : "") + this.tree[h].name; nm_n = nm_n.toUpperCase(); if (nm_n == nm) break;}
        var new_items = this.tree.length - start_l + nodes, s = Math.round(sbar.scroll / ui.row_h + 0.4), n = Math.max(h - s, p.base ? 1 : 0);
        if (n + 1 + new_items > sbar.rows_drawn) {if (new_items > (sbar.rows_drawn - 2)) sbar.check_scroll(h * ui.row_h); else sbar.check_scroll(Math.min(h * ui.row_h,(h + 1 - sbar.rows_drawn + new_items) * ui.row_h));}
        if (sbar.scroll > h * ui.row_h) sbar.check_scroll(h * ui.row_h);
    }

    this.draw = function(gr) {
        try {if (lib.empty) return gr.GdiDrawText(lib.empty, ui.font, ui.textcol, ui.margin, p.s_h, sbar.tree_w, ui.row_h * 5, 0x00000004 | 0x00000400);
            if (!this.tree.length) return gr.GdiDrawText(lib.none, ui.font, ui.textcol, ui.margin, p.s_h, sbar.tree_w, ui.row_h, 0x00000004 | 0x00000400);
            var item_x = 0, item_y = 0, item_w = 0, ln_x = ui.margin + Math.floor(ui.node_sz / 2) + (p.base ? ui.pad : 0), nm = "", s = Math.round(sbar.delta / ui.row_h + 0.4), e = s + p.rows; e = this.tree.length < e ? this.tree.length : e, sel_x = 0, sel_w = 0, y1 = Math.round(p.s_h - sbar.delta + p.node_y);
            check_node(gr);
            for (var i = s; i < e; i++) {
                item_y = Math.round(ui.row_h * i + p.s_h - sbar.delta);
                if (ui.alternate) {if (i % 2 == 0) gr.FillSolidRect(0, item_y + 1, sbar.stripe_w, ui.row_h - 2, ui.b1); else gr.FillSolidRect(0, item_y, sbar.stripe_w, ui.row_h, ui.b2);}
                if (this.tree[i].sel && ui.backcolsel != 0) {
                    nm = this.tree[i].name + this.tree[i].count;
                    item_x = Math.round(ui.pad * this.tree[i].tr + ui.margin) + ui.icon_w;
                    item_w = gr.CalcTextWidth(nm, ui.font);
                    sel_x = item_x - ui.sel;
                    sel_w = Math.min(item_w + ui.sel * 2, sbar.tree_w - sel_x - 1);
                    if (p.full_line) sel_w = sbar.tree_w - sel_x;
                    if (!tt.Text || m_i != i && tt.Text) {gr.FillSolidRect(sel_x, item_y, sel_w, ui.row_h, ui.backcolsel);}
                }
                if (ui.node_style && ui.linecol) {
                    var end_br = [], j = this.tree[i].tr, l_x = 0, l_y = item_y + ui.row_h / 2; if (p.base) j -= 1;
                    var h1 = this.tree[i].top ? ui.row_h / 4 : ui.row_h;
                    if (this.tree[i].tr != 0) {
                        var par = this.tree[i].par, pr_pr = [];
                        for (var m = 1; m < j + 1; m++) {
                            if (m == 1) pr_pr[m] = par; else pr_pr[m] = this.tree[pr_pr[m - 1]].par
                            if (this.tree[pr_pr[m]].bot) end_br[m] = true; else end_br[m] = false;
                        }
                    }
                    for (var k = 0; k < j + 1; k++) {
                        if (this.tree[i].top && !k && !this.tree[i].track) h1 = ui.row_h / 2; else h1 = ui.row_h;
                        if (!k && !j && this.tree[i].top && !this.tree[i].track) h1 = -ui.row_h / 4;
                        if (this.tree[i].track && !k && this.tree[i].top) h1 = ui.row_h / 2
                        if (!end_br[k] && k == 1) h1 = ui.row_h; if (end_br[k]) h1 = 0;
                        var h3 = l_y - h1; if (h3 < p.s_h) h1 = p.s_h - h3;
                        l_x = (Math.round(ui.pad * this.tree[i].tr + ui.margin) + Math.floor(ui.node_sz / 2)) - ui.pad * k;
                        var h2 = ((!this.tree[i].bot && !k && this.tree[i].track && i == Math.ceil(e - 1)) ||
                            (!this.tree[i].bot && !end_br[k] && !this.tree[i].track && i == Math.ceil(e - 1)) ||
                            (k && !end_br[k] && i == e - 1)) ? ui.row_h / 2 : 0;
                        if (k != j) gr.FillSolidRect(l_x, l_y - h1, 1, h1 + h2, ui.linecol);
                    }
                }
            }
            if (ui.node_style && ui.linecol) {
                var top = p.base ? p.s_h + ui.row_h * 3 / 4 : p.s_h;
                var ln_y = sbar.scroll == 0 ? top + p.node_y : p.s_h;
                var ln_h = Math.min(this.line_l * ui.row_h - sbar.delta + (sbar.scroll == 0 ? (p.base ? -ui.row_h * 3 / 4 : 0) : p.node_y), ui.row_h * Math.ceil(p.rows) - (sbar.scroll == 0 ? (p.node_y + (p.base ? ui.row_h * 3 / 4 : 0)) : 0)); if (e == this.tree.length) ln_h += ui.row_h / 4; ln_h = Math.round(ln_h);
                if (this.line_l) gr.FillSolidRect(ln_x, ln_y, 1, ln_h, ui.linecol);
            }
            for (i = s; i < e; i++) {
                item_y = Math.round(ui.row_h * i + p.s_h - sbar.delta);
                nm = this.tree[i].name + this.tree[i].count;
                item_x = Math.round(ui.pad * this.tree[i].tr + ui.margin);
                item_w = gr.CalcTextWidth(nm, ui.font);
                if (tooltip && p.full_line) this.tree[i].tt_w = item_w;
                if (ui.node_style) {
                    var y2 = ui.row_h * i + y1 + Math.floor(ui.node_sz / 2);
                    if (!this.tree[i].track) {
                        if (ui.linecol) gr.FillSolidRect(item_x + ui.node_sz, y2, ui.l_s1, 1, ui.linecol);
                        draw_node(gr, this.tree[i].child.length < 1 ? m_br != i ? 0 : 2 : m_br != i ? 1 : 3, item_x, item_y + p.node_y);
                    } else if (ui.linecol) gr.FillSolidRect(item_x + ui.l_s2, y2, ui.l_s3, 1, ui.linecol);
                } else if (!this.tree[i].track) {gr.SetTextRenderingHint(5); gr.DrawString(this.tree[i].child.length < 1 ? ui.expand : ui.collapse, ui.icon_font, m_br == i && ui.hot ? ui.iconcol_h : this.tree[i].child.length < 1 ? ui.iconcol_e : ui.iconcol_c, item_x, item_y + ui.icon_pad, sbar.tree_w - item_x, ui.row_h, p.s_lc);}
                item_x += ui.icon_w;
                if (!tt.Text) {if (m_i == i) {sel_x = item_x - ui.sel; sel_w = Math.min(item_w + ui.sel * 2, sbar.tree_w - sel_x - 1); if (p.full_line) sel_w = sbar.tree_w - sel_x - 1; gr.FillSolidRect(sel_x, item_y, sel_w, ui.row_h, ui.backcol_h); gr.DrawRect(sel_x, item_y, sel_w, ui.row_h, 1, ui.framecol);}}
                if (p.full_line) item_w = sbar.tree_w - item_x;
                this.tree[i].w = item_w;
                var txt_c = this.tree[i].sel ? ui.textselcol : m_i == i ? ui.textcol_h : ui.textcol;
                gr.GdiDrawText(nm, ui.font, txt_c, item_x, item_y, sbar.tree_w - item_x - ui.sel, ui.row_h, p.lc);
            }} catch(e) {}
    }

    this.send = function(item, x, y) {
        if (!this.check_ix(item, x, y, false)) return;
        if (v.k(1)) this.load(this.sel_items, true, false, false, this.gen_pl, false);
        else if (v.k(0)) this.load(this.sel_items, true, false, false, this.gen_pl, false);
        else this.load(item.item, true, false, false, this.gen_pl, false);
    }

    this.track = function(item, x, y) {
        if (!this.check_ix(item, x, y, false)) return;
        if (v.k(1)) this.tracking(this.sel_items, true);
        else if (v.k(0)) this.tracking(this.sel_items, true);
        else this.tracking(item.item, true);
    }

    this.lbtn_dn = function(x, y) {
        if (y < p.s_h) return; var ix = this.get_ix(x, y, true, false); p.pos = ix; if (ix >= this.tree.length || ix < 0)  return this.get_selection(-1);
        var item = this.tree[ix], mode = x < Math.round(ui.pad * item.tr) + ui.icon_w + ui.margin ? 0 : this.check_ix(item, x, y, false) ? 1 : 2, xp = item.child.length > 0 ? 0 : 1;
        switch (mode) {
            case 0:
                switch (xp) {
                    case 0: this.clear_child(item); if (!ix && this.tree.length == 1) p.setHeight(false); break;
                    case 1:
                        if (this.auto) this.branch_chg(item, false, true);
                        var row = this.row(y);
                        this.branch(item, !p.base || ix ? false : true, true); if (!ix) p.setHeight(true);
                        if (this.auto) ix = item.ix
                        if (row + 1 + item.child.length > sbar.rows_drawn) {
                            if (item.child.length > (sbar.rows_drawn - 2)) sbar.check_scroll(ix * ui.row_h);
                            else sbar.check_scroll(Math.min(ix * ui.row_h,(ix + 1 - sbar.rows_drawn + item.child.length) * ui.row_h));
                        } break;
                }
                if (sbar.scroll > ix * ui.row_h) sbar.check_scroll(ix * ui.row_h); this.check_row(x, y);
                break;
            case 1:
                if (v.k(2) && sgl_fill) return this.add(x, y, alt_lbtn_pl);
                if (!v.k(1)) this.clear();
                if (!item.sel) this.get_selection(ix, item.sel);
                else if (v.k(1)) this.get_selection(ix, item.sel); p.tree_paint();
                break;
        }

        if (sgl_fill) this.send(item, x, y); else this.track(item, x, y);
    }

    this.lbtn_dblclk = function(x, y) {
        if (y < p.s_h) return; var ix = this.get_ix(x, y, true, false); if (ix >= this.tree.length || ix < 0) return;
        var item = this.tree[ix];
        if (!sgl_fill) this.send(item, x, y);
        if (!this.check_ix(item, x, y, false) || dbl_action == 2) return; var mp = 1;
        if (!dbl_action) {
            if (item.child.length) mp = 0;
            switch (mp) {
                case 0: this.clear_child(item); if (!ix && this.tree.length == 1) p.setHeight(false); break;
                case 1:
                    if (this.auto) this.branch_chg(item, false, true); if (!ix) p.setHeight(true);
                    var row = this.row(y);
                    this.branch(item, !p.base || ix ? false : true, true);
                    if (this.auto) ix = item.ix
                    if (row + 1 + item.child.length > sbar.rows_drawn) {
                        if (item.child.length > (sbar.rows_drawn - 2)) sbar.check_scroll(ix * ui.row_h);
                        else sbar.check_scroll(Math.min(ix * ui.row_h,(ix + 1 - sbar.rows_drawn + item.child.length) * ui.row_h));
                    } break;
            }
            if (sbar.scroll > ix * ui.row_h) sbar.check_scroll(ix * ui.row_h);
        }
        if (dbl_action || !dbl_action && mp == 1 && !item.child.length) {var pln = plID(lib_playlist); plman.ActivePlaylist = pln; var c = (plman.PlaybackOrder == 3 || plman.PlaybackOrder == 4) ? Math.ceil(plman.PlaylistItemCount(pln) * Math.random() - 1) : 0; plman.ExecutePlaylistDefaultAction(pln, c);}
    }

    this.get_selection = function(idx, state, add, bypass) {
        var sel_type = idx == -1 && !add ? 0 : v.k(0) && last_sel > -1 && !bypass ? 1 : v.k(1) && !bypass ? 2 : !state ? 3 : 0;
        switch (sel_type) {
            case 0: this.clear(); this.sel_items = []; break;
            case 1: var direction = (idx > last_sel) ? 1 : -1; if (!v.k(1)) this.clear(); for (var i = last_sel; ; i += direction) {this.tree[i].sel = true; if (i == idx) break;} this.get_sel_items(); p.tree_paint(); break;
            case 2: this.tree[idx].sel = !this.tree[idx].sel; this.get_sel_items(); last_sel = idx; break;
            case 3: this.sel_items = []; if (!add) this.clear(); if (!add) this.tree[idx].sel = true; this.sel_items.push.apply(this.sel_items, this.tree[idx].item); this.sel_items = uniq(this.sel_items); last_sel = idx; break;
        }
    }

    this.move = function(x, y) {
        var ix = this.get_ix(x, y, false, false); get_pos = this.check_row(x, y); m_i = -1;
        if (ix != -1) {m_i = ix; if (tooltip) this.activate_tooltip(ix, y);}
        if (m_i == ix_o && m_br == row_o) return;
        tt_id = -1; if (tooltip && tt.Text) this.deactivate_tooltip();
        if (!sbar.draw_timer) p.tree_paint();
        ix_o = m_i; row_o = m_br;
    }

    this.get_ix = function(x, y, simple, type) {
        var ix;
        if (y > p.s_h && y < p.s_h + p.sp) ix = this.row(y + sbar.scroll); else ix = -1;
        if (simple) return ix;
        if (this.tree.length > ix && ix >= 0 && x < sbar.tree_w && y > p.s_h && y < p.s_h + p.sp && this.check_ix(this.tree[ix], x, y, type)) return ix;
        else return -1;
    }

    this.check_ix = function(br, x, y, type) {
        if (!br) return false;
        return type ? (x >= Math.round(ui.pad * br.tr + ui.margin) && x < Math.round(ui.pad * br.tr + ui.margin) + br.w + ui.icon_w)
            : (x >= Math.round(ui.pad * br.tr + ui.margin) + ui.icon_w) && x < Math.min(Math.round(ui.pad * br.tr + ui.margin) + ui.icon_w + br.w, sbar.tree_w);
    }

    this.on_key_down = function(vkey) {
        if (p.s_search) return;
        switch(vkey) {
            case v.left:
                if (!(p.pos >= 0) && get_pos != -1) p.pos = get_pos
                else p.pos = p.pos + this.tree.length % this.tree.length;
                p.pos = Math.max(Math.min(p.pos, this.tree.length - 1), 0); get_pos = -1; m_i = -1;
                if (this.tree[p.pos].tr == p.base ? 1 : 0) break;
                if (this.tree[p.pos].child.length > 0) {var item = this.tree[p.pos]; this.clear_child(item); this.get_selection(item.ix); m_i = p.pos = item.ix;}
                else {try {var item = this.tree[this.tree[p.pos].par]; this.clear_child(item); this.get_selection(item.ix); m_i = p.pos = item.ix;} catch(e) {return;};}
                p.tree_paint(); this.load(this.sel_items, true, false, false, this.gen_pl, false);
                sbar.set_rows(this.tree.length); if (sbar.scroll > p.pos * ui.row_h) sbar.check_scroll(p.pos * ui.row_h);
                break;
            case v.right:
                if (!(p.pos >= 0) && get_pos != -1) p.pos = get_pos
                else p.pos = p.pos + this.tree.length % this.tree.length;
                p.pos = Math.max(Math.min(p.pos, this.tree.length - 1), 0); get_pos = -1; m_i = -1;
                var item = this.tree[p.pos]; if (this.auto) this.branch_chg(item, false, true);
                this.branch(item, p.base && p.pos == 0 ? true : false, true);
                this.get_selection(item.ix); p.tree_paint(); m_i = p.pos = item.ix;
                this.load(this.sel_items, true, false, false, this.gen_pl, false);
                sbar.set_rows(this.tree.length);
                var row = (p.pos * ui.row_h - sbar.scroll) / ui.row_h;
                if (row + item.child.length > sbar.rows_drawn) {
                    if (item.child.length > (sbar.rows_drawn - 2)) sbar.check_scroll(p.pos * ui.row_h);
                    else sbar.check_scroll(Math.min(p.pos * ui.row_h,(p.pos + 1 - sbar.rows_drawn + item.child.length) * ui.row_h));
                }
                break;
            case v.pgUp: if (this.tree.length == 0) break; p.pos = Math.round(sbar.scroll / ui.row_h + 0.4) - Math.floor(p.rows); p.pos = Math.max(!p.base ? 0 : 1, p.pos); sbar.wheel(1, true); this.get_selection(this.tree[p.pos].ix); p.tree_paint(); this.load(this.sel_items, true, false, false, this.gen_pl, false); break;
            case v.pgDn: if (this.tree.length == 0) break; p.pos = Math.round(sbar.scroll / ui.row_h + 0.4); p.pos = p.pos + Math.floor(p.rows) * 2 - 1; p.pos = this.tree.length < p.pos ? this.tree.length - 1 : p.pos; sbar.wheel(-1, true); this.get_selection(this.tree[p.pos].ix); p.tree_paint(); this.load(this.sel_items, true, false, false, this.gen_pl, false); break;
            case v.home: if (this.tree.length == 0) break; p.pos = !p.base ? 0 : 1; sbar.check_scroll(0); this.get_selection(this.tree[p.pos].ix); p.tree_paint(); this.load(this.sel_items, true, false, false, this.gen_pl, false); break;
            case v.end: if (this.tree.length == 0) break; p.pos = this.tree.length - 1; sbar.check_scroll((this.tree.length) * ui.row_h); this.get_selection(this.tree[p.pos].ix); p.tree_paint();  this.load(this.sel_items, true, false, false, this.gen_pl, false); break;
            case v.enter: if (!this.sel_items.length) return; this.load(this.sel_items, true, false, false, this.gen_pl, false); break;
            case v.dn: case v.up:
            if (this.tree.length == 0) break;
            if ((p.pos == 0 && get_pos == -1 && vkey == v.up) || (p.pos == this.tree.length - 1 && vkey == v.dn)) {this.get_selection(-1); break;}
            if (get_pos != -1) p.pos = get_pos;
            else p.pos = p.pos + this.tree.length % this.tree.length;
            get_pos = -1; m_i = -1; if (vkey == v.dn) p.pos++; if (vkey == v.up) p.pos--;
            p.pos = Math.max(Math.min(p.pos, this.tree.length - 1), !p.base ? 0 : 1);
            var row = (p.pos * ui.row_h - sbar.scroll) / ui.row_h;
            if (sbar.rows_drawn - row < 3) sbar.check_scroll((p.pos + 3) * ui.row_h - sbar.rows_drawn * ui.row_h);
            else if (row < 2 && vkey == v.up) sbar.check_scroll((p.pos - 1) * ui.row_h);
            m_i = p.pos; this.get_selection(p.pos); p.tree_paint();
            this.load(this.sel_items, true, false, false, this.gen_pl, false);
            break;
        }
    }
}
var pop = new populate();

function on_size() {
    ui.w = window.Width; ui.h = window.Height;
    if (!ui.w || !ui.h) return;
    ui.get_font();
    p.on_size();
    pop.create_tooltip();
    if (p.s_show || ui.scrollbar_show) but.refresh(true);
    jS.on_size();
}

function searchLibrary() {
    var cx = 0, doc = new ActiveXObject('htmlfile'), e = 0, expand_limit = Math.min(Math.max(window.GetProperty("ADV.Limit Search Results Auto Expand: 10-1000", 350), 10), 1000), i = 0, lbtn_dn = false, lg = [], log = [], offset = 0, s = 0, shift = false, shift_x = 0, txt_w = 0;
    var calc_text = function () {var im = gdi.CreateImage(1, 1), g = im.GetGraphics(); txt_w = g.CalcTextWidth(p.s_txt.substr(offset), ui.font); im.ReleaseGraphics(g); im.Dispose();}
    var drawcursor = function (gr) {if( p.s_search && p.s_cursor && s == e && cx >= offset) {var x1 = p.s_x + get_cursor_x(cx), x2 = x1; gr.DrawLine(x1, p.s_sp * 0.1, x2, p.s_sp * 0.85, 1, ui.textcol);}}
    var drawsel = function(gr) {if (s == e) return; var clamp = p.s_x + p.s_w2; gr.DrawLine(Math.min(p.s_x + get_cursor_x(s), clamp), p.s_sp / 2, Math.min(p.s_x + get_cursor_x(e), clamp), p.s_sp / 2, ui.row_h - 3, ui.ibeamcol2);}
    var get_cursor_pos = function (x) {var im = gdi.CreateImage(1, 1), g = im.GetGraphics(), nx = x - p.s_x, pos = 0; for (i = offset; i < p.s_txt.length; i++) {pos += g.CalcTextWidth(p.s_txt.substr(i,1), ui.font); if (pos >= nx + 3) break;} im.ReleaseGraphics(g); im.Dispose(); return i;}
    var get_cursor_x = function (pos) {var im = gdi.CreateImage(1, 1), g = im.GetGraphics(), x = 0; if (pos >= offset) x = g.CalcTextWidth(p.s_txt.substr(offset, pos - offset), ui.font); im.ReleaseGraphics(g); im.Dispose(); return x;}
    var get_offset = function (gr) {var t = gr.CalcTextWidth(p.s_txt.substr(offset, cx - offset), ui.font); var j = 0; while (t >= p.s_w2 && j < 500) {j++; offset++; t = gr.CalcTextWidth(p.s_txt.substr(offset, cx - offset), ui.font);}}
    var record = function() {lg.push(p.s_txt); log = []; if (lg.length > 30) lg.shift();}
    this.clear = function() {lib.time.Reset(); offset = s = e = cx = 0; p.s_cursor = false; p.s_search = false; p.s_txt = ""; p.search_paint(); timer.reset(timer.search_cursor, timer.search_cursori); lib.rootNodes(); if (p.pn_h_auto && p.pn_h == p.pn_h_min && pop.tree[0]) pop.clear_child(pop.tree[0]);}
    this.on_key_up = function(vkey) {if (!p.s_search) return; if (vkey == v.shift) {shift = false; shift_x = cx;}}
    this.lbtn_up = function(x, y) {if (s != e) timer.reset(timer.search_cursor, timer.search_cursori); lbtn_dn = false;}
    this.move = function(x, y) {if (y > p.s_h || !lbtn_dn) return; var t = get_cursor_pos(x), t_x = get_cursor_x(t); calc_text(); if(t < s) {if (t < e) {if (t_x < p.s_x) if(offset > 0) offset--;} else if (t > e) {if (t_x + p.s_x > p.s_x + p.s_w2) {var l = (txt_w > p.s_w2) ? txt_w - p.s_w2 : 0; if(l > 0) offset++;}} e = t;} else if (t > s) {if(t_x + p.s_x > p.s_x + p.s_w2) {var l = (txt_w > p.s_w2) ? txt_w - p.s_w2 : 0; if(l > 0) offset++;} e = t;} cx = t; p.search_paint();}
    this.rbtn_up = function(x, y) {men.search_menu(x, y, s, e, doc.parentWindow.clipboardData.getData('text') ? true : false)}
    this.search_auto_expand = window.GetProperty(" Search Results Auto Expand", false);

    this.lbtn_dn = function(x, y) {
        p.search_paint(); lbtn_dn = p.s_search = (y < p.s_h && x > ui.margin + ui.row_h * 0.6 && x < p.s_x + p.s_w2);
        if (!lbtn_dn) {offset = s = e = cx = 0; timer.reset(timer.search_cursor, timer.search_cursori); return;}
        else {if (shift) {s = cx; e = cx = get_cursor_pos(x);} else {cx = get_cursor_pos(x); s = e = cx;} timer.reset(timer.search_cursor, timer.search_cursori); p.s_cursor = true; timer.search_cursor = window.SetInterval(function() {p.s_cursor = !p.s_cursor; p.search_paint();}, 530);}
        p.search_paint();
    }

    this.on_char = function(code, force) {
        var text = String.fromCharCode(code); if (force) p.s_search = true;
        if (!p.s_search) return; p.s_cursor = false; p.pos = -1;
        switch (code) {
            case v.enter: if (p.s_txt.length < 3) break; var items = p.items(); try {items = fb.GetQueryItems(lib.list, p.s_txt)} catch (e) {} pop.load(items, false, false, false, pop.gen_pl, false); items.Dispose(); break;
            case v.redo: lg.push(p.s_txt); if (lg.length > 30) lg.shift(); if (log.length > 0) {p.s_txt = log.pop() + ""; cx++} break;
            case v.undo: log.push(p.s_txt); if (log.length > 30) lg.shift(); if (lg.length > 0) p.s_txt = lg.pop() + ""; break;
            case v.selAll: s = 0; e = p.s_txt.length; break;
            case v.copy: if (s != e) doc.parentWindow.clipboardData.setData('text', p.s_txt.substring(s, e)); break; case v.cut: if (s != e) doc.parentWindow.clipboardData.setData('text', p.s_txt.substring(s, e));
            case v.back: record();
                if (s == e) {if (cx > 0) {p.s_txt = p.s_txt.substr(0, cx - 1) + p.s_txt.substr(cx, p.s_txt.length - cx); if (offset > 0) offset--; cx--;}}
                else {if (e - s == p.s_txt.length) {p.s_txt = ""; cx = 0;} else {if (s > 0) {var st = s, en = e; s = Math.min(st, en); e = Math.max(st, en); p.s_txt = p.s_txt.substring(0, s) + p.s_txt.substring(e, p.s_txt.length); cx = s;} else {p.s_txt = p.s_txt.substring(e, p.s_txt.length); cx = s;}}}
                calc_text(); offset = offset >= e - s ? offset - e + s : 0; s = cx; e = s; break;
            case "delete": record();
                if (s == e) {if (cx < p.s_txt.length) {p.s_txt = p.s_txt.substr(0, cx) + p.s_txt.substr(cx + 1, p.s_txt.length - cx - 1);}}
                else {if (e - s == p.s_txt.length) {p.s_txt = ""; cx = 0;} else {if (s > 0) {var st = s, en = e; s = Math.min(st, en); e = Math.max(st, en); p.s_txt = p.s_txt.substring(0, s) + p.s_txt.substring(e, p.s_txt.length); cx = s;} else {p.s_txt = p.s_txt.substring(e, p.s_txt.length); cx = s;}}}
                calc_text(); offset = offset >= e - s ? offset - e + s : 0; s = cx; e = s; break;
            case v.paste: text = doc.parentWindow.clipboardData.getData('text');
            default: record();
                if (s == e) {p.s_txt = p.s_txt.substring(0, cx) + text + p.s_txt.substring(cx); cx += text.length; e = s = cx;}
                else if (e > s) {p.s_txt = p.s_txt.substring(0, s) + text + p.s_txt.substring(e); calc_text(); offset = offset >= e - s ? offset - e + s : 0; cx = s + text.length; s = cx; e = s;}
                else {p.s_txt = p.s_txt.substring(s) + text + p.s_txt.substring(0, e); calc_text(); offset = offset < e - s ? offset - e + s : 0; cx = e + text.length; s = cx; e = s;} break;
        }
        if (!timer.search_cursor) timer.search_cursor = window.SetInterval(function() {p.s_cursor = !p.s_cursor; p.search_paint();}, 530);
        p.search_paint(); lib.upd_search = true; timer.reset(timer.search, timer.searchi);
        timer.search = window.SetTimeout(function() {lib.time.Reset(); lib.rootNodes(); p.setHeight(true); if (sL.search_auto_expand) {if (!pop.tree.length) return timer.reset(timer.search, timer.searchi); var count = 0, m = p.base ? 1 : 0; for (m; m < pop.tree.length; m++) count += pop.tree[m].item.length; if (count > expand_limit) return timer.reset(timer.search, timer.searchi); var n = false; if (p.base && pop.tree.length > 1) n = true; m = pop.tree.length; while (m--) {pop.expandNodes(pop.tree[m], !p.base || m ? false : true); if (n && m == 1) break;} if (p.base && pop.tree.length == 1) pop.line_l = 0; sbar.set_rows(pop.tree.length); p.tree_paint();} timer.reset(timer.search, timer.searchi);}, 160);
    }

    this.on_key_down = function(vkey) {
        if (!p.s_search) return;
        switch(vkey) {
            case v.left: case v.right: if (vkey == v.left) {if (offset > 0) {if (cx <= offset) {offset--; cx--;} else cx--;} else if (cx > 0) cx--; s = e = cx} if (vkey == v.right && cx < p.s_txt.length) cx++; s = e = cx;
            if (shift) {s = Math.min(cx, shift_x); e = Math.max(cx, shift_x);} p.s_cursor = true;timer.reset(timer.search_cursor, timer.search_cursori); timer.search_cursor = window.SetInterval(function() {p.s_cursor = !p.s_cursor; p.search_paint();}, 530); break;
            case v.home: case v.end: if (vkey == v.home) offset = s = e = cx = 0; else s = e = cx = p.s_txt.length; p.s_cursor = true; timer.reset(timer.search_cursor, timer.search_cursori); timer.search_cursor = window.SetInterval(function() {p.s_cursor = !p.s_cursor; p.search_paint();}, 530); break;
            case v.shift: shift = true; shift_x = cx; break;
            case v.del: this.on_char("delete"); break;
        }
        p.search_paint();
    }

    this.draw = function(gr) {
        try {s = Math.min(Math.max(s, 0), p.s_txt.length); e = Math.min(Math.max(e, 0), p.s_txt.length); cx = Math.min(Math.max(cx, 0), p.s_txt.length);
            if (ui.fill) gr.FillSolidRect(0, 1, ui.w, ui.row_h - 4, 0x60000000);
            if (ui.pen == 1) gr.DrawLine(ui.margin, p.s_sp, p.s_w1, p.s_sp, 1, ui.s_linecol);
            if (ui.pen == 2) gr.DrawRoundRect(0, 2, ui.w - 1, ui.row_h - 4, 4, 4, 1, ui.pen_c);
            if (p.s_txt) {
                e = (e < p.s_txt.length) ? e : p.s_txt.length; drawsel(gr); get_offset(gr);
                gr.GdiDrawText(p.s_txt.substr(offset), ui.font, ui.searchcol, p.s_x, 0, p.s_w2, p.s_sp, p.l);
            } else gr.GdiDrawText("Search", ui.s_font, ui.txt_box, p.s_x, 0, p.s_w2, p.s_sp, p.l);
            drawcursor(gr);
            if (p.s_show > 1) {
                var l_x = p.f_x1 - 9, l_h = Math.round(p.s_sp / 2);
                gr.gdiDrawText(p.filt[p.filter_by].name, p.f_font, ui.txt_box, p.f_x1, 0, p.f_w[p.filter_by], p.s_sp, p.cc);
                gr.FillGradRect(l_x, 0, 1, l_h, 90, RGBA(0, 0, 0, 0), ui.s_linecol);
                gr.FillGradRect(l_x, l_h, 1, l_h, 90, ui.s_linecol, RGBA(0, 0, 0, 0));
            }} catch(e) {}
    }
}
if (p.s_show) var sL = new searchLibrary();

var j_Search = function() {
    var j_x = 5, j_h = 30, j_y = 5, jSearch = "", jump_search = true, rs1 = 5, rs2 = 4;
    this.on_size = function() {j_x = Math.round(ui.w / 2); j_h = Math.round(ui.row_h * 1.5); j_y = Math.round((ui.h - j_h) / 2); rs1 = Math.min(5, j_h / 2); rs2 = Math.min(4, (j_h - 2) / 2);}

    this.on_char = function(code) {
        var text = String.fromCharCode(code);
        if (!p.s_search) {
            var found = false, i = 0, pos = -1;
            switch(code) {case v.back: jSearch = jSearch.substr(0, jSearch.length - 1); break; case v.enter: jSearch = ""; return; default: jSearch += text; break;}
            var l = pop.tree.length;
            for (i = 0; i < l; i++) pop.tree[i].sel = false;
            if (!jSearch) return; pop.sel_items = []; jump_search = true;
            window.RepaintRect(0, j_y, ui.w, j_h + 1);
            timer.reset(timer.jsearch, timer.jsearchi);
            timer.jsearch = window.SetTimeout(function () {
                for (i = 0; i < l; i++) {
                    if (pop.tree[i].name != "All Music" && pop.tree[i].name.substring(0, jSearch.length).toLowerCase() == jSearch.toLowerCase()) {
                        found = true; pos = i; pop.tree[i].sel = true;
                        pop.get_sel_items();
                        break;
                    }
                }
                if (!found) jump_search = false;
                p.tree_paint();
                sbar.check_scroll((pos - 5) * ui.row_h);
                timer.reset(timer.jsearch, timer.jsearchi);
            }, 500);

            timer.reset(timer.clear_jsearch, timer.clear_jsearchi);
            timer.clear_jsearch = window.SetTimeout(function () {
                if (found) pop.load(pop.sel_items, true, false, false, pop.gen_pl, false); jSearch = "";
                window.RepaintRect(0, j_y, ui.w, j_h + 1);
                timer.reset(timer.clear_jsearch, timer.clear_jsearchi);
            }, 1200);
        }
    }

    this.draw = function(gr) {
        if (jSearch) {try {
            gr.SetSmoothingMode(4);
            var j_w = gr.CalcTextWidth(jSearch,ui.j_font) + 25;
            gr.FillRoundRect(j_x - j_w / 2, j_y, j_w, j_h, rs1, rs1, 0x96000000);
            gr.DrawRoundRect(j_x - j_w / 2, j_y, j_w, j_h, rs1, rs1, 1, 0x64000000);
            gr.DrawRoundRect(j_x - j_w / 2 + 1, j_y + 1, j_w - 2, j_h - 2, rs2, rs2, 1, 0x28ffffff);
            gr.GdiDrawText(jSearch, ui.j_font, RGB(0, 0, 0), j_x - j_w / 2 + 1, j_y + 1 , j_w, j_h, p.cc);
            gr.GdiDrawText(jSearch, ui.j_font, jump_search ? 0xfffafafa : 0xffff4646, j_x - j_w / 2, j_y, j_w, j_h, p.cc);} catch(e) {}
        }
    }
}
var jS = new j_Search();

function on_paint(gr) {
    ui.draw(gr);
    if (lib.upd) {lib.refresh(); lib.upd = false; return;}
    if (p.s_show) sL.draw(gr);
    pop.draw(gr);
    if (ui.scrollbar_show) sbar.draw(gr);
    if (p.s_show || ui.scrollbar_show) but.draw(gr);
    jS.draw(gr);
}

function button_manager() {
    var arrow_sy = window.GetProperty(" Scrollbar Arrow Custom: Icon // Examples", " // ▲  ⮝    ⯅ ⏫ ⏶ ⤊   "), arrow_symb = 0; if (window.GetProperty(" Scrollbar Arrow Custom", false)) try {arrow_symb = arrow_sy.replace(/\s+/g, "").charAt(0);} catch(e) {arrow_symb = 0} if (!arrow_symb.length) arrow_symb = 0;
    var custom_col = window.GetProperty("_CUSTOM COLOURS/FONTS: USE", false), cust_icon_font = window.GetProperty("_Custom.Font Icon [Scroll] (Name,Style[0or1])", "Segoe UI Symbol,0"), icon_f_name= "Segoe UI", icon_f_style = 0, pad = Math.min(Math.max(window.GetProperty(" Scrollbar Arrow Custom: Icon: Vertical Offset %", -24) / 100, -0.5), 0.3);
    if (custom_col) {if (cust_icon_font.length) {cust_icon_font = cust_icon_font.split(","); try {var st = Math.round(parseFloat(cust_icon_font[1])), font_test = gdi.Font(cust_icon_font[0], 16, st); icon_f_name = cust_icon_font[0]; icon_f_style = st;} catch(e) {ui.trace("JScript Panel is unable to use your scroll icon font. Using Segoe UI instead");}}}
    var b_x, but_tt = window.CreateTooltip("Segoe UI", 15 * ui.scale * window.GetProperty(" Zoom Tooltip [Button] (%)", 100) / 100, 0), bx, by, bh, byDn, byUp, fw, i, qx, qy, qh, s_img = [], scr = [], scrollBut_x, scrollDn_y, scrollUp_y;
    this.btns = []; this.b = null;
    var browser = function(c) {if (!but.run(c)) fb.ShowPopupMessage("Unable to launch your default browser.", "Library Tree");}
    var tooltip = function(n) {if (but_tt.text == n) return; but_tt.text = n; but_tt.activate();}
    this.lbtn_dn = function(x, y) {if (!this.b) return false; if (ui.scrollbar_show && (this.b == "scrollUp" || this.b == "scrollDn")) {if (this.btns[this.b].trace(x, y)) this.btns[this.b].down = true; this.btns[this.b].changestate("down");} this.btns[this.b].lbtn_dn(x, y); return true;}
    this.lbtn_up = function(x, y) {if (!this.b) return false; if (ui.scrollbar_show) {this.btns["scrollUp"].down = false; this.btns["scrollDn"].down = false; if (this.b == "scrollUp" || this.b == "scrollDn") this.btns[this.b].changestate(this.btns[this.b].trace(x, y) ? "hover" : "normal");} this.move(x, y); if (!this.b) return false; this.btns[this.b].lbtn_up(x, y); return true;}
    this.leave = function() {if (this.b) this.btns[this.b].changestate("normal"); this.b = null; tooltip("");}
    this.on_script_unload = function() {tooltip("");}
    this.run = function(c) {try {var WshShell = new ActiveXObject("WScript.Shell"); WshShell.Run(c); return true;} catch (e) {return false;}}

    this.create_images = function() {
        var alpha = [75, 192, 228], c, col = [ui.textcol & 0x44ffffff, ui.textcol & 0x99ffffff, ui.textcol], g, sz = arrow_symb == 0 ? Math.max(Math.round(ui.but_h * 1.666667), 1) : 100, sc = sz / 100;
        for (var j = 0; j < 2; j++) {
            c = j ? 0xe4ffffff : 0x99ffffff; s_img[j] = gdi.CreateImage(100, 100); g = s_img[j].GetGraphics(); g.SetSmoothingMode(2);
            if (!ui.local) {g.DrawLine(69, 71, 88, 90, 12, ui.txt_box & c); g.DrawEllipse(8, 11, 67, 67, 10, ui.txt_box & c);}
            else {g.DrawLine(69, 71, 88, 90, 12, ui.txt_box); g.DrawEllipse(8, 11, 67, 67, 10, ui.txt_box);} g.FillEllipse(15, 17, 55, 55, 0x0AFAFAFA); g.SetSmoothingMode(0); s_img[j].ReleaseGraphics(g);
        }
        for (j = 0; j < 3; j++) {
            scr[j] = gdi.CreateImage(sz, sz); g = scr[j].GetGraphics(); g.SetTextRenderingHint(3); g.SetSmoothingMode(2);
            if (ui.scr_col) {arrow_symb == 0 ? g.FillPolygon(col[j], 1, [50 * sc, 0, 100 * sc, 76 * sc, 0, 76 * sc]) : g.DrawString(arrow_symb, gdi.Font(icon_f_name, sz, icon_f_style), col[j], 0, sz * pad, sz, sz, StringFormat(1, 1));}
            else {arrow_symb == 0 ? g.FillPolygon(RGBA(ui.ct, ui.ct, ui.ct, alpha[j]), 1, [50 * sc, 0, 100 * sc, 76 * sc, 0, 76 * sc]) : g.DrawString(arrow_symb, gdi.Font(icon_f_name, sz, icon_f_style), RGBA(ui.ct, ui.ct, ui.ct, alpha[j]), 0, sz * pad, sz, sz, StringFormat(1, 1));}
            g.SetSmoothingMode(0); scr[j].ReleaseGraphics(g);
        }}; this.create_images();

    this.draw = function(gr) {
        try {for (i in this.btns) {
            if ((p.s_show == 1 || p.s_show > 1 && !p.s_txt) && i == "s_img") this.btns[i].draw(gr);
            if (p.s_show == 1 && i == "cross1") this.btns[i].draw(gr);
            if (p.s_show > 1 && p.s_txt && i == "cross2") this.btns[i].draw(gr);
            if (p.s_show > 1 && i == "filter") this.btns[i].draw(gr);
            if (ui.scrollbar_show && sbar.scrollable_lines > 0 && (i == "scrollUp" || i == "scrollDn"))  this.btns[i].draw(gr);
        }} catch(e) {}
    }

    this.move = function(x, y) {
        if (this.b && this.btns[this.b].down == true) return;
        var b = null, hand = false;
        for (i in this.btns) {
            if ((p.s_show == 1 || p.s_show > 1 && !p.s_txt) && i == "s_img" && this.btns[i].trace(x, y)) {b = i; hand = true;}
            if (p.s_show == 1 && i == "cross1" && this.btns[i].trace(x, y)) {b = i; hand = true;}
            if (p.s_show > 1 && p.s_txt && i == "cross2" && this.btns[i].trace(x, y)) {b = i; hand = true;}
            if (p.s_show > 1 && i == "filter" && this.btns[i].trace(x, y)) {b = i; hand = true;}
            if (ui.scrollbar_show && sbar.scrollable_lines > 0 && (i == "scrollUp" || i == "scrollDn") && this.btns[i].trace(x, y)) b = i;
        } window.SetCursor(hand ? 32649 : y < p.s_h && p.s_show && x > qx + qh ? 32513 : 32512);
        if (this.b == b) return this.b;
        if (b) this.btns[b].changestate("hover");
        if (this.b) this.btns[this.b].changestate("normal");
        this.b = b;
        if (!this.b) tooltip("");
        return this.b;
    }

    var btn = function(x, y, w, h, type, ft, txt, stat, img_src, down, l_dn, l_up, tooltext) {
        this.draw = function (gr) {
            switch (type) {
                case 3: gr.SetInterpolationMode(2); if (this.img) gr.DrawImage(this.img, this.x, this.y, this.w, this.h, 0, 0, this.img.Width, this.img.Height); gr.SetInterpolationMode(0); break;
                case 4: gr.DrawLine(Math.round(this.x + bh * 0.67), Math.round(this.y + bh * 0.67), Math.round(this.x + bh * 0.27), Math.round(this.y + bh * 0.27), Math.round(bh / 10), RGBA(136, 136, 136, this.img)); gr.DrawLine(Math.round(this.x + bh * 0.67), Math.round(this.y + bh * 0.27), Math.round(this.x + bh * 0.27), Math.round(this.y + bh * 0.67), Math.round(bh / 10), RGBA(136, 136, 136, this.img)); break;
                case 5: gr.SetTextRenderingHint(5); gr.DrawString(txt, ft, this.img, this.x, this.y - 1, this.w, this.h, StringFormat(2, 1)); break;
                case 6: ui.theme.SetPartAndStateId(1, this.img); ui.theme.DrawThemeBackground(gr, this.x, this.y, this.w, this.h); break;
                default: if (this.img) gr.DrawImage(this.img, this.x + ft, txt, stat, stat, 0, 0, this.img.Width, this.img.Height, type == 1 ? 0 : 180); break;
            }
        }
        this.trace = function(x, y) {return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h;}
        this.lbtn_dn = function () {this.l_dn && this.l_dn(x, y);}
        this.lbtn_up = function () {this.l_up && this.l_up(x, y);}

        this.changestate = function(state) {
            switch (state) {case "hover": this.img = this.img_hover; tooltip(this.tooltext); break; case "down": this.img = this.img_down; break; default: this.img = this.img_normal; break;}
            window.RepaintRect(Math.round(this.x), Math.round(this.y), this.w, this.h);
        }
        this.x = x; this.y = y; this.w = w; this.h = h; this.l_dn = l_dn; this.l_up = l_up; this.tooltext = tooltext;
        this.img_normal = img_src.normal; this.img_hover = img_src.hover || this.img_normal; this.img_down = img_src.down || this.img_normal; this.img = this.img_normal;
    }

    this.refresh = function(upd) {
        if (upd) {
            bx = p.s_w1 - Math.round(ui.row_h * 0.75); bh = ui.row_h; by = Math.round((p.s_sp - bh * 0.4) / 2 - bh * 0.27);
            b_x = p.sbar_x; byUp = sbar.y; byDn = sbar.y + sbar.h - ui.but_h; fw = p.f_w[p.filter_by] + p.f_sw + 12; qx = ui.margin; qy = (p.s_sp - ui.row_h * 0.6) / 2; qh = ui.row_h * 0.6;
            if (ui.scr_type != 2) {b_x -= 1; scrollBut_x = (ui.but_h - ui.scr_but_w) / 2; scrollUp_y = -ui.arrow_pad + byUp + (ui.but_h - 1 - ui.scr_but_w) / 2; scrollDn_y = ui.arrow_pad + byDn + (ui.but_h - 1 - ui.scr_but_w) / 2 ;}
        }
        if (ui.scrollbar_show) {
            switch (ui.scr_type) {
                case 2:
                    this.btns.scrollUp = new btn(b_x, byUp, ui.but_h, ui.but_h, 6, "", "", "", {normal: 1, hover: 2, down: 3}, false, function() {sbar.but(1);}, "", "");
                    this.btns.scrollDn = new btn(b_x, byDn, ui.but_h, ui.but_h, 6, "", "", "", {normal: 5, hover: 6, down: 7}, false, function() {sbar.but(-1);}, "", "");
                    break;
                default:
                    this.btns.scrollUp = new btn(b_x, byUp, ui.but_h, ui.but_h, 1, scrollBut_x, scrollUp_y, ui.scr_but_w, {normal: scr[0], hover: scr[1], down: scr[2]}, false, function() {sbar.but(1);}, "", "");
                    this.btns.scrollDn = new btn(b_x, byDn, ui.but_h, ui.but_h, 2, scrollBut_x, scrollDn_y, ui.scr_but_w, {normal: scr[0], hover: scr[1], down: scr[2]}, false, function() {sbar.but(-1);}, "", "");
                    break;
            }
        }
        if (p.s_show)  {
            this.btns.s_img = new btn(qx, qy, qh, qh, 3, "", "", "", {normal: s_img[0], hover: s_img[1]}, false, function() {browser("\"" + fb.FoobarPath + "Query Syntax Help.html");}, "", "Open Query Syntax Help");
            this.btns.cross1 = new btn(bx, by, bh, bh, 4, "", "", "", {normal: "85", hover: "192"}, false, "", function() {sL.clear();}, "Clear Search Text");
            this.btns.cross2 = new btn(qx - bh * 0.2, by, bh, bh, 4, "", "", "", {normal: "85", hover: "192"}, false, "", function() {sL.clear();}, "Clear Search Text");
            this.btns.filter = new btn(p.f_x1 - 12, 0, fw, p.s_sp, 5, p.f_but_ft, "▼", "", {normal: !ui.local ? ui.txt_box & 0x99ffffff : ui.txt_box, hover: ui.txt_box & 0xe4ffffff}, false, "", function() {men.button(p.f_x1, p.s_h); but.refresh(true)}, "Filter");
        }
    }
}
var but = new button_manager();

function menu_object() {
    var use_local = window.GetProperty("SYSTEM.Use Local", false), expand_limit = use_local ? 6000 : Math.min(Math.max(window.GetProperty("ADV.Limit Menu Expand: 10-6000", 500), 10), 6000), i = 0, MenuMap = [], MF_GRAYED = 0x00000001, MF_POPUP = 0x00000010, MF_SEPARATOR = 0x00000800, MF_STRING = 0x00000000, mtags_installed = utils.CheckComponent("foo_tags", true), xp = false;
    this.NewMenuItem = function(index, type, value) {MenuMap[index] = [{type: ""},{value: 0}]; MenuMap[index].type = type; MenuMap[index].value = value;}; this.r_up = false;
    var box = function(n) {return n != null ? 'Unescape("' + encodeURIComponent(n + "") + '")' : "Empty";}
    var InputBox = function(prompt, title, msg) {var vb = new ActiveXObject("ScriptControl"); vb.Language = "VBScript"; var tmp = vb.eval('InputBox(' + [box(prompt), box(title), box(msg)].join(",") + ')'); if (typeof tmp == "undefined") return; if (tmp.length == 254) fb.ShowPopupMessage("Your entry is too long and will be truncated.\n\nEntries are limited to 254 characters.", "Library Tree"); return tmp.trim();}
    var proceed = function(length) {var ns = InputBox("Create m-TAGS in selected music folders\n\nProceed?\n\nm-TAGS creator settings apply", "Create m-TAGS in Selected Folders", "Create " + length + " m-TAGS" + (length ? "" : ": NO FOLDERS SELECTED")); if (!ns) return false; return true;}
    this.PlaylistTypeMenu = function(Menu, StartIndex) {var Index = StartIndex, n = ["Send to Current Playlist", "Insert in Current Playlist", "Add to Current Playlist", "Collapse All", "Expand"];
        for (i = 0; i < 5; i++) {this.NewMenuItem(Index, "Playlist", i + 1); Menu.AppendMenuItem(i != 4 || xp ? MF_STRING : MF_GRAYED, Index, n[i]); if (i == 2) Menu.AppendMenuItem(MF_SEPARATOR, 0, 0); Index++;} return Index;}
    this.TagTypeMenu = function(Menu, StartIndex) {var Index = StartIndex; this.NewMenuItem(Index, "Tag", 1); Menu.AppendMenuItem(mtags_installed && p.grp[p.view_by].type.replace(/^\s+/, "") == "$directory_path(%path%)|%filename_ext%" ? MF_STRING : MF_GRAYED, Index, "Create m-TAGS..." + (mtags_installed ? (p.grp[p.view_by].type.replace(/^\s+/, "").toLowerCase() == "$directory_path(%path%)|%filename_ext%" ? "" : " N/A Requires View by Path // $directory_path(%path%)|%filename_ext%") : " N/A m-TAGS Not Installed")); Index++; return Index;}
    this.OptionsTypeMenu = function(Menu, StartIndex) {
        var Index = StartIndex, mt = p.syncType ? 1 : 0;
        for (i = 0; i < p.menu.length; i++) {
            this.NewMenuItem(Index, "Options", i + 1);
            if (i < p.menu.length - 1 || i == p.menu.length - 1 && v.k(0)) Menu.AppendMenuItem(MF_STRING, Index, p.menu[i]); Index++;
            if (i == p.menu.length - 3  - mt || i == p.menu.length - 4 - mt) Menu.AppendMenuItem(MF_SEPARATOR, 0, 0);
        }
        Menu.CheckMenuRadioItem(StartIndex, StartIndex + p.menu.length - 3 - mt, StartIndex + p.view_by);
        return Index;
    }

    this.FilterMenu = function(Menu, StartIndex) {
        var Index = StartIndex;
        for (i = 0; i < p.f_menu.length + 1; i++) {this.NewMenuItem(Index, "Filter", i + 1);
            Menu.AppendMenuItem(MF_STRING, Index, i != p.f_menu.length ? (!i ? "No " : "") + p.f_menu[i] : "Always Reset Scroll");
            if (i == p.f_menu.length) Menu.CheckMenuItem(Index++, p.reset); else Index++;
            if (i == p.f_menu.length - 1) Menu.AppendMenuItem(MF_SEPARATOR, 0, 0);
        }
        Menu.CheckMenuRadioItem(StartIndex, StartIndex + p.f_menu.length - 1, StartIndex + p.filter_by);
        return Index;
    }

    this.button = function(x, y) {
        var menu = window.CreatePopupMenu(), idx, Index = 1; Index = this.FilterMenu(menu, Index); idx = menu.TrackPopupMenu(x, y);
        if (idx >= 1 && idx <= Index) {i = MenuMap[idx].value;
            switch (i) {
                case p.f_menu.length + 1: p.reset = !p.reset; if (p.reset) {p.search_paint(); lib.refresh(true);} window.SetProperty("SYSTEM.Reset Tree", p.bypass); break;
                default: p.filter_by = i - 1; p.set_statistics_mode(); p.calc_text(); p.search_paint(); lib.refresh(true); window.SetProperty("SYSTEM.Filter By", p.filter_by); break;
            }
            if (p.pn_h_auto && p.pn_h == p.pn_h_min && pop.tree[0]) pop.clear_child(pop.tree[0]);} menu.Dispose();
    }

    this.search = function(Menu, StartIndex, s, e, paste) {
        var Index = StartIndex, n = ["Copy", "Cut", "Paste"];
        for (i = 0; i < 3; i++) {
            this.NewMenuItem(Index, "Search", i + 1);
            Menu.AppendMenuItem(s == e && i < 2 || i == 2 && !paste ? MF_GRAYED : MF_STRING, Index, n[i]); Index++;
            if (i == 1) Menu.AppendMenuItem(MF_SEPARATOR, 0, 0);
        }
        return Index;
    }

    this.search_menu = function(x, y, s, e, paste) {
        var menu = window.CreatePopupMenu(), idx, Index = 1;
        Index = this.search(menu, Index, s, e, paste); idx = menu.TrackPopupMenu(x, y);
        if (idx >= 1 && idx <= Index) {
            i = MenuMap[idx].value;
            switch (i) {
                case 1: sL.on_char(v.copy); break;
                case 2: sL.on_char(v.cut); break;
                case 3: sL.on_char(v.paste, true); break;
            }
        } menu.Dispose();
    }

    this.rbtn_up = function(x, y) {
        this.r_up = true; var Context = fb.CreateContextMenuManager(), FilterMenu = window.CreatePopupMenu(), idx, Index = 1, menu = window.CreatePopupMenu(), new_sel = false, OptionsMenu = window.CreatePopupMenu(), PlaylistMenu = window.CreatePopupMenu(), show_context = false;
        var ie = pop.get_ix(x, y, true, false), ix = pop.row(y + sbar.delta), item = pop.tree[ix], nm = "", row = -1; xp = false;
        if (ie < pop.tree.length && ie != -1) xp = pop.tree[ie].item.length > expand_limit || pop.tree[ie].track ? false : true;
        if (xp && pop.tree.length) {var count = 0, m = 0; for (m = 0; m < pop.tree.length; m++) if (m == ie || pop.tree[m].sel) {if (row == -1 || m < row) {row = m; nm = (pop.tree[m].tr ? pop.tree[pop.tree[m].par].name : "") + pop.tree[m].name; nm = nm.toUpperCase();} count += pop.tree[m].item.length; xp = count <= expand_limit;}}
        if (y < p.s_h + p.sp && pop.tree.length > ix && ix >= 0 && (x < Math.round(ui.pad * item.tr) + ui.icon_w + ui.margin && (!item.track || p.base && item.tr == 0) || pop.check_ix(item, x, y, true))) {
            if (!item.sel) {new_sel = true; pop.get_selection(ix, "", true, true);}
            Index = this.PlaylistTypeMenu(menu, Index); menu.AppendMenuSeparator();
            if (utils.IsKeyPressed(0x10)) {Index = this.TagTypeMenu(menu, Index); menu.AppendMenuSeparator();}
            show_context = true;
        }
        if (show_context) {
            Index = this.OptionsTypeMenu(OptionsMenu, Index); OptionsMenu.AppendTo(menu, MF_STRING | MF_POPUP, "Options");
            menu.AppendMenuSeparator(); var items = p.items(); try {for (var l = 0; l < pop.sel_items.length; l++) items.Add(p.list.Item(pop.sel_items[l]));} catch (e)  {}
            Context.InitContext(items); Context.BuildMenu(menu, 5000, -1);
        } else Index = this.OptionsTypeMenu(menu, Index);
        idx = menu.TrackPopupMenu(x, y);
        if (idx >= 1 && idx <= Index) {
            i = MenuMap[idx].value;
            switch (MenuMap[idx].type) {
                case "Playlist":
                    switch (i) {
                        case 1: if (new_sel) pop.clear(); item.sel = true; pop.get_sel_items(); pop.load(pop.sel_items, true, false, true, false, false); p.tree_paint(); break;
                        case 4: pop.collapseAll(); break;
                        case 5: pop.expand(ie, nm); break;
                        default:  if (new_sel) pop.clear(); item.sel = true; pop.get_sel_items(); pop.load(pop.sel_items, true, true, false, false, i == 2 ? true : false); break;
                    }
                    break;
                case "Tag":
                    var r = !p.base ? pop.tree[ie].tr : pop.tree[ie].tr - 1, list = [];
                    if (p.base && !ie || !r) pop.tree[ie].sel = true;
                    if (p.base && pop.tree[0].sel) for (var j = 0; j < pop.tree.length; j++) if (pop.tree[j].tr == 1) pop.tree[j].sel = true; p.tree_paint();
                    for ( j = 0; j < pop.tree.length; j++) if ((pop.tree[j].tr == (p.base ? 1 : 0)) && pop.tree[j].sel) list.push(pop.tree[j].name);
                    if (!proceed(list.length)) break;
                    p.syncType = 1; for (j = 0; j < list.length; j++) but.run("\"" + fb.FoobarPath + "\\foobar2000.exe\"" + " /m-TAGS \"" + list[j] + "\"");
                    p.syncType = window.GetProperty(" Library Sync: Auto-0, Initialisation Only-1", 0); lib.update();
                    break;
                case "Options":
                    var mtt = i == p.menu.length - 2 && p.syncType ? 1 : i == p.menu.length - 1 ? 2 : i == p.menu.length ? 3 : 4;
                    switch (mtt) {
                        case 1: window.ShowProperties(); break;
                        case 2: p.syncType ? lib.update() : window.ShowProperties(); break;
                        case 3: window.ShowConfigure(); break;
                        case 4: lib.time.Reset(); if (p.s_txt) lib.upd_search = true; p.fields(i < p.grp.length + 1 ? i - 1 : p.view_by, i - 1 < p.grp.length ? p.filter_by : i - 1 - p.grp.length); lib.get_library(); lib.rootNodes(); if (p.pn_h_auto && p.pn_h == p.pn_h_min && pop.tree[0]) pop.clear_child(pop.tree[0]); break;
                    }
                    break;
            }
        }
        if (idx >= 5000 && idx <= 5800) {show_context && Context.ExecuteByID(idx - 5000);}
        this.r_up = false;
        Context.Dispose(); FilterMenu.Dispose(); menu.Dispose(); OptionsMenu.Dispose(); PlaylistMenu.Dispose();
    }
}
var men = new menu_object();

function timers() {
    var timer_arr = ["clear_jsearch", "init", "jsearch", "search", "search_cursor", "tt", "update"];
    for (var i = 0; i < timer_arr.length; i++) {this[timer_arr[i]] = false; this[timer_arr[i] + "i"] = i;}
    this.reset = function(timer, n) {if (timer) window.ClearTimeout(timer); this[timer_arr[n]] = false;}
    this.lib = function() {this.init = window.SetTimeout(function() {lib.get_library(); lib.rootNodes(); timer.reset(timer.init, timer.initi);}, 5);}
    this.tooltip = function() {this.reset(this.tt, this.tti); this.tt = window.SetTimeout(function() {pop.deactivate_tooltip(); timer.reset(timer.tt, timer.tti);}, 5000);}
    this.lib_update = function() {this.reset(this.update, this.updatei); this.update = window.SetTimeout(function() {lib.update(); timer.reset(timer.update, timer.updatei);}, 500);}
}
var timer = new timers();
timer.lib(); if (timer.init === 0) {lib.get_library(); lib.rootNodes();}

function on_char(code) {if (!p.s_show) return; sL.on_char(code); jS.on_char(code)}
function on_focus(is_focused) {if (is_focused && pop.handle_list && pop.handle_list.Count) pop.selection_holder.SetSelection(pop.handle_list);}
function on_key_down(vkey) {pop.on_key_down(vkey);if (!p.s_show) return; sL.on_key_down(vkey);}
function on_key_up(vkey) {if (!p.s_show) return; sL.on_key_up(vkey)}
function on_library_items_added() {if (p.syncType) return; timer.lib_update();}
function on_library_items_removed() {if (p.syncType) return; timer.lib_update();}
function on_library_items_changed() {if (p.syncType || !p.statistics && fb.PlaybackTime > 59 && fb.PlaybackTime < 65) return; if (p.yttm_mng && fb.IsPlaying) {var handle = fb.GetNowPlaying(); if (handle && handle.Path.slice(-7) == "!!.tags") return; /*!!.tags use notify due to m-TAGS/YouTube popup triggers*/} timer.lib_update();}
function on_mouse_lbtn_dblclk(x, y) {but.lbtn_dn(x, y); pop.lbtn_dblclk(x, y); }
function on_mouse_lbtn_down(x, y) {if (p.s_show || ui.scrollbar_show) but.lbtn_dn(x, y); if (p.s_show) sL.lbtn_dn(x, y); pop.lbtn_dn(x, y); sbar.lbtn_dn(x, y);}
function on_mouse_lbtn_up(x, y) {if (p.s_show) {sL.lbtn_up(); but.lbtn_up(x, y);} sbar.lbtn_up(x, y);}
function on_mouse_leave() {if (p.s_show || ui.scrollbar_show) but.leave(); sbar.leave(); pop.leave();}
function on_mouse_mbtn_down(x, y) {pop.mbtn_dn(x, y);}
function on_mouse_move(x, y) {if (p.m_x == x && p.m_y == y) return; if (p.s_show || ui.scrollbar_show) but.move(x, y); if (p.s_show) sL.move(x, y); pop.move(x, y); sbar.move(x, y); p.m_x = x; p.m_y = y;}
function on_mouse_rbtn_up(x, y) {if (y < p.s_h && x > p.s_x && x < p.s_x + p.s_w2) {sL.rbtn_up(x, y); return true;} else {men.rbtn_up(x, y); return true;}}
function on_mouse_wheel(step) {if (!v.k(3)) sbar.wheel(step, false); else ui.wheel(step);}
function on_notify_data(name, info) {switch (name) {case "yttm mng": p.yttm_mng = info; break; case "!!.tags update": timer.lib_update(); break;} if (ui.local) on_notify(name, info);}
function on_refresh_background_done() {ui.on_refresh_background_done(window.GetBackgroundImage());}
function on_script_unload() {but.on_script_unload();}
function RGB(r, g, b) {return 0xff000000 | r << 16 | g << 8 | b;}
function RGBA(r, g, b, a) {return a << 24 | r << 16 | g << 8 | b;}
function StringFormat() {
    var a = arguments, h_align = 0, v_align = 0, trimming = 0, flags = 0;
    switch (a.length) {case 3: trimming = a[2]; case 2: v_align = a[1]; case 1: h_align = a[0]; break; default: return 0;}
    return (h_align << 28 | v_align << 24 | trimming << 20 | flags);
}

if (!window.GetProperty("SYSTEM.Software Notice Checked", false)) fb.ShowPopupMessage("Library Tree\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE."); window.SetProperty("SYSTEM.Software Notice Checked", true); window.SetProperty("SYSTEM.Zoom Update", true);
window.SetProperty(" Playlist: Autoplay On Send", null); window.SetProperty(" Double-Click Action: ExplorerStyle-0 Play-1", null); window.SetProperty("_Custom.Colour Node Symbol", null); window.SetProperty(" Node: Custom Symbols (No Lines)", null); window.SetProperty(" Node: Custom Symbols: Collapse|Expand", null); window.SetProperty(" Node: Show Item Counts", null); window.SetProperty(" Node: Size", null); window.SetProperty(" Scroll: Smooth Scroll Level 0-1", null); window.SetProperty(" Scrollbar Width", null); window.SetProperty("_CUSTOM COLOURS: EMPTY = DEFAULT", null); window.SetProperty("_CUSTOM COLOURS: USE", null);