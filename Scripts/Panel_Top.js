// ====================================== //
// @name "Top Panel"
// @author "TheQwertiest"
// ====================================== //

properties.AddProperties(
    {
        showLogo:             window.GetProperty("user.Show foobar2000 logo", false),
        showBtnEllipse:       window.GetProperty("user.Show always button ellipse", false),
    }
);

var hasModdedJScript = qwr_utils.HasModdedJScript();

var isYoutubeVideoDisplayed = hasModdedJScript ? fb.IsMainMenuCommandChecked("View/Visualizations/Video") : false;

var buttons;
var rightMargin = 0;
var showTooltips = false;

/// Reduce move
var moveChecker = new _.moveCheckReducer;

createButtonImages();

function on_paint(gr)
{
    var metadb = (fb.IsPlaying ? fb.GetNowPlaying() : fb.GetFocusItem());

    gr.FillSolidRect(0, 0, ww, wh, pssBackColor);
    gr.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);

    // Logo
    if (properties.showLogo)
    {
        var logoX = 10,
            logoW = 16,
            logoY = Math.floor((wh - logoW) / 2);
			
        var fooLogo = gdi.Image(fb.FoobarPath + "themes\\" + themeFolder + "\\Images\\fooLogo.png");
        gr.SetInterpolationMode(InterpolationMode.HighQualityBicubic);
        gr.DrawImage(fooLogo, logoX, logoY, logoW, logoW, 0, 0, fooLogo.Width, fooLogo.Height, 0, 225);
    }

    // Info
    if (metadb)
    {
        var fields = "[%tracknumber%. ][%title%] ['('%length%')'][  \u25AA  $if($greater($len(%artist%),1),%artist%,%album artist%)][  \u25AA  %album%]";

        var textMargin = 10;
        var text = (fb.IsPlaying ? _.tfe(fields) : _.tf(fields, metadb)),
            x = ( properties.showLogo ? logoX + logoW + textMargin : 15),
            y = 0,
            w = ww - x - textMargin - rightMargin,
            h = wh,
            stringFormat = StringFormat(0, 1, 3, 4096); // LEFT | VCENTER | END_ELLIPSIS | NO_WRAP

        var displayFont = gdi.font("Segoe Ui Semibold", 14, 0);
        gr.DrawString(text, displayFont, _.RGB(170, 172, 174), x, y, w, h, stringFormat);
    }

    buttons.paint(gr);
}

function on_size()
{
    ww = window.Width;
    wh = window.Height;

    createButtonObjects(ww, wh);
}

function on_mouse_move(x, y, m)
{
	if ( moveChecker.isSameMove(x, y, m) )
	{
		return;
	}

	qwr_utils.DisableSizing(m);

    buttons.move(x, y);
}

function on_mouse_lbtn_down(x, y, m)
{
    buttons.lbtn_down(x, y);
}

function on_mouse_lbtn_up(x, y, m)
{
    qwr_utils.EnableSizing(m);

    buttons.lbtn_up(x, y);
}

function on_mouse_leave()
{
    buttons.leave();
}

function on_playback_stop(reason)
{
    window.Repaint();
}

function on_playback_new_track()
{
    // For youtube btns refresh
    on_size();
    window.Repaint();
}

function on_notify_data(name, info)
{
    switch (name)
    {
        case "showTooltips":
            {
                showTooltips = info;
                buttons.show_tt = showTooltips;
                break;
            }
    }
}

function createButtonObjects(ww, wh)
{
    if (buttons)
        buttons.reset();

    buttons = new _.buttons();
    buttons.show_tt = showTooltips;

    var metadb = (fb.IsPlaying ? fb.GetNowPlaying() : fb.GetFocusItem());
    var isYoutube = false;
    if (metadb)
    {
        var path = _.tf("%path%", metadb);
        isYoutube = path.indexOf('youtube.com') == 0 || path.indexOf('www.youtube.com') == 0;
    }

    var buttonCount = 1;
    if (isYoutube)
    {
        buttonCount++;
    }

    var y = 5;
    var w = 32;
    var h = w;
    var p = 5;
    var x = ww - w * buttonCount - p * (buttonCount - 1) - 10;
	rightMargin = ww - x - 5;

    buttons.buttons.search_yt = new _.button(x, y, w, h, btnImg.SearchYT, function ()
    { fb.RunMainMenuCommand("View/Youtube Search"); }, "Search Youtube");
    if (isYoutube)
	{
        buttons.buttons.yt_video = new _.button(x + (w + p), y, w, h, isYoutubeVideoDisplayed ? btnImg.VideoHide : btnImg.VideoShow, function ()
        {
            fb.RunMainMenuCommand("View/Visualizations/Video");
            isYoutubeVideoDisplayed = hasModdedJScript ? fb.IsMainMenuCommandChecked("View/Visualizations/Video") : false;
            buttons.buttons.yt_video.set_image(isYoutubeVideoDisplayed ? btnImg.VideoHide : btnImg.VideoShow);
            buttons.buttons.yt_video.tiptext = isYoutubeVideoDisplayed ? "Hide Youtube Video" : "Show Youtube Video";
            buttons.buttons.yt_video.repaint();
        }, isYoutubeVideoDisplayed ? "Hide Youtube Video" : "Show Youtube Video");
	}
}

