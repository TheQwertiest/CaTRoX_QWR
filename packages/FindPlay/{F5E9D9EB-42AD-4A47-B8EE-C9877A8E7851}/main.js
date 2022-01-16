'use strict';

if (typeof my_utils === 'undefined') include('utils.js');

const loadAsync = window.GetProperty('Load Find & Play Asynchronously', true);

async function readFiles(files) {
	for (const file of files) {
		if (window.ID) { // fix pss issue
			await include(my_utils.getScriptPath + file);
		}
	}
}

const files = [
	'helpers.js',
	'properties.js',
	'interface.js',
	'names.js',
	'panel.js',
	'medialibrary.js',
	'text.js',
	'playlists.js',
	'library.js',
	'blacklistvideo.js',
	'web.js',
	'mtags.js',
	'scrollbar.js',
	'autodj.js',
	'albums.js',
	'search.js',
	'buttons.js',
	'images.js',
	'timers.js',
	'menu.js',
	'popupbox.js',
	'initialise.js',
	'callbacks.js'
];

if (loadAsync) {
	readFiles(files).then(() => {
		if (!window.ID) return; // fix pss issue
		on_size();
		window.Repaint();
	});
} else {
	files.forEach(v => include(my_utils.getScriptPath + v));
}