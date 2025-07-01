'use client'
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Plus, Search, Trash2, Edit, X } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import ReactQuill from 'react-quill';
import { useRouter } from 'next/navigation';

// Define types
interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

interface Tag {
  id: number;
  name: string;
}

interface BlogPost {
  id: number;
  title: string;
  content: string;
  cover_image: string;
  tags: Tag[];
  user: User;
}

interface BlogResponse {
  message: string;
  error: string;
  success: boolean;
  data: {
    data: BlogPost[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}



export default function Blogs() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalSearch, setGlobalSearch] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [emailSearch, setEmailSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setIsLoading(true);
        
        // Get user data from localStorage
        const userDataString = localStorage.getItem('userData');
        if (!userDataString) {
          throw new Error('User data not found in localStorage');
        }
        
        const userData = JSON.parse(userDataString);
        const userId = userData.data.id;
        
        // Fetch blog posts
        const response = await fetch(`https://api.4pmti.com/blog?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch blog posts');
        }
        
        const result: BlogResponse = await response.json();
        if (result.success) {
          setBlogPosts(result.data.data);
        } else {
          throw new Error(result.error || 'Failed to fetch blog posts');
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  // Filter blog posts based on search criteria
  const filteredBlogPosts = blogPosts.filter(post => {
    const matchesGlobal = globalSearch === '' || 
      post.title.toLowerCase().includes(globalSearch.toLowerCase()) ||
      post.content.toLowerCase().includes(globalSearch.toLowerCase()) ||
      post.tags.some(tag => tag.name.toLowerCase().includes(globalSearch.toLowerCase())) ||
      post.user.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      post.user.email.toLowerCase().includes(globalSearch.toLowerCase());
    
    const matchesName = nameSearch === '' || 
      post.title.toLowerCase().includes(nameSearch.toLowerCase());
    
    const matchesEmail = emailSearch === '' || 
      post.user.email.toLowerCase().includes(emailSearch.toLowerCase());
    
    return matchesGlobal && matchesName && matchesEmail;
  });

  // Function to strip HTML tags for preview
  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Function to get preview text
  const getPreview = (content: string, length = 100) => {
    const stripped = stripHtml(content);
    return stripped.length > length 
      ? stripped.substring(0, length) + '...' 
      : stripped;
  };

  // Function to handle delete confirmation
  const handleDeleteClick = (post: BlogPost) => {
    setPostToDelete(post);
    setShowDeleteModal(true);
  };

  // Function to handle actual deletion
  const handleConfirmDelete = async () => {
    if (!postToDelete) return;

    try {
      setIsDeleting(true);
      
      // Get auth token
      const userDataString = localStorage.getItem('accessToken');
      if (!userDataString) {
        throw new Error('User data not found in localStorage');
      }
      
      // const userData = JSON.parse(userDataString);
      const authToken = userDataString;
      
      // Delete the blog post
      const response = await fetch(`https://api.4pmti.com/blog/${postToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete blog post');
      }
      
      const result = await response.json();
      if (result.success) {
        // Update local state
        setBlogPosts(prevPosts => prevPosts.filter(post => post.id !== postToDelete.id));
        setSuccessMessage(`Successfully deleted "${postToDelete.title}"`);
        setShowSuccessModal(true);
      } else {
        throw new Error(result.error || 'Failed to delete blog post');
      }
    } catch (error) {
      console.error('Error deleting blog post:', error);
      alert('Failed to delete blog post. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setPostToDelete(null);
    }
  };

  // Function to handle edit click
  const handleEditClick = (post: BlogPost) => {
    router.push(`/blog/edit/${post.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Blogs | PMTI Dashboard</title>
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-semibold text-gray-800">Blogs</h1>
          <Link href={'/blog/add'}>
            <button 
              className="bg-black text-white px-4 py-2 rounded-md flex items-center gap-2 transition duration-300"
            >
              <Plus size={16} />
              <span>Add Blog</span>
            </button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search globally..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />
          </div>
          
          <input
            type="text"
            placeholder="Search by title..."
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
          />
          
          <input
            type="text"
            placeholder="Search by email..."
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            value={emailSearch}
            onChange={(e) => setEmailSearch(e.target.value)}
          />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Responsive table with horizontal scroll on mobile */}
            <div className="overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cover Image
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                      Content Preview
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                      Tags
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                      Author
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBlogPosts.length > 0 ? (
                    filteredBlogPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {post.cover_image && (
                            <img 
                              src={post.cover_image} 
                              alt={post.title}
                              className="h-20 w-20 object-cover rounded"
                            />
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{post.title}</div>
                        </td>
                        <td className="px-6 py-4 max-w-[200px]">
                          <div 
                            className="text-sm text-gray-500 truncate"
                            data-tooltip-id={`tooltip-${post.id}`}
                            data-tooltip-content={getPreview(post.content, 300)}
                          >
                            {getPreview(post.content, 50)}
                          </div>
                          <Tooltip 
                            id={`tooltip-${post.id}`} 
                            place="top"
                            className="max-w-sm bg-black text-white rounded p-2 text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {post.tags.map((tag) => (
                              <span 
                                key={tag.id} 
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-1"
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{post.user.name}</div>
                          <div className="text-sm text-gray-500">{post.user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <button 
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => handleEditClick(post)}
                              aria-label="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDeleteClick(post)}
                              aria-label="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No blog posts found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredBlogPosts.length}</span> of{' '}
                <span className="font-medium">{blogPosts.length}</span> results
              </div>
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {showDeleteModal && postToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete "<span className="font-medium">{postToDelete.title}</span>"? 
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-center mb-4 text-green-500">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-center text-gray-900 mb-2">Success!</h3>
              <p className="text-sm text-center text-gray-500 mb-4">{successMessage}</p>
              <div className="flex justify-center">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}