module('Utils');
var utils = Tempo.test().utils;

test('memberRegex', function() {
	equals(utils.memberRegex({ 'foo' : 'bar', 'zoo' : 'doo' }), 'foo|zoo', 'Created RegEx testing for object members');
});

test('pad', function() {
	same(utils.pad('3', '0', 3), '003', 'Padding string with zeros');
	same(utils.pad(3, '0', 3), '003', 'Padding integer with zeros');
});

test('trim', function() {
	equals(utils.trim('  hello  '), 'hello', 'Trimmed whitespace');
	equals(utils.trim('hello'), 'hello', 'No whitespace to trim');
});

test('startsWith', function() {
	ok(utils.startsWith('hello', 'he'), 'Checking if string starts with correctly returns true');
	ok(!utils.startsWith('hello', 'lo'), 'Checking if string starts with correctly returns false');
});

module('Filters');
var filters = Tempo.test().renderer.filters;

test('upper', function() {
	equals(filters.upper('Hello'), 'HELLO', 'Uppercase filter');
});

test('lower', function() {
	equals(filters.lower('hELLO'), 'hello', 'Lowercase filter');
});

test('trim', function() {
	equals(filters.trim('  hello  '), 'hello', 'Trimmed whitespace');
	equals(filters.trim('hello'), 'hello', 'No whitespace to trim');
});

test('replace', function() {
	equals(filters.replace('foot simpson', ['foo', 'bar']), 'bart simpson', 'Replacing simple value');
	equals(filters.replace('foo 123 bar', ['([0-9]+)', '|$1|']), 'foo |123| bar', 'Replacing value with backreference');
});

test('append', function() {
	equals(filters.append('foo', [' bar']), 'foo bar', 'Appending value with space');
	equals(filters.append('foo', []), 'foo', 'Append with no arguments');
});

test('prepend', function() {
	equals(filters.prepend('bar', ['foo ']), 'foo bar', 'Prepending value with space');
	equals(filters.prepend('foo', []), 'foo', 'Prepend with no arguments');
});

test('default', function() {
	equals(filters['default'](undefined, ['foo']), 'foo', 'Default value for undefined');
	equals(filters['default'](null, ['foo']), 'foo', 'Default value for null');
	equals(filters['default']('bar', ['foo']), 'bar', 'Default value should not be used');
});