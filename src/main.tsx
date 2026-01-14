import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import 'react-perfect-scrollbar/dist/css/styles.css'
import '@components/react-select/styles/react-select.css'
// import '@sweetalert2/theme-material-ui/material-ui.scss'
import './globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

import App from './App'
import { ToastMessageError } from './components/ToastMessage'
import ErrorFallback from './components/ErrorFallback'
import { TranslationProvider } from './contexts/TranslationContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
      retry: false,

      // staleTime: 0,
      // gcTime: 0,
      retryOnMount: false
    }
  },
  queryCache: new QueryCache({
    onError: (e: unknown) => {
      if (e instanceof Error) {
        ToastMessageError({
          message: e.message
        })
      }
    }
  })
})

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <TranslationProvider>
        <Suspense fallback={<div>Loading...</div>}>
          {/* <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={error => {
              ToastMessageError({ message: error.message })
            }}
          > */}
          <App />
          {/* </ErrorBoundary> */}
        </Suspense>
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </TranslationProvider>
    </QueryClientProvider>
  </BrowserRouter>
)
