define(['doh/runner',
        'altair/StateMachine',
        'altair/Deferred',
        'core/tests/support/boot',
        'altair/facades/hitch',
        'require',
        'altair/plugins/config!./configs/cartridges',
        'altair/plugins/config!./configs/menu'
    ],
    function (doh,
              StateMachine,
              Deferred,
              boot,
              hitch,
              require,
              cartridges,
              testMenu) {

        "use strict";

        var testModulePath  = 'core/vendors/altair/modules/thelodge/tests/module',
            testModule1     = testModulePath + '/testmodule';

        doh.register('thelodge.installers', {

//            "test registered installers": function (t) {
//
//                //boot altair
//                return boot.nexus(cartridges).then(function (nexus) {
//
//                    //refresh installers
//                    return nexus('altair:TheLodge').refreshInstallers();
//
//                }).then(function (installers) {
//
//                    t.t(!!installers.modules, 'The lodge failed to register the module installer.');
//
//                });
//            },
//
//            "test installing module": function (t) {
//
//                //boot altair
//                return boot.nexus(cartridges, { paths: { test: 'test' } }).then(function (nexus) {
//
//                    //refresh installers
//                    return nexus('altair:TheLodge').refreshInstallers();
//
//                }).then(function (installers) {
//
//                    return installers.modules.install(testModule1, 'test');
//
//                }).then(function (modules) {
//
//                    t.is(modules.length, 1, 'module installer did not create the proper amount of modules');
//
//                });
//            }

        });


    });