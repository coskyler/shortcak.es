import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import Login from './components/Login'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <Login></Login>
      </div>
        
    </>
  )
}

export default App
