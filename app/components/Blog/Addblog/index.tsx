import React, { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { Bold, Italic, Heading1, Heading2, Heading3, List, AlignLeft, AlignCenter, AlignRight, Upload, MinusSquare, Square, PlusSquare, Trash2, ListOrdered, ArrowDown, Link2, Link2Off, Underline as UnderlineIcon, Strikethrough, Type, Highlighter, Superscript as SuperscriptIcon, Subscript as SubscriptIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { Editor } from '@tiptap/react';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import { Table as TableIcon, MoreHorizontal } from 'lucide-react'
import { Color } from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import Underline from '@tiptap/extension-underline'
import {Strike} from '@tiptap/extension-strike'
import { createPortal } from 'react-dom';

// Add this new type for image layout
type ImageLayout = 'inline' | 'wrap' | 'block';

// Add this type for editor mode
type EditorMode = 'rich' | 'html';

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
      layout: {
        default: 'block',
        parseHTML: element => element.getAttribute('data-layout'),
        renderHTML: attributes => ({
          'data-layout': attributes.layout,
        }),
      },
      alignment: {
        default: 'left',
        parseHTML: element => element.style.float || element.style.textAlign,
        renderHTML: attributes => {
          const layout = attributes.layout;
          const alignment = attributes.alignment;
          
          if (layout === 'inline') {
            return {
              style: `
                display: inline-block;
                vertical-align: middle;
                margin: 0 1rem;
                width: auto;
                max-width: 40%;
                padding: 0.5rem;
                border-radius: 0.5rem;
                background-color: #fff;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              `
            };
          }
          
          if (layout === 'wrap') {
            return {
              style: `
                float: ${alignment};
                margin: ${alignment === 'left' ? '0.5rem 1.5rem 1rem 0' : '0.5rem 0 1rem 1.5rem'};
                width: auto;
                max-width: 45%;
                padding: 0.5rem;
                border-radius: 0.5rem;
                background-color: #fff;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              `
            };
          }
          
          return {
            style: `
              display: block;
              margin: 2rem auto;
              max-width: 100%;
              padding: 1rem;
              border-radius: 0.5rem;
              background-color: #fff;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            `
          };
        }
      }
    };
  },
});

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTextColors, setShowTextColors] = useState(false);
  const [showBgColors, setShowBgColors] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleSelectionChange = () => {
      if (!editor) return;
      
      const { from, to } = editor.state.selection;
      if (from !== to) {
        // Text is selected
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setTooltipPosition({
            x: rect.left + (rect.width / 2),
            y: rect.top - 40
          });
          setShowTooltip(true);
        }
      } else {
        setShowTooltip(false);
      }
    };

    if (editor) {
      editor.on('selectionUpdate', handleSelectionChange);
    }

    return () => {
      if (editor) {
        editor.off('selectionUpdate', handleSelectionChange);
      }
    };
  }, [editor]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showTextColors || showBgColors) {
        const target = event.target as HTMLElement;
        if (!target.closest('.color-picker-dropdown')) {
          setShowTextColors(false);
          setShowBgColors(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTextColors, showBgColors]);

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
      const authToken = localStorage.getItem('accessToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('https://api.4pmti.com/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
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

  // Add new function to handle line breaks
  const addLineBreak = () => {
    editor.chain().focus().setHardBreak().run();
  };

  const addLink = () => {
    if (!linkUrl || !editor) return;
    
    // Ensure URL has http:// or https://
    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
    
    // If there's no selection, don't add the link
    if (editor.state.selection.empty) {
      alert('Please select some text first');
      return;
    }

    // Create link attributes object
    const linkAttributes: { href: string; title?: string } = { href: url };
    if (linkTitle.trim()) {
      linkAttributes.title = linkTitle.trim();
    }

    editor
      .chain()
      .focus()
      .setLink(linkAttributes)
      .run();

    setLinkUrl('');
    setLinkTitle('');
    setShowLinkInput(false);
  };

  const removeLink = () => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  const addColumnBefore = () => {
    editor.chain().focus().addColumnBefore().run()
  }

  const addColumnAfter = () => {
    editor.chain().focus().addColumnAfter().run()
  }

  const deleteColumn = () => {
    editor.chain().focus().deleteColumn().run()
  }

  const addRowBefore = () => {
    editor.chain().focus().addRowBefore().run()
  }

  const addRowAfter = () => {
    editor.chain().focus().addRowAfter().run()
  }

  const deleteRow = () => {
    editor.chain().focus().deleteRow().run()
  }

  const deleteTable = () => {
    editor.chain().focus().deleteTable().run()
  }

  const toggleHeaderCell = () => {
    editor.chain().focus().toggleHeaderCell().run()
  }

  const mergeOrSplit = () => {
    if (editor.can().mergeCells()) {
      editor.chain().focus().mergeCells().run()
    } else if (editor.can().splitCell()) {
      editor.chain().focus().splitCell().run()
    }
  }

  const handleHeadingToggle = (level: 1 | 2 | 3) => {
    if (level === 1) {
      // Check if H1 already exists
      let hasH1 = false;
      editor.state.doc.descendants((node) => {
        if (node.type.name === 'heading' && node.attrs.level === 1) {
          hasH1 = true;
          return false; // Stop traversing
        }
        return true;
      });

      if (hasH1) {
        // Show warning message
        alert('Only one H1 heading is allowed per blog post. Using H2 instead.');
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        return;
      }
    }
    editor.chain().focus().toggleHeading({ level }).run();
  };

  // Add these functions to the MenuBar component
  const setImageLayout = (layout: ImageLayout) => {
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
          alignment: imageNode.attrs.alignment,
          layout: layout
        })
        .run();
    }
  };

  const colors = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc',
    '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff', '#980000', '#ff0000',
    '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff',
    '#9900ff', '#ff00ff'
  ];

  const bgColors = [
    '#ffffff', '#f3f3f3', '#efefef', '#d9d9d9', '#cccccc', '#b7b7b7',
    '#999999', '#666666', '#434343', '#000000', '#ffd2d2', '#ffe6cc',
    '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#d9d2e9', '#ead1dc'
  ];

  // Add these helper functions
  const getCurrentTextColor = () => {
    return editor?.getAttributes('textStyle').color || '#000000';
  };

  const getCurrentHighlightColor = () => {
    return editor?.getAttributes('highlight').color || 'transparent';
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-gray-100 border-b sticky top-0 overflow-x-auto z-50">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
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
      
      {/* Heading buttons - Fixed to properly apply heading styles */}
      <button
        onClick={() => handleHeadingToggle(1)}
        className={`p-2 hover:bg-gray-200 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
        title="Heading 1"
      >
        <Heading1 size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 hover:bg-gray-200 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
        title="Heading 2"
      >
        <Heading2 size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-2 hover:bg-gray-200 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
        title="Heading 3"
      >
        <Heading3 size={16} />
      </button>
      
      <div className="border-l mx-2 h-6"></div>
      
      {/* List buttons - Added both bullet and ordered list options */}
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
      
      <button
        onClick={addImage}
        className="p-2 hover:bg-gray-200 rounded"
        disabled={isUploading}
        title="Upload Image"
      >
        <Upload size={16} />
      </button>

      {/* Link controls */}
      <div className="relative flex items-center gap-1">
        <button
          onClick={() => {
            if (editor.isActive('link')) {
              removeLink();
            } else {
              setShowLinkInput(!showLinkInput);
            }
          }}
          className={`p-1.5 hover:bg-gray-200 rounded ${
            editor.isActive('link') ? 'bg-gray-200' : ''
          }`}
          title={editor.isActive('link') ? 'Remove Link' : 'Add Link'}
        >
          {editor.isActive('link') ? (
            <Link2Off size={16} />
          ) : (
            <Link2 size={16} />
          )}
        </button>

        {showLinkInput && (
          <div className="absolute top-full left-0 mt-1 bg-white border rounded-md shadow-lg p-3 z-[9999] min-w-[400px] ">
            <div className="space-y-2">
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
                  Add Link
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
          
          {/* Layout controls */}
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded">
            <button
              onClick={() => setImageLayout('inline')}
              className={`p-1.5 hover:bg-gray-200 rounded text-xs ${
                editor.isActive('image', { layout: 'inline' }) ? 'bg-gray-200' : ''
              }`}
              title="Inline with text"
            >
              Inline
            </button>
            <button
              onClick={() => setImageLayout('wrap')}
              className={`p-1.5 hover:bg-gray-200 rounded text-xs ${
                editor.isActive('image', { layout: 'wrap' }) ? 'bg-gray-200' : ''
              }`}
              title="Text wraps around"
            >
              Wrap
            </button>
            <button
              onClick={() => setImageLayout('block')}
              className={`p-1.5 hover:bg-gray-200 rounded text-xs ${
                editor.isActive('image', { layout: 'block' }) ? 'bg-gray-200' : ''
              }`}
              title="Full width block"
            >
              Block
            </button>
          </div>

          {/* Size controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => resizeImage('150px')}
              className="p-1.5 hover:bg-gray-200 rounded"
              title="Extra Small"
            >
              <MinusSquare size={12} />
            </button>
            <button
              onClick={() => resizeImage('200px')}
              className="p-1.5 hover:bg-gray-200 rounded"
              title="Small"
            >
              <MinusSquare size={14} />
            </button>
            <button
              onClick={() => resizeImage('300px')}
              className="p-1.5 hover:bg-gray-200 rounded"
              title="Medium"
            >
              <Square size={16} />
            </button>
            <button
              onClick={() => resizeImage('400px')}
              className="p-1.5 hover:bg-gray-200 rounded"
              title="Large"
            >
              <PlusSquare size={18} />
            </button>
            <button
              onClick={() => resizeImage('600px')}
              className="p-1.5 hover:bg-gray-200 rounded"
              title="Extra Large"
            >
              <PlusSquare size={20} />
            </button>
          </div>

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

      {/* Add Line Break button */}
      <button
        onClick={addLineBreak}
        className="p-1.5 hover:bg-gray-200 rounded"
        title="Add Line Break"
      >
        <ArrowDown size={16} />
      </button>

      {/* Text formatting buttons */}
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 hover:bg-gray-200 rounded ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
        title="Underline"
      >
        <UnderlineIcon size={16} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-2 hover:bg-gray-200 rounded ${editor.isActive('strike') ? 'bg-gray-200' : ''}`}
        title="Strikethrough"
      >
        <Strikethrough size={16} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        className={`p-2 hover:bg-gray-200 rounded ${editor.isActive('superscript') ? 'bg-gray-200' : ''}`}
        title="Superscript"
      >
        <SuperscriptIcon size={16} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        className={`p-2 hover:bg-gray-200 rounded ${editor.isActive('subscript') ? 'bg-gray-200' : ''}`}
        title="Subscript"
      >
        <SubscriptIcon size={16} />
      </button>

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

      {/* Table controls */}
      <button
        onClick={addTable}
        className="p-2 hover:bg-gray-200 rounded"
        title="Insert Table"
      >
        <TableIcon size={16} />
      </button>

      {editor.isActive('table') && (
        <div className="flex items-center gap-1">
          <button
            onClick={addColumnBefore}
            className="p-2 hover:bg-gray-200 rounded text-xs"
            title="Add Column Before"
          >
            +←
          </button>
          <button
            onClick={addColumnAfter}
            className="p-2 hover:bg-gray-200 rounded text-xs"
            title="Add Column After"
          >
            →+
          </button>
          <button
            onClick={deleteColumn}
            className="p-2 hover:bg-gray-200 rounded text-xs text-red-500"
            title="Delete Column"
          >
            -↕
          </button>
          <button
            onClick={addRowBefore}
            className="p-2 hover:bg-gray-200 rounded text-xs"
            title="Add Row Before"
          >
            +↑
          </button>
          <button
            onClick={addRowAfter}
            className="p-2 hover:bg-gray-200 rounded text-xs"
            title="Add Row After"
          >
            ↓+
          </button>
          <button
            onClick={deleteRow}
            className="p-2 hover:bg-gray-200 rounded text-xs text-red-500"
            title="Delete Row"
          >
            -↔
          </button>
          <button
            onClick={toggleHeaderCell}
            className="p-2 hover:bg-gray-200 rounded text-xs"
            title="Toggle Header Cell"
          >
            TH
          </button>
          <button
            onClick={mergeOrSplit}
            className="p-2 hover:bg-gray-200 rounded"
            title="Merge/Split Cells"
          >
            <MoreHorizontal size={16} />
          </button>
          <button
            onClick={deleteTable}
            className="p-2 hover:bg-gray-200 rounded text-red-500"
            title="Delete Table"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {/* Text Color Picker */}
      <div className="relative">
        <button
          className="p-2 hover:bg-gray-200 rounded flex items-center gap-1 group"
          onClick={(e) => {
            const button = e.currentTarget;
            const rect = button.getBoundingClientRect();
            setDropdownPosition({
              top: rect.bottom + window.scrollY + 5,
              left: rect.left + window.scrollX
            });
            setShowTextColors(!showTextColors);
            setShowBgColors(false); // Close other dropdown
          }}
          title="Text Color"
        >
          <Type size={16} />
          <div 
            className="w-4 h-4 border rounded" 
            style={{ backgroundColor: editor?.getAttributes('textStyle').color || '#000000' }}
          />
        </button>

        {showTextColors && (
  <div
    className="absolute z-50 bg-white rounded-lg shadow-xl p-2 color-picker-dropdown"
    style={{
      top: `${dropdownPosition.top}px`,
      left: `${dropdownPosition.left}px`,
      width: '240px',
    }}
  >
    <div className="grid grid-cols-10 gap-1">
      {colors.map((color) => (
        <button
          key={color}  // Add key prop here
          className="w-6 h-6 rounded border hover:scale-125 transition-transform relative"
          style={{ backgroundColor: color }}
          onClick={() => {
            editor?.chain().focus().setColor(color).run();
            setShowTextColors(false);
          }}
        >
          {editor?.getAttributes('textStyle').color === color && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className={`text-${color === '#ffffff' ? 'black' : 'white'} text-xs`}>✓</span>
            </span>
          )}
        </button>
      ))}
    </div>
  </div>
)}
      </div>

      {/* Background Color Picker */}
      <div className="relative">
        <button
          className="p-2 hover:bg-gray-200 rounded flex items-center gap-1 group"
          onClick={(e) => {
            const button = e.currentTarget;
            const rect = button.getBoundingClientRect();
            setDropdownPosition({
              top: rect.bottom + window.scrollY + 5,
              left: rect.left + window.scrollX
            });
            setShowTextColors(!showTextColors);
            setShowBgColors(false);
          }}
          title="Highlight Color"
        >
          <Highlighter size={16} />
          <div 
            className="w-4 h-4 border rounded" 
            style={{ backgroundColor: editor?.getAttributes('highlight').color || 'transparent' }}
          />
        </button>

        {showBgColors && (
          <div
            className="absolute z-[9999] bg-white rounded-lg shadow-xl p-2 color-picker-dropdown"
            style={{
              top: '100%',
              left: '0',
              marginTop: '5px',
              width: '240px',
            }}
          >
            <div className="grid grid-cols-10 gap-1">
              {bgColors.map((color) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded border hover:scale-125 transition-transform relative"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    editor?.chain().focus().toggleHighlight({ color }).run();
                    setShowBgColors(false);
                  }}
                >
                  {editor?.getAttributes('highlight').color === color && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-${color === '#ffffff' ? 'black' : 'white'} text-xs`}>✓</span>
                    </span>
                  )}
                </button>
              ))}
              <button
                className="w-6 h-6 rounded border hover:scale-125 transition-transform flex items-center justify-center"
                onClick={() => {
                  editor?.chain().focus().unsetHighlight().run();
                  setShowBgColors(false);
                }}
                title="Remove highlight"
              >
                <span className="text-red-500 text-xs">×</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface BlogEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ content, onChange }) => {
  const [editorMode, setEditorMode] = useState<EditorMode>('rich');
  const [htmlContent, setHtmlContent] = useState(content);
  const [slug, setSlug] = useState('');

  // Update content when editor mode changes
  useEffect(() => {
    if (editorMode === 'html') {
      setHtmlContent(content);
    }
  }, [editorMode, content]);

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setHtmlContent(newContent);
    onChange(newContent);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, editor: Editor) => {
    e.preventDefault();
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      for (const file of imageFiles) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const content = e.target?.result;
          if (content) {
            await editor.chain().focus().insertContent(content).run();
          }
        };
        reader.readAsDataURL(file);
      }
    } else {
      // Handle text drag and drop
      const text = e.dataTransfer.getData('text');
      if (text) {
        editor.commands.insertContent(text);
      }
    }
  };

  const createH1Extension = () => {
    return StarterKit.configure({
      document: false,
      heading: {
        levels: [1, 2, 3],
        HTMLAttributes: {
          class: 'heading',
        },
      },
      bulletList: {
        keepMarks: true,
        keepAttributes: false
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false
      },
      // @ts-ignore
      underline: false,
      strike: false,
      color: false,
      highlight: false,
      textStyle: false,
    }).extend({
      addKeyboardShortcuts() {
        return {
          'Mod-Alt-1': () => {
            // Check if H1 already exists
            const hasH1 = this.editor.state.doc.descendants((node) => {
              return node.type.name === 'heading' && node.attrs.level === 1;
              // @ts-ignore
            }).some((node: { type: { name: string; }; attrs: { level: number; }; }) => node.type.name === 'heading' && node.attrs.level === 1);
            
            if (hasH1) {
              // If H1 exists, convert to H2 instead
              this.editor.commands.toggleHeading({ level: 2 });
            }
            return this.editor.commands.toggleHeading({ level: 1 });
          },
        };
      },
    });
  };

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph.configure({
        HTMLAttributes: {
          class: 'blog-paragraph',
        },
      }),
      Text,
      createH1Extension(),
      CustomImage,
      TextStyle,
      Color.configure({ types: [TextStyle.name] }),
      Highlight.configure({ multicolor: true }),
      Underline,
      Strike,
      Superscript,
      Subscript,
      TextAlign.configure({
        types: ['heading', 'paragraph', 'table'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:underline cursor-pointer',
          rel: 'noopener noreferrer nofollow',
          target: '_blank',
        },
        validate: href => /^https?:\/\//.test(href),
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: content || '<p></p>',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
        .replace(/<br\s*\/?>/g, '<br />')
        .replace(/(<\/[^>]+>)(<[^>]+>)/g, '$1\n$2')
        .trim();
      
      onChange(html);
    },
    parseOptions: {
      preserveWhitespace: true,
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none',
      },
    },
  });

  const handleSlugChange = (value: string) => {
    // Convert to lowercase and replace spaces with hyphens
    const formattedSlug = value
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace one or more spaces with a single hyphen
      .replace(/[^a-z0-9-]/g, '') // Remove any characters that aren't letters, numbers, or hyphens
      .replace(/-+/g, '-') // Replace multiple consecutive hyphens with a single hyphen
      .replace(/^-+|-+$/g, ''); // Remove hyphens from start and end
    
    setSlug(formattedSlug);
    
    // Clear validation error if slug is not empty
    if (formattedSlug) {
      // @ts-ignore
      setValidationErrors((prev: Record<string, unknown>) => ({ ...prev, slug: undefined }));
    }
  };

  return (
    <div className="rounded-lg border relative bg-white ">
      {/* Editor Mode Switch */}
      <div className="flex items-center justify-end gap-4 p-2 bg-gray-50 border-b">
        <div className="flex items-center space-x-2">
          <Label htmlFor="editor-mode" className="text-sm font-medium">
            HTML Mode
          </Label>
          <Switch
            id="editor-mode"
            checked={editorMode === 'html'}
            onCheckedChange={(checked) => setEditorMode(checked ? 'html' : 'rich')}
          />
        </div>
      </div>

      {editorMode === 'rich' ? (
        <>
          <MenuBar editor={editor} />
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => editor && handleDrop(e, editor)}
            className="relative"
          >
            <div className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center cursor-move opacity-30 hover:opacity-100 transition-opacity">
              <DragHandleDots2Icon className="h-5 w-5 text-gray-500" />
            </div>
            <EditorContent 
              editor={editor} 
              className="p-4 pl-8 min-h-[400px] prose max-w-none z-20"
            />
          </div>
        </>
      ) : (
        <div className="relative">
          <textarea
            value={htmlContent}
            onChange={handleHtmlChange}
            className="w-full min-h-[400px] p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            placeholder="Enter HTML content..."
            spellCheck={false}
          />
          <div className="absolute right-2 bottom-2 text-xs text-gray-400">
            HTML Editor
          </div>
        </div>
      )}

      <style>{`
        /* Base editor styles */
        .ProseMirror {
          position: relative;
          cursor: text;
          outline: none;
          min-height: 400px;
          line-height: 1.6;
          font-size: 16px;
          padding: 1rem;
        }

        /* Heading styles */
        .ProseMirror h1 {
          font-size: 2em;
          font-weight: 700;
          margin: 1em 0 0.5em;
          color: #111827;
        }

        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin: 1em 0 0.5em;
          color: #111827;
        }

        .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin: 1em 0 0.5em;
          color: #111827;
        }

        /* Paragraph spacing */
        .ProseMirror p {
          margin: 0.75em 0;
        }

        /* List styles */
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.2em;
          margin: 0.5em 0;
        }

        .ProseMirror li {
          margin: 0.2em 0;
        }

        /* Image styles */
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          padding: 4rem;
          background-color: #fff;

        }

        .ProseMirror img.is-selected {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
        }

        /* Text selection */
        .ProseMirror ::selection {
          background: rgba(37, 99, 235, 0.2);
        }

        /* Line break styling */
        .ProseMirror br {
          display: block;
          height: 0.5em;
        }

        /* Mobile responsiveness */
        @media (max-width: 640px) {
          .ProseMirror {
            padding: 0.75rem;
            font-size: 15px;
          }

          .ProseMirror h1 {
            font-size: 1.75em;
          }

          .ProseMirror h2 {
            font-size: 1.35em;
          }

          .ProseMirror h3 {
            font-size: 1.15em;
          }
        }

        /* Link styles */
        .ProseMirror a {
          color: #2563eb;
          text-decoration: none;
          cursor: pointer;
        }

        .ProseMirror a:hover {
          text-decoration: underline;
        }

        /* Selected link state */
        .ProseMirror a.is-active {
          background-color: rgba(37, 99, 235, 0.1);
          border-radius: 0.25rem;
          padding: 0 2px;
        }

        /* Image alignment */
        .ProseMirror img[data-alignment="left"] {
          float: left;
          margin: 2.5rem 2rem 2rem 0;
          max-width: 50%;
        }

        .ProseMirror img[data-alignment="center"] {
          display: block;
          margin: 2.5rem auto;
          max-width: 70%;
        }

        .ProseMirror img[data-alignment="right"] {
          float: right;
          margin: 2.5rem 0 2rem 2rem;
          max-width: 50%;
        }

        /* Image size transition */
        .ProseMirror img {
          transition: width 0.2s ease;
        }

        /* Selection styles */
        .ProseMirror ::selection {
          background: rgba(37, 99, 235, 0.2);
        }

        /* Tooltip animation */
        @keyframes tooltipFade {
          from { opacity: 0; transform: translateY(10px) translateX(-50%); }
          to { opacity: 1; transform: translateY(0) translateX(-50%); }
        }

        .tooltip {
          animation: tooltipFade 0.2s ease-out;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .ProseMirror table {
          border-collapse: collapse;
          margin: 0;
          overflow: hidden;
          table-layout: fixed;
          width: 100%;
        }

        .ProseMirror table td,
        .ProseMirror table th {
          border: 2px solid #ced4da;
          box-sizing: border-box;
          min-width: 1em;
          padding: 8px;
          position: relative;
          vertical-align: top;
        }

        .ProseMirror table th {
          background-color: #f8f9fa;
          font-weight: bold;
          text-align: left;
        }

        .ProseMirror table .selectedCell:after {
          background: rgba(200, 200, 255, 0.4);
          content: "";
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          pointer-events: none;
          position: absolute;
          z-index: 2;
        }

        .ProseMirror table .column-resize-handle {
          background-color: #adf;
          bottom: -2px;
          position: absolute;
          right: -2px;
          pointer-events: none;
          top: 0;
          width: 4px;
        }

        .tableWrapper {
          padding: 1rem 0;
          overflow-x: auto;
        }

        /* Image and text spacing styles */
        .ProseMirror {
          img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            margin: 1.5rem 0;
            clear: both;
          }

          img[data-alignment="left"] {
            float: left;
            margin-right: 2rem;
            margin-bottom: 1rem;
            max-width: 50%;
          }

          img[data-alignment="right"] {
            float: right;
            margin-left: 2rem;
            margin-bottom: 1rem;
            max-width: 50%;
          }

          img[data-alignment="center"] {
            display: block;
            margin: 1.5rem auto;
            max-width: 70%;
          }

          /* Clear floats after images */
          p:after {
            content: "";
            display: table;
            clear: both;
          }

          /* Responsive image sizing */
          @media (max-width: 768px) {
            img[data-alignment="left"],
            img[data-alignment="right"] {
              float: none;
              margin: 1.5rem auto;
              max-width: 100%;
              display: block;
            }

            img[data-alignment="center"] {
              max-width: 100%;
            }
          }

          /* Add spacing between paragraphs */
          p {
            margin: 1.2rem 0;
            line-height: 1.6;
          }

          /* Add spacing for headings */
          h1, h2, h3, h4, h5, h6 {
            margin-top: 2rem;
            margin-bottom: 1rem;
            clear: both;
          }

          /* Table spacing */
          table {
            margin: 1.5rem 0;
            width: 100%;
            clear: both;
          }
        }

        .blog-paragraph {
          margin: 1.5rem 0;
          line-height: 2; /* Increased line height */
          font-size: 1.1rem;
        }

        /* Heading styles */
        h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 2rem 0 1.5rem;
          line-height: 1.2;
          color: #111827;
        }

        h2 {
          font-size: 2rem;
          font-weight: 600;
          margin: 2rem 0 1rem;
          line-height: 1.3;
          color: #1f2937;
        }

        h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1.5rem 0 1rem;
          line-height: 1.4;
          color: #374151;
        }

        /* Image container styles */
        .image-container {
          position: relative;
          margin: 2.5rem 0;
          padding: 1rem;
          background-color: #fff;
          border-radius: 0.5rem;
         
        }

        /* Clear floats after paragraphs containing images */
        p:has(img) {
          overflow: hidden;
          margin: 2rem 0;
        }

        /* Add spacing between consecutive images */
        img + img {
          margin-top: 3rem;
        }

        /* Responsive image sizing with maintained spacing */
        @media (max-width: 768px) {
          img[data-alignment="left"],
          img[data-alignment="right"] {
            float: none;
            margin: 2.5rem auto;
            max-width: 100%;
            display: block;
          }

          img[data-alignment="center"] {
            max-width: 100%;
            margin: 2.5rem auto;
          }

          .image-container {
            margin: 2rem 0;
          }
        }

        /* Image layout styles */
        img[data-layout="inline"] {
          display: inline-block;
          vertical-align: middle;
          margin: 0 1rem;
          width: auto;
          max-width: 40%;
        }

        img[data-layout="wrap"] {
          max-width: 45%;
          margin: 0.5rem 1.5rem 1rem 0;
          
          &[data-alignment="right"] {
            float: right;
            margin: 0.5rem 0 1rem 1.5rem;
          }
          
          &[data-alignment="left"] {
            float: left;
            margin: 0.5rem 1.5rem 1rem 0;
          }
        }

        img[data-layout="block"] {
          display: block;
          margin: 2rem auto;
          max-width: 100%;
        }

        /* Clear floats after wrapped images */
        p:after {
          content: "";
          display: table;
          clear: both;
        }

        /* Improve text wrapping around images */
        p {
          overflow: hidden;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          img[data-layout="inline"],
          img[data-layout="wrap"] {
            float: none;
            display: block;
            margin: 1rem auto;
            max-width: 100%;
          }
        }

        /* HTML Editor styles */
        textarea {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
          line-height: 1.5;
          tab-size: 2;
        }

        /* Add syntax highlighting hint */
        textarea::selection {
          background: rgba(37, 99, 235, 0.1);
        }

        /* Add these new styles */
        mark {
          border-radius: 0.2em;
          padding: 0.1em 0.3em;
          margin: 0 0.1em;
        }

        u {
          text-decoration: underline;
          text-decoration-thickness: 0.1em;
        }

        s {
          text-decoration-thickness: 0.1em;
        }

        sup {
          font-size: 0.7em;
        }

        sub {
          font-size: 0.7em;
        }

        /* Color picker styles */
        .fixed[style*="z-index: 99999"] {
          box-shadow: 0 0 0 1px rgba(0,0,0,0.05), 0 4px 6px rgba(0,0,0,0.1), 0 10px 20px rgba(0,0,0,0.1);
          animation: colorPickerFadeIn 0.2s ease;
        }

        @keyframes colorPickerFadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Text color styles */
        [style*="color:"] {
          color: var(--text-color);
        }

        /* Highlight styles */
        mark {
          background-color: var(--highlight-color);
          color: inherit;
        }

        /* Color picker dropdown styles */
        .color-picker-dropdown {
          animation: dropdownFadeIn 0.2s ease;
        }

        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .color-picker-dropdown button {
          transition: transform 0.2s ease;
        }

        .color-picker-dropdown button:hover {
          transform: scale(1.25);
          z-index: 1;
        }

        /* Ensure the dropdown is above other content */
        .color-picker-dropdown {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
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
      <div 
        dangerouslySetInnerHTML={{ 
          __html: content
        }} 
      />
    </div>
    <style>{`
      .prose {
        /* ... existing styles ... */

        img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          padding: 1rem;
          background-color: #fff;
        
        }

        img[data-alignment="left"] {
          float: left;
          margin: 2.5rem 2rem 2rem 0;
          max-width: 50%;
        }

        img[data-alignment="right"] {
          float: right;
          margin: 2.5rem 0 2rem 2rem;
          max-width: 50%;
        }

        img[data-alignment="center"] {
          display: block;
          margin: 2.5rem auto;
          max-width: 70%;
        }

        /* Image container styles */
        .image-container {
          position: relative;
          margin: 2.5rem 0;
          padding: 1rem;
          background-color: #fff;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        /* Clear floats and add spacing for paragraphs with images */
        p:has(img) {
          overflow: hidden;
          margin: 2rem 0;
        }

        /* Add spacing between consecutive images */
        img + img {
          margin-top: 3rem;
        }

        /* Responsive image sizing */
        @media (max-width: 768px) {
          img[data-alignment="left"],
          img[data-alignment="right"] {
            float: none;
            margin: 2.5rem auto;
            max-width: 100%;
            display: block;
          }

          img[data-alignment="center"] {
            max-width: 100%;
            margin: 2.5rem auto;
          }

          .image-container {
            margin: 2rem 0;
          }
        }

        /* Improved paragraph spacing */
        p {
          margin: 1.5rem 0;
          line-height: 2; /* Increased line height */
          font-size: 1.1rem;
          color: #374151;
        }

        /* Heading spacing */
        h1, h2, h3, h4, h5, h6 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          clear: both;
        }

        /* List spacing */
        ul, ol {
          margin: 1.5rem 0;
          padding-left: 1.8rem;
          line-height: 1.8;
        }

        li {
          margin: 0.8rem 0;
        }

        /* Table spacing */
        table {
          margin: 1.5rem 0;
          width: 100%;
          clear: both;
        }

        /* Image layout styles */
        img[data-layout="inline"] {
          display: inline-block;
          vertical-align: middle;
          margin: 0 1rem;
          width: auto;
          max-width: 40%;
        }

        img[data-layout="wrap"] {
          max-width: 45%;
          margin: 0.5rem 1.5rem 1rem 0;
          
          &[data-alignment="right"] {
            float: right;
            margin: 0.5rem 0 1rem 1.5rem;
          }
          
          &[data-alignment="left"] {
            float: left;
            margin: 0.5rem 1.5rem 1rem 0;
          }
        }

        img[data-layout="block"] {
          display: block;
          margin: 2rem auto;
          max-width: 100%;
        }

        /* Clear floats and improve text wrapping */
        p {
          overflow: hidden;
          
          &:after {
            content: "";
            display: table;
            clear: both;
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          img[data-layout="inline"],
          img[data-layout="wrap"] {
            float: none;
            display: block;
            margin: 1rem auto;
            max-width: 100%;
          }
        }
      }
    `}</style>
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
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false);
  const [thumbnailError, setThumbnailError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    category?: string;
    content?: string;
    slug?: string;
  }>({});
  const [slug, setSlug] = useState('');
  const [head, setHead] = useState('');
  const [script, setScript] = useState('');

  const validateForm = () => {
    const errors: {
      title?: string;
      category?: string;
      content?: string;
      slug?: string;
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
    
    if (!slug.trim()) {
      errors.slug = 'Slug is required';
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
      coverImage: coverImageUrl,
      thumbnail: thumbnailUrl,
      slug,
      metadata: {
        head: head.toString(),
        script: script.toString()
      }
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
      setCoverImageUrl('');
      setThumbnailUrl('');
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
      const authToken = localStorage.getItem('accessToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('https://api.4pmti.com/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
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

  const handleThumbnailUpload = async (file: File) => {
    const allowedTypes = ['png', 'jpg', 'jpeg'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      setThumbnailError('Only PNG, JPG, and JPEG files are allowed.');
      return;
    }
  
    setIsThumbnailUploading(true);
    setThumbnailError('');
  
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const authToken = localStorage.getItem('accessToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('https://api.4pmti.com/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });
  
      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      setThumbnailUrl(data.data.url);
    } catch (error) {
      setThumbnailError('Failed to upload thumbnail. Please try again.');
    } finally {
      setIsThumbnailUploading(false);
    }
  };

  const handleDeleteThumbnail = () => {
    setThumbnailUrl('');
    setThumbnailError('');
  };

  const handleSlugChange = (value: string) => {
    // Convert to lowercase and replace spaces with hyphens
    const formattedSlug = value
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace one or more spaces with a single hyphen
      .replace(/[^a-z0-9-]/g, '') // Remove any characters that aren't letters, numbers, or hyphens
      .replace(/-+/g, '-') // Replace multiple consecutive hyphens with a single hyphen
      .replace(/^-+|-+$/g, ''); // Remove hyphens from start and end
    
    setSlug(formattedSlug);
    
    // Clear validation error if slug is not empty
    if (formattedSlug) {
      setValidationErrors(prev => ({ ...prev, slug: undefined }));
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    // Clear title validation error if title is not empty
    if (newTitle.trim()) {
      setValidationErrors(prev => ({ ...prev, title: undefined }));
    }
    
    // Automatically update slug when title changes if slug is empty
    if (!slug) {
      handleSlugChange(newTitle);
    }
  };

  // Add this function to generate meta description from content
  const generateMetaDescription = (content: string): string => {
    // Remove HTML tags and get plain text
    const plainText = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    // Get first 155-160 characters (optimal meta description length)
    const description = plainText.substring(0, 155);
    return description.length === 155 ? `${description}...` : description;
  };

  // Add this function to generate head content
  const generateHeadContent = () => {
    const metaDescription = generateMetaDescription(content);
    const canonicalUrl = `https://yourdomain.com/blog/${slug}`; // Replace with your actual domain

    const headContent = `<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title" content="${title}" />
<meta name="description" content="${metaDescription}" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="article" />
<meta property="og:url" content="${canonicalUrl}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${metaDescription}" />
${coverImageUrl ? `<meta property="og:image" content="${coverImageUrl}" />` : ''}

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content="${canonicalUrl}" />
<meta property="twitter:title" content="${title}" />
<meta property="twitter:description" content="${metaDescription}" />
${coverImageUrl ? `<meta property="twitter:image" content="${coverImageUrl}" />` : ''}

<!-- Additional Meta Tags -->
<meta name="robots" content="index, follow" />
<meta name="author" content="Your Site Name" />
<link rel="canonical" href="${canonicalUrl}" />`;

    setHead(headContent);
  };

  // Add effect to update head when relevant fields change
  useEffect(() => {
    if (title && content) {
      generateHeadContent();
    }
  }, [title, content, slug, coverImageUrl]);

  return (
    <div className="max-w-7xl mx-auto px-0 sm:px-2 lg:px-8 py-5">
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
              onChange={handleTitleChange}
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
              Slug <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className={`w-full border rounded-md p-2 font-mono text-sm ${
                  validationErrors.slug ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="enter-your-slug-here"
              />
              <button
                onClick={() => handleSlugChange(title)}
                type="button"
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 transition-colors"
                title="Generate from title"
              >
                Generate from title
              </button>
            </div>
            {validationErrors.slug && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.slug}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              This will be the URL of your blog post. Use hyphens to separate words.
            </p>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail
            </label>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleThumbnailUpload(file);
                }}
                accept="image/png, image/jpeg, image/jpg"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              
              {thumbnailError && (
                <p className="text-red-500 text-sm">{thumbnailError}</p>
              )}
              
              {isThumbnailUploading && (
                <div className="mt-2 w-full h-48 bg-gray-100 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer" />
                </div>
              )}
              
              {thumbnailUrl && !isThumbnailUploading && (
                <div className="mt-2 border rounded-lg overflow-hidden relative group">
                  <img
                    src={thumbnailUrl}
                    alt="Thumbnail preview"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={handleDeleteThumbnail}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                    title="Delete thumbnail"
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

        {/* Add these fields before the Content section */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Head
              <span className="ml-1 text-xs text-gray-500">(Auto-generated, but can be modified)</span>
            </label>
            <textarea
              value={head}
              onChange={(e) => setHead(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 font-mono text-sm"
              rows={12}
              placeholder="Meta tags will be auto-generated when you add a title and content..."
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={generateHeadContent}
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Regenerate meta tags
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              These meta tags help with SEO and social media sharing. You can edit them manually if needed.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Script
              <span className="ml-1 text-xs text-gray-500">(Add JavaScript code)</span>
            </label>
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 font-mono text-sm"
              rows={4}
              placeholder="<script>
  // Your JavaScript code here
</script>"
            />
            <p className="mt-1 text-xs text-gray-500">
              Add JavaScript code that will be executed on the page
            </p>
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
