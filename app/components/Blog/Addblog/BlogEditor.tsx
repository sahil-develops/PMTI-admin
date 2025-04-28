import React, { useState, useRef } from 'react';
import { useEditor, EditorContent, Extension } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { Bold, Italic, Heading1, Heading2, Heading3, List, AlignLeft, AlignCenter, AlignRight, Upload, MinusSquare, Square, PlusSquare, Trash2, ListOrdered, X } from 'lucide-react';

// Extend the Image extension to support alignment and width
const CustomImage = Image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        width: {
          default: '5%',
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
              : `float: ${attributes.alignment}; margin-bottom: 1rem;`,
          }),
        }
      };
    },
  });

import { Editor } from '@tiptap/react';

const MenuBar = ({ editor, onCoverImageUpload }: { editor: Editor | null, onCoverImageUpload?: (url: string) => void }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  if (!editor) {
    return null;
  }
  
  const uploadImageToServer = async (editor: Editor, file: string | Blob, isCoverImage = false) => {
    // Validate file type
    const fileExtension = file instanceof Blob ? (file as File).name.split('.').pop()?.toLowerCase() : '';
    const allowedTypes = ['png', 'jpg', 'jpeg'];
    
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
        // @ts-ignore
      setUploadError('Only PNG, JPG, and JPEG files are allowed.');
      return null;
    }
    
    setIsUploading(true);
    setUploadError(null);
    
    // Create a unique ID for this upload
    const placeholderId = `upload-${Date.now()}`;
    
    // For regular images (not cover), insert a temporary node that we can replace
    if (!isCoverImage) {
      editor
        .chain()
        .focus()
        .insertContent(`<div id="${placeholderId}" class="image-upload-placeholder"></div>`)
        .run();
      
      // Find the placeholder node we just inserted
      const placeholderNode = document.getElementById(placeholderId);
      
      if (placeholderNode) {
        // Style the placeholder
        placeholderNode.style.width = '100%';
        placeholderNode.style.height = '200px';
        placeholderNode.style.margin = '1rem 0';
        placeholderNode.style.backgroundColor = '#f3f4f6';
        placeholderNode.style.borderRadius = '0.375rem';
        placeholderNode.style.position = 'relative';
        placeholderNode.style.overflow = 'hidden';
        
        // Add shimmer effect
        const shimmer = document.createElement('div');
        shimmer.style.position = 'absolute';
        shimmer.style.inset = '0';
        shimmer.style.backgroundImage = 'linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%)';
        shimmer.style.backgroundSize = '700px 100%';
        shimmer.style.animation = 'shimmer 2s infinite linear';
        
        placeholderNode.appendChild(shimmer);
      }
    }
  
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('https://61ab-2405-201-a40c-488f-c543-4559-5d8c-8c9b.ngrok-free.app/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();

      if (isCoverImage && onCoverImageUpload) {
        // Call the callback to update the cover image in the parent component
        onCoverImageUpload(data.data.url);
      } else {
        // After successful upload, find and remove the placeholder
        const placeholderElement = document.getElementById(placeholderId);
        if (placeholderElement) {
          placeholderElement.remove();
        }
        
        // Insert the actual image
        editor.chain().focus().setImage({ 
          src: data.data.url,
          // @ts-ignore
          width: '50%',
          alignment: 'left'
        }).run();
      }
      
      return data.data.url;
    } catch (error) {
        // @ts-ignore
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

  const handleFileUpload = async (event: { target: { files: any; }; }) => {
    const files = event.target.files;
    if (files && files[0] && editor) {
      await uploadImageToServer(editor, files[0]);
    }
    // Clear the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCoverImageUpload = async (event: { target: { files: any; }; }) => {
    const files = event.target.files;
    if (files && files[0] && editor) {
      await uploadImageToServer(editor, files[0], true);
    }
    // Clear the input value so the same file can be selected again
    if (coverImageInputRef.current) {
      coverImageInputRef.current.value = '';
    }
  };

  const addImage = () => {
    fileInputRef.current?.click();
  };

  const addCoverImage = () => {
    coverImageInputRef.current?.click();
  };

  const resizeImage = (size: string) => {
    const { from } = editor.state.selection;
    const node = editor.state.doc.nodeAt(from);
    if (node && node.type.name === 'image') {
      editor
        .chain()
        .focus()
        .setImage({
          src: node.attrs.src,
          alt: node.attrs.alt,
          title: node.attrs.title,
          width: size,
          alignment: node.attrs.alignment,
        } as any) // Add 'as any' to bypass type checking
        .run();
    }
  };

  const alignImage = (alignment: string) => {
      const { from } = editor.state.selection;
      const node = editor.state.doc.nodeAt(from);
      if (node && node.type.name === 'image') {
        editor
          .chain()
          .focus()
          .setImage({ 
            src: node.attrs.src,
            alt: node.attrs.alt,
            title: node.attrs.title,
            // @ts-ignore
            width: node.attrs.width,
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
      <input
        type="file"
        ref={coverImageInputRef}
        onChange={handleCoverImageUpload}
        accept="image/*"
        className="hidden"
      />
      
      {/* Text formatting buttons */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 hover:bg-gray-200 rounded ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 hover:bg-gray-200 rounded ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
        title="Italic"
      >
        <Italic size={16} />
      </button>
      
      {/* Heading buttons with improved implementation */}
      <button
        onClick={() => {
          if (editor.isActive('heading', { level: 1 })) {
            editor.chain().focus().toggleNode('heading', 'paragraph', { level: 1 }).run();
          } else {
            editor.chain().focus().toggleHeading({ level: 1 }).run();
          }
        }}
        className={`p-2 hover:bg-gray-200 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
        title="Heading 1"
      >
        <Heading1 size={16} />
      </button>
      <button
        onClick={() => {
          if (editor.isActive('heading', { level: 2 })) {
            editor.chain().focus().toggleNode('heading', 'paragraph', { level: 2 }).run();
          } else {
            editor.chain().focus().toggleHeading({ level: 2 }).run();
          }
        }}
        className={`p-2 hover:bg-gray-200 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
        title="Heading 2"
      >
        <Heading2 size={16} />
      </button>
      <button
        onClick={() => {
          if (editor.isActive('heading', { level: 3 })) {
            editor.chain().focus().toggleNode('heading', 'paragraph', { level: 3 }).run();
          } else {
            editor.chain().focus().toggleHeading({ level: 3 }).run();
          }
        }}
        className={`p-2 hover:bg-gray-200 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
        title="Heading 3"
      >
        <Heading3 size={16} />
      </button>
      
      <div className="border-l mx-2 h-6"></div>
      
      {/* List buttons with improved implementation */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 hover:bg-gray-200 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
        title="Bullet List"
      >
        <List size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 hover:bg-gray-200 rounded ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
        title="Numbered List"
      >
        <ListOrdered size={16} />
      </button>
      
      <div className="border-l mx-2 h-6"></div>
      
      {/* Image upload buttons */}
      <button
        onClick={addCoverImage}
        className="p-2 hover:bg-gray-200 rounded flex items-center space-x-1"
        disabled={isUploading}
        title="Upload Cover Image"
      >
        <Upload size={16} />
        <span className="text-xs">Cover</span>
      </button>
      <button
        onClick={addImage}
        className="p-2 hover:bg-gray-200 rounded"
        disabled={isUploading}
        title="Upload Content Image"
      >
        <Upload size={16} />
      </button>

      {/* Loading indicator for uploads */}
      {isUploading && (
        <div className="flex items-center ml-2 text-blue-500">
          <div className="mr-2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs">Uploading...</span>
        </div>
      )}

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
        title="Align Text Left"
      >
        <AlignLeft size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-2 hover:bg-gray-200 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
        title="Align Text Center"
      >
        <AlignCenter size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`p-2 hover:bg-gray-200 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
        title="Align Text Right"
      >
        <AlignRight size={16} />
      </button>
    </div>
  );
};

interface BlogEditorProps {
  content: string;
  onChange: (content: string) => void;
  onCoverImageChange?: (url: string) => void;
  coverImageUrl?: string;
}

const BlogEditor = ({ content, onChange, onCoverImageChange, coverImageUrl }: BlogEditorProps) => {
  const [isImgLoading, setIsImgLoading] = useState(false);
  
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      StarterKit.configure({
        document: false,
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: 'tiptap-heading', // Add a class to make styling easier
          }
        },
        bulletList: {
          keepMarks: true, 
          keepAttributes: false 
        },
        orderedList: {
          keepMarks: true, 
          keepAttributes: false 
        }
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
    parseOptions: {
      preserveWhitespace: 'full',
    },
  });

  const handleCoverImageUpload = (url: string) => {
    if (onCoverImageChange) {
      setIsImgLoading(true);
      onCoverImageChange(url);
    }
  };

  return (
    <div className="space-y-4">
      {/* Cover Image Preview */}
      {(coverImageUrl || isImgLoading) && (
        <div className="border rounded-lg overflow-hidden relative">
          <div className="p-2 bg-gray-100 border-b flex justify-between items-center">
            <span className="font-medium text-sm">Cover Image</span>
            {coverImageUrl && (
              <button 
                onClick={() => onCoverImageChange && onCoverImageChange('')}
                className="text-red-500 hover:bg-red-100 p-1 rounded"
                title="Remove Cover Image"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          <div className="aspect-[21/9] bg-gray-50 relative">
            {isImgLoading && !coverImageUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {coverImageUrl && (
              <img 
                src={coverImageUrl} 
                alt="Cover" 
                className="w-full h-full object-cover"
                onLoad={() => setIsImgLoading(false)}
              />
            )}
          </div>
        </div>
      )}
      
      {/* Editor */}
      <div className="rounded-lg border bg-white rounded-b-lg border-gray-300">
        <MenuBar editor={editor} onCoverImageUpload={handleCoverImageUpload} />
        <EditorContent 
          editor={editor} 
          className="p-4 min-h-[600px] h-full rounded-b-lg prose max-w-none bg-white"
        />
        <style>{`
          @keyframes shimmer {
            0% {
              background-position: -700px 0;
            }
            100% {
              background-position: 700px 0;
            }
          }
          
          .ProseMirror {
            outline: none;
            min-height: 200px;
          }
          
          .ProseMirror p {
            margin: 0.5em 0;
          }
          
          .tiptap-heading {
            margin-top: 1em;
            margin-bottom: 0.5em;
          }
          
          .ProseMirror h1 {
            font-size: 2rem;
            font-weight: bold;
            margin-top: 1.5rem;
            margin-bottom: 1rem;
          }
          
          .ProseMirror h2 {
            font-size: 1.5rem;
            font-weight: bold;
            margin-top: 1.25rem;
            margin-bottom: 0.75rem;
          }
          
          .ProseMirror h3 {
            font-size: 1.25rem;
            font-weight: bold;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
          }
          
          .ProseMirror ul {
            list-style-type: disc;
            padding-left: 1.5rem;
            margin: 1rem 0;
          }
          
          .ProseMirror ol {
            list-style-type: decimal;
            padding-left: 1.5rem;
            margin: 1rem 0;
          }
          
          .ProseMirror li {
            margin-bottom: 0.25rem;
          }
          
          .ProseMirror li p {
            margin: 0;
          }
          
          .image-upload-placeholder {
            width: 100%;
            height: 200px;
            margin: 1rem 0;
            background-color: #f3f4f6;
            border-radius: 0.375rem;
            position: relative;
            overflow: hidden;
          }
          
          /* Make sure images don't break layout */
         /* Make sure images don't break layout */
.ProseMirror img {
  max-width: 50%;
  width: auto;
  height: auto;
  box-sizing: border-box;
}

/* Ensure proper alignment for images */
.ProseMirror img[style*="float: left"] {
  margin-right: 1rem;
  margin-bottom: 1rem;
}

.ProseMirror img[style*="float: right"] {
  margin-left: 1rem;
  margin-bottom: 1rem;
}

/* Add a clear class for paragraphs after images */
.ProseMirror p {
  margin: 0.5em 0;
  clear: both; /* This ensures paragraphs after images clear floats */
}

.ProseMirror-selectednode{
width: 40%;
}

/* For centered images */
.ProseMirror img[style*="margin: 0 auto"] {
  margin-bottom: 1rem;
}
        `}</style>
      </div>
    </div>
  );
};

export default BlogEditor;