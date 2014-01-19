define(['doh/runner', 'altair/Lifecycle', 'dojo/_base/lang'], function (doh, Lifecycle, lang) {

    /**
     * Dependencies
     */
    var options = {
        foo: 'bar'
    };


    doh.register('lifecycle', [

        /**
         * Make sure we can construct a CartridgeFactory instance
         */
        function () {

            var life = new Lifecycle();
            doh.assertTrue(!!life);

        },

        /**
         * Make sure lifecycle passes options through
         */
        function () {

            var life = new Lifecycle(options);

            doh.assertEqual(options.foo, life.options.foo, 'options failed to pass through to lifecycle');

        },
        /**
         * Make sure that startup returns a resolved deferred
         */
        function () {
            var life = new Lifecycle(),
                deferred = new doh.Deferred();

            life.startup().then(deferred.getTestCallback(function () {
                doh.assertTrue(true, 'LifeCycle Startup did not return a resolved deferred');
            }));

            return deferred;
        },

        /**
         * Make sure that execute returns a resolved deferred
         */
        function () {
            var life = new Lifecycle(),
                deferred = new doh.Deferred();

            life.execute().then(deferred.getTestCallback(function () {
                doh.assertTrue(true, 'LifeCycle Execute did not return a resolved deferred');
            }));

            return deferred;
        },

        /**
         * Make sure that teardown returns a resolved deferred
         */
        function () {
            var life = new Lifecycle(),
                deferred = new doh.Deferred();

            life.teardown().then(deferred.getTestCallback(function () {
                doh.assertTrue(true, 'LifeCycle Execute did not return a resolved deferred');
            }));

            return deferred;
        }

    ]);


});
