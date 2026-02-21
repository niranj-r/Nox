

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const handleNav = (page: string) => {
    if (page === 'collections') {
      if (onNavigate) onNavigate('home');
      setTimeout(() => {
        const el = document.getElementById('collections');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      if (onNavigate) onNavigate(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const links = [
    { label: 'About', page: 'home' },
    { label: 'Collections', page: 'collections' },
  ];

  return (
    <footer className="bg-gray-100 dark:bg-[#1A1A1A] border-t border-gray-200 dark:border-[#4A4A4A] transition-smooth">
      {/* top section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="max-w-md mb-8 md:mb-0">
            <button
              onClick={() => handleNav('home')}
              className="text-2xl font-black uppercase tracking-tighter text-primary dark:text-white mb-2 transition-smooth"
            >
              NOX
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Premium curated collections of designer jewelry and accessories. Discover pieces that express your style.
            </p>
          </div>
          <nav>
            <ul className="flex flex-wrap gap-8 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-700 dark:text-gray-300">
              {links.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleNav(link.page)}
                    className="hover:text-primary dark:hover:text-white transition-smooth font-bold uppercase tracking-[0.2em] text-[10px]"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* bottom bar with copyright and payment logos */}
      <div className="bg-gray-200 dark:bg-[#121212] border-t border-gray-300 dark:border-[#4A4A4A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 dark:text-gray-400">
          <div className="mb-2 md:mb-0">
            &copy; {new Date().getFullYear()} NOX Inc. All rights reserved.
          </div>
          <div className="flex space-x-4">
            {/* placeholder icons for payment methods */}
            <span className="font-semibold">Designed and Developed by UR Flow</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
