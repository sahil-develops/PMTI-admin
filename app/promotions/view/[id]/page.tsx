import ViewPromotionDetails from '@/app/components/Promotions/ViewPromotionDetails';

export default function ViewPromotionPage({ params }: { params: { id: string } }) {
  return <ViewPromotionDetails id={params.id} />;
} 