/**
 * TEST CARTRIDGE ONLY ** DO NOT USE BECAUSE IT IS REALLY BORING **
 */
define(['dojo/_base/declare', 'altair/Lifecyle'], function (declare, Lifecyle) {

    return declare([Lifecyle], {

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