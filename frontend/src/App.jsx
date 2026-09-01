import { signInWithPopup } from 'firebase/auth'
import React from 'react'
import { auth, googleProvider } from '../utils/firebase'
import api from "../utils/axios.js";

function App() {

  const handleLogin = async (token)=>{
    try {
      const {data} = await api.post("/auth/login",{token}) // 05. axios sends request from frontend to backend with token and returned response is stored as json {data}
      console.log(data)
    } catch (error) {
      console.log(error)
    }
  }

  const googleLogin = async ()=>{
    const data = await signInWithPopup(auth,googleProvider) // 02. Google login popup
    const token = await data.user.getIdToken() // 03. Storing the recieved token from google's returned response in token
    console.log(token)
    await handleLogin(token) // 04. Recieved token is sent to handleLogin func
    console.log(data)
  }

  return (
    <div style={{ background: "black", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
    {/* 01. The button is clicked and googleLogin func runs */}
    <button onClick={googleLogin} style={{ background: "#4285F4", color: "white", padding: "12px 20px", border: "none", borderRadius: "6px" }}>
      Continue with Google
    </button>
  </div>
  )
}

export default App
