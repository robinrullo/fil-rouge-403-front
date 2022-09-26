import type {
	PaginatedRestResponse,
	PoiFeatureCollection,
	PoiProperties
} from '../types'
import type { Feature, Point } from 'geojson'

export default async function getPois(): Promise<PoiFeatureCollection> {
	const response = await fetch('/api/pois', {
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		}
	})

	const restData = (await response.json()) as PaginatedRestResponse<{
		pois: Feature<Point, PoiProperties>[]
	}>

	// eslint-disable-next-line no-underscore-dangle
	return { type: 'FeatureCollection', features: restData._embedded.pois }
}
