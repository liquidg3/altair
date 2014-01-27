/**
 * Apollo Tests
 */
define(['doh/runner',
        'apollo/Schema',
        'apollo/tests/mock/Entity',
        'apollo/fieldtypes/Text',
        'apollo/fieldtypes/Bool',
        'apollo/fieldtypes/Email'],

    function (doh,
              Schema,
              Entity,
              Text,
              Bool,
              Email) {

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
            new Bool(),
            new Email()
        ];



        doh.register('apollo-casting', [


            /**
             * Testing that a schema has its useful methods
             */
            function () {

                var schema = new Schema(schemaLiteral, fieldTypes),
                    mock   = new Entity(schema);


                doh.assertTrue(schema.has('firstName'), 'Schema.has failed');
                doh.assertFalse(schema.has('firstName2'), 'Schema.has failed');
                doh.assertEqual('First Name', schema.optionsFor('firstName').label, 'Schema.has failed');

            }


        ]);


    });