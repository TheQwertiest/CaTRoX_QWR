function create_hta_window(x, y, w, h, title, content, features) {
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
    while(!wnd && new Date().getTime() < now + 1000) {
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
}

function msg_box_multiple(prompt,title,defval,on_finish_fn) {
    var content, wnd;

    var val_count = prompt.length;

    var block_wrap_beg = "<div class='input_line'>";

    var prompt_wrap_beg = "<label for='a'>";
    var prompt_wrap_end = "</label>";

    var defval_wrap_beg1 = "<span><input id='input_val_";
    var defval_wrap_beg2 = "' type='text' value='";
    var defval_wrap_end = "'/></span>";

    var block_wrap_end = "</div>";

    var input_text = '';

    for (var i = 0; i < val_count; ++i) {
        input_text += block_wrap_beg + prompt_wrap_beg + prompt[i] + prompt_wrap_end + defval_wrap_beg1 + i + defval_wrap_beg2 + defval[i] + defval_wrap_end + block_wrap_end;
    }

    content =
        '<html>' +
        '<head>' +
        '<meta http-equiv="x-ua-compatible" content="IE=9"/>' +
        '<style type="text/css">' +
        'div { overflow: hidden; }' +
        'span { display: block; overflow: hidden; padding-right:10px; }' +
        'label { float:left; width: 80px; text-align: right; padding-right:7px; }' +
        'input { width: 100%; }' +
        'button { width: 75px; margin: 5px; padding: 3px; float: right; }' +
        '.input_line { padding-bottom:7px; }' +
        '</style>' +
        '</head>' +
        '<body background="buttonface">' +
        '<div>' +
        input_text +
        '<button id="hta_cancel">Cancel</button>' +
        '<button id="hta_ok">OK</button>' +
        '</div>' +
        '</body>' +
        '</html>';

    var hta_features =
        'border=dialog ' +
        'minimizeButton=no ' +
        'maximizeButton=no ' +
        'scroll=no ' +
        'showIntaskbar=yes ' +
        'contextMenu=yes ' +
        'selection=no ' +
        'innerBorder=no';
        //+ 'icon=\"' + fb.FoobarPath + '\\' + 'foobar2000.exe' + '\"';

    var window_h = 29 * val_count + 83;
    wnd = create_hta_window(100, 100, 370, window_h, title, content, hta_features);
    if (!wnd) {
        return false;
    }

    wnd.hta_ok.focus();

    wnd.document.body.onunload = function() {
        on_finish_fn([]);
    };

    wnd.hta_cancel.onclick = function() {
        wnd.close();
        on_finish_fn([]);
    };

    wnd.hta_ok.onclick = function() {
        var vals = [];
        for (var i = 0; i < val_count; ++i) {
            vals.push(wnd['input_val_' + i].value);
        }

        wnd.close();
        on_finish_fn(vals);
    };

    return true;
}
