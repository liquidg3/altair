define(['dojo/_base/declare',
    'altair/modules/commandcentral/adapters/_Base'
], function (declare,
             _Base) {


    return declare('altair/modules/commandcentral/adapters/blessed/FormFactory', [_Base], {

        /**
         * Takes a blessed.form and builds it using the apollo/Schema as a guid
         *
         * @param form blessed.form
         * @param schema apollo/Schema
         * @returns blessed.form
         */
        build: function (form, schema) {


            var elements = schema.elements();

            return form;
        }

    });

});
