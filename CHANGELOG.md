# Changelog

## [Unreleased]

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

[Unreleased]: https://github.com/theqwertiest/CaTRoX_QWR/compare/v4.0.2b...HEAD
[4.0.2b]: https://github.com/theqwertiest/CaTRoX_QWR/compare/v4.0.2a...v4.0.2b
[4.0.2a]: https://github.com/theqwertiest/CaTRoX_QWR/compare/v4.0.2...v4.0.2a
[4.0.2]: https://github.com/theqwertiest/CaTRoX_QWR/compare/v4.0.1...v4.0.2
[4.0.1]: https://github.com/theqwertiest/CaTRoX_QWR/compare/v4.0.0...v4.0.1
[4.0.0]: https://github.com/theqwertiest/CaTRoX_QWR/compare/v3.0.0...v4.0.0