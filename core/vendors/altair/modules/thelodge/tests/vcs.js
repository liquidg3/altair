define(['doh/runner',
        'altair/StateMachine',
        'altair/Deferred',
        'core/tests/support/boot',
        'altair/facades/hitch',
        'altair/plugins/node!rimraf',
        'altair/plugins/node!mkdirp',
        'altair/plugins/node!os',
        'altair/plugins/node!fs',
        'altair/plugins/config!./configs/cartridges'
    ],
    function (doh,
              StateMachine,
              Deferred,
              boot,
              hitch,
              rimraf,
              mkdirp,
              os,
              fs,
              cartridges) {

        "use strict";

         var testRepo  = {
                type:   'git',
                url:    'git@github.com:liquidg3/altair-test-clone.git'
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

                            git.clone({
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

                            git.clone({
                                url:            testRepo.url,
                                destination:    destination,
                                version:        '0.0.2'
                            }).then(function(results) {

                                t.is(results, destination, 'clone failed');

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
            },

            {
                name:    "test checking out a specific version, then run update bring to latest version",
                setUp:   function () {
                    rimraf.sync(destination);
                    mkdirp.sync(destination);
                },
                runTest: function (t) {

                    var d = new Deferred();

                    boot.nexus(cartridges).then(function (nexus) {

                        nexus('Altair:TheLodge').vcs(testRepo.type).then(function (git) {

                            git.clone({
                                url:            testRepo.url,
                                destination:    destination,
                                version:        '0.0.2'
                            }).then(function(results) {

                                t.is(results, destination, 'clone failed');

                                fs.readFile(results + '/package.json', function (err, contents) {

                                    if(err) {
                                        d.reject(err);
                                        return;
                                    }

                                    var config = JSON.parse(contents.toString());
                                    t.is(config.version, '0.0.2', 'version failed');

                                    //do a full update (should take us to newest version)
                                    git.update({
                                        destination: destination
                                    }).then(function (results) {

                                        fs.readFile(results + '/package.json', function (err, contents) {

                                            if(err) {
                                                d.reject(err);
                                                return;
                                            }

                                            var config = JSON.parse(contents.toString());
                                            t.is(config.version, '0.0.4', 'version failed');

                                            d.resolve();

                                        });

                                    }).otherwise(hitch(d, 'reject'));

                                });

                            }).otherwise(hitch(d, 'reject'));

                        });


                    }).otherwise(hitch(d, 'reject'));

                    return d;
                }
            }
        ]);


    });