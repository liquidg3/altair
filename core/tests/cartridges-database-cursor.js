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

            "test counting on cursor": function (t) {

                var database;

                return boot.nexus(cartridges).then(function (nexus) {

                    database  = nexus('cartridges/Database');

                    //clean out collection
                    return database.delete('test_collection').execute();

                }).then(function () {


                    return database.createMany('test_collection').set([
                        {
                            foo: 'bar',
                            firstName: 'tay',
                            lastName: 'ro'
                        },
                        {
                            foo: 'bar2',
                            firstName: 'tay2',
                            lastName: 'ro2'
                        }
                    ]).execute();


                }).then(function (document) {

                    return database.find('test_collection').execute();

                }).then(function (cursor) {

                    return cursor.count();

                }).then(function (count) {

                    t.is(2, count, 'count on cursor failed');

                    return database.teardown();


                });

            },

            "test next on cursor with and w/out foundry": function (t) {

                var database, cursor;

                return boot.nexus(cartridges).then(function (nexus) {

                    database  = nexus('cartridges/Database');

                    //clean out collection
                    return database.delete('test_collection').execute();

                }).then(function () {


                    return database.createMany('test_collection').set([
                        {
                            foo: 'bar',
                            firstName: 'tay',
                            lastName: 'ro'
                        },
                        {
                            foo: 'bar2',
                            firstName: 'tay2',
                            lastName: 'ro2'
                        }
                    ]).execute();


                }).then(function (document) {

                    return database.find('test_collection').execute();

                }).then(function (_cursor) {

                    cursor = _cursor;

                    return cursor.next();

                }).then(function (document) {

                    t.is('tay', document.firstName, 'cursor.next() failed to return a document');

                    //test setting foundry
                    cursor.foundry = function (record, cursor) {

                        record.foo += '2';

                        return record;

                    };

                    return cursor.next();

                }).then(function (record) {

                    t.is('bar22', record.foo, 'cursor.next() with foundry failed');

                    return database.teardown();

                });

            },

            "test toArray on cursor with and w/out foundry": function (t) {

                var database, cursor;

                return boot.nexus(cartridges).then(function (nexus) {

                    database  = nexus('cartridges/Database');

                    //clean out collection
                    return database.delete('test_collection').execute();

                }).then(function () {


                    return database.createMany('test_collection').set([
                        {
                            foo: 'bar',
                            firstName: 'tay',
                            lastName: 'ro'
                        },
                        {
                            foo: 'bar2',
                            firstName: 'tay2',
                            lastName: 'ro2'
                        }
                    ]).execute();


                }).then(function () {

                    return database.find('test_collection').execute();

                }).then(function (_cursor) {

                    cursor = _cursor;

                    return cursor.toArray();

                }).then(function (records) {

                    t.is('tay', records[0].firstName, 'cursor.toArray() failed to return a document');
                    t.is('tay2', records[1].firstName, 'cursor.toArray() failed to return a document');

                    return database.find('test_collection').execute();


                }).then(function (cursor) {

                    //test setting foundry
                    cursor.foundry = function (record, cursor) {

                        record.foo += '2';

                        return record;

                    };

                    return cursor.toArray();


                }).then(function (records) {

                    t.is('bar2', records[0].foo, 'cursor.next() with foundry failed');
                    t.is('bar22', records[1].foo, 'cursor.next() with foundry failed');

                    return database.teardown();

                });

            },

            "test each on cursor with and w/out foundry": function (t) {

                var database, cursor, found1st, found2nd;

                return boot.nexus(cartridges).then(function (nexus) {

                    database  = nexus('cartridges/Database');

                    //clean out collection
                    return database.delete('test_collection').execute();

                }).then(function () {


                    return database.createMany('test_collection').set([
                        {
                            foo: 'bar',
                            firstName: 'tay',
                            lastName: 'ro'
                        },
                        {
                            foo: 'bar2',
                            firstName: 'tay2',
                            lastName: 'ro2'
                        }
                    ]).execute();


                }).then(function () {

                    return database.find('test_collection').execute();

                }).then(function (_cursor) {

                    cursor = _cursor;

                    return cursor.each().step(function (document) {

                        if(document.firstName === 'tay') {
                            found1st = true;
                        } else if(document.firstName === 'tay2') {
                            found2nd = true;
                        }

                    });

                }).then(function (count) {

                    t.is(2, count, 'cursor.each() didn\'t iterate over enough docs');
                    t.t(found1st);
                    t.t(found2nd);

                    found1st = false;
                    found2nd = false;

                    return database.find('test_collection').execute();


                }).then(function (cursor) {

                    //test setting foundry
                    cursor.foundry = function (record, cursor) {

                        record.foo += '2';

                        return record;

                    };

                    return cursor.each().step(function (document) {

                        if(document.foo === 'bar2') {
                            found1st = true;
                        } else if(document.foo === 'bar22') {
                            found2nd = true;
                        }

                    });


                }).then(function (count) {

                    t.is(2, count, 'cursor.each() didn\'t iterate over enough docs');
                    t.t(found1st);
                    t.t(found2nd);

                    return database.teardown();

                });

            }



        });



    });