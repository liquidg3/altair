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
                }
            },

            toJsValue: function (value, options, config) {
                return (value) ? value.toString() : value;
            },

            toViewValue: function (value, options, config) {
                return options.choices[value] || value;
            }



        });

    });
