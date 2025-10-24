import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider} from '@react-oauth/google';
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="403877528881-idrp3lmfrlf6qiuc0okdgonr30rg8jj1.apps.googleusercontent.com">
    <BrowserRouter><App /></BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
)
