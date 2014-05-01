define(['doh/runner',
    'lodash',
    'altair/cartridges/database/query/Query'],

    function (runner,
              _,
              Query) {


        runner.register('cartridges-database-query', {


            "test building simple queries": function (t) {

                var q       = new Query();
                t.is(q.where('firstName', '==', 'taylor').query(), { firstName: 'taylor'}, 'equality query build failed');

                _.each(['>', '<', '>=', '<='], function (operator) {

                    var q2      = new Query(),
                        expected = {age: {}};

                    expected.age['$' + operator] = 20;

                    t.is(q2.where('age', operator, 20).query(), expected, 'greater than query build failed');

                });

            },

            "test building with 2 predicates": function (t) {


                var q       = new Query();
                t.is(q.where('firstName', '==', 'taylor').and().where('lastName', '==', 'romero').query(), { firstName: 'taylor', lastName: 'romero'}, 'equality query build failed');

                _.each(['>', '<', '>=', '<='], function (operator) {

                    var q2      = new Query(),
                        expected = {age: {}, weight: {}};

                    expected.age['$' + operator] = 20;
                    expected.weight['$' + operator] = 199;

                    t.is(q2.where('age', operator, 20).and().where('weight', operator, 199).query(), expected, 'greater than query with 2 predicates build failed');

                });

            },

            "test building with 2 joining by 'or'": function (t) {

                var q       = new Query(),
                    query   = q.where('firstName', '==', 'taylor').or().where('firstName', '==', 'becca').query();

                t.is(query, { '$OR': [
                    { firstName: 'taylor' },
                    { firstName: 'becca' }
                ]}, 'basic $or failed');

            },

            "test building with 2 joining by 'or' and comparing with '>' & '<'": function (t) {

                var q       = new Query(),
                    query   = q.where('qty', '>', 100).or().where('price', '<', 9.95).query();

                t.is(query, { '$OR': [
                    { qty: { '$>': 100} },
                    { price: { '$<': 9.95 } }
                ]}, 'or with < > operatorns failed');

            },

            "test building with 3 joining by 'and' then 'or'": function (t) {

                var q       = new Query(),
                    query   = q.where('firstName', '==', 'taylor').and().where('lastName', '==', 'romero').or().where('firstName', '==', 'becca').query();

                t.is(query, { '$OR': [
                    { firstName: 'taylor', lastName: 'romero' },
                    { firstName: 'becca' }
                ]}, 'equality query build failed');

            },

            "test building with 4 joining by 'and', 'or', 'and'": function (t) {

                var q       = new Query(),
                    query   = q.where('firstName', '==', 'taylor').and().where('lastName', '==', 'romero').or().where('firstName', '==', 'becca').and().where('lastName', '==', 'miller').query();

                t.is(query, { '$OR': [
                    { firstName: 'taylor', lastName: 'romero' },
                    { firstName: 'becca', lastName: 'miller' }
                ]}, 'equality query build failed');

            },

            "test building with 3 joining by 'or', 'or', 'or'": function (t) {

                var q       = new Query(),
                    query   = q.where('firstName', '==', 'taylor').or().where('lastName', '==', 'romero').or().where('firstName', '==', 'becca').query();

                t.is(query, { '$OR': [
                    { firstName: 'taylor' },
                    { lastName: 'romero' },
                    { firstName: 'becca' }
                ]}, 'equality query build failed');

            },

            "test building with 3 joining by 'or', 'and', 'or'": function (t) {

                var q       = new Query(),
                    query   = q.where('firstName', '==', 'taylor').or().where('lastName', '==', 'romero').and().where('firstName', '==', 'becca').query();

                t.is(query, { '$OR': [
                    { firstName: 'taylor' },
                    { firstName: 'becca', lastName: 'romero' }
                ]}, 'equality query build failed');

            },

            "test building with 3 joining by 'or', 'and', 'or' with > & <": function (t) {

                var q       = new Query(),
                    query   = q.where('firstName', '==', 'becca').and().where('age', '>', 10).or().where('age', '<', 100).query();

                t.is(query, { '$OR': [
                    { firstName: 'becca', age: { "$>": 10 } },
                    { age: { "$<": 100 } }
                ]}, 'equality query build failed');

            }




        });


    });
