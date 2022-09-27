import LoadingOrError from 'components/LoadingOrError'
import type { ReactElement } from 'react'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'

const Home = lazy(async () => import('pages/Home'))

export default function App(): ReactElement {
	return (
		<>
			<BrowserRouter>
				<Suspense fallback={<LoadingOrError />}>
					<Routes>
						<Route path='/' element={<Home />} />
					</Routes>
				</Suspense>
			</BrowserRouter>
			<ToastContainer />
		</>
	)
}
