function Header() {
  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Shortcak.es</h1>
        <nav>
          <a href="#" className="px-4 hover:text-gray-300">
            Home
          </a>
          <a href="#" className="px-4 hover:text-gray-300">
            About
          </a>
          <a href="#" className="px-4 hover:text-gray-300">
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}

export default Header;