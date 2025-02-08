// src/components/blog/BlogEditor/Toolbar.tsx
import React from 'react';
import { type Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Link as LinkIcon,
} from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';

interface ToolbarProps {
  editor: Editor | null;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Toolbar({ editor, onImageUpload }: ToolbarProps) {
    if (!editor) {
        console.warn("Editor instance is not available yet. Toolbar"); // Debugging log
        return null;
      }
      
  return (
    <div className="border border-input bg-white/50 backdrop-blur-sm rounded-lg p-1 mb-4 flex flex-wrap gap-1 sticky top-4 z-10">
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 1 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 2 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive('bold')}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive('italic')}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive('bulletList')}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive('orderedList')}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive('blockquote')}
        onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-4 w-4" />
      </Toggle>

      <label className="cursor-pointer">
        <div className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-md">
          <ImageIcon className="h-4 w-4" />
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={onImageUpload}
          />
        </div>
      </label>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
}