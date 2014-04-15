# Event module
If you want to hook into events taking place in Altair, you have two ways; Programmatically or via configs. So, what's the diff?
There are many platforms that claim "convention over configuration," which really translates to, "Here, you write all the code."

In some cases, writing code manually is great! We don't keep you from creating listeners programatically. In fact, you
may be required to sometimes. But, in most cases, writing listeners by hand is just tedious, adds unecessary diversity
to your project, and ultimately results in a more difficult to debug system.

## Config based listeners with _HasListenersMixin
The benefit of this approach is that you don't have to manually write any code, just configure your listeners. Here is how
you use it.

### Step 1 - Mixin _HasListenersMixin
Include and mix it into your module.

```js
define(['altair/facades/declare',
        'altair/modules/events/mixins/_HasListenersMixin'],

    function (declare,
              _HasListenersMixin) {

    return declare([_HasListenersMixin], {

        /**
         * A callback is just any method that exists.
         *
         * @param e The altair/events/Event passed through to every event.
         */
        onSomethingDidHappen: function (e) {

            //the data in every event depends on the event.
            //console.log(e.data);
            //use get() to retrieve anything off the event
            //NEVER USE e.data['target']
            console.log(e.get('target'));

            //doing this will impact the event for everyone after you, very powerful, act with intent
            e.set('target', this);

        },

        /**
         * It is helpful to be explicit when you name your listeners so its clear the actors involved.
         *
         * @param e
         */
        onAlfredDidReceiveRequest: function (e) {

        }
    });
});
```

### Step 2 - Create configs/listeners.json
Listeners can be setup in several formats for your convenience.

**local event to local callback**
```json
{
    "{{event}}": "{{callback}}"
    "something-did-happen": "onSomethingDidHappen"
}
```
**remote event to local callback**
```json
{
    "{{vendor}}:{{module}}::{{event}}": "{{callback}}"
    "titan:Alfred::did-receive-request": "onAlfredDidReceiveRequest"
}
```
**remote event to remote callback**
**You should only ever attach listeners on your module or one of its subcomponents.** Also, we can only resolve listeners
on components that have Nexus Resolvers (modules, commanders, adapters, etc).

```json
{
    "{{vendor}}:{{module}}::{{event}}": "{{vendor}}:{{module}}/{{component-path}}::{{callback}}"
    "titan:Alfred::did-receive-request": "liquidfire:TestModule/adapters/Prompt::onAlfredDidReceiveRequest"
}
```

## More docs coming soon