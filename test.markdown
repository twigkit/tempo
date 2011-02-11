---
title: This will be used as the title-tag of the page head
---

# Simplate > The Simple JavaScript Template Engine

## Usage

### JavaScript


	/*
	 * element : ID or an instance of an HTMLElement
	 * data    : An array of objects
	 */
	
	SIMPLATE.prepare( element ).render( data );
	
### HTML

Any tag with data-template attribute will be considered a template

	<div id="container">
		<span data-template>{{foo.bar}}</span>
	</div>

## Simple Example (static array of items)

### JavaScript

	var template = SIMPLATE.prepare('marx-brothers');
	
	template.render([
			{'name':{'first':'Leonard', 'last':'Marx'}, 'nickname':'Chico', 'born': 'March 21, 1887', 'actor': true},
			{'name':{'first':'Adolph', 'last':'Marx'}, 'nickname':'Harpo', 'born': 'November 23, 1888', 'actor': true},
			{'name':{'first':'Julius Henry', 'last':'Marx'}, 'nickname':'Groucho', 'born': 'October 2, 1890', 'actor': true},
			{'name':{'first':'Milton', 'last':'Marx'}, 'nickname':'Gummo', 'born': 'October 23, 1892'},
			{'name':{'first':'Herbert', 'last':'Marx'}, 'nickname':'Zeppo', 'born': 'February 25, 1901', 'actor': true}
		]);

### HTML

	<style>
		ul#marx-brothers li.person { margin-left: 25px; }
		ul#marx-brothers li.person.grumpy { color: red; }
	</style>

	<ul id="marx-brothers">
		<li style="list-style: none; font-weight: bold; border-bottom: 1px solid #000;">Marx Brothers (this element is not removed)</li>
		<li data-template data-if-nickname="Groucho" class="person grumpy">{{nickname}} was grumpy!</li>
		<li data-template data-if-actor class="person">{{name.first}}, nicknamed '<i>{{nickname}} {{name.last}}</i>' was born on {{born}}</li>
		<li data-template class="person">{{name.first}} {{name.last}} was not in any movies!</li>
	</ul>

### Output
