Some experiments with a new rewrite
Both trying different ways and also trying to make it smaller

## IDEAS

Maybe we don't have to manually try to make the minimum DOM changes, but instead just change innerHTML and then let the browser figure out what to do?
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

also having signal as a custom element is a whole downgrade in terms of css selectors, signals shouldnt effect the flow of the dom, they should be invisible.

maybe i should not use signals at all, and come up with something else

maybe i should make something completely based on html manipulation.
something like htmx but works without server side.

like instead of sending request to a server we call a function on the client

and we write the html with the current way, within the ts file

we are gonna use the power of custom elements with some global heap state, that is gonna be sent with script tags
this way we are gonna have client side code at the same time, for now im not gonna think about signals

just gonna focus on having elements being rendered and on: events working
gonna think event based, also gonna have an event for element being connected to the dom
events run on client side
so if we can make a system that generates html and also can run events on the client side
we are half way there, then we can think about how to make this method work in general

our main goal here is being able to make SPA without fully relying on scripts.
its about making it kinda resumeable, we dont have ssr but we are gonna act like we have it

client side code is gonna be fully seperated from server side code.
nothing is gonna run twice.
all client runs is events.

thats why we dont need real resumablity.
we just run some code while generating the html then from there everything runs on the client side.
almost, changes can be boosted but with the result of a function call. or something like that.

later we can just seperate the client side code and server side code.
or something like that. client side htmx mind set.
