import Footer from "../components/Footer"
import Header from "../components/Header"
import Navbar from "../components/Navbar"
import NewsLetter from "../components/NewsLetter"
import BlogList from "./BlogList"

const Blog = () => {
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col gap-4 px-2 sm:px-4 md:px-8 max-w-7xl mx-auto w-full">
        <Header />
        <BlogList />
        <NewsLetter />
        <Footer />
      </div>
    </div>
  )
}
export default Blog