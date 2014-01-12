define(['dojo/_base/declare', 'dojo/Deferred', './Base'], function (declare, Deferred, Base) {

    return declare([Base], {

        values: {},
        startedUp: false,

        startup: function () {
            this.startedUp = true;
            return this.inherited(arguments);
        },

        get: function (key, defaultValue) {
            var deferred = new Deferred();
            deferred.resolve(this[key] || defaultValue);
            return deferred;
        },
        set: function (key, value, tags) {
            var deferred = new Deferred();
            this[key] = value;
            deferred.resolve();
            return deferred;
        },
        has: function (key) {
            var deferred = new Deferred();
            deferred.resolve(key in this);
            return deferred;
        },
        unset: function (key) {
            var deferred = new Deferred();
            delete this[key];
            deferred.resolve();
            return deferred;
        }
    });


});