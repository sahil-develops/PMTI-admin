import React, { useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { Bold, Italic, Heading1, Heading2, Heading3, List, AlignLeft, AlignCenter, AlignRight, Upload, MinusSquare, Square, PlusSquare, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { Editor } from '@tiptap/react';

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => ({
          width: attributes.width,
        }),
      },
      alignment: {
        default: 'left',
        parseHTML: element => element.style.float || element.style.textAlign,
      renderHTML: attributes => ({
          style: attributes.alignment === 'center' 
            ? 'display: block; margin: 0 auto; text-align: center;' 
            : `float: ${attributes.alignment}`,
        }),
      }
    };
  },
});


const MenuBar = ({ editor }: { editor: Editor | null }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!editor) {
    return null;
  }
  const uploadImageToServer = async (editor: Editor, file: Blob) => {
    // Fix 3: Validate file type
    const fileExtension = (file as File).name.split('.').pop()?.toLowerCase();
    const allowedTypes = ['png', 'jpg', 'jpeg'];
    
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      setUploadError('Only PNG, JPG, and JPEG files are allowed.');
      return null;
    }
    
    setIsUploading(true);
    setUploadError(null);
    
    // Insert placeholder while uploading
    const placeholderId = `upload-${Date.now()}`;
    
    // Insert placeholder component
    editor.chain().focus().insertContent({
      type: 'paragraph',
      attrs: { id: placeholderId },
      content: [{
        type: 'text',
        text: '' // Empty text node
      }]
    }).run();
    
    // Create placeholder with fixed height to prevent layout shifts
    const placeholder = document.createElement('div');
    placeholder.id = placeholderId;
    placeholder.className = 'image-upload-placeholder';
    placeholder.style.width = '100%';
    placeholder.style.height = '200px';
    placeholder.style.margin = '1rem 0';
    placeholder.style.position = 'relative';
    placeholder.style.backgroundColor = '#f3f4f6';
    placeholder.style.borderRadius = '0.375rem';
    placeholder.style.overflow = 'hidden';
    
    const shimmer = document.createElement('div');
    shimmer.style.position = 'absolute';
    shimmer.style.inset = '0';
    shimmer.style.background = 'linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%)';
    shimmer.style.backgroundSize = '700px 100%';
    shimmer.style.animation = 'shimmer 2s infinite linear';
    
    placeholder.appendChild(shimmer);
    
    // Find the placeholder paragraph and replace its content
    const placeholderParagraph = document.querySelector(`[id="${placeholderId}"]`);
    if (placeholderParagraph) {
      placeholderParagraph.replaceWith(placeholder);
    }
  
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('https://api.4pmti.com/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      
      // Remove placeholder
      const placeholderElement = document.getElementById(placeholderId);
      if (placeholderElement) {
        placeholderElement.remove();
      }
      
      // Fix 2: Insert the actual image with properly formatted URL
      editor.chain().focus().setImage({ 
        src: data.data.url,
        // @ts-ignore
        width: '50%',
        alignment: 'left'
      }).run();
      
      return data.data.url;
    } catch (error) {
      setUploadError('Failed to upload image. Please try again.');
      console.error('Error uploading image:', error);
      
      // Remove placeholder on error
      const placeholderElement = document.getElementById(placeholderId);
      if (placeholderElement) {
        placeholderElement.remove();
      }
      
      return null;
    } finally {
      setIsUploading(false);
    }
  };



  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0] && editor) {
      await uploadImageToServer(editor, files[0]);
    }
    // Clear the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addImage = () => {
    fileInputRef.current?.click();
  };


  const resizeImage = (size: string) => {
    const { from } = editor.state.selection;
    const imageNode = editor.state.doc.nodeAt(from);
    if (imageNode && imageNode.type.name === 'image') {
      editor
        .chain()
        .focus()
        .setImage({ 
          src: imageNode.attrs.src,
          // @ts-ignore
          width: size,
          alignment: imageNode.attrs.alignment
        })
        .run();
    }
  };

  const alignImage = (alignment: 'left' | 'center' | 'right') => {
    const { from } = editor.state.selection;
    const imageNode = editor.state.doc.nodeAt(from);
    if (imageNode && imageNode.type.name === 'image') {
      editor
        .chain()
        .focus()
        .setImage({ 
          src: imageNode.attrs.src,
          // @ts-ignore
          width: imageNode.attrs.width,
          alignment: alignment
        })
        .run();
    }
  };

  const deleteImage = () => {
    const { from, to } = editor.state.selection;
    editor.chain().focus().deleteRange({ from, to }).run();
  };

  const isImageSelected = () => {
    const { from } = editor.state.selection;
    const node = editor.state.doc.nodeAt(from);
    return node && node.type.name === 'image';
  };
  return (
    <div className="flex flex-wrap space-x-1 space-y-1 sm:space-x-2 sm:space-y-0 border-b pb-2 mb-2 rounded-t-lg bg-gray-100 p-2 sticky top-0">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />
      {/* Existing buttons */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 hover:bg-gray-200 rounded ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 hover:bg-gray-200 rounded ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 hover:bg-gray-200 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
      >
        <Heading1 size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 hover:bg-gray-200 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
      >
        <Heading2 size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-2 hover:bg-gray-200 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
      >
        <Heading3 size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 hover:bg-gray-200 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
      >
        <List size={16} />
      </button>
      <button
        onClick={addImage}
        className="p-2 hover:bg-gray-200 rounded"
        disabled={isUploading}
      >
        <Upload size={16} />
      </button>

      {/* Image controls - only visible when an image is selected */}
    {isImageSelected() && (
        <>
          <div className="border-l mx-2 h-6"></div>
          
          {/* Size controls */}
          <button
            onClick={() => resizeImage('25%')}
            className="p-2 hover:bg-gray-200 rounded"
            title="Small"
          >
            <MinusSquare size={16} />
          </button>
          <button
            onClick={() => resizeImage('50%')}
            className="p-2 hover:bg-gray-200 rounded"
            title="Medium"
          >
            <Square size={16} />
          </button>
          <button
            onClick={() => resizeImage('100%')}
            className="p-2 hover:bg-gray-200 rounded"
            title="Large"
          >
            <PlusSquare size={16} />
          </button>

          <div className="border-l mx-2 h-6"></div>
          
          {/* Alignment controls */}
          <button
            onClick={() => alignImage('left')}
            className="p-2 hover:bg-gray-200 rounded"
            title="Align Left"
          >
            <AlignLeft size={16} />
          </button>
          <button
            onClick={() => alignImage('center')}
            className="p-2 hover:bg-gray-200 rounded"
            title="Align Center"
          >
            <AlignCenter size={16} />
          </button>
          <button
            onClick={() => alignImage('right')}
            className="p-2 hover:bg-gray-200 rounded"
            title="Align Right"
          >
            <AlignRight size={16} />
          </button>

          <div className="border-l mx-2 h-6"></div>
          
          {/* Delete button */}
          <button
            onClick={deleteImage}
            className="p-2 hover:bg-red-100 rounded text-red-500"
            title="Delete Image"
          >
            <Trash2 size={16} />
          </button>
        </>
      )}


      {uploadError && (
        <div className="text-red-500 text-sm ml-2">{uploadError}</div>
      )}

      <div className="border-l mx-2 h-6"></div>

      {/* Text alignment buttons */}
    <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`p-2 hover:bg-gray-200 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
      >
        <AlignLeft size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-2 hover:bg-gray-200 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
      >
        <AlignCenter size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`p-2 hover:bg-gray-200 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
      >
        <AlignRight size={16} />
      </button>
    </div>
  );
};

