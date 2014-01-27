/**
 * Mock object to help us test the _HasSchemaMixin
 */
define(['dojo/_base/declare',
        'dojo/Deferred',
        'dojo/_base/lang',
        '../../_HasSchemaMixin'
], function (declare,
             Deferred,
             lang,
             _HasSchemaMixin) {

    return declare('apollo/tests/mock/Entity', [_HasSchemaMixin], {

        launch: function () {

        }

    });
});
