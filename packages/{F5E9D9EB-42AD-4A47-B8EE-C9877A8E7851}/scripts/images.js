class Images {
	constructor() {
		this.artist = '';
		this.blur = null;
		this.cur_handle = null;
		this.cur = null;
		this.get = true;
		this.init = true;
		this.nh = 10;
		this.noimg = [];
		this.nw = 10;
		this.ny = 0;
		this.x = 0;
		this.y = 0;
		this.exclArr = [6473, 6500, 24104, 24121, 34738, 35875, 37235, 68626, 86884, 92172];

		this.art = {
			allFilesLength: 0,
			done: false,
			folder: '',
			images: [],
			includeLarge: false,
			ix: 0
		}

		this.blackList = {
			file: `${fb.ProfilePath}yttm\\blacklist_image.json`,
			artist: '',
			cur: '',
			item: [],
			undo: []
		}

		this.bor = {
			w1: 0,
			w2: 0
		}

		this.cov = {
			newBlur: false,
			blur: null
		}

		this.id = {
			artist: '',
			blur: '',
			cur_img: '',
			cur_blur: '',
			img: ''
		}

		this.im = {
			l: 0,
			t: 0,
			w: 100,
			h: 100
		}

		this.mask = {
			circular: null,
			reflection: null
		}

		ppt.reflStrength = $.clamp(ppt.reflStrength, 0, 100);
		ppt.reflGradient = $.clamp(ppt.reflGradient, 0, 100);
		ppt.reflSize = $.clamp(ppt.reflSize, 0, 100);

		this.refl = {
			adjust: false,
			gradient: ppt.reflGradient / 10 - 1,
			size: $.clamp(ppt.reflSize / 100, 0.1, 1),
			strength: $.clamp(255 * ppt.reflStrength / 100, 0, 255)
		}

		this.style = {
			alpha: 255,
			circular: false
		}

		this.touch = {
			dn: false,
			end: 0,
			start: 0
		}

		this.transition = {
			level: $.clamp(100 - ppt.transLevel, 0.1, 100)
		}

		this.transition.incr = Math.pow(284.2171 / this.transition.level, 0.0625);
		if (this.transition.level == 100) this.transition.level = 255;

		this.focusLoad = $.debounce(() => {
			this.on_playback_new_track();
		}, 250, {
			'leading': true,
			'trailing': true
		});

		this.focusServer = $.debounce(() => {
			if (ppt.dl_art_img) dl_art.run();
		}, 5000, {
			'leading': true,
			'trailing': true
		});

		this.setPhoto = $.debounce(() => {
			if (this.art.ix < 0) this.art.ix = this.art.images.length - 1;
			else if (this.art.ix >= this.art.images.length) this.art.ix = 0;
			this.loadArtImage();
			timer.image();
		}, 100);

		this.set('circular');
		this.createImages();
	}

	// Methods

	artistReset() {
		this.blurCheck();
		const cur_id = this.id.artist;
		this.artist = name.artist();
		this.id.artist = this.artist + (!ui.style.isBlur ? '' : panel.isVideo());
		const new_artist = this.artist && this.id.artist != cur_id || !this.artist || ppt.covBlur && ui.style.isBlur && this.id.blur != this.id.cur_blur;
		if (new_artist) {
			this.art.folder = panel.cleanPth(ppt.imgArtPth);
			this.clearArtCache(true);
			if (ppt.cycPhoto) this.art.done = false;
			this.art.allFilesLength = 0;
			this.art.ix = 0;
		}
	}

	blacklist(clean_artist) {
		let black_list = [];
		if (!$.file(this.blackList.file)) return black_list;
		const list = $.jsonParse(this.blackList.file, false, 'file');
		return list.blacklist[clean_artist] || black_list;
	}

	blackListed(v) {
		img.blackList.cur = this.blackList.artist;
		this.blackList.artist = this.artist || name.artist();
		if (this.blackList.artist && this.blackList.artist != img.blackList.cur) {
			this.blackList.item = this.blacklist($.clean(this.blackList.artist).toLowerCase());
		}
		return this.blackList.item.includes(v.slice(v.lastIndexOf('_') + 1));
	}

	blurCheck() {
		if (!(ppt.covBlur && ui.style.isBlur) && !ppt.imgSmoothTrans) return;
		this.id.cur_blur = this.id.blur;
		this.id.blur = !$.eval('[%album%]') ? $.eval('%album artist%%path%') : $.eval('%album artist%%album%%discnumber%%date%');
		if (this.id.blur != this.id.cur_blur) this.cov.newBlur = true;
	}

	blurImage(image, o) {
		if (!image || !panel.w || !panel.h) return;
		if (ppt.covBlur && ui.style.isBlur && ppt.artistView && this.cov.newBlur) {
			this.cov.blur = null;
			const handle = $.handle(ppt.focus);
			if (handle) this.cov.blur = utils.GetAlbumArtV2(handle, 0);
			if (!this.cov.blur) this.cov.blur = this.noimg[0].Clone(0, 0, this.noimg[0].Width, this.noimg[0].Height);
			this.cov.newBlur = false;
			if (this.cov.blur && !ppt.blurAutofill) this.cov.blur = this.cov.blur.Resize(panel.w, panel.h);
		}
		if (ppt.covBlur && ui.style.isBlur && ppt.artistView && this.cov.blur) image = this.cov.blur;
		image = ppt.blurAutofill ? this.format(image, 'crop', panel.w, panel.h, 'blurAutofill', o) : this.format(image, 'stretch', panel.w, panel.h, 'blurStretch', o);
		const blurImg = $.gr(panel.w, panel.h, true, (g, gi) => {
			g.SetInterpolationMode(0);
			if (ui.blur.blend) {
				const iSmall = image.Resize(panel.w * ui.blur.level / 100, panel.h * ui.blur.level / 100, 2);
				const iFull = iSmall.Resize(panel.w, panel.h, 2);
				const offset = 90 - ui.blur.level;
				g.DrawImage(iFull, 0 - offset, 0 - offset, panel.w + offset * 2, panel.h + offset * 2, 0, 0, iFull.Width, iFull.Height, 0, ui.blur.blendAlpha);
			} else {
				g.DrawImage(image, 0, 0, panel.w, panel.h, 0, 0, image.Width, image.Height);
				if (ui.blur.level > 1) gi.StackBlur(ui.blur.level);
				g.FillSolidRect(0, 0, panel.w, panel.h, this.isImageDark(gi) ? ui.col.bg_light : ui.col.bg_dark);
			}
		});
		return blurImg;
	}

	cache() {
		return ppt.artistView ? art : cov;
	}

	chkArtImg() {
		this.clearArtCache(true);
		this.clearCovCache();
		this.art.done = false;
		this.art.allFilesLength = 0;
		this.art.ix = 0;
		if (ppt.artistView && ppt.cycPhoto) this.getArtImg();
		else this.getFbImg();
	}

	change(incr) {
		this.art.ix += incr;
		if (this.art.ix < 0) this.art.ix = this.art.images.length - 1;
		else if (this.art.ix >= this.art.images.length) this.art.ix = 0;
		this.loadArtImage();
	}

	circularMask(image, tw, th) {
		image.ApplyMask(this.mask.circular.Resize(tw, th));
	}

	clearCovCache() {
		cov.cache = {};
	}

	clearArtCache(fullClear) {
		if (fullClear) this.art.images = [];
		art.cache = {};
	}

	createImages() {
		const cc = StringFormat(1, 1);
		const font1 = gdi.Font('Segoe UI', 230, 1);
		const font2 = gdi.Font('Segoe UI', 120, 1);
		const font3 = gdi.Font('Segoe UI', 200, 1);
		const font4 = gdi.Font('Segoe UI', 90, 1);
		const tcol = !ui.blur.dark && !ui.blur.light || !ppt.imgBorder ? ui.col.text : ui.dui ? window.GetColourDUI(0) : window.GetColourCUI(0);
		const sz = 600;
		for (let i = 0; i < 3; i++) {
			this.noimg[i] = $.gr(sz, sz, true, g => {
				g.SetSmoothingMode(2);
				if (!ui.blur.dark && !ui.blur.light || ppt.imgBorder) {
					g.FillSolidRect(0, 0, sz, sz, tcol);
					g.FillGradRect(-1, 0, sz + 5, sz, 90, ui.col.bg & 0xbbffffff, ui.col.bg, 1.0);
				}
				g.SetTextRenderingHint(3);
				g.DrawString('NO', i == 2 ? font3 : font1, tcol & 0x25ffffff, 0, 0, sz, sz * 275 / 500, cc);
				g.DrawString(['COVER', 'PHOTO', 'SELECTION'][i], i == 2 ? font4 : font2, tcol & 0x20ffffff, 0, sz * 166 / 500, sz, sz * 275 / 500, cc);
				g.FillSolidRect((sz - 380) / 2, sz * 400 / 500, 380, 20, tcol & 0x15ffffff);
			});
		}
		this.mask.circular = $.gr(500, 500, true, g => {
			g.FillSolidRect(0, 0, 500, 500, RGB(255, 255, 255));
			g.SetSmoothingMode(2);
			g.FillEllipse(1, 1, 498, 498, RGBA(0, 0, 0, 255));
		});
		this.get = true;
	}

	cur_pth() {
		return this.cache().pth;
	}

	draw(gr) {
		if (this.get && panel.video.mode && !ppt.showAlb) panel.setVideo();
		if (!panel.image.show || ppt.showAlb && !ui.style.isBlur) return;
		if (ui.style.isBlur && this.blur) gr.DrawImage(this.blur, 0, 0, this.blur.Width, this.blur.Height, 0, 0, this.blur.Width, this.blur.Height);
		if (this.get) return this.getImgFallback();
		if (!ppt.showAlb && (!panel.video.show || !panel.isVideo()) && this.cur && !ui.style.textOnly) gr.DrawImage(this.cur, this.x, this.y, this.cur.Width, this.cur.Height, 0, 0, this.cur.Width, this.cur.Height, 0, this.style.alpha);
	}

	format(image, type, w, h, caller, o, blur, border, reflection) {
		let ix = 0;
		let iy = 0;
		let iw = image.Width;
		let ih = image.Height
		switch (type) {
			case 'circular':
			case 'crop': {
				const s1 = iw / this.im.w;
				const s2 = ih / this.im.h;
				if (s1 > s2) {
					iw = Math.round(this.im.w * s2);
					ix = Math.round((image.Width - iw) / 2);
				} else {
					ih = Math.round(this.im.h * s1);
					iy = Math.round((image.Height - ih) / 8);
				}
				image = image.Clone(ix, iy, iw, ih);

				if (caller == 'blurAutofill') return image;

				if (type == 'circular') this.circularMask(image, image.Width, image.Height);
				if (!border) image = image.Resize(w, h, 2);
				break;
			}
			case 'stretch':
				image = image.Resize(w, h, 2);
				if (caller == 'blurStretch') return image;
				break;
			default: {
				const sc = Math.min(h / ih, w / iw);
				this.im.w = Math.round(iw * sc);
				this.im.h = Math.round(ih * sc);
				if (!border) image = image.Resize(this.im.w, this.im.h, 2);
				break;
			}
		}

		this.im.l = Math.round((this.nw - this.im.w) / 2) + (border > 1 && !reflection ? 10 * $.scale : 0);
		this.im.t = Math.round((this.nh - this.im.h) / 2 + this.ny);

		if (border) image = this.getBorder(image, this.im.w, this.im.h, this.bor.w1, this.bor.w2);
		o.x = this.x = this.im.l;
		o.y = this.y = this.im.t;
		if (reflection) image = this.reflImage(image, this.im.l, this.im.t, image.Width, image.Height, o);
		if (blur) {
			o.blur = this.blurImage(blur, o);
			this.blur = o.blur;
		}
		return image;
	}

	getArtImages() {
		if (!ppt.dl_art_img && !timer.dl.id) timer.decelerating();
		const allFiles = this.art.folder ? utils.Glob(this.art.folder + '*') : [];
		if (allFiles.length == this.art.allFilesLength) return;
		let newArr = false;
		if (!this.art.images.length) {
			newArr = true;
			art.cache = {};
		}
		this.art.allFilesLength = allFiles.length;
		const arr = allFiles.filter(this.images.bind(this));
		this.art.images = this.art.images.concat(arr);
		if (this.art.images.length > 1) this.art.images = this.uniq(this.art.images);
		if (newArr && this.art.images.length > 1) this.art.images = $.shuffle(this.art.images);
		this.updSeeker();
	}

	getBorder(image, w, h, bor_w1, bor_w2) {
		const imgo = 7;
		const dpiCorr = ($.scale - 1) * imgo;
		const imb = imgo - dpiCorr;
		let imgb = 0;
		let sh_img = null;
		if (ppt.imgShadow && !ppt.imgReflection) {
			imgb = 15 + dpiCorr;
			sh_img = $.gr(Math.floor(w + bor_w2 + imb), Math.floor(h + bor_w2 + imb), true, g => !this.style.circular ? g.FillSolidRect(imgo, imgo, w + bor_w2 - imgb, h + bor_w2 - imgb, RGB(0, 0, 0)) : g.FillEllipse(imgo, imgo, w + bor_w2 - imgb, h + bor_w2 - imgb, RGB(0, 0, 0)));
			sh_img.StackBlur(12);
		}
		let bor_img = $.gr(Math.floor(w + bor_w2 + imgb), Math.floor(h + bor_w2 + imgb), true, g => {
			if (ppt.imgShadow && !ppt.imgReflection) g.DrawImage(sh_img, 0, 0, Math.floor(w + bor_w2 + imgb), Math.floor(h + bor_w2 + imgb), 0, 0, sh_img.Width, sh_img.Height);
			if (ppt.imgBorder) {
				if (!this.style.circular) g.FillSolidRect(0, 0, w + bor_w2, h + bor_w2, RGB(255, 255, 255));
				else {
					g.SetSmoothingMode(2);
					g.FillEllipse(0, 0, w + bor_w2, h + bor_w2, RGB(255, 255, 255));
				}
			}
			g.DrawImage(image, bor_w1, bor_w1, w, h, 0, 0, image.Width, image.Height);
		});
		sh_img = null;
		return bor_img;
	}

	getCallerId(key) {
		const a = art.cache[key];
		return {
			art_id: a && a.id
		};
	}

	getImgFallback() {
		if (ppt.artistView && ppt.cycPhoto) {
			timer.image();
			this.artistReset();
			this.getArtImg();
		} else this.getFbImg();
		this.get = false;
	}

	getArtImg(update) {
		if (!ppt.artistView) return;
		if (!this.art.done || update) {
			this.art.done = true;
			if (this.artist && ppt.cycPhoto) this.getArtImages();
		}
		this.loadArtImage();
	}
	getFbImg() {
		this.blurCheck();
		this.cur_handle = $.handle(ppt.focus);
		if (this.cur_handle) return utils.GetAlbumArtAsync(window.ID, this.cur_handle, ppt.artistView ? 4 : 0);
		if (fb.IsPlaying && this.cur_handle) return;
		if (this.cache().cacheHit('noitem')) return;
		let image = this.noimg[2];
		if (!image) return;
		this.cache().cacheIt(image, 'noitem');
	}

	images(v) {
		if (!$.file(v)) return false;
		const fileSize = utils.GetFileSize(v);
		return ((this.art.includeLarge || fileSize <= 8388608) && (name.isLfmImg(fso.GetFileName(v), this.artist) || /(?:jpe?g|gif|png|bmp)$/i.test(fso.GetExtensionName(v)) && !/ - /.test(fso.GetBaseName(v))) && !this.exclArr.includes(fileSize) && !this.blackListed(v));
	}

	isBlur(image) {
		return ui.style.isBlur ? image.Clone(0, 0, image.Width, image.Height) : null;
	}

	isImageDark(image) {
		const colorSchemeArray = JSON.parse(image.GetColourSchemeJSON(15));
		let rTot = 0;
		let gTot = 0;
		let bTot = 0;
		let freqTot = 0;
		colorSchemeArray.forEach(v => {
			const col = $.toRGB(v.col);
			rTot += col[0] ** 2 * v.freq;
			gTot += col[1] ** 2 * v.freq;
			bTot += col[2] ** 2 * v.freq;
			freqTot += v.freq;
		});
		const avgCol = [$.clamp(Math.round(Math.sqrt(rTot / freqTot)), 0, 255), $.clamp(Math.round(Math.sqrt(gTot / freqTot)), 0, 255), $.clamp(Math.round(Math.sqrt(bTot / freqTot)), 0, 255)];
		return ui.getSelCol(avgCol, true, true) == 50 ? true : false;
	}

	lbtn_dn(p_x) {
		if (!ppt.touchControl) return;
		this.touch.dn = true;
		this.touch.start = p_x;
	}

	lbtn_up(x, y) {
		if (y > Math.min(panel.h * panel.image.size, panel.h - this.ny) || seeker.dn) return;
		ppt.toggle('artistView');
		this.set('circular');
		if (ppt.artistView && ppt.cycPhoto) {
			this.getArtImg(this.artistReset());
			timer.image();
		} else {
			this.getFbImg();
			timer.clear(timer.img);
		}
		this.updSeeker();
	}

	leave() {
		if (this.touch.dn) {
			this.touch.dn = false;
			this.touch.start = 0;
		}
	}

	loadArtImage() {
		if (this.art.images.length > 0) {
			const key = this.art.images[this.art.ix];
			if (art.cacheHit(key)) return;
			art.cache[key] = {
				id: this.art.ix
			};
			gdi.LoadImageAsync(window.ID, key);
		} else if (!this.init) this.getFbImg();
	}

	metrics() {
		this.nw = Math.round(panel.w - (ppt.imgShadow && !ppt.imgReflection ? 20 * $.scale : 0));
		this.ny = Math.round(panel.image.size != 1 ? ppt.bor * 0.625 + 16 : 0);
		this.nh = Math.round(panel.image.size != 1 ? Math.min(panel.h * panel.image.size - this.ny, panel.h - this.ny * 2) : panel.h - (ppt.imgShadow && !ppt.imgReflection ? 10 * $.scale : 0));
		if (ppt.imgBorder) {
			const i_sz = $.clamp(this.nh, 0, this.nw) / $.scale;
			this.bor.w1 = !i_sz || i_sz > 500 ? 5 * $.scale : Math.ceil(5 * $.scale * i_sz / 500);
		} else this.bor.w1 = 0;
		this.bor.w2 = this.bor.w1 * 2;
		this.nw = Math.max(this.nw - this.bor.w2, 10);
		this.nh = Math.max(this.nh - this.bor.w2, 10);
		this.updSeeker();
	}

	move(p_x, p_y) {
		if (this.touch.dn) {
			const imgs = Math.min(panel.h * panel.image.size, panel.h - this.ny);
			if (!txt.clickable(p_x, p_y) || !panel.image.show || p_y > imgs || utils.IsKeyPressed(0x10)) return;
			this.touch.end = p_x;
			const x_delta = this.touch.end - this.touch.start;
			if (x_delta > imgs / 5) {
				this.wheel(1);
				this.touch.start = this.touch.end;
			}
			if (x_delta < -imgs / 5) {
				this.wheel(-1);
				this.touch.start = this.touch.end;
			}
		}
	}

	on_get_album_art_done(handle, art_id, image, image_path) {
		if (this.blackListed(image_path)) {
			image = null;
			image_path = '';
		}
		if (!this.cur_handle || !this.cur_handle.Compare(handle) || image && this.cache().cacheHit(image_path)) return;
		const refresh = ui.style.isBlur && panel.isVideo();
		image_path = image_path + (!refresh ? '' : refresh);
		if (!image) {
			if (this.cache().cacheHit('stub' + ppt.artistView)) return;
			image = this.noimg[ppt.artistView ? 1 : 0];
			image_path = 'stub' + ppt.artistView;
		}
		this.clearCovCache();
		if (!image) return;
		this.cache().cacheIt(image, image_path);
	}

	on_key_down(vkey) {
		if (ppt.showAlb || !panel.image.show) return;
		switch (vkey) {
			case vk.left:
				this.wheel(1);
				break;
			case vk.right:
				this.wheel(-1);
				break;
		}
	}

	on_load_image_done(image, image_path) {
		const caller = this.getCallerId(image_path);
		if (caller.art_id !== this.art.ix) return;
		if (!image) {
			this.art.images.splice(this.art.ix, 1);
			if (this.art.images.length > 1) this.change(1);
			return;
		}
		art.cacheIt(image, image_path);
	}

	on_playback_new_track() {
		panel.checkVideo();
		if (ui.style.textOnly && !ui.style.isBlur || ppt.showAlb && !ui.style.isBlur || panel.block()) {
			this.get = true;
		} else {
			if (panel.video.mode && !ppt.showAlb) panel.setVideo();
			if (ppt.artistView && ppt.cycPhoto) {
				if (!panel.isRadio() || !fb.IsPlaying) {
					timer.image();
					this.artistReset();
					this.getArtImg();
				}
			} else this.getFbImg();
			this.get = false;
		}
	}

	on_playback_dynamic_track() {
		timer.clear(timer.vid);
		if (!panel.image.show || ppt.showAlb && !ui.style.isBlur || panel.block()) this.get = true;
		else {
			if (ppt.artistView && ppt.cycPhoto) {
				timer.image();
				this.artistReset();
				this.getArtImg();
			} else if (ppt.artistView) this.getFbImg();
			this.get = false;
		}
	}

	on_size() {
		this.metrics();
		this.clearArtCache();
		this.clearCovCache();
		if (ppt.artistView) {
			if (this.init) this.artistReset();
			this.getArtImg();
		} else this.getFbImg();
		this.init = false;
	}

	paint() {
		if (!ppt.imgSmoothTrans || ppt.showAlb) {
			this.style.alpha = 255;
			txt.paint();
			return;
		}
		this.id.cur_img = this.id.img;
		this.id.img = this.cur_pth();
		if (this.id.cur_img != this.id.img && this.id.cur_img) this.style.alpha = this.transition.level;
		else this.style.alpha = 255;
		timer.clear(timer.transition);
		timer.transition.id = setInterval(() => {
			this.style.alpha = Math.min(this.style.alpha *= this.transition.incr, 255);
			txt.paint();
			if (this.style.alpha == 255) timer.clear(timer.transition);
		}, 12);
	}

	pth() {
		let curImgPth = this.cur_pth().replace(/(true|false)$/, '');
		if (!$.file(curImgPth)) curImgPth = '';
		return ({
			imgPth: curImgPth,
			artist: this.artist || name.artist(),
			blk: name.isLfmImg(fso.GetFileName(curImgPth))
		});
	}

	process(image, o) {
		let type = !this.style.circular ? 'default' : 'circular';
		switch (type) {
			case 'circular':
				this.im.w = this.im.h = Math.min(this.nw, this.nh);
				break;
			case 'default':
				this.im.w = this.nw;
				this.im.h = this.nh;
				break;
		}
		return this.format(image, type, this.im.w, this.im.h, 'img', o, this.isBlur(image), ppt.imgBorder || ppt.imgShadow, ppt.imgReflection);
	}

	reflImage(image, x, y, w, h, o) {
		if (!this.mask.reflection) {
			const km = this.refl.gradient != -1 ? this.refl.strength / 500 + this.refl.gradient / 10 : 0;
			this.mask.reflection = $.gr(500, 500, true, g => {
				for (let k = 0; k < 500; k++) {
					const c = 255 - $.clamp(this.refl.strength - k * km, 0, 255);
					g.FillSolidRect(0, k, 500, 1, RGB(c, c, c));
				}
			});
		}
		const ref_sz = Math.round(Math.min(panel.h - y - h, image.Height * this.refl.size));
		if (ref_sz <= 0) return image;
		const refl = image.Clone(0, image.Height - ref_sz, image.Width, ref_sz);
		let r_mask = this.mask.reflection.Clone(0, 0, this.mask.reflection.Width, this.mask.reflection.Height);
		if (refl) {
			r_mask = r_mask.Resize(refl.Width, refl.Height);
			refl.RotateFlip(6);
			refl.ApplyMask(r_mask);
		}
		const reflImg = $.gr(w, h + ref_sz, true, g => {
			g.DrawImage(image, 0, 0, w, h, 0, 0, w, h);
			g.DrawImage(refl, 0, h, w, h, 0, 0, w, h);
		});
		o.h = h + ref_sz;
		return reflImg;
	}

	set() {
		this.style.circular = ppt.artistView && ppt.artCirc || !ppt.artistView && ppt.covCirc;
	}

	setReflStrength(n) {
		this.refl.strength += n;
		this.refl.strength = $.clamp(this.refl.strength, 0, 255);
		ppt.reflStrength = Math.round(this.refl.strength / 2.55);
		this.mask.reflection = null;
		this.refl.adjust = true;
		if (ppt.artistView && ppt.cycPhoto) this.clearArtCache();
		if (ppt.artistView) this.getArtImg();
		else this.getFbImg();
	}

	uniq(a) {
		return [...new Set(a)];
	}

	updSeeker(repaint) {
		seeker.metrics();
		if (repaint) this.paint();
	}

	update() {
		if (panel.block()) return this.get = true;
		this.getArtImg(true);
	}

	wheel(step) {
		switch (utils.IsKeyPressed(0x10)) {
			case false:
				if (!ppt.artistView || !ppt.cycPhoto) break;
				if (this.art.images.length < 2) break;
				this.change(-step);
				if (ppt.artistView && ppt.cycPhoto) timer.image();
				break;
			case true:
				if (ppt.imgReflection) this.setReflStrength(-step * 5);
				break;
		}
	}
}

