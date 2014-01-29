/**
 * Apollo Tests - need more thought/time here ** moving too fast =) **
 */
define(['doh/runner',
        'apollo/Apollo',
        'apollo/fieldtypes/Text',
        'apollo/fieldtypes/Bool',
        'apollo/fieldtypes/Float',
        'apollo/fieldtypes/Int',
        'apollo/fieldtypes/Date'],

    function (doh,
              Apollo,
              Text,
              Bool,
              Float,
              Int,
              Date) {

    /**
     * Dependencies
     */
    var schemaData = {
        name: 'my test user schema',
        foo:  'bar',
        elements: {

            dateInserted: {
                type: 'date',
                options: {
                    label: 'Date Inserted',
                    'default': 'now'
                }
            },

            dateUpdated: {
                type: 'date',
                options: {
                    label: 'Date Updated',
                    'default': 'now'
                }
            },

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
        new Float(),
        new Int(),
        new Date()
    ];

    doh.register('apollo', [


        function () {

            var apollo  = new Apollo(fieldTypes),
                schema  = apollo.createSchema(schemaData);




        }




    ]);


});