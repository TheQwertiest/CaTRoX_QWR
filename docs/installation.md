---
title: Installation
nav_order: 2
---

# Installation
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

* TOC
{:toc}

---

## Prerequisites

 - Windows 7 or later.
 - Internet Explorer 9 or later.
 - foobar2000 v1.3.17 or later.
 - Desire to improve your fb2k looks!

## Installation

- Preparation:
  1. Download the [latest theme release](https://github.com/TheQwertiest/CaTRoX_QWR/releases/latest).
  1. Unzip archive to a temporary folder (e.g. `unzipped_theme_folder`).
  1. Download and install all the [required components](#required-components) ([instructions](http://wiki.hydrogenaud.io/index.php?title=Foobar2000:How_to_install_a_component) on how to install a component).
  1. (Optional) Download and install all the [optional components](#optional-components).
  1. Install additional fonts:  
     They can be either installed from the included `unzipped_theme_folder/fonts` directory or downloaded directly from their homepages:
     * Font Awesome (ttf version): <http://fontawesome.io>
     * GuiFx v2 (ttf version): <http://blog.guifx.com/2009/04/02/guifx-v2-transport-font>

- Installation:     
  1. Launch foobar2000.
  1. Choose Column UI interface.
  1. Add `Spider Monkey Panel` panel.
  1. `Right-click on panel` > `Configure Panel` > `Script source` > `Package` > `Package Manager`
  1. Drag-n-drop all `*.zip` files from `unzipped_theme_folder/packages` to the `Package Manager` dialog.
  1. Exit the dialog.
  1. `Display` > `Columns UI` > `Main`: 
     * `Miscelanous` > `Untick 'Show toolbars`.
     * `FCL importing exporting` > `Import...` > choose `unzipped_theme_folder/theme.fcl`.
  1. Click OK =)
  1. (Optional) Right-click on top of the window (the dark grey part). Frame-style > No border.

## Required components

 - foo_spider_monkey_panel: <https://theqwertiest.github.io/foo_spider_monkey_panel/>
 - foo_musical_spectrum: <http://wiki.hydrogenaud.io/index.php?title=Foobar2000:Components/Musical_Spectrum_(foo_musical_spectrum)>
 - foo_uie_lyrics3: <https://www.foobar2000.org/components/view/foo_uie_lyrics3>
 - foo_uie_panel_splitter: <http://foo2k.chottu.net> ([backup link](https://hydrogenaud.io/index.php/topic,114249.0.html))
 - foo_ui_columns: <https://www.foobar2000.org/components/view/foo_ui_columns>
 - foo_ui_hacks: <http://foobar2000.ru/forum/viewtopic.php?p=44399#p44399>
 - foo_youtube: <http://fy.3dyd.com/home>

These components can't be removed without breaking the theme in some way.

## Optional components

- foo_playcount: <https://www.foobar2000.org/components/view/foo_playcount>
  - Displays track play count and makes possible to view and set track rating from [Playlist Panel](features/panels/playlist_panel.md#row).  
- foo_enhanced_playcount: <https://www.foobar2000.org/components/view/foo_enhanced_playcount>
  - Changes track play count behavior: it will display maximum between Last.FM scrobble count and local play count. Should be used together with foo_playcount.  
- foo_scrobble: <https://github.com/gix/foo_scrobble>
  - Last.FM scrobbler. Scrobbling can be toggled from [Top Panel](features/modes/full_mode.md#top-panel).
- foo_utils: <http://foosion.foobar2000.org/components/?id=utils>
  - Adds ability to make playlists read-only, which is accessible from [Playlist Manager](features/panels/playlist_panel.md#playlist-manager).   

Features described above will be unavailable and disabled if these components are not installed, but the theme will still work fine without them.