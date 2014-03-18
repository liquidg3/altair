define(['altair/declare',
        'altair/facades/hitch',
        'altair/facades/__',
        'dojo/when',
        'altair/facades/partial',
        'altair/modules/commandcentral/adapters/_Base',
        'dojo/node!prompt',
        'dojo/node!chalk'
], function (declare,
             hitch,
             __,
             when,
             partial,
             _Base,
             prompt,
             chalk) {


    prompt.colors       = false;
    prompt.message      = 'altair';
    prompt.delimiter    = ': ';


    return declare([_Base], {

        /**
         * Startup prompt
         *
         * @returns {*}
         */
        startup: function () {

            prompt.start();
            return this.inherited(arguments);

        },

        /**
         * Self resolving splash
         *
         * @returns {Deferred}
         */
        splash: function () {
            console.log(chalk.bgRed('REALLY COOL ALTAIR SPLASH SCREEN'));
            var d = new this.module.Deferred();
            d.resolve();
            return d;
        },

        /**
         * Output a notice for users
         *
         * @param str
         */
        notice: function(str) {
            this.writeLine(chalk.red('* Notice:', str, '*'));
        },

        /**
         * Write a simple line to the screen
         *
         * @param str
         * @param options
         */
        writeLine: function (str, options) {
            this.writeLine(chalk.bgRed(str));
        },

        /**
         * Read a line from the user, possible default value, and then other options.
         *
         * @param str
         * @param defaultValue
         * @param options
         */
        readLine: function (question, defaultValue, options) {

            var def         = new this.module.Deferred();

            prompt.get([{
                name: 'answer',
                type: 'string',
                description: question
            }], hitch(this, function (err, results) {

                if(err) {
                    def.reject(err);
                } else {
                    def.resolve(results);
                }

            }));





            return def;
        },

        /**
         * Show a select
         *
         * @param question the text that will output before showing all the options
         * @param defaultValue
         * @param options if a multiOptions key exists
         * @returns {altair.Deferred}
         */
        select: function (question, defaultValue, options) {

            var def             = new this.module.Deferred(),
                _options        = options.hasOwnProperty('multiOptions') ? options : { multiOptions: options },
                required        = _options.hasOwnProperty('required') ? _options.required : true,
                aliases         = _options.hasOwnProperty('aliases') ? _options.aliases : {},
                multiOptions    = _options.multiOptions,
                keys            = Object.keys(multiOptions),
                aliasesReversed = {},
                go;

            this.writeLine();
            this.writeLine('--- ' + question + ' ---');
            this.writeLine('|');

            keys.forEach(hitch(this, function (key) {
                var line = '| ' + key;

                if(aliases.hasOwnProperty(key)) {
                    aliases[key].forEach(function (a) {
                        aliasesReversed[a] = key;
                    });

                    line += ' (' + aliases[key].join(', ') + ')';
                }

                line += prompt.delimiter + '"' + multiOptions[key] + '"';

                this.writeLine(line);
            }));

            this.writeLine('|');
            this.writeLine('---------------');


            go = hitch(this, function () {

                this.readLine(__('select option'), defaultValue, options).then(hitch(this, function (results) {

                    //was this an alias?
                    if(aliasesReversed.hasOwnProperty(results.answer)) {
                        results.answer = aliasesReversed[results.answer];
                    }

                    //did they select a valid option?
                    if(!results.answer || !(multiOptions.hasOwnProperty(results.answer))) {

                        //are we going to force them to select an option?
                        if(!required) {

                            def.reject(results.answer, false);

                        } else {

                            //help them out a bit
                            this.writeLine('Invalid Selection', 'alert');
                            this.writeLine('Valid options are: ' + keys.join(', '));

                            go();

                        }

                    } else {

                        def.resolve(results.answer);

                    }

                })).otherwise(hitch(this, function () {
                        "use strict";
                        go();
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

            var d       = new this.module.Deferred(),
                values  = {},
                elements= schema.elements(),
                keys    = Object.keys(elements),
                total   = keys.length;

            var next = hitch(this, function (index) {

                if(index === total) {
                    d.resolve(values);
                } else {

                    var name    = keys[index],
                        type    = schema.typeFor(name),
                        options = schema.optionsFor(name);


                    //see if we have a function by the name of type
                    if(!this.hasOwnProperty(type)) {
                        type = 'readLine';
                    }

                    index = index + 1;

                    when(this[type](options.label, options.default, options)).then(function (answer) {
                        values[name] = answer;
                        next(index);
                    }).otherwise(hitch(d, 'reject'));

                }

            });


            setTimeout(partial(next, 0), 0);

            return d;

        },

        showProgress: function (message) {
            console.log(chalk.grey(message));
        }

    });

});
