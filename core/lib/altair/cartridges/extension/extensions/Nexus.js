/**
 * Gives each module a nexus() function that will resolve nexus('') calls
 */
define(['altair/facades/declare',
        'altair/Deferred',
        './_Base'], function (declare, Deferred, _Base) {

    return declare([_Base], {

        name:   'nexus',
        nexus:   null,
        startup: function (options) {

            //we have to make sure we have our dependent plugins loaded
            if(!this.altair.hasCartridges(['nexus'])) {
                throw new Error("The nexus extension needs the 'nexus' cartridge enabled.");
            }

            //get our local nexus instance
            if(options && options.nexus) {
                this.nexus = options.nexus;
            } else {
                this.nexus = this.altair.cartridge('nexus');
            }


            return this.inherited(arguments);
        },

        extend: function (Module) {

            Module.extendOnce({
                _nexus: this.nexus,
                nexus: function (name, options, config) {
                    return this._nexus.resolve(name, options, config);
                }
            });

            return this.inherited(arguments);
        }

    });


});