const createRouteMatcher = require('path-match')()
const orderedEntries = require('ordered-entries')

function mapObject(o, fn) {
	return orderedEntries(o).reduce((map, [ key, value ]) => {
		map[key]  = fn(value)
		return map
	}, Object.create(null))
}

// [routeString]: handler
function routeMapToArray(methodHandlers) {
	return orderedEntries(methodHandlers).map(([ routeString, handler ]) => {
		const matcher = createRouteMatcher(routeString)
		return { matcher, handler }
	})
}

module.exports = methodsToRouteMaps => {
	const methodsToRouteArrays = mapObject(methodsToRouteMaps, routeMapToArray)

	return method => methodsToRouteArrays[method]
}
