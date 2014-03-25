# Terms

Below are terms, definitions, classes, etc. used throughout Altair. If you are ever having a conversation with someone
about Altair, having at least some familiarity with these terms will make life easier.

## Lifecycle
- An object with 3 states, startup, execute, teardown
- Execute may be called many times
- For every startup, you must call teardown

## Deferred
- A promise to take action later
- Used to handle async operations
- Example; d = new Deferred(cancelCallback); d.then(callback).otherwise(errCallback); d.resolve(dataPassedToCallbacks);