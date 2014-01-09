/**
 * TEST CARTRIDGE ONLY ** DO NOT USE BECAUSE IT IS REALLY BORING **
 */
define(['dojo/_base/declare', 'altair/Base'], function (declare, Base) {

    return declare([Base], {

        startedUp: false,
        tornDown: false,

        startup: function (options) {
            this.startedUp = true;
            return this.inherited(arguments);
        },

        teardown: function () {
            this.tornDown = true;
            return this.inherited(arguments);
        }

    });


});