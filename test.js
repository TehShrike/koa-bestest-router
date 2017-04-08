const test = require('tape')
const createRouter = require('./')

async function koaRequestSimulator(middleware, method, url) {
	const context = { method, url }
	let calledNext = false
	const next = async () => { calledNext = true }

	await middleware(context, next)

	return Object.assign(context, { calledNext })
}

const assertBodyHelper = t => (context, expected) => t.equal(context.body, expected)
const wait = time => new Promise(resolve => setTimeout(resolve, time))

test('Basic cases', async t => {
	const middleware = createRouter({
		GET: {
			'/yes/but': async (context, next) => {
				context.body = 'lol butts'
				await wait(50)
			},
			'/yes/:and': async (context, next) => {
				context.body = `you said ${context.params.and}`
				await next()
			}
		},
		POST: {
			'/whatever': async (context, next) => {
				t.fail()
			}
		}
	})

	const assertBody = assertBodyHelper(t)

	assertBody(await koaRequestSimulator(middleware, 'GET', '/yes/please'), 'you said please')
	assertBody(await koaRequestSimulator(middleware, 'GET', '/yes/but'), 'lol butts')
	assertBody(await koaRequestSimulator(middleware, 'GET', '/no'), undefined)
	assertBody(await koaRequestSimulator(middleware, 'POST', '/yes/please'), undefined)

	t.end()
})

test('Setting 404 and calling next when there are no matching methods', async t => {
	const no404Middleware = createRouter({})
	const setting404Middleware = createRouter({}, { set404: true })

	const no404Context = await koaRequestSimulator(no404Middleware, 'PUT', '/whatever')
	t.equal(no404Context.status, undefined)
	t.equal(no404Context.calledNext, true)

	const set404Context = await koaRequestSimulator(setting404Middleware, 'PUT', '/whatever')
	t.equal(set404Context.status, 404)
	t.equal(set404Context.calledNext, true)

	t.end()
})

test('Setting 404 and calling next when there are matching methods but no matching routes', async t => {
	const dummyRoute = { PUT: { '/meh': () => undefined } }
	const no404Middleware = createRouter(dummyRoute)
	const setting404Middleware = createRouter(dummyRoute, { set404: true })

	const no404Context = await koaRequestSimulator(no404Middleware, 'PUT', '/whatever')
	t.equal(no404Context.status, undefined)
	t.equal(no404Context.calledNext, true)

	const set404Context = await koaRequestSimulator(setting404Middleware, 'PUT', '/whatever')
	t.equal(set404Context.status, 404)
	t.equal(set404Context.calledNext, true)

	t.end()
})
