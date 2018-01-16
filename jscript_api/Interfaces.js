/*
You can use console.log(something) to output variables/strings/properties to the
Console. It will be used in some examples below. Any parameters in [] are
optional and may be omitted.
*/

/**
 * @constructor
 */
function IFbUtils() {
    /** @type {boolean} */
    this.AlwaysOnTop = undefined; //(boolean) (read, write)
    /*
    Example:
    fb.AlwaysOnTop = !fb.AlwaysOnTop; // Toggles the current value.
    */

    /** @type {string} */
    this.ComponentPath = undefined; // (string) (read)
    /* 
    Example:
    console.log(fb.ComponentPath); // C:\Users\User\AppData\Roaming\foobar2000\user-components\foo_jscript_panel\
    */

    /** @type {boolean} */
    this.CursorFollowPlayback = undefined; // (boolean) (read, write)

    /** @type {string} */
    this.FoobarPath = undefined; // (string) (read)

    /** @type {boolean} */
    this.IsPaused = undefined; // (boolean) (read)

    /** @type {boolean} */
    this.IsPlaying = undefined; // (boolean) (read)

    /** @type {float} */
    this.PlaybackLength = undefined; // (double) (read)
    /*
    example1:
    console.log(fb.PlaybackLength); // 322.843414966166
    example2:
    console.log(Math.round(fb.PlaybackLength)); // 323
    */

    /** @type {boolean} */
    this.PlaybackFollowCursor = undefined; // (boolean) (read, write)

    /** @type {float} */
    this.PlaybackTime = undefined; // (double) (read, write)
    /*
    Example:
    fb.PlaybackTime = 60; // Jumps to the 1 minute mark.
    */

    /** @type {string} */
    this.ProfilePath = undefined; // (string) (read)

    /** @type {number} */
    this.ReplaygainMode = undefined; // (uint) (read, write)
    /*
    0 None
    1 Track
    2 Album
    3 Track/Album by Playback Order (only available in foobar2000 v1.3.8 and above)
    */

    /** @type {boolean} */
    this.StopAfterCurrent = undefined; // (boolean) (read, write)
    /*
    Example:
    fb.StopAfterCurrent = !fb.StopAfterCurrent; // Toggles the current value.
    */

    /** @type {float} */
    this.Volume = undefined; // (float) (read, write);
    /*
    Example:
    fb.Volume = 0; // Sets the volume to max. -100 is the minimum.
    */

    /**
     * @return {IFbUiSelectionHolder}
     */
    this.AcquireUiSelectionHolder = function () {}; // (IFbUiSelectionHolder)

    /**
     * @constructor
     */
    function IFbUiSelectionHolder() {

        this.Dispose = function () {}; // (void)

        /**
         * @param {IFbMetadbHandleList} handle_list
         */
        this.SetSelection = function (handle_list) {}; // (void)
        // sets the selected items.

        this.SetPlaylistSelectionTracking = function () {}; // (void)
        /*
        Sets selected items to playlist selection and enables tracking.
        When the playlist selection changes, the stored selection is automatically
        updated. Tracking ends when a set method is called on any ui_selection_holder
        or when the last reference to this ui_selection_holder is released.
        */

        this.SetPlaylistTracking = function () {}; // (void)
        /*
        Sets selected items to playlist contents and enables tracking.
        When the playlist selection changes, the stored selection is automatically
        updated. Tracking ends when a set method is called on any ui_selection_holder
        or when the last reference to this ui_selection_holder is released.
        */
    }

    /*
    This is typically used to update the selection used by the default UI artwork panel
    or any other panel that makes use of the preferences under
    File>Preferences>Display>Selection viewers. Use in conjunction with the on_focus
    callback. See callbacks.txt.
      

    Example1: (for playlist viewers)

    var selection_holder = fb.AcquireUiSelectionHolder();
    selection_holder.SetPlaylistSelectionTracking();

    function on_focus(is_focused) {
        if (is_focused) { //updates the selection when panel regains focus
            selection_holder = fb.AcquireUiSelectionHolder();
            selection_holder.SetPlaylistSelectionTracking();
        }
    }

    Example2: (for library viewers)

    var selection_holder = fb.AcquireUiSelectionHolder();
    var handle_list = null;

    function on_mouse_lbtn_down(x, y) { //presumably going to select something here...
        handle_list = ...;
        selection_holder.SetSelection(handle_list); //must be a valid handle list
    }

    function on_focus(is_focused) {
        if (is_focused) { //updates the selection when panel regains focus
            selection_holder = fb.AcquireUiSelectionHolder();
            if (handle_list && handle_list.Count)
                selection_holder.SetSelection(handle_list); //must be a valid handle list
        }
    }
 
    */

    this.AddDirectory = function () {}; // (void)

    this.AddFiles = function () {}; // (void)

    this.ClearPlaylist = function () {}; // (void)
    /*
    Clears active playlist. If you wish to clear a specific playlist, use plman.ClearPlaylist(playlistIndex).
    */

    /**
     * @return {IContextMenuManager}
     */
    this.CreateContextMenuManager = function () {}; // (IContextMenuManager)

    /**
     * @constructor
     */
    function IContextMenuManager() {
        // See samples\basic\MainMenuManager All-In-One, samples\basic\Menu Sample.txt

        /**
         * @param {IMenuObj} menuObj
         * @param {number} base_id
         * @param {number} max_id
         */
        this.BuildMenu = function (menuObj, base_id, max_id) {}; // (void)

        this.Dispose = function () {}; // (void)

        /**
         * @param {number} id
         * @return {boolean}
         */
        this.ExecuteByID = function (id) {}; // (boolean)

        /**
         * @param {IFbMetadbHandleList} handle_list
         */
        this.InitContext = function (handle_list) {}; // (void)

        this.InitNowPlaying = function () {}; // (void)
    }

    /**
     * @return {IFbMetadbHandleList}
     */
    this.CreateHandleList = function () {}; // (IFbMetadbHandleList)
    // Returns an empty handle list.

    /**
     * @return {IMainMenuManager}
     */
    this.CreateMainMenuManager = function () {}; // (IMainMenuManager)

    /**
     * @constructor
     */
    function IMainMenuManager() {
        // See samples\basic\MainMenuManager All-In-One, samples\basic\Menu Sample.txt

        /**
         * @param {IMenuObj} menuObj
         * @param {number} base_id
         * @param {number} count
         */
        this.BuildMenu = function (menuObj, base_id, count) {}; // (void)

        this.Dispose = function () {}; // (void)

        /**
         * @param {number} id
         * @return {boolean}
         */
        this.ExecuteByID = function (id) {}; // (boolean)

        this.Init = function (root_name) {}; // (void)
    }

    /**
     * @param {string=} name
     * @return {IFbProfiler}
     */
    this.CreateProfiler = function (name) {}; // (IFbProfiler) [name]

    /**
     * @constructor
     */
    function IFbProfiler() {

        /** @type {number} */
        this.Time = undefined; // (int) // milliseconds


        this.Reset = function () {}; // (void)
        this.Print = function () {}; // (void)
    }
    /*
    Example:
    var test = fb.CreateProfiler();
    // do something very time consuming
    console.log(test.Time);
    */

    this.Exit = function () {}; // (void)

    /**
     * @param {boolean=} [force=true]
     * @return {IFbMetadbHandle}
     */
    this.GetFocusItem = function (force) {}; // (IFbMetadbHandle) [force]    
    /*
    force: boolean, default true.
    When true, it will use the first item of the active playlist if it is unable to get the focus item.
    */

    /**
     * @return {IFbMetadbHandleList}
     */
    this.GetLibraryItems = function () {}; // (IFbMetadbHandleList)
    // Returns all Media Library items as a handle list.

    /**
     * @param {IFbMetadbHandle} handle
     * @return {string}
     */
    this.GetLibraryRelativePath = function (handle) {}; // (string)
    /*
    Returns an empty string when used on track not in Media Library

    Example:
    The foobar2000 Media Library is configured to watch "D:\Music" and the
    path of the now playing item is "D:\Music\Albums\Artist\Some Album\Some Song.flac"

    var handle = fb.GetNowPlaying();
    console.log(fb.GetLibraryRelativePath(handle)); // Albums\Artist\Some Album\Some Song.flac

    NOTE: If you intend to loop through a large handle list and you have no control over what is
    happening in the background, consider using try/catch as errors may occur if the Media Library
    settings/content changes.
    */

    /**
     * @return {IFbMetadbHandle}
     */
    this.GetNowPlaying = function () {}; // (IFbMetadbHandle)
    // Get handle of now playing item.

    /**
     * @param {IFbMetadbHandleList} handle_list
     * @param {string} query
     * @return {IFbMetadbHandleList}
     */
    this.GetQueryItems = function (handle_list, query) {}; // (IFbMetadbHandleList)
    /*
    Example1:
    var a = fb.GetQueryItems(plman.GetPlaylistItems(plman.ActivePlaylist), "rating IS 5");
    Example2:
    var b = fb.GetQueryItems(fb.GetLibraryItems(), "rating IS 5");
    Results are unsorted.

    NOTE: Use try/catch to handle invalid queries. An empty handle list will be returned if the query
    is valid but there are no results.
    */

    /**
     * @return {IFbMetadbHandle}
     */
    this.GetSelection = function () {}; // (IFbMetadbHandle)
    /*
    Gets now playing or selected item. What you get will depend on
    "File>Preferences>Display>Selection viewers".
    The return value may be null.
    */

    /**
     * @param {number=} [flags=0]
     * @return {IFbMetadbHandleList}
     */
    this.GetSelections = function (flags) {}; // (IFbMetadbHandleList) //[flags]
    /*
    flags: 0 default, 1 no now playing
    Works like GetSelection(), but returns a handle list.
    Always returns a valid handle list instance instead of null.
    */

    /**
     * @return {number}
     */
    this.GetSelectionType = function () {}; // (uint)
    /*
    Retrieve what the selection is
    0 undefined (no item)
    1 active_playlist_selection
    2 caller_active_playlist
    3 playlist_manager
    4 now_playing
    5 keyboard_shortcut_list
    6 media_library_viewer
    */

    /**
     * @return {boolean}
     */
    this.IsLibraryEnabled = function () {}; // (boolean)

    /**
     * @param {IFbMetadbHandle} handle
     * @return {boolean}
     */
    this.IsMetadbInMediaLibrary = function (handle) {}; // (boolean)
    /*
    Example:
    var np = fb.GetNowplaying();
    console.log(fb.IsMetadbInMediaLibrary(np)); // If false, playing track is not in Media Library.
    */

    this.LoadPlaylist = function () {}; // (void)

    this.Next = function () {}; // (void)

    this.Pause = function () {}; // (void)

    this.Play = function () {}; // (void)

    this.PlayOrPause = function () {}; // (void)

    this.Stop = function () {}; // (void)

    this.Prev = function () {}; // (void)

    this.Random = function () {}; // (void)

    /**
     * @param {string} command
     * @param {number=} [flags=0]
     * @return {boolean}
     */
    this.RunContextCommand = function (command, flags) {}; // (boolean) [, flags]
    /*
    Now playing file only.
    flags:
    0 default (depends on whether SHIFT key is pressed, flag_view_reduced or flag_view_full is selected)
    4 flag_view_reduced
    8 flag_view_full. This can be useful if you need to run context commands the user may have hidden
    using File>Preferences>Display>Context Menu
    Example:
    fb.RunContextCommand("Properties");
    */

    /**
     * @param {string} command
     * @param {IFbMetadbHandle|IFbMetadbHandleList} handle_or_handle_list
     * @param {number=} flags
     * @return {boolean}
     */
    this.RunContextCommandWithMetadb = function (command, handle_or_handle_list, flags) {}; // (boolean) [, flags]
    // Same flags as fb.RunContextCommand. handle_or_handle_list can be something like fb.GetFocusItem()
    // or plman.GetPlaylistSelectedItems(plman.ActivePlaylist)

    /**
     * @param {string} command
     * @return {boolean}
     */
    this.RunMainMenuCommand = function (command) {}; // (boolean)
    /*
    Example:
    fb.RunMainMenuCommand("File/Add Location...");
    */

    /**
     * @param {string} command
     * @return {boolean}
     */
    this.IsMainMenuCommandChecked = function (command) {}; // (boolean)

    this.SavePlaylist = function () {}; // (void)

    this.ShowConsole = function () {}; // (void)

    /**
     * @param {string} query
     */
    this.ShowLibrarySearchUI = function (query) {}; // (void)
    // Opens the Library>Search window populated with the query you set.

    /**
     * @param {string} msg
     * @param {string=} [title='JScript Panel']
     * @param {number=} [iconid=0]
     */
    this.ShowPopupMessage = function (msg, title, iconid) {}; // (void) [, title][, iconid]
    /*
    title: default "JScript Panel"
    iconid: default 0. See flags.txt > IconId
    */

    this.ShowPreferences = function () {}; // (void)

    /**
     * @param {string} expression
     * @return {IFbTitleFormat}
     */
    this.TitleFormat = function (expression) {}; // (IFbTitleFormat)

    /**
     * @constructor
     */
    function IFbTitleFormat() {
        /*
        This will be used in the examples below:
        var tfo = fb.TitleFormat("%artist%");
        */

        this.Dispose = function () {}; //
        // Example: tfo.Dispose();

        /**
         * @param {boolean=} [force=false]
         * @return {string}
         */
        this.Eval = function (force) {}; // [force]
        /*
        force: boolean, default false.
        If true, you can process text that doesn't contain
        title formatting even when foobar2000 isn't playing. When playing, you
        should always get a result.

        Always use Eval when you want dynamic info such as %playback_time%, %bitrate% etc.
        EvalWithMetadb(fb.GetNowplaying()) will not give the results you want.
        Example:
        console.log(tfo.Eval());
        */

        /**
         * @param {IFbMetadbHandle} handle
         * @return {string}
         */
        this.EvalWithMetadb = function (handle) {}; //
        /*
        Example:
        console.log(tfo.EvalWithMetadb(fb.GetFocusItem()));
        */
    }

    this.VolumeDown = function () {}; // (void)

    this.VolumeMute = function () {}; // (void)

    this.VolumeUp = function () {}; // (void)
}
var fb = new IFbUtils();

