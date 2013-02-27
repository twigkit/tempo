# Tempo 2.0

> Tempo is an easy, intuitive JavaScript rendering engine that enables you to craft data templates in pure HTML.


### Why use Tempo?

* Clear separation of concerns: no HTML in your JavaScript files, and no JavaScript in your HTML
* Makes working with AJAX/JSON concernsontent a piece of cake
* Works in Safari, Chrome, FireFox, Opera, and Internet Explorer 6+


### Key Features

* Itty-bitty footprint, lightning-fast rendering!
* No dependencies - Use with or without jQuery
* Supports partial, nested and conditional templates
* Support for pre-processing, filter and formatting functions and safe attribute setters
* Variable injection for inline JavaScript expressions
* Degrades gracefully if JavaScript is not enabled
* Configurable syntax for greater compatibility


## Quick start

### 1. Include the Tempo script

	<script src="js/tempo.js" type="text/javascript"></script>
	<script>Tempo.prepare("tweets").render(data);</script>

### 2. Compose the data template inline in HTML

	<ol id="tweets">
	    <li data-template>
	        <img src="default.png" data-src="{{profile_image_url}}" />
	        <h3>{{from_user}}</h3>
	        <p>{{text}}<span>, {{created_at|date 'HH:mm on EEEE'}}</span></p>
	    </li>
	    <li data-template-fallback>Sorry, JavaScript required!</li>
	</ol>

### 3. Booyah! You're done!


## Usage

You only need to include one little script:

	<script src="js/tempo.js" type="text/javascript"></script>


### Data

Tempo takes information encoded as JSON and renders it according to an HTML template. Below is a sample *array* of JSON data. Tempo can also iterate members of an associative array (object).

	var data = [
	    {'name':{'first':'Leonard','last':'Marx'},'nickname':'Chico','born':'March 21, 1887','actor': true,'solo_endeavours':[{'title':'Papa Romani'}]},
	    {'name':{'first':'Adolph','last':'Marx'},'nickname':'Harpo','born':'November 23, 1888','actor':true,'solo_endeavours':[{'title':'Too Many Kisses','rating':'favourite'},{'title':'Stage Door Canteen'}]},
	    {'name':{'first':'Julius Henry','last':'Marx'},'nickname':'Groucho','born': 'October 2, 1890','actor':true,'solo_endeavours':[{'title':'Copacabana'},{'title':'Mr. Music','rating':'favourite'},{'title':'Double Dynamite'}]},
	    {'name':{'first':'Milton','last':'Marx'},'nickname':'Gummo','born':'October 23, 1892'},
	    {'name':{'first':'Herbert','last':'Marx'},'nickname':'Zeppo','born':'February 25, 1901','actor':true,'solo_endeavours':[{'title':'A Kiss in the Dark'}]}
	];


### JavaScript

#### Tempo.prepare()
First you need to point Tempo at the container that contains the template elements:

	var template = Tempo.prepare(element);

> #### `element`
> The ID of the HTML element (or the element itself) containing your data template. If you're using jQuery, you may pass in a jQuery object instead.

To initialize Tempo, run the `prepare()` function to scan an HTML container for data templates, cache them in memory, and remove the data template HTML elements from the page. Tempo.prepare(element) returns an instance of a renderer that knows how to layout the data you provide to it.

If the container does not contain a default (that is without conditions and not nested) data-template the entire contents of the container will be considered to represent the template.


#### template.render()

	template.render(data);
	
The Tempo.prepare() function returns an instance of a template ready for rendering. Once the JSON data is available, run the render(data) function to add the data to the page.

> #### `data`
> The JSON data to be rendered - either an `array` or an `object` in which case the members are iterated and provided as key/value pairs.


#### template.append()

Renderer methods all return an instance of the renderer (a la fluent) so you can chain calls to it. The `append(data)` function will render the data you pass in and append it to the container.

	Tempo.prepare('marx-brothers').render( data ).append( more_brothers );


#### template.prepend()

The `prepend(data)` function will render the data you pass in and insert it before others in the container.

	Tempo.prepare('marx-brothers').render( data ).prepend( brothers_we_didnt_know_about );


#### template.clear()

The `clear()` function will empty the container, allowing you to e.g. render the data again.

	Tempo.prepare('marx-brothers').render( data ).clear();


