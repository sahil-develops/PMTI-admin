import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CreateInstructorFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

interface SearchParams {
  startDateFrom: string;
  startDateTo: string;
  countryId: string;
  locationId: string;
  instructorId: string;
  courseCategoryId: string;
  classTypeId: string;
  showClass: string;
}

interface Instructor {
  id: number;
  name: string;
}

const CreateInstructorForm: React.FC<CreateInstructorFormProps> = ({ onCancel, onSuccess }) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}instructor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) throw new Error('Failed to create instructor');
      
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1000);

    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="p-2 space-y-2"
    >
      <div className="border-b border-zinc-200 pb-2 mb-3">
        <h3 className="font-medium text-sm text-zinc-900">Add New Instructor</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter instructor name"
          className="w-full"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isLoading || isSuccess || !name.trim()}
            className="flex-1 bg-zinc-800 text-white rounded-md py-1 px-3 text-sm flex items-center justify-center disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              'Create'
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-zinc-200 rounded-md py-1 px-3 text-sm hover:bg-zinc-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
};

const EmptyState: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="p-4 text-center"
  >
    <p className="text-sm text-zinc-500">
      No Instructors found,{' '}
      <button
        onClick={onClick}
        className="text-zinc-900 font-medium hover:underline"
      >
        Create one
      </button>
    </p>
  </motion.div>
);

interface InstructorDropdownProps {
  searchParams: SearchParams;
  setSearchParams: (params: SearchParams) => void;
  instructors: Instructor[];
  onSuccess?: () => void;
}

const InstructorDropdown: React.FC<InstructorDropdownProps> = ({
  searchParams,
  setSearchParams,
  instructors,
  onSuccess
}) => {
  const [isCreating, setIsCreating] = useState(false);

  const handleSuccess = () => {
    setIsCreating(false);
    if (onSuccess) onSuccess();
  };

  return (
    <div className="flex flex-col gap-2">
      <Label>Instructor</Label>
      <Select
        value={searchParams.instructorId || ""}
        onValueChange={(value) => setSearchParams({ ...searchParams, instructorId: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Instructor" />
        </SelectTrigger>
        <SelectContent>
          {instructors.length > 0 ? (
            instructors.map((instructor) => (
              <SelectItem key={instructor.id} value={instructor.id.toString()}>
                {instructor.name}
              </SelectItem>
            ))
          ) : isCreating ? (
            <CreateInstructorForm 
              onCancel={() => setIsCreating(false)}
              onSuccess={handleSuccess}
            />
          ) : (
            <EmptyState onClick={() => setIsCreating(true)} />
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default InstructorDropdown;