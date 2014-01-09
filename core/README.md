Altair Core
===

The core directory contains the minimum amount of libraries that are needed to bootstrap the platform.
An argument is to be made against how far we've diverged from colloquial app conventions in Nodejs. But,
the way Altair is structured is no accident. It's designed to facilitate the building of massive, complex
systems without growing the complexity of & the difficulty in managing the code.

We know it works because we've used it before with great success, having completed projects with < 5 engineers
where our competition has needed 30+. Now, not all this can be attributed to the layout of the filesystem, but
what we can credit it for is taking code management out of the equation. A properly structured Altair
project can grow without adding to the amount of the system you need to have loaded in your brain.

Because your code will be very cohesive, you will have very little trouble locating any piece you are trying to find.
You should never have to search your project for an anonymous function that contains the random piece of logic
you need to manipulate to fulfill some business requirements.

Keep your code cohesive, couple it as intelligently as possible, and you will find that with very little effort, you can
accomplish incredible things.


