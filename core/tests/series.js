define(['altair/test',
    'altair/Deferred',
    'altair/facades/series',
    'altair/facades/hitch'
],
    function (test,
              Deferred,
              series,
              hitch) {


        test.register('series', {

            "test series runs serial": function (t) {

                var dfd = new Deferred(),
                    results = [],
                    first = function () {
                        results.push(1);
                        return 1;
                    },
                    second = function () {
                        results.push(2);
                        return 2;
                    };


                series([first, second]).then(function (_results) {

                    t.is(1, _results[0], 'series ran in wrong order');
                    t.is(2, _results[1], 'series ran in wrong order');

                    t.is(1, results[0], 'series ran in wrong order');
                    t.is(2, results[1], 'series ran in wrong order');

                    dfd.resolve();

                }).otherwise(hitch(dfd, 'reject'));


                return dfd;



            },

            "test series runs serial with promises": function (t) {

                var dfd = new Deferred(),
                    first = function () {

                        var d = new Deferred();

                        setTimeout(hitch(d, 'resolve', 1), 500);

                        return d;

                    },
                    second = function () {
                        var d = new Deferred();

                        setTimeout(hitch(d, 'resolve', 2), 100);

                        return d;
                    };


                series([first, second]).then(function (_results) {

                    t.is(1, _results[0], 'series ran in wrong order');
                    t.is(2, _results[1], 'series ran in wrong order');

                    dfd.resolve();

                }).otherwise(hitch(dfd, 'reject'));


                return dfd;



            },

            "test series can handle rejection": function (t) {

                var dfd = new Deferred(),
                    first = function () {

                        var d = new Deferred();

                        setTimeout(hitch(d, 'reject', new Error('test error')), 500);

                        return d;

                    },
                    second = function () {

                        var d = new Deferred();

                        setTimeout(hitch(d, 'resolve', 2), 100);

                        return d;
                    };


                series([first, second]).then(function (_results) {

                    dfd.reject('resolve should never have been invoked');

                }).step(function () {}).otherwise(function (err) {
                    dfd.resolve();
                });


                return dfd;



            }



        });


    });