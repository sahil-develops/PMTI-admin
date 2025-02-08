// src/components/blog/BlogEditor/index.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import ResizableImageModule from 'tiptap-extension-resize-image';


import { ImagePlus, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Toolbar } from './Toolbar';
import { BlogEditorProps, blogFormSchema, BlogFormValues } from '../types';
import { cn } from '@/lib/utils';

export function BlogEditor({ initialData, onSave }: BlogEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(
    initialData?.featuredImage || null
  );

  const form = useForm({
    resolver: zodResolver(blogFormSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      content: '',
      slug: '',
      tags: '',
      featuredImage: '',
      status: 'draft',
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] }, // Ensure headings are enabled
        bulletList: {}, // Ensure bullet lists are enabled
        orderedList: {}, // Ensure ordered lists are enabled
      }),
      Link.configure({ openOnClick: false }),
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            width: { default: '100%' },
            height: { default: 'auto' },
          };
        },
      }).configure({
        allowBase64: true,
      }),
      ResizableImageModule,
    ],
    content: initialData?.content || '',
    onUpdate: ({ editor }) => {
      form.setValue('content', editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-lg dark:prose-invert',
          'max-w-full',
          'focus:outline-none',
          'min-h-[500px]',
          'p-4'
        ),
      },
    },
  });
  
  

  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
  
    try {
      setIsUploading(true);
      const imageUrl = URL.createObjectURL(file);
      // Use insertContent instead of setImage
      editor.chain().focus().insertContent(`<img src="${imageUrl}" width="500" height="auto"/>`).run();
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      // Replace with your actual image upload logic
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      form.setValue('featuredImage', imageUrl);
    } catch (error) {
      console.error('Failed to upload featured image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: BlogFormValues) => {
    console.log('Submitting form data:', data); // Debugging log
    try {
      await onSave(data);
    } catch (error) {
      console.error('Failed to save blog post:', error);
    }
  };
  

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="max-w-[1000px] mx-auto">
          {/* Featured Image */}
          <div className="relative w-full aspect-[2/1] bg-muted rounded-lg overflow-hidden mb-8 group">
            {selectedImage ? (
              <>
                <img
                  src={selectedImage}
                  alt="Featured"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer">
                    <Button variant="secondary" size="sm">
                      Change Image
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFeaturedImageUpload}
                        disabled={isUploading}
                      />
                    </Button>
                  </label>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <label className="cursor-pointer flex flex-col items-center">
                  <ImagePlus className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground mt-2">
                    Add a cover image
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFeaturedImageUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <input
                    {...field}
                    className="w-full text-4xl font-bold border-none focus:outline-none bg-transparent placeholder:text-muted-foreground/50"
                    placeholder="Your Story Title"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    className="mt-4 resize-none border-none text-xl text-muted-foreground bg-transparent"
                    placeholder="Add a brief description..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Editor */}
          <div className="mt-8">
            {editor && (
              <Toolbar
                editor={editor}
                onImageUpload={handleContentImageUpload}
              />
            )}
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
          <div className="max-w-[1000px] mx-auto px-4 py-3 flex justify-between items-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => form.reset()}
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.setValue('status', 'draft');
                  form.handleSubmit(onSubmit)();
                }}
              >
                Save as draft
              </Button>
              <Button
                type="button"
                onClick={() => {
                  form.setValue('status', 'published');
                  form.handleSubmit(onSubmit)();
                }}
              >
                Publish
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}