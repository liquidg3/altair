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
        'altair/Deferred',
        'lodash',
        'altair/facades/hitch'],
            function (declare,
                      Deferred,
                      _,
                      hitch) {

    "use strict";


    return declare(null, {

        Deferred:       Deferred,
        deferred:       null,
        options:        null,

        //deferred tracking
        _startupDeferred: null,

        constructor: function (options) {
            this.options = options;
        },

        /**
         * Returns a function bound using hitch rules to ourselves
         *
         * @returns {function}
         */
        hitch: function () {
            var args = Array.prototype.slice.call(arguments, 0);
            args.unshift(this);
            return hitch.apply(hitch, args);
        },


        /**
         * Call any non-promise event-based method and i'll wrap it in a deferred. I'm assuming the last param to the
         * method i am calling is the callback and the first param to it is an error. The signature of this method is
         * for visual queues, but it was designed to take as many params as needed for the method you are calling.
         *
         * @param object
         * @param method
         * @param params
         *
         */
        promise: function (object, method) {

            var d       = new this.Deferred(),
                args    = Array.prototype.slice.call(arguments),
                func,
                cb      = function () {

                    var args    = Array.prototype.slice.call(arguments),
                        err     = args.length > 0 && !_.isFunction(args[0]) ? args.shift() : null;
                        //this ternary is to handle someone wrapping a require(). all other cases, first arg is expected to be error

                    if(err) {
                        d.reject(new Error(err));
                    } else {
                        d.resolve(args.length <= 1 ? args.pop() : args);
                    }


                };

            if(_.isFunction(object)) {
                func = object;
                object = null;

                //shift function off
                args.shift();

            } else {
                func = object[method];

                //shift object and method from arguments
                args.shift();
                args.shift();
            }


            //push callback
            args.push(cb);

            func.apply(object, args);

            return d;


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
            if(!this.deferred.always) {

                this.deferred.reject(new Error('Invalid deferred type, use altair/Deferred.'));

            } else {

                this.deferred.always(this._deferredAutoRemover(this.deferred));
            }

            //tracking
            this._startupDeferred = this.deferred;

            return this.deferred;

        },

        /**
         * Do your work in here.
         *
         * @returns {altair.Deferred}
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
            this.deferred.always(this._deferredAutoRemover(this.deferred));

            return this.deferred;

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
