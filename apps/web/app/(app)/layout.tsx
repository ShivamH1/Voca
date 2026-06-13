import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="lg:ml-72 pt-20 min-h-screen">{children}</div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-canvas border-t border-hairline-strong flex justify-around items-center h-16 z-50">
        {[
          { icon: 'upload_file', label: 'Upload', href: '/upload' },
          { icon: 'history', label: 'History', href: '/history' },
          { icon: 'dashboard', label: 'Results', href: '/results' },
          { icon: 'auto_awesome', label: 'Chat', href: '/chat' },
        ].map(({ icon, label, href }) => (
          <a key={href} href={href} className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{icon}</span>
            <span className="text-[10px] uppercase tracking-widest mt-1">{label}</span>
          </a>
        ))}
      </nav>
    </>
  )
}
