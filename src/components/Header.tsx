import type { ReactElement } from 'react'
import { APPLICATION_NAME } from '../const'

export default function Header(): ReactElement {
	return (
		<header>
			<nav className='navbar navbar-expand-lg relative flex w-full items-center justify-between bg-white py-4 shadow-md'>
				<div className='bg-transparent px-6 text-xl text-gray-600 hover:text-gray-700'>
					{APPLICATION_NAME}
				</div>
			</nav>
		</header>
	)
}
