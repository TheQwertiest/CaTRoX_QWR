include('lodash.min.js');

'use strict';

Array.prototype.srt=function(){for(var z=0,t;t=this[z];z++){this[z]=[];var x=0,y=-1,n=true,i,j;while(i=(j=t.charAt(x++)).charCodeAt(0)){var m=(i==46||(i>=48&&i<=57));if(m!==n){this[z][++y]='';n=m;}
this[z][y]+=j;}}
this.sort(function(a,b){for(var x=0,aa,bb;(aa=a[x])&&(bb=b[x]);x++){aa=aa.toLowerCase();bb=bb.toLowerCase();if(aa!==bb){var c=Number(aa),d=Number(bb);if(c==aa&&d==bb){return c-d;}else return(aa>bb)?1:-1;}}
return a.length-b.length;});for(var z=0;z<this.length;z++)
this[z]=this[z].join('');};

g_callbacks = {
    /**
     * @param {string} event_name
     * @param {...*} var_args
     */
    invoke: function(event_name, var_args) {
        this.validate_event_name(event_name);

        var callbacks = this[event_name];
        if (!callbacks || !_.isArray(callbacks)) {
            return;
        }

        var args = _.drop([].slice.call(arguments));
        _.over(callbacks)(args);
    },
    register: function(event_name, callback) {
        if (!_.isFunction(callback)) {
            throw Error('Type Error: callback is not a function');
        }

        this.validate_event_name(event_name);

        if (!this[event_name]) {
            this[event_name] = [];
        }
        this[event_name].push(callback);
    },
    validate_event_name: function(event_name) {
        if (!_.isString(event_name)) {
            throw Error('Type Error: event name is not a string');
        }

        if (event_name === 'invoke'
            || event_name === 'register'
            || event_name === 'unregister') {
            throw Error('Argument Error: event name is occupied "' + event_name + '"');
        }
    }
};

function on_script_unload() {
    g_callbacks.invoke('on_script_unload');
}

