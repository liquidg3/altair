define(['dojo/_base/declare', 'dojo/Deferred', './_Base'], function (declare, Deferred, _Base) {

    return declare([_Base], {

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
            deferred.resolve( this.hasOwnProperty( 'key' ) ); 
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