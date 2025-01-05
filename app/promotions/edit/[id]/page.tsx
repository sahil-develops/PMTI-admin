// app/promotions/edit/[id]/page.tsx
import EditPromotionForm from '@/app/components/Promotions/EditPromotionForm';
export default function EditPromotionPage({ params }: { params: { id: string } }) {
    return <EditPromotionForm id={params.id} />;
  }