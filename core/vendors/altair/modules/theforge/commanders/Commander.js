define(['altair/facades/declare',
        'altair/modules/commandcentral/mixins/_IsCommanderMixin',
        'require',
        'lodash',
        'altair/plugins/node!fs',
        'altair/plugins/node!underscore.string',
        'altair/plugins/node!mkdirp',
        'altair/plugins/node!path',
        'altair/facades/sprintf',
        'altair/facades/all'

], function (declare,
             _IsCommanderMixin,
             require,
             _,
             fs,
             str,
             mkdirp,
             path,
             sprintf,
             all) {

    return declare([_IsCommanderMixin], {


        /**
         * Forge a new module (should move logic out of here)
         *
         * @param values
         */
        module: function (values) {

            this.writeLine('forging new module...');

            var dfd     = new this.Deferred(),
                vendor  = values.vendor,
                name    = str.capitalize(values.name),
                full    = vendor + ':' + name,
                foundry = this.nexus('cartridges/Module').foundry,
                match   = this.nexus(full),
                to,
                from    = this.parent.resolvePath('templates/module'),
                context = {
                    name: name,
                    vendor: vendor,
                    full: full
                };

            if(match) {
                throw new Error('A module named ' + full + ' is already taken!');
            }

            to = path.join(require.toUrl(values.destination), foundry.moduleNameToPath(full));

            this.parent.forge('models/Copier').then(function (copier) {

                copier.execute(from, to, context).step(function (step) {

                    this.writeLine(step.message, step.type);

                }.bind(this)).then(function (results) {

                    //rename the Module.js to Name.js
                    var m = _.where(results, { file: 'Module.js' })[0],
                        dest    = path.join(m.to, '..', name + '.js');

                    this.writeLine('Forge complete. Renaming Module.js to ' + name + '.js');

                    return this.promise(fs, 'rename', m.to, dest);


                }.bind(this)).then(function () {

                    this.writeLine('Your module is ready for you at ' + to);

                    dfd.resolve(this);

                }.bind(this)).otherwise(this.hitch(dfd, 'reject'));

            }.bind(this));

            return dfd;
        },

        /**
         * Forge a new app
         *
         * @param values
         * @returns {Deferred}
         */
        app: function (values) {

            this.writeLine('forging new app...');

            return this.parent.forge('models/App').then(function (app) {

                return app.forge(values.destination, values).step(function (step) {

                    this.writeLine(step.message, step.type || '');

                }.bind(this)).then(function () {

                    this.writeLine('Forge complete.');

                }.bind(this));

            }.bind(this));


        },

        /**
         * Update schema at runtime
         *
         * @param command
         */
        schemaForCommand: function (command) {

            var schema = this.inherited(arguments);

            //the newModule command has some choices that need updating (destination dir)
            if(schema && command.callback === 'module') {

                //get the 'paths' we have set in altair
                var altair          = this.nexus('Altair'),
                    defaultValue    = altair.paths[altair.paths.length - 1],
                    choices         = {};

                altair.paths.forEach(function (path) {
                    if(path !== 'core') {
                        choices[path] = require.toUrl(path);
                    }
                });

                schema.setOptionFor('destination', 'choices', choices);
                schema.setOptionFor('destination', 'defaultValue', defaultValue);

            }


            return schema;
        }



    });
});