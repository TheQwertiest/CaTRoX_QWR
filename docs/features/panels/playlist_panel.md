---
title: Playlist panel
parent: Panels
grand_parent: Theme features
nav_order: 2
---

# Playlist panel
{: .no_toc }

{% assign img = "assets/img/panels/playlist_panel.png" | relative_url %}
{% include functions/clickable_img.html
  img = img
  alt = "Playlist panel"
  title = "Playlist panel"
%}

## Table of contents
{: .no_toc .text-delta }

* TOC
{:toc}

---

## Playlist Manager

Displays info about current playlist and can be used to manage playlist with left-click menu.

Can also be used to Lock/Unlock playlists (i.e. make it read-only) if [foo_utils](http://foosion.foobar2000.org/components/?id=utils) component is installed.

## Current Playlist

### Group Header

{% assign img = "assets/img/panels/playlist_header.png" | relative_url %}
{% include functions/clickable_img.html
  img = img
  alt = "Playlist header"
  title = "Playlist header"
%}

Group headers are used to organize tracks in your playlist. They do not change the order of the tracks. See [Track Grouping](#track-grouping) for more info.

Headers can be disabled or have it's appearance changed with `right-click menu` > `Appearance` > `Header`.  

It is also possible to hide contained tracks and show only headers via `right-click menu` > `Collapse/Expand`.   
When `Collapse/Expand` > `Auto` is selected all headers will be collapsed except for the one containing currently played track.   
Header can be expanded/collapsed with `CTRL-SHIFT-left-click` as well.

#### Track Grouping

Tracks are grouped under one header if their evaluated grouping query is the same (`%album artist%%album%%discnumber%` by default). 

Grouping query as well as title query, sub-title query and date and CD number visibility flags for **Group Header** can be changed with grouping presets (`right-click menu` > `Grouping`). 

Grouping presets can be added, removed or changed via 'Manage Presets' menu (`right-click menu` > `Grouping` > `Manage Presets`):
<details markdown="0">
<summary>
'Manage Presets' menu
</summary>

{% assign img = "assets/img/panels/playlist_manager.png" | relative_url %}
{% include functions/clickable_img.html
  img = img
  alt = "Playlist preset manager"
  title = "Playlist preset manager"
%}
</details>

Preset settings are playlist bound, i.e. if you choose 'preset_name' for 'playlist_name' all the other playlists will remain unchanged. If a playlist does not have a preset bound to it, it will use the default preset. The changes made to the preset marked as [default] will affect all _unbound_ playlists.

Note: Title query and sub-title query use first track in group for evaluation.

### Row

{% assign img = "assets/img/panels/playlist_row.png" | relative_url %}
{% include functions/clickable_img.html
  img = img
  alt = "Playlist row"
  title = "Playlist row"
%}


Rating and play count will only be shown when [foo_playcount](https://www.foobar2000.org/components/view/foo_playcount) component is present.

If [foo_enhanced_playcount](https://www.foobar2000.org/components/view/foo_enhanced_playcount) is also installed, then play counter will display maximum between Last.FM scrobble count and local play count. 

Row appearance can be changed with `right-click menu` > `Appearance` > `Row`.

## Hotkeys

- Basic control: up, down, left-click and etc.
- Left for 'Collapse Current Header', Right for 'Expand Current Header'.
- CTRL-SHIFT-up and CTRL-SHIFT-down for 'Move Selection Up' and 'Move Selection Down'.
- CTRL-SHIFT-left-click for 'Collapse/Expand Header'.
- CTRL-X, CTRL-C, CTRL-V, Delete.
- CTRL-A for 'Select All'.
- CTRL-N for 'New Playlist'.
- SHIFT-O for 'Open Folder Containing Selected Item'.
- CTRL-F for 'Playlist Search', SHIFT-F for 'Library Search'.
- CTRL-M for 'Open Playlist Manager'.
- CTRL-Q for 'Add Selected Item to Playback Queue', SHIFT-Q for 'Remove Selected Item from Playback Queue', CTRL-SHIFT-Q for 'Clear Playback Queue'.
- F5 for 'Reload Playlist'.
