/**
 * What this class does differently than dojo/Deferred:
 *   * supports optional error logging suppression is reject()
 *   • step() alias to make for pretty codez
 */
define([
    "dojo/has",
    "dojo/_base/lang",
    "dojo/errors/CancelError",
    "dojo/promise/Promise",
    "dojo/has!config-deferredInstrumentation?dojo/promise/instrumentation"
], function(has, lang, CancelError, Promise, instrumentation){

    // module:
    //		dojo/Deferred

    var PROGRESS = 0,
        RESOLVED = 1,
        REJECTED = 2;
    var FULFILLED_ERROR_MESSAGE = "This deferred has already been fulfilled.";

    var freezeObject = Object.freeze || function(){};

    var signalWaiting = function(waiting, type, result, rejection, deferred, ignoreErrors){
        if(has("config-deferredInstrumentation")){
            if(!ignoreErrors && type === REJECTED && Deferred.instrumentRejected && waiting.length === 0){
                Deferred.instrumentRejected(result, false, rejection, deferred);
            }
        }

        for(var i = 0; i < waiting.length; i++){
            signalListener(waiting[i], type, result, rejection, ignoreErrors);
        }
    };

    var signalListener = function(listener, type, result, rejection, ignoreErrors){
        var func = listener[type];
        var deferred = listener.deferred;
        ignoreErrors = ignoreErrors || deferred.ignoreErrors;
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
                            makeDeferredSignaler(deferred, RESOLVED,ignoreErrors),
                            makeDeferredSignaler(deferred, REJECTED,ignoreErrors),
                            makeDeferredSignaler(deferred, PROGRESS,ignoreErrors));
                        return;
                    }
                    signalDeferred(deferred, RESOLVED, newResult, ignoreErrors);
                }
            }catch(error){
                signalDeferred(deferred, REJECTED, error, ignoreErrors);
            }
        }else{
            signalDeferred(deferred, type, result, ignoreErrors);
        }

        if(has("config-deferredInstrumentation")){
            if(!ignoreErrors && type === REJECTED && Deferred.instrumentRejected){
                Deferred.instrumentRejected(result, !!func, rejection, deferred.promise);
            }
        }
    };

    var makeDeferredSignaler = function(deferred, type, ignoreErrors){
        return function(value){
            signalDeferred(deferred, type, value, ignoreErrors);
        };
    };

    var signalDeferred = function(deferred, type, result, ignoreErrors){
        ignoreErrors = ignoreErrors || deferred.ignoreErrors;
        if(!deferred.isCanceled()){
            switch(type){
                case PROGRESS:
                    deferred.progress(result);
                    break;
                case RESOLVED:
                    deferred.resolve(result);
                    break;
                case REJECTED:
                    if(ignoreErrors) {
                        deferred.reject(result, false);
                    } else {
                        deferred.reject(result);

                    }
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

        this.ignoreErrors = false;

        if(!this.ignoreErrors && !has("config-deferredInstrumentation") && Error.captureStackTrace){
            Error.captureStackTrace(deferred, Deferred);
            Error.captureStackTrace(promise, Deferred);
        }

        this.isResolved = promise.isResolved = function(){
            // summary:
            //		Checks whether the deferred has been resolved.
            // returns: Boolean

            return fulfilled === RESOLVED;
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

            if(!fulfilled){
                // Set fulfilled, store value. After signaling waiting listeners unset
                // waiting.
                signalWaiting(waiting, fulfilled = RESOLVED, result = value, null, deferred);
                waiting = null;
                return promise;
            }else if(strict === true){
                throw new Error(FULFILLED_ERROR_MESSAGE);
            }else{
                return promise;
            }
        };

        /**
         * Now passing strict as false with disable error reporting
         * @type {reject}
         */
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
                if(strict === false) {
                    this.ignoreErrors = true;
                }
                if(!this.ignoreErrors && has("config-deferredInstrumentation") && Error.captureStackTrace){
                    Error.captureStackTrace(rejection = {}, reject);
                }
                signalWaiting(waiting, fulfilled = REJECTED, result = error, rejection, deferred, this.ignoreErrors);
                waiting = null;
                return promise;
            }else if(strict === true){
                throw new Error(FULFILLED_ERROR_MESSAGE);
            }else{
                return promise;
            }
        };

        this.hasWaiting = function () {
            return waiting.length > 0;
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


            listener.deferred.ignoreErrors = this.ignoreErrors;

            if(fulfilled && !waiting){
                signalListener(listener, fulfilled, result, rejection);
            }else{
                waiting.push(listener);
            }
            return listener.deferred.promise;
        };

        this.step = promise.step = function (progback, callback ,errback) {
            return this.then(callback, errback, progback);
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
