# Playing with Typescript decorators

In this post I'd like to introduce a very interesting concept of Typescript, one that's still
considered as experimental even though it's been here for quite a time, the *maybe* famous decorators.

## What's a decorator
Quickly, a decorator is a special kind of decoration which add a new meta-programming syntax on top of
class declarations and members. If you want to use decorators, you must enable them in your `tsconfig.json` with 
```json
{
    "compilerOptions": {
        "target": "ES5", // minimum
        "experimentalDecorators": true
    }
}
```
Meta-programming actually means that decorator will be able to change the way your objects interact, this
is some great power to manipulate wisely.

:::tip
This post won't be about decorators internals, there are much better articles which can explain it. The
official documentation is also a very good place to learn about them in details.
:::

## Building our first decorator
In Typescript, you can put a decorator on top of:
- Class
- Class methods
- Class accessors (`get potato() and set potato(newPotato)`)
- Class properties (or attributes)
- Class method parameters (including `constructor` parameters)

Let's first start by creating a property decorator, because we can quickly create something cool with it.
First of all a decorator is a function, and as such, takes some parameters. Those are fixed and depend
on the type of decorator you're creating. In the case of a Property decorator, it looks like this:
```typescript
const MyDecorator = (target: any, propertyKey: string | symbol) => {
    // ...
}
```

And you'd apply it like this:
```typescript
class MyClass {

    @MyDecorator
    private logger: Logger;
}
```

You'll notice that there's no parenthesis after the `@MyDecorator`, that's because the decorator parameters
are fixed, you cannot change them because typescript itself will provide them. The two exposed parameters are:
- target: 