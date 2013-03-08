;
var Tempo = (function (tempo) {
    'use strict';

    var utils = function (utils) {

        /**
         * Get elements by attribute.
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
                // Looking for matching nodes at the 1st level
                var children = el.childNodes;
                if (el.hasChildNodes()) {
                    var child = el.firstChild;
                    while (child) {
                        if (child.nodeType === 1) {
                            if (child.getAttribute(attr) !== null) {
                                elements.push(child);
                                if (!all) {
                                    return elements;
                                }
                            } else {
                                children = utils.childrenByAttribute(child, attr, all);
                                if (children.length > 0) {
                                    if (all) {
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
        this.template = el;
        if (name !== null) {
            this.name = name;
            this.container = this.template.parentNode;
        } else {
            this.container = el.parentNode;
        }

        this.nestedTemplates = [];

        // Parsing template
        this._parse(this.template);
    }

    Template.DATA_TEMPLATE = 'data-template';
    Template.DATA_TEMPLATE_FOR = 'data-template-for';
    Template.VARIABLE_PATTERN = /\{\{(.+?)\}\}/g;

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
        return str.replace(Template.VARIABLE_PATTERN, function (match, variable) {
            if (variable !== '.') {
                return item[variable];
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
        this._render(this.container, data);
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
            var item = data[i];

            // First render the nested templates
            for (var t = 0; t < this.nestedTemplates.length; t++) {
                this.nestedTemplates[t].render(item[this.nestedTemplates[t].name]);
            }

            // Shallow clone of the template node to get the element and all attributes
            var el = this.template.cloneNode(false);
            // Use the innerHTML of the template itself (to leave it untouched) and add to the clone
            el.innerHTML = this._replaceVariables(this.template.innerHTML, item);
            fragment.appendChild(el);
        }

        // Add the rendered fragment to the parent
        parent.appendChild(fragment);

        return this;
    };

    /**
     * Clear the cached template (and nested templates).
     *
     * @returns {*}
     */
    Template.prototype.clear = function () {
        if (this.name !== undefined) {
            utils.clear(this.container);
        }

        return this;
    };

    /**
     * Initialise Tempo looking for a template in the container.
     *
     * @param el
     * @returns {Template}
     */
    tempo.prepare = function (el) {
        var template = utils.childrenByAttribute(el, Template.DATA_TEMPLATE, false);
        return new Template(template[0], null);
    };

    return tempo;
})({});