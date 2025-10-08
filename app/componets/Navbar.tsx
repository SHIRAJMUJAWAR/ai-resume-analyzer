import React from 'react'
import { Link } from 'react-router'
 

const Navbar = () => {
  return (
     <nav className='navbar border'>
        <Link to="/"> 
        <p className='text-2xl font-bold text-gradient'>RESUMIND</p>
        </Link>
        <Link to="/upload" className='primary-button w-fit'>
          upload Resume
        </Link>
     </nav>
  )
}

export default Navbar
