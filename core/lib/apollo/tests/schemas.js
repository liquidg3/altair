/**
 * Apollo Tests
 */
define(['doh/runner'],

    function (doh) {

        /**
         * Dependencies
         */
        var schema = {
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

        doh.register('apollo', [




        ]);


    });