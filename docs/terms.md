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

## Module
- An AMD module inside vendors/{{vendor}}/modules/{{module}}/{{Module}}.js
- If mixes in Lifecycle; .startup() is called on each module, sorted by dependency, right after the Module Cartridge is started
- If mixes in Lifecycle; .execute() is called on each module after all .startup()'s have been called

## Lifecycle
- An object with 3 states, startup, execute, teardown
- Execute may be called many times
- For every startup, you must call teardown

## Deferred
- A promise to take action later
- Used to handle async operations
- Example; d = new Deferred(cancelCallback); d.then(callback).otherwise(errCallback); d.resolve(dataPassedToCallbacks);

