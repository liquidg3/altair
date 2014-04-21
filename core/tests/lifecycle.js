define(['doh/runner',
        'altair/Lifecycle',
        'dojo/_base/lang'],
    function (doh,
              Lifecycle,
              lang) {

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

            var life = new Lifecycle(),
                deferred = new doh.Deferred();

            life.startup().then(function () {

                t.t(true, 'Lifecycle startup did not return a resolved deferred');
                t.t(!!life.deferred, 'Lifecycle cleared deferred too soon');

                setTimeout(function () {
                    t.is(life.deferred, null, 'Lifecycle did not clear out resolved');
                    deferred.resolve(true);
                }, 10);

            });

            return deferred;
        },

        "lifecycle execute returns seloved deferred": function (t) {

            var life = new Lifecycle(),
                deferred = new doh.Deferred();

            life.execute().then(function () {

                t.t(true, 'Lifecycle startup did not return a resolved deferred');
                t.t(!!life.deferred, 'Lifecycle cleared deferred too soon');

                setTimeout(function () {
                    t.is(life.deferred, null, 'Lifecycle did not clear out resolved');
                    deferred.resolve(true);
                }, 10);

            });

            return deferred;
        },

        "lifecycle teardown returning resolved deferred": function (t) {

            var life        = new Lifecycle(),
                deferred    = new doh.Deferred();

            life.teardown().then(function () {

                t.t(true, 'Lifecycle startup did not return a resolved deferred');
                t.t(!!life.deferred, 'Lifecycle cleared deferred too soon');

                setTimeout(function () {
                    t.is(life.deferred, null, 'Lifecycle did not clear out resolved');
                    deferred.resolve(true);
                }, 10);

            });

            return deferred;
        }

    });


});
