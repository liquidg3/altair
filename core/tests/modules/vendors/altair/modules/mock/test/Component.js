/**
 * Test subcomponent
 */
define(['altair/facades/declare',
        'altair/Lifecycle',
        'apollo/_HasSchemaMixin'
], function (declare, Lifecycle, _HasSchemaMixin) {


    return declare([Lifecycle, _HasSchemaMixin], {

        _schema: {
            foo: {
                type: 'string',
                options: {
                    label:      'Foo',
                    default:    'bar'
                }
            }
        },

        startedUp: false,
        startup: function () {

            this.startedUp = true;

            return this.inherited(arguments);

        }

    });
});