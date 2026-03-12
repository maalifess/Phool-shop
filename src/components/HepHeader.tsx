import { Link } from "react-router-dom";

const HepHeader = () => {
  const navItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/catalog" },
    { label: "Custom Orders", href: "/custom-orders" },
    { label: "Tokri", href: "/tokri" },
  ];

  return (
    <div className="fixed top-8 left-1/2 z-50 -translate-x-1/2 transform">
      <nav className="flex items-center gap-1 rounded-full bg-white/80 px-6 py-3 shadow-lg backdrop-blur-sm border border-white/20">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            className="rounded-full px-4 py-2 text-sm font-medium text-[#442f2a] transition-colors hover:bg-[#F7F3ED] hover:text-[#BC8F8F]"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default HepHeader;
