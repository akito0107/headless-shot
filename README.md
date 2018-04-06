# instance-memoize

[![npm version](https://badge.fury.io/js/instance-memoize.svg)](https://badge.fury.io/js/instance-memoize)
[![CircleCI](https://circleci.com/gh/akito0107/instance-memoize.svg?style=svg)](https://circleci.com/gh/akito0107/instance-memoize)

flexible cache wrapper for js object.

## Getting Started

### Prerequisites
- Node.js v8+
- npm or yarn

### Installing

```
$ npm add instance-memoize
```

## Usage

### basic example
`instance-memoize` cached results of method invocation on the specified object *permanently*.
If you want to manage cache purging and lifetime see [custom cache example](#with custom cache).

```js
import memoize from 'instane-memoize'; // or const memoize = require('instance-memoize') for commonjs modules

const obj = {
  calledCounter: 0,
  method: function() {
    calledCounter++;
    return "test value";
  }
};

const wrapped = memoize({
  instance: obj,
  methods: ['method']
})

console.log(wrapped.method())      // output => "test value"
console.log(wrapped.calledCounter) // output => "1"

/*
  The result of "method" is stored internal cache,
  From the second call, the result is returned via cache.
 */
console.log(wrapped.method())      // output(from cache) => "test value"  
console.log(wrapped.calledCounter) // output => "1"
```

### with es2015 classes
```js
import memoize from 'instane-memoize'; // or const memoize = require('instance-memoize') for commonjs modules

class Sample {
  constructor() {
    this.calledCounter = 0;
  }
  someMethod() {
    this.calledCounter++;
    return "value";
  }
}

const wrapped = memoize({
  instance: new Sample(),
  methods: ['someMethod']
})

console.log(wrapped.someMethod())      // output => "test value"
console.log(wrapped.calledCounter)     // output => "1"

console.log(wrapped.someMethod())      // output(from cache) => "test value"  
console.log(wrapped.calledCounter)     // output => "1"
```

### with async functions
`instance-memoize` also works with async/await or Promise. 

```js
import memoize from 'instane-memoize'; // or const memoize = require('instance-memoize') for commonjs modules

class Sample {
  constructor() {
    this.calledCounter = 0;
  }
  async someMethod() {
    this.calledCounter++;
    return "value";
  }
}

const wrapped = memoize({
  instance: new Sample(),
  methods: ['someMethod']
})

console.log(await wrapped.someMethod())   // output => "test value"
console.log(wrapped.calledCounter)        // output => "1"

console.log(await wrapped.someMethod())   // output(from cache) => "test value"  
console.log(wrapped.calledCounter)        // output => "1"
```

### with custom cache
You can use your customized cache by passing cache instance via options.
`cache` instance must implement three methods;
- get(key: string) :Object
- set(key: string, obj: any)
- reset()

This example shows `instance-memoize` working with [isaacs's node-lru-cache](https://github.com/isaacs/node-lru-cache).
```js
import memoize from 'instane-memoize'; // or const memoize = require('instance-memoize') for commonjs modules
import LRU from 'lru-cache' // import isaacs's node-lru-cache

class Sample {
  constructor() {
    this.calledCounter = 0;
  }
  someMethod() {
    this.calledCounter++;
    return "value";
  }
}

const wrapped = memoize({
  instance: new Sample(),
  methods: ['someMethod'],
  options: {
    cache: LRU({ ...lruCacheOptions })
  }
})
```

## API

### `memoize(instance, [...methodNames], options)`
#### arguments
- instance (Object): Source object that wrapped to.
- methodNames (Array<string>): Method name(s) that cached.
- options (Object):
    - cache (Object): Custom Cache object
    - keygen (function(methodName: string, ...args): string ): cache key generator function

#### returns
(Object): Wrapped instance that caches the result of specified method invocation.

## Authors
* **Akito Ito** - *Initial work* - [akito0107](https://github.com/akito0107)

## License

This project is licensed under the Apache2.0 License - see the [LICENSE.md](LICENSE.md) file for details
