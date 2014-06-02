#Configuring Altair
You can configure Altair in 2 ways.

1. Edit the home config: ~/.altair/altair.json
2. Create an altair.json in any directory and run `altair` from the dir containing it.

#environments
Since configs support environments, the top level of your config will be a key for each of those environments (as many
as you care to support). Each environment inherits from "default."

```json

"default": {
    "name": "Default Name",
    "description": "Some defaults"
},
"dev": {
    "name": "Dev Name"
},
"prod": {
}
```

You can gain access to this config and its environmentally aware setting via `require()`.

```js
//use promise wrapper
this.promise(require, ['altair/plugins/config!path/to/config.json?env=dev']).then(function (config) {

    console.log(config.name === 'Dev Name'); //prints true
    console.log(config.description === 'Some defaults'); //prints true

});

//or call require() directly
require(['altair/plugins/config!path/to/config.json?env=prod'], function (config) {

    console.log(config.name === 'Default Name'); //prints true
    console.log(config.description === 'Some defaults'); //prints true

});
```

##config api
These options will sit under any particular environment. Using this single config, you can control the entire Altair
environment as well as each and every cartridge and module that is booted.

- **debug**: Passthrough to [visionmedia/debug](https://github.com/visionmedia/debug). Putting liquidfire:* will enable logging for only liquidfire: based modules.
- **stackTraceLimit**: Set directly to Error.stackTraceLimit. Longer stack traces make debugging easier, but can be big and slow.
- **paths**: A key/value pair where key is a single word alias (home, dev, core) and the value is a path on your harddrive.
- **altairDependencies**: Any Altair dependencies your app has. key is name, value is [semver](https://www.npmjs.org/package/semver) compatible version number
- **dependencies**: Any node dependencies your app has. key is name, value is [semver](https://www.npmjs.org/package/semver) compatible version number
- **cartridges**: Since Altair is a simple cartridge loader, most your configuring will be done on a per cartridge basis.