/**
 * @constructor
 */
function IGdiUtils() {

    /**
     * @param {number} w
     * @param {number} h
     * @return {IGdiBitmap}
     */
    this.CreateImage = function (w, h) {}; // (IGdiBitmap)
    
    /**
     * @param {string} name
     * @param {number} size_px
     * @param {number=} [style=0]
     * @return {IGdiFont}
     */
    this.Font = function (name, size_px, style) {}; // (IGdiFont) [, style]
    /*
    size_px: See helpers.txt > Point2Pixel function for conversions.
    style: default 0. See flags.txt > FontStyle
    */
    
    /**
     * @param {string} path
     * @return {IGdiBitmap}
     */
    this.Image = function (path) {}; // (IGdiBitmap)
    // Example: var img = "e:\\images folder\\my_image.png";    

    /**
     * @param {number} window_id
     * @param {string} path
     * @return {number}
     */
    this.LoadImageAsync = function (window_id, path) {}; // (uint)
    /*
    window_id: window.ID
    Returns a unqiue id.
    */
}
var gdi = new IGdiUtils();

/**
 * @constructor
 */
function IFbPlaylistManager() {

    /** @type {number} */
    this.ActivePlaylist = undefined; // (uint) (read, write)
    /*
    Example1: 
    console.log(plman.ActivePlaylist); // Returns -1 if there is no active playlist.
    Example2:
    plman.ActivePlaylist = 1; // Switches to 2nd playlist.          
    */

    /** @type {number} */
    this.PlaybackOrder = undefined; // (uint) (read, write)
    /*
    0 Default
    1 Repeat (Playlist)
    2 Repeat (Track)
    3 Random
    4 Shuffle (tracks)
    5 Shuffle (albums)
    6 Shuffle (folders)    
    */

    /** @type {number} */
    this.PlayingPlaylist = undefined; // (uint) (read, write)
    /*
    Example: 
    console.log(plman.PlayingPlaylist); // Returns -1 if there is no playing playlist
    */

    /** @type {number} */
    this.PlaylistCount = undefined; // (uint) (read)

    /**
     * @param {number} playlistIndex
     * @return {number}
     */
    this.PlaylistItemCount = function (playlistIndex) {}; // (uint) (read)
    /*
    Example:
    console.log(plman.PlaylistItemCount(plman.PlayingPlaylist)); // 12
    */

    /** @type {IFbPlaylistRecyclerManager} */
    this.PlaylistRecyclerManager = undefined; // (IFbPlaylistRecyclerManager) (read)

    /**
     * @constructor
     */
    function PlaylistRecyclerManager() {

        /** @type {number} */
        this.Count = undefined; // (uint) (read)

        /**
         * @param {number} index
         * @return {string}
         */
        this.Name = function (index) {}; // (string) (read)

        /**
         * @param {number} index
         * @return {IFbMetadbHandleList}
         */
        this.Content = function (index) {}; // (IFbMetadbHandleList) (read)

        /**
         * @param {number} affectedItems
         */
        this.Purge = function (affectedItems) {}; // (void)
        // affectedItems: array like [1, 3, 5]

        /**
         * @param {number} index
         */
        this.Restore = function (index) {}; // (void)
    }

    /**
     * @param {number} playlistIndex
     * @param {Array<string>} paths
     * @param {boolean=} [select=false]
     */
    this.AddLocations = function (playlistIndex, paths, select) {}; // (void) [, select]
    /*
    paths: An array of files/URLs
    select: boolean, default false
    Example:
    plman.AddLocations(plman.ActivePlaylist, ["e:\\1.mp3"]);
    This operation is asynchronous and may take some time to complete if it's a large array.
    */

    /**
     * @param {number} playlistIndex
     */
    this.ClearPlaylist = function (playlistIndex) {}; // (void)
    /*
    Example:
    plman.ClearPlaylist(plman.PlayingPlaylist);
    */

    /**
     * @param {number} playlistIndex
     */
    this.ClearPlaylistSelection = function (playlistIndex) {}; // (void)
    /*
    Example:
    plman.ClearPlaylistSelection(plman.ActivePlaylist);
    */

    /**
     * @param {number} playlistIndex
     * @param {string} name
     * @param {string} query
     * @param {string=} [sort='']
     * @param {number=} [flags=0]
     * @return {number}
     */
    this.CreateAutoPlaylist = function (playlistIndex, name, query, sort, flags) {}; // (uint) [, sort][, flags]
    /*
    name: a name for the new Autplaylist
    query: a valid query
    sort: default "". title formatting pattern.
    flags: default 0, use 1 to force sort
    Returns -1 on failure
    */

    /**
     * @param {number} playlistIndex
     * @param {string} name
     * @return {number}
     */
    this.CreatePlaylist = function (playlistIndex, name) {}; // (uint)
    /*
    Example1:
    plman.CreatePlaylist(0, "");
    Creates a new playlist first in the list and it will be named "New playlist"
    Numbers will be appended to the end for each new un-named playlist
    Example2:
    plman.CreatePlaylist(plman.PlaylistCount, "my favourites");
    This will be added at the end of the current playlists.
    */

    /**
     * @param {number} playlistIndex
     * @param {string} name
     * @return {number}
     */
    this.DuplicatePlaylist = function (playlistIndex, name) {}; // (uint)
    /*
    name: a name for the new playlist. If name is "", the name of the source playlist is used.
    The duplicate playlist gets inserted directly after the source playlistIndex.
    It only duplicates playlist content, not the properties of the playlist eg. Autoplaylist
    */

    /**
     * @param {number} playlistIndex
     * @param {number} playlistItemIndex
     */
    this.EnsurePlaylistItemVisible = function (playlistIndex, playlistItemIndex) {}; // (void)

    /**
     * @param {number} playlistIndex
     * @param {number} playlistItemIndex
     * @return {boolean}
     */
    this.ExecutePlaylistDefaultAction = function (playlistIndex, playlistItemIndex) {}; // (boolean)
    // Starts playback by executing default doubleclick/enter action unless overridden by a lock to do something else.

    /**
     * @return {IFbPlayingItemLocation}
     */
    this.GetPlayingItemLocation = function () {}; // (IFbPlayingItemLocation)
    /*
    Retrieves playlist position of currently playing item.
    On failure, the property "IsValid" of IFbPlayingItemLocation interface will be set to false.
    */

    /**
     * @constructor
     */
    function IFbPlayingItemLocation() {

        /** @type {boolean} */
        this.IsValid = undefined; // (boolean) (read)
        /** @type {number} */
        this.PlaylistIndex = undefined; // (uint) (read)
        /** @type {number} */
        this.PlaylistItemIndex = undefined; // (uint) (read)
    }
    /*
    Example:
    var playing_item_location = plman.GetPlayingItemLocation();
    if (playing_item_location.IsValid) {
        console.log(playing_item_location.PlaylistIndex);
        console.log(playing_item_location.PlaylistItemIndex);
    }
    */

    /**
     * @param {number} playlistIndex
     * @return {number}
     */
    this.GetPlaylistFocusItemIndex = function (playlistIndex) {}; // (int)
    /*
    Example:
    var focus_item_index = plman.GetPlaylistFocusItemIndex(plman.ActivePlaylist); // 0 first item
    Returns -1 if nothing is selected
    */                                                   

    /**
     * @param {number} playlistIndex
     * @return {IFbMetadbHandleList}
     */
    this.GetPlaylistItems = function (playlistIndex) {}; // (IFbMetadbHandleList)
    /*
    Example:
    var handle_list = plman.GetPlaylistItems(plman.PlayingPlaylist);
    */

    /**
     * @param {number} playlistIndex
     * @return {string}
     */
    this.GetPlaylistName = function (playlistIndex) {}; // (string)
    /*
    Example:
    console.log(plman.GetPlaylistName(plman.ActivePlaylist));
    */

    /**
     * @param {number} playlistIndex
     * @return {IFbMetadbHandleList}
     */
    this.GetPlaylistSelectedItems = function (playlistIndex) {}; // (IFbMetadbHandleList)
    /*
    Example:
    var selected_items = plman.GetPlaylistSelectedItems(plman.ActivePlaylist);
    */

    /**
     * @param {number} playlistIndex
     * @param {number} base
     * @param {IFbMetadbHandleList} handle_list
     * @param {boolean=} [select=false]
     * @return {number}
     */
    this.InsertPlaylistItems = function (playlistIndex, base, handle_list, select) {}; // (uint) [, select]
    /*
    base: position in playlist
    handle_list: items to insert
    select: boolean, default false.

    example1:
    var ap = plman.ActivePlaylist;
    plman.InsertPlaylistItems(ap, 0, fb.GetLibraryItems());
    Adds all library tracks to beginning of playlist.

    example2:
    var ap = plman.ActivePlaylist;
    plman.InsertPlaylistItems(ap, plman.PlaylistItemCount(ap), fb.GetLibraryItems());
    Adds all library tracks to end of playlist.
    */

    /**
     * @param {number} playlistIndex
     * @param {number} base
     * @param {IFbMetadbHandleList} handle_list
     * @param {boolean=} [select=false]
     * @return {number}
     */
    this.InsertPlaylistItemsFilter = function (playlistIndex, base, handle_list, select) {}; // (uint) select = false
    /*
    Same as above except any duplicates contained in handle_list are removed.
    */                                                                       

    /**
     * @param {number} playlistIndex
     * @return {boolean}
     */
    this.IsAutoPlaylist = function (playlistIndex) {}; // (boolean)

    /**
     * @param {number} playlistIndex
     * @param {number} playlistItemIndex
     * @return {number}
     */
    this.IsPlaylistItemSelected = function (playlistIndex, playlistItemIndex) {}; // (boolean) actually it's number....
    // returns true/false

    /**
     * @param {number} playlistIndex
     * @return {boolean}
     */
    this.IsPlaylistLocked = function (playlistIndex) {}; // (boolean)
    /*
    NOTE: This returns true if the playlist is an autoplaylist. To determine if a playlist is not an autoplaylist
    but locked with something like foo_utils or foo_playlist_attributes, do something like...

    if (!plman.IsAutoPlaylist(plman.ActivePlaylist) && plman.IsPlaylistLocked(plman.ActivePlaylist)) {
        blah();
    }
    */

    /**
     * @param {number} from
     * @param {number} to
     * @return {boolean}
     */
    this.MovePlaylist = function (from, to) {}; // (boolean)

    /**
     * @param {number} playlistIndex
     * @param {number} delta
     * @return {boolean}
     */
    this.MovePlaylistSelection = function (playlistIndex, delta) {}; // (boolean)
    /*
    Example:
    plman.MovePlaylistSelection(plman.ActivePlaylist, plman.PlaylistItemCount(plman.ActivePlaylist));
    Moves selected items to end of playlist.
    */

    /**
     * @param {number} playlistIndex
     * @return {boolean}
     */
    this.RemovePlaylist = function (playlistIndex) {}; // (boolean)

    /**
     * @param {number} playlistIndex
     * @param {boolean=} [crop=false]
     */
    this.RemovePlaylistSelection = function (playlistIndex, crop) {}; // (void) [, crop]
    /*
    crop: boolean, default false.
    Example1:
    plman.RemovePlaylistSelection(plman.ActivePlaylist);
    Removes selected items from playlist.
    Example2:
    plman.RemovePlaylistSelection(plman.ActivePlaylist, true);
    Removes items that are NOT selected.
    */

    /**
     * @param {number} playlistIndex
     * @param {string} name
     * @return {boolean}
     */
    this.RenamePlaylist = function (playlistIndex, name) {}; // (boolean)

    this.SetActivePlaylistContext = function () {}; // (void)
    // Workaround so you can run fb.RunMainMenuCommand() on the Edit menu when the playlist doesn't have focus.

    /**
     * @param {number} playlistIndex
     * @param {number} playlistItemIndex
     */
    this.SetPlaylistFocusItem = function (playlistIndex, playlistItemIndex) {}; // (void)
    /*
    Example:
    plman.SetPlaylistFocusItem(plman.ActivePlaylist, 0);
    */

    /**
     * @param {number} playlistIndex
     * @param {IFbMetadbHandle} handle
     */
    this.SetPlaylistFocusItemByHandle = function (playlistIndex, handle) {}; // (void)
    /*
    Example:
    var ap = plman.ActivePlaylist;
    var handle = plman.GetPlaylistItems(ap).Item(1); //2nd item in playlist
    plman.SetPlaylistFocusItemByHandle(ap, handle);
    */

    /**
     * @param {number} playlistIndex
     * @param {Array<number>} affectedItems
     * @param {boolean} state
     */
    this.SetPlaylistSelection = function (playlistIndex, affectedItems, state) {}; // (void)
    /*
    affectedItems: An array of item indexes.
    state: boolean.
    Example:
    plman.SetPlaylistSelection(plman.ActivePlaylist, [0, 2, 4], true);
    Selects tracks first, third and fifth tracks in playlist. This does not affect other selected items.
    */

    /**
     * @param {number} playlistIndex
     * @param {number} playlistItemIndex
     * @param {boolean} state
     */
    this.SetPlaylistSelectionSingle = function (playlistIndex, playlistItemIndex, state) {}; // (void)
    /*
    state: boolean
    Example1:
    plman.SetPlaylistSelectionSingle(plman.ActivePlaylist, 0, false);
    Deselects first playlist item. Only works when it is already selected!
    Example2:
    var ap = plman.ActivePlaylist;
    plman.SetPlaylistSelectionSingle(ap, plman.PlaylistItemCount(ap) - 1, true);
    Selects last item in playlist. This does not affect other selected items.
    */

    /**
     * @param {number} playlistIndex
     * @return {boolean}
     */
    this.ShowAutoPlaylistUI = function (playlistIndex) {}; // (boolean)
    /*
    Shows popup window letting you edit certain Autoplaylist properties.
    Example: fb.ShowAutoPlaylistUI(plman.ActivePlaylist);
    Before using, check if your playlist is an Autoplaylist by using plman.IsAutoPlaylist(...);
    */

    /**
     * @param {number} playlistIndex
     * @param {string} pattern
     * @param {boolean=} [selected_items_only=false]
     * @return {boolean}
     */
    this.SortByFormat = function (playlistIndex, pattern, selected_items_only) {}; // (boolean) [, selected_items_only]
    /*
    playlistIndex: index of playlist to alter.
    pattern: title formatting pattern to sort by. set to "" to randomise the order of items.
    selected_items_only: boolean, default false.
    Returns true on success, false on failure (playlist locked etc).
    */

    /**
     * @param {number} playlistIndex
     * @param {string} pattern
     * @param {number=} [direction=1]
     * @return {boolean}
     */
    this.SortByFormatV2 = function (playlistIndex, pattern, direction) {}; // (boolean) [, direction]
    /*
    pattern: title formatting pattern
    direction: default 1 (ascending), -1 (descending).
    */

    /**
     * @param {number} playlistIndex
     */
    this.UndoBackup = function (playlistIndex) {}; // (void)
    // Call before using other plman methods that add/remove/reorder playlist items so a history will be available from the Edit menu.

    /**
     * @param {IFbMetadbHandle} handle
     */
    this.AddItemToPlaybackQueue = function (handle) {}; // (void)

    /**
     * @param {number} playlistIndex
     * @param {number} playlistItemIndex
     */
    this.AddPlaylistItemToPlaybackQueue = function (playlistIndex, playlistItemIndex) {}; // (void)

    /**
     * @param {IFbMetadbHandle} handle
     * @param {number} playlistIndex
     * @param {number} playlistItemIndex
     * @return {number}
     */
    this.FindPlaybackQueueItemIndex = function (handle, playlistIndex, playlistItemIndex) {}; // (int)
    // returns -1 on failure

    this.FlushPlaybackQueue = function () {}; // (void)

    /*
     * @return {IFbMetadbHandleList}
     */
    this.GetPlaybackQueueHandles = function() {}; // ((IFbMetadbHandleList))
    /*
    var handles = plman.GetPlaybackQueueHandles();
    if (handles.Count > 0) {
        // removes the need for plman.GetPlaybackQueueCount() and plman.IsPlaybackQueueActive()
    }
    */
    
    /**
     * @param {number} index
     */
    this.RemoveItemFromPlaybackQueue = function(index) {}; // (void)

    /**
     * @param {Array<number>} affectedItems
     */
    this.RemoveItemsFromPlaybackQueue = function (affectedItems) {}; // (void)
    // affectedItems: array like [1, 3, 5]
}
var plman = new IFbPlaylistManager();

