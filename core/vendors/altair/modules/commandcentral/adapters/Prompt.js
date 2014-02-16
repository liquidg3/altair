define(['dojo/_base/declare',
        'altair/facades/hitch',
        'altair/modules/commandcentral/adapters/_Base',
        'dojo/node!prompt',
        'dojo/node!chalk',
        'dojo/Deferred'
], function (declare,
             hitch,
             _Base,
             prompt,
             chalk,
             Deferred) {


    prompt.colors       = false;
//    prompt.message      = 'altair';
    prompt.delimiter    = ': ';


    return declare('altair/modules/commandcentral/adapters/Prompt', [_Base], {

        startup: function () {

            prompt.start();

            return this.inherited(arguments);

        },

        splash: function () {
            console.log(chalk.bgRed('REALLY COOL ALTAIR SPLASH SCREEN'));
        },

        notice: function(str) {
            console.log(chalk.red('* Notice:', str, '*'));
        },

        writeLine: function (str, options) {

            var styles = this.styles(options);

            console.log(chalk.bgRed(str));
        },

        select: function (question, selectOptions, options) {

            var def     = new Deferred(),
                keys    = Object.keys(selectOptions),
                styles  = this.styles(options),
                retry   = (typeof options === 'object' && 'retry' in options) ? options.retry : true;

            this.writeLine();
            this.writeLine('--- ' + question + ' ---');
            this.writeLine('|');

            keys.forEach(hitch(this, function (key) {
                this.writeLine('| ' + key + prompt.delimiter + '"' + selectOptions[key] + '"');
            }));

            this.writeLine('|');
            this.writeLine('---------------');


            var go = hitch(this, function () {

                prompt.get([{
                    name: 'answer',
                    type: 'string',
                    description: 'select option'
                }], hitch(this, function (err, results) {

                    if(!results.answer || !(results.answer in selectOptions)) {

                        if(!retry) {
                            def.reject(results.answer);
                        } else {

                            this.writeLine('Invalid Selection', 'alert');
                            this.writeLine('Valid options are: ' + keys.join(', '));

                            go();


                        }

                    } else {

                        def.resolve(results.answer);

                    }

                }));
            });

            go();


            return def;
        },

        showProgress: function (message) {
            console.log(chalk.grey(message));
        }

    });

});
