/**
 * The event system in Altair (a unique combination of a traditional event system with a query engine twist) is wicked
 * powerful in practice. It actually makes events fun again!
 *
 */
define(['doh/runner',
        'altair/Deferred',
        'altair/facades/hitch'],

    function (doh,
              Deferred,
              hitch) {

        doh.register('deferred', [

            /**
             * Ensure resolve.then() waits for any deferred returned by any previous then(), chaining then(),s using deferreds
             *
             * @param t
             */
            function (t) {


                var def = new Deferred();

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

                def.then(function (num) {
                    var _def = new Deferred();

                    setTimeout(function () {
                        _def.resolve(++num);
                    }, 10);

                    return _def;
                });

                def.resolve(1).then(function (nums) {
                    t.is(nums[0], -2, 'resolves deferred did not receive result of last then()');
                    t.is(nums[1], 2, 'resolves deferred did not receive result of last then()');
                });


            },

            /**
             * Ensure resolve.then() waits for any deferred returned by any previous then()
             *
             * @param t
             */
            function (t) {


                var def = new Deferred();

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
                });


            },

            /**
             * Ensure resolve.then() waits for any deferred returned by any previous then()
             *
             * @param t
             */
            function (t) {


                var def = new Deferred();

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
                });


            },

            /**
             * Ensure that our Deferred's resolve().then() receives the results of last queued listener
             */
            function (t) {


                var def = new Deferred();

                def.then(function (num) {
                    return ++num;
                });

                def.then(function (num) {
                    return --num;
                });

                def.resolve(1).then(function (nums) {
                    t.is(nums[0], 2, 'resolves deferred did not receive result of last then()');
                    t.is(nums[1], 0, 'resolves deferred did not receive result of last then()');
                });


            }



        ]);

    });
