define(['altair/facades/declare',
        'altair/mixins/_DeferredMixin'
], function (declare,
             _DeferredMixin) {

    return declare([_DeferredMixin], {

        _index: 0,
        _statement: null,
        next: function () {

        },

        index: function () {
            return this._index;
        },

        statement: function () {
            return this._statement;
        }

    });

});