function _alpha_timer(items_arg, hover_predicate_arg) {
    this.start = () => {
        var hover_in_step = 50;
        var hover_out_step = 15;

        if (!alpha_timer_internal) {
            alpha_timer_internal = window.SetInterval(_.bind(function () {
                _.forEach(items, function (item) {
                    var saved_alpha = item.hover_alpha;
                    if (hover_predicate(item)) {
                        item.hover_alpha = Math.min(255, item.hover_alpha += hover_in_step);
                    }
                    else {
                        item.hover_alpha = Math.max(0, item.hover_alpha -= hover_out_step);
                    }

                    if (saved_alpha !== item.hover_alpha) {
                        item.repaint();
                    }
                });

                var alpha_in_progress = _.some(items, function (item) {
                    return item.hover_alpha > 0 && item.hover_alpha < 255;
                });

                if (!alpha_in_progress) {
                    this.stop();
                }
            }, this), 25);
        }
    }

    this.stop = () => {
        if (alpha_timer_internal) {
            window.ClearInterval(alpha_timer_internal);
            alpha_timer_internal = null;
        }
    };

    var alpha_timer_internal = null;
    var items = items_arg;
    var hover_predicate = hover_predicate_arg;
}
function _artistFolder(artist) {
    const a = _fbSanitise(artist);
    let folder = folders.artists + a;
    if (utils.IsDirectory(folder)) {
        return fso.GetFolder(folder) + '\\';
    }
    else {
        folder = folders.artists + _.truncate(a, {
            'length': 64
        });
        _createFolder(folder);
        return fso.GetFolder(folder) + '\\';
    }
}
function _blendColours(c1, c2, f) {
    c1 = _toRGB(c1);
    c2 = _toRGB(c2);
    const r = Math.round(c1[0] + f * (c2[0] - c1[0]));
    const g = Math.round(c1[1] + f * (c2[1] - c1[1]));
    const b = Math.round(c1[2] + f * (c2[2] - c1[2]));
    return _RGB(r, g, b);
}
/** @constructor */
function _button(x, y, w, h, img_src, fn, tiptext) {
    this.paint = (gr, alpha) => {
        if (this.state !== "pressed") {
            var hoverAlpha = !_.isNil(alpha) ? Math.min(this.hover_alpha, alpha) : this.hover_alpha;
            if (this.img_normal) {
                _drawImage(gr, this.img_normal, this.x, this.y, this.w, this.h, undefined, undefined, alpha);
            }
            if (this.img_hover) {
                _drawImage(gr, this.img_hover, this.x, this.y, this.w, this.h, undefined, undefined, hoverAlpha);
            }
        }
        else {
            if (this.img_pressed) {
                _drawImage(gr, this.img_pressed, this.x, this.y, this.w, this.h, undefined, undefined, alpha);
            }
        }
    }

    this.repaint = () => {
        const expXY = 2,
            expWH = expXY * 2;

        window.RepaintRect(this.x - expXY, this.y - expXY, this.w + expWH, this.h + expWH);
    }

    this.trace = (x, y) => {
        return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h;
    }

    this.lbtn_up = (x, y) => {
        if (this.fn) {
            this.fn(x, y, this.x, this.y, this.h, this.w);
        }
    }

    this.cs = (s) => {
        this.state = s;
        if (s === "pressed" || s === "normal") {
            this.tt.clear();
        }
        this.repaint();
    }

    this.set_image = (img_src) => {
        this.img_normal = _.isString(img_src.normal) ? _img(img_src.normal) : img_src.normal;
        this.img_hover = img_src.hover ? (_.isString(img_src.hover) ? _img(img_src.hover) : img_src.hover) : this.img_normal;
        this.img_pressed = img_src.pressed ? (_.isString(img_src.pressed) ? _img(img_src.pressed) : img_src.pressed) : this.img_normal;
    }

    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.fn = fn;
    this.tt = new _tt_handler;
    this.tiptext = tiptext;
    this.img_normal = undefined;
    this.img_hover = undefined;
    this.img_pressed = undefined;
    this.hover_alpha = 0;
    this.state = "normal";
    this.hide = false;

    this.set_image(img_src);
}
/** @constructor */
function _buttons() {
    this.reset = () => {
        alpha_timer.stop();
    };

    this.paint = (gr, alpha) => {
        _.forEach(this.buttons, (item) => {
            if (!item.hide) {
                item.paint(gr, alpha);
            }
        });
    }

    this.move = (x, y) => {
        var hover_btn = _.find(this.buttons, (item) => {
            return item.trace(x, y);
        });

        if (hover_btn && hover_btn.hide) {// Button is hidden, ignore
            if (cur_btn) {
                cur_btn.cs("normal");
                alpha_timer.start();
            }
            cur_btn = null;
            return null;
        }

        if (cur_btn === hover_btn) {// Same button
            return cur_btn;
        }

        if (cur_btn) {// Return prev button to normal state
            cur_btn.cs("normal");
            alpha_timer.start();
        }

        if (hover_btn) {// Select current button
            hover_btn.cs("hover");
            if (this.show_tt) {
                hover_btn.tt.showDelayed(hover_btn.tiptext);
            }
            alpha_timer.start();
        }

        cur_btn = hover_btn;
        return cur_btn;
    }

    this.leave = () => {
        if (cur_btn) {
            cur_btn.cs("normal");
            if (!cur_btn.hide) {
                alpha_timer.start();
            }
        }
        cur_btn = null;
    }

    this.lbtn_down = (x, y) => {
        if (!cur_btn) {
            // Needed when pressing on button with context menu open
            this.move(x, y);
        }

        if (!cur_btn || cur_btn.hide) {
            return false;
        }

        cur_btn.cs("pressed");
        return true;
    }

    this.lbtn_up = (x, y) => {
        if (!cur_btn || cur_btn.hide || cur_btn.state !== "pressed") {
            return false;
        }

        if (cur_btn.trace(x, y)) {
            cur_btn.cs("hover");
        }
        cur_btn.lbtn_up(x, y);

        return true;
    }

    this.buttons = {};
    this.show_tt = false;

    var that = this;

    var cur_btn = null;
    var alpha_timer = new _alpha_timer(that.buttons, (item) => {
        return item.state !== 'normal';
    });
}

function _cc(name) {
    return utils.CheckComponent(name, true);
}

function _chrToImg(chr, colour, font) {
    const size = 96;
    let temp_bmp = gdi.CreateImage(size, size);
    let temp_gr = temp_bmp.GetGraphics();
    temp_gr.SetTextRenderingHint(4);
    temp_gr.DrawString(chr, font || fontawesome, colour, 0, 0, size, size, SF_CENTRE);
    temp_bmp.ReleaseGraphics(temp_gr);
    temp_gr = null;
    return temp_bmp;
}

function _count(collection, predicate) {
    var count = 0;
    collection.forEach(function (item) {
        if (predicate(item)) {
            ++count;
        }
    });

    return count;
}

function _createFolder(folder, is_recursive) {
    if (utils.IsDirectory(folder)) {
        return;
    }
    
    if (is_recursive) {
        let parent_path = fso.GetParentFolderName(folder);
        if (!utils.IsDirectory(parent_path)) {
            _createFolder(parent_path, true);
        }
    }
    
    fso.CreateFolder(folder)
}

