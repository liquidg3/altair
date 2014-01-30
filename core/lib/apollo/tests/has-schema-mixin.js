/**
 * Apollo Tests - need more thought/time here ** moving too fast =) **
 */
define(['doh/runner',
        'apollo/Schema',
        'apollo/tests/mock/Entity',
        'apollo/fieldtypes/Text',
        'apollo/fieldtypes/Bool'],

    function (doh,
              Schema,
              Entity,
              Text,
              Bool) {

        /**
         * Dependencies
         */
        var schemaLiteral = {
            name: 'my test user schema',
            foo:  'bar',
            elements: {

                firstName: {
                    type: 'text',
                    options: {
                        'label': 'First Name'
                    }
                },

                email: {
                    type: 'email',
                    options: {
                        'label': 'Email'
                    }
                }

            }
        },
        fieldTypes = [
            new Text(),
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
                    .set('email', 'liquidg3@mac.com');

                doh.assertEqual('taylor', mock.get('firstName'), 'default setter did not work');
                doh.assertTrue(mock.calledOverriddenSetter, 'overidden setter failed');

            }


        ]);


    });