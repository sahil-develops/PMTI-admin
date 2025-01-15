'use client'
import { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { Plus, Search, MoreVertical, Edit2, Trash2, Eye, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import debounce from 'lodash/debounce';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PromotionFilter {
  id?: string;
  amount?: {
    lt?: number;
    gt?: number;
    eq?: number;
  };
  country?: number;
  startFrom?: string;
  endDateTo?: string;
}

interface Country {
  id: number;
  CountryName: string;
}

interface Promotion {
  id: number;
  promotionId: string;
  amount: string;
  startDate: string;
  endDate: string;
  title: string;
  description: string;
  active: boolean;
  country: {
    id: number;
    CountryName: string;
  };
  category: {
    id: number;
    name: string;
  };
  classType: {
    id: number;
    name: string;
  };
}

interface FilterState {
  id: string;
  country: string;
  amountMin: string;
  amountMax: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

const TableHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <th className={`px-4 py-3 text-left text-sm font-medium text-zinc-500 whitespace-nowrap ${className}`}>{children}</th>
);

const TableCell = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <td className={`px-4 py-4 text-sm text-zinc-600 ${className}`}>{children}</td>
);

const TableShimmer = () => (
  <div className="animate-pulse space-y-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="border-b border-zinc-200 h-16 bg-zinc-50" />
    ))}
  </div>
);

