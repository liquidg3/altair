/**
 * Run many async operations serially
 */
define(['lodash',
    './hitch',
    'altair/Deferred',
    'altair/facades/when'],

    function (_, hitch, Deferred, when) {

        return function (callbacks) {

            var cbs = _.toArray(callbacks),
                dfd = new Deferred(),
                results = [],
                next = function () {

                    var callback = cbs.shift();

                    if (!callback) {
                        dfd.resolve(results);
                    } else {

                        when(callback()).then(function (r) {
                            results.push(r);
                            next();
                        }).step(hitch(dfd, 'progress')).otherwise(function (err) {
                            hitch(dfd, 'reject')(err);
                        });

                    }

                };

            next();

            return dfd;


        };
    });
