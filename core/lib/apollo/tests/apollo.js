/**
 * Apollo Tests - need more thought/time here ** moving too fast =) **
 */
define(['doh/runner',
        'apollo/Apollo',
        'apollo/propertytypes/Str',
        'apollo/propertytypes/Bool',
        'apollo/propertytypes/Float',
        'apollo/propertytypes/Int',
        'apollo/propertytypes/Date'],

    function (doh,
              Apollo,
              Str,
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
        properties: {

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
                type: 'string',
                options: {
                    label: 'First Name'
                }
            },

            email: {
                type: 'string',
                options: {
                    label: 'Email'
                }
            }

        }
    },
    fieldTypes = [
        new Str(),
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