/**
 * Allow us to run some nexus tests
 */

define(['doh/runner',
    'core/tests/support/boot'],

    function (doh,
              boot) {

        var cartridges = [
            {
                path: 'altair/cartridges/nexus/Nexus',
                options: {

                }
            },
            {
                path: 'altair/cartridges/database/Database',
                options: {
                    connections: [
                        {
                            path: "altair/cartridges/database/adapters/Mongodb",
                            options: {
                                alias: "mongo1",
                                "connectionString": "mongodb://localhost/altair_tests"
                            }
                        }
                    ]
                }
            }
        ];



        doh.register('extensions-database-connect', {

            "test connecting to one mongodb database": function (t) {

                return boot.nexus(cartridges).then(function (nexus) {

                    var database  = nexus('cartridges/Database'),
                        mongo     = database.connection('mongo1');

                    t.is(mongo.alias, 'mongo1', 'connecting to mongo and getting by alias failed.');

                });

            },

            "test creating record through cartridge": function (t) {

                return boot.nexus(cartridges).then(function (nexus) {

                    var database  = nexus('cartridges/Database')q

                    t.is(mongo.alias, 'mongo1', 'connecting to mongo and getting by alias failed.');

                });

            }


        });


    });