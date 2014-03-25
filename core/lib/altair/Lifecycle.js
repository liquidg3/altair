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
 * startup: function (options) {
 *
 *      //options are optional, fallback to the ones already set
 *      options = options || this.options;
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
define(['altair/facades/declare',
        'altair/Deferred'],
            function (declare,
                      Deferred) {

    "use strict";

    var resolve = function (scope, def) {

        return function () {

            setTimeout(function () {

                if(scope.deferred === def && scope.deferred.isResolved()) {
                    scope.deferred = null;
                }

            }, 0);
        };
    };

    return declare(null, {
        Deferred:       Deferred,
        deferred:       null,
        options:        null,

        constructor: function (options) {
            this.options = options;
        },

        /**
         * Put anything that needs to be done (configuring, setup, etc.) before your lifecycle is executed.
         *
         * Startup always returns an altair/Deferred. If one does not exist (meaning you did not set this.deferred = new Deferred
         * in your child class) then I will make one and resolve it immediately. This makes the operation synchronise,
         * but will allow us to always use the startup().then(... syntax.
         *
         * @param options simply copied to local this.options
         * @return {altair.Deferred}
         */
        startup: function (options) {

            if(options) {
                this.options = options;
            }

            if(!this.deferred) {
                this.deferred = new this.Deferred();
                this.deferred.resolve(this);
            }

            //remove the deferred after it's been resolved
            this.deferred.promise.always(resolve(this, this.deferred));

            return this.deferred;

        },

        /**
         * Do your work in here.
         *
         * @returns {altair.Deferred}
         */
        execute: function () {

            if(!this.deferred) {
                this.deferred = new this.Deferred();
                this.deferred.resolve(this);
            }

            //remove the deferred after it's been resolved
            this.deferred.promise.always(resolve(this, this.deferred));

            return this.deferred;

        },

        /**
         * Clean up so it's like you never existed.
         *
         * @returns {altair.Deferred}
         */
        teardown: function () {

            if(!this.deferred) {
                this.deferred = new this.Deferred();
                this.deferred.resolve(this);
            }

            //remove the deferred after it's been resolved
            this.deferred.promise.always(resolve(this, this.deferred));

            return this.deferred;

        }
    });
});
