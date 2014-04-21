# Terms

Below are terms, definitions, classes, etc. used throughout Altair. If you are ever having a conversation with someone
about Altair, having at least some familiarity with these terms will make life easier.

## Nexus
- A strategy pattern'esque registry available throughout Altair
- Example; var result = this.nexus('identifier');
- nexus resolvers handle what is passed as in identifier (such as this.nexus('altair:CommandCentral::adapters/Prompt'); )

## Nexus Id
- A string in the form of "altair:CommandCentral" - {{vendor}}:{{Module}}
- Also can contain additional data, such as a relative path, e.g. "altair:CommandCentral::adapters/Prompt"
- Remember, no ID is valid unless there is a resolver to handle it

## Module
- An AMD module inside vendors/{{vendor}}/modules/{{module}}/{{Module}}.js
- If mixes in Lifecycle; .startup() is executed on each module, sorted by dependency, right after the Module Cartridge is started
- If mixes in Lifecycle; .execute() is excuted right after startup() on each module

## Subcomponent
- Any AMD module, mixin, plugin, or facade that lives inside of your module
- A great example would be an adapter (when using _HasAdaptersMixin)
- Almost everything you create with the foundry() extension would be considered a subcomponent

## Lifecycle
- An object with 3 states, startup, execute, teardown
- Execute may be called many times
- For every startup, you must call teardown

## Deferred
- [A promise to take action later](http://www.html5rocks.com/en/tutorials/es6/promises/)
- Used to handle async operations
- Example; d = new Deferred(cancelCallback); d.then(callback).otherwise(errCallback); d.resolve(dataPassedToCallbacks);

## Facades
- Facades are AMD modules that behave like behave like functions
- Always in a "facades" dir, e.g. altair/facades/declare
- Done this way so you know when you're including a library if you should instantiate (new operator) it or not

## Plugins
- Standard AMD flavored plugins that require a ! (bang) in the path
- Always in a "plugins" dir, e.g. altair/plugins/node!underscore, altair/plugins/config!path/to/config