#### template.into(container)

The `into(element)` function will allow you to render the original template to one or more different containers specified. The method will return a new template on which you can call the other template methods such as `render()` or `append()`.

> #### `container`
> The container to render the template to.

##### Render to different container:

	Tempo.prepare('marx-brothers').into('alternative-container').render( data );

##### Reuse template for multiple different containers:
	
	var template = Tempo.prepare('marx-brothers');
	template.into('alternative-container').render( data_1 );
	template.into('yet-another-alternative-container').render( data_2 );


### HTML

#### data-template

Any tag with the `data-template` attribute will be treated as a template. For compliance the full (non-minimized) form is also supported: `data-template="data-template"`.


#### {{field}}

Any field represented in the JSON data may be retrieved by referencing the field name inside double brackets.

	<ol id="marx-brothers">
	    <li data-template>{{nickname}} {{name.last}}</li>
	</ol>
	
The example above would produce the following output:

	1. Chico Marx
	2. Harpo Marx
	3. Groucho Marx
	4. Gummo Marx
	5. Zeppo Marx


Here's an example of a simple array of strings:

	var data = [ 'Leonard Marx', 'Adolph Marx', 'Julius Henry Marx', 'Milton Marx', 'Herbert Marx' ];

You can reference the object being iterated with `{{.}}`:

	<ol id="marx-brothers">
	    <li data-template>{{.}}</li>
	</ol>

If the JSON data represents an array of arrays (which can not be referenced by field/member name) for example:

	var data = [ ['Leonard','Marx'], ['Adolph','Marx'], ['Julius Henry','Marx'], ['Milton','Marx'], ['Herbert','Marx'] ];
	
You can reference array elements with the following notation:

	<ol id="marx-brothers">
	    <li data-template>{{[0]}} {{[1]}}</li>
	</ol>

Both examples would produce the following output:

	1. Leonard Marx
	2. Adolph Marx
	3. Julius Henry Marx
	4. Milton Marx
	5. Herbert Marx


#### Using data from associative arrays (objects)

Normally data being iterated is represented as an array of objects. In some cases however the data is a series of objects in a map:

	var data = {
	    'leonard': 'Leonard Marx',
	    'adolph': 'Adolph Marx',
	    'julius': 'Julius Henry Marx',
	    'milton': 'Milton Marx',
	    'herbert': Herbert Marx'
	};
	
In this case you can iterate all the elements using the `data-from-map` attribute where the key name can be accessed with `{{key}}` and the value object via `{{value}}`:

	<ol id="list">
	    <li data-template data-from-map>{{value}} - {{key | append '@marx.com'}}</li>
	</ol>


#### Values are escaped by default

All values are escaped by default. To disable automatic escaping pass in the 'escape': false parameter:

	Tempo.prepare('marx-brothers', {'escape': false}).render(data);

If you disable escaping you can control this at individual value level using the `escape` and `encodeURI` filters.


#### Nested data-templates

Data templates can even be nested within other data templates. Multiple nested templates are supported.

	<li data-template>
	    {{nickname}} {{name.last}}
	    <ul>
	        <li data-template-for="solo_endeavours">{{title}}</li>
	    </ul>
	</li>

The example above would produce the following output:

	1. Chico Marx
		◦ Papa Romani
	2. Harpo Marx
		◦ Too Many Kisses
		◦ Stage Door Canteen
	3. Groucho Marx
		◦ Copacabana
		◦ Mr. Music
		◦ Double Dynamite
	4. Gummo Marx
	5. Zeppo Marx
		◦ A Kiss in the Dark

You can (recursively) refer to parent objects within a nested template using the `_parent` variable.

	<li data-template-for="solo_endeavours">{{_parent.name.first}} acted in {{title}}</li>


#### Nested Templates as Partial Template Files

Tempo supports separating more complex nested templates in to master and partial template files. Partials templates are loaded on demand from the server and do require you to use the *alternative asynchronous pattern*:

##### JavaScript:

	Tempo.prepare('marx-brothers', {}, function(template) {
	   template.render(data);
	});
	
##### Template:

	<li data-template>
	    {{name.first}} {{name.last}}
	    <ol>
	        <li data-template-for="solo_endeavours" data-template-file="partials/movie.html"></li>
	    </ol>
	</li>
	
