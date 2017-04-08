# koa-bestest-router

The name's a bit of a joke, I was just amused by the existence of koa-router and koa-better-router.  This probably isn't the bestest Koa router.

When trying to track down an issue in another router, I was shocked by how much state mutation and code they were using.  So I wrote this.

No mutations, not much code = easy to understand and debug.  Intended for simple apps.  If I need something more complex later, I'll come up with some way to compose or nest routers.

# API

A single function.  It takes a POJO map of HTTP methods to a map of routes to handler functions.

It returns a Koa middleware function.

```js
const createRouter = require('koa-bestest-router')

const routerMiddleware = createRouter({
	GET: {
		'/pie': async (context, next) => {
			context.body = 'Yay pie!'
		},
		'/cake/:flavor': async (context, next) => {
			context.body = `I like ${context.params.flavor} cake`
		}
	},
	POST: {
		'/cake/:flavor': async (context, next) => {
			someDb.addFlavor(context.params.flavor)
		}
	}
})

koaApp.use(routerMiddleware)
```

## `routerMiddleware = createRouter(routes, [options])`

`routes` is a map of HTTP methods to maps of [path-to-regexp](https://github.com/pillarjs/path-to-regexp) routes to handler functions.

Routes will be checked in a deterministic order from top to bottom, [thanks to ES2015](http://stackoverflow.com/questions/30076219/does-es6-introduce-a-well-defined-order-of-enumeration-for-object-properties).

`options` is an object with only one supported property at the moment:

- `set404`: defaults to false.  When true, will set `context.status = 404` when no matching routes are found for a request.

# License

[WTFPL](http://wtfpl2.com)
