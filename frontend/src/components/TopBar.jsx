const Topbar = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="bg-gray-800 text-white px-4 py-2 flex justify-between">
      <h1 className="text-lg font-bold">🏌️‍♂️ Golf App</h1>
      <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded">
        로그아웃
      </button>
    </div>
  );
};

export default Topbar;
