define(['dojo/_base/declare',
    './_Base'],

    function (declare, _Base) {


        "use strict";

        return declare([_Base], {

            key:     'select',
            options: {
                choices: {
                    type:    'object',
                    options: {
                        label: 'A key/value pair of options the user can select from.'
                    }
                },
                saveAsInt: {
                    type: 'boolean',
                    options: {
                        label: 'Save as Integer',
                        description: 'I will save as a string by default.',
                        'default': false
                    }
                }
            },

            toJsValue: function (value, options, config) {

                if (value && options.saveAsInt) {
                    return parseInt(value, 10);
                } else if (value) {
                    return value.toString();
                }
                return value;
            },

            toViewValue: function (value, options, config) {
                return options.choices[value] || value;
            },

            toDatabaseValue: function (value, options, config) {
                return this.toJsValue(value, options, config);
            }



        });

    });
