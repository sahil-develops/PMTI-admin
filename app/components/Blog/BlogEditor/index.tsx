'use client'
import { useState, useRef, DragEvent } from "react";
import ReactMarkdown from "react-markdown";
import { Image, AlignLeft, AlignCenter, AlignRight, Trash2, Plus, Minus, Bold, Italic, Heading1, Heading2, Heading3, List } from "lucide-react";



const SIZE_PRESETS = {
  small: 0.5,
  medium: 0.75,
  large: 1,
};



function RichTextArea({ value, onChange, placeholder = '', rows = 10 }: { value: string, onChange: (value: string) => void, placeholder?: string, rows?: number }) {
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const insertFormat = (format: any) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    let newText = '';
    let newCursorPos = start;

    switch (format) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`;
        newCursorPos = start + (selectedText ? selectedText.length + 4 : 5);
        break;
      case 'italic':
        newText = `_${selectedText || 'italic text'}_`;
        newCursorPos = start + (selectedText ? selectedText.length + 2 : 6);
        break;
      case 'h1':
        newText = `\n# ${selectedText || 'Heading 1'}\n`;
        newCursorPos = start + (selectedText ? selectedText.length + 3 : 10);
        break;
      case 'h2':
        newText = `\n## ${selectedText || 'Heading 2'}\n`;
        newCursorPos = start + (selectedText ? selectedText.length + 4 : 11);
        break;
      case 'h3':
        newText = `\n### ${selectedText || 'Heading 3'}\n`;
        newCursorPos = start + (selectedText ? selectedText.length + 5 : 12);
        break;
      case 'list':
        newText = `\n- ${selectedText || 'List item'}\n`;
        newCursorPos = start + (selectedText ? selectedText.length + 3 : 10);
        break;
    }

    const newValue = value.substring(0, start) + newText + value.substring(end);
    onChange(newValue);

    // Set cursor position after state update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <textarea
      ref={editorRef}
      className="border p-2 rounded w-full min-h-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
    />
  );
}



