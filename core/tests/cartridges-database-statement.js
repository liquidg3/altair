define(['doh/runner',
    'lodash',
    'altair/cartridges/database/Statement'],

    function (runner,
              _,
              Statement) {


        runner.register('cartridges-database-statement', {

            "test events in statement and after execute": function (t) {

                var q       = new Statement(function (q) {
                    return 10;
                }),
                    willFired = false,
                    didFired  = false;

                q.on('will-execute').then(function (e) {
                    willFired = true;
                });

                q.on('did-execute').then(function (e) {
                    t.is(10, e.get('results'), 'results not passed through to did-execute');
                    e.set('results', 2000);
                });


                q.where('firstName', '==', 'taylor').or().where('lastName', '==', 'romero')
                    .and()
                    .where('firstName', '==', 'becca')
                    .skip(10).limit(20);


                return q.execute().then(function (results) {
                    t.is(2000, results, 'statement then() did not accumulate.');
                });
            },

            "test building simple queries": function (t) {

                var q       = new Statement();
                t.is(q.where('firstName', '==', 'taylor').clauses().where, { firstName: 'taylor'}, 'equality query build failed');

                _.each(['>', '<', '>=', '<='], function (operator) {

                    var q2      = new Statement(),
                        expected = {age: {}};

                    expected.age['$' + operator] = 20;

                    t.is(q2.where('age', operator, 20).clauses().where, expected, 'greater than query build failed');

                });

            },

            "test building with 2 predicates": function (t) {


                var q       = new Statement();
                t.is(q.where('firstName', '==', 'taylor').and().where('lastName', '==', 'romero').clauses().where, { firstName: 'taylor', lastName: 'romero'}, 'equality query build failed');

                _.each(['>', '<', '>=', '<='], function (operator) {

                    var q2      = new Statement(),
                        expected = {age: {}, weight: {}};

                    expected.age['$' + operator] = 20;
                    expected.weight['$' + operator] = 199;

                    t.is(q2.where('age', operator, 20).and().where('weight', operator, 199).clauses().where, expected, 'greater than query with 2 predicates build failed');

                });

            },

            "test building with 2 joining by 'or'": function (t) {

                var q       = new Statement(),
                    query   = q.where('firstName', '==', 'taylor').or().where('firstName', '==', 'becca').clauses().where;

                t.is(query, { '$OR': [
                    { firstName: 'taylor' },
                    { firstName: 'becca' }
                ]}, 'basic $or failed');

            },

            "test building with 2 joining by 'or' and comparing with '>' & '<'": function (t) {

                var q       = new Statement(),
                    query   = q.where('qty', '>', 100).or().where('price', '<', 9.95).clauses().where;

                t.is(query, { '$OR': [
                    { qty: { '$>': 100} },
                    { price: { '$<': 9.95 } }
                ]}, 'or with < > operatorns failed');

            },

            "test building with 3 joining by 'and' then 'or'": function (t) {

                var q       = new Statement(),
                    query   = q.where('firstName', '==', 'taylor').and().where('lastName', '==', 'romero').or().where('firstName', '==', 'becca').clauses().where;

                t.is(query, { '$OR': [
                    { firstName: 'taylor', lastName: 'romero' },
                    { firstName: 'becca' }
                ]}, 'equality query build failed');

            },

            "test building with 4 joining by 'and', 'or', 'and'": function (t) {

                var q       = new Statement(),
                    query   = q.where('firstName', '==', 'taylor').and().where('lastName', '==', 'romero').or().where('firstName', '==', 'becca').and().where('lastName', '==', 'miller').clauses().where;

                t.is(query, { '$OR': [
                    { firstName: 'taylor', lastName: 'romero' },
                    { firstName: 'becca', lastName: 'miller' }
                ]}, 'equality query build failed');

            },

            "test building with 3 joining by 'or', 'or', 'or'": function (t) {

                var q       = new Statement(),
                    query   = q.where('firstName', '==', 'taylor').or().where('lastName', '==', 'romero').or().where('firstName', '==', 'becca').clauses().where;

                t.is(query, { '$OR': [
                    { firstName: 'taylor' },
                    { lastName: 'romero' },
                    { firstName: 'becca' }
                ]}, 'equality query build failed');

            },

            "test building with 3 joining by 'or', 'and', 'or'": function (t) {

                var q       = new Statement(),
                    query   = q.where('firstName', '==', 'taylor').or().where('lastName', '==', 'romero').and().where('firstName', '==', 'becca').clauses().where;

                t.is(query, { '$OR': [
                    { firstName: 'taylor' },
                    { firstName: 'becca', lastName: 'romero' }
                ]}, 'equality query build failed');

            },

            "test building with 3 joining by 'or', 'and', 'or' with > & <": function (t) {

                var q       = new Statement(),
                    query   = q.where('firstName', '==', 'becca').and().where('age', '>', 10)
                               .or()
                               .where('age', '<', 100)
                               .clauses().where;

                t.is(query, { '$OR': [
                    { firstName: 'becca', age: { "$>": 10 } },
                    { age: { "$<": 100 } }
                ]}, 'equality query build failed');

            },

            "test building with 3 joining by 'or', 'and', 'or' with > & < with callback": function (t) {

                var pass = false,
                    q = new Statement(function (q) {

                        t.is(q.clauses().where, { '$OR': [
                            { firstName: 'becca', age: { "$>": 10 } },
                            { age: { "$<": 100 } }
                        ]}, 'equality query build failed');

                        pass = true;

                    });


                q.where('firstName', '==', 'becca').and().where('age', '>', 10)
                 .or()
                 .where('age', '<', 100)
                 .execute();


                t.t(pass, 'query execute callback never invoked');

            },

            "test skip and limit clauses": function (t) {

                var q       = new Statement(),
                    clauses = q.where('firstName', '==', 'taylor').or().where('lastName', '==', 'romero').and().where('firstName', '==', 'becca').skip(10).limit(20).clauses();

                t.is(clauses.limit, 20, 'limit failed');
                t.is(clauses.skip, 10, 'skip failed');


            },

            "test 'then' in statement": function (t) {

                var q       = new Statement(function (q) {
                    return 10;
                });


                q.where('firstName', '==', 'taylor').or().where('lastName', '==', 'romero')
                    .and()
                    .where('firstName', '==', 'becca')
                    .skip(10).limit(20).then(function (results) {
                        t.is(results, 10);
                    });


                return q.execute();
            }



        });


    });
