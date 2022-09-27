import type { Feature, FeatureCollection, LineString, Point } from 'geojson'

export type PoiFeatureCollection = FeatureCollection<Point, PoiProperties>
export type PoiFeature = Feature<Point, PoiProperties>

export interface PoiProperties {
	id: number
	name: string
	address?: string
}

export interface GHResponse {
	itineraryFeature: LineString
	distance: number
	time: number
}

export interface SpringbootErrorResponse {
	error?: string
	message?: string
	path?: string
	status?: number
	timestamp?: number
	trace?: string
}

export interface PaginatedRestResponse<T> {
	_embedded: T
	page: {
		size: number
		totalElements: number
		totalPages: number
		number: number
	}
}