/**
 * @constructor
 */
function IJSConsole() {
    /** @param {...*} var_args */
	this.log = function(var_args) {}; // (void)
}
var console = new IJSConsole();

/**
 * @constructor
 */
function IJSUtils() {

    /** @type {number} */
    this.Version = undefined; // (uint) (read)
    /* new in v1.2.0. returns a 4 digit number corresponding to the version

    v1.2.0 -> 1200
    v1.2.1 -> 1210

    If you try and access this in older components where it doesn't exist, the script will
    crash so you can do a check like this.

    if (!("Version" in utils)) {
        fb.ShowPopupMessage("Current component version is less than v1.2.0. This script requires vX.X.X");
    } else {
        //check the actual version
    }
    */

    /**
     * @param {string} name
     * @param {boolean=} [is_dll=true]
     * @return {boolean}
     */
    /*
    is_dll: boolean, default false.
    If true, method checks filename as well as the internal name.
    Example:
    console.log(utils.CheckComponent("foo_playcount", true));
    */

    /**
     * @param {string} name
     * @return {boolean}
     */
    this.CheckFont = function (name) {}; // (boolean)
    // name: Can be either in English or the localised name in your OS.

    /**
     * @param {number} window_id
     * @param {number} default_colour
     * @return {number}
     */
    this.ColourPicker = function (window_id, default_colour) {}; // (int)
    /*
    Spawns a windows popup dialog to let you choose a colour.
    window_id: window.ID
    Example:
    var colour = utils.ColourPicker(window.ID, RGB(255, 0, 0));
    See docs\helpers.txt for RGB function.
    */

    /**
     * @param {string} path
     * @param {string} mode
     * @return {*}
     */
    this.FileTest = function (path, mode) {}; // (VARIANT)
    /*
    mode:
    "chardet"
    Guess the charset of a file and return the codepage. It may not be accurate and returns 0 if an error occurred.
    "e"
    Tf path exists, return true
    "s"
    Retrieve file size, in bytes
    "d"
    If path is a directory, return true
    "split"
    Returns a VBArray so you need to use .toArray() on the result.
    Example:
    var arr = utils.FileTest("D:\\Somdir\\Somefile.txt", "split").toArray();
    arr[0] <= "D:\\Somedir\\" (always includes backslash at the end)
    arr[1] <= "Somefile"
    arr[2] <= ".txt"
    */

    /**
     * @param {number} seconds
     * @return {string}
     */
    this.FormatDuration = function (seconds) {}; // (string)
    /*
    Example:
    console.log(utils.FormatDuration(plman.GetPlaylistItems(plman.ActivePlaylist).CalcTotalDuration())); // 1wk 1d 17:25:30
    */

    /**
     * @param {number} bytes
     * @return {string}
     */
    this.FormatFileSize = function (bytes) {}; // (string)
    /*
    Example:
    console.log(utils.FormatFileSize(plman.GetPlaylistItems(plman.ActivePlaylist).CalcTotalSize())); // 7.9 GB
    */

    /**
     * @param {number} window_id
     * @param {IFbMetadbHandle} handle
     * @param {number=} [art_id=0]
     * @param {boolean=} [need_stub=true]
     * @param {boolean=} [only_embed=false]
     * @param {boolean=} [no_load=false]
     * @return {number}
     */
    this.GetAlbumArtAsync = function (window_id, handle, art_id, need_stub, only_embed, no_load) {}; // (uint) [, art_id][, need_stub][, only_embed][, no_load]
    /*
    window_id: window.ID
    art_id: default 0. See flags.txt > AlbumArtId
    need_stub: boolean, default true
    only_embed: boolean, default false
    no_load: boolean, default false. If true, "image" parameter will be null in on_get_album_art_done callback.
    See samples\basic\GetAlbumArtAsync.txt
    */

    /**
     *
     * @param {string} rawpath
     * @param {number=} [art_id=0]
     * @return {IGdiBitmap}
     */
    this.GetAlbumArtEmbedded = function (rawpath, art_id) {}; // (IGdiBitmap) [, art_id]
    /*
    art_id: default 0.
    See flags.txt > AlbumArtId
    Example:
    var img = utils.GetAlbumArtEmbedded(fb.GetNowPlaying().RawPath, 0);
    */

    /**
     * @param {number} window_id
     * @param {IFbMetadbHandle} handle
     * @param {number=} [art_id=0]
     * @param {boolean=} [need_stub=true]
     * @return {IGdiBitmap}
     */
    this.GetAlbumArtV2 = function (handle, art_id, need_stub) {}; // (IGdiBitmap) [, art_id][, need_stub]
     /*
    art_id: default 0.
    See flags.txt > AlbumArtId
    need stub: boolean, default true.
    See samples\basic\GetAlbumArtV2.txt
    */

    /**
     * @param {number} index
     * @return {number}
     */
    this.GetSysColor = function (index) {}; // (uint)
    /*
    index: http://msdn.microsoft.com/en-us/library/ms724371%28VS.85%29.aspx
    Example: var splitter_colour = utils.GetSysColour(15);
    Returns 0 if failed.
    */

    /**
     * @param {number} index
     * @return {number}
     */
    this.GetSystemMetrics = function (index) {}; // (int)
    /*
    index: http://msdn.microsoft.com/en-us/library/ms724385%28VS.85%29.aspx
    Returns 0 if failed.
    */

    /**
     * @param {string} pattern
     * @param {number=} [exc_mask=0x10]
     * @param {number=} [inc_mask=0xffffffff]
     * @return {VBArray}
     */
    this.Glob = function (pattern, exc_mask, inc_mask) {}; // (VBArray) [, exc_mask][, inc_mask]
    /*
    exc_mask: default FILE_ATTRIBUTE_DIRECTORY
    See flags.txt > Used in utils.Glob()
    inc_mask: default 0xffffffff
    Returns a VBArray so you need to use .toArray() on the result.
    Example:
    var arr = utils.Glob("C:\\*.*").toArray();
    */

    /**
     * @param {number} index
     * @return {boolean}
     */
    this.IsKeyPressed = function (vkey) {}; // (boolean)
    /*
    vkey: http://msdn.microsoft.com/en-us/library/ms927178.aspx
    Some are defined in flags.txt > Used with utils.IsKeyPressed()
    */

    /**
     * @param {string} text
     * @param {string} lcid
     * @param {number} flags
     * @return {string}
     */
    this.MapString = function (text, lcid, flags) {}; // (string)

    /**
     * @param {string} pattern
     * @param {string} str
     * @return {boolean}
     */
    this.PathWildcardMatch = function (pattern, str) {}; // (boolean)
    // Using Microsoft MS-DOS wildcards match type. eg "*.txt", "abc?.tx?"

    /**
     * @param {string} filename
     * @param {number=} [codepage=0]
     * @return {string}
     */
    this.ReadTextFile = function (filename, codepage) {}; // (string) [,codepage]
    /*
    codepage: default 0. See codepages.txt
    If codepage is 0, text file can be UTF16-BOM, UTF8-BOM or ANSI.
    Example:
    var text = utils.ReadTextFile("E:\\some text file.txt");
    */

    /**
     * @param {string} filename
     * @param {string} section
     * @param {string} key
     * @param {string=} defaultval
     * @return {string}
     */
    this.ReadINI = function (filename, section, key, defaultval) {}; // (string) [, defaultval]
    /*
    An INI file should like this:

    [section]
    key=val

    This only returns up to 255 characters per value.
    Example:
    var username = utils.ReadINI("e:\\my_file.ini", "Last.fm", "username");
    */

    /**
     * @param {string} filename
     * @param {string} section
     * @param {string} key
     * @param {string} val
     * @return {boolean}
     */
    this.WriteINI = function (filename, section, key, val) {}; // (boolean)
    /*
    Example:
    utils.WriteINI("e:\\my_file.ini", "Last.fm", "username", "Bob");
    */
    
    utils.WriteTextFile(filename, content); (boolean)
    /*
    The parent folder must already exist and the resulting file will be UTF8-BOM.
    Example:
    utils.WriteTextFile("z:\\test.txt", "test");
    */
}
var utils = new IJSUtils();

