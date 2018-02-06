# Changelog

## [Unreleased]

## [4.1.0] - 2018-02-06
### Added
- Added compatibility fixes for vanilla JScript v2.0.0 component.
- Track Info Panel:
  - Added ability to add, copy, edit and remove metadata tags (through double-click and context menu).
  - Added tooltips on hover, which display full tag value.
  - Made possible to hide file info tags and show only metadata tags.
  - Added animation on mouse click.
- Playlist Panel:
  - Added ESplaylist-like ability to customize grouping presets:
    - Presets can be added, changed, moved and removed. 
    - Customizable title and sub-title queries in group header. 
  - Added CTRL-SHIFT-up/down hotkeys - moves selection up/down.
  - Added 'pressed' animation to playlist manager.
- Context Menus: developer context menu (accessible via SHIFT-right-click) now contains all base panel scripts in it's 'Edit panel scripts' sub-menu. 

### Changed
- Updated WilB's scripts:
  - Library Tree 1.3.9.2.
  - YouTube Track Manager 3.9.4.
- Track Info Panel: rewritten from scratch.
- Playlist Panel: date and album are not displayed now in compact header if empty.
- Various performance improvements.
- Updated theme.fcl:
  - Added compatibility fixes for vanilla JScript v2.0.0 component.
  - Added new script files.
  - Changed default panel properties.
- Major internal changes.

### Fixed
- Fixed crashes when starting fb2k in minimized state.
- Playlist Panel:
  - List padding (set via panel properties) is respected now.
  - Fixed incorrect scroll position that appeared in some cases.
  - Fixed invalid drag-n-drop position.
  - Fixed various errors with drag-n-drop on empty playlist area.  
  - Fixed invalid position of CTRL-V pasted items.
  - Fixed CTRL-X not removing cut item.
  - Fixed various crashes during playlist navigation while focused track is not set.
  - Fixed grouping settings not respecting playlist changes.
- Cover Panel:
  - Fixed 'Loading' text being stuck on script load.
  - Fixed crashes when track is deleted during art load. 

## [4.0.5] - 2018-01-10
### Added
- Art Mode: title queries and title cycle interval can be configured now through Panel Properties.

### Changed
- Art Mode: empty title text is skipped skipped now.
- Top Panel: adjusted fb2k logo color :D

### Fixed
- Playlist Panel: fixed various errors with custom grouping query.
- Menu Panel: fixed pseudo caption not always working.
- Fixed wrong window sizes on player Mode change when FrameStyle is other than NoBorder.
- Removed unneeded resizes on mode change.

## [4.0.4] - 2017-12-24
### Changed 
- Playlist: date and album now won't be displayed if unavailable (previously was displayed as '?').
- Better handling of vanilla JScript component.

### Fixed
- Updated theme.fcl: fixed inability to use theme with standard fb2k installation.
- Playlist Panel: clicking on Header now always selects all it's rows.
- Top Panel: compatibility fixes for foo_youtube v2.2.
- Menu Panel: fixed some buttons not responding after changing border mode.

## [4.0.3] - 2017-12-04
### Added
- Track Info Panel: added ability to change tracking mode (auto/playing/selected).
- Playlist Panel: header grouping type is now synced between Playlist Mode and Full Mode.

### Changed 
- Top Panel: Made 'Last.FM Scrobbling Disabled' icon a bit prettier ^^.
- Updated theme.fcl: moved timeout shim to helpers.js.
- Compiled latest foo_jscript_panel with extensions (v1.3.2.1).

### Fixed
- Art Mode: fixed cropped 'mute' button.
- Playlist Panel: 
  - Fixed text overlapping with lock image.
  - Fixed lock image not appearing after locking playlist.
  - Fixed list width not adjusting when scrollbar disappears\appears.
  - Fixed inconsistencies with queue position display.
- Cover Panel:
  - Fixed panel being stuck with "Loading" text.
  - Fixed thumb images not clearing on track change.
  - Fixed crash on resize.
  - Fixed small text in thumb placeholders.
  - Fixed thumb placeholder placement.
- Added missing menu separators to context menus.
- Fixed theme not adjusting window size correctly after import.

