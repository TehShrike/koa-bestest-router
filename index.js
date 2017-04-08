const parseUrl = require('url').parse

const processInputMaps = require('./process-input-maps')

module.exports = function createRouter(methodsToRouteMaps, { set404 = false } = {}) {
	validateInputMap(methodsToRouteMaps)
	const getRoutesForMethod = processInputMaps(methodsToRouteMaps)

	async function notFound(context, next) {
		if (set404) {
			context.status = 404
		}

		await next()
	}

	return async function middleware(context, next) {
		const { method, url } = context
		const routes = getRoutesForMethod(method)

		if (routes) {
			const path = parseUrl(url).pathname

			const matched = findMatchingRoute(routes, path)

			if (matched) {
				const { params, handler } = matched
				context.params = params

				await handler(context, next)
			} else {
				await notFound(context, next)
			}
		} else {
			await notFound(context, next)
		}
	}
}

function findMatchingRoute(routes, path) {
	return returnFirst(routes, ({ matcher, handler }) => {
		const params = matcher(path)

		return params && {
			params,
			handler
		}
	})
}

function returnFirst(ary, fn) {
	return ary.reduce((result, input) => {
		if (result) return result

		return fn(input)
	}, null)
}

function validateInputMap(methodsToRouteMaps) {
	const methods = Object.keys(methodsToRouteMaps)
	methods.forEach(method => {
		if (method.toUpperCase() !== method) {
			throw new Error(`Bad method - you probably want to uppercase '${method}'`)
		}
	})
}
