/*Skip for jsLint
 This is a copy/paste of a dojo file
 it should be rewritten more cleanly
 */

define([
    "dojo/has",
    "dojo/_base/lang",
    "dojo/errors/CancelError",
    "dojo/promise/Promise",
    'dojo/promise/all',
    'altair/facades/hitch',
    'dojo/when',
    'dojo/Deferred',
    "dojo/has!config-deferredInstrumentation?dojo/promise/instrumentation"
], function(has, lang, CancelError, Promise, all, hitch, when, DojoDeferred, instrumentation){

    // module:
    //		dojo/Deferred

    var PROGRESS = 0,
        RESOLVED = 1,
        REJECTED = 2;
    var FULFILLED_ERROR_MESSAGE = "This deferred has already been fulfilled.";

    var freezeObject = Object.freeze || function(){};

    var signalWaiting = function(waiting, type, result, rejection, deferred){
        if(has("config-deferredInstrumentation")){
            if(type === REJECTED && Deferred.instrumentRejected && waiting.length === 0){
                Deferred.instrumentRejected(result, false, rejection, deferred);
            }
        }

        for(var i = 0; i < waiting.length; i++){
            signalListener(waiting[i], type, result, rejection);
        }
    };

    var signalListener = function(listener, type, result, rejection){
        var func = listener[type];
        var deferred = listener.deferred;
        if(func){
            try{
                var newResult = func(result);
                if(type === PROGRESS){
                    if(typeof newResult !== "undefined"){
                        signalDeferred(deferred, type, newResult);
                    }
                }else{
                    if(newResult && typeof newResult.then === "function"){
                        listener.cancel = newResult.cancel;
                        newResult.then(
                            // Only make resolvers if they're actually going to be used
                            makeDeferredSignaler(deferred, RESOLVED),
                            makeDeferredSignaler(deferred, REJECTED),
                            makeDeferredSignaler(deferred, PROGRESS));
                        return;
                    }
                    signalDeferred(deferred, RESOLVED, newResult);
                }
            }catch(error){
                signalDeferred(deferred, REJECTED, error);
            }
        }else{
            signalDeferred(deferred, type, result);
        }

        if(has("config-deferredInstrumentation")){
            if(type === REJECTED && Deferred.instrumentRejected){
                Deferred.instrumentRejected(result, !!func, rejection, deferred.promise);
            }
        }
    };

    var makeDeferredSignaler = function(deferred, type){
        return function(value){
            signalDeferred(deferred, type, value);
        };
    };

    var signalDeferred = function(deferred, type, result){
        if(!deferred.isCanceled()){
            switch(type){
                case PROGRESS:
                    deferred.progress(result);
                    break;
                case RESOLVED:
                    deferred.resolve(result);
                    break;
                case REJECTED:
                    deferred.reject(result);
                    break;
            }
        }
    };

    var Deferred = function(canceler){
        // summary:
        //		Creates a new deferred. This API is preferred over
        //		`dojo/_base/Deferred`.
        // description:
        //		Creates a new deferred, as an abstraction over (primarily)
        //		asynchronous operations. The deferred is the private interface
        //		that should not be returned to calling code. That's what the
        //		`promise` is for. See `dojo/promise/Promise`.
        // canceler: Function?
        //		Will be invoked if the deferred is canceled. The canceler
        //		receives the reason the deferred was canceled as its argument.
        //		The deferred is rejected with its return value, or a new
        //		`dojo/errors/CancelError` instance.

        // promise: dojo/promise/Promise
        //		The public promise object that clients can add callbacks to.
        var promise = this.promise = new Promise();

        var deferred = this;
        var fulfilled, result, rejection;
        var canceled = false;
        var waiting = [];

        if(has("config-deferredInstrumentation") && Error.captureStackTrace){
            Error.captureStackTrace(deferred, Deferred);
            Error.captureStackTrace(promise, Deferred);
        }

        this.isResolved = promise.isResolved = function(){
            // summary:
            //		Checks whether the deferred has been resolved.
            // returns: Boolean

            return fulfilled === RESOLVED;
        };


        /**
         * Tells us if we have made any promises
         *
         * @returns {boolean}
         */
        this.hasWaiting = function () {
            return waiting.length > 0;
        };

        this.isRejected = promise.isRejected = function(){
            // summary:
            //		Checks whether the deferred has been rejected.
            // returns: Boolean

            return fulfilled === REJECTED;
        };

        this.isFulfilled = promise.isFulfilled = function(){
            // summary:
            //		Checks whether the deferred has been resolved or rejected.
            // returns: Boolean

            return !!fulfilled;
        };

        this.isCanceled = promise.isCanceled = function(){
            // summary:
            //		Checks whether the deferred has been canceled.
            // returns: Boolean

            return canceled;
        };

        this.progress = function(update, strict){
            // summary:
            //		Emit a progress update on the deferred.
            // description:
            //		Emit a progress update on the deferred. Progress updates
            //		can be used to communicate updates about the asynchronous
            //		operation before it has finished.
            // update: any
            //		The progress update. Passed to progbacks.
            // strict: Boolean?
            //		If strict, will throw an error if the deferred has already
            //		been fulfilled and consequently no progress can be emitted.
            // returns: dojo/promise/Promise
            //		Returns the original promise for the deferred.

            if(!fulfilled){
                signalWaiting(waiting, PROGRESS, update, null, deferred);
                return promise;
            }else if(strict === true){
                throw new Error(FULFILLED_ERROR_MESSAGE);
            }else{
                return promise;
            }
        };

        /**
         * Overridden so promises new "then" returns the results from all callbacks
         * @param value
         * @param strict
         * @returns {dojo.promise.Promise}
         */
        this.resolve = function(value, strict){
            // summary:
            //		Resolve the deferred.
            // description:
            //		Resolve the deferred, putting it in a success state.
            // value: any
            //		The result of the deferred. Passed to callbacks.
            // strict: Boolean?
            //		If strict, will throw an error if the deferred has already
            //		been fulfilled and consequently cannot be resolved.
            // returns: dojo/promise/Promise
            //		Returns the original promise for the deferred.

            result      = value;

            //when resolve is called we want to reset status
            fulfilled = RESOLVED;

            var callback,
                listener,
                finished = false,
                results = [],
                newResult,
                _waiting = waiting.slice(0),

                //build a fake promise to stop recursion
                newPromise     = {
                    callback: null,
                    errCallback: null,
                    then: function (callback) {
                        this.callback = callback;
                        if(finished && fulfilled !== REJECTED) {
                            callback(results);
                        }
                        return this;
                    },
                    otherwise: function (callback) {
                        this.errCallback = callback;
                        if(finished && fulfilled === REJECTED) {
                            callback(results);
                        }
                        return this;
                    }
                };

            //will fire 1 waiting at a time
            var fire = function () {

                listener = _waiting.shift();

                if(listener) {

                    callback = listener[RESOLVED];

                    if(callback) {

                        var _deferred    = listener.deferred;

                        try {
                            newResult        = callback(value);
                        } catch(e) {
                            _waiting = [];
                            fulfilled = REJECTED;
                            finished = true;
                            results = e;
                            if(newPromise.errCallback) {
                                newPromise.errCallback(e);
                            } else {
                                console.log(e);
                            }
                        }


                        if(!finished && _deferred.hasWaiting()) {

                            _deferred.resolve(newResult).then(function (_newResult) {

                                newResult = _newResult[0];

                                if(newResult && typeof newResult.then === "function"){
                                    console.warn('@FINISH fluent then()\'s not supported after resolve() ');
                                } else {

                                    results.push(_newResult[0]);
                                    fire();

                                }



                            }).otherwise(function (err) {
                                _waiting = [];//no more waiting, entire operation canceled
                                finished = true;
                                fulfilled = REJECTED;
                                if(newPromise.errCallback) {
                                    newPromise.errCallback(err);
                                }
                            });

                        } else if(!finished) {

                            when(newResult).then(function (_result) {
                                results.push(_result);
                                fire();
                            }).otherwise(function (err) {
                                _waiting = [];//no more waiting, entire operation canceled
                                finished = true;
                                fulfilled = REJECTED;
                                results = err;
                                if(newPromise.errCallback) {
                                    newPromise.errCallback(err);
                                }
                            });

                        }


                    } else {

                        finished = true;
                        if(newPromise.callback && fulfilled !== REJECTED) {
                            newPromise.callback(results);
                        }

                    }


                }
                //there are no more waiting
                else {
                    finished = true;
                    if(newPromise.callback && fulfilled !== REJECTED) {
                        newPromise.callback(results);
                    }
                }


            };

            if(value && typeof value.then === "function"){
                when(value).then(function (_value) {
                    value = _value;
                    fire();
                });
            } else {
                fire();
            }

            return newPromise;


        };

        var reject = this.reject = function(error, strict){
            // summary:
            //		Reject the deferred.
            // description:
            //		Reject the deferred, putting it in an error state.
            // error: any
            //		The error result of the deferred. Passed to errbacks.
            // strict: Boolean?
            //		If strict, will throw an error if the deferred has already
            //		been fulfilled and consequently cannot be rejected.
            // returns: dojo/promise/Promise
            //		Returns the original promise for the deferred.

            if(!fulfilled){
                if(has("config-deferredInstrumentation") && Error.captureStackTrace){
                    Error.captureStackTrace(rejection = {}, reject);
                }
                signalWaiting(waiting, fulfilled = REJECTED, result = error, rejection, deferred);
                waiting = null;
                return promise;
            }else if(strict === true){
                throw new Error(FULFILLED_ERROR_MESSAGE);
            }else{
                return promise;
            }
        };

        this.then = promise.then = function(callback, errback, progback){
            // summary:
            //		Add new callbacks to the deferred.
            // description:
            //		Add new callbacks to the deferred. Callbacks can be added
            //		before or after the deferred is fulfilled.
            // callback: Function?
            //		Callback to be invoked when the promise is resolved.
            //		Receives the resolution value.
            // errback: Function?
            //		Callback to be invoked when the promise is rejected.
            //		Receives the rejection error.
            // progback: Function?
            //		Callback to be invoked when the promise emits a progress
            //		update. Receives the progress update.
            // returns: dojo/promise/Promise
            //		Returns a new promise for the result of the callback(s).
            //		This can be used for chaining many asynchronous operations.

            var listener = [progback, callback, errback];
            // Ensure we cancel the promise we're waiting for, or if callback/errback
            // have returned a promise, cancel that one.
            listener.cancel = promise.cancel;
            listener.deferred = new Deferred(function(reason){
                // Check whether cancel is really available, returned promises are not
                // required to expose `cancel`
                return listener.cancel && listener.cancel(reason);
            });
            if(fulfilled && !waiting){
                signalListener(listener, fulfilled, result, rejection);
            }else{
                waiting.push(listener);
            }
            return listener.deferred.promise;
        };

        this.cancel = promise.cancel = function(reason, strict){
            // summary:
            //		Inform the deferred it may cancel its asynchronous operation.
            // description:
            //		Inform the deferred it may cancel its asynchronous operation.
            //		The deferred's (optional) canceler is invoked and the
            //		deferred will be left in a rejected state. Can affect other
            //		promises that originate with the same deferred.
            // reason: any
            //		A message that may be sent to the deferred's canceler,
            //		explaining why it's being canceled.
            // strict: Boolean?
            //		If strict, will throw an error if the deferred has already
            //		been fulfilled and consequently cannot be canceled.
            // returns: any
            //		Returns the rejection reason if the deferred was canceled
            //		normally.

            if(!fulfilled){
                // Cancel can be called even after the deferred is fulfilled
                if(canceler){
                    var returnedReason = canceler(reason);
                    reason = typeof returnedReason === "undefined" ? reason : returnedReason;
                }
                canceled = true;
                if(!fulfilled){
                    // Allow canceler to provide its own reason, but fall back to a CancelError
                    if(typeof reason === "undefined"){
                        reason = new CancelError();
                    }
                    reject(reason);
                    return reason;
                }else if(fulfilled === REJECTED && result === reason){
                    return reason;
                }
            }else if(strict === true){
                throw new Error(FULFILLED_ERROR_MESSAGE);
            }
        };

        freezeObject(promise);
    };

    Deferred.prototype.toString = function(){
        // returns: String
        //		Returns `[object Deferred]`.

        return "[object Deferred]";
    };

    if(instrumentation){
        instrumentation(Deferred);
    }

    return Deferred;
});
