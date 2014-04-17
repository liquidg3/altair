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

                //if a value was provided, but it's a string
                if(_value && !_.isNumber(_value)) {
                    _value = parseInt(_value, 10);
                }

                return _value;
            },

        });
    });
