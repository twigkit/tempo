var SIMPLATE = (function(simplate) {

    /*!
	 * Prepare a container for rendering, gathering templates and clearing afterwards.
	 */
    simplate.prepare = function(container) {
        if (typeof container === 'string') {
            container = document.getElementById(container);
        }

        var templates = new Templates();
        templates.parse(container);

        return new Renderer(templates, container);
    }
    simplate.prepare.displayName = 'prepare'

    function Templates(nested) {
        this.defaultTemplate = null;
        this.namedTemplates = {};
        this.nested = nested != undefined ? nested: false;

        return this;
    }

    Templates.prototype = {
        parse: function(container) {

            var children = container.getElementsByTagName('*');

            for (var i = 0; i < children.length; i++) {
                if (children[i].getAttribute('data-template') != null && (this.nested || !utils.isNested(children[i]))) {
                    var element = children[i].cloneNode(true);

                    // Remapping container element in case template is deep in container
                    this.container = children[i].parentNode;

                    // Element is a template
                    for (var a = 0; a < element.attributes.length; a++) {
                        var attr = element.attributes[a];
                        // If attribute
                        if (utils.startsWith(attr.name, 'data-if-')) {
                            var val;
                            if (attr.value == '') {
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
        }
    }

    /*!
	 * Renderer for populating containers with data using templates.
	 */
    function Renderer(templates) {
        this.templates = templates;
        this.container = templates.container;

        return this;
    }

    Renderer.prototype = {
        render: function(data) {
            utils.clearContainer(this.container);
            if (data != null) {
                for (var i = 0; i < data.length; i++) {
                    var renderItem = function(renderer, item) {
                        var template = renderer.templateFor(item);
                        if (template != null) {
                            renderer.template = template;
                            renderer.item = item;

                            var nestedDeclaration = template.innerHTML.match(/data-template="(.*?)"/);
                            if (nestedDeclaration != null) {
                                var t = new Templates(true);
								t.parse(renderer.template);
                                    
								var r = new Renderer(t);
								r.render(renderer.item[nestedDeclaration[1]]);
                            }

                            // Functions
                            // for (var regex in renderer.functions) {
                            //                                 template.innerHTML = template.innerHTML.replace(new RegExp(regex, 'gi'), renderer.functions[regex](renderer));
                            //                             }

                            // Content
                            // template.innerHTML = utils.replaceVariable(item, template.innerHTML);

                            // Template class attribute
                            if (template.getAttribute('class') != null) {
                                template.className = utils.replaceVariable(item, template.className);
                            }

                            // Template id
                            if (template.getAttribute('id') != null) {
                                template.id = utils.replaceVariable(item, template.id);
                            }
							
                            renderer.container.appendChild(template);
                        }
                    } (this, data[i]);
                }
            }

            return this;
        },

        templateFor: function(item) {
            for (var templateName in this.templates.namedTemplates) {
                if (eval('item.' + templateName)) {
                    return this.templates.namedTemplates[templateName].cloneNode(true);
                }
            }
            if (this.templates.defaultTemplate != null) {
                return this.templates.defaultTemplate.cloneNode(true);
            }
        },

        functions: {
            // If function
            '{{if (.*?)}}(.*?){{endif}}': function(renderer) {
                return function(match, condition, content) {
                    var member_regex = '';
                    for (var member in renderer.item) {
                        if (member_regex.length > 0) {
                            member_regex += '|'
                        }
                        member_regex += member;
                    }

                    condition = condition.replace(/&amp;/g, '&');
                    condition = condition.replace(new RegExp(member_regex, 'gi'),
                    function(match) {
                        return 'renderer.item.' + match;
                    });

                    if (eval(condition)) {
                        return content;
                    }

                    return '';
                }
            }
        }
    }
    Renderer.prototype.render.displayName = 'render';


    /*!
	 * Helpers
	 */
    var utils = {
        startsWith: function(str, prefix) {
            return (str.indexOf(prefix) === 0);
        },

        replaceVariable: function(item, str) {
            return str.replace(/{{([A-Za-z0-9\.\_]*?)}}/g, replace = function(match, variable) {
                var val = eval('item.' + variable)
                if (val) {
                    return val;
                }
                return '';
            });
        },

        clearContainer: function(el) {
            if (el != null && el.childNodes != undefined) {
                for (var i = el.childNodes.length; i >= 0; i--) {
                    if (el.childNodes[i] != null && el.childNodes[i].getAttribute != undefined && el.childNodes[i].getAttribute('data-template') != null) {
                        el.childNodes[i].parentNode.removeChild(el.childNodes[i]);
                    }
                }
            }
        },

        isNested: function(el) {
            var p = el.parentNode;
            while (p != null) {
                if (p.getAttribute != undefined && p.getAttribute('data-template') != null) {
                    return true;
                }
                p = p.parentNode;
            }
            return false;
        }
    }
    utils.startsWith.displayName = 'startsWith';
    utils.replaceVariable.displayName = 'replaceVariable';
    utils.clearContainer.displayName = 'clearContainer';
    utils.isNested.displayName = 'isNested';

    return simplate;

})(SIMPLATE || {});