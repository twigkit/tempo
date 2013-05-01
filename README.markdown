# Tempo 3.0 Prototype

Tempo as a concept of using valid, semantic HTML *in situ* to create templates started out at a code level as a simplistic engine, but rapidly outgrew itself as different capabilities were added and explored. Most important and complex of which were the nested templates. In 1.x and 2.x these were a rather inefficient bolt-on in a code base that was a bit too complex to effectively refactor.

In an effort to solve this Tempo 3.0 is a clean-slate effort to provide the same core features in a much more efficient way.


## Current status
There is a working prototype which supports infinitely nested templates with basic variables. While the code is still small and easy to read peer-reviews and suggestions are most welcome. Please fork and send pull requests for any improvements you might find.

## Aims for Tempo 3.0

1. ### Performance
Tempo 3.0 is currently approximately *60x faster* than 2.0. It recursively processes and caches templates in a single pass on prepare and efficiently renders data. The aim is to be *as fast as possible* whilst staying true to the methodology of semantically oriented templates that minimise the use of lower-level type code expressions.

1. ### Size
The current working prototype is only *1.6kb*. The core should remain lean with additional features such as filter, tags, and partials available as optional plugins.

1. ### Test coverage
Since this is a clean start but with a clear direction before progressing on features each function and subcomponent should have full test coverage.

1. ### Code readability & documentation
Source should have detailed step-by-step inline documentation for maintainability by the community.


## Usage

1. ### Add the script:

		<script type="text/javascript" src="tempo.js"></script>
	
1. ### Design your template:

		<ul id="container">
			<li data-template>
				{{movie}}
				<ol>
					<li data-template-for="cast">
						{{name.first}}
					</li>
				</ol>
			</li>
		</ul>


1. ### Prepare the template and render data:

		var template = Tempo.prepare('container').render(data);
	
## Documentation

### Variables
You can refer to variables in the template using either dot, bracket or mixed notation: `{{ name.first }}`, `{{ name['first'] }}` or `{{ name.full['first'] }}`.