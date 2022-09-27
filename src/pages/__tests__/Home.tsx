import { screen } from '@testing-library/react'
import Home from 'pages/Home'
import renderWithProviders, {
	MOBILE_RESOLUTION_HEIGHT,
	MOBILE_RESOLUTION_WIDTH
} from 'testUtils'
import App from '../../App'

describe('<Home />', () => {
	it('renders', async () => {
		// Arrange
		window.history.pushState({}, 'Home', '/')
		renderWithProviders(<App />, false)

		expect(screen.getByText('Chargement...')).toBeInTheDocument()
	})
	it('renders with mobile resolution', async () => {
		window.resizeTo(MOBILE_RESOLUTION_WIDTH, MOBILE_RESOLUTION_HEIGHT)
		renderWithProviders(<Home />)
	})
})
