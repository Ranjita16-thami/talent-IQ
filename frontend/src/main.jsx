import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
 import { ClerkProvider } from '@clerk/clerk-react' // now we r rdy to use this

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing  Clerk Publishable Key')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
     <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
         <App /> 
      </ClerkProvider>
   
  </StrictMode>,
)

// in <App/> //wrapping our entire application with clerkprovider so that in our entire app we can use clerk we can use all the function all the hooks companies coming from the clerk