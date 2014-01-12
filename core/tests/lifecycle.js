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


        }
    ]);


});