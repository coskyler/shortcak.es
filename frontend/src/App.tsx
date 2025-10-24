import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import Login from './components/Login'
import Signup from './components/Signup'
import  Dashboard from './components/Dashboard'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <Dashboard></Dashboard>
      </div>
        
    </>
  )
}

export default App
