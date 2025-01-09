'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

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

export default function AddPromotionForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);

  const [formData, setFormData] = useState({
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
    promotionType: '2', // Default value
  });

  // Fetch dropdown data
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        countryId: parseInt(formData.countryId),
        categoryId: parseInt(formData.categoryId),
        classTypeId: parseInt(formData.classTypeId),
        amount: parseFloat(formData.amount),
        promotionType: parseInt(formData.promotionType),
        attachedFilePath: "promotionfiles/filenotfound.gif",
        isDelete: false,
        addedBy: 46, // You might want to get this from your auth context
        updatedBy: 7,
      };

      const response = await fetch(`https://api.4pmti.com/promotions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(payload),
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            required
            placeholder="Enter promotion description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
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