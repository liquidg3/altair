/**
 * TEST CARTRIDGE ONLY ** DO NOT USE BECAUSE IT IS REALLY BORING **
 */
define(['dojo/_base/declare', 'altair/Lifecycle'], function (declare, Lifecycle) {

    return declare([Lifecycle], {

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