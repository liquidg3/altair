/**
 * Apollo Tests - need more thought/time here ** moving too fast =) **
 */
define(['doh/runner',
        'apollo/Schema',
        'apollo/tests/mock/Entity',
        'apollo/fieldtypes/Str',
        'apollo/fieldtypes/Bool'],

    function (doh,
              Schema,
              Entity,
              Str,
              Bool) {

        /**
         * Dependencies
         */
        var schemaLiteral = {
            name: 'my test user schema',
            foo:  'bar',
            elements: {

                firstName: {
                    type: 'string',
                    options: {
                        'label': 'First Name'
                    }
                },

                isVerified: {
                    type: 'boolean',
                    options: {
                        'label': 'Is Verified'
                    }
                }

            }
        },
        fieldTypes = [
            new Str(),
            new Bool()
        ];



        doh.register('apollo-has-schema-mixin', [


            /**
             * Test basic getters/setters
             */
            function () {

                var schema = new Schema(schemaLiteral, fieldTypes),
                    mock   = new Entity(schema);


                mock.set('firstName', 'taylor')
                    .set('isVerified', 1);

                doh.assertEqual('taylor', mock.get('firstName'), 'default setter did not work');
                doh.assertTrue(mock.calledOverriddenSetter, 'overidden setter failed');

            }


        ]);


    });