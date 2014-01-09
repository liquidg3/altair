Altair
===

Welcome to the IoE. Before you get started, you should read this whole thing. It's worth it and we'll keep it short!

Altair was built to ensure one thing, that tomorrow is more productive than today. That means everything should
only ever have to be written once (barring any rewrites because of lessons learned =). By following our tested conventions
you'll find that code becomes manageable, flexible, and scalable.


Many of the features in Altair are managed via configuration (.json) files. This may be off putting for some who prefer
to stay in code or in some other way "despise" config managed systems, but when it comes time to customize a system or
learn about the current configuration of that system, looking through a .json file is much better than some stranger's
2 a.m. hacking.

Want to learn about the events I'm listening to? Check config/listeners.json
What about my devices? config/devices.json
How about the REST endpoints I've got configured? config/rest.json

You get the picture. Writing code to do this mundane setup is a waste of time.

Now that we've got that out of the way, go ahead and run:

$ node altair.js