class ImageCache {
	constructor(type) {
		this.cache = {};
		this.pth = '';
		this.type = type;
	}

	// Methods

	cacheIt(image, key) {
		try {
			if (!image || this.type != ppt.artistView) return img.paint();
			if (this.type && this.memoryLimit()) this.checkCache();
			const start = Date.now();
			const o = this.cache[key] = {};
			o.img = img.cur = img.process(image, o);
			o.time = Date.now() - start;
			this.pth = key;
			img.paint();
		} catch (e) {
			this.pth = '';
			img.paint();
			$.trace("unable to load image: " + key);
		}
	}

	cacheHit(key) {
		const o = this.cache[key];
		if (!o || !o.img || img.refl.adjust) return false;
		img.x = o.x;
		img.y = o.y;
		if (ui.style.isBlur && o.blur) img.blur = o.blur;
		img.cur = o.img;
		this.pth = key;
		img.paint();
		return true;
	}

	checkCache() {
		let keys = Object.keys(this.cache);
		const cacheLength = keys.length;
		const minCacheSize = 5;
		if (cacheLength > minCacheSize) {
			this.cache = this.sort(this.cache, 'time');
			keys = Object.keys(this.cache);
			const numToRemove = Math.round((cacheLength - minCacheSize) / 5);
			if (numToRemove > 0)
				for (let i = 0; i < numToRemove; i++) this.trimCache(keys[i]);
		}
	}

