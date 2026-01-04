'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Trash2, Eye, X, Plus, Search } from 'lucide-react';
import Head from 'next/head';
import BlogEditor from '@/app/components/Blog/Addblog/BlogEditor';

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
  thumbnail: string;
  slug: string;
  description: string | null;
  tags: Tag[];
  user: User;
  metadata?: {
    head?: string;
    script?: string;
  };
  relatedArticleIds?: number[];
}

interface RelatedArticle {
  id: number;
  title: string;
  slug: string;
  cover_image: string;
  thumbnail: string;
  description: string | null;
}

export default function EditBlog({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedCoverImage, setEditedCoverImage] = useState('');
  const [editedThumbnail, setEditedThumbnail] = useState('');
  const [editedHead, setEditedHead] = useState('');
  const [editedScript, setEditedScript] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedTags, setEditedTags] = useState<string>('');
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [thumbnailUploadError, setThumbnailUploadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [editedSlug, setEditedSlug] = useState('');
  const [showCoverImageModal, setShowCoverImageModal] = useState(false);
  const [showThumbnailModal, setShowThumbnailModal] = useState(false);

  // Related articles state
  const [relatedArticleIds, setRelatedArticleIds] = useState<number[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [allArticles, setAllArticles] = useState<RelatedArticle[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [isLoadingAllArticles, setIsLoadingAllArticles] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showArticleSelector, setShowArticleSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Store original values to compare changes
  const [originalValues, setOriginalValues] = useState({
    title: '',
    content: '',
    cover_image: '',
    thumbnail: '',
    slug: '',
    description: '',
    tags: '',
    head: '',
    script: '',
    relatedArticleIds: [] as number[]
  });

  // Helper functions for base64 encoding/decoding
  const decodeBase64 = (str: string): string => {
    if (!str) return '';
    try {
      return atob(str);
    } catch (error) {
      console.warn('Failed to decode base64, returning original string:', error);
      return str;
    }
  };

  const encodeBase64 = (str: string): string => {
    if (!str) return '';
    try {
      return btoa(str);
    } catch (error) {
      console.warn('Failed to encode base64, returning original string:', error);
      return str;
    }
  };

  // Fetch all articles for selection
  const fetchAllArticles = async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setIsLoadingAllArticles(true);
      } else {
        setIsLoadingMore(true);
      }

      const authToken = localStorage.getItem('accessToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`https://api.projectmanagementtraininginstitute.com/blog?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      const result = await response.json();
      if (result.success) {
        // Handle nested data structure: result.data.data contains the articles array
        const articlesData = result.data.data || result.data;
        const meta = result.data.meta;

        // Filter out the current article and format the data
        const filteredArticles = articlesData
          .filter((article: any) => article.id !== parseInt(params.id))
          .map((article: any) => ({
            id: article.id,
            title: article.title,
            slug: article.slug,
            cover_image: article.cover_image,
            thumbnail: article.thumbnail,
            description: article.description
          }));

        if (append) {
          setAllArticles(prev => [...prev, ...filteredArticles]);
        } else {
          setAllArticles(filteredArticles);
        }

        // Update pagination state
        setCurrentPage(page);
        setTotalPages(meta?.totalPages || 1);
        setHasMore(page < (meta?.totalPages || 1));

        console.log('Fetched articles:', filteredArticles.length, 'Page:', page, 'Total pages:', meta?.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch all articles:', error);
    } finally {
      setIsLoadingAllArticles(false);
      setIsLoadingMore(false);
    }
  };

  // Fetch related articles data
  const fetchRelatedArticles = async (articleIds: number[]) => {
    if (articleIds.length === 0) {
      setRelatedArticles([]);
      return;
    }

    try {
      setIsLoadingRelated(true);
      const authToken = localStorage.getItem('accessToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      const relatedArticlesData: RelatedArticle[] = [];

      for (const id of articleIds) {
        try {
          const response = await fetch(`https://api.projectmanagementtraininginstitute.com/blog/${id}`, {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              relatedArticlesData.push({
                id: result.data.id,
                title: result.data.title,
                slug: result.data.slug,
                cover_image: result.data.cover_image,
                thumbnail: result.data.thumbnail,
                description: result.data.description
              });
            }
          }
        } catch (error) {
          console.error(`Failed to fetch article ${id}:`, error);
        }
      }

      setRelatedArticles(relatedArticlesData);
    } catch (error) {
      console.error('Failed to fetch related articles:', error);
    } finally {
      setIsLoadingRelated(false);
    }
  };

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setIsLoading(true);
        const authToken = localStorage.getItem('accessToken');
        if (!authToken) {
          throw new Error('Authentication token not found');
        }
        const response = await fetch(`https://api.projectmanagementtraininginstitute.com/blog/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch blog post');
        }
        const result = await response.json();
        if (result.success) {
          setEditedTitle(result.data.title);
          setEditedContent(result.data.content || '');
          setEditedCoverImage(result.data.cover_image);
          setEditedThumbnail(result.data.thumbnail || '');
          setEditedSlug(result.data.slug);
          setEditedDescription(result.data.description || '');
          setEditedTags(result.data.tags ? result.data.tags.map((tag: Tag) => tag.name).join(', ') : '');

          // Set related articles
          const relatedIds = result.data.relatedArticleIds || [];
          setRelatedArticleIds(relatedIds);

          // Decode base64 metadata
          const decodedHead = decodeBase64(result.data.metadata?.head || '');
          const decodedScript = decodeBase64(result.data.metadata?.script || '');

          setEditedHead(decodedHead);
          setEditedScript(decodedScript);

          // Store original values for comparison (store decoded values)
          setOriginalValues({
            title: result.data.title,
            content: result.data.content || '',
            cover_image: result.data.cover_image,
            thumbnail: result.data.thumbnail || '',
            slug: result.data.slug,
            description: result.data.description || '',
            tags: result.data.tags ? result.data.tags.map((tag: Tag) => tag.name).join(', ') : '',
            head: decodedHead,
            script: decodedScript,
            relatedArticleIds: relatedIds
          });

          // Fetch related articles data
          await fetchRelatedArticles(relatedIds);
        } else {
          throw new Error(result.error || 'Failed to fetch blog post');
        }
      } catch (error) {
        setError('Failed to load blog post. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogPost();
    fetchAllArticles();
  }, [params.id]);

  // Handle adding related article
  const handleAddRelatedArticle = (articleId: number) => {
    if (!relatedArticleIds.includes(articleId)) {
      const newRelatedIds = [...relatedArticleIds, articleId];
      setRelatedArticleIds(newRelatedIds);
      fetchRelatedArticles(newRelatedIds);
    }
  };

  // Handle removing related article
  const handleRemoveRelatedArticle = (articleId: number) => {
    const newRelatedIds = relatedArticleIds.filter(id => id !== articleId);
    setRelatedArticleIds(newRelatedIds);
    fetchRelatedArticles(newRelatedIds);
  };

  // Filter articles based on search term
  const filteredArticles = allArticles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (article.description && article.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle scroll to load more articles
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100; // 100px from bottom

    if (isNearBottom && hasMore && !isLoadingMore && !isLoadingAllArticles) {
      fetchAllArticles(currentPage + 1, true);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      const authToken = localStorage.getItem('accessToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      // Create updateData object with only changed fields
      const updateData: any = {};

      // Check each field and only include if it has changed
      if (editedTitle !== originalValues.title) {
        updateData.title = editedTitle;
      }

      if (editedContent !== originalValues.content) {
        updateData.content = editedContent;
      }

      if (editedSlug !== originalValues.slug) {
        updateData.slug = editedSlug;
      }

      if (editedDescription !== originalValues.description) {
        updateData.description = editedDescription;
      }

      if (editedCoverImage !== originalValues.cover_image) {
        updateData.cover_image = editedCoverImage;
      }

      if (editedThumbnail !== originalValues.thumbnail) {
        updateData.thumbnail = editedThumbnail;
      }

      // Check if tags have changed
      const currentTags = editedTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      const originalTags = originalValues.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      const tagsChanged = JSON.stringify(currentTags.sort()) !== JSON.stringify(originalTags.sort());

      if (tagsChanged) {
        updateData.tagNames = currentTags;
      }

      // Check if related articles have changed
      const relatedArticlesChanged = JSON.stringify(relatedArticleIds.sort()) !== JSON.stringify(originalValues.relatedArticleIds.sort());
      if (relatedArticlesChanged) {
        updateData.relatedArticleIds = relatedArticleIds;
      }

      // Check if metadata has changed
      const metadataChanged = editedHead !== originalValues.head || editedScript !== originalValues.script;
      if (metadataChanged) {
        updateData.metadata = {};
        if (editedHead !== originalValues.head) {
          updateData.metadata.head = encodeBase64(editedHead);
        }
        if (editedScript !== originalValues.script) {
          updateData.metadata.script = encodeBase64(editedScript);
        }
      }

      // Only proceed if there are changes to save
      if (Object.keys(updateData).length === 0) {
        setError('No changes detected to save.');
        return;
      }

      const response = await fetch(`https://api.projectmanagementtraininginstitute.com/blog/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
      if (!response.ok) {
        throw new Error('Failed to update blog post');
      }
      const result = await response.json();
      if (result.success) {
        router.push('/blog');
      } else {
        throw new Error(result.error || 'Failed to update blog post');
      }
    } catch (error) {
      setError('Thumbnail is required.');
    } finally {
      setIsSaving(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setEditedTitle(newTitle);
  };

  const handleImageUpload = async (file: File, setImage: (url: string) => void, setUploading: (loading: boolean) => void, setError: (error: string) => void) => {
    try {
      setUploading(true);
      setError('');
      const authToken = localStorage.getItem('accessToken');
      if (!authToken) throw new Error('Authentication token not found');
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('https://api.projectmanagementtraininginstitute.com/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: formData
      });
      if (!response.ok) throw new Error('Failed to upload image');
      const data = await response.json();
      if (data.success && data.data && data.data.url) {
        setImage(data.data.url);
      } else {
        throw new Error('Invalid response from upload service');
      }
    } catch (error) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Edit Blog | PMTI Dashboard</title>
      </Head>
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Ensure the sticky toolbar works properly within this page layout */
          .sticky-toolbar {
            position: sticky !important;
            top: 0 !important;
            z-index: 100 !important;
          }
          
          /* Ensure modals appear above the sticky toolbar */
          .modal-overlay {
            z-index: 200 !important;
          }
        `
      }} />

      <div className="max-w-full mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Blog Post</h1>

          <div className="space-y-6">
            {/* Cover Image Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image
              </label>
              <div className="space-y-4">
                {editedCoverImage && (
                  <div className="relative w-fit">
                    <img
                      src={editedCoverImage}
                      alt="Cover preview"
                      className="h-48 w-auto object-cover rounded-lg shadow cursor-pointer"
                      onClick={() => setShowCoverImageModal(true)}
                      onError={() => setImageUploadError('Failed to load image preview')}
                    />
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <button
                        onClick={() => setShowCoverImageModal(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1.5 shadow transition-colors"
                        title="View image"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setEditedCoverImage('');
                          setImageUploadError('');
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow transition-colors"
                        title="Remove image"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        await handleImageUpload(file, setEditedCoverImage, setIsImageUploading, setImageUploadError);
                      }
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {isImageUploading && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                    </div>
                  )}
                </div>
                {imageUploadError && (
                  <p className="text-red-500 text-sm">{imageUploadError}</p>
                )}
              </div>
            </div>

            {/* Thumbnail Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thumbnail
              </label>
              <div className="space-y-4">
                {editedThumbnail && (
                  <div className="relative w-fit">
                    <img
                      src={editedThumbnail}
                      alt="Thumbnail preview"
                      className="h-48 w-auto object-cover rounded-lg shadow cursor-pointer"
                      onClick={() => setShowThumbnailModal(true)}
                      onError={() => setThumbnailUploadError('Failed to load thumbnail preview')}
                    />
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <button
                        onClick={() => setShowThumbnailModal(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1.5 shadow transition-colors"
                        title="View thumbnail"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setEditedThumbnail('');
                          setThumbnailUploadError('');
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow transition-colors"
                        title="Remove thumbnail"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        await handleImageUpload(file, setEditedThumbnail, setIsThumbnailUploading, setThumbnailUploadError);
                      }
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                  {isThumbnailUploading && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-500 border-t-transparent"></div>
                    </div>
                  )}
                </div>
                {thumbnailUploadError && (
                  <p className="text-red-500 text-sm">{thumbnailUploadError}</p>
                )}
              </div>
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={editedTitle}
                onChange={handleTitleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Add Slug Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  URL Slug
                </label>
                <button
                  type="button"
                  onClick={() => setEditedSlug(generateSlug(editedTitle))}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Generate from title
                </button>
              </div>
              <div className="flex items-center">
                <span className="text-gray-500 bg-gray-100 px-3 py-2 border border-r-0 border-gray-300 rounded-l-md">
                  /blog/
                </span>
                <input
                  type="text"
                  value={editedSlug}
                  onChange={(e) => setEditedSlug(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="your-post-url"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                This will be the URL of your blog post. Use lowercase letters, numbers, and hyphens only.
              </p>
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={4}
                placeholder="Enter a brief description of your blog post"
              />
              <p className="mt-1 text-sm text-gray-500">
                A short description that will appear in search results and social media shares.
              </p>
            </div>

            {/* Tags/Categories Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories/Tags
              </label>
              <input
                type="text"
                value={editedTags}
                onChange={(e) => setEditedTags(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter tags separated by commas (e.g., SCRUM, PMPM, Agile)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter categories or tags separated by commas to help organize your blog post.
              </p>
            </div>

            {/* Related Articles Section */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Related Articles
                </label>
                <button
                  type="button"
                  onClick={() => setShowArticleSelector(true)}
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <Plus size={16} />
                  <span>Add Articles</span>
                </button>
              </div>

              {isLoadingRelated ? (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : relatedArticles.length > 0 ? (
                <div className="space-y-3">
                  {relatedArticles.map((article) => (
                    <div key={article.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {article.thumbnail && (
                          <img
                            src={article.thumbnail}
                            alt={article.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">{article.title}</h4>
                          <p className="text-sm text-gray-500">{article.slug}</p>
                          {article.description && (
                            <p className="text-sm text-gray-600 mt-1">{article.description}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveRelatedArticle(article.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove article"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>No related articles found</p>
                  <p className="text-sm mt-1">Click "Add Articles" to select related articles</p>
                </div>
              )}
            </div>

            {/* Content Editor */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <BlogEditor content={editedContent} onChange={setEditedContent} />
              </div>
            </div>

            {/* Head Metadata */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Head Metadata
                </label>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Base64 Encoded
                </span>
              </div>
              <textarea
                value={editedHead}
                onChange={(e) => setEditedHead(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-sm"
                rows={8}
                placeholder="Enter HTML head metadata (meta tags, title, etc.)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Add custom HTML head metadata like meta tags, title, and other head elements. Content is automatically encoded/decoded.
              </p>
            </div>

            {/* Script Metadata */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Script Metadata
                </label>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Base64 Encoded
                </span>
              </div>
              <textarea
                value={editedScript}
                onChange={(e) => setEditedScript(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-sm"
                rows={6}
                placeholder="Enter custom JavaScript code"
              />
              <p className="mt-1 text-sm text-gray-500">
                Add custom JavaScript code that will be included in the blog post. Content is automatically encoded/decoded.
              </p>
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6">
              <button
                onClick={() => router.push('/blog')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || isImageUploading || isThumbnailUploading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Article Selector Modal */}
      {showArticleSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-overlay p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Select Related Articles</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {relatedArticleIds.length} article{relatedArticleIds.length !== 1 ? 's' : ''} selected
                </p>
              </div>
              <button
                onClick={() => {
                  setShowArticleSelector(false);
                  setSearchTerm('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Search and Stats */}
              <div className="flex items-center justify-between mb-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search articles by title, slug, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => fetchAllArticles(1, false)}
                    disabled={isLoadingAllArticles}
                    className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingAllArticles ? 'Refreshing...' : 'Refresh'}
                  </button>
                  <div className="text-sm text-gray-500">
                    {filteredArticles.length} of {allArticles.length} articles
                    {totalPages > 1 && (
                      <span className="ml-2 text-xs text-gray-400">
                        (Page {currentPage} of {totalPages})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Articles List */}
              <div className="max-h-[60vh] overflow-y-auto" onScroll={handleScroll}>
                {isLoadingAllArticles ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-600">Loading articles...</span>
                  </div>
                ) : filteredArticles.length > 0 ? (
                  <>
                    <div className="grid gap-3">
                      {filteredArticles.map((article) => (
                        <div
                          key={article.id}
                          className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all duration-200 ${relatedArticleIds.includes(article.id)
                              ? 'bg-blue-50 border-blue-300 shadow-sm'
                              : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                          onClick={() => {
                            if (relatedArticleIds.includes(article.id)) {
                              handleRemoveRelatedArticle(article.id);
                            } else {
                              handleAddRelatedArticle(article.id);
                            }
                          }}
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            {article.thumbnail ? (
                              <img
                                src={article.thumbnail}
                                alt={article.title}
                                className="w-16 h-16 object-cover rounded-lg shadow-sm"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No image</span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">{article.title}</h4>
                              <p className="text-sm text-gray-500 mt-1">/{article.slug}</p>
                              {article.description && (
                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{article.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 ml-4">
                            {relatedArticleIds.includes(article.id) && (
                              <span className="text-blue-600 text-sm font-medium bg-blue-100 px-2 py-1 rounded-full">
                                Selected
                              </span>
                            )}
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${relatedArticleIds.includes(article.id)
                                  ? 'bg-blue-500 border-blue-500'
                                  : 'border-gray-300 hover:border-blue-300'
                                }`}
                            >
                              {relatedArticleIds.includes(article.id) && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Loading more indicator */}
                    {isLoadingMore && (
                      <div className="flex justify-center items-center py-6">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                        <span className="ml-3 text-gray-600 text-sm">Loading more articles...</span>
                      </div>
                    )}

                    {/* End of list indicator */}
                    {!hasMore && filteredArticles.length > 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No more articles to load
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg font-medium">No articles found</p>
                    {searchTerm ? (
                      <p className="text-sm text-gray-400 mt-2">Try adjusting your search terms</p>
                    ) : (
                      <p className="text-sm text-gray-400 mt-2">No articles available to select</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center p-6 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                {relatedArticleIds.length > 0 && (
                  <span>
                    {relatedArticleIds.length} article{relatedArticleIds.length !== 1 ? 's' : ''} will be related
                  </span>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setRelatedArticleIds([]);
                    setRelatedArticles([]);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => {
                    setShowArticleSelector(false);
                    setSearchTerm('');
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cover Image Modal */}
      {showCoverImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-overlay p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowCoverImageModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 z-10"
            >
              <X size={24} />
            </button>
            <img
              src={editedCoverImage}
              alt="Cover image full view"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Thumbnail Modal */}
      {showThumbnailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-overlay p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowThumbnailModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 z-10"
            >
              <X size={24} />
            </button>
            <img
              src={editedThumbnail}
              alt="Thumbnail full view"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Note: The BlogEditor component now includes its own styling and sticky toolbar functionality 