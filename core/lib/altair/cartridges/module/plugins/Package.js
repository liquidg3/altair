/**
 * Loads every modules' package.json so it
 */
define(['altair/facades/declare',
        'altair/Deferred',
        './_Base',
        'altair/facades/hitch'],

    function (declare,
              Deferred,
              _Base,
              hitch) {

    return declare([_Base], {

        declaredClass: 'altair/cartridges/module/plugins/Package',
        execute: function (module) {

            this.deferred = new Deferred();

            if(!module.parseConfig) {
                this.reject("The Package plugin depends on the Config plugin, make sure it's loaded and try again.");
            }

            module.parseConfig('package.json').then(hitch(this, function (parsedPackage) {

                declare.safeMixin(module, {
                    package: parsedPackage
                });

                this.deferred.resolve(this);

            })).otherwise(hitch(this.deferred, 'reject'));


            return this.inherited(arguments);
        }

    });


});