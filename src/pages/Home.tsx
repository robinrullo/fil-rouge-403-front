import getPois from 'api/getPois'
import Head from 'components/Head'
import LoadingOrError from 'components/LoadingOrError'
import type { ReactElement, MouseEvent as ReactMouseEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import Header from '../components/Header'
import { useEffect, useState } from 'react'
import {
	latitude,
	longitude,
	mapboxAccessToken,
	zoom
} from '../config/mapbox.config'
import type { MapboxEvent } from 'react-map-gl'
import Map, {
	FullscreenControl,
	GeolocateControl,
	Layer,
	Marker,
	NavigationControl,
	ScaleControl,
	Source
} from 'react-map-gl'
import Pin from '../components/pin'
import 'mapbox-gl/dist/mapbox-gl.css'
import type {
	PoiFeatureCollection,
	PoiFeature,
	GHResponse,
	SpringbootErrorResponse
} from '../types'
import { toast } from 'react-toastify'
import { ITINERARY_LAYER_SOURCE } from '../const'
import type { FeatureCollection, LineString } from 'geojson'

const EMPTY_ITINERARY: FeatureCollection<LineString> = {
	features: [],
	type: 'FeatureCollection'
}

export default function Home(): ReactElement {
	const { isLoading, isError, error, data } = useQuery<PoiFeatureCollection>(
		['pois'],
		getPois
	)
	const [poiList, setPoiList] = useState<PoiFeature[]>([])
	const [pins, setPins] = useState<ReactElement[]>()
	const [itineraries, setItineraries] =
		useState<FeatureCollection<LineString>>(EMPTY_ITINERARY)

	/**
	 * Update itinerary when poiList change
	 */
	useEffect(() => {
		const fetchItinerary = async (): Promise<GHResponse> => {
			const response = await fetch('/api/routing', {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					profile: 'car',
					points: poiList.map(f => f.geometry.coordinates)
				})
			})

			if (!response.ok) {
				let message =
					'Une erreur est survenue lors de la communication avec le serveur.'
				try {
					const jsonResponse = (await response.json()) as
						| SpringbootErrorResponse
						| undefined
					if (jsonResponse?.message) {
						message = jsonResponse.message
					}
				} catch {
					// void
				}
				throw new Error(message)
			}

			return (await response.json()) as GHResponse
		}

		// Itinerary needs at least 2 points to be calculated.
		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
		if (poiList.length > 1) {
			fetchItinerary()
				.then(response => {
					setItineraries({
						type: 'FeatureCollection',
						features: [
							{
								type: 'Feature',
								properties: {},
								geometry: response.itineraryFeature
							}
						]
					})
				})
				.catch(error_ => {
					if (error_ instanceof Error) {
						toast(error_.message)
					} else toast('Une Erreur inconnue est survenue')
				})
		} else {
			setItineraries(EMPTY_ITINERARY)
		}
	}, [poiList])

	/**
	 * Initialize Pois on the map
	 */
	useEffect(() => {
		if (!data) return
		const onNewPoiSelected = (
			event: MapboxEvent<MouseEvent>,
			feature: PoiFeature
		): void => {
			event.originalEvent.stopPropagation()

			setPoiList(current => [...current, feature])
		}

		setPins(
			data.features.map(feature => {
				const [lon, lat] = feature.geometry.coordinates
				return (
					<Marker
						key={`marker-${feature.properties.id}`}
						longitude={lon}
						latitude={lat}
						onClick={(event): void => onNewPoiSelected(event, feature)}
						anchor='bottom'
					>
						<Pin data-testid={`map-marker-${feature.properties.id}`} />
					</Marker>
				)
			})
		)
	}, [data])

	// While application is loading, display loading in view
	if (isLoading || isError) {
		return <LoadingOrError error={error as Error} />
	}

	/**
	 * Delete Poi from list handler function
	 * @param event The event triggered by navigator
	 * @param feature The feature to delete
	 */
	const onDeleteSelectedPoi = (
		event: ReactMouseEvent<HTMLButtonElement>,
		feature: PoiFeature
	): void => {
		event.stopPropagation()
		setPoiList(current =>
			current.filter(c => c.properties.id !== feature.properties.id)
		)
	}

	return (
		<div className='flex h-screen flex-col'>
			<Head title='Transport Routing' />
			<Header />

			<div className='flex h-full w-full'>
				<div className='h-full w-2/3'>
					<Map
						mapboxAccessToken={mapboxAccessToken}
						mapStyle='mapbox://styles/mapbox/streets-v11'
						initialViewState={{
							longitude,
							latitude,
							zoom
						}}
					>
						<GeolocateControl position='top-left' />
						<FullscreenControl position='top-left' />
						<NavigationControl position='top-left' />
						<ScaleControl />

						{pins}
						<Source type='geojson' data={itineraries}>
							<Layer
								id={ITINERARY_LAYER_SOURCE}
								type='line'
								layout={{
									'line-join': 'round',
									'line-cap': 'round'
								}}
								paint={{
									'line-color': '#00ff51',
									// eslint-disable-next-line @typescript-eslint/no-magic-numbers
									'line-width': 8
								}}
							/>
						</Source>
					</Map>
				</div>
				<div className='h-full w-1/3'>
					<div className='flex flex-col'>
						<div className='overflow-x-hidden'>
							<div className='inline-block min-w-full py-2 sm:px-6 lg:px-8'>
								<div className='overflow-hidden'>
									<table className='min-w-full'>
										<thead className='border-b-2'>
											<tr>
												<th
													scope='col'
													className='px-6 py-4 text-left text-sm font-medium'
												>
													Arrêts de bus
												</th>
											</tr>
										</thead>
										<tbody>
											{poiList.map(f => (
												<tr
													key={`poi-list-${f.properties.id}`}
													className='border-b'
												>
													<td className='whitespace-nowrap px-6 py-4 text-sm'>
														{f.properties.name}
													</td>
													<td className='whitespace-nowrap px-6 py-4 text-sm font-light'>
														<button
															data-testid='delete-poi'
															type='button'
															className='inline-flex items-center rounded-md bg-red-600 px-2 py-2 text-sm font-medium text-white hover:bg-red-700'
															onClick={(event): void =>
																onDeleteSelectedPoi(event, f)
															}
														>
															<svg
																xmlns='http://www.w3.org/2000/svg'
																className='h-5 w-5'
																fill='none'
																viewBox='0 0 24 24'
																stroke='currentColor'
															>
																<path
																	strokeLinecap='round'
																	strokeLinejoin='round'
																	strokeWidth='2'
																	d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
																/>
															</svg>
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
