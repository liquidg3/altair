/**
 * Loads every modules' package.json so it
 */
define(['dojo/_base/declare', 'dojo/Deferred', './_Base'], function (declare, Deferred, _Base) {

    return declare('altair/cartridges/module/plugins/Package', [_Base], {

        execute: function (module) {

            this.deferred = new Deferred();

            if(!module.parseConfig) {
                throw "The Package plugin depends on the Config plugin, make sure it's loaded and try again.";
            }

            module.parseConfig('package.json').then(lang.hitch(this, function (err, parsedPackage) {

                if(err) {
                    throw err;
                }

                declare.safeMixin(module, {
                    package: parsedPackage
                });

                this.deferred.resolve(this);

            }));


            return this.inherited(arguments);
        }

    });


});