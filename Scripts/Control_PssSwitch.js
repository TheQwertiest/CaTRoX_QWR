// ==PREPROCESSOR==
// @name "PSS Switch Control"
// @author "TheQwertiest"
// ==/PREPROCESSOR==

function PssSwitchClass() {
    this.get_state = function (state_name) {
        var states_list = state_name + "_states_list";
        var pathToState = settings_path + "\\" + state_name.toUpperCase() + "_";

        if (!this[states_list]) {
            fb.trace("No such state_name");
            error;
        }

        var state;
        _.forEach(this[states_list], function (item, i) {
            if (fso.FileExists(pathToState + i)) {
                state = item;
                return false;
            }
        });
        if (state) {
            return state;
        }

        fso.CreateTextFile(pathToState + "0", true);
        return this[states_list][0];
    };

    this.set_state = function (state_name, new_state) {
        var state = state_name + "_state";
        var states_list = state_name + "_states_list";
        var pathToState = settings_path + "\\" + state_name.toUpperCase() + "_";

        if (!common_vars[state]) {
            fb.trace("No such state_name");
            error;
        }

        var index = this[states_list].indexOf(common_vars[state]);
        var index_new = this[states_list].indexOf(new_state);

        if (index_new == -1) {
            fb.trace("No such state");
            error;
        }

        if (index != -1) {
            if (fso.FileExists(pathToState + index)) {
                fso.DeleteFile(pathToState + index);
            }
        }
        if (!fso.FileExists(pathToState + index_new)) {
            fso.CreateTextFile(pathToState + index_new, true);
        }

        common_vars[state] = new_state;
        window.NotifyOthers(state, new_state);
        refresh_pss();
    };

    this.minimode_states_list = ["Full", "Mini", "UltraMini"];
    this.spectrum_states_list = ["Hide", "Show"];
    this.incompatibility_states_list = ["NotNotified", "Notified"];

// private:
    function refresh_pss() {
        if (fb.IsPlaying || fb.IsPaused) {
            fb.RunMainMenuCommand("Playback/Play or Pause");
            fb.RunMainMenuCommand("Playback/Play or Pause");
        }
        else {
            fb.RunMainMenuCommand("Playback/Play");
            fb.RunMainMenuCommand("Playback/Stop");
        }
    }

    var settings_path = fb.FoobarPath + "themes\\" + g_theme_folder + "\\Settings";
    var fso = new ActiveXObject("Scripting.FileSystemObject");

    if (!fso.FolderExists(settings_path)) {
        fso.CreateFolder(settings_path);
    }
}

var pss_switch = new PssSwitchClass();

var common_vars =
    {
        minimode_state: pss_switch.get_state("minimode"),
        spectrum_state: pss_switch.get_state("spectrum"),
        incompatibility_state: pss_switch.get_state("incompatibility")
    };

// Example of use in a PSS :
// The first line set a panel stack global variable according to the panel current state, the second line switch the visibility of a panel named library, it show the panel when the current state is 3
// $set_ps_global(MAIN_PANEL_SWITCH,$right($findfile(themes/eole/Settings/MAINPANEL_*),1))
// $showpanel_c(library,$ifequal(%MAIN_PANEL_SWITCH%,3,1,0))