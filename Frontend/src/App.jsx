import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Land from './section/Landing'
import About from './section/About'
import Popular from './section/Popular'
const App = () => {
  return (
    <div className="container mx-auto max-w-7xl">
      <Land/>
      <About/>
      <Popular/>
      {/* <Routes>
        <Route path='/' element={<Land />} />

      </Routes> */}
    </div>
  )
}

export default App
