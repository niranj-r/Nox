

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
    <footer className="relative z-10 bg-gray-100 dark:bg-[#1A1A1A] border-t border-gray-200 dark:border-[#4A4A4A] transition-smooth">
      {/* top section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="max-w-md mb-8 md:mb-0">
            <button
              onClick={() => handleNav('home')}
              className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white mb-2 transition-smooth"
            >
              NOX
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Thank you for being part of my very first chapter. More than jewellery, it’s the beginning of a dream coming to life.
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <nav>
              <ul className="flex flex-wrap gap-8 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-700 dark:text-gray-300">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => handleNav(link.page)}
                      className="hover:text-black dark:hover:text-white transition-smooth font-bold uppercase tracking-[0.2em] text-[10px]"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Social icons */}
            <div className="flex items-center gap-5">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/nox.co.in?igsh=MThsZGVyYzV1a3Bpcg=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-smooth"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/918078322848"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-smooth"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </a>
            </div>
          </div>
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
            <span className="font-semibold">Powered by UR Flow</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