function createButtonImages()
{
    var fontGuifx = gdi.font("Guifx v2 Transports", 16, 0);

    var btn =
    {
        SearchYT:
        {
            ico: Guifx.Zoom,
            font: fontGuifx,
            w: 30,
            h: 30
        },
        VideoShow:
        {
            ico: Guifx.Right,
            font: fontGuifx,
            w: 30,
            h: 30
        },
        VideoHide:
        {
            ico: Guifx.Right,
            font: fontGuifx,
            w: 30,
            h: 30,
            cNormal: _.RGBA(255, 220, 55, 155),
            cHover: _.RGBA(255, 220, 55, 225),
            cDown: _.RGBA(255, 220, 55, 105)
        }
    };

    btnImg = [];

    _.forEach(btn, function(item,i)
    {
        var w = item.w,
            h = item.h,
            lw = 2;

        var stateImages = []; //0=normal, 1=hover, 2=down;

        for (var s = 0; s <= 2; s++)
        {
            var img = gdi.CreateImage(w, h);
            g = img.GetGraphics();
            g.SetSmoothingMode(SmoothingMode.HighQuality);
            g.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);
            g.FillSolidRect(0, 0, w, h, pssBackColor); // Cleartype is borked, if drawn without background

            var playbackIcoColor;
            var playbackEllipseColor;

            if ( "VideoHide" != i ) {
                switch (s) {
                    case 1:
                        playbackIcoColor = _.RGB(190, 192, 194);
                        playbackEllipseColor = _.RGB(190, 195, 200);
                        break;
                    case 2:
                        playbackIcoColor = _.RGB(90, 90, 90);
                        playbackEllipseColor = _.RGB(80, 80, 80);
                        break;
                    default:
                        playbackIcoColor = _.RGB(150, 152, 154);
                        playbackEllipseColor = _.RGBA(70, 70, 70, (properties.showBtnEllipse ? 255 : 0));
                        break;
                }
            }
            else
            {
                switch (s) {
                    case 1:
                        playbackIcoColor = item.cHover;
                        playbackEllipseColor = _.RGB(190, 195, 200);
                        break;
                    case 2:
                        playbackIcoColor = item.cDown;
                        playbackEllipseColor = _.RGB(80, 80, 80);
                        break;
                    default:
                        playbackIcoColor = item.cNormal;
                        playbackEllipseColor = _.RGBA(70, 70, 70, (properties.showBtnEllipse ? 255 : 0));
                        break;
                }
            }

            g.DrawEllipse(Math.floor(lw / 2) + 1, Math.floor(lw / 2) + 1, w - lw - 2, h - lw - 2, lw, playbackEllipseColor);
            g.DrawString(item.ico, item.font, playbackIcoColor, 1, 0, w, h, StringFormat(1, 1));

            img.ReleaseGraphics(g);
            stateImages[s] = img;
        }

        btnImg[i] =
        {
            normal: stateImages[0],
            hover: stateImages[1],
            pressed: stateImages[2]
        };
    });
}

function on_mouse_rbtn_up(x, y)
{
    var cpm = window.CreatePopupMenu();

    cpm.AppendMenuItem(MF_STRING, 8, "Show foobar2000 logo");
    cpm.CheckMenuItem(8, properties.showLogo);
    cpm.AppendMenuItem(MF_STRING, 12, properties.showBtnEllipse ? "Hide button ellipse" : "Show button ellipse");

    if (utils.IsKeyPressed(VK_SHIFT))
    {
        _.appendDefaultContextMenu(cpm);
    }

    var id = cpm.TrackPopupMenu(x, y);

    switch (id)
    {
        case 8:
            properties.showLogo = !properties.showLogo;
            window.SetProperty("Show foobar2000 logo", properties.showLogo);
            window.Repaint();
            break;
        case 12:
            properties.showBtnEllipse = !properties.showBtnEllipse;
            window.SetProperty("Button Normal State Ellipse", properties.showBtnEllipse);
            createButtonImages();
            on_size();
            window.Repaint();
            break;
        default:
            _.executeDefaultContextMenu(id, scriptFolder + "Panel_Top.js");
    }

    _.dispose(cpm);

    return true;
}