interface BlogEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      StarterKit.configure({
        document: false,
      }),
      CustomImage,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: content || '<p></p>',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="rounded-lg border border-gray-300">
      <MenuBar editor={editor} />

<EditorContent editor={editor} className="p-4 min-h-[300px] prose max-w-none" />
<style>{`
  @keyframes shimmer {
    0% {
      background-position: -700px 0;
    }
    100% {
      background-position: 700px 0;
    }
  }
`}</style>

    </div>
  );
};

interface BlogPreviewProps {
  title: string;
  content: string;
}

const BlogPreview: React.FC<BlogPreviewProps> = ({ title, content }) => (
  <div className="border rounded-lg p-6 bg-white">
    <h2 className="text-2xl font-bold mb-4">Preview</h2>
    <div className="prose max-w-none">
      <h1>{title}</h1>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  </div>
);

const Index = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [isDraft, setIsDraft] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
const [isCoverImageUploading, setIsCoverImageUploading] = useState(false);
const [coverImageError, setCoverImageError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    category?: string;
    content?: string;
  }>({});

  const validateForm = () => {
    const errors: {
      title?: string;
      category?: string;
      content?: string;
    } = {};
    
    if (!title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!category.trim()) {
      errors.category = 'Category is required';
    }
    
    if (!content.trim() || content === '<p></p>') {
      errors.content = 'Content is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    if (!validateForm()) {
      return;
    }

    const tagNames = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

      const payload = {
        title,
        content,
        tagNames,
        relatedArticleIds: [101, 102, 103],
        coverImage: coverImageUrl, // Add this line
      };
    setIsSubmitting(true);
    try {
      const response = await fetch('https://api.4pmti.com/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to publish blog post');
      }

      setShowSuccessModal(true);
      // Reset form
      setTitle('');
      setDescription('');
      setContent('');
      setTags('');
      setCategory('');
      setValidationErrors({});
    } catch (error) {
      console.error('Error:', error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unknown error occurred');
      }
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCoverImageUpload = async (file: File) => {
    const allowedTypes = ['png', 'jpg', 'jpeg'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      setCoverImageError('Only PNG, JPG, and JPEG files are allowed.');
      return;
    }
  
    setIsCoverImageUploading(true);
    setCoverImageError('');
  
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await fetch('https://api.4pmti.com/upload', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      setCoverImageUrl(data.data.url);
    } catch (error) {
      setCoverImageError('Failed to upload cover image. Please try again.');
    } finally {
      setIsCoverImageUploading(false);
    }
  };


  const handleDeleteCoverImage = () => {
    setCoverImageUrl('');
    setCoverImageError('');
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Blog Post</h1>
      
      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (e.target.value.trim()) {
                  setValidationErrors(prev => ({ ...prev, title: undefined }));
                }
              }}
              className={`w-full border rounded-md p-2 ${
                validationErrors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter blog title..."
            />
            {validationErrors.title && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.title}</p>
            )}
          </div>
          <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cover Image
        </label>
        <div className="flex flex-col gap-2">
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleCoverImageUpload(file);
            }}
            accept="image/png, image/jpeg, image/jpg"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          
          {coverImageError && (
            <p className="text-red-500 text-sm">{coverImageError}</p>
          )}
          
          {isCoverImageUploading && (
            <div className="mt-2 w-full h-48 bg-gray-100 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer" />
            </div>
          )}
          
          {coverImageUrl && !isCoverImageUploading && (
            <div className="mt-2 border rounded-lg overflow-hidden relative group">
              <img
                src={coverImageUrl}
                alt="Cover preview"
                className="w-full h-48 object-cover"
              />
              <button
                onClick={handleDeleteCoverImage}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                title="Delete cover image"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              rows={4}
              placeholder="Write a compelling description..."
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (e.target.value.trim()) {
                    setValidationErrors(prev => ({ ...prev, category: undefined }));
                  }
                }}
                className={`w-full border rounded-md p-2 ${
                  validationErrors.category ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Add category..."
              />
              {validationErrors.category && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags <span className="text-gray-500">(comma-separated)</span>
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="e.g., technology, programming, web-development"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content <span className="text-red-500">*</span>
          </label>
          <BlogEditor 
            content={content} 
            onChange={(newContent) => {
              setContent(newContent);
              if (newContent.trim() && newContent !== '<p></p>') {
                setValidationErrors(prev => ({ ...prev, content: undefined }));
              }
            }} 
          />
          {validationErrors.content && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.content}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-md font-medium ${
              isSubmitting
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } transition-colors`}
          >
            {isSubmitting ? 'Publishing...' : isDraft ? 'Save Draft' : 'Publish Now'}
          </button>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-6 py-2 rounded-md font-medium border border-gray-300 hover:bg-gray-50"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isDraft}
              onChange={() => setIsDraft(!isDraft)}
              className="rounded text-blue-600"
            />
            <span className="text-sm text-gray-600">Save as Draft</span>
          </label>
        </div>

        {showPreview && (
          <BlogPreview title={title} content={content} />
        )}
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Success!</DialogTitle>
          </DialogHeader>
          <Alert className="bg-green-50">
            <AlertTitle>Blog post published successfully!</AlertTitle>
            <AlertDescription>
              Your blog post has been published and is now live on the website.
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertTitle>Failed to publish blog post</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;