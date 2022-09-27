import { screen } from '@testing-library/react'
import App from 'App'
import renderWithProviders from 'testUtils'
import { APPLICATION_NAME } from '../const'

describe('<App />', () => {
	it('renders', async () => {
		window.history.pushState({}, 'Home', '/')
		renderWithProviders(<App />, false)

		expect(screen.getByText('Chargement...')).toBeInTheDocument()
		await expect(
			screen.findByText(APPLICATION_NAME)
		).resolves.toBeInTheDocument()
		await expect(
			screen.findByText('Arrêts de bus')
		).resolves.toBeInTheDocument()
	})
})
