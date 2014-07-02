define(['altair/facades/declare',
        'altair/modules/commandcentral/mixins/_IsCommanderMixin',
        'altair/facades/hitch',
        'require',
        'altair/plugins/node!fs',
        'altair/plugins/node!underscore.string',
        'altair/plugins/node!mkdirp',
        'altair/plugins/node!path',
        'altair/facades/sprintf',
        'altair/facades/all'

], function (declare,
             _IsCommanderMixin,
             hitch,
             require,
             fs,
             str,
             mkdirp,
             path,
             sprintf,
             all) {

    return declare([_IsCommanderMixin], {


        /**
         * Forge a new module.
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

            to = path.join(require.toUrl(values.dir), foundry.moduleNameToPath(full));

            this.parent.forge('foundry/Copier').then(function (copier) {

                copier.execute(from, to, context).step(function (step) {

                    this.writeLine(step.message);

                }.bind(this)).then(function (results) {

                    this.writeLine('Forge complete.');

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

            var from = this.parent.resolvePath('templates/app'),
                dfd = new this.Deferred();

            this.parent.forge('foundry/Copier').then(function (copier) {

                copier.execute(from, values.destination, {}).step(function (step) {

                    this.writeLine(step.message);

                }.bind(this)).then(function (results) {

                    this.writeLine('Forge complete.');

                    dfd.resolve(this);

                }.bind(this)).otherwise(this.hitch(dfd, 'reject'));

            }.bind(this));

            return dfd;

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
                    choices    = {};

                altair.paths.forEach(function (path) {
                    if(path !== 'core') {
                        choices[path] = require.toUrl(path);
                    }
                });

                schema.setOptionFor('dir', 'choices', choices);
                schema.setOptionFor('dir', 'defaultValue', defaultValue);

            }


            return schema;
        }



    });
});