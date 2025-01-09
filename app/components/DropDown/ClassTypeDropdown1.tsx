'use client'
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2,Plus } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";


interface ClassTypeDropdownProps {
  searchParams: SearchParams;
  setSearchParams: (params: SearchParams) => void;
  classTypes: ClassType[];
  refreshClassTypes: () => void;
}

interface SearchParams {
  classTypeId: string;
}

interface ClassType {
  id: number;
  name: string;
}

interface CreateClassTypeFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  refreshClassTypes: () => void;
}

const CreateClassTypeForm: React.FC<CreateClassTypeFormProps> = ({ onCancel, onSuccess, refreshClassTypes }) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`https://api.4pmti.com/classtype`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ name:name }),
      });

      if (!response.ok) throw new Error('Failed to create class type');
      
      setIsSuccess(true);
      refreshClassTypes();
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
    whileHover={{ backgroundBlendMode: "difference", scale: 1.01 }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
    className="py-2 px-3 m-2 rounded-lg text-center flex gap-x-3 bg-gray-100 hover:bg-gray-300 justify-start items-center flex-row cursor-pointer group"
  >
    <motion.div
      whileHover={{ rotate: 80 }}
      transition={{ duration: 0.2 }}
    >
      <Plus className="w-6 h-6 text-zinc-500 group-hover:text-zinc-700" />
    </motion.div>

    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className="text-zinc-900 font-medium hover:underline"
    >
      Create one
    </motion.button>
  </motion.div>
);
const ClassTypeDropdown: React.FC<ClassTypeDropdownProps> = ({ searchParams, setSearchParams, classTypes, refreshClassTypes }) => {
  const [isCreating, setIsCreating] = useState(false);

  const handleSuccess = () => {
    setIsCreating(false);
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
          {classTypes.map((type) => (
            <SelectItem key={type.id} value={type.id.toString()}>
              {type.name}
            </SelectItem>
          ))}
          {isCreating ? (
            <CreateClassTypeForm 
              onCancel={() => setIsCreating(false)}
              onSuccess={handleSuccess}
              refreshClassTypes={refreshClassTypes}
            />
          ) : (
            <EmptyState onClick={() => setIsCreating(true)} />
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ClassTypeDropdown;