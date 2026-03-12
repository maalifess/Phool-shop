import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({
  children,
  hideNavbar = false,
  hideFooter = false,
}: {
  children: ReactNode;
  hideNavbar?: boolean;
  hideFooter?: boolean;
}) => {
  return (
    <div className="flex min-h-screen flex-col">
      {!hideNavbar && <Navbar />}
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default Layout;
