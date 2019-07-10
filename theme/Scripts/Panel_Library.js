'use strict';
window.DefinePanel('Library Tree', {author:'WilB', version: '2.0.0'});
const requiredVersionStr = '1.1.4'; function is_compatible(requiredVersionStr) {const requiredVersion = requiredVersionStr.split('.'), currentVersion = utils.Version.split('.'); if (currentVersion.length > 3) currentVersion.length = 3; for (let i = 0; i < currentVersion.length; ++i) if (currentVersion[i] != requiredVersion[i]) return currentVersion[i] > requiredVersion[i]; return true;} if (!is_compatible(requiredVersionStr)) fb.ShowPopupMessage(`Library Tree requires v${requiredVersionStr}. Current component version is v${utils.Version}.`);

const $ = {
    equal : (arr1, arr2) => {let i = arr1.length; if (i != arr2.length) return false; while (i--) if (arr1[i] !== arr2[i]) return false; return true;},
	getDpi : () => {let dpi = 120; try {dpi = $.WshShell.RegRead("HKCU\\Control Panel\\Desktop\\WindowMetrics\\AppliedDPI");} catch (e) {} return dpi < 121 ? 1 : dpi / 120;},
    isArray : arr => Array.isArray(arr),
	WshShell : new ActiveXObject("WScript.Shell")
}

const s = {
    browser : c => {if (!s.run(c)) fb.ShowPopupMessage("Unable to launch your default browser.", "Library Tree");},
    clamp : (num, min, max) => {num = num <= max ? num : max; num = num >= min ? num : min; return num;},
    debounce : (e,r,i) => {var o,u,a,c,v,f,d=0,m=!1,j=!1,n=!0;if("function"!=typeof e)throw new TypeError(FUNC_ERROR_TEXT);function T(i){var n=o,t=u;return o=u=void 0,d=i,c=e.apply(t,n)}function b(i){var n=i-f;return void 0===f||r<=n||n<0||j&&a<=i-d}function l(){var i,n,t=Date.now();if(b(t))return w(t);v=setTimeout(l,(n=r-((i=t)-f),j?Math.min(n,a-(i-d)):n))}function w(i){return v=void 0,n&&o?T(i):(o=u=void 0,c)}function t(){var i,n=Date.now(),t=b(n);if(o=arguments,u=this,f=n,t){if(void 0===v)return d=i=f,v=setTimeout(l,r),m?T(i):c;if(j)return v=setTimeout(l,r),T(f)}return void 0===v&&(v=setTimeout(l,r)),c}return r=parseFloat(r)||0,s.isObject(i)&&(m=!!i.leading,a=(j="maxWait"in i)?Math.max(parseFloat(i.maxWait)||0,r):a,n="trailing"in i?!!i.trailing:n),t.cancel=function(){void 0!==v&&clearTimeout(v),o=f=u=v=void(d=0)},t.flush=function(){return void 0===v?c:w(Date.now())},t}, isObject : function(t) {var e=typeof t;return null!=t&&("object"==e||"function"==e)},
    file : f => s.fs.FileExists(f),
    fs : new ActiveXObject("Scripting.FileSystemObject"),
    gr : (w, h, im, func) => {let i = gdi.CreateImage(w, h), g = i.GetGraphics(); func(g, i); i.ReleaseGraphics(g); g = null; if (im) return i; else i = null;},
    padNumber : (num, len, base) => {if (!base) base = 10; return ('000000' + num.toString(base)).substr(-len);},
    query : (h, q) => {let l = FbMetadbHandleList(); try {l = fb.GetQueryItems(h, q);} catch (e) {} return l;},
    replaceAt: (str, pos, chr) => str.substring(0, pos) + chr + str.substring(pos + 1),
    run : c => {try {$.WshShell.Run(c); return true;} catch (e) {return false;}},
	scale : $.getDpi(),
    throttle : (e,i,t) => {var n=!0,r=!0;if("function"!=typeof e)throw new TypeError(FUNC_ERROR_TEXT);return s.isObject(t)&&(n="leading"in t?!!t.leading:n,r="trailing"in t?!!t.trailing:r),s.debounce(e,i,{leading:n,maxWait:i,trailing:r})},
    trace : message => console.log("Library Tree" + ": " + message),
    value : (num, def, type) => {num = parseFloat(num); if (isNaN(num)) return def; switch (type) {case 0: return num; case 1: if (num !== 1 && num !== 0) return def; break; case 2: if (num > 2 || num < 0) return def; break;} return num;},
}

class PanelProperty {
    constructor(name, default_value) {
		this.name = name;
		this.value = ppt.get(this.name, default_value);
    }

    get() {return this.value;}
	set(new_value) {if (this.value !== new_value) {ppt.set(this.name, new_value); this.value = new_value;}}
}

class PanelProperties {
    constructor() {
        this.name_list = {}; // collision checks only
    }
    init(type, properties, thisArg) {
        switch (type) {
			case 'auto':
                properties.forEach(v => {
                    // this.validate(v); // debug
                    this.add(v);
                });
				break;
			case 'manual':
				properties.forEach(v => thisArg[v[2]] = this.get(v[0], v[1]));
				break;
		}
    }

    validate(item) {
        if (!$.isArray(item) || item.length !== 3 || typeof item[2] !== 'string') {
            throw ('invalid property: requires array: [string, any, string]');
        }
        if (item[2] === 'add') {
            throw ('property_id: '+ item[2] + '\nThis id is reserved');
        }
        if (this[item[2]] != null || this[item[2] + '_internal'] != null) {
            throw ('property_id: '+ item[2] + '\nThis id is already occupied');
        }
        if (this.name_list[item[0]] != null) {
            throw ('property_name: '+ item[0] + '\nThis name is already occupied');
        }
    }

    add(item) {
        this.name_list[item[0]] = 1;

        this[item[2] + '_internal'] = new PanelProperty(item[0], item[1]);

        Object.defineProperty(this, item[2], {
            get() {return this[item[2] + '_internal'].get();},
            set(new_value) {this[item[2] + '_internal'].set(new_value);}
        });
    }

	get(n, v) {return window.GetProperty(`\u200A${n}`, v);}
	set(n, v) {return window.SetProperty(`\u200A${n}`, v);}
}

let properties = [
	[" Auto Fit", true, "autoFit"],
	[" Cover Auto-Fill", true, "autoFill"],
	[" Cover Opacity (0-100)", 10, "covAlpha"],
	[" Margin", Math.round(8 * s.scale), "margin"],
	[" Node: Custom (No Lines)", false, "nodeStyle"],
	[" Node: Custom Icon: +|- // Examples","| // (+)|(−) | | | | | | | | |", "iconCustom"],
	[" Node: Custom Icon: Vertical Padding", -2, "iconVerticalPad"],
	[" Node: Lines: Hide-0 Grey-1 Blend-2 Text-3", 1, "nodeLineCol"],
	[" Playlist: Custom Sort", "", "customSort"],
	[" Row Vertical Item Padding", 3, "verticalPad"],
	[" Scroll Step 0-10 (0 = Page)", 3, "scrollStep"],
	[" Scrollbar Arrow Custom: Icon // Examples", " // ▲  ⮝    ⯅ ⏫ ⏶ ⤊   ", "arrowSymbol"],
	[" Scrollbar Arrow Custom: Icon: Vertical Offset %", -24, "sbarButPad"],
	[" Scrollbar Colour Grey-0 Blend-1", 1, "sbarCol"],
	[" Scrollbar Size", "Bar," + Math.round(11 * s.scale) + ",Arrow," + Math.round(11 * s.scale) + ",Gap(+/-),0,GripMinHeight," + Math.round(20 * s.scale), "sbarMetrics"],
	[" Scrollbar Type Default-0 Styled-1 Themed-2", "0", "sbarType"],
	[" Search Style: Fade-0 Blend-1 Norm-2 Highlight-3", 0, "searchCol"],
	[" Search: Line Colour: Grey-0 Blend-1 Text-2", 0, "searchLnCol"],
	[" Touch Step 1-10", 1, "touchStep"],
	[" Tree Indent", Math.round(19 * s.scale), "treeIndent"],
	[" Zoom Filter Size (%)", 100, "zoomFilter"],
	[" Zoom Font Size (%)", 100, "zoomFont"],
	[" Zoom Node Size (%)", 100, "zoomNode"],
	["_CUSTOM COLOURS/FONTS: EMPTY = DEFAULT", "R-G-B (any) or R-G-B-A (not Text...), e.g. 255-0-0", "customInfo"],
	["_CUSTOM COLOURS/FONTS: USE", false, "customCol"],
	["_Custom.Font (Name,Size,Style[0-4])", "Segoe UI,16,0", "custFont"],
	["_Custom.Font Icon [Node] (Name,Style[0or1])", "Segoe UI Symbol,0", "custIconFont"],
	["_Custom.Font Icon [Scroll] (Name,Style[0or1])", "Segoe UI Symbol,0", "butCustIconFont"],
	["ADV.$swapbranchprefix. Prefixes to Swap (| Separator)", "A|The", "prefix"],
	["ADV.Height Auto [Expand/Collapse With Root]", false, "pn_h_auto"],
	["ADV.Height Auto-Collapse", 100, "pn_h_min"],
	["ADV.Height Auto-Expand", 578, "pn_h_max"],
	["ADV.Hot Key: 1-10 // Assign Spider Monkey Panel index in keyboard shortcuts", "CollapseAll,0,PlaylistAdd,0,PlaylistInsert,0,Search,0,SearchClear,0", "hotKeys"],
	["ADV.Image Blur Background Auto-Fill", false, "blurAutofill"],
	["ADV.Image Blur Background Level (0-100)", 90, "blurTemp"],
	["ADV.Image Blur Background Opacity (0-100)", 30, "blurAlpha"],
	["ADV.Library Sync: Auto-0, Initialisation Only-1", 0, "syncType"],
	["ADV.Limit Menu Expand: 10-6000", 500, "treeExpandLimit"],
	["ADV.Node [Default]: Themed 0 or 1", "0", "winNode"],
	["ADV.Scrollbar Height Always Full", true, "sbarStyle"],
	["ADV.Smooth Duration 0-5000 msec (Max)", "Scroll,500,TouchFlick,3000", "duration"],
	["ADV.Touch Flick Distance 0-10", 0.8, "flickDistance"],
	["ADV.Zoom Key CTRL+ALT-0 CTRL-1 ALT-2 ESC-3 TAB-4", 0, "zoomKey"],
	["SYSTEM.Blur Blend Theme", false, "blurBlend"],
	["SYSTEM.Blur Dark Theme", false, "blurDark"],
	["SYSTEM.Blur Light Theme", false, "blurLight"],
	["SYSTEM.Colour Swap", false, "swapCol"],
	["SYSTEM.Double-Click Action", 1, "dblClickAction"],
	["SYSTEM.Filter By", 0, "filterBy"],
	["SYSTEM.Font Size", 16, "baseFontSize"],
	["SYSTEM.Full Line Selection", false, "fullLineSelection"],
	["SYSTEM.Height", 578, "pn_h"],
	["SYSTEM.Image Background", false, "imgBg"],
	["SYSTEM.Key: Send to Playlist", false, "keyAction"],
	["SYSTEM.Limit Tree Auto Expand: 10-1000", 350, "autoExpandLimit"],
	["SYSTEM.Node: Auto Collapse", false, "autoCollapse"],
	["SYSTEM.Node: Highlight on Hover", true, "nodeHighlight"],
	["SYSTEM.Node: Item Counts Hide-0 Tracks-1 Sub-Items-2", 1, "nodeCounts"],
	["SYSTEM.Node: Root Hide-0 All Music-1 View Name-2", 1, "rootNode"],
	["SYSTEM.Node: Show Tracks", true, "showTracks"],
	["SYSTEM.Nowplaying Show", false, "showNowplaying"],
	["SYSTEM.Play on Enter or Send from Menu", false, "autoPlay"],
	["SYSTEM.Playlist: ADD to Default [Alt+Click]", true, "altClickPlaylist"],
	["SYSTEM.Playlist: ADD to Default [MiddleClick]", false, "middleClickPlaylist"],
	["SYSTEM.Playlist: Default", "Library View", "libPlaylist"],
	["SYSTEM.Playlist: Send to Default", true, "sendPlaylist"],
	["SYSTEM.Remember.Exp",JSON.stringify([]), "exp"],
	["SYSTEM.Remember.Proc", false, "process"],
	["SYSTEM.Remember.Scr",JSON.stringify([]), "scr"],
	["SYSTEM.Remember.Search Text", "", "s_txt"],
	["SYSTEM.Remember.Sel",JSON.stringify([]), "sel"],
	["SYSTEM.Remember.Tree", 1, "rememberTree"],
	["SYSTEM.Reset Tree", false, "reset"],
	["SYSTEM.Row Stripes", false, "rowStripes"],
	["SYSTEM.Scroll: Smooth Scroll", true, "smooth"],
	["SYSTEM.Scrollbar Show", true, "sbarShow"],
	["SYSTEM.Scrollbar Width Bar", 11, "sbarBase_w"],
	["SYSTEM.Search: Hide-0, SearchOnly-1, Search+Filter-2", 2, "searchShow"],
	["SYSTEM.Single-Click Action", 1, "clickAction"],
	["SYSTEM.Tree Auto Expand", false, "treeAutoExpand"],
	["SYSTEM.Tooltip Show", false, "tooltip"],
	["SYSTEM.Touch Control", false, "touchControl"],
	["SYSTEM.View By", 1, "viewBy"]
];
const ppt = new PanelProperties();
ppt.init('auto', properties); properties = undefined;

String.prototype.splt = function(n) {switch (n) {case 0: return this.replace(/\s+|^,+|,+$/g, "").split(","); case 1: return this.replace(/^[,\s]+|[,\s]+$/g, "").split(",");}}
const ui = new UserInterface(), p = new Panel(), sbar = new Scrollbar(), vk = new Vkeys(), lib = new Library(), pop = new Populate(), sL = new SearchLibrary(ppt.searchShow), jS = new JumpSearch(), but = new Buttons(), men = new MenuItems(), timer = new Timers(); window.DlgCode = 0x004;

