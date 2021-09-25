include('helpers.js');

'use strict';

/**
  *@constructor
  */
function _volume(x, y, w, h) {
        this.repaint = () => {
            const expXY = 2,
                expWH = expXY * 2;
            window.RepaintRect(this.x - expXY, this.y - expXY, this.w + expWH, this.h + expWH);
        };
        this.volume_change = () => {
            this.repaint();
        }

        this.trace = (x, y) => {
            const m = this.drag ? 200 : 0;
            return x > this.x - m && x < this.x + this.w + m && y > this.y - m && y < this.y + this.h + m;
        }

        this.wheel = (s) => {
            if (!this.trace(this.mx, this.my)) {
                return false;
            }

            if (s > 0) {
                fb.VolumeUp();
            }
            else {
                fb.VolumeDown();
            }

            if (this.show_tt) {
                var text = fb.Volume.toFixed(2) + " dB (" + _toVolume(fb.Volume) + "%)";
                this.tt.showImmediate(text);
            }

            return true;
        }

        this.move = (x, y) => {
            this.mx = x;
            this.my = y;
            if (this.trace(x, y) || this.drag) {
                x -= this.x;
                const pos = x < 0 ? 0 : x > this.w ? 1 : x / this.w;
                this.drag_vol = _toDb(pos);
                if (this.drag) {
                    fb.Volume = this.drag_vol;
                    if (this.show_tt) {
                        const text = fb.Volume.toFixed(2) + " dB (" + _toVolume(fb.Volume) + "%)";
                        this.tt.showImmediate(text);
                    }

                }

                if (!this.hover) {
                    this.hover = true;
                    if (this.show_tt) {
                        this.tt.showDelayed("Volume");
                    }
                    alpha_timer.start();
                }

                return true;
            }
            else {
                if (this.hover) {
                    this.tt.clear();

                    this.hover = false;
                    alpha_timer.start();
                }
                this.drag = false;

                return false;
            }
        }

        this.lbtn_down = (x, y) => {
            if (this.trace(x, y)) {
                this.drag = true;
                return true;
            }
            else {
                return false;
            }
        }

        this.lbtn_up = (x, y) => {
            if (this.trace(x, y)) {
                if (this.drag) {
                    this.drag = false;
                    fb.Volume = this.drag_vol;
                }
                return true;
            }
            else {
                return false;
            }
        }

        this.leave = () => {
            if (this.drag) {
                return;
            }

            if (this.hover) {
                this.hover = false;
                alpha_timer.start();
            }
            this.tt.clear();
            this.drag = false;
        }

        this.pos = (type) => {
            return _.ceil((type === "h" ? this.h : this.w) * (Math.pow(10, fb.Volume / 50) - 0.01) / 0.99);
        }

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.mx = 0;
        this.my = 0;
        this.hover = false;
        this.hover_alpha = 0;
        this.drag = false;
        this.drag_vol = 0;
        this.show_tt = false;
        this.tt = new _tt_handler;

        var that = this;

        var alpha_timer = new _alpha_timer([that], (item) => {
            return item.hover;
        });
};
