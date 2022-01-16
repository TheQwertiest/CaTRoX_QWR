'use strict'

include('Common.js');

function on_paint(gr) {
    gr.DrawString(
        'This is an utility package. Does nothing by itself',
        gdi.Font('Segoe UI', 12), 
        0xFF000000, 0, 0, 0, 0);
}