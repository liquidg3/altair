define(['doh/runner', 'altair/Altair', 'dojo/_base/declare'], function (doh, Altair, declare) {

    /**
     * Make sure we can construct an Altair instance
     */
    doh.register('altair-construct',
        function () {

            var a = new Altair();

            doh.assertTrue(!!a, 'Altair instantiation failed');

        }
    );

    /**
     * Make sure cartridges are setup and torn down properly
     */
    doh.register('altair-cartridge',
        function () {

            var setupCalled = false,
                teardownCalled = false,
                cartridge = {

                    startup: function () {
                        setupCalled = true;
                    },
                    teardown: function () {
                        teardownCalled = true;
                    }

                },
                a = new Altair();

            a.startup();
            a.addCartridge('dummy', cartridge);

            doh.assertTrue(setupCalled, 'setup not called on cartridge');
            doh.assertTrue(teardownCalled, 'teardown not called on cartridge');


        });

    //run tests, logging everything to console
    doh.debug = console.log;
    doh.run();

});