/**
 * Nexus is the piece that connects all things in Altair. It uses Resolvers in a sort of Chain of Responsibility
 * implementation that gives any Altair dev the ability to get what they need, when they need it, while exposing
 * an extremely simple API.
 *
 * You can also set arbitrary values to arbitrary keys. But, the real power of Nexus comes from its resolvers.
 *
 * A resolver is an object that has 2 methods, handles(key) and resolve(key, options, config). See ./ResolverBase
 * for a stub class you can mixin.
 *
 */
define(['dojo/_base/declare',
    'altair/Lifecycle'], function (declare, Lifecycle) {

    return declare('altair/cartridges/Base', [Lifecycle], {

        altair: null,
        options: null,

        constructor: function (altair, options) {

            this.altair = altair;
            this.options = options;

            if(!altair) {
                throw "You must pass an instance of Altair to any cartridge"
            }

        }



    });


});