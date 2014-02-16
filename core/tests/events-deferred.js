/**
 * Our events/Deferred handles its resolve's differently than normal Deferreds. We expect resolve() to be called many
 * times and each then() will be fired. Then, the results are collected and returned to anyone who has called
 * resolve().then(function (results) {...})
 */
define(['doh/runner',
        'altair/events/Deferred',
        'dojo/Deferred',
        'altair/facades/hitch'],

    function (doh,
              Deferred,
              DojoDeferred,
              hitch) {

        doh.register('deferred', [

            /**
             * Ensure resolve.then() waits for any deferred returned by any previous then(), chaining then(),s using deferreds
             *
             * @param t
             */
            function (t) {


                var def = new Deferred(),
                    d2  = new DojoDeferred();

                //we want the value of the LAST then(), the 3rd one should wait 10 mili for the 2nd one
                def.then(function (num) {
                    return --num;
                }).then(function (num) {
                    var _def = new Deferred();

                    setTimeout(function () {
                        _def.resolve(--num);
                    }, 10);

                    return _def;
                }).then(function (num) {
                    return --num;
                });

                //simple, 1 deferred out of the gate
                def.then(function (num) {
                    var _def = new Deferred();

                    setTimeout(function () {
                        _def.resolve(++num);
                    }, 10);

                    return _def;
                });

                //should wait until each "then()" chain is completed, then give us all the results
                def.resolve(1).then(function (nums) {
                    t.is(nums[0], -2, 'resolves deferred did not receive result of last then()');
                    t.is(nums[1], 2, 'resolves deferred did not receive result of last then()');
                    d2.resolve(true);
                });

                return d2;

            },

            /**
             * Ensure resolve.then() waits for any deferred returned by any previous then()
             *
             * @param t
             */
            function (t) {


                var def = new Deferred(),
                    d2  = new DojoDeferred();

                def.then(function (num) {
                    return --num;
                }).then(function (num) {
                    return --num;
                });

                def.then(function (num) {
                    var _def = new Deferred();

                    setTimeout(function () {
                        _def.resolve(++num);
                    }, 10);

                    return _def;
                });

                def.resolve(1).then(function (nums) {
                    t.is(nums[0], -1, 'resolves deferred did not receive result of last then()');
                    t.is(nums[1], 2, 'resolves deferred did not receive result of last then()');
                    d2.resolve(true);
                });

                return d2;

            },

            /**
             * Ensure resolve.then() waits for any deferred returned by any previous then()
             *
             * @param t
             */
            function (t) {


                var def = new Deferred(),
                    d2  = new DojoDeferred();

                def.then(function (num) {
                    var _def = new Deferred();

                    setTimeout(function () {
                        _def.resolve(++num);
                    }, 10);

                    return _def;
                });

                def.then(function (num) {
                    return --num;
                });

                def.resolve(1).then(function (nums) {
                    t.is(nums[0], 2, 'resolves deferred did not receive result of last then()');
                    t.is(nums[1], 0, 'resolves deferred did not receive result of last then()');
                    d2.resolve(true);
                });

                return d2;

            },

            /**
             * Ensure that our Deferred's resolve().then() receives the results of last queued listener
             */
            function (t) {


                var def = new Deferred(),
                    d2  = new DojoDeferred();

                def.then(function (num) {
                    return ++num;
                });

                def.then(function (num) {
                    return --num;
                });

                def.resolve(1).then(function (nums) {
                    t.is(nums[0], 2, 'resolves deferred did not receive result of last then()');
                    t.is(nums[1], 0, 'resolves deferred did not receive result of last then()');
                    d2.resolve(true);
                });


                return d2;


            }



        ]);

    });
