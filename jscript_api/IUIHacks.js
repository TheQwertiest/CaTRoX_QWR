/** @constructor */
function IUIHacks() {

    /** @type{number} */
    this.FrameStyle = undefined;

    /** @type{number} */
    this.MoveStyle = undefined;

    /** @type{boolean} */
    this.FullScreen = undefined;

    /** @type{number} */
    this.MainWindowState = undefined;

    /** @type{float} */
    this.FoobarCPUUsage = undefined;

    /** @type{boolean|ISize} */
    this.MinSize = undefined;

    /** @type{boolean|ISize} */
    this.MaxSize = undefined;

    /** @type{IAero} */
    this.Aero = undefined;

    /** @type{boolean} */
    this.DisableSizing = undefined;

    /** @type{boolean} */
    this.EnableSizing = undefined;

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     */
    this.SetPseudoCaption = function(x,y,w,h) {};

    /** @constructor */
    function ISize() {
        this.Width = undefined;
        this.Height = undefined;
    }

    /** @constructor */
    function IAero() {
        /** @type{boolean} */
        this.Active = undefined;

        /** @type{number} */
        this.Effect = undefined;

        /** @type{number} */
        this.Top = undefined;

        /** @type{number} */
        this.Right = undefined;

        /** @type{number} */
        this.Left = undefined;

        /** @type{number} */
        this.Bottom = undefined;
    }
}