/**
 * @constructor
 */
function Fb2kWindow() {
    /**
     * @return {number}
     */
    this.DlgCode = function () {}; // (int) (read, write)
    /*
    See flags.txt > With window.DlgCode
    Example: 
    window.DlgCode(DLGC_WANTALLKEYS);
    */

    /** @type {number} */
    this.ID = undefined; // (read) (int)
    // Required in utils.ColourPicker, utils.GetAlbumArtAsync, utils.LoadImageAsync

    /** @type {number} */
    this.InstanceType = undefined; // (int)
    /*
    Returns 0 if using Columns UI, 1 if using default UI.
    You need this to determine which GetFontXXX and GetColourXXX methods to use, assuming you want to support both interfaces.
    */

    /** @type {boolean} */
    this.IsTransparent = undefined; // (boolean) (read)
    /*
    Depends on setting inside JScript Panel Configuration window. You generally use it to determine
    whether or not to draw a background. Only useful within Panel Stack Splitter (Columns UI component)
    */

    /** @type {boolean} */
    this.IsVisible = undefined; // (boolean) (read)

    /** @type {number} */
    this.Height = undefined; // (int) (read)

    /** @type {number} */
    this.MaxHeight = undefined; // (int) (read, write)

    /** @type {number} */
    this.MaxWidth = undefined; // (int) (read, write)

    /** @type {number} */
    this.MinHeight = undefined; // (int) (read, write)

    /** @type {number} */
    this.MinWidth = undefined; // (int) (read, write)
    // The previous 4 methods can be used to lock the panel size. Do not use if panels are contained within Panel Stack Splitter (Columns UI component).

    /** @type {string} */
    this.Name = undefined; // (string) (read)
    /*
    Returns the @name set in the preprocessor section. See preprocessors.txt
    If that isn't present, the GUID of the panel is returned.
    */
    
    /** @type {number} */
    this.Width = undefined; // (int) (read)

    /**
     * @param {number} timerID
     */
    this.ClearTimeout = function (timerID) {}; // (void)

    /**
     * @param {number} timerID
     */
    this.ClearInterval = function (timerID) {}; // (void)

    /**
     * @return {number}
     */
    this.SetInterval = function (func, delay) {}; // (uint)

    /**
     * @return {number}
     */
    this.SetTimeout = function (func, delay) {}; // (uint)
    // See samples\basic\Timer.txt

    /**
     * @return {IMenuObj}
     */
    this.CreatePopupMenu = function () {}; // (IMenuObj)

    /**
     * @constructor
     */
    function IMenuObj() {
        // See samples\basic\MainMenuManager All-In-One, samples\basic\Menu Sample.txt

        /** @type {number} */
        this.ID = undefined; // (uint) (read)

        /**
         * @param {number} flags
         * @param {number} item_id
         * @param {string} text
         */
        this.AppendMenuItem = function (flags, item_id, text) {}; // (void)
        /*
        flags: See flags.txt > Used in AppendMenuItem()
        item_id: integer greater than 0. Each menu item needs a unique id.
        */

        this.AppendMenuSeparator = function () {}; // (void)

        /**
         * @param {IMenuObj} parentMenu
         * @param {number} flags
         * @param {string} text
         */
        this.AppendTo = function (parentMenu, flags, text) {}; // (void)

        /**
         * @param {number} id_or_pos
         * @param {boolean} check
         * @param {boolean=} [bypos=false]
         */
        this.CheckMenuItem = function (id_or_pos, check, bypos) {}; // (void) [, bypos]
        /*
        check: boolean.
        bypos: boolean, default false.
        */        

        /**
         * @param {number} first
         * @param {number} last
         * @param {number} pos
         * @param {boolean=} [bypos=false]
         */
        this.CheckMenuRadioItem = function (first, last, pos, bypos) {}; // (void) [, bypos]
        /*
        pos: number.
        bypos: boolean, default false.
        */

                this.Dispose = function () {}; // (void)

        /**
         * @param {number} id_or_pos
         * @param {boolean} enable
         * @param {boolean=} [bypos=false]
         */
        this.EnableMenuItem = function (id_or_pos, enable, bypos) {}; // (void) [, bypos]
        /*
        enable: boolean.
        bypos: boolean, default false
        */     

        /**
         * @param {number} x
         * @param {number} y
         * @param {number=} [flags=0]
         * @return {number}
         */
        this.TrackPopupMenu = function (x, y, flags) {}; // (int) [, flags]
        // flags: default 0. See flags.txt > Used in TrackPopupMenu()
    }

    /**
     * @param {Array<string>} class_list
     * @return {IThemeManager}
     */
    this.CreateThemeManager = function (class_list) {}; // (IThemeManager)
    /*
    class_list: http://msdn.microsoft.com/en-us/library/bb773210%28VS.85%29.aspx
    See samples\basic\SimpleThemedButton.txt
    */

    /**
     * @constructor
     */
    function IThemeManager() {
        /**
         * @param {IGdiGraphics} gr
         * @param {number} x
         * @param {number} y
         * @param {number} w
         * @param {number} h
         * @param {number=} [clip_x=0]
         * @param {number=} [clip_y=0]
         * @param {number=} [clip_w=0]
         * @param {number=} [clip_h=0]
         */
        this.DrawThemeBackground = function (gr, x, y, w, h, clip_x, clip_y, clip_w, clip_h) {}; // (void) [, clip_x][, clip_y][, clip_w][, clip_h]
        // clip_x, clip_y, clip_w, clip_h: defaults to 0 if omitted

        /**
         * @param {number} partid
         * @return {boolean}
         */
        this.IsThemePartDefined = function (partid) {}; // (boolean)

        /**
         * @param {number} partid
         * @param {number} stateid
         */
        this.SetPartAndStateID = function (partid, stateid) {}; // (void)
        // partid, stateid: http://msdn.microsoft.com/en-us/library/bb773210%28VS.85%29.aspx
    }

    /**
     * @param {string=} [font_name="Segoe UI"]
     * @param {number=} [font_size_px=12]
     * @param {number=} [font_style=0]
     * @return {IFbTooltip}
     */
    this.CreateTooltip = function (font_name, font_size_px, font_style) {}; // (IFbTooltip) [font_name][, font_size_px][, font_style]
    /*
    font_name: default "Segoe UI"
    font_size_px: default 12
    font_style: default 0. See flags.txt > FontStyle
    */

    /**
     * @constructor
     */
    function IFbTooltip() {
        /*
        This will be used in the examples below.
        var tooltip = window.CreateTooltip();
        */    

        /** @type {string} */
        this.Text = undefined; // (string) (read, write)
        /*
        Example:
        tooltip.Text = "Whoop";
        */

        /** @type {boolean} */
        this.TrackActivate = undefined; // (boolean) (write)

        this.Activate = function () {}; // (void)
        /*
        Only do this when text has changed otherwise it will flicker
        Example:
        var text = "...";
        if (tooltip.Text != text) {
            tooltip.Text = text;
            tooltip.Activate();
        }
        */

        this.Deactivate = function () {}; // (void)

        this.Dispose = function () {}; // (void)

        /**
         * @param {number} type
         * @return {number}
         */
        this.GetDelayTime = function (type) {}; // (int)

        /**
         * @param {number} type
         * @param {number} time
         */
        this.SetDelayTime = function (type, time) {}; // (void)
        // type. See flags.txt > Used in IFbTooltip.GetDelayTime() and IFbTooltip.SetDelayTime()

        /**
         * @param {number} width
         */
        this.SetMaxWidth = function (width) {}; // (void)
        /*
        Use if you want multi-line tooltips.
        Example:
        tooltip.SetMaxWidth(800);
        tooltip.Text = "Line1\nLine2";
        Use \n as a new line separator.
        */

        /**
         * @param {number} x
         * @param {number} y
         */
        this.TrackPosition = function (x, y) {}; // (void)
        // Check x, y positions have changed from last time otherwise it will flicker
    }

    /**
     * @param {number} type
     * @param {string=} client_guid
     * @return {number}
     */
    this.GetColourCUI = function (type, client_guid) {}; // (uint) [, client_guid]

    /**
     * @param {number} type
     * @return {number}
     */
    this.GetColourDUI = function (type) {}; // (uint)

    /**
     * @param {number} type
     * @param {string=} client_guid
     * @return {IGdiFont}
     */
    this.GetFontCUI = function (type, client_guid) {}; // (IGdiFont) [, client_guid]

    /**
     * @param {number} type
     * @return {IGdiFont}
     */
    this.GetFontDUI = function (type) {}; // (IGdiFont)
    /*
    type:
    See flags.txt > Used in window.GetFontXXX()
    client_guid: default "".
    See flags.txt > Used in GetFontCUI() as client_guid.
    This returns null if the component was unable to determine your font.
    To avoid errors when trying to use the font or access its properties, you
    should use code something like this...

    var font = window.GetFontDUI(0);
    if (!font) {
        console.log("Unable to determine your default font. Using Segoe UI instead.");
        font = gdi.Font("Segoe UI", 12);
    }
    */

    /**
     * @param {string} name
     * @param {*} info
     */
    this.NotifyOthers = function (name, info) {}; // (void)
    /*
    name: string
    info: all variable/array/object types should be supported
    Listen for notifications in other panels using on_notify_data(name, info) {}
    */

    this.Reload = function () {}; // (void)
    // reload panel

    /**
     * @param {boolean=} [force=false]
     */
    this.Repaint = function (force) {}; // (void) [force]
    // force: boolean, default false

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @param {boolean=} [force=false]
     */
    this.RepaintRect = function (x, y, w, h, force) {}; // (void) [force]
    /*
    force: boolean, default false

    Use this instead of window.Repaint on frequently updated areas
    such as time, bitrate, seekbar, etc.
    */

    /**
     * @param {number} id
     */
    this.SetCursor = function (id) {}; // (void)
    /*
    id: See flags.txt > Used in window.SetCursor()
    This would usually be used inside the on_mouse_move callback. Use -1 if you want to hide the cursor.
    */
    
    /**
     * @param {string} name
     * @param {*=} defaultval
     * @return {*}
     */
    this.GetProperty = function (name, defaultval) {}; // (VARIANT) [, defaultval]
    /*
    name: string
    defaultval: string, number, boolean
    Get value of name from properties. If no value is present, defaultval will be stored and returned
    */

    /**
     * @param {string} name
     * @param {*=} val
     */
    this.SetProperty = function (name, val) {}; // (void)
    /*
    name: string
    val: string, number, boolean
    Set property value, if val is invalid/null, it is removed. Property values will be saved per panel instance and are
    remembered between foobar2000 restarts.
    */

    this.ShowConfigure = function () {}; // (void)
    // Show configuration window of current panel

    this.ShowProperties = function () {}; // (void)
    // Show properties window of current panel
}
// Idea does not recognize this object if it has var =(
window = new Fb2kWindow();

