import pois from '../../src/mocks/data/pois.json'
import routing from '../../src/mocks/data/routing.json'
import { PoiFeature } from '../../src/types'
import { APPLICATION_NAME } from '../../src/const'

function get(id: string): ReturnType<typeof cy.get> {
	return cy.findByTestId(id)
}

// eslint-disable-next-line no-underscore-dangle
const getPoi = (id: number): PoiFeature =>
	pois._embedded.pois.find(
		poi => poi.properties.id === id
	) as unknown as PoiFeature

describe('Basic flow', () => {
	beforeEach(() => {
		cy.viewport('macbook-13')
		cy.intercept({ method: 'GET', url: '/api/pois' }, { body: pois }).as(
			'getPois'
		)
		cy.intercept({ method: 'POST', url: '/api/routing' }, { body: routing }).as(
			'routing'
		)
	})

	it('Should render the home page correctly', () => {
		cy.visit('/')

		cy.findByText(APPLICATION_NAME).should('exist')
		cy.findByText('Arrêts de bus').should('exist')
	})

	it('Should generate routing when selecting pois', () => {
		/* Arrange */
		const firstPoi = getPoi(535)
		const secondPoi = getPoi(540)
		const thirdPoi = getPoi(549)

		/* Act */
		// Click on pois
		get(`map-marker-${firstPoi.properties.id}`).parent().click({ force: true })
		get(`map-marker-${secondPoi.properties.id}`)
			.first()
			.parent()
			.click({ force: true })

		/* Assert */
		// Check if routing is made
		cy.wait('@routing').its('response.statusCode').should('eq', 200)

		/* Act */
		// Add third poi to list
		get(`map-marker-${thirdPoi.properties.id}`)
			.first()
			.parent()
			.click({ force: true })

		/* Assert */
		// Check if routing is made
		cy.wait('@routing').its('response.statusCode').should('eq', 200)
		// Check if poi is selected
		cy.findByText(firstPoi.properties.name).should('exist')
		cy.findByText(secondPoi.properties.name).should('exist')
		cy.findByText(thirdPoi.properties.name).should('exist')

		/* Act */
		cy.findByText(firstPoi.properties.name)
			.parent()
			.findAllByTestId('delete-poi')
			.click()
		/* Assert */
		cy.wait('@routing')
		cy.findByText(firstPoi.properties.name).should('not.exist')

		/* Act */
		cy.findByText(secondPoi.properties.name)
			.parent()
			.findAllByTestId('delete-poi')
			.click()
		/* Assert */
		cy.findByText(secondPoi.properties.name).should('not.exist')

		/* Act */
		cy.findByText(thirdPoi.properties.name)
			.parent()
			.findAllByTestId('delete-poi')
			.click()
		/* Assert */
		cy.findByText(thirdPoi.properties.name).should('not.exist')
	})

	it('Should render an error message', () => {
		/* Arrange */
		cy.viewport('iphone-xr')

		cy.intercept('/api/pois', response => response.destroy()).as('getPoisError')

		/* Act */
		cy.reload()

		/* Assert */
		cy.wait('@getPoisError')
		get('LoadingOrError').should('not.have.text', 'Chargement...')
	})
})
