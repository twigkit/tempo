var SIMPLATE = (function(simplate) {

	/*!
	 * Prepare a container for rendering, gathering templates and clearing afterwards.
	 */
	simplate.prepare = function(container) {
		var defaultTemplate;
		var namedTemplates = {};
		
		if (typeof container === 'string') {
			container = document.getElementById(container);
		}

		var children = container.getElementsByTagName('*');
		for (var i = 0; i < children.length; i++) {
			var element = children[i].cloneNode(true);
			if (element.hasAttribute('data-template')) {
				// Remapping container element in case template is deep in container
				container = children[i].parentNode;
				
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
						namedTemplates[attr.name.substring(8, attr.name.length) + '==' + val] = element;
						element.removeAttribute(attr.name);
					}
				}

				// Setting as default template, last one wins
				defaultTemplate = element;
			}
		}

		utils.clearContainer(container);

		return new Renderer(container, defaultTemplate, namedTemplates);
	}
	simplate.prepare.displayName = 'prepare'

	/*!
	 * Renderer for populating containers with data using templates.
	 */
	function Renderer(container, defaultTemplate, namedTemplates) {
		this.container = container;
		this.defaultTemplate = defaultTemplate;
		this.namedTemplates = namedTemplates;

		return this;
	}

	Renderer.prototype = {
		render : function(data) {
			utils.clearContainer(this.container);

			for (var i = 0; i < data.length; i++) {
				var item = data[i];
				var template = null;

				for (var templateName in this.namedTemplates) {
					if (eval('item.' + templateName)) {
						template = this.namedTemplates[templateName].cloneNode(true);
						break;
					}
				}

				if (template == null) {
					template = this.defaultTemplate.cloneNode(true);
				}

				// Functions
				template.innerHTML = template.innerHTML.replace(/{{if (.*?)}}(.*?){{endif}}/g, function(match, condition, content) {
					if (eval('item.' + condition)) {
						return content;
					}
					return '';
				});
				
				// Content
				template.innerHTML = utils.replaceVariable(item, template.innerHTML);
				
				// Template class attribute
				if (template.hasAttribute('class')) {
					template.className = utils.replaceVariable(item, template.className);
				}
				
				// Template id
				if (template.hasAttribute('id')) {
					template.id = utils.replaceVariable(item, template.id);
				}
				this.container.appendChild(template);
			}

			return this;
		}
	}
	Renderer.prototype.render.displayName = 'render';

	/*!
	 * Helpers
	 */
	var utils = {
		startsWith : function(str, prefix) {
			return (str.indexOf(prefix) === 0);
		},
		
		replaceVariable : function(item, str) {
			return str.replace(/{{([A-Za-z0-9\.\_]*?)}}/g, replace = function(match, variable) {
				return eval('item.' + variable);
			});
		},

		clearContainer : function (el) {
			for (var i = el.childNodes.length; i >= 0; i--) {
				if (el.childNodes[i] != undefined && el.childNodes[i].hasAttribute != undefined && el.childNodes[i].hasAttribute('data-template')) {
					el.childNodes[i].parentNode.removeChild(el.childNodes[i]);
				}
			}
		}
	}
	utils.startsWith.displayName = 'startsWith';
	utils.replaceVariable.displayName = 'replaceVariable';
	utils.clearContainer.displayName = 'clearContainer';

	return simplate;

})(SIMPLATE || {});