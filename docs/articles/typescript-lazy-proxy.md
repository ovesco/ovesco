---
title: Lazy proxy in typescript
---

<ToggleFavorite />

# Lazy proxy in Typescript

Proxy in itself is a structural design pattern where your object
is hidden behind a *proxy* object which controls how you interact with it.
This allows you to perform some additional stuff before forwarding the
*request* to the underlying object.

## Proxies in javascript/typescript
::: tip
I'll speak about Typescript here but the behaviour is exactly the same for Javascript as you could guess.
:::

In typescript, a Proxy object is actually implemented and documented, you can
find it [here](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Proxy).

In short, it allows you to set **traps** which will intercept the actions
you're trying to perform on an object and allows you to do something else. For example:
```typescript
const obj = {};

const proxy = new Proxy(obj, {
    get(target: any, key: string) {
        console.log(target, key);  // {} yo
        return 2;
    }
});

console.log(proxy.yo); // 2
```

As you can see in the upper example, the proxy will intercept the access to your object
and allow you to do anything with it. The first parameter is the target, in this case our `obj`,
while the second parameter is the key, here `yo`. Now those are the parameters for the `get` trap but
there are multiple others you can use!

## Lazy proxy
What I'd like to do is a proxy that can dynamically resolve its target without having to specify it,
for example something like:
```typescript
const serviceProvider = () => {
    const service = somePlace.getMyService('myService');
    return service;
};

// Here the proxy is empty, it doesn't know its target
const proxy = new LazyProxy(serviceProvider);

// Here it should intercept this, resolve its target and forward to it
console.log(proxy.abc);
```

My proxy will thus resolve its target only when necessary, which means that I can create my
proxy earlier in time than my object. But more importantly, my proxy will act **as** the underlying
object and loading it only when we try to do anything with it.

My use case is that I'm developping a small dependency injection container, and injected services
*might* not exist when I want to inject them. But instead, if I inject a LazyProxy which will resolve
the service it's proxyfying and act like it once it's available, then it's a win.

## Possible solution

```typescript
class LazyProxy {

    // We assume we're proxying over a javascript object
    private _instance: { [key: string]: any } | null = null;

    constructor(private provider: () => { [key: string]: any }) {
        // keep a reference to this context, with access to get instance()
        const self = this;

        // given target is irrelevant, we won't use it
        return new Proxy({}, {
            get(_, key: string) {
                return self.instance[key];
            },

            // add other traps...
        }) as any; // type it as any otherwise it throws a typing error
    }

    private get instance() {
        if (this._instance === null) {
            this._instance = this.provider(); // Load the service and keep it in cache
        }
        return this._instance;
    }
}
```

### Returning from constructor
As you can see I opted for a `return new Proxy` inside my constructor, which means
that the returned value from `new LazyProxy(...)` will actually be the proxy I created
in it, but keeping track of the LazyProxy scope through the `self` variable, necessary
to resolve the correct service in `get instance()`.

This is necessary as explained [here](https://stackoverflow.com/a/37714855/2514387), an ES2015
class cannot extend from base Proxy class.

This requires the `@ts-ignore` flag or doing a `as any` type conversion, otherwise we're
messing with it and it will throw a type error.

## Example
```typescript
const myObject = {hello: 'world'};

// this function generates my service
const generator = () => ({ hello: 'lazy world' });

// the generator is not called yet
// We need make typescript think it's dealing with the service
const lazyObject = new LazyProxy(generator) as any as { hello: string };

console.log(myObject.hello); // world

// the generator is called and get(hello) is forwarded to the returned object
console.log(lazyObject.hello); // lazy world
```

## Conclusion
And there we are with lazy proxies!