const ActionDropdown = ({ 
  promotionId, 
  refreshData,
  promotion
}: { 
  promotionId: number;
  refreshData: () => void;
  promotion: Promotion;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `https://api.4pmti.com/promotions/${promotionId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete promotion');
      }

      toast({
        title: "Success",
        description: "Promotion deleted successfully",
      });
      refreshData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete promotion",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setIsOpen(false);
    }
  };

  const menuItems = [
    {
      label: 'View details',
      icon: Eye,
      onClick: () => router.push(`/promotions/view/${promotionId}`),
      className: 'text-gray-700 hover:bg-gray-50',
    },
    {
      label: 'Edit details',
      icon: Edit2,
      onClick: () => router.push(`/promotions/edit/${promotionId}`),
      className: 'text-gray-700 hover:bg-gray-50',
    },
    {
      label: 'Delete promotion',
      icon: Trash2,
      onClick: () => setShowDeleteDialog(true),
      className: 'text-red-600 hover:bg-red-50',
      disabled: isDeleting,
    },
  ];

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-full hover:bg-zinc-100 transition-colors"
          disabled={isDeleting}
        >
          <MoreVertical size={16} className="text-zinc-600" />
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white z-20 py-1 border border-zinc-100"
              >
                {menuItems.map((item, index) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      item.onClick();
                      setIsOpen(false);
                    }}
                    disabled={item.disabled}
                    className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors ${item.className} ${
                      item.disabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the promotion <span className="font-medium">{promotion.title}</span>. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Promotion'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default function PromotionsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [filters, setFilters] = useState<FilterState>({
    id: '',
    country: 'all',
    amountMin: '',
    amountMax: '',
    startDate: undefined,
    endDate: undefined,
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      if (!searchValue.trim()) {
        setFilteredPromotions(promotions);
        return;
      }

      const searchResults = promotions.filter((promotion) => {
        const searchString = searchValue.toLowerCase();
        return (
          promotion.promotionId.toLowerCase().includes(searchString) ||
          promotion.title.toLowerCase().includes(searchString) ||
          promotion.amount.toString().includes(searchString) ||
          promotion.country.CountryName.toLowerCase().includes(searchString) ||
          format(new Date(promotion.startDate), 'MMM dd, yyyy').toLowerCase().includes(searchString) ||
          format(new Date(promotion.endDate), 'MMM dd, yyyy').toLowerCase().includes(searchString)
        );
      });
      setFilteredPromotions(searchResults);
    }, 300), // 300ms delay
    [promotions]
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.4pmti.com/promotions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          "Authorization" :`Bearer ${localStorage.getItem("accessToken")}`
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPromotions(data.data);
        setFilteredPromotions(data.data);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch promotions",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch promotions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let results = [...promotions];

    if (filters.id) {
      results = results.filter(p => 
        p.promotionId.toLowerCase().includes(filters.id.toLowerCase())
      );
    }

    if (filters.country && filters.country !== 'all') {
      results = results.filter(p => 
        p.country.id.toString() === filters.country
      );
    }

    if (filters.amountMin) {
      results = results.filter(p => 
        parseFloat(p.amount) >= parseFloat(filters.amountMin)
      );
    }

    if (filters.amountMax) {
      results = results.filter(p => 
        parseFloat(p.amount) <= parseFloat(filters.amountMax)
      );
    }

    if (filters.startDate) {
      results = results.filter(p => 
        new Date(p.startDate) >= filters.startDate!
      );
    }

    if (filters.endDate) {
      results = results.filter(p => 
        new Date(p.endDate) <= filters.endDate!
      );
    }

    setFilteredPromotions(results);
  }, [filters, promotions]);

  useEffect(() => {
    applyFilters();
  }, [filters, applyFilters]);

  useEffect(() => {
    fetchPromotions();
    // Cleanup debounce on component unmount
    return () => {
      debouncedSearch.cancel();
    };
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <p className="font-semibold leading-none tracking-tight text-xl">Promotions</p>
          <button
            onClick={() => router.push('/promotions/add')}
            className="flex items-center gap-2 bg-zinc-800 text-white px-4 py-2 rounded hover:bg-zinc-700"
          >
            <Plus size={20} />
            Add Promotion
          </button>
        </div>

        <div className=" space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={20} />
            <Input
              className="pl-10 w-full bg-zinc-50/50 border-zinc-200"
              placeholder="Search promotions..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-zinc-500 mb-1.5 block">Promotion ID</label>
              <Input
                className="bg-zinc-50/50 border-zinc-200"
                placeholder="Search by ID..."
                value={filters.id}
                onChange={(e) => setFilters(prev => ({ ...prev, id: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm text-zinc-500 mb-1.5 block">Country</label>
              <Select
                value={filters.country}
                onValueChange={(value) => setFilters(prev => ({ ...prev, country: value }))}
              >
                <SelectTrigger className="bg-zinc-50/50 border-zinc-200">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {Array.from(new Set(promotions.map(p => p.country)))
                    .map(country => (
                      <SelectItem key={country.id} value={country.id.toString()}>
                        {country.CountryName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-zinc-500 mb-1.5 block">Amount Range</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  className="bg-zinc-50/50 border-zinc-200"
                  placeholder="Min"
                  value={filters.amountMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, amountMin: e.target.value }))}
                />
                <Input
                  type="number"
                  className="bg-zinc-50/50 border-zinc-200"
                  placeholder="Max"
                  value={filters.amountMax}
                  onChange={(e) => setFilters(prev => ({ ...prev, amountMax: e.target.value }))}
                />
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="text-sm text-zinc-500 mb-1.5 block">Date Range</label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`bg-zinc-50/50 border-zinc-200 w-full justify-start text-left font-normal ${
                        !filters.startDate && "text-zinc-500"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.startDate ? format(filters.startDate, "PPP") : "Start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.startDate}
                      onSelect={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`bg-zinc-50/50 border-zinc-200 w-full justify-start text-left font-normal ${
                        !filters.endDate && "text-zinc-500"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.endDate ? format(filters.endDate, "PPP") : "End date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.endDate}
                      onSelect={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="ghost"
              className="text-zinc-500 hover:text-zinc-900"
              onClick={() => {
                setFilters({
                  id: '',
                  country: 'all',
                  amountMin: '',
                  amountMax: '',
                  startDate: undefined,
                  endDate: undefined,
                });
                setFilteredPromotions(promotions);
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <TableShimmer />
      ) : (
        <div className="overflow-x-auto pb-40">
          <table className="w-full border-collapse">
            <thead className="bg-zinc-50">
              <tr>
                <TableHeader className="whitespace-nowrap">ID</TableHeader>
                <TableHeader className="whitespace-nowrap">Title</TableHeader>
                <TableHeader className="whitespace-nowrap">Amount</TableHeader>
                <TableHeader className="whitespace-nowrap">Country</TableHeader>
                <TableHeader className="whitespace-nowrap">Start Date</TableHeader>
                <TableHeader className="whitespace-nowrap">End Date</TableHeader>
                <TableHeader className="whitespace-nowrap">Status</TableHeader>
                <TableHeader className="whitespace-nowrap">Category</TableHeader>
                <TableHeader className="whitespace-nowrap">Class Type</TableHeader>
                <TableHeader className="whitespace-nowrap">Actions</TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredPromotions.length > 0 ? (
                filteredPromotions.map((promotion) => (
                  <tr 
                    key={promotion.id} 
                    className="hover:bg-zinc-50 transition-colors"
                  >
                    <TableCell className="whitespace-nowrap">
                      {promotion.promotionId}
                    </TableCell>
                    <TableCell className="font-medium text-zinc-900 max-w-[200px] truncate">
                      {promotion.title}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      ${promotion.amount}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {promotion.country.CountryName}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(promotion.startDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(promotion.endDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        promotion.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {promotion.active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {promotion.category.name}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {promotion.classType.name}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <ActionDropdown 
                        promotionId={promotion.id}
                        refreshData={fetchPromotions}
                        promotion={promotion}
                      />
                    </TableCell>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-zinc-500">
                    No promotions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 