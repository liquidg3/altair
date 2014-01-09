/**
 * Altair's base object mixin. It is just some basic stuff that we use so often it didn't make sense
 * to write it over and over.
 */
define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/Deferred'], function (declare, lang, Deferred) {

    return declare(null, {

        deferred:   null,
        options:     null,

        /**
         * Startup always returns a dojo/Deferred. If one does not exist (meaning you did not set this.deferred = new Deferred
         * in your child class) then I will make on and resolve it immediately. This will make it synchronise in behavior,
         * but will allow us to always use the startup().then(... syntax.
         *
         * @param options every object is expected to come up with their own config
         */
        startup: function (options) {

            this.options   = options;

            if(!this.deferred) {
                this.deferred = new Deferred;
                this.deferred.resolve(this);
            }

            //remove the deferred after it's been resolved
            this.deferred.then(lang.hitch(this, function () {
                setTimeout(lang.hitch(this, function() {
                    this.deferred = null;
                }), 0);
            }));

            return this.deferred;

        },

        /**
         * Always returns a dojo/Deferred
         * @returns dojo/Deferred
         */
        teardown: function () {

            this.options   = null;

            if(!this.deferred) {
                this.deferred = new Deferred;
                this.deferred.resolve(this);
            }

            //remove the deferred after it's been resolved
            this.deferred.then(lang.hitch(this, function () {
                setTimeout(lang.hitch(this, function() {
                    this.deferred = null;
                }), 0);
            }));

            return this.deferred;

        }
    });
});