/**
 * @constructor
 */
function IGdiFont() {
    /*
    This will be used in the examples below:
    var my_font = window.GetFontDUI(0);
    See flags.txt > FontTypeDUI
    */

    /** @type {number} */
    this.Height = undefined;//    (int)(read)
    /*
    Example:
    console.log(my_font.Height); // 15
    */

    /** @type {string} */
    this.Name = undefined;//    (string)(read)
    /*
    Example:
    console.log(my_font.Name); // Segoe UI
    */

    /** @type {float} */
    this.Size = undefined;//    (float)(read)
    /*
    Example:
    console.log(my_font.Size); // 12
    */

    /** @type {number} */
    this.Style = undefined;//    (int)(read)
    /*
    Example:
    console.log(my_font.Style);
    See flags.txt > FontStyle
    */


    this.Dispose = function () {}; // (void)
    /*
    Example:
    my_font.Dispose();
    */
}

/**
 * @constructor
 */
function IGdiBitmap() {

    /** @type {number} */
    this.Height = undefined;// (int) (read)

    /** @type {number} */
    this.Width = undefined;// (int) (read)

    /**
     * @param {number} alpha
     * @return {IGdiBitmap}
     */
    this.ApplyAlpha = function (alpha) {}; // (IGdiBitmap)
    // alpha: 0-255

    /**
     * @param {IGdiBitmap} img
     * @return {boolean}
     */
    this.ApplyMask = function (img) {}; // (boolean)
    // Changes will be saved in the current bitmap. See samples\basic\Apply Mask.txt

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @return {IGdiBitmap}
     */
    this.Clone = function (x, y, w, h) {}; // (IGdiBitmap)

    /**
     * @return {IGdiRawBitmap}
     */
    this.CreateRawBitmap = function () {}; // (IGdiRawBitmap)
    // Create a DDB bitmap from IGdiBitmap, which is used in GdiDrawBitmap()

    /**
     * @constructor
     */
    function IGdiRawBitmap() {

        /** @type {number} */
        this.Width = undefined; // (int) (read)

        /** @type {number} */
        this.Height = undefined; // (int) (read)

        this.Dispose = function () {}; // (void)
    }

    this.Dispose = function () {}; // (void)

    /**
     * @param {number} max_count
     * @return {VBArray}
     */
    this.GetColourScheme = function (max_count) {}; // (VBArray)
    // Returns a VBArray so you need to use .toArray() on the result.

    /**
     * @return {IGdiGraphics}
     */
    this.GetGraphics = function () {}; //
    // Don't forget to use ReleaseGraphics() after operations on IGdiGraphics interface is done.

    /**
     * @param {IGdiGraphics} gr
     * @return {IGdiGraphics}
     */
    this.ReleaseGraphics = function (gr) {}; // (IGdiGraphics)

    /**
     * @param {number} w
     * @param {number} h
     * @param {number=} [mode=0]
     * @return{IGdiBitmap}
     */
    this.Resize = function (w, h, mode) {}; // (IGdiBitmap) [, mode]
    // mode: default 0. see flags.txt > InterpolationMode

    /**
     * @param {number} mode
     */
    this.RotateFlip = function (mode) {}; // (void)
    // mode: see flags.txt > RotateFlipType

    /**
     * @param {string} path
     * @param {string=} [format='image/png']
     * @return {boolean}
     */
    this.SaveAs = function (path, format) {}; // (boolean) [, format]
    /*
    path: Full path including file extension. The parent folder must already exist.
    format:
    "image/png" (default if omitted)
    "image/bmp"
    "image/jpeg"
    "image/gif"
    "image/tiff"

    Example:
    var img = utils.GetAlbumArtEmbedded(fb.GetFocusItem().RawPath, 0);
    if (img)
        img.SaveAs("D:\\export.jpg", "image/jpeg");
    */

    /**
     * @param {number} radius
     */
    this.StackBlur = function (radius) {}; // (void)
    // radius: Valid values 2-254. See samples\basic\StackBlur (image).txt, samples\basic\StackBlur (text).txt
}

