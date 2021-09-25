const ui = new UserInterface;
const panel = new Panel;
const sbar = new Scrollbar;
const vk = new Vkeys;
const lib = new Library;
const pop = new Populate;
const search = new Search;
const find = new Find;
const but = new Buttons;
const popUpBox = new PopUpBox;
const men = new MenuItems;
const timer = new Timers;
timer.lib();

if (!ppt.get('Software Notice Checked', false)) fb.ShowPopupMessage('License\r\n\r\nCopyright (c) 2021 WilB\r\n\r\nThe above copyright notice shall be included in all copies or substantial portions of the Software.\r\n\r\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.', 'Library Tree');
ppt.set('Software Notice Checked', true);