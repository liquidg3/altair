/**
 * Apollo Tests - need more thought/time here ** moving too fast =) **
 */
define(['doh/runner',
        'apollo/Schema',
        'apollo/fieldtypes/Str',
        'apollo/fieldtypes/Bool'],

    function (doh,
              Schema,
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
                    type: 'text',
                    options: {
                        label: 'First Name',
                        value:   'Taylor'
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
        fieldTypes =  [
            new Str(),
            new Bool()
        ];

        doh.register('apollo-schemas', [

            function () {

                var schema = new Schema(schemaLiteral, fieldTypes);

                doh.assertTrue('text' in schema.elementTypes, 'Email field not added to fieldtypes of schema.');

            },

            /**
             * Testing that a schema has its useful methods
             */
            function () {

                var schema = new Schema(schemaLiteral, fieldTypes);

                doh.assertTrue(schema.has('firstName'), 'Schema.has failed');
                doh.assertFalse(schema.has('firstName2'), 'Schema.has failed');

            },

            /**
             * Testing options mixing in
             */
            function () {

                var schema = new Schema(schemaLiteral, fieldTypes);

                doh.assertEqual('First Name', schema.optionsFor('firstName').label, 'Schema.has failed');
                doh.assertFalse('maximumLength' in schema.optionsFor('firstName'), 'schema field type did not mixin max length option');


            }


        ]);


    });