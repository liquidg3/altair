define(['altair/test',
        './support/Semaphore',
        'altair/Deferred',
        'altair/facades/hitch'
    ],
    function (test,
              Semaphore,
              Deferred,
              hitch) {

        "use strict";

        test.register('semaphore', {

            "tast basic queue": function (t) {

                var sema = new Semaphore(),
                    order = [];

                sema.queue().then(function () {

                    order.push(0);
                    setTimeout(function () {

                        order.push(1);
                        sema.next();

                    }, 500);

                });

                return sema.queue().then(function () {

                    order.push(2);

                    t.is(0, order[0]);
                    t.is(1, order[1]);
                    t.is(2, order[2]);

                });


            },

            "tast named queue": function (t) {

                var sema = new Semaphore(),
                    key = 'test-queue',
                    order = [];

                sema.queue(key).then(function () {

                    order.push(0);
                    setTimeout(function () {

                        order.push(1);
                        sema.next(key);

                    }, 500);

                });

                return sema.queue(key).then(function () {

                    order.push(2);

                    t.is(0, order[0]);
                    t.is(1, order[1]);
                    t.is(2, order[2]);

                });


            }


        });


    });