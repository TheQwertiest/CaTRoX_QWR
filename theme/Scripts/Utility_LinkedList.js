// ==PREPROCESSOR==
// @name 'Linked List'
// @author 'TheQwertiest'
// ==/PREPROCESSOR==

function LinkedList() {
    /**
     * @param{*} value
     * @param{?Node} prev
     * @param{?Node} next
     * @constructor
     */
    function Node(value, prev, next) {
        this.value = value;
        this.prev = prev;
        this.next = next;
    }

    this.clear = function () {
        back = null;
        front = null;
        size = 0;
    };

    /**
     * @param{*} value
     */
    this.push_back = function (value) {
        var node = new Node(value, back, null);
        if (back) {
            back.next = node;
        }
        back = node;

        if (!size){
            front = back;
        }

        ++size;
    };

    /**
     * @param{*} value
     */
    this.push_front = function (value) {
        var node = new Node(value, null, front);
        if (front) {
            front.prev = node;
        }
        front = node;

        if (!size){
            back = front;
        }

        ++size;
    };

    this.pop_front = function () {
        if (!front) {
            return;
        }

        front = front.next;
        if (front) {
            front.prev = null;
        }

        if (size === 1) {
            back = null;
        }

        --size;
    };

    this.pop_back = function () {
        if (!back) {
            return;
        }

        back = back.prev;
        if (back) {
            back.next = null;
        }

        if (size === 1) {
            front = null;
        }

        --size;
    };

    /**
     * @param {Iterator} iterator
     */
    this.remove = function(iterator) {
        if (!_.isInstanceOf(iterator, Iterator)) {
            throw new TypeError(iterator, typeof iterator, 'Iterator');
        }

        if (iterator.compare(this.end())) {
            throw new LogicError('Removing invalid iterator');
        }

        var node_to_remove = iterator.cur_node;
        if (node_to_remove.prev) {
            node_to_remove.prev.next = node_to_remove.next;
        }
        else {
            front = node_to_remove.next;
        }

        if (node_to_remove.next) {
            node_to_remove.next.prev = node_to_remove.prev;
        }
        else {
            back = node_to_remove.prev;
        }

        iterator.cur_node = end_node;

        --size;
    };

    /**
     * @return {number}
     */
    this.length = function () {
        return size;
    };

    /**
     * @return {*}
     */
    this.front = function() {
        return front.value;
    };

    /**
     * @return {*}
     */
    this.back = function() {
        return back.value;
    };

    /**
     * This method creates Iterator object
     * @return {Iterator}
     */
    this.begin = function() {
        return new Iterator(front ? front : end_node);
    };

    /**
     * This method creates Iterator object
     * @return {Iterator}
     */
    this.end = function() {
        return new Iterator(end_node);
    };

    /**
     * @param {Node} node
     * @constructor
     */
    function Iterator(node) {
        this.increment = function () {
            if (this.cur_node === end_node) {
                throw new LogicError('Iterator is out of bounds');
            }

            this.cur_node = this.cur_node.next;
            if (!this.cur_node) {
                this.cur_node = end_node;
            }
        };

        this.decrement = function () {
            if (this.cur_node === front) {
                throw new LogicError('Iterator is out of bounds');
            }

            if (this.cur_node === end_node) {
                this.cur_node = back;
            }
            else {
                this.cur_node = this.cur_node.prev;
            }
        };

        /**
         * @return {*}
         */
        this.value = function () {
            if (this.cur_node === end_node) {
                throw new LogicError('Accessing end node');
            }

            return this.cur_node.value;
        };

        /**
         * @param {Iterator} iterator
         * @return {boolean}
         */
        this.compare = function (iterator) {
            return iterator.cur_node === this.cur_node;
        };

        /**
         * @private {Node}
         */
        this.cur_node = node;
    }

    /** @type {?Node} */
    var back = null;
    /** @type {?Node} */
    var front = null;
    /** @type {number} */
    var size = 0;

    /** @const {Node} */
    var end_node = new Node(null,null,null);
}