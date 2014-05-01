define(['doh/runner',
        'altair/Lifecycle',
        'altair/Deferred',
        'altair/plugins/node!fs'],
    function (doh,
              Lifecycle,
              Deferred,
              fs) {

    /**
     * Dependencies
     */
    var options = {
        foo: 'bar'
    };


    doh.register('lifecycle', {

        "test constructing lifecycle": function (t) {

            var life = new Lifecycle();
            t.t(!!life);

        },

        "options set locally on lifecycle": function (t) {

            var life = new Lifecycle(options);

            t.is(options.foo, life.options.foo, 'options failed to pass through to lifecycle');

        },

        "make sure startup returns a deferred": function (t) {

            var life = new Lifecycle();

            return life.startup().then(function () {

                t.t(true, 'Lifecycle startup did not return a resolved deferred');
                t.t(!!life.deferred, 'Lifecycle cleared deferred too soon');

                var d = new Deferred();

                setTimeout(function () {
                    t.is(life.deferred, null, 'Lifecycle did not clear out resolved');
                    d.resolve(true);
                }, 10);


                return d;

            });

        },

        "lifecycle execute returns resolved deferred": function (t) {

            var life = new Lifecycle();

            return life.execute().then(function () {

                t.t(true, 'Lifecycle startup did not return a resolved deferred');
                t.t(!!life.deferred, 'Lifecycle cleared deferred too soon');

                var d = new Deferred();

                setTimeout(function () {
                    t.is(life.deferred, null, 'Lifecycle did not clear out resolved');
                    d.resolve(true);
                }, 10);

                return d;

            });
        },

        "lifecycle teardown returning resolved deferred": function (t) {

            var life        = new Lifecycle();

            return life.teardown().then(function () {

                t.t(true, 'Lifecycle startup did not return a resolved deferred');
                t.t(!!life.deferred, 'Lifecycle cleared deferred too soon');

                var d = new Deferred();

                setTimeout(function () {
                    t.is(life.deferred, null, 'Lifecycle did not clear out resolved');
                    d.resolve(true);
                }, 10);

                return d;

            });

        },

        "lifecycle promise works with object and string method name and 1 param": function (t) {

            var life        = new Lifecycle();

            return life.promise(fs, 'stat', require.toUrl('core/tests/')).then(function (results) {

                t.t(!!results.mode, 'lifecycle promise wrapper failed');
            });

        },

        "lifecycle promise works with function and 1 param": function (t) {

            var life        = new Lifecycle();

            return life.promise(require, ['core/tests/cartridges/Mock']).then(function (results) {

                t.t(!!results, 'lifecycle promise wrapper failed with require()');
            });

        }



    });


});
