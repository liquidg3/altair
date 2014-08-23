define(['dojo/_base/declare',
        './_Base',
        'lodash'],

    function (declare,
              _Base,
              _) {



        return declare([_Base], {

            key: 'integer',

            toJsValue: function (value, options, config) {

                var _value = value;

                _value = parseInt(_value, 10);

                if (_value === NaN) {
                    _value = null;
                }

                return _value;

            },

            toDatabaseValue: function (value, options, config) {
                return this.toJsValue(value, options, config);
            }

        });
    });
