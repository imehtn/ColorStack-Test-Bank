import React from 'react'
import { Link } from 'react-router-dom'
import '../css/Navbar.css'

const Navbar = () => {

    return (
        <nav className='navbar'>
            <Link to='/' className='navbar-brand'>
                <img src='/logo.png' alt='ColorStack Logo' className='navbar-logo' />
            </Link>
            <div className="navbar-right">
                <Link to='/' className='navbar-link'>Home</Link>
                <Link to='/upload' className='navbar-link'>Upload</Link>
                <Link to='/leaderboard' className='navbar-link'>Leaderboard</Link>

            </div>
        </nav>
    )
}

export default Navbar