function _deleteFile(file) {
    if (utils.IsFile(file)) {
        try {
            fso.DeleteFile(file);
        } catch (e) {
        }
    }
}

function _drawImage(gr, img, src_x, src_y, src_w, src_h, aspect, border, alpha) {
    if (!img) {
        return [];
    }
    gr.SetInterpolationMode(InterpolationMode.HighQualityBicubic);

    let dst_w = 0;
    let dst_h = 0;
    let dst_x = 0;
    let dst_y = 0;
    switch (aspect) {
        case image.crop:
        case image.crop_top:
            if (img.Width / img.Height < src_w / src_h) {
                dst_w = img.Width;
                dst_h = Math.round(src_h * img.Width / src_w);
                dst_x = 0;
                dst_y = Math.round((img.Height - dst_h) / (aspect === image.crop_top ? 4 : 2));
            }
            else {
                dst_w = Math.round(src_w * img.Height / src_h);
                dst_h = img.Height;
                dst_x = Math.round((img.Width - dst_w) / 2);
                dst_y = 0;
            }
            break;
        case image.stretch:
            dst_x = 0;
            dst_y = 0;
            dst_w = img.Width;
            dst_h = img.Height;
            break;
        case image.centre:
        default:
            let s = Math.min(src_w / img.Width, src_h / img.Height);
            let w = Math.floor(img.Width * s);
            let h = Math.floor(img.Height * s);
            src_x += Math.round((src_w - w) / 2);
            src_y += Math.round((src_h - h) / 2);
            src_w = w;
            src_h = h;

            dst_x = 0;
            dst_y = 0;
            dst_w = img.Width;
            dst_h = img.Height;
            break;
    }
    if (_.isNil(aspect)) {
        gr.DrawImage(img, src_x, src_y, src_w, src_h, dst_x, dst_y, dst_w, dst_h, 0, _.isNil(alpha) ? 255 : alpha);
    }
    else {
        gr.DrawImage(img, src_x, src_y, src_w, src_h, dst_x + 5, dst_y + 5, dst_w - 10, dst_h - 10, 0, _.isNil(alpha) ? 255 : alpha);
    }
    if (border) {
        gr.DrawRect(src_x, src_y, src_w - 1, src_h - 1, 1, border);
    }
    return [src_x, src_y, src_w, src_h];
}

function _drawOverlay(gr, x, y, w, h) {
    gr.FillGradRect(x, y, w, h, 90, _RGBA(0, 0, 0, 230), _RGBA(0, 0, 0, 200));
}

function _explorer(file) {
    if (utils.IsFile(file)) {
        WshShell.Run('explorer /select,' + _q(file));
    }
}

function _fbDate(ts) {
    const offset = new Date().getTimezoneOffset() * 60;
    if (typeof t == 'number') {
        t -= offset;
        const tmp = new Date(t * 1000).toISOString(); // ES5 only
        return tmp.substring(0, 10) + ' ' + tmp.substring(11, 19);
    } else {
        const tmp = new Date(t.substring(0, 10) + "T" + t.substring(11, 19) + "Z");
        return (Date.parse(tmp) / 1000) + offset;
    }
}

