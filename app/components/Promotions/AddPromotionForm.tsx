'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, X, Trash2 } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckCircle2 } from 'lucide-react';
import { Switch } from "@/components/ui/switch";

interface Country {
  id: number;
  CountryName: string;
}

interface Category {
  id: number;
  name: string;
}

interface ClassType {
  id: number;
  name: string;
}

interface FormData {
  countryId: string;
  categoryId: string;
  classTypeId: string;
  promotionId: string;
  amount: string;
  startDate: string;
  endDate: string;
  title: string;
  description: string;
  active: number;
  promotionType: string;
}

export default function AddPromotionForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    countryId: '52', 
    categoryId: '',
    classTypeId: '',
    promotionId: '',
    amount: '',
    startDate: '',
    endDate: '',
    title: '',
    description: '',
    active:1,
    promotionType: '2'
  });

  // Add new state for validation
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | 'image', string>>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        };

        const [countriesRes, categoriesRes, classTypesRes] = await Promise.all([
          fetch(`https://api.4pmti.com/country`, { headers }),
          fetch(`https://api.4pmti.com/category`, { headers }),
          fetch(`https://api.4pmti.com/classtype`, { headers })
        ]);

        const [countriesData, categoriesData, classTypesData] = await Promise.all([
          countriesRes.json(),
          categoriesRes.json(),
          classTypesRes.json()
        ]);

        setCountries(countriesData.data);
        setCategories(categoriesData.data);
        setClassTypes(classTypesData.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load form data",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif')) {
      await handleImageUpload(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or GIF image",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif')) {
      await handleImageUpload(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or GIF image",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (file: File) => {
    setLoading(true);
    
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
      if (data.success) {
        setAttachedFile(file);
        setUploadedImageUrl(data.data.url);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
      setAttachedFile(null);
      setUploadedImageUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAttachedFile(null);
    setUploadedImageUrl(null);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData | 'image', string>> = {};

    // Required field validation
    if (!formData.promotionId.trim()) {
      newErrors.promotionId = 'Promotion ID is required';
    }
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    }
    if (!formData.countryId) {
      newErrors.countryId = 'Country is required';
    }
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }
    if (!formData.classTypeId) {
      newErrors.classTypeId = 'Class Type is required';
    }
    if (!formData.promotionType) {
      newErrors.promotionType = 'Promotion Type is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start Date is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End Date is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Date validation
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    // Cover image validation
    if (!uploadedImageUrl) {
      newErrors.image = 'Promotion image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        countryId: parseInt(formData.countryId),
        categoryId: parseInt(formData.categoryId),
        classTypeId: parseInt(formData.classTypeId),
        promotionId: formData.promotionId,
        amount: parseFloat(formData.amount),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        title: formData.title,
        description: formData.description,
        active: formData.active ? 0 : 1,
        promotionType: parseInt(formData.promotionType),
        isDelete: 0,
        addedBy: parseInt(localStorage.getItem('userId') || '0'),
        updatedBy: parseInt(localStorage.getItem('userId') || '0'),
        attachedFilePath: uploadedImageUrl || ''
      };

      const response = await fetch(`https://api.4pmti.com/promotions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShowSuccessModal(true);
        
        setTimeout(() => {
          router.push('/promotions');
        }, 2000);
      } else {
        throw new Error(Array.isArray(data.error) ? data.error.join(', ') : (data.error || data.message || 'Failed to create promotion'));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create promotion",
        variant: "destructive",
      });
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const isActive = formData.active === 1;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-900">Add New Promotion</h1>
        <p className="text-zinc-500">Create a new promotion with the form below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="promotionId">Promotion ID</Label>
            <Input
              id="promotionId"
              required
              placeholder="Enter promotion ID"
              value={formData.promotionId}
              onChange={(e) => setFormData({ ...formData, promotionId: e.target.value })}
              className={errors.promotionId ? "border-red-500" : ""}
            />
            {errors.promotionId && (
              <p className="text-red-500 text-xs mt-1">{errors.promotionId}</p>
            )}
            <p className="text-xs text-zinc-500">Must be unique across all promotions</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              required
              placeholder="Enter promotion title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              required
              placeholder="Enter amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className={errors.amount ? "border-red-500" : ""}
            />
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Country</Label>
            <Select
              required
              value={formData.countryId}
                defaultValue="52"
              onValueChange={(value) => setFormData({ ...formData, countryId: value })}
              // className={errors.countryId ? "border-red-500" : ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.id.toString()}>
                    {country.CountryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.countryId && (
              <p className="text-red-500 text-xs mt-1">{errors.countryId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              required
              value={formData.categoryId}
              onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
           
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Class Type</Label>
            <Select
              required
              value={formData.classTypeId}
              onValueChange={(value) => setFormData({ ...formData, classTypeId: value })}
            
            >
              <SelectTrigger>
                <SelectValue placeholder="Select class type" />
              </SelectTrigger>
              <SelectContent>
                {classTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.classTypeId && (
              <p className="text-red-500 text-xs mt-1">{errors.classTypeId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Promotion Type</Label>
            <Select
              required
              value={formData.promotionType}
              onValueChange={(value) => setFormData({ ...formData, promotionType: value })}
              // className={errors.promotionType ? "border-red-500" : ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select promotion type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">General</SelectItem>
                <SelectItem value="2">Special</SelectItem>
              </SelectContent>
            </Select>
            {errors.promotionType && (
              <p className="text-red-500 text-xs mt-1">{errors.promotionType}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="datetime-local"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className={errors.startDate ? "border-red-500" : ""}
            />
            {errors.startDate && (
              <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="datetime-local"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className={errors.endDate ? "border-red-500" : ""}
            />
            {errors.endDate && (
              <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter promotion description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Promotion Image <span className="text-red-500">*</span></Label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragging 
                ? 'border-zinc-400 bg-zinc-50' 
                : errors.image 
                  ? 'border-red-500'
                  : 'border-zinc-200 hover:border-zinc-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleFileChange}
            />
            
            {loading ? (
              <div className="relative w-full h-48">
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-100 animate-shimmer" 
                     style={{
                       backgroundSize: '700px 100%',
                       animation: 'shimmer 2s infinite linear'
                     }}
                />
              </div>
            ) : attachedFile && uploadedImageUrl ? (
              <div className="space-y-4">
                <div className="relative group">
                  <img 
                    src={uploadedImageUrl}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-lg object-contain"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 rounded-lg flex items-center justify-center">
                    <button
                      type="button"
                      onClick={handleDeleteImage}
                      className="p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-zinc-600">
                  <span className="truncate max-w-xs">{attachedFile.name}</span>
                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    className="p-1 hover:bg-zinc-100 rounded-full text-zinc-500 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="mx-auto h-8 w-8 text-zinc-400" />
                <div className="text-sm text-zinc-600">
                  <span className="font-medium">Click to upload</span> or drag and drop
                </div>
                <p className="text-xs text-zinc-500">
                  JPG, PNG or GIF (max. 800x400px)
                </p>
              </div>
            )}
          </div>
          {errors.image && (
            <p className="text-red-500 text-xs mt-1">{errors.image}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={isActive}
            onCheckedChange={(checked) => 
              setFormData({ ...formData, active: checked ? 1 : 0 })
            }
          />
          <Label htmlFor="active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {isActive ? 'Active' : 'Inactive'}
          </Label>
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            className="bg-zinc-800 hover:bg-zinc-700"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Creating...' : 'Create Promotion'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/promotions')}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center p-6">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-green-600 mb-2">Success!</h2>
            <p className="text-center text-gray-600 mb-4">
              Promotion has been created successfully
            </p>
            <div className="w-full bg-green-100 rounded-full h-1 mb-4">
              <div 
                className="bg-green-500 h-1 rounded-full animate-progress"
                style={{ width: '100%' }}
              />
            </div>
            <p className="text-sm text-gray-500">Redirecting to promotions list...</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

