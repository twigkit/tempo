module('Utils');
var utils = Tempo.test().utils;

test('memberRegex', function() {
	equals(utils.memberRegex({ 'foo' : 'bar', 'zoo' : 'doo' }), 'foo|zoo', 'Created RegEx testing for object members');
});

test('pad', function() {
	equals(utils.pad('3', '0', 3), '003', 'Padding string with zeros');
});

test('trim', function() {
	equals(utils.trim('  hello  '), 'hello', 'Trimmed whitespace');
	equals(utils.trim('hello'), 'hello', 'No whitespace to trim');
});

test('startsWith', function() {
	ok(utils.startsWith('hello', 'he'), 'Checking if string starts with correctly returns true');
	ok(!utils.startsWith('hello', 'lo'), 'Checking if string starts with correctly returns false');
});