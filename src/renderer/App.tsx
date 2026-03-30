import { useState } from 'react'
import { VideoProvider } from './store/videoContext'
import { PlayerPage } from './pages/PlayerPage'
import { LibraryPage } from './pages/LibraryPage'
import { HistoryPage } from './pages/HistoryPage'

type Page = 'player' | 'library' | 'history'

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('player')

  return (
    <VideoProvider>
      <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
        {/* Sidebar nav */}
        <nav className="flex flex-col items-center w-14 bg-gray-900 border-r border-gray-800 py-3 shrink-0">
          <div className="mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          <div className="flex flex-col gap-1 flex-1">
            {[
              {
                page: 'player' as Page,
                label: '플레이어',
                icon: (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
                  </svg>
                )
              },
              {
                page: 'library' as Page,
                label: '라이브러리',
                icon: (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 5H10V5h8v2zm0 4H10V9h8v2zm-3 4H10v-2h5v2zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z" />
                  </svg>
                )
              },
              {
                page: 'history' as Page,
                label: '재생 기록',
                icon: (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0013 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
                  </svg>
                )
              }
            ].map(({ page, label, icon }) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                title={label}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-500 hover:text-white hover:bg-gray-800'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {currentPage === 'player' && <PlayerPage />}
          {currentPage === 'library' && <LibraryPage />}
          {currentPage === 'history' && <HistoryPage />}
        </main>
      </div>
    </VideoProvider>
  )
}
