/**
 * The event system in Altair (a unique combination of a traditional event system with a query engine twist) is wicked
 * powerful in practice. It actually makes events fun again!
 *
 */
define(['doh/runner',
        'altair/events/Emitter',
        'altair/events/QueryAgent',
        'altair/events/Event',
        'dojo/Deferred',
        'altair/facades/hitch'],

    function (doh,
              Emitter,
              QueryAgent,
              Event,
              Deferred,
              hitch) {

    doh.register('events', [

        /**
         * Make sure we can construct an Emitter instance
         */
        function () {
            var emitter = new Emitter();
            doh.assertTrue(!!emitter, 'Instantiating emitter failed');

        },

        /**
         * Test instantiating event
         */
        function () {

            var event = new Event('taco', { foo:'bar' });

            doh.assertTrue(!!event, 'Instantiating event failed');
            doh.assertEqual('taco', event.name, 'Event name failed to set');
            doh.assertEqual('bar', event.get('foo'), 'Event data failed to set');

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

            doh.assertTrue(agent.matches(event, {
                'foo': 'bar'
            }), 'Basic query agent match failed.');

            doh.assertTrue(agent.matches(event, {
                'cheesy.gordida': 'crunch'
            }), 'Nested object query fail');

            doh.assertTrue(agent.matches(event, {
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
//            doh.assertTrue(agent.matches(event, {
//                'cheesy.gordita': 'crunch'
//            }), 'Getter double query agent match failed.');

        },

        /**
         * No query, old style callback
         */
        function (t) {

            var emitter     = new Emitter(),
                deferred    = new Deferred()

            emitter.on('dummy-event', function (e) {
                t.is('dummy-event', e.name, 'Event was not created as expected.');
                deferred.resolve(true);
            });

            emitter.emit('dummy-event', {
                foo: 'bar'
            });

            return deferred;

        },

        /**
         * No query, new style (using a deferred)
         */
        function (t) {

            var emitter     = new Emitter(),
                deferred    = new doh.Deferred()

            emitter.on('dummy-event-2').then(function (e) {
                t.is('dummy-event-2', e.name, 'Event was not created as expected.');
                deferred.resolve(true);
            });

            emitter.emit('dummy-event-2', {
                foo: 'bar'
            });

            return deferred;

        },

        /**
         * query old style
         */
        function (t) {

            var emitter     = new Emitter(),
                deferred    = new doh.Deferred();

            emitter.on('dummy-event-3', function (e) {
                t.is('dummy-event-3', e.name, 'Event was not created as expected.');
                deferred.resolve(true);
            }, {
                foo: 'bar'
            });

            emitter.emit('dummy-event-3', {
                foo: 'bar'
            });

            return deferred;

        },

        /**
         * Query new style. This syntax is just so much more slick (ingoring the ugly getTestCallback())
         *
         * @returns {dojo.tests._base.Deferred}
         */
        function () {

            var emitter     = new Emitter(),
                deferred    = new doh.Deferred()

            emitter.on('dummy-event-4', { foo: 'bar' }).then(function (e) {
                doh.assertEqual('dummy-event-4', e.name, 'Event was not created as expected.');
                deferred.resolve();
            });

            emitter.emit('dummy-event-4', {
                foo: 'bar'
            });

            return deferred;

        },

        /**
         * Test that you can pause event emission from a listener temporarily
         *
         * @returns {dojo.tests._base.Deferred}
         */
        function () {

            var emitter     = new Emitter(),
                deferred    = new doh.Deferred();

            emitter.on('dummy-event-4', { foo: 'bar' }).then(function (e) {

                doh.assertEqual('dummy-event-4', e.name, 'Event was not created as expected.');
                deferred.resolve();

            });

            emitter.emit('dummy-event-4', {
                foo: 'bar'
            });

            return deferred;

        },

        /**
         * Make sure our emit's deferred will receive an array of the returned values from the listeners
         */
        function (t) {


            var emitter     = new Emitter(),
                deferred    = new doh.Deferred();

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

            emitter.emit('dummy-event-4', {
                foo: 'bar'
            }).then(function (results) {


                t.is(results[0], 1, 'Event was not created as expected.');
                t.is(results[1], 2, 'Event was not created as expected.');
                t.is(results[2], 3, 'Event was not created as expected.');
                t.is(results[3], 4, 'Event was not created as expected.');

                deferred.resolve();

            });

            return deferred;


        }

    ]);

});
