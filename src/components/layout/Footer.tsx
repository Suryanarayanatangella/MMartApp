import { Mail, Phone, MapPin, Share2, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

// ── Types ─────────────────────────────────────────────────────────────────

interface FooterLink {
  label: string;
  href: string;
}

interface SocialLink {
  icon: React.ReactNode;
  href: string;
  label: string;
}

// ── Static data ───────────────────────────────────────────────────────────

const quickLinks: FooterLink[] = [
  { label: 'Home',     href: '/'        },
  { label: 'Shop',     href: '/store'   },
  { label: 'About Us', href: '/about'   },
  { label: 'Contact',  href: '/contact' },
];

const socialLinks: SocialLink[] = [
  { icon: <Share2 size={20} />,         href: '#', label: 'Share'    },
  { icon: <MessageCircle size={20} />,  href: '#', label: 'Chat'     },
  { icon: <Mail size={20} />,           href: '#', label: 'Email'    },
  { icon: <Phone size={20} />,          href: '#', label: 'Phone'    },
];

// ── Component ─────────────────────────────────────────────────────────────

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 flex-1">
              <div className="inline-flex items-center gap-2 mb-4 bg-white p-2 rounded">
                <div className="w-5 h-5 flex items-center justify-center">
                  <img src="/favicon.svg" className="img-fluid" alt="Logo" />
                </div>
                <span className="font-bold text-xl text-gray-900 hidden sm:inline">
                  M-Mart
                </span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm mb-4">
              Your trusted online marketplace for quality products and exceptional service.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="hover:text-blue-400 transition-colors"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              {quickLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link to={href} className="hover:text-white transition-colors text-sm">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex gap-3 items-start">
                <MapPin size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <span>123 Market Street, Business City, BC 12345</span>
              </li>
              <li className="flex gap-3 items-center">
                <Phone size={18} className="text-blue-400 flex-shrink-0" />
                <a href="tel:+1234567890" className="hover:text-white transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex gap-3 items-center">
                <Mail size={18} className="text-blue-400 flex-shrink-0" />
                <a href="mailto:support@maheswari.com" className="hover:text-white transition-colors">
                  support@maheswari.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-700 mb-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Maheswari Store. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            {(['Privacy Policy', 'Terms of Service', 'Cookie Policy'] as const).map((item) => (
              <a key={item} href="#" className="hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
