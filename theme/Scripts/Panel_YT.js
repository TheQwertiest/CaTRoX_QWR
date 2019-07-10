'use strict';
window.DefinePanel('YouTube Track Manager', {author:'WilB', version: '4.0.0'});
const requiredVersionStr = '1.1.4'; function is_compatible(requiredVersionStr) {const requiredVersion = requiredVersionStr.split('.'), currentVersion = utils.Version.split('.'); if (currentVersion.length > 3) currentVersion.length = 3; for (let i = 0; i < currentVersion.length; ++i) if (currentVersion[i] != requiredVersion[i]) return currentVersion[i] > requiredVersion[i]; return true;} if (!is_compatible(requiredVersionStr)) fb.ShowPopupMessage(`YouTube Track Manager requires v${requiredVersionStr}. Current component version is v${utils.Version}.`);

const $ = {
	average : arr => arr.reduce((a,b) => a + b, 0) / arr.length,
	getDpi : () => {let dpi = 120; try {dpi = $.WshShell.RegRead("HKCU\\Control Panel\\Desktop\\WindowMetrics\\AppliedDPI");} catch (e) {} return dpi < 121 ? 1 : dpi / 120;},
    isArray : arr => Array.isArray(arr),
    shuffle : arr => {for (let i = arr.length - 1; i >= 0; i--) {const randomIndex = Math.floor(Math.random() * (i + 1)), itemAtIndex = arr[randomIndex]; arr[randomIndex] = arr[i]; arr[i] = itemAtIndex;} return arr;},
    take : (arr, ln) => {if (ln >= arr.length) return arr; else arr.length = ln > 0 ? ln : 0; return arr;},
	WshShell : new ActiveXObject("WScript.Shell")
}

const s = {
    browser : (c) => {if (!s.run(c)) fb.ShowPopupMessage("Unable to launch your default browser.", "YouTube Track Manager");},
    buildPth : pth => {let result, tmpFileLoc = ""; const pattern = /(.*?)\\/gm; while (result = pattern.exec(pth)) {tmpFileLoc = tmpFileLoc.concat(result[0]); s.create(tmpFileLoc);}},
    clamp : (num, min, max) => {num = num <= max ? num : max; num = num >= min ? num : min; return num;},
    create : fo => {try {if (!s.folder(fo)) s.fs.CreateFolder(fo);} catch (e) {}},
    debounce : (e,r,i) => {var o,u,a,c,v,f,d=0,m=!1,j=!1,n=!0;if("function"!=typeof e)throw new TypeError(FUNC_ERROR_TEXT);function T(i){var n=o,t=u;return o=u=void 0,d=i,c=e.apply(t,n)}function b(i){var n=i-f;return void 0===f||r<=n||n<0||j&&a<=i-d}function l(){var i,n,t=Date.now();if(b(t))return w(t);v=setTimeout(l,(n=r-((i=t)-f),j?Math.min(n,a-(i-d)):n))}function w(i){return v=void 0,n&&o?T(i):(o=u=void 0,c)}function t(){var i,n=Date.now(),t=b(n);if(o=arguments,u=this,f=n,t){if(void 0===v)return d=i=f,v=setTimeout(l,r),m?T(i):c;if(j)return v=setTimeout(l,r),T(f)}return void 0===v&&(v=setTimeout(l,r)),c}return r=parseFloat(r)||0,s.isObject(i)&&(m=!!i.leading,a=(j="maxWait"in i)?Math.max(parseFloat(i.maxWait)||0,r):a,n="trailing"in i?!!i.trailing:n),t.cancel=function(){void 0!==v&&clearTimeout(v),o=f=u=v=void(d=0)},t.flush=function(){return void 0===v?c:w(Date.now())},t}, isObject : function(t) {var e=typeof t;return null!=t&&("object"==e||"function"==e)},
    defArtPth : "%profile%\\yttm\\art_img\\$lower($cut($meta(artist,0),1))\\$meta(artist,0)",
    file : f => s.fs.FileExists(f),
    folder : fo => s.fs.FolderExists(fo),
    fs : new ActiveXObject("Scripting.FileSystemObject"),
    get : function getProp(n, keys, defaultVal) {keys = $.isArray(keys) ? keys : keys.split('.'); n = n[keys[0]]; if (n && keys.length > 1) {return getProp(n, keys.slice(1), defaultVal);} return n === undefined ? defaultVal : n;},
    gr : (w, h, im, func) => {let i = gdi.CreateImage(w, h), g = i.GetGraphics(); func(g, i); i.ReleaseGraphics(g); g = null; if (im) return i; else i = null;},
    htmlParse : (n, prop, match, func) => {
         const ln = n == null ? 0 : n.length, sw = prop ? 0 : 1; let i = 0;
         switch (sw) {
             case 0: while (i < ln) {if (n[i][prop] == match) if (func(n[i]) === true) break; i++;} break;
             case 1: while (i < ln) {if (func(n[i]) === true) break; i++;} break;
        }
    },
    jsonParse : (n, defaultVal, type, keys, isValid) => {
        switch (type) {
            case 'file': try {return JSON.parse(s.open(n));} catch (e) {return defaultVal;} break;
            case 'get': if (isValid) {isValid = isValid.split("|"); if (!isValid.every(v => n.includes(v))) return false;} let data; try {data = JSON.parse(n);} catch (e) {return defaultVal;} if (keys) return s.get(data, keys, defaultVal); return data;
            default: try {return JSON.parse(n);} catch (e) {return defaultVal;} break;
        }
    },
    lastModified : file => Date.parse(s.fs.GetFile(file).DateLastModified),
    open : f => s.file(f) ? utils.ReadTextFile(f) : '',
	playCountInstalled :() => utils.CheckComponent("foo_playcount", true),
    query : (h, q) => {let l = FbMetadbHandleList(); try {l = fb.GetQueryItems(h, q);} catch (e) {} return l;},
	removeDiacritics : str => {const defaultDiacriticsRemovalMap = [{'base':'A', 'letters':/[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g}, {'base':'AA','letters':/[\uA732]/g}, {'base':'AE','letters':/[\u00C6\u01FC\u01E2]/g}, {'base':'AO','letters':/[\uA734]/g}, {'base':'AU','letters':/[\uA736]/g}, {'base':'AV','letters':/[\uA738\uA73A]/g}, {'base':'AY','letters':/[\uA73C]/g}, {'base':'B', 'letters':/[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g}, {'base':'C', 'letters':/[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g}, {'base':'D', 'letters':/[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g}, {'base':'DZ','letters':/[\u01F1\u01C4]/g}, {'base':'Dz','letters':/[\u01F2\u01C5]/g}, {'base':'E', 'letters':/[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g}, {'base':'F', 'letters':/[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g}, {'base':'G', 'letters':/[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g}, {'base':'H', 'letters':/[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g}, {'base':'I', 'letters':/[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g}, {'base':'J', 'letters':/[\u004A\u24BF\uFF2A\u0134\u0248]/g}, {'base':'K', 'letters':/[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g}, {'base':'L', 'letters':/[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g}, {'base':'LJ','letters':/[\u01C7]/g}, {'base':'Lj','letters':/[\u01C8]/g}, {'base':'M', 'letters':/[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g}, {'base':'N', 'letters':/[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g}, {'base':'NJ','letters':/[\u01CA]/g}, {'base':'Nj','letters':/[\u01CB]/g}, {'base':'O', 'letters':/[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g}, {'base':'OI','letters':/[\u01A2]/g}, {'base':'OO','letters':/[\uA74E]/g}, {'base':'OU','letters':/[\u0222]/g}, {'base':'P', 'letters':/[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g}, {'base':'Q', 'letters':/[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g}, {'base':'R', 'letters':/[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g}, {'base':'S', 'letters':/[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g}, {'base':'T', 'letters':/[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g}, {'base':'TZ','letters':/[\uA728]/g}, {'base':'U', 'letters':/[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g}, {'base':'V', 'letters':/[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g}, {'base':'VY','letters':/[\uA760]/g}, {'base':'W', 'letters':/[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g}, {'base':'X', 'letters':/[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g}, {'base':'Y', 'letters':/[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g}, {'base':'Z', 'letters':/[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g}, {'base':'a', 'letters':/[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g}, {'base':'aa','letters':/[\uA733]/g}, {'base':'ae','letters':/[\u00E6\u01FD\u01E3]/g}, {'base':'ao','letters':/[\uA735]/g}, {'base':'au','letters':/[\uA737]/g}, {'base':'av','letters':/[\uA739\uA73B]/g}, {'base':'ay','letters':/[\uA73D]/g}, {'base':'b', 'letters':/[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g}, {'base':'c', 'letters':/[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g}, {'base':'d', 'letters':/[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g}, {'base':'dz','letters':/[\u01F3\u01C6]/g}, {'base':'e', 'letters':/[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g}, {'base':'f', 'letters':/[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g}, {'base':'g', 'letters':/[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g}, {'base':'h', 'letters':/[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g}, {'base':'hv','letters':/[\u0195]/g}, {'base':'i', 'letters':/[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g}, {'base':'j', 'letters':/[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g}, {'base':'k', 'letters':/[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g}, {'base':'l', 'letters':/[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g}, {'base':'lj','letters':/[\u01C9]/g}, {'base':'m', 'letters':/[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g}, {'base':'n', 'letters':/[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g}, {'base':'nj','letters':/[\u01CC]/g}, {'base':'o', 'letters':/[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g}, {'base':'oi','letters':/[\u01A3]/g}, {'base':'ou','letters':/[\u0223]/g}, {'base':'oo','letters':/[\uA74F]/g}, {'base':'p','letters':/[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g}, {'base':'q','letters':/[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g}, {'base':'r','letters':/[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g}, {'base':'s','letters':/[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g}, {'base':'t','letters':/[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g}, {'base':'tz','letters':/[\uA729]/g}, {'base':'u','letters':/[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g}, {'base':'v','letters':/[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g}, {'base':'vy','letters':/[\uA761]/g}, {'base':'w','letters':/[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g}, {'base':'x','letters':/[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g}, {'base':'y','letters':/[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g}, {'base':'z','letters':/[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g}]; defaultDiacriticsRemovalMap.forEach(v => {str = str.replace(v.letters, v.base);});return str;},
    run : (c, w) => {try {typeof w === 'undefined' ? $.WshShell.Run(c) : $.WshShell.Run(c, w); return true;} catch (e) {return false;}},
    save : (fn, txt, bom) => {try {utils.WriteTextFile(fn, txt, bom)} catch (e) {s.trace("Error saving: " + fn);}},
	scale : $.getDpi(),
    sort : (data, prop, type) => {
        switch (type) {
            case 'rev': data.sort((a, b) => a[prop] < b[prop] ? 1 : a[prop] > b[prop] ? -1 : 0); return data;
            case 'num': data.sort((a, b) => parseFloat(a[prop]) - parseFloat(b[prop])); return data;
            case 'numRev': data.sort((a, b) => parseFloat(b[prop]) - parseFloat(a[prop])); return data;
            default: data.sort((a, b) => a[prop] < b[prop] ? -1 : a[prop] > b[prop] ? 1 : 0); return data;
        }
    },
    sortKeys : o => {const ordered = {}; Object.keys(o).sort().forEach(v => ordered[v] = o[v]); return ordered;},
    throttle : (e,i,t) => {var n=!0,r=!0;if("function"!=typeof e)throw new TypeError(FUNC_ERROR_TEXT);return s.isObject(t)&&(n="leading"in t?!!t.leading:n,r="trailing"in t?!!t.trailing:r),s.debounce(e,i,{leading:n,maxWait:i,trailing:r})},
    trace : message => console.log("YouTube Track Manager" + ": " + message),
    value : (num, def, type) => {num = parseFloat(num); if (isNaN(num)) return def; switch (type) {case 0: return num; case 1: if (num !== 1 && num !== 0) return def; break; case 2: if (num > 2 || num < 0) return def; break;} return num;}
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
	[" Border Increase Right Margin By Scrollbar Width", false, "extra_sbar_w"],
	[" Border", 25, "bor"],
	[" Button Colour Last.fm/MB Auto-0 Site-1 Theme-2", 0, "modeCol"],
	[" Button Mode", false, "btn_mode"],
	[" Heading Highlight ", true, "headHighlight"],
	[" Image [Artist] Auto-Fetch", false, "dl_art_img"],
	[" Image [Artist] Cycle Time (seconds)", 15, "cycleTime"],
	[" Image [Artist] Cycle", true, "cycPhoto"],
	[" Image [Artist] Folder Location", s.defArtPth, "imgArtPth"],
	[" Image Reflection Setting (0-100)", "Strength,14.5,Size,100,Gradient,10", "reflSetup"],
	[" Image Size 0-1", 0.735, "rel_imgs"],
	[" Image Smooth Transition Level (0-100)", 92, "transLevel"],
	[" Layout Auto Adjust", true, "autoLayout"],
	[" Library: Include Partial Matches 0 or 1", "Artist,0,Title,0", "partialMatch"],
	[" Nowplaying Font (Name,Size,Style[0-4])", "Calibri,36,1", "npFont"],
	[" Nowplaying Text Only", false, "np_graphic"],
	[" Playlist: Soft Activate On Create", true, "activateSoftPlaylist"],
	[" Radio Names: Pairs + Separator", "Last.fm, Radio,iSelect, Radio,MySelect, Radio,Separator, ∙ ", "radName"],
	[" Radio Play Saved Stations", false, "useSaved"],
	[" Row Vertical Item Padding", 0, "verticalPad"],
	[" Scroll Step 0-10 (0 = Page)", 3, "scrollStep"],
	[" Scrollbar Arrow Custom: Icon // Examples", " // ▲  ⮝    ⯅ ⏫ ⏶ ⤊   ", "arrowSymbol"],
	[" Scrollbar Arrow Custom: Icon: Vertical Offset %", -24, "sbarButPad"],
	[" Scrollbar Colour Grey-0 Blend-1", 1, "sbarCol"],
	[" Scrollbar Size", "Bar," + Math.round(11 * s.scale) + ",Arrow," + Math.round(11 * s.scale) + ",Gap(+/-),0,GripMinHeight," + Math.round(20 * s.scale), "sbarMetrics"],
	[" Scrollbar Type Default-0 Styled-1 Themed-2", "0", "sbarType"],
	[" Titleformat (Web Search) Artist", "[$if3($meta(artist,0),$meta(album artist,0),$meta(composer,0),$meta(performer,0))]", "tfArtist"],
	[" Titleformat (Web Search) Genre", "[$meta(genre,0)]", "tfGenre"],
	[" Titleformat (Web Search) Title", "[$meta(title,0)]", "tfTitle"],
	[" Titleformat Nowplaying", "[%artist%]$crlf()[%title%]", "tfNowplaying"],
	[" Titleformat Play Count", "%play_count%", "tfPlaycount"],
	[" Titleformat Rating", "%rating%", "tfRating"],
	[" Touch Step 1-10", 1, "touchStep"],
	[" YouTube 'Live' Filter", true, "yt_filter"],
	[" Zoom Button Size (%)", 100, "zoomBut"],
	[" Zoom Font Size (%)", 100, "zoomFont"],
	["_CUSTOM COLOURS/FONTS: EMPTY = DEFAULT", "R-G-B (any) or R-G-B-A (not Text...), e.g. 255-0-0", "customInfo"],
	["_CUSTOM COLOURS/FONTS: USE", false, "customCol"],
	["_Custom.Font AlbManager (Name,Size,Style[0-4])", "Segoe UI,16,0", "custFont"],
	["_Custom.Font Icon [Scroll] (Name,Style[0or1])", "Segoe UI Symbol,0", "butCustIconFont"],
	["ADV.Add Locations fb2k-0 SpiderMonkeyPanel-1", 1, "plmanAddloc"],
	["ADV.Allow Playing Saved Echonest Radio Stations", false, "ecUseSaved"],
	["ADV.Image Blur Background Auto-Fill", false, "blurAutofill"],
	["ADV.Image Blur Background Level (0-100)", 90, "blurTemp"],
	["ADV.Image Blur Background Opacity (0-100)", 30, "blurAlpha"],
	["ADV.Library Filters All Modes (| Separator)", "", "libFilters"],
	["ADV.Library Filters MySelect (| Separator)", "%rating% GREATER 1 | %play_count% GREATER 4", "mySelFilters"],
	["ADV.Library: Query Fields (No Titleformatting)", "ARTIST FIELD,Artist,ALBUM FIELD,Album,GENRE FIELD,Genre,TITLE FIELD,Title", "field"],
	["ADV.m-TAGS Auto Replace Dead Items 0 or 1", "YouTube,1,Library,0", "sync_mtags"],
	["ADV.m-TAGS Create: Write Absolute Paths", true, "abs_path"],
	["ADV.Partial Match Configuration", "FuzzyMatch%,80,RegEx,\\(|\\[|feat,Console,false", "partialMatchConfig"],
	["ADV.Partial Match: 0 Fuzzy-1 RegEx-2 Either-3", "Album,1,LfmRadio,3,LibRadio,3,Top50:40,1,TopTracks,3", "partialMatchType"],
	["ADV.PopularTrack [AllTime] LfmPlaycount", 500000, "pc_at_adjust"],
	["ADV.PopularTrack [Current] LfmPlaycount (6mth)", 10000, "pc_cur_adjust"],
	["ADV.Radio Search Timeout (secs >=30)", "iSelect,120", "iS_timeout"],
	["ADV.Radio TopTracks Feed Size: Artist 5'Hot'-1000","Highly Popular,25,Popular,50,Normal,75,Varied,100,Diverse,150,Highly Diverse,200", "presets"],
	["ADV.Radio TopTracks Feed Size: Genre/Tag", "Artist Values Multiplied By,10", "tagFeed"],
	["ADV.Radio TopTracks Feed Size: Similar Songs", "Artist Values Multiplied By,2.5", "songFeed"],
	["ADV.Smooth Duration 0-5000 msec (Max)", "Scroll,500,TouchFlick,3000", "duration"],
	["ADV.Touch Flick Distance 0-10", 0.8, "flickDistance"],
	["ADV.Video Popup Control Default-0 Full-1", 0, "vid_full_ctrl"],
	["ADV.YouTube 'Live' Filter Description", "awards|bootleg|\\bclip\\b|concert\\b|grammy|interview|jools|karaoke|(- |\\/ |\\/|\\| |\\(|\\[|\{|\\\")live|live at|mtv|o2|parody|preview|sample|\\bsession|teaser|\\btour\\b|tutorial|unplugged|(?=.*\\blive\\b)(19|20)\\d\\d|(?=.*(19|20)\\d\\d)\\blive\\b", "ytDescrFilter"],/*intentionally different*/
	["ADV.YouTube 'Live' Filter Title", "awards|bootleg|\\bclip\\b|concert\\b|grammy|interview|jools|karaoke|(- |\\/ |\\/|\\| |\\(|\\[|\{|\\\")live|live at|mtv|o2|parody|perform|preview|sample|\\bsession|teaser|\\btour\\b|tutorial|unplugged|\\d\/\\d|\\d-\\d|(?=.*\\blive\\b)(19|20)\\d\\d|(?=.*(19|20)\\d\\d)\\blive\\b|(?:[^n]).\\breaction\\b", "ytTitleFilter"],
	["ADV.YouTube Prefer Most: Relevant-0 Views-1", 0, "yt_order"],
	["ADV.YouTube 'Preference' Filter 0 or 1 Check:", "Uploader,0,Title,0,Description,0", "yt_pref"],
    ["ADV.YouTube 'Preference' Keywords", "vevo", "yt_pref_kw"],
	["SYSTEM.AlbMode", 0, "mb"],
	["SYSTEM.AlbTracks Pref: Lfm-0 Mb-1", 1, "pref_mb_tracks"],
	["SYSTEM.Artist View", false, "artistView"],
    ["SYSTEM.Artist Variety Ec", 50, "ec_variety"],
    ["SYSTEM.Artist Variety Lfm", 50, "lfm_variety"],
    ["SYSTEM.Artists: Random Pick", false, "randomArtist"],
	["SYSTEM.Auto Favourites", true, "autoFav"],
	["SYSTEM.Auto Radio", true, "autoRad"],
	["SYSTEM.Blur Blend Theme", false, "blurBlend"],
	["SYSTEM.Blur Dark Theme", false, "blurDark"],
	["SYSTEM.Blur Light Theme", false, "blurLight"],
	["SYSTEM.Click Action: Use Double Click", false, "dblClick"],
	["SYSTEM.Colour Swap", false, "swapCol"],
	["SYSTEM.Font Size", 16, "baseFontSize"],
    ["SYSTEM.Genre Tracks", true, "genre_tracks"],
	["SYSTEM.Image Blur Background Always Use Front Cover", false, "covBlur"],
	["SYSTEM.Image Border-1 Shadow-2 Both-3", 0, "imgBorder"],
	["SYSTEM.Image Full", false, "full"],
	["SYSTEM.Image Reflection", false, "imgReflection"],
	["SYSTEM.Image Smooth Transition", false, "imgSmoothTrans"],
	["SYSTEM.Lfm Mode", 1, "lfm_mode"],
	["SYSTEM.Lfm Sort", false, "lfm_sort"],
	["SYSTEM.Library Filter All Modes ID", 0, "libFilterID"],
	["SYSTEM.Library Filter MySelect ID", 0, "mySelFilterID"],
	["SYSTEM.Library Sort", s.playCountInstalled ? 0 : 2, "sortType"],
	["SYSTEM.Library","0,0,0", "useLibrary"],
	["SYSTEM.Mb Group", false, "mb_group"],
	["SYSTEM.Nowplaying Text Shadow Effect", true, "npShadow"],
	["SYSTEM.Prefer Focus", false, "focus"],
	["SYSTEM.Prefer Video Mode", false, "videoMode"],
	["SYSTEM.Radio Favourites", "No Favourites", "favourites"],
	["SYSTEM.Radio Mode", 1, "radMode"],
	["SYSTEM.Radio Played Artists", JSON.stringify([]), "playedArtists"],
	["SYSTEM.Radio Played Tracks", JSON.stringify([]), "playedTracks"],
	["SYSTEM.Radio Range", 1, "radRange"],
	["SYSTEM.Release Type", 0, "releaseType"],
	["SYSTEM.Remove Played", true, "removePlayed"],
	["SYSTEM.Row Stripes", false, "rowStripes"],
	["SYSTEM.Save Radio Playlist", false, "saveRadPlaylist"],
	["SYSTEM.Save Top50", true, "savePlaylists"],
	["SYSTEM.Scroll: Smooth Scroll", true, "smooth"],
	["SYSTEM.Scrollbar Show", true, "sbarShow"],
	["SYSTEM.Scrollbar Width Bar", 11, "sbarBase_w"],
	["SYSTEM.Show Albums", true, "showAlb"],
	["SYSTEM.Show Artists", true, "showArtists"],
	["SYSTEM.Show Live MB Releases", false, "showLive"],
	["SYSTEM.Similar Artists", true, "showSimilar"],
	["SYSTEM.Softplaylist Create", false, "softplaylist"],
	["SYSTEM.Text Type", true, "textType"],
	["SYSTEM.Touch Control", false, "touchControl"],
	["SYSTEM.Tracks: Curr Popularity", true, "cur_pop"]
];
const ppt = new PanelProperties();
ppt.init('auto', properties); properties = undefined;

String.prototype.splt = function(n) {switch (n) {case 0: return this.replace(/\s+|^,+|,+$/g, "").split(","); case 1: return this.replace(/^[,\s]+|[,\s]+$/g, "").split(",");}}

let lib; const ui = new UserInterface(), name = new Names(), tf = new Titleformat(), vk = new Vkeys(), p = new Panel(), ml = new MediaLibrary(), t = new Text(), pl = new Playlists(), blk = new Blacklist(), upd_mtags = new Check_mTags(), yt_rad = new RadioTracks(), alb_scrollbar = new Scrollbar(), art_scrollbar = new Scrollbar(), fav = new Favourites(), index = new NewRadio(), rad = new Radio(), alb = new Albums(on_album_search_done_callback), but = new Buttons(), img = new Images(), dl_art = new Dl_art_images(), timer = new Timers(), men = new MenuItems(); window.DlgCode = 0x004;

function UserInterface() {
    const pptCol = [["_Custom.Colour Background", "", "bg", 1], ["_Custom.Colour Background Highlight", "", "bg_h", 1], ["_Custom.Colour Background Selected", "", "bgSel", 1], ["_Custom.Colour Frame Highlight", "", "frame", 1], ["_Custom.Colour Text", "", "text", 0], ["_Custom.Colour Text Highlight", "", "text_h", 0], ["_Custom.Colour Text Selected", "", "textSel", 0], ["_Custom.Colour Transparent Fill", "", "bgTrans", 1]];
    let lightBg = false, style = 0, tcol = "", tcol_h = "", zoomFontSize = 16;

    this.col = {}; this.col.b1 = 0x04ffffff; this.col.b2 = 0x04000000; this.bg = false; this.blurAlpha = s.clamp(ppt.blurAlpha, 0, 100) / 30; this.blurBlend = ppt.blurBlend; this.blurDark = ppt.blurDark; this.blurLight = ppt.blurLight; this.blurLevel = this.blurBlend ? 91.05 - s.clamp(ppt.blurTemp, 1.05, 90) : s.clamp(ppt.blurTemp * 2, 0, 254); this.dn_id = -1; this.dui = window.InstanceType; this.font = ""; this.headFont = ""; ppt.modeCol = s.clamp(ppt.modeCol, 0, 2); this.np_graphic = !ppt.btn_mode ? !ppt.np_graphic : false; this.pcFont = "";
    if (!this.np_graphic) this.blurBlend = this.blurDark = this.blurLight = false;

    const chgBrightness = (c, percent) => {c = toRGB(c); return RGB(s.clamp(c[0] + (256 - c[0]) * percent / 100, 0, 255), s.clamp(c[1] + (256 - c[1]) * percent / 100, 0, 255), s.clamp(c[2] + (256 - c[2]) * percent / 100, 0, 255));}
    const colSat = c => {c = toRGB(c); return c[0] + c[1] + c[2];}
	const getLineCol = c => this.get_blend(this.col.bg == 0 ? 0xff000000 : this.col.bg, c, 0.25, false);
	const pptColour = () => {pptCol.forEach(v => this.col[v[2]] = set_custom_col(ppt.get(v[0], v[1]), v[3]));}
    const RGBtoRGBA = (rgb, a) => a << 24 | rgb & 0x00FFFFFF;
    const set_custom_col = (c, t) => {if (!ppt.customCol) return ""; c = c.split("-"); let cc = ""; if (c.length != 3 && c.length != 4) return ""; switch (t) {case 0: cc = RGB(c[0], c[1], c[2]); break; case 1: switch (c.length) {case 3: cc = RGB(c[0], c[1], c[2]); break; case 4: cc = RGBA(c[0], c[1], c[2], c[3]); break;} break;} return cc;}
    const toRGB = c => [c >> 16 & 0xff, c >> 8 & 0xff, c & 0xff];
    const toRGBA = c => [c >> 16 & 0xff, c >> 8 & 0xff, c & 0xff, c >> 24 & 0xff];

    this.chgBlur = type => {this.blurDark = false; this.blurBlend = false; this.blurLight = false; switch (type) {case 1: this.blurDark = true; break; case 2: this.blurBlend = true; break; case 3: this.blurLight = true; break;} this.blurLevel = this.blurBlend ? 91.05 - s.clamp(ppt.blurTemp, 1.05, 90) : s.clamp(ppt.blurTemp * 2, 0, 254); ppt.blurBlend = this.blurBlend; ppt.blurDark = this.blurDark; ppt.blurLight = this.blurLight; on_colours_changed(true);}
    this.get_blend = (c1, c2, f, alpha) => {const nf = 1 - f; let r, g, b, a; switch (true) {case !alpha: c1 = toRGB(c1); c2 = toRGB(c2); r = c1[0] * f + c2[0] * nf; g = c1[1] * f + c2[1] * nf; b = c1[2] * f + c2[2] * nf; return RGB(r, g, b); case alpha: c1 = toRGBA(c1); c2 = toRGBA(c2); r = c1[0] * f + c2[0] * nf; g = c1[1] * f + c2[1] * nf; b = c1[2] * f + c2[2] * nf; a = c1[3] * f + c2[3] * nf; return RGBA(r, g, b, a);}}
    this.get_textselcol = (c, n) => {c = toRGB(c); const cc = c.map(v => {v /= 255; return v <= 0.03928 ? v /= 12.92 : Math.pow(((v + 0.055 ) / 1.055), 2.4);}); const L = 0.2126 * cc[0] + 0.7152 * cc[1] + 0.0722 * cc[2]; if (L > 0.31) return n ? 50 : RGB(0, 0, 0); else return n ? 200 : RGB(255, 255, 255);}
    this.draw = gr => {if (this.bg) gr.FillSolidRect(0, 0, p.w, p.h, this.col.bg);}
    this.outline = (c, but) => {c = toRGB(c); if (but) {if (window.IsTransparent || c[0] + c[1] + c[2] > 30) return RGBA(0, 0, 0, 36); else return RGBA(255, 255, 255, 36);} const cc = []; c.forEach((v, i) => {cc[i] = v / 255; cc[i] = cc[i] <= 0.03928 ? cc[i] / 12.92 : Math.pow(((cc[i] + 0.055 ) / 1.055), 2.4);}); const L = 0.2126 * cc[0] + 0.7152 * cc[1] + 0.0722 * cc[2]; if (L > 0.31) return RGB(30, 30, 10); else return RGB(225, 225, 245);}
    this.reset_colors = () => {pptCol.forEach(v => this.col[v[2]] = ""); tcol = ""; tcol_h = "";}

    this.get_font = () => {
        if (ppt.customCol && ppt.custFont.length) {const custFont = ppt.custFont.splt(1); this.font = gdi.Font(custFont[0], Math.round(s.value(custFont[1], 16, 0)), Math.round(s.value(custFont[2], 0, 0)));}
        else if (this.dui) this.font = window.GetFontDUI(2); else this.font = window.GetFontCUI(0);
        if (!this.font) {this.font = gdi.Font("Segoe UI", 16, 0); s.trace("Spider Monkey Panel is unable to use your default font. Using Segoe UI at default size & style instead");}
		if (this.font.Size != ppt.baseFontSize) ppt.zoomFont = 100;
		ppt.baseFontSize = this.font.Size;
        zoomFontSize = Math.max(Math.round(ppt.baseFontSize * ppt.zoomFont / 100), 1);
        this.font = gdi.Font(this.font.Name, zoomFontSize, this.font.Style);
        ppt.zoomFont = Math.round(zoomFontSize / ppt.baseFontSize * 100);
        let b = this.font.Style; style = b == 0 ? 2 : b == 1 ? 3 : b == 2 ? 0 : b == 3 ? 1 : b; this.headFont = gdi.Font(this.font.Name, this.font.Size, style);
        this.pcFont = gdi.Font("Segoe UI", 9 * s.scale, style); // edit for custom playcount header font
        alb.calc_text(); alb.calc_rows(); alb.calc_rows_alb(); alb.calc_rows_art(); but.refresh(true);
    }

    this.wheel = step => {
        if (p.m_y < alb.fit()[1] || !ppt.showAlb || t.halt()) return;
        zoomFontSize += step; zoomFontSize = Math.max(zoomFontSize, 1);
        this.font = gdi.Font(this.font.Name, zoomFontSize, this.font.Style);
        this.headFont = gdi.Font(this.font.Name, zoomFontSize, style);
        alb.calc_text(); alb.calc_rows(); alb.calc_rows_alb(); alb.calc_rows_art(); but.refresh(true);
        window.Repaint(); ppt.zoomFont = Math.round(zoomFontSize / ppt.baseFontSize * 100);
    }

    this.get_colors = () => {
        pptColour();
        this.blur = this.blurBlend || this.blurDark || this.blurLight; this.dkMode = ppt.modeCol == 2 || (this.blurDark || this.blurLight) && !ppt.modeCol ? true : false;
        if (this.blurDark) {this.col.bg_light = RGBA(0, 0, 0, Math.min(160 / this.blurAlpha, 255)); this.col.bg_dark = RGBA(0, 0, 0, Math.min(80 / this.blurAlpha, 255));}
        if (this.blurLight) {this.col.bg_light = RGBA(255, 255, 255, Math.min(160 / this.blurAlpha, 255)); this.col.bg_dark = RGBA(255, 255, 255, Math.min(205 / this.blurAlpha, 255));}
        if (this.dui) { // custom colour mapping: DUI colours can be remapped by changing the numbers (0-3)
            if (this.col.bg === "") this.col.bg = window.GetColourDUI(1);
            tcol = window.GetColourDUI(0); tcol_h = window.GetColourDUI(2);
            if (this.col.bgSel === "") this.col.bgSel = this.blurDark ? RGBA(255, 255, 255, 36) : this.blurLight ? RGBA(0, 0, 0, 36) : window.GetColourDUI(3);
        } else { // custom colour mapping: CUI colours can be remapped by changing the numbers (0-6)
            if (this.col.bg === "") this.col.bg = window.GetColourCUI(3);
            tcol = window.GetColourCUI(0); tcol_h = window.GetColourCUI(2);
            if (this.col.bgSel === "") this.col.bgSel = this.blurDark ? RGBA(255, 255, 255, 36) : this.blurLight ? RGBA(0, 0, 0, 36) : window.GetColourCUI(4);
        }
        lightBg = this.get_textselcol(this.col.bg == 0 ? 0xff000000 : this.col.bg, true) == 50;
		if (ppt.blurDark) {tcol = RGB(255, 255, 255); tcol_h = RGB(255, 255, 255);}
		if (ppt.blurLight) {tcol = RGB(0, 0, 0); tcol_h = RGB(71, 129, 183);}
        if (this.col.text === "") this.col.text = this.blurBlend ? chgBrightness(tcol, lightBg ? -10 : 10) : tcol;
		if (this.col.text_h === "") this.col.text_h = this.blurBlend ? chgBrightness(tcol_h, lightBg ? -10 : 10) : tcol_h;
        if (ppt.swapCol) {const colH = this.col.text_h; this.col.text_h = this.col.text; this.col.text = colH;}
		this.col.head = ppt.headHighlight ? this.col.text_h : this.col.text;
		this.col.blend = this.get_blend(this.col.head, this.col.text, 0.5);
		this.col.lineAlb = getLineCol(this.col.head); // this.col.lineAlb = this.col.head; 3.9.5.3 line colour
		this.col.lineArt = getLineCol(this.col.text); // this.col.lineArt = this.col.blend; 3.9.5.3 line colour
        if (this.col.bg_h === "") this.col.bg_h = this.blurDark ? 0x24000000 : 0x1E30AFED;
        if (this.col.frame === "") this.col.frame = this.blurDark ? 0xff808080 : 0xA330AFED;
        if (this.col.textSel === "") this.col.textSel = !this.blur ? this.get_textselcol(this.col.bgSel, false) : this.col.text;
        if (window.IsTransparent && this.col.bgTrans) {this.bg = true; this.col.bg =  this.col.bgTrans}
        if (!window.IsTransparent || this.dui) {this.bg = true; if (colSat(this.col.bg) > 759) this.col.b2 = 0x06000000;}
        this.col.t = this.bg ? this.get_textselcol(this.col.bg, true) : 200;
        this.col.searchSel = window.IsTransparent || !this.col.bgSel ? 0xff0099ff : this.col.bgSel != this.col.text_h ? this.col.bgSel : 0xff0099ff;
        ["blend1", "blend2", "blend3"].forEach((v, i) => {
            this.col[v] = this.blurBlend ? this.col.text & RGBA(255, 255, 255, i == 2 ? 40 : 12) : this.blurDark ? (i == 2 ? RGBA(255, 255, 255, 50) : RGBA(0, 0, 0, 40)) : this.blurLight ? RGBA(0, 0, 0, i == 2 ? 40 : 15) : this.get_blend(this.col.bg == 0 ? 0xff000000 : this.col.bg, this.col.text, !i ? 0.9 : i == 2 ? 0.87 : (this.blur ? 0.75 : 0.82));
        });
        this.col.blend4 = toRGBA(this.col.blend1);
        this.col.butBg = !this.blur ? this.outline(this.col.bg, true) : RGBA(this.col.blend4[0], this.col.blend4[1], this.col.blend4[2], Math.min(this.col.blend4[3] * 2, 255))
    }
    this.get_colors();
}

String.prototype.clean = function() {return this.replace(/[\/\\|:]/g, "-").replace(/\*/g, "x").replace(/"/g, "''").replace(/[<>]/g, "_").replace(/\?/g, "").replace(/^\./, "_").replace(/\.+$/, "").replace(/^\s+|[\n\s]+$/g, "");}
String.prototype.cleanse = function() {return this.replace(/(\.mv4|1080p|1080i|1080|\d(\d|)(\.|\s-)|explicit( version|)|full HD|HD full|full HQ|full song|(high |HD - |HD-|HD )quality|(| |with |& |w( |)\/( |)|\+ )lyric(s(!|) on Screen|s|)|(official |)music video( |)|official (music|version|video)( |)|(song |official (fan |)|)audio( version| only| clean|)|(| |\+ )official( solo| |)|uncensored|vevo presents|video( |))|\.wmv/gi, "").replace(/(HD|HQ)(\s-\s|)/g, "").replace(/\((|\s+)\)/g, "").replace(/\[(|\s+)\]/g, "").replace(/\(\)/g, "").replace(/\[\]/g, "").replace(/\s+/g, " ").replace(/[\s-/\\\+]+$/g, "").trim();}
String.prototype.regex_escape = function() {return this.replace(/([*+\-?^!:&"~${}()|\[\]\/\\])/g, "\\$1");}
String.prototype.strip = function() {return this.replace(/[\.,\!\?\:;'\u2019"\-_\u2010\s+]/g, "").toLowerCase();}
String.prototype.strip_remaster = function() {const n = this.toLowerCase(); if (!n.includes("remaster") && !n.includes("re-master") && !n.includes("re-recorded") && !n.includes("rerecorded")) return this; const new_name = this.replace(/((19|20)\d\d(\s|\s-\s)|)(digital(ly|)\s|)(\d\d-bit\s|)(re(-|)master|re(-|)recorded).*/gi, "").replace(/\s[\W_]+$/g, "").replace(/[\s\(\[-]+$/g, ""); return new_name.length ? new_name : this;}
String.prototype.tidy = function() {return this.replace(/[\.,\!\?\:;'’"\-_]/g, "").toLowerCase();}
String.prototype.uuid = function() {return (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/).test(this);}

function Names() {
    this.field = ppt.field.splt(1); this.q_a = this.field[1] ? this.field[1].trim() : "Artist"; if (!this.q_a.length) this.q_a = "Artist"; this.q_l = this.field[3] ? this.field[3].trim() : "Album"; if (!this.q_l.length) this.q_l = "Album"; this.q_g = this.field[5] ? this.field[5].trim() : "Genre"; if (!this.q_g.length) this.q_g = "Genre"; this.q_t = this.field[7] ? this.field[7].trim() : "Title"; if (!this.q_t.length) this.q_t = "Title";
    this.artist = focus => p.eval("$trim(" + ppt.tfArtist + ")", focus);
    this.art = () => alb.artist ? alb.artist : this.artist();
    this.title = focus => p.eval("$trim(" + ppt.tfTitle + ")", focus); this.artist_title = () => this.artist() && this.title() ? this.artist() + " | " + this.title() : "N/A";
    this.genre = () => {const g = p.eval("$trim(" + ppt.tfGenre + ")"); return g ? g : "N/A";}
}

function Bezier(){const i=4,c=.001,o=1e-7,v=10,l=11,s=1/(l-1),n=typeof Float32Array==="function";function e(r,n){return 1-3*n+3*r}function u(r,n){return 3*n-6*r}function a(r){return 3*r}function w(r,n,t){return((e(n,t)*r+u(n,t))*r+a(n))*r}function y(r,n,t){return 3*e(n,t)*r*r+2*u(n,t)*r+a(n)}function h(r,n,t,e,u){let a,f,i=0;do{f=n+(t-n)/2;a=w(f,e,u)-r;if(a>0){t=f}else{n=f}}while(Math.abs(a)>o&&++i<v);return f}function A(r,n,t,e){for(let u=0;u<i;++u){const a=y(n,t,e);if(a===0){return n}const f=w(n,t,e)-r;n-=f/a}return n}function f(r){return r}function bezier(i,t,o,e){if(!(0<=i&&i<=1&&0<=o&&o<=1)){throw new Error("Bezier x values must be in [0, 1] range")}if(i===t&&o===e){return f}const v=n?new Float32Array(l):new Array(l);for(let r=0;r<l;++r){v[r]=w(r*s,i,o)}function u(r){const e=l-1;let n=0,t=1;for(;t!==e&&v[t]<=r;++t){n+=s}--t;const u=(r-v[t])/(v[t+1]-v[t]),a=n+u*s,f=y(a,i,o);if(f>=c){return A(r,a,i,o)}else if(f===0){return a}else{return h(r,n,n+s,i,o)}}return function r(n){if(n===0){return 0}if(n===1){return 1}return w(u(n),t,e)}} this.scroll = bezier(0.25, 0.1, 0.25, 1); this.bar = bezier(0.165,0.84,0.44,1); this.barFast = bezier(0.19, 1, 0.22, 1); this.inertia = bezier(0.23, 1, 0.32, 1);}; const ease = new Bezier();
function on_colours_changed(clear) {ui.reset_colors(); ui.get_colors(); if (ui.blur) p.show_images = true; but.create_images(); but.refresh(); if (ui.np_graphic) img.create_images(); if (ui.blurBlend || clear) img.on_size(); t.paint();}
function on_font_changed() {ui.get_font(); t.paint();}
function Titleformat() {this.a = FbTitleFormat("%" + name.q_a + "%"); this.a0 = FbTitleFormat("[$meta(" + name.q_a + ",0)]"); this.d = FbTitleFormat("[%length_seconds_fp%]"); this.i = FbTitleFormat("$info(@REFERENCED_FILE)"); this.l0 = FbTitleFormat("[$meta(" + name.q_l + ",0)]"); this.pl = FbTitleFormat(ppt.get(" Load Menu Albums Sort", "%album artist%|%date%|%album%|[[%discnumber%.]%tracknumber%. ][%track artist% - ]%title%")); this.popup = FbTitleFormat("[%video_popup_status%]"); this.r = FbTitleFormat("$rand()"); this.rg = FbTitleFormat("[%replaygain_track_gain%]"); this.rp = FbTitleFormat("[%replaygain_track_peak%]"); this.t = FbTitleFormat("%" + name.q_t + "%"); this.t0 = FbTitleFormat("[$meta(" + name.q_t + ",0)]");}
function Vkeys() {this.selAll = 1; this.copy = 3; this.back = 8; this.enter = 13; this.shift = 16; this.paste = 22; this.cut = 24; this.redo = 25; this.undo = 26; this.pgUp = 33; this.pgDn = 34; this.end = 35; this.home = 36; this.left = 37; this.right = 39; this.del = 46;}

String.prototype.strip_title = function(n, type) {
    if (this == n) return this;
    n = n.replace(/([\*\$])/g, "\\$1");
    if (type) {if ((RegExp(n + " - ", "i")).test(this)) return this.replace(RegExp(n + " - ", "i"), ""); else return this.replace(RegExp(" - " + n, "i"), "");}
    const t1 = n.replace(/^The /i, ""), w = "(( |)((and|&|featuring|of|with)|((feat|ft|vs)(.|)))|'s) ";
    if ((RegExp(w, "i")).test(this))
        if ((RegExp(n + w, "i")).test(this) || (RegExp(w + n, "i")).test(this) || (RegExp(t1 + w, "i")).test(this) || RegExp(w + t1, "i").test(this))
            return this;
    const a = "(( +)?([-;:, ~|/(\\[]+)( +)?|)", b = "(the |by (the |)|by: |\"|)", c = "(\"|)", d = "(( +)?([-;:, ~|/)\\]]+)( +)?|)"; let t2 = "";
    if (!(/^The /i).test(n)) t2 = this.replace(RegExp(a + b + n + c + d, "i"), " - ").replace(/^ - | - (.|)$/g, "");
    else t2 = this.replace(RegExp(a + b + t1 + c + d, "i"), " - ").replace(/^ - | - (.|)$/g, "");
    return (/\S/).test(t2) ? t2 : this;
}

String.prototype.titlecase = function() {
  const smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i; if (this == "N/A") return this;
    return this.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function(match, index, title) {
    // uncomment for smallWord handling: if (index > 0 && index + match.length !== title.length && match.search(smallWords) > -1 && title.charAt(index - 2) !== ":" && (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') && title.charAt(index - 1).search(/[^\s-]/) < 0) {return match.toLowerCase();}
    if (match.substr(1).search(/[A-Z]|\../) > -1) return match; return match.charAt().toUpperCase() + match.substr(1);
  });
}

function Panel() {
	let sbarMetrics = ppt.sbarMetrics.splt(0);
    this.clicked = false; this.add_loc = []; this.alb_id = -1; this.arrow_pad = s.value(sbarMetrics[5], 0, 0); this.grip_h = s.value(sbarMetrics[7], 12, 0); this.h = 0; this.last_pressed_coord = {x: -1, y: -1}; this.loading = []; this.loc_add = []; this.loc_ix = 0; this.m_x = 0; this.m_y = 0; this.mtags = []; for (let i = 0; i < 20; i++) {this.loading[i] = []; this.local = s.file("C:\\check_local\\1450343922.txt"); this.loc_add[i] = []; this.mtags[i] = [];}; this.One_Day = 86400000; this.One_Week = 604800000; ppt.plmanAddloc = s.value(ppt.plmanAddloc, 1, 1); this.rel_imgs = ppt.rel_imgs; this.sbar_o = 0; this.sbar_x = 0; this.setFocus = -1; this.setVisible = -1; this.t50_loc = []; this.t50_ix = 0; this.Thirty_Days = 2592000000; this.TwentyEight_Days = 2419200000; this.videoMode = ui.np_graphic && ppt.videoMode; this.show_video = this.videoMode; this.show_images = ui.np_graphic; if (!ppt.imgArtPth) ppt.imgArtPth = s.defArtPth; this.sbarShow = !ppt.btn_mode ? ppt.sbarShow : false; this.w = 0;

    const replaceAt = (str, pos, chr) => str.substring(0, pos) + chr + str.substring(pos + 1);

    this.click = (x, y) => {if (x < 0 || y < 0 || x > p.w || y > p.h) return; alb.load(x, y); if (ppt.touchControl && !ppt.dblClick && Math.sqrt((Math.pow(this.last_pressed_coord.x - x, 2) + Math.pow(this.last_pressed_coord.y - y, 2))) > 3 * s.scale && ui.np_graphic) return; if (t.clickable(x, y)) {this.clicked = true; rad.text_toggle(x, y); if (this.show_images) img.lbtn_up(x, y);}}
    this.expired = (f, exp) => {if (!s.file(f)) return true; return Date.now() - s.lastModified(f) > exp;}
    this.ir = () => fb.IsPlaying && fb.PlaybackLength <= 0;
    this.eval = (n, focus) => {if (!n) return ""; const tfo = FbTitleFormat(n); if (this.ir()) return tfo.Eval(); if (typeof focus === 'undefined') focus = ppt.focus; const handle = fb.IsPlaying && (!focus || this.videoMode) ? fb.GetNowPlaying() : fb.GetFocusItem(); return handle ? tfo.EvalWithMetadb(handle) : "";}; const q = n => n.split("").reverse().join("");
    this.cleanPth = pth => {pth = pth.trim().replace(/\//g, "\\"); if (pth.toLowerCase().includes("%profile%")) {let fbPth = fb.ProfilePath.replace(/'/g, "''").replace(/(\(|\)|\[|\]|%|,)/g, "'$1'"); if (fbPth.includes("$")) {const fbPthSplit = fbPth.split("$"); fbPth = fbPthSplit.join("'$$'");} pth = pth.replace(/%profile%(\\|)/gi, fbPth);} pth = this.eval(pth); if (pth) pth += "\\"; else return ""; const c_pos = pth.indexOf(":"); pth = pth.replace(/[\/|:]/g, "-").replace(/\*/g, "x").replace(/"/g, "''").replace(/[<>]/g, "_").replace(/\?/g, "").replace(/\\\./g, "\\_").replace(/\.+\\/, "\\").replace(/\s*\\\s*/g, "\\"); if(c_pos < 3 && c_pos != -1) pth = replaceAt(pth, c_pos, ":"); while (pth.includes("\\\\")) pth = pth.replace(/\\\\/g,"\\_\\"); return pth.trim();}
    this.img_exp = (img_folder, exp) => {const f = img_folder + "update.txt"; if (!s.file(f)) return true; return (Date.now() - s.lastModified(f) > exp);}
    this.IsVideo = () => {if (!fb.IsPlaying || fb.PlaybackLength <= 0) return false; const fy = !this.eval("%path%").includes(".tags") ? this.eval("%_path_raw%") : this.eval("$info(@REFERENCED_FILE)"); return fy.startsWith('fy+') || fy.startsWith('3dydfy:');}
    this.on_size = () => this.sbar_x = this.w - this.sbar_sp;
    this.set_video = () => {timer.clear(timer.vid); if (this.videoMode && this.IsVideo()) {this.show_video = true; if (!ui.blur) this.show_images = false; if (!ppt.showAlb) timer.video();} else {this.show_video = false; this.show_images = true;} if (this.eval("%video_popup_status%") == "hidden" && this.videoMode && this.IsVideo()) fb.RunMainMenuCommand("View/Visualizations/Video"); if (this.eval("%video_popup_status%") == "visible" && (!this.videoMode || !this.IsVideo())) fb.RunMainMenuCommand("View/Visualizations/Video");}
    this.vid_chk = () => {if (ui.np_graphic && !ppt.showAlb && !t.block() && this.videoMode) return; timer.clear(timer.vid); if (ppt.vid_full_ctrl && this.eval("%video_popup_status%") == "visible") fb.RunMainMenuCommand("View/Visualizations/Video");}
	ppt.vid_full_ctrl = s.value(ppt.vid_full_ctrl, 0, 1);
    this.yt_order = !ppt.yt_order ? "relevance" : "viewCount";
    const yttm = fb.ProfilePath + "yttm\\", fn = yttm + "albums\\"; s.create(yttm); s.create(fn);

    this.addLoc = (p_loc, p_pn, radio, p_top50, p_alb_set, p_clear) => {
        switch (ppt.plmanAddloc) {
            case 0: // fb
                if (!p_top50 && !p_alb_set && radio && plman.ActivePlaylist != pl.rad && plman.PlayingPlaylist == pl.rad) {
					if (p_loc.replace(/[\.\/\\]/g, "").includes("youtubecomwatch")) return plman.AddLocations(pl.rad, [p_loc]);
				}
				s.run("\"" + fb.FoobarPath + "\\foobar2000.exe\"" + (radio ? " /immediate" : "") + " /add \"" + p_loc + "\"", 0);
                break;
            case 1: // plman
                p_loc = $.isArray(p_loc) ? p_loc : [p_loc]; if (p_clear) plman.ClearPlaylistSelection(p_pn);
                const focus = ppt.focus || !fb.IsPlaying;
                plman.AddLocations(p_pn, p_loc, !p_top50 && !p_alb_set && radio && (plman.ActivePlaylist != pl.rad && plman.PlayingPlaylist == pl.rad || focus && ppt.removePlayed) || p_top50 && focus ? false : true);
                break;
            }
    }

	this.toggle = (n) => {
		switch (n) {
			case 'sbarShow': this.sbarShow = !this.sbarShow; ppt.sbarShow = this.sbarShow; this.sbarSet(); this.on_size(); ui.get_font(); but.create_images(); but.refresh(true); but.set_scroll_btns_hide(true); t.paint(); break;
			case 'rowStripes': ppt.rowStripes = !ppt.rowStripes;
			if (ppt.rowStripes) {
				alb_scrollbar.stripe_w = this.sbarShow && alb_scrollbar.scrollable_lines > 0 ? this.w - this.sbar_sp - Math.round(3 * s.scale) : this.w;
				art_scrollbar.stripe_w = this.sbarShow && art_scrollbar.scrollable_lines > 0 ? this.w - this.sbar_sp - Math.round(3 * s.scale) : this.w;
			}
			t.paint();
			break;
		}
	}

    this.sbarType = s.value(ppt.sbarType.replace(/\s+/g, "").charAt(), 0, 2); if (this.sbarType == 2)  ppt.sbarType = "2 // Scrollbar Settings N/A For Themed"; else ppt.sbarType = "" + this.sbarType + ""; ppt.sbarCol = s.clamp(ppt.sbarCol, 0, 1);
    if (this.sbarType == 2) {this.theme = window.CreateThemeManager("scrollbar"); s.gr(21, 21, false, g => {try {this.theme.SetPartAndStateID(6, 1); this.theme.DrawThemeBackground(g, 0, 0, 21, 50); for (let i = 0; i < 3; i++) {this.theme.SetPartAndStateID(3, i + 1); this.theme.DrawThemeBackground(g, 0, 0, 21, 50);} for (let i = 0; i < 3; i++) {this.theme.SetPartAndStateID(1, i + 1); this.theme.DrawThemeBackground(g, 0, 0, 21, 21);}} catch (e) {this.sbarType = 1; ppt.sbarType = "" + 1 + "";}});} const user_lfm_k = ppt.get("ADV." + q("mf.tsaL yeK IPA"), "").trim(), user_yt_k = ppt.get("ADV." + q("ebuTuoY yeK IPA"), "").trim(); this.lfm = user_lfm_k.length == 32 ? q("=yek_ipa&") + user_lfm_k : q("f50a8f9d80158a0fa0c673faec4584be=yek_ipa&"); this.yt = user_yt_k.length == 39 ? q("=yek&") + user_yt_k : q("wtiKiJ-Ro5_YHToFf-NyDz-Qaym1zcjPBySazIA=yek&"); this.v = user_yt_k.length == 39 && this.yt != q("wtiKiJ-Ro5_YHToFf-NyDz-Qaym1zcjPBySazIA=yek&") && user_lfm_k.length == 32 && this.lfm != q("f50a8f9d80158a0fa0c673faec4584be=yek_ipa&");
	
	this.sbarSet = () => {
		this.sbar_w = s.clamp(s.value(sbarMetrics[1], 11, 0), 0, 400); ppt.sbarBase_w = s.clamp(ppt.sbarBase_w, 0, 400);
		if (this.sbar_w != ppt.sbarBase_w) {this.scr_but_w = Math.min(s.value(sbarMetrics[3], 11, 0), this.sbar_w, 400); ppt.sbarMetrics = "Bar," + this.sbar_w +",Arrow," + this.scr_but_w + ",Gap(+/-)," + this.arrow_pad + ",GripMinHeight," + this.grip_h;} else {this.scr_but_w = s.clamp(s.value(sbarMetrics[3], 11, 0), 0, 400); this.sbar_w = s.clamp(this.sbar_w, this.scr_but_w, 400); ppt.sbarMetrics = "Bar," + this.sbar_w +",Arrow," + this.scr_but_w + ",Gap(+/-)," + this.arrow_pad + ",GripMinHeight," + this.grip_h;}
		ppt.sbarBase_w = this.sbar_w;
		if (this.sbarType == 2) {let themed_w = 21; try {themed_w = utils.GetSystemMetrics(2);} catch (e) {}; this.sbar_w = themed_w;}
		if (!this.sbarShow) this.sbar_w = 0;
		this.but_h = this.sbar_w + (this.sbarType != 2 ? 1 : 0); if (this.sbarType != 2) this.scr_but_w += 1; this.sbar_sp = this.sbar_w ? this.sbar_w + (this.sbar_w - this.scr_but_w < 5 || this.sbarType == 2 ? 1 : 0) : 0; this.arrow_pad = s.clamp(-this.but_h / 5, this.arrow_pad, this.but_h / 5); this.sbar_o = [2 + this.arrow_pad, Math.max(Math.floor(this.scr_but_w * 0.2), 3) + this.arrow_pad * 2, 0][this.sbarType];
	}; this.sbarSet();
}

function MediaLibrary() {
	const sync_mtags = ppt.sync_mtags.splt(0), useLibrary = ppt.useLibrary.split(",");
    this.mtags_installed = utils.CheckComponent("foo_tags", true); this.alb = parseFloat(useLibrary[0]); this.pc = ppt.tfPlaycount.trim(); this.rad = parseFloat(useLibrary[1]); this.rating = p.local ? "%_autorating%" : ppt.tfRating.trim(); this.top = parseFloat(useLibrary[2]); this.upd_yt_mtags = this.mtags_installed ? s.value(sync_mtags[1], 1, 1) : 0; this.upd_lib_mtags = this.mtags_installed ? s.value(sync_mtags[3], 1, 1) : 0;

    this.getRelativePath = (source, target) => {
        source = source.replace(/\\/g, "/"); target = target.replace(/\\/g, "/"); const sep = "/", targetArr = target.split(sep), sourceArr = source.split(sep), filename = targetArr.pop(), targetPath = targetArr.join(sep); let relativePath = ""; sourceArr.pop();
        while (!targetPath.includes(sourceArr.join(sep))) {sourceArr.pop(); relativePath += ".." + sep;}
        const relPathArr = targetArr.slice(sourceArr.length); relPathArr.length && (relativePath += relPathArr.join(sep) + sep); return relativePath + filename;
    }

    this.sort = (i, set) => {
        if (set) ppt.sortType = i;
        const sort_ar = [this.pc, this.rating, "$rand()", "%bitrate%", "%bitrate%", "%length%", "%length%", "%date%", "%date%"];
        this.track_pref = ["Most Played", "Highest Rated", "Random", "Highest Bitrate", "Lowest Bitrate", "Longest", "Shortest", "Latest", "Earliest"];
        const sort_dir = [0, 0, 1, 0, 1, 0, 1, 0, 1]; this.sort_rand = ppt.sortType == 2;
        this.dir = sort_dir[ppt.sortType]; this.item_sort = FbTitleFormat(sort_ar[ppt.sortType]);
    }; this.sort(); create_dl_file();

    const mtags_mng = () => {
        let album_o = "", mtags_date = 0, mtags_pth = "", mtags_yt = false;
        this.on_playback_time = () => {if (!mtags_yt) return; const handle = fb.GetNowPlaying(); if (!handle || !s.file(handle.Path)) return; const mod = s.lastModified(handle.Path); if (mtags_pth != handle.Path || mod == mtags_date) return; mtags_pth = handle.Path; mtags_date = mod; if (!lib) return; lib.upd = true; lib.update = true;}
        this.Execute = () => {const handle = fb.GetNowPlaying(); if (!handle || album_o == handle.Path || handle.Path.slice(-7) != "!!.tags") return; album_o = handle.Path; mtags_yt = false; if (fb.IsMetadbInMediaLibrary(handle)) {mtags_yt = handle.Path.slice(-7) == "!!.tags"; mtags_pth = handle.Path; mtags_date = s.lastModified(handle.Path);}}
    }; mtags_mng();
}

function Text() {
	const DT_RIGHT = 0x00000002, DT_CENTER = 0x00000001, DT_VCENTER = 0x00000004, DT_SINGLELINE = 0x00000020, DT_CALCRECT = 0x00000400, DT_NOCLIP = 0x00000100, DT_NOPREFIX = 0x00000800, DT_WORD_ELLIPSIS = 0x00040000;
    let pt = [["ADV.Radio Genre Menu", "Alternative,Alternative Rock,Classic Rock,Electronic,Experimental,Female Vocalists,Folk,Hard Rock,Hip Hop,Indie,Instrumental,Jazz,Metal,Pop,Progressive Rock,Punk,Rock", "TopGenre"], ["ADV.Radio Tag Menu", "10s,00s,90s,80s,70s,60s", "tags"], ["ADV.YouTube 'Preference' Verbose Log (Console)", false, "verbose"]]; ppt.init('manual', pt, this); pt = undefined;
    this.cc = DT_CENTER | DT_VCENTER | DT_CALCRECT | DT_NOPREFIX | DT_WORD_ELLIPSIS; this.ls = DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX; this.l = DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX | DT_WORD_ELLIPSIS; this.r = DT_RIGHT | DT_VCENTER | DT_SINGLELINE | DT_NOCLIP | DT_NOPREFIX | DT_WORD_ELLIPSIS;

    this.tags = this.tags.splt(1);
    this.TopGenre = this.TopGenre.splt(1);
    this.TopTags = this.TopGenre.concat(this.tags).filter(v => v.trim());

    this.halt = () => p.w <= but.yt_w || p.h <= but.yt_h || ppt.btn_mode;
    this.clickable = (x, y) => !ppt.showAlb && !this.halt() && !but.btns["yt"].trace(x, y);
    this.block = () => this.halt() || !window.IsVisible;
    this.rp = true; this.paint = () => {if (this.rp) window.Repaint();}; this.visible = "N/A";
    this.repaint = () => {if (ppt.showAlb || this.halt()) return; if (!ui.np_graphic) this.paint(); else if (this.rp) window.RepaintRect(10, Math.min(p.h * p.rel_imgs, p.h - img.ny), p.w - 20, Math.max(img.ny, p.h * (1 - p.rel_imgs)));}
}

function Playlists() {
	const rad_tracks = []; this.enabled = [];
	let pl_name = ppt.get(" Playlist: Names|Labels", "Album,Loved,Radio|Top,Tracks").replace(/^[,\s]+|[,\s]+$/g, "").split(/,|\|/); const pl_name4 = pl_name[4]; pl_name[4] = pl_name[2] + pl_name[4];
    if (!p.v) {this.top50 = Math.min(ppt.get(" Load Menu TopTracks Size 1-50", 50), 50); ppt.set(" Load Menu TopTracks Size 1+", null);} else {this.top50 = ppt.get(" Load Menu TopTracks Size 1+", 50); ppt.set(" Load Menu TopTracks Size 1-50", null);} this.menu = []; this.alb_yttm = " // YouTube Track Manager";

    this.setExistingPl = () => {
        this.enabled = []; ["alb", "loved", "rad", "tracks", "alb_orig"].forEach((v, i) => {
            const n = i == 3 ? pl_name[3] + pl_name4 : pl_name[i];
            this[v] = plman.FindPlaylist(!i ? n + (ml.alb && ml.mtags_installed ? " New" : "") : n);
            if (i < 4 && this[v] != -1) this.enabled.push({name: n, ix: this[v]});
        });
    }; this.setExistingPl();

    this.t50_playlist = pl_name[3] + this.top50; this.t40_playlist = pl_name[3] + 40; this.soft_playlist = pl_name[3] + pl_name4;
    this.active = () => plman.GetPlaylistName(plman.ActivePlaylist);
    this.create = n => {switch (n) {case "alb": this.alb = plman.FindOrCreatePlaylist(pl_name[0] + (ml.alb && ml.mtags_installed ? " New" : ""), false); break; case "loved": this.loved = plman.FindOrCreatePlaylist(pl_name[1], false); break; case "rad": this.rad = plman.FindOrCreatePlaylist(pl_name[2], false); break; case "top": this.tracks = plman.FindOrCreatePlaylist(pl_name[3] + pl_name4, false); break;}}
    this.exist = (n, sav_t50, top40) => {const name = sav_t50 ? (!top40 ? this.t50_playlist : this.t40_playlist) + " [" + n + "]" : (!top40 ? this.t50_playlist : this.t40_playlist) + ": " + n; for (let i = 0; i < plman.PlaylistCount; i++) {if (plman.GetPlaylistName(i) == name) return true;} return false;}
    this.playlists_changed = () => {this.setExistingPl(); this.menu = []; for (let i = 0; i < plman.PlaylistCount; i++) this.menu.push({name:plman.GetPlaylistName(i).replace(/&/g, "&&"), ix:i});}
	this.saveRadName = () => pl_name[4];
    this.t50 = (n, sav_t50, top40) => {if (!n) return; if (!sav_t50) {const name = (!top40 ? this.t50_playlist : this.t40_playlist) + ": " + n; let i = 0; for (i = 0; i < plman.PlaylistCount; i++) if (plman.GetPlaylistName(i).startsWith((!top40 ? this.t50_playlist : this.t40_playlist) + ": ")) {plman.RenamePlaylist(i, name); return i}; plman.CreatePlaylist(plman.PlaylistCount, name); return i;} else return plman.FindOrCreatePlaylist((!top40 ? this.t50_playlist : this.t40_playlist) + " [" + n + "]", false);}

    this.love = () => {
        this.create("loved"); const np = plman.GetPlayingItemLocation(); let pid, pn;
        if (fb.IsPlaying && np.IsValid) {pid = np.PlaylistItemIndex; pn = plman.PlayingPlaylist;}
        else {pid = plman.GetPlaylistFocusItemIndex(plman.ActivePlaylist); pn = plman.ActivePlaylist;}
        plman.ClearPlaylistSelection(pn); plman.SetPlaylistSelectionSingle(pn, pid, true);
        if (this.loved != pn) {plman.InsertPlaylistItems(this.loved, plman.PlaylistItemCount(this.loved), plman.GetPlaylistSelectedItems(pn), false);}
        else {plman.RemovePlaylistSelection(this.loved, false);}
    }

    this.save_radio = (playlistIndex, np) => {
        if (playlistIndex != this.rad || !np || !index.rad_source) return;
        const rdio_text = index.rad_type == 2 ? " And Similar Artists" : "", save_pl_index = plman.FindOrCreatePlaylist(pl_name[4] + " [" + index.rad_source + rdio_text + "]", false);
        const items = FbMetadbHandleList(), save_pl_count = plman.PlaylistItemCount(save_pl_index), sav_list = plman.GetPlaylistItems(save_pl_index);

        for (let i = 0; i < np.Count; i++)
        if (!rad_tracks.includes(np[i].Path)) {
            let found = false; for (let j = 0; j < sav_list.Count; j++)
            if (np[i].Path == sav_list[j].Path) found = true;
            if (!found) items.Add(np[i]); rad_tracks.push(np[i].Path);
        }
        plman.InsertPlaylistItems(save_pl_index, save_pl_count, items); if (rad_tracks.length > rad.limit * 2) rad_tracks.splice(0, 1);
    }
}

function Library() {
    const partialMatch = ppt.partialMatch.splt(0), filters = ppt.libFilters.split("|"), lib_upd = FbProfiler(), p1 = [], p2 = [], partialMatchConfig = ppt.partialMatchConfig.splt(0);
    let art_arr = [], db_alb, db_art, db_lib, last_time = lib_upd.Time, o_artist = "", n = [], sel = [], title_cut = "";
    this.artTracks; this.artTracksTags; this.filter = []; filters.unshift("None"); this.upd = true; this.update = true;
    filters.forEach(v => {v = p.local ? v.replace("%rating%", "%_autorating%").trim() : v.trim(); if (v.length) this.filter.push(v);});
    if (ppt.libFilterID > this.filter.length - 1) ppt.libFilterID = 0;
    this.partialMatchArt = partialMatch[1] == 1; this.partialMatchTitle = partialMatch[3] == 1; this.partialMatchType = ppt.partialMatchType.splt(0); if (this.partialMatchType[6] != "Top" + pl.top50 + ":40") {this.partialMatchType[6] = "Top" + pl.top50 + ":40"; ppt.partialMatchType = this.partialMatchType[0] + "," + this.partialMatchType[1] + "," + this.partialMatchType[2] + "," + this.partialMatchType[3] + "," + this.partialMatchType[4] + "," + this.partialMatchType[5] + "," + this.partialMatchType[6] + "," + this.partialMatchType[7] + "," + this.partialMatchType[8] + "," + this.partialMatchType[9];}
    const valid_regex = partialMatchConfig[3] && partialMatchConfig[3] != 0 && partialMatchConfig[3].length, fuz_sel_title = this.partialMatchTitle && (this.partialMatchType[5] == 1 || this.partialMatchType[5] == 3), trc_sel_art =  this.partialMatchArt && (this.partialMatchType[5] == 2 || this.partialMatchType[5] == 3), trc_title = this.partialMatchTitle && valid_regex, trc_sel_title = trc_title && (this.partialMatchType[5] == 2 || this.partialMatchType[5] == 3), fuz_alb_title = this.partialMatchTitle && (this.partialMatchType[1] == 1 || this.partialMatchType[1] == 3), trc_alb_art = this.partialMatchArt && (this.partialMatchType[1] == 2 || this.partialMatchType[1] == 3), trc_alb_title = this.partialMatchTitle && (this.partialMatchType[1] == 2 || this.partialMatchType[1] == 3)  && valid_regex, verbose = partialMatchConfig[5] == "true";
    let fu = parseFloat(partialMatchConfig[1]), q_alb = " IS ", has_sel = false; fu = s.clamp(fu, 0, 100) / 100; if (this.partialMatchArt && this.partialMatchType[5] != 0) has_sel = true; if (this.partialMatchArt && this.partialMatchType[1] != 0) q_alb = " HAS ";
    String.prototype.cut = function() {try {const n = this.split(RegExp(partialMatchConfig[3], "gi"))[0]; return n.length > 3 ? n : this;} catch (e) {return this;}};

    const check_match = (n, l) => 1 - levenshtein(n, l)/(n.length > l.length ? n.length : l.length) > fu;
    const levenshtein = (a, b) => {if (a.length === 0) return b.length; if (b.length === 0) return a.length; let i, j, prev, row, tmp, val; if (a.length > b.length) {tmp = a; a = b; b = tmp;} row = Array(a.length + 1); for (i = 0; i <= a.length; i++) row[i] = i; for (i = 1; i <= b.length; i++) {prev = i; for (j = 1; j <= a.length; j++) {if (b[i - 1] === a[j - 1]) val = row[j - 1]; else val = Math.min(row[j - 1] + 1, Math.min(prev + 1, row[j] + 1)); row[j - 1] = prev; prev = val;} row[a.length] = prev;} return row[a.length];}
    const load_iSelect = (orig_artist, p_title, handle, id, p_lfm_pc) => {if (p.add_loc.every(v => v.id !== id)) p.add_loc.push({"artist":orig_artist,"title":p_title,"handle":handle,"id":id,"playcount":p_lfm_pc});}
    const load_lib = (handle, id, v, p_ar, p_ti, p_t50) => {!p_t50 ? p.add_loc.push({"handle":handle,"id":id}) : p.t50_loc.push({"handle":handle,"id":id}); if (verbose) s.trace((!v ? "STANDARD MATCH " : v == 1 ? "FUZZY TITLE MATCH " : "TRUNCATE TITLE MATCH ") + "FOUND :: SEARCH: " + p_ar + " - " + p_ti);}
    const plIX = Playlist_Name => { let n = -1; for (let i = 0; i < plman.PlaylistCount; i++) if (plman.GetPlaylistName(i).includes(Playlist_Name)) {n = i; break;} return n;}
    const refFile = h => {let n = tf.i.EvalWithMetadb(h); if (n.includes("file://") && n.slice(-5) != ".tags") {n = n.replace("file://", "");} else n = ""; return n;}
    const remove_playlist = name => {let i = plman.PlaylistCount; while (i--) if (plman.GetPlaylistName(i).includes(name)) plman.RemovePlaylist(i);}

    this.alb_playlist = (a_n) => {if (!a_n) return; let d_l = s.query(db_alb, name.q_a + " IS " + a_n); if (d_l.Count) return true; d_l = s.query(this.get_lib_items(), name.q_a + " IS " + a_n); if (d_l.Count) return true;}
    this.get_album_artist = () => {const pn = plIX(pl.alb_yttm); if (pn == -1 || !plman.PlaylistItemCount(pn)) return; const db_aa = plman.GetPlaylistItems(pn); this.albumartist = tf.a0.EvalWithMetadb(db_aa[0]);}
    this.get_album_metadb = () => {db_alb = plman.GetPlaylistItems(pl.alb_orig); db_alb.AddRange(plman.GetPlaylistItems(pl.alb));}
    this.get_lib_items = () => {if (!this.update) return db_lib; this.update = false; db_lib = fb.GetLibraryItems(); if (ppt.libFilterID) db_lib = s.query(db_lib, this.filter[ppt.libFilterID]); return db_lib;}
    this.in_library_art = p_artist => {if (!p_artist) return false; return get_lib_artists().some(v => v == p_artist.toLowerCase());}

    const get_lib_artists = () => {
        if (!this.upd) return art_arr; art_arr = []; const db_artists = this.get_lib_items().Clone(); let art_o = ""; db_artists.OrderByFormat(tf.a0, 0); const art = tf.a0.EvalWithMetadbs(db_artists);
        db_artists.Convert().forEach((h, i) => {
            if (h.Path.slice(-7).toLowerCase() == "!!.tags" || h.Path.slice(-4).toLowerCase() == ".cue") return;
            art[i] = art[i].toLowerCase();
            if (art[i] && art_o != art[i]) art_arr.push(art[i]); art_o = art[i];
        });
        this.upd = false; return art_arr;
    }

    this.in_library = (p_artist, p_title, i, p_top50, p_alb_set) => {
        if (!p_artist || !p_title) return false; let q = " IS ";
        const fuzzy = this.partialMatchTitle && ((p_top50 && (this.partialMatchType[7] == 1 || this.partialMatchType[7] == 3)) || (p_alb_set && (this.partialMatchType[9] == 1 || this.partialMatchType[9] == 3)) || (!p_top50 && !p_alb_set && (this.partialMatchType[3] == 1 || this.partialMatchType[3] == 3)));
        const trunc_art = this.partialMatchArt && ((p_top50 && (this.partialMatchType[7] == 2 || this.partialMatchType[7] == 3)) || (p_alb_set && (this.partialMatchType[9] == 2 || this.partialMatchType[9] == 3)) || (!p_top50 && !p_alb_set && (this.partialMatchType[3] == 2 || this.partialMatchType[3] == 3)));
        const trunc_title = trc_title && ((p_top50 && (this.partialMatchType[7] == 2 || this.partialMatchType[7] == 3)) || (p_alb_set && (this.partialMatchType[9] == 2 || this.partialMatchType[9] == 3)) || (!p_top50 && !p_alb_set && (this.partialMatchType[3] == 2 || this.partialMatchType[3] == 3)));
        if (trunc_art) p_artist = p_artist.cut().trim();
        if (this.partialMatchArt && ((p_top50 && this.partialMatchType[7] != 0) || (p_alb_set && this.partialMatchType[9] != 0) || (!p_top50 && !p_alb_set && this.partialMatchType[3] != 0))) q = " HAS ";
        if (verbose) s.trace("MATCH: ARTIST QUERY:" + q + p_artist);
		if (p_artist != o_artist || lib_upd.Time - last_time > 2000) {db_art = s.query(this.get_lib_items(), "(" + name.q_a + q + p_artist + ") AND (NOT %path% HAS !!.tags)"); db_art.OrderByFormat(tf.r, 1); if (!ml.sort_rand) db_art.OrderByFormat(ml.item_sort, ml.dir);}
        p1[i] = ""; o_artist = p_artist; p_title = p_title.strip(); lib_upd.Reset(); last_time = lib_upd.Time;
        const titles = tf.t0.EvalWithMetadbs(db_art); let found = false;
        db_art.Convert().some((h, j) => {
            titles[j] = titles[j].strip();
            if (titles[j] == p_title) {load_lib(h, i, 0, p_artist, p_title, p_top50); return found = true;}
            if (fuzzy) {if (check_match(p_title, titles[j])) {load_lib(h, i, 1, p_artist, p_title, p_top50); return found = true;}}
            if (trunc_title) {title_cut = p_title.cut(); if (titles[j].cut() == title_cut) {load_lib(h, i, 1, p_artist, title_cut, p_top50); return found = true;}}
        });
        if (found) return true;
        if (verbose) s.trace("NO LIBRARY MATCH FOUND :: SEARCH: " + p_artist + " - " + p_title); return false;
    }

    this.iSelectMatch = (p_artist, p_title, p_lfm_pc) => {
        if (!p_artist || !p_title) return false; const orig_artist = p_artist; p_artist = p_artist.toUpperCase();
        if (trc_sel_art) p_artist = p_artist.cut().trim(); p_title = p_title.strip();
        let found = false;
        sel.some((v, j) => {
            if (found) return true;
            if (!has_sel ? v.artist == p_artist : v.artist.includes(p_artist)) {
                sel[j].item.some((w) => {
                    if (w.title == p_title) {
                        load_iSelect(orig_artist, p_title, w.handle, w.id, p_lfm_pc);
                        return found = true;
                }});
                if (fuz_sel_title && !found) {
                        sel[j].item.some((w) => {
                            if (check_match(p_title, w.title)) {
                                load_iSelect(orig_artist, p_title, w.handle, w.id, p_lfm_pc);
                                return found = true;
                }});}
                if (trc_sel_title && !found) {
                    title_cut = p_title.cut();
                    sel[j].item.some((w) => {
                        if (w.title.cut() == title_cut) {
                            load_iSelect(orig_artist, p_title, w.handle, w.id, p_lfm_pc);
                            return found = true;
                }});}
            }
        });
        if (verbose && !found) s.trace("NO LIBRARY MATCH FOUND :: SEARCH: " + p_artist + " - " + p_title + " MATCH: ARTIST QUERY: " + (has_sel ? "HAS" : "IS " + p_artist));
    }

    this.iSelectRefine = (li) => {
        let i = 0, nm_o = "#get_node#", pth; li.OrderByFormat(tf.r, 1); li.OrderByFormat(tf.t, 1); if (!ml.sort_rand) li.OrderByFormat(ml.item_sort, ml.dir); li.OrderByFormat(tf.a, 1); sel = [];
        const artists = tf.a0.EvalWithMetadbs(li), titles = tf.t0.EvalWithMetadbs(li);
        li.Convert().forEach((h, l) => {
            artists[l] = artists[l].toUpperCase();
            if (artists[l] != nm_o) {
                nm_o = artists[l]; sel[i] = {artist:artists[l], item:[]};
                sel[i].item.push({title:titles[l].strip(), handle:h, id:l}); i++;
            }
			else sel[i - 1].item.push({title:titles[l].strip(),handle:h, id:l});
        });
    }

    this.artistTracks = (p_album_artist) => {
        if (trc_alb_art) p_album_artist = p_album_artist.cut().trim();
        if (this.partialMatchArt && verbose) s.trace("MATCH ARTIST [ALBUM]: QUERY:" + q_alb + p_album_artist);
        if (!p_album_artist) {this.artTracks = FbMetadbHandleList(); this.artTracksTags = FbMetadbHandleList(); return;} const d_lb = this.get_lib_items().Clone();
        this.artTracks = s.query(d_lb, "(" + name.q_a + q_alb + p_album_artist + ") AND (NOT %path% HAS .tags) AND (NOT \"$ext(%path%)\" IS cue)");
        this.artTracks.OrderByFormat(tf.r, 1); if (!ml.sort_rand) this.artTracks.OrderByFormat(ml.item_sort, ml.dir);
        this.artTracksTags = s.query(d_lb, "(" + name.q_a + q_alb + p_album_artist + ") AND (%path% HAS .tags) AND (NOT \"$ext(%path%)\" IS cue)");
        this.artTracksTags.OrderByFormat(tf.r, 1); if (!ml.sort_rand) this.artTracksTags.OrderByFormat(ml.item_sort, ml.dir);
    }

    this.in_library_alb = (p_alb_id, p_artist, p_title, p_album, p_date, i, p_upd) => {
        if (!p_title) return false; n[i] = 0; p2[i] = ""; const search_title = p_title, type_arr = ["", "YouTube Track", "Prefer Library Track", "Library Track"]; let tfa = "", title = p_title; p_title = p_title.strip();
        const titles = tf.t0.EvalWithMetadbs(this.artTracks), titles_tags = tf.t0.EvalWithMetadbs(this.artTracksTags);
        this.artTracks.Convert().some((h, k) => {
            if (titles[k].strip() == p_title) {
                p2[i] = h.Path; n[i] = 1;
                tfa = h; return true;
        }});
        if (!n[i]) this.artTracksTags.Convert().some((h, k) => {
            if (titles_tags[k].strip() == p_title) {
                p2[i] = refFile(h);
                if (p2[i]) {n[i] = 2; tfa = h; return true;}
        }});
        if (verbose) s.trace("STANDARD MATCH " + (n[i] ?  "" : "NOT ") + "FOUND [ALBUM] SEARCH: " + p_artist + " - " + p_title);
        if (!n[i] && fuz_alb_title) {
            this.artTracks.Convert().some((h, k) => {
                if (check_match(p_title, titles[k].strip())) {
                    p2[i] = h.Path; n[i] = 1; tfa = h; return true;
            }});
            if (!n[i]) this.artTracksTags.Convert().some((h, k) => {
                if (check_match(p_title, titles_tags[k].strip())) {
                    p2[i] = refFile(h); if (p2[i]) {n[i] = 2; tfa = h; return true;}
            }});
            if (verbose) s.trace("FUZZY TITLE MATCH " + (n[i] ?  "" : "NOT ") + "FOUND [ALBUM] :: SEARCH: " + p_artist + " - " + p_title);
        }
        p_title = p_title.cut(); title = title.cut();
        if (!n[i] && trc_alb_title) {
            this.artTracks.Convert().some((h, k) => {
                if (titles[k].strip().cut() == p_title) {
                    p2[i] = h.Path; n[i] = 1; tfa = h; return true;
            }});
            if (!n[i]) this.artTracksTags.Convert().some((h, k) => {
                if (titles_tags[k].strip().cut() == p_title) {
                    p2[i] = refFile(h); if (p2[i]) {n[i] = 2; tfa = h; return true;}
            }});
            if (verbose) s.trace("TRUNCATE TITLE MATCH " + (n[i] ?  "" : "NOT ") + "FOUND [ALBUM] :: SEARCH: " +p_artist + " - " + p_title);
        }
        if (verbose && !n[i]) s.trace("NO LIBRARY MATCH FOUND [ALBUM] :: SEARCH: " + p_artist + " - " + p_title);
        if (n[i]) {
            const tf_d = tf.d.EvalWithMetadb(tfa) || [], tf_rg = tf.rg.EvalWithMetadb(tfa) || [], tf_rp = tf.rp.EvalWithMetadb(tfa) || [];
            if (p_upd) return [p_alb_id,"/" + p2[i].replace(/\\/g, "/"), tf_d, tf_rg, tf_rp, i];
            p.mtags[p_alb_id].push({"@":"/" + p2[i].replace(/\\/g, "/"),"ALBUM":p_album,"ARTIST":p_artist,"DATE":p_date,"DURATION":tf_d,"REPLAYGAIN_TRACK_GAIN":tf_rg,"REPLAYGAIN_TRACK_PEAK":tf_rp,"TITLE":title,"TRACKNUMBER":i.toString(),"YOUTUBE_TITLE":[],"YOUTUBE_TRACK_MANAGER_SEARCH_TITLE":search_title ? search_title : [],"YOUTUBE_TRACK_MANAGER_TRACK_TYPE":type_arr[ml.alb]});
        } return !p_upd ? n[i] : [];
    }

    this.albums_playlist = (a_n) => {
        remove_playlist(pl.alb_yttm); this.albumartist = a_n; if (!a_n) return;
        const d_li = s.query(db_alb, name.q_a + " IS " + a_n);
        d_li.AddRange(s.query(this.get_lib_items(), name.q_a + " IS " + a_n));
        d_li.Sort(); d_li.OrderByFormat(tf.pl, 1);
        const pn = plman.FindOrCreatePlaylist("Albums [" + this.albumartist + "]" + pl.alb_yttm, false);
        plman.InsertPlaylistItems(pn, 0, d_li);
        plman.ActivePlaylist = pn; plman.SetPlaylistFocusItem(pn, 0); plman.ClearPlaylistSelection(pn);
    }
}
setTimeout(() => {pl.playlists_changed(); lib = new Library(); if (ml.alb) lib.artistTracks(alb.artist); lib.get_album_metadb(); lib.get_album_artist(); ml.Execute();}, 500);

function Blacklist() {
    const n = fb.ProfilePath + "yttm\\" + "blacklist.json"; this.remove = true; this.undo = [];
    this.list = clean_artist => {
        let black_list = []; if (!s.file(n)) return black_list;
        const list = s.jsonParse(n, false, 'file'); if (!list.blacklist[clean_artist]) return black_list;
        black_list = list.blacklist[clean_artist].map(v => v.id); return black_list;
    }
    this.removeNulls = o => {
        const isArray = $.isArray(o);
        Object.keys(o).forEach(v => {
            if (o[v].length == 0) isArray ? o.splice(v, 1) : delete o[v];
            else if (typeof o[v] == "object") this.removeNulls(o[v]);
    });}
}

function Youtube_search(state_callback, on_search_done_callback) {
    const channelTitle = [], description = [], length = [], link = [], title = [];
    let alb_id, alb_set, alt_id = -1, done, feedback = false, first_id = -1, fn = "", full_alb = false, get_length = false, ix, metadata, mtags = false, orig_title, pn, search_artist, search_title, top50, type, yt_filt = ppt.yt_filter, yt_title = "";
    const secs = n => {const re = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/; if (re.test(n)) {const m = re.exec(n); return (Number(m[1]) * 3600 || 0) + (Number(m[2]) || 0) * 60 + (Number(m[3]) || 0);}}
    this.xmlhttp = null; this.func = null; this.ready_callback = state_callback; this.on_search_done_callback = on_search_done_callback; this.ie_timer = null;
    this.Null = () => {if (full_alb && !fn) {alb.set_row(alb_id, 0, search_artist); t.paint();} this.on_search_done_callback(alb_id, "", search_artist, "", "", done, top50, pn);}

    this.on_state_change = () => {
        if (this.xmlhttp != null && this.func != null) if (this.xmlhttp.readyState == 4) {
            clearTimeout(this.ie_timer); this.ie_timer = null;
            if (this.xmlhttp.status == 200) this.func();
            else {this.Null(); s.trace("youtube N/A: " + this.xmlhttp.responseText || "Status error: " + this.xmlhttp.status);}
        }
    }

    this.Search = (p_alb_id, p_artist, p_title, p_ix, p_done, p_top50, p_pn, p_extra_metadata, p_alb_set, p_full_alb, p_fn, p_type) => {
        this.func = null; this.xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        let URL = "https://www.googleapis.com/youtube/v3/";
        if (!get_length) {
            alb_id = p_alb_id; search_artist = p_artist; orig_title = p_title; search_title = p_title; ix = p_ix; done = p_done; top50 = p_top50; pn = p_pn; metadata = p_extra_metadata; alb_set = p_alb_set; full_alb = p_full_alb; fn = p_fn; type = p_type; mtags = ml.alb && ml.mtags_installed && alb_id !== "" && !alb_set;
            if (!search_artist || !search_title) return this.Null(); if (yt_filt) yt_filt = !index.filter_yt(search_title, "");
            URL += "search?part=snippet&maxResults=25&q=" + encodeURIComponent(p_artist + " " + p_title) + "&order=" + p.yt_order + "&type=video&fields=items(id(videoId),snippet(title)" + (yt_filt || index.yt_pref ? ",snippet(description)" : "") + (index.yt_pref ? ",snippet(channelTitle)" : "") + ")" + p.yt;
        } else URL += "videos?part=contentDetails&id=" + link + "&fields=items(contentDetails(duration))" + p.yt;
        this.func = this.Analyse; this.xmlhttp.open("GET", URL); this.xmlhttp.onreadystatechange = this.ready_callback;
		if (!this.ie_timer) {const a = this.xmlhttp; this.ie_timer = setTimeout(() => {a.abort(); if (full_alb && !fn) {alb.set_row(alb_id, 0, search_artist); t.paint();} this.on_search_done_callback(alb_id, "", search_artist, "", "", "force"); this.ie_timer = null;}, 30000);}
		this.xmlhttp.send();
    }

    this.Analyse = () => {
        const data = s.jsonParse(this.xmlhttp.responseText, false, 'get', 'items'); let url = "";
        if (data && !get_length) {
            data.forEach(v => {
                if (v.id && v.id.videoId) {title.push(v.snippet.title); link.push(v.id.videoId);}
                if (yt_filt || index.yt_pref) {const d = v.snippet.description; description.push(d ? d : "");}
                if (index.yt_pref) {const ct = v.snippet.channelTitle; channelTitle.push(ct ? ct : "");}
            });
            get_length = true; return this.Search();
        } let v_length = 0;
        if (data && get_length) {
            data.forEach((v, i) => {
                length[i] = secs(v.contentDetails.duration) || ""; link[i] = "v=" + link[i];
            });
            const m = this.IsGoodMatch(title, link, yt_filt || index.yt_pref ? description : "", index.yt_pref ? channelTitle : "", length, data.length);
            if (m != -1) {
                search_title = search_title.cleanse().strip_title(search_artist, true); v_length = length[m];
                url = "3dydfy://www.youtube.com/watch?" + (!mtags ? (metadata ? metadata + "&" : "") + "fb2k_title=" + encodeURIComponent(search_title + (!full_alb ? "" : " (Full Album)")) + "&3dydfy_alt_length=" + encodeURIComponent(v_length) + "&fb2k_artist=" + encodeURIComponent(search_artist) + "&" : "") + link[m]; yt_title = title[m];
                if (t.verbose && !feedback) s.trace("MATCHED: Artist - Title: " + "Search Artist: " + search_artist + "; Search Title: " + search_title + "; Video Loaded: ix: " + m + "; Video Title: " + title[m]);
            }
        }
        if (!get_length) return;
        if (!url.length) {
            if (full_alb) return this.Null(); const id = alt_id != -1 ? alt_id : first_id; if (id != -1) v_length = length[id]; else return this.Null();
            if (t.verbose) s.trace("IDEAL MATCH NOT FOUND. Search Artist: " + search_artist + "; Search Title: " + search_title + "; Video Loaded: ix: " + id + "; Video Title: " + title[id]); search_title = title[id].cleanse().strip_title(search_artist);
            url = "3dydfy://www.youtube.com/watch?" + (!mtags ? (metadata ? metadata + "&" : "") + "fb2k_title=" + encodeURIComponent(search_title) + "&3dydfy_alt_length=" + encodeURIComponent(v_length) + "&fb2k_artist=" + encodeURIComponent(search_artist) + "&" : "") + link[id]; yt_title = title[id];
        }
        this.on_search_done_callback(alb_id, url, search_artist, search_title, ix, done, top50, pn, alb_set, v_length, orig_title, yt_title, full_alb, fn, type);
    }

    this.IsGoodMatch = (video_title, video_id, video_descr, video_uploader, video_len, p_done) => {
        const base_OK = [], bl_artist = search_artist.tidy(), clean_artist = s.removeDiacritics(search_artist.replace(/&/g, "").replace(/\band\b/gi, "").strip()), clean_title = s.removeDiacritics(search_title.replace(/&/g, "").replace(/\band\b/gi, "").strip()), mv = [];
        let i = 0, j = 0, k = 0;
        for (i = 0; i < p_done; i++) {
            const clean_vid_title = s.removeDiacritics(video_title[i].replace(/&/g, "").replace(/\band\b/gi, "").strip()); base_OK[i] = video_len[i] && (!full_alb ? video_len[i] < 1800 : video_len[i] > 1800) && (!blk.list(bl_artist).length ? true : !blk.list(bl_artist).includes(video_id[i])) && (!yt_filt ? true : !index.filter_yt(video_title[i], video_descr[i]));
            if (clean_vid_title.includes(clean_artist) && clean_vid_title.includes(clean_title) && base_OK[i]) {if (!index.yt_pref) return i; else mv.push({ix:i, uploader:video_uploader[i], title:video_title[i], descr:video_descr[i]});}
        }
        if (mv.length) {
            if (t.verbose) s.trace("Match List. Search Artist: " + search_artist + "; Search Title: " + search_title + "\n" + JSON.stringify(mv, null, 3));
            for (k = 0; k < index.yt_pref_kw.length; k++) {for (j = 0; j < mv.length; j++) if (index.pref_yt(index.yt_pref_kw[k], (index.chk_upl ? mv[j].uploader : "") + (index.chk_title ? mv[j].title : "") + (index.chk_descr ? mv[j].descr : ""))) {if (t.verbose) s.trace("MATCHED: Artist - Title AND Preference Keyword: " + index.yt_pref_kw[k] + ": Search Artist: "+ search_artist + "; Search Title: " + search_title + "; Video Loaded: ix: " + mv[j].ix + "; Video Title: " + mv[j].title + ". Keywords checked vs" + (index.chk_upl ? " Uploader" : "") + (index.chk_title ? " Title" : "") + (index.chk_descr ? " Descr" : "")); feedback = true; return mv[j].ix;} if (k == index.yt_pref_kw.length - 1) {if (t.verbose) s.trace("MATCHED: Artist - Title ONLY. NO preference keyword match." + " Search Artist: "+ search_artist + "; Search Title: " + search_title + "; Video Loaded: ix: " + mv[0].ix + "; Video Title: " + mv[0].title + ". Keywords checked vs" + (index.chk_upl ? " Uploader" : "") + (index.chk_title ? " Title" : "") + (index.chk_descr ? " Descr" : "")); feedback = true; return mv[0].ix;}}
        } else if (t.verbose && index.yt_pref) s.trace("NO Artist - Title matches. Keyword preference N/A. Search Artist: " + search_artist + "; Search Title: " + search_title);
        for (i = 0; i < p_done; i++) {if (first_id == -1) first_id = i; if (alt_id == -1 && base_OK[i]) alt_id = i;} return -1;
    }
}

function Youtube_video_available(state_callback, on_search_done_callback) {
    let alb_id, artist, done, fn, i, full_alb = false, title, type;
    this.xmlhttp = null; this.func = null; this.ready_callback = state_callback; this.on_search_done_callback = on_search_done_callback;

    this.on_state_change = () => {
        if (this.xmlhttp != null && this.func != null) if (this.xmlhttp.readyState == 4) {
            if (this.xmlhttp.status == 200) this.func();
            else {s.trace("youtube N/A: " + this.xmlhttp.responseText || "Status error: " + this.xmlhttp.status);}
        }
    }

    this.Search = (p_alb_id, p_artist, p_title, p_i, p_done, p_id, p_full_alb, p_fn, p_type) => {
        alb_id = p_alb_id; artist = p_artist; done = p_done; fn = p_fn; i = p_i; full_alb = p_full_alb; title = p_title; type = p_type;
        this.func = null; this.xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		const URL = "https://www.googleapis.com/youtube/v3/videos?id=" + p_id + "&part=status" + p.yt;
        this.func = this.Analyse; this.xmlhttp.open("GET", URL); this.xmlhttp.onreadystatechange = this.ready_callback; this.xmlhttp.send();
    }

    this.Analyse = () => {
		const data = s.jsonParse(this.xmlhttp.responseText, [], 'get', 'items');
		this.on_search_done_callback(alb_id, artist, title, i, done, full_alb, fn, type, data.length);
	}
}

function Check_mTags() {
    if (!ml.upd_yt_mtags && !ml.upd_lib_mtags) return;
    const chk = [], alb_done = [], def_type = [], full_alb = [], lib_upd = FbProfiler(), m_a = [], m_i = [], m_l = [], m_lib = [], m_p = [], m_t = [], m_ty = [], m_v = [], mod = [], mtags_json = fb.ProfilePath + "yttm\\" + "m-TAGS.json", mtags_timer = [], rec = [], type = [], type_arr = ["", "YouTube Track", "Prefer Library Track", "Library Track"], video = [];
    let alb_id = -1, album_o = "", last_time = lib_upd.Time, m = [], o_artist = ""; if (!s.file(mtags_json)) {s.save(mtags_json, JSON.stringify(m, null, 3), true);}
    const DriveOn = drv => {if (!s.fs.DriveExists(drv) || !s.fs.GetDrive(drv).IsReady) return false; return true;}
    const getAbsolutePath = (base, relative) => {relative = relative.replace(/\\/g, "/"); const stack = base.split("/"), parts = relative.split("/"); stack.pop(); for (let i = 0; i < parts.length; i++) {if (parts[i] == ".") continue; if (parts[i] == "..") stack.pop(); else stack.push(parts[i]);} return stack.join("/");}
    const reset_mtags_timer = p_alb_id => {if (mtags_timer[p_alb_id]) clearTimeout(mtags_timer[p_alb_id]); mtags_timer[p_alb_id] = null;}

    this.Execute = () => {
        const handle = fb.GetNowPlaying(); if (!handle || album_o == handle.Path) return; album_o = handle.Path; if (handle.Path.slice(-7) != "!!.tags" || !s.file(mtags_json)) return;
        m = s.jsonParse(mtags_json, false, 'file'); const now = Date.now(), recent = v => v.time > now - p.One_Day, recentlyChecked = v => v.path == handle.Path;
        m = m.filter(recent); if (m.some(recentlyChecked)) return;
        m.push({"path":handle.Path, "time":now}); s.save(mtags_json, JSON.stringify(m, null, 3), true);
        if (alb_id == 19) alb_id = 0; else alb_id++; run_test(alb_id, handle.Path);
    }

    const on_check_mtags_done = (p_alb_id, p_artist, p_title, p_i, p_done, p_full_alb, p_fn, p_type, p_available) => {
        if (!p_available) {
            const yt_search = new Youtube_search(() => yt_search.on_state_change(), on_youtube_search_done);
            yt_search.Search(p_alb_id, p_artist, p_title, p_i, p_done, "", "", "", "", p_full_alb, p_fn, p_type);
        } else on_youtube_search_done(p_alb_id, "", p_artist, p_title, p_i, p_done, "", "", "", "", "", "", p_full_alb, p_fn, p_type);
    }

    const on_youtube_search_done = (p_alb_id, p_url, p_artist, p_title, p_i, p_done, p_top50, p_pn, p_alb_set, p_length, p_orig_title, p_yt_title, p_full_alb, p_fn, p_type) => {
        rec[p_alb_id]++;
        if (typeof p_i === 'number') {if (p_url) {mod[p_alb_id] = true;
            chk[p_alb_id].some((v, i) => {
                if (i == p_i) {
                    v["@"] = p_url; v.DURATION = p_length.toString(); v.REPLAYGAIN_TRACK_GAIN = []; v.REPLAYGAIN_TRACK_PEAK = []; !p_full_alb ? v.TITLE = p_title : v.TITLE = p_title + " (Full Album)"; v.YOUTUBE_TITLE = p_yt_title ? p_yt_title : [];
                    return true;
                }
            });
            if (!chk[p_alb_id][p_i].DURATION) {mod[p_alb_id] = true; chk[p_alb_id][p_i].DURATION = [];} if (!chk[p_alb_id][p_i].REPLAYGAIN_TRACK_GAIN) {mod[p_alb_id] = true; chk[p_alb_id][p_i].REPLAYGAIN_TRACK_GAIN = [];} if (!chk[p_alb_id][p_i].REPLAYGAIN_TRACK_PEAK) {mod[p_alb_id] = true; chk[p_alb_id][p_i].REPLAYGAIN_TRACK_PEAK = [];} if (!chk[p_alb_id][p_i].YOUTUBE_TITLE) {mod[p_alb_id] = true; chk[p_alb_id][p_i].YOUTUBE_TITLE = [];}}
        }
        if (rec[p_alb_id] == alb_done[p_alb_id] && mod[p_alb_id]) {
            chk[p_alb_id].forEach(v => v = s.sortKeys(v));
            s.save(p_fn, JSON.stringify(chk[p_alb_id], null, 3), true);
        }
    }

    const test = (p_alb_id, p_artist, p_title, p_i, p_done, p_id, p_full_alb, p_fn, p_loc, p_type) => {
        if (!p_artist || !p_title) return on_youtube_search_done(p_alb_id, "", p_artist, p_title, p_i, p_done, "", "", "", "", "", "", p_full_alb, p_fn, p_type);
        let yt_video_available;
        switch (p_type) {
            case 1: // YouTube track only
                if (!p_id) return on_youtube_search_done(p_alb_id, "", p_artist, p_title, p_i, p_done, "", "", "", "", "", "", p_full_alb, p_fn, p_type);
                yt_video_available = new Youtube_video_available(() => yt_video_available.on_state_change(), on_check_mtags_done);
                yt_video_available.Search(p_alb_id, p_artist, p_title, p_i, p_done, p_id, p_full_alb, p_fn, p_type);
                break;
            case 2: // Prefer library track
                if (ml.upd_lib_mtags) {
                    if (p_loc.charAt() == "/" || p_loc.charAt() == ".") {
                        if (!fb.IsLibraryEnabled()) return on_youtube_search_done(p_alb_id, "", p_artist, p_title, p_i, p_done, "", "", "", "", "", "", p_full_alb, p_fn, p_type);
                        if (p_loc.charAt() == "/") p_loc = p_loc.substring(1); else if (p_loc.charAt() == ".") {let base = p_fn.replace(/\\/g, "/"); if (base.includes("/")) base = base.substring(0, base.lastIndexOf("/") + 1); p_loc = getAbsolutePath(base, p_loc);}
                        const f = p_loc.indexOf("|"); if (f != -1) p_loc = p_loc.substring(0, f);
                        if (s.file(p_loc) || !DriveOn(p_loc.substr(0, 3))) return on_youtube_search_done(p_alb_id, "", p_artist, p_title, p_i, p_done, "", "", "", "", "", "", p_full_alb, p_fn, p_type);
                }}
                // Recheck if YouTube track now in library & for dead library references
                if (p_id || ml.upd_lib_mtags) {
                    if (p_artist != o_artist || lib_upd.Time - last_time > 2000) lib.artistTracks(p_artist); o_artist = p_artist; lib_upd.Reset(); last_time = lib_upd.Time;
                    const lib_test = lib.in_library_alb(alb_id, p_artist, p_title, "", "", p_i, true);
                    if (lib_test.length) {
                        mod[p_alb_id] = true;
                        chk[lib_test[0]].some((v, i) => {
                            if (i == lib_test[5]) {
                                const chr = v["@"].charAt();
                                v["@"] = chr == "/" ? lib_test[1] : chr == "." ? ml.getRelativePath("/" + p_fn, lib_test[1]) : ppt.abs_path ? lib_test[1] : ml.getRelativePath("/" + p_fn, lib_test[1]);
                                v.DURATION = lib_test[2]; v.REPLAYGAIN_TRACK_GAIN = lib_test[3]; v.REPLAYGAIN_TRACK_PEAK = lib_test[4]; v.TITLE = p_title; v.YOUTUBE_TITLE = [];
                                on_youtube_search_done(p_alb_id, "", p_artist, p_title, p_i, p_done, "", "", "", "", "", "", p_full_alb, p_fn, p_type);
                                return;
                }});}}
                if (!p_id || !ml.upd_yt_mtags) return on_youtube_search_done(p_alb_id, "", p_artist, p_title, p_i, p_done, "", "", "", "", "", "", p_full_alb, p_fn, p_type);
                yt_video_available = new Youtube_video_available(() => yt_video_available.on_state_change(), on_check_mtags_done);
                yt_video_available.Search(p_alb_id, p_artist, p_title, p_i, p_done, p_id, p_full_alb, p_fn, p_type);
                break;
            case 3: // Library track only
                if (!ml.upd_lib_mtags || !fb.IsLibraryEnabled()) return on_youtube_search_done(p_alb_id, "", p_artist, p_title, p_i, p_done, "", "", "", "", "", "", p_full_alb, p_fn, p_type);
                if (p_loc.charAt() == "/" || p_loc.charAt() == ".") {
                    if (p_loc.charAt() == "/") p_loc = p_loc.substring(1); else if (p_loc.charAt() == ".") {let base = p_fn.replace(/\\/g, "/"); if (base.includes("/")) base = base.substring(0, base.lastIndexOf("/") + 1); p_loc = getAbsolutePath(base, p_loc);}
                    const f = p_loc.indexOf("|"); if (f != -1) p_loc = p_loc.substring(0, f);
                    if (s.file(p_loc) || !DriveOn(p_loc.substr(0, 3))) return on_youtube_search_done(p_alb_id, "", p_artist, p_title, p_i, p_done, "", "", "", "", "", "", p_full_alb, p_fn, p_type);
                    if (p_artist != o_artist || lib_upd.Time - last_time > 2000) lib.artistTracks(p_artist); o_artist = p_artist; lib_upd.Reset(); last_time = lib_upd.Time;
                    const lib_test = lib.in_library_alb(alb_id, p_artist, p_title, "", "", p_i, true);
                    if (lib_test.length) {
                        mod[p_alb_id] = true;
                        chk[lib_test[0]].forEach((v, i) => {
                            if (i == lib_test[5]) {
                                const chr = v["@"].charAt();
                                v["@"] = chr == "/" ? lib_test[1] : chr == "." ? ml.getRelativePath("/" + p_fn, lib_test[1]) : ppt.abs_path ? lib_test[1] : ml.getRelativePath("/" + p_fn, lib_test[1]);
                                v.DURATION = lib_test[2]; v.REPLAYGAIN_TRACK_GAIN = lib_test[3]; v.REPLAYGAIN_TRACK_PEAK = lib_test[4]; v.TITLE = p_title;
                }});}}
                on_youtube_search_done(p_alb_id, "", p_artist, p_title, p_i, p_done, "", "", "", "", "", "", p_full_alb, p_fn, p_type)
                break;
        }
    }

    const run_test = (ix, p_handle) => {
        m_p[ix] = p_handle; chk[ix] = s.jsonParse(m_p[ix], false, 'file'); if (!chk[ix].length) return; reset_mtags_timer(ix); alb_done[ix] = Math.min(150, chk[ix].length); def_type[ix] = []; m_lib[ix] = false; mod[ix] = false; rec[ix] = 0; type[ix] = []; video[ix] = false;
		let j = alb_done[ix]; while (j--) if (typeof chk[ix][j]["@"] !== 'string') {chk[ix].splice(j, 1); alb_done[ix]--;}
        for (m_i[ix] = 0; m_i[ix] < alb_done[ix]; m_i[ix]++) {if (chk[ix][m_i[ix]]["@"].startsWith('3dydfy:')) video[ix] = true; if (chk[ix][m_i[ix]]["@"].charAt() == "/" || chk[ix][m_i[ix]]["@"].charAt() == ".") m_lib[ix] = true;} def_type[ix] = !video[ix] ? 3 : !m_lib[ix] ? 1 : 2;
        for (m_i[ix] = 0; m_i[ix] < alb_done[ix]; m_i[ix]++) {
            const ty = chk[ix][m_i[ix]].YOUTUBE_TRACK_MANAGER_TRACK_TYPE;
            if (typeof ty !== "undefined" && ty.length) {const ic = ty.toLowerCase().charAt(); type[ix][m_i[ix]] = ic == "y" ? 1 : ic == "p" ? 2 : ic == "l" ? 3 : def_type[ix];}
            else {type[ix][m_i[ix]] = def_type[ix]; chk[ix][m_i[ix]].YOUTUBE_TRACK_MANAGER_TRACK_TYPE = type_arr[def_type[ix]];}
        } m_i[ix] = 0;
        mtags_timer[ix] = setInterval(() => {
            if (m_i[ix] < alb_done[ix]) {
                m_l[ix] = chk[ix][m_i[ix]]["@"];
                m_v[ix] = chk[ix][m_i[ix]]["@"].indexOf("v="); if (m_v[ix] != -1) m_v[ix] = chk[ix][m_i[ix]]["@"].slice(m_v[ix] + 2, m_v[ix] + 13); else m_v[ix] = "";
                m_a[ix] = chk[ix][m_i[ix]].ARTIST; if (typeof m_a[ix] === "undefined") {let i = m_i[ix]; while (i-- && typeof m_a[ix] === "undefined") m_a[ix] = chk[ix][i].ARTIST;} full_alb[ix] = false;
                const sti = chk[ix][m_i[ix]].TITLE;
                if (typeof sti !== "undefined" && sti.includes(" (Full Album)")) full_alb[ix] = true;
                const st = chk[ix][m_i[ix]].YOUTUBE_TRACK_MANAGER_SEARCH_TITLE;
                m_t[ix] = typeof st !== "undefined" && st.length ? st : typeof sti !== "undefined" && sti.length ? sti : ""; m_ty[ix] = type[ix][m_i[ix]];
                test(ix, m_a[ix], m_t[ix], m_i[ix], alb_done[ix], m_v[ix], full_alb[ix], m_p[ix], m_l[ix], m_ty[ix]);
                m_i[ix]++;
            } else {reset_mtags_timer(ix);}
        }, 20);
    }
}

function Lfm_similar_artists(state_callback, on_search_done_callback) {
    let art_variety, f3, fln, lfm_cache_file, list = [], lmt = 0, pg = 0, rad_mode, retry = false, source, rad_type;
    this.xmlhttp = null; this.func = null; this.ready_callback = state_callback; this.on_search_done_callback = on_search_done_callback; this.ie_timer = null;

    this.on_state_change = () => {
        if (this.xmlhttp != null && this.func != null) if (this.xmlhttp.readyState == 4) {
            clearTimeout(this.ie_timer); this.ie_timer = null;
            if (this.xmlhttp.status == 200) this.func();
            else {if (art_variety && !retry) {if (rad_type != 4) retry = true; if (s.file(fln)) lfm_cache_file = true; return this.Search();} this.on_search_done_callback(""); if (art_variety && rad_mode > 1) rad.med_lib_radio("", source, rad_mode, rad_type, art_variety); s.trace("last.fm similar artists N/A: " + this.xmlhttp.responseText || "Status error: " + this.xmlhttp.status);}
        }
    }

    this.Search = (p_source, p_rad_mode, p_art_variety, p_rad_type) => {
        if (!retry) {art_variety = p_art_variety; rad_mode = p_rad_mode; source = p_source; rad_type = p_rad_type; const rs = source.clean(); f3 = rad.f2 + rs.substr(0, 1).toLowerCase() + "\\"; fln = f3 + rs + (rad_type == 4 ? " - Top Artists.json" : " And Similar Artists.json"); lfm_cache_file = !p.expired(fln, p.Thirty_Days);}
        this.func = null; this.xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        let chk, len = 0, URL;
        if (!art_variety && s.file(fln)) chk = s.jsonParse(fln, false, 'file'); if (chk) len = chk.length;
        if (art_variety && lfm_cache_file) {
            list = s.jsonParse(fln, false, 'file'); if (!list) list = [];
            if (list.length > 219 && (list[0].hasOwnProperty('name') || rad_type == 4)) {
                if (rad_mode > 1) {rad.med_lib_radio(list, source, rad_mode, rad_type, art_variety); return;}
                return this.on_search_done_callback(list, source, rad_mode);}
        }
        if (!art_variety && lfm_cache_file) {
            list = s.jsonParse(fln, false, 'file'); if (!list) list = [];
            if (list.length > 99) return this.on_search_done_callback(list, source, rad_mode);
        }
        lmt = !retry ? (art_variety || len > 101 ? 249 : 100) : (art_variety || len > 101 ? 240 : 105 + Math.floor(Math.random() * 10));
        if (rad_type != 4) {URL = "http://ws.audioscrobbler.com/2.0/?format=json" + p.lfm + "&method=artist.getSimilar&artist=" + encodeURIComponent(source) + "&limit=" + lmt + "&autocorrect=1";}
        else {pg++; URL = "https://www.last.fm/tag/" + encodeURIComponent(source) + "/artists?page=" + pg;}
        this.func = this.Analyse; this.xmlhttp.open("GET", URL); this.xmlhttp.onreadystatechange = this.ready_callback;
        this.xmlhttp.setRequestHeader('User-Agent', "foobar2000_script"); if (retry || rad_type == 4) this.xmlhttp.setRequestHeader('If-Modified-Since', 'Thu, 01 Jan 1970 00:00:00 GMT');
		if (!this.ie_timer) {const a = this.xmlhttp; this.ie_timer = setTimeout(() => {a.abort(); this.ie_timer = null;}, 30000);}
		this.xmlhttp.send();
    }

    this.Analyse = () => {
        const data = rad_type != 4 ? s.jsonParse(this.xmlhttp.responseText, false, 'get', 'similarartists.artist', 'name\":') : this.xmlhttp.responseText;
        if (!retry && rad_type != 4 && (!data || data.length < lmt)) {retry = true; if (art_variety && s.file(fln)) lfm_cache_file = true; return this.Search();}
        if (data) {
            if (rad_type == 4) {
                const doc = new ActiveXObject("htmlfile"); doc.open(); const div = doc.createElement('div'); div.innerHTML = data;
                const link = div.getElementsByTagName('a'); if (!link) return;
                s.htmlParse(link, false, false, v => {
                    if (v.className.includes('link-block-target')) {
                        const a = decodeURIComponent(v.href.replace('about:/music/', "").replace(/\+/g, "%20"));
                        if (!a.includes('about:/tag/')) list.push(a);
                    }
                });
                doc.close(); if (pg < 13) return this.Search(source, rad_mode, art_variety, rad_type);
                if (list.length) {s.create(f3); s.save(fln, JSON.stringify(list), true);}
                if (rad_mode > 1) return rad.med_lib_radio(list, source, rad_mode, rad_type, art_variety);
            } else {
                list = data.map(v => ({name: v.name, score: Math.round(v.match * 100)}));
                list.unshift({name: source, score:100}); s.save(fln, JSON.stringify(list), true);
                if (rad_mode > 1) return rad.med_lib_radio(list, source, rad_mode, rad_type, art_variety);
            }
        } this.on_search_done_callback(list, source, rad_mode); if (!data && art_variety && rad_mode > 1) rad.med_lib_radio("", source, rad_mode, rad_type, art_variety);
    }
}

function Lfm_radio_tracks_search(state_callback, on_search_done_callback) {
    const playcount = [], title = [];
    let art_variety, artistTopTracks = false, cur_pop, done, f3, fn, fnc, ix, i = 0, lfm_cache_c, lfm_cache_f, list = [], lmt = 0, orig, pg = 1, pn, rad_source, rad_mode, rad_type, retry = false, save_list = [], song_hot, top50, sp = "";
    const stripRemaster = v => v.title = v.title.strip_remaster();
    const tracks = v => ({artist: v.artist.name, title: v.name.strip_remaster()});
    const uniq = a => {const flags = [], result = []; a.forEach(v => {if (flags[v.title + v.playcount]) return; result.push(v); flags[v.title + v.playcount] = true;}); return result;}
    this.xmlhttp = null; this.func = null; this.ready_callback = state_callback; this.on_search_done_callback = on_search_done_callback; this.ie_timer = null;

    this.on_state_change = () => {
        if (this.xmlhttp != null && this.func != null) if (this.xmlhttp.readyState == 4) {
            clearTimeout(this.ie_timer); this.ie_timer = null;
            if (this.xmlhttp.status == 200) this.func();
            else if (!retry) {retry = true; if (s.file(fn)) lfm_cache_f = true; if (s.file(fnc)) lfm_cache_c = true; return this.Search();} else if (rad_type != 2 || rad_mode == 2) {this.on_search_done_callback("", "", ix, done, top50, pn, rad_mode, rad_type); s.trace("last.fm top tracks N/A: " + this.xmlhttp.responseText || "Status error: " + this.xmlhttp.status);}
        }
    }

    this.Search = (p_rad_source, p_rad_mode, p_rad_type, p_art_variety, p_song_hot, p_cur_pop, p_ix, p_done, p_top50, p_pn) => {
        if (!retry) {
            rad_source = p_rad_source; rad_mode = p_rad_mode; rad_type = p_rad_type; art_variety = p_art_variety; song_hot = p_song_hot; cur_pop = p_cur_pop; ix = p_ix; done = p_done; top50 = p_top50; pn = p_pn;
            sp = rad_source.clean(); f3 = rad.f2 + sp.substr(0, 1).toLowerCase() + "\\"; fn = f3 + sp + (top50 == 2 ? " [Similar Songs].json" : (top50 == 3 ? ".json" : (rad_type != 3 ? ".json" : " [Similar Songs].json"))); lfm_cache_f = !p.expired(fn, p.TwentyEight_Days); if (rad_mode == 2 && ppt.useSaved) lfm_cache_f = true;
            if (cur_pop) {fnc = f3 + sp + " [curr].json"; lfm_cache_c = !p.expired(fnc, p.One_Week);}
        }

        switch (rad_type) {
            case 1:
                if (lfm_cache_f) {
                    list = s.jsonParse(fn, false, 'file'); if (!list) break; $.take(list, song_hot);
                    if (rad_mode != 2 && !top50) index.setTrackCount(list.length);
                    if (list.length >= song_hot || rad_mode == 2 && ppt.useSaved) {
                        list.forEach(stripRemaster);
                        return this.on_search_done_callback(list, "", ix, "", "", pn, rad_mode, 1);}
                }
                break;
            case 3:
                if (lfm_cache_f && top50 != 3) {
                    list = s.jsonParse(fn, 'file');
                    if (list && list[0].hasOwnProperty('playcount') || rad_mode == 2 && ppt.useSaved) {
                        $.take(list, song_hot);
                        if (rad_mode != 2 && !top50) index.setTrackCount(list.length);
                        if (list.length >= song_hot || rad_mode == 2 && ppt.useSaved) {
                            list.forEach(stripRemaster);
                            return this.on_search_done_callback(list, "", ix, "", top50, pn, rad_mode, 3);}
                    }
                }
                break;
            default:
                if (cur_pop && lfm_cache_c || !cur_pop && lfm_cache_f) {
                    list = s.jsonParse(cur_pop ? fnc : fn, false, 'file'); if (!list) break;
                    if (cur_pop) {if (list.length >= song_hot) {
                        list.forEach(stripRemaster);
                        return this.on_search_done_callback(rad_source, list, ix, done, top50, pn, rad_mode, rad_type, cur_pop);}}
                    else {let newOK = false; if (list && list[0].hasOwnProperty('artist')) {newOK = true; list.shift();} if (newOK && list.length >= song_hot || rad_mode == 2 && ppt.useSaved) {
                        list.forEach(stripRemaster);
                        return this.on_search_done_callback(rad_source, list, ix, done, top50, pn, rad_mode, rad_type, cur_pop);}}
                }
                break;
        }

        if (rad_mode == 2 && ppt.useSaved) return this.on_search_done_callback("", "", ix, done, top50, pn, rad_mode, rad_type);
        // workarounds applied as required to deal with occasional last.fm bug - list too short (doesn't start at beginning)
        this.func = null; this.xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        let URL = "http://ws.audioscrobbler.com/2.0/?format=json" + p.lfm;
        if (top50 != 2 && top50 != 3 && (rad_type == 0 || rad_type == 2 || top50 == 1)) artistTopTracks = true;
        if (artistTopTracks) {
            lmt = cur_pop ? 100 : Math.max(200, song_hot);
            if (!cur_pop) {
                if (retry) lmt += 5 + Math.floor(Math.random() * 10);
                URL += "&method=" + "artist.getTopTracks" + "&artist=" + encodeURIComponent(rad_source) + "&limit=" + lmt + "&autocorrect=1";
            } else URL = "https://www.last.fm/music/" + encodeURIComponent(rad_source) + "/+tracks?date_preset=LAST_30_DAYS&page=" + pg;
        } else if (rad_type == 1 && !top50) {lmt = !retry ? song_hot : song_hot != 1000 ? song_hot + 5 + Math.floor(Math.random() * 10) : song_hot - 5; URL += "&method=" + "tag.getTopTracks" + "&tag=" + encodeURIComponent(rad_source) + "&limit=" + lmt + "&autocorrect=1";}
        else {
            if (top50 != 3) {
                if (!rad_source.includes("|")) return this.on_search_done_callback("", "", ix, "", top50, pn, rad_mode, rad_type);
                const radio_sourc = rad_source.split("|"); lmt = !retry ? 250 : 240;
                URL += "&method=" + "track.getSimilar" + "&artist=" + encodeURIComponent(radio_sourc[0].trim()) + "&track=" + encodeURIComponent(radio_sourc[1].trim()) + "&limit=" + lmt + "&autocorrect=1";
            } else URL = "http://www.bbc.co.uk/radio1/chart/singles/print";
        }
        this.func = this.Analyse; this.xmlhttp.open("GET", URL); this.xmlhttp.onreadystatechange = this.ready_callback;
        this.xmlhttp.setRequestHeader('User-Agent', "foobar2000_script"); if (retry || cur_pop) this.xmlhttp.setRequestHeader('If-Modified-Since', 'Thu, 01 Jan 1970 00:00:00 GMT');
		if (rad_mode != 2 && !this.ie_timer) {const a = this.xmlhttp; this.ie_timer = setTimeout(() => {a.abort(); this.ie_timer = null;}, 30000);} // iSelect radio handles own timeout
		this.xmlhttp.send();
    }

    this.Analyse = () => {
        const new_t = this.xmlhttp.responseText; let data = false, div, doc, items = 0; list = [];
        switch (rad_type) {
            case 3:
                if (top50 != 3) data = s.jsonParse(new_t, false, 'get', 'similartracks.track', 'name\":');
                else {doc = new ActiveXObject("htmlfile"); doc.open(); div = doc.createElement('div'); div.innerHTML = this.xmlhttp.responseText; data = div.getElementsByTagName('td');}
                break;
            default:
                if (cur_pop) {doc = new ActiveXObject("htmlfile"); doc.open(); div = doc.createElement('div'); div.innerHTML = this.xmlhttp.responseText; data = div.getElementsByTagName('a');}
                else if (rad_type != 1) data = s.jsonParse(new_t, false, 'get', 'toptracks.track', 'name\":'); else data = s.jsonParse(new_t, false, 'get', 'tracks.track', 'name\":');
                break;
        }
        items = data.length; if (!retry && !cur_pop && (!items || ((artistTopTracks || rad_type == 1 || rad_type == 3) && items < lmt))) {retry = true; if (s.file(fn)) lfm_cache_f = true; return this.Search();}
        if (items) {s.create(f3);
            switch (rad_type) {
                case 1:
                    save_list = data.map(v => ({artist: v.artist.name, title: v.name}));
                    list = $.take(data, song_hot).map(tracks);
                    if (rad_mode != 2 && !top50) index.setTrackCount(data.length);
                    this.on_search_done_callback(list, "", ix, "", "", pn, rad_mode, 1);
                    if (save_list.length) s.save(fn, JSON.stringify(save_list), true);
                    break;
                case 3:
                    if (top50 != 3) {
                        save_list = data.map(v => ({artist: v.artist.name, title: v.name, playcount: v.playcount}));
                        list = $.take(data, song_hot).map(tracks);
                        if (rad_mode != 2 && !top50) index.setTrackCount(data.length);
                    } else {for (i = 4; i < items; i += 6) {list.push({artist: data[i].innerHTML.replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&quot/g,'"'), title: data[i + 1].innerHTML.replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&quot/g,'"')}); save_list = list;} doc.close();}
                    this.on_search_done_callback(list, "", ix, "", top50, pn, rad_mode, 3);
                    if (save_list.length) s.save(fn, JSON.stringify(save_list), true);
                    break;
                default:
                    if (cur_pop) {
                        s.htmlParse(data, 'className', 'link-block-target', v => title.push(v.innerText.trim()));
                        s.htmlParse(div.getElementsByTagName('span'), 'className', 'countbar-bar-value', v => playcount.push(parseFloat(v.innerText.replace(",", "")) * 9));
                        if (pg == 1 && song_hot > 50) {pg++; return this.Search(rad_source, rad_mode, rad_type, art_variety, song_hot, cur_pop, ix, done, top50, pn);}
                        else {
                            list = title.map((v, i) => ({title: v.strip_remaster(), playcount: playcount[i]}));
                            save_list = title.map((v, i) => ({title: v, playcount: playcount[i]}));
                        }
                        list = uniq(list); save_list = uniq(save_list); if (save_list.length) s.save(fnc, JSON.stringify(save_list), true); doc.close();
                    } else {
                        list = data.map(v => ({title: v.name.strip_remaster(), playcount: v.playcount}));
                        save_list = data.map(v => ({title: v.name, playcount: v.playcount}));
                        try {save_list.unshift({artist: data[0].artist.name, ar_mbid: data[0].artist.mbid});} catch (e) {save_list.unshift({artist: rad_source, ar_mbid: "N/A"});}
                        if (save_list.length) s.save(fn, JSON.stringify(save_list), true);
                    }
                    this.on_search_done_callback(rad_source, list, ix, done, top50, pn, rad_mode, rad_type, cur_pop);
                    break;
            }
        } else this.on_search_done_callback("", "", ix, done, top50, pn, rad_mode, rad_type);
    }
}

function Lfm_alb_cov(state_callback) {
    let artist, album, fna;
    this.xmlhttp = null; this.func = null; this.ready_callback = state_callback; this.ie_timer = null;

    this.on_state_change = () => {
        if (this.xmlhttp != null && this.func != null) if (this.xmlhttp.readyState == 4) {
            clearTimeout(this.ie_timer); this.ie_timer = null;
            if (this.xmlhttp.status == 200) this.func();
            else {s.trace("last.fm album cover N/A: " + this.xmlhttp.responseText || "Status error: " + this.xmlhttp.status);}
        }
    }

    this.Search = (p_artist, p_album, p_fna) => {
        artist = p_artist; album = p_album; fna = p_fna;
        const URL = "http://ws.audioscrobbler.com/2.0/?format=json" + p.lfm + "&method=album.getInfo&artist=" + encodeURIComponent(artist) + "&album=" + encodeURIComponent(album) + "&autocorrect=1";;
        this.func = null; this.xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        this.func = this.Analyse; this.xmlhttp.open("GET", URL); this.xmlhttp.onreadystatechange = this.ready_callback;
        this.xmlhttp.setRequestHeader('User-Agent', "foobar2000_script");
		if (!this.ie_timer) {const a = this.xmlhttp; this.ie_timer = setTimeout(() => {a.abort(); this.ie_timer = null;}, 30000);}
		this.xmlhttp.send();
    }

    this.Analyse = () => {
        const data = s.jsonParse(this.xmlhttp.responseText, false, 'get', 'album.image', 'name\":'); if (!data || data.length < 5) return s.trace("last.fm album cover N/A");
        let pth = data[4]["#text"]; if (pth) {const pthSplit = pth.split("/"); pthSplit.splice(pthSplit.length - 2, 1); pth = pthSplit.join("/");} else return s.trace("last.fm album cover N/A");
        s.run("cscript //nologo \"" + fb.ProfilePath + "yttm\\foo_lastfm_img.vbs\" \"" + pth + "\" \"" + fna + "cover" + pth.slice(-4) + "\"", 0);
    }
}

function Musicbrainz_releases(state_callback, on_search_done_callback) {
    let alb_id, album, album_artist, attempt = 0, initial = true, extra, prime, rg_mbid, server = true;
    this.xmlhttp = null; this.func = null; this.ready_callback = state_callback; this.on_search_done_callback = on_search_done_callback; this.ie_timer = null;
    this.Null = () => {if (!ppt.btn_mode && ppt.mb && ppt.pref_mb_tracks) {alb.track_source = 0; alb.dld.Execute();} else {alb.set_row(alb_id, 0, album_artist); t.paint(); this.on_search_done_callback("");}}

    this.on_state_change = () => {
        if (this.xmlhttp != null && this.func != null) if (this.xmlhttp.readyState == 4) {
            clearTimeout(this.ie_timer); this.ie_timer = null;
            if (this.xmlhttp.status == 200) this.func();
            else if (server && this.xmlhttp.status == 503 && attempt < 5) {setTimeout(() => {attempt++; this.Search();}, 450);}
            else if (server) {server = false; this.Search();}
            else {s.trace("musicbrainz releases N/A: " + this.xmlhttp.responseText || "Status error: " + this.xmlhttp.status); this.Null();}
        }
    }

    this.Search = (p_alb_id, p_rg_mbid, p_album_artist, p_album, p_prime, p_extra) => {
        if (initial) {alb_id = p_alb_id; rg_mbid = p_rg_mbid; album_artist = p_album_artist; album = p_album; prime = p_prime; extra = p_extra;}
        initial = false; this.func = null; this.xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        let URL = server ? "https://musicbrainz.org/ws/2/" : "http://musicbrainz-mirror.eu:5000/ws/2/";
        if (!ppt.btn_mode && ppt.mb) URL += "release-group/" + rg_mbid + "?inc=releases&fmt=json";
        else URL += "release/?query=\"" + encodeURIComponent(album.trim().regex_escape()) + "\" AND artist:" + encodeURIComponent(album_artist.trim().regex_escape()) + "&fmt=json";
        this.func = this.Analyse; this.xmlhttp.open("GET", URL); this.xmlhttp.onreadystatechange = this.ready_callback;
        this.xmlhttp.setRequestHeader('User-Agent', "foobar2000_yttm (https://hydrogenaud.io/index.php/topic,111059.0.html)");
		if (!this.ie_timer) {const a = this.xmlhttp; this.ie_timer = setTimeout(() => {a.abort(); this.ie_timer = null;}, 30000);}
		this.xmlhttp.send();
    }

    this.Analyse = () => {
        const indextest = '\"releases\":|\"id\":|\"title\":' +  ((ppt.btn_mode || !ppt.mb) ? '|\"date\":' : '');
        const data = s.jsonParse(this.xmlhttp.responseText, false, 'get', '', indextest);
        if (!data) return this.Null();
        let album_id = "";
        if (ppt.btn_mode || !ppt.mb) {
            data.releases.some(v => {
                if ((v.title.strip() == album.strip()) && (ppt.btn_mode ? (v["release-group"]["primary-type"] == "Album") : true) && v.date && v.date.substring(0, 4)) {
                    album_id = v.id;
                    this.on_search_done_callback(alb_id, v.id, album_artist, v.date.substring(0, 4));
                    return true;
                }
            });
        } else {
            data.releases.some(v => {
                if ((v.title.strip() == album.strip()) && (data["primary-type"] == prime)) {
                    album_id = v.id; this.on_search_done_callback(alb_id, album_id, album_artist);
                    return true;
                }
            });
        }
        if (!album_id) this.Null();
    }
}

function Album_tracks(state_callback, on_search_done_callback) {
    let alb_id, album, album_artist, attempt = 0, list = [], initial = true, re_mbid, server = true;;
    this.xmlhttp = null; this.func = null; this.ready_callback = state_callback; this.on_search_done_callback = on_search_done_callback; this.ie_timer = null;
    this.lfm_return = () => {if (!ppt.pref_mb_tracks) {alb.track_source = 1; alb.dld.Execute();} else this.Null();}
    this.mb_return = () => {if (ppt.pref_mb_tracks) {alb.track_source = 0; alb.dld.Execute();} else this.Null();}
    this.Null = () => {alb.set_row(alb_id, 0, album_artist); t.paint(); this.on_search_done_callback("");}

    this.on_state_change = () => {
        if (this.xmlhttp != null && this.func != null) if (this.xmlhttp.readyState == 4) {
            clearTimeout(this.ie_timer); this.ie_timer = null;
            if (this.xmlhttp.status == 200) this.func();
            else if (alb.track_source && server && this.xmlhttp.status == 503 && attempt < 5) {setTimeout(() => {attempt++; this.Search();}, 450);}
            else if (alb.track_source && server) {server = false; this.Search();}
            else {s.trace((alb.track_source ? "musicbrainz" : "last.fm") + " album tracks N/A: " + this.xmlhttp.responseText || "Status error: " + this.xmlhttp.status); alb.track_source ? this.mb_return() : this.lfm_return();}
        }
    }

    this.Search = (p_alb_id, p_re_mbid, p_album_artist, p_album) => {
        if (initial) {alb_id = p_alb_id; re_mbid = p_re_mbid; album_artist = p_album_artist; album = p_album;}
        initial = false; this.func = null; this.xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); let URL;
        switch (alb.track_source) {
            case 0:
                URL = "http://ws.audioscrobbler.com/2.0/?format=json" + p.lfm;
                URL += "&method=album.getInfo&artist=" + encodeURIComponent(album_artist) + "&album=" + encodeURIComponent(album) + "&autocorrect=1";
                break;
            case 1:
                URL = (server ? "https://musicbrainz.org/" : "http://musicbrainz-mirror.eu:5000/") + "ws/2/release/" + re_mbid + "?inc=recordings&fmt=json";
                break;
        }
        this.func = this.Analyse; this.xmlhttp.open("GET", URL); this.xmlhttp.onreadystatechange = this.ready_callback;
        this.xmlhttp.setRequestHeader('User-Agent', "foobar2000_yttm (https://hydrogenaud.io/index.php/topic,111059.0.html)"); if (!alb.track_source) this.xmlhttp.setRequestHeader('If-Modified-Since', 'Thu, 01 Jan 1970 00:00:00 GMT');
		if (!this.ie_timer) {const a = this.xmlhttp; this.ie_timer = setTimeout(() => {a.abort(); this.ie_timer = null;}, 7000);}
		this.xmlhttp.send();
    }

    this.Analyse = () => {
        const new_t = this.xmlhttp.responseText; let data, items;
        switch (alb.track_source) {
            case 0:
                items = 0, data = s.jsonParse(new_t, false, 'get', 'album', 'track\":');
                if (data) {
                    items = data.tracks.track.length;
                    if (items)
                        list = data.tracks.track.map(v => ({artist: album_artist.replace(/’/g, "'"), title: v.name.replace(/’/g, "'").strip_remaster()}));
                    if (!items) // deals with 1 track releases that are in different json format
                        try {items = data.tracks.track.name; list[0] = {artist: album_artist.replace(/’/g, "'"), title: items}} catch (e) {}
                    this.on_search_done_callback(alb_id, list); s.trace("album track list from last.fm");
                }
                if (!data || !items) this.lfm_return();
                break;
            case 1:
                data = s.jsonParse(new_t, false, 'get', '', '\"media\":|\"tracks\":');
                if (!data) return this.mb_return();
                items = [];
                data.media.forEach(v => items = items.concat(v.tracks));
                if (!items.length) return this.mb_return();
                list = items.map(v => ({artist: album_artist.replace(/’/g, "'"), title: v.title.replace(/’/g, "'")}));
                this.on_search_done_callback(alb_id, list); s.trace("album track list from musicbrainz");
                break;
            }
    }
}

function Musicbrainz_artist_id(state_callback, on_search_done_callback) {
    let ar_mbid = "", attempt = 0, dbl_load, just_mbid, lfm_done = false, list = [], initial = true, mbid_search = false, mbid_source = 1, mb_done = false, mode, search_param, server = true, tag_mbid = "";
    const related_artists = s.file(alb.related_artists) ? s.jsonParse(alb.related_artists, false, 'file') : {};
    this.xmlhttp = null; this.func = null; this.ready_callback = state_callback; this.on_search_done_callback = on_search_done_callback; this.ie_timer = null;
    this.lfm_return = () => {if (mb_done) this.on_search_done_callback("", "", mode); else this.Search(search_param, just_mbid, dbl_load, mode);}
    this.mb_return = () => {list[0] = {name: "Related Artists N/A", id: "", disambiguation: ""}; alb.rel_artists = list; if (!ppt.showSimilar && !dbl_load) {alb.artists = alb.rel_artists; alb.calc_rows_art();} if (lfm_done) this.on_search_done_callback("", "", mode); else this.Search(search_param, just_mbid, dbl_load, mode);}

    this.on_state_change = () => {
        if (this.xmlhttp != null && this.func != null) if (this.xmlhttp.readyState == 4) {
            clearTimeout(this.ie_timer); this.ie_timer = null;
            if (this.xmlhttp.status == 200) this.func();
            else if (server && this.xmlhttp.status == 503 && attempt < 5) {setTimeout(() => {attempt++; this.Search();}, 450);}
            else if (server) {server = false; this.Search();}
            else if (mbid_search) {alb.artist = search_param; return this.on_search_done_callback("", "", mode);
            } else switch (mbid_source) {
                case 0: lfm_done = true; mbid_source = 1; s.trace("last.fm mbid N/A: " + this.xmlhttp.responseText || "Status error: " + this.xmlhttp.status); this.lfm_return(); break;
                case 1:mb_done = true; mbid_source = 0; s.trace("musicbrainz mbid N/A: " + this.xmlhttp.responseText || "Status error: " + this.xmlhttp.status); this.mb_return(); break;
            }
        }
    }

    this.Search = (p_album_artist, p_just_mbid, p_dbl_load, p_mode) => {
        if (initial) {dbl_load = p_dbl_load; just_mbid = p_just_mbid; mode = p_mode; search_param = p_album_artist;}
        initial = false; tag_mbid = p.eval("$trim($if3(%musicbrainz_artistid%,%musicbrainz artist id%,))"); if (!tag_mbid) tag_mbid = related_artists[search_param.toUpperCase()]; if (!tag_mbid || tag_mbid.length != 36) tag_mbid = "";
        this.func = null; this.xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        let URL = (server ? "https://musicbrainz.org/" : "http://musicbrainz-mirror.eu:5000/") + "ws/2/artist/";
        if (search_param.uuid()) {mbid_search = true; ar_mbid = search_param; URL += ar_mbid + "?&fmt=json";}
        else switch (mbid_source) {
            case 0: URL = "http://ws.audioscrobbler.com/2.0/?format=json" + p.lfm; URL += "&method=artist.getInfo&artist=" + encodeURIComponent(search_param) + "&autocorrect=1"; break;
            case 1: URL += "?query=" + encodeURIComponent(search_param.toLowerCase().regex_escape()) + "&fmt=json"; break;
        }
        this.func = this.Analyse; this.xmlhttp.open("GET", URL); this.xmlhttp.onreadystatechange = this.ready_callback;
        this.xmlhttp.setRequestHeader('User-Agent', "foobar2000_yttm (https://hydrogenaud.io/index.php/topic,111059.0.html)"); if (!mbid_source) this.xmlhttp.setRequestHeader('If-Modified-Since', 'Thu, 01 Jan 1970 00:00:00 GMT');
		if (!this.ie_timer) {const a = this.xmlhttp; this.ie_timer = setTimeout(() => {a.abort(); this.ie_timer = null;}, 7000);}
		this.xmlhttp.send();
    }

    this.Analyse = () => {
        const new_t = this.xmlhttp.responseText; let data;
        if (search_param.uuid()) {
            data = s.jsonParse(new_t, false, 'get', '', '\"name\":');
            if (!data) {alb.artist = search_param; return this.on_search_done_callback("", "", mode);}
            alb.artist = data.name; alb.set_txt();
            if (ppt.showArtists && ppt.showSimilar) alb.search_for_similar_artists(alb.artist);
            list[0] = {name: "Related Artists N/A: MBID Search", id: "", disambiguation: ""}
        }
        else switch (mbid_source) {
            case 0:
                lfm_done = true; mbid_source = 1;
                data = s.jsonParse(new_t, false, 'get', 'artist.mbid');
                if (!data) return this.lfm_return(); else ar_mbid = data;
                if (!ar_mbid && !list.length) this.lfm_return();
                break;
            case 1:
                mb_done = true; mbid_source = 0;
                data = s.jsonParse(new_t, false, 'get', '', '\"name\":');
                if (!data || !new_t.includes("\"artists\":")) return this.mb_return();
                let artist = search_param.strip();
                list = data.artists.map(v => ({name: v.name, id: v.id, disambiguation: v.disambiguation || ""}));
                if (!list.length) return this.mb_return();
                const get_mbid = v => {if (artist == v.name.strip()) {ar_mbid = v.id; return true;}}
                list.some(get_mbid);
                if (!ar_mbid) {const tfo = FbTitleFormat("$ascii(" + artist + ")"); artist = tfo.Eval(true);list.some(get_mbid);}
                if (!ar_mbid) {list.unshift({name: alb.artist + " [Related]:", id: ""});}
                else if (list.length == 1) list[0] = {name: alb.artist + " [No Related Artists]", id: "", disambiguation: ""}
                else list[0] = {name: alb.artist + " [Related]:", id: ar_mbid};
                break;
        }
        if (!dbl_load) alb.rel_artists = list; if (!ppt.showSimilar && !dbl_load) {alb.artists = alb.rel_artists; alb.calc_rows_art();}
        this.on_search_done_callback(tag_mbid ? tag_mbid : ar_mbid, just_mbid, mode);
    }
}

function Album_names(state_callback, on_search_done_callback) {
    let ar_mbid = false, attempt = 0, data = [], f3, fn, initial = true, json_data = [], lfm_cache_f, lmt = 0, mode, offset = 0, releases = 0, retry = false, server = true, sp = "";
    this.xmlhttp = null; this.func = null; this.ready_callback = state_callback; this.on_search_done_callback = on_search_done_callback; this.ie_timer = null;

    this.on_state_change = () => {
        if (this.xmlhttp != null && this.func != null) if (this.xmlhttp.readyState == 4) {
            clearTimeout(this.ie_timer); this.ie_timer = null;
            if (this.xmlhttp.status == 200) {if (ppt.mb) offset += 100; this.func();}
            else if (ppt.mb && server && this.xmlhttp.status == 503 && attempt < 5) {setTimeout(() => {attempt++; this.Search();}, 450);}
            else if (ppt.mb && server) {server = false; this.Search();}
            else {s.trace((ppt.mb ? "musicbrainz album names N/A: " : "last.fm " + (!mode ? "top albums N/A: " : mode == 1 ? "top tracks N/A: " : "similar songs N/A: ")) + this.xmlhttp.responseText || "Status error: " + this.xmlhttp.status); this.on_search_done_callback([], ar_mbid, mode);}
        }
    }

    this.Search = (p_ar_mbid, p_mode) => {
        if (initial) {ar_mbid = p_ar_mbid; mode = p_mode;} initial = false; this.func = null; this.xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); let chk, URL;
        if (ppt.mb) URL = (server ? "https://musicbrainz.org/" : "http://musicbrainz-mirror.eu:5000/") + "ws/2/release-group?artist=" + ar_mbid + "&limit=100&offset=" + offset + "&fmt=json";
        else { // workarounds applied as required to deal with occasional last.fm bug - list too short (doesn't start at beginning)
            URL = "http://ws.audioscrobbler.com/2.0/?format=json" + p.lfm;
            switch (mode) {
                case 0: lmt = !retry ? 99 : 105 + Math.floor(Math.random() * 10); URL += "&method=" + "artist.getTopAlbums" + "&artist=" + encodeURIComponent(alb.artist) + "&limit=" + lmt + "&autocorrect=1"; break;
                case 1:
                    sp = alb.artist.clean(); f3 = rad.f2 + sp.substr(0, 1).toLowerCase() + "\\"; fn = f3 + sp + ".json"; lfm_cache_f = !retry ? !p.expired(fn, p.TwentyEight_Days) : s.file(fn);
                    if (lfm_cache_f) {
                        data = []; data = s.jsonParse(fn, false, 'file');
                        if (data[0].hasOwnProperty('artist')) data.shift();
                        if (data.length > 199) return this.on_search_done_callback($.take(data, 99), ar_mbid, mode);
                    }
                    lmt = 0; if (s.file(fn)) chk = s.jsonParse(fn, false, 'file'); if (chk) lmt = chk.length - 1; lmt = Math.max(201 + Math.floor(Math.random() * 5), lmt); if (retry) lmt += 5 + Math.floor(Math.random() * 10);
                    URL += "&method=" + "artist.getTopTracks" + "&artist=" + encodeURIComponent(alb.artist) + "&limit=" + lmt + "&autocorrect=1"; break;
                case 2:
                    const ar_ti = alb.artist_title.split("|"), ar = !ar_ti[0] ? "" : ar_ti[0].trim(), ti = !ar_ti[1] ? "" : ar_ti[1].trim();
                    sp = ar + " - " + ti; sp = sp.clean(); f3 = rad.f2 + sp.substr(0, 1).toLowerCase() + "\\"; fn = f3 + sp + " [Similar Songs].json"; !retry ? lfm_cache_f = !p.expired(fn, p.TwentyEight_Days) : s.file(fn);
                if (lfm_cache_f) {
                    data = []; data = s.jsonParse(fn, false, 'file');
                    if (data.length > 98) return this.on_search_done_callback($.take(data, 99), ar_mbid, mode);
                }
                lmt = 0; if (s.file(fn)) chk = s.jsonParse(fn, false, 'file'); if (chk) lmt = chk.length; lmt = Math.max(99, lmt); if (retry) lmt = lmt != 250 ? lmt + 5 + Math.floor(Math.random() * 10) : lmt - 5;
                URL += "&method=" + "track.getSimilar" + "&artist=" + encodeURIComponent(ar) + "&track=" + encodeURIComponent(ti) + "&limit=" + lmt + "&autocorrect=1"; break;
            }
        }
        this.func = this.Analyse; this.xmlhttp.open("GET", URL); this.xmlhttp.onreadystatechange = this.ready_callback;
        this.xmlhttp.setRequestHeader('User-Agent', "foobar2000_yttm (https://hydrogenaud.io/index.php/topic,111059.0.html)"); if (!ppt.mb && retry) this.xmlhttp.setRequestHeader('If-Modified-Since', 'Thu, 01 Jan 1970 00:00:00 GMT');
		if (!this.ie_timer) {const a = this.xmlhttp; this.ie_timer = setTimeout(() => {a.abort(); this.ie_timer = null;}, 7000);}
		this.xmlhttp.send();
    }

    this.Analyse = () => {
        data = [];
        if (ppt.mb) {
            const response = s.jsonParse(this.xmlhttp.responseText, false, 'get', '', '\"release-groups\":');
            if (!response) return this.on_search_done_callback("", ar_mbid, mode);
            json_data = json_data.concat(response["release-groups"]);
            if (offset == 100) releases = response["release-group-count"];
            if (!releases) return this.on_search_done_callback("", ar_mbid, mode);
            if (releases < offset || offset == 600) {
                data = s.sort(json_data, 'first-release-date', 'rev');
                this.on_search_done_callback(data, ar_mbid, mode);
            } else {attempt = 0; this.Search();}
        } else {
            let list, save_list = [], tracks;
            switch (mode) {
                case 0: data = []; data = s.jsonParse(this.xmlhttp.responseText, false, 'get', 'topalbums.album', 'name\":'); if (!retry && (!data || data.length < lmt)) {retry = true; return this.Search();} if (!data) break; $.take(data, 99); break;
                case 1:
                    data = []; list = s.jsonParse(this.xmlhttp.responseText, false, 'get', 'toptracks.track', 'name\":'); if (!retry && (!list || list.length < lmt)) {retry = true; return this.Search();} if (!list) break;
                    tracks = v => ({title: v.name, playcount: v.playcount});
                    save_list = list.map(tracks);
                    data = $.take(list, 99).map(tracks);
                    if (save_list.length) {s.create(f3); s.save(fn, JSON.stringify(save_list), true);}
                    break;
                case 2:
                    data = []; list = s.jsonParse(this.xmlhttp.responseText, false, 'get', 'similartracks.track', 'name\":'); if (!retry && (!list || list.length < lmt)) {retry = true; return this.Search();} if (!list) break;
                    tracks = v => ({artist: v.artist.name, title: v.name, playcount: v.playcount});
                    save_list = list.map(tracks);
                    data = $.take(list, 99).map(tracks);
                    if (save_list.length) {s.create(f3); s.save(fn, JSON.stringify(save_list), true);}
                    break;
            }
            this.on_search_done_callback(data, ar_mbid, mode);
        }
    }
}

function RadioTracks() {
    let art_variety, cur_pop, limit, list = [], on_search_done_callback, rad_mode, rad_source, rad_type, rec = [], song_hot; this.loadTime = []; this.rec = 0; this.start = {}; this.t50 = 0;
    this.titles = v => ({title: v.title.strip_remaster(), playcount: v.playcount});

    this.Execute = (p_search_finish_callback, p_rad_source, p_rad_mode, p_rad_type, p_art_variety, p_song_hot, p_limit, p_cur_pop, p_top50, p_pn) => {
        list = []; on_search_done_callback = p_search_finish_callback; rad_source = p_rad_source; rad_mode = p_rad_mode; rad_type = p_rad_type; art_variety = p_art_variety; song_hot = p_song_hot; limit = p_limit; cur_pop = p_cur_pop; index.reset_add_loc(p_top50);
        if (!ppt.useSaved && !p_top50 && (rad_type == 2 || rad_type == 4)) {const lfm_similar = new Lfm_similar_artists(() => lfm_similar.on_state_change(), lfm_similar_search_done); lfm_similar.Search(rad_source, rad_mode, art_variety, rad_type);}
        else if (!rad_mode && !p_top50) {
            const all_files = index.best_saved_match(rad_source, rad_type);
            if (!all_files.length) return on_search_done_callback(false, rad_mode, p_top50);
            const f_ind = Math.floor(all_files.length * Math.random());
            const data = s.jsonParse(s.open(all_files[f_ind]), false, 'get', 'response.songs');
            if (!data) return on_search_done_callback(false, rad_mode, p_top50);
            list = data.map(v => ({artist: v.artist_name, title: v.title.strip_remaster()}));
            if (list.length) {
                on_search_done_callback(true, rad_mode, p_top50); rad.list = list;
				index.setTrackCount(rad.list.length * all_files.length);
                const tracks = list.slice(0, rad.get_no(limit, plman.PlaylistItemCount(pl.rad)));
                tracks.forEach((v, i) => this.do_youtube_search("", v.artist, v.title, i, tracks.length, "", p_pn));
                rad.list_index = rad.list_index + tracks.length;
            }
        } else if (!ppt.useSaved) this.do_lfm_radio_tracks_search(rad_source, rad_mode, rad_type, art_variety, song_hot, cur_pop, "", "", p_top50, p_pn);
        else {
            const rs = rad_source.clean(); let cur, data, fn, i, tracks;
            switch (rad_type == 4 ? 2 : rad_type) {
                case 0:
                    fn = rad.f2 + rs.substr(0, 1).toLowerCase() + "\\" + rs + (cur_pop ? " [curr]" : "") + ".json";
                    if (!s.file(fn)) fn = rad.f2 + rs.substr(0, 1).toLowerCase() + "\\" + rs + (!cur_pop ? " [curr]" : "") + ".json";
                    if (!s.file(fn)) return on_search_done_callback(false, rad_mode, p_top50);
                    data = s.jsonParse(fn, false, 'file');
                    if (!data) return on_search_done_callback(false, rad_mode, p_top50); on_search_done_callback(true, rad_mode, p_top50); cur = fn.includes(" [curr]");
                    if (data[0].hasOwnProperty('artist')) data.shift();
                    list = $.take(data, song_hot).map(this.titles);
                    if (!p_top50) {s.sort(list, 'playcount', 'numRev'); rad.list = list; rad.list_type = cur; rad.param = rad_source;}
                    if (list.length) {
                        tracks = p_top50 ? pl.top50 - plman.PlaylistItemCount(p_pn) : rad.get_no(limit, plman.PlaylistItemCount(pl.rad));
                        if (!p_top50) for (i = 0; i < tracks; i++) {const t_ind = index.track(list, true, "", rad_mode, cur); this.do_youtube_search("", rad_source, list[t_ind].title, i, tracks, "", p_pn);}
                        else do_yt_search(rad_source, list, tracks, p_top50, p_pn);
                    }
                    if (list.length && p_top50) plman.ActivePlaylist = p_pn;
                    break;
                case 1:
                case 3:
                    fn = rad.f2 + rs.substr(0, 1).toLowerCase() + "\\" + rs + (rad_type == 1 || p_top50 == 3 ? ".json" : " [Similar Songs].json");
                    if (!s.file(fn)) return on_search_done_callback(false, rad_mode, p_top50);
                    data = s.jsonParse(fn, false, 'file');
                    if (!data) return on_search_done_callback(false, rad_mode, p_top50); on_search_done_callback(true, rad_mode, p_top50);
                    list = $.take(data, song_hot).map(v => ({artist: v.artist, title: v.title.strip_remaster()}));
                    if (!p_top50) {rad.list = list; index.setTrackCount(data.length);}
                    if (list.length) {
                        tracks = p_top50 ? (p_top50 != 3 ? pl.top50 : 40) - plman.PlaylistItemCount(p_pn) : rad.get_no(limit, plman.PlaylistItemCount(pl.rad));
                        if (!p_top50) for (i = 0; i < tracks; i++) {const g_ind = index.genre(list.length, list, 0); this.do_youtube_search("", list[g_ind].artist, list[g_ind].title, i, tracks, "", p_pn);}
                        else do_yt_search("", list, tracks, p_top50, p_pn);
                    }
                    if (list.length && p_top50) plman.ActivePlaylist = p_pn;
                    break;
                case 2:
                    fn = rad.f2 + rs.substr(0, 1).toLowerCase() + "\\" + rs + (rad_type == 4 ? " - Top Artists.json" : " And Similar Artists.json"); let ft;
                    if (!s.file(fn)) {if (rad_mode > 1) rad.med_lib_radio("", rad_source, rad_mode, rad_type, art_variety); return on_search_done_callback(false, rad_mode, p_top50);}
                    data = s.jsonParse(fn, false, 'file');
                    if (!data) {if (rad_mode > 1) rad.med_lib_radio("", rad_source, rad_mode, rad_type, art_variety); return on_search_done_callback(false, rad_mode, p_top50);}
                    if (rad_mode > 1) {rad.med_lib_radio(data, rad_source, rad_mode, rad_type, art_variety); return;}
                    on_search_done_callback(true, rad_mode, p_top50); rad.list = data.slice(0, art_variety);
                    tracks = rad.get_no(limit, plman.PlaylistItemCount(pl.rad));
                    for (i = 0; i < tracks; i++) {
                        rad.list.some(() => {
                            const s_ind = index.artist(rad.list.length), lp = rad_type != 4 && rad.list[0].hasOwnProperty('name') ? rad.list[s_ind].name.clean() : rad.list[s_ind].clean();
                            ft = rad.f2 + lp.substr(0, 1).toLowerCase() + "\\" + lp + (cur_pop ? " [curr]" : "") + ".json";
                            if (!s.file(ft)) ft = rad.f2 + lp.substr(0, 1).toLowerCase() + "\\" + lp + (!cur_pop ? " [curr]" : "") + ".json";
                            return s.file(ft);
                        });
                        data = s.jsonParse(ft, false, 'file'); if (data && data[0].hasOwnProperty('artist')) data.shift(); cur = ft.includes(" [curr]");
                        list = $.take(data, song_hot).map(this.titles);
                        const art_nm = s.fs.GetBaseName(ft).replace(" [curr]", "");
                        if (list.length) {s.sort(list, 'playcount', 'numRev'); const t_ind = index.track(list, false, art_nm, rad_mode, cur); this.do_youtube_search("", art_nm, list[t_ind].title, i, tracks, "", p_pn);}
                    }
                    break;
            }
        }
    }

    const lfm_similar_search_done = (res, source, p_rad_mode) => {
        if (p_rad_mode > 1) return; if (!res.length) return on_search_done_callback(false, p_rad_mode, 0); on_search_done_callback(true, p_rad_mode, 0);
        rad.list = res.slice(0, art_variety);
        const tracks = rad.get_no(limit, plman.PlaylistItemCount(pl.rad));
        for (let i = 0; i < tracks; i++) {const s_ind = index.artist(rad.list.length); this.do_lfm_radio_tracks_search(rad_type != 4 && rad.list[0].hasOwnProperty('name') ? rad.list[s_ind].name : rad.list[s_ind], p_rad_mode, rad_type == 4 ? 2 : rad_type, art_variety, song_hot, cur_pop, i, tracks, "", pl.rad);}
    };

    this.do_lfm_radio_tracks_search = (p_artist, p_rad_mode, p_rad_type, p_art_variety, p_song_hot, p_cur_pop, p_i, p_done, p_top50, p_pn) => {
        const lfm_search = new Lfm_radio_tracks_search(() => lfm_search.on_state_change(), on_lfm_radio_tracks_search_done);
        lfm_search.Search(p_artist, p_rad_mode, p_rad_type, p_art_variety, p_song_hot, p_cur_pop, p_i, p_done, p_top50, p_pn);
    }

    const on_lfm_radio_tracks_search_done = (p_artist, p_title, p_i, p_done, p_top50, p_pn, p_rm, p_rt, p_cur) => {
        let t_ind, tracks;
        switch (p_rt) {
            case 0:
                if (!p_title.length) return on_search_done_callback(false, p_rm, p_top50, p_pn); on_search_done_callback(true, p_rm, p_top50); list = p_title;
                if (!p_top50) {s.sort(p_title, 'playcount', 'numRev'); rad.list = p_title; rad.list_type = p_cur; rad.param = p_artist;} else plman.ActivePlaylist = p_pn;
                tracks = p_top50 ? pl.top50 - plman.PlaylistItemCount(p_pn) : rad.get_no(limit, plman.PlaylistItemCount(pl.rad));
                if (!p_top50) for (let i = 0; i < tracks; i++) {t_ind = index.track(p_title, true, "", p_rm, p_cur); this.do_youtube_search("", p_artist, p_title[t_ind].title, i, tracks, "", p_pn);}
                else do_yt_search(p_artist, p_title, tracks, p_top50, p_pn);
                break;
            case 1:
            case 3:
                if (!p_artist.length) return on_search_done_callback(false, p_rm, p_top50, p_pn); on_search_done_callback(true, p_rm, p_top50); list = p_artist; if (!p_top50) rad.list = p_artist; else plman.ActivePlaylist = p_pn;
                tracks = p_top50 ? (p_top50 != 3 ? pl.top50 : 40) - plman.PlaylistItemCount(p_pn) : rad.get_no(limit, plman.PlaylistItemCount(pl.rad));
                if (!p_top50) {for (let i = 0; i < tracks; i++) {const g_ind = index.genre(p_artist.length, p_artist, 0); this.do_youtube_search("", p_artist[g_ind].artist, p_artist[g_ind].title, i, tracks, p_top50, p_pn);} index.setTrackCount(p_artist.length);}
                else do_yt_search("", p_artist, tracks, p_top50, p_pn);
                break;
            case 2:
                if (!p_artist.length || !p_title.length) return on_youtube_search_done(); s.sort(p_title, 'playcount', 'numRev');
                t_ind = index.track(p_title, false, p_artist, p_rm, p_cur); this.do_youtube_search("", p_artist, p_title[t_ind].title, p_i, p_done, "", p_pn);
                break;
        }
    };

    const do_yt_search = (p_results1, p_results2, p_tracks, p_top50, p_pn) => {
        let i = 0; timer.clear(timer.yt);
        timer.yt.id = setInterval(() => {
            if (i < p_tracks && i < p_results2.length) {
                if (p_top50 == 1) {
                    while (i < p_results2.length && rad.t50_array.includes(p_results2[i].title.strip())) p_results2.splice(i, 1);
                    if (i < p_results2.length) {
                        this.do_youtube_search("", p_results1, p_results2[i].title, i, p_tracks, p_top50, p_pn);
                        rad.t50_array.push(p_results2[i].title.strip()); i++;
                    }
                } else {this.do_youtube_search("", p_results2[i].artist, p_results2[i].title, i, p_tracks, p_top50, p_pn); i++;}
            } else timer.clear(timer.yt);
        }, 20);
    }

    this.do_youtube_search = (p_alb_id, p_artist, p_title, p_i, p_done, p_top50, p_pn, p_alb_set) => {
        if (!p_top50 && !p_alb_set && ml.rad || (p_top50 || p_alb_set) && ml.top)
            if (lib && lib.in_library(p_artist, p_title, p_i, p_top50, p_alb_set, false, false)) {if (p_alb_set) {alb.set_row(p_alb_id, 1, p_artist); t.paint();} return on_youtube_search_done(p_alb_id, "", p_artist, p_title, p_i, p_done, p_top50, p_pn, p_alb_set);}
        const yt_search = new Youtube_search(() => yt_search.on_state_change(), on_youtube_search_done);
        if (p_alb_set) {alb.set_row(p_alb_id, 1, p_artist); rec[p_alb_id] = 0; t.paint();} yt_search.Search(p_alb_id, p_artist, p_title, p_i, p_done, p_top50, p_pn, "", p_alb_set);
    }

    const run_add_loc = (p_loc, p_alb_id, p_top50, p_pn, p_alb_set, type) => {
        if (type == 'outstanding') s.sort(p_loc, 'id');
        p_loc.forEach(v => {
			if (type == 'stnd') {
				if (v.id == (!p_alb_set ? (!p_top50 ? p.loc_ix : p.t50_ix) : p_alb_id)) {v.id = "x"; !p_top50 ? p.loc_ix++ : p.t50_ix++;}
				else return;
			}
			if (type == 'outstanding') {
				if (v.id != "x") v.id = "x";
				else return;
			}
			if (v.path) {this.start[v.path.slice(-11)] = Date.now(); p.addLoc(v.path, p_pn, true, p_top50, p_alb_set, p_alb_set);}
			else if (v.handle) {
				let hl = FbMetadbHandleList(v.handle), timeout = this.loadTime.length ? Math.min($.average(this.loadTime), 500) : 25;
				setTimeout(() => {
					if (p_alb_set) plman.ClearPlaylistSelection(p_pn);
					const focus = ppt.focus || !fb.IsPlaying;
					const select = !p_top50 && !p_alb_set && (plman.ActivePlaylist != pl.rad && plman.PlayingPlaylist == pl.rad || focus && ppt.removePlayed) || p_top50 && focus ? false : true;
					if (select) plman.ActivePlaylist = p_pn;
					plman.InsertPlaylistItems(p_pn, plman.PlaylistItemCount(p_pn), hl, select);
					if (p_alb_set) {plman.EnsurePlaylistItemVisible(p_pn, plman.PlaylistItemCount(p_pn) - 1); plman.SetPlaylistFocusItemByHandle(p_pn, hl[0]);}
				}, timeout);
			}
        });
    }

    const on_youtube_search_done = (p_alb_id, link, p_artist, p_title, p_i, p_done, p_top50, p_pn, p_alb_set) => {
        if (p_top50 || !p_top50 && !p_alb_set && ml.rad || p_alb_set && ml.top) {
            !p_alb_set ? (!p_top50 ? this.rec++ : this.t50++) : rec[p_alb_id]++;
            if (link && link.length) !p_top50 ? p.add_loc.push({"path":link,"id":p_i}) : p.t50_loc.push({"path":link,"id":p_i}); const loc = !p_top50 ? p.add_loc : p.t50_loc;
			run_add_loc(loc, p_alb_id, p_top50, p_pn, p_alb_set, 'stnd');
            if ((!p_alb_set ? (!p_top50 ? this.rec : this.t50) : rec[p_alb_id]) == p_done || p_done == "force") run_add_loc(loc, p_alb_id, p_top50, p_pn , p_alb_set, 'outstanding');
        } else if (link && link.length) p.addLoc(link, p_pn, true, p_top50, p_alb_set, p_alb_set);
        if (p_alb_set) {alb.set_row(p_alb_id, 2, p_artist); t.paint();}
    }
}

function Dld_album_tracks() {
    const done = [], rec = [], yt_i = [], yt_timer = [];
    let alb_id, album_artist, album, d_run, date, extra, prime, re_mbid, rg_mbid;

    this.Execute = (p_alb_id, p_rg_mbid, p_album_artist, p_album, p_prime, p_extra, p_date) => {
        if (alb.track_source == ppt.pref_mb_tracks) {re_mbid = ""; rg_mbid = p_rg_mbid; alb_id = p_alb_id; album_artist = p_album_artist; album = p_album; prime = p_prime; extra = p_extra; date = p_date; d_run = false;}
        switch (((!ppt.btn_mode && ppt.mb) || d_run) ? alb.track_source : 1) {
            case 0: get_lfm_tracks(); break;
            case 1: if ((ppt.btn_mode || !ppt.mb) && d_run) on_mb_releases_search_done(alb_id, re_mbid, album_artist, date); else get_mb_tracks(); break;
        }
    }

    const get_lfm_tracks = () => {
        const lfm_tracks = new Album_tracks(() => lfm_tracks.on_state_change(), on_tracks_search_done);
        lfm_tracks.Search(alb_id, "", album_artist, album);
    }

    const get_mb_tracks = () => {
        const mb_releases = new Musicbrainz_releases(() => mb_releases.on_state_change(), on_mb_releases_search_done);
        mb_releases.Search(alb_id, rg_mbid, album_artist, album, prime, extra);
    }

    const on_mb_releases_search_done = (p_alb_id, p_re_mbid, p_album_artist, p_date) => {
        re_mbid = p_re_mbid; if (ppt.btn_mode || !ppt.mb) {if (!p_date) return on_tracks_search_done([]); else date = p_date;}
        const mb_tracks = new Album_tracks(() => mb_tracks.on_state_change(), on_tracks_search_done);
        if ((ppt.btn_mode || !ppt.mb) && !d_run) d_run = true;
        if ((ppt.btn_mode || !ppt.mb) && d_run) {
            if (alb.track_source) {if (!re_mbid) {alb.track_source = 0; return get_lfm_tracks();}; mb_tracks.Search(p_alb_id, re_mbid, p_album_artist);}
            else get_lfm_tracks();
        }
        if (!ppt.btn_mode && ppt.mb) {if (!re_mbid) return on_tracks_search_done([]); mb_tracks.Search(p_alb_id, re_mbid, p_album_artist);}
    }

    const many_tracks = (length, artist, album) => {
        const ns = $.WshShell.Popup("This Album Has A Lot of Tracks: " + length + "\n\nProceed?\n\nLoading May Take a Few Seconds", 0, artist + " | " + album, 1);
        if (ns != 1 || ns == "Artist | Album") return false; return true;
    }

    const on_tracks_search_done = (p_alb_id, list) => {
        if (!list || !list.length) {if (!ppt.btn_mode) return; else return fb.ShowPopupMessage(ml.alb == 3 ? "Request Made: Load Album Using Only Original Library Tracks\n\nResult: No Matching Tracks Found" : "Artist | Album Not Recognised\n\n"+ album_artist + " | " + album, "YouTube Track Manager");}
        if (list.length > 25 && list[0].artist.length + album.length < 251 && !many_tracks(list.length, list[0].artist, album)) return;
        done[p_alb_id] = list.length; rec[p_alb_id] = 0; yt_i[p_alb_id] = 0; reset_yt_timer(p_alb_id);
        pl.create("alb"); if (!ppt.plmanAddloc) plman.ActivePlaylist = pl.alb; if (ml.alb && ml.mtags_installed) {p.mtags[p_alb_id] = []; plman.ClearPlaylist(pl.alb);} else p.loc_add[p_alb_id] = [];
        yt_timer[p_alb_id] = setInterval(() => {
            if (yt_i[p_alb_id] < list.length) {do_youtube_search(p_alb_id, list[yt_i[p_alb_id]].artist, list[yt_i[p_alb_id]].title, yt_i[p_alb_id] + 1); yt_i[p_alb_id]++;} else reset_yt_timer(p_alb_id);
        }, 20);
    }

    const do_youtube_search = (p_alb_id, p_artist, p_title, p_index) => {
        if (ml.mtags_installed && (ml.alb > 1 && lib && lib.in_library_alb(p_alb_id, p_artist, p_title, album, date, p_index, false, false) || ml.alb == 3))
            return on_youtube_search_done(p_alb_id, "", p_artist, p_title, p_index);
        const yt_search = new Youtube_search(() => yt_search.on_state_change(), on_youtube_search_done);
        yt_search.Search(p_alb_id, p_artist, p_title, p_index, "", "", "", ml.alb && ml.mtags_installed ? "" : "fb2k_tracknumber=" + p_index + "&fb2k_album=" + encodeURIComponent(album) + (date.length ? ("&fb2k_date=" + encodeURIComponent(date)) : ""));
    }

    const reset_yt_timer = p_alb_id => {if (yt_timer[p_alb_id]) clearTimeout(yt_timer[p_alb_id]); yt_timer[p_alb_id] = null;}
    const run_add_loc = p_alb_id => {const add_loc_arr = []; s.sort(p.loc_add[p_alb_id], 'id'); add_loc_arr[p_alb_id] = [];
        p.loc_add[p_alb_id].forEach(v => {
            if (ppt.plmanAddloc) {add_loc_arr[p_alb_id].push(v.path);}
            else p.addLoc(v.path, pl.alb);
        });
        if (ppt.plmanAddloc) p.addLoc(add_loc_arr[p_alb_id], pl.alb, false, false, false, true);
    }

    const on_youtube_search_done = (p_alb_id, link, p_artist, p_title, p_ix, p_done, p_top50, p_pn, p_alb_set, p_length, p_orig_title, p_yt_title, p_full_alb, p_fn, p_type) => {
        rec[p_alb_id]++;
        if (link && link.length) {
            if (ml.alb && ml.mtags_installed) {const type_arr = ["", "YouTube Track", "Prefer Library Track", "Library Track"]; p.mtags[p_alb_id].push({"@":link,"ALBUM":album,"ARTIST":p_artist,"DATE":date,"DURATION":p_length.toString(),"REPLAYGAIN_TRACK_GAIN":[],"REPLAYGAIN_TRACK_PEAK":[],"TITLE":p_title,"TRACKNUMBER":p_ix.toString(),"YOUTUBE_TITLE":p_yt_title ? p_yt_title : [],"YOUTUBE_TRACK_MANAGER_SEARCH_TITLE":p_orig_title ? p_orig_title : [],"YOUTUBE_TRACK_MANAGER_TRACK_TYPE":type_arr[ml.alb]});}
            else p.loc_add[p_alb_id].push({"path":link,"id":p_ix});
        }
        if ((rec[p_alb_id] == done[p_alb_id] || p_done == "force") &&  done[p_alb_id] != "done")
            if (p.mtags[p_alb_id].length || p.loc_add[p_alb_id].length) {
                alb.set_row(p_alb_id, 2, p_artist); t.paint();
                if (ml.alb && ml.mtags_installed) alb.save_mtags(p_alb_id, p_artist, album); else run_add_loc(p_alb_id); done[p_alb_id] = "done"
            } else {alb.set_row(p_alb_id, 0, p_artist); t.paint(); if (ml.alb == 3) fb.ShowPopupMessage("Request Made: Load Album Using Only Original Library Tracks\n\nResult: No Matching Tracks Found", "YouTube Track Manager");}
    }
}

function Dld_album_names(p_callback) {
    const on_finish_callback = p_callback;

    this.Execute = (p_album_artist, p_just_mbid, p_dbl_load, p_mode) => {
        const mb_artist_id = new Musicbrainz_artist_id(() => mb_artist_id.on_state_change(), on_mb_artist_id_search_done);
        mb_artist_id.Search(p_album_artist, p_just_mbid, p_dbl_load, p_mode)
    }

    const on_mb_artist_id_search_done = (ar_mbid, just_mbid, mode) => {
        const mb_lfm_albums = new Album_names(() => mb_lfm_albums.on_state_change(), on_album_names_search_done);
        if ((!ar_mbid.length && ppt.mb || just_mbid) && !alb.songs_mode()) return on_album_names_search_done([], ar_mbid, mode);
        mb_lfm_albums.Search(ar_mbid, mode);
    }

    const on_album_names_search_done = (data, ar_mbid, mode) => {on_finish_callback(data, ar_mbid, true, mode);}
}

function Dld_more_album_names(p_callback) {
    const on_finish_callback = p_callback;

    this.Execute = (ar_mbid, mode) => {
        const mb_lfm_albums = new Album_names(() => mb_lfm_albums.on_state_change(), on_album_names_search_done);
        if (!ar_mbid.length && ppt.mb) return on_album_names_search_done([], ar_mbid, mode);
        mb_lfm_albums.Search(ar_mbid, mode);
    }

    const on_album_names_search_done = (data, ar_mbid, mode) => {on_finish_callback(data, ar_mbid, true, mode);}
}

function Scrollbar() {
    let period = ppt.duration.splt(0); period = {drag : 200, inertia : s.clamp(s.value(period[3], 3000, 0), 0, 5000), scroll : s.clamp(s.value(period[1], 500, 0), 0, 5000)}; period.step = period.scroll * 2 / 3;
    let alpha = !ppt.sbarCol ? 75 : (!ui.sbarType ? 68 : 51), amplitude, b_is_dragging = false, bar_ht = 0, bar_timer = null, bar_y = 0, but_h = 0, clock = Date.now(), counter = 0, drag_distance_per_row = 0, duration = period.scroll, elap = 0, event = "", fast = false, frame, hover = false, hover_o = false, init = true, initial_drag_y = 0, initial_scr = 1, initial_y = -1, ix = -1, lastTouchDn = Date.now(), max_scroll, offset = 0, ratio = 1, reference = -1, rows = 0, scrollbar_height = 0, scrollbar_travel = 0, start = 0, startTime = 0, ticker, timestamp, ts, velocity;
    const alpha1 = alpha, alpha2 = !ppt.sbarCol ? 128 : (!ui.sbarType ? 119 : 85), inStep = ui.sbarType && ppt.sbarCol ? 12 : 18, ln_sp = p.s_show && !ui.local ? Math.floor(ui.row_h * 0.1) : 0, min = 10 * s.scale, mv = 2 * s.scale;
    this.count = -1; this.delta = 0; ppt.flickDistance = s.clamp(ppt.flickDistance, 0, 10); this.draw_timer = null; this.item_y = p.s_show ? ui.row_h + (!ui.local ? ln_sp * 2 : 0) : ui.margin; this.row_count = 0; this.rows_drawn = 0; this.row_h = 0; this.scroll = 0; this.scrollable_lines = 0; ppt.scrollStep = s.clamp(ppt.scrollStep, 0, 10); this.text_y = 0; this.text_h = 0; ppt.touchStep = s.clamp(ppt.touchStep, 1, 10); this.stripe_w = 0; this.timer_but = null; this.touch = {dn: false, end: 0, start: 0}; this.x = 0; this.y = 0; this.w = 0; this.h = 0;

    const nearest = y => {y = (y - but_h) / scrollbar_height * max_scroll; y = y / this.row_h; y = Math.round(y) * this.row_h; return y;}
    const scroll_throttle = s.throttle(() => {this.delta = this.scroll; scroll_to();}, 16);
    const scroll_timer = () => {this.draw_timer = setInterval(() => {if (p.w < 1 || !window.IsVisible) return; smooth_scroll();}, 16);}

    this.leave = () => {if (this.touch.dn) {this.touch.dn = false;} if (!ppt.showAlb || t.halt()) return; hover = !hover; this.paint(); hover = false; hover_o = false;}
    this.page_throttle = s.throttle(dir => {this.check_scroll(Math.round((this.scroll + dir * -this.rows_drawn * this.row_h) / this.row_h) * this.row_h);}, 100);
    this.reset = () => {this.delta = this.scroll = 0; this.item_y = this.type == "alb" ? alb.alb_y : alb.art_y;}
    this.set_rows = (row_count) => {if (!row_count) this.item_y = this.type == "alb" ? alb.alb_y : alb.art_y; this.row_count = row_count; this.metrics(this.x, this.y, this.w, this.h, this.rows_drawn, this.row_h, this.text_y, this.text_h);}
    this.wheel = step => this.check_scroll(Math.round((this.scroll + step * -(!ppt.scrollStep ? this.rows_drawn : ppt.scrollStep) * this.row_h) / this.row_h) * this.row_h, ppt.scrollStep ? 'step' : "");

    this.metrics = (x, y, w, h, rows_drawn, row_h, text_y, text_h) => {
        this.x = x; this.y = Math.round(y); this.w = w; this.h = h; this.rows_drawn = rows_drawn; this.row_h = row_h; this.text_y = text_y; this.text_h = text_h; but_h = p.but_h;
        // draw info
        scrollbar_height = Math.round(this.h - but_h * 2);
        bar_ht = Math.max(Math.round(scrollbar_height * this.rows_drawn / this.row_count), s.clamp(scrollbar_height / 2, 5, p.grip_h));
        scrollbar_travel = scrollbar_height - bar_ht;
        // scrolling info
        this.scrollable_lines = this.row_count - this.rows_drawn;
        ratio = this.row_count / this.scrollable_lines;
        bar_y = but_h + scrollbar_travel * (this.delta * ratio) / (this.row_count * this.row_h);
        drag_distance_per_row = scrollbar_travel / this.scrollable_lines;
        // panel info
        if (ppt.rowStripes) this.stripe_w = p.sbarShow && this.scrollable_lines > 0 ? p.w - p.sbar_sp - Math.round(3 * s.scale) : p.w;
        max_scroll = this.scrollable_lines * this.row_h;
        but.set_scroll_btns_hide();
    }

    this.draw = gr => {
        if (this.scrollable_lines > 0) {
            switch (p.sbarType) {
                case 0:
                    switch (ppt.sbarCol) {
                        case 0: gr.FillSolidRect(this.x, this.y + bar_y, this.w, bar_ht, RGBA(ui.col.t, ui.col.t, ui.col.t, !hover && !b_is_dragging ? alpha : hover && !b_is_dragging ? alpha : 192)); break;
                        case 1: gr.FillSolidRect(this.x, this.y + bar_y, this.w, bar_ht, ui.col.text & (!hover && !b_is_dragging ? RGBA(255, 255, 255, alpha) : hover && !b_is_dragging ? RGBA(255, 255, 255, alpha) : 0x99ffffff)); break;
                    } break;
                case 1:
                    switch (ppt.sbarCol) {
                        case 0: gr.FillSolidRect(this.x, this.y - p.sbar_o, this.w, this.h + p.sbar_o * 2, RGBA(ui.col.t, ui.col.t, ui.col.t, 15)); gr.FillSolidRect(this.x, this.y + bar_y, this.w, bar_ht, RGBA(ui.col.t, ui.col.t, ui.col.t, !hover && !b_is_dragging ? alpha : hover && !b_is_dragging ? alpha : 192)); break;
                        case 1: gr.FillSolidRect(this.x, this.y - p.sbar_o, this.w, this.h + p.sbar_o * 2, ui.col.text & 0x15ffffff); gr.FillSolidRect(this.x, this.y + bar_y, this.w, bar_ht, ui.col.text & (!hover && !b_is_dragging ? RGBA(255, 255, 255, alpha) : hover && !b_is_dragging ? RGBA(255, 255, 255, alpha) : 0x99ffffff)); break;
                    } break;
                case 2: p.theme.SetPartAndStateID(6, 1); p.theme.DrawThemeBackground(gr, this.x, this.y, this.w, this.h); p.theme.SetPartAndStateID(3, !hover && !b_is_dragging ? 1 : hover && !b_is_dragging ? 2 : 3); p.theme.DrawThemeBackground(gr, this.x, this.y + bar_y, this.w, bar_ht); break;
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
        if (!p.sbarShow && ppt.touchControl) return tap(p_y);
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
                if (this.touch.dn) ui.dn_id = -1;
            }
        }
        if (this.touch.dn) {
            ts = Date.now(); if (ts - startTime > 300) startTime = ts; lastTouchDn = ts; this.check_scroll(initial_scr + (initial_y - p_y) * ppt.touchStep, 'drag');
            return;
        }
        const x = p_x - this.x, y = p_y - this.y;
        if (x < 0 || x > this.w || y > bar_y + bar_ht || y < bar_y || but.Dn) hover = false; else hover = true;
        if (hover != hover_o && !bar_timer) this.paint();
        if (!b_is_dragging || this.row_count <= this.rows_drawn) return;
        this.check_scroll(Math.round((y - initial_drag_y) / drag_distance_per_row) * this.row_h);
    }

    this.lbtn_drag_up = (p_x, p_y) => {
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
    }

    this.lbtn_up = (p_x, p_y) => {
        if (p.clicked) return; const x = p_x - this.x, y = p_y - this.y;
        if (!hover && b_is_dragging) this.paint(); else window.RepaintRect(this.x, this.y, this.w, this.h); if (b_is_dragging) {b_is_dragging = false; but.Dn = false;} initial_drag_y = 0;
        if (this.timer_but) {clearTimeout(this.timer_but); this.timer_but = null;}; this.count = -1;
    }

    const tap = p_y => {
        if (amplitude) {clock = 0; this.scroll = this.delta;}
        counter = 0; initial_scr = this.scroll;
        this.touch.dn = true; initial_y = reference = p_y; if (!offset) offset = p_y;
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
        if (now - lastTouchDn < 10000 && counter == 4) {ui.dn_id = -1; p.last_pressed_coord = {x: -1, y: -1}}
        elapsed = now - timestamp; if (initial) elapsed = Math.max(elapsed, 32);
        timestamp = now;
        delta = offset - frame;
        frame = offset;
        v = 1000 * delta / (1 + elapsed);
        velocity = 0.8 * v + 0.2 * velocity;
    }

    this.check_scroll = (new_scroll, type) => {
        const b = s.clamp(new_scroll, 0, max_scroll);
        if (b == this.scroll) return; this.scroll = b; this.item_y = this.type == "alb" ? alb.alb_y : alb.art_y;
        if (ppt.smooth) {
            elap = 16; event = type; this.item_y = p.s_h; start = this.delta;
            if (event != 'drag' || ppt.touchStep > 1) {
                duration = !event ? period.scroll : period[event];
                if (b_is_dragging) {if (Math.abs(this.delta - this.scroll) < scrollbar_height) fast = false; else {fast = true; duration = period.step;}}
                clock = Date.now(); if (!this.draw_timer) {scroll_timer(); smooth_scroll();}
            } else scroll_drag();
        } else scroll_throttle();
    }

    const calc_item_y = () => {if (this.type == "alb") {ix = Math.round(this.delta / this.row_h + 0.4); this.item_y = Math.round(this.row_h * ix + alb.alb_y - this.delta);} else {ix = Math.round(this.delta / this.row_h + 0.4); this.item_y = Math.round(this.row_h * ix + alb.art_y - this.delta);}}
    const position = (Start, End, Elapsed, Duration, Event) => {if (Elapsed > Duration) return End; const n = Elapsed / Duration; Event = b_is_dragging ? !fast ? ease.bar(n) : ease.barFast(n) : Event != 'inertia' ? ease.scroll(n) : ease.inertia(n); return Start + (End - Start) * Event;}
    const scroll_drag = () => {this.delta = this.scroll; scroll_to(); calc_item_y();}
    const scroll_finish = () => {if (!this.draw_timer) return; this.delta = this.scroll; scroll_to(); calc_item_y(); clearTimeout(this.draw_timer); this.draw_timer = null;}
    const scroll_to = () => {bar_y = but_h + scrollbar_travel * (this.delta * ratio) / (this.row_count * this.row_h); if (t.rp) window.RepaintRect(0, this.text_y, p.w, this.text_h + 3);}
    const shift = (dir, nearest_y) => {let target = Math.round((this.scroll + dir * -this.rows_drawn * this.row_h) / this.row_h) * this.row_h; if (dir == 1) target = Math.max(target, nearest_y); else target = Math.min(target, nearest_y); return target;}
    const shift_page = (dir, nearest_y) => {this.check_scroll(shift(dir, nearest_y)); if (!this.timer_but) {this.timer_but = setInterval(() => {if (this.count > 1) {this.check_scroll(shift(dir, nearest_y));} else this.count++;}, 100);}}
    const smooth_scroll = () => {
        this.delta = position(start, this.scroll, Date.now() - clock + elap, duration, event);
        if (Math.abs(this.scroll - this.delta) > 0.5) scroll_to(); else scroll_finish();
    }

    this.but = dir => {this.check_scroll(Math.round((this.scroll + dir * -this.row_h) / this.row_h) * this.row_h); if (!this.timer_but) {this.timer_but = setInterval(() => {if (this.count > 6) {this.check_scroll(this.scroll + dir * -this.row_h);} else this.count++;}, 40);}}
    this.scroll_to_end = () => this.check_scroll(max_scroll);
}
alb_scrollbar.type = "alb"; art_scrollbar.type = "art";

function Favourites() {
    const save_fav_to_file = () => p.local ? true : false; // use return true for file save/load of favourites

    this.toggle_auto = (rs) => {ppt.autoFav = !ppt.autoFav; if (ppt.autoFav) this.add_current_station(rs);}

    this.init = () => {
        if (save_fav_to_file()) {const n = fb.ProfilePath + "yttm\\" + "favourites.json"; if (!s.file(n)) s.save(n, "No Favourites", true); ppt.favourites = s.open(n);}
        this.stations = ppt.favourites;
        this.stations = !this.stations.includes("No Favourites") ? s.jsonParse(this.stations, []) : [];
        if (this.stations.length) s.sort(s.sort(this.stations, 'type', 'num'), "source", 0);
    }

    this.save = fv => {
        ppt.favourites = fv;
        this.stations = !fv.includes("No Favourites") ? s.jsonParse(fv, []) : [];
        if (this.stations.length) s.sort(s.sort(this.stations, 'type', 'num'), "source", 0);
        if (save_fav_to_file()) s.save(fb.ProfilePath + "yttm\\favourites.json", fv, true);
    }

    this.add_current_station = source => {
        if (!source.length || source == "N/A") return;
        const rq = index.rad_query; let station_array = ppt.favourites, rt = index.rad_type; if (rt == 4) rt = 1;
        station_array = !station_array.includes("No Favourites") ? s.jsonParse(station_array, []) : [];
        if (station_array.length) station_array = station_array.filter(v => v.source != source + (!rq ? "" : " [Query - " + index.n[3] + index.nm[3] + "]") || v.type != rt);
        station_array.push({"source":source + (!rq ? "" : " [Query - " + index.n[3] + index.nm[3] + "]"),"type":rt,"query":rq});
        if (station_array.length > 30) station_array.splice(0, 1);
        this.save(JSON.stringify(station_array));
    }

    this.remove_current_station = source => {
        let station_array = ppt.favourites;
        station_array = !station_array.includes("No Favourites") ? s.jsonParse(station_array, []) : [];
        station_array = station_array.filter(v => v.source != source);
        this.save(station_array.length ? JSON.stringify(station_array) : "No Favourites");
    }
}
fav.init();

function NewRadio() {
	let pt = [["SYSTEM.RAD.Artist Variety Ec", 50, "rad_ec_variety"],/*RAD-lastopened; others-menu*/ ["SYSTEM.RAD.Artist Variety Lfm", 50, "rad_lfm_variety"], ["SYSTEM.RAD.Mode", 1, "rad_mode"], ["SYSTEM.RAD.Query", false, "rad_query"], ["SYSTEM.RAD.Range", 1, "rad_range"], ["SYSTEM.RAD.Source", "N/A", "rad_source"], ["SYSTEM.RAD.Type", 2, "rad_type"], ["SYSTEM.Track Count", 0, "track_count"]]; ppt.init('manual', pt, this); pt = undefined;

    let ct = 0, pll = 0, pop1 = 0.8, pop2 = 0.2, presets = ppt.presets.replace(/^[,\s]+|[,\s]+$/g, ""), rad_found = false;
    const pc_at_adjust = ppt.pc_at_adjust / 20000, pc_cur_adjust = ppt.pc_cur_adjust / 20000, p_name = presets.split(","), songFeed = ppt.songFeed.splt(0), tagFeed = ppt.tagFeed.splt(0);
    this.yt_pref = ppt.yt_pref.splt(0); this.chk_upl = s.value(this.yt_pref[1], 1, 1); this.chk_title = s.value(this.yt_pref[3], 1, 1); this.chk_descr = s.value(this.yt_pref[5], 1, 1); this.playedArtists = s.jsonParse(ppt.playedArtists, false); this.playedTracks = s.jsonParse(ppt.playedTracks, false); this.pool = []; this.preset = []; this.refine_lfm = 0; this.yt_pref = this.chk_upl || this.chk_title || this.chk_descr; this.yt_pref_kw = ppt.yt_pref_kw.split("//");

    const basePool = (list, threshold, length) => {let count = 0; length = Math.min(list.length, length); for (let i = 0; i < length; ++i) if (list[i].playcount > threshold) count++; return count;}
    const calc_bias = v => {if (isNaN(v)) return 0.2; else return  v >= 10 ? 0 : Math.min(1 / Math.abs(v), 0.9)}
    this.radName = ppt.radName.split(",");
    const prop = ["ADV.Radio BestTracks Bias 1-10 Artist","ADV.Radio BestTracks Bias 1-10 Genre.TopTracks","ADV.Radio BestTracks Bias 1-10 Similar Artists","ADV.Radio BestTracks Bias 1-10 Similar Songs","ADV.Radio BestTracks Bias 1-10 Genre.TopArtists","ADV.Radio BestTracks Bias 1-10 Query"], weight = [[0.5,0.9,0.2],[0.9,0.9,0],[0.2,0.2,0],[0.5,0.9,"N/A"],[0.2,0.2,0],["N/A","N/A",0]], wt = [];
    const r0 = this.radName[0] ? this.radName[0].trim() : "Last.fm", r2 = this.radName[2] ? this.radName[2].trim() : "iSelect", r4 = this.radName[4] ? this.radName[4].trim() : "MySelect";
    wt[0] = ppt.get(prop[0], r0 + ",2," + r2 + ",1," + r4 + ",5").splt(1);
    wt[1] = ppt.get(prop[1], r0 + ",1," + r2 + ",1," + r4 + ",10").splt(1);
    wt[2] = ppt.get(prop[2], r0 + ",5," + r2 + ",5," + r4 + ",10").splt(1);
    wt[3] = ppt.get(prop[3], r0 + ",2," + r2 + ",1," + r4 + ",N/A").splt(1);
    wt[4] = ppt.get(prop[4], r0 + ",5," + r2 + ",5," + r4 + ",10").splt(1);
    wt[5] = ppt.get(prop[5], r0 + ",N/A," + r2 + ",N/A," + r4 + ",10").splt(1);
    weight.forEach((v, i, arr) => {
        if (wt[i][0] != this.radName[0] || wt[i][2] != this.radName[2] || wt[i][4] != this.radName[4]) ppt.set(prop[i], r0 + "," + wt[i][1] + "," + r2 + "," + wt[i][3] + "," + r4 + "," + wt[i][5]);
        arr[i] = [calc_bias(wt[i][1]),calc_bias(wt[i][3]),calc_bias(wt[i][5])];
    });

    const refine = ppt.get("ADV.Feed Refine 0 or 1", this.radName[0] + this.radName[1] + ",1," + this.radName[2] + this.radName[3] + "/SoftPlaylists,1").splt(1);
    if (refine[0] != this.radName[0] + this.radName[1] || refine[2] != this.radName[2] + this.radName[3] + "/SoftPlaylists") {ppt.set("ADV.Feed Refine 0 or 1",  this.radName[0] + this.radName[1] + ","  + refine[1] + "," + this.radName[2] + this.radName[3] + "/SoftPlaylists," + refine[3]);}
    this.refine_iS = 0; if (refine[3] != 0) this.refine_iS = 1; if (refine[1] != 0) this.refine_lfm = 1;
    for (let i = 0; i < p_name.length; i += 2) this.preset.push(p_name[i]); presets = presets.replace(/\s+/g, "").split(",");
    for (let i = 1; i < presets.length; i += 2) this.pool.push(Math.max(parseFloat(presets[i]), 5)); if (!this.pool.length) this.pool.push(50)
    if (!ppt.useSaved || !ppt.ecUseSaved) ppt.radMode = Math.max(ppt.radMode, 1);
    this.n = ["Echonest", this.radName[0] || "Last.fm", this.radName[2] || "iSelect", this.radName[4] || "MySelect"]; this.nm = [" Radio", this.radName[1] || " Radio", this.radName[3] || " Radio", this.radName[5] || " Radio", this.radName[7] || " ∙ "];
    if (!ppt.useSaved || !ppt.ecUseSaved) this.rad_mode = Math.max(this.rad_mode, 1);
    if (this.rad_range > this.pool.length - 1 || this.rad_range < 0) {this.rad_range = 0; ppt.set("SYSTEM.RAD.Range", this.rad_range);}
    pop2 = weight[this.rad_type][this.rad_mode - 1];
    if (ppt.radMode == 3 && this.rad_query) pop2 = weight[5][2]; pop1 = 1 - pop2;
    if (ppt.radRange > this.pool.length - 1 || ppt.radRange < 0) ppt.radRange = 0;
    if (!songFeed.length) songFeed.push(250); if (!tagFeed.length) tagFeed.push(500);

    this.filter_yt = (title, descr) => {try {if (title && (RegExp(ppt.ytTitleFilter, "i")).test(title)) return true; if (descr && (RegExp(ppt.ytDescrFilter, "i")).test(descr)) return true; return false;} catch (e) {s.trace("Syntax error in custom regular expression. Panel Property: ADV.YouTube 'Live' Filter..."); return false;}}
    this.pref_yt = (kw, n) => {try {if (n && (RegExp(kw, "i")).test(n)) return true; return false;} catch (e) {s.trace("Syntax error in custom regular expression. Panel Property: ADV.YouTube 'Preference'..."); return false;}}
    this.reset_add_loc = p_t50 => {if (!p_t50) {p.add_loc = []; p.loc_ix = 0; yt_rad.rec = 0;} else {p.t50_loc = []; p.t50_ix = 0; yt_rad.t50 = 0;}}
	this.setTrackCount = n => {this.track_count = n; ppt.set("SYSTEM.Track Count", n);}

    this.get_range = (rt, r) => {
        r = s.clamp(r, 0, this.pool.length - 1); const sw = this.pool[r] < 51 ? 0 : this.pool[r] < 100 ? 1 : 2; let range = 50;
        if (rt != 1 && rt != 3) {range = rt ? this.pool[r] : Math.max(this.pool[r], 50); if (isNaN(range)) range = 50; range = Math.min(range, 1000);}
        else if (rt == 1) {range = this.pool[r] * tagFeed[1]; range = s.clamp(range, 10, 1000); if (isNaN(range)) range = 500;}
        else {range = this.pool[r] * songFeed[1]; range = s.clamp(range, 10, 250); if (isNaN(range)) range = 250;}
        return range;
    }

    this.get_radio = (rs, rm, rt, rv, rr, rf, rq) => {
        pl.create("rad"); if (rq && rm != 3) {rm = 3; ppt.radMode = 3;}
        rad.text = "Searching...\n For " + (!ppt.softplaylist ? "Radio": "Radio / Soft Playlist"); t.repaint();
        rad_found = false; rad.search = true; this.rad_source = rs; this.rad_mode = rm; rad.sync = false; this.rad_query = rq; this.rad_type = rt;
        this.rad_range = s.clamp(rr, 0, this.pool.length - 1); rm ? this.rad_lfm_variety = rv : this.rad_ec_variety = rv;
        setTimeout(() => index.load(rs, rm, rt, rv, rr, rf, rq), 200); this.track_count = 0; // delay improves feedback
    }

    this.radio_found = (p_q) => {
        if (rad_found) return; rad_found = true; ct = 0;
        if (rad.search) {this.playedArtists = []; this.playedTracks = []; ppt.playedArtists = JSON.stringify(this.playedArtists); ppt.playedTracks = JSON.stringify(this.playedTracks);}
        pll = 0; pop2 = !p_q ? weight[this.rad_type][this.rad_mode - 1] : weight[5][2]; pop1 = 1 - pop2; rad.list = []; rad.param = false;
        ppt.set("SYSTEM.RAD.Source", this.rad_source);
        ppt.set("SYSTEM.RAD.Type", this.rad_type);
        this.rad_mode ? ppt.set("SYSTEM.RAD.Artist Variety Lfm", this.rad_lfm_variety) : ppt.set("SYSTEM.RAD.Artist Variety Ec", this.rad_ec_variety);
        ppt.set("SYSTEM.RAD.Mode", this.rad_mode);
        ppt.set("SYSTEM.RAD.Query", p_q);
        ppt.set("SYSTEM.RAD.Range", this.rad_range);
    }

    this.load = (rs, rm, rt, rv, rr, rf, rq) => {
            if (rm == 3 && ppt.mySelFilterID) s.trace(this.n[rm] + this.nm[rm] + ": " + "Library Filter Applied: " + rad.filter[ppt.mySelFilterID]);
            if (rm < 2 || (rt == 2 || rt == 4)) {rad.search_for_artist(rs, rm, rt, rv, rm ? this.get_range(rt, rr) : "", rt != 1 && rt != 3 && this.get_range(rt, rr) < 101 && ppt.cur_pop ? true : false, rf);
            if (rm > 1 && rt == 4) s.trace(this.n[rm] + this.nm[rm] + ": " + (rm == 2 ? "Filtered Library for Tracks in Last.fm Top Tracks Lists for Top \"" + rs  + "\" Artists" : "Last.fm Top \"" + rs  + "\" Artists: Pool: Matching Library Tracks") + "\nRadio Independent of Genre Tag in Music Files");
            if (rm > 1 && rt == 2) s.trace(this.n[rm] + this.nm[rm] + ": " + (rm == 2 ? "Filtered Library for Tracks in Last.fm Top Tracks Lists for \""  : "Pool: Library Tracks for \"") + rs + " and Similar Artists\"");
        } else if (rt < 2 || rt == 3) {rad.med_lib_radio("", rs, rm, rt, "N/A", rm == 1 ? "" : this.get_range(rt, rr), rq); s.trace(this.n[rm] + this.nm[rm] + ": " + (rm == 2 ? "Filtered Library for Tracks in Last.fm Top Track List for \"" + rs + "\"" + (rt == 1 ? "\nRadio Independent of Genre Tag in Music Files" : "") : (!rq ? (rt == 0 ? "Artist" : "Genre") + " IS " + rs : "Query: " + rs) + ": Pool: Matching Library Tracks"));}
    }

    this.artist = length => {
        if (!length) return 0; let a_ind =  0;
        if (this.playedArtists.length != 0 || this.rad_type == 4) {
            const r = Math.random();
            if (ppt.randomArtist) a_ind = pop(0, "", length -= 1, 3, 0) + 1;
            else if (this.playedArtists.includes(0) || r > (this.rad_lfm_variety * -0.13 + 19.5) / 100) a_ind = pop(0, "", length -= 1, 2, 0) + 1;
        }
        this.playedArtists.push(a_ind); if (this.playedArtists.length > 6) this.playedArtists.splice(0, 1); ppt.playedArtists = JSON.stringify(this.playedArtists); return a_ind;
    }

    this.genre = (length, list, rad_lib) => {
        if (!length) return; const g_ind = pop(rad_lib, list, length, 1, 0);
        this.playedTracks.push(g_ind); if (this.playedTracks.length > length - 1) this.playedTracks.splice(0, 1); ppt.playedTracks = JSON.stringify(this.playedTracks) ;
        if (!rad_lib) {this.playedArtists.push(list[g_ind].artist.strip()); if (this.playedArtists.length > 6) this.playedArtists.splice(0, 1); ppt.playedArtists = JSON.stringify(this.playedArtists);} return g_ind;
    }

    this.track = (list, artist, name, rm, cur) => {
        if (!list.length) return 0; const extend_pool = this.pool[this.rad_range], pc_adjust = cur ? pc_cur_adjust : pc_at_adjust, sw = extend_pool < 51 ? 0 : extend_pool < 100 ? 1 : 2
        let extend = false, filter, filter_pool = 0, h_ind = 0, min_pool = extend_pool * (extend_pool < 251 ? 0.15 : 0.12), pool = 0, threshold = 1000 * pc_adjust / extend_pool * 1000 / 6, min_filter = threshold * 0.3; /*calc before higher hot values*/ if (extend_pool < 100) threshold = Math.min(threshold * 2.25 * (100 - extend_pool) / 25, 15000 * pc_adjust); min_pool = Math.floor(sw == 1 ? min_pool - 1 : extend_pool > 149 ? Math.max(min_pool, 25) : min_pool); const h_factor = Math.max(4 * min_pool / 7, 3); /*calc before min value set*/ if (min_pool < 7) min_pool = Math.min(extend_pool, 7); const seed_pool = Math.floor(min_pool * (extend_pool < 126 ? 3 : 2.5));
        if (rm != 2 || !artist) {if (sw) extend = Math.random() < 0.6 ? false : true;} else extend = true; const max_pool = Math.min(sw == 0 ? extend_pool : extend ? extend_pool : sw == 1 ?  50 : Math.round(extend_pool / 2), list.length);
        if (artist && this.playedTracks.length > Math.min(Math.floor(list.length * 0.9), 100)) {this.playedTracks = []; ppt.playedTracks = JSON.stringify(this.playedTracks);}
        if (rm == 1 && this.refine_lfm || rm == 2) {
            threshold +=  Math.floor(threshold * 2 / 3 * Math.random()); if (extend) threshold /= sw == 1 ? 1.5 : 2;
            if (this.rad_source == name) {min_pool = basePool(list, min_filter * (extend_pool < 101 ? 0.85 : 1), max_pool) > seed_pool ? Math.max(seed_pool, 50) : Math.min(seed_pool, 50); filter = Infinity;}
            else {
                filter = Math.max(list.length > 2 ? (parseFloat(list[0].playcount) + parseFloat(list[1].playcount) + parseFloat(list[2].playcount)) / (h_factor * 3) : parseFloat(list[0].playcount) / h_factor);
                filter = !artist ? Math.max(min_filter, filter) : Math.min(min_filter * (extend_pool < 101 ? 0.65 : 0.75), filter);
                if (artist && !this.track_count && rm == 1) this.setTrackCount(Math.max(basePool(list, filter, extend_pool), 50));
            }
            filter = Math.min(threshold, rm == 2 && !artist && filter * h_factor < threshold ? Infinity : filter); pool = basePool(list, filter, max_pool); pool = s.clamp(min_pool, pool, list.length); if (artist) pool = Math.max(pool, 50);
            if (!artist && rm == 1) {pll = pool + pll; ct++; if (!this.track_count) this.setTrackCount(Math.round(extend_pool * this.rad_lfm_variety / 2)); else if (!(ct % rad.limit) || !rad.limit && ct > 1) this.setTrackCount(Math.round(pll * this.rad_lfm_variety / ct)); t.repaint();}
        } else {pool = Math.min(max_pool, list.length); if (!this.track_count && rm == 1) this.setTrackCount(!artist ? Math.round(extend_pool * this.rad_lfm_variety) : Math.min(extend_pool, list.length));}
        if (rm == 2) return pool;
        h_ind = pop(0, list, Math.min(list.length, pool), 0, 1);
        if (!artist && this.playedTracks.includes(list[h_ind].title.strip()) || xmas_song(list[h_ind].title)) h_ind = pop(0, list, Math.min(list.length, max_pool), 0, 2); // fallback
        this.playedTracks.push(list[h_ind].title.strip()); if (this.playedTracks.length > 100) this.playedTracks.splice(0, 1); ppt.playedTracks = JSON.stringify(this.playedTracks); return h_ind;
    }

    this.load_iSelect = (list, p_rt, lic) => {
        const l = list.length; if (l < this.limit + 2) return; const handleList = FbMetadbHandleList(), pn = pl.rad, no = rad.get_no(rad.limit, plman.PlaylistItemCount(pn)); let h_ind;
        for (let i = 0; i < no; i++) {
            h_ind = p_rt != 1 && p_rt != 3 ? pop(1, list, l, p_rt ? 1 : 0, 1) : this.genre(l, list, 1);
			if (!lic || !lic.Count) return; handleList.Add(lic[list[h_ind].id]);
            if (l) {this.playedArtists.push(list[h_ind].artist.strip()); if (this.playedArtists.length > 6) this.playedArtists.splice(0, 1); ppt.playedArtists = JSON.stringify(this.playedArtists);} if (l && p_rt != 1 && p_rt != 3) {this.playedTracks.push(list[h_ind].title); if (this.playedTracks.length > Math.floor(l * 0.9)) this.playedTracks = []; ppt.playedTracks = JSON.stringify(this.playedTracks);}
        } if (handleList.Count) plman.InsertPlaylistItems(pn, plman.PlaylistItemCount(pn), handleList);
    }

    this.load_MySelect = (list, p_rt) => {
        const l = list.Count; if (l < this.limit + 2) return; const handleList = FbMetadbHandleList(), pn = pl.rad, no = rad.get_no(rad.limit, plman.PlaylistItemCount(pn)); let h_ind;
        for (let i = 0; i < no; i++) {
            h_ind = pop(2, list, l, p_rt ? 1 : 0, 0); handleList.Add(list[h_ind]);
            if (l) {this.playedArtists.push(tf.a0.EvalWithMetadb(list[h_ind]).strip()); this.playedTracks.push(tf.t0.EvalWithMetadb(list[h_ind]).strip()); if (this.playedArtists.length > 6) this.playedArtists.splice(0, 1); ppt.playedArtists = JSON.stringify(this.playedArtists); if (this.playedTracks.length > Math.floor(l * 0.9)) this.playedTracks = []; ppt.playedTracks = JSON.stringify(this.playedTracks);}
        } if (handleList.Count) plman.InsertPlaylistItems(pn, plman.PlaylistItemCount(pn), handleList);
    }

    const pop = (rad_lib, list, l, ar, ti) => {
        const pp1 = rad_lib || ar < 2 ? pop1 : 0.8, pp2 = rad_lib || ar < 2 ? pop2 : 0.2; let ind = Math.floor(l * Math.random()), j = 0;
        switch (rad_lib) {
            case 0: while (((pp1 > 0.1 && ar != 3 ? ((((1 - ind / l) * pp1 + pp2) + Math.random()) <= 1) : false) || (ar ? this.playedArtists.includes(ar > 1 ? ind + 1 : list[ind].artist.strip()) : false) || (ar < 2 ? xmas_song(list[ind].title) : false) || (ar < 2 && ti < 2 ? this.playedTracks.includes(ti ? list[ind].title.strip() : ind) : false)) && j < l) {ind = Math.floor(l * Math.random()); j++;} break;
            case 1: while (((pp1 > 0.1 ? ((((1 - ind / l) * pp1 + pp2) + Math.random()) <= 1) : false) || (ar ? this.playedArtists.includes(list[ind].artist.strip()) : false) || xmas_song(list[ind].title) || this.playedTracks.includes(ti ? list[ind].title : ind)) && j < l) {ind = Math.floor(l * Math.random()); j++;} break; // <-title already stripped
            case 2: while (((pp1 > 0.1 ? ((((1 - ind / l) * pp1 + pp2) + Math.random()) <= 1) : false) || (ar ? this.playedArtists.includes(tf.a0.EvalWithMetadb(list[ind]).strip()) : false) || xmas_song(tf.t0.EvalWithMetadb(list[ind])) || this.playedTracks.includes(tf.t0.EvalWithMetadb(list[ind]).strip())) && j < l) {ind = Math.floor(l * Math.random()); j++;} break;
        } return ind;
    }

    const xmas_song = title => {
        const kw = "christmas|xmas|(?=.*herald)\\bhark|mary's\\s*boy|santa\\s*baby|santa\\s*claus";
        const d = new Date(), n = d.getMonth();
        if (n == 11 || (RegExp(kw, "i")).test(this.rad_source)) return false;
        else if (!(RegExp(kw, "i")).test(title)) return false;
        else return true;
    }

    this.best_saved_match = (source, radtype) => {
        const rs = source.clean(), fp = rad.e1 + rs.substr(0, 1).toLowerCase() + "\\" + rs + (radtype == 2 ? " And Similar Artists\\" : radtype == 3 ? " [Similar Songs]\\" : "\\"); let all_files = [], fa;
        if (s.folder(fp)) for (let k = ppt.ec_variety / 10; k < 11; k++) {fa = fp + "\\" + (radtype == 0 ? "" : k * 10 + "\\"); if (s.folder(fa)) all_files = utils.Glob(fa + "\\*"); if (all_files.length) break;}
        if (s.folder(fp) && !s.folder(fa)) for (let k = ppt.ec_variety / 10 - 1; k >= 0; k--) {fa = fp + "\\" + (radtype == 0 ? "" : k * 10 + "\\"); if (s.folder(fa)) all_files = utils.Glob(fa + "\\*"); if (all_files.length) break;}
        return all_files;
    }
}

function Radio() {
    let pt = [[" Radio Playlist Track Limit 2-25", 5, "stndLmt"], [" Radio Playlist Track Limit 2+", 5, "cusLmt"]]; ppt.init('manual', pt, this); pt = undefined;

	const filters = ppt.mySelFilters.split("|"), iS_timeout = ppt.iS_timeout.splt(1), npFont = ppt.npFont.splt(1);
    let art_variety = !index.rad_mode ? index.rad_ec_variety : index.rad_type == 2 || index.rad_type == 4 ? index.rad_lfm_variety : "N/A", cur_pop = ppt.cur_pop, finished = false, f_sz = 36, font_h = 44, font_sz = f_sz, np_n = "Calibri", list = [], li = FbMetadbHandleList(), li_c = FbMetadbHandleList(), np_style = 1, part_load = false, rad_fav, rad_id = 0, rad_mode = index.rad_mode, rad_query = index.rad_query, rad_source = index.rad_source, rad_type = index.rad_type, radio_timer = null, sim1_set = false, song_hot = index.rad_mode ? index.get_range(rad_type, index.rad_range) : "", text_h = 0, text_y = 0, text_o, top_50 = 1, update_fav = true;
    this.filter = []; filters.unshift("None"); this.force_refresh = 0; this.list = false; this.list_index = 0; this.list_type = false; this.param = false; this.search; this.stndLmt = Math.min(this.stndLmt, 25); this.sync = false; this.text = ""; this.t50_array = [];

    f_sz = Math.round(s.value(npFont[1], 16, 0)); font_sz = f_sz; np_n = npFont[0]; np_style = Math.round(s.value(npFont[2], 0, 0)); let np_font = gdi.Font(np_n, f_sz, np_style), np_fontLarge = np_font;
    let iSelect_timeout = 120000; if (iS_timeout[0] != index.n[2]) ppt.iS_timeout = index.n[2] + "," + iS_timeout[1];
    iSelect_timeout = Math.max(iS_timeout[1] * 1000, 30000); if (isNaN(iSelect_timeout)) iSelect_timeout = 120000;
    if (!p.v) {this.limit = this.stndLmt; ppt.set(" Radio Playlist Track Limit 2+", null);} else {this.limit = this.cusLmt; ppt.set(" Radio Playlist Track Limit 2-25", null);} if (ppt.full) p.rel_imgs = 1; if (!ppt.removePlayed) this.limit = 0;
    if (!ppt.get("SYSTEM.Library Check", false)) {const db_lib = fb.GetLibraryItems(); let db_pl = s.query(db_lib, "%play_count% GREATER 4").Count, db_r = s.query(db_lib, (p.local ? "%_autorating%" : "%rating%") + " GREATER 1").Count; if (db_r < 5000 || db_r / db_lib.Count < 0.2) db_r = 0; if (db_pl < 5000 || db_pl / db_lib.Count < 0.2) db_pl = 0; ppt.mySelFilterID = db_pl || db_r  ? db_r > db_pl ? 1 : 2 : 0;} ppt.set("SYSTEM.Library Check", true);
    filters.forEach(v => {
        const fil = p.local ? v.replace("%rating%", "%_autorating%").trim() : v.trim();
        if (fil.length) this.filter.push(fil);
    });
    if (ppt.mySelFilterID > this.filter.length - 1) ppt.mySelFilterID = 0;

    const calc_text = f => {s.gr(1, 1, false, g => font_h = Math.round(g.CalcTextHeight("String", f)));}
    const create_softplaylist = (list, p_rs, p_rt) => {
        const handleList = FbMetadbHandleList(), pln = plman.FindOrCreatePlaylist("'" + p_rs + (p_rt == 2 ? " Similar Artists" : "") + "' " + pl.soft_playlist, false);
        list.forEach(v => handleList.Add(li[v.id]));
        plman.ClearPlaylist(pln); plman.InsertPlaylistItems(pln, 0, handleList, false); if (ppt.activateSoftPlaylist) plman.ActivePlaylist = pln;
    }
    const feedback = () => {if (this.text == text_o) return; t.repaint(); this.search = false; text_o = this.text; if (ppt.autoFav && update_fav) fav.add_current_station(rad_source); update_fav = false;}
    const reset_t50 = p_top50 => {this.search = true; this.t50_array = []; text_o = ""; this.text = "Searching...\n For " + (p_top50 == 3 ? "Top40" : "Top" + pl.top50); rad_fav = false; t.repaint();}
    const video_set_up = () => {if (!p.videoMode || ppt.get("SYSTEM.Video Check", false)) return; fb.ShowPopupMessage("\"Prefer Video\" mode (yV):\n\nThis employs the foo_youtube video player popup.\n\nIt's recommended to set the video player up as follows:\n\n1) For best results set show and hide video frame \"Manually\" (\"foobar2000\\Preferences\\Tools\\Youtube Source\\Video\").\n\n2) Overlay the video player on top of YouTube Track Manager. Position and size as required.\n\n3) Enable \"window: Lock relative to main window\", \"window: Show video only\" & \"Fix to current\" in the video player right click menu.\n\n4) See the foo_youtube documentation for more info.\n\nLimitations:\n\nAs the foo_youtube video player can't be embedded in Spider Monkey panel, the above works by overlaying the popup version. Since it's a popup panel it doesn't resize with foobar2000.\n\nIt's recommended to set up video mode before closing this window.", "YouTube Track Manager"); ppt.set("SYSTEM.Video Check", true);}

    this.cancel_iSelect = () => {add_loc(rad_mode, rad_type, true, 1, false); finished = true; timer.clear(timer.sim1); timer.clear(timer.sim2); timer.clear(timer.yt); on_dld_radio_tracks_done(false, "", 0, "", "", "", true);}
    this.get_no = (rad_limit, rad_pl_count) => {if (rad_limit && rad_pl_count >= rad_limit) return 0; else return rad_limit ? rad_limit - rad_pl_count : 1;}
    this.mbtn_up = (x, y, n) => {if (ppt.showAlb || t.halt() || !ui.np_graphic || x < 0 || y < 0 || x > p.w || y > p.h) return; const np_txt = n ? n == 1 ? true : false : !but.btns["yt"].trace(x, y); if (np_txt) {ppt.full = !ppt.full; p.rel_imgs = ppt.full ? 1 : ppt.rel_imgs; img.on_size(); this.on_size(); if (p.videoMode && this.pss) {this.force_refresh = 2; this.refreshPSS();} but.refresh(true);} else {p.videoMode = !p.videoMode; video_set_up(); p.set_video(); timer.clear(timer.vid); if (p.videoMode && !ppt.showAlb && p.IsVideo()) timer.video(); if (ui.blur) img.on_size(); img.focus(); if (ppt.artistView && ppt.cycPhoto) timer.image(); else timer.clear(timer.img); if (this.pss) {this.force_refresh = 2; this.refreshPSS();} t.paint(); ppt.videoMode = p.videoMode; if (ppt.focus) alb.reset();}}
    this.on = () => ppt.autoRad && plman.ActivePlaylist == pl.rad;
    this.on_playback_new_track = () => {if (!ppt.autoRad || plman.PlayingPlaylist != pl.rad || !rad_source) return; dld_new_track(); timer.rad_chk = true;}
    this.on_size = () => {font_sz = s.clamp(f_sz, 1, f_sz / 36 * p.h * (1 - p.rel_imgs) / 3); np_font = gdi.Font(np_n, font_sz, np_style); np_fontLarge = gdi.Font(np_n, s.clamp(p.w > 1000 ? 45 * f_sz / 38 : 43 * f_sz / 38, 1, p.h / 4), np_style); if (!ui.np_graphic) return; if (ppt.autoLayout) {text_y = Math.min(p.h * p.rel_imgs, p.h - img.ny); text_h = Math.max(img.ny, p.h * (1 - p.rel_imgs));} else {calc_text(np_font); text_h = Math.max(font_h * 2, 1); Math.max(text_y = p.h - text_h, 0);}}
    this.pss = !ui.dui && window.IsTransparent && utils.CheckComponent("foo_uie_panel_splitter", true);
    this.refreshPSS = () => {if (this.force_refresh != 2 || !this.pss) return; if (fb.IsPlaying || fb.IsPaused) {fb.Pause(); fb.Pause();} else {fb.Play(); fb.Stop();} this.force_refresh = 0;}
    this.set_rad_selection = pn => {const np = plman.GetPlayingItemLocation(); let pid = 0; if (plman.PlayingPlaylist == pn && np.IsValid) pid = np.PlaylistItemIndex; plman.SetPlaylistFocusItem(pn, pid); plman.ClearPlaylistSelection(pn); plman.SetPlaylistSelectionSingle(pn, pid, true);}
    this.set_t50_selection = pn => {if (plman.PlaylistItemCount(pn) < (top_50 != 3 ? Math.floor(this.t50 * 0.96) : 38)) return; plman.SetPlaylistFocusItem(pn, 0); plman.ClearPlaylistSelection(pn);}
    this.text_toggle = (x, y) => {if (ui.np_graphic && y <= Math.min(p.h * p.rel_imgs, p.h - img.ny)) return; ppt.textType = !ppt.textType; this.refreshPSS(); t.paint();}
    this.toggle_auto = () => ppt.autoRad = !ppt.autoRad;

    this.remove_played = () => {
        if (plman.PlayingPlaylist != pl.rad) return;
        const np = plman.GetPlayingItemLocation(), pn_r = pl.rad; let pid;
        if (np.IsValid) {pid = np.PlaylistItemIndex; if (ppt.saveRadPlaylist) {plman.SetPlaylistSelectionSingle(pn_r, pid, true); pl.save_radio(pn_r, plman.GetPlaylistSelectedItems(pn_r));}}
        if (!ppt.autoRad || !this.limit || plman.PlayingPlaylist != pl.rad) return;
        if (plman.PlaylistItemCount(pn_r) > this.limit - 1) {if (np.IsValid) {plman.ClearPlaylistSelection(pn_r); for (let i = 0; i < pid; i++) plman.SetPlaylistSelectionSingle(pn_r, i, true); plman.RemovePlaylistSelection(pn_r, false);}}
    }

    const dld_new_track = () => {
        const get_list = !this.list && this.get_no(this.limit, plman.PlaylistItemCount(pl.rad));
        if (rad_mode == 2 && get_list) {
            this.search = true; this.text = index.n[2] + index.nm[2] + "\nRefreshing..."; t.repaint();
        }
        setTimeout(() => this.load(get_list), 300); // delay improves feedback
    }

    this.load = get_list => {
        if (get_list) this.sync = true;
        if (rad_mode > 1) {
            if (get_list) {
                if (rad_type == 2 || rad_type == 4) {return this.search_for_artist(rad_source, rad_mode, rad_type, art_variety, song_hot, rad_type != 1 && rad_type != 3 && song_hot < 101 && cur_pop ? true : false);
                } else return this.med_lib_radio("", rad_source, rad_mode, rad_type, "N/A", song_hot, rad_query);
            } else return rad_mode == 2 ? index.load_iSelect(this.list, rad_type, li_c) : index.load_MySelect(this.list, rad_type);
        }
        if (!rad_mode ? (this.list_index + 1 > (this.list.length - (this.limit ? this.limit : 1)) || get_list) : get_list)
            this.search_for_artist(rad_source, rad_mode, rad_type, art_variety, song_hot, rad_type != 1 && rad_type != 3 && song_hot < 101 && cur_pop ? true : false);
        else dld_next_track();
    }

    this.search_for_artist = (p_rad_source, p_rad_mode, p_rad_type, p_art_variety, p_song_hot, p_cur_pop, p_rad_fav) => {
        rad_source = p_rad_source; rad_mode = p_rad_mode; rad_type = p_rad_type; art_variety = p_art_variety; song_hot = p_song_hot; rad_fav = p_rad_fav; cur_pop = p_cur_pop;
        if (!rad_source || rad_source == "N/A") return on_dld_radio_tracks_done(false);
        yt_rad.Execute(on_dld_radio_tracks_done, rad_source, rad_mode, rad_type, art_variety, song_hot, this.limit, cur_pop, "", pl.rad);
    }

    const search_for_top50 = (p_search, p_top50, p_pn) => {
        if (!p_search.length || p_search == "N/A" || p_top50 < 1 || p_top50 > 3) return on_dld_radio_tracks_done(false, "", p_top50); const sz = [100, Math.min(pl.top50 * 1.5, 1000), Math.min(pl.top50 * 1.5, 250), 40];
        yt_rad.Execute(on_dld_radio_tracks_done, p_search, rad_mode, p_top50 == 1 ? 0 : 3, art_variety, sz[p_top50], this.limit, false, p_top50, p_pn);
    }

    this.get_top50 = (n, p_top50) => {
        reset_t50(p_top50); if (!n) return on_dld_radio_tracks_done(false, "", p_top50); top_50 = p_top50; let pn_50;
        if (pl.exist(n, ppt.savePlaylists, p_top50 == 3)) {pn_50 = plman.ActivePlaylist = pl.t50(n, ppt.savePlaylists, p_top50 == 3); if (plman.PlaylistItemCount(pn_50)) return on_dld_radio_tracks_done(true, "", p_top50);}
        pn_50 = pl.t50(n, ppt.savePlaylists, p_top50 == 3); if (!ppt.savePlaylists) {plman.ActivePlaylist = pn_50; plman.ClearPlaylist(plman.ActivePlaylist);}; search_for_top50(n, p_top50, pn_50);
    }

    this.refresh_top50 = pl_active => {
        top_50 = pl_active.includes("Singles Chart") ? 3 : !pl_active.includes(" | ") ? 1 : 2; reset_t50(top_50);
        const refresh_name = top_50 != 3 ? (!pl_active.includes(pl.t50_playlist + ": ") ? pl_active.replace(pl.t50_playlist + " [","").slice(0, -1) : pl_active.replace(pl.t50_playlist + ": ","")) :
        (!pl_active.includes(pl.t40_playlist + ": ") ? pl_active.replace(pl.t40_playlist + " [","").slice(0, -1) : pl_active.replace(pl.t40_playlist + ": ",""));
        plman.ClearPlaylist(plman.ActivePlaylist); search_for_top50(refresh_name, top_50, plman.ActivePlaylist);
    }

    this.draw = gr => {
        if (t.halt()) return;
        if ((!this.search) && this.on()) {
            if (ppt.textType) {
                this.text = rad_source ? (plman.PlayingPlaylist == pl.rad ? rad_source + (rad_type == 2 ?  " And Similar Artists" : "")  + "\n" : "Active Playlist" + index.nm[4] + rad_source + (rad_type == 2 ?  " And Similar Artists" : "") + "\n") +
                (index.n[rad_mode] + index.nm[rad_mode] + (index.track_count ? index.nm[4] + index.track_count + " Tracks" : "")) : p.eval(ppt.tfNowplaying);
            }
            else {const origT = this.text; this.text = p.eval(ppt.tfNowplaying); if (!this.text && fb.IsPlaying) this.text = origT;}
        } else if (!this.search && ppt.textType) this.text = "Active Playlist" + "\n" + pl.active().replace(pl.alb_yttm,"");
        else if (!this.search || !this.text) this.text = p.eval(ppt.tfNowplaying);
        if (!ui.np_graphic) gr.GdiDrawText(this.text, np_fontLarge, ui.col.text, 10, 10, p.w - 20, p.h - 20, t.cc);
        if (p.rel_imgs == 1 || !ui.np_graphic) return; if (ppt.npShadow && (!ui.blur || !timer.transition.id)) gr.GdiDrawText(this.text, np_font, ui.outline(ui.col.text), 10 + 1, text_y + 1, p.w - 20, text_h, t.cc); gr.GdiDrawText(this.text, np_font, ui.col.text, 10, text_y, p.w - 20, text_h, t.cc);
    }

    const on_dld_radio_tracks_done = (found, p_rad_mode, p_top50, p_pn, lfm_na, lib_na, cancel, p_q) => {
        if (found) {
            if (p_rad_mode != 2 && !p_top50 && !this.sync) {plman.ActivePlaylist = pl.rad; if (ppt.removePlayed) plman.ClearPlaylist(plman.ActivePlaylist);}
            if (!p_top50) {this.list_index = 0; text_o = ""; update_fav = true; index.radio_found(p_q);} feedback();
        } else {
            if (!p_top50) {
				if (ppt.useSaved && ppt.ecUseSaved && rad_fav && rad_mode < 2) {rad_mode = !rad_mode ? 1 : 0; return index.get_radio(rad_source, rad_mode, rad_type, rad_mode ? ppt.lfm_variety : ppt.ec_variety, ppt.radRange, false);} // try other rad_mode if fav fails
				index.track_count = ppt.get("SYSTEM.Track Count");
				rad_mode = index.rad_mode = ppt.get("SYSTEM.RAD.Mode");
				art_variety = rad_mode ? ppt.get("SYSTEM.RAD.Artist Variety Lfm") : ppt.get("SYSTEM.RAD.Artist Variety Ec");
				rad_query = index.rad_query = ppt.get("SYSTEM.RAD.Query");
				rad_source = index.rad_source = ppt.get("SYSTEM.RAD.Source");
				rad_type = index.rad_type = ppt.get("SYSTEM.RAD.Type");
				song_hot = rad_mode ? index.get_range(rad_type, ppt.get("SYSTEM.RAD.Range")) : "";
			}
            this.text = cancel ? index.n[2] + "\nSearch Cancelled" : "Failed To Open " + (p_top50 ? "Top " + (p_top50 != 3 ? pl.top50 : 40) + "\n" : "Radio" + (!ppt.softplaylist ? "" : " / SoftPlaylist") + "\n") + (ppt.useSaved ? "No Saved Source" : lib_na ? "Media Library N/A" : (p_rad_mode < 2 || p_top50 || lfm_na ? "Unrecognised Source or Last.fm N/A" : "Insufficient Matching Tracks In Library")); t.repaint();
            if (p_top50 && p_pn > 0 && ppt.savePlaylists) plman.RemovePlaylist(p_pn);
            if (!radio_timer) {radio_timer = setTimeout(() => {this.search = false; t.repaint(); radio_timer = null;}, 5000);}
        }
    };

    const dld_next_track = () => {
        if (!this.list.length) return;
        index.reset_add_loc(); let tracks;
        switch (rad_mode) {
            case 0:
                tracks = this.list.slice(this.list_index, this.list_index + this.get_no(this.limit, plman.PlaylistItemCount(pl.rad)));
                tracks.forEach((v, i) => yt_rad.do_youtube_search("", v.artist, v.title, i, tracks.length, "", pl.rad));
                this.list_index = this.list_index + tracks.length;
                break;
            default:
                tracks = this.get_no(this.limit, plman.PlaylistItemCount(pl.rad));
                switch (rad_type == 4 ? 2 : rad_type) {
                    case 0:
                        for (let i = 0; i < tracks; i++) {const t_ind = index.track(this.list, true, "", rad_mode, this.list_type); yt_rad.do_youtube_search("", this.param, this.list[t_ind].title, i, tracks, "", pl.rad);}
                        break;
                    case 1:
                    case 3:
                        for (let i = 0; i < tracks; i++) {const g_ind = index.genre(this.list.length, this.list, 0); yt_rad.do_youtube_search("", this.list[g_ind].artist, this.list[g_ind].title, i, tracks, "", pl.rad);}
						index.setTrackCount(this.list.length);
                        break;
                    case 2:
                        if (!ppt.useSaved)
                            for (let i = 0; i < tracks; i++) {const s_ind = index.artist(this.list.length); yt_rad.do_lfm_radio_tracks_search(rad_type != 4 ? this.list[s_ind].name : this.list[s_ind], rad_mode, rad_type == 4 ? 2 : rad_type, art_variety, song_hot, cur_pop, i, tracks, "", pl.rad);}
                        else {
                            let ft;
                            for (let l = 0; l < tracks; l++) {
                                this.list.some(() => {
                                    const s_ind = index.artist(this.list.length), lp = rad_type != 4 && this.list[0].hasOwnProperty('name') ? this.list[s_ind].name.clean() : this.list[s_ind].clean();
                                    ft = this.f2 + lp.substr(0, 1).toLowerCase() + "\\" + lp + (cur_pop ? " [curr]" : "") + ".json";
                                    if (!s.file(ft)) ft = this.f2 + lp.substr(0, 1).toLowerCase() + "\\" + lp + (!cur_pop ? " [curr]" : "") + ".json";
                                    return s.file(ft);
                                });
                                if (!s.file(ft)) return on_dld_radio_tracks_done(false);
                                const data = s.jsonParse(ft, false, 'file');
                                if (!data) return on_dld_radio_tracks_done(false); const cur = ft.includes(" [curr]");
                                if (data[0].hasOwnProperty('artist')) data.shift();
                                list = $.take(data, song_hot).map(yt_rad.titles);
                                const art_nm = s.fs.GetBaseName(ft).replace(" [curr]", "");
                                if (list.length) {s.sort(list, 'playcount', 'numRev'); const t_ind = index.track(list, false, art_nm, rad_mode, cur); yt_rad.do_youtube_search("", art_nm, list[t_ind].title, l, tracks, "", pl.rad);}
                            }
                        }
                        break;
                }
                break;
        }
    }

    const add_loc = (p_rs, p_rm, p_rt, sort, load, ended) => {
        if (sort) s.sort(p.add_loc, 'playcount', 'numRev');
        if (p.add_loc.length > this.limit + 1) {
            if (ended) on_dld_radio_tracks_done(true, p_rm);
            if (load) {
                if (!ended) index.radio_found(); li_c = li.Clone(); this.list = p.add_loc.slice(0); index.setTrackCount(this.list.length); t.repaint();
                if (load == 2 || !part_load) {
                    const syn = this.sync && plman.PlayingPlaylist == pl.rad && ppt.removePlayed; let np; if (syn) np = plman.GetPlayingItemLocation();
                    if (syn && np.IsValid) {
						const affectedItems = [], pid = np.PlaylistItemIndex, pn = pl.rad;
						const handleList = plman.GetPlaylistItems(pn);
						for (let i = pid + 1; i < handleList.Count; i++) if (!fb.IsMetadbInMediaLibrary(handleList[i])) affectedItems.push(i);
						plman.ClearPlaylistSelection(pn); plman.SetPlaylistSelection(pn, affectedItems, true); plman.RemovePlaylistSelection(pn, false);
					}
                    else {plman.ActivePlaylist = pl.rad; if (ppt.removePlayed) plman.ClearPlaylist(plman.ActivePlaylist);}
                    index.load_iSelect(this.list, p_rt, li_c); part_load = true; this.sync = false;
                }
            }
            timer.clear(timer.sim1);
        } else if (ended) on_dld_radio_tracks_done(false); if (ended) this.sync = false;
        if (ppt.softplaylist && ended && p.add_loc.length) create_softplaylist(p.add_loc.slice(0), p_rs, p_rt);
    }

    const set_text = p_done => {
        if (!part_load) {index.track_count = p.add_loc.length; this.text = "Analysing Library for Last.fm Top Tracks...\nFound " + index.track_count + " Tracks" + " (" + Math.round(yt_rad.rec / p_done * 100) +"% Done)";}
        else if (ppt.softplaylist) {index.track_count = p.add_loc.length; this.text = "Radio Loaded" + index.nm[4] + "Soft Playlist Pending...\nFound " + index.track_count + " Tracks" + " (" + Math.round(yt_rad.rec / p_done * 100) +"% Done)";}
        else {index.track_count = p.add_loc.length; this.search = false;} t.repaint();
    }

    const do_lfm_lib_radio_tracks_search = (p_artist, p_rad_mode, p_rad_type, p_art_variety, p_song_hot, p_cur_pop, p_i, p_done, p_top50, p_pn) => {
        const lfm_lib_search = new Lfm_radio_tracks_search(() => lfm_lib_search.on_state_change(), on_lfm_lib_radio_tracks_search_done);
        lfm_lib_search.Search(p_artist, p_rad_mode, p_rad_type, p_art_variety, p_song_hot, p_cur_pop, p_i, p_done, p_top50, p_pn);
    }

    const on_lfm_lib_radio_tracks_search_done = (p_artist, p_title, p_i, p_done, p_top50, p_pn, p_rm, p_rt) => {
        if (p_i != rad_id) return; let q, q_t;
        switch (p_rt) {
            case 0:
                if (!p_artist.length || !p_title.length) return on_dld_radio_tracks_done(false, "", 0, 0, true);
                s.sort(p_title, 'playcount', 'numRev'); $.take(p_title, song_hot);
				q = "(NOT %path% HAS !!.tags) AND ("; q_t = name.q_a + " IS "; if (lib.partialMatchArt && lib.partialMatchType[5] != 0) q_t = name.q_a + " HAS "; q += q_t + p_artist + ")";
                if (index.refine_iS) {const pool =  index.track(p_title, true, "", 2, false); $.take(p_title, pool);}
                li = s.query(lib.get_lib_items(), q);
                lib.iSelectRefine(li);
                p_title.forEach(v => lib.iSelectMatch(p_artist, v.title, v.playcount));
                add_loc(rad_source, p_rm, p_rt, false, 2, true);
                break;
            case 1:
            case 3:
                if (!p_artist.length) return on_dld_radio_tracks_done(false, "", 0, 0, true);
				const a_arr = []; let a = "", a_o = "", j = 0; q = "(NOT %path% HAS !!.tags) AND ("; q_t = name.q_a + " IS "; if (lib.partialMatchArt && lib.partialMatchType[5] != 0) q_t = name.q_a + " HAS ";
                $.take(p_artist, song_hot).forEach(v => {
                    a = v.artist.toLowerCase();
                    if (a != a_o) {a_arr.push(a); a_o = a;}
                });
                a_arr.forEach(v => {if (lib.in_library_art(v)) {q += (j ? " OR " : "") + q_t + v; j++;}});
                if (!j) return on_dld_radio_tracks_done(false); q += ")";
                li = s.query(lib.get_lib_items(), q);
                lib.iSelectRefine(li);
                p_artist.forEach(v => lib.iSelectMatch(v.artist, v.title, "N/A"));
                add_loc(rad_source, p_rm, p_rt, false, 2, true);
                break;
            case 2:
                if (finished) return; yt_rad.rec++;
                if (p_artist.length && p_title.length && lib) {
                    s.sort(p_title, 'playcount', 'numRev'); $.take(p_title, song_hot);
                    if (index.refine_iS) {const pool =  index.track(p_title, false, p_artist, 2, false); $.take(p_title, pool);}
                    p_title.forEach(v => lib.iSelectMatch(p_artist, v.title, v.playcount));
                } set_text(p_done);
                if (!sim1_set && !timer.sim1.id) timer.sim1.id = setInterval(() => {add_loc(rad_source, p_rm, p_rt, true, 2, false); set_text(p_done);}, 10000);
                if (timer.sim1.id) sim1_set = true;
                timer.clear(timer.sim2); timer.sim2.id = setTimeout(() => {finished = true; timer.clear(timer.sim1); timer.sim2.id = null; add_loc(rad_source, p_rm, p_rt, true, 1, true);}, iSelect_timeout);
                if (yt_rad.rec == p_done) {timer.clear(timer.sim1); timer.clear(timer.sim2); add_loc(rad_source, p_rm, p_rt, true, 1, true);}
            break;
        }
    };

    this.med_lib_radio = (data, p_rad_source, p_rad_mode, p_rad_type, p_art_variety, p_song_hot, p_query) => {
        let a = "", i = 0, j = 0; index.reset_add_loc(); if (rad_id == 19) rad_id = 0; else rad_id++; li = FbMetadbHandleList();
        finished = true; part_load = true; sim1_set = true; timer.clear(timer.sim1); timer.clear(timer.sim2); timer.clear(timer.yt); if (!data && p_rad_mode == 2 && (p_rad_type == 2 || p_rad_type == 4)) return on_dld_radio_tracks_done(false, "", 0, 0, true); if (!lib) return on_dld_radio_tracks_done(false, "", 0, 0, false, true);
        finished = false; part_load = false; sim1_set = false; rad_source = p_rad_source; rad_mode = p_rad_mode; rad_type = p_rad_type; art_variety = p_art_variety; if (p_song_hot) song_hot = p_song_hot; rad_query = p_query;
        switch (rad_mode) {
            case 2:
                switch (rad_type) {
                    case 0: if (lib.in_library_art(rad_source)) {do_lfm_lib_radio_tracks_search(rad_source, rad_mode, rad_type, art_variety, song_hot, false, rad_id, 0, 0, "");} else return on_dld_radio_tracks_done(false); break;
                    case 1:
                    case 3: do_lfm_lib_radio_tracks_search(rad_source, rad_mode, rad_type, art_variety, song_hot, false, rad_id, 0, 0, ""); break;
                    default:
						let done = 0, q = "(NOT %path% HAS !!.tags) AND (", q_t = name.q_a + " IS "; if (lib.partialMatchArt && lib.partialMatchType[5] != 0) q_t = name.q_a + " HAS ";
                        j = 0;
                        data.some(v => {
                            a = rad_type != 4 && data[0].hasOwnProperty('name') ? v.name : v;
                            if (lib.in_library_art(a)) {q += (j ? " OR " : "") + q_t + a;
                            if (j == art_variety - 1) {done = j + 1; return true;}
                            else {j++; done = j}}
                        });
                        if (!done) return on_dld_radio_tracks_done(false);
                        q += ")";
                        li = s.query(lib.get_lib_items(), q);
                        lib.iSelectRefine(li); j = 0; i = 0; timer.sim2.id = setTimeout(() => {finished = true; timer.clear(timer.sim1); timer.sim2.id = null; add_loc(rad_source, rad_mode, rad_type, true, 1, true);}, iSelect_timeout);
                        timer.yt.id = setInterval(() => {if (i < data.length && j < art_variety) {a = rad_type != 4 && data[0].hasOwnProperty('name') ? data[i].name : data[i]; if (lib.in_library_art(a)) {do_lfm_lib_radio_tracks_search(a, rad_mode, rad_type == 4 ? 2 : rad_type, art_variety, song_hot, false, rad_id, done, 0, ""); j++;} i++;} else timer.clear(timer.yt);}, 20); // delay improves feedback
                        break;
                }
                break;
            case 3:
                if (rad_type > 1 && !data) return on_dld_radio_tracks_done(false, "", 0, 0, true); let q = "";
                switch (rad_type) {
                    case 0: q += name.q_a + " IS " + rad_source; break; case 1: q = !rad_query ? name.q_g + " IS " + rad_source : rad_source; break;
                    default: j = 0;
                        data.some(v => {
                        a = rad_type != 4 && data[0].hasOwnProperty('name') ? v.name : v;
                        if (lib.in_library_art(a)) {q += (j ? " OR " : "") + name.q_a + " IS " + a;
                        if (j == art_variety - 1) return true; j++;}
                        });
                    break;
                }
                if (ppt.mySelFilterID) q = "(" + q + ")" + " AND " + this.filter[ppt.mySelFilterID];
                if (!j && rad_type > 1) return on_dld_radio_tracks_done(false);
                li = s.query(lib.get_lib_items(), q);
                li.OrderByFormat(tf.r, 1); if (!ml.sort_rand) li.OrderByFormat(ml.item_sort, ml.dir);
                if (li.Count > this.limit + 1) {index.setTrackCount(li.Count); on_dld_radio_tracks_done(true, rad_mode, false, false, false, false, false, rad_query); this.list = li; index.load_MySelect(this.list, rad_type); } else on_dld_radio_tracks_done(false);
                break;
        }
    }

    if (ppt.ecUseSaved) this.e1 = fb.ProfilePath + "yttm\\" + "echonest\\";
    this.f2 = fb.ProfilePath + "yttm\\" + "lastfm\\"; s.create(this.f2);
}

function Albums(p_album_name_callback) {
    const alb_info_lfm = [[], [], []], extra_sbar_w = p.sbarShow ? ppt.extra_sbar_w : false, htmlfile = new ActiveXObject('htmlfile'), lg = [], l_h = Math.round(1 * s.scale), lfm_type = ["Top Albums", "Top Tracks", "Top Songs"], margin = p.sbarShow && !extra_sbar_w ? Math.max(p.sbar_sp + 10, ppt.bor) : ppt.bor, mb_type = ["All Releases", "Releases", "Albums", "Compilations", "Singles and EPs", "Remixes"], on_album_search_done_callback = p_album_name_callback, row_ix = [], w = {};
    let alb_h = 0, alb_search = false, alb_info = [], alb_info_mb = [[], [], [], [], []], alb_m_i = -1, alb_m_i_o = 0, alb_n = "", alb_r = 0, alb_rows = 0, alb_sp = 0, ar_id_done = false, ar_mbid = false, art_l = 0, art_m_i = -1, art_m_i_o = 0, art_r = 0, art_rows = 0, art_sp = 0, bot = 0, cursor = false, cx = 0, dat = "", data = [], do_sim = false, end = 0, f_alb_y = 0, f_art_y = 0, ht = 1, lbtn_dn = false, ln1_y = 0, ln2_y = 0, load_artist = "", log = [], mbidSort = true, nm = [], lfm_width = [], mb_width = [], offset = 0, pc_h = 0, reset_type = ppt.showSimilar, sel_x = 0, sel_w = 0, search_done = [true, true, true, true], search_txt = "", shift = false, shift_x = 0, sim_artists = [], sim_nm = "", start = 0, text_w = 0, top = ppt.bor * 0.625 + 8, tx1_w = 0, tx2_w = 0, txt_w = 0, txt1_w = 0, txt2_w = 0, type = 0, type_width = [], valid_prime = false, w1 = 0, w2 = 0, w3 = 0;
    this.artist = ""; this.alb_y = 0; this.art_y = 0; this.artists = []; this.dld; this.edit = false; this.get = true; this.lock_artist = false; this.orig_artist = ""; s.create(rad.f2 + "r"); this.related_artists = rad.f2 + "r\\related_artists.json"; this.rel_artists = []; this.release_name = [ppt.showLive ? "All Releases" : "Releases", "Albums", "Compilations", "Singles and EPs", "Remixes"]; this.track_source = 1; if (ppt.btn_mode) ppt.showAlb = false;

    const do_youtube_search = (p_alb_id, p_artist, p_title, p_date) => {pl.create("alb"); if (!ppt.plmanAddloc) plman.ActivePlaylist = pl.alb; if (ml.alb && ml.mtags_installed) plman.ClearPlaylist(pl.alb); const yt_search = new Youtube_search(() => yt_search.on_state_change(), on_youtube_search_done); yt_search.Search(p_alb_id, p_artist, p_title, "", "", "", "", ml.alb && ml.mtags_installed ? "" : "&fb2k_album=" + encodeURIComponent(p_title) + (p_date ? ("&fb2k_date=" + encodeURIComponent(p_date)) : ""), "", true);}
    const artist_recognised = () => this.artist && !search_done[ppt.mb ? 3 : ppt.lfm_mode] ?  "Searching..." : !ar_mbid || this.songs_mode() ? "Unrecognised " + (!this.songs_mode() ? "Artist" : "Song"): ppt.mb && (ppt.showLive ? !data.length : !valid_prime) || !ppt.mb ? "Nothing Found" : "Nothing Found For Release Type:\n" + this.release_name[ppt.releaseType];
    const drawcursor = gr => {if (alb_search && cursor && start == end && cx >= offset) {const lx = margin + release_w() + get_cursor_x(cx); gr.DrawLine(lx, top, lx, top + ht - 1, l_h, ui.col.text);}}
    const get_cursor_x = pos => {let x = 0; s.gr(1, 1, false, g => {if (pos >= offset) x = g.CalcTextWidth(search_txt.substr(offset, pos - offset), ui.font);}); return x;}
    const done = new_artist => {if (nm[!ppt.mb ? ppt.lfm_mode : 3] == (!this.songs_mode() ? new_artist : this.artist_title)) return true; else return false;}
    const drawsel = gr => {if (start == end) return; const clamp = margin + release_w() + (w3 - release_w()); gr.DrawLine(Math.min(margin + release_w() + get_cursor_x(start), clamp), top + ht / 2, Math.min(margin + release_w() + get_cursor_x(end), clamp), top + ht / 2, ht - 1, ui.col.searchSel);}
    const focus = () => {if (fb.IsPlaying && this.orig_artist != this.artist) return; if (!this.lock_artist) this.orig_artist = this.artist = name.artist(); if (!this.artist) return; this.on_playback_new_track();};
    const get_cursor_pos = x => {const nx = x - margin - release_w(); let i = offset, pos = 0; s.gr(1, 1, false, g => {for (i = offset; i < search_txt.length; i++) {pos += g.CalcTextWidth(search_txt.substr(i, 1), ui.font); if (pos >= nx + 3) break;}}); return i;}
    const get_mb_tracks = (alb_id, a, alb_n) => {const mb_releases = new Musicbrainz_releases(() => mb_releases.on_state_change(), on_mb_releases_search_done); mb_releases.Search(alb_id, "", a, alb_n);}
    const get_offset = gr => {let j = 0, tx = gr.CalcTextWidth(search_txt.substr(offset, cx - offset), ui.font); while (tx >= w3 - release_w() && j < 500) {j++; offset++; tx = gr.CalcTextWidth(search_txt.substr(offset, cx - offset), ui.font);}}
    const mb_sort = () => {switch (ppt.releaseType) {case 0: if (!ppt.mb_group) {s.sort(alb_info_mb[0], 'releaseType'); s.sort(alb_info_mb[0], 'date', 'rev')} else {s.sort(alb_info_mb[0], 'date', 'rev'); s.sort(alb_info_mb[0], 'releaseType');} break; default: s.sort(alb_info_mb[0], 'releaseType'); s.sort(alb_info_mb[0], 'date', 'rev'); break;}}
    const numFormat = n => {if (!n) return; return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");}
    const on_mb_releases_search_done = (p_alb_id, p_re_mbid, p_album_artist, p_date) => {dat = p_date; do_youtube_search(p_alb_id, p_album_artist, alb_n, p_date); t.paint();}
    const record = () => {lg.push(search_txt); log = []; if (lg.length > 30) lg.shift();}
    const release_w = () => (ppt.mb ? mb_width[ppt.releaseType == 0 ? ppt.showLive ? 0 : 1 : ppt.releaseType + 1] : lfm_width[ppt.lfm_mode]) + w.sp;
    const repaint = () => {if (!ppt.showAlb || t.halt()) return; if (t.rp) window.RepaintRect(margin, Math.floor(top), txt_w, ht + 1);}
    const reset_album = mode => {search_done[mode] = false; if (mode == 3) {alb_info_mb = [[], [], [], [], []]; data = [];} else alb_info_lfm[mode] = [];}
    const reset_albums = (new_artist, mode, bypass) => {alb_info = []; if (ppt.showAlb) t.paint(); reset_album(mode); if (!bypass) {ar_id_done = ar_mbid = false;} if (mode == 3) nm[3] = new_artist; else nm[mode] = (mode != 2 ? new_artist : this.artist_title); valid_prime = false;}
    const type_text = () => (ppt.mb ? this.release_name[ppt.releaseType] : lfm_type[ppt.lfm_mode]) + ":"; this.wheel = () => {alb_m_i = -1; alb_m_i_o = 0; art_m_i = -1; art_m_i_o = 0;}

    this.calc_rows_alb = () => {alb_scrollbar.reset(); alb_scrollbar.set_rows(alb_info.length);}
    this.calc_rows_art = () => {art_l = ppt.showArtists ? this.artists.length : 0; art_scrollbar.reset(); art_scrollbar.set_rows(art_l);}
    this.fit = () => [margin, top, ht]; this.lbtn_up = (x, y, mask) => {if (start != end) timer.clear(timer.cursor); lbtn_dn = false;}
    this.focus_serv = s.debounce(() => {if (!this.lock_artist) this.orig_artist = this.artist = name.artist(); if (ppt.showAlb) focus(); if (ui.np_graphic && ppt.dl_art_img) dl_art.run();}, 1000, {'leading':true, 'trailing': true});
    this.mbtn_dn = (x, y) => {if (!ppt.showAlb || t.halt()) return; if (ppt.touchControl) ui.dn_id = get_ix(x, y);}
    this.metadb_serv = s.debounce(() => {focus(); if (ui.np_graphic && ppt.dl_art_img) dl_art.run();}, 500);
    this.leave = () => {if (!ppt.showAlb|| t.halt()) return; alb_m_i = -1; alb_m_i_o = 0; art_m_i = -1; art_m_i_o = 0; t.paint(); type = 0;};
    this.on_focus = p_is_focused => {if (!p_is_focused) {timer.clear(timer.cursor); cursor = false; repaint();}}
    this.on_key_up = vkey => {if (!ppt.showAlb || t.halt()) return; if (vkey == vk.shift) {shift = false; shift_x = cx;}};
    this.rbtn_up = (x, y) => {men.search_menu(x, y, start, end, htmlfile.parentWindow.clipboardData.getData('text') ? true : false);}
    this.reset = () => {offset = start = end = cx = 0; this.orig_artist = this.artist = name.artist(); this.artist_title = name.artist_title(); search_txt = !this.songs_mode() ? this.artist : this.artist_title; nm = []; sim_nm = ""; search_for_album_names(0, ppt.mb ? 3 : ppt.lfm_mode);}
    this.scrollbar_type = () => type == 1 ? art_scrollbar : type == 2 ? alb_scrollbar : 0;
    this.set_txt = ns => {search_txt = ns ? ns : !this.songs_mode() ? this.artist : this.artist_title; if (!ns) {alb_search = false; offset = start = end = cx = 0;} repaint();}
    this.search_txt = () => search_txt ? true : false; this.songs_mode = () => !ppt.mb && ppt.lfm_mode == 2;

    this.get_releases = (m, r) => {
        switch (m) {
            case "lfm": ppt.lfm_mode = r; search_for_album_names(2, r, r == 2 ? this.artist_title : this.artist, ar_mbid); text_w = !r ? tx1_w : tx2_w; break;
            case "mb":
                ppt.releaseType = r; text_w = txt_w - w.date - type_width[r];
                for (let i = 0; i < 5; i++) if (ppt.releaseType == i ) {if (alb_info_mb[i].length) alb_info = alb_info_mb[i]; else analyse("", 3); on_album_search_done_callback();}; break;
        } this.set_txt();
    }

    this.set_row = (alb_id, n, a) => {
        if (ppt.btn_mode) return; let id = null;
        p.loading.some(v => {if (v.id == alb_id) {id = v.t; return true;}});
        const mb = id < 6 ? true : false, j = mb ? id - 1 : id - 6, k = row_ix[alb_id]; let nn = "";
        if (mb && !alb_info_mb[j][k] || !mb && !alb_info_lfm[j][k] || id != 8 && this.artist && a != this.artist || id == 8 && alb_info_lfm[j][k].artist && a != alb_info_lfm[j][k].artist) return;
        if (mb) nn = alb_info_mb[j][k].name = alb_info_mb[j][k].name.replace(/^(x |> |>> )/,"");
        else nn = alb_info_lfm[j][k].name = alb_info_lfm[j][k].name.replace(/^(x |> |>> )/,"");
        if (n == 4) return; switch (n) {case 0: nn = "x " + nn; break; case 1: nn = "> " + nn; break; case 2: nn = ">> " + nn; break; case 3: nn = (p.loc_add[alb_id].length ? ">> " : "x ") + nn; break;}
        mb ? alb_info_mb[j][k].name = nn : alb_info_lfm[j][k].name = nn;
    }

    this.on_playback_new_track = () => {
        if (rad.pss) if (window.IsVisible) rad.force_refresh = 1; else rad.force_refresh = 0;
        if (!ppt.showAlb || (this.lock_artist && this.artist) || t.block()) {this.get = true; t.repaint(); return;} // block
        this.artist_title = name.artist_title(); this.set_txt(); if (rad.pss) rad.force_refresh = 2;
        timer.clear(timer.cursor); search_for_album_names(0, ppt.mb ? 3 : ppt.lfm_mode);
    }

    const getAlbumsFallback = () => {
        if (!this.get || (this.lock_artist && this.artist)) return;
        if (!this.lock_artist && !this.artist) this.orig_artist = this.artist = name.artist();
        if (!this.lock_artist) this.artist_title = name.artist_title(); this.set_txt(); if (rad.pss && !rad.force_refresh) rad.force_refresh = 2;
        timer.clear(timer.cursor); search_for_album_names(0, ppt.mb ? 3 : ppt.lfm_mode);
    }

    const dld_album = (alb_id, index) => {
        if (utils.IsKeyPressed(0x12)) return s.browser("https://musicbrainz.org/release-group/" + alb_info[index].rg_mbid);
        const i_n = alb_info[index].name.replace(/^> /,"");
        if (ml.alb) if (this.library_test(this.artist, i_n)) return; this.dld = new Dld_album_tracks();
        this.dld.Execute(alb_id, alb_info[index].rg_mbid, this.artist, i_n, alb_info[index].prime, alb_info[index].extra, alb_info[index].date);
    }

    const search_for_album_names = (type, mode, new_artist, ar_id, just_mbid) => {
        switch (type) {
            case 0: // new track or reset
                if (!new_artist) new_artist = this.artist; this.get = false; if (!new_artist) return; do_sim = false;
                const albums = new Dld_album_names(on_albums_search_done);
                if (ppt.showArtists && ppt.showSimilar && !new_artist.uuid() && sim_nm != new_artist) this.search_for_similar_artists(new_artist);
                if (done(new_artist) && !just_mbid) return;
                if (!ppt.showSimilar) {this.artists = []; this.rel_artists = []; this.artists[0] = {name: "Searching...", id: ""}; this.calc_rows_art();}
                if (!just_mbid) reset_albums(new_artist, mode); albums.Execute(new_artist, just_mbid, "", mode);
                break;
            case 1: // mouse click similar or related artist
                if (ppt.showSimilar) this.rel_artists = []; else sim_artists = []; reset_albums(new_artist, mode);
                if (ar_id) {const albums = new Dld_more_album_names(on_albums_search_done); albums.Execute(ar_id, mode);} // get album names
                else {const albums = new Dld_album_names(on_albums_search_done); albums.Execute(new_artist, false, ppt.showSimilar ? false : true, mode);} // get mbid then album names
                if (ppt.showArtists && !ppt.showSimilar) {sim_artists[0] = {name: "Searching...", score: ""}; sim_nm = ""; do_sim = true;}; load_artist = new_artist;
                break;
            case 2: // but actions mostly
                timer.clear(timer.artist);
                if (!ar_id_done) {reset_album(mode); t.paint(); /*immediate reset*/ return timer.artist.id = setTimeout(() => {alb.reset(); timer.artist.id = null;}, 1500);}
                if (done(new_artist)) {
                    if (ppt.mb) {alb_info = alb_info_mb[ppt.releaseType]; return on_album_search_done_callback();}
                    else {alb_info = alb_info_lfm[mode]; return on_album_search_done_callback();}
                }
                else {const albums = new Dld_more_album_names(on_albums_search_done); reset_albums(new_artist, mode, true); albums.Execute(ar_id, mode);} // get album names if no data
                break;
            }
        }

    this.search_for_similar_artists = n => {
        if (n == sim_nm) return; sim_nm = n; this.artists = []; do_sim = false; sim_artists = []; this.artists[0] = {name: "Searching...", id: "", score: ""}; this.calc_rows_art();
        const similar = new Lfm_similar_artists(() => similar.on_state_change(), on_similar_search_done); similar.Search(n);
    }

    this.chooseartist = (ns, type) => {
        if (!type) {
            if (!this.songs_mode()) {try {ns = utils.InputBox(window.ID, "Type Artist Name Or\nPaste Musicbrainz ID (MBID)\n\n#Prefix Directly Gets Top " + pl.top50 + " Artist Tracks", "Mode: Artist Look Up", "#" + name.art(), true);} catch (e) {return;}}
            else {try {ns = utils.InputBox(window.ID, "Type Artist | Title\nUse Pipe Separator\n\n#Prefix Directly Gets Top " + pl.top50 + " Songs", "Mode: Song Look Up", "#" + this.artist_title, true);} catch (e) {return;}}
        }
        if (!ns) return; ns = ns.titlecase(); const t50 = ns.match(/^#/) == "#"; if (t50) ns = ns.replace(/^#/, ""); ns = ns.trim(); this.set_txt(ns);
            if (!ppt.btn_mode) {
                if (!ns.uuid()) this.artist = !this.songs_mode() ? ns : ns.split("|")[0].trim();
                if (this.songs_mode()) {this.artist_title = ns; ns = this.artist;}
                if (!ppt.showAlb && ns.uuid()) search_for_album_names(0, ppt.mb ? 3 : ppt.lfm_mode, ns, "", true); // true blocks chain before album names obtained if uuid true
                if (ppt.showAlb) search_for_album_names(0, ppt.mb ? 3 : ppt.lfm_mode, ns); else this.get = true;
            }
            if (ppt.btn_mode) {if (!ns.uuid()) this.artist = ns; else search_for_album_names(0, ppt.mb ? 3 : ppt.lfm_mode, ns, "", true);}
            if (t50) {
                if (ns.uuid() && !ar_id_done && !this.songs_mode()) {return timer.artist.id = setTimeout(() => {rad.get_top50(name.art(), 1); timer.artist.id = null;}, 1500);}
                if (!this.songs_mode()) rad.get_top50(ns.uuid() ? name.art() : ns, 1); else rad.get_top50(this.artist_title, 2);
            }
    }

    this.lockartist = () => {
        this.lock_artist = !this.lock_artist;
        if (this.lock_artist) return; this.orig_artist = this.artist = name.artist(); this.artist_title = name.artist_title(); this.set_txt();
        search_for_album_names(0, ppt.mb ? 3 : ppt.lfm_mode);
    }

    this.calc_text = () => {
        const rel_name = ["Remix Album  ", "Album ", "Compilation ", "Single ", "Remix Album "], sp_arr = ["0000  ", "  ", "00  ", " 10,000,000", " Score", "   Last.fm Playcount"]; let h; ht = 0;
        s.gr(1, 1, false, g => {
            for (let j = 0; j < 3; j++) {h = g.CalcTextHeight("String", j == 0 ? ui.font : j == 1 ? ui.headFont : ui.pcFont); j < 2 ? ht = Math.max(ht, h + ppt.verticalPad) : pc_h = h;}
            ["date", "sp", "rank", "pc", "score", "lfm"].forEach((v, i) => w[v] = g.CalcTextWidth(sp_arr[i] , i == 4 ? ui.headFont : i == 5  ? ui.pcFont : ui.font));
            const getWidth = v => g.CalcTextWidth(v, ui.font);
            lfm_width = lfm_type.map(getWidth);
            mb_width = mb_type.map(getWidth);
            type_width = rel_name.map(getWidth);
        });
        w1 = p.w - margin - (!extra_sbar_w ? 0 : p.sbar_sp); w2 = w1 - ht * 0.75; w3 = w2 - margin; sel_x = Math.round(margin - margin / 2); if (p.sbarShow) sel_x = !extra_sbar_w ? Math.max(sel_x, p.sbar_sp) + 2 : Math.min(sel_x + 2, ppt.bor); sel_w = p.w - sel_x * 2 - (!extra_sbar_w ? 0 : p.sbar_sp); txt_w = p.w - margin * 2 - (!extra_sbar_w ? 0 : p.sbar_sp);
        txt1_w = txt_w - w.score - w.sp; txt2_w = w.score; tx1_w = txt_w - w.pc; tx2_w = txt_w - w.rank - w.sp - w.pc;
        text_w = ppt.mb ? txt_w - w.date - type_width[ppt.releaseType] : !ppt.lfm_mode ? tx1_w : tx2_w;
        if (!ppt.showSimilar) {txt1_w = txt_w * 2 / 3 - w.sp; txt2_w = txt_w / 3};
    }

    this.calc_rows = () => {
        let ln_sp = 0, tot_r = 0; top = ppt.bor * 0.625 + 19 * but.scale; bot = top + ht; ln_sp = ht * 0.2; ln1_y = top + ht + ln_sp; this.alb_y = ln1_y + ln_sp; // temp values with min allowed ln_sp
        const sp1 = p.h - top - ht - (ppt.autoLayout ? Math.max(ht, ppt.bor) : 1), sp2 = sp1 - ln_sp * (ppt.showArtists ? 5 : 3); tot_r = Math.floor(sp2 / ht);
        ln_sp = (sp1 - tot_r * ht) / (ppt.showArtists ? 5 : 3); top = top + ln_sp; bot = top + ht; ln1_y = bot + ln_sp; this.alb_y = ln1_y + ln_sp; // recalc
        art_r = ppt.showArtists ? tot_r  > 8 ? Math.max(Math.round(tot_r / 3), 5) : Math.floor(tot_r / 2) : 0;
        alb_r = tot_r - art_r; art_sp = art_r * ht; alb_sp = alb_r * ht; alb_h = this.alb_y + alb_sp;
        ln2_y = this.alb_y + alb_sp + ln_sp; this.art_y = ln2_y + ln_sp;
        const top_corr = [p.sbar_o - (p.but_h - p.scr_but_w) / 2, p.sbar_o, 0][p.sbarType], bot_corr = [(p.but_h - p.scr_but_w) - p.sbar_o * 2, -p.sbar_o, 0][p.sbarType];
        let sbar_alb_y = this.alb_y + top_corr, sbar_art_y = this.art_y + top_corr, sbar_alb_h = alb_sp + bot_corr, sbar_art_h = art_sp + bot_corr; if (p.sbarType == 2) {sbar_alb_y += 1; sbar_art_y += 1; sbar_alb_h -= 2; sbar_art_h -= 2;}
        f_alb_y = alb_sp + this.alb_y - ht * 0.9; f_art_y = art_sp + this.art_y - ht * 0.9;
        alb_scrollbar.metrics(p.sbar_x, sbar_alb_y, p.sbar_w, sbar_alb_h, alb_r, ht, this.alb_y, alb_sp);
        art_scrollbar.metrics(p.sbar_x, sbar_art_y, p.sbar_w, sbar_art_h, art_r, ht, this.art_y, art_sp);
    }

    this.move = (x, y) => {
        if (!ppt.showAlb || t.halt()) return; type = p.m_y > this.art_y ? 1 : p.m_y > this.alb_y && p.m_y < alb_h ? 2 : 0; if (but.Dn) return;
        if (y > top && y < bot && x > margin && x < w2) {window.SetCursor(32513); this.edit = true;} else this.edit = false;
        if (y > top && y < bot && x < w1 && x > w2) window.SetCursor(32649);
        if (y > top && y < bot && x > margin && x < w1 && lbtn_dn) {const n_x = margin + release_w(), n_w = w3 - release_w(), tp = get_cursor_pos(x), t_x = get_cursor_x(tp); if (tp < start) {if (tp < end) {if (t_x < n_x) if (offset > 0) offset--;} else if (tp > end) {if (t_x + n_x > n_x + n_w) {let l = (txt_w > n_w) ? txt_w - n_w : 0; if (l > 0) offset++;}} end = tp;} else if (tp > start) {if (t_x + n_x > n_x + n_w) {let l = (txt_w > n_w) ? txt_w - n_w : 0; if (l > 0) offset++;} end = tp;} cx = tp; repaint();}
        if (!art_l && !alb_info.length) return;
        alb_m_i = -1; art_m_i = -1;
        if (p.m_y > art_scrollbar.item_y && p.m_y < art_scrollbar.item_y + art_rows * ht) art_m_i = get_ix(x, y);
        else if (p.m_y > alb_scrollbar.item_y && p.m_y < alb_scrollbar.item_y + alb_rows * ht) alb_m_i = get_ix(x, y);
        if (alb_m_i == alb_m_i_o && art_m_i == art_m_i_o) return;
        alb_m_i_o = alb_m_i; art_m_i_o = art_m_i; t.paint();
    }

    this.draw = gr => {
        if (t.halt()) return; getAlbumsFallback();
        start = s.clamp(start, 0, search_txt.length); end = s.clamp(end, 0, search_txt.length);
        cx = s.clamp(cx, 0, search_txt.length);
        gr.GdiDrawText(type_text(), ui.font, ui.col.head, margin, top, w3, ht, t.ls); drawsel(gr); get_offset(gr);
        gr.GdiDrawText(search_txt.substr(offset), ui.font, ui.col.head, margin + release_w(), top, w3 - release_w(), ht, t.ls);
        drawcursor(gr); gr.DrawLine(margin, ln1_y, w1 - (!ppt.mb ? w.lfm : 0), ln1_y, l_h, ui.col.lineAlb); let b = 0, f = 0, i = 0, row_y = 0, txt_col;
        if (!ppt.mb) gr.GdiDrawText("Last.fm Playcount", ui.pcFont, ui.col.head, margin, ln1_y - ui.pcFont.Size + 1, txt_w, pc_h, t.r);
        alb_rows = 0;
        if (alb_info.length) {
            b = Math.max(Math.round(alb_scrollbar.delta / ht + 0.4), 0); f = Math.min(b + alb_r, alb_info.length);
            for (i = b; i < f; i++) {
                row_y = i * ht + this.alb_y - alb_scrollbar.delta;
                if (row_y < f_alb_y) {
                    alb_rows++;
                    if (ppt.rowStripes) {if (i % 2 == 0) gr.FillSolidRect(0, row_y + 1, alb_scrollbar.stripe_w, ht - 2, ui.col.b1); else gr.FillSolidRect(0, row_y, alb_scrollbar.stripe_w, ht, ui.col.b2);}
                    if (alb_info[i].name.startsWith(">>") && ui.col.bgSel != 0) gr.FillSolidRect(sel_x, row_y, sel_w, ht, ui.col.bgSel);
                }
            }
            for (i = b; i < f; i++) {
                row_y = i * ht + this.alb_y - alb_scrollbar.delta;
                if (row_y < f_alb_y) {
                    txt_col = alb_info[i].name.startsWith(">>") ? ui.col.textSel : alb_m_i == i ? ui.col.text_h : ui.col.text;
                    if (alb_m_i == i) {gr.FillSolidRect(sel_x, row_y, sel_w, ht, ui.col.bg_h); gr.DrawRect(sel_x, row_y, sel_w - 1, ht, 1, ui.col.frame);}
                    if (!ppt.mb && ppt.lfm_mode) gr.GdiDrawText((i < 9 ? "0" : "") + (i + 1), ui.font, txt_col, margin, row_y, w.rank, ht, t.l);
                    gr.GdiDrawText(alb_info[i].name, ui.font, txt_col, margin + (ppt.mb || !ppt.lfm_mode ? 0 : w.rank), row_y, text_w, ht, t.l);
                    if (ppt.mb) gr.GdiDrawText(alb_info[i].releaseType, ui.font, txt_col, margin, row_y, txt_w - w.date, ht, t.r);
                    gr.GdiDrawText(ppt.mb ? alb_info[i].date : alb_info[i].playcount, ui.font, txt_col, ppt.mb ? margin : margin + tx1_w, row_y, ppt.mb ? txt_w : w.pc, ht, t.r);
                }
            }
        } else gr.GdiDrawText(artist_recognised(), ui.font, ui.col.text, margin, Math.round(this.alb_y), txt_w, ht * 2, t.l);
        if (p.sbarShow && alb_scrollbar.scrollable_lines > 0) alb_scrollbar.draw(gr);
        art_rows = 0;
        if (art_l) {
            b = Math.max(Math.round(art_scrollbar.delta / ht + 0.4), 0); f = Math.min(b + art_r, art_l);
            for (i = b; i < f; i++) {
                row_y = i * ht + this.art_y - art_scrollbar.delta;
                if (row_y < f_art_y) {
                    if (ppt.rowStripes) {if (i % 2 == 0) gr.FillSolidRect(0, row_y + 1, art_scrollbar.stripe_w, ht - 2, ui.col.b1); else gr.FillSolidRect(0, row_y, art_scrollbar.stripe_w, ht, ui.col.b2);}
                    if (this.artists[i].name.startsWith(">>") && ui.col.bgSel != 0) gr.FillSolidRect(sel_x, row_y, sel_w, ht, ui.col.bgSel);
                }
            }
            for (i = b; i < f; i++) {
                row_y = i * ht + this.art_y - art_scrollbar.delta;
                if (row_y < f_art_y) {
                    art_rows++; const ft = i == 0 ? ui.headFont : ui.font;
                    txt_col = this.artists[i].name.startsWith(">>") ? ui.col.textSel : art_m_i == i ? ui.col.text_h : ui.col.text;
                    if (art_m_i == i) {gr.FillSolidRect(sel_x, row_y, sel_w, ht, ui.col.bg_h); gr.DrawRect(sel_x, row_y, sel_w - 1, ht, 1, ui.col.frame);}
                    gr.GdiDrawText(this.artists[i].name, ft, txt_col, margin, row_y, txt1_w, ht, t.l);
                    if (ppt.showSimilar) gr.GdiDrawText(this.artists[i].score, ft, txt_col, margin + txt_w - txt2_w, row_y, txt2_w, ht, t.r);
                    else if (i > 0) gr.GdiDrawText(this.artists[i].disambiguation, ui.font, txt_col, margin + txt_w - txt2_w, row_y, txt2_w, ht, t.r);
                }
            }
            gr.DrawLine(margin, ln2_y, w1, ln2_y, l_h, ui.col.lineArt);
        } if (p.sbarShow && art_scrollbar.scrollable_lines > 0) art_scrollbar.draw(gr);
    }

    this.library_test = (p_album_artist, p_album) => {
        if (!lib) return; lib.artistTracks(p_album_artist); let albums, orig_alb = false, mtags_alb = false;
        albums = tf.l0.EvalWithMetadbs(lib.artTracks);
        if (lib.artTracks.Count) lib.artTracks.Convert().some((h, j) => {
            if (albums[j].strip() == p_album.strip()) return orig_alb = true;
        });
        albums = tf.l0.EvalWithMetadbs(lib.artTracksTags);
        if (lib.artTracksTags.Count) lib.artTracksTags.Convert().some((h, j) => {
            if (albums[j].strip() == p_album.strip()) return mtags_alb = true;
        });
        if ((orig_alb || mtags_alb) && album_in_ml(p_album_artist, p_album, orig_alb, mtags_alb)) return true; return false;
    }

    const album_in_ml = (artist, album, orig_alb, mtags_alb) => {
        const ns = $.WshShell.Popup("This Album Exists In Library As:" + (orig_alb ? "\n\nOriginal Library Album" : "") + (orig_alb && mtags_alb ? "\n\nAND" : "") + (mtags_alb ? "\n\nAlbum Built With m-TAGS" : "") + "\n\nProceed?", 0, artist + " | " + album, 1);
        if (ns != 1 || ns == "Artist | Album") return true; return false;
    }

    const on_youtube_search_done = (p_alb_id, link, p_artist, p_title, p_ix, p_done, p_top50, p_pn, p_alb_set, p_length, p_orig_title, p_yt_title, p_full_alb, p_fn, p_type) => {
        if (link && link.length) {
            this.set_row(p_alb_id, 2, p_artist); t.paint();
            if (!ml.alb || !ml.mtags_installed) p.addLoc(link, pl.alb, false, false, false, true);
            else {
                const type_arr = ["", "YouTube Track", "Prefer Library Track", "Library Track"];
                p.mtags[p_alb_id] = []; p.mtags[p_alb_id].push({"@":link,"ALBUM":p_title,"ARTIST":p_artist,"DATE":dat,"DURATION":p_length.toString(),"TITLE":p_title + " (Full Album)","YOUTUBE_TITLE":p_yt_title,"YOUTUBE_TRACK_MANAGER_SEARCH_TITLE":p_orig_title ? p_orig_title : [],"YOUTUBE_TRACK_MANAGER_TRACK_TYPE":type_arr[ml.alb]});
                this.save_mtags(p_alb_id, p_artist, p_title, true);
            }
        }
    };

    this.save_mtags = (p_alb_id, p_artist, p_album, p_full_alb) => {
        const a = p_artist.clean() + " - " + p_album.clean(), fns = fb.ProfilePath + "yttm\\albums\\" + a.substr(0, 1).toLowerCase() + "\\"; let fna = fns + a + "\\"; s.create(fns);
        if (!p_full_alb) s.sort(p.mtags[p_alb_id], 'TRACKNUMBER', 'num');
        let pth = fna + a + " !!.tags"; if (pth.length > 259) pth = fna + a.titlecase().match(/[A-Z0-9]/g).join('') + " !!.tags"; if (pth.length > 259) {fna = fns + a.titlecase().match(/[A-Z0-9]/g).join('') + "\\"; pth = fna + a.titlecase().match(/[A-Z0-9]/g).join('') + " !!.tags";} s.create(fna);
        if (!ppt.abs_path) p.mtags[p_alb_id].forEach(v => {if (v["@"].charAt() == "/") v["@"] = ml.getRelativePath("/" + pth, v["@"]);});
        s.save(pth, JSON.stringify(p.mtags[p_alb_id], null, 3), true); if (!s.file(pth)) return;
        const cov = utils.Glob(fna + "*").some(v => (/(?:jpe?g|gif|png|bmp)$/i).test(s.fs.GetExtensionName(v)));
        if (!cov) {const lfm_cov = new Lfm_alb_cov(() => lfm_cov.on_state_change()); lfm_cov.Search(p_artist, p_album, fna);}
        plman.ClearPlaylist(pl.alb); p.addLoc(pth, pl.alb);
    }

    this.lbtn_dn = (x, y) => {
        if (!ppt.showAlb || t.halt()) return; if (y < top) return; repaint(); alb_search = lbtn_dn = (y > top && y < bot && x > margin && x < w2); if (ppt.touchControl) ui.dn_id = get_ix(x, y); if (y > bot) return;
        if (!lbtn_dn) {offset = start = end = cx = 0; timer.clear(timer.cursor); return;}
        else if (x > margin && x < w2) {if (shift) {start = cx; end = cx = get_cursor_pos(x);} else {cx = get_cursor_pos(x); start = end = cx;} timer.clear(timer.cursor); cursor = true; timer.cursor.id = setInterval(() => {cursor = !cursor; repaint();}, 530);}
        repaint();
    }

    this.load = (x, y, full_alb) => {
        if (y < top || but.Dn) return; repaint(); alb_search = (y > top && y < bot && x > margin && x < w2); if (y <= bot) return;
                if (!ppt.showAlb || x > p.w - p.sbar_sp) return; const i = get_ix(x, y); if (i == -1) return timer.clear(timer.cursor); if (ppt.touchControl && ui.dn_id != i) return;
                switch (type) {
                    case 1:
                        if (timer.artist.id || ppt.showSimilar && i >= sim_artists.length || !ppt.showSimilar && i >= this.rel_artists.length) return;
                        if (reset_type) sim_artists.forEach(v => v.name = v.name.replace(/^(x |>> )/,""));
                        else if (this.rel_artists.length) this.rel_artists.forEach(v => v.name = v.name.replace(/^(x |>> )/,""));
                        reset_type = ppt.showSimilar;
                        if (this.songs_mode() && this.artists[i]) {
                            const n = this.artists[i].name; this.artists[i].name = "x N/A In Similar Songs Mode"; t.paint();
                            if (!timer.artist.id)
                                timer.artist.id = setTimeout(() => {
                                    if (alb.artists[i]) alb.artists[i].name = n; t.paint(); timer.artist.id = null;
                                }, 3000);
                        } else {
                            if (!this.artists[i] || this.artists.length == 1 && this.artists[i].name.includes("Artists N/A")) return;
                            this.artist = i == 0 ? this.artists[i].name.replace(/( \[Similar\]:| \[Related\]:)/g, "") : this.artists[i].name; this.set_txt();
                            search_for_album_names(1, ppt.mb ? 3 : ppt.lfm_mode, this.artist, this.artists[i].id ? this.artists[i].id : "");
                            const alb_artist = this.artists[0].name.replace(/( \[Related\]:)/g, "");
                            if (!ppt.showSimilar && alb_artist.length && this.artists[i].id) {
                                const related_artists = s.file(this.related_artists) ? s.jsonParse(this.related_artists, false, 'file') : {};
                                this.artists[0].name.replace(/( \[Related\]:)/g, "");
                                const key = alb_artist.toUpperCase(); related_artists[key] = this.artists[i].id;
                                if (mbidSort) {s.save(this.related_artists, JSON.stringify(s.sortKeys(related_artists), null, 3), true); mbidSort = false;}
                                else s.save(this.related_artists, JSON.stringify(related_artists, null, 3), true);
                            }
                            if (i != 0) {this.artists[i].name = ">> " + this.artists[i].name; t.paint();}
                        }
                        break;
                    case 2:
                        if (i >= alb_info.length) return; if (p.alb_id == 19) p.alb_id = 0; else p.alb_id++; plman.UndoBackup(pl.alb);
                        if (ppt.mb || !ppt.mb && ppt.lfm_mode == 0) {
                            p.loading[p.alb_id] = {"id":p.alb_id,"t":ppt.mb ? ppt.releaseType + 1 : ppt.lfm_mode + 6};
                            row_ix[p.alb_id] = i; this.set_row(p.alb_id, 4, this.artist);
                            if (!full_alb || (ppt.mb && !alb_info[i].releaseType.includes("Album") && !alb_info[i].releaseType.includes("Compilation"))) {
                                this.track_source = ppt.pref_mb_tracks; this.set_row(p.alb_id, 1, this.artist); dld_album(p.alb_id, i);
                            } else {
                                /*mbtn_up*/ alb_n = alb_info[i].name; if (ml.alb) if (this.library_test(this.artist, alb_n)) return;
                                this.set_row(p.alb_id, 1, this.artist); dat = ppt.mb ? alb_info[i].date : ""; if (!ppt.mb) {get_mb_tracks(p.alb_id, this.artist, alb_n);} else do_youtube_search(p.alb_id, this.artist, alb_n, ppt.mb ? alb_info[i].date : "");
                            } t.paint();
                        } else if (alb_info.length) {
                            p.loading[p.alb_id] = {"id":p.alb_id,"t":ppt.lfm_mode + 6}; row_ix[p.alb_id] = i; this.set_row(p.alb_id, 4, ppt.lfm_mode == 1 ? this.artist : alb_info_lfm[ppt.lfm_mode][i].artist);
                            pl.create("top"); if (!ppt.plmanAddloc) plman.ActivePlaylist = pl.tracks; yt_rad.do_youtube_search(p.alb_id, ppt.lfm_mode == 1 ? this.artist : alb_info_lfm[ppt.lfm_mode][i].artist, ppt.lfm_mode == 1 ? alb_info_lfm[1][i].name.strip_remaster() : alb_info_lfm[2][i].title.strip_remaster(), p.alb_id, 1, "", pl.tracks, true);
                        }
                    break;
                }
                cursor = false; offset = start = end = cx = 0; timer.clear(timer.cursor);
        }

    this.set_similar = () => {
        if (do_sim) {this.search_for_similar_artists(load_artist); do_sim = false;} // get similar artists after mouse click trigger if needed
        else {
            txt1_w = txt_w - w.score; txt2_w = w.score;
            if (ppt.showSimilar) {if (sim_nm == this.artist) {this.artists = sim_artists; this.calc_rows_art();} else {this.search_for_similar_artists(this.artist);}}
            else {txt1_w = txt_w * 2 / 3 - w.sp; txt2_w = txt_w / 3; this.artists = this.rel_artists; this.calc_rows_art();}
        }
    }

    const analyse = (list, mode) => {
        let prime, extra;
        if (mode == 3) {
            if (!data.length) return valid_prime = false;
            alb_info_mb[ppt.releaseType] = [];
            data.forEach(v => {
                prime = v["primary-type"]; extra = v["secondary-types"].join("").toLowerCase();
                if (!valid_prime) valid_prime = prime ? true : false;
                const comp = extra.includes("compilation"), live = extra.includes("live"), primary = prime == "Album" || prime == "EP" || prime == "Single", remix = extra.includes("remix");
                let filter, type;
                switch (ppt.releaseType) {
                    case 0: filter = ppt.showLive ? (live || primary) : primary && !live; break;
                    case 1: filter = prime == "Album" && !live && !comp && !remix; break;
                    case 2: filter = comp && !live && !remix; break;
                    case 3: filter = (prime == "EP" || prime == "Single") && !live && !comp && !remix; break;
                    case 4: filter = primary && remix; break;
                }
                if (filter) {
                    switch (true) {
                        case remix: type = "Remix " + prime; break;
                        case comp: type = "Compilation"; break;
                        case live: type = "Live" + (prime ? (" " + prime) : ""); break;
                        default: type = prime; break;
                    }
                } else if (ppt.showLive && !ppt.releaseType) {type = "Other"; filter = true;}
                if (filter) alb_info_mb[ppt.releaseType].push({date: v["first-release-date"].substring(0, 4), name: v.title.replace(/’/g, "'"), releaseType: type, rg_mbid: v.id, prime: prime, extra: extra});
            });
            mb_sort(); alb_info = alb_info_mb[ppt.releaseType];
        } else if (list.length) {
            switch (mode) {
                case 0: alb_info_lfm[0] = list.map((v, i) => ({name: v.name, rg_mbid: v.mbid, playcount: v.playcount, rank: i})); break;
                case 1: alb_info_lfm[1] = list.map((v, i) => ({name: v.title, playcount: v.playcount, rank: i})); break;
                case 2: alb_info_lfm[2] = list.map((v, i) => ({name: v.artist + " - " + v.title, artist: v.artist, title: v.title, playcount: v.playcount, rank: i})); break;
            }
            if (alb_info_lfm[mode].length) {alb_info = ppt.lfm_sort ? s.sort(alb_info_lfm[mode], 'playcount', 'numRev') : alb_info_lfm[mode]; alb_info.forEach(v => v.playcount = numFormat(v.playcount))} else alb_info = [];
        } else alb_info = [];
    }

    this.toggle = n => {
        switch (n) {
            case 'lfm_sort':
                ppt.lfm_sort = !ppt.lfm_sort; if (!alb_info_lfm[ppt.lfm_mode].length) return;
                ppt.lfm_sort ? s.sort(alb_info_lfm[ppt.lfm_mode], 'playcount', 'numRev') :
                s.sort(alb_info_lfm[ppt.lfm_mode], 'rank', 'num');
                if (ppt.mb) return; alb_info = alb_info_lfm[ppt.lfm_mode]; t.paint(); break;
            case 'mb_group':
                ppt.mb_group = !ppt.mb_group; if (!alb_info_mb[0].length) return;
                mb_sort(); if (!ppt.mb || ppt.releaseType) return; alb_info = alb_info_mb[0]; t.paint(); break;
            case 'mode': ppt.mb = ppt.mb == 1 ? 0 : 1; text_w = ppt.mb ? txt_w - w.date - type_width[ppt.releaseType] : !ppt.lfm_mode ? tx1_w : tx2_w; this.set_txt(); search_for_album_names(2, ppt.mb ? 3 : ppt.lfm_mode, this.songs_mode() ? this.artist_title : this.artist, ar_mbid); break;
            case 'showArtists': ppt.showArtists = !ppt.showArtists; this.calc_rows(); this.calc_rows_alb(); this.calc_rows_art(); but.refresh(true); break;
            case 'show':
                ppt.showAlb = !ppt.showAlb; if (p.videoMode && !ppt.showAlb) p.set_video();
                if (p.videoMode) {if (ppt.showAlb && p.eval("%video_popup_status%") == "visible") fb.RunMainMenuCommand("View/Visualizations/Video");
                if (!ppt.showAlb && p.eval("%video_popup_status%") == "hidden" && p.show_video) fb.RunMainMenuCommand("View/Visualizations/Video");}
                if (p.videoMode && rad.pss) {rad.force_refresh = 2; rad.refreshPSS();}
                if (!ppt.showAlb) {cursor = false; offset = start = end = cx = 0; timer.clear(timer.cursor);}
                if (ppt.showAlb && !t.halt()) getAlbumsFallback(); if (!p.show_images) return; if (!fb.IsPlaying || ppt.focus && !p.videoMode) on_item_focus_change();
                if (!ppt.showAlb && ppt.artistView && ppt.cycPhoto) timer.image(); else timer.clear(timer.img); break;
            case 'showLive': ppt.showLive = !ppt.showLive; this.release_name[0] = (ppt.showLive ? "All Releases" : "Releases"); if (!alb_info_mb[0].length) {t.paint(); return;} alb_info_mb[0] = []; if (!ppt.mb || ppt.releaseType) return; analyse("", 3); on_album_search_done_callback(); break;
        }
    }

    this.on_char = (code, force) => {
        if (!ppt.showAlb || t.halt()) return;
        if (force) alb_search = true; timer.clear(timer.search); timer.search.id = setTimeout(() => {alb.chooseartist(search_txt, true); timer.search.id = null;}, 1500);
        if (alb_search) {
            let input = String.fromCharCode(code); cursor = true;
            switch(code) {
                case vk.enter: this.chooseartist(search_txt, true); alb_search = false; offset = start = end = cx = 0; timer.clear(timer.cursor); break;
                case vk.redo: lg.push(search_txt); if (lg.length > 30) lg.shift(); if (log.length > 0) search_txt = log.pop() + ""; break;
                case vk.undo: log.push(search_txt); if (log.length > 30) lg.shift(); if (lg.length > 0) search_txt = lg.pop() + ""; break;
                case vk.selAll: start = 0; end = search_txt.length; break;
                case vk.copy: (start != end) && htmlfile.parentWindow.clipboardData.setData('text', search_txt.substring(start, end)); break; case vk.cut: (start != end) && htmlfile.parentWindow.clipboardData.setData('text', search_txt.substring(start, end));
                case vk.back: record();
                    if (start == end) {if (cx > 0) {search_txt = search_txt.substr(0, cx - 1) + search_txt.substr(cx, search_txt.length - cx); if (offset > 0) offset--; cx--;}}
                    else {if (end - start == search_txt.length) {search_txt = ""; cx = 0;} else {if (start > 0) {const st = start, en = end; start = Math.min(st, en); end = Math.max(st, en); search_txt = search_txt.substring(0, start) + search_txt.substring(end, search_txt.length); cx = start;} else {search_txt = search_txt.substring(end, search_txt.length); cx = start;}}}
                    offset = offset >= end - start ? offset - end + start : 0; start = cx; end = start; break;
                case "delete": record();
                    if (start == end) {if (cx < search_txt.length) {search_txt = search_txt.substr(0, cx) + search_txt.substr(cx + 1, search_txt.length - cx - 1);}}
                    else {if (end - start == search_txt.length) {search_txt = ""; cx = 0;} else {if (start > 0) {const st = start, en = end; start = Math.min(st, en); end = Math.max(st, en); search_txt = search_txt.substring(0, start) + search_txt.substring(end, search_txt.length); cx = start;} else {search_txt = search_txt.substring(end, search_txt.length); cx = start;}}}
                    offset = offset >= end - start ? offset - end + start : 0; start = cx; end = start; break;
                case vk.paste: input = htmlfile.parentWindow.clipboardData.getData('text');
                default: if (!input) break; record();
                    if (start == end) {search_txt = search_txt.substring(0, cx) + input + search_txt.substring(cx); cx += input.length; end = start = cx;}
                    else if (end > start) {search_txt = search_txt.substring(0, start) + input + search_txt.substring(end); offset = offset >= end - start ? offset - end + start : 0; cx = start + input.length; start = cx; end = start;}
                    else {search_txt = search_txt.substring(start) + input + search_txt.substring(0, end); offset = offset < end - start ? offset - end + start : 0; cx = end + input.length; start = cx; end = start;} break;
            }
            if (!timer.cursor.id) timer.cursor.id = setInterval(() => {cursor = !cursor; repaint();}, 530); repaint();
        }
    }

    this.on_key_down = vkey => {
        if (!ppt.showAlb || t.halt()) return;
        switch(vkey) {
            case vk.shift: shift = true; shift_x = cx; break;
            case vk.pgUp: if (!this.scrollbar_type()) break; this.scrollbar_type().page_throttle(1); break;
            case vk.pgDn: if (!this.scrollbar_type()) break; this.scrollbar_type().page_throttle(-1); break;
            case vk.left: case vk.right: if (!alb_search) break; if (vkey == vk.left) {if (offset > 0) {if (cx <= offset) {offset--; cx--;} else cx--;} else if (cx > 0) cx--; start = end = cx} if (vkey == vk.right && cx < search_txt.length) cx++; start = end = cx;
            if (shift) {start = Math.min(cx, shift_x); end = Math.max(cx, shift_x);} cursor = true;
            timer.clear(timer.cursor); timer.cursor.id = setInterval(() => {cursor = !cursor; repaint();}, 530); break;
            case vk.home: case vk.end:
            if (alb_search) {if (vkey == vk.home) offset = start = end = cx = 0; else start = end = cx = search_txt.length; cursor = true; timer.clear(timer.cursor); timer.cursor.id = setInterval(() => {cursor = !cursor; repaint();}, 530);}
            else if (this.scrollbar_type()) {vkey == vk.home ? this.scrollbar_type().check_scroll(0) : this.scrollbar_type().scroll_to_end();}; break;
            case vk.del: this.on_char("delete"); break;
        } repaint(); return true;
    }

    this.clear = () => {
        if (search_txt) {
            offset = start = end = cx = 0; alb_search = true; timer.clear(timer.cursor);
            timer.cursor.id = setInterval(() => {cursor = !cursor; repaint();}, 530); search_txt = "";
        } else search_txt = !this.songs_mode() ? this.artist : this.artist_title; repaint();
    }

    const get_ix = (x, y) => {
        let ix;
        if (y > art_scrollbar.item_y && y < art_scrollbar.item_y + art_rows * ht && x >= sel_x && x < sel_x + sel_w) ix = Math.round((y + art_scrollbar.delta - this.art_y - ht * 0.5) / ht);
        else if (y > alb_scrollbar.item_y && y <alb_scrollbar.item_y + alb_rows * ht && x >= sel_x && x < sel_x + sel_w) ix = Math.round((y + alb_scrollbar.delta - this.alb_y - ht * 0.5) / ht);
        else ix = -1; return ix;
    }

    const on_similar_search_done = (list, n) => {
        if (!list.length) {list = []; list[0] = {name: "Similar Artists N/A", score: ""}}; sim_artists = list.slice(0, 100);
        if (sim_artists.length > 1) {sim_artists[0] = {name: n + " [Similar]:", score: "Score"};}
        if (ppt.showSimilar) {this.artists = sim_artists; this.calc_rows_art();}
        on_album_search_done_callback();
    };

    const on_albums_search_done = (list, mbid, rec, mode) => {ar_mbid = mbid; ar_id_done = rec; search_done[mode] = rec; if (mode == 3) data = list; analyse(list, mode); on_album_search_done_callback();};
}

function Buttons() {
    const albScrBtns = ["alb_scrollDn", "alb_scrollUp"], artScrBtns = ["art_scrollDn", "art_scrollUp"], c1 = [RGBA(210, 19, 9, 114), RGBA(227, 222, 248, 100)], c2 = [RGBA(210, 19, 9, 228), RGBA(227, 222, 248, 200)], c3 = [RGBA(244, 31, 19, 255), RGBA(238, 234, 251, 228)], sAlpha = ppt.sbarCol ? [68, 153, 255] : [75, 192, 228], sbarButPad = s.clamp(ppt.sbarButPad / 100, -0.5, 0.3), scrBtns = albScrBtns.concat(artScrBtns);
    let alb_byDn, alb_byUp, arrow_symb = 0, art_byDn, art_byUp, albDn_y, alb_hot_o, albUp_y, artDn_y, art_hot_o, artUp_y, b_x, bx, by, b_w, bw, bh, cur_btn = null, font1, font2, font3, font4, ht = 0, i, iconFontName = "Segoe UI", iconFontStyle = 0, mx, my, scale = Math.max(ppt.zoomBut / 100, 0.7), scrollBtn = false, scrollBtn_x, top = 0, tooltip, transition, tt_start = Date.now() - 2000, yt_x, yt_y; ppt.zoomBut = scale * 100;
    this.btns = {}; this.Dn = false; this.scale = s.scale * scale; this.yt_w = 22 * this.scale, this.yt_h = 16 * this.scale; this.show_tt = true;

    if (ppt.get(" Scrollbar Arrow Custom", false)) arrow_symb = ppt.arrowSymbol.replace(/\s+/g, "").charAt();if (!arrow_symb.length) arrow_symb = 0;
    if (ppt.customCol && ppt.butCustIconFont.length) {const butCustIconFont = ppt.butCustIconFont.splt(1); iconFontName = butCustIconFont[0]; iconFontStyle = Math.round(s.value(butCustIconFont[1], 0, 0));}

    const clear = () => {this.Dn = false; Object.values(this.btns).forEach(v => v.down = false);}
    const scroll = () => p.sbarShow && ppt.showAlb;
    const scroll_alb = () => scroll() && alb_scrollbar.scrollable_lines > 0;
    const scroll_art = () => scroll() && art_scrollbar.scrollable_lines > 0;
    const tt = (n, force) => {if (tooltip.Text !== n || force) {tooltip.Text = n; tooltip.Activate();}}

    this.create_images = () => {const sz = arrow_symb == 0 ? Math.max(Math.round(p.but_h * 1.666667), 1) : 100, sc = sz / 100, iconFont = gdi.Font(iconFontName, sz, iconFontStyle); scrollBtn = s.gr(sz, sz, true, g => {g.SetTextRenderingHint(3); g.SetSmoothingMode(2); if (ppt.sbarCol) {arrow_symb == 0 ? g.FillPolygon(ui.col.text, 1, [50 * sc, 0, 100 * sc, 76 * sc, 0, 76 * sc]) : g.DrawString(arrow_symb, iconFont, ui.col.text, 0, sz * sbarButPad, sz, sz, StringFormat(1, 1));} else {arrow_symb == 0 ? g.FillPolygon(RGBA(ui.col.t, ui.col.t, ui.col.t, 255), 1, [50 * sc, 0, 100 * sc, 76 * sc, 0, 76 * sc]) : g.DrawString(arrow_symb, iconFont, RGBA(ui.col.t, ui.col.t, ui.col.t, 255), 0, sz * sbarButPad, sz, sz, StringFormat(1, 1));} g.SetSmoothingMode(0);});}; this.create_images();
	this.create_tooltip = () => tooltip = window.CreateTooltip("Segoe UI", 15 * s.scale * ppt.get(" Zoom Tooltip (%)", 100) / 100, 0); this.create_tooltip();
    this.lbtn_dn = (x, y) => {this.move(x, y); if (!cur_btn || cur_btn.hide) {this.Dn = false; return false} else this.Dn = cur_btn.name; cur_btn.down = true; cur_btn.cs("down"); cur_btn.lbtn_dn(x, y); return true;}
    this.leave = () => {if (cur_btn) {cur_btn.cs("normal"); if (!cur_btn.hide) transition.start();} cur_btn = null;}
    this.on_script_unload = () => tt("");
    this.draw = gr => Object.values(this.btns).forEach(v => {if (!v.hide) v.draw(gr);});
    this.reset = () => transition.stop();
    this.set_scroll_btns_hide = () => {if (!this.btns || !p.sbarShow) return; scrBtns.forEach((v, i) => {if (this.btns[v]) this.btns[v].hide = i < 2 ? !scroll_alb() : !scroll_art();});}

	this.resetZoom = () => {
		ppt.zoomFont = 100;
		ppt.set(" Zoom Tooltip (%)", 100);
		this.scale = s.scale; this.yt_w = 22 * this.scale, this.yt_h = 16 * this.scale;
		ui.get_font();
		this.create_tooltip();
		this.refresh(true);
		alb.calc_rows(); alb.calc_rows_alb(); alb.calc_rows_art();
		ppt.zoomBut = this.scale * 100;
		if (ppt.btn_mode) {window.MinWidth = window.MaxWidth = this.yt_w; window.MinHeight = window.MaxHeight = this.yt_h;}
		t.paint();
	}

    this.set_btns_hide = () => {
        Object.values(this.btns).forEach((v, i) => {
            switch (true) {
                case i < 5: v.hide = !ppt.showAlb || !ppt.mb; break;
                case i < 8: v.hide = !ppt.showAlb || ppt.mb; break;
                case i < 13: v.hide = !ppt.showAlb; break;
            }});
    }

    this.wheel = step => {
        if (p.m_y > by + bh || scale < 0.7 || utils.IsKeyPressed(0x10)) return;
        scale += step * 0.005; scale = Math.max(scale, 0.7); this.scale = s.scale * scale; this.yt_w = 22 * this.scale, this.yt_h = 16 * this.scale;
        this.refresh(true); alb.calc_rows(); alb.calc_rows_alb(); alb.calc_rows_art();
        ppt.zoomBut = scale * 100;
        if (ppt.btn_mode) {window.MinWidth = window.MaxWidth = this.yt_w; window.MinHeight = window.MaxHeight = this.yt_h;}
    }

    const Btn = function(x, y, w, h, type, ft, txt, stat, im, hide, l_dn, l_up, tiptext, hand, name, ix) {
        this.draw = gr => {
            switch (this.type) {
                case 0: drawNames(gr); break;
                case 1: drawMode(gr); break;
                case 2: drawYT(gr); break;
                case 3: drawCross(gr); break;
                case 4: case 5: drawScrollBtn(gr); break;
                case 6: p.theme.SetPartAndStateID(1, im[this.state]); p.theme.DrawThemeBackground(gr, this.x, this.y, this.w, this.h); break;
            }
        }

        this.cs = (state) => {this.state = state; if (state === "down" || state === "normal") this.tt.clear(); this.repaint();}
        this.lbtn_dn = () => {if (!but.Dn) return; this.l_dn && this.l_dn(x, y);}
        this.lbtn_up = (x, y) => {if (ppt.touchControl && Math.sqrt((Math.pow(p.last_pressed_coord.x - x, 2) + Math.pow(p.last_pressed_coord.y - y, 2))) > 3 * s.scale) return; if (this.l_up) this.l_up();}
        this.repaint = () => {const expXY = 2, expWH = 4; window.RepaintRect(this.x - expXY, this.y - expXY, this.w + expWH, this.h + expWH);}
        this.trace = (x, y) => {return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h;}

        this.x = x; this.y = y; this.w = w; this.h = h; this.type = type; this.hide = hide; this.l_dn = l_dn; this.l_up = l_up; this.tt = new Tooltip; this.tiptext = tiptext; this.transition_factor = 0; this.state = "normal"; this.hand = hand; this.name = name;

        const drawCross = gr => {
            let a;
            if (this.state !== "down") {const b = im.normal, c = im.hover - b; a = Math.min(b + c * this.transition_factor, im.hover);} else a = im.hover;
            gr.DrawLine(this.x + ht * 0.67, this.y + ht * 0.67 - 1, this.x + ht * 0.27, this.y + ht * 0.27 - 1, ht / 10, RGBA(136, 136, 136, a)); gr.DrawLine(this.x + ht * 0.67, this.y + ht * 0.27 - 1, this.x + ht * 0.27, this.y + ht * 0.67 - 1, ht / 10, RGBA(136, 136, 136, a));
        }

        const drawMode = gr => {
            gr.SetSmoothingMode(2); let col;
            if (!ui.dkMode) {
                gr.FillRoundRect(this.x, this.y, this.w, this.h, 2 * but.scale, 2 * but.scale, c1[ppt.mb]);
                col = this.state !== "down" ? ui.get_blend(c3[ppt.mb], c2[ppt.mb], this.transition_factor, true) : c3[ppt.mb];
                gr.FillRoundRect(this.x, this.y, this.w, this.h - 1, 2 * but.scale, 2 * but.scale, col);
                col = this.state !== "down" ? ui.get_blend(im.hover[ppt.mb], im.normal[ppt.mb], this.transition_factor) : im.hover[ppt.mb];
                gr.GdiDrawText(txt[ppt.mb], ft, col, this.x, this.y, this.w, this.h, t.cc);
            } else {
                if (this.state !== "down") gr.FillRoundRect(this.x, this.y, this.w, this.h, 2 * but.scale, 2 * but.scale, RGBA(ui.col.blend4[0], ui.col.blend4[1], ui.col.blend4[2], ui.col.blend4[3] * (1 - this.transition_factor)));
                col = this.state !== "down" ? ui.get_blend(ui.col.blend2, ui.col.blend1, this.transition_factor, true) : ui.col.blend2;
                gr.FillRoundRect(this.x, this.y, this.w, this.h, 2 * but.scale, 2 * but.scale, col); gr.DrawRoundRect(this.x, this.y, this.w, this.h, 2 * but.scale, 2 * but.scale, 1, ui.col.blend3);
                col = this.state !== "down" ? ui.get_blend(ui.col.text_h, ui.col.text, this.transition_factor) : ui.col.text_h;
                gr.GdiDrawText(txt[ppt.mb], ft, col, this.x + 1 * but.scale, this.y, this.w, this.h, t.cc);
            }
        }

        const drawNames = gr => {
            const chk = (ppt.mb ? ppt.releaseType : ppt.lfm_mode) == stat || alb.lock_artist && stat == 5 || this.state === "down" && stat != 6;
            if ((ppt.mb ? ppt.releaseType : ppt.lfm_mode) == stat || alb.lock_artist && stat == 5 || this.state === "down" && stat != 6) {gr.SetSmoothingMode(2); gr.FillRoundRect(this.x, this.y, this.w, this.h, 6 * but.scale, 6 * but.scale, ui.col.butBg);}
            const col = !chk ? ui.get_blend(ui.col.blend, ui.col.text, this.transition_factor) : ui.col.blend;
            gr.GdiDrawText(txt, ft, col, this.x, this.y, this.w, this.h, t.cc);
        }

        const drawScrollBtn = gr => {
            const a = this.state !== "down" ? Math.min(sAlpha[0] + (sAlpha[1] - sAlpha[0]) * this.transition_factor, sAlpha[1]) : sAlpha[2];
            if (scrollBtn) gr.DrawImage(scrollBtn, this.x + ft, txt, stat, stat, 0, 0, scrollBtn.Width, scrollBtn.Height, this.type == 4 ? 0 : 180, a);
        }

        const drawYT = gr => {
            const cc = StringFormat(1, 1), fd1 = 25, fd2 = 42, norm = !ui.np_graphic || !ppt.full || ppt.showAlb ? true : false; gr.SetSmoothingMode(2);
            let a = this.state !== "down" ? Math.min(128 + (200 - 128) * this.transition_factor, 200) : 200; if (norm || a != 128) gr.FillRoundRect(this.x, this.y, 11 * but.scale, 14 * but.scale, 2 * but.scale, 2 * but.scale, RGBA(0, 0, 0, a));
            let b; if (this.state !== "down") {b = norm ? 100 : 8; let c = 200 - norm; a = Math.min(b + c * this.transition_factor, 200);} else a = 200; const hot = a != b; gr.FillRoundRect(this.x + (norm || hot ? 10 : 0) * but.scale, this.y, ((norm || hot ? 11 : 21) + (p.videoMode ? 1 : 0)) * but.scale, 14 * but.scale, 2 * but.scale, 2 * but.scale, RGBA(255, 255, 255, hot ? a : norm ? 100 : 8));
            gr.SetSmoothingMode(0); gr.SetTextRenderingHint(3); if (!norm && !hot) gr.DrawString("y", font1, RGBA(0, 0, 0, fd1), this.x + 1 + 0 * but.scale, this.y + 1 -5 * but.scale, 12 * but.scale, 20 * but.scale, cc); gr.DrawString("y", font1, RGBA(255, 255, 255, hot ? a : norm ? 100 : fd2), this.x + 0 * but.scale, this.y -5 * but.scale, 12 * but.scale, 20 * but.scale, cc);
            gr.DrawString(ppt.showAlb || !ui.np_graphic ? "T" : p.videoMode ? "V" : "I", font2, RGBA(0, 0, 0, hot ? a : norm ? 150 : fd1), this.x + (!p.videoMode && (norm || hot ) ? 0 : 1) + 10.5 * but.scale, this.y + (norm || hot ? 0 : 1) -2.8 * but.scale, 11 * but.scale, 20 * but.scale, cc); if (!norm && !hot ) gr.DrawString(ppt.showAlb || !ui.np_graphic ? "T" : p.videoMode ? "V" : "I", font2, RGBA(255, 255, 255, hot ? a : fd2), this.x + 10.5 * but.scale, this.y -2.8 * but.scale, 11 * but.scale, 20 * but.scale, cc);
        }
    }

    this.move = (x, y) => {
        const hover_btn = Object.values(this.btns).find(v => {
             if (!v.hide && (!this.Dn || this.Dn == v.name)) return v.trace(x, y);
        });
        let hand = false;
        check_scrollBtns(x, y, hover_btn); if (hover_btn) hand = hover_btn.hand; window.SetCursor(!hand ? 32512 : 32649);
        if (hover_btn && hover_btn.hide) {if (cur_btn) {cur_btn.cs("normal"); transition.start();} cur_btn = null; return null;} // btn hidden, ignore
        if (cur_btn === hover_btn) return cur_btn;
        if (cur_btn) {cur_btn.cs("normal"); transition.start();} // return prev btn to normal state
        if (hover_btn && !(hover_btn.down && hover_btn.type > 3)) {hover_btn.cs("hover"); if (this.show_tt && hover_btn.tiptext) hover_btn.tt.show(hover_btn.tiptext()); transition.start();}
        cur_btn = hover_btn;
        return cur_btn;
    }

    this.lbtn_up = (x, y) => {
        if (!cur_btn || cur_btn.hide || this.Dn != cur_btn.name) {
            clear();
            return false;
        }
        clear();
        if (cur_btn.trace(x, y)) cur_btn.cs("hover");
        cur_btn.lbtn_up(x, y);
        return true;
    }

    this.refresh = upd => {
        if (upd) {
            bx = ppt.btn_mode ? 0 : p.w - ppt.bor - this.yt_w; by = ppt.btn_mode ? 0 : Math.round(ppt.bor * 0.625); b_w = 36 * this.scale; bw = 35 * this.scale; bh = 16 * this.scale; ht = alb.fit()[2]; mx = alb.fit()[0]; yt_x = p.rel_imgs == 1 && !ppt.btn_mode ? bx + ppt.bor : bx; yt_y = p.rel_imgs == 1 && !ppt.btn_mode ? 0 : by;
            font1 =  gdi.Font("segoe ui", scale > 1.05 ? Math.floor(15 * this.scale) : 15 * this.scale, 1); font2 = gdi.Font("segoe ui", 14 * this.scale, 1); font3 = gdi.Font("segoe ui", scale > 1.05 ? Math.floor(11 * this.scale) : 11 * this.scale, 1); font4 = gdi.Font("segoe ui", 12 * this.scale, 1);
            b_x = p.sbar_x; alb_byUp =  alb_scrollbar.y; alb_byDn =  alb_scrollbar.y + alb_scrollbar.h - p.but_h; art_byUp =  art_scrollbar.y; art_byDn =  art_scrollbar.y + art_scrollbar.h - p.but_h;
            if (p.sbarType < 2) {b_x -= 1; alb_hot_o = alb_byUp - alb_scrollbar.text_y; albUp_y = -p.arrow_pad + alb_byUp + (p.but_h - 1 - p.scr_but_w) / 2; albDn_y = p.arrow_pad + alb_byDn + (p.but_h - 1 - p.scr_but_w) / 2; art_hot_o = art_byUp - art_scrollbar.text_y; artUp_y = -p.arrow_pad + art_byUp + (p.but_h - 1 - p.scr_but_w) / 2; artDn_y = p.arrow_pad + art_byDn + (p.but_h - 1 - p.scr_but_w) / 2; scrollBtn_x = (p.but_h - p.scr_but_w) / 2;}
        }
        this.btns = {
            all: new Btn(bx - b_w * 7, by, bw, bh, 0, font3, "All", 0, "", !ppt.showAlb || !ppt.mb, "", () => alb.get_releases("mb", 0), () => alb.release_name[0], true, "all"),
            album: new Btn(bx - b_w * 6, by, bw, bh, 0, font3, "Album", 1, "", !ppt.showAlb || !ppt.mb, "", () => alb.get_releases("mb", 1), () => alb.release_name[1], true, "album"),
            comp: new Btn(bx - b_w * 5, by, bw, bh, 0, font3, "Comp", 2, "", !ppt.showAlb || !ppt.mb, "", () => alb.get_releases("mb", 2), () => alb.release_name[2], true, "comp"),
            single: new Btn(bx - b_w * 4, by, bw, bh, 0, font3, "Single", 3, "", !ppt.showAlb || !ppt.mb, "", () => alb.get_releases("mb", 3), () => alb.release_name[3], true, "single"),
            remix: new Btn(bx - b_w * 3, by, bw, bh, 0, font3, "Remix", 4, "", !ppt.showAlb || !ppt.mb, "", () => alb.get_releases("mb", 4), () => alb.release_name[4], true, "remix"),
            topalbums: new Btn(bx - b_w * 5, by, bw, bh, 0, font3, "Album", 0, "", !ppt.showAlb || ppt.mb, "", () => alb.get_releases("lfm", 0), () => "Top Albums", true, "topalbums"),
            toptracks: new Btn(bx - b_w * 4, by, bw, bh, 0, font3, "Track", 1, "", !ppt.showAlb || ppt.mb, "", () => alb.get_releases("lfm", 1), () => "Top Tracks", true, "toptracks"),
            topsongs: new Btn(bx - b_w * 3, by, bw, bh, 0,  font3, "Song", 2, "", !ppt.showAlb || ppt.mb, "", () => alb.get_releases("lfm", 2), () => "Top Similar Songs", true, "topsongs"),
            lock: new Btn(bx - b_w * 2, by, bw, bh, 0, font3, "Lock", 5, "", !ppt.showAlb, "", () => alb.lockartist(), () => alb.lock_artist ? "Unlock" : "Lock: Stop Track Change Updates", true, "lock"),
            toggle: new Btn(bx - b_w, by - 1, 13 * this.scale, bh, 0, font1, "≡", "6", "", !ppt.showAlb, "", () => {ppt.showSimilar = !ppt.showSimilar; alb.set_similar(); !ppt.showArtists && alb.toggle('showArtists'); t.paint();}, () => ppt.showSimilar ? "Show Related Artists" : "Show Similar Artists", true, "toggle"),
            more: new Btn(bx - b_w + 16 * this.scale, by, 13 * this.scale, bh, 0, font3, "▼", "6", "", !ppt.showAlb, "", () => men.button(bx - bw, by + bh),() => "Album Manager Settings", true, "more"),
            mode: new Btn(mx, !ui.dkMode ? by : Math.round(by - 1 * this.scale), (!ui.dkMode ? 71 : ppt.mb ? 74 : 46) * this.scale, (!ui.dkMode ? 14 : 15) * this.scale, 1, font4, ["last.fm", "MusicBrainz"], "", {normal: [RGB(225, 225, 245), RGB(96, 73, 139)], hover: [RGB(225, 225, 245), RGB(52, 23, 107)]}, !ppt.showAlb, "", () => {alb.toggle('mode'); but.btns.mode.w = (!ui.dkMode ? 71 : ppt.mb ? 74 : 46) * but.scale; but.set_btns_hide();}, () => ppt.mb ? "Switch To Last.fm Mode" : "Switch To MusicBrainz Mode", true, "mode"),
            cross: new Btn(p.w - mx - ht * 0.75, alb.fit()[1], ht, ht, 3, "", "", "", {normal: 85, hover: 192}, !ppt.showAlb, "", () => alb.clear(), () => alb.search_txt() ? "Clear Search Text" : "Show Text", true, "cross"),
            yt: new Btn(yt_x, yt_y, this.yt_w, this.yt_h, 2, "", "", "", "", false, "", () => {if (p.w > but.yt_w && !ui.button_mode) alb.toggle('show'); else men.rbtn_up(bx + but.yt_w / 2, by + but.yt_h / 2); but.set_btns_hide(); but.set_scroll_btns_hide(); if (ppt.showAlb || !ui.np_graphic) t.paint(); else img.paint();}, () => p.w > but.yt_w && !ppt.btn_mode ? ppt.showAlb ? "Show Now Playing" : "Toggle" : "youTube", true, "yt")
        }; if (ppt.showAlb || !ui.np_graphic) t.paint(); else img.paint();
        if (p.sbarShow) {
            switch (p.sbarType) {
                case 2:
                    this.btns.alb_scrollUp = new Btn(b_x, alb_byUp, p.but_h, p.but_h, 6, "", "", "", {normal: 1, hover: 2, down: 3}, !scroll_alb(), () => alb_scrollbar.but(1), "", "", false, "alb_scrollUp");
                    this.btns.alb_scrollDn = new Btn(b_x, alb_byDn, p.but_h, p.but_h, 6, "", "", "", {normal: 5, hover: 6, down: 7}, !scroll_alb(), () => alb_scrollbar.but(-1), "", "", false, "alb_scrollDn");
                    this.btns.art_scrollUp = new Btn(b_x, art_byUp, p.but_h, p.but_h, 6, "", "", "", {normal: 1, hover: 2, down: 3}, !scroll_art(), () => art_scrollbar.but(1), "", "", false, "art_scrollUp");
                    this.btns.art_scrollDn = new Btn(b_x, art_byDn, p.but_h, p.but_h, 6, "", "", "", {normal: 5, hover: 6, down: 7}, !scroll_art(), () => art_scrollbar.but(-1), "", "", false, "art_scrollDn");
                    break;
                default:
                    this.btns.alb_scrollUp = new Btn(b_x, alb_byUp - alb_hot_o, p.sbar_w, p.sbar_w + alb_hot_o, 4, scrollBtn_x, albUp_y, p.scr_but_w, "", !scroll_alb(), () => alb_scrollbar.but(1), "", "", false, "alb_scrollUp");
                    this.btns.alb_scrollDn = new Btn(b_x, alb_byDn, p.sbar_w, p.sbar_w + alb_hot_o, 5, scrollBtn_x, albDn_y, p.scr_but_w, "", !scroll_alb(), () => alb_scrollbar.but(-1), "", "", false, "alb_scrollDn");
                    this.btns.art_scrollUp = new Btn(b_x, art_byUp - art_hot_o, p.sbar_w, p.sbar_w + art_hot_o, 4, scrollBtn_x, artUp_y, p.scr_but_w, "", !scroll_art(), () => art_scrollbar.but(1), "", "", false, "art_scrollUp");
                    this.btns.art_scrollDn = new Btn(b_x, art_byDn, p.sbar_w, p.sbar_w + art_hot_o, 5, scrollBtn_x, artDn_y, p.scr_but_w, "", !scroll_art(), () => art_scrollbar.but(-1), "", "", false, "art_scrollDn");
                    break;
            }
        }
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
        const arr = alb_scrollbar.timer_but ? albScrBtns : art_scrollbar.timer_but ? artScrBtns : false;
        if (arr) {
           if ((this.btns[arr[0]].down || this.btns[arr[1]].down) && !this.btns[arr[0]].trace(x, y) && !this.btns[arr[1]].trace(x, y)) {
               this.btns[arr[0]].cs("normal"); this.btns[arr[1]].cs("normal");
               if (alb_scrollbar.timer_but) {clearTimeout(alb_scrollbar.timer_but); alb_scrollbar.timer_but = null; alb_scrollbar.count = -1;}
               if (art_scrollbar.timer_but) {clearTimeout(art_scrollbar.timer_but); art_scrollbar.timer_but = null; art_scrollbar.count = -1;}
            }
        } else if (hover_btn) scrBtns.forEach((v) => {
            if (hover_btn.name == v && hover_btn.down) {this.btns[v].cs("down"); hover_btn.l_dn();}
        });
    }
}

if (ppt.btn_mode) {window.MinWidth = window.MaxWidth = but.yt_w; window.MinHeight = window.MaxHeight = but.yt_h;}
function create_dl_file() {const n = fb.ProfilePath + "yttm\\foo_lastfm_img.vbs"; if (!s.file(n) || s.fs.GetFile(n).Size == "696") {const dl_im = "If (WScript.Arguments.Count <> 2) Then\r\nWScript.Quit\r\nEnd If\r\n\r\nurl = WScript.Arguments(0)\r\nfile = WScript.Arguments(1)\r\n\r\nSet objFSO = Createobject(\"Scripting.FileSystemObject\")\r\nIf objFSO.Fileexists(file) Then\r\nSet objFSO = Nothing\r\nWScript.Quit\r\nEnd If\r\n\r\nSet objXMLHTTP = CreateObject(\"MSXML2.XMLHTTP\")\r\nobjXMLHTTP.open \"GET\", url, false\r\nobjXMLHTTP.send()\r\n\r\nIf objXMLHTTP.Status = 200 Then\r\nSet objADOStream = CreateObject(\"ADODB.Stream\")\r\nobjADOStream.Open\r\nobjADOStream.Type = 1\r\nobjADOStream.Write objXMLHTTP.ResponseBody\r\nobjADOStream.Position = 0\r\nobjADOStream.SaveToFile file\r\nobjADOStream.Close\r\nSet objADOStream = Nothing\r\nEnd If\r\n\r\nSet objFSO = Nothing\r\nSet objXMLHTTP = Nothing"; s.save(n, dl_im, false);}}
if (ppt.dl_art_img) create_dl_file(); if (ppt.btn_mode) {p.show_images == false; p.show_video = false;}

function Images() {
    if (!ui.np_graphic) return;
    this.artImages = []; this.get = true; this.ny = 0; this.touch = {dn: false, end: 0, start: 0};
    const exclArr = [6473, 6500, 24104, 24121, 34738, 35875, 37235, 68626, 86884, 92172], reflSetup = ppt.reflSetup.splt(0), reflSlope = s.clamp(s.value(reflSetup[5], 10, 0) / 10 - 1, -1, 9), reflSz = s.clamp(s.value(reflSetup[3], 100, 0) / 100, 0.1, 1), transLevel = s.clamp(100 - ppt.transLevel, 0.1, 100), transIncr = Math.pow(284.2171 / transLevel, 0.0625);
    let a_run = 1, adjustMode = false, all_files_o_length = 0, alb_id = "", alb_id_o = "", alpha = 255, art_img = {}, artCacheID = "", artist = "", artistBlur = "", bor_w1 = 0, bor_w2 = 0, cur_blur = null, cur_handle = null, cur_img = null, cur_imgPth = "", f_blur = null, folder = "", fresh_artist = true, i_x = 0, imgID = "", imgID_o = "", init = true, ir = false, ix = 0, newalbum = true, new_BlurAlb = false, nh = 0, nw = 0, refl_mask = null, reflAlpha = s.clamp(255 * s.value(reflSetup[1], 14.5, 0) / 100, 0, 255), sh_img = null, xa = 0, ya = 0, update = 0;
    if (transLevel == 100) transLevel = 255;

    const blurCheck = () => {if (!ppt.covBlur && !ppt.imgSmoothTrans) return; alb_id_o = alb_id; alb_id = !p.eval("[%album%]") ? p.eval("%album artist%%path%") : p.eval("%album artist%%album%%discnumber%%date%"); if (alb_id != alb_id_o) new_BlurAlb = true;}
	const check_cache = () => {let new_id = name.artist(); if (artCacheID != new_id) {clear_art_cache(); artCacheID = new_id;}}
    const clear = (a, type) => {a.forEach((v, i) => {if (!v) return; if (type == 0 && i == 0 || type == 1 && i == 1) {if (v.img) v.img = null; v.time = 0; if (v.blur) v.blur = null;}});}
	const clear_a_rs_cache = () => {art.cache = []; clear(cov.cache, 1);}
	const clear_c_rs_cache = () => clear(cov.cache, 0);
	const clear_art_cache = () => {this.artImages = []; clear_a_rs_cache();}
	const clear_cov_cache = () => cov.cache = [];
    const getImgFallback = () => {if (!this.get) return; if (p.videoMode && !ppt.showAlb) p.set_video(); if (ppt.artistView && ppt.cycPhoto) {timer.image(); this.artist_reset(); update = 0; getArtImg();} else getFbImg(); this.get = false;}
    const getArtImg = () => {if (!ppt.artistView) return; if (a_run || update) {a_run = 0; if (artist && ppt.cycPhoto) getArtImages();} loadArtImage();}
    const getFbImg = () => {blurCheck(); i_x = ppt.artistView ? 1 : 0; cur_handle = fb.IsPlaying && (!ppt.focus || p.videoMode) ? fb.GetNowPlaying() : fb.GetFocusItem(); if (cur_handle) return utils.GetAlbumArtAsync(window.ID, cur_handle, ppt.artistView ? 4 : 0); if (fb.IsPlaying) return; if (cov.cacheHit(i_x, "noitem")) return; let image = this.noimg[2]; if (!image) return; cov.cacheIt(i_x, image, "noitem", 1);}
    const img_metrics = () => {nw = Math.round(p.rel_imgs != 1 ? p.w : p.w - (ppt.imgBorder > 1 ? 10 : 0)); this.ny = Math.round(p.rel_imgs != 1 ? ppt.bor * 0.625 + but.yt_h : 0); nh = Math.round(p.rel_imgs != 1 ? Math.min(p.h * p.rel_imgs - this.ny, p.h - this.ny * 2) : p.h - (ppt.imgBorder > 1 && !ppt.imgReflection ? 10 : 0)); if (ppt.imgBorder == 1 || ppt.imgBorder == 3) {const i_sz = s.clamp(nh, 0, nw); bor_w1 = !i_sz ? 5 * s.scale : i_sz > 250 ? 5 * s.scale : Math.ceil(5 * s.scale * i_sz / 250);} else bor_w1 = 0; bor_w2 = bor_w1 * 2; nw = Math.max(nw - bor_w2, 10); nh = Math.max(nh - bor_w2, 10);}
    const incl_lge = 0; // incl_lge 0 & 1 - exclude & include artist images > 8 MB
    const images = v => ((incl_lge || s.fs.GetFile(v).Size <= 8388608) && ((/_([a-z0-9]){32}\.jpg$/).test(s.fs.GetFileName(v)) || (/(?:jpe?g|gif|png|bmp)$/i).test(s.fs.GetExtensionName(v)) && !(/ - /).test(s.fs.GetBaseName(v))) && !exclArr.includes(s.fs.GetFile(v).Size));
    const memoryLimit = () => window.PanelMemoryUsage / window.MemoryLimit > 0.4 || window.TotalMemoryUsage / window.MemoryLimit > 0.5;
    const setReflStrength = n => {reflAlpha += n; reflAlpha = s.clamp(reflAlpha, 0, 255); ppt.reflSetup = "Strength," + Math.round(reflAlpha / 2.55) + ",Size," + reflSetup[3] + ",Gradient," + reflSetup[5]; refl_mask = null; adjustMode = true; if (ppt.artistView && ppt.cycPhoto) clear_a_rs_cache(); if (ppt.artistView) getArtImg(); else getFbImg();}
    const uniq = a => {const out = [], seen = {}; let j = 0; a.forEach(v => {if (seen[v] !== 1) {seen[v] = 1; out[j++] = v;}}); return out;}

    this.artist_reset = () => {blurCheck(); const artist_o = artistBlur; artist = name.artist(); artistBlur = artist + (!ui.blur ? "" : p.IsVideo()); const new_artist = artist && artistBlur != artist_o || !artist || ppt.covBlur && alb_id != alb_id_o; if (new_artist) {folder = p.cleanPth(ppt.imgArtPth); clear_art_cache(); if (ppt.cycPhoto) a_run = 1; all_files_o_length = 0; ix = 0;}}
    this.change = incr => {ix += incr; if (ix < 0) ix = this.artImages.length - 1; else if (ix >= this.artImages.length) ix = 0; loadArtImage();}
    this.focus = s.debounce(() => {this.on_playback_new_track();}, 250, {'leading':true, 'trailing': true});
    this.lbtn_dn = (p_x, p_y) => {if (!ppt.touchControl) return; this.touch.dn = true; this.touch.start = p_x;}
    this.leave = () => {if (this.touch.dn) {this.touch.dn = false; this.touch.start = 0;}}
    this.on_key_down = vkey => {if (ppt.showAlb || !p.show_images) return; switch(vkey) {case vk.left: this.wheel(1); break; case vk.right: this.wheel(-1); break;} return true;}
    this.on_size = () => {img_metrics(); clear_a_rs_cache(); clear_c_rs_cache(); if (ppt.artistView) {if (init) this.artist_reset(); getArtImg();} else getFbImg(); init = false;}
    this.paint = () => {if (!ppt.imgSmoothTrans || ppt.showAlb) {alpha = 255; t.paint(); return;} imgID_o = imgID; imgID = cur_imgPth; if (imgID_o != imgID && imgID_o) alpha = transLevel; else alpha = 255; timer.clear(timer.transition); timer.transition.id = setInterval(() => {alpha = Math.min(alpha *= transIncr, 255); t.paint(); if (alpha == 255) timer.clear(timer.transition);}, 12);}
    this.update = () => {update = 1; if (t.block()) return; getArtImg(); update = 0;}
    this.wheel = step => {switch (utils.IsKeyPressed(0x10)) {case false: if (!ppt.artistView || !ppt.cycPhoto) break; if (this.artImages.length < 2) break; this.change(-step); if (ppt.artistView && ppt.cycPhoto) timer.image(); break; case true: if (ppt.imgReflection) setReflStrength(-step * 5); break;}}

    this.on_playback_new_track = () => {
        ir = fb.PlaybackLength <= 0 ? 1 : 0; p.vid_chk(); if (ui.np_graphic) check_cache();
        if (!ui.np_graphic || ppt.showAlb && !ui.blur || t.block()) {this.get = true;}
        else {
			if (p.videoMode && !ppt.showAlb) p.set_video();
			if (ppt.artistView && ppt.cycPhoto) {if (!ir || !fb.IsPlaying) {timer.image(); this.artist_reset(); getArtImg();}}
			else getFbImg(); this.get = false;
		}
    }

    this.on_playback_dynamic_track = () => {
        timer.clear(timer.vid); if (ui.np_graphic) check_cache();
        if (!p.show_images || ppt.showAlb && !ui.blur || t.block()) this.get = true;
        else {
            if (ppt.artistView && ppt.cycPhoto) {timer.image(); this.artist_reset(); getArtImg();}
            else if (ppt.artistView) getFbImg(); this.get = false;
        }
    }

    const getArtImages = () => {
        if (!ppt.dl_art_img && !timer.dl.id) timer.decelerating();
        const all_files = utils.Glob(folder + "*");
        if (all_files.length == all_files_o_length) return; let newArr = false;
        if (!this.artImages.length) {newArr = true; art.cache = [];}
        all_files_o_length = all_files.length;
        const arr = all_files.filter(images); this.artImages = this.artImages.concat(arr);
        if (this.artImages.length > 1) this.artImages = uniq(this.artImages); if (newArr && this.artImages.length > 1) this.artImages = $.shuffle(this.artImages);
    }
	
    this.load_image_done = (id, image, image_path) => {
        if (art_img.id != id) return;
        if (!image) {this.artImages.splice(art_img.ix, 1); if (this.artImages.length > 1) this.change(1); return;}
        art.cacheIt(art_img.ix, image, image_path, 0);
    }

    const loadArtImage = () => {
        if (this.artImages.length > 0) {
            if (art.cacheHit(ix, this.artImages[ix])) return;
            art_img.ix = ix; art_img.id = gdi.LoadImageAsync(window.ID, this.artImages[ix]);
        } else if (!init) getFbImg();
    }

	this.get_album_art_done = (handle, art_id, image, image_path) => {
        if (image && cov.cacheHit(i_x, image_path) || !cur_handle.Compare(handle)) return;
        const refresh = ui.blur && p.IsVideo(); image_path = image_path + (!refresh ? "" : refresh);
        clear_cov_cache();
        if (!image) {
            if (cov.cacheHit(i_x, "stub" + ppt.artistView)) return;
            image = this.noimg[ppt.artistView ? 1 : 0]; image_path = "stub" + ppt.artistView;
		}
		if (!image) return;        
        cov.cacheIt(i_x, image, image_path, 1);
    }

    const blur_img = (image, im, x, y, w, h) => {
        if (!image || !im || !p.w || !p.h) return;
        if (ppt.covBlur && ppt.artistView && new_BlurAlb) {
            f_blur = null;
            const handle = fb.IsPlaying && (!ppt.focus || p.videoMode) ? fb.GetNowPlaying() : fb.GetFocusItem(); if (handle) f_blur = utils.GetAlbumArtV2(handle, 0);
            if (!f_blur) f_blur = this.noimg[0].Clone(0, 0, this.noimg[0].Width, this.noimg[0].Height); new_BlurAlb = false; if (f_blur && !ppt.blurAutofill) f_blur = f_blur.Resize(p.w, p.h);
        }
        if (ppt.covBlur && ppt.artistView && f_blur) image = f_blur;
        if (ppt.blurAutofill) {const s1 = image.Width / p.w, s2 = image.Height / p.h; let imgw, imgh, imgx, imgy; if (s1 > s2) {imgw = Math.round(p.w * s2); imgh = image.Height; imgx = Math.round((image.Width - imgw) / 2); imgy = 0;} else {imgw = image.Width; imgh = Math.round(p.h * s1); imgx = 0; imgy = Math.round((image.Height - imgh) / 8);} image = image.Clone(imgx, imgy, imgw, imgh);}
        const blurImg = s.gr(p.w, p.h, true, (g, gi) => {
            g.SetInterpolationMode(0);
            if (ui.blurBlend) {
                const iSmall = image.Resize(p.w * ui.blurLevel / 100, p.h * ui.blurLevel / 100, 2), iFull = iSmall.Resize(p.w, p.h, 2), offset = 90 - ui.blurLevel;
                g.DrawImage(iFull, 0 - offset, 0 - offset, p.w + offset * 2, p.h + offset * 2, 0, 0, iFull.Width, iFull.Height, 0, 63 * ui.blurAlpha);
            } else {
                g.DrawImage(image, 0, 0, p.w, p.h, 0, 0, image.Width, image.Height); if (ui.blurLevel > 1) gi.StackBlur(ui.blurLevel);
                const colorScheme_array = gi.GetColourScheme(1), light_cover = ui.get_textselcol(colorScheme_array[0], true) == 50 ? true : false;
                g.FillSolidRect(0, 0, p.w, p.h, light_cover ? ui.col.bg_light : ui.col.bg_dark);
            }
        });
        return blurImg;
    }

    const refl_img = (image, i, x, y, w, h, cache) => {
        if (!refl_mask) {const km = reflSlope != -1 ? reflAlpha / 500 + reflSlope  / 10 : 0; refl_mask = s.gr(500, 500, true, g => {for (let k = 0; k < 500; k++) {const c = 255 - s.clamp(reflAlpha - k * km, 0, 255); g.FillSolidRect(0, k, 500, 1, RGB(c, c, c));}});}
        const ref_sz = Math.round(Math.min(p.h - y - h, image.Height * reflSz)); if (ref_sz <= 0) return image; const refl = image.Clone(0, image.Height - ref_sz, image.Width, ref_sz); let r_mask = refl_mask.Clone(0, 0, refl_mask.Width, refl_mask.Height); if (refl) {r_mask = r_mask.Resize(refl.Width, refl.Height); refl.RotateFlip(6); refl.ApplyMask(r_mask);}
        const reflImg = s.gr(w, h + ref_sz, true, g => {g.DrawImage(image, 0, 0, w, h, 0, 0, w, h); g.DrawImage(refl, 0, h, w, h, 0, 0, w, h);}); cache[i].h = h + ref_sz; return reflImg;
    }

    const getBorder = (image, w, h, bor_w1, bor_w2) => {
        const imgo = 7,  dpiCorr = (s.scale - 1) * imgo, imb = imgo - dpiCorr;
        let imgb = 0; if (ppt.imgBorder > 1 && !ppt.imgReflection) {imgb = 15 + dpiCorr; sh_img = s.gr(Math.floor(w + bor_w2 + imb), Math.floor(h + bor_w2 + imb), true, g => g.FillSolidRect(imgo, imgo, w + bor_w2 - imgb, h + bor_w2 - imgb, RGB(0, 0, 0))); sh_img.StackBlur(12);}
        let bor_img = s.gr(Math.floor(w + bor_w2 + imgb), Math.floor(h + bor_w2 + imgb), true, g => {
            if (ppt.imgBorder > 1 && !ppt.imgReflection) g.DrawImage(sh_img, 0, 0, Math.floor(w + bor_w2 + imgb), Math.floor(h + bor_w2 + imgb), 0, 0, sh_img.Width, sh_img.Height);
            if (ppt.imgBorder == 1 || ppt.imgBorder == 3) g.FillSolidRect(0, 0, w + bor_w2, h + bor_w2, RGB(255, 255, 255));
            g.DrawImage(image, bor_w1, bor_w1, w, h, 0, 0, image.Width, image.Height);
        }); sh_img = null;
        return bor_img;
    }

	const ImageCache = function () {
		this.cache = [];
		this.trimCache = function() { // keep slowest to resize
			let lowest = 0;
			for (let i = 1; i < this.cache.length; i++) {
				const v1 = this.cache[i] && this.cache[i].time || Infinity, v2 = this.cache[lowest] && this.cache[lowest].time || Infinity;
				if (v1 < v2) lowest = i;
			}
			if (this.cache[lowest]) {this.cache[lowest].img = null; this.cache[lowest].time = null; if (this.cache[lowest].blur) this.cache[lowest].blur = null;}
		}

		this.cacheIt = (i, image, image_path, n) => {
			if (!image) return;
			if (!n && memoryLimit()) this.trimCache();
			const start = Date.now();
			const sc = Math.min(nh / image.Height, nw / image.Width), tw = Math.round(image.Width * sc), th = Math.round(image.Height * sc); let tx = Math.round((nw - tw) / 2), ty = Math.round((nh - th) / 2 + img.ny);
			xa = tx; ya = ty;
			this.cache[i] = {};
			this.cache[i].x = tx; this.cache[i].y = ty;
			switch (ppt.imgBorder) {
				case 0:
					this.cache[i].img = image.Resize(tw, th, 2);
					if (ppt.imgReflection) {this.cache[i].img = refl_img(this.cache[i].img, i, tx, ty, tw, th, this.cache); tx = this.cache[i].x; ty = this.cache[i].y;}
					if (ui.blur && this.cache[i].img) {
						this.cache[i].blur = blur_img(image, this.cache[i].img, tx, ty, this.cache[i].img.Width, this.cache[i].img.Height);
						cur_blur = this.cache[i].blur;
					}
					cur_img = this.cache[i].img;
					break;
				default:
					this.cache[i].img = image.Clone(0, 0, image.Width, image.Height);
					let bor_img = getBorder(image, tw, th, bor_w1, bor_w2);
					if (ppt.imgReflection) {bor_img = refl_img(bor_img, i, tx, ty, bor_img.Width, bor_img.Height, this.cache); tx = this.cache[i].x; ty = this.cache[i].y;}
					if (ui.blur && bor_img ) {
						this.cache[i].blur = blur_img(this.cache[i].img, bor_img, tx, ty, bor_img.Width, bor_img.Height);
						cur_blur = this.cache[i].blur;
					}
					this.cache[i].img = bor_img;
					cur_img = bor_img;
					break;
			}
			this.cache[i].pth = image_path;
			cur_imgPth = image_path;
			if (!n) this.cache[i].time = Date.now() - start;
			img.paint();
		}

		this.cacheHit = (i, imgPth) => {
			if (!this.cache[i] || !this.cache[i].img || this.cache[i].pth != imgPth || adjustMode) return false;
			xa = this.cache[i].x; ya = this.cache[i].y; if (ui.blur && this.cache[i].blur) cur_blur = this.cache[i].blur; cur_imgPth = imgPth; cur_img = this.cache[i].img;
			img.paint(); return true;
		}
	}
	const art = new ImageCache(), cov = new ImageCache();

    this.draw = gr => {
        getImgFallback(); if (!p.show_images || ppt.showAlb && !ui.blur) return;
		if (!cur_img) {cur_img = this.noimg[3]; if (cur_img) gr.DrawImage(cur_img, 0, 0, p.w, p.h, 0, 0, cur_img.Width, cur_img.Height); return;}
		if (ui.blur && cur_blur) gr.DrawImage(cur_blur, 0, 0, cur_blur.Width, cur_blur.Height, 0, 0, cur_blur.Width, cur_blur.Height);
        if (!ppt.showAlb && (!p.show_video || !p.IsVideo()) && cur_img) gr.DrawImage(cur_img, xa, ya, cur_img.Width, cur_img.Height, 0, 0, cur_img.Width, cur_img.Height, 0, alpha);
    }

    this.lbtn_up = (x, y) => {
		if (y > Math.min(p.h * p.rel_imgs, p.h - this.ny)) return;
		ppt.artistView = !ppt.artistView;
		if (ppt.artistView && ppt.cycPhoto) {getArtImg(this.artist_reset()); timer.image();}
		else {getFbImg(); timer.clear(timer.img);}
    }

    this.move = (p_x, p_y) => {
        if (this.touch.dn) {
            const imgs = Math.min(p.h * p.rel_imgs, p.h - this.ny);
            if (!t.clickable(p_x, p_y) || !p.show_images || p_y > imgs || utils.IsKeyPressed(0x10)) return;
            this.touch.end = p_x; const x_delta = this.touch.end - this.touch.start;
            if (x_delta > imgs / 5) {this.wheel(1); this.touch.start = this.touch.end;}
            if (x_delta < -imgs / 5) {this.wheel(-1); this.touch.start = this.touch.end;}
        }
    }
	
    this.create_images = () => {
        const cc = StringFormat(1, 1), font1 = gdi.Font("Segoe UI", 270, 1), font2 = gdi.Font("Segoe UI", 120, 1), font3 = gdi.Font("Segoe UI", 200, 1), font4 = gdi.Font("Segoe UI", 90, 1), tcol = !ui.blurDark && !ui.blurLight || (ppt.imgBorder != 1 && ppt.imgBorder != 3) ? ui.col.text : ui.dui ? window.GetColourDUI(0) : window.GetColourCUI(0);
        this.noimg = ["COVER", "PHOTO", "SELECTION"];
        for (let i = 0; i < this.noimg.length; i++) {
            const n = this.noimg[i];
            this.noimg[i] = s.gr(500, 500, true, g => {
                g.SetSmoothingMode(2); 
                if (!ui.blurDark && !ui.blurLight || ppt.imgBorder == 1 || ppt.imgBorder == 3) {g.FillSolidRect(0, 0, 500, 500, tcol); g.FillGradRect(-1, 0, 505, 500, 90, ui.col.bg & 0xbbffffff, ui.col.bg, 1.0);} 
                g.SetTextRenderingHint(3);
                g.DrawString("NO", i == 2 ? font3 : font1, tcol & 0x25ffffff, 0, 0, 500, 275, cc);
                g.DrawString(n, i == 2 ? font4 : font2, tcol & 0x20ffffff, 2.5, 175, 500, 275, cc);
                g.FillSolidRect(60, 388, 380, 50, tcol & 0x15ffffff);
            });
        }
        this.get = true;
    }
    this.create_images();
}

function Dl_art_images() {
    if (!ppt.dl_art_img) return;
    let dl_ar = "";
    this.run = () => {
        if (!s.file(fb.ProfilePath + "yttm\\foo_lastfm_img.vbs")) return; let n_artist = name.artist(); if (n_artist == dl_ar || n_artist == "") return; dl_ar = n_artist; const img_folder = p.cleanPth(ppt.imgArtPth);
        if (!p.img_exp(img_folder, p.Thirty_Days)) return; const lfm_art = new Lfm_art_img(() => lfm_art.on_state_change()); lfm_art.Search(dl_ar, img_folder);
    }
}

function Lfm_art_img(state_callback) {
    let dl_ar, img_folder; this.xmlhttp = null; this.func = null; this.ready_callback = state_callback; this.ie_timer = null;

    this.on_state_change = () => {
        if (this.xmlhttp != null && this.func != null) if (this.xmlhttp.readyState == 4) {
            clearTimeout(this.ie_timer); this.ie_timer = null;
            if (this.xmlhttp.status == 200) this.func();
            else {s.trace("download artist images N/A: " + dl_ar + ": none found" + " Status error: " + this.xmlhttp.status);}
        }
    }

    this.Search = (p_dl_ar, p_img_folder) => {
        dl_ar = p_dl_ar; img_folder = p_img_folder; if (ui.np_graphic) timer.decelerating();
        this.func = null; this.xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        const URL = "https://www.last.fm/music/" + encodeURIComponent(dl_ar) + "/+images"; // <- edit to use custom local lastfm domain
        this.func = this.Analyse; this.xmlhttp.open("GET", URL); this.xmlhttp.onreadystatechange = this.ready_callback;
		if (!this.ie_timer) {const a = this.xmlhttp; this.ie_timer = setTimeout(() => {a.abort(); this.ie_timer = null;}, 30000);}
		this.xmlhttp.send();
    }

    this.Analyse = () => {
        const artist = dl_ar.clean(), doc = new ActiveXObject("htmlfile"); doc.open();
        const div = doc.createElement('div'); div.innerHTML = this.xmlhttp.responseText;
        const list = div.getElementsByTagName('img'), links = []; if (!list) return;
        s.htmlParse(list, 'className', 'image-list-image', v => {links.push(v.src.replace("avatar170s/", ""));});
        if (links.length) {
            s.buildPth(img_folder); if (s.folder(img_folder)) {s.save(img_folder + "update.txt", "", true);
            $.take(links, 5).forEach(v => s.run("cscript //nologo \"" + fb.ProfilePath + "yttm\\foo_lastfm_img.vbs\" \"" + v + "\" \"" + img_folder + artist + "_" + v.substring(v.lastIndexOf("/") + 1) + ".jpg" + "\"", 0));}} doc.close();
    }
}

function Timers() {
    const timerArr = ["cursor", "artist", "dl", "img", "search", "sim1", "sim2", "transition", "vid", "yt"], times = [1000, 1000, 1000, 1000, 2000, 4000, 5000, 6000, 7000];
    timerArr.forEach(v => this[v] = {id: null}); this.rad_chk = true; this.step = 0;
    const res = () => img.update();
    const videoState = () => {if (ppt.btn_mode || !p.videoMode || t.visible == t.block()) return; t.visible = t.block(); if (t.block()) if (p.eval("%video_popup_status%") == "visible") {img.get = true; fb.RunMainMenuCommand("View/Visualizations/Video"); this.clear(this.vid);}}
    this.clear = timer => {if (timer) clearTimeout(timer.id); timer.id = null;}
    this.decelerating = function() {let counter = 0; this.clear(this.dl); const func = () => {res(); counter++; if (counter < times.length) timer_dl(); else this.clear(this.dl);}; const timer_dl = () => {this.dl.id = setTimeout(func, times[counter])}; timer_dl();}
    this.image = () => {this.clear(this.img); this.img.id = setInterval(() => {if (!p.show_images || !ppt.artistView || ppt.showAlb || t.block() || p.videoMode && p.IsVideo() || zoom()) return; if (img.artImages.length < 2) return; img.change(1);}, ppt.cycleTime * 1000);}
    this.radio = () => {if (!this.rad_chk || !ppt.autoRad || (plman.PlayingPlaylist != pl.rad)) return; const np = plman.GetPlayingItemLocation(); if (!np.IsValid) return; const pid = np.PlaylistItemIndex, pn = pl.rad; if (plman.PlaylistItemCount(pn) > pid + 1) return this.rad_chk = false; rad.on_playback_new_track();}
    this.video = () => {this.vid.id = setInterval(videoState, 50);}
    const zoom = () => utils.IsKeyPressed(0x10) || utils.IsKeyPressed(0x11);
}
if (ui.np_graphic) {if (!ppt.showAlb) p.set_video();} else if (p.eval("%video_popup_status%") == "visible") fb.RunMainMenuCommand("View/Visualizations/Video");

function on_album_search_done_callback() {alb.calc_rows_alb(); t.paint();}
function on_get_album_art_done(handle, art_id, image, image_path) {img.get_album_art_done(handle, art_id, image, image_path);}
function on_item_focus_change() {if (!t.block() && !ppt.showAlb && !ui.blur) t.repaint(); if (ui.np_graphic) {if (t.block()) {img.get = true; img.artist_reset();} else if (!fb.IsPlaying) img.get = false;} if (!ppt.showAlb) {if (!ui.blur) t.repaint(); alb.get = true;} if ((!ppt.showAlb || ui.blur) && ui.np_graphic) img.focus(); alb.focus_serv();}
function on_load_image_done(id, image, image_path) {img.load_image_done(id, image, image_path);}
function on_metadb_changed() {if (p.ir()) return; if (!t.block() && !ppt.showAlb && !ui.blur) t.repaint(); if (ui.np_graphic) img.focus(); alb.metadb_serv();}
function on_playback_stop(reason) {if (reason == 2) return; on_item_focus_change();}
function on_size(w, h) {t.rp = false; p.w = w; p.h = h; if (!p.w || !p.h) return; p.on_size(); ui.get_font(); but.refresh(true); if (ui.np_graphic) img.on_size(); rad.on_size(); t.rp = true;}
function on_paint(gr) {ui.draw(gr); if (ui.np_graphic) img.draw(gr); if (!ppt.showAlb) rad.draw(gr); else alb.draw(gr); but.draw(gr);}

function on_playback_new_track() {
    ml.Execute(); if (ml.upd_yt_mtags|| ml.upd_lib_mtags) upd_mtags.Execute();
    if (!alb.lock_artist) alb.orig_artist = alb.artist = name.artist();
    if (fb.PlaybackLength > 0) timer.clear(timer.dl);
    if (ui.np_graphic) img.on_playback_new_track();
    if (ppt.dl_art_img && fb.PlaybackLength > 0) dl_art.run();
    rad.remove_played();
    rad.on_playback_new_track();
    alb.on_playback_new_track();
}

function on_playback_dynamic_info_track() {
    if (!alb.lock_artist) alb.orig_artist = alb.artist = name.artist();
    timer.clear(timer.dl);
    if (p.show_images) img.on_playback_dynamic_track();
    if (ppt.dl_art_img) dl_art.run();
    alb.on_playback_new_track();
}

function MenuItems() {
    const lib_n = [!ml.mtags_installed ? "Library Options N/A: m-TAGS Not Installed" : "Set Album Build Type From Options Below (Uses m-TAGS Container)", "To Add Albums To Library, Set Media Library To Monitor: foobar2000\\yttm\\albums", "YouTube Tracks", "Prefer Library Tracks", "Library Tracks"], MenuMap = [], MF_GRAYED = 0x00000001, MF_SEPARATOR = 0x00000800, MF_STRING = 0x00000000, rn = [];
    let a_n = "", an = "", a_t = "", ar_n = "", alb_playlist = false, artis = "", fn, get_source = "", c_t = "Singles Chart", list, OrigIndex = 0, pl_active, rad_on, t50_n = "", title = "", v_id = "";

    const newMenuItem = (index, type, value) => {MenuMap[index] = {}; MenuMap[index].type = type; MenuMap[index].value = value;}

    const trackMenu = (Menu, StartIndex) => {
        let Index = StartIndex;
        a_n = t50_n = name.art(); an = a_n.replace(/&/g, "&&"); a_t = name.artist_title(); ar_n = name.artist(); pl_active = pl.active(); rad_on = rad.on() || ppt.autoRad && plman.PlayingPlaylist == pl.rad;
        for (let i = 0; i < 4; i++) {
            newMenuItem(Index, "New", i); let available = false; rn[i] = (i == 0 || i == 2) ? (ar_n ? ar_n : "N/A") : i == 1 ? name.genre() : a_t;
            if (ppt.useSaved) {
                if (ppt.radMode) {const rs = rn[i].clean(); available =
                    s.file(rad.f2 + rs.substr(0, 1).toLowerCase() + "\\" + rs + (i < 2 ? ".json" : i == 2 ? " And Similar Artists.json" :  i == 3 ? " [Similar Songs].json" : " - Top Artists.json")) ||
                    s.file(rad.f2 + rs.substr(0, 1).toLowerCase() + "\\" + rs + " [curr]" + (i < 2 ? ".json" : i == 2 ? " And Similar Artists.json" :  i == 3 ? " [Similar Songs].json" : " - Top Artists.json"))
                } else {const all_files = index.best_saved_match(rn[i], i); if (all_files.length) available = true;}
            }
            rn[i] = ppt.useSaved && !available ? "N/A" : rn[i]; if (ppt.radMode == 3 && i == 3) rn[i] = "N/A"; const na_arr = ["Artist ", "Genre ", "Similar Artists ", "Similar Songs "];
            Menu.AppendMenuItem(rn[i] == "N/A" ? MF_GRAYED : MF_STRING, Index, rn[i] == "N/A" ? na_arr[i] + (ppt.useSaved ? "- Saved N/A" : "N/A")  + (ppt.radMode == 3 && i == 3 ? " - " + index.n[3] + " Mode" : "") : rn[i].replace(/&/g, "&&") + (i == 2 ? " And Similar Artists" : "")); Index++;
        } Menu.AppendMenuItem(MF_SEPARATOR, 0, 0);
        return Index;
    }

    const albumTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; for (let i = 0; i < (ml.mtags_installed ? lib_n.length : 1); i++) {newMenuItem(Index, "Album", i); Menu.AppendMenuItem(i < 2 ? MF_GRAYED : ml.mtags_installed ? MF_STRING : MF_GRAYED, Index, lib_n[i]); Menu.CheckMenuItem(Index++, i > 1 && ml.alb == i - 1);} return Index;}
    const artistTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; const n = ["Favour Higher Similarity (Recommended)", "Random Pick"]; n.forEach((v, i) => {newMenuItem(Index, "Artist", i); Menu.AppendMenuItem(MF_STRING, Index, v); Index++;}); Menu.CheckMenuRadioItem(StartIndex, StartIndex + 1, StartIndex + ppt.randomArtist); return Index;}
    const cancelTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; newMenuItem(Index, "Cancel", 0); Menu.AppendMenuItem(MF_STRING, Index, "Cancel iSelect Search"); Menu.AppendMenuItem(MF_SEPARATOR, 0, 0); Index++; return Index;}
    const chooseArtistTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; newMenuItem(Index, "Search", 0); Menu.AppendMenuItem(MF_STRING, Index, "Choose"); Menu.AppendMenuItem(MF_SEPARATOR, 0, 0); Index++; return Index;}
    const defaultMenu = (Menu, StartIndex) => {let Index = StartIndex; const n = ["Panel Properties", "Configure..."]; Menu.AppendMenuItem(MF_SEPARATOR, 0, 0); for (let i = 0; i < 2; i++) {newMenuItem(Index, "Default", i); if (!i || i && utils.IsKeyPressed(0x10)) Menu.AppendMenuItem(MF_STRING, Index++, n[i]);} return Index;}
    const genreTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; const n = ["Artists", "Tracks"]; n.forEach((v, i) => {newMenuItem(Index, "Genre", i); Menu.AppendMenuItem(MF_STRING, Index, "Top " + v); Index++;}); Menu.CheckMenuRadioItem(StartIndex, StartIndex + 1, StartIndex + ppt.genre_tracks); return Index;}
    const imageTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; const c = [ppt.imgSmoothTrans, ppt.imgReflection, ppt.imgBorder == 1 || ppt.imgBorder == 3, ppt.imgBorder > 1], n = ["Smooth Transition", "Reflection", "Border", "Shadow"]; n.forEach((v, i) => {newMenuItem(Index, "Image", i); Menu.AppendMenuItem(!ppt.imgReflection || i != 3 ? MF_STRING : MF_GRAYED, Index, v); Menu.CheckMenuItem(Index++, c[i]); if (!i) Menu.AppendMenuItem(MF_SEPARATOR, 0, 0);}); return Index;}
    const libFilterTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; const n = []; lib.filter.forEach(v => n.push(v)); n.forEach((v, i) => {newMenuItem(Index, "LibFilter", i); Menu.AppendMenuItem(MF_STRING, Index, v); Index++; if (!i)  Menu.AppendMenuItem(MF_SEPARATOR, 0, 0);}); Menu.CheckMenuRadioItem(StartIndex, StartIndex + lib.filter.length - 1, StartIndex + ppt.libFilterID); return Index;}
    const libOptTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; newMenuItem(Index, "LibraryOpt", 0); return Index;}
    const libTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; ml.track_pref.forEach((v, i) => {newMenuItem(Index, "Lib", i); Menu.AppendMenuItem(MF_STRING, Index, v); Index++; if (i == 2)  Menu.AppendMenuItem(MF_SEPARATOR, 0, 0);}); Menu.CheckMenuRadioItem(StartIndex, StartIndex + ml.track_pref.length - 1, StartIndex + ppt.sortType); return Index;}
    const radFilterTypeMenu  = (Menu, StartIndex) => {let Index = StartIndex; const n = []; rad.filter.forEach(v => n.push(v)); n.forEach((v, i) => {newMenuItem(Index, "RadFilter", i); Menu.AppendMenuItem(MF_STRING, Index, v); Index++; if (!i)  Menu.AppendMenuItem(MF_SEPARATOR, 0, 0);}); Menu.CheckMenuRadioItem(StartIndex, StartIndex + rad.filter.length - 1, StartIndex + ppt.mySelFilterID); return Index;}
    const libraryTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; ml.track_pref.forEach((v, i) => {newMenuItem(Index, "Library", i); Menu.AppendMenuItem(MF_STRING, Index, v); Index++; if (i == 2)  Menu.AppendMenuItem(MF_SEPARATOR, 0, 0);}); Menu.CheckMenuRadioItem(StartIndex, StartIndex + ml.track_pref.length - 1, StartIndex + ppt.sortType); return Index;}
	const modeTypeMenu = (Menu, StartIndex) => {let Index = StartIndex, c = !ppt.btn_mode ? [p.sbarShow, ppt.smooth, ppt.touchControl, ppt.dblClick, ppt.rowStripes] : [], n = ["Reset Zoom", "Reload"]; if (!ppt.btn_mode) n = ["Show Scrollbar", "Smooth Scroll", "Touch Control", "Click Action: Use Double Click", "Row Stripes"].concat(n); n.forEach((v, i) => {newMenuItem(Index, "Mode", i); Menu.AppendMenuItem(MF_STRING, Index, v); if (ppt.btn_mode) {Index++; return;} Menu.CheckMenuItem(Index++, c[i]); if (!i || i == 2 || i == 3 || i == 4) Menu.AppendMenuItem(MF_SEPARATOR, 0, 0);}); return Index;}
    const moreMenu = (Menu, StartIndex) => {let Index = StartIndex; const c =[ppt.showLive, ppt.mb_group,, !ppt.showArtists], n =["Musicbrainz \"All\" Releases: Include \"Live\" + \"Other\"", "Musicbrainz \"All\" Releases: Group", "Last.fm Sorted by " + (ppt.lfm_sort ? "Playcount" : "Last.fm Rank (Listeners)") +  ": Sort by " + (ppt.lfm_sort ? "Last.fm Rank (Listeners)..." : "Playcount..."), "Hide Artists", "Reload"]; for (let i = 0; i < 5; i++) {newMenuItem(Index, "Settings", i); Menu.AppendMenuItem(MF_STRING, Index, n[i]); if (i != 2 && i != 4) Menu.CheckMenuItem(Index++, c[i]); else Index++; if (i != 0 && i != 4) Menu.AppendMenuItem(MF_SEPARATOR, 0, 0);} return Index;}
    const nowplayingTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; const c = [p.rel_imgs != 1, ppt.npShadow, p.videoMode], n = ["Show Text", "Text Shadow Effect", "Prefer Video"]; n.forEach((v, i) => {newMenuItem(Index, "Nowplaying", i); Menu.AppendMenuItem(MF_STRING, Index, v); Menu.CheckMenuItem(Index++, c[i]); if (i == 1) Menu.AppendMenuItem(MF_SEPARATOR, 0, 0);}); return Index;}
    const playlistMenu = (i, Menu, StartIndex) => {let Index = StartIndex; for (let j = i * 30; j < Math.min(pl.menu.length, 30 + i * 30); j++) {newMenuItem(Index, "Playlists", j + pl.enabled.length); Menu.AppendMenuItem(MF_STRING, Index, pl.menu[j].name); Index++;} if (OrigIndex + plman.ActivePlaylist >= StartIndex && OrigIndex + plman.ActivePlaylist <= StartIndex + 29) Menu.CheckMenuRadioItem(StartIndex, StartIndex + 29, OrigIndex + plman.ActivePlaylist); return Index;}
    const playlistsTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; pl.enabled.forEach((v, i) => {newMenuItem(Index, "Playlists", i); Menu.AppendMenuItem(MF_STRING, Index, v.name); Index++; if (plman.ActivePlaylist == v.ix) Menu.CheckMenuRadioItem(StartIndex + i, StartIndex + i, StartIndex + i);}); if (pl.enabled.length) Menu.AppendMenuItem(MF_SEPARATOR, 0, 0); return Index;}
    const radioOptTypeMenu = (Menu, StartIndex) => {let Index = StartIndex, c = [ppt.autoRad, ppt.removePlayed], n = ["Auto Radio", "Remove Played Tracks From Radio Playlist"]; n.forEach((v, i) => {newMenuItem(Index, "RadioOpt", i); Menu.AppendMenuItem(MF_STRING, Index, v); Menu.CheckMenuItem(Index++, c[i]); Menu.AppendMenuItem(MF_SEPARATOR, 0, 0);}); return Index;}
    const radioVarietyMenu = (Menu, StartIndex) => {let Index = StartIndex; const n = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 125, 150, 200, 250]; const r = ppt.radMode ? ppt.lfm_variety : ppt.ec_variety; for (let i = 0; i < (ppt.radMode ? 14 : 10); i++) {newMenuItem(Index, "Variety", i); Menu.AppendMenuItem(MF_STRING, Index, n[i]); Index++; if (r == n[i]) Menu.CheckMenuRadioItem(StartIndex + i, StartIndex + i, StartIndex + i); if (ppt.radMode && i == 9) Menu.AppendMenuItem(MF_SEPARATOR, 0, 0);} return Index;}
    const radioHotMenu = (Menu, StartIndex) => {let Index = StartIndex; index.preset.forEach((v, i) => {newMenuItem(Index, "Hotness", i); Menu.AppendMenuItem(MF_STRING, Index, v); Index++; if (v == index.preset[ppt.radRange]) Menu.CheckMenuRadioItem(StartIndex + i, StartIndex + i, StartIndex + i); if (i % 3 == 2 && i !=index.preset.length - 1) Menu.AppendMenuItem(MF_SEPARATOR, 0, 0);}); return Index;}
    const radLibTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; const n = ["Library Not Used", "Prefer Library Tracks"]; n.forEach((v, i) => {newMenuItem(Index, "RadLib", i); Menu.AppendMenuItem(MF_STRING, Index, v); Index++;}); Menu.CheckMenuRadioItem(StartIndex, StartIndex + 1, StartIndex + ml.rad); return Index;}
    const radioModeTypeMenu = (Menu, StartIndex) => {if (!ppt.useSaved || !ppt.ecUseSaved) {let Index = StartIndex; for (let i = 0; i < 4; i++) {newMenuItem(Index, "RadioMode", i); Menu.AppendMenuItem(MF_STRING, Index, i < 3 ? index.n[i + 1] : index.n[2] + " / Save Soft Playlists"); Index++; if (i == 2) Menu.AppendMenuItem(MF_SEPARATOR, 0, 0);} Menu.CheckMenuRadioItem(StartIndex, StartIndex + 3, StartIndex + (ppt.radMode == 1 && !ppt.softplaylist ? 0 : ppt.radMode == 2 && !ppt.softplaylist ? 1 : ppt.radMode == 3 && !ppt.softplaylist ? 2 : ppt.softplaylist ? 3 : -1)); return Index;} else {let Index = StartIndex; for (let i = 0; i < 5; i++) {newMenuItem(Index, "RadioMode", i); Menu.AppendMenuItem(MF_STRING, Index, i < 4 ? index.n[i] : index.n[2] + " / Save Soft Playlists"); Index++; if (i == 3) Menu.AppendMenuItem(MF_SEPARATOR, 0, 0);} Menu.CheckMenuRadioItem(StartIndex, StartIndex + 4, StartIndex + (!ppt.radMode && !ppt.softplaylist ? 0 : ppt.radMode == 1 && !ppt.softplaylist ? 1 : ppt.radMode == 2 && !ppt.softplaylist ? 2 : ppt.radMode == 3 && !ppt.softplaylist ? 3 : ppt.softplaylist ? 4 : -1)); return Index;}}
    const radioTopTagsMenu = (Menu, StartIndex) => {let Index = StartIndex; newMenuItem(Index, "TopTags", 0); Menu.AppendMenuItem(MF_STRING, Index, ppt.radMode != 3 ? "Open Tag Search..." : "Open Query Search..."); Menu.AppendMenuItem(MF_SEPARATOR, 0, 0); Index++; const topArr = ppt.radMode != 3 ? t.TopTags : t.TopGenre; topArr.forEach((v, i) => {newMenuItem(Index, "TopTags", i + 1); Menu.AppendMenuItem(MF_STRING, Index, v); Index++;}); return Index;}
	const savePlaylistTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; const c = [ppt.saveRadPlaylist, ppt.savePlaylists], n = [pl.saveRadName(), pl.t50_playlist]; n.forEach((v, i) => {newMenuItem(Index, "SavePlaylist", i); Menu.AppendMenuItem(MF_STRING, Index, v); Menu.CheckMenuItem(Index++, c[i]);}); return Index;}
    const search = (Menu, StartIndex, start, end, paste) => {let Index = StartIndex, n = ["Copy", "Cut", "Paste"]; n.forEach((v, i) => {newMenuItem(Index, "Search", i); Menu.AppendMenuItem(start == end && i < 2 || i == 2 && !paste ? MF_GRAYED : MF_STRING, Index, v); Index++; if (i == 1) Menu.AppendMenuItem(MF_SEPARATOR, 0, 0);}); return Index;}
    const searchMenu1 = (Menu, StartIndex) => {let Index = StartIndex; Menu.AppendMenuItem(MF_SEPARATOR, 0, 0); newMenuItem(Index, "New", 4); Menu.AppendMenuItem(MF_STRING, Index, "Search for Artist..."); Index++; return Index;}
    const searchMenu2 = (Menu, StartIndex) => {let Index = StartIndex; newMenuItem(Index, "New", 5); Menu.AppendMenuItem(MF_STRING, Index, "Search for Genre..."); Index++; return Index;}
    const searchMenu3 = (Menu, StartIndex) => {let Index = StartIndex; const n = ["Search for Similar Artists...", "Search for Similar Songs..."]; for (let i = 0; i < 2; i++) {newMenuItem(Index, "New", i + 6); Menu.AppendMenuItem(ppt.radMode == 3 && i == 1 ? MF_GRAYED : MF_STRING, Index, n[i]); Index++;} return Index;}
    const searchMenu4 = (Menu, StartIndex) => {let Index = StartIndex; if (ppt.btn_mode) {const n = ["Current Radio: " + (!rad.search && index.rad_source.length && rad_on ? index.rad_source ? index.rad_source.replace(/&/g, "&&") + (index.rad_type == 2 ? " And Similar Artists (" : " (") + index.n[index.rad_mode] + ")" : "None" : "None"), "Search for Album..."]; for (let i = 0; i < 2; i++) {newMenuItem(Index, "New", i + 8); Menu.AppendMenuItem(MF_STRING, Index, n[i]); Menu.AppendMenuItem(MF_SEPARATOR, 0, 0); Index++;}} return Index;}
    const selectionTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; const c = !ppt.focus || p.videoMode ? 0 : 1, n = ["Prefer Now Playing", "Follow Selected Track (Playlist)" + (p.videoMode ? ": N/A In Prefer Video Mode" : "")]; n.forEach((v, i) => {newMenuItem(Index, "Selection", i); Menu.AppendMenuItem(!i || !p.videoMode ? MF_STRING : MF_GRAYED, Index, v); Index++; }); Menu.CheckMenuRadioItem(StartIndex, StartIndex + 1, StartIndex + c); return Index;}
    const songTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; const n = ["Current Popularity", "All-Time Popularity"]; n.forEach((v, i) => {newMenuItem(Index, "Song", i); Menu.AppendMenuItem(MF_STRING, Index, v); Index++;}); Menu.CheckMenuRadioItem(StartIndex, StartIndex + 1, StartIndex + !ppt.cur_pop); return Index;}
    const themeTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; const c = [!ui.blurDark && !ui.blurBlend && !ui.blurLight, ui.blurDark, ui.blurBlend, ui.blurLight, ppt.covBlur, ppt.swapCol], n = ["None", "Dark", "Blend", "Light", "Always Cover-Based", "Swap Colours"]; n.forEach((v, i) => {newMenuItem(Index, "Theme", i); Menu.AppendMenuItem(!ui.blur && i == 4 ? MF_GRAYED : MF_STRING, Index, v); if (i < 4) {Index++; if (c[i]) Menu.CheckMenuRadioItem(StartIndex + i, StartIndex + i, StartIndex + i);} else Menu.CheckMenuItem(Index++, c[i]); if (!i || i == 3 || i == 4) Menu.AppendMenuItem(MF_SEPARATOR, 0, 0);}); return Index;}
    const topLibTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; const n = ["Library Not Used", "Prefer Library Tracks"]; n.forEach((v, i) => {newMenuItem(Index, "TopLib", i); Menu.AppendMenuItem(MF_STRING, Index, v); Index++;}); Menu.CheckMenuRadioItem(StartIndex, StartIndex + 1, StartIndex + ml.top); return Index;}
    const trackListTypeMenu = (Menu, StartIndex) => {let Index = StartIndex; const c = [!ppt.pref_mb_tracks, ppt.pref_mb_tracks], n = ["Prefer Last.fm", "Prefer Musicbrainz"]; n.forEach((v, i) => {newMenuItem(Index, "TrackList", i); Menu.AppendMenuItem(MF_STRING, Index, v); Index++;}); Menu.CheckMenuRadioItem(StartIndex, StartIndex + 1, StartIndex + ppt.pref_mb_tracks); return Index;}

    this.button = (x, y) => {const menu = window.CreatePopupMenu(); let idx, Index = 1; Index = moreMenu(menu, Index); idx = menu.TrackPopupMenu(x, y); if (idx >= 1 && idx <= Index) {const i = MenuMap[idx].value; switch (i) {case 0: alb.toggle('showLive'); break; case 1: alb.toggle('mb_group'); break; case 2: alb.toggle('lfm_sort'); break; case 3: alb.toggle('showArtists'); ppt.showArtists && alb.set_similar(); break; case 4: window.Reload(); break;}}}
    this.search_menu = (x, y, start, end, paste) => {const menu = window.CreatePopupMenu(); let idx, Index = 1; Index = search(menu, Index, start, end, paste); idx = menu.TrackPopupMenu(x, y); if (idx >= 1 && idx <= Index) {const i = MenuMap[idx].value; switch (i) {case 0: alb.on_char(vk.copy); break; case 1: alb.on_char(vk.cut); break; case 2: alb.on_char(vk.paste, true); break;}}}

    const favRadioMenu = (Menu, StartIndex) => {
        let Index = StartIndex, rt = index.rad_type; if (rt == 4) rt = 1;
        if (!fav.stations.length) {newMenuItem(Index, "Favourites", 0); Menu.AppendMenuItem(MF_STRING, Index, "None"); Index++;}
        else fav.stations.forEach((v, i) => {
                newMenuItem(Index, "Favourites", i);
                Menu.AppendMenuItem(ppt.radMode == 3 && v.type == 3 ? MF_GRAYED : MF_STRING, Index, v.source.replace(/&/g, "&&") + (v.type == 2 ? " And Similar Artists" : ""));
                if (rad_on && index.rad_source ==  v.source && rt == v.type) get_source = v.source;
                Index++;
                if (rad_on && index.rad_source ==  v.source && rt == v.type) Menu.CheckMenuRadioItem(StartIndex + i, StartIndex + i, StartIndex + i);
            });
        Menu.AppendMenuItem(MF_SEPARATOR, 0, 0);
        newMenuItem(Index, "Favourites", fav.stations ? fav.stations.length + 1 : 2); Menu.AppendMenuItem(MF_STRING, Index, "Auto Favourites"); Menu.CheckMenuItem(Index++, ppt.autoFav);
        if (!ppt.autoFav) {
            const n = ["Add Current", "Remove Current", "Reset"]; Menu.AppendMenuItem(MF_SEPARATOR, 0, 0);
            for (let i = 0; i < 3; i++) {newMenuItem(Index, "Favourites", fav.stations ? fav.stations.length + i + 2 : i + 3); Menu.AppendMenuItem(MF_STRING, Index, n[i]); Index++;}
        }
        return Index;
    }

    const tracksTypeMenu = (Menu, StartIndex) => {
        let available = false, Index = StartIndex, rs, text;
        newMenuItem(Index, "Tracks", 0); alb_playlist = lib.alb_playlist(a_n);
        Menu.AppendMenuItem(alb_playlist ? MF_STRING : MF_GRAYED, Index, "Albums" + " [" + an + (alb_playlist ? "" : (an ? " - " : "") + "None Found") + "]");
        Index++;
        if (pl_active.includes(pl.alb_yttm) && lib.albumartist == a_n) Menu.CheckMenuRadioItem(StartIndex, StartIndex, StartIndex);
        Menu.AppendMenuItem(MF_SEPARATOR, 0, 0);
        newMenuItem(Index, "Tracks", 1);
        if (pl_active.includes(pl.t50_playlist) && !pl_active.includes(" | ") && !pl_active.includes("Singles Chart")) t50_n = !pl_active.includes(pl.t50_playlist + ": ") ? pl_active.replace(pl.t50_playlist + " [","").slice(0, -1) : pl_active.replace(pl.t50_playlist + ": ","");
        if (ppt.useSaved) {rs = t50_n.clean(); available = s.file(rad.f2 + rs.substr(0, 1).toLowerCase() + "\\" + rs + ".json");}
        text = ppt.useSaved && !available ? "Saved N/A " : "";
        Menu.AppendMenuItem(text == "Saved N/A " ? MF_GRAYED : MF_STRING, Index, text + "Top " + pl.top50 + " Tracks" + " [" + (t50_n ? t50_n.replace(/&/g, "&&") : "N/A") + "]");
        const pn1 = pl_active.toLowerCase(), pn2 = (pl.t50_playlist + ": " + t50_n).toLowerCase(), pn3 = (pl.t50_playlist + " [" + t50_n + "]").toLowerCase();
        if (pn1 == pn2 || pn1 == pn3) Menu.CheckMenuRadioItem(Index, Index, Index);
        Index++;
        newMenuItem(Index, "Tracks", 2); available = false;
        if (pl_active.includes(pl.t50_playlist) && pl_active.includes(" | ") && !pl_active.includes("Singles Chart")) a_t = !pl_active.includes(pl.t50_playlist + ": ") ? pl_active.replace(pl.t50_playlist + " [","").slice(0, -1) : pl_active.replace(pl.t50_playlist + ": ","");
        if (ppt.useSaved) {rs = a_t.clean(); available = s.file(rad.f2 + rs.substr(0, 1).toLowerCase() + "\\" + rs + " [Similar Songs].json");}
        text = ppt.useSaved && !available ? "Saved N/A " : "";
        Menu.AppendMenuItem(text == "Saved N/A " ? MF_GRAYED : MF_STRING, Index, text + "Top " + pl.top50 + " Similar Tracks" + " [" + a_t.replace(/&/g, "&&") + "]");
        const pn4 = (pl.t50_playlist + ": " + a_t).toLowerCase(), pn5 = (pl.t50_playlist + " [" + a_t + "]").toLowerCase();
        if (pn1 == pn4 || pn1 == pn5) Menu.CheckMenuRadioItem(Index, Index, Index);
        Index++; Menu.AppendMenuItem(MF_SEPARATOR, 0, 0);
        newMenuItem(Index, "Tracks", 3); available = false;
        if (pl_active.includes(pl.t40_playlist) && !pl_active.includes(" | ") && pl_active.includes("Singles Chart")) c_t = !pl_active.includes(pl.t40_playlist + ": ") ? pl_active.replace(pl.t40_playlist + " [","").slice(0, -1) : pl_active.replace(pl.t40_playlist + ": ","");
        if (ppt.useSaved) {rs = c_t.clean(); available = s.file(rad.f2 + rs.substr(0, 1).toLowerCase() + "\\" + rs + ".json");}
        text = ppt.useSaved && !available ? "Saved N/A " : "";
        Menu.AppendMenuItem(text == "Saved N/A " ? MF_GRAYED : MF_STRING, Index, text + "Top 40" + " [" + c_t.replace(/&/g, "&&") + "]");
        const pn6 = (pl.t40_playlist + ": " + c_t).toLowerCase(), pn7 = (pl.t40_playlist + " [" + c_t + "]").toLowerCase();
        if (pn1 == pn6 || pn1 == pn7) Menu.CheckMenuRadioItem(Index, Index, Index);
        Index++;
        if (pl_active.includes(pl.t50_playlist) || pl_active.includes(pl.t40_playlist)) {Menu.AppendMenuItem(MF_SEPARATOR, 0, 0); newMenuItem(Index, "Tracks", 4); Menu.AppendMenuItem(MF_STRING, Index, "Refresh " + pl_active.replace(/&/g, "&&")); Index++;}
        return Index;
    }

    const blacklistMenu = (Menu, StartIndex) => {
        const black_menu_list = [], valid = plman.GetPlayingItemLocation().IsValid, pl_loved = pl.loved == (fb.IsPlaying && valid ? plman.PlayingPlaylist : plman.ActivePlaylist) ? true : false;
        let Index = StartIndex, yt_video = !p.eval("%path%").includes(".tags") ? p.eval("%path%").replace(/[\.\/\\]/g, "") : p.eval("$info(@REFERENCED_FILE)").replace(/[\.\/\\]/g, "");
        yt_video = yt_video.includes("youtubecomwatch") ? true : false; fn = fb.ProfilePath + "yttm\\" + "blacklist.json";
        if (!s.file(fn)) s.save(fn, JSON.stringify({"blacklist":{}}), true);
        if (s.file(fn)) {artis = ar_n.tidy(); list = s.jsonParse(fn, false, 'file'); if (list.blacklist[artis]) list.blacklist[artis].forEach(v => black_menu_list.push(v.title));}
        if (yt_video) {if (!p.eval("%path%").includes(".tags")) {title = p.eval("[%fy_title%]"); v_id = p.eval("[%path%]").slice(-13);} else {title = p.eval("[%youtube_title%]"); const inf = p.eval("[$info(@REFERENCED_FILE)]"); v_id = inf.indexOf("v="); v_id = inf.slice(v_id, v_id + 13);}}
        const n = [(pl_loved ? "♡ Unlove" : "♥ Add to Loved Playlist") + (p.ir()  ? "" : ": " + ((name.artist(pl_loved ? !valid : false) ? name.artist(pl_loved ? !valid : false) + " | " : "") + name.title(pl_loved ? !valid : false)).replace(/&/g, "&&")), "+ Add to Black List: " + (yt_video ? title ? title.replace(/&/g, "&&") : "N/A - Youtube Source: Title Missing" : "N/A - Track Not A YouTube Video"), black_menu_list.length ? blk.remove ? " - Remove from Black List: " : "View: " : "No Black Listed Videos For Current Artist", "Undo"];
        for (let i = 0; i < 4; i++) {newMenuItem(Index, "Blacklist", i); if (i < 3 || blk.undo[0] == artis) Menu.AppendMenuItem(i == 1 && !yt_video ? MF_GRAYED : MF_STRING, Index, n[i]); if (i < 2) Menu.AppendMenuItem(MF_SEPARATOR, 0, 0); Index++;}
        if (black_menu_list.length) black_menu_list.forEach((v, i) => {newMenuItem(Index, "Blacklist", i + (blk.undo[0] == artis ? 4 : 3)); Menu.AppendMenuItem(MF_STRING, Index, v.replace(/&/g, "&&")); Index++;});
        return Index;
    }

    this.rbtn_up = (x, y) => {
        if (!lib) return;
        const popupMenu = ["albumMenu", "artistMenu", "blackMenu", "configMenu", "favMenu", "genreMenu", "hotMenu", "imageMenu", "libFilterMenu", "libOptMenu", "libMenu", "libraryMenu", "modeMenu", "newMenu", "nowplayingMenu", "playlistsMenu", "radioModeMenu", "radioOptMenu", "radFilterMenu", "radLibMenu", "savePlaylistMenu", "selectionMenu", "songMenu", "themeMenu", "topLibMenu", "topTagsMenu", "trackListMenu", "tracksMenu", "varietyMenu", "menu"];
        let idx, Index = 1;
        popupMenu.forEach(v => this[v] = window.CreatePopupMenu());
        if (ppt.radMode == 2 && (rad.search || timer.sim1.id || timer.sim2.id)) Index = cancelTypeMenu(this.menu, Index);
        this.newMenu.AppendTo(this.menu, MF_STRING, "New Radio..."); Index = trackMenu(this.newMenu, Index);
        Index = radioVarietyMenu(this.varietyMenu, Index); this.varietyMenu.AppendTo(this.newMenu, MF_STRING, "> Artist Variety: " + (ppt.radMode ? ppt.lfm_variety : ppt.ec_variety));
        Index = radioModeTypeMenu(this.radioModeMenu, Index); this.radioModeMenu.AppendTo(this.newMenu, MF_STRING, "> Radio: " + (!ppt.softplaylist ? index.n[ppt.radMode] :  index.n[2] + " / Save Soft Playlists"));
        if (ppt.radMode < 3) {Index = radioHotMenu(this.hotMenu, Index); this.hotMenu.AppendTo(this.newMenu, ppt.radMode ? MF_STRING : MF_GRAYED, "> Tracks: " +  (ppt.radMode ? index.preset[ppt.radRange] : "No Options for Echonest Radio"));}
        else {Index = libTypeMenu(this.libMenu, Index); this.libMenu.AppendTo(this.newMenu, MF_STRING, "> Tracks: Favour " + (ml.track_pref[ppt.sortType]));}
        Index = searchMenu1(this.newMenu, Index);
        if (!ppt.radMode) Index = searchMenu2(this.newMenu, Index);
        else {Index = radioTopTagsMenu(this.topTagsMenu, Index); this.topTagsMenu.AppendTo(this.newMenu, MF_STRING, ppt.radMode != 3 ? "Search for Genre/Tag..." : "Search for Genre / by Query...");}
        Index = searchMenu3(this.newMenu, Index);
        Index = favRadioMenu(this.favMenu, Index); this.favMenu.AppendTo(this.menu, MF_STRING, "Favourites..."); this.menu.AppendMenuItem(MF_SEPARATOR, 0, 0);
        Index = tracksTypeMenu(this.tracksMenu, Index); this.tracksMenu.AppendTo(this.menu, MF_STRING, "Load..."); this.menu.AppendMenuItem(MF_SEPARATOR, 0, 0);
        Index = searchMenu4(this.menu, Index);
        if (ppt.btn_mode || utils.IsKeyPressed(0x10)) Index = chooseArtistTypeMenu(this.menu, Index);
        Index = playlistsTypeMenu(this.playlistsMenu, Index); this.playlistsMenu.AppendTo(this.menu, MF_STRING, "Playlists");
        const pl_me = [], pl_no = Math.ceil(pl.menu.length / 30); OrigIndex = Index;
        for (let j = 0; j < pl_no; j++) {pl_me[j] = window.CreatePopupMenu(); Index = playlistMenu(j, pl_me[j], Index); pl_me[j].AppendTo(this.playlistsMenu, MF_STRING, "# " + (j * 30 + 1 +  " - " + Math.min(pl.menu.length, 30 + j * 30) + (30 + j * 30 > plman.ActivePlaylist && ((j * 30) - 1) < plman.ActivePlaylist ? "  >>>" : "")));}
		this.menu.AppendMenuItem(MF_SEPARATOR, 0, 0);
		this.configMenu.AppendTo(this.menu, MF_STRING, "Options"); this.menu.AppendMenuItem(MF_SEPARATOR, 0, 0);
        if (ui.np_graphic) {
            Index = imageTypeMenu(this.imageMenu, Index); this.imageMenu.AppendTo(this.configMenu, MF_STRING, "Image"); this.configMenu.AppendMenuItem(MF_SEPARATOR, 0, 0);
			Index = themeTypeMenu(this.themeMenu, Index); this.themeMenu.AppendTo(this.configMenu, MF_STRING, "Theme"); this.configMenu.AppendMenuItem(MF_SEPARATOR, 0, 0);
        }
        Index = blacklistMenu(this.blackMenu, Index); this.blackMenu.AppendTo(this.menu, MF_STRING, "Love / Black List: Videos");
        if (!ppt.showAlb && !t.halt() && ui.np_graphic) {Index = nowplayingTypeMenu(this.nowplayingMenu, Index); this.nowplayingMenu.AppendTo(this.configMenu, MF_STRING, "Nowplaying"); this.configMenu.AppendMenuItem(MF_SEPARATOR, 0, 0);}
        Index = selectionTypeMenu(this.selectionMenu, Index); this.selectionMenu.AppendTo(this.configMenu, !p.videoMode ? MF_STRING : MF_GRAYED, "Selection Mode" + (!p.videoMode ? "" : " N/A In Prefer Video Mode")); this.configMenu.AppendMenuItem(MF_SEPARATOR, 0, 0);
        Index = trackListTypeMenu(this.trackListMenu, Index); this.trackListMenu.AppendTo(this.configMenu, MF_STRING, "Album Track List: Prefer " + (ppt.pref_mb_tracks ? "Musicbrainz" : "Last.fm")); this.configMenu.AppendMenuItem(MF_SEPARATOR, 0, 0);
        Index = radioOptTypeMenu(this.radioOptMenu, Index); this.radioOptMenu.AppendTo(this.configMenu, MF_STRING, "Radio && Sources"); this.configMenu.AppendMenuItem(MF_SEPARATOR, 0, 0);
        Index = songTypeMenu(this.songMenu, Index); this.songMenu.AppendTo(this.radioOptMenu, MF_STRING, index.n[1] + index.nm[1] + " > Tracks: " + (ppt.cur_pop ? "Current Popularity" : "All-Time Popularity"));
        Index = artistTypeMenu(this.artistMenu, Index); this.artistMenu.AppendTo(this.radioOptMenu, MF_STRING, index.n[1] + index.nm[1] + " > Artists: " + (!ppt.randomArtist ? "Higher Similarity" : "Random Pick")); this.radioOptMenu.AppendMenuItem(MF_SEPARATOR, 0, 0);
        Index = genreTypeMenu(this.genreMenu, Index); this.genreMenu.AppendTo(this.radioOptMenu, MF_STRING, "Genre/Tag Method: " + ("Top " + (ppt.genre_tracks ? "Tracks" : "Artists")));
		Index = savePlaylistTypeMenu(this.savePlaylistMenu, Index); this.savePlaylistMenu.AppendTo(this.configMenu, MF_STRING, "Save Playlists"); this.configMenu.AppendMenuItem(MF_SEPARATOR, 0, 0);
        Index = libOptTypeMenu(this.libOptMenu, Index); this.libOptMenu.AppendTo(this.configMenu, MF_STRING, "Library");
		this.configMenu.AppendMenuItem(MF_SEPARATOR, 0, 0);
		Index = modeTypeMenu(this.modeMenu, Index); this.modeMenu.AppendTo(this.configMenu, MF_STRING, "Mode");
        Index = albumTypeMenu(this.albumMenu, Index); this.albumMenu.AppendTo(this.libOptMenu, MF_STRING, "Albums: " + (ml.alb && ml.mtags_installed ? "Use m-TAGS: " + lib_n[ml.alb + 1] : "Library Not Used"));
        Index = radLibTypeMenu(this.radLibMenu, Index); this.radLibMenu.AppendTo(this.libOptMenu, MF_STRING, index.n[1] + index.nm[1] + ": " + (ml.rad ? "Prefer Library Tracks" : "Library Not Used"));
        Index = topLibTypeMenu(this.topLibMenu, Index); this.topLibMenu.AppendTo(this.libOptMenu, MF_STRING, "Top Tracks: " + (ml.top ? "Prefer Library Tracks" : "Library Not Used"));
        this.libOptMenu.AppendMenuItem(MF_SEPARATOR, 0, 0); Index = radFilterTypeMenu(this.radFilterMenu, Index); this.radFilterMenu.AppendTo(this.libOptMenu, MF_STRING, "Filter [MySelect Radio]: " + rad.filter[ppt.mySelFilterID]);
        if (lib.filter.length > 1) {this.libOptMenu.AppendMenuItem(MF_SEPARATOR, 0, 0); Index = libFilterTypeMenu(this.libFilterMenu, Index); this.libFilterMenu.AppendTo(this.libOptMenu, MF_STRING, "Filter [All Modes]: " + lib.filter[ppt.libFilterID]);}
        this.libOptMenu.AppendMenuItem(MF_SEPARATOR, 0, 0); Index = libraryTypeMenu(this.libraryMenu, Index); this.libraryMenu.AppendTo(this.libOptMenu, MF_STRING, "Track Preference");
        Index = defaultMenu(this.menu, Index);

        idx = this.menu.TrackPopupMenu(x, y);
        if (idx >= 1 && idx <= Index) {
            let i = MenuMap[idx].value, rs;
            switch (MenuMap[idx].type) {
                case "Cancel": rad.cancel_iSelect(); break;
                case "New":
                    switch (true) {
                        case i < 4: index.get_radio(rn[i], ppt.radMode, i == 1 && ppt.radMode && !ppt.genre_tracks ? 4 : i, ppt.radMode ? ppt.lfm_variety : ppt.ec_variety, ppt.radRange); break;
                        case i > 3 && i < 8:
                            const rt = i - 4;
                            try {rs = utils.InputBox(window.ID, "Type Name Of " + ((rt == 0 || rt == 2) ? "Artist" : rt == 1 ? "Genre" : "Artist | Title"+ "\nUse Pipe Separator"), "Radio Type: " + (rt == 0 ? "Artist" : rt == 1 ? "Genre" : rt == 2 ? "Artist & Similar Artists" : "Similar Songs"), index.rad_source, true);} catch (e) {return;}
                            if (rs) index.get_radio(rs.titlecase(), ppt.radMode, rt == 1 && ppt.radMode && !ppt.genre_tracks ? 4 : rt, ppt.radMode ? ppt.lfm_variety : ppt.ec_variety, ppt.radRange);
                            break;
                        case i == 9:
                            let ns = utils.InputBox(window.ID, "Type Name Of Artist | Album\nUse Pipe Separator\nLoading May Take a Few Seconds...\nIf Load Fails Artist or Album Name Unrecognised\nTry Another...", "Album Search", "Artist | Album");
                            if (ns && ns != "Artist | Album") {
                                if (!ns.includes("|")) {fb.ShowPopupMessage("Artist | Album Not Recognised\n\nEnsure A Pipe Separator Is Used", "YouTube Track Manager"); break;}
                                ns = ns.split("|"); alb.dld = new Dld_album_tracks(); alb.track_source = ppt.pref_mb_tracks; const a = ns[0].titlecase().trim(), l = ns[1].titlecase().trim(); if (ml.alb) if (alb.library_test(a, l)) return; alb.dld.Execute(0, "", a, l);
                            }
                            break;
                    }
                    break;
                case "Favourites":
                    if (fav.stations.length && i < fav.stations.length) {index.get_radio(fav.stations[i].source.replace(" [Query - " + index.n[3] + index.nm[3] + "]", ""), ppt.radMode, fav.stations[i].type == 1 && ppt.radMode &&!ppt.genre_tracks && !fav.stations[i].query ? 4 : fav.stations[i].type, ppt.radMode ? ppt.lfm_variety : ppt.ec_variety, ppt.radRange, true, fav.stations[i].query);}
                    if (i == fav.stations.length + 1) fav.toggle_auto(index.rad_source);
                    if (!ppt.autoFav) {
                        if (i == fav.stations.length + 2) {fav.add_current_station(index.rad_source); break;}
                        if (i == fav.stations.length + 3) {fav.remove_current_station(get_source); break;}
                        if (i == fav.stations.length + 4) {const ns = $.WshShell.Popup("This Action Removes All Items From The List\n\nProceed?", 0, "Reset List", 1); if (ns == 1) {const fv = "No Favourites"; fav.save(fv);}}
                    }
                    break;
                case "Tracks": switch (i) {case 0: if (alb_playlist) lib.albums_playlist(a_n); break; case 1: rad.get_top50(t50_n, 1); break; case 2: rad.get_top50(a_t, 2); break; case 3: rad.get_top50(c_t, 3); break; case 4: rad.refresh_top50(pl_active); break;} break;
                case "TopTags":
                    if (!i) {
                        if (ppt.radMode == 3) {try {rs = utils.InputBox(window.ID, "Enter Media Library Query. Examples:\nRock\nGenre HAS Rock\n%rating% GREATER 3\nGenre IS Rock AND %Date% AFTER 1979 AND %Date% BEFORE 1990", "MySelect Radio Query Search", index.rad_source ? index.rad_source : "Enter Query", true);} catch (e) {return;}}
                        else {try {rs = utils.InputBox(window.ID, "Type Tag\n\nAny Valid Last.fm Tag Can Be Used, e.g. 2015, Rock etc", "Last.fm Tag Search", index.rad_source, true);} catch (e) {return;}}
                    } else {const tt_ind = i - 1; rs = (ppt.radMode != 3 ? t.TopTags[tt_ind] : t.TopGenre[tt_ind]);}
                    if (rs) index.get_radio(rs.titlecase(), ppt.radMode, ppt.genre_tracks || !i && ppt.radMode == 3 ? 1 : 4, ppt.radMode ? ppt.lfm_variety : ppt.ec_variety, ppt.radRange, false, !i && ppt.radMode == 3 ? true : false);
                    break;
                case "Variety":
                    switch (ppt.radMode) {
                        case 0: ppt.ec_variety = (i + 1) * 10; break;
                        default: const n = [125, 150, 200, 250]; i < 10 ? ppt.lfm_variety = (i + 1) * 10 : ppt.lfm_variety = n[i - 10]; break;
                    }
                    break;
                case "Hotness": ppt.radRange = i; break;
                case "RadioMode": if (ppt.useSaved && ppt.ecUseSaved) i = i - 1;  if (i < 3) {ppt.radMode = i + 1; ppt.softplaylist = false} else {ppt.radMode = 2; ppt.softplaylist = true;} lib.upd = true; break;
                case "TrackList": ppt.pref_mb_tracks = ppt.pref_mb_tracks == 1 ? 0 : 1; break;
                case "RadLib": ml.rad = ml.rad ? 0 : 1; ppt.useLibrary = "" + ml.alb + "," + ml.rad + "," + ml.top + ""; break; case "TopLib": ml.top = ml.top ? 0 : 1; ppt.useLibrary = "" + ml.alb + "," + ml.rad + "," + ml.top + ""; break;
                case "Album": if (ml.alb == i - 1) ml.alb = 0; else ml.alb = i - 1; pl.setExistingPl(); lib.update = true; ppt.useLibrary = "" + ml.alb + "," + ml.rad + "," + ml.top + ""; break;
                case "LibFilter": ppt.libFilterID = i; lib.upd = true; lib.update = true; break;
                case "Lib": ml.sort(i, true); lib.update = true; break;
                case "Library": ml.sort(i, true); lib.update = true; break;
                case "RadFilter": ppt.mySelFilterID = i; break;
                case "RadioOpt":
					switch (i) {	
						case 0: rad.toggle_auto(); t.paint(); break;
						case 1: ppt.removePlayed = !ppt.removePlayed; rad.limit = !ppt.removePlayed ? 0 : !p.v ? rad.stndLmt : rad.cusLmt; break;
					}
					break;
                case "Song": ppt.cur_pop = !ppt.cur_pop; break;
                case "Artist": ppt.randomArtist = !ppt.randomArtist; break;
                case "Genre": ppt.genre_tracks = !ppt.genre_tracks; break;
                case "Search": alb.chooseartist(); break;
                case "Playlists": plman.ActivePlaylist = i <= pl.enabled.length - 1 ? pl.enabled[i].ix : pl.menu[i - pl.enabled.length].ix; break;
				case "Mode":
					if (!ppt.btn_mode) {
						switch (i) {
							case 0: p.toggle('sbarShow'); break;
							case 1: ppt.smooth = !ppt.smooth; break;
							case 2: ppt.touchControl = !ppt.touchControl; break;
							case 3: ppt.dblClick = !ppt.dblClick; break;
							case 4: p.toggle('rowStripes'); break;
							case 5: but.resetZoom(); break;
							case 6: window.Reload(); break;
						}
					} else {
						switch (i) {	
							case 0: but.resetZoom(); break;
							case 1:window.Reload(); break;
						}
					}
					break;
                case "Theme":
					switch (true) {
						case (i < 4): ui.chgBlur(i); break;
						case (i == 4): ppt.covBlur = !ppt.covBlur, on_colours_changed(true); break;
						case (i == 5): {ppt.swapCol = !ppt.swapCol; on_colours_changed(true); break;}
					}
                    break;
                case "Image":
                    switch (i) {
                        case 0: ppt.imgSmoothTrans = !ppt.imgSmoothTrans; img.on_size(); break;
                        case 1: ppt.imgReflection = !ppt.imgReflection; img.on_size(); break;
                        case 2: ppt.imgBorder = ppt.imgBorder == 0 ? 1 : ppt.imgBorder == 1 ? 0 : ppt.imgBorder == 2 ? 3 : 2; img.create_images(); img.on_size(); break;
                        case 3: ppt.imgBorder = ppt.imgBorder == 0 ? 2 : ppt.imgBorder == 1 ? 3 : ppt.imgBorder == 2 ? 0 : 1; img.on_size(); break;
                    }
                    break;
                case "Nowplaying":
					switch (i) {
						case 0: rad.mbtn_up(x, y, 1); break;
						case 1: ppt.npShadow = !ppt.npShadow; t.repaint(); break;
						case 2: rad.mbtn_up(x, y, 2); break;
					}
				break;
				case "SavePlaylist":
					switch (i) {
						case 0: ppt.saveRadPlaylist = !ppt.saveRadPlaylist; break;
						case 1: ppt.savePlaylists = !ppt.savePlaylists; break;
					}
					break;
                case "Selection": ppt.focus = !ppt.focus; on_item_focus_change(); break;
                case "Blacklist":
                    if (!i) pl.love();
                    else if (i == 1) {
                            if (!list.blacklist[artis]) list.blacklist[artis] = []; if (title.length) list.blacklist[artis].push({"title":title,"id":v_id});
                            if (list.blacklist[artis]) s.sort(list.blacklist[artis], 'title'); s.save(fn, JSON.stringify(list), true);
                        }
                        else if (i == 2) blk.remove = !blk.remove;
                        else if (blk.undo[0] == artis && i == 3) {
                            if (!list.blacklist[blk.undo[0]]) list.blacklist[artis] = []; if (blk.undo[1].length) list.blacklist[blk.undo[0]].push({"title":blk.undo[1],"id":blk.undo[2]});
                            if (list.blacklist[artis]) s.sort(list.blacklist[artis], 'title'); s.save(fn, JSON.stringify(list), true); blk.undo = [];
                        } else {
                            const bl_ind = i - (blk.undo[0] == artis ? 4 : 3);
                            if (blk.remove) {
                                blk.undo = [artis, list.blacklist[artis][bl_ind].title, list.blacklist[artis][bl_ind].id]; list.blacklist[artis].splice(bl_ind, 1); blk.removeNulls(list);
                                if (list.blacklist[artis]) s.sort(list.blacklist[artis], 'title'); s.save(fn, JSON.stringify(list), true);
                            } else s.browser("https://www.youtube.com/results?search_query=" + encodeURIComponent(list.blacklist[artis][bl_ind].id));
                        }
                    break;
                case "Default": switch (i) {case 0: window.ShowProperties(); break; case 1: window.ShowConfigure(); break;} break;
            }
        }
    }
}

function on_char(code) {alb.on_char(code)}
function on_focus(is_focused) {alb.on_focus(is_focused);}
function on_library_items_added() {if (!lib) return; lib.upd = true; lib.update = true;}; function on_library_items_removed() {if (!lib) return; lib.upd = true; lib.update = true;}; function on_library_items_changed() {if (!lib) return; if ((s.playCountInstalled && ppt.sortType > 1) && (fb.PlaybackTime > 59 && fb.PlaybackTime < 65)) return; if (fb.IsPlaying) {const handle = fb.GetNowPlaying(); if (handle && handle.Path.slice(-7) == "!!.tags") return; /*!!.tags use mtags_mng due to m-TAGS/YouTube popup triggers*/} lib.upd = true; lib.update = true;}
function on_key_down(vkey) {alb.on_key_down(vkey); if (ui.np_graphic) img.on_key_down(vkey)}; function on_key_up(vkey) {alb.on_key_up(vkey);}
function on_mouse_lbtn_dblclk(x, y) {but.lbtn_dn(x, y); if (alb.scrollbar_type()) alb.scrollbar_type().lbtn_dblclk(x, y); if (!ppt.dblClick) return; if (ppt.touchControl) p.last_pressed_coord = {x: x, y: y}; p.click(x, y);}
function on_mouse_lbtn_down(x, y) {if (ppt.touchControl) p.last_pressed_coord = {x: x, y: y}; if (ui.np_graphic) img.lbtn_dn(x, y); but.lbtn_dn(x, y); alb.lbtn_dn(x, y); if (alb.scrollbar_type()) alb.scrollbar_type().lbtn_dn(x, y);}
function on_mouse_lbtn_up(x, y) {if (ui.np_graphic && img.touch.dn) {img.touch.dn = false; img.touch.start = x;}; alb_scrollbar.lbtn_drag_up(x, y); art_scrollbar.lbtn_drag_up(x, y); if (!ppt.dblClick && !but.Dn) p.click(x, y); but.lbtn_up(x, y); alb.lbtn_up(x, y); alb_scrollbar.lbtn_up(x, y); art_scrollbar.lbtn_up(x, y); p.clicked = false; }
function on_mouse_leave() {but.leave(); alb.leave(); alb_scrollbar.leave(); art_scrollbar.leave(); if (ui.np_graphic) img.leave(); }
function on_mouse_mbtn_down(x, y) {alb.mbtn_dn(x, y);}
function on_mouse_mbtn_up(x, y) {alb.load(x, y, true); rad.mbtn_up(x, y);}
function on_mouse_move(x, y) {if (p.m_x == x && p.m_y == y) return; p.m_x = x; p.m_y = y; but.move(x, y); alb.move(x, y); if (ui.np_graphic) img.move(x, y); if (!alb.scrollbar_type()) return; alb.scrollbar_type().move(x, y);}
function on_mouse_rbtn_up(x, y) {if (!alb.edit) men.rbtn_up(x, y); else alb.rbtn_up(x, y); return true;}
function on_mouse_wheel(step) {switch (utils.IsKeyPressed(0x11)) {case false: if (t.halt()) break; if (!ppt.showAlb && p.show_images) img.wheel(step); if (!ppt.showAlb && p.show_images || !alb.scrollbar_type()) break; alb.scrollbar_type().wheel(step, false); break; case true: but.wheel(step); ui.wheel(step); break;}}
function on_playback_time(pbt) {ml.on_playback_time(); if (!(pbt % 25)) timer.radio();}
function on_playlists_changed() {pl.playlists_changed();}
function on_playlist_items_added(pn) {
	const t50 = plman.GetPlaylistName(pn).startsWith(pl.t50_playlist) || plman.GetPlaylistName(pn).startsWith(pl.t40_playlist);
	if (Object.keys(yt_rad.start).length && (pn == pl.rad || t50)) {
		const handleList = plman.GetPlaylistItems(pn);
		handleList.Convert().forEach((h) => {
			let key = h.Path.slice(-11);
			if (yt_rad.start[key]) {
				yt_rad.loadTime.push(Date.now() - yt_rad.start[key]);
				delete yt_rad.start[key];
				if (yt_rad.loadTime.length > 10) yt_rad.loadTime.shift();
			}
		});
	}
	if (pn == pl.rad) rad.set_rad_selection(pn);
	if (plman.GetPlaylistName(pn).startsWith(pl.t50_playlist) || plman.GetPlaylistName(pn).startsWith(pl.t40_playlist)) rad.set_t50_selection(pn);
	on_item_focus_change(); if (pn == pl.alb) {if (!ppt.plmanAddloc && (!ml.alb || !ml.mtags_installed)) plman.SortByFormat(pn, "%album artist%|%album%|%tracknumber%|%title%", true); if (!lib) return; lib.get_album_metadb();}
}
function on_playlist_items_removed(pn) {on_item_focus_change(); if (pn == pl.alb) {if (!lib) return; lib.get_album_metadb();}}
function on_playlist_switch() {on_item_focus_change();}
function on_script_unload() {timer.clear(timer.img); timer.clear(timer.vid); if (p.videoMode && p.eval("%video_popup_status%") == "visible") fb.RunMainMenuCommand("View/Visualizations/Video"); but.on_script_unload();}
function RGB(r, g, b) {return 0xff000000 | r << 16 | g << 8 | b;}
function RGBA(r, g, b, a) {return a << 24 | r << 16 | g << 8 | b;}
function StringFormat() {
    const a = arguments, flags = 0; let h_align = 0, v_align = 0, trimming = 0;
    switch (a.length) {case 3: trimming = a[2]; case 2: v_align = a[1]; case 1: h_align = a[0]; break; default: return 0;}
    return (h_align << 28 | v_align << 24 | trimming << 20 | flags);
}

if (!ppt.get("SYSTEM.Software Notice Checked", false)) fb.ShowPopupMessage("THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS \"AS IS\" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE AUTHORS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.", "YouTube Track Manager"); ppt.set("SYSTEM.Software Notice Checked", true);
if (!ppt.get("SYSTEM.Playlist Check", false)) fb.ShowPopupMessage("The following playlists are used by default:\n\n\"Album\", \"Loved\" & \"Radio\".\n\nIf you already use any of these, change the ones used by YouTube Track Manager before using the script.\n\nTo do this, right click YouTube Track Manager, open panel properties, navigate to the \"Playlist: Names...\" entry. Change as required. Labels for Top50 & TopTracks playlists, etc, can also be changed.", "YouTube Track Manager"); ppt.set("SYSTEM.Playlist Check", true);