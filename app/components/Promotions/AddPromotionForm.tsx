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

interface Instructor {
  id: number;
  name: string;
  emailID: string;
}

interface Location {
  id: number;
  location: string;
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
  address: string;
  maxStudent: string;
  minStudent: string;
  price: string;
  status: string;
  onlineAvailable: boolean;
  isCancel: boolean;
  classTime: string;
  onlineCourseId: string;
  isCorpClass: boolean;
  hotel: string;
  hotelEmailId: string;
  hotelContactNo: string;
  flightConfirmation: string;
  carConfirmation: string;
  hotelConfirmation: string;
  instructorId: string;
  locationId: string;
}

export default function AddPromotionForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

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
    promotionType: '2',
    address: '',
    maxStudent: '',
    minStudent: '',
    price: '',
    status: '1',
    onlineAvailable: false,
    isCancel: false,
    classTime: '',
    onlineCourseId: '',
    isCorpClass: false,
    hotel: '',
    hotelEmailId: '',
    hotelContactNo: '',
    flightConfirmation: '',
    carConfirmation: '',
    hotelConfirmation: '',
    instructorId: '',
    locationId: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        };

        const [countriesRes, categoriesRes, classTypesRes, instructorsRes, locationsRes] = await Promise.all([
          fetch(`https://api.4pmti.com/country`, { headers }),
          fetch(`https://api.4pmti.com/category`, { headers }),
          fetch(`https://api.4pmti.com/classtype`, { headers }),
          fetch(`https://api.4pmti.com/instructor`, { headers }),
          fetch(`https://api.4pmti.com/location`, { headers })
        ]);

        const [countriesData, categoriesData, classTypesData, instructorsData, locationsData] = await Promise.all([
          countriesRes.json(),
          categoriesRes.json(),
          classTypesRes.json(),
          instructorsRes.json(),
          locationsRes.json()
        ]);

        setCountries(countriesData.data);
        setCategories(categoriesData.data);
        setClassTypes(classTypesData.data);
        setInstructors(instructorsData.data);
        setLocations(locationsData.data);
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
        addedBy: 46,
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxStudent">Maximum Students</Label>
            <Input
              id="maxStudent"
              type="number"
              value={formData.maxStudent}
              onChange={(e) => setFormData({ ...formData, maxStudent: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minStudent">Minimum Students</Label>
            <Input
              id="minStudent"
              type="number"
              value={formData.minStudent}
              onChange={(e) => setFormData({ ...formData, minStudent: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="classTime">Class Time</Label>
            <Input
              id="classTime"
              type="time"
              value={formData.classTime}
              onChange={(e) => setFormData({ ...formData, classTime: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="onlineCourseId">Online Course ID</Label>
            <Input
              id="onlineCourseId"
              value={formData.onlineCourseId}
              onChange={(e) => setFormData({ ...formData, onlineCourseId: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Instructor</Label>
            <Select
              value={formData.instructorId}
              onValueChange={(value) => setFormData({ ...formData, instructorId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select instructor" />
              </SelectTrigger>
              <SelectContent>
                {instructors.map((instructor) => (
                  <SelectItem key={instructor.id} value={instructor.id.toString()}>
                    {instructor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <Select
              value={formData.locationId}
              onValueChange={(value) => setFormData({ ...formData, locationId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id.toString()}>
                    {location.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hotel">Hotel</Label>
            <Input
              id="hotel"
              value={formData.hotel}
              onChange={(e) => setFormData({ ...formData, hotel: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hotelEmailId">Hotel Email</Label>
            <Input
              id="hotelEmailId"
              type="email"
              value={formData.hotelEmailId}
              onChange={(e) => setFormData({ ...formData, hotelEmailId: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hotelContactNo">Hotel Contact</Label>
            <Input
              id="hotelContactNo"
              value={formData.hotelContactNo}
              onChange={(e) => setFormData({ ...formData, hotelContactNo: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="flightConfirmation">Flight Confirmation</Label>
            <Input
              id="flightConfirmation"
              value={formData.flightConfirmation}
              onChange={(e) => setFormData({ ...formData, flightConfirmation: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="carConfirmation">Car Confirmation</Label>
            <Input
              id="carConfirmation"
              value={formData.carConfirmation}
              onChange={(e) => setFormData({ ...formData, carConfirmation: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hotelConfirmation">Hotel Confirmation</Label>
            <Input
              id="hotelConfirmation"
              value={formData.hotelConfirmation}
              onChange={(e) => setFormData({ ...formData, hotelConfirmation: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="onlineAvailable"
              checked={formData.onlineAvailable}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, onlineAvailable: checked as boolean })
              }
            />
            <Label htmlFor="onlineAvailable">Online Available</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isCorpClass"
              checked={formData.isCorpClass}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, isCorpClass: checked as boolean })
              }
            />
            <Label htmlFor="isCorpClass">Corporate Class</Label>
          </div>
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