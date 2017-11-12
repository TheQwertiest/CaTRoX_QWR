# CaTRoX (QWR Edition) 

Theme for foobar2000.

## Installation

1. Unzip archive in your foobar2000 user directory: 
   * Portable installation: installation directory
   * Default installation: %AppData%/foobar2000
1. Download and install all the [required components](#required-components).
1. (Optional) Download and install all the [optional components](#optional-components)
1. Install additional fonts (these are not optional!):  
   They can be either installed from the included 'fonts' directory or downloaded directly from their homepages:
   * Font Awesome (ttf version): http://fontawesome.io/
   * GuiFx v2 (ttf version): http://blog.guifx.com/2009/04/02/guifx-v2-transport-font/
1. Launch foobar2000.
1. Choose Column UI interface.
1. Display > Columns UI > Main: 
   * Miscelanous > Untick 'Show toolbars'
   * FCL importing exporting > Import... > choose 'themes/CaTRoX/theme.fcl'
1. Click OK =)
1. (Optional) Right-click on top of the window (the dark grey part). Frame-style > No border

## Main theme features

### Multiple display modes

Theme contains three display modes: Full Mode (used by default), Playlist Mode and Art Mode.
These modes can be toggled via buttons in the top right corner of menu.

### Built-in YouTube support

#### Playing from urls (foo_youtube)

Videos from youtube can be added via Add location... under File menu tab (Hotkey by default is CTRL-U).
Youtube playlists are supported as well (the url for playlist should be in https://www.youtube.com/playlist?list=PL01234567890 format),

For more info see foo_youtube main page (http://fy.3dyd.com/home/).

#### Automatically formed playlist (YouTube Track Manager)

Full Mode: SRC tab > YT tab.

This tab may be used to create auto-playlist with youtube videos.

Example usage: you are currently playing %GroupName%. You want to find more albums of the same group. Click on %AlbumName% in the YT tab. After a few seconds a new playlist with %AlbumName% will be formed.

For more info see YouTube Track Manager main page (https://hydrogenaud.io/index.php/topic,105522.0.html)

#### Search Youtube

Click on Search button in the top right corner for YouTube search.

#### Display video

When Youtube audio is being played, it's associated video can be displayed via clicking on Arrow button near Search button.

### More

Theme contains a lot more features, so explore it thoroughly ;)

Developer menu on the panels can be accessed with SHIFT-Right-Click.

### Required components

 - foo_jscript_panel: modified version of marc2003's component (see below), compiled from https://github.com/TheQwertiest/foo-jscript-panel
 - foo_musical_spectrum: http://wiki.hydrogenaud.io/index.php?title=Foobar2000:Components/Musical_Spectrum_(foo_musical_spectrum)
 - foo_uie_lyrics3: https://www.foobar2000.org/components/view/foo_uie_lyrics3
 - foo_uie_panel_splitter: http://wiki.hydrogenaud.io/index.php?title=Foobar2000:Components_0.9/Panel_Stack_Splitter_(foo_uie_panel_splitter)
 - foo_ui_columns: https://www.foobar2000.org/components/view/foo_ui_columns
 - foo_ui_hacks: http://foobar2000.ru/forum/viewtopic.php?p=44399#p44399
 - foo_youtube: http://fy.3dyd.com/home

These compononents can't be removed without breaking theme in some way.

Theme is not fully compatible with the original foo_jscript_panel (https://github.com/19379/foo-jscript-panel), since it relies on several extensions added in the modified version.

### Optional components

- foo_playcount: https://www.foobar2000.org/components/view/foo_playcount
- foo_utils: http://foosion.foobar2000.org/components/?id=utils

Some features will be unavailable and disabled if these are not installed. But the theme will still work properly without errors.

### Included 3rd party scripts
 - YouTube Track Manager (Panel_YT.js): https://hydrogenaud.io/index.php/topic,105522.0.html by WilB.
 - Library Tree (Panel_Library.js): https://hydrogenaud.io/index.php/topic,110938.0.html by WilB.
 - Various samples from foo_jscript_panel by marc2003.

## Credits
 - eXtremeHunter1972: original CaTRoX theme (http://extremehunter1972.deviantart.com/art/CaTRoX-1-April-2014-368146015).
 - marc2003: original foo_jscript_panel, sample scripts and various JS consultations.
 - WilB: YouTube Track Manager script and Library Tree script.
 - Respective authors of included components.
