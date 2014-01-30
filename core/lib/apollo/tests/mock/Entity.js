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

        calledOverriddenSetter: false,
        setFirstName: function (name) {

            this._set('firstName', name);

            this.calledOverriddenSetter = true;

            return this;

        }

    });
});
