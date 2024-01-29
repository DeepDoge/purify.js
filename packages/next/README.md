Some experiments with a new rewrite
Both trying different ways and also trying to make it smaller

## IDEAS

Maybe we don't have manually try to make the minimum DOM changes, but instead just change innerHTML and then let the browser figure out what to do?
But then we have to deal with HTML or DOM XML as a string, which is not great.
Whole idea was making Elements easier to work with.
Not creating a full templating.

Also really wanna try the idea of making signals global with a random id.
then signal custom element can just view that signal.
This would also make the SSR if we ever get there easier.

So we have to decide, is this a SPA library or a SSR framework?
I feel like making things based on custom elements might be great.
if we relay less on the heap, we can make the whole thing work better with other frameworks.

wanna try something like that

maybe later, i was thinking and this might be something completely different
which might be bad, but might not be

right now im gonna take break from this and work on the other stuff
gonna use the current cherry-ts for now.
