// ==PREPROCESSOR==
// @name 'Linked List'
// @author 'TheQwertiest'
// ==/PREPROCESSOR==

/**
 * @constructor
 * @template T
 */
function LinkedList() {
    /**
     * @param{T} value
     * @param{?Node} prev
     * @param{?Node} next
     * @constructor
     * @struct
     * @template T
     */
    function Node(value, prev, next) {
        this.value = value;
        this.prev = prev;
        this.next = next;
    }

    /**
     * @param {Node} node
     * @constructor
     * @template T
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
         * @return {T}
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

    this.clear = function () {
        back = null;
        front = null;
        size = 0;
    };

    /**
     * @param{T} value
     */
    this.push_back = function (value) {
        add_node(new Node(value, back, null));
    };

    /**
     * @param{T} value
     */
    this.push_front = function (value) {
        add_node(new Node(value, null, front));
    };

    this.pop_front = function () {
        remove_node(front);
    };

    this.pop_back = function () {
        remove_node(back);
    };

    /**
     * @param {Iterator<T>} iterator
     */
    this.remove = function(iterator) {
        if (!_.isInstanceOf(iterator, Iterator)) {
            throw new TypeError(iterator, typeof iterator, 'Iterator');
        }

        if (iterator.compare(this.end())) {
            throw new LogicError('Removing invalid iterator');
        }

        remove_node(iterator.cur_node);

        iterator.cur_node = end_node;
    };

    /**
     * @return {T}
     */
    this.front = function() {
        return front.value;
    };

    /**
     * @return {T}
     */
    this.back = function() {
        return back.value;
    };

    /**
     * @return {number}
     */
    this.length = function () {
        return size;
    };

    /**
     * This method creates Iterator object
     * @return {Iterator<T>}
     */
    this.begin = function() {
        return new Iterator(front ? front : end_node);
    };

    /**
     * This method creates Iterator object
     * @return {Iterator<T>}
     */
    this.end = function() {
        return new Iterator(end_node);
    };

    /**
     * @param {Node} node
     */
    function add_node(node) {
        if (node.prev) {
            node.prev.next = node;
        }
        else {
            front = node;
        }

        if (node.next) {
            node.next.prev = node;
        }
        else {
            back = node;
        }

        ++size;
    }

    /**
     * @param {?Node} node
     */
    function remove_node(node) {
        if (!node) {
            return;
        }

        if (node.prev) {
            node.prev.next = node.next;
        }
        else {
            front = node.next;
        }

        if (node.next) {
            node.next.prev = node.prev;
        }
        else {
            back = node.prev;
        }

        --size;
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