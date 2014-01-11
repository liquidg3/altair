define(['doh/runner', 'altair/Lifecycle', 'dojo/_base/lang'], function (doh, Lifecycle, lang) {

    /**
     * Dependencies
     */
    var options = {
        foo: 'bar'
    };



    /**
     * Make sure we can construct a CartridgeFactory instance
     */
    doh.register('lifecycle-construct',
        function () {

            var life = new Lifecycle();
            doh.assertTrue(!!life);

        }
    );

    doh.register('lifecycle-deferreds',
        function () {

            var life = new Lifecycle(options);

            doh.assertEqual(options.foo, life.options.foo, 'options failed to pass through to lifecycle');



        }
    );


});