	memoryLimit() {
		if (!window.JsMemoryStats) return;
		return window.JsMemoryStats.MemoryUsage / window.JsMemoryStats.TotalMemoryLimit > 0.4 || window.JsMemoryStats.TotalMemoryUsage / window.JsMemoryStats.TotalMemoryLimit > 0.8;
	}

	sort(o, prop) {
		const sorted = {};
		Object.keys(o).sort((a, b) => o[a][prop] - o[b][prop]).forEach(key => sorted[key] = o[key]);
		return sorted;
	}

	trimCache(key) {
		delete this.cache[key];
	}
}

class Seeker {
	constructor() {
		ppt.imgSeeker = $.clamp(ppt.imgSeeker, 0, 2);
		this.dn = false;
		this.down = false;
		this.hand = false;
		this.imgNo = 0;
		this.show = ppt.imgSeeker == 2 ? true : false;

		this.bar = {
			dot_w: 4,
			grip_h: 10 * $.scale,
			gripOffset: 2,
			h: 6 * $.scale,
			l: 0,
			x1: 25,
			x2: 26,
			x3: 25,
			y1: 25,
			y2: 200,
			w1: 100,
			w2: 110
		}

		this.prog = {
			min: 0,
			max: 200
		}

		if (ui.style.textOnly) return;

		this.debounce = $.debounce(() => {
			if (ppt.imgSeeker == 2 || panel.m.x > this.bar.x1 && panel.m.x < this.bar.x1 + this.bar.w1 && panel.m.y > img.ny + img.nh && panel.m.y < img.ny + img.nh) return;
			this.show = false;
			img.paint();
		}, 3000);
	}

