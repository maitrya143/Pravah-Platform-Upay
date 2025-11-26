import React from 'react';
import Home from './pages/Home';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <img 
            src="/mnt/data/A_flat-style_digital_illustration_depicts_three_st.png" 
            alt="Pravah Logo" 
            className="h-10"
          />
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen border-r">
          <div className="p-4">
            <p className="text-gray-500 text-sm">Sidebar placeholder</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-6">Pravah Dashboard</h1>
          <Home />
        </main>
      </div>
    </div>
  );
}

export default App;

