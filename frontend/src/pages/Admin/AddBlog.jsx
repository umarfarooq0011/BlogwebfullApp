import { useEffect, useRef, useState } from "react";
import { FaCloudUploadAlt, FaFeatherAlt, FaTags } from "react-icons/fa";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import axios from "axios";
import { toast } from "react-toastify";
import {parse} from "marked";


const AddBlog = ({ role = "admin" }) => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const quillInitializedRef = useRef(false);

  const [thumbnail, setThumbnail] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("startup");
  const [isPublished, setIsPublished] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [categories, setCategories] = useState(["startup", "technology", "lifestyle"]);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingDraft] = useState(false);
  const [blogContent] = useState("");

  // Initialize Quill
  useEffect(() => {
    // Initialize Quill only if it hasn't been initialized and the container exists
    if (editorRef.current && !quillInitializedRef.current) {
      const toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
      ];

      quillRef.current = new Quill(editorRef.current, {
        modules: {
          toolbar: toolbarOptions
        },
        theme: 'snow',
        placeholder: 'Write your blog content here...',
      });

      quillInitializedRef.current = true;
    }
  }, []);

  // Set blog content when it's loaded and Quill is initialized
  useEffect(() => {
    if (quillRef.current && blogContent && !loadingDraft) {
      quillRef.current.root.innerHTML = blogContent;
    }
  }, [blogContent, loadingDraft]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const generateContent = async () => {
    // AI content generation logic here
    if(!title && !description && !thumbnail) return toast.error("Title and description and thumbnail are required");
    try {
      setIsGenerating(true);
      const { data } = await axios.post("/api/blog/generate-content", {
        prompt: `${title} ${description}`
      });
      if(data.success){
        quillRef.current.root.innerHTML = parse(data.content)
      }else {toast.error(data.message)}

    } catch (error) {
       toast.error(error.message)
    } finally{
      setIsGenerating(false);
    }
    
   
  };

  const onSumbitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create form data object
      const formData = new FormData();
      
      // First, validate critical fields
      if (!title.trim() || !description.trim() || (!thumbnail && !previewUrl)) {
        toast.error("Title, description and thumbnail are required");
        setLoading(false);
        return;
      }
      
      // Get the content from quill editor
      const content = quillRef.current?.root.innerHTML || "";
      if (!content.trim() || content === '<p><br></p>') {
        toast.error("Blog content is required");
        setLoading(false);
        return;
      }
      
      // Create blog data object
      const blogData = {
        title,
        description,
        content,
        thumbnail: "placeholder-for-formdata", // Actual file is uploaded separately
        category: useCustomCategory ? customCategory : category,
        isPublished,
        role // Include the role from props
      };
      
      // Append the blog data as JSON string
      formData.append("blog", JSON.stringify(blogData));
      
      // Append the thumbnail file if a new one is selected
      if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }

      let response;
      
      // Create new blog
      response = await axios.post("/api/blog/addblog", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true
      });
      
      if (response.data.success) {
        toast.success("Blog created successfully");
        // Reset form for new blog creation
        setTitle("");
        setDescription("");
        setThumbnail(null);
        setPreviewUrl(null);
        if (quillRef.current) {
          quillRef.current.root.innerHTML = "";
        }
      }
      
    } catch (err) {
      console.error("Error submitting blog:", err);
      const message = err.response?.data?.message || "Failed to process blog";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              Create New Blog Post
            </h1>
            {role === "admin" ? (
              <div className="mt-1 bg-red-100 border border-red-400 text-red-700 px-2 py-1 rounded-md inline-flex items-center">
                <span className="text-sm font-semibold">Publishing as Admin</span>
              </div>
            ) : (
              <div className="mt-1 bg-blue-100 border border-blue-400 text-blue-700 px-2 py-1 rounded-md inline-flex items-center">
                <span className="text-sm font-semibold">Publishing as Author</span>
              </div>
            )}
          </div>
          <FaFeatherAlt className="text-3xl text-indigo-600" />
        </div>

        {loadingDraft ? (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
              <p className="text-gray-700">Loading blog content...</p>
            </div>
          </div>
        ) : (
          <form id="blogForm" onSubmit={onSumbitHandler} className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 sm:p-8">
            <div className="grid grid-cols-1 gap-8">
              {/* Top Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group">
                  <label className="inline-block text-lg font-semibold text-gray-700 mb-3">
                    Upload Thumbnail
                  </label>
                  <label
                    className="relative flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-indigo-300 rounded-2xl cursor-pointer bg-indigo-50/50 hover:bg-indigo-100 transition-all duration-300"
                    htmlFor="image"
                  >
                    {previewUrl ? (
                      <>
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                          <p className="text-white text-sm font-medium">Change Image</p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <FaCloudUploadAlt className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500 mt-2">PNG, JPG or JPEG</p>
                      </div>
                    )}
                    <input
                      onChange={handleImageChange}
                      type="file"
                      id="image"
                      accept="image/*"
                      className="hidden"
                      required={!previewUrl} // Only required if no preview exists
                    />
                  </label>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                      Blog Title
                    </label>
                    <input
                      type="text"
                      placeholder="Enter an engaging title"
                      className="w-full text-black p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                      Description
                    </label>
                    <textarea
                      placeholder="Write a compelling description"
                      className="w-full text-black p-4 border border-gray-300 rounded-xl h-32 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                      Category
                    </label>
                    <select
                      value={useCustomCategory ? "custom" : category}
                      onChange={(e) => {
                        if (e.target.value === "custom") {
                          setUseCustomCategory(true);
                        } else {
                          setUseCustomCategory(false);
                          setCategory(e.target.value);
                        }
                      }}
                      className="w-full p-4 border text-black border-blue-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="custom">Custom</option>
                    </select>
                    {useCustomCategory && (
                      <div className="flex flex-col sm:flex-row items-center mt-2 gap-2">
                        <input
                          type="text"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          placeholder="Enter custom category"
                          className="w-full p-4 border text-black border-blue-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customCategory && !categories.includes(customCategory)) {
                              setCategories([...categories, customCategory]);
                              setCategory(customCategory);
                              setUseCustomCategory(false);
                              setCustomCategory("");
                            }
                          }}
                          className="w-full sm:w-auto bg-indigo-500 text-white px-4 py-4 sm:py-2 rounded-xl hover:bg-indigo-600 shrink-0"
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Editor Section */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  Blog Content
                </label>
                <div className="relative">
                  <div ref={editorRef} className="min-h-[480px] text-black bg-white rounded-xl"></div>
                  
                  {isGenerating && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-10">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                      <p className="text-gray-700 font-semibold">Generating content with AI...</p>
                      <p className="text-gray-500 text-sm">Please wait a moment.</p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={generateContent}
                    disabled={loading || isGenerating}
                    className="absolute bottom-4 right-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-xl font-medium flex items-center justify-center w-auto z-20"
                  >
                    <div className="flex items-center space-x-2">
                      <span>Generate with AI</span>
                      <FaTags className="w-4 h-4" />
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  disabled={loading || isGenerating}
                  onClick={() => {
                    setIsPublished(false);
                    setTimeout(() => document.getElementById('blogForm').dispatchEvent(new Event('submit', { bubbles: true })), 0);
                  }}
                  className={`w-full sm:w-auto bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-4 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-md hover:shadow-xl font-medium flex items-center justify-center space-x-2 ${loading || isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading && !isPublished ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save as Draft</span>
                  )}
                </button>
                
                <button
                  type="button"
                  disabled={loading || isGenerating}
                  onClick={() => {
                    setIsPublished(true);
                    setTimeout(() => document.getElementById('blogForm').dispatchEvent(new Event('submit', { bubbles: true })), 0);
                  }}
                  className={`w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-xl font-medium flex items-center justify-center space-x-2 ${loading || isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading && isPublished ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <span>Publish Now</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddBlog;
