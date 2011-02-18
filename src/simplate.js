var SIMPLATE = (function(simplate) {

    /*!
     * Prepare a container for rendering, gathering templates and
     * clearing afterwards.
     */
    simplate.prepare = function(container) {
        if (typeof container === 'string') {
            container = document.getElementById(container);
        }

        var templates = new Templates(false);
        templates.parse(container);

        return new Renderer(templates);
    };

    function Templates(nested) {
        this.defaultTemplate = null;
        this.namedTemplates = {};
        this.container = null;
        this.nested = nested != undefined ? nested : false;

        return this;
    }

    Templates.prototype = {
        parse: function(container) {
            this.container = container;
            var children = container.getElementsByTagName('*');

            for (var i = 0; i < children.length; i++) {
                if (children[i].getAttribute('data-template') !== undefined && (this.nested || !utils.isNested(children[i]))) {
                    var element = children[i].cloneNode(true);

                    // Remapping container element in case template
                    // is deep in container
                    this.container = children[i].parentNode;

                    // Element is a template
                    for (var a = 0; a < element.attributes.length; a++) {
                        var attr = element.attributes[a];
                        // If attribute
                        if (utils.startsWith(attr.name, 'data-if-')) {
                            var val;
                            if (attr.value === '') {
                                val = true;
                            } else {
                                val = '\'' + attr.value + '\'';
                            }
                            this.namedTemplates[attr.name.substring(8, attr.name.length) + '==' + val] = element;
                            element.removeAttribute(attr.name);
                        }
                    }

                    // Setting as default template, last one wins
                    this.defaultTemplate = element;
                }
            }

            utils.clearContainer(this.container);
        },

        templateFor: function(item) {
            for (var templateName in this.namedTemplates) {
                if (eval('item.' + templateName)) {
                    return this.namedTemplates[templateName].cloneNode(true);
                }
            }
            if (this.defaultTemplate) {
                return this.defaultTemplate.cloneNode(true);
            }
        }
    };


    /*!
     * Renderer for populating containers with data using templates.
     */
    function Renderer(templates) {
        this.templates = templates;

        return this;
    }

    Renderer.prototype = {
        render: function(data) {
            utils.clearContainer(this.templates.container);

            var fragment = document.createDocumentFragment();

            if (data) {
                for (var i = 0; i < data.length; i++) {
                    var renderItem = function(renderer, item, fragment) {
                        var template = renderer.templates.templateFor(item);
                        if (template) {

                            var nestedDeclaration = template.innerHTML.match(/data-template="(.*?)"/);
                            if (nestedDeclaration) {
                                var t = new Templates(true);
                                t.parse(template);

                                var r = new Renderer(t);
                                r.render(item[nestedDeclaration[1]]);
                            }

                            // Dealing with HTML as a String from now on (to be reviewed)
                            var html = template.innerHTML;

                            // Tags
                            for (var regex in renderer.tags) {
                                html = html.replace(new RegExp(regex, 'gi'), renderer.tags[regex](renderer, item));
                            }

                            // Content
                            html = utils.replaceVariable(item, html);

                            // Template class attribute
                            if (template.getAttribute('class')) {
                                template.className = utils.replaceVariable(item, template.className);
                            }

                            // Template id
                            if (template.getAttribute('id')) {
                                template.id = utils.replaceVariable(item, template.id);
                            }

                            fragment.appendChild(utils.getElement(template, html));
                        }
                    }(this, data[i], fragment);
                }

                this.templates.container.appendChild(fragment);
            }

            return this;
        },

        tags: {
            // If tag
            '\\{\\{if (.*?)\\}\\}(.*?)\\{\\{endif\\}\\}': function(renderer, item) {
                return function(match, condition, content) {
                    var member_regex = '';
                    for (var member in item) {
                        if (member_regex.length > 0) {
                            member_regex += '|';
                        }
                        member_regex += member;
                    }

                    condition = condition.replace(/&amp;/g, '&');
                    condition = condition.replace(new RegExp(member_regex, 'gi'), function(match) {
                        return 'item.' + match;
                    });

                    if (eval(condition)) {
                        return content;
                    }

                    return '';
                };
            }
        }
    };

    /*!
     * Helpers
     */
    var utils = {
        startsWith: function(str, prefix) {
            return (str.indexOf(prefix) === 0);
        },

        replaceVariable: function(item, str) {
            return str.replace(/\{\{([A-Za-z0-9\._]*?)\}\}/g, replace = function(match, variable) {
                var val = eval('item.' + variable);
                if (val) {
                    return val;
                }
                return '';
            });
        },

        clearContainer: function(el) {
            if (el !== undefined && el.childNodes !== undefined) {
                for (var i = el.childNodes.length; i >= 0; i--) {
                    if (el.childNodes[i] !== undefined && el.childNodes[i].getAttribute !== undefined && el.childNodes[i].getAttribute('data-template') !== null) {
                        el.childNodes[i].parentNode.removeChild(el.childNodes[i]);
                    }
                }
            }
        },

        isNested: function(el) {
            var p = el.parentNode;
            while (p) {
                if (p.getAttribute !== undefined && p.getAttribute('data-template') !== null) {
                    return true;
                }
                p = p.parentNode;
            }
            return false;
        },

        equalsIgnoreCase: function(str1, str2) {
            return str1.toLowerCase() === str2.toLowerCase();
        },

        getElement : function(template, html) {
            if (utils.equalsIgnoreCase(template.tagName, 'tr')) {
                // Wrapping to get around read-only innerHTML
                var el = document.createElement('div');
                el.innerHTML = '<table><tbody>' + html + '</tbody></table>';
                var depth = 3;
                while ( depth-- ) {
					el = el.lastChild;
				}
                return el;
            } else {
                // No need to wrap
                template.innerHTML = html;
                return template;
            }
        }
    };

    return simplate;

})(SIMPLATE || {});
