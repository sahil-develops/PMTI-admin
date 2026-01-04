'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
interface EditPromotionFormProps {
  id: string;
}

interface PromotionData {
  title: string;
  description: string;
  amount: string;
  startDate: string;
  endDate: string;
  countryId: number;
  active: boolean;
}

export default function EditPromotionForm({ id }: EditPromotionFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<PromotionData>({
    title: '',
    description: '',
    amount: '',
    startDate: '',
    endDate: '',
    countryId: 0,
    active: false
  });

  useEffect(() => {
    fetchPromotionData();
  }, [id]);

  const fetchPromotionData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.projectmanagementtraininginstitute.com/promotions/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch promotion');
      }

      const data = await response.json();
      if (data.success) {
        setFormData({
          title: data.data.title,
          description: data.data.description,
          amount: data.data.amount,
          startDate: data.data.startDate.split('T')[0],
          endDate: data.data.endDate.split('T')[0],
          countryId: data.data.countryId,
          active: data.data.active
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch promotion details",
        variant: "destructive",
      });
      router.push('/promotions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(
        `https://api.projectmanagementtraininginstitute.com/promotions/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({
            ...formData,
            amount: parseInt(formData.amount, 10),
            active: formData.active ? 1 : 0
          }),
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
      setFormData(prev => ({
        ...prev,
        active: e as boolean
      }));
    } else if (typeof e === 'object') {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
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

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => handleInputChange(checked, true)}
              />
              <Label htmlFor="active">Active</Label>
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