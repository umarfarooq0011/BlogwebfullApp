import {
  FaHome,
  FaPlus,
  FaComments,
  FaList,
  FaUsers,
  FaEnvelope
} from 'react-icons/fa';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="min-h-screen w-64 p-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl">
      <h2 className="text-xl font-bold mb-6 text-center tracking-wide text-blue-400">
        Admin Panel
      </h2>

      <nav className="flex flex-col gap-4">
        <NavLink
          end
          to="/admin"
          className={({ isActive }) =>
            `flex items-center gap-4 px-4 py-2 rounded-lg font-medium transition duration-200 transform hover:scale-[1.02] hover:bg-gray-700 hover:shadow-md ${
              isActive ? 'bg-gray-700 text-blue-400 shadow' : 'text-white'
            }`
          }
        >
          <FaHome size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/addblog"
          className={({ isActive }) =>
            `flex items-center gap-4 px-4 py-2 rounded-lg font-medium transition duration-200 transform hover:scale-[1.02] hover:bg-gray-700 hover:shadow-md ${
              isActive ? 'bg-gray-700 text-blue-400 shadow' : 'text-white'
            }`
          }
        >
          <FaPlus size={20} />
          <span>Add Blog</span>
        </NavLink>

        <NavLink
          to="/admin/comments"
          className={({ isActive }) =>
            `flex items-center gap-4 px-4 py-2 rounded-lg font-medium transition duration-200 transform hover:scale-[1.02] hover:bg-gray-700 hover:shadow-md ${
              isActive ? 'bg-gray-700 text-blue-400 shadow' : 'text-white'
            }`
          }
        >
          <FaComments size={20} />
          <span>Comments</span>
        </NavLink>

        <NavLink
          to="/admin/ListBlog"
          className={({ isActive }) =>
            `flex items-center gap-4 px-4 py-2 rounded-lg font-medium transition duration-200 transform hover:scale-[1.02] hover:bg-gray-700 hover:shadow-md ${
              isActive ? 'bg-gray-700 text-blue-400 shadow' : 'text-white'
            }`
          }
        >
          <FaList size={20} />
          <span>Blog List</span>
        </NavLink>

        <NavLink
          to="/admin/Users"
          className={({ isActive }) =>
            `flex items-center gap-4 px-4 py-2 rounded-lg font-medium transition duration-200 transform hover:scale-[1.02] hover:bg-gray-700 hover:shadow-md ${
              isActive ? 'bg-gray-700 text-blue-400 shadow' : 'text-white'
            }`
          }
        >
          <FaUsers size={20} />
          <span>Users</span>
        </NavLink>

        <NavLink
          to="/admin/Newslettermanager"
          className={({ isActive }) =>
            `flex items-center gap-4 px-4 py-2 rounded-lg font-medium transition duration-200 transform hover:scale-[1.02] hover:bg-gray-700 hover:shadow-md ${
              isActive ? 'bg-gray-700 text-blue-400 shadow' : 'text-white'
            }`
          }
        >
          <FaEnvelope size={20} />
          <span>Newsletter</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
