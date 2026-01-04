import React, { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent, Extension } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Bold from '@tiptap/extension-bold';
import { useToast } from '@/hooks/use-toast';
import { Bold as BoldIcon, Italic, Heading1, Heading2, Heading3, List, AlignLeft, AlignCenter, AlignRight, Upload, MinusSquare, Square, PlusSquare, Trash2, ListOrdered, X, Link2, Link2Off } from 'lucide-react';

// Custom Bold extension that only applies when explicitly triggered
const CustomBold = Bold.extend({
  addCommands() {
    return {
      ...this.parent?.(),
      toggleBold: () => ({ commands, editor }) => {
        // Only allow bold in paragraphs and text nodes, not in headings
        const { state } = editor;
        const { selection } = state;
        const { $from, $to } = selection;

        // Check if we're in a heading
        const isInHeading = $from.parent.type.name === 'heading' || $to.parent.type.name === 'heading';

        if (isInHeading) {
          // If in heading, don't apply bold formatting
          return false;
        }

        // Apply bold only when explicitly triggered by the button
        return commands.toggleMark('bold');
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-b': () => {
        // Disable keyboard shortcut for bold to prevent accidental usage
        return false;
      },
    };
  },
});

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

const CustomLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      title: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('title'),
        renderHTML: (attributes: { title?: string }) => {
          if (!attributes.title) return {};
          return { title: attributes.title };
        },
      },
    };
  },
});

