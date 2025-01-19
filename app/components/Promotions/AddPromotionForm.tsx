'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, X } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

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
  active: boolean;
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

  const [formData, setFormData] = useState<FormData>({
    countryId: '',
    categoryId: '',
    classTypeId: '',
    promotionId: '',
    amount: '',
    startDate: '',
    endDate: '',
    title: '',
    description: '',
    active: true,
    promotionType: '2'
  });

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif')) {
      setAttachedFile(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or GIF image",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif')) {
      setAttachedFile(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or GIF image",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create form data for multipart/form-data submission
      const formDataSubmit = new FormData();
      
      const payload = {
        ...formData,
        countryId: parseInt(formData.countryId),
        categoryId: parseInt(formData.categoryId),
        classTypeId: parseInt(formData.classTypeId),
        amount: parseFloat(formData.amount),
        promotionType: parseInt(formData.promotionType),
        isDelete: false,
        addedBy: localStorage.getItem('userEmail'),
        updatedBy: localStorage.getItem('userEmail'),
      };

      // Append payload data
      Object.entries(payload).forEach(([key, value]) => {
        formDataSubmit.append(key, String(value));
      });

      // Append file if exists
      if (attachedFile) {
        formDataSubmit.append('attachedFile', attachedFile);
      }

      const response = await fetch(`https://api.4pmti.com/promotions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formDataSubmit,
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Promotion created successfully",
        });
        router.push('/promotions');
      } else {
        throw new Error(data.error || 'Failed to create promotion');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create promotion",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-900">Add New Promotion</h1>
        <p className="text-zinc-500">Create a new promotion with the form below</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Previous form fields remain the same */}
          <div className="space-y-2">
            <Label htmlFor="promotionId">Promotion ID</Label>
            <Input
              id="promotionId"
              required
              placeholder="Enter promotion ID"
              value={formData.promotionId}
              onChange={(e) => setFormData({ ...formData, promotionId: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              required
              placeholder="Enter promotion title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
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
            />
          </div>

          <div className="space-y-2">
            <Label>Country</Label>
            <Select
              required
              value={formData.countryId}
              onValueChange={(value) => setFormData({ ...formData, countryId: value })}
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
          </div>

          <div className="space-y-2">
            <Label>Promotion Type</Label>
            <Select
              required
              value={formData.promotionType}
              onValueChange={(value) => setFormData({ ...formData, promotionType: value })}
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

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="datetime-local"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="datetime-local"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter promotion description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        {/* File Upload Section */}
        <div className="space-y-2">
          <Label>Promotion Image</Label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragging 
                ? 'border-zinc-400 bg-zinc-50' 
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
            
            {attachedFile ? (
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-zinc-600">{attachedFile.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAttachedFile(null);
                  }}
                  className="p-1 hover:bg-zinc-100 rounded-full"
                >
                  <X size={16} className="text-zinc-500" />
                </button>
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
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="active"
            checked={formData.active}
            onCheckedChange={(checked) => 
              setFormData({ ...formData, active: checked as boolean })
            }
          />
          <Label htmlFor="active">Active</Label>
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
    </div>
  );
}