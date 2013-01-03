var data = [
    {"type":'java', "name":'guice'},
    {"type":'javascript', "name":'jQuery'},
    {"type":'java', "name":'guice', "owner":'Google'},
    {"type":'php', "name":'django'}
];

$(document).ready(
    setTimeout(function () {
        Tempo.prepare($('ul'), {}, function (template) {
            var i = 0;

            template.when(TempoEvent.Types.RENDER_STARTING,function (event) {
                $(event.element).before('<h2>Before</h2>');

            }).when(TempoEvent.Types.ITEM_RENDER_STARTING,function (event) {
                    if (event.item.type == 'javascript') {
                        event.item.name += ' is fun!';
                    }
                    event.item.even = i++ % 2 ? 'even' : 'odd';

                }).when(TempoEvent.Types.RENDER_COMPLETE,function (event) {
                    $(event.element).after('<h2>After</h2>');

                }).render(data);
        });
    }, 2500)
);