function UserInterface() {
    const pptCol = [["_Custom.Colour Background", "", "bg", 1], ["_Custom.Colour Background Highlight", "", "bg_h", 1], ["_Custom.Colour Background Selected", "", "bgSel", 1], ["_Custom.Colour Item Counts", "", "counts", 1], ["_Custom.Colour Node Lines", "", "line", 1], ["_Custom.Colour Search Name", "", "txt_box", 0], ["_Custom.Colour Search Line", "", "s_line", 1], ["_Custom.Colour Search Text", "", "search", 0], ["_Custom.Colour Frame Highlight", "", "frame", 1], ["_Custom.Colour Text", "", "text", 0], ["_Custom.Colour Text Highlight", "", "text_h", 0], ["_Custom.Colour Text Nowplaying", "", "nowp", 0], ["_Custom.Colour Text Selected", "", "textSel", 0], ["_Custom.Colour Node Collapse", "", "icon_c", 1], ["_Custom.Colour Node Expand", "", "icon_e", 1], ["_Custom.Colour Node Highlight", "", "icon_h", 1], ["_Custom.Colour Transparent Fill", "", "bgTrans", 1]];
    let blurAlpha = s.clamp(ppt.blurAlpha, 0, 100) / 30, blurImg = null, blurLevel = ppt.blurBlend ? 91.05 - s.clamp(ppt.blurTemp, 1.05, 90) : s.clamp(ppt.blurTemp * 2, 0, 254), cur_handle = null, iconFontName = "Segoe UI", iconFontStyle = 0, iconcol_c = "", iconcol_e = "", iconcol_h = "", image_path_o = "", node_sz = Math.round(11 * s.scale), noimg = [], sbarMetrics = ppt.sbarMetrics.splt(0), sp = 6, sp1 = 6, sp2 = 6, tcol = "", tcol_h = "", zoomFontSize = 16;
    this.covAlpha = s.clamp(ppt.covAlpha * 2.55, 0, 255); this.arrow_pad = s.value(sbarMetrics[5], 0, 0); this.bg = false; this.col = {}; this.collapse = ""; this.expand = ""; this.drag_drop_id = -1; this.dui = window.InstanceType; this.fill = 0; this.font = ""; this.grip_h = s.value(sbarMetrics[7], 20, 0); this.h = 0; this.icon = ppt.iconCustom.trim(); this.iconFont = ""; this.icon_w = 17; this.jumpFont = ""; this.l_s1 = 4; this.l_s2 = 6; this.l_s3 = 7; this.l_w = Math.round(1 * s.scale); this.l_wc = 0; this.local = typeof conf === 'undefined' ? false : true; this.node_sz = Math.round(11 * s.scale); this.pen = 1; this.pen_c = 0x55888888; this.row_h = 20; this.searchFont = ""; ppt.sbarCol = s.clamp(ppt.sbarCol, 0, 1); this.sel = 3; this.touch_dn_id = -1; this.w = 0; this.y_start = 0;

    const A = c => c >> 24 & 0xff;
    const chgBrightness = (c, percent) => {c = toRGB(c); return RGB(s.clamp(c[0] + (256 - c[0]) * percent / 100, 0, 255), s.clamp(c[1] + (256 - c[1]) * percent / 100, 0, 255), s.clamp(c[2] + (256 - c[2]) * percent / 100, 0, 255));}
    const colSat = c => {c = toRGB(c); return c[0] + c[1] + c[2];}
	const get_grad = (c, f1, f2) => {c = toRGB(c); return [RGB(Math.min(c[0] + f1, 255), Math.min(c[1] + f1, 255), Math.min(c[2] + f1, 255)), RGB(Math.max(c[0] + f2, 0), Math.max(c[1] + f2, 0), Math.max(c[2] + f2, 0))];}
	const get_txtboxcol = c => {if (ppt.blurDark) c = 0xff0F0F0F; if (ppt.blurLight) c = 0xffF0F0F0; return ppt.searchCol < 2 ? this.get_blend(!ppt.searchCol ? this.col.text : this.col.text_h, c == 0 ? 0xff000000 : c, !ppt.searchCol ? 0.65 : 0.7) : ppt.searchCol == 2 ? this.col.text : this.col.text_h;}
    const get_textselcol = (c, n) => {c = toRGB(c); const cc = c.map(v => {v /= 255; return v <= 0.03928 ? v /= 12.92 : Math.pow(((v + 0.055 ) / 1.055), 2.4);}); const L = 0.2126 * cc[0] + 0.7152 * cc[1] + 0.0722 * cc[2]; if (L > 0.31) return n ? 50 : RGB(0, 0, 0); else return n ? 200 : RGB(255, 255, 255);}
	const pptColour = () => {pptCol.forEach(v => this.col[v[2]] = this.set_custom_col(ppt.get(v[0], v[1]), v[3]));}
    const RGBAtoRGB = (c, bg) => {c = toRGBA(c); bg = toRGB(bg); const r = c[0] / 255, g = c[1] / 255, b = c[2] / 255, a = c[3] / 255, bgr = bg[0] / 255, bgg = bg[1] / 255, bgb = bg[2] / 255, nR = ((1 - a) * bgr) + (a * r), nG = ((1 - a) * bgg) + (a * g), nB = ((1 - a) * bgb) + (a * b); nR = s.clamp(Math.round(nR * 255), 0, 255); nG = s.clamp(Math.round(nG * 255), 0, 255); nB = s.clamp(Math.round(nB * 255), 0, 255); return RGB(nR, nG, nB);}
    const RGBtoRGBA = (rgb, a) => a << 24 | rgb & 0x00FFFFFF;
    const toRGB = c => [c >> 16 & 0xff, c >> 8 & 0xff, c & 0xff];
    const toRGBA = c => [c >> 16 & 0xff, c >> 8 & 0xff, c & 0xff, c >> 24 & 0xff];

    this.get_blend = (c1, c2, f, alpha) => {const nf = 1 - f; let r, g, b, a; switch (true) {case !alpha: c1 = toRGB(c1); c2 = toRGB(c2); r = c1[0] * f + c2[0] * nf; g = c1[1] * f + c2[1] * nf; b = c1[2] * f + c2[2] * nf; return RGB(r, g, b); case alpha: c1 = toRGBA(c1); c2 = toRGBA(c2); r = c1[0] * f + c2[0] * nf; g = c1[1] * f + c2[1] * nf; b = c1[2] * f + c2[2] * nf; a = c1[3] * f + c2[3] * nf; return RGBA(r, g, b, a);}}
    this.reset_colors = () => {pptCol.forEach(v => this.col[v[2]] = ""); iconcol_c = ""; iconcol_e = ""; iconcol_h = ""; tcol = ""; tcol_h = "";}
    this.set_custom_col = (c, t) => {if (!ppt.customCol) return ""; c = c.split("-"); let cc = ""; if (c.length != 3 && c.length != 4) return ""; switch (t) {case 0: cc = RGB(c[0], c[1], c[2]); break; case 1: switch (c.length) {case 3: cc = RGB(c[0], c[1], c[2]); break; case 4: cc = RGBA(c[0], c[1], c[2], c[3]); break;} break;} return cc;}

    if (ppt.customCol && ppt.custIconFont.length) {
        const custIconFont = ppt.custIconFont.splt(1);
        iconFontName = custIconFont[0];
        iconFontStyle = Math.round(s.value(custIconFont[1], 0, 0));
    }

    const winNode = s.value(ppt.winNode.replace(/\s+/g, "").charAt(), 0, 1); if (winNode == 1) ppt.winNode = "1 // Highlight & Custom Colours N/A For Themed"; else ppt.winNode = "" + 0 + "";
    this.nodeStyle = ppt.nodeStyle ? 0 : !winNode ? 1 : 2; this.nodeStyle = s.value(this.nodeStyle, 1, 2); this.nodeWin = this.nodeStyle == 2 ? 1 : 0;
    if (!this.nodeStyle) {
        if (!this.icon.charAt().length) this.nodeStyle = 1;
        else {
            this.icon = this.icon.split("//");
            if (this.icon[0].includes("|")) {
                this.icon = this.icon[0].split("|");
                this.expand = this.icon[0].trim();
                this.collapse = this.icon[1].trim();
            } else this.nodeStyle = 1;
        }
    }
    if (!this.expand.length || !this.collapse.length) this.nodeStyle = 1;

    this.icon_col = () => {
        if (iconcol_c === "") {this.col.icon_c = this.nodeStyle ? [RGB(252, 252, 252), RGB(223, 223, 223)] : this.col.text;} else if (this.nodeStyle) {if (A(iconcol_c) != 255) {this.col.icon_c = RGBAtoRGB(iconcol_c, this.col.bg);} else this.col.icon_c = iconcol_c; this.col.icon_c = get_grad(this.col.icon_c, 15, -14);}
        if (iconcol_e === "") {this.col.icon_e = this.nodeStyle ? [RGB(252, 252, 252), RGB(223, 223, 223)] : this.col.text & 0xC0ffffff;} else if (this.nodeStyle) {if (A(iconcol_e) != 255) {this.col.icon_e = RGBAtoRGB(iconcol_e, this.col.bg);} else this.col.icon_e = iconcol_e; this.col.icon_e = get_grad(this.col.icon_e, 15, -14);}
        this.col.iconPlus = get_textselcol(this.col.icon_e[0], true) == 50 ? RGB(41, 66, 114) : RGB(225, 225, 245);
        this.col.iconMinus_c = get_textselcol(this.col.icon_c[0], true) == 50 ? RGB(75, 99, 167) : RGB(225, 225, 245);
        this.col.iconMinus_e = get_textselcol(this.col.icon_e[0], true) == 50 ? RGB(75, 99, 167) : RGB(225, 225, 245);
        if (!ppt.nodeHighlight) return;
        if (iconcol_h === "") {this.col.icon_h = this.nodeStyle ? !ppt.blurDark && !ppt.blurLight ? !this.local ? (colSat(this.col.text_h) < 650 ? this.col.text_h : this.col.text) : (colSat(c_iconcol_h) < 650 ? c_iconcol_h : c_textcol): RGB(50, 50, 50) : this.col.text_h; iconcol_h = this.col.icon_h;} if (this.nodeStyle) {if (A(iconcol_h) != 255) {this.col.icon_h = RGBAtoRGB(iconcol_h, this.col.bg);} else if (iconcol_h !== "") this.col.icon_h = iconcol_h; this.col.icon_h = get_grad(this.col.icon_h, 15, -14);}
        this.col.iconPlus_h = get_textselcol(this.col.icon_h[0], true) == 50 ? RGB(41, 66, 114) : RGB(225, 225, 245);
        this.col.iconMinus_h = get_textselcol(this.col.icon_h[0], true) == 50 ? RGB(75, 99, 167) : RGB(225, 225, 245);
    }

    this.get_colors = () => {
        pptColour();
        iconcol_c = this.col.icon_c; iconcol_e = this.col.icon_e; iconcol_h = this.col.icon_h;
        this.col.b1 = 0x04ffffff; this.col.b2 = 0x04000000;
        this.blur = ppt.blurBlend || ppt.blurDark || ppt.blurLight; if (ppt.blurDark) {this.col.bg_light = RGBA(0, 0, 0, Math.min(160 / blurAlpha, 255)); this.col.bg_dark = RGBA(0, 0, 0, Math.min(80 / blurAlpha, 255));} if (ppt.blurLight) {this.col.bg_light = RGBA(255, 255, 255, Math.min(160 / blurAlpha, 255)); this.col.bg_dark = RGBA(255, 255, 255, Math.min(205 / blurAlpha, 255));}
        if (this.dui) { // custom colour mapping: DUI colours can be remapped by changing the numbers (0-3)
            if (this.col.bg === "") this.col.bg = window.GetColourDUI(1);
            if (this.col.bgSel === "") this.col.bgSel = ppt.blurDark ? RGBA(255, 255, 255, 36) : ppt.blurLight ? RGBA(0, 0, 0, 36) : window.GetColourDUI(3);
            tcol = window.GetColourDUI(0); tcol_h = window.GetColourDUI(2);
        } else { // custom colour mapping: CUI colours can be remapped by changing the numbers (0-6)
            if (this.col.bg === "") this.col.bg = window.GetColourCUI(3);
            if (this.col.bgSel === "") this.col.bgSel = ppt.blurDark ? RGBA(255, 255, 255, 36) : ppt.blurLight ? RGBA(0, 0, 0, 36) : window.GetColourCUI(4);
            tcol = window.GetColourCUI(0); tcol_h = window.GetColourCUI(2);
        }

        const lightBg = get_textselcol(this.col.bg == 0 ? 0xff000000 : this.col.bg, true) == 50;
		if (ppt.blurDark) {tcol = RGB(255, 255, 255); tcol_h = RGB(255, 255, 255);}
		if (ppt.blurLight) {tcol = RGB(0, 0, 0); tcol_h = RGB(71, 129, 183);}
        if (this.col.text === "") this.col.text = ppt.blurBlend ? chgBrightness(tcol, lightBg ? -10 : 10) : tcol;
        if (this.col.text_h === "") this.col.text_h = ppt.blurBlend ? chgBrightness(tcol_h, lightBg ? -10 : 10) : tcol_h;
        if (ppt.swapCol) {const colH = this.col.text_h; this.col.text_h = this.col.text; this.col.text = colH;}
        if (this.col.nowp === "") this.col.nowp = !ppt.blurDark ? this.col.text_h : RGB(103, 240, 98);
        if (this.col.bg_h === "") this.col.bg_h = ppt.blurDark ? 0x24000000 : 0x1E30AFED;
		this.searchLnCol = ppt.searchLnCol == 1 && window.IsTransparent && !this.dui ? 0 : ppt.searchLnCol;
        if (this.col.frame === "") this.col.frame = ppt.blurDark ? 0xff808080 : 0xA330AFED;

        let blend = this.get_blend(this.col.bg == 0 ? 0xff000000 : this.col.bg, this.col.text, 0.75);
        const ln_col = [0, RGBA(136, 136, 136, 85), blend, this.col.text];
        if (this.col.line === "") this.col.line = ln_col[ppt.nodeLineCol];
        if (this.col.search === "") this.col.search = ppt.searchCol < 3 ? this.col.text : this.col.text_h;
        if (!this.dui && this.col.textSel === "") this.col.textSel = !ppt.blurDark && !ppt.blurLight ? window.GetColourCUI(1) : this.col.text;
        if (this.col.textSel === "") this.col.textSel = !ppt.blurDark && !ppt.blurLight ? get_textselcol(this.col.bgSel, false) : this.col.text;

        blend = this.get_blend(this.col.bg == 0 ? 0xff000000 : this.col.bg, !ppt.searchCol || ppt.searchCol == 2 ? this.col.text : this.col.text_h, 0.75);
        if (this.col.txt_box === "") this.col.txt_box = get_txtboxcol(this.col.bg);
        this.col.txt_filter = toRGB(this.col.txt_box);
        if (this.col.s_line === "") this.col.s_line = this.searchLnCol == 0 ? RGBA(136, 136, 136, 85) : this.searchLnCol == 1 ? blend : this.col.txt_box;
        if (window.IsTransparent && this.col.bgTrans) {this.bg = true; this.col.bg = this.col.bgTrans;}
        if (!window.IsTransparent || this.dui) {this.bg = true; if (colSat(this.col.bg) > 759) this.col.b2 = 0x06000000;}
        this.icon_col();
        this.col.t = this.bg ? get_textselcol(this.col.bg, true) : 200;
        if (this.local) {this.col.text = ppt.blurBlend ? chgBrightness(c_textcol, get_textselcol(this.col.bg == 0 ? 0xff000000 : this.col.bg, true) == 50 ? -10 : 10) : ppt.blurDark ? RGB(255, 255, 255) : ppt.blurLight ? RGB(0, 0, 0) : c_textcol; this.col.text_h = ppt.blurBlend ? chgBrightness(c_textcol_h, get_textselcol(this.col.bg == 0 ? 0xff000000 : this.col.bg, true) == 50 ? -10 : 10) : ppt.blurDark || !this.bg && this.trans && !ppt.blurLight ? RGB(255, 255, 255) : ppt.blurLight ? RGB(0, 0, 0) : c_textcol_h; this.col.textSel = c_textselcol; this.col.bgSel = c_backcolsel; ppt.rowStripes = c_alternate; this.fill = c_fill; this.pen = c_pen; this.pen_c = c_pen_c; this.col.search = this.col.txt_box = c_txt_box; this.col.b1 = c_b1; this.col.b2 = c_b2;}
        this.col.searchSel = window.IsTransparent || !this.col.bgSel ? 0xff0099ff : this.col.bgSel != this.col.search ? this.col.bgSel : 0xff0099ff;
    }
    this.get_colors();

    this.get_font = () => {
        if (ppt.customCol && ppt.custFont.length) {const custFont = ppt.custFont.splt(1); this.font = gdi.Font(custFont[0], Math.round(s.value(custFont[1], 16, 0)), Math.round(s.value(custFont[2], 0, 0)));}
        else if (this.dui) this.font = window.GetFontDUI(2); else this.font = window.GetFontCUI(0);
        if (!this.font) {this.font = gdi.Font("Segoe UI", 16, 0); s.trace("Spider Monkey Panel is unable to use your default font. Using Segoe UI at default size & style instead", false);}
        if (this.font.Size != ppt.baseFontSize) ppt.zoomFont = 100;
        ppt.baseFontSize = this.font.Size;
        zoomFontSize = Math.max(Math.round(ppt.baseFontSize * ppt.zoomFont / 100), 1);
        this.node_sz = this.nodeStyle ? Math.round(node_sz * ppt.zoomNode / 100) : Math.round(ppt.baseFontSize * ppt.zoomNode / 100);
        this.font = gdi.Font(this.font.Name, zoomFontSize, this.font.Style);
        ppt.zoomFont = Math.round(zoomFontSize / ppt.baseFontSize * 100);
        this.searchFont = gdi.Font(this.font.Name, this.font.Size, 2);
        this.jumpFont = gdi.Font(this.font.Name, this.font.Size * 1.5, 1);
        if (this.local) {this.font = c_font; this.searchFont = c_s_font; this.jumpFont = gdi.Font(this.font.Name, this.font.Size * 1.5, 1); ppt.margin = c_margin; ppt.treeIndent = c_pad; this.row_h = c_row_h; if (ppt.sbarShow) {this.sbarType = 0; this.sbar_w = c_scr_w; this.scr_but_w = this.sbar_w + 1; this.but_h = this.sbar_w + 1; this.sbar_sp = this.sbar_w +1;}}
        calc_text();
    }

    const calc_text = () => {
        s.gr(1, 1, false, g => {
            if (!this.local) this.row_h = Math.max(Math.round(g.CalcTextHeight("String", this.font)) + ppt.verticalPad, 2);
            if (this.nodeStyle) {
                this.node_sz = Math.round(s.clamp(this.node_sz, 7, this.row_h - 2));
                pop.create_images();
                ppt.zoomNode = Math.round(this.node_sz / node_sz * 100);}
            else {
                this.node_sz = Math.round(s.clamp(this.node_sz, 7, this.row_h * 1.15));
                this.iconFont = gdi.Font(iconFontName, this.node_sz, iconFontStyle);
                ppt.zoomNode = Math.round(this.node_sz / ppt.baseFontSize * 100);
            }
            sp = Math.max(Math.round(g.CalcTextWidth(" ", this.font)), 4);
            sp1 = Math.max(Math.round(sp * 1.5), 6);
            if (!this.nodeStyle) {const sp_e = g.MeasureString(this.expand, this.iconFont, 0, 0, 500, 500).Width, sp_c = g.MeasureString(this.collapse, this.iconFont, 0, 0, 500, 500).Width; sp2 = Math.round(Math.max(sp_e, sp_c) + sp / 3);}
        });
        this.l_s1 = Math.max(sp1 / 2, 4);
        this.l_wc = this.l_w - 1;
        this.l_s2 = Math.floor(this.node_sz / 2) + this.l_wc + 1;
        this.l_s3 = Math.max(7, this.node_sz / 2) - this.l_wc / 2;
        this.icon_w = this.nodeStyle ? this.node_sz + sp1 : sp + sp2;
        this.sel = (this.nodeStyle ? sp1 : sp + Math.round(sp / 3)) / 2;
        this.tt = this.nodeStyle ? -Math.ceil(sp1 / 2 - 3) + sp1 : sp;
    }

    this.dragZoom = (x, y) => {if (sbar.touch.dn && vk.k('zoom')) {const y_delta = (y - this.y_start); if (Math.abs(y_delta) > this.h / 50) {this.wheel(y - this.y_start >=0 ? -1 : 1, true); this.y_start = y;}}}
    const nodeZoom = step => {this.node_sz += step; calc_text(); p.on_size();}

    const filterZoom = step => {
        if (p.zoomFilter < 0.7) return; p.zoomFilter += step * 0.1; p.zoomFilter = Math.max(p.zoomFilter, 0.7);
        p.filterFont = gdi.Font("Segoe UI", p.zoomFilter > 1.05 ? Math.floor(11 * s.scale * p.zoomFilter) : 11 * s.scale * p.zoomFilter, 1);
        p.filterBtnFont = gdi.Font("Segoe UI", p.zoomFilter > 1.05 ? Math.floor(9 * s.scale * p.zoomFilter) : 9 * s.scale * p.zoomFilter, 1);
        p.calc_text(); but.refresh(true);
		ppt.zoomFilter = Math.round(p.zoomFilter * 100);
    }

    const txtZoom = step => {
        zoomFontSize += step;
        zoomFontSize = Math.max(zoomFontSize, 1);
        const fnm = this.font.Name, fst = this.font.Style;
        this.font = gdi.Font(fnm, zoomFontSize, fst);
        this.searchFont = gdi.Font(fnm, zoomFontSize, 2);
        this.jumpFont = gdi.Font(fnm, zoomFontSize * 1.5, 1);
        calc_text(); p.on_size(); jS.on_size();
        pop.create_tooltip(); if (ppt.searchShow || ppt.sbarShow) but.refresh(true); sbar.reset(); ppt.zoomFont = Math.round(zoomFontSize / ppt.baseFontSize * 100);
    }

    this.wheel = (step, all) => {
        const textZoom = p.m_x >= Math.round(this.icon_w + ppt.margin + (ppt.rootNode ? ppt.treeIndent : 0));
        if (p.m_y > p.s_h && textZoom || all) txtZoom(step);
        if (p.m_y > p.s_h && !textZoom || all) nodeZoom(step);
        if (p.m_y <= p.s_h || all) filterZoom(step);
        window.Repaint();
    }

    const getImgFallback = () => {if (sbar.draw_timer || !this.get) return; getFbImg(); this.get = false;}
    const getFbImg = handle => {if (!handle) handle = fb.IsPlaying ? fb.GetNowPlaying() : fb.GetFocusItem(); if (handle) {cur_handle = handle; utils.GetAlbumArtAsync(window.ID, handle, 0); return;} if (fb.IsPlaying) return; image = stub(1); if (!image) {blurImg = null; return;} blur_img(image);}
    const stub = n => {image_path_o = n ? "noitem" : "stub"; return noimg[n].Clone(0, 0, noimg[n].Width, noimg[n].Height);}
    this.block = () => {return this.w <= 10 || this.h <= 10 || !window.IsVisible;}
    this.blurReset = clear => { blurImg = null; image_path_o = ""; if (clear) on_colours_changed(); this.on_playback_new_track();}
    this.chgBlur = n => {ppt.blurDark = false; ppt.blurBlend = false; ppt.blurLight = false; ppt.imgBg = false; switch (n) {case 1: ppt.blurDark = true; break; case 2: ppt.blurBlend = true; break; case 3: ppt.blurLight = true; break; case 4: ppt.imgBg = true; break;} blurLevel = ppt.blurBlend ? 91.05 - s.clamp(ppt.blurTemp, 1.05, 90) : s.clamp(ppt.blurTemp * 2, 0, 254); this.blurReset(true);}
    this.create_images = () => {const cc = StringFormat(1, 1), font1 = gdi.Font("Segoe UI", 270, 1), font2 = gdi.Font("Segoe UI", 120, 1), font3 = gdi.Font("Segoe UI", 200, 1), font4 = gdi.Font("Segoe UI", 90, 1), tcol = !ppt.blurDark && !ppt.blurLight ? this.col.text : this.dui ? window.GetColourDUI(0) : window.GetColourCUI(0); noimg = ["COVER", "SELECTION"]; for (let i = 0; i < noimg.length; i++) {let n = noimg[i]; noimg[i] = s.gr(500, 500, true, g => {g.SetSmoothingMode(2); if (!ppt.blurDark && !ppt.blurLight) {g.FillSolidRect(0, 0, 500, 500, tcol); g.FillGradRect(-1, 0, 505, 500, 90, this.col.bg & 0xbbffffff, this.col.bg, 1.0);} g.SetTextRenderingHint(3); g.DrawString("NO", i ? font3 : font1, tcol & 0x25ffffff, 0, 0, 500, 275, cc); g.DrawString(n, i ? font4 : font2, tcol & 0x20ffffff, 2.5, 175, 500, 275, cc); g.FillSolidRect(60, 388, 380, 50, tcol & 0x15ffffff);});} this.get = true;}; this.create_images();
    this.focus_changed = s.debounce(() => {this.on_playback_new_track();}, 250, {'leading':true, 'trailing': true});
	this.get_album_art_done = (handle, image, image_path) => {if (!cur_handle.Compare(handle)) return; if (image_path_o == image_path && blurImg && image) return window.Repaint(); image_path_o = image_path; if (!image) image = stub(0); if (!image) {blurImg = null; return;} blur_img(image);}
	this.on_playback_new_track = handle => {if (!this.blur && !ppt.imgBg) return; if (this.block()) this.get = true; else {getFbImg(handle); this.get = false;}}

    const blur_img = image => {
        if (!this.w || !this.h) return; let imgw, imgh, imgx, imgy;
        if (!this.blur && ppt.autoFill || this.blur && ppt.blurAutofill) {const s1 = image.Width / this.w, s2 = image.Height / this.h; if (!this.blur && ppt.autoFill && Math.abs(s1 / s2 - 1) < 0.05) {imgx = 0; imgy = 0; imgw = image.Width; imgh = image.Height;} else {if (s1 > s2) {imgw = Math.round(this.w * s2); imgh = image.Height; imgx = Math.round((image.Width - imgw) / 2); imgy = 0;} else {imgw = image.Width; imgh = Math.round(this.h * s1); imgx = 0; imgy = Math.round((image.Height - imgh) / 8);}}}
        blurImg = s.gr(this.w, this.h, true, (g, gi) => {
            switch (true) {
                case this.blur:
                    g.SetInterpolationMode(0); if (ppt.blurAutofill) image = image.Clone(imgx, imgy, imgw, imgh);
                    if (ppt.blurBlend) {
                        let iSmall = image.Resize(this.w * blurLevel / 100, this.h * blurLevel / 100, 2), iFull = iSmall.Resize(this.w, this.h, 2), offset = 90 - blurLevel;
                        g.DrawImage(iFull, 0 - offset, 0 - offset, this.w + offset * 2, this.h + offset * 2, 0, 0, iFull.Width, iFull.Height, 0, 63 * blurAlpha);
                    } else {
                        g.DrawImage(image, 0, 0, this.w, this.h, 0, 0, image.Width, image.Height); if (blurLevel > 1) gi.StackBlur(blurLevel);
                        const colorScheme_array = gi.GetColourScheme(1), light_cover = get_textselcol(colorScheme_array[0], true) == 50 ? true : false;
                        g.FillSolidRect(0, 0, this.w, this.h, light_cover ? this.col.bg_light : this.col.bg_dark);
                    } break;
                case !this.blur:
                    if (ppt.autoFill) g.DrawImage(image, 0, 0, this.w, this.h, imgx, imgy, imgw, imgh, 0, this.covAlpha);
                    else {const sc = Math.min(this.h / image.Height, this.w / image.Width), tw = Math.round(image.Width * sc), th = Math.round(image.Height * sc); g.DrawImage(image, (this.w - tw) / 2, (this.h - th) / 2, tw, th, 0, 0, image.Width, image.Height, 0, this.covAlpha);}
                    break;
            }
        });
        window.Repaint();
    }

    this.draw = gr => {
        if (this.bg) gr.FillSolidRect(0, 0, this.w, this.h, this.col.bg);
        if (!this.blur && !ppt.imgBg) return;
        getImgFallback();
        if (blurImg) gr.DrawImage(blurImg, 0, 0, this.w, this.h, 0, 0, blurImg.Width, blurImg.Height);
    }

    this.sbarType = s.value(ppt.sbarType.replace(/\s+/g, "").charAt(), 0, 2); if (this.sbarType == 2)  ppt.sbarType = "2 // Scrollbar Settings N/A For Themed"; else ppt.sbarType = "" + this.sbarType + "";
    if (this.sbarType == 2) {this.theme = window.CreateThemeManager("scrollbar"); s.gr(21, 21, false, g => {try {this.theme.SetPartAndStateID(6, 1); this.theme.DrawThemeBackground(g, 0, 0, 21, 50); for (let i = 0; i < 3; i++) {this.theme.SetPartAndStateID(3, i + 1); this.theme.DrawThemeBackground(g, 0, 0, 21, 50);} for (let i = 0; i < 3; i++) {this.theme.SetPartAndStateID(1, i + 1); this.theme.DrawThemeBackground(g, 0, 0, 21, 21);}} catch (e) {this.sbarType = 1; ppt.sbarType = "" + 1 + "";}});}
	this.sbarSet = () => {
		this.sbar_w = s.clamp(s.value(sbarMetrics[1], 11, 0), 0, 400); ppt.sbarBase_w = s.clamp(ppt.sbarBase_w, 0, 400);
		if (this.sbar_w != ppt.sbarBase_w) {this.scr_but_w = Math.min(s.value(sbarMetrics[3], 11, 0), this.sbar_w, 400); ppt.sbarMetrics = "Bar," + this.sbar_w +",Arrow," + this.scr_but_w + ",Gap(+/-)," + this.arrow_pad + ",GripMinHeight," + this.grip_h;} else {this.scr_but_w = s.clamp(s.value(sbarMetrics[3], 11, 0), 0, 400); this.sbar_w = s.clamp(this.sbar_w, this.scr_but_w, 400); ppt.sbarMetrics = "Bar," + this.sbar_w +",Arrow," + this.scr_but_w + ",Gap(+/-)," + this.arrow_pad + ",GripMinHeight," + this.grip_h;} ppt.sbarBase_w = this.sbar_w;
		if (this.sbarType == 2) {let themed_w = 21; try {themed_w = utils.GetSystemMetrics(2);} catch (e) {}; this.sbar_w = themed_w;} if (!ppt.sbarShow) this.sbar_w = 0; this.but_h = this.sbar_w + (this.sbarType != 2 ? 1 : 0); if (this.sbarType != 2) this.scr_but_w += 1; this.sbar_sp = this.sbar_w ? this.sbar_w + (this.sbar_w - this.scr_but_w < 5 || this.sbarType == 2 ? 1 : 0) : 0; this.arrow_pad = s.clamp(-this.but_h / 5, this.arrow_pad, this.but_h / 5);
	}; this.sbarSet();
}

function Bezier(){const i=4,c=.001,o=1e-7,v=10,l=11,s=1/(l-1),n=typeof Float32Array==="function";function e(r,n){return 1-3*n+3*r}function u(r,n){return 3*n-6*r}function a(r){return 3*r}function w(r,n,t){return((e(n,t)*r+u(n,t))*r+a(n))*r}function y(r,n,t){return 3*e(n,t)*r*r+2*u(n,t)*r+a(n)}function h(r,n,t,e,u){let a,f,i=0;do{f=n+(t-n)/2;a=w(f,e,u)-r;if(a>0){t=f}else{n=f}}while(Math.abs(a)>o&&++i<v);return f}function A(r,n,t,e){for(let u=0;u<i;++u){const a=y(n,t,e);if(a===0){return n}const f=w(n,t,e)-r;n-=f/a}return n}function f(r){return r}function bezier(i,t,o,e){if(!(0<=i&&i<=1&&0<=o&&o<=1)){throw new Error("Bezier x values must be in [0, 1] range")}if(i===t&&o===e){return f}const v=n?new Float32Array(l):new Array(l);for(let r=0;r<l;++r){v[r]=w(r*s,i,o)}function u(r){const e=l-1;let n=0,t=1;for(;t!==e&&v[t]<=r;++t){n+=s}--t;const u=(r-v[t])/(v[t+1]-v[t]),a=n+u*s,f=y(a,i,o);if(f>=c){return A(r,a,i,o)}else if(f===0){return a}else{return h(r,n,n+s,i,o)}}return function r(n){if(n===0){return 0}if(n===1){return 1}return w(u(n),t,e)}} this.scroll = bezier(0.25, 0.1, 0.25, 1); this.bar = bezier(0.165,0.84,0.44,1); this.barFast = bezier(0.19, 1, 0.22, 1); this.inertia = bezier(0.23, 1, 0.32, 1);}; const ease = new Bezier();
function on_colours_changed() {ui.reset_colors(); ui.get_colors(); if (ui.nodeStyle) pop.create_images(); but.create_images(); but.refresh(); ui.create_images(); ui.blurReset(); window.Repaint();}
function on_font_changed() {ui.get_font(); sbar.reset(); p.on_size(); pop.create_tooltip(); if (ppt.searchShow || ppt.sbarShow) but.refresh(true); window.Repaint();}

