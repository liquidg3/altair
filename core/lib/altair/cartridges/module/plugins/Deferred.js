/**
 * Gives us the ability to use: new this.Deferred() in our modules!
 */
define(['dojo/_base/declare',
        './_Base',
        'dojo/Deferred'],

    function (declare,
              _Base,
              Deferred) {

    return declare('altair/cartridges/module/plugins/Mock',[_Base], {

        execute: function (module) {

            declare.safeMixin(module, {
                Deferred: Deferred
            });

            return this.inherited(arguments);
        }

    });


});