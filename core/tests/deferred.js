define(['doh/runner',
    'altair/Deferred',
    'dojo/Deferred',
    'altair/facades/hitch'],

    function (doh,
              Deferred,
              DojoDeferred,
              hitch) {

        doh.register('deferred', [

            /**
             * Ensure that calling then().then(), the 2nd then() waits
             * if the first returns a deferred... but this has happened AFTER the deferred has been resolved
             *
             * @param t
             */
            function (t) {

                var d = new DojoDeferred(),
                    mock    = new Deferred(),
                    didWait = false;

                mock.resolve('foo+');

                mock.then(function (foo) {

                    var _d = new Deferred();

                    setTimeout(function () {
                        didWait = true;
                        _d.resolve(foo + 'bar');
                    },10);

                    return _d;

                }).then(function (foo) {

                    t.t(didWait, 'Daisy chained thens() did not wait.');
                    t.is(foo, 'foo+bar', 'Daisy chained thens() did not pass back results when deferred.');

                    d.resolve(true);
                });


                return d;

            },

            /**
             * Ensure that calling then().then(), the 2nd then() waits if the first returns a deferred
             *
             * @param t
             */
            function (t) {

                var d = new DojoDeferred(),
                    mock    = new Deferred(),
                    didWait = false;

                mock.then(function (foo) {

                    var _d = new Deferred();

                    setTimeout(function () {
                        didWait = true;
                        _d.resolve(foo + 'bar');
                    },10);

                    return _d;

                }).then(function (foo) {

                    t.t(didWait, 'Daisy chained thens() did not wait.');
                    t.is(foo, 'foo+bar', 'Daisy chained thens() did not pass back results when deferred.');

                    d.resolve(true);
                });

                mock.resolve('foo+');


                return d;

            }




        ]);

    });
