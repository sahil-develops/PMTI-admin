import { create } from 'zustand';
import api from '@/app/lib/api';

export interface Instructor {
  id: string;
  uid: string;
  name: string;
  emailID: string;
  mobile: string;
  telNo: string;
  active: boolean;
}

interface InstructorMetadata {
  total: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  limit: number;
}

interface InstructorState {
  instructors: Instructor[];
  filteredInstructors: Instructor[];
  metadata: InstructorMetadata | null;
  loading: boolean;
  deleteLoading: string | null;
  globalSearch: string;
  nameSearch: string;
  emailSearch: string;

  fetchInstructors: (page?: number, limit?: number) => Promise<void>;
  deleteInstructor: (id: string) => Promise<boolean>;
  setGlobalSearch: (value: string) => void;
  setNameSearch: (value: string) => void;
  setEmailSearch: (value: string) => void;
  applyFilters: () => void;
}

export const useInstructorStore = create<InstructorState>((set, get) => ({
  instructors: [],
  filteredInstructors: [],
  metadata: null,
  loading: true,
  deleteLoading: null,
  globalSearch: '',
  nameSearch: '',
  emailSearch: '',

  fetchInstructors: async (page = 1, limit = 10) => {
    set({ loading: true });
    try {
      const response = await api.get('instructor', {
        params: { page, limit }
      });
      const body = response.data;
      if (body.success) {
        // API shape: { success, data: { data: [...], metadata: {...} } }
        const nested = body.data;
        const list: Instructor[] = Array.isArray(nested?.data) ? nested.data : [];
        const metadata: InstructorMetadata | null = nested?.metadata ?? null;
        set({ instructors: list, filteredInstructors: list, metadata });
        get().applyFilters();
      }
    } catch (error) {
      console.error('Error fetching instructors:', error);
    } finally {
      set({ loading: false });
    }
  },

  deleteInstructor: async (id: string) => {
    set({ deleteLoading: id });
    try {
      const response = await api.delete(`instructor/${id}`);
      if (response.data.success) {
        const updated = get().instructors.filter((i) => i.id !== id);
        set({ instructors: updated });
        get().applyFilters();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting instructor:', error);
      return false;
    } finally {
      set({ deleteLoading: null });
    }
  },

  setGlobalSearch: (value: string) => {
    set({ globalSearch: value });
    get().applyFilters();
  },

  setNameSearch: (value: string) => {
    set({ nameSearch: value });
    get().applyFilters();
  },

  setEmailSearch: (value: string) => {
    set({ emailSearch: value });
    get().applyFilters();
  },

  applyFilters: () => {
    const { instructors, globalSearch, nameSearch, emailSearch } = get();
    const filtered = instructors.filter((instructor) => {
      const globalMatch =
        !globalSearch ||
        instructor.name?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        instructor.emailID?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        instructor.mobile?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        instructor.uid?.toLowerCase().includes(globalSearch.toLowerCase());

      const nameMatch =
        !nameSearch ||
        instructor.name?.toLowerCase().includes(nameSearch.toLowerCase());

      const emailMatch =
        !emailSearch ||
        instructor.emailID?.toLowerCase().includes(emailSearch.toLowerCase());

      return globalMatch && nameMatch && emailMatch;
    });
    set({ filteredInstructors: filtered });
  },
}));
