/**
 * TEST CARTRIDGE ONLY ** DO NOT USE BECAUSE IT IS REALLY BORING **
 */
define(['altair/facades/declare',
        'altair/cartridges/_Base'],

function (declare, _Base) {

    return declare([_Base], {

        startedUp: false,
        tornDown: false,
        name: 'mock',

        startup: function (options) {
            this.startedUp = true;
            return this.inherited(arguments);
        },

        execute: function(){
            return this.inherited(arguments);
        },

        teardown: function () {
            this.tornDown = true;

            return this.inherited(arguments);
        }

    });

});