const MenuBar = ({ editor, onCoverImageUpload }: { editor: Editor | null, onCoverImageUpload?: (url: string) => void }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const { toast } = useToast();

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
      const response = await fetch('https://api.projectmanagementtraininginstitute.com/upload', {
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

  const isLinkActive = () => {
    return editor.isActive('link');
  };

  const isImageLinkActive = () => {
    const { from } = editor.state.selection;
    const node = editor.state.doc.nodeAt(from);

    // Check if we're on a link node that contains an image
    if (node && node.type.name === 'link' && node.content.content[0]?.type.name === 'image') {
      return true;
    }

    // Check if we're on an image that's inside a link
    if (node && node.type.name === 'image') {
      const { $from } = editor.state.selection;
      const linkParent = $from.parent;
      return linkParent && linkParent.type.name === 'link';
    }

    return false;
  };

  const addLink = () => {
    if (!linkUrl || !editor) return;

    // Ensure URL has http:// or https://
    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;

    // Check if an image is selected
    const isImageSelected = () => {
      const { from } = editor.state.selection;
      const node = editor.state.doc.nodeAt(from);
      return node && node.type.name === 'image';
    };

    const imageSelected = isImageSelected();

    // If there's no selection and no image is selected, don't add the link
    if (editor.state.selection.empty && !imageSelected) {
      alert('Please select some text or an image first');
      return;
    }

    // Create link attributes object
    const linkAttributes: { href: string; title?: string } = { href: url };
    if (linkTitle.trim()) {
      linkAttributes.title = linkTitle.trim();
    }

    if (imageSelected) {
      // Handle linking an image
      const { from } = editor.state.selection;
      const node = editor.state.doc.nodeAt(from);

      if (node && node.type.name === 'image') {
        // Create HTML for linked image
        const linkedImageHtml = `<a href="${url}"${linkTitle.trim() ? ` title="${linkTitle.trim()}"` : ''} target="_blank" rel="noopener noreferrer nofollow"><img src="${node.attrs.src}" alt="${node.attrs.alt || ''}" title="${node.attrs.title || ''}" style="width: ${node.attrs.width || 'auto'}; ${node.attrs.alignment === 'center' ? 'display: block; margin: 0 auto;' : node.attrs.alignment === 'right' ? 'float: right;' : 'float: left;'}" /></a>`;

        // Replace the image with the linked image using HTML
        editor
          .chain()
          .focus()
          .deleteRange({ from, to: from + node.nodeSize })
          .insertContent(linkedImageHtml)
          .run();
      }
    } else {
      // Handle linking text (existing functionality)
      editor
        .chain()
        .focus()
        .setLink(linkAttributes)
        .run();
    }

    setLinkUrl('');
    setLinkTitle('');
    setShowLinkInput(false);
  };

  const removeLink = () => {
    if (!editor) return;

    // Check if we're removing a link from an image
    const { from } = editor.state.selection;
    const node = editor.state.doc.nodeAt(from);

    if (node && node.type.name === 'link') {
      // If the link contains an image, extract the image
      const imageNode = node.content.content[0];
      if (imageNode && imageNode.type.name === 'image') {
        editor
          .chain()
          .focus()
          .deleteRange({ from, to: from + node.nodeSize })
          .insertContent(imageNode)
          .run();
      } else {
        // Regular text link removal
        editor.chain().focus().unsetLink().run();
      }
    } else if (node && node.type.name === 'image') {
      // Check if the image is inside a link (HTML-based approach)
      const { $from } = editor.state.selection;
      const linkParent = $from.parent;

      if (linkParent && linkParent.type.name === 'link') {
        // Extract the image from the link
        const imageAttrs = node.attrs;
        const imageHtml = `<img src="${imageAttrs.src}" alt="${imageAttrs.alt || ''}" title="${imageAttrs.title || ''}" style="width: ${imageAttrs.width || 'auto'}; ${imageAttrs.alignment === 'center' ? 'display: block; margin: 0 auto;' : imageAttrs.alignment === 'right' ? 'float: right;' : 'float: left;'}" />`;

        editor
          .chain()
          .focus()
          .deleteRange({ from: $from.start(), to: $from.end() })
          .insertContent(imageHtml)
          .run();
      } else {
        // Regular text link removal
        editor.chain().focus().unsetLink().run();
      }
    } else {
      // Regular text link removal
      editor.chain().focus().unsetLink().run();
    }
  };

  return (
    <div className="flex flex-wrap space-x-1 space-y-1 sm:space-x-2 sm:space-y-0 border-b pb-2 mb-2 rounded-t-lg bg-gray-100 p-2 sticky-toolbar">
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
        onClick={() => {
          const { state } = editor;
          const { selection } = state;
          const { $from, $to } = selection;

          // Check if we're in a heading
          const isInHeading = $from.parent.type.name === 'heading' || $to.parent.type.name === 'heading';

          if (isInHeading) {
            // Show a toast notification that bold is not available in headings
            toast({
              title: 'Bold Not Available',
              description: 'Bold formatting is not available in headings. Use it in regular paragraphs instead.',
              variant: 'destructive',
            });
            return;
          }

          editor.chain().focus().toggleBold().run();
        }}
        className={`p-2 hover:bg-gray-200 rounded ${editor.isActive('bold') ? 'bg-gray-200' : ''
          } ${(() => {
            const { state } = editor;
            const { selection } = state;
            const { $from, $to } = selection;
            const isInHeading = $from.parent.type.name === 'heading' || $to.parent.type.name === 'heading';
            return isInHeading ? 'opacity-50 cursor-not-allowed' : '';
          })()
          }`}
        title={(() => {
          const { state } = editor;
          const { selection } = state;
          const { $from, $to } = selection;
          const isInHeading = $from.parent.type.name === 'heading' || $to.parent.type.name === 'heading';
          return isInHeading ? 'Bold not available in headings' : 'Bold';
        })()}
      >
        <BoldIcon size={16} />
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

      {/* Link controls */}
      <div className=" flex items-center gap-1">
        <button
          onClick={() => {
            if (isLinkActive() || isImageLinkActive()) {
              removeLink();
            } else {
              // Check if an image is selected and show appropriate feedback
              if (isImageSelected()) {
                toast({
                  title: 'Link Image',
                  description: 'Enter the URL to make this image clickable.',
                });
              }
              setShowLinkInput(!showLinkInput);
            }
          }}
          className={`p-1.5 hover:bg-gray-200 rounded ${isLinkActive() || isImageLinkActive() ? 'bg-gray-200' : ''
            }`}
          title={isLinkActive() || isImageLinkActive() ? 'Remove Link' : 'Add Link'}
        >
          {isLinkActive() || isImageLinkActive() ? (
            <Link2Off size={16} />
          ) : (
            <Link2 size={16} />
          )}
        </button>

        {showLinkInput && (
          <div className="absolute -top-44 left-1/3 -translate-x-1/2 mt-1 bg-white border rounded-md shadow-lg p-3 z-[99999] min-w-[200px] lg:min-w-[400px]">
            <div className="space-y-2">
              {isImageSelected() && (
                <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                  <strong>Image Link:</strong> This will make the selected image clickable.
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  URL *
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-2 py-1 border rounded text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addLink();
                    } else if (e.key === 'Escape') {
                      setShowLinkInput(false);
                      setLinkUrl('');
                      setLinkTitle('');
                    }
                  }}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Title (optional)
                </label>
                <input
                  type="text"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="Link title for accessibility"
                  className="w-full px-2 py-1 border rounded text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addLink();
                    } else if (e.key === 'Escape') {
                      setShowLinkInput(false);
                      setLinkUrl('');
                      setLinkTitle('');
                    }
                  }}
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={addLink}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  {isImageSelected() ? 'Link Image' : 'Add Link'}
                </button>
                <button
                  onClick={() => {
                    setShowLinkInput(false);
                    setLinkUrl('');
                    setLinkTitle('');
                  }}
                  className="px-3 py-1 border rounded text-sm hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

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

  // Function to clean up <strong> tags from headings
  const cleanStrongTagsFromHeadings = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Remove <strong> tags from h1, h2, h3, h4 elements
    const headings = tempDiv.querySelectorAll('h1, h2, h3, h4');
    headings.forEach(heading => {
      const strongTags = heading.querySelectorAll('strong');
      strongTags.forEach(strong => {
        // Replace <strong> with its text content
        const textNode = document.createTextNode(strong.textContent || '');
        strong.parentNode?.replaceChild(textNode, strong);
      });
    });

    return tempDiv.innerHTML;
  };

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      StarterKit.configure({
        document: false,
        bold: false, // Disable default bold extension
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
      CustomLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer nofollow',
        },
        validate: href => /^https?:\/\//.test(href),
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      CustomBold,
    ],
    content: content ? cleanStrongTagsFromHeadings(content) : '<p></p>',
    onUpdate: ({ editor }) => {
      let html = editor.getHTML();

      // Clean up any <strong> tags in headings
      const cleanedHtml = cleanStrongTagsFromHeadings(html);

      onChange(cleanedHtml);
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

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content) {
      const cleanedContent = cleanStrongTagsFromHeadings(content);
      if (editor.getHTML() !== cleanedContent) {
        editor.commands.setContent(cleanedContent);
      }
    }
  }, [content, editor]);

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
      <div className="rounded-lg border bg-white rounded-b-lg border-gray-300 relative">
        <MenuBar editor={editor} onCoverImageUpload={handleCoverImageUpload} />
        <EditorContent
          editor={editor}
          className="p-4 min-h-[600px] h-full rounded-b-lg prose max-w-none bg-white"
          style={{ paddingTop: '1rem' }}
        />
        <style>{`
          /* Sticky toolbar styles */
          .sticky-toolbar {
            position: sticky;
            top: 0;
            z-index: 50;
            background: #f9fafb;
            border-bottom: 1px solid #e5e7eb;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
            transition: all 0.2s ease;
          }
          
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
            font-weight: 600;
          }
          
          .ProseMirror h2 {
            font-size: 1.5rem;
            font-weight: 600;
          }
          
          .ProseMirror h3 {
            font-size: 1.25rem;
            font-weight: 600;
          }
          
          .ProseMirror h4 {
            font-size: 1.125rem;
            font-weight: 600;
          }
          
          .ProseMirror p {
            font-weight: normal;
          }
          
          /* Only apply bold when explicitly set via the bold button */
          .ProseMirror strong {
            font-weight: bold;
          }
          
          .ProseMirror ul,
          .ProseMirror ol {
            padding-left: 1.5em;
          }
          
          .ProseMirror li {
            margin: 0.25em 0;
          }
          
          .ProseMirror img {
            max-width: 100%;
            height: auto;
            border-radius: 0.5rem;
          }
          
          .ProseMirror a {
            color: #2563eb;
            text-decoration: none;
            cursor: pointer;
          }
          
          .ProseMirror a:hover {
            text-decoration: underline;
          }
          
          .ProseMirror a.is-active {
            background-color: rgba(37, 99, 235, 0.1);
            border-radius: 0.25rem;
            padding: 0 2px;
          }
          
          /* Linked image styling */
          .ProseMirror a img {
            transition: opacity 0.2s ease;
          }
          
          .ProseMirror a:hover img {
            opacity: 0.8;
          }
          
          /* Visual indicator for linked images */
          .ProseMirror a:has(img) {
            display: inline-block;
            position: relative;
          }
          
          .ProseMirror a:has(img)::after {
            content: '🔗';
            position: absolute;
            top: 5px;
            right: 5px;
            background: rgba(37, 99, 235, 0.9);
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            opacity: 0;
            transition: opacity 0.2s ease;
          }
          
          .ProseMirror a:has(img):hover::after {
            opacity: 1;
          }
        `}</style>
      </div>
    </div>
  );
};

export default BlogEditor;