/**
 * @constructor
 */
function IGdiGraphics() {
    /*
    Typically used inside on_paint(gr)
    There are many different ways to get colours.
    Use window.GetColourDUI/window.GetColourCUI,
    RGB function from helpers.txt, utils.ColourPicker,
    etc.
    */

    /**
     * @param {string} str
     * @param {IGdiFont} font
     * @return {number}
     */
    this.CalcTextHeight = function (str, font) {}; // (uint)
    // This will only calulate the text height of one line.

    /**
     * @param {string} str
     * @param {IGdiFont} font
     * @return {number}
     */
    this.CalcTextWidth = function (str, font) {}; // (uint)

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @param {number} line_width
     * @param {number} colour
     */
    this.DrawEllipse = function (x, y, w, h, line_width, colour) {}; // (void)

    /**
     *
     * @param {IGdiBitmap} img
     * @param {number} dstX
     * @param {number} dstY
     * @param {number} dstW
     * @param {number} dstH
     * @param {number} srcX
     * @param {number} srcY
     * @param {number} srcW
     * @param {number} srcH
     * @param {number=} [angle=0]
     * @param {number=} [alpha=255]
     */
    this.DrawImage = function (img, dstX, dstY, dstW, dstH, srcX, srcY, srcW, srcH, angle, alpha) {}; // (void) [, angle][, alpha]
    /*
    angle: default 0
    alpha: default 255. valid values 0-255.
    */

    /**
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @param {number} line_width
     * @param {number} colour
     */
    this.DrawLine = function (x1, y1, x2, y2, line_width, colour) {}; // (void)

    /**
     * @param {number} colour
     * @param {number} line_width
     * @param {number} points
     */
    this.DrawPolygon = function (colour, line_width, points) {}; // (void)
    // points: An array.

    /**
     * @param {string} str
     * @param {IGdiFont} font
     * @param {number} colour
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @param {number=} [flags=0]
     * @constructor
     */
    this.DrawString = function (str, font, colour, x, y, w, h, flags) {}; // (void) [, flags]
    // flags: default 0. See flags.txt > StringFormatFlags

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @param {number} line_width
     * @param {number} colour
     */
    this.DrawRect = function (x, y, w, h, line_width, colour) {}; // (void)

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @param {number} arc_width
     * @param {number} arc_height
     * @param {number} line_width
     * @param {number} colour
     */
    this.DrawRoundRect = function (x, y, w, h, arc_width, arc_height, line_width, colour) {}; // (void)

    /**
     * @param {string} str
     * @param {IGdiFont}
     * @param {number} max_width
     * @return {VBArray}
     */
    this.EstimateLineWrap = function (str, font, max_width) {}; // (VBArray)
    /*
    returns a VBArray so you need to use .toArray() on the result.
    index | meaning
    [0] text line 1
    [1] width of text line 1 (in pixel)
    [2] text line 2
    [3] width of text line 2 (in pixel)
    ...
    [2n + 2] text line n
    [2n + 3] width of text line n (px)
    */

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @param {number} colour
     */
    this.FillEllipse = function (x, y, w, h, colour) {}; // (void)

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @param {number} angle
     * @param {number} colour1
     * @param {number} colour2
     * @param {float} [focus=1.0]
     */
    this.FillGradRect = function (x, y, w, h, angle, colour1, colour2, focus) {}; // (void) [, focus]
    /*
    focus: default 1.0. valid values are between 0.0 and 1.0
    Specify where the centred colour will be at its highest intensity.

    NOTE: This may appear buggy depending on rectangle size. The easiest fix is
    to adjust the "angle" by a degree or two.
    */

    /**
     * @param {number} colour
     * @param {number} fillmode
     * @param {Array<Array<number>>} points
     */
    this.FillPolygon = function (colour, fillmode, points) {}; // (void)
    // fillmode: 0 alternate, 1 winding.
    // points: An array.

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @param {number} arc_width
     * @param {number} arc_height
     * @param {number} colour
     */
    this.FillRoundRect = function (x, y, w, h, arc_width, arc_height, colour) {}; // (void)

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @param {number} colour
     */
    this.FillSolidRect = function (x, y, w, h, colour) {}; // (void)

    /**
     * @param {IGdiRawBitmap} img
     * @param {number} dstX
     * @param {number} dstY
     * @param {number} dstW
     * @param {number} dstH
     * @param {number} srcX
     * @param {number} srcY
     * @param {number} srcW
     * @param {number} srcH
     */
    this.GdiDrawBitmap = function (img, dstX, dstY, dstW, dstH, srcX, srcY, srcW, srcH) {}; // (void)
    // Always faster than DrawImage, does not support alpha channel.

    /**
     * @param {string} str
     * @param {IGdiFont} font
     * @param {number} colour
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @param {number=} [format=0]
     * @return {VBArray}
     */
    this.GdiDrawText = function (str, font, colour, x, y, w, h, format) {}; // (VBArray) [, format]
    /*
    format: default 0. See flags.txt > DT_*

    Returns a VBArray so you need to use .toArray() on the result.
    index | meaning
    [0] left   (DT_CALCRECT)
    [1] top    (DT_CALCRECT)
    [2] right  (DT_CALCRECT)
    [3] bottom (DT_CALCRECT)
    [4] characters drawn
    */

    /**
     * @param {string} str
     * @param {IGdiFont} font
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @param {number=} [flags=0]
     * @return {IMeasureStringInfo}
     */
    this.MeasureString = function (str, font, x, y, w, h, flags) {}; // (IMeasureStringInfo) [, flags]
    // flags: default 0. See flags.txt > StringFormatFlags

    /**
     * @constructor
     */
    function IMeasureStringInfo() {

        /** @type {number} */
        this.chars = undefined; // (int) (read)

        /** @type {float} */
        this.Height = undefined; // (float) (read)

        /** @type {number} */
        this.lines = undefined; // (int) (read)

        /** @type {float} */
        this.x = undefined; // (float) (read)

        /** @type {float} */
        this.y = undefined; // (float) (read)

        /** @type {float} */
        this.Width = undefined; // (float) (read)

        /*
        Example:
        // ==PREPROCESSOR==
        // @import "%fb2k_component_path%docs\flags.txt"
        // @import "%fb2k_component_path%docs\helpers.txt"
        // ==/PREPROCESSOR==

        var sf = StringFormat(StringAlignment.Near, StringAlignment.Near);
        var text = utils.ReadTextFile("z:\\info.txt");
        var font = window.GetFontDUI(0);

        function on_paint(gr) {
            gr.DrawString(text, font, RGB(255, 0, 0), 0, 0, window.Width, window.Height, sf);
            var temp = gr.MeasureString(text, font, 0, 0, window.Width, 10000, sf);
            // If we want to calculate height, we must set the height to be far larger than what
            // the text could possibly be.
            
            console.log(temp.Height); // 2761.2421875 // far larger than my panel height!
            console.log(temp.Chars); // 7967
        }
        */
    }

    /**
     * @param {number=} [mode=0]
     */
    this.SetInterpolationMode = function (mode) {}; // (void)
    // mode: default 0. See flags.txt > InterpolationMode

    /**
     * @param {number=} [mode=0]
     */
    this.SetSmoothingMode = function (mode) {}; // (void)
    // mode: default 0. See flags.txt > SmoothingMode

    /**
     * @param {number=} [mode=0]
     */
    this.SetTextRenderingHint = function (mode) {}; // (void)
    // mode: default 0. See flags.txt > TextRenderingHint

    /**
     * @param {IGdiRawBitmap} img
     * @param {number} dstX
     * @param {number} dstY
     * @param {number} dstW
     * @param {number} dstH
     * @param {number} srcX
     * @param {number} srcY
     * @param {number} srcW
     * @param {number} srcH
     * @param {number=} [alpha=255]
     */
    this.GdiAlphaBlend = function (img, dstX, dstY, dstW, dstH, srcX, srcY, srcW, srcH, alpha) {}; // (void) [, alpha]
    // alpha: default 255. valid values 0-255.
}
var gr = IGdiGraphics();

