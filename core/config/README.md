# Configs

## altair.json

This is the main config used by core/bootstrap.js. You can take a look in there to see what is happening,
but the process is pretty straight forward. Here is an explanation of the keys you will find in the config.

- **default|dev|\***: The environment. 'default' is used by all, 'dev' will inherit from 'default'. The inheritance is simple
and runs up the config, e.g. adding a 'staging' key between 'default' and 'dev' and including altair/plugins/config?/path/to/config?env=staging
will load 'staging' first, then mixin 'default.' If you did ?env=dev, it would start with 'dev,' mixin 'staging,' then
mixin 'default.'
- **default.paths**: These paths are used throughout Altair for loading and forging. These paths are mapped into the global path resolver,
e.g. require('core/other/thing') will resolve 'core' to node_modules/altair.io/core. They are saved in the main Altair
instance as an array of the aliases (i.e. altair.paths = ['app', 'community', 'local']). The module cartridge will use these
paths for modules to instantiate.
- **default.cartidges**: Altair, at its heart, is a simple cartridge loader. This is an array of cartridges you will be loading.
- **default.cartidges.path**: This is the path to the cartridge you want to load.
- **default.cartidges.options**: This is the path to the cartridge you want to load.