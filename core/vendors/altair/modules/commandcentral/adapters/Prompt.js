define(['dojo/_base/declare',
        'altair/facades/hitch',
        'altair/modules/commandcentral/adapters/_Base',
        'dojo/node!prompt',
        'dojo/node!colors',
        'dojo/Deferred'
], function (declare,
             hitch,
             _Base,
             prompt,
             colors,
             Deferred) {

    /**
     * We user colors to manage our theme.
     */
    colors.setTheme({
        notice:     'yellow',
        progress:   'bold',
        plain:      'grey'
    });


    return declare('altair/modules/commandcentral/adapters/Prompt', [_Base], {

        startup: function () {

            prompt.start();

            return this.inherited(arguments);

        },

        splash: function () {
            console.log('REALLY COOL ALTAIR SPLASH SCREEN'.rainbow);
        },

        notice: function(str) {
            console.log('* Notice:', str.inverse, '*');
        },

        writeLine: function (str, options) {
            console.log(str.notice);
        },

        select: function (question, selectOptions, options) {

            var def = new Deferred();

            prompt.get([{
                name: 'answer',
                description: question

            }], function (err, results) {

                def.resolve();

            });


            return def;
        },

        showProgress: function (message) {
            console.log(message.progress);
        }

    });

});