##### Partial ('partials/movie.html'):

	{{title}}

This would produce the same output as the example above:

	1. Chico Marx
		◦ Papa Romani
	2. Harpo Marx
		◦ Too Many Kisses
		◦ Stage Door Canteen
	3. Groucho Marx
		◦ Copacabana
		◦ Mr. Music
		◦ Double Dynamite
	4. Gummo Marx
	5. Zeppo Marx
		◦ A Kiss in the Dark
		

#### Conditional Templates

Tempo provides boolean and value-based conditionals, as well as the ability to define multiple data templates per container (the first matching template wins).

	<ul id="marx-brothers3">
	    <li data-template data-if-nickname="Groucho"">{{nickname}} (aka {{name.first}}) was grumpy!</li>
	    <li data-template data-if-actor>{{name.first}}, nicknamed '<i>{{nickname}} {{name.last}}</i>' was born on {{born}}</li>
	
	    <!-- Default template -->
	    <li data-template>{{name.first}} {{name.last}} was not in any movies!</li>
	</ul>

This example would produce the following output:

	• Leonard, nicknamed 'Chico Marx' was born on March 21, 1887
	• Adolph, nicknamed 'Harpo Marx' was born on November 23, 1888
	• Groucho (aka Julius Henry) was grumpy!
	• Milton Marx was not in any movies!
	• Herbert, nicknamed 'Zeppo Marx' was born on February 25, 1901

You can define templates based on data member existence as well:

	<li data-template data-has="friend">{{friend}}></li>


#### Fallback Template

Use the data-template-fallback attribute to identify HTML containers you would like to show if JavaScript is disabled.

To ensure that your data template is not visible before being rendered (either because of JavaScript being disabled or due to latency retrieving the data), it's best practice to hide your templates with CSS. If you add an inline rule of `style="display: none;"`. Tempo will remove the inline rule once the data has been rendered.

	<ul id="marx-brothers">
	    <li data-template style="display: none;">{{nickname}} {{name.last}}</li>
	    <li data-template-fallback>Sorry, JavaScript required!</li>
	</ul>
	
If JavaScript is disabled in the browser the above example would be rendered as:

	• Sorry, JavaScript required!


#### Preserving other elements in the template container

If the template container contains other elements that should be preserved or ignored you can mark these with the `data-before-template` and `data-after-template` attributes:

	<ol id="marx-brothers">
	    <li data-before-template>...</li>
	    <li data-template>{{name.first}} {{name.last}}</li>
	    <li data-after-template>...</li>
	</ol>


#### Filter and Formatting Functions

Tempo supports a number of filter functions to modify individual values before they are rendered. Filters can be chained to apply multiple ones to the same value.

##### `{{ field | escape }}`
Escape HTML characters before rendering to page.

##### `{{ field | encodeURI }}`
Encodes a Uniform Resource Identifier (URI) by replacing certain characters with escape sequences representing the UTF-8 encoding of the character.

##### `{{ field | decodeURI }}`
Replaces each escape sequence in an encoded URI with the character that it represents.

##### `{{ field | truncate 25[, 'optional_suffix'] }}`
If the value of this field is longer than 25 characters, then truncate to the length provided. If a second argument is provided then it is used as the suffix instead of the default ellipsis (...).

##### `{{ field | format[, numberOfDecimals] }}`
Currently only formats numbers like 100000.25 by adding commas: 100,000.25. You can optionally specify the number of decimals to use.

##### `{{ field | default 'default value' }}`
If the field is undefined, or null, then show the default value specified.

##### `{{ field | date 'preset or pattern like HH:mm, DD-MM-YYYY'[, 'UTC'] }}`
Creates a date object from the field value, and formats according to presets, or using a date pattern. Available presets are localedate, localetime, date and time. The following pattern elements are supported:

* `YYYY` or `YY`: year as 4 or 2 digits.
* `MMMM`, `MMM`, `MM` or `M`: month of the year as either full name (September), abbreviated (Sep), padded two digit number or simple integer.
* `DD` or `D`: day of the month.
* `EEEE`, `EEE` or `E`: day of the week as either full (Tuesday), abbreviated (Tue) or number.
* `HH`, `H` or `h`: hour of the day.
* `mm` or `m`: minutes of the hour.
* `ss` or `s`: seconds.
* `SSS` or `S`: milliseconds.
* `a`: AM/PM.

