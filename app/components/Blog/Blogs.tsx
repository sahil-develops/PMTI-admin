'use client'
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Plus, Search, Trash2, Edit, X, ChevronLeft, ChevronRight, Tag, Globe } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import ReactQuill from 'react-quill';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

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
  error: string | string[];
  success: boolean;
  data: {
    data: BlogPost[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  } | null;
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
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Page Assignment Modal State
  const [showPageAssignmentModal, setShowPageAssignmentModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState<string>('');
  const [availablePages, setAvailablePages] = useState<string[]>([]);
  const [allArticlesForAssignment, setAllArticlesForAssignment] = useState<BlogPost[]>([]);
  const [selectedArticles, setSelectedArticles] = useState<BlogPost[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [pageSearchTerm, setPageSearchTerm] = useState('');
  const [articleSearchTerm, setArticleSearchTerm] = useState('');
  
  const router = useRouter();
  const { toast } = useToast();

  // Helper function to extract error message from API response
  const extractErrorMessage = (apiResponse: any): string => {
    if (apiResponse.error) {
      if (Array.isArray(apiResponse.error)) {
        return apiResponse.error.join(', ');
      } else if (typeof apiResponse.error === 'string') {
        return apiResponse.error;
      }
    }
    return 'An unexpected error occurred. Please try again.';
  };

  // Extract unique pages (tags) from blog posts
  const extractPagesFromPosts = (posts: BlogPost[]): string[] => {
    const pages = new Set<string>();
    posts.forEach(post => {
      post.tags.forEach(tag => {
        pages.add(tag.name);
      });
    });
    return Array.from(pages).sort();
  };

  const fetchBlogPosts = async (page = 1) => {
    try {
      setIsLoading(true);
      
      // Get user data from localStorage
      const userDataString = localStorage.getItem('userData');
      if (!userDataString) {
        throw new Error('User data not found. Please log in again.');
      }
      
      let userData;
      try {
        userData = JSON.parse(userDataString);
      } catch (parseError) {
        throw new Error('Invalid user data. Please log in again.');
      }
      
      if (!userData.data || !userData.data.id) {
        throw new Error('User ID not found. Please log in again.');
      }
      
      const userId = userData.data.id;
      
      // Fetch blog posts with pagination
      const response = await fetch(`https://api.4pmti.com/blog?userId=${userId}&page=${page}&limit=${itemsPerPage}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to access this resource.');
        } else if (response.status === 404) {
          throw new Error('Blog posts not found.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`Failed to fetch blog posts (${response.status})`);
        }
      }
      
      const result: BlogResponse = await response.json();
      if (result.success && result.data) {
        setBlogPosts(result.data.data);
        setTotalPages(result.data.meta.totalPages);
        setTotalItems(result.data.meta.total);
        setCurrentPage(result.data.meta.page);
        setError(null); // Clear any previous errors
        
        // Extract available pages from the fetched posts
        const pages = extractPagesFromPosts(result.data.data);
        setAvailablePages(pages);
      } else {
        const errorMessage = extractErrorMessage(result);
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch blog posts. Please try again later.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all articles for page assignment
  const fetchAllArticlesForAssignment = async () => {
    try {
      setIsLoadingArticles(true);
      
      const authToken = localStorage.getItem('accessToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch(`https://api.4pmti.com/blog?page=1&limit=100`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch articles for assignment');
      }
      
      const result = await response.json();
      if (result.success && result.data) {
        setAllArticlesForAssignment(result.data.data || []);
      } else {
        throw new Error('Failed to fetch articles for assignment');
      }
    } catch (error) {
      console.error('Error fetching articles for assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch articles for assignment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingArticles(false);
    }
  };

  // Handle page assignment
  const handleAssignArticlesToPage = async () => {
    if (!selectedPage || selectedArticles.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select a page and at least one article.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsAssigning(true);
      
      const authToken = localStorage.getItem('accessToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      // Assign each selected article to the page
      const assignmentPromises = selectedArticles.map(async (article) => {
        const response = await fetch(`https://api.4pmti.com/blog/${article.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tagNames: [selectedPage]
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to assign article "${article.title}" to page "${selectedPage}"`);
        }

        return response.json();
      });

      await Promise.all(assignmentPromises);

      toast({
        title: 'Success',
        description: `Successfully assigned ${selectedArticles.length} article(s) to "${selectedPage}" page.`,
      });

      // Reset modal state
      setShowPageAssignmentModal(false);
      setSelectedPage('');
      setSelectedArticles([]);
      setPageSearchTerm('');
      setArticleSearchTerm('');

      // Refresh the blog posts to show updated data
      fetchBlogPosts(currentPage);
    } catch (error) {
      console.error('Error assigning articles to page:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign articles to page. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle article selection for page assignment
  const handleArticleSelection = (article: BlogPost) => {
    setSelectedArticles(prev => {
      const isSelected = prev.some(selected => selected.id === article.id);
      if (isSelected) {
        return prev.filter(selected => selected.id !== article.id);
      } else {
        return [...prev, article];
      }
    });
  };

  // Filter articles based on search term
  const filteredArticlesForAssignment = allArticlesForAssignment.filter(article =>
    article.title.toLowerCase().includes(articleSearchTerm.toLowerCase()) ||
    article.content.toLowerCase().includes(articleSearchTerm.toLowerCase()) ||
    article.tags.some(tag => tag.name.toLowerCase().includes(articleSearchTerm.toLowerCase()))
  );

  // Filter pages based on search term
  const filteredPages = availablePages.filter(page =>
    page.toLowerCase().includes(pageSearchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchBlogPosts(currentPage);
  }, [currentPage, itemsPerPage]);

  // Handle page change
  const handlePageChange = (page: number) => {
    try {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      } else {
        throw new Error('Invalid page number');
      }
    } catch (error) {
      console.error('Error changing page:', error);
      toast({
        title: 'Navigation Error',
        description: 'Failed to navigate to the selected page. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newLimit: number) => {
    try {
      if (newLimit > 0 && newLimit <= 100) {
        setItemsPerPage(newLimit);
        setCurrentPage(1); // Reset to first page when changing limit
      } else {
        throw new Error('Invalid items per page value');
      }
    } catch (error) {
      console.error('Error changing items per page:', error);
      toast({
        title: 'Settings Error',
        description: 'Failed to update items per page. Please try again.',
        variant: 'destructive'
      });
    }
  };

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
    try {
      const tmp = document.createElement('DIV');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    } catch (error) {
      console.error('Error stripping HTML:', error);
      return 'Content preview unavailable';
    }
  };

  // Function to get preview text
  const getPreview = (content: string, length = 100) => {
    try {
      const stripped = stripHtml(content);
      return stripped.length > length 
        ? stripped.substring(0, length) + '...' 
        : stripped;
    } catch (error) {
      console.error('Error generating preview:', error);
      return 'Preview unavailable';
    }
  };

  // Function to handle image loading errors
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = event.target as HTMLImageElement;
    img.src = '/placeholder-image.png'; // You can add a placeholder image
    img.alt = 'Image not available';
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
      const authToken = localStorage.getItem('accessToken');
      if (!authToken) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Delete the blog post
      const response = await fetch(`https://api.4pmti.com/blog/${postToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to delete this blog post.');
        } else if (response.status === 404) {
          throw new Error('Blog post not found or already deleted.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`Failed to delete blog post (${response.status})`);
        }
      }
      
      const result = await response.json();
      if (result.success) {
        // Check if we need to go to previous page (if we deleted the last item on current page)
        const remainingItems = blogPosts.length - 1;
        if (remainingItems === 0 && currentPage > 1) {
          // If no items left on current page and not on first page, go to previous page
          setCurrentPage(currentPage - 1);
        } else {
          // Otherwise, refresh current page
          fetchBlogPosts(currentPage);
        }
        
        // Show success toast
        toast({
          title: 'Success',
          description: `Successfully deleted "${postToDelete.title}"`,
        });
        
        setSuccessMessage(`Successfully deleted "${postToDelete.title}"`);
        setShowSuccessModal(true);
        setError(null); // Clear any previous errors
      } else {
        const errorMessage = extractErrorMessage(result);
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error deleting blog post:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete blog post. Please try again later.';
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setPostToDelete(null);
    }
  };

  // Function to handle edit click
  const handleEditClick = (post: BlogPost) => {
    try {
      router.push(`/blog/edit/${post.id}`);
    } catch (error) {
      console.error('Error navigating to edit page:', error);
      toast({
        title: 'Error',
        description: 'Failed to navigate to edit page. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Function to handle search errors
  const handleSearchError = (error: any, searchType: string) => {
    console.error(`Error in ${searchType} search:`, error);
    toast({
      title: 'Search Error',
      description: `Failed to perform ${searchType} search. Please try again.`,
      variant: 'destructive'
    });
  };

  // Handle opening page assignment modal
  const handleOpenPageAssignmentModal = () => {
    setShowPageAssignmentModal(true);
    fetchAllArticlesForAssignment();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Blogs | PMTI Dashboard</title>
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-semibold text-gray-800">Blogs</h1>
          <div className="flex gap-2">
            <button 
              onClick={handleOpenPageAssignmentModal}
              className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition duration-300 hover:bg-green-700"
            >
              <Globe size={16} />
              <span>Assign Articles to Pages</span>
            </button>
            <Link href={'/blog/add'}>
              <button 
                className="bg-black text-white px-4 py-2 rounded-md flex items-center gap-2 transition duration-300"
              >
                <Plus size={16} />
                <span>Add Blog</span>
              </button>
            </Link>
          </div>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="bg-red-50 text-red-700 hover:bg-red-100 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
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
        ) : blogPosts.length === 0 && !isLoading ? (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts found</h3>
              <p className="text-gray-500 text-center max-w-md">
                {globalSearch || nameSearch || emailSearch 
                  ? 'No blog posts match your search criteria. Try adjusting your search terms.'
                  : 'You haven\'t created any blog posts yet. Get started by adding your first blog post.'
                }
              </p>
              {!globalSearch && !nameSearch && !emailSearch && (
                <Link href="/blog/add" className="mt-4">
                  <button className="bg-black text-white px-4 py-2 rounded-md flex items-center gap-2 transition duration-300">
                    <Plus size={16} />
                    <span>Add Your First Blog</span>
                  </button>
                </Link>
              )}
            </div>
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
                          {post.cover_image ? (
                            <img 
                              src={post.cover_image} 
                              alt={post.title}
                              className="h-20 w-20 object-cover rounded"
                              onError={handleImageError}
                            />
                          ) : (
                            <div className="h-20 w-20 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-gray-500 text-xs">No Image</span>
                            </div>
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
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                  <span className="font-medium">{totalItems}</span> results
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-700">Items per page:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
              
              {/* Pagination Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <ChevronLeft size={16} />
                </button>
                
                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 text-sm border rounded-md ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <ChevronRight size={16} />
                </button>
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

        {/* Page Assignment Modal */}
        {showPageAssignmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Assign Articles to Pages</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Select articles and assign them to specific pages (tags)
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowPageAssignmentModal(false);
                    setSelectedPage('');
                    setSelectedArticles([]);
                    setPageSearchTerm('');
                    setArticleSearchTerm('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Page Selection */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Select Page</h4>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Search pages..."
                        value={pageSearchTerm}
                        onChange={(e) => setPageSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                      {filteredPages.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                          {filteredPages.map((page) => (
                            <button
                              key={page}
                              onClick={() => setSelectedPage(page)}
                              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                                selectedPage === page ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <Tag size={16} className="text-gray-400" />
                                <span className="font-medium text-gray-900">{page}</span>
                                {selectedPage === page && (
                                  <span className="ml-auto text-blue-600 text-sm">Selected</span>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          {pageSearchTerm ? 'No pages found matching your search.' : 'No pages available.'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Article Selection */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Select Articles</h4>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Search articles..."
                        value={articleSearchTerm}
                        onChange={(e) => setArticleSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    
                    {isLoadingArticles ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        <span className="ml-3 text-gray-600">Loading articles...</span>
                      </div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                        {filteredArticlesForAssignment.length > 0 ? (
                          <div className="divide-y divide-gray-200">
                            {filteredArticlesForAssignment.map((article) => {
                              const isSelected = selectedArticles.some(selected => selected.id === article.id);
                              return (
                                <button
                                  key={article.id}
                                  onClick={() => handleArticleSelection(article)}
                                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                                    isSelected ? 'bg-green-50 border-l-4 border-green-500' : ''
                                  }`}
                                >
                                  <div className="flex items-start space-x-3">
                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center mt-1 ${
                                      isSelected ? 'bg-green-500 border-green-500' : 'border-gray-300'
                                    }`}>
                                      {isSelected && (
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-medium text-gray-900 truncate">{article.title}</h5>
                                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                        {getPreview(article.content, 80)}
                                      </p>
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {article.tags.map((tag) => (
                                          <span 
                                            key={tag.id} 
                                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                          >
                                            {tag.name}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            {articleSearchTerm ? 'No articles found matching your search.' : 'No articles available.'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Articles Summary */}
                {selectedArticles.length > 0 && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h5 className="text-sm font-medium text-gray-900 mb-3">
                      Selected Articles ({selectedArticles.length})
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedArticles.map((article) => (
                        <span
                          key={article.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          {article.title}
                          <button
                            onClick={() => handleArticleSelection(article)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center p-6 border-t bg-gray-50">
                <div className="text-sm text-gray-600">
                  {selectedPage && selectedArticles.length > 0 && (
                    <span>
                      {selectedArticles.length} article{selectedArticles.length !== 1 ? 's' : ''} will be assigned to "{selectedPage}"
                    </span>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowPageAssignmentModal(false);
                      setSelectedPage('');
                      setSelectedArticles([]);
                      setPageSearchTerm('');
                      setArticleSearchTerm('');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignArticlesToPage}
                    disabled={!selectedPage || selectedArticles.length === 0 || isAssigning}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isAssigning ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Assigning...</span>
                      </>
                    ) : (
                      <>
                        <Tag size={16} />
                        <span>Assign to Page</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}