function CustomButton({ onClick, children }: { onClick: () => void, children: React.ReactNode }) {
  return (
    <button 
      className="px-3 py-2 border rounded bg-gray-200 hover:bg-gray-300" 
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function ImageToolbar({ onAlignChange, onDelete, onSizeChange, currentSize }: { onAlignChange: (align: string) => void, onDelete: () => void, onSizeChange: (size: number) => void, currentSize: number }) {
  return (
    <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded shadow-sm">
      <button onClick={() => onAlignChange('left')} className="p-1 hover:bg-gray-200 rounded">
        <AlignLeft size={16} />
      </button>
      <button onClick={() => onAlignChange('center')} className="p-1 hover:bg-gray-200 rounded">
        <AlignCenter size={16} />
      </button>
      <button onClick={() => onAlignChange('right')} className="p-1 hover:bg-gray-200 rounded">
        <AlignRight size={16} />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1" /> {/* Divider */}
      <button 
        onClick={() => onSizeChange(Math.max(0.25, currentSize - 0.25))} 
        className="p-1 hover:bg-gray-200 rounded"
        disabled={currentSize <= 0.25}
      >
        <Minus size={16} />
      </button>
      <button 
        onClick={() => onSizeChange(Math.min(1.5, currentSize + 0.25))} 
        className="p-1 hover:bg-gray-200 rounded"
        disabled={currentSize >= 1.5}
      >
        <Plus size={16} />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1" /> {/* Divider */}
      <button onClick={onDelete} className="p-1 hover:bg-gray-200 rounded text-red-500">
        <Trash2 size={16} />
      </button>
    </div>
  );
}



function DraggableImage({ src, alt, align, size, onAlignChange, onSizeChange, onDelete, onDragStart }: { src: string, alt: string, align: string, size: number, onAlignChange: (align: string) => void, onSizeChange: (size: number) => void, onDelete: () => void, onDragStart: (e: React.DragEvent<HTMLDivElement>) => void }) {
  return (
    <div className="relative group cursor-move" draggable onDragStart={onDragStart}>
      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <ImageToolbar 
          onAlignChange={onAlignChange} 
          onDelete={onDelete}
          onSizeChange={onSizeChange}
          currentSize={size}
        />
      </div>
      <img 
        src={src} 
        alt={alt} 
        className={`max-w-full h-auto my-2 transition-all ${
          align === 'center' ? 'mx-auto block' :
          align === 'right' ? 'ml-auto block' : 'mr-auto block'
        }`}
        style={{ 
          width: `${size * 100}%`,
          maxWidth: '100%'
        }}
      />
    </div>
  );
}

function CustomInput({ placeholder, value, onChange }: { placeholder: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <input
      className="border p-2 rounded w-full"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
}

function CustomTextarea({ placeholder, value, onChange, rows = 4, onDrop }: { placeholder: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, rows?: number, onDrop: (e: React.DragEvent<HTMLTextAreaElement>) => void }) {
  return (
    <textarea
      className="border p-2 rounded w-full"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      onDrop={onDrop}
    ></textarea>
  );
}

function Toolbar({ onFormat, onImageUpload, disabled }: { onFormat: (format: string) => void, onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void, disabled: boolean }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };


  return (
    <div className="flex space-x-2 border-b pb-2 mb-2 bg-gray-100 p-2 sticky top-0">
    <button 
      onClick={() => onFormat('bold')} 
      className="p-2 hover:bg-gray-200 rounded flex items-center gap-1"
    >
      <Bold size={16} />
    </button>
    <button 
      onClick={() => onFormat('italic')} 
      className="p-2 hover:bg-gray-200 rounded flex items-center gap-1"
    >
      <Italic size={16} />
    </button>
    <button 
      onClick={() => onFormat('h1')} 
      className="p-2 hover:bg-gray-200 rounded flex items-center gap-1"
    >
      <Heading1 size={16} />
    </button>
    <button 
      onClick={() => onFormat('h2')} 
      className="p-2 hover:bg-gray-200 rounded flex items-center gap-1"
    >
      <Heading2 size={16} />
    </button>
    <button 
      onClick={() => onFormat('h3')} 
      className="p-2 hover:bg-gray-200 rounded flex items-center gap-1"
    >
      <Heading3 size={16} />
    </button>
    <button 
      onClick={() => onFormat('list')} 
      className="p-2 hover:bg-gray-200 rounded flex items-center gap-1"
    >
      <List size={16} />
    </button>
    <button 
      onClick={handleImageClick}
      className="p-2 hover:bg-gray-200 rounded flex items-center gap-1"
      disabled={disabled}
    >
      <Image size={16} />
    </button>
    <input
      type="file"
      ref={fileInputRef}
      className="hidden"
      accept="image/*"
      onChange={onImageUpload}
    />
  </div>

  );
}

export default function Blogs() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [isDraft, setIsDraft] = useState(true);
  interface Image {
    id: number;
    src: string;
    alt: string;
    align: string;
    size: number;
  }
  
  const [images, setImages] = useState<Image[]>([]);
  const [isUploading, setIsUploading] = useState(false);



  
  
  const handleFormat = (format: any) => {
    // Find the RichTextArea component and call its insertFormat method
    const textarea = document.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let newText = '';

    switch (format) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        newText = `_${selectedText || 'italic text'}_`;
        break;
      case 'h1':
        newText = `\n# ${selectedText || 'Heading 1'}\n`;
        break;
      case 'h2':
        newText = `\n## ${selectedText || 'Heading 2'}\n`;
        break;
      case 'h3':
        newText = `\n### ${selectedText || 'Heading 3'}\n`;
        break;
      case 'list':
        newText = `\n- ${selectedText || 'List item'}\n`;
        break;
    }

    setContent(prev => 
      prev.substring(0, start) + newText + prev.substring(end)
    );

    // Set focus back to textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + newText.length,
        start + newText.length
      );
    }, 0);
  };



    // Function to upload image to CDN (commented out as API not available)
  /*
  async function uploadImageToCDN(file) {
    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('YOUR_UPLOAD_API_ENDPOINT', {
        method: 'POST',
        body: formData,
        headers: {
          // Add any required headers
          // 'Authorization': 'Bearer YOUR_TOKEN'
        }
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      // Assuming the API returns { url: 'https://cdn.example.com/image.jpg' }
      return data.url;
      
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }
  */

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Uncomment when API is available
        // const cdnUrl = await uploadImageToCDN(file);
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage = {
            id: Date.now(),
            src: e.target?.result as string, // Replace with cdnUrl when API is available
            alt: file.name,
            align: 'left',
            size: 1 // Default size (100%)
          };
          setImages([...images, newImage]);
          setContent((prev) => 
            prev + `\n![${file.name}](${newImage.id})\n`
          );
        };
        reader.readAsDataURL(file);
      } catch (error) {
        // Handle upload error
        console.error('Failed to upload image:', error);
        // You might want to show an error message to the user
      }
    }
  };

  const handleImageDelete = (imageId: number) => {
    // Remove image from images array
    setImages(images.filter(img => img.id !== imageId));
    
    // Remove image markdown from content
    const regex = new RegExp(`!\\[.*?\\]\\(${imageId}\\)\n?`, 'g');
    setContent(prev => prev.replace(regex, ''));
  };

  const handleImageAlign = (imageId: number, alignment: string) => {
    setImages(images.map(img => 
      img.id === imageId ? { ...img, align: alignment } : img
    ));
  };

  const handleImageSize = (imageId: number, newSize: number) => {
    setImages(images.map(img => 
      img.id === imageId ? { ...img, size: newSize } : img
    ));
  };


  const handleDragStart = (e: DragEvent<HTMLDivElement>, imageId: number) => {
    e.dataTransfer.setData('text/plain', `![](${imageId})`);
  };


  // Custom renderer for ReactMarkdown to handle our images
  const components = {
    img: ({ node, ...props }: { node?: any; src: string; alt?: string }) => {
      const image = images.find(img => img.id.toString() === props.src);
      if (image) {
        return (
          <DraggableImage
            src={image.src}
            alt={props.alt || image.alt}
            align={image.align}
            size={image.size}
            onAlignChange={(newAlign) => handleImageAlign(image.id, newAlign)}
            onSizeChange={(newSize) => handleImageSize(image.id, newSize)}
            onDelete={() => handleImageDelete(image.id)}
            onDragStart={(e) => handleDragStart(e, image.id)}
          />
        );
      }
      return <img {...props} />;
    }
  };


  const handleSubmit = () => {
    const blogData = {
      title,
      description,
      content,
      category,
      tags,
      isDraft,
      images
    };
    console.log(blogData);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
      {/* Left Side - Editor */}
      <div className="flex flex-col space-y-4">
        <CustomInput
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <CustomTextarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onDrop={(e) => e.preventDefault()} // Add a default onDrop handler
        />
        <Toolbar 
          onFormat={handleFormat} 
          onImageUpload={handleImageUpload} 
          disabled={isUploading}
        />
        <RichTextArea
          value={content}
          onChange={setContent}
          placeholder="Write your blog post..."
          rows={10}
        />
        <CustomButton onClick={handleSubmit}>Submit</CustomButton>
      </div>

      
      {/* Right Side - Preview & Options */}
      <div className="flex flex-col space-y-4 border p-4 rounded-lg bg-white shadow">
        <h2 className="text-xl font-bold">Live Preview</h2>
        <div className="border p-2 rounded bg-gray-50">
          {/* @ts-ignore */}
          <ReactMarkdown components={components}>{content}</ReactMarkdown>
        </div>

        <h2 className="text-xl font-bold">Publish Options</h2>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isDraft}
            onChange={() => setIsDraft(!isDraft)}
          />
          <span>Save as Draft</span>
        </label>
        <CustomButton onClick={handleSubmit}>
          {isDraft ? "Save Draft" : "Publish"}
        </CustomButton>

        <h2 className="text-xl font-bold">Category</h2>
        <CustomInput
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <h2 className="text-xl font-bold">Tags</h2>
        <CustomInput
          placeholder="Add tags separated by commas"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>
    </div>
  );
}