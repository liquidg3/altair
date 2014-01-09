define(['dojo/_base/declare','dojo/Deferred'], function (declare, Deferred) {

    return declare(null, {

        deferred: null,
        startup: function (config) {},
        go: function () {

            this.deferred = new Deferred();

            return this.deferred;

        },

        teardown: function () {

            console.log('shutdown');

        }

    });


});