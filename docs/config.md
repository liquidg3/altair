#Configuring Altair
You can configure Altair in 2 ways.

1. Edit the home config: `~/.altair/altair.json`
2. Create an [app](app.md)

##Environments
Since configs support environments, the top level of your config will be a key for each of those environments (as many
as you care to support). Each environment inherits from `default`. The merging is done by [node-extend](https://www.npmjs.org/package/config-extend).

```json
{
    "default": {
        "name": "Default Name",
        "description": "Some defaults",
        "nestedOptions": {
            "foo": "bar",
            "hello": "world",
            "anArray": ["one", "two", "three"]
        }
    },
    "dev": {
        "name": "Dev Name",
        "nestedOptions": {
            "foo": "taco"
        }
    },
    "prod": {
        "nestedOptions": {
            "anArray": ["overridden"]
        }
    }
}
```

You can gain access to this config and its environmentally aware setting via `require()`.

```js
//use promise wrapper
this.promise(require, ['altair/plugins/config!path/to/config.json?env=dev']).then(function (config) {

    console.log(config.name === 'Dev Name'); //prints true
    console.log(config.description === 'Some defaults'); //prints true
    console.log(config.nestedOptions.foo === 'taco'); //prints true

});

//or call require() directly
require(['altair/plugins/config!path/to/config.json?env=prod'], function (config) {

    console.log(config.name === 'Default Name'); //prints true
    console.log(config.description === 'Some defaults'); //prints true
    console.log(config.nestedOptions.anArray === ['overridden']); //prints true (arrays DO NOT merge)

});
```

##Config API
These options will sit under any particular environment (in your `altair.json`). Using this single config, you can control the entire Altair
environment as well as each and every cartridge and module that is booted. See `~/.altair/altair.json` for populated example.

- `debug`: Passthrough to [visionmedia/debug](https://github.com/visionmedia/debug). Putting liquidfire:* will enable logging for only liquidfire: based modules.
- `stackTraceLimit`: Set directly to Error.stackTraceLimit. Longer stack traces make debugging easier, but can be big and slow.
- `paths`: A key/value pair where key is a single word alias (home, dev, core) and the value is a path on your harddrive.
- `cartridges`: Since Altair is a simple cartridge loader, most your configuring will be done on a per cartridge basis.
