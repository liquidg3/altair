define(['altair/declare',
        'altair/facades/hitch',
        'altair/facades/__',
        'altair/plugins/node!underscore',
        'dojo/when',
        'altair/facades/partial',
        'altair/modules/commandcentral/adapters/_Base',
        'dojo/node!prompt',
        'dojo/node!chalk'
], function (declare,
             hitch,
             __,
             _,
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
            return this;
        },

        /**
         * Write a simple line to the screen
         *
         * @param str
         * @param options
         */
        writeLine: function (str, options) {
            console.log(chalk.bgRed(str));
            return this;
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
                    def.resolve(results.answer);
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
                required        = _.has(_options, 'required') ? _options.required : true,
                aliases         = _.has(_options, 'aliases') ? _options.aliases : {},
                multiOptions    = _options.multiOptions,
                keys            = Object.keys(multiOptions),
                aliasesReversed = {},
                go;

            this.writeLine()
                .writeLine('--- ' + question + ' ---')
                .writeLine('|');

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

            this.writeLine('|')
                .writeLine('---------------');


            go = hitch(this, function () {

                this.readLine(__('select option'), defaultValue, options).then(hitch(this, function (results) {

                    //was this an alias?
                    if(aliasesReversed.hasOwnProperty(results)) {
                        results = aliasesReversed[results];
                    }

                    //did they select a valid option?
                    if(!results || !(multiOptions.hasOwnProperty(results))) {

                        //are we going to force them to select an option?
                        if(!required) {

                            def.reject(results, false);

                        } else {

                            //help them out a bit
                            this.writeLine('Invalid Selection', 'alert');
                            this.writeLine('Valid options are: ' + keys.join(', '));

                            go();

                        }

                    } else {

                        def.resolve(results);

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
                    if(!this[type]) {
                        type = 'readLine';
                    }

                    index = index + 1;

                    when(this[type](options.label, options.default, options)).then(function (answer) {
                        values[name] = answer;
                        next(index);
                    }).otherwise(hitch(d, 'reject'));

                }

            });


           next(0);

            return d;

        },

        showProgress: function (message) {
            console.log(chalk.grey(message));
        }

    });

});
