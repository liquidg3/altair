/**
 * TEST CARTRIDGE ONLY ** DO NOT USE BECAUSE IT IS REALLY BORING **
 */
define(['dojo/_base/declare',
        './_Base'],

function (declare, _Base) {

    return declare('altair/cartridges/Mock', [_Base], {

        startedUp: false,
        tornDown: false,

        startup: function (options) {
            this.startedUp = true;
            return this.inherited(arguments);
        },

        execute: function(){

        },

        teardown: function () {
            this.tornDown = true;

            return this.inherited(arguments);
        }

    });

});