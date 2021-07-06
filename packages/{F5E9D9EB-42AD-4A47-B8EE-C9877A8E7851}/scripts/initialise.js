let ui = new UserInterface;
let name = new Names;
let tf = new Titleformat;
let vk = new Vkeys;
let panel = new Panel;
let ml = new MediaLibrary;
let txt = new Text;
let pl = new Playlists;
let blk = new BlacklistVideo;
let mtags = new MTags;
let yt_dj = new AutoDjTracks;
let alb_scrollbar = new Scrollbar;
let art_scrollbar = new Scrollbar;
let fav = new Favourites;
fav.init();

let index = new NewAutoDJ;
let dj = new AutoDJ;
let alb = new Albums;
let filter = new Search;
let search = new Search;
let but = new Buttons;
let popUpBox = new PopUpBox;
let img = new Images;
let art = new ImageCache(true);
let cov = new ImageCache(false);
let seeker = new Seeker;
let dl_art = new Dl_art_images;
let timer = new Timers;
let men = new MenuItems;
let lib = new Library;

alb_scrollbar.type = 'alb';
art_scrollbar.type = 'art';
filter.type = 'filter';
search.type = 'search';

if (!ui.style.textOnly) {
	if (!ppt.showAlb) panel.setVideo();
} else if ($.eval('%video_popup_status%') == 'visible') fb.RunMainMenuCommand('View/Visualizations/Video');

function createImgDlFile() {
	const n = `${panel.yttm}foo_lastfm_img.vbs`;
	if (!$.file(n) || fso.GetFile(n).Size == '696') {
		const dl_im = 'If (WScript.Arguments.Count <> 2) Then\r\nWScript.Quit\r\nEnd If\r\n\r\nurl = WScript.Arguments(0)\r\nfile = WScript.Arguments(1)\r\n\r\nSet objFSO = Createobject("Scripting.FileSystemObject")\r\nIf objFSO.Fileexists(file) Then\r\nSet objFSO = Nothing\r\nWScript.Quit\r\nEnd If\r\n\r\nSet objXMLHTTP = CreateObject("MSXML2.XMLHTTP")\r\nobjXMLHTTP.open "GET", url, false\r\nobjXMLHTTP.send()\r\n\r\nIf objXMLHTTP.Status = 200 Then\r\nSet objADOStream = CreateObject("ADODB.Stream")\r\nobjADOStream.Open\r\nobjADOStream.Type = 1\r\nobjADOStream.Write objXMLHTTP.ResponseBody\r\nobjADOStream.Position = 0\r\nobjADOStream.SaveToFile file\r\nobjADOStream.Close\r\nSet objADOStream = Nothing\r\nEnd If\r\n\r\nSet objFSO = Nothing\r\nSet objXMLHTTP = Nothing';
		$.save(n, dl_im, false);
	}
}

createImgDlFile();

if (ppt.btn_mode) {
	panel.image.show == false;
	panel.video.show = false;
}

if (ppt.mtagsInstalled) {
	lib.getArtistTracks(name.artist());
}

lib.getAlbumMetadb();
ml.execute();

if (!ppt.get('Software Notice Checked', false)) fb.ShowPopupMessage('License\r\n\r\nCopyright (c) 2021 WilB\r\n\r\nThe above copyright notice shall be included in all copies or substantial portions of the Software.\r\n\r\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.', 'Find & Play');
ppt.set('Software Notice Checked', true);