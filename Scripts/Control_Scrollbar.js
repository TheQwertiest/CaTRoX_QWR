// ====================================== //
// @name "Scrollbar Control"
// @author "TheQwertiest"
// ====================================== //
properties.AddProperties(
    {
        wheel_scroll_page: window.GetProperty("user.Scroll Whole Page With Wheel", false)
    }
);

// SCROLLBAR
// SCROLLBARPARTS 
SBP_ARROWBTN = 1;
SBP_THUMBBTNHORZ = 2;
SBP_THUMBBTNVERT = 3;
SBP_LOWERTRACKHORZ = 4;
SBP_UPPERTRACKHORZ = 5;
SBP_LOWERTRACKVERT = 6;
SBP_UPPERTRACKVERT = 7;
SBP_GRIPPERHORZ = 8;
SBP_GRIPPERVERT = 9;
SBP_SIZEBOX = 10;

// ARROWBTNSTATES 
ABS_UPNORMAL = 1;
ABS_UPHOT = 2;
ABS_UPPRESSED = 3;
ABS_UPDISABLED = 4;
ABS_DOWNNORMAL = 5;
ABS_DOWNHOT = 6;
ABS_DOWNPRESSED = 7;
ABS_DOWNDISABLED = 8;
ABS_LEFTNORMAL = 9;
ABS_LEFTHOT = 10;
ABS_LEFTPRESSED = 11;
ABS_LEFTDISABLED = 12;
ABS_RIGHTNORMAL = 13;
ABS_RIGHTHOT = 14;
ABS_RIGHTPRESSED = 15;
ABS_RIGHTDISABLED = 16;
ABS_UPHOVER = 17;
ABS_DOWNHOVER = 18;
ABS_LEFTHOVER = 19;
ABS_RIGHTHOVER = 20;

//// Button hover alpha timer
var g_sbarAlphaTimerStarted = false; 
var g_sbarAlphaTimer; 
function startSbarAlphaTimerFn(caller) 
{
	var turnTimerOff = false,
		hoverInStep = 50,
		hoverOutStep = 15,
		downInStep = 100,
		downOutStep = 50,
		timerDelay = 25;

	if (!g_sbarAlphaTimerStarted) 
	{
		g_sbarAlphaTimer = window.SetInterval(function () 
		{
			_.forEach(caller.sb_parts, function (item,i) {
				switch (item.state) {
				case "normal":
					item.hover_alpha = Math.max(0, item.hover_alpha -= hoverOutStep);                    
                    item.hot_alpha = Math.max(0, item.hot_alpha -= hoverOutStep); 
                    if ( i == "thumb")
                    {
                        item.pressed_alpha = Math.max(0, item.pressed_alpha -= hoverOutStep);
                    }
                    else
                    {
                        item.pressed_alpha = Math.max(0, item.pressed_alpha -= downOutStep);
                    }
                    
					break;
				case "hover":
                    item.hover_alpha = Math.min(255, item.hover_alpha += hoverInStep);
                    item.hot_alpha = Math.max(0, item.hot_alpha -= hoverOutStep);
                    item.pressed_alpha = Math.max(0, item.pressed_alpha -= downOutStep);
                    
                    break;
				case "pressed":
                    item.hover_alpha = 0;
                    item.hot_alpha = 0;
                    if ( i == "thumb")
                    {
                        item.pressed_alpha = 255;
                    }
                    else
                    {
                        item.pressed_alpha = Math.min(255, item.pressed_alpha += downInStep);
                    }
                    
					break;
                case "hot":
                    item.hover_alpha = Math.max(0, item.hover_alpha -= hoverOutStep);
                    item.hot_alpha = Math.min(255, item.hot_alpha += hoverInStep);
                    item.pressed_alpha = Math.max(0, item.pressed_alpha -= downOutStep);
                    
					break;
                }
                //fb.trace(i, item.state, item.hover_alpha , item.pressed_alpha , item.hot_alpha);
                item.repaint();
			});
			
            //caller.repaint();
			
			var ready = true;
		
			_.forEach(caller.sb_parts, function (item) {
                var alphaIsFull = false,
                    alphaIsZero = true;
				//---> Test button alpha values and turn button timer off when it's not required;
				if (item.pressed_alpha == 255 || (item.hover_alpha == 255 && item.hot_alpha == 255) || (item.hover_alpha == 0 && item.hot_alpha == 255) || (item.hover_alpha == 255 && item.hot_alpha == 0))
				{
					alphaIsFull = true;
				}
				else
				{
					alphaIsZero = (item.hover_alpha + item.pressed_alpha + item.hot_alpha ) == 0;                    
				}
                
                ready &= (alphaIsZero || alphaIsFull);
			}); 
			
			if (ready)
			{
				turnTimerOff = true;
			}

			if (turnTimerOff) 
			{
                stopSbarAlphaTimerFn();
			}

		}, timerDelay);

		g_sbarAlphaTimerStarted = true;
	}
}

