define(['dojo/_base/declare',
    'altair/modules/commandcentral/adapters/_Base',
    'dojo/node!blessed',
        'altair/facades/mixin'
], function (declare,
             _Base,
             blessed,
            mixin) {


    return declare('altair/modules/commandcentral/adapters/blessed/FormFoundry', [_Base], {

        /**
         * Takes a blessed.form and builds it using the apollo/Schema as a guid
         *
         * @param form blessed.form
         * @param schema apollo/Schema
         * @returns blessed.form
         */
        build: function (adapter, schema, options) {


            var elements    = schema.elementsAsArray(),
                form,
                selector    = 'form';


            if(options.id) {
                selector += ', #' + options.id;
            }

            form = new blessed.Form(mixin(adapter.styles(selector), options));

            elements.forEach(function (element) {

                var className,
                    styleName,
                    options = {
                        name: element.name,
                        content: element.options.label,
                        parent: form,
                        mouse: true,
                        keys: true
                    };

                switch (element.type) {
                    case 'path':
                        className = 'DirManager';
                        break;
                    case 'bool':
                        className = 'Checkbox';
                        break;
                    case 'password':
                        className = 'Passbox';
                        break;
                    case 'image':
                        className = 'FileManager';
                        break;
                    default:
                        className = 'Textbox';

                }

                styleName = className.toLowerCase();
                options = mixin(adapter.styles(styleName + ', form ' + styleName), options);

                element = new blessed[className](options);


            });

            return form;
        }

    });

});
