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

        it("should clear container of all child elements", function () {
            var container = $('<div><span>Hello</span> <span>world!</span></div>')[0];
            utils.clear(container);

            expect($(container).children().length).toBe(0);
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
                var html = $('<ul><li data-template><h4>{{country}}</h4><ul><li data-template-for="cities">{{.}}</li></ul></li></ul>');
                var template = Tempo.prepare(html[0]);
                var data = [
                    {country: 'Germany', cities: ['Berlin', 'Stuttgart', 'Hamburg']},
                    {country: 'United Kingdom', cities: ['London', 'Birmingham']}
                ];

                template.render(data);

                expect(html.children().length).toBe(data.length);
                expect(html.children().first().children('h4').html()).toBe(data[0].country);
                expect(html.children().first().children('ul').children().first().html()).toBe(data[0].cities[0]);
                expect(html.children().last().children('ul').children().last().html()).toBe(data[1].cities[data[1].cities.length - 1]);
            });
        });
    });
});