define(['doh/runner', 'altair/cartridges/nexus/Nexus', 'dojo/_base/lang'], function (doh, Nexus, lang) {

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

    doh.register('nexus', [

        /**
         * Make sure we can construct a Nexus instance
         */
        function () {

            var nexus = new Nexus();
            doh.assertTrue(!!nexus);

        },

        /**
         * Test basic set/get
         */
        function () {

            var nexus = new Nexus();
            nexus.set('foo', 'bar');

            doh.assertEqual('bar', nexus.resolve('foo'), 'Basic Nexus set/get failed.');

        },

        /**
         * Test the resolver can resolve some basics
         */
        function () {

            var nexus = new Nexus();
            nexus.addResolver(resolver);

            doh.assertEqual('bar', nexus.resolve('test'), 'Resolver failed to resolve.');

        }
    ]);



});