If you would like to use any of the format characters verbatim in the pattern then use `\` to escape: `{{ some_date | date '\at HH:mm' }}`. In this case the a is not replaced with AM/PM. Additionally you can specify whether dates should be handled as UTC.

##### `{{ field | replace 'regex_pattern', 'replacement' }}`
Replace all occurrences of the pattern (supports regular expressions) with the replacement. Replacement string can contain backreferences. See [Twitter code sample](http://tempojs.com/examples/twitter/) for an example.

##### `{{ field | trim }}`
Trim any white space at the beginning or end of the value.

##### `{{ field | upper }}`
Change any lower case characters in the value to upper case.

##### `{{ field | lower }}`
Change any upper case characters in the value to lower case.

##### `{{ field | titlecase[, 'and for the'] }}`
Format strings to title case, with an optional blacklist of words that should not be titled (unless first in string e.g. 'the last of the mohicans' to 'The Last of the Mohicans').

##### `{{ field | append '&nbsp;some suffix' }}`
If the field value is not empty, then append the string to the value. Helpful if you don't want the suffix to show up in the template if the field is undefined or null. Use `&nbsp;` if you need before or after the suffix.

##### `{{ field | prepend 'some prefix&nbsp;' }}`
If the field value is not empty, then prepend the string to the value. Helpful if you don't want the prefix to show up in the template if the field is undefined or null. Use `&nbsp;` if you need before or after the prefix.

##### `{{ field | join 'separator' }}`
If the field is an array joins the elements into a string using the supplied separator.


#### Attribute setters

If an HTML element attribute in a template is immediately followed by a second attribute with the same name, prefixed with `data-`, then as long as the second one is not empty will the value of the original be replaced with the value of the latter.

In the following example, will the reference to `default_image.png` be replaced by an actual field value if one exists. Notice here that the `.png` suffix is only added if the field is not empty.

	<img src="default_image.png" data-src="{{actual_image_if_exists | append '.png'}}" ... />


#### Template tags

Tempo also supports tag blocks:

	{% if javascript-expression %} ... {% else %} ... {% endif %}

The body of the tag will only be rendered if the JavaScript expression evaluates to true. The `{% else %}` is optional.

#### Variable injection for inline scripts

If you're using scripts inline in your template, you can access JSON object members. You reference these via the `__` variable.

	<a href="#" onclick="alert(__.nickname); return false;">{{name.last}}</a>
	
Similarly you can reference array elements (shorthand for for `__.this[0]`):

	<a href="#" onclick="alert(__[0]); return false;">{{[0]}}</a>
	
You can refer to the object being iterated with `__.this`. You can use normal dot notation to access members of that object:

	<a href="#" onclick="alert(__.this); return false;">{{.}}</a>
	
At render time the accessor variable will be replaced by the object it references. If the object is a string then its value will be wrapped in single quotes, otherwise type is preserved.


### Pre-processing and Event Handling

#### template.when(type, handler)

After preparing a template you can register one or more event listeners by providing a callback function to be notified of events in the lifecycle.

> ##### `type`
> The type of the event. Constant values are defined in TempoEvent.Types.

> * TempoEvent.Types.RENDER_STARTING: Indicates that rendering has started, or been manually triggered by calling starting() on the renderer object.
> * TempoEvent.Types.ITEM_RENDER_STARTING: Indicates that the rendering of a given individual item is starting.
> * TempoEvent.Types.ITEM_RENDER_COMPLETE: Indicates that the rendering of a given individual item has completed.
> * TempoEvent.Types.RENDER_COMPLETE: Indicates that the rendering of all items is completed.
> * TempoEvent.Types.BEFORE_CLEAR: Fires before the container is cleared of all elements.
> * TempoEvent.Types.AFTER_CLEAR: Fires after the container is cleared of all elements.

> ##### `handler`
> The handler function to call when the specified event fires.

The event listener will be called with a single argument, a `TempoEvent` which has the following properties:

> ##### `type`
> The type of the event. Constant values are defined in `TempoEvent.Types`.

> ##### `item`
> The item being rendered. This is only available for the `ITEM_RENDER_STARTING` and `ITEM_RENDER_COMPLETE` events.

> ##### `element`
> The HTML element or template being used for rendering. This is only available for the `ITEM_RENDER_STARTING` and `ITEM_RENDER_COMPLETE` events.

	Tempo.prepare('tweets').when(TempoEvent.Types.RENDER_STARTING, function (event) {
	        $('#tweets').addClass('loading');
	    }).when(TempoEvent.Types.RENDER_COMPLETE, function (event) {
	        $('#tweets').removeClass('loading');
	    }).render(data);
	    
Even though it's possible to modify the DOM via event handlers it's worth keeping in mind that Tempo is built on the premise of keeping the templates as semantic and readable as possible. We would therefore advise that you limit the use or pre-processing to data cleansing and restructuring as opposed to template modifications.

#### template.starting()

In some cases you prepare the templates ahead of calling render. In those cases if you would like to e.g. set loader graphics, call the renderer's `starting()` method just prior to issuing e.g. a jQuery request. This will fire the `ITEM_RENDER_STARTING` event.

The following example demonstrates use of both methods above. In this case we prepare the templates, and register our event handler function. The event handler is then notified that the jQuery request is about to be issued (when we manually fire`RENDER_STARTING` with a call to `starting()`) adding a CSS class to the container. We are then notified that rendering is complete so we can remove the CSS class.

	var template = Tempo.prepare('tweets').when(TempoEvent.Types.RENDER_STARTING, function (event) {
	            $('#tweets').addClass('loading');
	        }).when(TempoEvent.Types.RENDER_COMPLETE, function (event) {
	            $('#tweets').removeClass('loading');
	        });
	template.starting();
	$.getJSON(url, function(data) {
	    template.render(data.results);
	});


### Using Tempo with jQuery

jQuery's [`getJSON()`](http://api.jquery.com/jQuery.getJSON/) method provides an easy means of loading JSON-encoded data from the server using a `GET HTTP` request.

	var template = Tempo.prepare('tweets');
	$.getJSON("http://search.twitter.com/search.json?q='marx brothers'&callback=?", function(data) {
	    template.render(data.results);
	});
	
#### Binding event handlers
Note that if you've bound event listeners to elements in your template, these will not be cloned when the template is used. In order to do this you have two options. 
You can either leave binding until the data has been rendered, e.g. by registering a `TempoEvent.Types.RENDER_COMPLETE` listener and doing the binding when that fires, or you can use jQuery [`live()`](http://api.jquery.com/live/) which attaches a handler to elements even though they haven't been created.

The following example shows how to make a template clickable (assuming an `'ol li'` selector provides a reference to a template element) and how to obtain a reference to the clicked element:

	$('ol li').live('click', function() {
	    // Do something with the clicked element
	    alert(this);
	});


### Advanced Topics

#### Configuring the surrounding brace syntax

In order to make it easier to use Tempo with other frameworks such as Django, you can configure Tempo to use surrounding braces other than the default `{{ ... }}` and `% ... %}`.

To do this you pass the var_braces and tag_braces parameters to the `Tempo.prepare` function. These will be split down the middle to form the left and right braces.

	Tempo.prepare('marx-brothers', {'var_braces' : '\\[\\[\\]\\]', 'tag_braces' : '\\[\\?\\?\\]'});
	
You can now use this template syntax instead:

	<ol id="marx-brothers">
	    <li data-template>[[nickname]] is [? if nickname == 'Groucho' ?]grouchy[? else ?]happy[? endif ?]!</li>
	</ol>
	
#### Tempo Renderer Information - the `_tempo` variable

You can access information about the rendering process via the `_tempo` variable.

> ##### `_tempo.index`
> The `index` member tells you how many iterations of a given template have been carried out. This is a zero (0) based index. Nested templates have a separate counter.

The following example adds the iteration count to the class attribute, prefixed with 'item-':

	<ol id="marx-brothers" class="item-{{_tempo.index}}">
	    <li data-template>{{nickname}} {{name.last}}</li>
	</ol>
	
This example shows how to access the iteration counter using inline JavaScript injection:

	a href="#" onclick="alert(__._tempo.index); return false;">{{name.last}}</a>





