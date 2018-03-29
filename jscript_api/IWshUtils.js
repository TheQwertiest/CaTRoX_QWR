/** @constructor */
function IWshUtils() {
    /**
     * @param {number} window_id Actually it's a 4-byte pointer (HWND)
     * @return {IWindow}
     */
    this.GetWndByHandle = function (window_id) {};

    /** @constructor */
    function IWindow() {
        /**
         * Actually it's a 4-byte pointer (HWND)
         *
         * @type {number}
         */
        this.id = undefined; // read-only

        /** @type {string} */
        this.className = undefined; // read-only

        /** @type {number} */
        this.Height = undefined; // read-only

        /** @type {number} */
        this.Width = undefined; // read-only

        /** @type {number} */
        this.Left = undefined; // read-only

        /** @type {number} */
        this.Right = undefined; // read-only

        /** @type {number} */
        this.Top = undefined;

        /** @type {number} */
        this.Bottom = undefined;

        /**
         * @param {number} level
         * @return {IWindow}
         */
        this.GetAncestor = function (level) {};
    }
}

var wsh_utils = new IWshUtils();
