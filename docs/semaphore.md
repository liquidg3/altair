# Semaphore
Need to make sure async operations are safe? Need to sure the operation finishes completely before starting again?
Use `altair/mixins/_SemaphoreMixin`. Note that you get the `_DeferredMixin` for free here.

## Step 1 - add _SemaphoreMixin to any class
```js
define(['altair/facades/declare',
        'altair/mixins/_AssertMixin',
        'altair/mixins/_SemaphoreMixin'
            
], function (declare,
             _AssertMixin,
             _SemaphoreMixin) {

    return declare([_AssertMixin, _SemaphoreMixin], {


    });

});
```

## Step 2 - lock/unlock
From inside your class you can do the following.

```
{
    doSomething: function () {
    
        return this.queue('any-key-i-want').then(function () {
        
            this.next('any-key-i-want');
        
        }.bind(this);
        
    }
}

```
Now multiple calls to `doSomething()` will queue up accross requests. 
