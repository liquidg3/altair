define(['dojo/_base/declare',
        'lodash',
        './_Base'],

    function (declare,
              _,
              _Base) {



    return declare([_Base], {

        key: 'primary',
        options:            {
            type: {
                type:    'select',
                options: {
                    label:       'Type',
                    'default': 'string',
                    choices: {
                        string:     'String',
                        integer:    'Integer'
                    }
                }
            }

        },


        /**
         * You shall always get back a string honoring your options.
         *
         * @param value
         * @param options
         * @param config
         * @returns {*}
         */
        toJsValue: function (value, options, config) {

            var v = value && value !== '' ? value : null;

            if (v && options.type === 'string') {
                v = _(v).toString();
            } else if (v && options.type === 'integer') {
                v = parseInt(v);
            }

            return v;
        },

        toDatabaseValue: function (value, options, config) {
            return this.toJsValue(value, options, config);
        },

        toHttpResponseValue: function (value, options, config) {

            return this.toJsValue(value, options, config);

        }

    });

});
