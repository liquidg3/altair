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
        'dojo/Deferred',
        'core/tests/support/boot'
    ],
    function (doh, CartridgeFoundry, hitch, Altair, Deferred, boot) {


        var cartridges = [
            {
                path: 'altair/cartridges/nexus/Nexus',
                options: {

                }
            },
            {
                path: 'altair/cartridges/extension/Extension',
                options: {
                    extensions: [
                        'altair/cartridges/extension/extensions/Nexus',
                        'altair/cartridges/extension/extensions/Events'
                    ]
                }
            },
            {
                path: 'altair/cartridges/module/Module',
                options: {
                    paths: ['core/tests/modules/vendors', 'core/vendors'],
                    modules: ['altair:MockWithEvents', 'altair:MockWithEvents2', 'altair:Events']
                }
            }
        ];

        doh.register('extensions-events', {

             "promise based events with nexus resolver": function (t) {

                return boot.nexus(cartridges, function (nexus) {

                    var m = nexus('altair:MockeWithEvents'),
                        d = new Deferred(),
                        m2 = nexus('altair:MockWithEvents2');

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

             "promise based event with nexus resolver on self": function (t) {

                return boot.nexus(cartridges,function (modules) {

                    var m = modules[0],
                        d = new Deferred();

                    m.on('altair:MockWithEvents2::DOING_TEST').then(function (e) {
                        t.assertEqual(e.get('foo'), 'bar', 'Events through module.on failed');
                        d.resolve();
                    });

                    return m.emit('altair:MockWithEvents2::DOING_TEST', {
                        foo: 'bar'
                    });

                    return d;

                });

            },

            "listening on missing module gracefully handles errors": function (t) {

                return boot.nexus(cartridges, function (modules) {

                    var m = modules[0],
                        d = new Deferred();

                    m.on('altair:MockWithtEvents2::DOING_TEST').then(function (e) {

                        d.reject('Should not have been called');

                    }).otherwise(function (err) {

                        t.is(err, 'Could not execute on(altair:MockWithtEvents2::DOING_TEST) because it could not be found.');
                        d.resolve();

                    });

                    m.emit('altair:MockWithEvents2::DOING_TEST', {
                        foo: 'bar'
                    });

                    return d;

                });

            }

        });

    });