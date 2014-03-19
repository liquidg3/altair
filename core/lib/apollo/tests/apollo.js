/**
 * Apollo Tests - need more thought/time here ** moving too fast =) **
 */
define(['doh/runner',
        'apollo/Apollo',
        'apollo/elementtypes/Str',
        'apollo/elementtypes/Bool',
        'apollo/elementtypes/Float',
        'apollo/elementtypes/Int',
        'apollo/elementtypes/Date'],

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