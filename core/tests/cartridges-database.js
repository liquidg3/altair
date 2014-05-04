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
                                connectionString: "mongodb://localhost/altair_tests"
                            }
                        }
                    ]
                }
            }
        ];



        doh.register('extensions-database', {

            "test connecting to one mongodb database": function (t) {

                return boot.nexus(cartridges).then(function (nexus) {

                    var database  = nexus('cartridges/Database'),
                        mongo     = database.connection('mongo1');

                    t.is(mongo.alias, 'mongo1', 'connecting to mongo and getting by alias failed.');

                });

            },

            "test creating record through cartridge": function (t) {

                return boot.nexus(cartridges).then(function (nexus) {

                    var database  = nexus('cartridges/Database');

                    return database.create('test_collection').set({
                        foo: 'bar',
                        firstName: 'tay',
                        lastName: 'ro'
                    }).execute();


                }).then(function (document) {
                    t.is(document.firstName, 'tay', 'document save fail');
                });

            },

            "test creating many records through cartridge": function (t) {

                return boot.nexus(cartridges).then(function (nexus) {

                    var database  = nexus('cartridges/Database');

                    return database.createMany('test_collection').set([
                        {
                            foo: 'bar',
                            firstName: 'tay',
                            lastName: 'ro'
                        },
                        {
                            foo: 'bar',
                            bravo: 'bar'
                        }
                    ]).execute();


                }).then(function (documents) {
                    t.is(documents[0].firstName, 'tay', 'document save fail');
                    t.is(documents[1].bravo, 'bar', 'document save fail');
                });

            },

            "test deleting record through cartridge": function (t) {

                var database;

                return boot.nexus(cartridges).then(function (nexus) {

                    database  = nexus('cartridges/Database');

                    return database.create('test_collection').set({
                        foo: 'bar',
                        firstName: 'tay',
                        lastName: 'ro'
                    }).execute();


                }).then(function (document) {

                    return database.delete('test_collection').where('foo', '==', 'bar').execute();

                }).then(function (results) {
                    t.t(results > 0, 'no records where deleted');
                });

            },


            "test deleting record with complex where clause through cartridge": function (t) {

                var database;

                return boot.nexus(cartridges).then(function (nexus) {

                    database  = nexus('cartridges/Database');

                    //start by cleaning out the collection
                    return database.delete('test_collection').execute();

                }).then(function (totalDeleted) {

                    return database.createMany('test_collection').set([
                        {
                            foo: 'bar',
                            firstName: 'tay',
                            lastName: 'ro',
                            age:      10
                        },
                        {
                            foo: 'bar',
                            bravo: 'bar',
                            age: 20
                        }
                    ]).execute();


                }).then(function (documents) {

                    return database.delete('test_collection').where('age', '>', 5).and().where('age', '<', 20).execute();

                }).then(function (totalDeleted) {

                    t.is(totalDeleted, 1, 'no records where deleted');

                    return database.delete('test_collection').where('age', '>', 20).or().where('age', '<', 10).execute();

                }).then(function (totalDeleted) {

                    t.is(totalDeleted, 0, 'too many records were deleted');

                    return database.delete('test_collection').where('age', '>', 10).or().where('age', '<', 30).execute();

                }).then(function (totalDeleted) {

                    t.is(totalDeleted, 1, 'no records where deleted');

                });

            },

            "test updating record through cartridge": function (t) {

                var database, _id;

                return boot.nexus(cartridges).then(function (nexus) {

                    database  = nexus('cartridges/Database');

                    //start by cleaning out the collection
                    return database.delete('test_collection').execute();

                }).then(function () {

                    return database.create('test_collection').set({
                        foo: 'bar',
                        firstName: 'tay',
                        lastName: 'ro'
                    }).execute();


                }).then(function (document) {

                    _id = document._id;

                    return database.find('test_collection').where('foo', '==', 'bar').execute();

                }).then(function (cursor) {

                    return cursor.count();

                }).then(function (count) {

                    t.is(1, count, 'record count missmatch');

                    //update the record
                    return database.update('test_collection').set('firstName', 'taytay').where('foo', '==', 'bar').execute();

                }).then(function (totalUpdated) {

                    t.is(1, totalUpdated, 'record update missmatch');

                    return database.findOne('test_collection').where('foo', '==', 'bar').execute();

                }).then(function (doc) {

                    t.is(doc.firstName, 'taytay', 'update failed');

                    //cleanup
                    return database.delete('test_collection').execute();
                });

            },

            "test counting records through cartridge": function (t) {

                var database;

                return boot.nexus(cartridges).then(function (nexus) {

                    database  = nexus('cartridges/Database');

                    //start by cleaning out the collection
                    return database.delete('test_collection').execute();

                }).then(function (totalDeleted) {

                    return database.createMany('test_collection').set([
                        {
                            foo: 'bar',
                            firstName: 'tay',
                            lastName: 'ro',
                            age:      10
                        },
                        {
                            foo: 'bar',
                            bravo: 'bar',
                            age: 20
                        }
                    ]).execute();


                }).then(function (documents) {

                    return database.count('test_collection').where('age', '>', 5).and().where('age', '<', 20).execute();

                }).then(function (count) {

                    t.is(count, 1, 'count failed');

                    return database.delete('test_collection').execute();

                });

            }


        });


    });