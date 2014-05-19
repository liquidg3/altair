define(['altair/facades/declare',
        'altair/facades/hitch',
        'altair/facades/when',
        'altair/facades/all',
        'lodash',
        'altair/Deferred'
], function (declare,
             hitch,
             when,
             all,
             _,
             Deferred) {

    return declare(null, {

        Deferred:       Deferred,

        /**
         * Returns a function bound using hitch rules to ourselves
         *
         * @returns {function}
         */
        hitch: function () {
            var args = Array.prototype.slice.call(arguments, 0);

            if(_.isString(args[0]) || _.isFunction(args[0])) {
                args.unshift(this);
            }

            return hitch.apply(hitch, args);
        },

        /**
         * Not sure if you have a deferred? wrap it in when and be certain.
         *
         * @param obj
         * @returns {altair.Deferred}
         */
        when: function (obj) {
            return when(obj);
        },

        /**
         * Have array of deferreds or an object whose values could be deferreds? Pass it to all and I'll wait until they
         * all resolve.
         *
         * @param list
         * @returns {*}
         */
        all: function (list) {
            return all(list);
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
                        err     = args.length > 0 && func !== require ? args.shift() : null;
                    //this ternary is to handle someone wrapping a require(). all other cases, first arg is expected to be error

                    if(err) {
                        d.reject(new Error(err), false); // we will not log promise failures here because they aften are not serious (fs.stat'ing for a file)
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

                if(!func) {
                    d.reject(new Error('object ' + object + ' has no method "' + method + '"'));
                    return d;
                }

                //shift object and method from arguments
                args.shift();
                args.shift();
            }


            //push callback
            args.push(cb);

            func.apply(object, args);

            return d;


        }

    });

});