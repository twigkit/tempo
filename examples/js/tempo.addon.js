Tempo.extend.tags.push(
	{
	    'regex': '\\{%link ([\\s\\S]*?)%\\}',
	    'handler': function(renderer, item) {
	        return function(match, obj, content) {
	            return '<a href="#">' + obj + '</a>'
	        };
	    }
	}
)