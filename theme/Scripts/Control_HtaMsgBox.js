// ==PREPROCESSOR==
// @name 'Common'
// @author 'Hta Message Box Control'
// ==/PREPROCESSOR==

g_script_list.push('Control_HtaMsgBox.js');

var HtaWindow = {};

/**
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {string} title
 * @param {string} content
 * @param {string} features
 * @return {*}
 */
HtaWindow.create = function(x, y, w, h, title, content, features) {
    var hta_wnd_id = "a" + Math.floor(Math.random() * 10000000);
    var CodeForLinking = "<script>moveTo(-1000,-1000);resizeTo(0,0);</script>" +
        "<hta:application id=app " + features + " />" +
        "<object id=" + hta_wnd_id + " style='display:none' classid='clsid:8856F961-340A-11D0-A96B-00C04FD705A2'>" +
        "<param name=RegisterAsBrowser value=1>" +
        "</object>";

    var windows = app.Windows();
    WshShell.Run("mshta.exe \"about:" + CodeForLinking + "\"");

    var wnd;
    // Dirty hack to simulate sleep
    var now = new Date().getTime();
    while (!wnd && new Date().getTime() < now + 1000) {
        for (var i = windows.Count; --i >= 0;) {
            try {
                if (windows.Item(i).id === hta_wnd_id) {
                    wnd = windows.Item(i).parent.parentWindow;
                }
            }
            catch (e) {}
        }
    }
    if (!wnd) {
        return null;
    }

    wnd.document.open();
    wnd.Host = this;

    wnd.document.write([content,
        "<script language='JScript' id=\"a", hta_wnd_id, "\">" +
        "eval; " +
        "document.title=\"" + title + "\";" +
        "moveTo(", x || 0, ",", y || 0, "); " +
        "resizeTo(", w || 200, ",", h || 200, ");" +
        "document.getElementById(\"a", hta_wnd_id, "\").removeNode();" +
        "", "</script>"].join(""));

    return wnd;
};

HtaWindow.styles = {};

HtaWindow.styles.body = 'body { color: WindowText; background-color: Menu; }';

HtaWindow.styles.input =
    'input { font:caption; border: 1px solid #7A7A7A; width: 100%; }' +
    'input:focus { outline: none !important; border:1px solid #0078D7; }' +
    'input:hover:focus { outline: none !important; border:1px solid #0078D7; }' +
    'input:hover { outline: none !important; border:1px solid #000000; }';

HtaWindow.styles.label = 'label { font:caption; }';

HtaWindow.styles.button =
    'button { font:caption; background: #E1E1E1; color:ButtonText; border: 1px solid #ADADAD; margin: 5px; padding: 3px; width: 70px; }' +
    'button:focus { outline: none !important; border:2px solid #0078D7; padding: 2px; }' +
    'button:focus:hover { background: #e5f1fb; outline: none !important; border:2px solid #0078D7; padding: 2px; }' +
    'button:hover { background: #e5f1fb; outline: none !important; border:1px solid #0078D7; padding: 3px; }';

/**
 * @param {number} x
 * @param {number} y
 * @param {Array<string>} prompt
 * @param {string} title
 * @param {Array<string>} defval
 * @param {function} on_finish_fn
 * @return {boolean}
 */
HtaWindow.msg_box_multiple = function(x,y,prompt,title,defval,on_finish_fn) {
    if (prompt.length !== defval.length) {
        throw new ArgumentError('Prompts and default values', prompt.length + ' and ' + defval.length, 'Array sizes must be equal');
    }
    title = title.replace(/"/g, '\'');

    var val_count = prompt.length;
    var input_text = '';

    for (var i = 0; i < val_count; ++i) {
        input_text +=
            '<div class="input_line">' +
            '   <label>' + prompt[i] + '</label>' +
            '   <span>' +
            '       <input id="input_val_' + i + '" type="text" value="' +  defval[i] + '"/>' +
            '   </span>' +
            '</div>';
    }

    var content =
        '<html>' +
        '   <head>' +
        '   <meta http-equiv="x-ua-compatible" content="IE=9"/>' +
        '   <style type="text/css">' +
        HtaWindow.styles.body +
        HtaWindow.styles.label +
        HtaWindow.styles.input +
        HtaWindow.styles.button +
        '       div { overflow: hidden; }' +
        '       span { display: block; overflow: hidden; padding-right:10px; }' +
        '       label { float:left; width: 50px; text-align: right; padding-right:7px; padding-top: 2px; }' +
        '       button { float: right; }' +
        '       .input_line { padding-bottom:7px; }' +
        '   </style>' +
        '</head>' +
        '   <body>' +
        '       <div>' +
        input_text +
        '           <button id="hta_cancel">Cancel</button>' +
        '           <button id="hta_ok">OK</button>' +
        '       </div>' +
        '   </body>' +
        '</html>';

    var hta_features =
        'singleinstance=yes ' +
        'border=dialog ' +
        'minimizeButton=no ' +
        'maximizeButton=no ' +
        'scroll=no ' +
        'showintaskbar=yes ' +
        'contextMenu=yes ' +
        'selection=no ' +
        'innerBorder=no ';
    //'icon=\"' + fb.FoobarPath + 'foobar2000.exe' + '\"';

    var window_h = 29 * val_count + 83;
    var wnd = HtaWindow.manager.open(x, y, 370, window_h, title, content, hta_features);
    if (!wnd) {
        return false;
    }

    wnd.hta_ok.focus();

    wnd.document.body.onbeforeunload = function () {
        HtaWindow.manager.close();
    };

    wnd.hta_cancel.onclick = function () {
        HtaWindow.manager.close();
    };

    wnd.hta_ok.onclick = function () {
        var vals = [];
        for (var i = 0; i < val_count; ++i) {
            vals.push(wnd['input_val_' + i].value);
        }

        HtaWindow.manager.close();
        on_finish_fn(vals);
    };
    wnd.document.body.focus();

    return true;
};

HtaWindow.manager = new function() {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @param {string} title
     * @param {string} content
     * @param {string} features
     * @return {*}
     */
    this.open = function (x, y, w, h, title, content, features) {
        if (wnd) {
            wnd.focus();
            return wnd;
        }

        on_top = fb.AlwaysOnTop;
        if (fb.AlwaysOnTop) {
            fb.AlwaysOnTop = false;
        }
        wnd = HtaWindow.create(x, y, w, h, title, content, features);

        return wnd;
    };

    this.close = function () {
        if (wnd) {
            wnd.close();
            wnd = null;
            if (fb.AlwaysOnTop !== on_top) {
                fb.AlwaysOnTop = on_top;
            }
        }
    };

    var on_top;
    var wnd = null;
};

function on_script_unload() {
    HtaWindow.manager.close();
}
