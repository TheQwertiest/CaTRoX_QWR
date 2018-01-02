// ==PREPROCESSOR=====================================
// @name "Main & Spectrum Splitter"
// @author "Jensen"
// ==/PREPROCESSOR====================================

ThisPanelsName = "MainSpectrumSplitter";

DisableRightClickMenu();

$Splitter.SetPanelsPlacementMode("vertical");

var p0 = $Splitter.CreatePanel(PanelClassNames.PSS, 7);
var p1 = $Splitter.CreatePanel(PanelClassNames.CSP, 1);
$Splitter.LockPanel(p1.index, true);

var default_p1_size = 70;
$Splitter.SetPanelSizeLimit(0, 400, Infinity);
$Splitter.SetPanelSizeLimit(1, default_p1_size, Infinity);
p0.padding.bottom = 0;
p0.padding.top = 2;
p0.padding.left = 4;
p0.padding.right = 4;
p1.padding.left = 5;
p1.padding.right = 5;

window.GetProperty("P0.size", 400);
window.GetProperty("P1.size", default_p1_size);

$Splitter.SetSeparatorProperties(3);

//===========================================
function OnPaint(gr){
    gr.FillSolidRect(0, 0, ww, wh, pssBackColor);
}
addEventListener("on_paint", OnPaint, true);

function OnNotifyData(name, info) {
    if (name == "spectrum_state") {
        if ( info == "0") {
            $Splitter.ShowPanel(1,0);
        }
        else {
            $Splitter.ShowPanel(1,1);
        }
    }
}
addEventListener("on_notify_data", OnNotifyData);
