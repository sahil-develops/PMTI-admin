'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ChevronRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface PromotionDetails {
  id: number;
  promotionId: string;
  amount: string;
  startDate: string;
  endDate: string;
  title: string;
  description: string;
  active: boolean;
  country: {
    CountryName: string;
    currency: string;
  };
  category: {
    name: string;
    description: string;
  };
  classType: {
    name: string;
    description: string;
  };
}

const DetailRow = ({ label, value }: { label: string; value: string | number | boolean }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 py-3 border-b border-zinc-100">
    <span className="text-sm font-medium text-zinc-500">{label}</span>
    <span className="text-sm text-zinc-900 md:col-span-2">
      {typeof value === 'boolean' ? (
        <span className={`px-2 py-1 rounded-full text-xs ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ) : value}
    </span>
  </div>
);

export default function ViewPromotionDetails({ id }: { id: string | any }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [promotion, setPromotion] = useState<PromotionDetails | null>(null);

  useEffect(() => {
    const fetchPromotionDetails = async () => {
      try {
        const response = await fetch(`https://api.projectmanagementtraininginstitute.com/promotions/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          setPromotion(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch promotion details');
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch promotion details",
          variant: "destructive",
        });
        router.push('/promotions');
      } finally {
        setLoading(false);
      }
    };

    fetchPromotionDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!promotion) {
    return null;
  }

  return (
    <div>
      <nav className="flex my-4" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 text-sm">
          <li>
            <Link href="/" className="text-zinc-500 hover:text-zinc-700">
              Home
            </Link>
          </li>
          <li>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </li>
          <li>
            <Link href="/" className="text-zinc-500 hover:text-zinc-700">
              Promotion
            </Link>
          </li>
          <li>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </li>
          <li className="text-zinc-900 font-medium">Promotion Details</li>
        </ol>
      </nav>
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex items-center gap-4 mb-6">
          {/* <Button
          variant="outline"
          onClick={() => router.push('/promotions')}
          className="flex items-center gap-2"
          >
          <ArrowLeft size={16} />
          Back to Promotions
          </Button> */}
          <h1 className="text-2xl font-semibold text-zinc-900">Promotion Details</h1>
        </div>

        <Card className="p-6">
          <div className="space-y-1">
            <DetailRow label="Promotion ID" value={promotion.promotionId} />
            <DetailRow label="Title" value={promotion.title} />
            <DetailRow label="Amount" value={`$${promotion.amount}`} />
            <DetailRow label="Description" value={promotion.description} />
            <DetailRow label="Country" value={promotion.country.CountryName} />
            <DetailRow label="Currency" value={promotion.country.currency} />
            <DetailRow label="Category" value={promotion.category.name} />
            <DetailRow label="Category Description" value={promotion.category.description} />
            <DetailRow label="Class Type" value={promotion.classType.name} />
            <DetailRow label="Class Type Description" value={promotion.classType.description} />
            <DetailRow
              label="Start Date"
              value={format(new Date(promotion.startDate), 'MMM dd, yyyy')}
            />
            <DetailRow
              label="End Date"
              value={format(new Date(promotion.endDate), 'MMM dd, yyyy')}
            />
            <DetailRow label="Status" value={promotion.active} />
          </div>
        </Card>
      </div>
    </div>
  );
} 