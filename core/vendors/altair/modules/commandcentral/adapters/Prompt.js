define(['altair/facades/declare',
    'altair/facades/hitch',
    'altair/facades/__',
    'lodash',
    'altair/facades/when',
    './_Base',
    'altair/plugins/node!prompt',
    'altair/plugins/node!chalk',
    'altair/plugins/node!yargs',
    'altair/plugins/node!cli-table'
], function (declare,
             hitch,
             __,
             _,
             when,
             _Base,
             prompt,
             chalk,
             yargs,
             Table) {


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
         * Write a simple line to the screen.
         *
         * @param str
         * @param options
         */
        writeLine: function (str, options) {

            if (_.isString(options)) {

                switch (options.toLowerCase()) {
                    case 'error':
                        str = 'error: ' + chalk.white.bgRed(str);
                        break;
                    case 'warning':
                        str = chalk.bold.yellow(str);
                        break;
                    case 'success':
                        str = chalk.bold.green(str);
                        break;
                    case 'progress':
                        str = chalk.italic(str);
                        break;
                    case 'h1':
                        str = chalk.bold(str);
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

            var d = new this.Deferred();

            if (yargs.argv._[0]) {
                this.parent.refreshCommanders().then(function (commanders) {
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

                if(err && err.message === 'canceled') {
                    def.reject(err, false);
                } else if (err) {
                    def.reject(err);
                } else {
                    def.resolve(results[name] || defaultValue);
                    delete prompt.override[name]; // is this a good idea?
                }

            }));

            return def;

        },

        boolean: function (question, defaultValue, options) {

            return this.readLine(question + ' [y/n]', defaultValue, options).then(function (response) {
                return response === 'y';
            });

        },

        /**
         * Show a select
         *
         * @param question the text that will output before showing all the options
         * @param defaultValue
         * @param options if a choices key exists
         * @returns {altair.Promise}
         */
        select: function (question, defaultValue, options) {

            var dfd = new this.Deferred(),
                _options = _.has(options, 'choices') ? options : { choices: options },
                required = _.has(_options, 'required') ? _options.required : true,
                aliases = _.has(_options, 'aliases') ? _options.aliases : {},
                choices = _options.choices,
                name = (options && _.has(options, 'override')) ? options.override : 'answer';

            if (!choices) {
                dfd.reject(new Error('you must supply choices to your select "' + question + '"', 234));
                return dfd;
            }

            var keys = Object.keys(choices),
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

                    line += prompt.delimiter + '"' + choices[key] + '"';

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
                    if (!results || !(choices.hasOwnProperty(results))) {

                        //are we going to force them to select an option?
                        if (!required) {

                            delete prompt.override[name]; // is this a good idea?
                            dfd.resolve(null, false);

                        } else {

                            //help them out a bit
                            this.writeLine('Invalid Selection', 'alert');
                            this.writeLine('Valid options are: ' + keys.join(', '));

                            go();

                        }

                    } else {

                        delete prompt.override[name]; // is this a good idea?
                        dfd.resolve(results);

                    }

                })).otherwise(function (err) {

                    if(err.message === 'canceled') {
                        dfd.reject(err, false);
                    } else {
                        dfd.reject(err);
                    }

                }.bind(this));
            });

            go();


            return dfd;
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
        },

        /**
         * Shutdown prompt
         * @returns {altair.Promise}
         */
        teardown: function () {

            //shut it all down for now i guess
            this.nexus('Altair').teardown();

            return this.inherited(arguments);

        },

        /**
         * Render a table.
         *
         * @param options {
         *  headers: ['array', 'of', 'table', 'headers'],
         *  rows: [['first col', 'second col'], []],
         *  colWidths: [233,233]
         *
         * }
         */
        table: function (options) {

            var _options    = options || {},
                headers     = options.headers,
                rows        = options.rows,
                table,
                tableOptions= _.clone(_options);


            //use headers is if you can because then it can be compatible with table() in other adapters
            tableOptions.head = headers || tableOptions.head || {};

            //we pass rows manually
            delete tableOptions.rows;
            delete tableOptions.headers;

            table = new Table(tableOptions);


            _.each(rows, function (row) {

                table.push(row);

            }, this);

            this.writeLine(table.toString());

        }

    });

});
