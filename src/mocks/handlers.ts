import { rest } from 'msw'
import pois from './data/pois.json'
import routing from './data/routing.json'

const handlers = [
	rest.get('/api/pois', (_, response, context) => response(context.json(pois))),
	rest.post('/api/routing', (_, response, context) =>
		response(context.json(routing))
	)
]

export default handlers
