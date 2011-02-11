var SIMPLATE = (function(simplate) {

	var defaultTemplate;
	var namedTemplates = {};

	/*!
	 * Prepare a container for rendering, gathering templates and clearing afterwards.
	 */
	simplate.prepare = function(container) {
		if (typeof container === 'string') {
			container = document.getElementById(container);
		}

		var children = container.getElementsByTagName('*');
		for (var i = 0; i < children.length; i++) {
			var element = children[i].cloneNode(true);
			if (element.hasAttribute('data-template')) {
				for (var a = 0; a < element.attributes.length; a++) {
					var attr = element.attributes[a];
					if (utils.startsWith(attr.name, 'data-if-')) {
						var val;
						if (attr.value == '') {
							val = true;
						} else {
							val = '\'' + attr.value + '\'';
						}
						namedTemplates[attr.name.substring(8, attr.name.length) + '==' + val] = element;
					}
				}

				// Setting as default template, last one wins
				defaultTemplate = element;
			}
		}

		utils.clearContainer(container);

		return new Renderer(container);
	}
	simplate.prepare.displayName = 'prepare'

	/*!
	 * Renderer for populating containers with data using templates.
	 */
	function Renderer(container) {
		this.container = container;

		return this;
	}

	Renderer.prototype = {
		render : function(data) {
			utils.clearContainer(this.container);

			for (var i = 0; i < data.length; i++) {
				var item = data[i];
				var template = null;

				for (var templateName in namedTemplates) {
					if (eval('item.' + templateName)) {
						template = namedTemplates[templateName].cloneNode(true);
						break;
					}
				}

				if (template == null) {
					template = defaultTemplate.cloneNode(true);
				}

				// Content
				template.innerHTML = template.innerHTML.replace(/{{([A-Za-z0-9\.]*?)}}/g, replace = function(match, variable) {
					return eval('item.' + variable);
				});
				
				// Template class attribute
				if (template.hasAttribute('class')) {
					template.className = template.className.replace(/{{([A-Za-z0-9\.]*?)}}/g, replace = function(match, variable) {
						return eval('item.' + variable);
					});
				}
				
				// Template id
				if (template.hasAttribute('id')) {
					template.id = template.id.replace(/{{([A-Za-z0-9\.]*?)}}/g, replace = function(match, variable) {
						return eval('item.' + variable);
					});
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

		clearContainer : function (el) {
			var children = el.getElementsByTagName('*');
			for (var i = children.length; i >= 0; i--) {
				if (children[i] != undefined && children[i].hasAttribute('data-template')) {
					el.removeChild(children[i]);
				}
			}
		}
	}
	utils.startsWith.displayName = 'startsWith';
	utils.clearContainer.displayName = 'clearContainer';

	return simplate;

})(SIMPLATE || {});