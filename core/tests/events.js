/**
 * The event system in Altair (a unique combination of a traditional event system with a query engine twist) is wicked
 * powerful in practice. It actually makes events fun again!
 *
 */
define(['altair/test',
        'altair/events/Emitter',
        'altair/events/QueryAgent',
        'altair/events/Event',
        'altair/Deferred',
        'altair/facades/hitch'],

    function (test,
              Emitter,
              QueryAgent,
              Event,
              Deferred,
              hitch) {

    test.register('events', [

        /**
         * Make sure we can construct an Emitter instance
         */
        function () {
            var emitter = new Emitter();
            test.assertTrue(!!emitter, 'Instantiating emitter failed');

        },

        /**
         * Test instantiating event
         */
        function () {

            var event = new Event('taco', { foo:'bar' });

            test.assertTrue(!!event, 'Instantiating event failed');
            test.assertEqual('taco', event.name, 'Event name failed to set');
            test.assertEqual('bar', event.get('foo'), 'Event data failed to set');

        },

        /**
         * Query agent wants to test some queries
         */
        function () {

            var agent = new QueryAgent(),
                event = new Event('test', {
                    foo: 'bar',
                    cheesy: {
                        gordida: 'crunch',
                        crunch: {
                            tacos: "Ay Caramba"
                        }
                    }
                });

            test.assertTrue(agent.matches(event, {
                'foo': 'bar'
            }), 'Basic query agent match failed.');

            test.assertTrue(agent.matches(event, {
                'cheesy.gordida': 'crunch'
            }), 'Nested object query fail');

            test.assertTrue(agent.matches(event, {
                'cheesy.crunch.tacos': 'Ay Caramba'
            }), 'Triple Nested object query fail');

        },

        /**
         * Query agent testing some queries using getters. **THIS BEHAVIOR MAY CHANGE**
         */
        function (t) {

            var agent = new QueryAgent(),
                event = new Event('test', {
                    data: {
                        foo: 'bar',
                        cheesy: {
                            gordida: 'crunch'
                        }
                    },
                    get: function (key) {
                        return this.data[key];
                    }
                });

            t.t(agent.matches(event, {
                'foo': 'bar'
            }), 'Basic query agent match failed.');

            // @TODO Implement dot syntax for getters > QueryAgents.js
//            test.assertTrue(agent.matches(event, {
//                'cheesy.gordita': 'crunch'
//            }), 'Getter double query agent match failed.');

        },

        /**
         * No query, old style callback
         */
        function (t) {

            var emitter     = new Emitter();

            emitter.on('dummy-event', function (e) {
                t.is('dummy-event', e.name, 'Event was not created as expected.');
            });

            return emitter.emit('dummy-event', {
                foo: 'bar'
            });

        },

        /**
         * No query, new style (using a deferred)
         */
        function (t) {

            var emitter     = new Emitter();

            emitter.on('dummy-event-2').then(function (e) {
                t.is('dummy-event-2', e.name, 'Event was not created as expected.');
            });

            return emitter.emit('dummy-event-2', {
                foo: 'bar'
            });


        },

        /**
         * query old style
         */
        function (t) {

            var emitter     = new Emitter();

            emitter.on('dummy-event-3', function (e) {
                t.is('dummy-event-3', e.name, 'Event was not created as expected.');
            }, {
                foo: 'bar'
            });

            return emitter.emit('dummy-event-3', {
                foo: 'bar'
            });

        },

        /**
         * Query new style. This syntax is just so much more slick (ingoring the ugly getTestCallback())
         *
         * @returns {dojo.tests._base.Deferred}
         */
        function () {

            var emitter     = new Emitter();

            emitter.on('dummy-event-4', { foo: 'bar' }).then(function (e) {
                test.assertEqual('dummy-event-4', e.name, 'Event was not created as expected.');
            });

            return emitter.emit('dummy-event-4', {
                foo: 'bar'
            });

        },

        /**
         * Test that you can pause event emission from a listener temporarily
         *
         * @returns {dojo.tests._base.Deferred}
         */
        function () {

            var emitter     = new Emitter();

            emitter.on('dummy-event-4', { foo: 'bar' }).then(function (e) {

                test.assertEqual('dummy-event-4', e.name, 'Event was not created as expected.');

            });

            return emitter.emit('dummy-event-4', {
                foo: 'bar'
            });

        },

        /**
         * Make sure our emit's deferred will receive an array of the returned values from the listeners
         */
        function (t) {

            var emitter     = new Emitter();

            emitter.on('dummy-event-4').then(function (e) {

                return 1;

            });

            emitter.on('dummy-event-4').then(function (e) {

                return 2;

            });

            emitter.on('dummy-event-4').then(function (e) {

                return 2;

            }).then(function (two) {
                return two + 1;
            });


            emitter.on('dummy-event-4').then(function (e) {

                var d = new Deferred();

                setTimeout(function () {
                    d.resolve(4);
                }, 10);

                return d;
            });

            return emitter.emit('dummy-event-4', {
                foo: 'bar'
            }).then(function (e) {

                var results = e.results();

                t.is(results[0], 1, 'Event was not created as expected.');
                t.is(results[1], 2, 'Event was not created as expected.');
                t.is(results[2], 3, 'Event was not created as expected.');
                t.is(results[3], 4, 'Event was not created as expected.');


            });


        },

        /**
         * emitted events can be rejected
         */
        function (t) {


            var emitter     = new Emitter(),
                deferred    = new test.Deferred();

            emitter.on('dummy-event-4').then(function (e) {
                return 1;
            });

            emitter.on('dummy-event-4').then(function (e) {
                return 2;
            });

            emitter.on('dummy-event-4').then(function (e) {
                return 2;
            }).then(function (two) {
                return two + 1;
            });


            emitter.on('dummy-event-4').then(function (e) {

                var d = new Deferred();

                setTimeout(function () {
                    d.reject(4);
                }, 10);

                return d;
            });

            emitter.emit('dummy-event-4', {
                foo: 'bar'
            }).then(function (r) {
                deferred.reject();
            }).otherwise(function (e) {
                t.is(e, 4, 'event rejection failed to pass back value');
                deferred.resolve();
            });

            return deferred;

        },

        /**
         * Emitter doesn't double up results if i use addEventListener
         */
         function (t) {


            var emitter     = new Emitter(),
                deferred    = new test.Deferred();

            emitter.on('dummy-event-4', function (e) {
                return 'yay';
            });

            return emitter.emit('dummy-event-4', {
                foo: 'bar'
            }).then(function (e) {

                var results = e.results();

                t.t(results.length === 1, 'too many results gathered from event');
                t.is(results[0], 'yay');

            });

        },

        function (t) {

            var emitter     = new Emitter();

            emitter.on('dummy-event-4', function (e) {
                return 'yay';
            });

            emitter.on('dummy-event-4').then(function (e) {
                return 'hey';
            });


            emitter.on('dummy-event-4').then(function (e) {

                var d = new Deferred();

                setTimeout(function () {
                    d.resolve('stay');
                }, 10);

                return d;

            });


            return emitter.emit('dummy-event-4').then(function (e) {

                var results = e.results();

                t.t(results.length === 3, 'wrong amount of results gathered from event');
                t.is(results[0], 'yay');
                t.is(results[1], 'hey');
                t.is(results[2], 'stay');

            });

        }

    ]);

});