/**
 * @constructor
 */
function IFbMetadbHandle() {
    // This will be used in the examples below:
    // var handle = fb.GetFocusItem();

    /** @type {string} */
    this.Path = undefined; // (string) (read)
    /*
    Example:
    console.log(handle.Path); // D:\SomeSong.flac
    */

    /** @type {string} */
    this.RawPath = undefined; // (string) (read)
    /*
    Example:
    console.log(handle.RawPath); // file://D:\SomeSong.flac
    */

    /** @type {number} */
    this.SubSong = undefined; // (int) (read)

    /** @type {number} */
    this.FileSize = undefined; // (LONGLONG) (read)

    /** @type {float} */
    this.Length = undefined; // (double) (read)

    /**
     * @param {IFbMetadbHandle} handle
     * @return {boolean}
     */
    this.Compare = function (handle) {}; // (boolean)
    /*
    Compare two IFbMetadbHandle instances, pointer only.
    Example:
    handle.Compare(handle2);
    If you want to compare them physically, use the "RawPath" property.
    */

    this.Dispose = function () {}; // (void)
    /*
    Example:
    handle.Dispose();
    */

    /**
     * @return {IFbFileInfo}
     */
    this.GetFileInfo = function () {}; // (IFbFileInfo)

    /**
     * @constructor
     */
    function IFbFileInfo() {
        /*
        This will be used in the examples below:
        var handle = fb.GetFocusItem();
        var f = handle.GetFileInfo();
        */

        /** @type {number} */
        this.MetaCount = undefined; // (read)
        /*
        Example:
        console.log(f.MetaCount); // 11
        */

        /** @type {number} */
        this.InfoCount = undefined; // (read)
        /*
        Example:
        console.log(f.InfoCount); // 9
        */

        this.Dispose = function () {}; //
        /*
        Example:
        f.Dispose();
        */

        /**
         * @param {string} name
         * @return {number}
         */
        this.InfoFind = function (name) {}; //
        // Returns -1 on failure

        /**
         * @param {number} idx
         * @return {string}
         */
        this.InfoName = function (idx) {}; //

        /**
         * @param {number} idx
         * @return {string}
         */
        this.InfoValue = function (idx) {}; //

        /**
         * @param {string} name
         * @return {number}
         */
        this.MetaFind = function (name) {}; //
        // Returns -1 on failure

        /**
         * @param {number} idx
         * @return {string}
         */
        this.MetaName = function (idx) {}; //
        /*
        The case of the tag name returned can be different depending on tag type
        so using toLowerCase() or toUpperCase() on the result is recommended
        
        Example:
        for (var i = 0; i < f.MetaCount; i++) {
            console.log(f.MetaName(i).toUpperCase());
        }
        */

        /**
         * @param {number} idx
         * @param {number} vidx
         * @return {string}
         */
        this.MetaValue = function (idx, vidx) {}; //

        /**
         * @param {number} idx
         * @return {number}
         */
        this.MetaValueCount = function (idx) {}; //
    }
}

