import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

// Simple test app to verify everything works
function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">POS System</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Point of Sale System - Frontend Loading Successfully
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2">Order Management</h2>
              <p className="text-muted-foreground">Create and manage customer orders</p>
            </div>
            
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2">Kitchen Display</h2>
              <p className="text-muted-foreground">Track order preparation status</p>
            </div>
            
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2">Payment Processing</h2>
              <p className="text-muted-foreground">Handle checkout and payments</p>
            </div>
          </div>

          <div className="mt-8">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Frontend Ready - Waiting for Backend Connection
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

