import { FaHome, FaPlus, FaComments, FaList } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="min-h-screen w-64 bg-gradient-to-b from-gray-900 to-gray-800 p-6 text-white shadow-lg">
      <h2 className="text-2xl font-bold text-center text-blue-400 mb-8 tracking-wide">
        Author Panel
      </h2>

      <nav className="flex flex-col gap-4">
        <NavLink
          end
          to="/author"
          className={({ isActive }) =>
            `flex items-center gap-4 px-4 py-3 rounded-md text-base font-medium transition duration-200 hover:bg-gray-700 hover:scale-[1.02] ${
              isActive ? 'bg-gray-700 text-blue-400 shadow-md' : 'text-white'
            }`
          }
        >
          <FaHome size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/author/addblog"
          className={({ isActive }) =>
            `flex items-center gap-4 px-4 py-3 rounded-md text-base font-medium transition duration-200 hover:bg-gray-700 hover:scale-[1.02] ${
              isActive ? 'bg-gray-700 text-blue-400 shadow-md' : 'text-white'
            }`
          }
        >
          <FaPlus size={20} />
          <span>Add Blog</span>
        </NavLink>

        <NavLink
          to="/author/listblog"
          className={({ isActive }) =>
            `flex items-center gap-4 px-4 py-3 rounded-md text-base font-medium transition duration-200 hover:bg-gray-700 hover:scale-[1.02] ${
              isActive ? 'bg-gray-700 text-blue-400 shadow-md' : 'text-white'
            }`
          }
        >
          <FaList size={20} />
          <span>List Blogs</span>
        </NavLink>

        <NavLink
          to="/author/comments"
          className={({ isActive }) =>
            `flex items-center gap-4 px-4 py-3 rounded-md text-base font-medium transition duration-200 hover:bg-gray-700 hover:scale-[1.02] ${
              isActive ? 'bg-gray-700 text-blue-400 shadow-md' : 'text-white'
            }`
          }
        >
          <FaComments size={20} />
          <span>Comments</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
