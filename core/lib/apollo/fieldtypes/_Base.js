/**
 * Base field type,
 */
define(['dojo/_base/declare',
        'dojo/Deferred',
        'dojo/_base/lang'

], function (declare,
             Deferred,
             lang) {

    return declare('apollo/fieldtypes/_Base', null, {

        /**
         * Your field type should define its own options
         */
        options: null,

        /**
         * The key for this type, "text" or "bool"
         */
        key: null,

        /**
         * These are options all fields get
         */
        _defaultOptions: {
            label: {
                type: 'text'
            },
            required: {
                type:           'bool',
                description:    'If this field is required, set to true.'
            },
            many: {
                type: 'bool',
                options: {
                    description: 'Whether this element should could back as an array.'
                }
            }
        },


        /**
         * How this field type will be rendered if needbe--
         */
        renderer: null,

        constructor: function () {

            if(!this.key) {
                throw 'You must set a key for your field type ( ' + this.declaredClass + ' ), something like "text" or "bool" or "email".';
            }

        }


    });
});
