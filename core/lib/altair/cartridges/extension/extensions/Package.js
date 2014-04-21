/**
 * Loads every modules' package.json so it
 */
define(['altair/facades/declare',
        './_Base',
        'altair/facades/hitch'],

    function (declare,
              _Base,
              hitch) {

    return declare([_Base], {

        name:    'package',

        startup: function () {

            if(!this.cartridge.hasExtension('config')) {
                throw new Error('The package extension requires the config extension.');
            }

            return this.inherited(arguments);

        },

        execute: function (module) {

            this.deferred = new this.Deferred();

            if(!module.packagePath) {
                this.deferred.resolve(this);
            } else {

                module.parseConfig(module.packagePath).then(hitch(this, function (parsedPackage) {

                    declare.safeMixin(module, {
                        package: parsedPackage
                    });

                    this.deferred.resolve(this);

                })).otherwise(hitch(this.deferred, 'reject'));

            }

            return this.inherited(arguments);
        }

    });


});