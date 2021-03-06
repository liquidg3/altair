define(['altair/facades/declare',
        'apollo/propertytypes/_Base'],

    function (declare,
              _Base) {

        return declare([_Base], {

            key: 'nexus',
            nexus: null,

            constructor: function (options, nexus) {

                this.nexus = nexus;

                if(!this.nexus) {
                     throw new Error('Please pass nexus to the Nexus property type constructor.');
                }

            },

            /**
             * Resolve whatever is passed through nexus if it's a string
             *
             * @param value
             * @param options
             * @param config
             */
            toJsValue: function (value, options, config) {

                if(typeof value === 'string') {
                    return this.nexus.resolve(value, options, config);
                }

                return value;
            }


        });
    });
