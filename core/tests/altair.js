define(['doh/runner', 'altair/Altair'], function (doh, Altair) {

    doh.register('altair', [
        /**
         * Make sure we can construct an Altair instance
         */
        function () {

            var a = new Altair();

            doh.assertTrue(!!a, 'Altair instantiation failed');

        },

        /**
         * Make sure cartridges are setup and torn down properly
         */
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

            a.addCartridge(cartridge);

            doh.assertTrue(setupCalled, 'setup not called on cartridge');
            doh.assertFalse(teardownCalled, 'teardown should not called on cartridge');

        }
    ]);


});