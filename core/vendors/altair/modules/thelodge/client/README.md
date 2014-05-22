# Client Side Libraries
All the classes in the "client" dir facilitate the activities required for the client side of thelodge.

## Kitchen

Where our menus are stored. Also where the chef and inspector hang out.

## Chef

Responsible for fetching remote menus if someone has specified them.

## Inspector

Searches menus for the goods, uses lunr full text search.

## Valet

The model for all client side interactions. You should only ever interface with valet.