import React from 'react'
import Navbar from '../Components/Navbar'
import { Outlet } from 'react-router'

const HomeLayout = () => {
    return (
        <div className='min-h-screen bg-gray-50'>
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    )
}

export default HomeLayout