function Panel() {
    const def_ppt = ppt.get(" View by Folder Structure: Name // Pattern", "View by Folder Structure // Pattern Not Configurable"), DT_CENTER = 0x00000001, DT_VCENTER = 0x00000004, DT_SINGLELINE = 0x00000020, DT_CALCRECT = 0x00000400, DT_NOPREFIX = 0x00000800, DT_END_ELLIPSIS = 0x00008000, sbarStyle = !ppt.sbarStyle ? 2 : 0;
    let grps = [], i = 0, sort = "";
    this.cc = DT_CENTER | DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX; this.f_y = 0; this.f_w = []; this.f_h = 0; this.f_menu = []; this.f_x1 = 0; this.filt = []; this.folder_view = 10; this.folderView = false; this.grp = []; this.grp_sort = ""; this.grp_split = []; this.grp_split_clone = []; this.grp_split_orig = []; this.l = DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX; this.lc = DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX | DT_END_ELLIPSIS; this.last_pressed_coord = {x: -1, y: -1}; this.list = FbMetadbHandleList(); this.menu = []; this.multi_value = []; this.m_x = 0; this.m_y = 0; this.pos = -1; this.s_cursor = false; this.s_lc = StringFormat(0, 1); this.search = false; this.s_txt = ""; this.s_x = 0; this.s_h = 0; this.s_w1 = 0; this.s_w2 = 0; if (!ppt.searchShow) ppt.autoFit = true; this.zoomFilter = Math.max(ppt.zoomFilter / 100, 0.7); this.splitter = "¦"; this.sp_splitter = ` ${this.splitter}`; ppt.zoomFilter = this.zoomFilter * 100;

	let props = v => ppt.get(v[0], v[1]);
    let pt = [
        [" View 01: Name // Pattern", "View by Artist // %artist%|%album%|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%"],
        [" View 02: Name // Pattern", "View by Album Artist // %album artist%|%album%|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%"],
        [" View 03: Name // Pattern", "View by Album Artist - Album // [%album artist% - ]['['%date%']' ]%album%|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%"],
        [" View 04: Name // Pattern", "View by Album // %album%[ '['%album artist%']']|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%"],
        [" View 05: Name // Pattern", "View by Genre // %<genre>%|[%album artist% - ]%album%|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%"],
        [" View 06: Name // Pattern", "View by Year // %date%|[%album artist% - ]%album%|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%"]
    ];
    const view_ppt = pt.map(props), ppt_l = view_ppt.length + 1;
    let nm = ""; ; for (i = ppt_l; i < ppt_l + 93; i++) {nm = ppt.get(" View " + s.padNumber(i, 2) + ": Name // Pattern"); if (nm && nm != " // ") view_ppt.push(ppt.get(" View " + s.padNumber(i, 2) + ": Name // Pattern"));}
    pt = [
        [" View Filter 01: Name // Query", "Filter // Query Not Configurable"],
        [" View Filter 02: Name // Query", "Lossless // \"$info(encoding)\" IS lossless"],
        [" View Filter 03: Name // Query", "Lossy // \"$info(encoding)\" IS lossy"],
        [" View Filter 04: Name // Query", "Missing Replaygain // %replaygain_track_gain% MISSING"],
        [" View Filter 05: Name // Query", "Never Played // %play_count% MISSING"],
        [" View Filter 06: Name // Query", "Played Often // %play_count% GREATER 9"],
        [" View Filter 07: Name // Query", "Recently Added // %added% DURING LAST 2 WEEKS"],
        [" View Filter 08: Name // Query", "Recently Played // %last_played% DURING LAST 2 WEEKS"],
        [" View Filter 09: Name // Query", "Top Rated // %rating% IS 5"],
		[" View Filter 10: Name // Query", "Nowplaying Artist // artist IS $nowplaying{%artist%}"]
    ];
    const filter_ppt = pt.map(props), filt_l = filter_ppt.length + 1; pt = undefined;
    for (i = filt_l; i < filt_l + 90; i++) {nm = ppt.get(" View Filter " + s.padNumber(i, 2) + ": Name // Query"); if (nm && nm != " // ") filter_ppt.push(ppt.get(" View Filter " + s.padNumber(i, 2) + ": Name // Query"));}
    this.filterFont = gdi.Font("Segoe UI", this.zoomFilter > 1.05 ? Math.floor(11 * s.scale * this.zoomFilter) : 11 * s.scale * this.zoomFilter, 1);
    this.filterBtnFont = gdi.Font("Segoe UI", this.zoomFilter > 1.05 ? Math.floor(9 * s.scale * this.zoomFilter) : 9 * s.scale * this.zoomFilter, 1);
    this.pn_h_auto = ppt.pn_h_auto && ppt.rootNode; this.init = true; if (this.pn_h_auto) {window.MaxHeight = window.MinHeight = ppt.pn_h;}

    let paint_y = Math.floor(ppt.searchShow || !ppt.sbarShow ? this.s_h : 0);
    this.search_paint = () => {window.RepaintRect(ppt.margin, 0, ui.w - ppt.margin, this.s_h);}
    this.setHeight = n => {if (!this.pn_h_auto) return; ppt.pn_h = n ? ppt.pn_h_max : ppt.pn_h_min; window.MaxHeight = window.MinHeight = ppt.pn_h;}
	this.setRootName = () => {this.rootName = ppt.rootNode == 2 ? this.grp[ppt.viewBy].name : "All Music";}
    this.sort = li => {switch (this.folderView) {case true: li.OrderByRelativePath(); break; default: let tfo = FbTitleFormat(this.grp_sort); li.OrderByFormat(tfo, 1); break;}}
    this.tree_paint = () => {window.RepaintRect(0, paint_y, ui.w, ui.h - paint_y + 1);}

    this.calc_text = () => {
        s.gr(1, 1, false, g => {
            this.f_h = g.CalcTextHeight("String", this.filterFont);
            this.f_w = this.filt.map(v => g.CalcTextWidth(v.name, this.filterFont));
            this.f_sw = g.CalcTextWidth("   ▼", this.filterBtnFont);
        });
        this.f_x1 = ui.w - ppt.margin - this.f_w[ppt.filterBy] - this.f_sw;
        this.s_w2 = ppt.searchShow > 1 ? this.f_x1 - this.s_x - 11 : this.s_w1 - Math.round(ui.row_h * 0.75) - this.s_x + 1;
    }

    this.fields = (view, filter) => {
        this.filt = []; this.folder_view = 10; this.grp = []; this.grp_sort = ""; this.multiProcess = false; this.multi_swap = false; ppt.filterBy = filter; this.mv_sort = ""; this.view = ""; ppt.viewBy = view;
        view_ppt.forEach((v, i) => {if (v.includes("//")) {grps = v.split("//"); this.grp[i] = {name:grps[0].trim(), type:grps[1]}}}); grps = [];
        filter_ppt.forEach((v, i) => {if (v.includes("//")) {grps = v.split("//"); this.filt[i] = {name:grps[0].trim(), type:grps[1].trim()}}});

        const name = v => v.name;
        const removeEmpty = v => v && v.name != "" && v.type != "";

        this.grp = this.grp.filter(removeEmpty);
        this.filt = this.filt.filter(removeEmpty);
        this.grp[this.grp.length] = {name: def_ppt.split("//")[0].trim(), type: ""}
        this.folder_view = this.grp.length - 1; ppt.filterBy = Math.min(ppt.filterBy, this.filt.length - 1); ppt.viewBy = Math.min(ppt.viewBy, this.grp.length - 1);
        if (this.grp[ppt.viewBy].type.includes("%<")) this.multiProcess = true;
		this.folderView = ppt.viewBy == this.folder_view;
		if (!this.folderView) {
            if (this.multiProcess) {
                if (this.grp[ppt.viewBy].type.includes("$swapbranchprefix{%<")) this.multi_swap = true;
                this.mv_sort = FbTitleFormat((this.grp[ppt.viewBy].type.includes("album artist") || !this.grp[ppt.viewBy].type.includes("%artist%") && !this.grp[ppt.viewBy].type.includes("%<artist>%") && !this.grp[ppt.viewBy].type.includes("$meta(artist") ? "%album artist%" : "%artist%") + "|%album%|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%");
            }
            this.grp_split = this.grp[ppt.viewBy].type.replace(/^\s+/, "").split("|");
            this.grp_split.forEach((v, i) => {
                this.multi_value[i] = v.includes("%<") ? true : false;
                if (this.multi_value[i]) {
                    this.grp_split_orig[i] = v.slice();
                    if (v.includes("$swapbranchprefix{%<")) {
                        let ip1 = v.indexOf("$swapbranchprefix{%<"), ip2 = v.indexOf(">%}", ip1) + 2;
                        v = s.replaceAt(v, ip2, "");
                        this.grp_split_orig[i] = v.replace(/\$swapbranchprefix{%</g, "%<");
                        v = v.replace(/\$swapbranchprefix{%</g, "~%<");
                    }
                    v = v.replace(/%<album artist>%/i,"$if3(%<#album artist#>%,%<#artist#>%,%<#composer#>%,%<#performer#>%)").replace(/%<album>%/i,"$if2(%<#album#>%,%<#venue#>%)").replace(/%<artist>%/i,"$if3(%<artist>%,%<album artist>%,%<composer>%,%<performer>%)").replace(/<#/g,"<").replace(/#>/g,">");
                    this.grp_split_clone[i] = v.slice();
                    v = this.grp_split_orig[i].replace(/[<>]/g,"");
                }
                this.grp_sort += (v + this.sp_splitter);
                if (this.multi_value[i]) v = this.grp_split_clone[i].replace(/%</g, "#!#$meta_sep(").replace(/>%/g, "," + "@@)#!#");
                this.view += (v + this.splitter);
            });
            let ix1 = -1, ix2 = -1;
            if (!this.multiProcess) this.view = this.view.replace(/\$nodisplay{.*?}/gi, "");
            else while(this.view.includes("$nodisplay{")) {ix1 = this.view.indexOf("$nodisplay{"); ix2 = this.view.indexOf("}", ix1); this.view = s.replaceAt(this.view, ix2, " #@#"); this.view = this.view.replace("$nodisplay{", "#@#");}
            this.view = this.view.slice(0, -this.splitter.length);
            while(this.grp_sort.includes("$nodisplay{")) {ix1 = this.grp_sort.indexOf("$nodisplay{"); ix2 = this.grp_sort.indexOf("}", ix1); this.grp_sort = s.replaceAt(this.grp_sort, ix2, " "); this.grp_sort = this.grp_sort.replace("$nodisplay{", "");}
        }
        this.setRootName();
        this.f_menu = this.filt.map(name);
        this.menu = this.grp.map(name);
        this.calc_text();
    }
    this.fields(ppt.viewBy, ppt.filterBy);

    let k = 1; for (i = 0; i < 100; i++) {nm = ppt.get(" View " + (i < 10 ? "0" + i : i) + ": Name // Pattern"); if (nm && nm != " // ") {ppt.set(" View " + (k < 10 ? "0" + k : k) + ": Name // Pattern", nm); k += 1} else ppt.set(" View " + (i < 10 ? "0" + i : i) + ": Name // Pattern", null);}
    for (i = k; i < k + 5; i++) ppt.set(" View " + (i < 10 ? "0" + i : i) + ": Name // Pattern", " // ");
    k = 1; for (i = 0; i < 100; i++) {nm = ppt.get(" View Filter " + (i < 10 ? "0" + i : i) + ": Name // Query"); if (nm && nm != " // ") {ppt.set(" View Filter " + (k < 10 ? "0" + k : k) + ": Name // Query", nm); k += 1} else ppt.set(" View Filter " + (i < 10 ? "0" + i : i) + ": Name // Query", null);}
    for (i = k; i < k + 5; i++) ppt.set(" View Filter " + (i < 10 ? "0" + i : i) + ": Name // Query", " // ");

    this.on_size = () => {
        this.f_x1 = ui.w - ppt.margin - this.f_w[ppt.filterBy] - this.f_sw;
        this.s_x = Math.round(ppt.margin + ui.row_h);
        this.s_w1 = ui.w - ppt.margin;
        this.s_w2 = ppt.searchShow > 1 ? this.f_x1 - this.s_x - 11 : this.s_w1 - Math.round(ui.row_h * 0.75) - this.s_x + 1;
        this.ln_sp = ppt.searchShow && !ui.local ? Math.floor(ui.row_h * 0.1) : 0;
        this.s_h = ppt.searchShow ? ui.row_h + (!ui.local ? this.ln_sp * 2 : 0) : ppt.margin;
        this.s_sp = this.s_h - this.ln_sp;
        this.sp = ui.h - this.s_h - (ppt.searchShow ? 0 : ppt.margin);
        this.rows = this.sp / ui.row_h;
        if (ppt.autoFit) {this.rows = Math.floor(this.rows); this.sp = ui.row_h * this.rows;}
        this.node_y = Math.round((ui.row_h - ui.node_sz) / 1.75);
        const sbar_top = !ui.sbarType ? 5 : ppt.searchShow ? 3 : 0, sbar_bot = !ui.sbarType ? 5 : 0;
        this.sbar_o = [ui.arrow_pad, Math.max(Math.floor(ui.scr_but_w * 0.2), 3) + ui.arrow_pad * 2, 0][ui.sbarType];
        this.sbar_x = ui.w - ui.sbar_sp;
        const top_corr = [this.sbar_o - (ui.but_h - ui.scr_but_w) / 2, this.sbar_o, 0][ui.sbarType];
        const bot_corr = [(ui.but_h - ui.scr_but_w) / 2 - this.sbar_o, -this.sbar_o, 0][ui.sbarType];
        let sbar_y = (ui.sbarType < sbarStyle || ppt.searchShow ? this.s_sp + 1 : 0) + sbar_top + top_corr;
        let sbar_h = ui.sbarType < sbarStyle && ppt.autoFit ? this.sp + 1 - sbar_top - sbar_bot + bot_corr * 2 : ui.h - sbar_y  - sbar_bot + bot_corr;
        if (ui.sbarType == 2) {sbar_y += 1; sbar_h -= 2;}
        this.f_y = this.sp + this.s_h - ui.row_h * 0.9;
        if (this.init) sbar.item_y = this.s_h;
		paint_y = Math.floor(ppt.searchShow || !ppt.sbarShow ? this.s_h : 0);
        sbar.metrics(this.sbar_x, sbar_y, ui.sbar_w, sbar_h, this.rows, ui.row_h);
    }

	this.resetZoom = () => {
		ppt.zoomFont = 100;
		ppt.zoomNode = 100;
		this.zoomFilter = 1;
		ppt.zoomFilter = 100;
		ppt.set(" Zoom Tooltip [Button] (%)", 100);
		this.filterFont = gdi.Font("Segoe UI", 11 * s.scale * this.zoomFilter, 1);
		this.filterBtnFont = gdi.Font("Segoe UI", 9 * s.scale * this.zoomFilter, 1);
		this.calc_text();
		ui.get_font();
		this.on_size(); jS.on_size();
		but.create_tooltip();
		pop.create_tooltip();
		if (ppt.searchShow || ppt.sbarShow) but.refresh(true); sbar.reset();
		window.Repaint();
	}

	this.set = (n, i) => {
		switch (n) {
			case 'itemCounts': ppt.nodeCounts = i; pop.set(); lib.rootNodes(1, true); break;
			case 'rootNode': ppt.rootNode = i; pop.set(); this.setRootName(); lib.rootNodes(1); this.pn_h_auto = ppt.pn_h_auto && ppt.rootNode; if (this.pn_h_auto) {window.MaxHeight = window.MinHeight = ppt.pn_h;} break;
			case 'view': lib.time.Reset(); if (this.s_txt) lib.upd_search = true; this.fields(i < this.grp.length ? i : ppt.viewBy, i < this.grp.length ? ppt.filterBy : i - this.grp.length); pop.subCounts =  {"standard": {}, "search": {}, "filter": {}}; lib.getLibrary(); lib.rootNodes(); if (this.pn_h_auto && ppt.pn_h == ppt.pn_h_min && pop.tree[0]) pop.clear_child(pop.tree[0]); break;
		}
	}
	
	this.toggle = n => {
		switch (n) {
			case 'fullLineSelection': ppt.fullLineSelection = !ppt.fullLineSelection; pop.set(); this.tree_paint(); break;
			case 'nodeHighlight': ppt.nodeHighlight = !ppt.nodeHighlight; pop.set(); break;
			case 'nowPlaying': ppt.showNowplaying = !ppt.showNowplaying; pop.set(); if (ppt.showNowplaying) {pop.getNowplaying(); pop.nowPlayingShow()} else pop.nowp = -1; break;
			case 'rowStripes': ppt.rowStripes = !ppt.rowStripes; pop.set(); ui.get_colors(); sbar.reset(); this.tree_paint(); break;
			case 'scrollbar': ppt.sbarShow = !ppt.sbarShow;  ui.sbarSet(); ui.get_font(); but.create_images(); this.on_size(); but.refresh(true); but.set_scroll_btns_hide(true); this.tree_paint(); break;
			case 'search': ppt.searchShow = ppt.searchShow != 1 ? 1 : 0; window.Reload(); break;
			case 'search+filter': ppt.searchShow = ppt.searchShow != 2 ? 2 : 0; window.Reload(); break;
			case 'showTracks': ppt.showTracks = !ppt.showTracks; pop.set(); lib.rootNodes(1, true); break;
			case 'tooltip': ppt.tooltip = !ppt.tooltip; pop.set(); break;
		}
	}
}

function Scrollbar() {
    let period = ppt.duration.splt(0); period = {drag : 200, inertia : s.clamp(s.value(period[3], 3000, 0), 0, 5000), scroll : s.clamp(s.value(period[1], 500, 0), 0, 5000)}; period.step = period.scroll * 2 / 3;
    let alpha = !ppt.sbarCol ? 75 : (!ui.sbarType ? 68 : 51), amplitude, b_is_dragging = false, bar_ht = 0, bar_timer = null, bar_y = 0, but_h = 0, clock = Date.now(), counter = 0, drag_distance_per_row = 0, duration = period.scroll, elap = 0, event = "", fast = false, frame, hover = false, hover_o = false, init = true, initial_drag_y = 0, initial_scr = 1, initial_y = -1, ix = -1, lastTouchDn = Date.now(), max_scroll, offset = 0, ratio = 1, reference = -1, rows = 0, scrollbar_height = 0, scrollbar_travel = 0, start = 0, startTime = 0, ticker, timestamp, ts, velocity;
    const alpha1 = alpha, alpha2 = !ppt.sbarCol ? 128 : (!ui.sbarType ? 119 : 85), inStep = ui.sbarType && ppt.sbarCol ? 12 : 18, ln_sp = ppt.searchShow && !ui.local ? Math.floor(ui.row_h * 0.1) : 0, min = 10 * s.scale, mv = 2 * s.scale;
    this.count = -1; this.delta = 0; ppt.flickDistance = s.clamp(ppt.flickDistance, 0, 10); this.draw_timer = null; this.item_y = ppt.searchShow ? ui.row_h + (!ui.local ? ln_sp * 2 : 0) : ppt.margin; this.row_count = 0; this.rows_drawn = 0; this.row_h = 0; this.scroll = 0; this.scrollable_lines = 0; ppt.scrollStep = s.clamp(ppt.scrollStep, 0, 10); ppt.touchStep = s.clamp(ppt.touchStep, 1, 10); this.stripe_w = 0; this.timer_but = null; this.touch = {dn: false, end: 0, start: 0}; this.tree_w = 0; this.x = 0; this.y = 0; this.w = 0; this.h = 0;

    const upd_debounce = s.debounce(() => lib.treeState(false, ppt.rememberTree), 400);
    const nearest = y => {y = (y - but_h) / scrollbar_height * max_scroll; y = y / this.row_h; y = Math.round(y) * this.row_h; return y;}
    const scroll_throttle = s.throttle(() => {this.delta = this.scroll; scroll_to();}, 16);
    const scroll_timer = () => this.draw_timer = setInterval(() => {if (ui.w < 1 || !window.IsVisible) return; smooth_scroll();}, 16);

    this.leave = () => {if (this.touch.dn) this.touch.dn = false; if (b_is_dragging) return; hover = !hover; this.paint(); hover = false; hover_o = false;}
    this.page_throttle = s.throttle(dir => this.check_scroll(Math.round((this.scroll + dir * -(this.rows_drawn - 1) * this.row_h) / this.row_h) * this.row_h), 100);
    this.reset = () => {this.delta = this.scroll = 0; this.item_y = p.s_h; this.metrics(this.x, this.y, this.w, this.h, this.rows_drawn, this.row_h);}
    this.set_rows = row_count => {if (!row_count) this.item_y = p.s_h; this.row_count = row_count; this.metrics(this.x, this.y, this.w, this.h, this.rows_drawn, this.row_h);}
    this.wheel = step => this.check_scroll(Math.round((this.scroll + step * - (!ppt.scrollStep ? this.rows_drawn - 1 : ppt.scrollStep) * this.row_h) / this.row_h) * this.row_h, ppt.scrollStep ? 'step' : "");

    this.metrics = (x, y, w, h, rows_drawn, row_h) => {
        this.x = x; this.y = Math.round(y); this.w = w; this.h = h; this.rows_drawn = rows_drawn; if (!ppt.autoFit) this.rows_drawn = Math.floor(this.rows_drawn); this.row_h = row_h; but_h = ui.but_h;
        // draw info
        scrollbar_height = Math.round(this.h - but_h * 2);
        bar_ht = Math.max(Math.round(scrollbar_height * this.rows_drawn / this.row_count), s.clamp(scrollbar_height / 2, 5, ui.grip_h));
        scrollbar_travel = scrollbar_height - bar_ht;
        // scrolling info
        this.scrollable_lines = this.row_count - this.rows_drawn;
        ratio = this.row_count / this.scrollable_lines;
        bar_y = but_h + scrollbar_travel * (this.delta * ratio) / (this.row_count * this.row_h);
        drag_distance_per_row = scrollbar_travel / this.scrollable_lines;
        // panel info
        this.tree_w = ui.w - Math.max(ppt.sbarShow && this.scrollable_lines > 0 ? ui.sbar_sp + ui.sel : ui.sel, ppt.margin);
        if (ppt.rowStripes) this.stripe_w = ppt.sbarShow && this.scrollable_lines > 0 ? ui.w - ui.sbar_sp - Math.round(3 * s.scale) : ui.w;
        max_scroll = this.scrollable_lines * this.row_h;
        but.set_scroll_btns_hide();
    }

    this.draw = gr => {
        if (this.scrollable_lines > 0) {
            switch (ui.sbarType) {
                case 0:
                    if (ppt.rowStripes) gr.FillSolidRect(this.x, this.y, this.w, this.h, ui.col.b1);
                    switch (ppt.sbarCol) {
                        case 0: gr.FillSolidRect(this.x, this.y + bar_y, this.w, bar_ht, RGBA(ui.col.t, ui.col.t, ui.col.t, !hover && !b_is_dragging ? alpha : hover && !b_is_dragging ? alpha : 192)); break;
                        case 1: gr.FillSolidRect(this.x, this.y + bar_y, this.w, bar_ht, ui.col.text & (!hover && !b_is_dragging ? RGBA(255, 255, 255, alpha) : hover && !b_is_dragging ? RGBA(255, 255, 255, alpha) : 0x99ffffff)); break;
                    } break;
                case 1:
                    switch (ppt.sbarCol) {
                        case 0: gr.FillSolidRect(this.x, this.y - p.sbar_o, this.w, this.h + p.sbar_o * 2, RGBA(ui.col.t, ui.col.t, ui.col.t, 15)); gr.FillSolidRect(this.x, this.y + bar_y, this.w, bar_ht, RGBA(ui.col.t, ui.col.t, ui.col.t, !hover && !b_is_dragging ? alpha : hover && !b_is_dragging ? alpha : 192)); break;
                        case 1: gr.FillSolidRect(this.x, this.y - p.sbar_o, this.w, this.h + p.sbar_o * 2, ui.col.text & 0x15ffffff); gr.FillSolidRect(this.x, this.y + bar_y, this.w, bar_ht, ui.col.text & (!hover && !b_is_dragging ? RGBA(255, 255, 255, alpha) : hover && !b_is_dragging ? RGBA(255, 255, 255, alpha) : 0x99ffffff)); break;
                    } break;
                case 2: ui.theme.SetPartAndStateID(6, 1); ui.theme.DrawThemeBackground(gr, this.x, this.y, this.w, this.h); ui.theme.SetPartAndStateID(3, !hover && !b_is_dragging ? 1 : hover && !b_is_dragging ? 2 : 3); ui.theme.DrawThemeBackground(gr, this.x, this.y + bar_y, this.w, bar_ht); break;
            }
        }
    }

    this.paint = () => {
        if (hover) init = false; if (init) return; alpha = hover ? alpha1 : alpha2;
        clearTimeout(bar_timer); bar_timer = null;
        bar_timer = setInterval(() => {alpha = hover ? Math.min(alpha += inStep, alpha2) : Math.max(alpha -= 3, alpha1); window.RepaintRect(this.x, this.y, this.w, this.h);
        if (hover && alpha == alpha2 || !hover && alpha == alpha1) {hover_o = hover; clearTimeout(bar_timer); bar_timer = null;}}, 25);
    }

    this.lbtn_dn = (p_x, p_y) => {
        if (!ppt.sbarShow && ppt.touchControl) return tap(p_y);
        const x = p_x - this.x, y = p_y - this.y; let dir;
        if (x > this.w || y < 0 || y > this.h || this.row_count <= this.rows_drawn) return;
        if (x < 0) {if (!ppt.touchControl) return; else return tap(p_y);}
        if (y < but_h || y > this.h - but_h) return;
        if (y < bar_y) dir = 1; // above bar
        else if (y > bar_y + bar_ht) dir = -1; // below bar
        if (y < bar_y || y > bar_y + bar_ht) shift_page(dir, nearest(y));
        else { // on bar
            b_is_dragging = true; but.Dn = true; window.RepaintRect(this.x, this.y, this.w, this.h);
            initial_drag_y = y - bar_y + but_h;
        }
    }

    this.lbtn_dblclk = (p_x, p_y) => {
        const x = p_x - this.x, y = p_y - this.y; let dir;
        if (x < 0 || x > this.w || y < 0 || y > this.h || this.row_count <= this.rows_drawn) return;
        if (y < but_h || y > this.h - but_h) return;
        if (y < bar_y) dir = 1; // above bar
        else if (y > bar_y + bar_ht) dir = -1; // below bar
        if (y < bar_y || y > bar_y + bar_ht) shift_page(dir, nearest(y));
    }

    this.move = (p_x, p_y) => {
        if (ppt.touchControl) {
            const delta = reference - p_y;
            if (delta > mv || delta < -mv) {
                reference = p_y;
                if (ppt.flickDistance) offset = s.clamp(offset + delta, 0, max_scroll);
                if (this.touch.dn) {ui.drag_drop_id = ui.touch_dn_id = -1;}
            }
        }
        if (this.touch.dn && !vk.k('zoom')) {ts = Date.now(); if (ts - startTime > 300) startTime = ts; lastTouchDn = ts; this.check_scroll(initial_scr + (initial_y - p_y) * ppt.touchStep, 'drag'); return;}
        const x = p_x - this.x, y = p_y - this.y;
        if (x < 0 || x > this.w || y > bar_y + bar_ht || y < bar_y || but.Dn) hover = false; else hover = true;
        if (hover != hover_o && !bar_timer) this.paint();
        if (!b_is_dragging || this.row_count <= this.rows_drawn) return;
        this.check_scroll(Math.round((y - initial_drag_y) / drag_distance_per_row) * this.row_h);
    }

    this.lbtn_up = (p_x, p_y) => {
        if (this.touch.dn) {
            this.touch.dn = false;
            clearInterval(ticker);
            if (!counter) track(true);
            if (Math.abs(velocity) > min && Date.now() - startTime < 300) {
                amplitude = ppt.flickDistance * velocity * ppt.touchStep;
                timestamp = Date.now();
                this.check_scroll(Math.round((this.scroll + amplitude) / this.row_h) * this.row_h, 'inertia');
            }
        }
        const x = p_x - this.x, y = p_y - this.y;
        if (!hover && b_is_dragging) this.paint(); else window.RepaintRect(this.x, this.y, this.w, this.h); if (b_is_dragging) {b_is_dragging = false; but.Dn = false;} initial_drag_y = 0;
        if (this.timer_but) {clearTimeout(this.timer_but); this.timer_but = null;}; this.count = -1;
    }

    const tap = p_y => {
        if (amplitude) {clock = 0; this.scroll = this.delta;}
        counter = 0; initial_scr = this.scroll;
        this.touch.dn = true; initial_y = reference = p_y;  if (!offset) offset = p_y;
        velocity = amplitude = 0;
        if (!ppt.flickDistance) return;
        frame = offset;
        startTime = timestamp = Date.now();
        clearInterval(ticker);
        ticker = setInterval(track, 100);
    }

    const track = initial => {
        let now, elapsed, delta, v;
        counter++; now = Date.now();
        if (now - lastTouchDn < 10000 && counter == 4) {ui.touch_dn_id = -1; p.last_pressed_coord = {x: -1, y: -1}}
        elapsed = now - timestamp; if (initial) elapsed = Math.max(elapsed, 32);
        timestamp = now;
        delta = offset - frame;
        frame = offset;
        v = 1000 * delta / (1 + elapsed);
        velocity = 0.8 * v + 0.2 * velocity;
    }

    this.check_scroll = (new_scroll, type) => {
        const b = s.clamp(new_scroll, 0, max_scroll);
        if (b == this.scroll) return; this.scroll = b;
        if (ppt.smooth) {
            elap = 16; event = type; this.item_y = p.s_h; start = this.delta;
            if (event != 'drag' || ppt.touchStep > 1) {
                duration = !event ? period.scroll : period[event];
                if (b_is_dragging) {if (Math.abs(this.delta - this.scroll) < scrollbar_height) fast = false; else {fast = true; duration = period.step;}}
                clock = Date.now(); if (!this.draw_timer) {scroll_timer(); smooth_scroll();}
            } else scroll_drag();
        } else {scroll_throttle(); upd_debounce();}
    }

    const calc_item_y = () => {ix = Math.round(this.delta / this.row_h + 0.4); this.item_y = Math.round(this.row_h * ix + p.s_h - this.delta);}
    const position = (Start, End, Elapsed, Duration, Event) => {if (Elapsed > Duration) return End; const n = Elapsed / Duration; Event = b_is_dragging ? !fast ? ease.bar(n) : ease.barFast(n) : Event != 'inertia' ? ease.scroll(n) : ease.inertia(n); return Start + (End - Start) * Event;}
    const scroll_drag = () => {this.delta = this.scroll; scroll_to(); calc_item_y(); upd_debounce();}
    const scroll_finish = () => {if (!this.draw_timer) return; this.delta = this.scroll; bar_y = but_h + scrollbar_travel * (this.delta * ratio) / (this.row_count * this.row_h); ppt.rememberTree ? lib.treeState(false, ppt.rememberTree) : p.tree_paint(); calc_item_y(); clearTimeout(this.draw_timer); this.draw_timer = null;}
    const scroll_to = () => {bar_y = but_h + scrollbar_travel * (this.delta * ratio) / (this.row_count * this.row_h); p.tree_paint();}
    const shift = (dir, nearest_y) => {let target = Math.round((this.scroll + dir * -((this.rows_drawn - 1) * this.row_h)) / this.row_h) * this.row_h; if (dir == 1) target = Math.max(target, nearest_y); else target = Math.min(target, nearest_y); return target;}
    const shift_page = (dir, nearest_y) => {this.check_scroll(shift(dir, nearest_y)); if (!this.timer_but) {this.timer_but = setInterval(() => {if (this.count > 1) {this.check_scroll(shift(dir, nearest_y));} else this.count++;}, 100);}}
    const smooth_scroll = () => {
        this.delta = position(start, this.scroll, Date.now() - clock + elap, duration, event);
        if (Math.abs(this.scroll - this.delta) > 0.5) scroll_to(); else scroll_finish();
    }

    this.but = dir => {this.check_scroll(Math.round((this.scroll + dir * -this.row_h) / this.row_h) * this.row_h); if (!this.timer_but) {this.timer_but = setInterval(() => {if (this.count > 6) {this.check_scroll(this.scroll + dir * -this.row_h);} else this.count++;}, 40);}}
    this.scroll_round = () => {if (this.item_y == p.s_h) return; this.check_scroll((this.item_y < p.s_h ? Math.floor(this.scroll / this.row_h) : Math.ceil(this.scroll / this.row_h)) * this.row_h);}
    this.scroll_to_end = () => this.check_scroll(max_scroll);
}

function Vkeys() {
	ppt.zoomKey = s.clamp(ppt.zoomKey, 0, 4);
    let zoomKey = ppt.zoomKey; if (zoomKey != 0) zoomKey = [, 0x11, 0x12, 0x1B, 0x09][zoomKey];
    this.selAll = 1; this.copy = 3; this.back = 8; this.enter = 13; this.shift = 16; this.paste = 22; this.cut = 24; this.redo = 25; this.undo = 26; this.pgUp = 33; this.pgDn = 34; this.end = 35; this.home = 36; this.left = 37; this.up = 38; this.right = 39; this.dn = 40; this.del = 46;
    this.k = n => {switch (n) {case 'enter': return utils.IsKeyPressed(0x0D); break; case 'shift': return utils.IsKeyPressed(0x10); break; case 'ctrl': return utils.IsKeyPressed(0x11); break; case 'alt': return utils.IsKeyPressed(0x12); break; case 'zoom': return !zoomKey ? utils.IsKeyPressed(0x11) && utils.IsKeyPressed(0x12) : utils.IsKeyPressed(zoomKey); break;}}
}

function Library() {
    let exp = [], filterQuery = "", filterQueryID = "N/A", full_list, full_list_need_sort = false, node = [], node_s = [], noListUpd = false, scr = [], sel = [], validSearch = true;
	const prefix = ppt.prefix.split("|"); ppt.autoExpandLimit = s.clamp(ppt.autoExpandLimit, 10, 1000);
    this.allmusic = []; this.init = false; this.list; this.none = ""; this.node = []; this.root = []; this.time = FbProfiler(); this.upd = 0, this.upd_search = false;
	
    if (ppt.rememberTree) {
		exp = JSON.parse(ppt.exp)
		scr = JSON.parse(ppt.scr)		
		sel = JSON.parse(ppt.sel)
		p.s_txt = ppt.s_txt;
	} else {
		ppt.exp = JSON.stringify(exp);
		ppt.process = false;
		ppt.scr = JSON.stringify(scr);
		ppt.sel = JSON.stringify(sel);
		ppt.s_txt = "";
	}

    const bInsert = (arr, item, folder) => {let min = 0, max = arr.length, index = Math.floor((min + max) / 2); item = item.replace(RegExp(p.splitter, "g"), p.sp_splitter); while (max > min) {if (sort(item, arr[index].join(!folder ? p.sp_splitter : "\\")) < 0) max = index; else min = index + 1; index = Math.floor((min + max) / 2);} return index;}
	const ir = () => fb.IsPlaying && fb.PlaybackLength <= 0;
    const lib_update = s.debounce(() => {this.time.Reset(); pop.subCounts =  {"standard": {}, "search": {}, "filter": {}}; this.rootNodes(2, ppt.process);}, 500);
    const match = (a, b) =>  a && a.name.toUpperCase() == b.toUpperCase();
    const removed_f = handleList => {let j = handleList.Count; while (j--) {let i = this.list.Find(handleList[j]); if (i != -1) {this.list.RemoveById(i); node.splice(i, 1);}}}
    const removed_s = handleList => {let j = handleList.Count; while (j--) {let i = p.list.Find(handleList[j]); if (i != -1) {p.list.RemoveById(i); node_s.splice(i, 1);}}}
    const sort = (a, b) => a.replace(/^\?/,"").replace(/(\d+)/g, n => ('0000' + n).slice(-5)).localeCompare(b.replace(/^\?/,"").replace(/(\d+)/g, n => ('0000' + n).slice(-5)));
    const tr_sort = data => {data.sort((a, b) => parseFloat(a.tr) - parseFloat(b.tr)); return data;}

    this.checkTree = () => {if (!this.upd && !(this.init && ppt.rememberTree)) return; this.init = false; lib_update.cancel(); this.time.Reset(); pop.subCounts =  {"standard": {}, "search": {}, "filter": {}}; this.rootNodes(this.upd == 2 ? 2 : 1, ppt.process); this.upd = 0;}
	this.eval = (n) => {if (!n || !fb.IsPlaying) return ""; const tfo = FbTitleFormat(n); if (ir()) return tfo.Eval(); const handle = fb.GetNowPlaying(); return handle ? tfo.EvalWithMetadb(handle) : "";}
	this.setAutoExpandLimit = () => {const ns = utils.InputBox(window.ID, "Enter number\n\nMinimum = 10\n\nMaximum = 1000", "Auto Expand Limit", ppt.autoExpandLimit); if (!ns || ns == ppt.autoExpandLimit) return false; ppt.autoExpandLimit = Math.round(ns); if (isNaN(ppt.autoExpandLimit)) ppt.autoExpandLimit = 350; ppt.autoExpandLimit = s.clamp(ppt.autoExpandLimit, 10, 1000); pop.collapseAll(); this.rootNodes(ppt.rememberTree, ppt.process);}

	const checkAutoExpand = () => {
		if (!ppt.treeAutoExpand || p.list.Count >= ppt.autoExpandLimit || !pop.tree.length) return false;
		let m = pop.tree.length, rootNode = ppt.rootNode; const n = rootNode && pop.tree.length > 1 ? true : false;
		while (m--) {pop.expandNodes(pop.tree[m], !rootNode || m ? false : true); if (n && m == 1) break;} sbar.set_rows(pop.tree.length); 
		p.tree_paint(); return true;
	}

	this.checkFilter = () => {
		pop.subCounts.filter = {}; pop.subCounts.search = {};
		if (p.filt[ppt.filterBy].type.match(/\$nowplaying{(.+)}/)) {
			getFilterQuery();
			if (filterQuery != filterQueryID) {
				if (!ppt.rememberTree && !ppt.reset) this.logTree(); this.getLibrary(); this.rootNodes(!ppt.reset ? 1 : 0, true);
				pop.checkAutoHeight();
			}
		}
	}

	this.logTree = () => {
		let i = 0, ix = -1, tr = 0; exp = []; ppt.process = true; sel = [];
		pop.tree.forEach(v => {
			tr = !ppt.rootNode ? v.tr : v.tr - 1; if (v.child.length) exp.push({tr:tr, a:tr < 1 ? v.name : pop.tree[v.par].name, b:tr < 1 ? "" : v.name});
			tr = v.tr; if (v.sel == true) sel.push({tr:tr, a:v.name, b:tr != 0 ? pop.tree[v.par].name : "", c:tr > 1 ? pop.tree[pop.tree[v.par].par].name : ""});
		});
		ix = pop.get_ix(0, sbar.item_y + ui.row_h / 2, true, false); tr = 0; let l = Math.min(Math.floor(ix + p.rows), pop.tree.length);
		if (ix != -1) {scr = []; for (i = ix; i < l; i++) {tr = pop.tree[i].tr; scr.push({tr:tr, a:pop.tree[i].name, b:tr != 0 ? pop.tree[pop.tree[i].par].name : "", c:tr > 1 ? pop.tree[pop.tree[pop.tree[i].par].par].name : ""})}}
		tr_sort(exp);
		if (ppt.rememberTree) {
			ppt.exp = JSON.stringify(exp);
			ppt.scr = JSON.stringify(scr);
			ppt.sel = JSON.stringify(sel);
		}
	}

    this.treeState = (reset, state, handleList, handleType) => {
        if (!state) return; p.search_paint(); p.tree_paint();
        let i = 0, ix = -1, tr = 0; ppt.process = false;
        if (pop.tree.length && !reset) this.logTree();
        if (ppt.rememberTree) {ppt.s_txt = p.s_txt; if (state == 1) return;}
        if (!handleList) {this.getLibrary(); this.rootNodes(1, ppt.process);}
        else {
            noListUpd = false;
            switch (handleType) {
                case 0: added(handleList); if (noListUpd) break; if (ui.w < 1 || !window.IsVisible) this.upd = 2; else lib_update(); break;
                case 1:
                    let i, items, upd_done = false, tree_type = !p.folderView ? 0 : 1;
                    switch (tree_type) { // check for changes to items; any change updates all
                        case 0:
                            let tfo = FbTitleFormat(p.view); items = tfo.EvalWithMetadbs(handleList);
                            handleList.Convert().some((h, j) => {
                                i = this.list.Find(h);
                                if (i != -1) {
                                    if (!$.equal(node[i], items[j].split(p.splitter))) {
                                        removed(handleList); added(handleList); if (ui.w < 1 || !window.IsVisible) this.upd = 2; else lib_update();
                                        return upd_done = true;
                                    }
                                }
                            });
                            break;
                        case 1:
                            items = handleList.GetLibraryRelativePaths();
                            handleList.Convert().some((h, j) => {
                                i = this.list.Find(h);
                                if (i != -1) {
                                    if (!$.equal(node[i], items[j].split("\\"))) {
                                        removed(handleList); added(handleList); if (ui.w < 1 || !window.IsVisible) this.upd = 2; else lib_update();
                                        return upd_done = true;
                                    }
                                }
                            });
                            break;
                    }
                    if (upd_done) break;
                    if (ppt.filterBy > 0 && ppt.searchShow > 1) { // filter: check for addns / removals if not done
                        let startFilter = this.list.Clone(), newFilterItems = s.query(handleList, filterQuery), newFilter = this.list.Clone();
                        newFilter.InsertRange(newFilter.Count, newFilterItems);
                        startFilter.Sort(); newFilter.Sort(); newFilter.MakeDifference(startFilter);
                        if (newFilter.Count) {removed_f(handleList); added_f(newFilterItems); if (!p.s_txt) p.list = this.list; if (ui.w < 1 || !window.IsVisible) this.upd = 2; else lib_update();}
                    }
                    if (p.s_txt) { // search: check for addns / removals if not done
                        let startSearch = p.list.Clone(), newSearchItems = FbMetadbHandleList();
                        validSearch = true; try {newSearchItems = fb.GetQueryItems(handleList, p.s_txt);} catch (e) {validSearch = false;}
                        newSearchItems.Sort();
                        if (ppt.filterBy > 0 && ppt.searchShow > 1) {let newFilt = this.list.Clone(); newFilt.Sort(); newSearchItems.MakeIntersection(newFilt);}
                        let newSearch = p.list.Clone();
                        newSearch.InsertRange(newSearch.Count, newSearchItems);
                        startSearch.Sort(); newSearch.Sort(); newSearch.MakeDifference(startSearch);
                        if (newSearch.Count) {
                            removed_s(handleList); added_s(newSearchItems); this.node = node_s.slice();
                            if (!p.list.Count) {pop.tree = []; sbar.set_rows(0); this.none = validSearch ? "Nothing found" : "Invalid search expression"; p.tree_paint(); break;}
                            if (ui.w < 1 || !window.IsVisible) this.upd = 2; else lib_update();
                        }
                    }
                    break;
                case 2: removed(handleList); if (noListUpd) break; if (ui.w < 1 || !window.IsVisible) this.upd = 2; else lib_update(); break;
            }
        }
    }
	
	const getFilterQuery = () => {
		filterQuery = p.filt[ppt.filterBy].type;
			while (filterQuery.includes("$nowplaying{")) {
				const q = filterQuery.match(/\$nowplaying{(.+?)}/);
				filterQuery = filterQuery.replace(q[0], this.eval(q[1]));
			}
	}

    this.getLibrary = () => {
        this.empty = ""; this.time.Reset(); this.none = ""; this.list = fb.GetLibraryItems(); full_list = this.list.Clone();
        if (!this.list.Count || !fb.IsLibraryEnabled()) {pop.tree = []; sbar.set_rows(0); this.empty = "Nothing to show\n\nConfigure Media Library first\n\nFile>Preferences>Media library"; p.tree_paint(); return;}
        if (ppt.filterBy > 0 && ppt.searchShow > 1) {
			getFilterQuery(); filterQueryID = filterQuery;
			this.list = s.query(this.list, filterQuery);
		}
        if (!this.list.Count) {pop.tree = []; sbar.set_rows(0); this.none = "Nothing found"; p.tree_paint(); return;} rootNames("", 0);
    }

    const rootNames = (li, search) => {
        let arr = []; switch (search) {case 0: p.sort(this.list); li = p.list = this.list; node = []; arr = node; break; case 1: node_s = []; arr = node_s; break;}
        let tree_type = !p.folderView ? 0 : 1;
        switch (tree_type) {
            case 0: let tfo = FbTitleFormat(p.view); tfo.EvalWithMetadbs(li).forEach((v, i) => arr[i] = v.split(p.splitter)); break;
            case 1: li.GetLibraryRelativePaths().forEach((v, i) => arr[i] = v.split("\\")); break;
        }
    }

    this.prefixes = n => {
        if (!n.includes("~#!#")) return n; let ln = 0;
        const noPrefix = v => !n.includes(v + " ");
        if (prefix.every(noPrefix)) return n.replace("~#!#", "#!#");
        const pr1 = n.split("~#!#"), pr2 = pr1[1].split("#!#"), pr = pr2[0].split("@@");
        pr.forEach((v, i) => {
            prefix.forEach(w => {
                ln = w.length + 1; if (v.substr(0, ln) == w + " ") pr[i] = v.substr(ln) + ", " + w;
            });
        });
        return pr1[0] + "#!#" + pr.join("@@") + "#!#" + pr2[1];
    }

    this.rootNodes = (lib_update, process) => {
        if (!this.list.Count) return; this.root = []; let i = 0, n = "";
        if (p.s_txt && (this.upd_search || lib_update == 1)) {
            validSearch = true; this.none = ""; try {p.list = fb.GetQueryItems(this.list, p.s_txt);} catch (e) {this.list = this.list.Clone(); p.list.RemoveAll(); validSearch = false;}
            if (!p.list.Count) {pop.tree = []; sbar.set_rows(0); this.none = validSearch ? "Nothing found" : "Invalid search expression"; p.tree_paint(); return;}
            rootNames(p.list, 1); this.node = node_s.slice(); this.upd_search = false;
        } else if (!p.s_txt) {p.list = this.list; this.node = node.slice()};
        let n_o = "#get_node#", nU = "", total = p.list.Count;
        pop.getNowplaying();
        if (ppt.rootNode) {
            this.root[0] = {name:p.rootName, sel:false, child:[], item:[]};
            this.node.forEach((v, l) => this.root[0].item[l] = l);
        } else switch (p.multiProcess) {
            case false:
                this.node.forEach((v, l) => {
                    n = v[0]; nU = n.toUpperCase();
                    if (nU != n_o) {
                        n_o = nU; this.root[i] = {name:n, sel:false, child:[], item:[]};
                        this.root[i].item.push(l); i++;
                    } else this.root[i - 1].item.push(l);
                });
                break;
            case true:
                switch (p.multi_swap) {
                    case false:
                        this.node.forEach((v, l) => {
                            n = v[0]; nU = n.toUpperCase();
                            if (nU != n_o) {
                                n_o = nU; n = n.replace(/#!##!#/g, "?");
                                this.root[i] = {name:n.replace(/#@#.*?#@#/g,""), sel:false, child:[], item:[], srt:n};
                                this.root[i].item.push(l); i++;
                            } else this.root[i - 1].item.push(l);
                        });
                        break;
                    case true:
                        this.node.forEach((v, l) => {
                            n = v[0]; nU = n.toUpperCase();
                            if (nU != n_o) {
                                n_o = nU; n = n.replace(/~#!##!#|#!##!#/g, "?");
                                n = this.prefixes(n);
                                this.root[i] = {name:n.replace(/#@#.*?#@#/g,""), sel:false, child:[], item:[], srt:n};
                                this.root[i].item.push(l); i++;
                            } else this.root[i - 1].item.push(l);
                        });
                        break;
                }
            break;
        }
        if (!lib_update) sbar.reset();
        /* Draw tree -> */ if (!ppt.rootNode || p.s_txt) pop.buildTree(this.root, 0); if (ppt.rootNode) pop.branch(this.root[0], true); if (p.pn_h_auto && (p.init || lib_update) && ppt.pn_h == ppt.pn_h_min && pop.tree[0]) pop.clear_child(pop.tree[0]); p.init = false; // s.trace("initialised in: " + this.time.Time / 1000 + " seconds");
		if (lib_update != 2) checkAutoExpand();
        if (lib_update && process) {
			exp.forEach(v => {
				if (v.tr == 0) {
					pop.tree.some(w => { // some ~5x faster than for...of
						if (match(w, v.a)) {pop.branch(w); return true;}
					});
				} else if (v.tr > 0) {
					pop.tree.some(w => {
						if (match(w, v.b) && match(pop.tree[w.par], v.a)) {pop.branch(w); return true;}
					});
				}
			});
			sel.forEach(v => {
				if (v.tr == 0) {
					pop.tree.some(w => {
						if (match(w, v.a)) return w.sel = true;
					});
				} else if (v.tr == 1) {
					pop.tree.some(w => {
						if (match(w, v.a) && match(pop.tree[w.par], v.b)) return w.sel = true;
					});
				} else if (v.tr > 1) {
					pop.tree.some(w => {
						if (match(w, v.a) && match(pop.tree[w.par], v.b) && match(pop.tree[pop.tree[w.par].par], v.c)) return w.sel = true;
					});
				}
			});
			let scr_pos = false;
			scr.some((v, h) => {
				if (scr_pos) return true;
				if (v.tr == 0) {
					pop.tree.some((w, j) => {
						if (match(w, v.a)) {sbar.check_scroll(!h ? j * ui.row_h : (j - 3) * ui.row_h); return scr_pos = true;}
					});
				} else if (v.tr == 1) {
					pop.tree.some((w, j) => {
						if (match(w, v.a) && match(pop.tree[w.par], v.b)) {sbar.check_scroll(!h ? j * ui.row_h : (j - 3) * ui.row_h); return scr_pos = true;}
					});
				} else if (v.tr > 1) {
					pop.tree.some((w, j) => {
						if (match(w, v.a) && match(pop.tree[w.par], v.b) && match(pop.tree[pop.tree[w.par].par], v.c)) {sbar.check_scroll(!h ? j * ui.row_h : (j - 3) * ui.row_h); return scr_pos = true;}
					});
				}
			});
			if (!scr_pos) {sbar.reset(); p.tree_paint();}
        } else this.treeState(false, ppt.rememberTree);
        if (lib_update && !process) {sbar.reset(); p.tree_paint();}
    }

    const binaryInsert = (folder, insert, li, n) => {
        let i, items;
        switch (true) {
            case !folder:
                const tfo = FbTitleFormat(p.view); items = tfo.EvalWithMetadbs(insert);
                insert.Convert().forEach((h, j) => {
                    i = bInsert(n, items[j]); n.splice(i, 0, items[j].split(p.splitter)); li.Insert(i, h);
                });
                break;
            case folder:
                items = insert.GetLibraryRelativePaths();
                insert.Convert().forEach((h, j) => {
                    i = bInsert(n, items[j], true); n.splice(i, 0, items[j].split("\\")); li.Insert(i, h);
                });
                break;
        }
    }

    const added = handleList => {
        let addType = p.multiProcess || p.nodisplay || handleList.Count > 100 ? 0 : 1, i, items, tree_type = !p.folderView ? 0 : 1;
        switch (addType) {
            case 0:
                full_list.InsertRange(full_list.Count, handleList); full_list_need_sort = true;
                if (ppt.filterBy > 0 && ppt.searchShow > 1) {
                    const newFilterItems = s.query(handleList, filterQuery);
                    this.list.InsertRange(this.list.Count, newFilterItems); p.sort(this.list);
                }
                else {if (full_list_need_sort) p.sort(full_list); this.list = full_list.Clone(); full_list_need_sort = false;} p.sort(handleList);
                switch (tree_type) {
                        case 0:
                            const tfo = FbTitleFormat(p.view); items = tfo.EvalWithMetadbs(handleList);
                            handleList.Convert().forEach((h, j) => {
                                i = this.list.Find(h); if (i != -1) node.splice(i, 0, items[j].split(p.splitter));
                            });
                            break;
                        case 1:
                            items = handleList.GetLibraryRelativePaths();
                            handleList.Convert().forEach((h, j) => {
                                i = this.list.Find(h); if (i != -1) node.splice(i, 0, items[j].split("\\"));
                            });
                            break;
                }
                if (this.list.Count) this.empty = "";
                if (p.s_txt) {
                    let newSearchItems = FbMetadbHandleList();
                    validSearch = true; try {newSearchItems = fb.GetQueryItems(handleList, p.s_txt);} catch(e) {validSearch = false;}
                    p.list.InsertRange(p.list.Count, newSearchItems); p.sort(p.list); p.sort(newSearchItems);
                    switch (tree_type) {
                        case 0:
                            const tfo = FbTitleFormat(p.view); items = tfo.EvalWithMetadbs(newSearchItems);
                            newSearchItems.Convert().forEach((h, j) => {
                                i = p.list.Find(h); if (i != -1) node_s.splice(i, 0, items[j].split(p.splitter));
                            });
                            break;
                        case 1:
                            items = newSearchItems.GetLibraryRelativePaths();
                            newSearchItems.Convert().forEach((h, j) => {
                                i = p.list.Find(h); if (i != -1) node_s.splice(i, 0, items[j].split("\\"));
                            });
                            break;
                    }
                    this.node = node_s.slice();
                    if (!p.list.Count) {pop.tree = []; sbar.set_rows(0); this.none = validSearch ? "Nothing found" : "Invalid search expression"; p.tree_paint(); noListUpd = true;}
                } else p.list = this.list;
                break;
            case 1:
                let lis = ppt.filterBy > 0 && ppt.searchShow > 1 ? s.query(handleList, filterQuery) : handleList; p.sort(lis);
                binaryInsert(p.folderView, lis, this.list, node);
                if (this.list.Count) this.empty = "";
                if (p.s_txt) {
                    let newSearchItems = FbMetadbHandleList();
                    validSearch = true; try {newSearchItems = fb.GetQueryItems(handleList, p.s_txt);} catch(e) {validSearch = false;}
                    binaryInsert(p.folderView, newSearchItems, p.list, node_s);
                    this.node = node_s.slice();
                    if (!p.list.Count) {pop.tree = []; sbar.set_rows(0); this.none = validSearch ? "Nothing found" : "Invalid search expression"; p.tree_paint(); noListUpd = true;}
                } else p.list = this.list;
                break
            }
    }

    const added_f = handleList => {
        let addType = p.multiProcess || p.nodisplay || handleList.Count > 100 ? 0 : 1, i, items, tree_type = !p.folderView ? 0 : 1;
        switch (addType) {
            case 0:
                this.list.InsertRange(this.list.Count, handleList); p.sort(this.list); p.sort(handleList);
                switch (tree_type) {
                    case 0:
                        const tfo = FbTitleFormat(p.view); items = tfo.EvalWithMetadbs(handleList);
                        handleList.Convert().forEach((h, j) => {
                            i = this.list.Find(h); if (i != -1) node.splice(i, 0, items[j].split(p.splitter));
                        });
                        if (!this.list.Count) this.none = "Nothing found";
                        break;
                    case 1:
                        items = handleList.GetLibraryRelativePaths();
                        handleList.Convert().forEach((h, j) => {
                            i = this.list.Find(h); if (i != -1) node.splice(i, 0, items[j].split("\\"));
                        });
                        if (!this.list.Count) this.none = "Nothing found";
                        break;
                }
            case 1: binaryInsert(p.folderView, handleList, this.list, node); break;
        }
    }

    const added_s = handleList => {
        let addType = p.multiProcess || p.nodisplay || handleList.Count > 100 ? 0 : 1, i, items, tree_type = !p.folderView ? 0 : 1;
        switch (addType) {
            case 0:
                p.list.InsertRange(p.list.Count, handleList); p.sort(p.list);
                switch (tree_type) {
                case 0:
                    const tfo = FbTitleFormat(p.view); items = tfo.EvalWithMetadbs(handleList);
                    handleList.Convert().forEach((h, j) => {
                        i = p.list.Find(h); if (i != -1) node_s.splice(i, 0, items[j].split(p.splitter));
                    });
                    break;
                case 1:
                    items = handleList.GetLibraryRelativePaths();
                    handleList.Convert().forEach((h, j) => {
                        i = p.list.Find(h); if (i != -1) node_s.splice(i, 0, items[j].split("\\"))
                    });
                    break;
            }
            case 1:
                binaryInsert(p.folderView, handleList, p.list, node_s);
                break;
        }
    }

    const removed = handleList => {
        let i, j = handleList.Count; while (j--) {i = this.list.Find(handleList[j]); if (i != -1) {this.list.RemoveById(i); node.splice(i, 1);}}
        if (ppt.filterBy > 0 && ppt.searchShow > 1) {j = handleList.Count; if (full_list_need_sort) p.sort(full_list); full_list_need_sort = false; while (j--) {i = full_list.Find(handleList[j]); if (i != -1) full_list.RemoveById(i);}}
        else full_list = this.list.Clone();
        if (p.s_txt) {
            j = handleList.Count; while (j--) {i = p.list.Find(handleList[j]); if (i != -1) {p.list.RemoveById(i); node_s.splice(i, 1);}}
            this.node = node_s.slice();
            if (!p.list.Count) {pop.tree = []; sbar.set_rows(0); this.none = validSearch ? "Nothing found" : "Invalid search expression"; p.tree_paint(); noListUpd = true;}
        }
        else p.list = this.list;
        if (!full_list.Count) {this.empty = "Nothing to show\n\nConfigure Media Library first\n\nFile>Preferences>Media library"; this.root = []; pop.tree = []; sbar.set_rows(0); p.tree_paint(); noListUpd = true;}
    }
}

function Populate() {
	this.setActions = (n, i) => {
		switch (n) {
			case 'click': ppt.clickAction = i; break;
			case 'key': ppt.keyAction = i; break;
			case 'dblClick': ppt.dblClickAction = i; return;
			case 'send': this.autoPlay.send = !this.autoPlay.send; ppt.autoPlay = this.autoPlay.send; return;
		}
		this.autoPlay = {click: ppt.clickAction < 2 ? false : ppt.clickAction, send: ppt.autoPlay}
		this.autoFill = {mouse: ppt.clickAction == 1 ? true : false, key: ppt.keyAction}
	}; this.setActions();
	
    const nd = [], selection_holder = fb.AcquireUiSelectionHolder(), symb = window.CreateThemeManager("TREEVIEW");
    let dbl_clicked = false, fullLineSelection = ppt.fullLineSelection, get_pos = -1, iconVerticalPad = ppt.iconVerticalPad, is_focused = false, ix_o = 0, last_pressed_coord = {x: undefined, y: undefined}, last_sel = -1, lbtn_dn = false, m_i = -1, m_br = -1, margin = ppt.margin, nodeCounts = ppt.nodeCounts, nodeHighlight = ppt.nodeHighlight, treeIndent = ppt.treeIndent, row_o = 0, rootNode = ppt.rootNode, rowStripes = ppt.rowStripes, selList = null, showTracks = ppt.showTracks, showNowplaying = ppt.showNowplaying, tooltip = ppt.tooltip, tt = "", tt_c = 0, tt_id = -1;
    this.hotKeys = ppt.hotKeys.splt(0); this.nowp = -1; this.rows = 0; this.sel_items = []; this.subCounts =  {"standard": {}, "filter": {}, "search": {}}; this.tree = [];

	const addIX = parseFloat(this.hotKeys[3]), collapseAllIX = parseFloat(this.hotKeys[1]), insertIX = parseFloat(this.hotKeys[5]), searchClearIX = parseFloat(this.hotKeys[9]), searchFocusIX = parseFloat(this.hotKeys[7]), tf_cs = FbTitleFormat(ppt.customSort);
    if (ui.nodeWin) {s.gr(ui.node_sz, ui.node_sz, false, g => {try {symb.SetPartAndStateID(2, 1); symb.SetPartAndStateID(2, 2); symb.DrawThemeBackground(g, 0, 0, ui.node_sz, ui.node_sz);} catch (e) {ui.nodeWin = 0;}});}

    const add = (x, y, pl) => {if (y < p.s_h) return; const ix = this.get_ix(x, y, true, false); p.pos = ix; if (ix < this.tree.length && ix >= 0) if (this.check_ix(this.tree[ix], x, y, true)) {this.clear(); this.tree[ix].sel = true; this.get_sel_items(); this.load(this.sel_items, true, true, false, pl, false); lib.treeState(false, ppt.rememberTree);}}
    const branch_chg = (br) => {
        const arr = br.tr == 0 ? lib.root : this.tree[br.par].child; let new_br = 0;
            arr.forEach(v => {
                new_br += v.child.length; v.child = [];
            });
        return new_br;
    }
    const checkNode = gr => {if (sbar.draw_timer || !ui.nodeWin) return; try {symb.SetPartAndStateID(2, 1); symb.SetPartAndStateID(2, 2); symb.DrawThemeBackground(gr, -ui.node_sz, -ui.node_sz, ui.node_sz, ui.node_sz);} catch (e) {ui.nodeWin = 0;}}
    const checkRow = (x, y) => {m_br = -1; const im = this.get_ix(x, y, true, false); if (im >= this.tree.length || im < 0) return -1; const item = this.tree[im]; if (x < Math.round(treeIndent * item.tr) + ui.icon_w + margin && (!item.track || rootNode && item.tr == 0)) m_br = im; return im;}
	const clickedOn = (x, y, item) => x < Math.round(treeIndent * item.tr) + ui.icon_w + margin ? 'node' : this.check_ix(item, x, y, false) ? 'text' : 'none';
    const drawNode = (gr, j, x, y) => {switch (ui.nodeWin) {case 0: if (!nodeHighlight && j > 1) j -= 2; x = Math.round(x); y = Math.round(y); gr.DrawImage(nd[j], x, y, nd[j].Width, nd[j].Height, 0, 0, nd[j].Width, nd[j].Height); break; case 1: if ( j > 1) j -= 2; symb.SetPartAndStateID(2, !j ? 1 : 2); symb.DrawThemeBackground(gr, x, y, ui.node_sz, ui.node_sz); break;}}
    const getItems = list => {let handleList = FbMetadbHandleList(); list.some(v => {if (v >= p.list.Count) return true; handleList.Add(p.list[v]);}); return handleList;}
    const numSort = (a, b) => a - b;
    const sort = (a, b) => a.srt.replace(/^\?/,"").replace(/(\d+)/g, n => ('0000' + n).slice(-5)).localeCompare(b.srt.replace(/^\?/,"").replace(/(\d+)/g, n => ('0000' + n).slice(-5)));
    const uniq = a => {const out = [], seen = {}; let j = 0; a.forEach(v => {if (seen[v] !== 1) {seen[v] = 1; out[j++] = v;}}); return out.sort(numSort);}

	this.checkAutoHeight = () => {if (p.pn_h_auto && ppt.pn_h == ppt.pn_h_min && this.tree[0]) this.clear_child(this.tree[0]);}
    this.clear = () => {this.tree.forEach(v => v.sel = false);}
    this.clear_child = br => {br.child = []; this.buildTree(lib.root, 0, true, true);}
    this.create_tooltip = () => {if (!tooltip) return; tt = window.CreateTooltip(ui.font.Name, ui.font.Size, ui.font.Style); tt.SetDelayTime(0, 500); tt.Text = "";}
    this.deactivate_tooltip = () => {tt_c = 0; tt.Text = ""; tt.TrackActivate = false; tt.Deactivate(); p.tree_paint();}
    this.expandNodes = (obj, am) => {this.branch(obj, !am ? false : true, true, true); if (obj.child) obj.child.forEach(v => {if (!v.track) this.expandNodes(v);});}
    this.getNowplaying = (handle, stop) => {if (!showNowplaying) return; if (stop) return this.nowp = -1; if (!handle && fb.IsPlaying) handle = fb.GetNowPlaying(); if (!handle) return this.nowp = -1; this.nowp = p.list.Find(handle); p.tree_paint();}
    this.get_sel_items = () => {p.tree_paint(); this.sel_items = []; this.tree.forEach(v => {if (v.sel) this.sel_items.push.apply(this.sel_items, v.item);}, this); this.sel_items = uniq(this.sel_items);}
    this.leave = () => {if (men.r_up || tt.Text) return; m_br = -1; row_o = 0; m_i = -1; ix_o = 0; p.tree_paint();}
    this.mbtn_up = (x, y) => {add(x, y, ppt.middleClickPlaylist);}
	this.nowPlayingShow = () => {if (this.nowp != -1) {let np_i = -1; this.tree.forEach((v, i) => {if ((!rootNode || rootNode && v.tr) && v.item.includes(this.nowp)) np_i = i;}); if (np_i != -1) {sbar.check_scroll(np_i  * ui.row_h - Math.round(sbar.rows_drawn / 2 - 1) * ui.row_h);}}}
    this.on_char = code => {if (p.search || code != vk.copy) return; const handleList = this.selected(true); fb.CopyHandleListToClipboard(handleList);}
    this.on_focus = p_is_focused => {is_focused = p_is_focused; if (p_is_focused && selList && selList.Count) selection_holder.SetSelection(selList);}
    this.row = y => {return Math.round((y - sbar.item_y - ui.row_h * 0.5) / ui.row_h);}
    this.selected = n => {if (n) this.get_sel_items(); return getItems(this.sel_items);}
	this.set = () => {fullLineSelection = ppt.fullLineSelection; iconVerticalPad = ppt.iconVerticalPad; margin = ppt.margin; nodeCounts = ppt.nodeCounts; nodeHighlight = ppt.nodeHighlight; treeIndent = ppt.treeIndent; rootNode = ppt.rootNode; rowStripes = ppt.rowStripes; showTracks = ppt.showTracks; showNowplaying = ppt.showNowplaying; tooltip = ppt.tooltip;}
    this.setGetPos = pos => {m_i = get_pos = pos;}

    const activate_tooltip = (ix, y) => {
        if (tt_id == ix || Math.round(treeIndent * this.tree[ix].tr + margin) + ui.icon_w + (!tooltip || !fullLineSelection ? this.tree[ix].w : this.tree[ix].tt_w) <= sbar.tree_w - ui.sel) return;
        if (tt_c == 2) {tt_id = ix; return;}
        tt_c += 1; tt.Activate(); tt.TrackActivate = true;
        tt.Text = this.tree[ix].name + this.tree[ix].count;
        let tt_y = Math.max(ui.row_h - ppt.verticalPad, 0); tt_y = sbar.item_y - Math.floor((ui.row_h - tt_y) / 2);
        tt.TrackPosition(Math.round(treeIndent * this.tree[ix].tr + margin) + ui.icon_w - ui.tt, this.row(y) * ui.row_h + tt_y);
        p.tree_paint(); timer.tooltip();
    }

    this.branch = (br, base, node, block) => {
        if (!br || br.track) return;
        const ix = showTracks ? 2 : 3, l = base ? 0 : rootNode ? br.tr : br.tr + 1; if (base) node = false;
        let i = 0, n = "", n_o = "#get_branch#", nU = "";
        switch (p.multiProcess) {
            case false:
                br.item.forEach(v => {
                    n = lib.node[v][l]; nU = n.toUpperCase();
                    if (n_o != nU) {n_o = nU; br.child[i] = {name:n, sel:false, child:[], track:l > lib.node[v].length - ix, item:[]}; br.child[i].item.push(v); i++;} else br.child[i - 1].item.push(v);
                });
                break;
            case true:
                let srt = "";
                switch (p.multi_swap) {
                    case false:
                        br.item.forEach(v => {
                            n = lib.node[v][l]; nU = n.toUpperCase();
                            if (n_o != nU) {n_o = nU; n = n.replace(/#!##!#/g, "?"); srt = n; n = n.replace(/#@#.*?#@#/g,""); br.child[i] = {name:n, sel:false, child:[], track:l > lib.node[v].length - ix, item:[], srt:srt}; br.child[i].item.push(v); i++;} else br.child[i - 1].item.push(v);
                        });
                        break;
                    case true:
                        br.item.forEach(v => {
                            n = lib.node[v][l]; nU = n.toUpperCase();
                            if (n_o != nU) {n_o = nU; n = n.replace(/~#!##!#|#!##!#/g, "?"); n = lib.prefixes(n); srt = n; n = n.replace(/#@#.*?#@#/g,""); br.child[i] = {name:n, sel:false, child:[], track:l > lib.node[v].length - ix, item:[], srt:srt}; br.child[i].item.push(v); i++;} else br.child[i - 1].item.push(v);
                        });
                        break;
                }
                break;
        }
        this.buildTree(lib.root, 0, node, true, block);
    }

    const getAllCombinations = n => {
        const combinations = [], divisors = [], arraysToCombine = [], nn = n.split("#!#"), ln = nn.length; let i = 0;
        for (i = 0; i < ln; i++) {nn[i] = nn[i].split("@@"); if (nn[i] != "") arraysToCombine.push(nn[i]);} const arraysToCombineLength = arraysToCombine.length;
        for (i = arraysToCombineLength - 1; i >= 0; i--) divisors[i] = divisors[i + 1] ? divisors[i + 1] * arraysToCombine[i + 1].length : 1;
        const getPermutation = (n, arraysToCombine) => {
           const result = []; let curArray;
           for (let j = 0; j < arraysToCombineLength; j++) {
              curArray = arraysToCombine[j];
              result.push(curArray[Math.floor(n / divisors[j]) % curArray.length]);
           } return result;
        }
        let numPerms = arraysToCombine[0].length;
        for (i = 1; i < arraysToCombineLength; i++) numPerms *= arraysToCombine[i].length;
        for (i = 0; i < numPerms; i++) combinations.push(getPermutation(i, arraysToCombine));
        return combinations;
    }

    this.buildTree = (br, tr, node, full, block) => {
        const l = !rootNode ? tr : tr - 1; let i = 0, j = 0;
        if (p.multiProcess) {
            const multi_cond = [], multi_obj = [], multi_rem = [], nm_arr = [];
            let h = -1, multi = [], n = "", n_o = "#condense#", nU = "";
            br.forEach((v, i) => {
                if (v.name.includes("@@")) {
                    multi = getAllCombinations(v.srt);
                    multi_rem.push(i);
                    multi.forEach(w => {
                        multi_obj.push({name:w.join("").replace(/#@#.*?#@#/g,""), item:v.item.slice(), track:v.track, srt:w.join("")});
            });}});
            i = multi_rem.length; while (i--) br.splice(multi_rem[i], 1);
            multi_obj.sort(sort);
            multi_obj.forEach(v => {
                n = v.name; nU = n.toUpperCase();
                if (n_o != nU) {
                    n_o = nU; multi_cond[j] = {name:n, item:v.item.slice(), track:v.track, srt:v.srt};
                    j++;
                } else multi_cond[j - 1].item.push.apply(multi_cond[j - 1].item, v.item.slice());
            });
            br.forEach(v => {v.name = v.name.replace(/#!#/g, ""); nm_arr.push(v.name); if (v.srt) v.srt = v.srt.replace(/#!#/g, "");});
            multi_cond.forEach((v, i) => {
                h = nm_arr.indexOf(v.name);
                if (h != -1) {br[h].item.push.apply(br[h].item, v.item.slice());
                multi_cond.splice(i ,1);
            }});
            multi_cond.forEach((v, i) => br.splice(i + 1, 0, {name:v.name, sel:false, track:v.track, child:[], item:v.item.slice(), srt:v.srt}));
            if (!node || node && !full) br.sort(sort);
            i = br.length; while (i--) {
                if (i != 0 && br[i].name.toUpperCase() == br[i - 1].name.toUpperCase()) {
                    br[i - 1].item.push.apply(br[i - 1].item, br[i].item.slice()); br.splice(i, 1);
                }
            }
        }
        const br_l = br.length, par = this.tree.length - 1; if (tr == 0) this.tree = []; let type; if (nodeCounts == 2) type = p.s_txt ? "search" : ppt.filterBy > 0 && ppt.searchShow > 1 ? "filter" : "standard";
        br.forEach((v, i) => {
            j = this.tree.length; this.tree[j] = v;
            this.tree[j].top = !i ? true : false; this.tree[j].bot = i == br_l - 1 ? true : false;
            this.tree[j].ix = j; this.tree[j].tr = tr; this.tree[j].par = par; let pr; if (nodeCounts == 2 && tr > 1) pr = this.tree[par].par;
            switch (true) {
                case l != -1 && !showTracks:
                    this.tree[j].item.some(v => {
                        if (lib.node[v].length == l + 1 || lib.node[v].length == l + 2) {
                            return this.tree[j].track = true;
                        }
                    });
                    break;
                case l == 0 && lib.node[this.tree[j].item[0]].length == 1: this.tree[j].track = true; break;
            }
            this.tree[j].count = !this.tree[j].track || !showTracks  ? (nodeCounts == 1 ? " (" + this.tree[j].item.length + ")" : nodeCounts == 2 ?  " (" + branchCounts(this.tree[j], !rootNode || j ? false : true, true, false, tr + (tr > 2 ? this.tree[this.tree[pr].par].name : "") + (tr > 1 ? this.tree[pr].name : "") + (tr > 0 ? this.tree[par].name : "") + this.tree[j].name, type) + ")" : "") : ""; if (!showTracks && this.tree[j].count == " (0)") this.tree[j].count = "";
            if (v.child.length > 0) this.buildTree(v.child, tr + 1, node, rootNode && tr == 0 ? true : false);
        }, this);
        if (!block) {sbar.set_rows(this.tree.length); p.tree_paint();}
    }

    const branchCounts = (br, base, node, block, key, type) => {
        if (!br) return; if (this.subCounts[type][key]) return this.subCounts[type][key];
        const l = base ? 0 : rootNode ? br.tr : br.tr + 1, b = []; let n = "", n_o = "#get_branch#", nU = ""; if (base) node = false;
        switch (p.multiProcess) {
            case false:
                br.item.forEach(v => {
                    n = lib.node[v][l]; if (!n) return;
                    nU = n.toUpperCase(); if (n_o != nU) {n_o = nU; b.push({name:n});}
                });
                break;
            case true:
                let srt = "";
                switch (p.multi_swap) {
                    case false:
                        br.item.forEach(v => {
                            n = lib.node[v][l]; if (!n) return;
                            nU = n.toUpperCase(); if (n_o != nU) {n_o = nU; n = n.replace(/#!##!#/g, "?"); srt = n; n = n.replace(/#@#.*?#@#/g,""); b.push({name:n, srt:srt});}
                        });
                        break;
                    case true:
                        br.item.forEach(v => {
                            n = lib.node[v][l]; if (!n) return;
                            nU = n.toUpperCase(); if (n_o != nU) {n_o = nU; n = n.replace(/~#!##!#|#!##!#/g, "?"); n = lib.prefixes(n); srt = n; n = n.replace(/#@#.*?#@#/g,""); b.push({name:n, srt:srt});}
                        });
                        break;
                }
                const multi_cond = [], multi_obj = [], multi_rem = [], nm_arr = [];
                let h = -1, j = 0, multi = [];  n = ""; n_o = "#condense#"; nU = "";
                b.forEach((v, i) => {
                    if (v.name.includes("@@")) {
                        multi = getAllCombinations(v.srt);
                        multi_rem.push(i);
                        multi.forEach(w => {
                            multi_obj.push({name:w.join("").replace(/#@#.*?#@#/g,""), srt:w.join("")});
                });}});
                let i = multi_rem.length; while (i--) b.splice(multi_rem[i], 1); multi_obj.sort(sort);
                multi_obj.forEach(v => {
                    n = v.name; nU = n.toUpperCase(); if (n_o != nU) {n_o = nU; multi_cond[j] = {name:n, srt:v.srt}; j++}
                });
                b.forEach(v => {
                    v.name = v.name.replace(/#!#/g, ""); nm_arr.push(v.name); if (v.srt) v.srt = v.srt.replace(/#!#/g, "");
                });
                multi_cond.forEach((v, i) => {
                    h = nm_arr.indexOf(v.name); if (h != -1) multi_cond.splice(i ,1);
                });
                multi_cond.forEach((v, i) => b.splice(i + 1, 0, {name:v.name, srt:v.srt}));
                const full = rootNode && br.tr == 0 ? true : false; if (!node || node && !full) b.sort(sort);
                i = b.length; while (i--) {if (i != 0 && b[i].name.toUpperCase() == b[i - 1].name.toUpperCase()) b.splice(i, 1);}
                break;
        }
        this.subCounts[type][key] = b.length; return b.length;
    }

    this.create_images = () => {
        const sz = ui.node_sz, ln_w = Math.max(Math.floor(sz / 9), 1); let plus = true, hot = false, sy_w = ln_w, x = 0, y = 0; if (((sz - ln_w * 3) / 2) % 1 != 0) sy_w = ln_w > 1 ? ln_w - 1 : ln_w + 1;
        for (let j = 0; j < 4; j++) {
            nd[j] = s.gr(sz, sz, true, g => {
                hot = j > 1 ? true : false; plus = !j || j == 2 ? true : false;
                g.FillSolidRect(x, y, sz, sz, RGB(145, 145, 145));
                if (!hot) g.FillGradRect(x + ln_w, y + ln_w, sz - ln_w * 2, sz - ln_w * 2, 91,  plus ? ui.col.icon_e[0] : ui.col.icon_c[0], plus ? ui.col.icon_e[1] : ui.col.icon_c[1], 1.0);
                else g.FillGradRect(x + ln_w, y + ln_w, sz - ln_w * 2, sz - ln_w * 2, 91,  ui.col.icon_h[0] , ui.col.icon_h[1], 1.0);
                let x_o = [x, x + sz - ln_w, x, x + sz - ln_w], y_o = [y, y, y + sz - ln_w, y + sz - ln_w]; for (let i = 0; i < 4; i++) g.FillSolidRect(x_o[i], y_o[i], ln_w, ln_w, RGB(186, 187, 188));
                if (plus) g.FillSolidRect(Math.floor(x + (sz - sy_w) / 2), y + ln_w + Math.min(ln_w, sy_w), sy_w, sz - ln_w * 2 - Math.min(ln_w, sy_w) * 2, !hot ? ui.col.iconPlus : ui.col.iconPlus_h);
                g.FillSolidRect(x + ln_w + Math.min(ln_w, sy_w), Math.floor(y + (sz - sy_w) / 2), sz - ln_w * 2 - Math.min(ln_w, sy_w) * 2, sy_w, !hot ? (plus ? ui.col.iconMinus_e : ui.col.iconMinus_c) : ui.col.iconMinus_h);
            });
    }}

    const tracking = list => {
        selList = getItems(list);
        if (ppt.customSort.length) selList.OrderByFormat(tf_cs, 1);
        selection_holder.SetSelection(selList);
    }

    this.load = (list, isArray, add, autoPlay, def_pl, insert) => {
        let np_item = -1, pid = -1, pln = plman.FindOrCreatePlaylist(ppt.libPlaylist, false); if (!def_pl) pln = plman.ActivePlaylist; else plman.ActivePlaylist = pln;
        if (autoPlay == 4 && plman.PlaylistItemCount(pln) || autoPlay == 3 && fb.IsPlaying) {autoPlay = false; add = true;}
        const items = isArray ? getItems(list) : list.Clone();
        if (p.multiProcess && !ppt.customSort.length) items.OrderByFormat(p.mv_sort, 1);
        if (ppt.customSort.length) items.OrderByFormat(tf_cs, 1);
        selList = items.Clone();
        selection_holder.SetSelection(selList);
        if (fb.IsPlaying && !add && fb.GetNowPlaying()) {
            items.Convert().some((h, i) => {
                if (fb.GetNowPlaying().Compare(h)) {
                    np_item = i;
                    return true;
                }
            });
            let pl_chk = true, np;
            if (np_item != -1) {np = plman.GetPlayingItemLocation(); if (np.IsValid) {if (np.PlaylistIndex != pln) pl_chk = false; else pid = np.PlaylistItemIndex;}}
            if (np_item != -1 && pl_chk && pid == -1 && items.Count < 5000) {if (ui.dui) plman.SetActivePlaylistContext(); for (let i = 0; i < 20; i++) {fb.RunMainMenuCommand("Edit/Undo"); np = plman.GetPlayingItemLocation(); if (np.IsValid) {pid = np.PlaylistItemIndex; if (pid != -1) break;}}}
            if (np_item != -1 && pid != -1) {
                plman.ClearPlaylistSelection(pln); plman.SetPlaylistSelectionSingle(pln, pid, true); plman.RemovePlaylistSelection(pln, true);
                const it = items.Clone(); items.RemoveRange(np_item, items.Count); it.RemoveRange(0, np_item + 1);
               if (plman.PlaylistItemCount(pln) < 5000)  plman.UndoBackup(pln); plman.InsertPlaylistItems(pln, 0, items); plman.InsertPlaylistItems(pln, plman.PlaylistItemCount(pln), it);
            } else {if (plman.PlaylistItemCount(pln) < 5000) plman.UndoBackup(pln); plman.ClearPlaylist(pln); plman.InsertPlaylistItems(pln, 0, items);}
        } else if (!add) {if (plman.PlaylistItemCount(pln) < 5000) plman.UndoBackup(pln); plman.ClearPlaylist(pln); plman.InsertPlaylistItems(pln, 0, items);}
        else {if (plman.PlaylistItemCount(pln) < 5000) plman.UndoBackup(pln); plman.InsertPlaylistItems(pln, !insert ? plman.PlaylistItemCount(pln) : plman.GetPlaylistFocusItemIndex(pln), items, true); const f_ix = !insert || plman.GetPlaylistFocusItemIndex(pln) == -1 ? plman.PlaylistItemCount(pln) - items.Count: plman.GetPlaylistFocusItemIndex(pln) - items.Count; plman.SetPlaylistFocusItem(pln, f_ix); plman.EnsurePlaylistItemVisible(pln, f_ix);}
        if (autoPlay) {
			const c = (plman.PlaybackOrder == 3 || plman.PlaybackOrder == 4) ? Math.ceil(plman.PlaylistItemCount(pln) * Math.random() - 1) : 0;
			plman.ExecutePlaylistDefaultAction(pln, c);
		}
    }

    this.collapseAll = () => {
        let ic = this.get_ix(0, sbar.item_y + ui.row_h / 2, true, false), j = this.tree[ic].tr; if (rootNode) j -= 1;
        if (this.tree[ic].tr != 0) {
            const par = this.tree[ic].par, pr_pr = [];
            for (let m = 1; m < j + 1; m++) {
                if (m == 1) pr_pr[m] = par;
                else pr_pr[m] = this.tree[pr_pr[m - 1]].par;
                ic = pr_pr[m];
        }}
        const nm = this.tree[ic].name.toUpperCase();
        this.tree.forEach(v => {if (!rootNode || v.tr) v.child = [];});
        this.buildTree(lib.root, 0); let scr_pos = false;
        this.tree.some((v, i) => {
             if (v.name.toUpperCase() == nm) {
                 sbar.check_scroll(i * ui.row_h);
                 return scr_pos = true;
            }
        });
        if (!scr_pos) {sbar.reset(); p.tree_paint();} lib.treeState(false, ppt.rememberTree);
    }

    this.expand = (ie, nm) => {
        let h = 0, m = 0; this.tree[ie].sel = true;
        if (ppt.autoCollapse) {
            const parent = [], pr_pr = []; let j = 0, par = 0;
            this.tree.forEach((v, j, arr) => {
                if (v.sel) {
                    j = v.tr; if (rootNode) j -= 1; if (v.tr != 0) {
                        par = v.par; for (m = 1; m < j + 1; m++) {if (m == 1) pr_pr[m] = par; else pr_pr[m] = arr[pr_pr[m - 1]].par; parent.push(pr_pr[m]);}
            }}});
            this.tree.forEach((v, i) => {
                if (!parent.includes(i) && !v.sel && (!rootNode || v.tr)) v.child = [];
            });
            this.buildTree(lib.root, 0);
        }
        const start_l = this.tree.length; let nm_n = "", nodes = -1; m = this.tree.length; while (m--) if (this.tree[m].sel) {this.expandNodes(this.tree[m], !rootNode || m ? false : true); nodes++;} this.clear();
        sbar.set_rows(this.tree.length); p.tree_paint();
        this.tree.some((v, i, arr) => {
            nm_n = (v.tr ? arr[v.par].name : "") + v.name; nm_n = nm_n.toUpperCase();
            if (nm_n == nm) {h = i; return true;}
        });
        const new_items = this.tree.length - start_l + nodes, b = Math.round(sbar.scroll / ui.row_h + 0.4), n = Math.max(h - b, rootNode ? 1 : 0); let scrollChk = false;
        if (n + 1 + new_items > this.rows) {scrollChk = true; if (new_items > this.rows - 2) sbar.check_scroll(h * ui.row_h); else sbar.check_scroll(Math.min(h * ui.row_h,(h + 1 - sbar.rows_drawn + new_items) * ui.row_h));}
        if (sbar.scroll > h * ui.row_h) {scrollChk = true; sbar.check_scroll(h * ui.row_h);} if (!scrollChk) sbar.scroll_round(); lib.treeState(false, ppt.rememberTree);
    }

    this.draw = gr => {
        if (lib.empty) return gr.GdiDrawText(lib.empty, ui.font, ui.col.text, margin, p.s_h, sbar.tree_w, ui.row_h * 5, 0x00000004 | 0x00000400);
        if (!this.tree.length) return gr.GdiDrawText(lib.none, ui.font, ui.col.text, margin, p.s_h, sbar.tree_w, ui.row_h, 0x00000004 | 0x00000400);
        const b = s.clamp(Math.round(sbar.delta / ui.row_h + 0.4), 0, this.tree.length - 1), f = Math.min(b + p.rows, this.tree.length), ln_x = margin + Math.floor(ui.node_sz / 2) + (rootNode ? treeIndent : 0), nowp_c = [], row = [], y1 = Math.round(p.s_h - sbar.delta + p.node_y) + Math.floor(ui.node_sz / 2);
        let i = 0, item_x = 0, item_y = 0, item_w = 0, nm = "", sel_x = 0, sel_w = 0;
        checkNode(gr); if (!ui.nodeStyle) gr.SetTextRenderingHint(5); this.rows = 0;
        if (ui.nodeStyle && ui.col.line) {
			for (let j = 0; j <= this.tree[b].tr; j++) row[j] = b;
			if (this.tree[b].tr > 0) {let top = this.tree[b].par; for (i = 1; i < this.tree[b].tr; i++) top = this.tree[top].par; if (this.tree[top].bot) row[0] = undefined;}
        }
        for (i = b; i < f; i++) {
            if (showNowplaying && (!rootNode || rootNode && this.tree[i].tr) && this.tree[i].item.includes(this.nowp)) nowp_c.push(i);
            item_y = Math.round(ui.row_h * i + p.s_h - sbar.delta);
            if (item_y < p.f_y) {
                this.rows++;
                if (rowStripes) {if (i % 2 == 0) gr.FillSolidRect(0, item_y + 1, sbar.stripe_w, ui.row_h - 2, ui.col.b1); else gr.FillSolidRect(0, item_y, sbar.stripe_w, ui.row_h, ui.col.b2);}
                if (this.tree[i].sel && ui.col.bgSel != 0) {
                    nm = this.tree[i].name + this.tree[i].count;
                    item_x = Math.round(treeIndent * this.tree[i].tr + margin) + ui.icon_w;
                    item_w = gr.CalcTextWidth(nm, ui.font);
                    sel_x = item_x - ui.sel;
                    sel_w = Math.min(item_w + ui.sel * 2, sbar.tree_w - sel_x - 1);
                    if (fullLineSelection) sel_w = sbar.tree_w - sel_x;
                    if ((!tt.Text || m_i != i && tt.Text) && !nowp_c.includes(i)) {gr.FillSolidRect(sel_x, item_y, sel_w, ui.row_h, ui.col.bgSel);}
                }
            }
            if (ui.nodeStyle && ui.col.line) {
                const l = this.tree[i].tr;
                if (this.tree[i].top) row[l] = i;
                if (this.tree[i].bot || i === f - 1) {
                    for (let level = (i === f - 1 ? 0 : l); level <= l; level++) {
                        if (row[level] !== undefined && (!rootNode || rootNode && this.tree[i].tr)) {
                            let start = row[level];
                            let end = i + (this.tree[i].bot && level === l ? .5 : 1);
                            if (item_y >= p.f_y) end -= 1;
                            const l_x = (Math.round(treeIndent * level + margin) + Math.floor(ui.node_sz / 2)), l_y = Math.round(ui.row_h * start + p.s_h - sbar.delta), l_h = Math.ceil(ui.row_h * (end - start)) + 1;
                            gr.FillSolidRect(l_x, l_y, ui.l_w, l_h, ui.col.line);
                        }
                    }
                    if (this.tree[i].bot) row[l] = undefined;
                }
            }
        }
        for (i = b; i < f; i++) {
            item_y = Math.round(ui.row_h * i + p.s_h - sbar.delta);
            if (item_y < p.f_y) {
                nm = this.tree[i].name + this.tree[i].count;
                item_x = Math.round(treeIndent * this.tree[i].tr + margin);
                item_w = gr.CalcTextWidth(nm, ui.font);
                if (tooltip && fullLineSelection) this.tree[i].tt_w = item_w;
                if (ui.nodeStyle) {
                    if (!this.tree[i].track) {
                        const y2 = ui.row_h * i + y1 - ui.l_wc;
                        if (ui.col.line) gr.FillSolidRect(item_x + ui.node_sz, y2, ui.l_s1, ui.l_w, ui.col.line);
                        drawNode(gr, this.tree[i].child.length < 1 ? m_br != i ? 0 : 2 : m_br != i ? 1 : 3, item_x, item_y + p.node_y);
                    } else if (ui.col.line) {
                        const y2 = Math.round(p.s_h - sbar.delta) + Math.ceil(ui.row_h * (i + 0.5)) - ui.l_wc;
                        gr.FillSolidRect(item_x + ui.l_s2, y2, ui.l_s3, ui.l_w, ui.col.line);
                    }
                } else if (!this.tree[i].track) {gr.DrawString(this.tree[i].child.length < 1 ? ui.expand : ui.collapse, ui.iconFont, m_br == i && nodeHighlight ? ui.col.icon_h : this.tree[i].child.length < 1 ? ui.col.icon_e : ui.col.icon_c, item_x, item_y + iconVerticalPad, sbar.tree_w - item_x, ui.row_h, p.s_lc);}
                item_x += ui.icon_w;
                let txt_c = nowp_c.includes(i);
                if (!tt.Text) {if (m_i == i || txt_c && this.tree[i].sel) {sel_x = item_x - ui.sel; sel_w = Math.min(item_w + ui.sel * 2, sbar.tree_w - sel_x - 1); if (fullLineSelection) sel_w = sbar.tree_w - sel_x - 1; gr.FillSolidRect(sel_x, item_y, sel_w, ui.row_h, ui.col.bg_h); gr.DrawRect(sel_x, item_y, sel_w, ui.row_h, 1, ui.col.frame);}}
                if (fullLineSelection) item_w = sbar.tree_w - item_x;
                this.tree[i].w = item_w;
                txt_c = txt_c ? ui.col.nowp : this.tree[i].sel ? ui.col.textSel : m_i == i ? ui.col.text_h : ui.col.text;
                if (!ui.col.counts) gr.GdiDrawText(nm, ui.font, txt_c, item_x, item_y, sbar.tree_w - item_x - ui.sel, ui.row_h, p.lc);
                else {
                    const name_w = gr.CalcTextWidth(this.tree[i].name, ui.font);
                    gr.GdiDrawText(this.tree[i].name, ui.font, txt_c, item_x, item_y, sbar.tree_w - item_x - ui.sel, ui.row_h, p.lc);
                    gr.GdiDrawText(this.tree[i].count, ui.font, ui.col.counts, item_x + name_w, item_y, sbar.tree_w - item_x - ui.sel - name_w, ui.row_h, p.lc);
                }
            }
        }
    }

	const nodeExpColl = (x, y, item, ix) => {
		const expanded = item.child.length > 0 ? 1 : 0;
		switch (expanded) {
			case 0:
				if (ppt.autoCollapse) branch_chg(item, false, true);
				const row = this.row(y);
				this.branch(item, !rootNode || ix ? false : true, true); if (!ix) p.setHeight(true);
				if (ppt.autoCollapse) ix = item.ix;
				if (row + 1 + item.child.length > this.rows) {
					if (item.child.length > (this.rows - 2)) sbar.check_scroll(ix * ui.row_h);
					else sbar.check_scroll(Math.min(ix * ui.row_h,(ix + 1 - sbar.rows_drawn + item.child.length) * ui.row_h));
				} break;
			case 1: this.clear_child(item); if (!ix && this.tree.length == 1) p.setHeight(false); break;
		}
		if (sbar.scroll > ix * ui.row_h) sbar.check_scroll(ix * ui.row_h); checkRow(x, y);
	}

    const send = (item, x, y) => {
        if (!this.check_ix(item, x, y, false)) return;
        if (vk.k('ctrl')) this.load(this.sel_items, true, false, false, ppt.sendPlaylist, false);
        else if (vk.k('shift')) this.load(this.sel_items, true, false, false, ppt.sendPlaylist, false);
        else this.load(item.item, true, false, this.autoPlay.click, ppt.sendPlaylist, false);
    }

    const track = (item, x, y) => {
        if (!this.check_ix(item, x, y, false)) return;
        if (vk.k('ctrl')) tracking(this.sel_items);
        else if (vk.k('shift')) tracking(this.sel_items);
        else tracking(item.item);
    }

    this.lbtn_dn = (x, y) => {
        lbtn_dn = false; dbl_clicked = false; if (y < p.s_h) return; let ix = this.get_ix(x, y, true, false); p.pos = ix; if (ix >= this.tree.length || ix < 0) return;
        if (ppt.touchControl) {ui.drag_drop_id = ui.touch_dn_id = ix;}
        const item = this.tree[ix];
        switch (clickedOn(x, y, item)) {
            case 'node': nodeExpColl(x, y, item, ix); break;
            case 'text':
                last_pressed_coord.x = x; last_pressed_coord.y = y; lbtn_dn = true;
                if (ppt.touchControl) break;
                if (vk.k('alt') && this.autoFill.mouse) return;
                if (!item.sel && !vk.k('ctrl')) get_selection(ix, item.sel);
                break;
        }
        lib.treeState(false, ppt.rememberTree);
    }

    this.lbtn_up = (x, y) => {
        last_pressed_coord = {x: undefined, y: undefined}; lbtn_dn = false;
        if (y < p.s_h || dbl_clicked || but.Dn) return; const ix = this.get_ix(x, y, true, false); p.pos = ix; if (ix >= this.tree.length || ix < 0) return; if (ppt.touchControl && (this.autoFill.mouse || this.autoPlay.click) && ui.touch_dn_id != ix) return;
        const item = this.tree[ix];
        if (clickedOn(x, y, item) != 'text') return;
        if (vk.k('alt')) return add(x, y, ppt.altClickPlaylist);
        if (!vk.k('ctrl')) {this.clear(); if (!item.sel) get_selection(ix, item.sel);}
        else get_selection(ix, item.sel);
        if (this.autoFill.mouse || this.autoPlay.click) {window.Repaint(true); send(item, x, y);} else {p.tree_paint(); track(item, x, y);}
        lib.treeState(false, ppt.rememberTree);
    }

    this.dragDrop = (x, y) => {
        if (!lbtn_dn) return;
        const mv = !ppt.touchControl ? Math.sqrt((Math.pow(last_pressed_coord.x - x, 2) + Math.pow(last_pressed_coord.y - y, 2))) : Math.abs(x - last_pressed_coord.x);
        if (mv > 7) {
            if (ppt.touchControl) {
                const ix = this.get_ix(x, y, true, false), item = this.tree[ix];
                if (ui.drag_drop_id != ix || ix >= this.tree.length || ix < 0) return;
                if (!item.sel && !vk.k('ctrl')) get_selection(ix, item.sel);
            }
            last_pressed_coord = {x: undefined, y: undefined}
			const handleList = this.selected(), effect = fb.DoDragDrop(window.ID, handleList, handleList.Count ? 1|4 : 0);
            lbtn_dn = false;
        }
    }

    this.lbtn_dblclk = (x, y) => {
		if (this.autoPlay.click > 2) return;
        dbl_clicked = true;
        if (y < p.s_h) return; let ix = this.get_ix(x, y, true, false); if (ix >= this.tree.length || ix < 0) return;
        const item = this.tree[ix];
		switch (clickedOn(x, y, item)) {
            case 'node': nodeExpColl(x, y, item, ix); break;
			case 'text':
				if (!this.check_ix(item, x, y, false)) return;
				if (ppt.dblClickAction == 2 && !this.autoFill.mouse && !this.autoPlay.click) return send(item, x, y); let expanded = 0;
				if (!ppt.dblClickAction && !item.track) {
					if (item.child.length) expanded = 1;
					switch (expanded) {
						case 0:
							if (ppt.autoCollapse) branch_chg(item, false, true); if (!ix) p.setHeight(true);
							const row = this.row(y);
							this.branch(item, !rootNode || ix ? false : true, true);
							if (ppt.autoCollapse) ix = item.ix;
							if (row + 1 + item.child.length > this.rows) {
								if (item.child.length > (this.rows - 2)) sbar.check_scroll(ix * ui.row_h);
								else sbar.check_scroll(Math.min(ix * ui.row_h, (ix + 1 - sbar.rows_drawn + item.child.length) * ui.row_h));
							} break;
						case 1: this.clear_child(item); if (!ix && this.tree.length == 1) p.setHeight(false); break;
					}
					if (sbar.scroll > ix * ui.row_h) sbar.check_scroll(ix * ui.row_h); lib.treeState(false, ppt.rememberTree);
				}
				if (ppt.dblClickAction == 2 || this.autoPlay.click == 2) return;
				if (ppt.dblClickAction || !ppt.dblClickAction && item.track) {
					if (!this.autoFill.mouse) send(item, x, y);
					let pln = plman.FindOrCreatePlaylist(ppt.libPlaylist, false); if (!ppt.sendPlaylist) pln = plman.ActivePlaylist; else plman.ActivePlaylist = pln; plman.ActivePlaylist = pln;
					const c = (plman.PlaybackOrder == 3 || plman.PlaybackOrder == 4) ? Math.ceil(plman.PlaylistItemCount(pln) * Math.random() - 1) : 0; plman.ExecutePlaylistDefaultAction(pln, c);
				}
				break;
		}
    }

    const get_selection = (idx, state, add, bypass) => {
        const sel_type = idx == -1 && !add ? 0 : vk.k('shift') && last_sel > -1 && !bypass ? 1 : vk.k('ctrl') && !bypass ? 2 : !state ? 3 : 0;
        switch (sel_type) {
            case 0: this.clear(); this.sel_items = []; break;
            case 1: const direction = (idx > last_sel) ? 1 : -1; if (!vk.k('ctrl')) this.clear(); for (let i = last_sel; ; i += direction) {this.tree[i].sel = true; if (i == idx) break;} this.get_sel_items(); p.tree_paint(); break;
            case 2: this.tree[idx].sel = !this.tree[idx].sel; this.get_sel_items(); last_sel = idx; break;
            case 3: this.sel_items = []; if (!add) this.clear(); if (!add) this.tree[idx].sel = true; this.sel_items.push.apply(this.sel_items, this.tree[idx].item); this.sel_items = uniq(this.sel_items); last_sel = idx; break;
        }
    }

    this.move = (x, y) => {
        if (but.Dn) return;
        const ix = this.get_ix(x, y, false, false); get_pos = checkRow(x, y); m_i = -1;
        if (ix != -1) {m_i = ix; if (tooltip) activate_tooltip(ix, y);}
        if (m_i == ix_o && m_br == row_o && !sbar.touch.dn) return;
        tt_id = -1; if (tooltip && tt.Text) this.deactivate_tooltip();
        if (!sbar.draw_timer && (m_i != ix_o || m_br != row_o)) p.tree_paint();
        ix_o = m_i; row_o = m_br;
    }

    this.get_ix = (x, y, simple, type) => {
        let ix;
        if (y > sbar.item_y && y < sbar.item_y + this.rows * ui.row_h) ix = Math.round((y + sbar.delta - p.s_h - ui.row_h * 0.5) / ui.row_h); else ix = -1;
        if (simple) return ix;
        if (this.tree.length > ix && ix >= 0 && x < sbar.tree_w && y > sbar.item_y && y < sbar.item_y + this.rows * ui.row_h && this.check_ix(this.tree[ix], x, y, type)) return ix;
        else return -1;
    }

    this.check_ix = (br, x, y, type) => {
        if (!br) return false;
        return type ? (x >= Math.round(treeIndent * br.tr + margin) && x < Math.round(treeIndent * br.tr + margin) + br.w + ui.icon_w)
        : (x >= Math.round(treeIndent * br.tr + margin) + ui.icon_w) && x < Math.min(Math.round(treeIndent * br.tr + margin) + ui.icon_w + br.w, sbar.tree_w);
    }

    this.on_key_down = vkey => {
        if (p.search) return;
        if (vk.k('enter')) {
            if (!this.sel_items.length) return;
            switch (true) {
               case vk.k('shift'): return this.load(this.sel_items, true, true, false, false, false);
               case vk.k('ctrl'): return this.load(this.sel_items, true, true, false, false, true);
               default: return this.load(this.sel_items, true, false, this.autoPlay.send, false, false);
            }
        }
        let item = -1, row = -1;
        switch(vkey) {
            case vk.left:
                if (!(p.pos >= 0) && get_pos != -1) p.pos = get_pos;
                else p.pos = p.pos + this.tree.length % this.tree.length;
                p.pos = s.clamp(p.pos, 0, this.tree.length - 1); get_pos = -1; m_i = -1;
                if ((this.tree[p.pos].tr == (rootNode ? 1 : 0)) && this.tree[p.pos].child.length < 1) break;
                if (this.tree[p.pos].child.length > 0) {item = this.tree[p.pos]; this.clear_child(item); get_selection(item.ix); m_i = p.pos = item.ix;}
                else {item = this.tree[this.tree[p.pos].par]; this.clear_child(item); get_selection(item.ix); m_i = p.pos = item.ix;}
                p.tree_paint(); if (this.autoFill.key) this.load(this.sel_items, true, false, false, ppt.sendPlaylist, false);
                sbar.set_rows(this.tree.length);
                if (sbar.scroll > p.pos * ui.row_h) sbar.check_scroll(p.pos * ui.row_h);
                else sbar.scroll_round(); lib.treeState(false, ppt.rememberTree);
                break;
            case vk.right:
                if (!(p.pos >= 0) && get_pos != -1) p.pos = get_pos;
                else p.pos = p.pos + this.tree.length % this.tree.length;
                p.pos = s.clamp(p.pos, 0, this.tree.length - 1); get_pos = -1; m_i = -1;
                item = this.tree[p.pos]; if (ppt.autoCollapse) branch_chg(item, false, true);
                this.branch(item, rootNode && p.pos == 0 ? true : false, true);
                get_selection(item.ix); p.tree_paint(); m_i = p.pos = item.ix;
                if (this.autoFill.key) this.load(this.sel_items, true, false, false, ppt.sendPlaylist, false);
                sbar.set_rows(this.tree.length);
                row = (p.pos * ui.row_h - sbar.scroll) / ui.row_h;
                if (row + 1 + item.child.length > sbar.rows_drawn) {
                    if (item.child.length > (sbar.rows_drawn - 2)) sbar.check_scroll(p.pos * ui.row_h);
                    else sbar.check_scroll(Math.min(p.pos * ui.row_h, (p.pos + 1 - sbar.rows_drawn + item.child.length) * ui.row_h));
                } else sbar.scroll_round(); lib.treeState(false, ppt.rememberTree);
                break;
            case vk.pgUp: if (this.tree.length == 0) break; p.pos = Math.max(Math.round(sbar.scroll / ui.row_h + 0.4) - Math.floor(p.rows) + 1, !rootNode ? 0 : 1); sbar.page_throttle(1); get_selection(this.tree[p.pos].ix); p.tree_paint(); if (this.autoFill.key) this.load(this.sel_items, true, false, false, ppt.sendPlaylist, false); lib.treeState(false, ppt.rememberTree); break;
            case vk.pgDn: if (this.tree.length == 0) break; p.pos = Math.min(Math.round(sbar.scroll / ui.row_h + 0.4) + Math.floor(p.rows) * 2 - 2, this.tree.length - 1); sbar.page_throttle(-1); get_selection(this.tree[p.pos].ix); p.tree_paint(); if (this.autoFill.key) this.load(this.sel_items, true, false, false, ppt.sendPlaylist, false); lib.treeState(false, ppt.rememberTree); break;
            case vk.home: if (this.tree.length == 0) break; p.pos = !rootNode ? 0 : 1; sbar.check_scroll(0); get_selection(this.tree[p.pos].ix); p.tree_paint(); if (this.autoFill.key) this.load(this.sel_items, true, false, false, ppt.sendPlaylist, false); lib.treeState(false, ppt.rememberTree); break;
            case vk.end: if (this.tree.length == 0) break; p.pos = this.tree.length - 1; sbar.scroll_to_end(); get_selection(this.tree[p.pos].ix); p.tree_paint(); if (this.autoFill.key) this.load(this.sel_items, true, false, false, ppt.sendPlaylist, false); lib.treeState(false, ppt.rememberTree); break;
            case vk.dn: case vk.up:
                if (this.tree.length == 0) break;
                if ((p.pos == 0 && get_pos == -1 && vkey == vk.up) || (p.pos == this.tree.length - 1 && vkey == vk.dn)) {get_selection(-1); break;}
                if (get_pos != -1) p.pos = get_pos;
                else p.pos = p.pos + this.tree.length % this.tree.length;
                get_pos = -1; m_i = -1; if (vkey == vk.dn) p.pos++; if (vkey == vk.up) p.pos--;
                p.pos = s.clamp(p.pos, !rootNode ? 0 : 1, this.tree.length - 1);
                row = (p.pos * ui.row_h - sbar.scroll) / ui.row_h;
                if (sbar.rows_drawn - row < 3) sbar.check_scroll((p.pos + 3) * ui.row_h - sbar.rows_drawn * ui.row_h);
                else if (row < 2 && vkey == vk.up) sbar.check_scroll((p.pos - 1) * ui.row_h);
                m_i = p.pos; get_selection(p.pos); p.tree_paint();
                if (this.autoFill.key) this.load(this.sel_items, true, false, false, ppt.sendPlaylist, false); lib.treeState(false, ppt.rememberTree);
                break;
        }
    }

    this.on_main_menu = index => {
		if (index == addIX) {this.get_sel_items(); if (!this.sel_items.length) return; this.load(this.sel_items, true, true, false, false, false);}
        if (index == collapseAllIX) this.collapseAll();
		if (index == insertIX) {this.get_sel_items(); if (!this.sel_items.length) return; this.load(this.sel_items, true, true, false, false, true);}
        if (index == searchClearIX && ppt.searchShow) sL.clear();
        if (index == searchFocusIX && is_focused && ppt.searchShow) sL.searchFocus();
    }
}

function SearchLibrary(searchShow) {
    if (!searchShow) return;
    const doc = new ActiveXObject('htmlfile'), lg = [];
    let cx = 0, f = 0, i = 0, lbtn_dn = false, log = [], offset = 0, b = 0, shift = false, shift_x = 0, txt_w = 0;

    const calc_text = () => {s.gr(1, 1, false, g => txt_w = g.CalcTextWidth(p.s_txt.substr(offset), ui.font));}
    const drawcursor = gr => {if (p.search && p.s_cursor && b == f && cx >= offset) {const lx = p.s_x + get_cursor_x(cx); gr.DrawLine(lx, p.s_sp * 0.1, lx, p.s_sp * 0.85, ui.l_w, ui.col.text);}}
    const drawsel = gr => {if (b == f) return; const clamp = p.s_x + p.s_w2; gr.DrawLine(Math.min(p.s_x + get_cursor_x(b), clamp), p.s_sp / 2, Math.min(p.s_x + get_cursor_x(f), clamp), p.s_sp / 2, ui.row_h - 3, ui.col.searchSel);}
    const get_cursor_pos = x => {s.gr(1, 1, false, g => {const nx = x - p.s_x; let pos = 0; for (i = offset; i < p.s_txt.length; i++) {pos += g.CalcTextWidth(p.s_txt.substr(i, 1), ui.font); if (pos >= nx + 3) break;}}); return i;}
    const get_cursor_x = pos => {let x = 0; s.gr(1, 1, false, g => {if (pos >= offset) x = g.CalcTextWidth(p.s_txt.substr(offset, pos - offset), ui.font);}); return x;}
    const get_offset = gr => {let j = 0, t = gr.CalcTextWidth(p.s_txt.substr(offset, cx - offset), ui.font); while (t >= p.s_w2 && j < 500) {j++; offset++; t = gr.CalcTextWidth(p.s_txt.substr(offset, cx - offset), ui.font);}}
    const record = () => {lg.push(p.s_txt); log = []; if (lg.length > 30) lg.shift();}

    this.clear = () => {lib.time.Reset(); pop.subCounts.search = {}; offset = b = f = cx = 0; p.s_cursor = false; p.search = false; p.s_txt = ""; but.set_search_btns_hide(); p.search_paint(); timer.clear(timer.cursor); lib.rootNodes(); pop.checkAutoHeight();}
    this.on_key_up = vkey => {if (!p.search) return; if (vkey == vk.shift) {shift = false; shift_x = cx;}}
    this.lbtn_up = (x, y) => {if (b != f) timer.clear(timer.cursor); lbtn_dn = false;}
    this.move = (x, y) => {if (y > p.s_h || !lbtn_dn) return; const t = get_cursor_pos(x), t_x = get_cursor_x(t); let l; calc_text(); if (t < b) {if (t < f) {if (t_x < p.s_x) if (offset > 0) offset--;} else if (t > f) {if (t_x + p.s_x > p.s_x + p.s_w2) {l = (txt_w > p.s_w2) ? txt_w - p.s_w2 : 0; if (l > 0) offset++;}} f = t;} else if (t > b) {if (t_x + p.s_x > p.s_x + p.s_w2) {l = (txt_w > p.s_w2) ? txt_w - p.s_w2 : 0; if (l > 0) offset++;} f = t;} cx = t; p.search_paint();}
    this.rbtn_up = (x, y) => {men.search_menu(x, y, b, f, doc.parentWindow.clipboardData.getData('text') ? true : false);}

    this.lbtn_dn = (x, y) => {
        p.search_paint(); lbtn_dn = p.search = (y < p.s_h && x > ppt.margin + ui.row_h * 0.6 && x < p.s_x + p.s_w2);
        if (!lbtn_dn) {offset = b = f = cx = 0; timer.clear(timer.cursor); return;}
        else {if (shift) {b = cx; f = cx = get_cursor_pos(x);} else {cx = get_cursor_pos(x); b = f = cx;} timer.clear(timer.cursor); p.s_cursor = true; timer.cursor.id = setInterval(() => {p.s_cursor = !p.s_cursor; p.search_paint();}, 530);}
        p.search_paint();
    }

    this.searchFocus = () => {
        p.search_paint(); p.search = true; shift = false; b = f = cx = p.s_x;
        timer.clear(timer.cursor); p.s_cursor = true; timer.cursor.id = setInterval(() => {p.s_cursor = !p.s_cursor; p.search_paint();}, 530);
        p.search_paint();
    }

    this.on_char = (code, force) => {
        let text = String.fromCharCode(code), st; if (force) p.search = true;
        if (!p.search) return; p.s_cursor = false; p.pos = -1;
        switch (code) {
            case vk.enter: if (p.s_txt.length < 3) break; const items = s.query(lib.list, p.s_txt); pop.load(items, false, false, false, ppt.sendPlaylist, false); break;
            case vk.redo: lg.push(p.s_txt); if (lg.length > 30) lg.shift(); if (log.length > 0) {p.s_txt = log.pop() + ""; cx++} break;
            case vk.undo: log.push(p.s_txt); if (log.length > 30) lg.shift(); if (lg.length > 0) p.s_txt = lg.pop() + ""; break;
            case vk.selAll: b = 0; f = p.s_txt.length; break;
            case vk.copy: if (b != f) doc.parentWindow.clipboardData.setData('text', p.s_txt.substring(b, f)); break; case vk.cut: if (b != f) doc.parentWindow.clipboardData.setData('text', p.s_txt.substring(b, f));
            case vk.back: record();
                if (b == f) {if (cx > 0) {p.s_txt = p.s_txt.substr(0, cx - 1) + p.s_txt.substr(cx, p.s_txt.length - cx); if (offset > 0) offset--; cx--;}}
                else {if (f - b == p.s_txt.length) {p.s_txt = ""; cx = 0;} else {if (b > 0) {st = b, en = f; b = Math.min(st, en); f = Math.max(st, en); p.s_txt = p.s_txt.substring(0, b) + p.s_txt.substring(f, p.s_txt.length); cx = b;} else {p.s_txt = p.s_txt.substring(f, p.s_txt.length); cx = b;}}}
                calc_text(); offset = offset >= f - b ? offset - f + b : 0; b = cx; f = b; break;
            case "delete": record();
                if (b == f) {if (cx < p.s_txt.length) {p.s_txt = p.s_txt.substr(0, cx) + p.s_txt.substr(cx + 1, p.s_txt.length - cx - 1);}}
                else {if (f - b == p.s_txt.length) {p.s_txt = ""; cx = 0;} else {if (b > 0) {st = b, en = f; b = Math.min(st, en); f = Math.max(st, en); p.s_txt = p.s_txt.substring(0, b) + p.s_txt.substring(f, p.s_txt.length); cx = b;} else {p.s_txt = p.s_txt.substring(f, p.s_txt.length); cx = b;}}}
                calc_text(); offset = offset >= f - b ? offset - f + b : 0; b = cx; f = b; break;
            case vk.paste: text = doc.parentWindow.clipboardData.getData('text');
            default: record();
                if (b == f) {p.s_txt = p.s_txt.substring(0, cx) + text + p.s_txt.substring(cx); cx += text.length; f = b = cx;}
                else if (f > b) {p.s_txt = p.s_txt.substring(0, b) + text + p.s_txt.substring(f); calc_text(); offset = offset >= f - b ? offset - f + b : 0; cx = b + text.length; b = cx; f = b;}
                else {p.s_txt = p.s_txt.substring(b) + text + p.s_txt.substring(0, f); calc_text(); offset = offset < f - b ? offset - f + b : 0; cx = f + text.length; b = cx; f = b;} break;
        }
        if (code == vk.copy || code == vk.selAll) return;
        if (!timer.cursor) timer.cursor.id = setInterval(() => {p.s_cursor = !p.s_cursor; p.search_paint();}, 530);
        but.set_search_btns_hide(); p.search_paint(); lib.upd_search = true; timer.clear(timer.search);
        timer.search.id = setTimeout(() => {lib.time.Reset(); pop.subCounts.search = {}; lib.treeState(false, ppt.rememberTree); lib.rootNodes(); p.setHeight(true);}, 160);
    }

    this.on_key_down = vkey => {
        if (!p.search) return;
        switch(vkey) {
            case vk.left: case vk.right: if (vkey == vk.left) {if (offset > 0) {if (cx <= offset) {offset--; cx--;} else cx--;} else if (cx > 0) cx--; b = f = cx;} if (vkey == vk.right && cx < p.s_txt.length) cx++; b = f = cx;
            if (shift) {b = Math.min(cx, shift_x); f = Math.max(cx, shift_x);} p.s_cursor = true;timer.clear(timer.cursor); timer.cursor.id = setInterval(() => {p.s_cursor = !p.s_cursor; p.search_paint();}, 530); break;
            case vk.home: case vk.end: if (vkey == vk.home) offset = b = f = cx = 0; else b = f = cx = p.s_txt.length; p.s_cursor = true; timer.clear(timer.cursor); timer.cursor.id = setInterval(() => {p.s_cursor = !p.s_cursor; p.search_paint();}, 530); break;
            case vk.shift: shift = true; shift_x = cx; break;
            case vk.del: this.on_char("delete"); break;
        }
        p.search_paint();
    }

    this.draw = gr => {
        b = s.clamp(b, 0, p.s_txt.length); f = s.clamp(f, 0, p.s_txt.length); cx = s.clamp(cx, 0, p.s_txt.length);
        if (ui.fill) gr.FillSolidRect(0, 1, ui.w, ui.row_h - 4, 0x60000000);
        if (ui.pen == 1) gr.DrawLine(ppt.margin, p.s_sp, p.s_w1, p.s_sp, ui.l_w, ui.col.s_line);
        if (ui.pen == 2) gr.DrawRoundRect(0, 2, ui.w - 1, ui.row_h - 4, 4, 4, 1, ui.pen_c);
        if (p.s_txt) {
            drawsel(gr); get_offset(gr);
            gr.GdiDrawText(p.s_txt.substr(offset), ui.font, ui.col.search, p.s_x, 0, p.s_w2, p.s_sp, p.l);
        } else gr.GdiDrawText("Search", ui.searchFont, ui.col.txt_box, p.s_x, 0, p.s_w2, p.s_sp, p.l);
        drawcursor(gr);
        if (ppt.searchShow > 1) {
            const l_x = p.f_x1 - 9, l_h = Math.round(p.s_sp / 2);
            gr.GdiDrawText(p.filt[ppt.filterBy].name, p.filterFont, ui.col.txt_box, p.f_x1, 0, p.f_w[ppt.filterBy], p.s_sp, p.cc);
            gr.FillGradRect(l_x, 0, ui.l_w, l_h, 90, RGBA(0, 0, 0, 0), ui.col.s_line);
            gr.FillGradRect(l_x, l_h, ui.l_w, l_h, 90, ui.col.s_line, RGBA(0, 0, 0, 0));
        }
    }
}

function JumpSearch() {
    let j_x = 5, j_h = 30, j_y = 5, jSearch = "", jump_search = true, rs1 = 5, rs2 = 4;
    this.on_size = () => {j_x = Math.round(ui.w / 2); j_h = Math.round(ui.row_h * 1.5); j_y = Math.round((ui.h - j_h) / 2); rs1 = Math.min(5, j_h / 2); rs2 = Math.min(4, (j_h - 2) / 2);}

    this.on_char = code => {
        if (utils.IsKeyPressed(0x09) || utils.IsKeyPressed(0x11) || utils.IsKeyPressed(0x1B)) return; const text = String.fromCharCode(code);
        if (!p.search) {
            let found = false, i = 0, pos = -1;
            switch(code) {case vk.back: jSearch = jSearch.substr(0, jSearch.length - 1); break; case vk.enter: jSearch = ""; return; default: jSearch += text; break;}
            pop.clear();
            if (!jSearch) return; pop.sel_items = []; jump_search = true;
            window.RepaintRect(0, j_y, ui.w, j_h + 1);
            timer.clear(timer.jsearch1);
            timer.jsearch1.id = setTimeout(() => {
                pop.tree.some((v, i) => {
                    if (v.name != p.rootName && v.name.substring(0, jSearch.length).toLowerCase() == jSearch.toLowerCase()) {
                        found = true; pos = i; v.sel = true; p.pos = pos; pop.setGetPos(pos);
                        if (pop.autoFill.key) pop.get_sel_items(); lib.treeState(false, ppt.rememberTree);
                        return true;
                    }
                });
                if (!found) jump_search = false;
                p.tree_paint();
                sbar.check_scroll((pos - 5) * ui.row_h);
                timer.jsearch1.id = null;
            }, 500);

            timer.clear(timer.jsearch2);
            timer.jsearch2.id = setTimeout(() => {
                if (found && pop.autoFill.key) pop.load(pop.sel_items, true, false, false, ppt.sendPlaylist, false); jSearch = "";
                window.RepaintRect(0, j_y, ui.w, j_h + 1);
                timer.jsearch2.id = null;
            }, 1200);
        }
    }

    this.draw = gr => {
        if (jSearch) {
            gr.SetSmoothingMode(4);
            const j_w = gr.CalcTextWidth(jSearch,ui.jumpFont) + 25;
            gr.FillRoundRect(j_x - j_w / 2, j_y, j_w, j_h, rs1, rs1, 0x96000000);
            gr.DrawRoundRect(j_x - j_w / 2, j_y, j_w, j_h, rs1, rs1, 1, 0x64000000);
            gr.DrawRoundRect(j_x - j_w / 2 + 1, j_y + 1, j_w - 2, j_h - 2, rs2, rs2, 1, 0x28ffffff);
            gr.GdiDrawText(jSearch, ui.jumpFont, RGB(0, 0, 0), j_x - j_w / 2 + 1, j_y + 1 , j_w, j_h, p.cc);
            gr.GdiDrawText(jSearch, ui.jumpFont, jump_search ? 0xfffafafa : 0xffff4646, j_x - j_w / 2, j_y, j_w, j_h, p.cc);
        }
    }
}

function Buttons() {
    const sbarButPad = s.clamp(ppt.sbarButPad / 100, -0.5, 0.3), sAlpha = ppt.sbarCol ? [68, 153, 255] : [75, 192, 228], scrBtns = ["scrollUp", "scrollDn"];
    let arrow_symb = 0, b_x, bx, by, bh, byDn, byUp, cur_btn = null, fw, hot_o, i, iconFontName = "Segoe UI", iconFontStyle = 0, qx, qy, qh, s_img = false, scrollBtn = false, scrollBtn_x, scrollDn_y, scrollUp_y, tooltip, transition, tt_start = Date.now() - 2000;
    this.btns = {}; this.Dn = false; this.show_tt = true;

    if (ppt.get(" Scrollbar Arrow Custom", false)) arrow_symb = ppt.arrowSymbol.replace(/\s+/g, "").charAt(); if (!arrow_symb.length) arrow_symb = 0;
    if (ppt.customCol && ppt.butCustIconFont.length) {
        const butCustIconFont = ppt.butCustIconFont.splt(1);
        iconFontName = butCustIconFont[0];
        iconFontStyle = Math.round(s.value(butCustIconFont[1], 0, 0));
    }

    const clear = () => {this.Dn = false; Object.values(this.btns).forEach(v => v.down = false);}
    const tt = (n, force) => {if (tooltip.Text !== n || force) {tooltip.Text = n; tooltip.Activate();}}

    this.create_images = () => {
        const sz = arrow_symb == 0 ? Math.max(Math.round(ui.but_h * 1.666667), 1) : 100, sc = sz / 100, iconFont = gdi.Font(iconFontName, sz, iconFontStyle);
            s_img = s.gr(100, 100, true, g => {
                g.SetSmoothingMode(2);
                if (!ui.local) {g.DrawLine(69, 71, 88, 90, 12, ui.col.txt_box); g.DrawEllipse(8, 11, 67, 67, 10, ui.col.txt_box);}
                else {g.DrawLine(69, 71, 88, 90, 12, ui.col.txt_box); g.DrawEllipse(8, 11, 67, 67, 10, ui.col.txt_box);}
                g.FillEllipse(15, 17, 55, 55, 0x0AFAFAFA); g.SetSmoothingMode(0);
            });
                scrollBtn = s.gr(sz, sz, true, g => {
                    g.SetTextRenderingHint(3); g.SetSmoothingMode(2);
                    if (ppt.sbarCol) {arrow_symb == 0 ? g.FillPolygon(ui.col.text, 1, [50 * sc, 0, 100 * sc, 76 * sc, 0, 76 * sc]) : g.DrawString(arrow_symb, iconFont, ui.col.text, 0, sz * sbarButPad, sz, sz, StringFormat(1, 1));}
                    else {arrow_symb == 0 ? g.FillPolygon(RGBA(ui.col.t, ui.col.t, ui.col.t, 255), 1, [50 * sc, 0, 100 * sc, 76 * sc, 0, 76 * sc]) :
                    g.DrawString(arrow_symb, iconFont, RGBA(ui.col.t, ui.col.t, ui.col.t, 255), 0, sz * sbarButPad, sz, sz, StringFormat(1, 1));} g.SetSmoothingMode(0);
                });
     }; this.create_images();

	this.create_tooltip = () => tooltip = window.CreateTooltip("Segoe UI", 15 * s.scale * ppt.get(" Zoom Tooltip [Button] (%)", 100) / 100, 0); this.create_tooltip();
    this.lbtn_dn = (x, y) => {this.move(x, y); if (!cur_btn || cur_btn.hide) {this.Dn = false; return false} else this.Dn = cur_btn.name; cur_btn.down = true; cur_btn.cs("down"); cur_btn.lbtn_dn(x, y); return true;}
    this.leave = () => {if (cur_btn) {cur_btn.cs("normal"); if (!cur_btn.hide) transition.start();} cur_btn = null;}
    this.on_script_unload = () => tt("");
    this.draw = gr => Object.values(this.btns).forEach(v => {if (!v.hide) v.draw(gr);});
    this.reset = () => transition.stop();
    this.set_scroll_btns_hide = (force) => {if (!this.btns || (!ppt.sbarShow && !force)) return; scrBtns.forEach((v, i) => {if (this.btns[v]) this.btns[v].hide = sbar.scrollable_lines < 1 || !ppt.sbarShow;});}
    this.set_search_btns_hide = () => {
        if (this.btns.s_img) this.btns.s_img.hide =  ppt.searchShow > 1 && p.s_txt;
        if (this.btns.cross2) this.btns.cross2.hide = !this.btns.s_img.hide
    }

    const Btn = function(x, y, w, h, type, ft, txt, stat, im, hide, l_dn, l_up, tiptext, hand, name) {
        this.draw = gr => {
            switch (this.type) {
                case 1: case 2: drawScrollBtn(gr); break;
                case 3: ui.theme.SetPartAndStateID(1, im[this.state]); ui.theme.DrawThemeBackground(gr, this.x, this.y, this.w, this.h); break;
                case 4: drawSearch(gr); break;
                case 5: drawCross(gr); break;
                case 6: drawFilter(gr); break;
            }
        }

        this.cs = state => {this.state = state; if (state === "down" || state === "normal") this.tt.clear(); this.repaint();}
        this.lbtn_dn = () => {if (!but.Dn) return; this.l_dn && this.l_dn(x, y);}
        this.lbtn_up = (x, y) => {if (ppt.touchControl && Math.sqrt((Math.pow(p.last_pressed_coord.x - x, 2) + Math.pow(p.last_pressed_coord.y - y, 2))) > 3 * s.scale) return; if (this.l_up) this.l_up();}
        this.repaint = () => {const expXY = 2, expWH = 4; window.RepaintRect(this.x - expXY, this.y - expXY, this.w + expWH, this.h + expWH);}
        this.trace = (x, y) => {return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h;}

        this.x = x; this.y = y; this.w = w; this.h = h; this.type = type; this.hide = hide; this.l_dn = l_dn; this.l_up = l_up; this.tt = new Tooltip; this.tiptext = tiptext; this.transition_factor = 0; this.state = "normal"; this.hand = hand; this.name = name;

        const drawCross = gr => {
            let a; if (this.state !== "down") {const b = im.normal, c = im.hover - b; a = Math.min(b + c * this.transition_factor, im.hover);} else a = im.hover;
            gr.DrawLine(Math.round(this.x + bh * 0.67), Math.round(this.y + bh * 0.67), Math.round(this.x + bh * 0.27), Math.round(this.y + bh * 0.27), Math.round(bh / 10), RGBA(136, 136, 136, a)); gr.DrawLine(Math.round(this.x + bh * 0.67), Math.round(this.y + bh * 0.27), Math.round(this.x + bh * 0.27), Math.round(this.y + bh * 0.67), Math.round(bh / 10), RGBA(136, 136, 136, a));
        }

         const drawFilter = gr => {
            const col = !ui.local ? (this.state !== "down" ? ui.get_blend(im.hover, im.normal, this.transition_factor, true) : im.hover) : im.normal;
            gr.SetTextRenderingHint(5); gr.DrawString(txt, ft, col, this.x, this.y - 1, this.w, this.h, StringFormat(2, 1));
        }

         const drawScrollBtn = gr => {
            const a = this.state !== "down" ? Math.min(sAlpha[0] + (sAlpha[1] - sAlpha[0]) * this.transition_factor, sAlpha[1]) : sAlpha[2];
            if (scrollBtn) gr.DrawImage(scrollBtn, this.x + ft, txt, stat, stat, 0, 0, scrollBtn.Width, scrollBtn.Height, this.type == 1 ? 0 : 180, a);
        }

        const drawSearch = gr => {
                const a = !ui.local? (this.state !== "down" ? Math.min(153 + (228 - 153) * this.transition_factor, 228)  : 228) : 255;
                gr.SetInterpolationMode(2); if (im.normal) gr.DrawImage(im.normal, this.x, this.y, this.w, this.h, 0, 0, im.normal.Width, im.normal.Height, 0, a); gr.SetInterpolationMode(0);
        }
    }

    this.move = (x, y) => {
        const hover_btn = Object.values(this.btns).find(v => {
             if (!v.hide && (!this.Dn || this.Dn == v.name)) return v.trace(x, y);
        });
        let hand = false;
        check_scrollBtns(x, y, hover_btn); if (hover_btn) hand = hover_btn.hand; window.SetCursor(hand ? 32649 : !this.Dn && y < p.s_h && ppt.searchShow && x > qx + qh ? 32513 : 32512);
        if (hover_btn && hover_btn.hide) {if (cur_btn) {cur_btn.cs("normal"); transition.start();} cur_btn = null; return null;} // btn hidden, ignore
        if (cur_btn === hover_btn) return cur_btn;
        if (cur_btn) {cur_btn.cs("normal"); transition.start();} // return prev btn to normal state
        if (hover_btn && !(hover_btn.down && hover_btn.type < 4)) {hover_btn.cs("hover"); if (this.show_tt) hover_btn.tt.show(hover_btn.tiptext); transition.start();}
        cur_btn = hover_btn;
        return cur_btn;
    }

    this.lbtn_up = (x, y) => {
        if (!cur_btn || cur_btn.hide || this.Dn != cur_btn.name) {clear(); return false;}
        clear();
        if (cur_btn.trace(x, y)) cur_btn.cs("hover");
        cur_btn.lbtn_up(x, y);
        return true;
    }

    this.refresh = upd => {
        if (upd) {
            bx = p.s_w1 - Math.round(ui.row_h * 0.75); bh = ui.row_h; by = Math.round((p.s_sp - bh * 0.4) / 2 - bh * 0.27);
            b_x = p.sbar_x; byUp = sbar.y; byDn = sbar.y + sbar.h - ui.but_h; fw = p.f_w[ppt.filterBy] + p.f_sw + 12; qx = ppt.margin; qy = (p.s_sp - ui.row_h * 0.6) / 2; qh = ui.row_h * 0.6;
            if (ui.sbarType != 2) {b_x -= 1; hot_o = byUp - p.s_h; scrollBtn_x = (ui.but_h - ui.scr_but_w) / 2; scrollUp_y = -ui.arrow_pad + byUp + (ui.but_h - 1 - ui.scr_but_w) / 2; scrollDn_y = ui.arrow_pad + byDn + (ui.but_h - 1 - ui.scr_but_w) / 2 ;}
        }
        if (ppt.sbarShow) {
            switch (ui.sbarType) {
                case 2:
                    this.btns.scrollUp = new Btn(b_x, byUp, ui.but_h, ui.but_h, 3, "", "", "", {normal: 1, hover: 2, down: 3}, sbar.scrollable_lines < 1, () => sbar.but(1), "", "", false, "scrollUp");
                    this.btns.scrollDn = new Btn(b_x, byDn, ui.but_h, ui.but_h, 3, "", "", "", {normal: 5, hover: 6, down: 7}, sbar.scrollable_lines < 1, () => sbar.but(-1), "", "", false, "scrollDn");
                    break;
                default:
                    this.btns.scrollUp = new Btn(b_x, byUp - hot_o, ui.but_h, ui.but_h + hot_o, 1, scrollBtn_x, scrollUp_y, ui.scr_but_w, "", sbar.scrollable_lines < 1, () => sbar.but(1), "", "", false, "scrollUp");
                    this.btns.scrollDn = new Btn(b_x, byDn, ui.but_h, ui.but_h + hot_o, 2, scrollBtn_x, scrollDn_y, ui.scr_but_w, "", sbar.scrollable_lines < 1, () => sbar.but(-1), "", "", false, "scrollDn");
                    break;
            }
        }
            if (ppt.searchShow) this.btns.s_img = new Btn(qx, qy, qh, qh, 4, "", "", "", {normal: s_img}, ppt.searchShow > 1 && p.s_txt, "", () => {let fn = fb.FoobarPath + "doc\\Query Syntax Help.html"; if (!s.file(fn)) fn = fb.FoobarPath + "Query Syntax Help.html"; s.browser("\"" + fn);}, "Open Query Syntax Help", true, "s_img");
            if (ppt.searchShow == 2) {
                this.btns.cross2 = new Btn(qx - bh * 0.2, by, bh, bh, 5, "", "", "", {normal: 85, hover: 192}, !p.s_txt, "", () => {sL.clear();}, "Clear Search Text", true, "cross2");
                this.btns.filter = new Btn(p.f_x1 - 12, 0, fw, p.s_sp, 6, p.filterBtnFont, "▼", "", {normal: !ui.local ? RGBA(ui.col.txt_filter[0], ui.col.txt_filter[1], ui.col.txt_filter[2], 153) : ui.col.txt_box, hover: RGBA(ui.col.txt_filter[0], ui.col.txt_filter[1], ui.col.txt_filter[2], 228)}, ppt.searchShow != 2, "", () => {men.button(p.f_x1, p.s_h); but.btns.filter.x = p.f_x1 - 12; but.btns.filter.w = p.f_w[ppt.filterBy] + p.f_sw + 12;}, "Filter", true, "filter");
            }
        if (ppt.searchShow == 1) this.btns.cross1 = new Btn(bx, by, bh, bh, 5, "", "", "", {normal: 85, hover: 192}, ppt.searchShow != 1, "", () => {sL.clear();}, "Clear Search Text");
        transition = new Transition(this.btns, v => v.state !== 'normal');
    }

    const Transition = function(items_arg, hover_predicate) {
        this.start = () => {
            const hover_in_step = 0.2, hover_out_step = 0.06;
            if (!transition_timer) {
                transition_timer = setInterval(() => {
                    Object.values(items).forEach(v => {
                        const saved = v.transition_factor;
                        if (hover(v)) v.transition_factor = Math.min(1, v.transition_factor += hover_in_step);
                        else v.transition_factor = Math.max(0, v.transition_factor -= hover_out_step);
                        if (saved !== v.transition_factor) v.repaint();
                    });
                    const running = Object.values(items).some(v => v.transition_factor > 0 && v.transition_factor < 1);
                    if (!running) this.stop();
                }, 25);
            }
        }
        this.stop = () => {
            if (transition_timer) {
                clearInterval(transition_timer);
                transition_timer = null;
            }
        }
    const items = items_arg, hover = hover_predicate; let transition_timer = null;
    }

    const Tooltip = function() {
        this.show = text => {if (Date.now() - tt_start > 2000) this.showDelayed(text); else this.showImmediate(text); tt_start = Date.now();}
        this.showDelayed = text => tt_timer.start(this.id, text);
        this.showImmediate = text => {tt_timer.set_id(this.id); tt_timer.stop(this.id); tt(text);}
        this.clear = () => tt_timer.stop(this.id);
        this.stop = () => tt_timer.force_stop();
        this.id = Math.ceil(Math.random().toFixed(8) * 1000);
        const tt_timer = TooltipTimer;
    }

    const TooltipTimer = new function() {
        let delay_timer, tt_caller = undefined;
        this.start = (id, text) => {
            const old_caller = tt_caller; tt_caller = id;
            if (!delay_timer && tooltip.Text) tt(text, old_caller !== tt_caller );
            else {
                this.force_stop();
                if (!delay_timer) {
                    delay_timer = setTimeout(() => {
                        tt(text);
                        delay_timer = null;
                    }, 500);
                }
            }
        }
        this.set_id = id => tt_caller = id;
        this.stop = id => {if (tt_caller === id) this.force_stop();}
        this.force_stop = () => {
            tt("");
            if (delay_timer) {
                clearTimeout(delay_timer);
                delay_timer = null;
            }
        }
    }

    const check_scrollBtns = (x, y, hover_btn) => {
            if (sbar.timer_but) {
               if ((this.btns["scrollUp"].down || this.btns["scrollDn"].down) && !this.btns["scrollUp"].trace(x, y) && !this.btns["scrollDn"].trace(x, y)) {
                    this.btns["scrollUp"].cs("normal"); this.btns["scrollDn"].cs("normal"); clearTimeout(sbar.timer_but); sbar.timer_but = false; sbar.count = -1;}
            } else if (hover_btn) scrBtns.forEach(v => {
                if (hover_btn.name == v && hover_btn.down) {this.btns[v].cs("down"); hover_btn.l_dn();}
            });
        }
}

function MenuItems() {
    const MenuMap = [], MF_GRAYED = 0x00000001, MF_SEPARATOR = 0x00000800, MF_STRING = 0x00000000;
    let expandable = false, i = 0, local = s.file("C:\\check_local\\1450343922.txt");
    this.treeExpandLimit = local ? 6000 : s.clamp(ppt.treeExpandLimit, 10, 6000); this.r_up = false;
    const newMenuItem = (index, type, value) => {MenuMap[index] = {}; MenuMap[index].type = type; MenuMap[index].value = value;};

	const baseTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; return Index;}
	const clickTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; const n = ["Select", "Send to Playlist", "Send to Playlist && Play", "Send to Playlist && Play [Add if Playing]", "Send to Playlist && Play [Add if Content]"]; n.forEach((v, i) => {newMenuItem(Index, "Click", i); Menu.AppendMenuItem(MF_STRING, Index, v); if (i == 2) Menu.AppendMenuItem(MF_SEPARATOR, 0, 0); Index++;}); Menu.CheckMenuRadioItem(StartIndex, Index, StartIndex + ppt.clickAction); return Index;}
    const configTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; const n = ["Panel Properties"]; if (ppt.syncType) n.push("Refresh"); if (vk.k('shift')) n.push("Configure..."); n.forEach((v, i) => {newMenuItem(Index, "Config", i); Menu.AppendMenuItem(MF_STRING, Index, v); Index++;}); return Index;}
	const doubleClickTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; const n = ["Expand / Collapse", "Send to Playlist && Play", "Send to Playlist"]; if (pop.autoPlay.click > 2) n.unshift("N/A With Dual Mode Single-Click Actions"); n.forEach((v, i) => {newMenuItem(Index, "DoubleClick", i); Menu.AppendMenuItem(pop.autoPlay.click < 3 ? MF_STRING : MF_GRAYED, Index, v); if (pop.autoPlay.click > 2 && i == 0) Menu.AppendMenuItem(MF_SEPARATOR, 0, 0); Index++;}); Menu.CheckMenuRadioItem(StartIndex, Index, StartIndex + ppt.dblClickAction + (pop.autoPlay.click < 3 ? 0 : 1)); return Index;}
	const itemCountsTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; const n = ["Hide", "# Tracks", "# Sub-Items"]; n.forEach((v, i) => {newMenuItem(Index, "ItemCounts", i); Menu.AppendMenuItem(MF_STRING, Index, v); Index++;}); Menu.CheckMenuRadioItem(StartIndex, Index, StartIndex + ppt.nodeCounts); return Index;}
	const keyTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; const n = ["Select", "Send to Playlist"]; n.forEach((v, i) => {newMenuItem(Index, "Key", i); Menu.AppendMenuItem(MF_STRING, Index, v); Index++;}); Menu.CheckMenuRadioItem(StartIndex, Index, StartIndex + ppt.keyAction); return Index;}
    const modeTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; const c = [ppt.autoCollapse, ppt.treeAutoExpand, false, ppt.fullLineSelection, ppt.nodeHighlight, pop.autoPlay.send, ppt.rememberTree, ppt.smooth, ppt.touchControl], n = ["Auto Collapse Nodes", "Auto Expand Tree if < " + ppt.autoExpandLimit + " Tracks", "Auto Expand Limit...", "Full Line Selection", "Highlight Nodes on Hover" + (ui.nodeWin ? ": N/A for Themed Nodes" : ""), "Play on Enter or Send from Menu", "Remember Tree State", "Smooth Scroll", "Touch Control", "Reset Zoom", "Reload"]; n.forEach((v, i) => {newMenuItem(Index, "Mode", i); Menu.AppendMenuItem(i != 4 || !ui.nodeWin ? MF_STRING : MF_GRAYED, Index, v); if (!i || i == 2 || i == 3 || i == 5 || i == 6 || i == 8) Menu.AppendMenuItem(MF_SEPARATOR, 0, 0); Menu.CheckMenuItem(Index++, c[i]);}); return Index;}
    const nowPlayingTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; newMenuItem(Index, "Nowplaying", 0); Menu.AppendMenuItem(pop.nowp != -1 ? MF_STRING : MF_GRAYED, Index, "Show Nowplaying"); Index++; return Index;}
    const playlistTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; const n = ["Send to Current Playlist" + "\tEnter", "Insert in Current Playlist" + "\tCtrl+Enter", "Add to Current Playlist" + "\tShift+Enter", "Copy" + "\tCtrl+C", "Collapse All", "Expand"]; for (i = 0; i < 6; i++) {newMenuItem(Index, "Playlist", i); Menu.AppendMenuItem(i < 3 && !plman.IsPlaylistLocked(plman.ActivePlaylist) || i == 3 || i == 4 || i == 5 && expandable ? MF_STRING : MF_GRAYED, Index, n[i]); if (i == 3) Menu.AppendMenuItem(MF_SEPARATOR, 0, 0); Index++;} return Index;}
	const rootNodeTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; const n = ["Hide", "All Music", "View Name"]; n.forEach((v, i) => {newMenuItem(Index, "RootNode", i); Menu.AppendMenuItem(MF_STRING, Index, v); Index++;}); Menu.CheckMenuRadioItem(StartIndex, Index, StartIndex + ppt.rootNode); return Index;}
	const showTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; const c = [ppt.sbarShow, pop.tooltip, ppt.showTracks, ppt.searchShow == 1, ppt.searchShow == 2, ppt.showNowplaying, ppt.rowStripes], n = ["Scrollbar", "Tooltips", "Tracks", "Search", "Search + Filter", "Nowplaying in Highlight", "Row Stripes"]; n.forEach((v, i) => {newMenuItem(Index, "Show", i); Menu.AppendMenuItem(MF_STRING, Index, v); if (i == 1 || i == 2 || i == 4 || i == 5) Menu.AppendMenuItem(MF_SEPARATOR, 0, 0); Menu.CheckMenuItem(Index++, c[i]);}); return Index;}
	const targetPlaylistTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; const c = [false, !ppt.sendPlaylist, !ppt.altClickPlaylist, !ppt.middleClickPlaylist], n = ["Set Default Playlist...", "Send to Current Playlist", "Add to Current Playlist [Alt + Click]", "Add to Current Playlist [Middle Click]"]; n.forEach((v, i) => {newMenuItem(Index, "TargetPlaylist", i); Menu.AppendMenuItem(MF_STRING, Index, v); if (i < 2) Menu.AppendMenuItem(MF_SEPARATOR, 0, 0); Menu.CheckMenuItem(Index++, c[i]);}); return Index;}
	const themeTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; const c = [!ppt.blurDark && !ppt.blurBlend && !ppt.blurLight && !ppt.imgBg, ppt.blurDark, ppt.blurBlend, ppt.blurLight, ppt.imgBg, ppt.swapCol, false], n = ["None", "Dark", "Blend", "Light", "Cover", "Swap Colours"]; n.forEach((v, i) => {newMenuItem(Index, "Theme", i); Menu.AppendMenuItem(MF_STRING, Index, v); if (i < 5) {Index++; if (c[i]) Menu.CheckMenuRadioItem(StartIndex + i, StartIndex + i, StartIndex + i);} else Menu.CheckMenuItem(Index++, c[i]); if (!i || i == 4) Menu.AppendMenuItem(MF_SEPARATOR, 0, 0);}); return Index;}
	const viewTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; p.menu.forEach((v, i) => {newMenuItem(Index, "View", i); Menu.AppendMenuItem(MF_STRING, Index, v); Index++; if (i == p.menu.length - 2) Menu.AppendMenuItem(MF_SEPARATOR, 0, 0);}); Menu.CheckMenuRadioItem(StartIndex, StartIndex + p.grp.length - 1, StartIndex + ppt.viewBy); return Index;}

    const filterMenu = (Menu, StartIndex) => {
        let Index = StartIndex;
        for (i = 0; i < p.f_menu.length + 1; i++) {newMenuItem(Index, "Filter", i); Menu.AppendMenuItem(MF_STRING, Index, i != p.f_menu.length ? (!i ? "No " : "") + p.f_menu[i] : "Always Reset Scroll"); if (i == p.f_menu.length) Menu.CheckMenuItem(Index++, ppt.reset); else Index++; if (i == p.f_menu.length - 1) Menu.AppendMenuItem(MF_SEPARATOR, 0, 0);}
        Menu.CheckMenuRadioItem(StartIndex, StartIndex + p.f_menu.length - 1, StartIndex + ppt.filterBy);
        return Index;
    }

    this.button = (x, y) => {
        const menu = window.CreatePopupMenu(); let idx, Index = 1; Index = filterMenu(menu, Index); idx = menu.TrackPopupMenu(x, y);
        if (idx >= 1 && idx <= Index) {
			i = MenuMap[idx].value; pop.subCounts.filter = {}; pop.subCounts.search = {};
			switch (i) {
				case p.f_menu.length: ppt.reset = !ppt.reset; if (ppt.reset) {p.search_paint(); lib.treeState(true, 2);} break;
				default: ppt.filterBy = i; p.calc_text(); p.search_paint(); if (!ppt.rememberTree && !ppt.reset) lib.logTree(); lib.getLibrary(); lib.rootNodes(!ppt.reset ? 1 : 0, true); ppt.set("SYSTEM.Filter By", ppt.filterBy); break;
			}
			pop.checkAutoHeight();
		}
    }

    const search = (Menu, StartIndex, b, f, paste) => {
        let Index = StartIndex; const n = ["Copy", "Cut", "Paste"];
        n.forEach((v, i) => {
            newMenuItem(Index, "Search", i);
            Menu.AppendMenuItem(b == f && i < 2 || i == 2 && !paste ? MF_GRAYED : MF_STRING, Index, v); Index++;
            if (i == 1) Menu.AppendMenuItem(MF_SEPARATOR, 0, 0);
        });
        return Index;
    }

    this.search_menu = (x, y, b, f, paste) => {
        const menu = window.CreatePopupMenu(); let idx, Index = 1; Index = search(menu, Index, b, f, paste); idx = menu.TrackPopupMenu(x, y);
        if (idx >= 1 && idx <= Index) {
            i = MenuMap[idx].value;
            switch (i) {
                case 0: sL.on_char(vk.copy); break;
                case 1: sL.on_char(vk.cut); break;
                case 2: sL.on_char(vk.paste, true); break;
            }
        }
    }

    this.rbtn_up = (x, y) => {
        this.r_up = true; const Context = fb.CreateContextMenuManager(), popupMenu = ["baseMenu", "clickMenu", "doubleClickMenu", "itemCountsMenu", "keyMenu", "menu", "modeMenu", "rootNodeMenu", "showMenu", "targetPlaylistMenu", "themeMenu", "viewMenu"]; let idx, Index = 1, items, show_context = false;
        popupMenu.forEach(v => this[v] = window.CreatePopupMenu());
        const ix = pop.get_ix(x, y, true, false), item = pop.tree[ix]; let nm = "", row = -1; expandable = false;
        if (y < sbar.item_y + pop.rows * ui.row_h && pop.tree.length > ix && ix != -1 && (x < Math.round(ppt.treeIndent * item.tr) + ui.icon_w + ppt.margin && (!item.track || ppt.rootNode && item.tr == 0) || pop.check_ix(item, x, y, true))) {
            if (!item.sel) {pop.clear(); item.sel = true;}
            pop.get_sel_items(); expandable = pop.tree[ix].item.length > this.treeExpandLimit || pop.tree[ix].track ? false : true;
            if (expandable && pop.tree.length) {
                let count = 0;
                pop.tree.forEach((v, m, arr) => {
                    if (m == ix || v.sel) {if (row == -1 || m < row) {row = m; nm = (v.tr ? arr[v.par].name : "") + v.name; nm = nm.toUpperCase();} count += v.item.length; expandable = count <= this.treeExpandLimit;}
                });
            }
            Index = playlistTypeMenu(this.menu, Index); this.menu.AppendMenuSeparator();
            show_context = true;
        }

        if (show_context) {
            if (ppt.showNowplaying) {Index = nowPlayingTypeMenu(this.viewMenu, Index); this.viewMenu.AppendMenuSeparator();}
            Index = viewTypeMenu(this.viewMenu, Index); this.viewMenu.AppendTo(this.menu, MF_STRING, "View");
            Index = baseTypeMenu(this.baseMenu, Index); this.baseMenu.AppendTo(this.menu, MF_STRING, "Options");
			this.menu.AppendMenuSeparator();
		} else {
			if (ppt.showNowplaying) {Index = nowPlayingTypeMenu(this.menu, Index); this.menu.AppendMenuSeparator();}
            Index = viewTypeMenu(this.menu, Index);
            this.menu.AppendMenuSeparator();
            Index = baseTypeMenu(this.baseMenu, Index); this.baseMenu.AppendTo(this.menu, MF_STRING, "Options");
		}
		Index = clickTypeMenu(this.clickMenu, Index); this.clickMenu.AppendTo(this.baseMenu, MF_STRING, "Single-Click Action");
		Index = doubleClickTypeMenu(this.doubleClickMenu, Index); this.doubleClickMenu.AppendTo(this.baseMenu, MF_STRING, "Double-Click Action");
		this.baseMenu.AppendMenuSeparator();
		Index = keyTypeMenu(this.keyMenu, Index); this.keyMenu.AppendTo(this.baseMenu, MF_STRING, "Keystroke Action");
		this.baseMenu.AppendMenuSeparator();
		Index = targetPlaylistTypeMenu(this.targetPlaylistMenu, Index); this.targetPlaylistMenu.AppendTo(this.baseMenu, MF_STRING, "Target Playlist");
		this.baseMenu.AppendMenuSeparator();
		Index = themeTypeMenu(this.themeMenu, Index); this.themeMenu.AppendTo(this.baseMenu, MF_STRING, "Theme");
		this.baseMenu.AppendMenuSeparator();
		Index = itemCountsTypeMenu(this.itemCountsMenu, Index); this.itemCountsMenu.AppendTo(this.baseMenu, MF_STRING, "Item Counts");
		Index = rootNodeTypeMenu(this.rootNodeMenu, Index); this.rootNodeMenu.AppendTo(this.baseMenu, MF_STRING, "Root Node");
		this.baseMenu.AppendMenuSeparator();
		Index = showTypeMenu(this.showMenu, Index); this.showMenu.AppendTo(this.baseMenu, MF_STRING, "Show");
		this.baseMenu.AppendMenuSeparator();
		Index = modeTypeMenu(this.modeMenu, Index); this.modeMenu.AppendTo(this.baseMenu, MF_STRING, "Mode");
		this.baseMenu.AppendMenuSeparator();
		Index = configTypeMenu(this.baseMenu, Index);
		if (show_context) {	
            items = pop.selected();
            Context.InitContext(items); Context.BuildMenu(this.menu, 5000);
		}

        idx = this.menu.TrackPopupMenu(x, y);
        if (idx >= 1 && idx <= Index) {
            i = MenuMap[idx].value;
            switch (MenuMap[idx].type) {
                case "Playlist":
                    switch (i) {
                        case 0: pop.load(pop.sel_items, true, false, pop.autoPlay.send, false, false); p.tree_paint(); lib.treeState(false, ppt.rememberTree); break;
                        case 3: fb.CopyHandleListToClipboard(items); lib.treeState(false, ppt.rememberTree); break;
                        case 4: pop.collapseAll(); break;
                        case 5: pop.expand(ix, nm); break;
                        default: pop.load(pop.sel_items, true, true, false, false, i == 1 ? true : false); lib.treeState(false, ppt.rememberTree); break;
                    }
                    break;
                case "Nowplaying": pop.nowPlayingShow(); break;
                case "View": p.set('view', i); break;
				case "Click": pop.setActions('click', i); break;
				case "DoubleClick": pop.setActions('dblClick', i); break;
				case "Key": pop.setActions('key', i); break;
				case "TargetPlaylist":
					switch (i) {
						case 0: let ns = utils.InputBox(window.ID, "Enter Playlist Name", "Default Playlist", ppt.libPlaylist); if (ns && ns != ppt.libPlaylist) ppt.libPlaylist = ns; break;
						case 1: ppt.sendPlaylist = !ppt.sendPlaylist; break;
                        case 2: ppt.altClickPlaylist = !ppt.altClickPlaylist; break;
						case 3: ppt.middleClickPlaylist = !ppt.middleClickPlaylist; break;
					}
					break;
				case "ItemCounts": p.set('itemCounts', i); break;
				case "RootNode": p.set('rootNode', i); break;
                case "Theme": if (i < 5) ui.chgBlur(i); else {ppt.swapCol = !ppt.swapCol; on_colours_changed(true);} break;
				case "Show":
                    switch (i) {
						case 0: p.toggle('scrollbar'); break;
                        case 1: p.toggle('tooltip'); break;
						case 2: p.toggle('showTracks'); break;
						case 3: p.toggle('search'); break;
						case 4: p.toggle('search+filter'); break;
						case 5: p.toggle('nowPlaying'); break;
						case 6: p.toggle('rowStripes'); break;
                    }
                    break;
				case "Mode":
                    switch (i) {
						case 0: ppt.autoCollapse = !ppt.autoCollapse; break;
						case 1: ppt.treeAutoExpand = !ppt.treeAutoExpand; lib.rootNodes(ppt.rememberTree, ppt.process); break;
						case 2: lib.setAutoExpandLimit(); break;
						case 3: p.toggle('fullLineSelection'); break;
						case 4: p.toggle('nodeHighlight'); on_colours_changed(); break;
						case 5: pop.setActions('send'); break;
						case 6: ppt.rememberTree = ppt.rememberTree ? 0 : 1; break;
						case 7: ppt.smooth = !ppt.smooth; break;
						case 8: ppt.touchControl = !ppt.touchControl; break;
						case 9: p.resetZoom(); break;
						case 10: window.Reload(); break;
                    }
                    break;
                case "Config":
                    switch (i) {
                        case 0: window.ShowProperties(); break;
                        case 1: ppt.syncType ? lib.treeState(false, 2) : window.ShowConfigure(); break;
                        case 2: if (ppt.syncType) window.ShowConfigure(); break;
                    }
                    break;
                }
            }
            if (idx >= 5000 && idx <= 5800) {show_context && Context.ExecuteByID(idx - 5000);}
            this.r_up = false;
    }
}

function Timers() {
    const timerArr = ["cursor", "jsearch1", "jsearch2", "search", "tt"];
    timerArr.forEach(v => this[v] = {id: null});
    this.clear = timer => {if (timer) clearTimeout(timer.id); timer.id = null;}
    this.lib = () => {setTimeout(() => {if ((ui.w < 1 || !window.IsVisible) && ppt.rememberTree) lib.init = true; lib.getLibrary(); lib.rootNodes(ppt.rememberTree, ppt.process);}, 5);}
    this.tooltip = () => {this.clear(this.tt); this.tt.id = setTimeout(() => {pop.deactivate_tooltip(); this.tt.id = null;}, 5000);}
}
timer.lib();

function on_char(code) {pop.on_char(code); jS.on_char(code); if (!ppt.searchShow) return; sL.on_char(code);}
function on_focus(is_focused) {if (!is_focused) {timer.clear(timer.cursor); p.s_cursor = false; p.search_paint();} pop.on_focus(is_focused);}
function on_get_album_art_done(handle, art_id, image, image_path) {ui.get_album_art_done(handle, image, image_path);}
function on_metadb_changed() {if (!ui.blur && !ppt.imgBg || ui.block()) return; ui.on_playback_new_track();}
function on_item_focus_change() {if (fb.IsPlaying || !ui.blur && !ppt.imgBg) return; if (ui.block()) ui.get = true; else {ui.get = false; ui.focus_changed();}}
function on_key_down(vkey) {pop.on_key_down(vkey);if (!ppt.searchShow) return; sL.on_key_down(vkey);}
function on_key_up(vkey) {if (!ppt.searchShow) return; sL.on_key_up(vkey)}
function on_library_items_added(handleList) {if (ppt.syncType) return; lib.treeState(false, 2, handleList, 0);}
function on_library_items_removed(handleList) {if (ppt.syncType) return; lib.treeState(false, 2, handleList, 2);}
function on_library_items_changed(handleList) {if (ppt.syncType) return; lib.treeState(false, 2, handleList, 1);}
function on_main_menu(index) {pop.on_main_menu(index);}
function on_mouse_lbtn_dblclk(x, y) {but.lbtn_dn(x, y); pop.lbtn_dblclk(x, y); sbar.lbtn_dblclk(x, y);}
function on_mouse_lbtn_down(x, y) {if (ppt.touchControl) p.last_pressed_coord = {x: x, y: y}; if (ppt.searchShow || ppt.sbarShow) but.lbtn_dn(x, y); if (ppt.searchShow) sL.lbtn_dn(x, y); pop.lbtn_dn(x, y); sbar.lbtn_dn(x, y); ui.y_start = y;}
function on_mouse_lbtn_up(x, y) {pop.lbtn_up(x, y); if (ppt.searchShow) sL.lbtn_up(); but.lbtn_up(x, y); sbar.lbtn_up(x, y);}
function on_mouse_leave() {if (ppt.searchShow || ppt.sbarShow) but.leave(); sbar.leave(); pop.leave();}
function on_mouse_mbtn_up(x, y) {pop.mbtn_up(x, y);}
function on_mouse_move(x, y) {if (p.m_x == x && p.m_y == y) return; if (ppt.searchShow || ppt.sbarShow) but.move(x, y); if (ppt.searchShow) sL.move(x, y); pop.move(x, y); pop.dragDrop(x, y); sbar.move(x, y); ui.dragZoom(x, y); p.m_x = x; p.m_y = y;}
function on_mouse_rbtn_up(x, y) {if (y < p.s_h && x > p.s_x && x < p.s_x + p.s_w2) {if (ppt.searchShow) sL.rbtn_up(x, y);} else men.rbtn_up(x, y); return true;}
function on_mouse_wheel(step) {if (!vk.k('zoom')) sbar.wheel(step); else ui.wheel(step);}
function on_notify_data(name, info) {switch (name) {case "!!.tags update": lib.treeState(false, 2); break;} if (ui.local) on_notify(name, info);}
function on_paint(gr) {ui.draw(gr); lib.checkTree(); if (ppt.searchShow) sL.draw(gr); pop.draw(gr); if (ppt.sbarShow) sbar.draw(gr); if (ppt.searchShow || ppt.sbarShow) but.draw(gr); jS.draw(gr);}
function on_playback_new_track(handle) {lib.checkFilter(); pop.getNowplaying(handle); ui.on_playback_new_track(handle);}
function on_playback_stop(reason) {if (reason == 2) return; pop.getNowplaying("", true); on_item_focus_change();}
function on_playlist_items_added() {on_item_focus_change();}
function on_playlist_items_removed() {on_item_focus_change();}
function on_playlist_switch() {on_item_focus_change();}
function on_script_unload() {but.on_script_unload();}
function on_size(w, h) {ui.w = w; ui.h = h; if (!ui.w || !ui.h) return; ui.blurReset(); ui.get_font(); p.on_size(); pop.create_tooltip(); if (ppt.searchShow || ppt.sbarShow) but.refresh(true); jS.on_size();}
function RGB(r, g, b) {return 0xff000000 | r << 16 | g << 8 | b;}
function RGBA(r, g, b, a) {return a << 24 | r << 16 | g << 8 | b;}
function StringFormat() {
    const a = arguments, flags = 0; let h_align = 0, v_align = 0, trimming = 0;
    switch (a.length) {case 3: trimming = a[2]; case 2: v_align = a[1]; case 1: h_align = a[0]; break; default: return 0;}
    return (h_align << 28 | v_align << 24 | trimming << 20 | flags);
}

if (!ppt.get("SYSTEM.Software Notice Checked", false)) fb.ShowPopupMessage("THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS \"AS IS\" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE AUTHORS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.", "Library Tree"); ppt.set("SYSTEM.Software Notice Checked", true);