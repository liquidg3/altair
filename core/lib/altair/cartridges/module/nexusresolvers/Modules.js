/**
 * The nexus resolver used to let users gain access to modules via nexus
 */
define([
    'dojo/_base/declare',
    'altair/cartridges/nexus/_ResolverBase'
],
function (declare,
          _ResolverBase) {

    return declare('altair/cartridges/module/Resolver', [_ResolverBase], {
        moduleCartridge: null,

        constructor: function (moduleCartridge) {
            this.moduleCartridge = moduleCartridge;

            if(!moduleCartridge) {
                throw "You must pass the nexus module resolver a module cartridge.";

            }

        },
        resolve: function (key, options, config) {
            return this.moduleCartridge.module(key);
        },
        handles: function (key) {
            return this.moduleCartridge.hasModule(key);
        }

    });

});