function stopSbarAlphaTimerFn() 
{
	window.ClearInterval(g_sbarAlphaTimer);
	g_sbarAlphaTimerStarted = false; 
}

_.mixin({
    scrollbar: function (x, y, w, h, rows_drawn, row_h, fn_redraw) {
		this.paint = function (gr) {
			_.forEach(this.sb_parts, function (item, i) {
                var x = item.x,
                    y = item.y,
                    w = item.w,
                    h = item.h;

                gr.DrawImage(item.img_normal, x, y, w, h, 0, 0, w, h, 0, 255);
                switch (i)
                {
                    case "lineUp":
                    case "lineDown":
                        gr.DrawImage(item.img_hot, x, y, w, h, 0, 0, w, h, 0, item.hot_alpha);
                        gr.DrawImage(item.img_hover, x, y, w, h, 0, 0, w, h, 0, item.hover_alpha);
                        gr.DrawImage(item.img_pressed, x, y, w, h, 0, 0, w, h, 0, item.pressed_alpha);

                        break;

                    case "thumb":
                        gr.DrawImage(item.img_hover, x, y, w, h, 0, 0, w, h, 0, item.hover_alpha);
                        gr.DrawImage(item.img_pressed, x, y, w, h, 0, 0, w, h, 0, item.pressed_alpha);
                        
                        break;
                }
			});
		};

        this.repaint = function()
        {
            repaintReason = "scrollbarAnimation";
            window.RepaintRect(this.x, this.y, this.w, this.h);
        };

        this.reset = function()
        {
            if (g_sbarAlphaTimerStarted)
                stopSbarAlphaTimerFn();

            this.stop_shift_timer();

            this.scroll = 0;
            this.calc_params();
        };

        this.trace = function (x,y)
        {
            return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h;
        };

        this.set_rows = function (row_count) {
            this.row_count = row_count;
            this.calc_params();
        };

        this.calc_params = function () {
            this.btn_h = this.w;
            // draw info
            this.scrollbar_h = this.h - this.btn_h * 2;
            this.thumb_h = Math.max(Math.round(this.scrollbar_h * this.rows_drawn / this.row_count), 12);
            this.scrollbar_travel = this.scrollbar_h - this.thumb_h;
            // scrolling info
            this.scrollable_lines = this.row_count - this.rows_drawn;
            this.thumb_y = this.btn_h + this.scroll * this.scrollbar_travel / this.scrollable_lines;
            this.drag_distance_per_row = this.scrollbar_travel / this.scrollable_lines;
        };

        this.create_parts = function(img_src)
        {
            var x = this.x;
            var y = this.y;
            var w = this.w;
            var h = this.h;

            this.sb_parts = {
                lineUp:   new _.scrollbar_part(x, y,                  w, this.btn_h,   img_src.lineUp),
                thumb:    new _.scrollbar_part(x, y + this.thumb_y,   w, this.thumb_h, img_src.thumb),
                lineDown: new _.scrollbar_part(x, y + h - this.btn_h, w, this.btn_h,   img_src.lineDown)
            };
        };

        this.wheel = function (wheel_direction){
            var direction = -wheel_direction;

            if ( this.wheel_scroll_page )
            {
                this.shift_page(direction);
            }
            else
            {
                var newScroll = this.nearestScroll(direction);
                this.check_scroll(newScroll + direction * 2);
            }
        };

        this.parts_leave = function()
        {
            this.in_sbar = false;
            this.part = null;

            _.forEach(this.sb_parts, function (item) {
                item.cs("normal");
            });
            startSbarAlphaTimerFn(this);
        };

        this.leave = function () {
            if (this.b_is_dragging) {
                return;
            }

            this.parts_leave();
        };

        this.parts_move = function (x, y) {
            var temp_part = null;
            _.forEach(this.sb_parts, function (item, i) {
                if (item.trace(x, y))
                    temp_part = i;
            });

            var changeHotStatus = this.trace(x,y) != this.in_sbar;
            if ( changeHotStatus ) {
                this.in_sbar = !this.in_sbar;
                if (this.in_sbar) {
                    temp_part != "lineUp" && this.part != "lineUp" && this.sb_parts["lineUp"].cs("hot");
                    temp_part != "lineDown" && this.part != "lineDown" && this.sb_parts["lineDown"].cs("hot");
                    startSbarAlphaTimerFn(this);
                }
                else
                {
                    this.part != "lineUp" && this.sb_parts["lineUp"].cs("normal");
                    this.part != "lineDown" && this.sb_parts["lineDown"].cs("normal");
                    startSbarAlphaTimerFn(this);
                }
            }

            if (this.part == temp_part)
            {// Nothing to do: same button
                return this.part;
            }

            if (this.part )
            {
                if ( this.part == "thumb")
                {
                    this.sb_parts[this.part].cs("normal");
                    startSbarAlphaTimerFn(this);
                }
                else {
                    if (this.sb_parts[this.part].state == "pressed") {
                        // Stop btn fast scroll
                        this.stop_shift_timer();
                    }

                    // Return prev button to normal or hot state
                    this.sb_parts[this.part].cs(this.in_sbar ? "hot" : "normal");
                    startSbarAlphaTimerFn(this);
                }
            }

            if (temp_part)
            {// Select current button
                this.sb_parts[temp_part].cs("hover");
                startSbarAlphaTimerFn(this);
            }

            this.part = temp_part;
            return this.part;
        };

        this.move = function (p_x, p_y) {
            if (this.b_is_dragging)
            {
				this.timer_cpu_reducer_y = p_y - this.y - this.initial_drag_y;

				if (!this.timer_cpu_reducer_started)
				{
					var that = this;
					this.timer_cpu_reducer = window.SetTimeout(function ()
					{
						that.check_scroll( (that.timer_cpu_reducer_y - that.btn_h) / that.drag_distance_per_row);
						that.timer_cpu_reducer_started = false;
					}, 10);

					this.timer_cpu_reducer_started = true;
				}

                //this.check_scroll( (p_y - this.y - this.initial_drag_y - this.btn_h) / this.drag_distance_per_row);
				
                return;
            }

            this.parts_move(p_x, p_y);
        };

        this.parts_lbtn_down = function() {
            if (this.part) {
                this.sb_parts[this.part].cs("pressed");
                startSbarAlphaTimerFn(this);
            }
        };

        this.lbtn_dn = function (p_x, p_y) {
            if (!this.trace(p_x, p_y)|| this.row_count <= this.rows_drawn) {
                return;
            }

            this.parts_lbtn_down(p_x, p_y);

            var y = p_y - this.y;

            if (y < this.btn_h )
            {
                this.shift_line(-1);
                this.start_shift_timer(-1);
            }
            else if ( y > this.h - this.btn_h) {
                this.shift_line(1);
                this.start_shift_timer(1);
            }
            else if (y < this.thumb_y) {
                this.shift_page(-1);
                this.timer_stop_y = y;
                this.start_shift_timer(-this.rows_drawn);
            }
            else if ( y > this.thumb_y + this.thumb_h)
            {
                this.shift_page(1);
                this.timer_stop_y = y;
                this.start_shift_timer(this.rows_drawn);
            }
            else { // on bar
                this.b_is_dragging = true;
                this.initial_drag_y = y - this.thumb_y;
            }
        };

        this.parts_lbtn_up = function (x, y) {
            if (this.part && this.sb_parts[this.part].state == "pressed")
            {
                if (this.sb_parts[this.part].trace(x,y))
                {
                    this.sb_parts[this.part].cs("hover");
                    startSbarAlphaTimerFn(this);
                }
                else
                {
                    this.sb_parts[this.part].cs("normal");
                    startSbarAlphaTimerFn(this);
                }

                return true;
            }
            else
            {
                return false;
            }
        };

        this.lbtn_up = function (x, y) {
            this.parts_lbtn_up(x,y);
            if (this.b_is_dragging) {
                this.b_is_dragging = false;
            }
            this.initial_drag_y = 0;

            this.stop_shift_timer();
        };

        this.rbtn_up = function (x, y) {
            if (!this.trace(x, y)) {
                return false;
            }
            var cpm = window.CreatePopupMenu();

            if (utils.IsKeyPressed(VK_SHIFT)) {
                cpm.AppendMenuItem(safeMode ? MF_GRAYED : MF_STRING, 1, "Configure script...");
            }

            id = cpm.TrackPopupMenu(x, y);

            if (id == 1) {
                qwr_utils.run_notepad("Control_Scrollbar.js");
            }

            _.dispose(cpm);

            return true;
        };

        this.shift_line = function (direction) {
            var newScroll = this.nearestScroll(direction);
            this.check_scroll(newScroll);
        };

        this.shift_page = function (direction) {
            var newScroll = this.nearestScroll(direction);
            this.check_scroll(newScroll + direction*Math.floor(Math.max(rows_drawn - 1, 1)));
        };

        this.start_shift_timer = function(shift)
        {
            if (!this.timer_shift_started) {
                var shift_amount = shift;
                var that = this;
                this.timer_shift = window.SetInterval(function () {
                    if (that.thumb_y <= that.btn_h || that.thumb_y + that.thumb_h >= that.h - that.btn_h )
                    {
                        that.stop_shift_timer();
                        return;
                    }
                    if ( that.timer_stop_y != -1 )
                    {
                        var new_thumb_y = that.btn_h + (that.scroll + shift ) * that.scrollbar_travel / that.scrollable_lines;

                        if( (shift > 0 && new_thumb_y >= that.timer_stop_y)
                            || (shift < 0 && new_thumb_y + that.thumb_h <= that.timer_stop_y) )
                        {
                            that.stop_shift_timer();
                            return;
                        }
                    }

                    if (that.timer_shift_count > 6) {
                        that.check_scroll(that.scroll + shift_amount);
                    }
                    else {
                        that.timer_shift_count++;
                    }
                }, 40);

                this.timer_shift_started = true;
            }
        };

        this.stop_shift_timer = function()
        {
            if (this.timer_shift_started) {
                window.ClearInterval(this.timer_shift);
                this.timer_shift_started = false;
            }
            this.timer_shift_count = -1;
            this.timer_stop_y = -1;
        };

        this.nearestScroll = function(direction)
        {
            var scrollShift = this.scroll - Math.floor(this.scroll);
            var drawnShift = 1 - (this.rows_drawn - Math.floor(this.rows_drawn));
            var newScroll = 0;

            if ( direction < 0 && scrollShift != 0 )
            {
                newScroll = Math.floor(this.scroll);
            }
            else if ( direction > 0 && Math.abs(drawnShift - scrollShift) > 0.0001 )
            {
                if ( drawnShift > scrollShift )
                {
                    newScroll = Math.floor(this.scroll) + drawnShift;
                }
                else
                {
                    newScroll = Math.ceil(this.scroll) + drawnShift;
                }
            }
            else
            {
                newScroll = this.scroll + direction;
            }

            return newScroll;
        };

        this.check_scroll = function (new_scroll, set_scroll_only) {
            var s = Math.max(0, Math.min(new_scroll, this.scrollable_lines));
            if (s == this.scroll) {
                return;
            }
            this.scroll = s;
            this.thumb_y = this.btn_h + this.scroll * this.scrollbar_travel / this.scrollable_lines;
            this.sb_parts["thumb"].y = this.y + this.thumb_y;
            if ( !set_scroll_only ) {
                this.fn_redraw();
            }
        };

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.row_h = row_h;
        this.rows_drawn = rows_drawn; // visible list size in rows (might be float)
        this.row_count = 0; // all rows in associated list

        this.fn_redraw = fn_redraw; // callback for list redraw

        this.draw_timer = false;
        
        this.part = null;
        this.sb_parts = [];

        // Btns
        this.btn_h;
		
		// Timers
		this.timer_cpu_reducer_y = 0;
		this.timer_cpu_reducer = false;
		this.timer_cpu_reducer_started = false;
        this.timer_shift = false;
        this.timer_shift_count = -1;
        this.timer_shift_started = false;
        this.timer_stop_y = -1;

        // Thumb
        this.thumb_h = 0;
        this.thumb_y = 0; // upper y
        
        this.in_sbar = false;

        this.b_is_dragging = false;
        this.drag_distance_per_row; // how far should the thumb move, when the list shifts by one row
        this.initial_drag_y = 0; // dragging

        this.scroll = 0; // lines shifted in list (float)

        this.wheel_scroll_page = properties.wheel_scroll_page;

        this.scrollbar_h = 0; // space between sb_parts (arrows)
        this.scrollable_lines = 0; // not visible rows (row_count - rows_drawn)
        this.scrollbar_travel = 0; // space for thumb to travel (scrollbar_h - thumb_h)
    },
    scrollbar_part: function(x, y, w, h, img_src)
    {
		this.repaint = function () {
			window.RepaintRect(this.x, this.y, this.w, this.h);
		};
        
        this.trace = function (x, y) {
			return x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.h;
		};
        
        this.cs = function (s) {
			this.state = s;
			this.repaint();
		};
                
        this.assign_imgs = function(imgs)
        {
            this.img_normal = this.img_hover = this.img_hover = this.img_hover = null;
            
            if ( imgs == undefined )
            {
                return;
            }
            
            this.img_normal = typeof imgs.normal == "string" ? _.img(imgs.normal) : imgs.normal;
            this.img_hover = imgs.hover ? (typeof imgs.hover == "string" ? _.img(imgs.hover) : imgs.hover) : this.img_normal;
            this.img_pressed = imgs.pressed ? (typeof imgs.pressed == "string" ? _.img(imgs.pressed) : imgs.pressed) : this.img_normal;
            this.img_hot = imgs.hot ? (typeof imgs.hot == "string" ? _.img(imgs.hot) : imgs.hot) : this.img_normal;
        };

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.img_normal;
		this.img_hover;
		this.img_pressed;
        this.img_hot;
		this.hover_alpha = 0;
        this.hot_alpha = 0;
        this.pressed_alpha = 0;
		this.state = "normal";

        this.assign_imgs(img_src);
    }
});
