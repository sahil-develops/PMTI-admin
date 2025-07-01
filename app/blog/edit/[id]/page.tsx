'use client'
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { Trash2,  } from 'lucide-react';
import Head from 'next/head';
import 'react-quill/dist/quill.snow.css';
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
  slug: string;
  tags: Tag[];
  user: User;
}

interface SingleBlogResponse {
  message: string;
  error: string;
  success: boolean;
  data: BlogPost;
}

export default function EditBlog({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedCoverImage, setEditedCoverImage] = useState('');
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [editedSlug, setEditedSlug] = useState('');

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setIsLoading(true);
        const authToken = localStorage.getItem('accessToken');
        if (!authToken) {
          throw new Error('Authentication token not found');
        }
        const response = await fetch(`https://api.4pmti.com/blog/${params.id}`, {
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
          setEditedSlug(result.data.slug);
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
  }, [params.id]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      const authToken = localStorage.getItem('accessToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }
      const updateData = {
        title: editedTitle,
        content: editedContent,
        slug: editedSlug,
        cover_image: editedCoverImage
      };
      const response = await fetch(`https://api.4pmti.com/blog/${params.id}`, {
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
      setError('Failed to update blog post. Please try again.');
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
                      className="h-48 w-auto object-cover rounded-lg shadow"
                      onError={() => setImageUploadError('Failed to load image preview')}
                    />
                    <button
                      onClick={() => {
                        setEditedCoverImage('');
                        setImageUploadError('');
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          setIsImageUploading(true);
                          setImageUploadError('');
                          const authToken = localStorage.getItem('accessToken');
                          if (!authToken) throw new Error('Authentication token not found');
                          const formData = new FormData();
                          formData.append('file', file);
                          const response = await fetch('https://api.4pmti.com/upload', {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${authToken}` },
                            body: formData
                          });
                          if (!response.ok) throw new Error('Failed to upload image');
                          const data = await response.json();
                          if (data.success && data.data && data.data.url) {
                            setEditedCoverImage(data.data.url);
                          } else {
                            throw new Error('Invalid response from upload service');
                          }
                        } catch (error) {
                          setImageUploadError('Failed to upload image. Please try again.');
                        } finally {
                          setIsImageUploading(false);
                        }
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

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <BlogEditor content={editedContent} onChange={setEditedContent} />
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
                disabled={isSaving || isImageUploading}
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
    </div>
  );
}

// Add this CSS to handle the ReactQuill editor height
const styles = `
.ql-container {
  height: calc(500px - 42px) !important;
}
`;

// Add the styles to the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
} 