/**
 * @constructor
 */
function IFbMetadbHandleList() {
    /*
    This will be used in the examples below:
    var handle_list = plman.GetPlaylistItems(plman.ActivePlaylist);
    If you want an empty handle list, do this...
    var handle_list = fb.CreateHandleList();
    */

    /** @type {number} */
    this.Count = undefined; // (uint) (read)
    /*
    Example:
    console.log(handle_list.Count);
    */

    /**
     * @param {number} idx
     * @return {IFbMetadbHandle}
     */
    this.Item = function (idx) {}; // (IFbMetadbHandle) (read, write)
    /*
    Example:
    console.log(fb.TitleFormat("%artist%").EvalWithMetadb(handle_list.Item(0)));
    Displays artist of first item in handle list
    */

    /**
     * @param {IFbMetadbHandle} handle
     * @return {number}
     */
    this.Add = function (handle) {}; // (uint)
    /*
    Example: 
    handle_list.Add(fb.GetNowPlaying());
    */

    /**
     * @param {IFbMetadbHandleList} handle
     */
    this.AddRange = function (handle_list) {}; // (void)
    /*
    Example:
    handle_list.Add(fb.GetLibraryItems());
    */

    /**
     * @param {IFbMetadbHandle} handle
     * @return {number}
     */
    this.BSearch = function (handle) {}; // (uint)
    /*
    Must be sorted, faster than Find()
    Returns - 1 on failure.
    */

    /**
     * @return {float|number}
     */
    this.CalcTotalDuration = function () {}; // (double)
    // Returns total in seconds. For display purposes, consider using utils.FormatDuration() on the result.

    /**
     * @return {number}
     */
    this.CalcTotalSize = function () {}; // (LONGLONG)
    // Returns total in bytes. For display purposes, consider using utils.FormatFileSize() on the result.

    /**
     * @return {IFbMetadbHandleList}
     */
    this.Clone = function () {}; // (IFbMetadbHandleList)
    /*
    Example:
    var handle_list2 = handle_list.Clone();
    */

    this.Dispose = function () {}; // (void)
    /*
    Example:
    handle_list.Dispose();
    */

    /**
     * @param {IFbMetadbHandle} handle
     * @return {number}
     */
    this.Find = function (handle) {}; // (uint)
    /*
    If sorted, use BSearch instead
    Returns -1 on failure
    */

    /**
     * @param {number} index
     * @param {IFbMetadbHandle} handle
     * @return {number}
     */
    this.Insert = function (index, handle) {}; // (uint)
    /*
    Example1:
    handle_list.Insert(0, fb.GetNowPlaying());
    0 inserts at the start of the handle list.
    Example2:
    handle_list.Insert(handle_list.Count, fb.GetNowPlaying());
    This inserts at the end of the handle list.
    */

    /**
     * @param {number} index
     * @param {IFbMetadbHandleList} handle
     * @return {number}
     */
    this.InsertRange = function (index, handle_list) {}; // (uint)

    /**
     * @param {IFbMetadbHandleList} handle
     */
    this.MakeDifference = function (handle_list) {}; // (void)
    /*
    Must be sorted
    Example:
    var one = plman.GetPlaylistItems(0);
    one.Sort();

    var two = plman.GetPlaylistItems(1);
    two.Sort();

    one.MakeDifference(two);
    // "one" now only contains handles that were unique to "one". Anything that also existed in "two" will have been removed.
    */

    /**
     * @param {IFbMetadbHandleList} handle
     */
    this.MakeIntersection = function (handle_list) {}; // (void)
    /*
    Must be sorted
    Example:
    var one = plman.GetPlaylistItems(0);
    one.Sort();

    var two = plman.GetPlaylistItems(1);
    two.Sort();

    one.MakeIntersection(two);
    // "one" now only contains handles that were in BOTH "one" AND "two"
    */
    
    /**
     * @param {IFbMetadbHandleList} handle
     */
    this.MakeUnion = function (handle_list) {}; // (void)
    /*
    Must be sorted
    Example:
    var one = plman.GetPlaylistItems(0);
    one.Sort();

    var two = plman.GetPlaylistItems(1);
    two.Sort();

    one.MakeUnion(two);
    // "one" now contains all handles from "one" AND "two" with any duplicates removed
    */

    /**
     * @param {IFbTitleFormat} tfo
     * @param {number} direction
     */
    this.OrderByFormat = function (tfo, direction) {}; // (void)
    /*
    tfo: an instance of IFbTitleFormat.
    direction: integer, ascending while > 0.
    Example:
    var handle_list = fb.GetLibraryItems();
    var tfo = fb.TitleFormat("%album artist%|%date%|%album%|%discnumber%|%tracknumber%");
    handle_list.OrderByFormat(tfo, 1);
    */

    this.OrderByPath = function () {}; // (void)

    this.OrderByRelativePath = function () {}; // (void)

    /**
     * @param {IFbMetadbHandle} handle
     */
    this.Remove = function (handle) {}; // (void)

    this.RemoveAll = function () {}; // (void)

    /**
     * @param {number} idx
     */
    this.RemoveById = function (idx) {}; // (void)
    /*
    Example:
    handle_list.RemoveById(0);
    */

    /**
     * @param {number} from
     * @param {number} num
     */
    this.RemoveRange = function (from, num) {}; // (void)
    /*
    Example:
    handle_list.RemoveRange(10, 20);
    */
    
    this.Sort = function () {}; // (void)
    // Remove duplicates and optimise for other handle list operations

    /**
     * @param {string} str
     */
    this.UpdateFileInfoFromJSON = function (str) {}; // (void)    
}

/**
 * @constructor
 */
function IDropTargetAction() {
    // See samples\basic\Drag Drop Basic.txt

    /** @type {boolean} */
    this.Parsable = undefined; // (boolean) (read, write)

    /** @type {number} */
    this.Playlist = undefined; // (read, write)
    // default: -1, active playlist

    /** @type {boolean} */
    this.ToSelect = undefined; // (boolean) (read, write)

    this.ToPlaylist = function () {}; // (void)
}
