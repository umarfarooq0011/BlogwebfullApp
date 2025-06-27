import React from 'react';
import { FaSearch, FaStar } from 'react-icons/fa';

const Header = () => {
  return <>
    <div className='mx-8 sm:mx-16 xl:mx-24 bg-cyan-950 p-8 rounded-lg shadow-xl text-center'>
      <p className='text-3xl sm:text-4xl font-bold text-white mb-4'>
        New AI Feature - To Write Blog Posts
      </p>
      <div className='flex justify-center items-center mb-4'>
        <FaStar className='text-yellow-500 text-4xl animate-pulse' />
      </div>
      <span className='text-xl text-yellow-400 font-semibold'>Start creating with AI</span>
    </div>

    <section className='mt-10 text-center'>
  <h1 className='text-4xl sm:text-5xl font-bold text-white mb-2'>
    Your own AI <span className="text-blue-500">Blogging</span> Assistant
  </h1>
  <p className='text-xl text-white mx-8 sm:mx-16 xl:mx-24 mt-4'>
    This is your space to write, create, and share your thoughts with the world.
    <br />
    <span className='text-yellow-400'>
      Start writing today!
    </span>
  </p>









</section>

  

    

  </>
};

export default Header;
