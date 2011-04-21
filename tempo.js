function TempoEvent(type, item, element) {
    this.type = type;
    this.item = item;
    this.element = element;

    return this;
}

TempoEvent.Types = {
    RENDER_STARTING : 'render_starting',
    ITEM_RENDER_STARTING : 'item_render_starting',
    ITEM_RENDER_COMPLETE : 'item_render_complete',
    RENDER_COMPLETE : 'render_complete'
};


var Tempo = (function (tempo) {

    /*!
     * Helpers
     */
    var utils = {
        memberRegex : function (obj) {
            var member_regex = '';
            for (var member in obj) {
                if (obj.hasOwnProperty(member)) {
                    if (member_regex.length > 0) {
                        member_regex += '|';
                    }
                    member_regex += member;
                }
            }
            return member_regex;
        },

        pad : function (val, pad, size) {
            while (val.length < size) {
                val = pad + val;
            }
            return val;
        },
        trim : function (str) {
            return str.replace(/^\s*([\S\s]*?)\s*$/, '$1');
        },

        startsWith : function (str, prefix) {
            return (str.indexOf(prefix) === 0);
        },

        replaceVariables : function (renderer, _tempo, item, str) {
            return str.replace(/\{\{[ ]?([A-Za-z0-9\._\[\]]*?)([ ]?\|[ ]?.*?)?[ ]?\}\}/g, function (match, variable, args) {
                try {
                    var val = null;

                    // Handling tempo_info variable
                    if (utils.startsWith(variable, '_tempo.')) {
                        return eval(variable);
                    }

                    if (utils.typeOf(item) === 'array') {
                        val = eval('item' + variable);
                    } else {
                        val = eval('item.' + variable);
                    }

                    // Handle filters
                    if (args !== undefined) {
                        var filters = utils.trim(utils.trim(args).substring(1)).split(/\|/);
                        for (var i = 0; i < filters.length; i++) {
                            var filter = utils.trim(filters[i]);
                            var filter_args = [];
                            // If there is a space, there must be arguments
                            if (filter.indexOf(' ') > -1) {
                                var f = filter.substring(filter.indexOf(' ')).replace(/^[ ']*|[ ']*$/g, '');
                                filter_args = f.split(/(?:[\'"])[ ]?,[ ]?(?:[\'"])/);
                                filter = filter.substring(0, filter.indexOf(' '));
                            }
                            val = renderer.filters[filter](val, filter_args);
                        }
                    }

                    if (val !== undefined) {
                        return val;
                    }
                } catch (err) {
                }

                return '';
            });
        },

        replaceObjects : function (renderer, _tempo, item, str) {
            var regex = new RegExp('(?:__[\\.]?)((_tempo|\\[|' + utils.memberRegex(item) + ')([A-Za-z0-9\\._\\[\\]]+)?)', 'g');
            return str.replace(regex, function (match, variable, args) {
                try {
                    var val = null;

                    // Handling tempo_info variable
                    if (utils.startsWith(variable, '_tempo.')) {
                        return eval(variable);
                    }

                    if (utils.typeOf(item) === 'array') {
                        val = eval('item' + variable);
                    } else {
                        val = eval('item.' + variable);
                    }

                    if (val !== undefined) {
                        if (utils.typeOf(val) === 'string') {
                            return '\'' + val + '\'';
                        } else {
                            return val;
                        }
                    }
                } catch (err) {
                }

                return undefined;
            });
        },

        applyAttributeSetters : function (renderer, item, str) {
            return str.replace(/([A-z0-9]+?)(?==).*?data-\1="(.*?)"/g, function (match, attr, data_value) {
                if (data_value !== '') {
                    return attr + '="' + data_value + '"';
                }
                return match;
            });
        },

        clearContainer : function (el) {
            if (el !== undefined && el.childNodes !== undefined) {
                for (var i = el.childNodes.length; i >= 0; i--) {
                    if (el.childNodes[i] !== undefined && el.childNodes[i].getAttribute !== undefined && el.childNodes[i].getAttribute('data-template') !== null) {
                        el.childNodes[i].parentNode.removeChild(el.childNodes[i]);
                    }
                }
            }
        },

        isNested : function (el) {
            var p = el.parentNode;
            while (p) {
                if (p.getAttribute !== undefined && p.getAttribute('data-template') !== null) {
                    return true;
                }
                p = p.parentNode;
            }
            return false;
        },

        equalsIgnoreCase : function (str1, str2) {
            return str1.toLowerCase() === str2.toLowerCase();
        },

        getElement : function (template, html) {
            if (utils.equalsIgnoreCase(template.tagName, 'tr')) {
                // Wrapping to get around read-only innerHTML
                var el = document.createElement('div');
                el.innerHTML = '<table><tbody>' + html + '</tbody></table>';
                var depth = 3;
                while (depth--) {
                    el = el.lastChild;
                }
                return el;
            } else {
                // No need to wrap
                template.innerHTML = html;
                return template;
            }
        },

        typeOf : function (obj) {
            if (typeof(obj) === "object") {
                if (obj === null) {
                    return "null";
                }
                if (obj.constructor === ([]).constructor) {
                    return "array";
                }
                if (obj.constructor === (new Date()).constructor) {
                    return "date";
                }
                if (obj.constructor === (new RegExp()).constructor) {
                    return "regex";
                }
                return "object";
            }
            return typeof(obj);
        },

        notify : function (listener, event) {
            if (listener !== undefined) {
                listener(event);
            }
        }
    };

    function Templates(nestedItem) {
        this.defaultTemplate = null;
        this.namedTemplates = {};
        this.container = null;
        this.nestedItem = nestedItem !== undefined ? nestedItem : null;

        return this;
    }

    Templates.prototype = {
        parse: function (container) {
            this.container = container;
            var children = container.getElementsByTagName('*');

            for (var i = 0; i < children.length; i++) {
                if (children[i].getAttribute !== undefined && children[i].getAttribute('data-template') !== null && (this.nestedItem === children[i].getAttribute('data-template') || children[i].getAttribute('data-template') === '' && !utils.isNested(children[i]))) {
                    this.createTemplate(children[i]);
                } else if (children[i].getAttribute !== undefined && children[i].getAttribute('data-template-fallback') !== null) {
                    // Hiding the fallback template
                    children[i].style.display = 'none';
                }
            }

            // If there is no default template (data-template) then create one from container
            if (this.defaultTemplate === null) {
                // Creating a template inside the container
                var el = document.createElement('div');
                el.setAttribute('data-template', '');
                el.innerHTML = this.container.innerHTML;

                // Clearing container before adding the wrapped contents
                this.container.innerHTML = '';

                // There is now a default template present with a data-template attribute
                this.container.appendChild(el);
                this.createTemplate(el);
            }

            utils.clearContainer(this.container);
        },

        createTemplate : function (node) {
            var element = node.cloneNode(true);

            // Clear display: none;
            if (element.style.removeAttribute) {
                element.style.removeAttribute('display');
            }
            else {
                element.style.removeProperty('display');
            }

            // Remapping container element in case template
            // is deep in container
            this.container = node.parentNode;

            // Element is a template
            var nonDefault = false;
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
                    nonDefault = true;
                }
            }

            // Setting as default template, last one wins
            if (!nonDefault) {
                this.defaultTemplate = element;
            }
        },

        templateFor: function (item) {
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
        this.listener = undefined;
        this.started = false;

        return this;
    }

    Renderer.prototype = {
        notify : function (listener) {
            this.listener = listener;

            return this;
        },

        starting : function () {
            // Use this to manually fire the RENDER_STARTING event e.g. just before you issue an AJAX request
            // Useful if you're not calling prepare immediately before render
            this.started = true;
            utils.notify(this.listener, new TempoEvent(TempoEvent.Types.RENDER_STARTING, undefined, undefined));

            return this;
        },

        renderItem : function (renderer, tempo_info, item, fragment) {
            var template = renderer.templates.templateFor(item);
            if (template && item) {
                utils.notify(this.listener, new TempoEvent(TempoEvent.Types.ITEM_RENDER_STARTING, item, template));

                var nestedDeclaration = template.innerHTML.match(/data-template="(.*?)"/g);
                if (nestedDeclaration) {
                    for (var i = 0; i < nestedDeclaration.length; i++) {
                        var nested = nestedDeclaration[i].match(/"(.*?)"/)[1];

                        var t = new Templates(nested);
                        t.parse(template);

                        var r = new Renderer(t);
                        r.render(eval('item.' + nested));
                    }
                }

                // Dealing with HTML as a String from now on (to be reviewed)
                // Attribute values are escaped in FireFox so making sure there are no escaped tags
                var html = template.innerHTML.replace(/%7B%7B/g, '{{').replace(/%7D%7D/g, '}}');

                // Tags
                for (var p = 0; p < renderer.tags.length; p++) {
                    html = html.replace(new RegExp(renderer.tags[p].regex, 'gi'), renderer.tags[p].handler(renderer, item));
                }

                // Content
                html = utils.replaceVariables(this, tempo_info, item, html);

                // JavaScript objects
                html = utils.replaceObjects(this, tempo_info, item, html);

                // Template class attribute
                if (template.getAttribute('class')) {
                    template.className = utils.replaceVariables(this, tempo_info, item, template.className);
                }

                // Template id
                if (template.getAttribute('id')) {
                    template.id = utils.replaceVariables(this, tempo_info, item, template.id);
                }

                html = utils.applyAttributeSetters(this, item, html);

                fragment.appendChild(utils.getElement(template, html));

                utils.notify(this.listener, new TempoEvent(TempoEvent.Types.ITEM_RENDER_COMPLETE, item, template));
            }
        },

        _createFragment : function (data) {
            if (data) {
                var tempo_info = {};
                var fragment = document.createDocumentFragment();

                // If object then wrapping in an array
                if (utils.typeOf(data) === 'object') {
                    data = [data];
                }

                for (var i = 0; i < data.length; i++) {
                    tempo_info.index = i;
                    this.renderItem(this, tempo_info, data[i], fragment);
                }

                return fragment;
            }

            return null;
        },

        render : function (data) {
            // Check if starting event was manually fired
            if (!this.started) {
                utils.notify(this.listener, new TempoEvent(TempoEvent.Types.RENDER_STARTING, undefined, undefined));
            }

            this.clear();
            this.append(data);

            return this;
        },

        append : function (data) {
            // Check if starting event was manually fired
            if (!this.started) {
                utils.notify(this.listener, new TempoEvent(TempoEvent.Types.RENDER_STARTING, undefined, undefined));
            }

            var fragment = this._createFragment(data);
            if (fragment !== null) {
                this.templates.container.appendChild(fragment);
            }

            utils.notify(this.listener, new TempoEvent(TempoEvent.Types.RENDER_COMPLETE, undefined, undefined));

            return this;
        },

        prepend : function (data) {
            // Check if starting event was manually fired
            if (!this.started) {
                utils.notify(this.listener, new TempoEvent(TempoEvent.Types.RENDER_STARTING, undefined, undefined));
            }

            var fragment = this._createFragment(data);
            if (fragment !== null) {
                this.templates.container.insertBefore(fragment, this.templates.container.firstChild);
            }

            utils.notify(this.listener, new TempoEvent(TempoEvent.Types.RENDER_COMPLETE, undefined, undefined));

            return this;
        },

        clear : function (data) {
            utils.clearContainer(this.templates.container);
        },

        tags : [
            // If tag (using a workaround for the dotall modifier to match multilines [\\s\\S])
            {'regex': '\\{\\{if ([\\s\\S]*?)\\}\\}([\\s\\S]*?)\\{\\{endif\\}\\}', 'handler': function (renderer, item) {
                return function (match, condition, content) {
                    var member_regex = utils.memberRegex(item);

                    condition = condition.replace(/&amp;/g, '&');
                    condition = condition.replace(new RegExp(member_regex, 'gi'), function (match) {
                        return 'item.' + match;
                    });

                    if (eval(condition)) {
                        return content;
                    }

                    return '';
                };
            }
            }
        ],

        filters : {
            'upper' : function (value, args) {
                return value.toUpperCase();
            },
            'lower' : function (value, args) {
                return value.toLowerCase();
            },
            'trim' : function (value, args) {
                return utils.trim(value);
            },
            'replace' : function (value, args) {
                if (value !== undefined && args.length === 2) {
                    return value.replace(new RegExp(args[0], 'g'), args[1]);
                }
                return value;
            },
            'append' : function (value, args) {
                if (value !== undefined && args.length === 1) {
                    return value + '' + args[0];
                }
                return value;
            },
            'prepend' : function (value, args) {
                if (value !== undefined && args.length === 1) {
                    return args[0] + '' + value;
                }
                return value;
            },
            'default' : function (value, args) {
                if (value !== undefined && value !== null) {
                    return value;
                }
                if (args.length === 1) {
                    return args[0];
                }
                return value;
            },
            'date' : function (value, args) {
                if (value !== undefined && args.length === 1) {
                    var date = new Date(value);
                    var format = args[0];
                    if (format === 'localedate') {
                        return date.toLocaleDateString();
                    } else if (format === 'localetime') {
                        return date.toLocaleTimeString();
                    } else if (format === 'date') {
                        return date.toDateString();
                    } else if (format === 'time') {
                        return date.toTimeString();
                    } else {
                        var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                        var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        var DATE_PATTERNS = {
                            'YYYY' : function (date) {
                                return date.getFullYear();
                            },
                            'YY' : function (date) {
                                return date.getFullYear().toFixed().substring(2);
                            },
                            'MMMM' : function (date) {
                                return MONTHS[date.getMonth()];
                            },
                            'MMM' : function (date) {
                                return MONTHS[date.getMonth()].substring(0, 3);
                            },
                            'MM' : function (date) {
                                return utils.pad((date.getMonth() + 1).toFixed(), '0', 2);
                            },
                            'M' : function (date) {
                                return date.getMonth() + 1;
                            },
                            'DD' : function (date) {
                                return utils.pad(date.getDate().toFixed(), '0', 2);
                            },
                            'D' : function (date) {
                                return date.getDate();
                            },
                            'EEEE' : function (date) {
                                return DAYS[date.getDay()];
                            },
                            'EEE' : function (date) {
                                return DAYS[date.getDay()].substring(0, 3);
                            },
                            'E' : function (date) {
                                return date.getDay();
                            },
                            'HH' : function (date) {
                                return utils.pad(date.getHours().toFixed(), '0', 2);
                            },
                            'H' : function (date) {
                                return date.getHours();
                            },
                            'mm' : function (date) {
                                return utils.pad(date.getMinutes().toFixed(), '0', 2);
                            },
                            'm' : function (date) {
                                return date.getMinutes();
                            },
                            'ss' : function (date) {
                                return utils.pad(date.getSeconds().toFixed(), '0', 2);
                            },
                            's' : function (date) {
                                return date.getSeconds();
                            },
                            'SSS' : function (date) {
                                return utils.pad(date.getMilliseconds().toFixed(), '0', 3);
                            },
                            'S' : function (date) {
                                return date.getMilliseconds();
                            },
                            'a' : function (date) {
                                return date.getHours() < 12 ? 'AM' : 'PM';
                            }
                        };
                        format = format.replace(/(\\)?(Y{2,4}|M{1,4}|D{1,2}|E{1,4}|H{1,2}|m{1,2}|s{1,2}|S{1,3}|a)/g, function (match, escape, pattern) {
                            if (!escape) {
                                if (DATE_PATTERNS.hasOwnProperty(pattern)) {
                                    return DATE_PATTERNS[pattern](date);
                                }
                            }
                            return pattern;
                        });

                        return format;
                    }
                }

                return '';
            }
        }
    };


    /*!
     * Prepare a container for rendering, gathering templates and
     * clearing afterwards.
     */
    tempo.prepare = function (container) {
        if (typeof container === 'string') {
            container = document.getElementById(container);
        }

        var templates = new Templates();
        templates.parse(container);

        return new Renderer(templates);
    };

    return tempo;

})(Tempo || {});
