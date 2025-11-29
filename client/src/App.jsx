import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Navbar from './components/Navbar'
import Upload from './components/Upload'
import Leaderboard from './components/Leaderboard'

function App() {
  return (
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />}></Route>
          <Route path='/upload' element={<Upload />}></Route>
          <Route path='/leaderboard' element={<Leaderboard />}></Route>
        </Routes>
      </BrowserRouter>
  )
}

export default App
