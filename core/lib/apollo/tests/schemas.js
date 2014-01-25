/**
 * Apollo Tests
 */
define(['doh/runner',
        'apollo/Schema'],

    function (doh,
              Schema) {

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
        };

        doh.register('apollo-schemas', [


            /**
             * Testing that a schema has its useful methods
             */
            function () {

                var schema = new Schema(schemaLiteral);

                doh.assertTrue(schema.has('firstName'), 'Schema.has failed');
                doh.assertFalse(schema.has('firstName2'), 'Schema.has failed');
                doh.assertEqual('First Name', schema.optionsFor('firstName').label, 'Schema.has failed');

            }


        ]);


    });