# Strategy pattern in Altair
The strategy pattern, in practice, is the idea of selecting which logic to execute at runtime. It's used throughout
Altair and done in a very consistent manner. In this example I'll use TheLodge and the selection of a version control
system (vcs). Currently TheLodge only supports Git repos, but adding new ones would be a snap.

## Using the observer pattern to supply strategies
Rather than hard coding your strategies, you should use the event system in Altair to 'register' them. This allows your
repertoire of strategies to grow as your requirements grow. This also allows 3rd parties to supply strategies with ease.

**coming soon***