// src/components/Layout.jsx
const Layout = ({ children }) => {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-dark_void p-10 gap-6">
        {children}
      </div>
    );
  };
  
  export default Layout;
  