import * as z from 'zod';

export const blogFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(1, 'Description is required').max(300),
  content: z.string().min(1, 'Content is required'),
  slug: z.string().min(1, 'Slug is required'),
  tags: z.string().optional(),
  featuredImage: z.string().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
});

export type BlogFormValues = z.infer<typeof blogFormSchema>;

export interface BlogEditorProps {
  initialData?: BlogFormValues;
  onSave: (data: BlogFormValues) => Promise<void>;
}