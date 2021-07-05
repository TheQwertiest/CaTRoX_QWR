class Scrollbar {
	constructor() {
		this.active = true;
		this.cur_active = true;
		this.alpha = 255;
		this.alpha1 = this.alpha;
		this.alpha2 = 255;
		this.but_h = 11;
		this.clock = Date.now();
		this.col = {};
		this.count = -1;
		this.cur_hover = false;
		this.delta = 0;
		this.drag_distance_per_row = 0;
		this.draw_timer = null;
		this.drawBar = true;
		this.elap = 16;
		this.event = 'scroll';
		this.h = 100;
		this.hover = false;
		this.init = true;
		this.item_y = 0;
		this.ix = -1;
		this.inStep = 18;
		this.max_scroll = 0;
		this.ratio = 1;
		this.rows_drawn = 0;
		this.scroll = 0;
		this.scrollable_lines = 0;
		this.start = 0;
		this.text_h = 0;
		this.text_y = 0;
		this.timer_but = null;
		this.x = 0;
		this.y = 0;
		this.w = 11;

		this.bar = {
			isDragging: false,
			h: 0,
			timer: null,
			y: 0
		}

		this.initial = {
			drag: {
				y: 0
			},
			scr: 1,
			y: -1
		}

		this.narrow = {
			show: ppt.sbarShow == 1 ? true : false,
			x: 0
		}

		this.row = {
			count: 0,
			h: 0
		}

		this.scrollbar = {
			cur_zone: false,
			height: 0,
			travel: 0,
			zone: false
		}

		this.touch = {
			dn: false,
			end: 0,
			start: 0,
			amplitude: 0,
			counter: 0,
			frame: 0,
			lastDn: Date.now(),
			min: 10 * $.scale,
			diff: 2 * $.scale,
			offset: 0,
			reference: -1,
			startTime: 0,
			ticker: null,
			timestamp: 0,
			velocity: 1
		}

		this.duration = {
			drag: 200,
			inertia: ppt.durationTouchFlick,
			full: ppt.durationScroll
		}
		this.duration.scroll = Math.round(this.duration.full * 0.8)
		this.duration.step = Math.round(this.duration.full * 2 / 3)
		this.duration.bar = this.duration.full
		this.duration.barFast = this.duration.step;

		this.pageThrottle = $.throttle(dir => {
			this.checkScroll(Math.round((this.scroll + dir * -this.rows_drawn * this.row_h) / this.row_h) * this.row_h, 'full');
		}, 100);

		this.scrollthrottle = $.throttle(() => {
			this.delta = this.scroll;
			this.scrollTo();
		}, 16);

		this.minimiseDebounce = $.debounce(() => {
			if (this.scrollbar.zone) return txt.paint();
			this.narrow.show = true;
			if (ppt.sbarShow == 1) but.setScrollBtnsHide(true, this.type);
			this.scrollbar.zone = this.scrollbar.cur_zone = false;
			this.hover = this.hover_o = false;
			this.alpha = this.alpha1;
			txt.paint();
		}, 1000);

		this.hideDebounce = $.debounce(() => {
			if (this.scrollbar.zone) return;
			this.active = false;
			this.cur_active = this.active;
			this.hover = false;
			this.hover_o = false;
			this.alpha = this.alpha1;
			txt.paint();
		}, 5000);

		this.setCol();
	}

	// Methods

	but(dir) {
		this.checkScroll(Math.round((this.scroll + dir * -this.row_h) / this.row_h) * this.row_h, 'step');
		if (!this.timer_but) {
			this.timer_but = setInterval(() => {
				if (this.count > 6) {
					this.checkScroll(this.scroll + dir * -this.row_h, 'step');
				} else this.count++;
			}, 40);
		}
	}

	calcItem_y() {
		if (this.type == 'alb') {
			this.ix = Math.round(this.delta / this.row_h + 0.4);
			this.item_y = Math.round(this.row_h * this.ix + alb.names.y - this.delta);
		} else {
			this.ix = Math.round(this.delta / this.row_h + 0.4);
			this.item_y = Math.round(this.row_h * this.ix + alb.artists.y - this.delta);
		}
	}

	checkScroll(new_scroll, type) {
		const b = $.clamp(new_scroll, 0, this.max_scroll);
		if (b == this.scroll) return;
		this.scroll = b;
		this.item_y = this.type == 'alb' ? alb.names.y : alb.artists.y;
		if (ppt.smooth) {
			this.event = type || 'scroll';
			this.start = this.delta;
			if (this.event != 'drag') {
				if (this.bar.isDragging && Math.abs(this.delta - this.scroll) > this.scrollbar.height) this.event = 'barFast';
				this.clock = Date.now();
				if (!this.draw_timer) {
					this.scrollTimer();
					this.smoothScroll();
				}
			} else this.scrollDrag();
		} else this.scrollthrottle();
	}

	draw(gr) {
		if (this.drawBar && this.active) {
			let sbar_x = this.x;
			let sbar_w = this.w;
			if (ppt.sbarShow == 1) {
				sbar_x = !this.narrow.show ? this.x : this.narrow.x;
				sbar_w = !this.narrow.show ? this.w : ui.narrowSbarWidth;
			}
			switch (panel.sbar.type) {
				case 0:
					gr.FillSolidRect(sbar_x, this.y + this.bar.y, sbar_w, this.bar.h, this.narrow.show ? this.col[this.alpha2] : !this.bar.isDragging ? this.col[this.alpha] : this.col['max']);
					break;
				case 1:
					if (!this.narrow.show || ppt.sbarShow != 1) gr.FillSolidRect(sbar_x, this.y - panel.sbar.offset, this.w, this.h + panel.sbar.offset * 2, this.col['bg']);
					gr.FillSolidRect(sbar_x, this.y + this.bar.y, sbar_w, this.bar.h, this.narrow.show ? this.col[this.alpha2] : !this.bar.isDragging ? this.col[this.alpha] : this.col['max']);
					break;
				case 2:
					panel.theme.SetPartAndStateID(6, 1);
					if (!this.narrow.show || ppt.sbarShow != 1) panel.theme.DrawThemeBackground(gr, sbar_x, this.y, sbar_w, this.h);
					panel.theme.SetPartAndStateID(3, this.narrow.show ? 2 : !this.hover && !this.bar.isDragging ? 1 : this.hover && !this.bar.isDragging ? 2 : 3);
					panel.theme.DrawThemeBackground(gr, sbar_x, this.y + this.bar.y, sbar_w, this.bar.h);
					break;
			}
		}
	}

	lbtn_dblclk(p_x, p_y) {
		const x = p_x - this.x;
		const y = p_y - this.y;
		let dir;
		if (x < 0 || x > this.w || y < 0 || y > this.h || this.row.count <= this.rows_drawn) return;
		if (y < this.but_h || y > this.h - this.but_h) return;
		if (y < this.bar.y) dir = 1; // above bar
		else if (y > this.bar.y + this.bar.h) dir = -1; // below bar
		if (y < this.bar.y || y > this.bar.y + this.bar.h) this.shiftPage(dir, this.nearest(y));
	}

	lbtn_dn(p_x, p_y) {
		if (!panel.sbar.show && ppt.touchControl) return this.tap(p_y);
		const x = p_x - this.x;
		const y = p_y - this.y;
		let dir;
		if (x > this.w || y < 0 || y > this.h || this.row.count <= this.rows_drawn) return;
		if (x < 0) {
			if (!ppt.touchControl) return;
			else return this.tap(p_y);
		}
		if (y < this.but_h || y > this.h - this.but_h) return;
		if (y < this.bar.y) dir = 1; // above bar
		else if (y > this.bar.y + this.bar.h) dir = -1; // below bar
		if (y < this.bar.y || y > this.bar.y + this.bar.h) this.shiftPage(dir, this.nearest(y));
		else { // on bar
			this.bar.isDragging = true;
			but.Dn = true;
			window.RepaintRect(this.x, this.y, this.w, this.h);
			this.initial.drag.y = y - this.bar.y + this.but_h;
		}
	}

	lbtn_drag_up() {
		if (this.touch.dn) {
			this.touch.dn = false;
			clearInterval(this.touch.ticker);
			if (!this.touch.counter) this.track(true);
			if (Math.abs(this.touch.velocity) > this.touch.min && Date.now() - this.touch.startTime < 300) {
				this.touch.amplitude = ppt.flickDistance * this.touch.velocity * ppt.touchStep;
				this.touch.timestamp = Date.now();
				this.checkScroll(Math.round((this.scroll + this.touch.amplitude) / this.row_h) * this.row_h, 'inertia');
			}
		}
	}

	lbtn_up() {
		if (panel.clicked) return;
		if (!this.hover && this.bar.isDragging) this.paint();
		else window.RepaintRect(this.x, this.y, this.w, this.h);
		if (this.bar.isDragging) {
			this.bar.isDragging = false;
			but.Dn = false;
		}
		this.initial.drag.y = 0;
		if (this.timer_but) {
			clearTimeout(this.timer_but);
			this.timer_but = null;
		}
		this.count = -1;
	}

	leave() {
		if (this.touch.dn) {
			this.touch.dn = false;
		}
		if (!men.right_up) this.scrollbar.zone = false;
		if (!ppt.showAlb || panel.halt()) return;
		this.hover = !this.hover;
		this.paint();
		this.hover = false;
		this.hover_o = false;
	}

	metrics(x, y, w, h, rows_drawn, row_h, text_y, text_h) {
		this.x = x;
		this.y = Math.round(y);
		this.w = w;
		this.h = h;
		this.rows_drawn = rows_drawn;
		this.row_h = row_h;
		this.text_y = text_y;
		this.text_h = text_h;
		this.but_h = panel.but_h;
		// draw info
		this.scrollbar.height = Math.round(this.h - this.but_h * 2);
		this.bar.h = Math.max(Math.round(this.scrollbar.height * this.rows_drawn / this.row.count), $.clamp(this.scrollbar.height / 2, 5, ppt.sbarShow == 2 ? ppt.sbarGripHeight : ppt.sbarGripHeight * 2));
		this.scrollbar.travel = this.scrollbar.height - this.bar.h;
		// scrolling info
		this.scrollable_lines = this.rows_drawn > 0 ? this.row.count - this.rows_drawn : 0;
		this.drawBar = this.scrollable_lines > 0 && this.scrollbar.height > 1;
		this.ratio = this.row.count / this.scrollable_lines;
		this.bar.y = this.but_h + this.scrollbar.travel * (this.delta * this.ratio) / (this.row.count * this.row_h);
		this.drag_distance_per_row = this.scrollbar.travel / this.scrollable_lines;
		// panel info
		this.narrow.x = this.x + this.w - $.clamp(ui.narrowSbarWidth, Math.round(5), this.w);
		ui.style.sel_w = ppt.sbarShow == 2 && this.scrollable_lines > 0 ? panel.w - panel.sbar.sp - ui.style.pad * 2 : panel.w - ui.style.pad * 2;
		alb.sel.x = Math.round(alb.x - alb.x / 2);
		if (panel.sbar.show && !ppt.showSource) alb.sel.x = !alb.extra_sbar.w ? Math.max(alb.sel.x, panel.sbar.sp) + 2 : Math.min(alb.sel.x + 2, ppt.bor);
		alb.sel.w = panel.w - alb.sel.x * 2 - (!alb.extra_sbar.w ? 0 : panel.sbar.sp);
		this.max_scroll = this.scrollable_lines * this.row_h;
		if (ppt.sbarShow != 1) but.setScrollBtnsHide();
	}

	move(p_x, p_y) {
		this.active = true;
		if (p_x > this.x) {
			this.scrollbar.zone = true;
			this.narrow.show = false;
			if (ppt.sbarShow == 1 && this.scrollbar.zone != this.scrollbar.cur_zone) {
				but.setScrollBtnsHide(!this.scrollbar.zone || this.scrollable_lines < 1, this.type);
				this.scrollbar.cur_zone = this.scrollbar.zone;
			}
		} else this.scrollbar.zone = false;
		if (ppt.sbarShow == 1) {
			this.minimiseDebounce();
			this.hideDebounce();
		}
		if (ppt.touchControl) {
			const delta = this.touch.reference - p_y;
			if (delta > this.touch.diff || delta < -this.touch.diff) {
				this.touch.reference = p_y;
				if (ppt.flickDistance) this.touch.offset = $.clamp(this.touch.offset + delta, 0, this.max_scroll);
				if (this.touch.dn) ui.touch_dn_id = -1;
			}
		}
		if (this.touch.dn) {
			const now = Date.now();
			if (now - this.touch.startTime > 300) this.touch.startTime = now;
			this.touch.lastDn = now;
			this.checkScroll(this.initial.scr + (this.initial_y - p_y) * ppt.touchStep, ppt.touchStep == 1 ? 'drag' : 'scroll');
			return;
		}
		const x = p_x - this.x;
		const y = p_y - this.y;
		if (x < 0 || x > this.w || y > this.bar.y + this.bar.h || y < this.bar.y || but.Dn) this.hover = false;
		else this.hover = true;
		if (!this.bar.timer && (this.hover != this.hover_o || this.active != this.cur_active)) {
			this.init = false;
			this.paint();
			this.cur_active = this.active;
		}
		if (!this.bar.isDragging || this.row.count <= this.rows_drawn) return;
		this.checkScroll(Math.round(y - this.initial.drag.y) / this.drag_distance_per_row * this.row_h, 'bar');
	}

	nearest(y) {
		y = (y - this.but_h) / this.scrollbar.height * this.max_scroll;
		y = y / this.row_h;
		y = Math.round(y) * this.row_h;
		return y;
	}

	paint() {
		if (this.init) return;
		this.alpha = this.hover ? this.alpha1 : this.alpha2;
		clearTimeout(this.bar.timer);
		this.bar.timer = null;
		this.bar.timer = setInterval(() => {
			this.alpha = this.hover ? Math.min(this.alpha += this.inStep, this.alpha2) : Math.max(this.alpha -= 3, this.alpha1);
			window.RepaintRect(this.x, this.y, this.w, this.h);
			if (this.hover && this.alpha == this.alpha2 || !this.hover && this.alpha == this.alpha1) {
				this.hover_o = this.hover;
				clearTimeout(this.bar.timer);
				this.bar.timer = null;
			}
		}, 25);
	}

	position(Start, End, Elapsed, Duration, Event) {
		if (Elapsed > Duration) return End;
		if (Event == 'drag') return;
		const n = Elapsed / Duration;
		return Start + (End - Start) * ease[Event](n);
	}

	reset() {
		this.delta = this.scroll = 0;
		this.item_y = this.type == 'alb' ? alb.names.y : alb.artists.y;
	}

	resetAuto() {
		this.minimiseDebounce.cancel();
		this.hideDebounce.cancel();
		if (!panel.sbar.show) but.setScrollBtnsHide(true);
		if (panel.sbar.show == 1) {
			this.scrollbar.zone = this.scrollbar.cur_zone = false;
			but.setScrollBtnsHide(true, 'both');
			this.narrow.show = true;
		}
		if (panel.sbar.show == 2) but.setScrollBtnsHide(!ppt.showAlb, 'both');
	}

	scrollDrag() {
		this.delta = this.scroll;
		this.scrollTo();
		this.calcItem_y();
	}

	scrollFinish() {
		if (!this.draw_timer) return;
		this.delta = this.scroll;
		this.scrollTo();
		this.calcItem_y();
		clearTimeout(this.draw_timer);
		this.draw_timer = null;
	}

	scrollTimer() {
		this.draw_timer = setInterval(() => {
			if (panel.w < 1 || !window.IsVisible) return;
			this.smoothScroll();
		}, 16);
	}

	scrollTo() {
		this.bar.y = this.but_h + this.scrollbar.travel * (this.delta * this.ratio) / (this.row.count * this.row_h);
		if (txt.rp) window.RepaintRect(0, this.text_y, panel.w, this.text_h + 5);
	}

	scrollToEnd() {
		this.checkScroll(this.max_scroll, 'full');
	}

	setCol() {
		let opaque = false;
		this.alpha = !ui.sbarCol ? 75 : (!panel.sbar.type ? 68 : 51);
		this.alpha1 = this.alpha;
		this.alpha2 = !ui.sbarCol ? 128 : (!panel.sbar.type ? 119 : 85);
		this.inStep = panel.sbar.type && ui.sbarCol ? 12 : 18;
		switch (panel.sbar.type) {
			case 0:
				switch (ui.sbarCol) {
					case 0:
						for (let i = 0; i < this.alpha2 - this.alpha + 1; i++) this.col[this.alpha + i] = opaque ? $.RGBAtoRGB(RGBA(ui.col.t, ui.col.t, ui.col.t, this.alpha + i), ui.col.bg) : RGBA(ui.col.t, ui.col.t, ui.col.t, this.alpha + i);
						this.col.max = opaque ? $.RGBAtoRGB(RGBA(ui.col.t, ui.col.t, ui.col.t, 192), ui.col.bg) : RGBA(ui.col.t, ui.col.t, ui.col.t, 192);
						break;
					case 1:
						for (let i = 0; i < this.alpha2 - this.alpha + 1; i++) this.col[this.alpha + i] = opaque ? $.RGBAtoRGB(ui.col.text & RGBA(255, 255, 255, this.alpha + i), ui.col.bg) : ui.col.text & RGBA(255, 255, 255, this.alpha + i);
						this.col.max = opaque ? $.RGBAtoRGB(ui.col.text & 0x99ffffff, ui.col.bg) : ui.col.text & 0x99ffffff;
						break;
				}
				break;
			case 1:
				switch (ui.sbarCol) {
					case 0:
						this.col.bg = opaque ? $.RGBAtoRGB(RGBA(ui.col.t, ui.col.t, ui.col.t, 15), ui.col.bg) : RGBA(ui.col.t, ui.col.t, ui.col.t, 15);
						for (let i = 0; i < this.alpha2 - this.alpha + 1; i++) this.col[this.alpha + i] = opaque ? $.RGBAtoRGB(RGBA(ui.col.t, ui.col.t, ui.col.t, this.alpha + i), ui.col.bg) : RGBA(ui.col.t, ui.col.t, ui.col.t, this.alpha + i);
						this.col.max = opaque ? $.RGBAtoRGB(RGBA(ui.col.t, ui.col.t, ui.col.t, 192), ui.col.bg) : RGBA(ui.col.t, ui.col.t, ui.col.t, 192);
						break;
					case 1:
						this.col.bg = opaque ? $.RGBAtoRGB(ui.col.text & 0x15ffffff, ui.col.bg) : ui.col.text & 0x15ffffff;
						for (let i = 0; i < this.alpha2 - this.alpha + 1; i++) this.col[this.alpha + i] = opaque ? $.RGBAtoRGB(ui.col.text & RGBA(255, 255, 255, this.alpha + i), ui.col.bg) : ui.col.text & RGBA(255, 255, 255, this.alpha + i);
						this.col.max = opaque ? $.RGBAtoRGB(ui.col.text & 0x99ffffff, ui.col.bg) : ui.col.text & 0x99ffffff;
						break;
				}
				break;
		}
	}

	setRows(row_count) {
		if (!row_count) this.item_y = this.type == 'alb' ? alb.names.y : alb.artists.y;
		this.row.count = row_count;
		this.metrics(this.x, this.y, this.w, this.h, this.rows_drawn, this.row_h, this.text_y, this.text_h);
	}

	shift(dir, nearest_y) {
		let target = Math.round((this.scroll + dir * -this.rows_drawn * this.row_h) / this.row_h) * this.row_h;
		if (dir == 1) target = Math.max(target, nearest_y);
		else target = Math.min(target, nearest_y);
		return target;
	}

	shiftPage(dir, nearest_y) {
		this.checkScroll(this.shift(dir, nearest_y), 'full');
		if (!this.timer_but) {
			this.timer_but = setInterval(() => {
				if (this.count > 1) {
					this.checkScroll(this.shift(dir, nearest_y), 'full');
				} else this.count++;
			}, 100);
		}
	}

	smoothScroll() {
		this.delta = this.position(this.start, this.scroll, Date.now() - this.clock + this.elap, this.duration[this.event], this.event);
		if (Math.abs(this.scroll - this.delta) > 0.5) this.scrollTo();
		else this.scrollFinish();
	}

	tap(p_y) {
		if (this.touch.amplitude) {
			this.clock = 0;
			this.scroll = this.delta;
		}
		this.touch.counter = 0;
		this.initial.scr = this.scroll;
		this.touch.dn = true;
		this.initial_y = this.touch.reference = p_y;
		if (!this.touch.offset) this.touch.offset = p_y;
		this.touch.velocity = this.touch.amplitude = 0;
		if (!ppt.flickDistance) return;
		this.touch.frame = this.touch.offset;
		this.touch.startTime = this.touch.timestamp = Date.now();
		clearInterval(this.touch.ticker);
		this.touch.ticker = setInterval(() => this.track, 100);
	}

	track(initial) {
		let now, elapsed, delta, v;
		this.touch.counter++;
		now = Date.now();
		if (now - this.touch.lastDn < 10000 && this.touch.counter == 4) {
			ui.touch_dn_id = -1;
			panel.id.last_pressed_coord = {
				x: -1,
				y: -1
			}
		}
		elapsed = now - this.touch.timestamp;
		if (initial) elapsed = Math.max(elapsed, 32);
		this.touch.timestamp = now;
		delta = this.touch.offset - this.touch.frame;
		this.touch.frame = this.touch.offset;
		v = 1000 * delta / (1 + elapsed);
		this.touch.velocity = 0.8 * v + 0.2 * this.touch.velocity;
	}

	wheel(step) {
		this.checkScroll(Math.round((this.scroll + step * -(!ppt.scrollStep ? this.rows_drawn : ppt.scrollStep) * this.row_h) / this.row_h) * this.row_h, ppt.scrollStep ? 'step' : 'full');
	}
}