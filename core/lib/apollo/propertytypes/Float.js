define(['dojo/_base/declare',
    './_Base',
    'lodash'],

    function (declare,
              _Base,
              _) {

        return declare([_Base], {

            key: 'float',

            toJsValue: function (value, options, config) {

                var _value = value;

                //if a value was provided, but it's a string
                if(_value && !_.isNumber(_value)) {
                    _value = parseFloat(_value);
                } else if(!_.isNumber(_value)) {
                    _value = null;
                }

                return _value;
            },

            toDatabaseValue: function (value, options, config) {
                return this.toJsValue(value, options, config);
            }

        });
    });
