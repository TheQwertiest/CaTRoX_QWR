// ==PREPROCESSOR==
// @name "WSH Splitter"
// @version "1.2"
// @author "Jensen"
// This panel based on foo_uie_wsh_panel_plus.
// ==/PREPROCESSOR==

// Used in window.SetCursor()
var IDC_ARROW = 32512;
var IDC_SIZEWE = 32644;
var IDC_SIZENS = 32645;

var PanelClassNames = {
	PSS: "PSSWindowContainer",
	WSHMP:"uie_wsh_panel_mod_plus_class",
	//WSHM: "uie_wsh_panel_mod_class",
	//WSHSP:"uie_wsh_panel_sp_class",
	//ELPL: "ELPlaylistWindowContainer",
	//PLS: "NGLV",
	//AL: "SysTreeView32",
	//CSP: "#32770",
	BIO: "BioWindowContainer",
	ESL: "uie_eslyric_wnd_class",
	//LYR3: "FOO_UIE_LYRICS3" //ended here!!!
	LIB: "LibraryTreeWindowContainer",
	//ESP: "ELPlaylist2WindowContainer",
	//ALT:"{606E9CDD-45EE-4c3b-9FD5-49381CEBE8AE}"
};

var on_panels_resize;

var $Splitter = new function(){
	var FbWnd;
	var _this = this;
	
	this.Init = function(){
		// Create panel manager functions ==================
/*		var class_name;
		if (window.InstanceType==0)		// CUI
			class_name = "{E7076D1C-A7BF-4f39-B771-BCBE88F2A2A8}";
		else if (window.InstanceType==1)		// DUI
			class_name = "{97E27FAA-C0B3-4b8e-A693-ED7881E99FC1}";
		else		// FUI
			class_name = "foo_ui_func_window_class";
		FbWnd = utils.GetWND(class_name);
		*/
		var WshWnd = wsh_utils.CreateWND(window.ID);
		FbWnd = WshWnd.GetAncestor(2);
	}
	
	//=======================================	
	this.ReleaseCapture = function() {
		wsh_utils.ReleaseCapture();
	}
	
	this.SendAMessage = function (msg, wp, lp){
		FbWnd&&FbWnd.SendMsg(msg, wp, lp);
	}
	
	//=======================================
	var Panel = function(index, classname, position, x, y, w, h){
		this.x = x?x:0; this.y = y?y:0; this.w = w?w:0; this.h = h?h:0;
		this.padding = {left:0, top:0, right:0, bottom:0};
		this.relative = false;
		this.index = index;
		this.visible = window.GetProperty("P"+this.index+".visible", true);
		this.locked = window.GetProperty("P"+this.index+".locked", false);
        this.minSize = 0;
        this.maxSize = Infinity;
		this.Wnd = FbWnd ? FbWnd.GetChild(classname, position) : null;
	}
	
	Panel.prototype.Move = function(x2, y2, w2, h2){
        //fb.trace(this.index, "move", this.visible, this.x, this.y, this.w, this.h)
		if(this.relative) return;
		this.x = x2; this.y = y2; this.w = w2; this.h = h2;
		if(this.visible)
			this.Wnd.Move(this.x+this.padding.left, this.y+this.padding.top, this.w-this.padding.left-this.padding.right, this.h-this.padding.top-this.padding.bottom);
		else
			this.Wnd.Show(0);
	}
	
	Panel.prototype.Show = function(){
        //fb.trace(this.index, "show", this.x, this.y, this.w, this.h)
		this.Wnd.Show(1);
		this.visible = true;
		window.SetProperty("P"+this.index+".visible", this.visible);
	}
	
	Panel.prototype.Hide = function(){
        //fb.trace(this.index, "hide", this.x, this.y, this.w, this.h)
		this.Wnd.Show(0);
		this.visible = false;
		window.SetProperty("P"+this.index+".visible", this.visible);
	}
	
	Panel.prototype.Refresh = function(){
        //fb.trace(this.index, "refresh", this.visible, this.x, this.y, this.w, this.h)
		if(this.visible)
			this.Wnd.Move(this.x+this.padding.left, this.y+this.padding.top, this.w-this.padding.left-this.padding.right, this.h-this.padding.top-this.padding.bottom,false);
		else
			this.Wnd.Show(0);
	}
	
	Panel.prototype.Lock = function(lock){
		this.locked = lock;
		window.SetProperty("P"+this.index+".locked", lock);
	}
	
	//=======================================
	function RelativePanels(){
		this.x = 0;
		this.y = 0;
		this.w = 0;
		this.h = 0;
		this.margin = {left:0, top:0, right:0, bottom:0};
		this.initialized = false;
        this.panels = [];
		var panelPalcement, IDC_SIZE;
		var sepW = 4;
		var drawSep;
		var hover = null, drag = null;
		var coord = {}, lastCoord;
		var adjustingPanels1, adjustingPanels2;
		
		this.SetPanelsPalcementMode = function(mode){
			if(mode=="horizontal"){
				panelPalcement = 0;        // 0: horizontal, 1: vertical.
				coord.x = "x";
				coord.y = "y";
				coord.w = "w";
				coord.h = "h";
				IDC_SIZE = IDC_SIZEWE;
			} else if (mode=="vertical") {
				panelPalcement = 1;
				coord.x = "y";
				coord.y = "x";
				coord.w = "h";
				coord.h = "w";
				IDC_SIZE = IDC_SIZENS;
			}
		}
		this.SetPanelsPalcementMode("horizontal");
		
		this.SetSeparaterProperties = function(width, drawFunc){
			sepW = width;
			drawSep = drawFunc;
		}
				
		this.Draw = function(g){
			if(panelPalcement==0){
				for (var i=0; i<this.panels.length-1; i++){
					var p = this.panels[i];
                    if(p.visible)
    					drawSep && drawSep(g, p.x+p.w, this.y, sepW, this.h, panelPalcement);
				}
			} else {
				for (var i=0; i<this.panels.length-1; i++){
					var p = this.panels[i];
                    if(p.visible)
    					drawSep && drawSep(g, this.x, p.y+p.h, this.w, sepW, panelPalcement);
				}
			}
		}
		
		this.Show = function(panel, show){
            if(show==panel.visible) return;
            panel.visible = show;
            if(!this.initialized) return;
            assignWeight(this.panels);
            ResizePanels(this.panels, 0, this[coord.w]);
            this.RefreshPanels();
		}
		
		this.Lock = function(index, lock){
			assignWeight(this.panels);
		}
		
        var tempx;
		this.OnMouseMove = function(x, y) {
			var cursorX = eval(coord.x);
			if (drag) {
                cursorX += tempx;
                cursorX = Math.min(cursorX, this[coord.w]-adjustingPanels2.minSize+sepW, adjustingPanels1.maxSize);
				cursorX = Math.max(cursorX, this[coord.w]-adjustingPanels2.maxSize+sepW, adjustingPanels1.minSize);
				if(cursorX!=lastCoord){
					var surplus = ResizePanels(adjustingPanels1, 0, cursorX-sepW);
					ResizePanels(adjustingPanels2, cursorX-lastCoord-surplus, this[coord.w]-cursorX+surplus);
                    this.RefreshPanels();
					on_panels_resize && on_panels_resize();
					window.Repaint();
					lastCoord = cursorX;
				}
			} else {
				var cursorY = eval(coord.y);
				for (var i=0; i<this.panels.length-1; i++){
					var tem = this.panels[i][coord.x] + this.panels[i][coord.w];
					if(cursorX>=tem && cursorX<tem+sepW && cursorY>=this[coord.y] && cursorY<this[coord.y]+this[coord.h]){
                        window.SetCursor(IDC_SIZE);
                        hover = i+1;
						break;
					}
				}
				if(i>=this.panels.length-1 && hover) {
					hover = null;
					window.SetCursor(IDC_ARROW);
				}
			}
		}
		
		this.OnMouseLbtnDown = function(x, y) {
			if(!hover) return;
            drag = hover;
            tempx = this.panels[drag-1][coord.x] + this.panels[drag-1][coord.w] + sepW - eval(coord.x);
            lastCoord = eval(coord.x) + tempx;
            adjustingPanels1 = this.panels.slice(0, drag);
            adjustingPanels2 = this.panels.slice(drag);
            assignWeight(adjustingPanels1);
            assignWeight(adjustingPanels2);
		}
		
		this.OnMouseLbtnUp = function(x, y) {
            if(!drag) return;
            drag = null;
            this.SaveSizes();
            this.OnMouseMove(x, y);
		}
		
		this.OnMouseLeave = function() {
			if(hover){
				window.SetCursor(IDC_ARROW);
				hover = null;
			}
			drag = null;
		}
        
        function assignWeight(panels){
            panels.totalWidth = 0;
            panels.visibleNumbers = 0;
            panels.minSize = 0;
            panels.maxSize = 0;
            panels.lockedPanels = [];
            panels.lockedPanels.totalWeight = 0;
            panels.unlockedPanels = [];
            panels.unlockedPanels.totalWeight = 0;
            var p, ps;
			for (var i=0; i<panels.length; i++){
				p = panels[i];
                p.weight = p[coord.w];
                ps = p.locked ? panels.lockedPanels : panels.unlockedPanels;
                ps.push(p);
                if(p.visible){
                    ps.totalWeight += p.weight;
                    panels.visibleNumbers ++;
                    panels.totalWidth += p[coord.w] + sepW;
                    panels.minSize += p.minSize + sepW;
                    panels.maxSize += p.maxSize + sepW;
                }
            }
            
            if(!panels.visibleNumbers) return;
            
            ps = panels.unlockedPanels;
            while(true){
                if(ps.totalWeight==0){
                    for (var i=0; i<ps.length; i++){
                        p = ps[i];
                        p.weight = 1;
                        if(p.visible)
                            ps.totalWeight += p.weight;
                    }
                }
                if(ps==panels.lockedPanels) break;
                ps = panels.lockedPanels;
            }
        }
        
        function SortPanels(panels, isEnlarge){
            for (var i=0; i<panels.length; i++){
                p = panels[i];
                if(!p.weight)
                    p.distanceToLimit = Infinity;
                else if(isEnlarge)
                    p.distanceToLimit = (p.maxSize-p[coord.w])*panels.totalWeight/p.weight;
                else
                    p.distanceToLimit = (p[coord.w]-p.minSize)*panels.totalWeight/p.weight;
            }
            panels.sort(sortByDistance);
        }
        
        function sortByDistance(a, b){ return a.distanceToLimit==b.distanceToLimit ? 0 : (a.distanceToLimit - b.distanceToLimit); }
        
        function ResizePanels(panels, coordAdjust, newWidth){
			if(!panels.length) return;
            if(!panels.visibleNumbers)
                assignWeight(panels);
            if(!panels.visibleNumbers) return;
            
            newWidth = Math.max(Math.min(newWidth+sepW, panels.maxSize), panels.minSize);
            var sizeAdjust = newWidth - panels.totalWidth;
            if(!sizeAdjust && !coordAdjust) return;
            
            var remainSize = sizeAdjust;
            var remainWeight, p, oldsize, ratio;
            
            var ps = panels.unlockedPanels;
            while(true){
                remainWeight = ps.totalWeight;
                SortPanels(ps, sizeAdjust>0);
                for (var i=0; i<ps.length; i++) {
                    p = ps[i];
                    if(p.visible){
                        oldsize = p[coord.w];
                        ratio = remainWeight==0 ? 0 : p.weight/remainWeight;
                        p[coord.w] = Math.max(Math.min(p[coord.w] + Math.round(remainSize*ratio), p.maxSize), p.minSize);
                        remainSize -= p[coord.w] - oldsize;
                        remainWeight -= p.weight;
                    } else
                        p[coord.w] = p[coord.w] + Math.round(sizeAdjust*p.weight/(ps.totalWeight));
                }
                if(!remainSize || ps==panels.lockedPanels) break;
                ps = panels.lockedPanels;
            }
            
            var offset = panels[0][coord.x] + coordAdjust;
            for (var i=0; i<panels.length; i++){
                p = panels[i];
                if(!p.visible) continue;
                p[coord.x] = offset;
                offset += p[coord.w] + sepW;
            }
            
            panels.totalWidth += sizeAdjust-remainSize;
            return remainSize;
		}
        
		this.Resize = function(w, h){
			w = Math.max(w-this.margin.left-this.margin.right, 0);
			h = Math.max(h-this.margin.top-this.margin.bottom, 0);
			var sizeW = eval(coord.w);
			var sizeH = eval(coord.h);
			if(sizeH!=this[coord.h]){
				for (var i=0; i<this.panels.length; i++)
					this.panels[i][coord.h] = sizeH;
			}
            assignWeight(this.panels);
            ResizePanels(this.panels, 0, sizeW);
            this[coord.w] = sizeW;
			this[coord.h] = sizeH;
            this.SaveSizes();
            this.RefreshPanels();
		}
        
        this.RefreshPanels = function(){
            for (var i=0; i<this.panels.length; i++)
                this.panels[i].Refresh();
        }
		
		this.Init = function(w, h){
			this.x = this.margin.left;
			this.y = this.margin.top;
			this.w = w-this.margin.left-this.margin.right;
			this.h = h-this.margin.top-this.margin.bottom;
			var offset = this[coord.x];
			for (var i=0; i<this.panels.length; i++) {
				var p = this.panels[i];
				p[coord.x] = offset;
				p[coord.y] = this[coord.y];
				p[coord.w] = window.GetProperty("P"+p.index+".size", Math.round(this[coord.w]/this.panels.length));
				p[coord.h] = this[coord.h];
				if(p.visible)
					offset += p[coord.w] + sepW;
			}
            assignWeight(this.panels);
			ResizePanels(this.panels, 0, this[coord.w]);
			this.SaveSizes();
            this.RefreshPanels();
			this.initialized = true;
		}
        
		this.SaveSizes = function(){
			for (var i=0; i<this.panels.length; i++)
				window.SetProperty("P"+this.panels[i].index+".size", this.panels[i][coord.w]);
		}
	}
    
	//=======================================
	var panels = [];
	var relativePanels = new RelativePanels();
    
    this.CreatePanel = function(classname, position, absolutePosition, x, y, w, h){
		var p = new Panel(panels.length, classname, position, x, y, w, h);
		panels.push(p);
		p.relative = !absolutePosition;
		if (p.relative)
			relativePanels.panels.push(p);
		return p;
	}
	
	this.ShowPanel = function(index, show){
		var p = panels[index];
		if(p.relative)
			relativePanels.Show(p, show);
		if(show)
			p.Show();
		else
			p.Hide();
		window.Repaint();
	}

	this.MovePanel = function(index, x, y, w, h){
		panels[index].Move(x, y, w, h);
	}

	this.LockPanel = function(index, lock){
		panels[index].Lock(lock);
		if (panels[index].relative)
			relativePanels.Lock(index, lock);
	}

	this.SetPanelSizeLimit = function(index, min, max){
		panels[index].minSize = min;
		panels[index].maxSize = max;
	}

	this.SetPanelsPalcementMode = function(mode){
		relativePanels.SetPanelsPalcementMode(mode);
	}

	this.SetSeparaterProperties = function(width, drawFunc){
		relativePanels.SetSeparaterProperties(width, drawFunc);
	}

	this.SetPanelsMargin = function(left, top, right, bottom){
		relativePanels.margin = {left:left, top:top, right:right, bottom:bottom};
	}

	//function RefreshPanelsLayout(){}
	
	//=======================================
	function OnSize() {
		if(relativePanels.initialized)
			relativePanels.Resize(ww, wh);
		else
			relativePanels.Init(ww, wh);
		//on_panels_resize && on_panels_resize();
	}
	addEventListener("on_size", OnSize);
	
	function OnPaint(gr) {
		if(!ww || !wh) return;
		relativePanels.Draw(gr);
	}
	addEventListener("on_paint", OnPaint);

	function OnMouseMove(x, y) {
		relativePanels.OnMouseMove(x, y);
	}
	addEventListener("on_mouse_move", OnMouseMove);

	function OnMouseLbtnDown(x, y) {
		relativePanels.OnMouseLbtnDown(x, y);
	}
	addEventListener("on_mouse_lbtn_down", OnMouseLbtnDown);

	function OnMouseLbtnUp(x, y) {
		relativePanels.OnMouseLbtnUp(x, y);
	}
	addEventListener("on_mouse_lbtn_up", OnMouseLbtnUp);

	function OnMouseLeave() {
		relativePanels.OnMouseLeave();
	}
	addEventListener("on_mouse_leave", OnMouseLeave);

	function OnNotifyData(name, info) {
		if(name!=ThisPanelsName || typeof(info)!="object") return;
		switch(info[0]){
			case 'ShowPanel':
				_this.ShowPanel(info[1], info[2]);
				on_panels_resize && on_panels_resize();
				break;
			case 'MovePanel':
				_this.MovePanel(info[1], info[2], info[3], info[4], info[5]);
				break;
			case 'LockPanel':
				_this.LockPanel(info[1], info[2]);
				break;
			case 'RequestPanelStatus':
				var p = panels[info[1]];
				if(p)
					info[2][0] = {x:p.x, y:p.y, w:p.w, h:p.h, visible:p.visible, locked:p.locked};
				break;
		}
	}
	addEventListener("on_notify_data", OnNotifyData);

	this.Init();
}();
