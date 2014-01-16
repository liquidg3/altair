define(['doh/runner',
        'altair/events/Emitter',
        'altair/events/QueryAgent',
        'altair/events/Event',
        'dojo/_base/lang'], function (doh,
                                      Emitter,
                                      QueryAgent,
                                      Event,
                                      lang) {

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
         * Query agent test some queries
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
         * Query agent test some queries using getters
         */
        function () {

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

            doh.assertTrue(agent.matches(event, {
                'foo': 'bar'
            }), 'Basic query agent match failed.');

            // @TODO Implement dot syntax for getters > QueryAgents.js
//            doh.assertTrue(agent.matches(event, {
//                'cheesy.gordita': 'crunch'
//            }), 'Getter double query agent match failed.');

        },

        /**
         * no query old style
         */
        function () {

            var emitter     = new Emitter(),
                deferred    = new doh.Deferred()

            emitter.on('dummy-event', deferred.getTestCallback(function (e) {
                doh.assertEqual('dummy-event', e.name, 'Event was not created as expected.');
            }));

            emitter.emit('dummy-event', {
                foo: 'bar'
            });

            return deferred;

        },

        /**
         * no query new style
         */
        function () {

            var emitter     = new Emitter(),
                deferred    = new doh.Deferred()

            emitter.on('dummy-event-2').then(deferred.getTestCallback(function (e) {
                doh.assertEqual('dummy-event-2', e.name, 'Event was not created as expected.');
            }));

            emitter.emit('dummy-event-2', {
                foo: 'bar'
            });

            return deferred;

        },

        /**
         * query old style
         */
        function () {

            var emitter     = new Emitter(),
                deferred    = new doh.Deferred();

            emitter.on('dummy-event-3', deferred.getTestCallback(function (e) {
                doh.assertEqual('dummy-event-3', e.name, 'Event was not created as expected.');
            }), {
                foo: 'bar'
            });

            emitter.emit('dummy-event-3', {
                foo: 'bar'
            });

            return deferred;

        },

        /**
         * Query new style
         *
         * @returns {dojo.tests._base.Deferred}
         */
        function () {

            var emitter     = new Emitter(),
                deferred    = new doh.Deferred()

            emitter.on('dummy-event-4', { foo: 'bar' }).then(deferred.getTestCallback(function (e) {
                doh.assertEqual('dummy-event-4', e.name, 'Event was not created as expected.');
            }));

            emitter.emit('dummy-event-4', {
                foo: 'bar'
            });

            return deferred;

        }

    ]);

});
