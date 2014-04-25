define(['altair/facades/declare',
    'altair/facades/hitch',
    'altair/facades/__',
    'lodash',
    'altair/facades/when',
    'altair/facades/partial',
    './_Base',
    'altair/plugins/node!prompt',
    'altair/plugins/node!chalk',
    'altair/plugins/node!yargs'
], function (declare,
             hitch,
             __,
             _,
             when,
             partial,
             _Base,
             prompt,
             chalk,
             yargs) {


    prompt.override = yargs.argv;
    prompt.colors = false;
    prompt.message = 'altair';
    prompt.delimiter = ': ';


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
            var d = new this.Deferred();
            d.resolve();
            return d;
        },

        /**
         * Output a notice for users
         *
         * @param str
         */
        notice: function (str) {
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

            if (_.isString(options)) {

                switch (options) {
                    case 'error':
                        str = 'error: ' + chalk.white.bgRed(str);
                        break;
                }

            }

            console.log(str);
            return this;
        },

        /**
         * If altair was loaded with an argument
         *
         * @returns {null}
         */
        initialCommander: function () {

            var d = new this.module.Deferred();

            if (yargs.argv._[0]) {
                this.module.refreshCommanders().then(function (commanders) {
                    d.resolve(commanders[yargs.argv._[0]]);
                }).otherwise(hitch(d, 'reject'));
            } else {
                d.resolve(undefined);
            }


            return d;
        },

        //if we can autoload the current command, return it here
        initialCommand:   function () {
            return yargs.argv._[1];
        },

        /**
         * Read a line from the user, possible default value, and then other options.
         *
         * @param str
         * @param defaultValue
         * @param options
         */
        readLine: function (question, defaultValue, options) {

            var def = new this.Deferred(),
                name = (options && _.has(options, 'override')) ? options.override : 'answer';

            //it's been overridden
            if (!prompt.override[name]) {

                //output a description
                if (options && _.has(options, 'description')) {
                    this.writeLine(chalk.italic(options.description));
                }

                //help user by outputing pattern
                if (options && _.has(options, 'pattern') && options.pattern) {
                    question = question + " " + options.pattern;
                }

                //default value
                if(defaultValue) {
                    question = question + ' (' + chalk.italic(defaultValue) + ')';
                }

            }

            prompt.get([
                {
                    name:        name,
                    description: question
                }
            ], hitch(this, function (err, results) {

                if (err) {
                    def.reject(err);
                } else {
                    def.resolve(results[name] || defaultValue);
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

            var def = new this.Deferred(),
                _options = _.has(options, 'multiOptions') ? options : { multiOptions: options },
                required = _.has(_options, 'required') ? _options.required : true,
                aliases = _.has(_options, 'aliases') ? _options.aliases : {},
                multiOptions = _options.multiOptions,
                name = (options && _.has(options, 'override')) ? options.override : 'answer';

            if (!multiOptions) {
                def.reject(new Error('you must supply multiOptions to your select "' + question + '"', 234));
                return def;
            }

            var keys = Object.keys(multiOptions),
                aliasesReversed = {},
                go;

            if (!prompt.override[name]) {

                this.writeLine('')
                    .writeLine('--- ' + question + ' ---')
                    .writeLine('|');

                keys.forEach(hitch(this, function (key) {
                    var line = '| ' + key;

                    if (aliases.hasOwnProperty(key)) {
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

            }


            go = hitch(this, function () {

                this.readLine(__('select option'), defaultValue, options).then(hitch(this, function (results) {

                        //was this an alias?
                        if (aliasesReversed.hasOwnProperty(results)) {
                            results = aliasesReversed[results];
                        }

                        //did they select a valid option?
                        if (!results || !(multiOptions.hasOwnProperty(results))) {

                            //are we going to force them to select an option?
                            if (!required) {

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
                        //if the whole thing crashes, try again (bad idea?)
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

            var d = new this.Deferred(),
                values = {},
                elements = schema.properties(),
                keys = Object.keys(elements),
                total = keys.length,
                next = hitch(this, function (index) {

                    if (index === total) {
                        d.resolve(values);
                    } else {

                        var name = keys[index],
                            type = schema.typeFor(name),
                            options = schema.optionsFor(name);

                        //to allow for arguments to be passed through
                        options.override = name;

                        //see if we have a function by the name of type
                        if (!this[type]) {
                            type = 'readLine';
                        }

                        index = index + 1;

                        when(this[type](options.label, options.default, options)).then(function (answer) {
                            values[name] = schema.applyOnProperty(['toJsValue'], name, answer, options);
                            next(index);
                        }).otherwise(hitch(d, 'reject'));

                    }

                });


            next(0);

            return d;

        },

        /**
         * Gives the user a handy autocomplete path selection tool
         * @param question
         * @param defaultValue
         * @param options
         * @returns {Deferred}
         */
        path: function (question, defaultValue, options) {
            //coming soon???
            return this.readLine(question, defaultValue, options);
        },

        showProgress: function (message) {
            console.log(chalk.grey(message));
        }

    });

});
