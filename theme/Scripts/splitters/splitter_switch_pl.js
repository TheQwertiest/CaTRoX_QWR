// ==PREPROCESSOR=====================================
// @name "PSS Switch & Playlist Splitter"
// @author "Jensen"
// ==/PREPROCESSOR====================================


ThisPanelsName = "SwitchPLSplitter";

DisableRightClickMenu();

$Splitter.SetPanelsPlacementMode("horizontal");

var p0 = $Splitter.CreatePanel(PanelClassNames.PSS, 8);
var p1 = $Splitter.CreatePanel(PanelClassNames.JSP, 13);

$Splitter.SetPanelSizeLimit(0, 200, Infinity);
$Splitter.SetPanelSizeLimit(1, 300, Infinity);

window.GetProperty("P0.size", 91);
window.GetProperty("P1.size", 116);

$Splitter.SetSeparatorProperties(3);

//===========================================
function OnPaint(gr){
	gr.FillSolidRect(0, 0, ww, wh, pssBackColor);
    
}
addEventListener("on_paint", OnPaint, true);

function OnNotifyData(name, info){
    if (name == "minimode_state") {
        if (window.IsVisible) {
            $Splitter.SetPanelSizeLimit(0, p0.w, p0.w);
        }
    }

    if (name == "minimode_state_size") {
        if ( info == "Full") {
            $Splitter.SetPanelSizeLimit(0, 200, Infinity);
        }
    }
}
addEventListener("on_notify_data", OnNotifyData);