## [4.0.2b] - 2017-11-24
### Fixed
- Fixed UTF8 encoding related crashes.
- First time launch resizes window properly now.
- Updated theme.fcl:
  - Fixed crash when clicking on volume bar in Playlist Mode ( again ).

## [4.0.2a] - 2017-11-23
### Changed 
- Updated theme.fcl:
  - Removed unused CUI layout.

### Fixed
- Updated theme.fcl:
  - Fixed crash when clicking on volume bar in Playlist Mode.

## [4.0.2] - 2017-11-23
### Changed 
- First theme launch now sets window size according to player mode.
- Updated theme.fcl:
  - Spectrum visualization is now enabled by default.

### Fixed
- Fixed crash on LAST tab when 'similar artists' mode is chosen.
- Fixed bug: 'thumbs' panel on BIO tab was not downloading images.

## [4.0.1] - 2017-11-23
### Added
- Top Panel: foo_scrobble integration - added button to toggle Last.FM scrobbling.

### Changed 
- Updated WilB's Library Tree to 1.3.9.1.
- Updated theme.fcl.
- Compiled latest foo_jscript_panel with extensions (v1.3.1).

### Fixed
- Various small bugfixes.

## [4.0.0] - 2017-11-20
### Added
- Playlist: rewritten from scratch.
- Playlist: added per playlist grouping.
- Playlist: expansion/collapse of headers can be done by right/left arrow buttons.
- Playlist: all playlist changes now can be roll-backed with Edit > Undo.

### Changed 
- Playlist: removed ability to skip tracks when rating is lower than specified. Use [foo_skip](https://www.foobar2000.org/components/view/foo_skip) component instead.
- Playlist: expansion/collapse of headers is now done by CTRL-SHIFT-click instead of double-click.
- Playlist: small design changes.
- Playlist: cleaned up right-click context menu.
- Updated code for compatibility with JScript 1.3.1 changes.
- Technical: updated lodash to 4.17.4.
- Technical: refactored lots of code.
- Compiled latest foo_jscript_panel with extensions (v1.3.1beta).

### Fixed
- Fixed glitched window shadow.
- Playlist and Cover: fixed art stretching.
- Playlist: fixed inconsistent selection behaviour.
- Playlist: fixed inconsistent drag-drop behaviour.
- Playlist: fixed genre display in group info.
- Playlist: fixed various small bugs.

## [3.0.0]
### Added
- Added Art Mode.
- Playlist Mode: added hidden volume bar.
- Scrollbar: rewritten from scratch.

### Changed
- Now using modded foo_jscript_panel instead of vanilla one, for extensions.

## [2.0.0]
### Added
- Added Playlist Mode.
- Added alpha animations to various ui elements.
- Full Mode: added Spectrum Visualization with ability to disable it.

### Changed
- Replaced all button handling with code from helpers.js.

## [1.0.0]
### Changed
- Migrated to JScript component from WSHScript component.

### Fixed
- Fixed various crashes caused by incompatibility with JScript.

[Unreleased]: https://github.com/theqwertiest/CaTRoX_QWR/compare/v4.1.0...HEAD
[4.1.0]: https://github.com/theqwertiest/CaTRoX_QWR/compare/v4.0.5...v4.1.0
[4.0.5]: https://github.com/theqwertiest/CaTRoX_QWR/compare/v4.0.4...v4.0.5
[4.0.4]: https://github.com/theqwertiest/CaTRoX_QWR/compare/v4.0.3...v4.0.4
[4.0.3]: https://github.com/theqwertiest/CaTRoX_QWR/compare/v4.0.2b...v4.0.3
[4.0.2b]: https://github.com/theqwertiest/CaTRoX_QWR/compare/v4.0.2a...v4.0.2b
[4.0.2a]: https://github.com/theqwertiest/CaTRoX_QWR/compare/v4.0.2...v4.0.2a
[4.0.2]: https://github.com/theqwertiest/CaTRoX_QWR/compare/v4.0.1...v4.0.2
[4.0.1]: https://github.com/theqwertiest/CaTRoX_QWR/compare/v4.0.0...v4.0.1
[4.0.0]: https://github.com/theqwertiest/CaTRoX_QWR/compare/v3.0.0...v4.0.0
