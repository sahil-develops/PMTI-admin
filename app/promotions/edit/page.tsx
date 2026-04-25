'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import EditPromotionForm from '@/app/components/Promotions/EditPromotionForm';
import { Loader2 } from 'lucide-react';

function EditPromotionPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

  useEffect(() => {
    if (!id) {
      router.replace('/promotions');
    }
  }, [id, router]);

  if (!id) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <EditPromotionForm id={id} />;
}

export default function EditPromotionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <EditPromotionPageInner />
    </Suspense>
  );
}
