define(['dojo/_base/declare',
        'altair/facades/hitch',
        'altair/modules/commandcentral/adapters/_Base',
        'dojo/node!prompt',
        'dojo/node!chalk',
        'altair/Deferred'
], function (declare,
             hitch,
             _Base,
             prompt,
             chalk,
             Deferred) {


    prompt.colors       = false;
//    prompt.message      = 'altair';
    prompt.delimiter    = ': ';

    process.stdin.on('readable', function(chunk) {
        process.stdout.write('data: ' + chunk);
    });


    return declare('altair/modules/commandcentral/adapters/Prompt', [_Base], {

        startup: function () {

            prompt.start();

            return this.inherited(arguments);

        },

        splash: function () {
            console.log(chalk.bgRed('REALLY COOL ALTAIR SPLASH SCREEN'));
            var d = new Deferred();

            d.resolve();

            return d;
        },

        notice: function(str) {
            console.log(chalk.red('* Notice:', str, '*'));
        },

        writeLine: function (str, options) {

            var styles = this.styles(options);

            console.log(chalk.bgRed(str));
        },

        /**
         * Show a select
         *
         * @param question
         * @param selectOptions
         * @param options
         * @returns {altair.Deferred}
         */
        select: function (question, selectOptions, options) {

            options = this._normalizeOptions(options);

            var def     = new Deferred(),
                keys    = Object.keys(selectOptions),
                retry   = (options.hasOwnProperty('retry') ) ? options.retry : true,
                go;

            this.writeLine();
            this.writeLine('--- ' + question + ' ---');
            this.writeLine('|');

            keys.forEach(hitch(this, function (key) {
                this.writeLine('| ' + key + prompt.delimiter + '"' + selectOptions[key] + '"');
            }));

            this.writeLine('|');
            this.writeLine('---------------');


            go = hitch(this, function () {

                prompt.get([{
                    name: 'answer',
                    type: 'string',
                    description: 'select option'
                }], hitch(this, function (err, results) {

                    if(!results.answer || !(selectOptions.hasOwnProperty(results.answer))) {

                        if(!retry) {

                            def.reject(results.answer, false);

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

        /**
         * Output a bunch of fields at once
         *
         * @param schema
         */
        form: function (schema) {

            var form = [],
                d    = new Deferred();

            //map apollo schema to prompt schema, very dumb for now
            Object.keys(schema.elements()).forEach(hitch(this, function (field) {

                var options = schema.optionsFor(field);

                field   = {
                    name:       field,
                    type:       'string',
                    required:   !!options.required
                };

                if(options.value) {
                    field['default'] = options.value;

                }

                form.push(field);

            }));

            prompt.get(form, function (err, values) {
                d.resolve(values);
            });

            return d;

        },

        showProgress: function (message) {
            console.log(chalk.grey(message));

        }

    });

});
