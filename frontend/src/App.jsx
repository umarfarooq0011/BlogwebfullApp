import { Route, Routes } from 'react-router-dom';
import Landingpage from './pages/Landingpage';
import Blog from './pages/Blog';
import Loginpage from './pages/Loginpage';
import Signuppage from './pages/Signuppage';
import BlogArticle from './pages/BlogArticle';
import Layout from './pages/Admin/Layout';
import Dashboard from './pages/Admin/Dashboard';
import AddBlog from './pages/Admin/AddBlog';
import Listblog from './pages/Admin/Listblog';
import Comments from './pages/Admin/Comments';
import Users from './pages/Admin/Users';
import NewsletterManage from './pages/Admin/NewsletterManage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ForgetPasswordPage from './pages/ForgetPasswordPage';
import ProtectedRoute from './pages/ProtectedRoutes.jsx';

// Author UI imports
import AuthorLayout from './pages/Author-UI/AuthorLayout';
import AuthorDashboard from './pages/Author-UI/Authordashboard';
import AuthorListBlog from './pages/Author-UI/AuthorListBlog';
import AuthorComments from './pages/Author-UI/AuthorComments';
import AddAuthorBlog from './pages/Author-UI/AddAuthorBlog';




export const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landingpage />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogArticle />} />
        <Route path="/login" element={<Loginpage />} />
        <Route path="/signup" element={<Signuppage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/forget-password" element={<ForgetPasswordPage />} />

        {/* Admin Routes (Protected) */}
        <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="addBlog" element={<AddBlog />} />
          <Route path="editBlog/:id" element={<AddBlog />} />
          <Route path="ListBlog" element={<Listblog />} />
          <Route path="Comments" element={<Comments />} />
          <Route path="Users" element={<Users />} />
          <Route path="Newslettermanager" element={<NewsletterManage />} />
        </Route>

          {/* Author Routes (Protected) */}
        <Route path="/author" element={<AuthorLayout />}>
          <Route index element={<AuthorDashboard />} />
          <Route path="addblog" element={<AddAuthorBlog />} />
          <Route path="editBlog/:id" element={<AddAuthorBlog />} />
          <Route path="listblog" element={<AuthorListBlog />} />
          <Route path="comments" element={<AuthorComments />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
};

export default App;
