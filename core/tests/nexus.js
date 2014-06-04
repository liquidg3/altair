define(['altair/test',
        'altair/cartridges/nexus/Nexus',
        'dojo/_base/lang',
        'altair/Altair'],
                            function (test,
                                      Nexus,
                                      lang,
                                      Altair) {

    /**
     * Dependencies
     */
    var resolver = {
        foo: "bar",

        /**
         * Should match anything with "test" in the key
         *
         * @param key
         * @returns {*|Array|{index: number, input: string}}
         */
        handles: function (key) {
            return key.match(/test/);
        },

        /**
         * Just returns the value of foo
         *
         * @returns {*}
         */
        resolve: function (key) {
            return this.foo;
        }

    };

    test.register('nexus', [

        /**
         * Make sure we can construct a Nexus instance
         */
        function () {

            var altair  = new Altair(),
                nexus   = new Nexus(altair);

            test.assertTrue(!!nexus);

        },

        /**
         * Test basic set/get
         */
        function () {

            var altair  = new Altair(),
                nexus   = new Nexus(altair);

            nexus.set('foo', 'bar');

            test.assertEqual('bar', nexus.resolve('foo'), 'Basic Nexus set/get failed.');

        },

        /**
         * Test the resolver can resolve some basics
         */
        function () {

            var altair  = new Altair(),
                nexus   = new Nexus(altair);

            nexus.addResolver(resolver);

            test.assertEqual('bar', nexus.resolve('test'), 'Resolver failed to resolve.');

        }
    ]);



});