import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Breadcrumbs from './Breadcrumbs'

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs />
        <main className="mt-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
