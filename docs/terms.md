# Terms

Below are terms, definitions, classes, etc. used throughout Altair. If you are ever having a conversation with someone
about Altair, having at least some familiarity with these terms will make life easier.

## Nexus
- A strategy pattern'esque registry available throughout Altair
- Example; var result = this.nexus('identifier');
- nexus resolvers handle what is passed as in identifier (such as this.nexus('altair:CommandCentral::adapters/Prompt'); )

## Module
- An AMD module inside vendors/{{vendor}}/modules/{{module}}/{{Module}}.js
- Started up after Altair is booted
- Executed after all other modules are started up

## Lifecycle
- An object with 3 states, startup, execute, teardown
- Execute may be called many times
- For every startup, you must call teardown

## Deferred
- A promise to take action later
- Used to handle async operations
- Example; d = new Deferred(cancelCallback); d.then(callback).otherwise(errCallback); d.resolve(dataPassedToCallbacks);

