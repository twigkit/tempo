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

test('equalsIgnoreCase', function() {
	ok(utils.equalsIgnoreCase('HeLlO', 'hElLo'), 'Equals ignore case with different case strings');
});

module('Tags');
var tags = Tempo.test().renderer.tags;

test('if/endif', function() {
	var item = {'foo':'bar', 'zoo':'doo'};
	
	var str = "This is{{if foo === 'bar'}} right{{endif}}";
	str = str.replace(new RegExp(tags[0].regex, 'gi'), tags[0].handler(undefined, item));
	equals(str, 'This is right', 'If conditional matches');
	
	str = "This is{{if foo !== 'bar'}} right{{endif}}";
	str = str.replace(new RegExp(tags[0].regex, 'gi'), tags[0].handler(undefined, item));
	equals(str, 'This is', 'If conditional does not match');
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
	equals(filters.replace(undefined, ['([0-9]+)', '|$1|']), undefined, 'Trying to replace in undefined value');
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
	same(filters['default'](undefined, []), undefined, 'No default value, returns original even if empty');
});

test('date', function() {
	var date = new Date(1283359805000);
	equals(filters.date(undefined, []), '', 'Undefined date');
	equals(filters.date(date, ['localedate']), '1 September 2010', 'Date to localedate');
	equals(filters.date(date, ['localetime']), '17:50:05 GMT+01:00', 'Date to localetime');
	equals(filters.date(date, ['date']), 'Wed Sep 01 2010', 'Date to date');
	equals(filters.date(date, ['time']), '17:50:05 GMT+0100 (BST)', 'Date to localetime');
	equals(filters.date(date, ['YYYY YY MMMM MMM MM M EEEE EEE E DD D HH H mm m ss s SSS S a']), '2010 10 September Sep 09 9 Wednesday Wed 3 01 1 17 17 50 50 05 5 000 0 PM', 'Date to formatted with pattern');
	equals(filters.date(date, ['EEE \\at HH:mm']), 'Wed at 17:50', 'Date to string with escaping');
});

module('Templates');
test('prepare', function() {
	var template = Tempo.prepare('container');
	ok(template !== undefined, 'Template was created from element ID');
});