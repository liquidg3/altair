define(['altair/facades/declare',
        'altair/plugins/node!path',
        './_Base'],

    function (declare,
              pathUtil,
              _Base) {



    return declare([_Base], {

        key: 'path',
        options: {
             absolute: {
                  type: 'boolean',
                  options: {
                       label: 'Resolve to absolute path',
                       'default': true
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

            var resolved = value;

            if(value[0] !== '/' && options.absolute) {
                resolved = pathUtil.join(process.cwd(), value);
            }

            return resolved;

        },

        toDatabaseValue: function (value, options, config) {
            return value;
        }

    });

});
