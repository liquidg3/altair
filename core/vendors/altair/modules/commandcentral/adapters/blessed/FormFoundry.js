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
                selector    = 'form',
                top         = 1,
                first       = true;


            if(options.id) {
                selector += ', #' + options.id;
            }

            form = new blessed.Form({
                keys: true,
                vi: true,
                scrollable: true
            },mixin(adapter.styles(selector), options));
            form._elements = [];//monkey wrench

            form.key('tab', function() {
                form.focusNext();
                adapter.redraw();
            });


            elements.forEach(function (element) {

                var className,
                    styleName,
                    el,
                    options = {
                        name: element.name,
                        content: element.name,
                        parent: form,
                        shrink: true,
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
                options = mixin(options, adapter.styles(styleName + ', form ' + styleName));

                top = top + options.height + 1;

                el = new blessed[className](options);

                el.key('tab', function () {
                   form.focusNext();
                    adapter.redraw();
                });

                el.on('keypress', function (ch, key) {

                    if(key.name === 'tab') {
                        return false;
                    }

                });

                if(className === 'Textbox') {
                    el.on('focus', function() {
                        el.readInput();
                    });
                }


                if(first) {
                    first = false;
                }



                form._elements.push(el);


            });

            form.focus();

            return form;
        }

    });

});
