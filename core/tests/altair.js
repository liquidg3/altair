/**
 * Very simple altair and cartridge tests. Since all Altair does is load cartridges, we really
 * don't need to test much. =)
 */
define(['doh/runner', 'altair/Altair', 'dojo/Deferred'], function (doh, Altair, Deferred) {

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
                executeCalled   = false,
                cartridge = {

                    startup: function () {
                        setupCalled = true;
                        var deferred = new Deferred();
                        deferred.resolve(this);
                        return deferred;
                    },

                    execute: function () {
                        executeCalled = true;
                        var deferred = new Deferred();
                        deferred.resolve(this);
                        return deferred;
                    },

                    teardown: function () {
                        teardownCalled = true;
                        var deferred = new Deferred();
                        deferred.resolve(this);
                        return deferred;
                    }

                },
                a = new Altair();

            a.addCartridge(cartridge);

            doh.assertTrue(setupCalled, 'setup not called on cartridge');
            doh.assertTrue(executeCalled, 'execute not called on cartridge');
            doh.assertFalse(teardownCalled, 'teardown should NOT be called on cartridge');

        }
    ]);


});