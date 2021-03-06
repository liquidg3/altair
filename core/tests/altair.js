/**
 * Very simple altair and cartridge tests. Since all Altair does is load cartridges, we really
 * don't need to test much. =)
 */
define(['altair/test', 'altair/Altair', 'altair/Deferred'], function (test, Altair, Deferred) {

    test.register('altair', [
        /**
         * Make sure we can construct an Altair instance
         */
        function (t) {

            var a = new Altair();

            t.t(!!a, 'Altair instantiation failed');

        },

        /**
         * Make sure cartridges are setup and torn down properly
         */
        function (t) {

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
                    },
                    declaredClass: '/mock/mock'

                },
                a = new Altair();

            a.addCartridge(cartridge);

            t.t(setupCalled, 'setup not called on cartridge');
            t.t(executeCalled, 'execute not called on cartridge');
            t.f(teardownCalled, 'teardown should NOT be called on cartridge');

        },

        /**
         * Test that our altair/plugins/config can handle environments
         */
        function (t) {

            var deferred = new Deferred();

            require(['altair/plugins/config!core/tests/configs/env.json?env=dev'], function (config) {

                t.is('bar2', config.foo, 'Config inheritance did not work.');
                t.is('world', config.hello, 'Config inheritance did not work.');

                deferred.resolve();

            });

            return deferred;

        },

        /**
         * Test that our altair/plugins/config can handle environments
         */
        function (t) {

            var deferred = new test.Deferred();

            require(['altair/plugins/config!core/tests/configs/ref.json'], function (config) {

                t.is('world', config.options.hello, 'Config $ref resolution did not work.');
                deferred.resolve();
            });

            return deferred;

        }
    ]);


});