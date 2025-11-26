import React, { StrictMode, Suspense, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './core/data/redux/store'
import ALLRoutes from './router/router.tsx'
import { base_path } from './environment.ts'
import './assets/css/main.css'
import './assets/css/layout.css'
import './index.css'

const App = () => {
  const [bootLoading, setBootLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setBootLoading(false), 600)
    return () => clearTimeout(t)
  }, [])
  return (
    <StrictMode>
      {bootLoading ? <div className="global-loader"><div className="loader"></div></div> : null}
      <Provider store={store}>
        <BrowserRouter basename={base_path} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <Suspense fallback={<div className="loader-wrap"><div className="loader"></div></div>}>
            <ALLRoutes />
          </Suspense>
        </BrowserRouter>
      </Provider>
    </StrictMode>
  )
}

createRoot(document.getElementById('root')).render(<App />)