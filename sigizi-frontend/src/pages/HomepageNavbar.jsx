import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageDropdown from "../components/LanguageDropdown";

export default function HomepageNavbar() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Menu dengan terjemahan dinamis
  const navLinks = [
    { name: t("homepage.nav.beranda"), href: "#beranda" },
    { name: t("homepage.nav.fitur"), href: "#fitur" },
    { name: t("homepage.nav.artikel"), href: "#artikel" },
    { name: t("homepage.nav.berita"), href: "#berita" },
  ];

  const textColor = scrolled ? "text-gray-700" : "text-white";
  const logoTextColor = scrolled ? "text-emerald-700" : "text-white";

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <div
            className={`flex items-center gap-2 cursor-pointer ${logoTextColor}`}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <img 
              src="/logo.png" 
              alt="SI-GIZI SIGAP Logo" 
              className="h-10 w-12 object-contain"
            />
            <span className="font-bold text-lg hidden sm:inline">{t("homepage.footer.brand")}</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`${textColor} font-medium hover:text-emerald-500 transition-colors`}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageDropdown />
            <button
              onClick={() => navigate("/login")}
              className={`px-5 py-2 rounded-xl font-semibold transition-all ${
                scrolled
                  ? "border border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                  : "border border-white text-white hover:bg-white/10"
              }`}
            >
              {t("homepage.hero.login")}
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-5 py-2 rounded-xl font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-md"
            >
              {t("homepage.hero.register")}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden ${textColor} text-xl focus:outline-none`}
          >
            <FontAwesomeIcon icon={fas.faBars} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white shadow-lg border-t border-gray-100">
          <div className="px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="block py-2 text-gray-700 font-medium hover:text-emerald-600 transition-colors"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-3 flex gap-3">
              <button
                onClick={() => navigate("/login")}
                className="flex-1 border border-emerald-600 text-emerald-600 py-2 rounded-xl font-semibold hover:bg-emerald-50 transition"
              >
                {t("homepage.hero.login")}
              </button>
              <button
                onClick={() => navigate("/register")}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-xl font-semibold hover:bg-emerald-700 transition"
              >
                {t("homepage.hero.register")}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}