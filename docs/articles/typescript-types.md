# Some advanced typescript typing
In this small blog post I'll cover a few uncommon typescript typings that could
prove to be useful once or twice. It's just some problems I encountered and took
some time to fix, hope it won't make you lose yours too.

## Function arbitrary arguments
Declaring a function in typescript can be done like this:
```typescript
const myFunction = (arg: string) => `hello ${arg}`;
```

### Arbitrary arguments
Now what if we want to pass an arbitrary number of arguments, and iterate over
it ? We can use this magical notation.
```typescript
const arbitraryArguments = (...args: any[]): void => args.forEach(console.log);

arbitraryArguments('hello', 'yo', true, 1); // hello yo true 1
```

### Fixing some of these arguments
Now imagine if you had a function where the first argument has to be a string,
but the rest can be anything, you can do it using a tuple the following way.
```typescript
const fixedArguments = (...args: [string, ...any[]]): void => args.forEach(console.log);

fixedArgument('hello', 'yo', true 1); // hello yo true 1
fixedArgument(1, 2, 3); // Error
```