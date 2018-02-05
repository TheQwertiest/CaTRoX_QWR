// ==PREPROCESSOR==
// @name 'Common'
// @author 'Hta Message Box Control'
// ==/PREPROCESSOR==

g_script_list.push('Control_HtaGroupPresetsMngr.js');

/**
 * @param {number} x
 * @param {number} y
 * @param {Array<GroupingHandler.Settings.Group>} group_presets
 * @param {string} cur_group_name
 * @param {string} default_group_name
 * @param {function} on_finish_fn
 * @return {boolean}
 */
HtaWindow.group_presets_mngr = function(x, y, group_presets, cur_group_name, default_group_name, on_finish_fn) {
    var group_data_list_copy = _.cloneDeep(group_presets);
    _.find(group_data_list_copy, function (item) { return item.name === default_group_name; }).is_default = true;

    var style =
        '<style type="text/css">' +
        '<meta http-equiv="x-ua-compatible" content="IE=9"/>' +
        HtaWindow.styles.body +
        HtaWindow.styles.label +
        HtaWindow.styles.input +
        HtaWindow.styles.button +
        '     div { overflow: hidden; }' +
        '     span { display:block; overflow: hidden; padding-right:10px; }' +
        '     input[type="checkbox"] { display: inline; position: relative; width: 15px; border: 0; padding: 2px 1px;}' +
        '     input[type="checkbox"]:focus { border:1px solid #0078D7; padding: 1px 0;}' +
        '     input[type="checkbox"]:hover:focus { border:1px solid #0078D7; padding: 1px 0;}' +
        '     input[type="checkbox"]:hover { border:1px solid #000000; padding: 1px 0;}' +
        '     select { font:caption; border: 1px solid #646464; vertical-align: top; width: 100%; }' +
        '     .label_for_checkbox { float:left; margin-top: 1px; width: 60px }' +
        '     .cnt { margin: 10px; }' +
        '     .select_cnt { float: left; width: 230px; }' +
        '     .select_cnt_list { width: 200px; float: left; }' +
        '     .select_cnt_btn { width: 30px; margin-top: 40px; margin-left: 200px; position: relative; }' +
        '     .input_cnt {  }' +
        '     .input_cnt_block { margin-left: 20px; margin-bottom: 10px; }' +
        '     .input_cnt_block_checkbox { margin-bottom: 2px; }' +
        '     .normal_button { width: 70px; float: right; }' +
        '     .select_button { width: 98px; float: left; margin: 2px;}' +
        '     .move_button { width:25px; height:35px; float: left; }' +
        '     .button_ok { position: absolute; right:168px; bottom:8px; }' +
        '     .button_cancel { position: absolute; right:88px; bottom:8px; }' +
        '     .button_apply { position: absolute; right:8px; bottom:8px; }' +
        '</style>';

    var content =
        '<html>' +
        '<head>' +
        '   <meta http-equiv="x-ua-compatible" content="IE=9"/>' +
        style +
        '</head>' +
        '<body>' +
        '     <div class="cnt">' +
        '          <div class="select_cnt">' +
        '               <div class="select_cnt_list">' +
        '                    <select id="input_select" size="20">' + '</select>' +
        '                    <button class="select_button" id="btn_new" style="margin-top: 5px; margin-left: 0;" >New</button>' +
        '                    <button class="select_button" id="btn_update" style="margin-top: 5px; margin-right: 0;" >Update</button>' +
        '                    <button class="select_button" id="btn_remove" style="margin-left: 0;" >Remove</button>' +
        '                    <button class="select_button" id="btn_default" style="margin-right: 0;" >Make Default</button>' +
        '               </div>' +
        '               <div class="select_cnt_btn">' +
        '                    <button class="move_button" id="btn_up">&#9650</button>' +
        '                    <button class="move_button" id="btn_down">&#9660</button>' +
        '               </div>' +
        '          </div>' +
        '          <div class="input_cnt">' +
        '               <div class="input_cnt_block">' +
        '                    <label>Group Name:</label>' +
        '                    <span>' +
        '                    <input id="input_group_name"/>' +
        '                    </span>' +
        '               </div>' +
        '               <div class="input_cnt_block">' +
        '                    <label>Group Query:</label>' +
        '                    <span>' +
        '                    <input id="input_group_query"/>' +
        '                    </span>' +
        '               </div>' +
        '               <div class="input_cnt_block">' +
        '                    <label>Title Query:</label>' +
        '                    <span>' +
        '                    <input id="input_title_query"/>' +
        '                    </span>' +
        '               </div>' +
        '               <div class="input_cnt_block">' +
        '                    <label>Sub-title Query:</label>' +
        '                    <span>' +
        '                    <input id="input_sub_title_query"/>' +
        '                    </span>' +
        '               </div>' +
        '               <div class="input_cnt_block">' +
        '                    <label>Description:</label>' +
        '                    <span>' +
        '                    <input id="input_description"/>' +
        '                    </span>' +
        '               </div>' +
        '               <div class="input_cnt_block input_cnt_block_checkbox">' +
        '                    <label class="label_for_checkbox">Show Date:</label>' +
        '                    <span>' +
        '                    <input id="input_show_date" class="input_box" type="checkbox"/>' +
        '                    </span>' +
        '               </div>' +
        '               <div class="input_cnt_block input_cnt_block_checkbox">' +
        '                    <label class="label_for_checkbox">Show CD#:</label>' +
        '                    <span>' +
        '                    <input id="input_show_cd" class="input_box" type="checkbox"/>' +
        '                    </span>' +
        '               </div>' +
        '          </div>' +
        '     </div>' +
        '     <button class="normal_button button_ok" id="btn_ok">OK</button>' +
        '     <button class="normal_button button_cancel" id="btn_cancel">Cancel</button>' +
        '     <button class="normal_button button_apply" id="btn_apply">Apply</button>' +
        '</body>' +
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
        'innerBorder=no ';//+
    //'icon=\"' + fb.FoobarPath + 'foobar2000.exe' + '\"';

    var wnd = HtaWindow.manager.open(x, y, 650, 425, 'Foobar2000: Manage grouping presets', content, hta_features);
    if (!wnd) {
        return false;
    }

    function get_default_data(arr) {
        return _.find(arr, function (item) { return item.is_default; });
    }

    function populate_select(selected_idx) {
        var select = wnd.input_select;
        select.options.length = 0;

        group_data_list_copy.forEach(function (item, i) {
            var option = wnd.document.createElement('option');
            option.setAttribute('value', item.name);

            var text = item.name;
            if (item.is_default) {
                text += ' [default]'
            }
            option.appendChild(wnd.document.createTextNode(text));

            select.appendChild(option);
        });
        if (!_.isNil(selected_idx)) {
            select.selectedIndex = selected_idx;
        }
    }

    function populate_data() {
        var select = wnd.input_select;
        var cur_data = group_data_list_copy[select.selectedIndex];
        wnd.input_group_name.value = cur_data.name;
        wnd.input_group_query.value = cur_data.group_query;
        wnd.input_title_query.value = cur_data.title_query;
        wnd.input_sub_title_query.value = cur_data.sub_title_query;
        wnd.input_description.value = cur_data.description;
        wnd.input_show_cd.checked = cur_data.show_cd;
        wnd.input_show_date.checked = cur_data.show_date;
    }

    function move_array_element(array, from, to) {
        array.splice(to, 0, array.splice(from, 1)[0]);
    }

    wnd.input_select.onchange = populate_data;

    wnd.btn_default.onclick = function () {
        var select = wnd.input_select;
        get_default_data(group_data_list_copy).is_default = false;
        group_data_list_copy[select.selectedIndex].is_default = true;
        populate_select(select.selectedIndex);
    };

    wnd.btn_remove.onclick = function () {
        var select = wnd.input_select;
        if (select.options.length > 1) {
            group_data_list_copy.splice(select.selectedIndex, 1);
            if (!get_default_data(group_data_list_copy)) {
                group_data_list_copy[0].is_default = true;
            }

            populate_select(Math.max(0, select.selectedIndex - 1));
            populate_data();
        }
    };

    wnd.btn_new.onclick = function () {
        var select = wnd.input_select;

        var new_data = _.cloneDeep(group_data_list_copy[select.selectedIndex]);
        new_data.is_default = false;
        var new_name_idx = 2;
        while (_.find(group_data_list_copy, function (item) {return item.name === new_data.name + '(' + new_name_idx + ')';})) {
            ++new_name_idx;
        }
        new_data.name += '(' + new_name_idx + ')';

        group_data_list_copy.push(new_data);

        populate_select(group_data_list_copy.length - 1);
        populate_data();
    };

    wnd.btn_update.onclick = function () {
        var cur_data = group_data_list_copy[wnd.input_select.selectedIndex];
        cur_data.name = wnd.input_group_name.value;
        cur_data.group_query = wnd.input_group_query.value;
        cur_data.title_query = wnd.input_title_query.value;
        cur_data.sub_title_query = wnd.input_sub_title_query.value;
        cur_data.description = wnd.input_description.value;
        cur_data.show_cd = wnd.input_show_cd.checked;
        cur_data.show_date = wnd.input_show_date.checked;

        populate_select(wnd.input_select.selectedIndex);
    };

    wnd.btn_up.onclick = function () {
        var selected_idx = wnd.input_select.selectedIndex;
        if (!selected_idx) {
            return;
        }

        move_array_element(group_data_list_copy, selected_idx, selected_idx - 1);

        populate_select(selected_idx - 1);
    };

    wnd.btn_down.onclick = function () {
        var selected_idx = wnd.input_select.selectedIndex;
        if (selected_idx === wnd.input_select.options.length) {
            return;
        }

        move_array_element(group_data_list_copy, selected_idx, selected_idx + 1);

        populate_select(selected_idx + 1);
    };

    wnd.document.body.onbeforeunload = function () {
        HtaWindow.manager.close();
    };

    wnd.btn_cancel.onclick = function () {
        HtaWindow.manager.close();
    };

    wnd.btn_apply.onclick = function () {
        wnd.btn_update.onclick();

        var output_copy = _.cloneDeep(group_data_list_copy);
        var default_name = get_default_data(output_copy).name;
        var selected_name = output_copy[wnd.input_select.selectedIndex].name;
        output_copy.forEach(function (item) {
            delete item.is_default;
        });

        on_finish_fn([output_copy, selected_name, default_name]);
    };

    wnd.btn_ok.onclick = function () {
        wnd.btn_update.onclick();

        var default_name = get_default_data(group_data_list_copy).name;
        var selected_name = group_data_list_copy[wnd.input_select.selectedIndex].name;
        group_data_list_copy.forEach(function (item) {
            delete item.is_default;
        });

        HtaWindow.manager.close();
        on_finish_fn([group_data_list_copy, selected_name, default_name]);
    };

    wnd.btn_ok.focus();

    populate_select(_.findIndex(group_data_list_copy, function (item) { return item.name === cur_group_name; }));
    populate_data();
    wnd.document.body.focus();

    return true;
};
