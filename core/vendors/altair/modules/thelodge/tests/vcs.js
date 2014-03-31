define(['doh/runner',
        'altair/StateMachine',
        'altair/Deferred',
        'core/tests/support/boot',
        'altair/facades/hitch',
        'altair/plugins/node!rimraf',
        'altair/plugins/node!mkdirp',
        'altair/plugins/node!os',
        'altair/plugins/node!fs'
    ],
    function (doh,
              StateMachine,
              Deferred,
              boot,
              hitch,
              rimraf,
              mkdirp,
              os,
              fs) {

        "use strict";

        //boot config
        var cartridges = [
            {
                "path": "altair/cartridges/nexus/Nexus",
                "options": {
                }
            },
            {
                "path": "altair/cartridges/apollo/Apollo",
                "options": {
                }
            },
            {
                "path": "altair/cartridges/module/Module",
                "options": {
                    "plugins": [
                        "altair/cartridges/module/plugins/Paths",
                        "altair/cartridges/module/plugins/Config",
                        "altair/cartridges/module/plugins/Package",
                        "altair/cartridges/module/plugins/Deferred",
                        "altair/cartridges/module/plugins/Apollo",
                        "altair/cartridges/module/plugins/Nexus",
                        "altair/cartridges/module/plugins/Events",
                        "altair/cartridges/module/plugins/Foundry"
                    ],
                    paths:      ['core/vendors'],
                    "modules":  ['altair:Events', 'altair:CommandCentral', 'altair:Adapters', 'altair:TheLodge'],
                    "moduleOptions": {
                        "altair:CommandCentral": {
                            "autostart": false
                        }
                    }
                }
            }
            ],
            testRepo  = {
                type:   'git',
                url:    'git@github.com:liquidg3/altair-test-checkout.git'
            },
            destination = os.tmpdir() + 'thelodge';

        doh.register('thelodge.vcs',[

            {
                name:    "test checkout test git repo",
                setUp:   function () {
                    rimraf.sync(destination);
                    mkdirp.sync(destination);
                },
                runTest: function (t) {

                    var d = new Deferred();

                    boot.nexus(cartridges).then(function (nexus) {

                        nexus('Altair:TheLodge').vcs(testRepo.type).then(function (git) {

                            git.checkout({
                                url:            testRepo.url,
                                destination:    destination
                            }).then(function(results) {
                                t.is(results, destination, 'checkout failed');
                                d.resolve();
                            }).otherwise(hitch(d, 'reject'));

                        });


                    }).otherwise(hitch(d, 'reject'));

                    return d;
                }
            },

            {
                name:    "test checking out a specific version",
                setUp:   function () {
                    rimraf.sync(destination);
                    mkdirp.sync(destination);
                },
                runTest: function (t) {

                    var d = new Deferred();

                    boot.nexus(cartridges).then(function (nexus) {

                        nexus('Altair:TheLodge').vcs(testRepo.type).then(function (git) {

                            git.checkout({
                                url:            testRepo.url,
                                destination:    destination,
                                version:        '0.0.2'
                            }).then(function(results) {

                                t.is(results, destination, 'checkout failed');

                                fs.readFile(results + '/package.json', function (err, contents) {
                                    var config = JSON.parse(contents.toString());
                                    t.is(config.version, '0.0.2', 'version failed');
                                    d.resolve();
                                });

                            }).otherwise(hitch(d, 'reject'));

                        });


                    }).otherwise(hitch(d, 'reject'));

                    return d;
                }
            }
        ]);


    });