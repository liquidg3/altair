require('../bootstrap-test.js');
console.log(require.nodeRequire);

exports.startupAndTeardown = function () {

    require('altair/Altair', function (Altair) {

        var altair = new Altair();
        console.log(altair);

//        altair.startup().go().then(lang.hitch(altair, 'teardown'));

    });
//

};