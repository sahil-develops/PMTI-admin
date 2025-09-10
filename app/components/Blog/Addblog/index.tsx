import React, { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { Bold, Italic, Heading1, Heading2, Heading3, List, AlignLeft, AlignCenter, AlignRight, Upload, MinusSquare, Square, PlusSquare, Trash2, ListOrdered, ArrowDown, Link2, Link2Off, Underline as UnderlineIcon, Strikethrough, Type, Highlighter, Superscript as SuperscriptIcon, Subscript as SubscriptIcon, Plus, GripVertical, ChevronDown, ChevronUp, Copy, Edit3, HelpCircle, MessageSquare, X, Check, Settings } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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


import { useRouter } from 'next/navigation';

// Add this new type for image layout
type ImageLayout = 'inline' | 'wrap' | 'block';

// Add this type for editor mode
type EditorMode = 'rich' | 'html';

// FAQ Types
interface FAQ {
  id: string;
  question: string;
  answer: string;
  isExpanded?: boolean;
}

interface FAQTemplate {
  id: string;
  name: string;
  question: string;
  answer: string;
  category: string;
}

// WordPress-style FAQ Inserter Component
const FAQInserter = ({ editor }: { editor: Editor | null }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')

  const insertFAQ = () => {
    if (!editor || !question.trim() || !answer.trim()) return

    const faqId = `faq-${Date.now()}`
    const faqHTML = `
      <div class="wp-faq-block" data-faq-id="${faqId}">
        <div class="faq-header" onclick="toggleFAQ('${faqId}')">
          <h3>${question}</h3>
          <svg class="faq-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
        </div>
        <div id="${faqId}-content" class="faq-content">
          <div>
            ${answer}
          </div>
        </div>
      </div>
    `

    editor.chain().focus().insertContent(faqHTML).run()
    
    // Reset form
    setQuestion('')
    setAnswer('')
    setIsOpen(false)
  }

  const insertFAQFromTemplate = (template: FAQTemplate) => {
    if (!editor) return

    const faqId = `faq-${Date.now()}`
    const faqHTML = `
      <div class="wp-faq-block" data-faq-id="${faqId}">
        <div class="faq-header" onclick="toggleFAQ('${faqId}')">
          <h3>${template.question}</h3>
          <svg class="faq-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
        </div>
        <div id="${faqId}-content" class="faq-content">
          <div>
            ${template.answer}
          </div>
        </div>
      </div>
    `

    editor.chain().focus().insertContent(faqHTML).run()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-200 rounded flex items-center gap-2"
        title="Insert FAQ"
      >
        <HelpCircle size={16} />
        <span className="text-sm font-medium">Insert FAQ</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-white border rounded-lg shadow-xl z-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Add FAQ</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Question</Label>
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter your question..."
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Answer</Label>
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer..."
                rows={4}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={insertFAQ}
                disabled={!question.trim() || !answer.trim()}
                className="flex-1"
              >
                Insert FAQ
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
            </div>
            
            {/* Quick Templates */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Templates</h4>
              <div className="grid grid-cols-1 gap-2">
                {FAQ_TEMPLATES.slice(0, 3).map((template) => (
                  <button
                    key={template.id}
                    onClick={() => insertFAQFromTemplate(template)}
                    className="text-left p-2 hover:bg-gray-50 rounded border text-sm"
                  >
                    <div className="font-medium text-gray-900">{template.name}</div>
                    <div className="text-gray-500 truncate">{template.question}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Block Inserter Component
const BlockInserter = ({ editor, onInsert }: { editor: Editor | null; onInsert?: () => void }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const blocks = [
    {
      id: 'faq',
      name: 'FAQ Block',
      description: 'Add an interactive FAQ item',
      icon: HelpCircle,
      category: 'Interactive',
    },
    {
      id: 'heading',
      name: 'Heading',
      description: 'Add a heading',
      icon: Heading1,
      category: 'Text',
    },
    {
      id: 'image',
      name: 'Image',
      description: 'Add an image',
      icon: Upload,
      category: 'Media',
    },
    {
      id: 'table',
      name: 'Table',
      description: 'Add a table',
      icon: TableIcon,
      category: 'Content',
    },
  ]

  const filteredBlocks = blocks.filter(block =>
    block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    block.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleInsert = (block: any) => {
    if (block.id === 'faq') {
      // Show FAQ inserter instead of direct insertion
      setIsOpen(false)
      setSearchTerm('')
      // Trigger FAQ inserter
      return
    } else if (block.id === 'heading') {
      editor?.commands.toggleHeading({ level: 2 })
    } else if (block.id === 'image') {
      // Trigger image upload
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          // Handle image upload
          console.log('Image upload triggered')
        }
      }
      input.click()
    } else if (block.id === 'table') {
      editor?.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
    }
    
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-200 rounded flex items-center gap-2"
        title="Insert Block"
      >
        <Plus size={16} />
        <span className="text-sm font-medium">Insert Block</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border rounded-lg shadow-xl z-50">
          <div className="p-3 border-b">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search blocks..."
              className="w-full"
            />
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {filteredBlocks.map((block) => (
              <button
                key={block.id}
                onClick={() => handleInsert(block)}
                className="w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0 flex items-center gap-3"
              >
                <block.icon size={20} className="text-gray-500" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{block.name}</div>
                  <div className="text-sm text-gray-500">{block.description}</div>
                </div>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                  {block.category}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

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

const MenuBar = ({ editor, faqs, insertFaqsIntoContent }: { 
  editor: Editor | null; 
  faqs: FAQ[]; 
  insertFaqsIntoContent: () => void; 
}) => {
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

      {/* FAQ Inserter */}
      <FAQInserter editor={editor} />

      {/* Insert FAQs button */}
      {faqs.length > 0 && (
        <button
          onClick={insertFaqsIntoContent}
          className="p-2 hover:bg-gray-200 rounded bg-blue-50 text-blue-600"
          title="Insert FAQ Section"
        >
          <span className="text-sm font-medium">Insert FAQs</span>
        </button>
      )}

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
  faqs?: FAQ[];
  onFaqsChange?: (faqs: FAQ[]) => void;
  onEditorReady?: (insertFaqsFn: () => void) => void;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ content, onChange, faqs = [], onFaqsChange, onEditorReady }) => {
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

  // Function to generate FAQ HTML
  const generateFaqHtml = (faqs: FAQ[]): string => {
    if (faqs.length === 0) return '';

    return `
      <div class="faq-section" style="text-align: left !important;">
        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem;">FAQ</h2>
        ${faqs.map((faq) => `
          <details style="margin-bottom: 1rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 0.5rem 1rem; background: #fff;">
            <summary style="font-weight: 600; font-size: 1.1rem; cursor: pointer; outline: none; padding: 0.5rem 0;">${faq.question}</summary>
            <div style="margin-top: 0.5rem; padding-left: 0.5rem; color: #374151;">${faq.answer}</div>
          </details>
        `).join('')}
      </div>
    `;
  };

  // Function to insert FAQs into editor content
  const insertFaqsIntoContent = () => {
    if (!editor || faqs.length === 0) return;
    
    const faqHtml = generateFaqHtml(faqs);
    
    // Insert FAQ section at the end of the content
    editor.chain().focus().insertContent(faqHtml).run();
  };

  // Expose insert function to parent component
  useEffect(() => {
    if (onEditorReady && editor) {
      onEditorReady(insertFaqsIntoContent);
    }
  }, [editor, onEditorReady]);

  // Add global toggle function for FAQs
  useEffect(() => {
    // Add global toggle function
    (window as any).toggleFAQ = (faqId: string) => {
      const content = document.getElementById(`${faqId}-content`)
      const icon = document.querySelector(`[data-faq-id="${faqId}"] .faq-icon`)
      
      if (content && icon) {
        const isExpanded = content.classList.contains('expanded')
        
        if (isExpanded) {
          content.classList.remove('expanded')
          if (icon instanceof HTMLElement) {
            icon.style.transform = 'rotate(0deg)'
          }
        } else {
          content.classList.add('expanded')
          if (icon instanceof HTMLElement) {
            icon.style.transform = 'rotate(180deg)'
          }
        }
      }
    }

    return () => {
      delete (window as any).toggleFAQ
    }
  }, [])

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
          <MenuBar 
            editor={editor} 
            faqs={faqs} 
            insertFaqsIntoContent={insertFaqsIntoContent} 
          />
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

        /* WordPress-style FAQ blocks */
        .wp-faq-block {
          margin: 2rem 0;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: box-shadow 0.2s ease;
        }

        .wp-faq-block:hover {
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .faq-header {
          padding: 1.25rem 1.5rem;
          background: #4338ca;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: background-color 0.2s ease;
        }

        .faq-header:hover {
          background: #3730a3;
        }

        .faq-header h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .faq-icon {
          transition: transform 0.3s ease;
          min-width: 20px;
          min-height: 20px;
        }

        .faq-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }

        .faq-content.expanded {
          max-height: 1000px;
        }

        .faq-content > div {
          padding: 1.5rem;
          background-color: #f8fafc;
          color: #374151;
          line-height: 1.6;
        }

        .faq-content p {
          margin: 0 0 1rem 0;
        }

        .faq-content p:last-child {
          margin-bottom: 0;
        }

        .faq-content ul, .faq-content ol {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }

        .faq-content li {
          margin: 0.5rem 0;
        }

        .faq-content strong {
          font-weight: 600;
          color: #1f2937;
        }

        .faq-content em {
          font-style: italic;
          color: #6b7280;
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

        /* Shimmer animation for loading states */
        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite linear;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200px 100%;
        }

        /* FAQ Section Styles */
        .faq-section {
          margin: 3rem 0;
          padding: 2rem 0;
          border-top: 2px solid #e5e7eb;
        }

        .accordion {
          max-width: 100%;
        }

        .accordion-item {
          margin-bottom: 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .accordion-header {
          margin: 0;
        }

        .accordion-button {
          width: 100%;
          padding: 1.25rem 1.5rem;
          background: #4338ca;
          color: white;
          border: none;
          text-align: left;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: background-color 0.2s ease;
        }

        .accordion-button:hover {
          background: #3730a3;
        }

        .accordion-button:focus {
          outline: 2px solid #6366f1;
          outline-offset: 2px;
        }

        .accordion-icon {
          transition: transform 0.3s ease;
          transform: rotate(0deg);
          min-width: 20px;
          min-height: 20px;
        }

        .accordion-collapse {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }

        .accordion-body {
          padding: 1.5rem;
          background-color: #f8fafc;
          color: #374151;
          line-height: 1.6;
        }

        .accordion-body p {
          margin: 0 0 1rem 0;
        }

        .accordion-body p:last-child {
          margin-bottom: 0;
        }

        .accordion-body ul {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }

        .accordion-body li {
          margin: 0.5rem 0;
        }

        .accordion-body strong {
          font-weight: 600;
          color: #1f2937;
        }

        .accordion-body em {
          font-style: italic;
          color: #6b7280;
        }

        /* --- Compact FAQ Accordion Styles for Editor --- */
        .accordion-item {
          margin-bottom: 0.5rem !important;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          box-shadow: none !important;
        }
        .accordion-header {
          margin: 0 !important;
        }
        .accordion-button {
          padding: 0.5rem 1rem !important;
          font-size: 1rem !important;
        }
        .accordion-body {
          padding: 0.5rem 1rem !important;
          font-size: 1rem !important;
        }
        .accordion-collapse {
          /* No extra margin or padding needed */
        }

        /* .faq-section, .faq-section * { text-align: left !important; } */

        .ProseMirror, .ProseMirror * {
          text-align: left !important;
        }
      `}</style>
    </div>
  );
};

interface BlogPreviewProps {
  title: string;
  content: string;
}

// FAQ Template Data
const FAQ_TEMPLATES: FAQTemplate[] = [
  // General FAQs
  {
    id: 'general-1',
    name: 'What is this about?',
    question: 'What is this blog post about?',
    answer: 'This blog post covers important information about the topic discussed in the article.',
    category: 'General'
  },
  {
    id: 'general-2',
    name: 'Who is this for?',
    question: 'Who is this content intended for?',
    answer: 'This content is designed for readers who want to learn more about the subject matter.',
    category: 'General'
  },
  {
    id: 'general-3',
    name: 'How to get started?',
    question: 'How can I get started with this?',
    answer: 'To get started, follow the step-by-step guide provided in the article above.',
    category: 'General'
  },
  // Technical FAQs
  {
    id: 'technical-1',
    name: 'System Requirements',
    question: 'What are the system requirements?',
    answer: 'Please check the technical specifications mentioned in the article for detailed requirements.',
    category: 'Technical'
  },
  {
    id: 'technical-2',
    name: 'Troubleshooting',
    question: 'What if I encounter issues?',
    answer: 'If you encounter any issues, please refer to the troubleshooting section or contact support.',
    category: 'Technical'
  },
  {
    id: 'technical-3',
    name: 'Installation Guide',
    question: 'How do I install this?',
    answer: 'Follow the installation instructions provided in the detailed guide above.',
    category: 'Technical'
  },
  // Business FAQs
  {
    id: 'business-1',
    name: 'Pricing Information',
    question: 'How much does this cost?',
    answer: 'For detailed pricing information, please refer to the pricing section in the article.',
    category: 'Business'
  },
  {
    id: 'business-2',
    name: 'Support Options',
    question: 'What support options are available?',
    answer: 'We offer various support options including documentation, community forums, and direct support.',
    category: 'Business'
  },
  {
    id: 'business-3',
    name: 'Return Policy',
    question: 'What is your return policy?',
    answer: 'Please review our return policy in the terms and conditions section.',
    category: 'Business'
  },
  // Educational FAQs
  {
    id: 'educational-1',
    name: 'Learning Resources',
    question: 'Where can I learn more?',
    answer: 'Check out the additional resources and links provided throughout the article.',
    category: 'Educational'
  },
  {
    id: 'educational-2',
    name: 'Certification',
    question: 'Is there a certification available?',
    answer: 'Information about certifications and qualifications can be found in the article.',
    category: 'Educational'
  },
  {
    id: 'educational-3',
    name: 'Best Practices',
    question: 'What are the best practices?',
    answer: 'The article includes comprehensive best practices and guidelines for optimal results.',
    category: 'Educational'
  },
  // SAFe Framework FAQs (Interactive Examples)
  {
    id: 'safe-1',
    name: 'SAFe vs Scrum Difference',
    question: 'What is the difference between SAFe and Scrum?',
    answer: '<p><strong>Scrum</strong> is an Agile framework designed for individual teams, typically consisting of 5–10 members. It emphasizes iterative development, frequent feedback, and continuous improvement within a single team.</p><p><strong>SAFe (Scaled Agile Framework)</strong>, on the other hand, is designed to scale Agile practices across multiple teams, departments, and even entire enterprises. SAFe introduces additional layers such as <strong>Agile Release Trains (ARTs)</strong>, <strong>Lean Portfolio Management</strong>, and <strong>Program Increments (PIs)</strong> to ensure strategic alignment and smooth execution across large-scale projects.</p><p><em>Use Scrum for small team agility and SAFe when coordinating multiple Agile teams across an organization.</em></p>',
    category: 'Framework'
  },
  {
    id: 'safe-2',
    name: 'SAFe Implementation Timeline',
    question: 'How long does it take to implement SAFe?',
    answer: '<p>SAFe implementation timelines vary depending on the organization\'s size, complexity, and level of Agile maturity.</p><ul><li><strong>Small and mid-sized organizations:</strong> Typically 6–12 months to see measurable improvements.</li><li><strong>Large enterprises:</strong> May take 12–24 months to fully integrate SAFe across multiple teams and departments.</li></ul><p>Successful adoption involves structured <strong>PI Planning</strong>, leadership training, and ongoing coaching. Organizations often start by piloting SAFe within a few Agile teams before scaling across the entire enterprise.</p>',
    category: 'Framework'
  },
  {
    id: 'safe-3',
    name: 'SAFe Key Benefits',
    question: 'What are the key benefits of SAFe?',
    answer: '<p>SAFe offers several advantages, particularly for large organizations:</p><ul><li><strong>Improved collaboration:</strong> Aligns multiple Agile teams and stakeholders.</li><li><strong>Faster time-to-market:</strong> Shortens development cycles through continuous integration and delivery.</li><li><strong>Strategic alignment:</strong> Ensures that Agile execution aligns with business goals.</li><li><strong>Scalability:</strong> Supports teams of all sizes, from small groups to enterprises with thousands of employees.</li></ul>',
    category: 'Framework'
  }
];

// FAQ Management Component
interface FAQManagerProps {
  faqs: FAQ[];
  onFaqsChange: (faqs: FAQ[]) => void;
  onInsertFaqs?: () => void;
}

const FAQManager: React.FC<FAQManagerProps> = ({ faqs, onFaqsChange, onInsertFaqs }) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(FAQ_TEMPLATES.map(t => t.category)))];

  const addFaq = () => {
    if (faqs.length >= 3) {
      alert('You can only add up to 3 FAQs per blog post.');
      return;
    }
    
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      alert('Please fill in both question and answer fields.');
      return;
    }

    const faq: FAQ = {
      id: Date.now().toString(),
      question: newFaq.question.trim(),
      answer: newFaq.answer.trim(),
      isExpanded: false
    };

    onFaqsChange([...faqs, faq]);
    setNewFaq({ question: '', answer: '' });
    setShowAddDialog(false);
  };

  const addFromTemplate = () => {
    if (faqs.length >= 3) {
      alert('You can only add up to 3 FAQs per blog post.');
      return;
    }

    const template = FAQ_TEMPLATES.find(t => t.id === selectedTemplate);
    if (!template) return;

    const faq: FAQ = {
      id: Date.now().toString(),
      question: template.question,
      answer: template.answer,
      isExpanded: false
    };

    onFaqsChange([...faqs, faq]);
    setSelectedTemplate('');
    setShowTemplateDialog(false);
  };

  const editFaq = () => {
    if (!editingFaq) return;
    
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      alert('Please fill in both question and answer fields.');
      return;
    }

    const updatedFaqs = faqs.map(faq => 
      faq.id === editingFaq.id 
        ? { ...faq, question: newFaq.question.trim(), answer: newFaq.answer.trim() }
        : faq
    );

    onFaqsChange(updatedFaqs);
    setEditingFaq(null);
    setNewFaq({ question: '', answer: '' });
    setShowAddDialog(false);
  };

  const deleteFaq = (id: string) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      onFaqsChange(faqs.filter(faq => faq.id !== id));
    }
  };

  const toggleFaq = (id: string) => {
    const updatedFaqs = faqs.map(faq => 
      faq.id === id ? { ...faq, isExpanded: !faq.isExpanded } : faq
    );
    onFaqsChange(updatedFaqs);
  };

  const moveFaq = (fromIndex: number, toIndex: number) => {
    const newFaqs = [...faqs];
    const [movedFaq] = newFaqs.splice(fromIndex, 1);
    newFaqs.splice(toIndex, 0, movedFaq);
    onFaqsChange(newFaqs);
  };

  const openEditDialog = (faq: FAQ) => {
    setEditingFaq(faq);
    setNewFaq({ question: faq.question, answer: faq.answer });
    setShowAddDialog(true);
  };

  const filteredTemplates = selectedCategory === 'All' 
    ? FAQ_TEMPLATES 
    : FAQ_TEMPLATES.filter(t => t.category === selectedCategory);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h3>
        <div className="flex gap-2">
          {faqs.length > 0 && onInsertFaqs && (
            <Button
              onClick={onInsertFaqs}
              variant="outline"
              size="sm"
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            >
              <Plus size={16} className="mr-2" />
              Insert into Editor
            </Button>
          )}
          <Button
            onClick={() => setShowTemplateDialog(true)}
            variant="outline"
            size="sm"
            disabled={faqs.length >= 3}
          >
            <Copy size={16} className="mr-2" />
            Add from Template
          </Button>
          <Button
            onClick={() => setShowAddDialog(true)}
            size="sm"
            disabled={faqs.length >= 3}
          >
            <Plus size={16} className="mr-2" />
            Add Custom FAQ
          </Button>
        </div>
      </div>

      {faqs.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <p>No FAQs added yet.</p>
          <p className="text-sm">Add up to 3 FAQs to help your readers.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={faq.id} className="border rounded-lg bg-white">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveFaq(index, Math.max(0, index - 1))}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => moveFaq(index, Math.min(faqs.length - 1, index + 1))}
                      disabled={index === faqs.length - 1}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                  <GripVertical size={16} className="text-gray-400" />
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="flex-1 text-left font-medium text-gray-900 hover:text-blue-600"
                  >
                    {faq.question}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditDialog(faq)}
                    className="p-2 hover:bg-gray-100 rounded"
                    title="Edit FAQ"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => deleteFaq(faq.id)}
                    className="p-2 hover:bg-red-100 rounded text-red-500"
                    title="Delete FAQ"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {faq.isExpanded && (
                <div className="px-4 pb-4 text-gray-600">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit FAQ Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingFaq ? 'Edit FAQ' : 'Add Custom FAQ'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="faq-question">Question *</Label>
              <Input
                id="faq-question"
                value={newFaq.question}
                onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                placeholder="Enter the question..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="faq-answer">Answer *</Label>
              <Textarea
                id="faq-answer"
                value={newFaq.answer}
                onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                placeholder="Enter the answer..."
                rows={4}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddDialog(false);
              setEditingFaq(null);
              setNewFaq({ question: '', answer: '' });
            }}>
              Cancel
            </Button>
            <Button onClick={editingFaq ? editFaq : addFaq}>
              {editingFaq ? 'Update FAQ' : 'Add FAQ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Selection Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Select FAQ Template</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <div className="mb-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-y-auto max-h-[400px] space-y-3">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Q:</strong> {template.question}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        <strong>A:</strong> {template.answer}
                      </p>
                    </div>
                    <div className="ml-4">
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        {template.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowTemplateDialog(false);
              setSelectedTemplate('');
            }}>
              Cancel
            </Button>
            <Button 
              onClick={addFromTemplate}
              disabled={!selectedTemplate}
            >
              Add Selected Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

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

  const [thumbnailUrl, setThumbnailUrl] = useState('');

  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    category?: string;
    content?: string;
    slug?: string;
  }>({});
  const [slug, setSlug] = useState('');
  const [head, setHead] = useState('');
  const [script, setScript] = useState('');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const editorRef = useRef<{ insertFaqsIntoContent: () => void } | null>(null);
  
  // Related Articles state
  const [relatedArticles, setRelatedArticles] = useState<Array<{id: number, title: string, cover_image?: string}>>([]);
  const [selectedRelatedArticles, setSelectedRelatedArticles] = useState<number[]>([]);
  const [isLoadingRelatedArticles, setIsLoadingRelatedArticles] = useState(false);
  const [relatedArticlesError, setRelatedArticlesError] = useState('');
  const [isRelatedArticlesOpen, setIsRelatedArticlesOpen] = useState(false);
  const [relatedArticlesSearch, setRelatedArticlesSearch] = useState('');

  // Function to fetch all blog posts for related articles
  const fetchRelatedArticles = async () => {
    setIsLoadingRelatedArticles(true);
    setRelatedArticlesError('');
    
    try {
      const authToken = localStorage.getItem('accessToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      // Get user data from localStorage
      const userDataString = localStorage.getItem('userData');
      if (!userDataString) {
        throw new Error('User data not found');
      }
      
      let userData;
      try {
        userData = JSON.parse(userDataString);
      } catch (parseError) {
        throw new Error('Invalid user data');
      }
      
      if (!userData.data || !userData.data.id) {
        throw new Error('User ID not found');
      }
      
      const userId = userData.data.id;
      
      // Fetch all blog posts
      const response = await fetch(`https://api.4pmti.com/blog?userId=${userId}&page=1&limit=1000`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }
      
      const result = await response.json();
      if (result.success && result.data) {
        setRelatedArticles(result.data.data.map((post: any) => ({
          id: post.id,
          title: post.title,
          cover_image: post.cover_image
        })));
      } else {
        throw new Error(result.error || 'Failed to fetch blog posts');
      }
    } catch (error) {
      console.error('Error fetching related articles:', error);
      setRelatedArticlesError(error instanceof Error ? error.message : 'Failed to fetch blog posts');
    } finally {
      setIsLoadingRelatedArticles(false);
    }
  };

  // Load related articles on component mount
  useEffect(() => {
    fetchRelatedArticles();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.related-articles-dropdown')) {
        setIsRelatedArticlesOpen(false);
      }
    };

    if (isRelatedArticlesOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isRelatedArticlesOpen]);

  // Function to handle related article selection
  const handleRelatedArticleToggle = (articleId: number) => {
    setSelectedRelatedArticles(prev => {
      if (prev.includes(articleId)) {
        return prev.filter(id => id !== articleId);
      } else {
        return [...prev, articleId];
      }
    });
  };

  // Filter articles based on search
  const filteredRelatedArticles = relatedArticles.filter(article =>
    article.title.toLowerCase().includes(relatedArticlesSearch.toLowerCase())
  );

  // Function to sanitize content by removing script tags
  const sanitizeContent = (content: string): string => {
    // Remove script tags and their content
    return content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  };

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

  const router = useRouter();

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    if (!validateForm()) {
      return;
    }

    const tagNames = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    // Convert script and head to base64 if they exist
    const scriptBase64 = script.trim() ? btoa(unescape(encodeURIComponent(script))) : '';
    const headBase64 = head.trim() ? btoa(unescape(encodeURIComponent(head))) : '';

    const payload = {
      title,
      content: sanitizeContent(content),
      tagNames,
      relatedArticleIds: selectedRelatedArticles, // Use selected related articles
      coverImage: coverImageUrl || '',
      thumbnail: thumbnailUrl || '',
      slug,
      metadata: {
        head: headBase64,
        script: scriptBase64
      }
    };

    setIsSubmitting(true);
    try {
      const authToken = localStorage.getItem('accessToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      // Validate token format
      if (!authToken.startsWith('eyJ') && !authToken.includes('.')) {
        throw new Error('Invalid authentication token format');
      }

      console.log('Sending payload:', JSON.stringify(payload, null, 2));

      const response = await fetch('https://api.4pmti.com/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();
      console.log('Success response:', responseData);

      setShowSuccessModal(true);
      setTimeout(() => {
        router.push('/blog');
      }, 1500);
      
      // Reset form
      setTitle('');
      setDescription('');
      setContent('');
      setTags('');
      setCategory('');
      setCoverImageUrl('');
      setThumbnailUrl('');
      setSlug('');
      setHead('');
      setScript('');
      setFaqs([]);
      setSelectedRelatedArticles([]);
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
<link rel="canonical" href="${canonicalUrl}" />

<!-- FAQ Handler Script -->
<script src="/js/faq-handler.js" defer></script>`;

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
    Cover Image URL
  </label>
  <input
  
    type="url"
    value={coverImageUrl}
    onChange={(e) => setCoverImageUrl(e.target.value)}
    className="w-full border border-gray-300 rounded-md p-2"
    placeholder="Enter cover image URL..."
  />
  {coverImageUrl && (
    <div className="mt-2 border rounded-lg overflow-hidden">
      <img
        src={coverImageUrl}
        alt="Cover preview"
        className="w-full h-48 object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.opacity = '0.5';
        }}
      />
    </div>
  )}
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Thumbnail URL
  </label>
  <input
    type="url"
    value={thumbnailUrl}
    onChange={(e) => setThumbnailUrl(e.target.value)}
    className="w-full border border-gray-300 rounded-md p-2"
    placeholder="Enter thumbnail URL..."
  />
  {thumbnailUrl && (
    <div className="mt-2 border rounded-lg overflow-hidden">
      <img
        src={thumbnailUrl}
        alt="Thumbnail preview"
        className="w-full h-48 object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.opacity = '0.5';
        }}
      />
    </div>
  )}
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

          {/* Related Articles Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Related Articles
              <span className="ml-1 text-xs text-gray-500">(Select articles to link)</span>
            </label>
            
            {/* Selected Articles Navbar */}
            {selectedRelatedArticles.length > 0 && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex flex-wrap gap-2">
                  {selectedRelatedArticles.map((articleId) => {
                    const article = relatedArticles.find(a => a.id === articleId);
                    return article ? (
                      <div
                        key={articleId}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-300 rounded-full text-sm text-blue-800 shadow-sm hover:shadow-md transition-shadow"
                      >
                        {article.cover_image ? (
                          <img
                            src={article.cover_image}
                            alt={article.title}
                            className="w-5 h-5 rounded-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-xs text-gray-600">📄</span>
                          </div>
                        )}
                        <span className="max-w-[150px] truncate" title={article.title}>
                          {article.title}
                        </span>
                        <button
                          onClick={() => handleRelatedArticleToggle(articleId)}
                          className="ml-1 text-blue-600 hover:text-blue-800 font-medium"
                          title="Remove article"
                        >
                          ×
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Dropdown Button */}
            <div className="relative related-articles-dropdown">
              <button
                onClick={() => setIsRelatedArticlesOpen(!isRelatedArticlesOpen)}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <span className="text-sm text-gray-700">
                  {selectedRelatedArticles.length > 0 
                    ? `${selectedRelatedArticles.length} article${selectedRelatedArticles.length > 1 ? 's' : ''} selected`
                    : 'Select related articles...'
                  }
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${isRelatedArticlesOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Content */}
              {isRelatedArticlesOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-hidden">
                  {/* Search Bar */}
                  <div className="p-3 border-b border-gray-200">
                    <input
                      type="text"
                      placeholder="Search articles..."
                      value={relatedArticlesSearch}
                      onChange={(e) => setRelatedArticlesSearch(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Articles List */}
                  <div className="max-h-60 overflow-y-auto">
                    {isLoadingRelatedArticles ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                        <span className="ml-2 text-sm text-gray-600">Loading articles...</span>
                      </div>
                    ) : relatedArticlesError ? (
                      <div className="p-3 text-red-500 text-sm">
                        {relatedArticlesError}
                        <button
                          onClick={fetchRelatedArticles}
                          className="ml-2 text-blue-600 hover:text-blue-700 underline"
                        >
                          Retry
                        </button>
                      </div>
                    ) : filteredRelatedArticles.length === 0 ? (
                      <div className="p-3 text-gray-500 text-sm">
                        {relatedArticlesSearch ? 'No articles found matching your search.' : 'No articles found. Create some blog posts first.'}
                      </div>
                    ) : (
                      filteredRelatedArticles.map((article) => (
                        <div
                          key={article.id}
                          onClick={() => handleRelatedArticleToggle(article.id)}
                          className={`flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                            selectedRelatedArticles.includes(article.id) ? 'bg-blue-50' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedRelatedArticles.includes(article.id)}
                            onChange={() => {}} // Handled by parent div onClick
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          {article.cover_image ? (
                            <img
                              src={article.cover_image}
                              alt={article.title}
                              className="w-8 h-8 rounded object-cover flex-shrink-0"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs text-gray-500">📄</span>
                            </div>
                          )}
                          <span className="flex-1 text-sm text-gray-700 truncate">
                            {article.title}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
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
            faqs={faqs}
            onFaqsChange={setFaqs}
            onEditorReady={(insertFaqsFn) => {
              editorRef.current = { insertFaqsIntoContent: insertFaqsFn };
            }}
          />
          {validationErrors.content && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.content}</p>
          )}
        </div>

        {/* FAQ Management Section */}
        <div className="border-t pt-8">
          <FAQManager 
            faqs={faqs} 
            onFaqsChange={setFaqs}
            onInsertFaqs={() => {
              if (editorRef.current) {
                editorRef.current.insertFaqsIntoContent();
              }
            }}
          />
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
              Your blog post has been published and is now live on the website. You will be redirected to the blog page shortly.
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
