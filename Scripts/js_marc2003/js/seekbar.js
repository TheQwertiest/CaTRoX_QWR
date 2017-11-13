var g_seekbarTimer = undefined;
function startSeekbarTimerFn() {
    if (_.isNil(g_seekbarTimer)) {
        g_seekbarTimer = window.SetInterval(function () {
            if (fb.IsPlaying && !fb.IsPaused && fb.PlaybackLength > 0)
                on_playback_seek();
        }, 100);
    }
}

function stopSeekbarTimerFn() {
    if (!_.isNil(g_seekbarTimer)) {
        clearInterval(g_seekbarTimer);
        g_seekbarTimer = undefined
    }
}

//// Button hover alpha timer
var g_seekbarAlphaTimer = undefined;
function startSeekbarAlphaTimerFn(caller) {
    var buttonHoverInStep = 50,
        buttonHoverOutStep = 15;

    if (_.isNil(g_seekbarAlphaTimer)) {
        g_seekbarAlphaTimer = window.SetInterval(function () {
            if (!caller.hover) {
                caller.hover_alpha = Math.max(0, caller.hover_alpha -= buttonHoverOutStep);
                caller.playback_seek();
            }
            else {
                caller.hover_alpha = Math.min(255, caller.hover_alpha += buttonHoverInStep);
                caller.playback_seek();
            }

            if (caller.hover_alpha === 0 || caller.hover_alpha === 255) {
                stopSeekbarAlphaTimerFn();
            }
        }, 25);
    }
}

function stopSeekbarAlphaTimerFn() {
    if (!_.isNil(g_seekbarAlphaTimer)) {
        clearInterval(g_seekbarAlphaTimer);
        g_seekbarAlphaTimer = undefined
    }
}

_.mixin({
    seekbar: function (x, y, w, h) {
        this.playback_seek = function () {
            var expXY = 2,
                expWH = expXY * 2;

            window.RepaintRect(this.x - expXY, this.y - expXY, this.w + expWH, this.h + expWH);
        };

        this.playback_stop = function () {
            stopSeekbarTimerFn();
            this.playback_seek();
        };

        this.playback_start = function () {
            startSeekbarTimerFn();
        };

        this.playback_pause = function (isPlaying) {
            if (isPlaying)
                stopSeekbarTimerFn();
            else
                startSeekbarTimerFn();
        };

        this.trace = function (x, y) {
            var m = this.drag ? 200 : 0;
            return x > this.x - m && x < this.x + this.w + m && y > this.y - m && y < this.y + this.h + m;
        };

        this.move = function (x, y) {
            if (this.trace(x, y) || this.drag) {
                if (fb.IsPlaying && fb.PlaybackLength > 0) {
                    x -= this.x;
                    this.drag_seek = x < 0 ? 0 : x > this.w ? 1 : x / this.w;

                    if (this.drag) {
                        if (this.show_tt) {
                            this.tt.showImmediate(utils.FormatDuration(fb.PlaybackLength * this.drag_seek));
                        }
                        this.playback_seek();
                    }
                }
                if (!this.hover) {
                    this.hover = true;
                    if (this.show_tt) {
                        this.tt.showDelayed("Seek");
                    }
                    startSeekbarAlphaTimerFn(this);
                }

                return true;
            }
            else {
                if (this.hover) {
                    this.tt.clear();

                    this.hover = false;
                    startSeekbarAlphaTimerFn(this);
                }
                this.drag = false;

                return false;
            }
        };

        this.lbtn_down = function (x, y) {
            if (this.trace(x, y)) {
                if (fb.IsPlaying && fb.PlaybackLength > 0)
                    this.drag = true;
                return true;
            }
            else {
                return false;
            }
        };

        this.lbtn_up = function (x, y) {
            if (this.trace(x, y) || this.drag) {
                if (this.drag) {
                    this.drag = false;
                    fb.PlaybackTime = fb.PlaybackLength * this.drag_seek;
                }
                return true;
            }
            else {
                return false;
            }
        };

        this.leave = function () {
            if (this.drag) {
                return;
            }
            if (this.hover) {
                this.tt.clear();

                this.hover = false;
                startSeekbarAlphaTimerFn(this);
            }
            this.drag = false;
        };

        this.pos = function () {
            return _.ceil(this.w * (this.drag ? this.drag_seek : fb.PlaybackTime / fb.PlaybackLength));
        };

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.hover = false;
        this.hover_alpha = 0;
        this.drag = false;
        this.drag_seek = 0;
        this.show_tt = false;
        this.tt = new _.tt_handler;
    }
});
