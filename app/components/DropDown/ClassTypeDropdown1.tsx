'use client'
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

interface CreateClassTypeFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

interface SearchParams {
    classTypeId: string;
  }
  
  interface ClassType {
    id: number;
    name: string;
  }
  
  interface ClassTypeDropdownProps {
    searchParams: SearchParams;
    setSearchParams: (params: SearchParams) => void;
    classTypes: ClassType[];
  }
  

const CreateClassTypeForm: React.FC<CreateClassTypeFormProps> = ({ onCancel, onSuccess }) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}classtype`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ name:name }),
      });

      if (!response.ok) throw new Error('Failed to create class type');
      
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1000);

    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      onSubmit={handleSubmit}
      className="p-2 space-y-2"
    >
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter class type name"
        className="w-full"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isLoading || isSuccess}
          className="flex-1 bg-zinc-800 text-white rounded-md py-1 px-3 text-sm flex items-center justify-center"
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
          className="flex-1 border border-zinc-200 rounded-md py-1 px-3 text-sm"
        >
          Cancel
        </button>
      </div>
    </motion.form>
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
      No Class Types found,{' '}
      <button
        onClick={onClick}
        className="text-zinc-900 font-medium hover:underline"
      >
        Create one
      </button>
    </p>
  </motion.div>
);


const ClassTypeDropdown1: React.FC<ClassTypeDropdownProps> = ({ searchParams, setSearchParams, classTypes }) => {
  const [isCreating, setIsCreating] = useState(false);

  const handleSuccess = () => {
    setIsCreating(false);
    // Trigger refetch of class types
  };

  return (
    <div className="flex flex-col gap-2">
      <Label>Class Type</Label>
      <Select
        value={searchParams.classTypeId}
        onValueChange={(value) => setSearchParams({ ...searchParams, classTypeId: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Class Type" />
        </SelectTrigger>
        <SelectContent>
          {classTypes.length > 0 ? (
            classTypes.map((type) => (
              <SelectItem key={type.id} value={type.id.toString()}>
                {type.name}
              </SelectItem>
            ))
          ) : isCreating ? (
            <CreateClassTypeForm 
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

export default ClassTypeDropdown1;