function _fbEscape(value) {
    return value.replace(/'/g, "''").replace(/[\(\)\[\],$]/g, "'$&'");
}

function _fbSanitise(value) {
    return value.replace(/[\/\\|:]/g, '-').replace(/\*/g, 'x').replace(/"/g, "''").replace(/[<>]/g, '_').replace(/\?/g, '').replace(/(?! )\s/g, '');
}

function _fileExpired(file, period) {
    return _.now() - _lastModified(file) > period;
}

function _formatNumber(number, separator) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

function _gdiFont(name, size, style) {
    return gdi.Font(name, _scale(size), style);
}

function _getClipboardData() {
    return doc.parentWindow.clipboardData.getData('Text');
}

function _getElementsByTagName(value, tag) {
    doc.open();
    let div = doc.createElement('div');
    div.innerHTML = value;
    let data = div.getElementsByTagName(tag);
    doc.close();
    return data;
}

function _getExt(path) {
	return path.split('.').pop().toLowerCase();
}

function _getFiles(folder, exts, newest_first) {
	let files = [];
	if (utils.IsDirectory(folder)) {
		for (let file of fso.GetFolder(folder).Files) {
			files.push(file.Path);
		}
	}
	if (exts) {
		files = _.filter(files, (item) => {
			let ext = _getExt(item);
			return exts.includes(ext);
		});
	}
	if (newest_first) {
		return _.orderBy(files, (item) => {
			return _lastModified(item);
		}, 'desc');
	} else {
		files.srt();
		return files;
	}
}

function _hacks() {
    this.disable = () => {
        this.uih.MainMenuState = this.MainMenuState.Show;
        this.uih.FrameStyle = this.FrameStyle.Default;
        this.uih.StatusBarState = true;
    }

    this.enable = () => {
        this.uih.MainMenuState = this.MainMenuState.Hide;
        this.uih.FrameStyle = this.FrameStyle.NoBorder;
        this.uih.StatusBarState = false;
    }

    this.set_caption = (x, y, w, h) => {
        this.uih.SetPseudoCaption(x, y, w, h);
    }

    this.MainMenuState = {
        Show: 0,
        Hide: 1,
        Auto: 2
    };
    this.FrameStyle = {
        Default:      0,
        SmallCaption: 1,
        NoCaption:    2,
        NoBorder:     3
    };
    this.MoveStyle = {
        Default: 0,
        Middle:  1,
        Left:    2,
        Both:    3
    };

    this.uih = new ActiveXObject('UIHacks');
    this.uih.MoveStyle = this.MoveStyle.Default;
    this.uih.DisableSizing = false;
    this.uih.BlockMaximize = false;
    this.uih.MinSize = false;
    this.uih.MaxSize = false;
}

function _help(x, y, flags) {
    let m = window.CreatePopupMenu();
    _.forEach(ha_links,  (item, i) => {
        m.AppendMenuItem(MF_STRING, i + 100, item[0]);
        if (i === 1) {
            m.AppendMenuSeparator();
        }
    });
    m.AppendMenuSeparator();
    m.AppendMenuItem(MF_STRING, 1, 'Configure...');
    const idx = m.TrackPopupMenu(x, y, flags);
    switch (true) {
        case idx === 0:
            break;
        case idx === 1:
            window.ShowConfigure();
            break;
        default:
            _run(ha_links[idx - 100][1]);
            break;
    }
}

function _img(value) {
    if (utils.IsFile(value)) {
        return gdi.Image(value);
    }
    else {
        return gdi.Image(folders.images + value);
    }
}

function _input(prompt, title, value) {
    var tmp = _input_cancellable(prompt, title, value);
    return _.isString(tmp) ? tmp : value;
}

function _input_cancellable(prompt, title, value) {
    var p = prompt.replace(/"/g, _q(' + Chr(34) + ')).replace(/\n/g, _q(' + Chr(13) + '));
    var t = title.replace(/"/g, _q(' + Chr(34) + '));
    var v = value.replace(/"/g, _q(' + Chr(34) + '));
    var tmp = vb.Eval('InputBox(' + _q(p) + ', ' + _q(t) + ', ' + _q(v) + ')');
    return _.isString(tmp) ? tmp.trim() : tmp;
}

/**
 * @param a
 * @param b
 * @return {boolean} a instanceof b
 */
function _isInstanceOf(a, b) {
    return (a instanceof b);
}

function _isUUID(value) {
    const re = /^[0-9a-f]{8}-[0-9a-f]{4}-[345][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    return re.test(value);
}

function _jsonParse(value) {
    try {
        return JSON.parse(value);
    } catch (e) {
        return [];
    }
}

function _jsonParseFile(file) {
    return _jsonParse(_open(file));
}

function _lastModified(file) {
    return Date.parse(fso.GetFile(file).DateLastModified);
}

function _lineWrap(value, font, width) {
    let temp_bmp = gdi.CreateImage(1, 1);
    let temp_gr = temp_bmp.GetGraphics();
    let result = [];
    _.forEach(value.split('\n'), (paragraph) => {
        let lines = _.filter(temp_gr.EstimateLineWrap(paragraph, font, width), (item, i) => {
            return i % 2 === 0;
        });
        result.push.apply(result, _.map(lines, _.trim));
    });
    temp_bmp.ReleaseGraphics(temp_gr);
    return result;
}

function _lockSize(w, h) {
    window.MinWidth = window.MaxWidth = w;
    window.MinHeight = window.MaxHeight = h;
}

function _menu(x, y, flags) {
	let menu = window.CreatePopupMenu();
	let file = new _main_menu_helper('File', 1000, menu);
	let edit = new _main_menu_helper('Edit', 2000, menu);
	let view = new _main_menu_helper('View', 3000, menu);
	let playback = new _main_menu_helper('Playback', 4000, menu);
	let library = new _main_menu_helper('Library', 5000, menu);
	let help = new _main_menu_helper('Help', 6000, menu);
	
	let idx = menu.TrackPopupMenu(x, y, flags);
	switch (true) {
	case idx == 0:
		break;
	case idx < 2000:
		file.mm.ExecuteByID(idx - 1000);
		break;
	case idx < 3000:
		edit.mm.ExecuteByID(idx - 2000);
		break;
	case idx < 4000:
		view.mm.ExecuteByID(idx - 3000);
		break;
	case idx < 5000:
		playback.mm.ExecuteByID(idx - 4000);
		break;
	case idx < 6000:
		library.mm.ExecuteByID(idx - 5000);
		break;
	case idx < 7000:
		help.mm.ExecuteByID(idx - 6000);
		break;
	}
}

function _main_menu_helper(name, base_id, main_menu) {
	this.popup = window.CreatePopupMenu();
	this.mm = fb.CreateMainMenuManager();
	this.mm.Init(name);
	this.mm.BuildMenu(this.popup, base_id, -1);
	this.popup.AppendTo(main_menu, MF_STRING, name);
}

function _menu_item(x, y, name, flags) {
    var menuManager = fb.CreateMainMenuManager();

    var menu = window.CreatePopupMenu();
    if (name) {

        menuManager.Init(name);
        menuManager.BuildMenu(menu, 1, 128);

        var idx = menu.TrackPopupMenu(x, y, flags);

        if (idx > 0) {
            menuManager.ExecuteByID(idx - 1);
        }
    }

}

function _open(file) {
    return utils.ReadTextFile(file);
}

function _p(a, b) {
	Object.defineProperty(this, _.isBoolean(b) ? 'enabled' : 'value', {
		get() {
			return this.b;
		},
		set(value) {
			this.b = value;
			window.SetProperty(this.a, this.b);
		}
	});

	this.toggle = () => {
		this.b = !this.b;
		window.SetProperty(this.a, this.b);
	}

	this.a = a;
	this.b = window.GetProperty(a, b);
}

function _q(value) {
    return '"' + value + '"';
}
function _recycleFile(file) {
    if (utils.IsFile(file)) {
        app.NameSpace(10).MoveHere(file);
    }
}

/**
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @return {number}
 */
function _RGB(r, g, b) {
    return 0xFF000000 | r << 16 | g << 8 | b;
}

/**
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @param {number} a
 * @return {number}
 */
function _RGBA(r, g, b, a) {
    return a << 24 | r << 16 | g << 8 | b;
}

/**
 * @param {number} rgb
 * @param {number} a
 * @return {number}
 */
function _RGBtoRGBA(rgb, a) {
    return a << 24 | (rgb & 0x00FFFFFF);
}

function _run() {
    try {
        WshShell.Run(_.map(arguments, _q).join(' '));
        return true;
    } catch (e) {
        return false;
    }
}
function _runCmd(command, wait, show) {
    try {
        WshShell.Run(command, show ? 1 : 0, !_.isNil(wait) ? wait : false);
        return true;
    } catch (e) {
        return false;
    }
}

function _save(file, value) {
    if (_.isNil(value) || !utils.IsDirectory(utils.SplitFilePath(file)[0])) {
        return false;
    }
    if (!utils.WriteTextFile(file, value)) {
        console.log('Error saving to ' + file);
        return false;
    }
    
    return true;
}

function _sb(t, x, y, w, h, v, fn) {
    this.paint = (gr, colour) =>{
        gr.SetTextRenderingHint(4);
        if (this.v()) {
            gr.DrawString(this.t, this.font, colour, this.x, this.y, this.w, this.h, SF_CENTRE);
        }
    }

    this.trace = (x, y) =>{
        return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h && this.v();
    }

    this.move = (x, y) =>{
        if (this.trace(x, y)) {
            window.SetCursor(IDC_HAND);
            return true;
        }
        else {
            //window.SetCursor(IDC_ARROW);
            return false;
        }
    }

    this.lbtn_up = (x, y) =>{
        if (this.trace(x, y)) {
            if (this.fn) {
                this.fn(x, y);
            }
            return true;
        }
        else {
            return false;
        }
    }

    this.t = t;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.v = v;
    this.fn = fn;
    this.font = gdi.Font('FontAwesome', this.h);
}

function _setClipboardData(value) {
    doc.parentWindow.clipboardData.setData('Text', value.toString());
}

function _scale(size) {
    return Math.round(size * DPI / 72);
}

function _shortPath(file) {
    return fso.GetFile(file).ShortPath;
}

function _splitRGB(c) {
    let tmp = c.split('-');
    if (tmp.length === 4) {
        return _RGBA(tmp[0], tmp[1], tmp[2], tmp[3]);
    }
    else {
        return _RGB(tmp[0], tmp[1], tmp[2]);
    }
}
function _stripTags(value) {
    doc.open();
    let div = doc.createElement('div');
    div.innerHTML = value.toString().replace(/<[Pp][^>]*>/g, '').replace(/<\/[Pp]>/g, '<br>').replace(/\n/g, '<br>');
    const tmp = _.trim(div.innerText);
    doc.close();
    return tmp;
}

function _tagged(value) {
    return value !== '' && value !== '?';
}

function _textWidth(value, font) {
    let temp_bmp = gdi.CreateImage(1, 1);
    let temp_gr = temp_bmp.GetGraphics();
    const width = temp_gr.CalcTextWidth(value, font);
    temp_bmp.ReleaseGraphics(temp_gr);
    return width;
}

function _tf(t, metadb) {
    if (!metadb) {
        return '';
    }
    let tfo = fb.TitleFormat(t);
    return tfo.EvalWithMetadb(metadb);
}

function _tfe(t, force) {
    let tfo = fb.TitleFormat(t);
    return tfo.Eval(force);
}

function _toDb(volume) {
    return 50 * Math.log(0.99 * volume + 0.01) / Math.LN10;
}

function _toRGB(a) {
    const b = a - 0xFF000000;
    return [b >> 16, b >> 8 & 0xFF, b & 0xFF];
}

function _toVolume(db) {
    if (db === -100) {
        return 0;
    }

    return Math.ceil(Math.pow(10.0, (100 + db) / 50));
}

/**
 * Note: Mutates array argument
 *
 * @param {Array} array
 * @param {Number} count
 * @param {boolean} fromStart
 */
function _trimArray(array, count, fromStart) {
    if (array.length === count) {
        array.length = 0;
        return;
    }

    /// Length deduction is much faster then _.drop or slice, since it does not create a new array
    if (fromStart) {
        array.reverse();
        array.length -= count;
        array.reverse();
    }
    else {
        array.length -= count;
    }
}

function _ts() {
    return Math.floor(_.now() / 1000);
}

function _tt(value, force) {
    let tt = window.Tooltip
    if (tt.Text !== _.toString(value) || force) {
        tt.Text = value;
        tt.Activate();
    }
}

/** @constructor */
function _tt_handler() {
    this.showDelayed = function (text) {
        tt_timer.start(this.id, text);
    };
    this.showImmediate = function (text) {
        tt_timer.stop(this.id);
        _tt(text);
    };
    this.clear = function () {
        tt_timer.stop(this.id);
    };
    this.stop = function () {
        tt_timer.force_stop();
    };
    this.id = Math.ceil(Math.random().toFixed(8) * 1000);

    var tt_timer = _tt_handler.tt_timer;
}

_tt_handler.tt_timer = new function () {
    var tooltip_timer;
    var tt_caller = undefined;

    this.start = function (id, text) {
        let old_caller = tt_caller;
        tt_caller = id;

        if (!tooltip_timer && window.Tooltip.Text) {
            _tt(text, old_caller !== tt_caller );
        }
        else {
            this.force_stop(); /// < There can be only one tooltip present at all times, so we can kill the timer w/o any worries

            if (!tooltip_timer) {
                tooltip_timer = window.SetTimeout(_.bind(function () {
                    _tt(text);
                    tooltip_timer = null;
                }, this), 500);
            }
        }
    };

    this.stop = function (id) {
        if (tt_caller === id) {// Do not stop other callers
            this.force_stop();
        }
    };

    this.force_stop = function () {
        _tt("");
        if (tooltip_timer) {
            window.ClearTimeout(tooltip_timer);
            tooltip_timer = null;
        }
    };
};

g_callbacks.register('on_script_unload', function(){_tt('');});

let doc = new ActiveXObject('htmlfile');
let app = new ActiveXObject('Shell.Application');
let WshShell = new ActiveXObject('WScript.Shell');
let fso = new ActiveXObject('Scripting.FileSystemObject');

var vb = new ActiveXObject('ScriptControl');
vb.Language = 'VBScript';

const DT_LEFT = 0x00000000;
const DT_CENTER = 0x00000001;
const DT_RIGHT = 0x00000002;
const DT_VCENTER = 0x00000004;
const DT_WORDBREAK = 0x00000010;
const DT_CALCRECT = 0x00000400;
const DT_NOPREFIX = 0x00000800;
const DT_END_ELLIPSIS = 0x00008000;

const LEFT = DT_VCENTER | DT_END_ELLIPSIS | DT_CALCRECT | DT_NOPREFIX;
const RIGHT = DT_VCENTER | DT_RIGHT | DT_END_ELLIPSIS | DT_CALCRECT | DT_NOPREFIX;
const CENTRE = DT_VCENTER | DT_CENTER | DT_END_ELLIPSIS | DT_CALCRECT | DT_NOPREFIX;
const SF_CENTRE = 285212672;

// Mask for mouse callbacks
const MK_LBUTTON = 0x0001;
const MK_RBUTTON = 0x0002;
const MK_SHIFT = 0x0004; // The SHIFT key is down.
const MK_CONTROL = 0x0008; // The CTRL key is down.
const MK_MBUTTON = 0x0010;
const MK_XBUTTON1 = 0x0020;
const MK_XBUTTON2 = 0x0040;

//--->
const VK_BACKSPACE = 0x08;
const VK_SHIFT = 0x10;
const VK_CONTROL = 0x11;
const VK_MENU = 0x12; // ALT
const VK_PAUSE = 0x13;
const VK_ESCAPE = 0x1B;
const VK_SPACE = 0x20;
const VK_DELETE = 0x2E;
const VK_PRIOR = 0x21; // PAGE UP key
const VK_NEXT = 0x22; // PAGE DOWN key
const VK_END = 0x23;
const VK_HOME = 0x24;
const VK_LEFT = 0x25;
const VK_UP = 0x26;
const VK_RIGHT = 0x27;
const VK_DOWN = 0x28;
const VK_RETURN = 0x0D; // Enter
const VK_LSHIFT = 0xA0; // Left SHIFT key
const VK_RSHIFT = 0xA1; // Right SHIFT key
const VK_LCONTROL = 0xA2; // Left CONTROL key
const VK_RCONTROL = 0xA3; // Right CONTROL key
const VK_LMENU = 0xA4; // Left MENU key (Left Alt)
const VK_RMENU = 0xA5; // Right MENU key (Right Alt)

const VK_KEY_0 = 0x30; //	0
const VK_KEY_1 = 0x31; //	1
const VK_KEY_2 = 0x32; //	2
const VK_KEY_3 = 0x33; //	3
const VK_KEY_4 = 0x34; //	4
const VK_KEY_5 = 0x35; //	5
const VK_KEY_6 = 0x36; //	6
const VK_KEY_7 = 0x37; //	7
const VK_KEY_8 = 0x38; //	8
const VK_KEY_9 = 0x39; //	9
const VK_KEY_A = 0x41; //	A
const VK_KEY_B = 0x42; //	B
const VK_KEY_C = 0x43; //	C
const VK_KEY_D = 0x44; //	D
const VK_KEY_E = 0x45; //	E
const VK_KEY_F = 0x46; //	F
const VK_KEY_G = 0x47; //	G
const VK_KEY_H = 0x48; //	H
const VK_KEY_I = 0x49; //	I
const VK_KEY_J = 0x4A; //	J
const VK_KEY_K = 0x4B; //	K
const VK_KEY_L = 0x4C; //	L
const VK_KEY_M = 0x4D; //	M
const VK_KEY_N = 0x4E; //	N
const VK_KEY_O = 0x4F; //	O
const VK_KEY_P = 0x50; //	P
var VK_KEY_Q = 0x51; //	Q
var VK_KEY_R = 0x52; //	R
var VK_KEY_S = 0x53; //	S
var VK_KEY_T = 0x54; //	T
var VK_KEY_U = 0x55; //	U
var VK_KEY_V = 0x56; //	V
var VK_KEY_W = 0x57; //	W
var VK_KEY_X = 0x58; //	X
var VK_KEY_Y = 0x59; //	Y
var VK_KEY_Z = 0x5A; //	Z

var VK_F1 = 0x70; // F1
var VK_F10 = 0x79; // F10
var VK_F11 = 0x7A; // F11
var VK_F12 = 0x7B; // F12
var VK_F13 = 0x7C; // F13
var VK_F14 = 0x7D; // F14
var VK_F15 = 0x7E; // F15
var VK_F16 = 0x7F; // F16
var VK_F17 = 0x80; // F17
var VK_F18 = 0x81; // F18
var VK_F19 = 0x82; // F19
var VK_F2 = 0x71; // F2
var VK_F20 = 0x83; // F20
var VK_F21 = 0x84; // F21
var VK_F22 = 0x85; // F22
var VK_F23 = 0x86; // F23
var VK_F24 = 0x87; // F24
var VK_F3 = 0x72; // F3
var VK_F4 = 0x73; // F4
var VK_F5 = 0x74; // F5
var VK_F6 = 0x75; // F6
var VK_F7 = 0x76; // F7
var VK_F8 = 0x77; // F8
var VK_F9 = 0x78; // F9
//--->

var IDC_ARROW = 32512;
var IDC_IBEAM = 32513;
var IDC_WAIT = 32514;
var IDC_CROSS = 32515;
var IDC_UPARROW = 32516;
var IDC_SIZE = 32640;
var IDC_ICON = 32641;
var IDC_SIZENWSE = 32642;
var IDC_SIZENESW = 32643;
var IDC_SIZEWE = 32644;
var IDC_SIZENS = 32645;
var IDC_SIZEALL = 32646;
var IDC_NO = 32648;
var IDC_APPSTARTING = 32650;
var IDC_HAND = 32649;
const IDC_HELP = 32651;

//--->
// Used in SetTextRenderingHint()
// For more information, see: http://msdn.microsoft.com/en-us/library/ms534404(VS.85).aspx
const TextRenderingHint =
    {
        SystemDefault:            0,
        SingleBitPerPixelGridFit: 1,
        SingleBitPerPixel:        2,
        AntiAliasGridFit:         3,
        AntiAlias:                4,
        ClearTypeGridFit:         5
    };
//--->
// Used in SetSmoothingMode()
// For more information, see: http://msdn.microsoft.com/en-us/library/ms534173(VS.85).aspx
var SmoothingMode =
    {
        Invalid:     -1,
        Default:     0,
        HighSpeed:   1,
        HighQuality: 2,
        None:        3,
        AntiAlias:   4
    };
//--->
// Used in SetInterpolationMode()
// For more information, see: http://msdn.microsoft.com/en-us/library/ms534141(VS.85).aspx
var InterpolationMode =
    {
        Invalid:             -1,
        Default:             0,
        LowQuality:          1,
        HighQuality:         2,
        Bilinear:            3,
        Bicubic:             4,
        NearestNeighbor:     5,
        HighQualityBilinear: 6,
        HighQualityBicubic:  7
    };

var MF_STRING = 0x00000000;
var MF_GRAYED = 0x00000001;

var TPM_RIGHTALIGN = 0x0008;
var TPM_BOTTOMALIGN = 0x0020;

var DLGC_WANTALLKEYS = 0x0004;

var ONE_DAY = 86400000;
var ONE_WEEK = 604800000;

var DEFAULT_ARTIST = '$meta(artist,0)';
var N = window.Name + ':';

const DPI = WshShell.RegRead('HKCU\\Control Panel\\Desktop\\WindowMetrics\\AppliedDPI');

var LM = _scale(5);
var TM = _scale(16);

window.Tooltip.SetFont('Segoe UI', _scale(9));
window.Tooltip.SetMaxWidth(1200);

const _selfPackageId = '{1583C4B7-53AD-403F-8F7E-CB20490AAA26}';

let folders = {};

folders.home = (() => {
  let packagePath = utils.GetPackagePath(_selfPackageId);
  return `${packagePath}/scripts/js_marc2003/`;
})();

folders.images = folders.home + 'images/';
folders.data = `${fb.ProfilePath}foo_spider_monkey_panel/package_data/${_selfPackageId}/js_data/`;
folders.artists = folders.data + 'artists/';
folders.lastfm = folders.data + 'lastfm/';

_createFolder(folders.data, true);

let fontawesome = gdi.Font('FontAwesome', 48);
let chars = {
	up : '\uF077',
	down : '\uF078',
	close : '\uF00D',
	rating_on : '\uF005',
	rating_off : '\uF006',
	heart_on : '\uF004',
	heart_off : '\uF08A',
	prev : '\uF049',
	next : '\uF050',
	play : '\uF04B',
	pause : '\uF04C',
	stop : '\uF04D',
	preferences : '\uF013',
	search : '\uF002',
	console : '\uF120',
	info : '\uF05A',
	audioscrobbler : '\uF202',
	minus : '\uF068',
	music : '\uF001',
	menu : '\uF0C9'
};

let popup = {
    ok:       0,
    yes_no:   4,
    yes:      6,
    no:       7,
    stop:     16,
    question: 32,
    info:     64
};

let image = {
    crop:     0,
    crop_top: 1,
    stretch:  2,
    centre:   3
};

let ha_links = [
    ['Title Formatting Reference', 'https://wiki.hydrogenaud.io/index.php?title=Foobar2000:Title_Formatting_Reference'],
    ['Query Syntax', 'https://wiki.hydrogenaud.io/index.php?title=Foobar2000:Query_syntax'],
    ['Homepage', 'https://www.foobar2000.org/'],
    ['Components', 'https://www.foobar2000.org/components'],
    ['Wiki', 'https://wiki.hydrogenaud.io/index.php?title=Foobar2000:Foobar2000'],
    ['Forums', 'https://hydrogenaud.io/index.php/board,28.0.html']
];
