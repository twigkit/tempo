describe("Tempo 3.0", function () {

    describe("Utils", function () {

        var utils = Tempo._test.utils;

        it("should return first element that has a certain attribute", function () {
            var container = $('<div><h1>Hello World</h1><div><div data-template>Template 1</div><ul><li data-template>Template 2</li></ul></div></div>')[0];
            var children = utils.childrenByAttribute(container, 'data-template', false);

            expect($(children).length).toBe(1);
        });

        it("should return all elements that have a certain attribute", function () {
            var container = $('<div><h1>Hello World</h1><div data-template>Template 1</div><ul><li data-template>Template 2</li></ul></div>')[0];
            var children = utils.childrenByAttribute(container, 'data-template', true);

            expect($(children).length).toBe(2);
        });

        it("should only return all elements that have a certain attribute at a given level of object iteration - not recurse to a second level of nesting", function () {
            var container = $('<div> <div data-template-for="valid"> <div data-template-for="invalid"> <!-- Not valid since nested one more level down - will be processed for separate iteration --> </div> </div> <div> <div data-template-for="valid"> <!-- One level down but still valid since should be processed as part of same iteration --> </div> </div> </div>')[0];
            var children = utils.childrenByAttribute(container, 'data-template-for', true);

            expect(children.length).toBe(2);
            expect($(children[0]).attr('data-template-for')).toBe('valid');
            expect($(children[1]).attr('data-template-for')).toBe('valid');
        });

        it("should clear container of all child elements", function () {
            var container = $('<div><span>Hello</span> <span>world!</span></div>')[0];
            utils.clear(container);

            expect($(container).children().length).toBe(0);
        });

        it("should return object member using dot, bracket or mixed notation including array index references", function () {
            var data = {person: {name: {first: 'Chuck', last: 'Norris'}}, hero: [
                ['Chuck', 'Norris']
            ]};
            expect(utils.member(data, 'person.name.first')).toBe(data.person.name.first);
            expect(utils.member(data, 'person["name"].first')).toBe(data.person.name.first);
            expect(utils.member(data, 'person["name"]["first"]')).toBe(data.person.name.first);
            expect(utils.member(data, 'person[\'name\'][\'first\']')).toBe(data.person.name.first);
            expect(utils.member(data, 'hero[0][1]')).toBe(data.hero[0][1]);
        });

        it("should reliably set innerHTML for all elements whether innerHTML is read-only or not", function () {
            var table = $('<table></table>')[0];
            utils.html(table, '<tr><td>Hello!</td></tr>');
            expect($(table).find('td').html()).toBe('Hello!');
        });
    });

    describe("Template", function () {

        var template = new Tempo._test.Template();

        describe("Variable handling", function () {

            it("should replace reference to object itself", function () {
                expect(template._replaceVariables('<h4>{{.}}</h4>', 'Chuck Norris')).toBe('<h4>Chuck Norris</h4>');
            });

            it("should replace simple object member", function () {
                expect(template._replaceVariables('<h4>{{name}}</h4>', {name: 'Chuck Norris'})).toBe('<h4>Chuck Norris</h4>');
            });

            it("should replace dot notation reference to nested object member", function () {
                expect(template._replaceVariables('<h4>{{name.first}}</h4>', {name: {first: 'Chuck', last: 'Norris'}})).toBe('<h4>Chuck</h4>');
            });

            it("should replace mixed bracket and dot notation references to nested object members", function () {
                expect(template._replaceVariables('<h4>{{name["full"].first}}</h4>', {name: {full: {first: 'Chuck', last: 'Norris'}}})).toBe('<h4>Chuck</h4>');
            });
        });

        describe("Rendering", function () {

            it("should be able to append and prepend", function () {
                var html = $('<ul><li data-template>{{.}}</li></ul>');
                var template = Tempo.prepare(html[0]);

                template.prepend(['Adolph Marx']);
                template.prepend(['Leonard Marx']);
                template.append(['Julius Henry Marx', 'Milton Marx', 'Herbert Marx']);

                expect(html.children().length).toBe(5);
                expect(html.children().first().html()).toBe('Leonard Marx');
                expect(html.children().last().html()).toBe('Herbert Marx');
            });

            it("should render a simple array of data", function () {
                var html = $('<ul><li data-template>{{.}}</li></ul>');
                var template = Tempo.prepare(html[0]);
                var data = ['Leonard Marx', 'Adolph Marx', 'Julius Henry Marx', 'Milton Marx', 'Herbert Marx'];

                template.render(data);

                expect(html.children().length).toBe(data.length);
                expect(html.children().first().html()).toBe(data[0]);
                expect(html.children().last().html()).toBe(data[data.length - 1]);
            });

            it("should render simple array with nested elements", function () {
                var html = $('<ul><li data-template><h4>{{country}}</h4><ul><li data-template-for="cities.main">{{.}}</li></ul></li></ul>');
                var template = Tempo.prepare(html[0]);
                var data = [
                    {country: 'Germany', cities: {main: ['Berlin', 'Stuttgart', 'Hamburg']}},
                    {country: 'United Kingdom', cities: {main: ['London', 'Birmingham']}}
                ];

                template.render(data);

                expect(html.children().length).toBe(data.length);
                expect(html.children().first().children('h4').html()).toBe(data[0].country);
                expect(html.children().first().children('ul').children().first().html()).toBe(data[0].cities.main[0]);
                expect(html.children().last().children('ul').children().last().html()).toBe(data[1].cities.main[data[1].cities.main.length - 1]);
            });

            describe("Browser nuances", function () {

                var data = ['Leonard Marx', 'Adolph Marx', 'Julius Henry Marx', 'Milton Marx', 'Herbert Marx'];

                it("should support table rows as data templates", function () {
                    var html = $('<table><tr data-template><td>{{.}}</td></tr></table>');
                    var template = Tempo.prepare(html[0]);

                    template.render(data);

                    var rows = $(html).find('tr');
                    expect(rows.length).toBe(data.length);
                    expect(rows.first().children('td').html()).toBe(data[0]);
                    expect(rows.last().children('td').html()).toBe(data[data.length - 1]);
                });

                it("should support table rows as data templates in IE (no innerHTML support)", function () {
                    var html = $('<table><tr data-template><td>{{.}}</td></tr></table>');
                    var template = Tempo.prepare(html[0]);

                    Tempo._test.IE = true;
                    template.render(data);

                    var rows = $(html).find('tr');
                    expect(rows.length).toBe(data.length);
                    expect(rows.first().children('td').html()).toBe(data[0]);
                    expect(rows.last().children('td').html()).toBe(data[data.length - 1]);
                });
            });
        });
    });
});