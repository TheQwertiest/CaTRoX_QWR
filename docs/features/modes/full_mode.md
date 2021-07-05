---
title: Full mode
parent: Theme modes
grand_parent: Theme features
nav_order: 1
---

# Full mode
{: .no_toc }

{% assign img = "assets/img/modes/full.png" | relative_url %}
{% include functions/clickable_img.html
  img = img
  alt = "Full mode"
  title = "Full mode"
%}

Full mode is the default mode of the player.

## Table of contents
{: .no_toc .text-delta }

* TOC
{:toc}

---

### Top Panel

Basic description of the currently played track and several buttons:
- (if [foo_scrobble](https://github.com/gix/foo_scrobble) is installed) Toggles Last.FM scrobbling through foo_scrobble component.
- Displays dialog, that is used to search through YouTube.
- (if currently played track is from YouTube) Toggles display of the window with YouTube video associated with the track.

### Left Panel

#### SRC Tab

Panels from these tabs are used to populate playlist:
- SRC > LIB Tab: Your media library as tree.  
  Contains 'Library Tree' script by WilB (see [link](https://hydrogenaud.io/index.php/topic,110938.0.html) for more info).  
- SRC > YT Tab: Generates playlist with YouTube tracks.  
  Contains 'Find & Play' script by WilB (see [link](https://hydrogenaud.io/index.php/topic,105522.0.html) for more info).

#### BIO Tab

Information about the artist of the currently played track:
- Top panel: artist images fetched from Last.FM. Display mode can be configured via right-click menu.  
  Contains slightly modified ['thumbs'](https://github.com/TheQwertiest/smp_2003/blob/master/thumbs.js) script by marc2003.
- Bottom panel: artist biography fetched from Last.FM. Language can be configured via right-click menu.  
  Contains slightly modified ['last.fm bio'](https://github.com/TheQwertiest/smp_2003/blob/master/last.fm%20bio.js) script by marc2003.

#### INF Tab 

Information about the currently played or selected track.
- Top panel: album cover. It can be configured via right-click menu to cycle through available images and\or to display thumbnails of available art.
- Bottom panel: tags pulled from the track. Can be also used to edit metadata values.

#### LYR Tab 

Track's lyrics (if available) via [foo_uie_lyrics3](https://www.foobar2000.org/components/view/foo_uie_lyrics3) component.

#### LAST Tab 

User charts from Last.FM profile. Obviously, it needs a valid Last.FM username to function.   
Contains ['last.fm similar artists - user charts'](https://github.com/TheQwertiest/smp_2003/blob/master/last.fm%20similar%20artists%20%2B%20user%20charts%20%2B%20recent%20tracks.js) script by marc2003.

### Right Panel

- [Playlist](../panels/playlist_panel.md)

### Bottom Panel

- Spectrum visualization provided by [foo_musical_spectrum](https://hydrogenaud.io/index.php/topic,97404.msg814844.html) component. It can be turned off from the seekbar's right-click menu.
- Media controls.
