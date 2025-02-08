// src/app/admin/blog/new/page.tsx
'use client';

import { BlogEditor } from '@/app/components/Blog/BlogEditor/index';

import { BlogFormValues } from '@/app/components/Blog/types';
export default function NewBlogPage() {
  const handleSave = async (data: BlogFormValues) => {
    console.log('Saving blog post:', data); // Ensure this logs correctly
  
    // Simulate API call for debugging
    setTimeout(() => {
      console.log('Data successfully received:', data);
    }, 1000);
  };
  
    

  return (
    <div className="container mx-auto py-10">
      <BlogEditor onSave={handleSave} />
    </div>
  );
}