	draw(gr) {
		if (!this.show || this.imgNo < 2 || panel.video.show && panel.isVideo()) return;

		let prog = 0;
		if (ppt.imgSeekerDots) {
			gr.SetSmoothingMode(2);
			prog = this.dn ? $.clamp(panel.m.x - this.bar.x2 - this.bar.grip_h / 2, this.prog.min, this.prog.max) : (img.art.ix + 0.5) * this.bar.w1 / this.imgNo - (this.bar.grip_h - this.bar.dot_w) / 2;
			for (let i = 0; i < this.imgNo; i++) {
				gr.FillEllipse(this.bar.x2 + ((i + 0.5) / this.imgNo) * this.bar.w1, this.bar.y1, this.bar.dot_w, this.bar.h, RGB(245, 245, 245));
				gr.DrawEllipse(this.bar.x2 + ((i + 0.5) / this.imgNo) * this.bar.w1, this.bar.y1, this.bar.dot_w, this.bar.h, ui.style.l_w, RGB(128, 128, 128));
			}
			gr.FillEllipse(this.bar.x2 + prog, this.bar.y2 - this.bar.gripOffset, this.bar.grip_h, this.bar.grip_h, RGB(245, 245, 245));
			gr.DrawEllipse(this.bar.x2 + prog, this.bar.y2 - this.bar.gripOffset, this.bar.grip_h, this.bar.grip_h, ui.style.l_w, RGB(128, 128, 128));
			gr.SetSmoothingMode(0);
		}

		if (ppt.imgCounter) {
			if (ppt.imgSeekerDots) prog += Math.round(this.bar.grip_h / 2 - this.bar.dot_w / 2);
			const count = (img.art.ix + 1 + (' / ' + this.imgNo));
			const count_m = (this.imgNo + (' / ' + this.imgNo)) + ' ';
			if (count) {
				const count_w = gr.CalcTextWidth(count_m, ui.font.small);
				const count_x = ppt.imgSeekerDots ? Math.round($.clamp(this.bar.x1 - count_w / 2 + prog, this.bar.l + 2, this.bar.l + img.nw - count_w - 4)) : img.x + ui.style.l_w * 2 + img.bor.w1;
				const count_h = gr.CalcTextHeight(count, ui.font.small);
				const count_y = ppt.imgSeekerDots ? Math.round(this.bar.y1 - this.bar.gripOffset - count_h * 1.5) : img.y + ui.style.l_w * 2 + img.bor.w1;
				gr.FillRoundRect(count_x, count_y, count_w + 2, count_h + 2, 3, 3, RGBA(0, 0, 0, 210));
				gr.DrawRoundRect(count_x + 1, count_y + 1, count_w, count_h, 1, 1, 1, RGBA(255, 255, 255, 60));
				gr.DrawRoundRect(count_x, count_y, count_w + 2, count_h + 2, 1, 1, 1, RGBA(0, 0, 0, 200));
				gr.GdiDrawText(count, ui.font.small, RGB(250, 250, 250), count_x + 1, count_y, count_w, count_h + 2, txt.cc);
			}
		}
	}

