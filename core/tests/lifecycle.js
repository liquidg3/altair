define(['doh/runner', 'altair/Lifecycle', 'dojo/_base/lang'], function (runner, Lifecycle, lang) {

    /**
     * Dependencies
     */
    var options = {
        foo: 'bar'
    };



    /**
     * Make sure we can construct a CartridgeFactory instance
     */
    runner.register('lifecycle-construct',
        function () {

            var life = new Lifecycle();
            runner.assertTrue(!!life);

        }
    );

    runner.register('lifecycle-deferreds',
        function () {

            var life = new Lifecycle(options);

            this.assertEqual(options.foo, life.foo, 'options failed to pass through to lifecycle');



        }
    );


});