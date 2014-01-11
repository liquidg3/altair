/**
 * Altair's base LifeCycle mixin. Anytime your object has a 3 part lifecycle (setup, execute, teardown)
 * you should mixin this class. It returns dojo/Deferred's for each method for you, but chances are
 * you'll need to override one of these methods. Each one, by default, will return an auto-resolved
 * instance of a dojo/Deferred. That way usage is consistent, whether you override the method or not.
 *
 * Here is how I would implement my overridden startup()
 *
 * ...
 *
 * startup: function (option) {
 *
 *      //creating your own deferred will stop the auto-resolve behavior
 *      this.deferred = new Deferred();
 *
 *      //run your complicated, time consuming setup
 *      fs.someLongComplicatedAsyncProcess(lang.hitch(this, function (results) {
 *
 *          //do something with your results
 *          this.results = results;
 *
 *          //always resolve and pass yourself.
 *          this.deferred.resolve(this);
 *
 *      }));
 *
 *
 *      return this.inherited(arguments);
 *
 * }
 *
 * ...
 *
 * REMEMBER: the purpose of startup() is NOT to load external resource and send them back to the caller. It
 * is to ensure execute() has everything it needs to do its job. Don't abuse startup().
 *
 */
define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/Deferred'], function (declare, lang, Deferred) {

    return declare(null, {

        deferred:       null,
        options:        null,

        constructor: function (options) {
            this.options = options;
        },
        /**
         * Put anything that needs to be done (configuring, setup, etc.) before your lifecycle is executed.
         *
         * Startup always returns a dojo/Deferred. If one does not exist (meaning you did not set this.deferred = new Deferred
         * in your child class) then I will make on and resolve it immediately. This will make it synchronise in behavior,
         * but will allow us to always use the startup().then(... syntax.
         *
         * @param options every object is expected to come up with their own config
         */
        startup: function (options) {

            if(options) {
                this.options   = options;
            }

            if(!this.deferred) {
                this.deferred = new Deferred;
                this.deferred.resolve(this);
            }

            //track current deferred to check if we should clear it later
            var cd = this.deferred;

            //remove the deferred after it's been resolved
            this.deferred.then(lang.hitch(this, function () {
                setTimeout(lang.hitch(this, function() {
                    if(cd == this.deferred) {
                        this.deferred = null;
                    }
                }), 0);
            }));

            return this.deferred;

        },

        /**
         * Do your work in here.
         *
         * @returns {null}
         */
        execute: function () {

            if(!this.deferred) {
                this.deferred = new Deferred;
                this.deferred.resolve(this);
            }

            //track current deferred to check if we should clear it later
            var cd = this.deferred;

            //remove the deferred after it's been resolved
            this.deferred.then(lang.hitch(this, function () {
                setTimeout(lang.hitch(this, function() {
                    if(cd == this.deferred) {
                        this.deferred = null;
                    }
                }), 0);
            }));

            return this.deferred;

        },

        /**
         * Clean up so it's like you never existed.
         *
         * Always returns a dojo/Deferred.
         *
         * @returns dojo/Deferred
         */
        teardown: function () {

            if(!this.deferred) {
                this.deferred = new Deferred;
                this.deferred.resolve(this);
            }

            //track current deferred to check if we should clear it later
            var cd = this.deferred;

            //remove the deferred after it's been resolved
            this.deferred.then(lang.hitch(this, function () {
                setTimeout(lang.hitch(this, function() {
                    if(cd == this.deferred) {
                        this.deferred = null;
                    }
                }), 0);
            }));

            return this.deferred;

        }
    });
});