	lbtn_dn(p_x, p_y) {
		this.dn = false;
		this.down = true;
		if (ppt.imgSeeker) {
			if (ppt.artistView && this.imgNo > 1)
				this.dn = p_x > this.bar.x3 && p_x < this.bar.x3 + this.bar.w2 && p_y > img.ny + img.nh * 0.8 && p_y < img.ny + img.nh;
		}
		if (this.dn) {
			const prog = $.clamp(p_x - this.bar.x1, 0, this.bar.w1);
			const new_ix = Math.min(Math.floor(prog / this.bar.w1 * this.imgNo), this.imgNo - 1);
			if (new_ix != img.art.ix) {
				img.art.ix = new_ix;
				img.setPhoto();
			}
			img.paint();
		}
	}

	metrics() {
		if (!ppt.imgSeeker) {
			this.show = false;
			img.paint();
			return;
		}

		this.imgNo = ppt.showAlb || !ppt.artistView ? 0 : img.art.images.length;
		if (this.imgNo < 2) return;

		this.bar.h = 6 * $.scale;
		this.bar.grip_h = 10 * $.scale;
		this.bar.gripOffset = Math.round((this.bar.grip_h - this.bar.h) / 2) + Math.ceil(ui.style.l_w / 2);
		this.bar.w1 = Math.min(this.imgNo * 30 * $.scale, Math.min(img.nw, img.nh) - 30 * $.scale);
		this.bar.w2 = this.bar.w1 + Math.round(this.bar.grip_h);
		this.bar.l = (panel.w - img.nw) / 2;
		this.bar.x1 = Math.round(this.bar.l + (img.nw - this.bar.w1) / 2);
		this.bar.x2 = this.bar.x1 + Math.ceil(ui.style.l_w / 2);
		this.bar.x3 = this.bar.x1 - Math.round(this.bar.grip_h / 2);
		this.bar.y1 = Math.round(img.ny + img.nh * 0.9 - this.bar.h / 2);
		this.bar.y2 = this.bar.y1 + Math.ceil(ui.style.l_w / 2);
		if (ppt.imgSeekerDots) {
			this.bar.dot_w = Math.floor($.clamp(this.bar.w1 / this.imgNo, 2, this.bar.h));
			this.bar.x2 = this.bar.x1 - Math.round(this.bar.dot_w / 2);
			this.prog.min = 0.5 / this.imgNo * this.bar.w1 - (this.bar.grip_h - this.bar.dot_w) / 2;
			this.prog.max = ((this.imgNo - 0.5) / this.imgNo) * this.bar.w1 - (this.bar.grip_h - this.bar.dot_w) / 2;
		} else this.bar.x2 = this.bar.x1 + Math.ceil(ui.style.l_w / 2);
	}

	move(p_x, p_y) {
		this.hand = false;
		if (ppt.imgSeeker) {
			const trace = p_x > this.bar.l && p_x < this.bar.l + img.nw && p_y > img.ny && p_y < img.ny + img.nh;
			const show = (!panel.video.show || !panel.isVideo()) && (ppt.imgSeeker == 2 || p_x > this.bar.l && trace);
			if (ppt.artistView && this.imgNo > 1 && (!panel.video.show || !panel.isVideo()))
				if (!this.down || this.dn) this.hand = p_x > this.bar.x3 && p_x < this.bar.x3 + this.bar.w2 && p_y > img.ny + img.nh * 0.8 && p_y < img.ny + img.nh;
			if (show != this.show && trace) img.paint();
			if (show) this.show = true;
			this.debounce();
		}

		if (this.dn) {
			const prog = $.clamp(p_x - this.bar.x1, 0, this.bar.w1);
			const new_ix = Math.min(Math.floor(prog / this.bar.w1 * this.imgNo), this.imgNo - 1);
			if (new_ix != img.art.ix) {
				img.art.ix = new_ix;
				img.setPhoto();
			}
			img.paint();
		}
	}
}