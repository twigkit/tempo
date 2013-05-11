/**
 * Tempo 3.0 Prototype
 *
 * @author http://twitter.com/mrolafsson
 *
 */
var Tempo = (function (tempo) {
    'use strict';

    var utils = function (utils) {

        /**
         * Get elements by attribute. If all, then traverses each child element until it finds an element with that attribute
         * but once found it will not traverse further down. This is since we normally want all element templates that
         * for a given object iteration.
         *
         * @param el Iterate child nodes of this element for matches.
         * @param attr Name of attribute to look for.
         * @param all Whether to return all elements that match or just the first one.
         *
         * @returns {*}
         */
        utils.childrenByAttribute = function (el, attr, all) {
            var elements = [];
            if (el.nodeType === 1) {
                // Looking for an element by attribute in all child elements
                var children = el.childNodes;
                if (el.hasChildNodes()) {
                    var child = el.firstChild;
                    while (child) {
                        // Only looking in element nodes
                        if (child.nodeType === 1) {
                            if (child.getAttribute(attr) !== null) {
                                elements.push(child);
                                // If a match is found and I do not need all then return
                                if (!all) {
                                    return elements;
                                }
                            } else {
                                // Child element did not have the attribute I need, checking grandchildren
                                // TODO is it more efficient to scan all child nodes first?
                                // TODO Maybe I am needlessly traversing too far down the tree?
                                children = utils.childrenByAttribute(child, attr, all);
                                if (children.length > 0) {
                                    // If I need all, then add matches for this level to the array
                                    if (all) {
                                        // Combining any grandchildren found with the main array to return
                                        elements = elements.concat(children);
                                    } else {
                                        return children;
                                    }
                                }
                            }
                        }
                        child = child.nextSibling;
                    }
                }
            }

            return elements;
        };

        /**
         * Empty the container.
         *
         * @param el
         * @returns {*}
         */
        utils.clear = function (el) {
            while (el.firstChild) {
                el.removeChild(el.firstChild);
            }
        };

        /**
         * Return member (nested or otherwise) for a given dot, bracket or mix notation reference.
         *
         * @param data
         * @param reference
         * @returns {*}
         */
        utils.member = function (data, reference) {
            // Traversing item reference without using eval()
            var members = reference.match(/[^\['"\]\.]+/g);
            for (var i = 0; i < members.length; i++) {
                if (members[i]) {
                    data = data[members[i]];
                }
            }
            return data;
        };

        /**
         * Attempt to reliably set innerHTML.
         *
         * @param el
         * @param html
         * @returns {*}
         */
        utils.html = function (el, html) {
            // Check out innerShiv if there's issues with other elements?
            if (navigator.appVersion.indexOf("MSIE") > -1 || tempo._test.IE) {
                var table;
                if ((table = html.match(/^<(tbody|tr|td|th|col|colgroup|thead|tfoot)[\s\/>]/i))) {
                    var div = el.ownerDocument.createElement('div');
                    div.innerHTML = '<table>' + html + '</table>';
                    div = div.getElementsByTagName(table[1])[0].parentNode;
                    var j = div.childNodes.length;
                    while (j--) {
                        el.appendChild(div.firstChild);
                    }

                    return el;
                }
            }

            el.innerHTML = html;
            return el;
        };

        return utils;
    }({});

    /**
     * Template encapsulates the repeatable template within a container.
     *
     * @param el
     * @param name If nested template then pass in the name of member to use.
     * @constructor
     */
    function Template(el, name) {
        if (el) {
            this.template = el;
            if (name !== null) {
                // Nested templates have a name
                this.name = name;
                this.container = this.template.parentNode;
            } else {
                // For main template preserving link to the node that contains the template
                // TODO Is this definitely different from this.template.parentNode?
                this.container = el.parentNode;
            }

            this.nestedTemplates = [];

            // Parsing template
            this._parse(this.template);
        }
    }

    Template.DATA_TEMPLATE = 'data-template';
    Template.DATA_TEMPLATE_FOR = 'data-template-for';

    /**
     * Parse the template for variable expressions and nested templates.
     *
     * @param template
     */
    Template.prototype._parse = function (template) {
        // Find all nested templates
        var nestedTemplates = utils.childrenByAttribute(template, Template.DATA_TEMPLATE_FOR, true);
        for (var i = 0; i < nestedTemplates.length; i++) {
            // Add nested template to a list of nested templates
            this.nestedTemplates.push(new Template(nestedTemplates[i], nestedTemplates[i].getAttribute(Template.DATA_TEMPLATE_FOR)));
        }

        utils.clear(this.container);
    };

    /**
     * Function to replace Tempo variable expressions with corresponding member from a data item.
     *
     * @param str
     * @param item
     * @returns string
     * @private
     */
    Template.prototype._replaceVariables = function (str, item) {
        return str.replace(/\{\{(.+?)\}\}/g, function (match, variable) {
            if (variable !== '.') {
                return utils.member(item, variable);
            } else {
                return item;
            }
        });
    };

    /**
     * Render the data, clears the container.
     * @param data
     */
    Template.prototype.render = function (data) {
        utils.clear(this.container);
        this.append(data);
    };

    /**
     * Append the data to the container.
     *
     * @param data
     */
    Template.prototype.append = function (data) {
        this.container.appendChild(this._render(this.container, data));
    };

    /**
     * Prepend the data to the container.
     *
     * @param data
     */
    Template.prototype.prepend = function (data) {
        this.container.insertBefore(this._render(this.container, data), this.container.firstChild);
    };


    /**
     * Render the data into the parent element.
     *
     * @param parent
     * @param data
     * @returns {*}
     * @private
     */
    Template.prototype._render = function (parent, data) {
        var fragment = document.createDocumentFragment();

        for (var i = 0; i < data.length; i++) {
            // TODO Allow for non-array objects to be rendered

            // First render the nested templates
            for (var t = 0; t < this.nestedTemplates.length; t++) {
                this.nestedTemplates[t].render(utils.member(data[i], this.nestedTemplates[t].name));
            }

            // Shallow clone of the template node to get the element and all attributes (don't need the child elements)
            var el = this.template.cloneNode(false);
            // Use the innerHTML of the template itself (to leave it untouched) and add to the clone
            utils.html(el, this._replaceVariables(this.template.innerHTML, data[i]));
            fragment.appendChild(el);
        }

        // Return the rendered fragment to the parent
        return fragment;
    };

    /**
     * Initialise Tempo looking for a template in the container.
     *
     * @param el
     * @returns {Template}
     */
    tempo.prepare = function (el) {
        // Finding the template - and element marked with attribute data-template
        var template = utils.childrenByAttribute(el, Template.DATA_TEMPLATE, false);
        return new Template(template[0], null);
    };

    tempo._test = {utils: utils, Template: Template, IE: false};

    return tempo;
})(Tempo || {});