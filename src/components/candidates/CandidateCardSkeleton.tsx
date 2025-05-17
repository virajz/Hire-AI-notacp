import { Card } from '@/components/ui/card';

const CandidateCardSkeleton = () => {
  return (
    <Card className="p-4 h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="skeleton h-6 w-32"></div>
            <div className="skeleton h-4 w-24"></div>
          </div>
          <div className="skeleton h-8 w-8 rounded-full"></div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <div className="skeleton h-5 w-20"></div>
          <div className="skeleton h-5 w-16"></div>
          <div className="skeleton h-5 w-16"></div>
        </div>

        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            <div className="skeleton h-5 w-16"></div>
            <div className="skeleton h-5 w-20"></div>
            <div className="skeleton h-5 w-14"></div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          <div className="skeleton h-8 w-16"></div>
          <div className="skeleton h-8 w-16"></div>
        </div>
        <div className="skeleton h-8 w-24"></div>
      </div>
    </Card>
  );
};

export default CandidateCardSkeleton; 