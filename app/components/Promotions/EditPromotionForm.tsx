'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Upload, X, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface EditPromotionFormProps {
  id: string;
}

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

interface PromotionData {
  promotionId: string;
  title: string;
  description: string;
  amount: string;
  startDate: string;
  endDate: string;
  countryId: string;
  categoryId: string;
  classTypeId: string;
  promotionType: string;
  active: boolean;
  attachedFilePath: string;
}

export default function EditPromotionForm({ id }: EditPromotionFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  // previewUrl is purely for the <img> display; attachedFilePath in formData is sent to the API
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const [formData, setFormData] = useState<PromotionData>({
    promotionId: '',
    title: '',
    description: '',
    amount: '',
    startDate: '',
    endDate: '',
    countryId: '',
    categoryId: '',
    classTypeId: '',
    promotionType: '',
    active: false,
    attachedFilePath: '',
  });

  useEffect(() => {
    // Load ALL data (dropdowns + promotion) together so that Select components
    // render with both their value AND their items available at the same time.
    // If they render separately, Radix UI Select locks in "placeholder" when the
    // value has no matching item yet, and won't recover even after items load.
    const fetchAll = async () => {
      setLoading(true);
      try {
        const headers = {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        };

        const [countriesRes, categoriesRes, classTypesRes, promotionRes] = await Promise.all([
          fetch(`https://api.projectmanagementtraininginstitute.com/country`, { headers }),
          fetch(`https://api.projectmanagementtraininginstitute.com/category`, { headers }),
          fetch(`https://api.projectmanagementtraininginstitute.com/classtype`, { headers }),
          fetch(`https://api.projectmanagementtraininginstitute.com/promotions/${id}`, { headers }),
        ]);

        if (!promotionRes.ok) throw new Error('Failed to fetch promotion');

        const [countriesData, categoriesData, classTypesData, promotionData] = await Promise.all([
          countriesRes.json(),
          categoriesRes.json(),
          classTypesRes.json(),
          promotionRes.json(),
        ]);

        setCountries(countriesData.data);
        setCategories(categoriesData.data);
        setClassTypes(classTypesData.data);

        if (promotionData.success) {
          const p = promotionData.data;
          // The API returns nested objects (country/category/classType) and may
          // not include flat *Id fields, so fall back to the nested .id when
          // a flat id is not present.
          const countryId = p.countryId ?? p.country?.id;
          const categoryId = p.categoryId ?? p.category?.id;
          const classTypeId = p.classTypeId ?? p.classType?.id;
          const promotionType = p.promotionType ?? p.promotionTypeId;

          setFormData({
            promotionId: p.promotionId,
            title: p.title,
            description: p.description,
            amount: p.amount,
            startDate: p.startDate.split('T')[0],
            endDate: p.endDate.split('T')[0],
            countryId: countryId !== undefined && countryId !== null ? countryId.toString() : '',
            categoryId: categoryId !== undefined && categoryId !== null ? categoryId.toString() : '',
            classTypeId: classTypeId !== undefined && classTypeId !== null ? classTypeId.toString() : '',
            promotionType: promotionType !== undefined && promotionType !== null ? promotionType.toString() : '',
            active: p.active,
            attachedFilePath: p.attachedFilePath || '',
          });
          if (p.attachedFilePath) {
            setPreviewUrl(p.attachedFilePath);
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load promotion details",
          variant: "destructive",
        });
        router.push('/promotions');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

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
      toast({ title: "Invalid file type", description: "Please upload a JPG, PNG, or GIF image", variant: "destructive" });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif')) {
      await handleImageUpload(file);
    } else {
      toast({ title: "Invalid file type", description: "Please upload a JPG, PNG, or GIF image", variant: "destructive" });
    }
  };

  const handleImageUpload = async (file: File) => {
    setImageLoading(true);
    // Use a local blob URL immediately so the preview always shows regardless of
    // whether the API URL is directly accessible in the browser.
    const localBlob = URL.createObjectURL(file);
    setAttachedFile(file);
    setPreviewUrl(localBlob);

    const uploadForm = new FormData();
    uploadForm.append('file', file);
    try {
      const response = await fetch('https://api.projectmanagementtraininginstitute.com/upload', {
        method: 'POST',
        body: uploadForm,
      });
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      if (data.success) {
        // Store the API URL in formData for submission, keep blob URL for preview
        setFormData(prev => ({ ...prev, attachedFilePath: data.data.url }));
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to upload image", variant: "destructive" });
      setAttachedFile(null);
      setPreviewUrl(null);
      setFormData(prev => ({ ...prev, attachedFilePath: '' }));
    } finally {
      setImageLoading(false);
    }
  };

  const handleDeleteImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAttachedFile(null);
    setPreviewUrl(null);
    setFormData(prev => ({ ...prev, attachedFilePath: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend guard: every required field must have a valid value before submit.
    // Without this, an empty Select would parse to NaN -> serialize as null ->
    // backend silently drops fields and reports success without updating.
    if (
      !formData.promotionId.trim() ||
      !formData.title.trim() ||
      !formData.amount ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.countryId ||
      !formData.categoryId ||
      !formData.classTypeId ||
      !formData.promotionType
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields before saving.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        promotionId: formData.promotionId,
        title: formData.title,
        description: formData.description,
        amount: parseFloat(formData.amount),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        countryId: parseInt(formData.countryId, 10),
        categoryId: parseInt(formData.categoryId, 10),
        classTypeId: parseInt(formData.classTypeId, 10),
        promotionType: parseInt(formData.promotionType, 10),
        active: formData.active,
        isDelete: false,
        attachedFilePath: formData.attachedFilePath || '',
      };

      const response = await fetch(
        `https://api.projectmanagementtraininginstitute.com/promotions/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update promotion');
      }

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Promotion updated successfully",
        });
        router.push('/promotions');
      } else {
        throw new Error(data.error || 'Failed to update promotion');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update promotion",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | boolean,
    isSwitch = false
  ) => {
    if (isSwitch) {
      setFormData(prev => ({ ...prev, active: e as boolean }));
    } else if (typeof e === 'object') {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <nav className="flex mx-6 my-4" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 text-sm">
          <li>
            <Link href="/" className="text-zinc-500 hover:text-zinc-700">
              Promotions
            </Link>
          </li>
          <li>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </li>
          <li className="text-zinc-900 font-medium">Edit Promotion</li>
        </ol>
      </nav>
      <Card className="max-w-full mx-5 ">
        <CardHeader>
          <CardTitle>Edit Promotion</CardTitle>
          <CardDescription>Make changes to the promotion details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="promotionId">Promotion ID</Label>
              <Input
                id="promotionId"
                name="promotionId"
                value={formData.promotionId}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                required
                min="0"
                step="1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Country</Label>
                <Select
                  value={formData.countryId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, countryId: value }))}
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
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
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
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Class Type</Label>
                <Select
                  value={formData.classTypeId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, classTypeId: value }))}
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
              </div>

              <div className="space-y-2">
                <Label>Promotion Type</Label>
                <Select
                  value={formData.promotionType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, promotionType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select promotion type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">General</SelectItem>
                    <SelectItem value="2">Special</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Promotion Image <span className="text-xs text-zinc-500">(Optional)</span></Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragging ? 'border-zinc-400 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('edit-file-upload')?.click()}
              >
                <input
                  id="edit-file-upload"
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleFileChange}
                />
                {imageLoading ? (
                  <div className="flex items-center justify-center h-24">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                  </div>
                ) : previewUrl ? (
                  <div className="space-y-4">
                    <div className="relative group">
                      <img
                        src={previewUrl}
                        alt="Image preview"
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
                    {attachedFile && (
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
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto h-8 w-8 text-zinc-400" />
                    <div className="text-sm text-zinc-600">
                      <span className="font-medium">Click to upload</span> or drag and drop
                    </div>
                    <p className="text-xs text-zinc-500">JPG, PNG or GIF (max. 800x400px)</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => handleInputChange(checked, true)}
              />
              <Label htmlFor="active">{formData.active ? 'Active' : 'Inactive'}</Label>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/promotions')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Promotion'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}