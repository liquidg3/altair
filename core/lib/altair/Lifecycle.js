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
 *      fs.someLongComplicatedAsyncProcess(this.hitch(function (results) {
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
 * REMEMBER: the purpose of startup() is to to ensure execute() has everything it needs to do its job. Don't abuse startup().
 *
 */
define(['altair/facades/declare',
        './mixins/_DeferredMixin',
        'lodash'],
            function (declare,
                      _DeferredMixin) {

    "use strict";


    return declare([_DeferredMixin], {

        deferred:       null,
        options:        null,

        //deferred tracking
        _startupDeferred: null,

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
         * @return {altair.Promise}
         */
        startup: function (options) {

            if(options) {
                this.options = _.clone(options);
            }

            if(!this.deferred) {
                this.deferred = new this.Deferred();
                this.deferred.resolve(this);
            }

            //remove the deferred after it's been resolved
            if(!this.deferred.always) {

                this.deferred.reject(new Error('Invalid deferred type, use altair/Deferred.'));

            } else {

                this.deferred.always(this._deferredAutoRemover(this.deferred));
            }

            //tracking
            this._startupDeferred = this.deferred;

            return this.deferred.promise || this.deferred;

        },

        /**
         * Mixin your async dependencies, for use during sartingy
         *
         * @param dependencies
         * @returns {*}
         */
        mixin: function (dependencies) {

            this.deferred = this.all(dependencies).then(function (deps) {

                declare.safeMixin(this, deps);

                return this;

            }.bind(this));

            return this.deferred;

        },

        /**
         * Do your work in here.
         *
         * @returns {altair.Promise}
         */
        execute: function () {

            //make sure startup deferred is still not active (can happen when someone goes life.startup().then(life.execute())
            //and deferreds are auto-resolved (which makes the whole process sync)
            if(this.deferred && this.deferred === this._startupDeferred) {
                this.deferred = null;
            }

            if(!this.deferred) {
                this.deferred = new this.Deferred();
                this.deferred.resolve(this);
            }

            //do not need the startup deferred again
            this._startupDeferred = null;

            //remove the deferred after it's been resolved
            this.deferred.always(this._deferredAutoRemover(this.deferred));

            return this.deferred.promise || this.deferred;

        },

        /**
         * Clean up so it's like you never existed.
         *
         * @returns {altair.Promise}
         */
        teardown: function () {

            if(!this.deferred) {
                this.deferred = new this.Deferred();
                this.deferred.resolve(this);
            }

            //remove the deferred after it's been resolved
            this.deferred.always(this._deferredAutoRemover(this.deferred));

            return this.deferred.promise || this.deferred;

        },

        _deferredAutoRemover: function(def) {

            var scope = this;
            return function () {

                setTimeout(function () {

                    if(scope.deferred === def && scope.deferred.isResolved()) {
                        scope.deferred = null;
                    }

                }, 0);
            };
        }
    });
});
