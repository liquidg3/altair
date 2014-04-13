# Event Listeners
If you want to hook into events taking place in Altair, you have a few ways.

# _HasListenersMixin
The benefit of this approach is that you don't have to manually write any code, just configure your listeners.

## Step 1 - Mixin
Include the mixin and mix it into your module.

```js
define(['altair/facades/declare',
        'altair/modules/events/mixins/_HasListenersMixin'],

    function (declare,
              _HasListenersMixin) {

    return declare([_HasListenersMixin], {

        //... your module body

    });
});

```

## Step 2 - Create configs/listeners.json
Listeners can be setup in several formats for your convenience.

```json

{
    "event-name": "callbackNameOnYourModule"
}

```