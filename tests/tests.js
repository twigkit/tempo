/*!
 *  Utils tests
 */
module('Utils');
var utils = Tempo.test.utils;

test('memberRegex', function () {
	equal(utils.memberRegex({ 'foo' : 'bar', 'zoo' : 'doo' }), '(foo|zoo)[\\.]?(?!\\w)', 'Created RegEx testing for object members');
});

test('pad', function () {
	deepEqual(utils.pad('3', '0', 3), '003', 'Padding string with zeros');
});

test('trim', function () {
	equal(utils.trim('  hello  '), 'hello', 'Trimmed whitespace');
	equal(utils.trim('hello'), 'hello', 'No whitespace to trim');
});

test('startsWith', function () {
	ok(utils.startsWith('hello', 'he'), 'Checking if string starts with correctly returns true');
	ok(!utils.startsWith('hello', 'lo'), 'Checking if string starts with correctly returns false');
});

test('equalsIgnoreCase', function () {
	ok(utils.equalsIgnoreCase('HeLlO', 'hElLo'), 'Equals ignore case with different case strings');
});

test('clearContainer', function () {
	var el = document.getElementById('container');
	ok($(el).children('li').length === 3, 'Container has three elements (2 templates, one regular)');
	utils.clearContainer(el);
	ok($(el).children('li').length === 2, 'All child elements removed');
});


/*!
 * Tags tests
 */
module('Tags');


/*!
 * Filters tests
 */
module('Filters');
var filters = Tempo.test.renderer.filters;

test('truncate', function () {
	equal(filters['truncate'](undefined, []), undefined, 'No value');
    equal(filters['truncate']('Hello world!', [8]), 'Hello...', 'Truncating');
    equal(filters['truncate']('Hello world!', [20]), 'Hello world!', 'No truncation');
});

test('format', function () {
	equal(filters['format'](undefined, []), undefined, 'No value');
    equal(filters['format'](100, []), '100', 'No formatting required');
    equal(filters['format'](1000, []), '1,000', 'No formatting required');
    equal(filters['format'](1000000.10, []), '1,000,000.1', 'No formatting required');
});

test('upper', function () {
	equal(filters.upper('Hello'), 'HELLO', 'Uppercase filter');
});

test('lower', function () {
	equal(filters.lower('hELLO'), 'hello', 'Lowercase filter');
});

test('titlecase', function () {
    equal(filters.titlecase('snow white and the seven dwarfs', ['and the']), 'Snow White and the Seven Dwarfs', 'Capitalize filter with blacklist values');
    equal(filters.titlecase('the last of the mohicans', ['the of']), 'The Last of the Mohicans', 'Capitalize filter with first word in blacklist');
    equal(filters.titlecase('FIRE bug'), 'FIRE Bug', 'Ignoring capitalized words');
});


test('trim', function () {
	equal(filters.trim('  hello  '), 'hello', 'Trimmed whitespace');
	equal(filters.trim('hello'), 'hello', 'No whitespace to trim');
});

test('replace', function () {
	equal(filters.replace('foot simpson', ['foo', 'bar']), 'bart simpson', 'Replacing simple value');
	equal(filters.replace('foo 123 bar', ['([0-9]+)', '|$1|']), 'foo |123| bar', 'Replacing value with backreference');
	equal(filters.replace(undefined, ['([0-9]+)', '|$1|']), undefined, 'Trying to replace in undefined value');
});

test('append', function() {
	equal(filters.append('foo', [' bar']), 'foo bar', 'Appending value with space');
	equal(filters.append('foo', []), 'foo', 'Append with no arguments');
});

test('prepend', function () {
	equal(filters.prepend('bar', ['foo ']), 'foo bar', 'Prepending value with space');
	equal(filters.prepend('foo', []), 'foo', 'Prepend with no arguments');
});

test('default', function () {
	equal(filters['default'](undefined, ['foo']), 'foo', 'Default value for undefined');
	equal(filters['default'](null, ['foo']), 'foo', 'Default value for null');
	equal(filters['default']('bar', ['foo']), 'bar', 'Default value should not be used');
	deepEqual(filters['default'](undefined, []), undefined, 'No default value, returns original even if empty');
});

test('date', function () {
	var date = new Date(1283359805000);
	equal(filters.date(undefined, []), '', 'Undefined date');
	equal(filters.date(date, ['localedate']), '1 September 2010', 'Date to localedate');
	equal(filters.date(date, ['localetime']), '17:50:05 BST', 'Date to localetime');
	equal(filters.date(date, ['date']), 'Wed Sep 01 2010', 'Date to date');
	equal(filters.date(date, ['time']), '17:50:05 GMT+0100 (BST)', 'Date to localetime');
	equal(filters.date(date, ['YYYY YY MMMM MMM MM M EEEE EEE E DD D HH H mm m ss s SSS S a']), '2010 10 September Sep 09 9 Wednesday Wed 3 01 1 17 17 50 50 05 5 000 0 PM', 'Date to formatted with pattern');
	equal(filters.date(date, ['EEE \\at HH:mm']), 'Wed at 17:50', 'Date to string with escaping');
});

test('filters member regex', function () {
    equal(utils.memberRegex(filters), '(truncate|format|upper|lower|titlecase|trim|replace|append|prepend|join|default|date)[\\.]?(?!\\w)', 'Regex of all filter names');
});

/*!
 * Templates tests
 */
module('Templates');
test('prepare', function() {
	var template = Tempo.prepare('container');
	ok(template !== undefined, 'Template was created from element ID');
});

/*!
 * Renderer tests
 */
module('Renderer');
var renderer = Tempo.test.renderer;
var item = {'$foo': 'bar'};
var array = ['foo', 'bar'];

var str = 'Sample {{ $foo }} string.';
var str2 = 'Sample {{.}} string.';

test('_replaceVariables', function () {
    equal(renderer._replaceVariables(renderer, {}, item, str), 'Sample bar string.');
    equal(renderer._replaceVariables(renderer, {}, item, str2), 'Sample [object Object] string.');
    equal(renderer._replaceVariables(renderer, {}, array, str2), 'Sample foo,bar string.');
});

test('_replaceObjects', function () {
    var regex = new RegExp('(?:__[\\.]?)((_tempo|\\[|' + utils.memberRegex(['foo', 'bar']) + '|this)([A-Za-z0-9$\\._\\[\\]]+)?)', 'g')
    equal(renderer._replaceObjects(renderer, {}, ['foo', 'bar'], '<a href="#" onclick="alert(__.this[0]); return false;">{{[0]}}</a>', regex), '<a href="#" onclick="alert(\'foo\'); return false;">{{[0]}}</a>');
});