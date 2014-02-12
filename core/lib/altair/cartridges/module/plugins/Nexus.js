/**
 * Gives each module a nexus() function that will resolve nexus('') calls
 */
define(['dojo/_base/declare', 'dojo/Deferred', './_Base'], function (declare, Deferred, _Base) {

    return declare('altair/cartridges/module/plugins/Nexus', [_Base], {

        nexus:      null,
        startup: function (options) {

            this.deferred = new Deferred();

            //we have to make sure we have our dependent plugins loaded
            if(!this.cartridge.altair.hasCartridges(['altair/cartridges/nexus/Nexus'])) {
                this.deferred.reject("The nexus plugin needs the 'altair/cartridges/nexus/Nexus' cartridge enabled.");
                return this.inherited(arguments);
            }

            //get our local nexus instance
            if(options && options.nexus) {
                this.nexus = options.nexus;
            } else {
                this.nexus = this.cartridge.altair.cartridge('altair/cartridges/nexus/Nexus');
            }

            this.deferred.resolve();

            return this.inherited(arguments);
        },

        execute: function (module) {

            declare.safeMixin(module, {
                _nexus: this.nexus,
                nexus: function (name, options, config) {
                    return this._nexus.resolve(name, options, config);
                }
            });

            return this.inherited(arguments);
        }

    });


});