#AMD Template
Use the template below when starting to define a new class.

``` js
define(['altair/facades/declare',
        'altair/mixins/_DeferredMixin',
        'altair/mixins/_AssertMixin'
], function (declare,
             _DeferredMixin,
             _Assert) {

    return declare([_DeferredMixin, _AssertMixin], {


    });

});
```