define(['dojo/_base/declare', './_Base'],

    function (declare, _Base) {


        return declare([_Base], {

            key:     'date',
            options: {
                time: {

                    type:    'boolean',
                    options: {
                        label:       'Include time',
                        description: 'Allow for time select?',
                        'default':   false
                    }
                },

                date: {
                    type:    'boolean',
                    options: {
                        label:       'Include date',
                        'default':   true,
                        description: 'Unchecking this will result in a time select only (if time is true).'
                    }
                }
            },

            toJsValue: function (value, options, config) {
                return value;
            },

            toDatabaseValue: function (value) {
                return value;
            }


        });
    });
