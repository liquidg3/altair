/**
 * These tests are for the events plugin for the module cartridge. It requires the Nexus and Module cartridges, as well
 * as a bunch of plugins I can't think of off the top of my head. see code below:
 *
 * Note, these tests are not setup 100% for doh, but more to how I *think* they should be setup (with deferred's and
 * promises notifying the pass/fail status of async requests)
 */

define(['doh/runner',
        'altair/cartridges/Foundry',
        'altair/facades/hitch',
        'altair/Altair',
        'dojo/Deferred'
],
function (doh,
          CartridgeFoundry,
          hitch,
          Altair,
          Deferred) {


    /**
     * Boot altair and then do something
     * @returns {dojo.tests._base.Deferred}
     */
    var boot = function (callback) {

        var deferred    = new doh.Deferred(),
            altair      = new Altair(),
            foundry     = new CartridgeFoundry(altair);

        foundry.build([
            {
                path: 'altair/cartridges/nexus/Nexus',
                options: {

                }
            },
            {
                path: 'altair/cartridges/module/Module',
                options: {
                    paths:      ['core/tests/modules/vendors', 'core/vendors'],
                    modules:    ['altair:MockWithEvents', 'altair:MockWithEvents2', 'altair:Events'],
                    plugins:    ['altair/cartridges/module/plugins/Nexus', 'altair/cartridges/module/plugins/Events']
                }
            }
        ]).then(function (cartridges) {

            altair.addCartridges(cartridges).then(function () {
                var d = callback(altair.cartridge('altair/cartridges/module/Module').modules);
                if(d) {
                    d.then(hitch(deferred, 'resolve')).otherwise(hitch(deferred, 'reject'));
                } else {
                    deferred.resolve();
                }
            }).otherwise(hitch(deferred, 'reject'));

        }).otherwise(hitch(deferred, 'reject'));


        return deferred;

    };


    doh.register('module-plugins-events', [

        /**
         * test events new style, reaching to another module, then getting that module and emitting an event
         */
        function (t) {

            return boot(function (modules) {

                var m   = modules[0],
                    d   = new Deferred(),
                    m2  = m.nexus('altair:MockWithEvents2');

                m.on('altair:MockWithEvents2::DOING_TEST').then(function (e) {
                    t.is(e.get('foo'), 'bar', 'Events through module.on failed');
                    d.resolve();
                }).otherwise(hitch(d, 'reject'));

                m2.emit('DOING_TEST', {
                    foo: 'bar'
                });

                return d;

            });

        },

        /**
         * Make sure that we can do the same thing as above, but only ever using 1 module.
         *
         * @returns {dojo.tests._base.Deferred}
         */
        function (t) {

            return boot(function (modules) {

                var m   = modules[0],
                    d   = new Deferred();

                m.on('altair:MockWithEvents2::DOING_TEST').then(function (e) {
                    t.assertEqual(e.get('foo'), 'bar', 'Events through module.on failed');
                    d.resolve();
                }).otherwise(hitch(d, 'reject'));

                m.emit('altair:MockWithEvents2::DOING_TEST', {
                    foo: 'bar'
                });

                return d;

            });

        },

        /**
         * Make sure event failure is handled properly
         *
         * @returns {dojo.tests._base.Deferred}
         */
        function (t) {

            return boot(function (modules) {

                var m   = modules[0],
                    d   = new Deferred();

                m.on('altair:MockWithtEvents2::DOING_TEST').then(function (e) {

                    d.reject('Should not have been called');

                }).otherwise(function (err) {

                    t.is(err, 'Could not on(altair:MockWithtEvents2::DOING_TEST) because it could not be found.');
                    d.resolve();

                });

                m.emit('altair:MockWithEvents2::DOING_TEST', {
                    foo: 'bar'
                });

                return d;

            });

        }

    ]);

});