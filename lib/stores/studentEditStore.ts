import { create } from "zustand";

interface StudentFormData {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  companyName?: string;
  profession?: string;
}

interface Country {
  id: number;
  CountryName: string;
}

interface StateOption {
  id: number;
  name: string;
}

interface StudentEditState {
  // Form data
  formData: StudentFormData;
  // Location cascading state
  selectedCountry: string;
  selectedState: string;
  isCityInputDisabled: boolean;
  // Reference data
  countries: Country[];
  states: StateOption[];
  // Loading flags
  isFetchingStates: boolean;
  // Validation errors
  errors: Record<string, string>;

  // Actions
  initForm: (student: any) => void;
  setFormField: (field: keyof StudentFormData, value: string) => void;
  setSelectedCountry: (countryId: string, clearDependents?: boolean) => void;
  setSelectedState: (stateId: string) => void;
  setCountries: (countries: Country[]) => void;
  setStates: (states: StateOption[]) => void;
  setIsFetchingStates: (loading: boolean) => void;
  setErrors: (errors: Record<string, string>) => void;
  clearFieldError: (field: string) => void;
  resetStore: () => void;
}

const defaultState = {
  formData: {},
  selectedCountry: "",
  selectedState: "",
  isCityInputDisabled: true,
  countries: [],
  states: [],
  isFetchingStates: false,
  errors: {},
};

export const useStudentEditStore = create<StudentEditState>((set) => ({
  ...defaultState,

  initForm: (student) => {
    if (!student) return;

    const countryId =
      student.country && typeof student.country === "object"
        ? String((student.country as { id: number }).id)
        : student.country || "";

    const stateId =
      student.state && typeof student.state === "object"
        ? String((student.state as { id: number }).id)
        : student.state || "";

    const cityValue =
      student.city && typeof student.city === "object"
        ? (student.city as { location: string }).location || ""
        : student.city || "";

    set({
      formData: {
        name: student.name,
        address: student.address,
        city: cityValue,
        state: stateId,
        country: countryId,
        zipCode: student.zipCode,
        phone: student.phone,
        email: student.email,
        companyName: student.companyName,
        profession: student.profession,
      },
      selectedCountry: countryId,
      selectedState: stateId,
      isCityInputDisabled: !stateId,
      errors: {},
    });
  },

  setFormField: (field, value) =>
    set((state) => ({
      formData: { ...state.formData, [field]: value },
    })),

  setSelectedCountry: (countryId, clearDependents = true) =>
    set((state) => ({
      selectedCountry: countryId,
      formData: {
        ...state.formData,
        country: countryId,
        ...(clearDependents ? { state: "", city: "" } : {}),
      },
      ...(clearDependents
        ? { selectedState: "", isCityInputDisabled: true, states: [] }
        : {}),
    })),

  setSelectedState: (stateId) =>
    set((state) => ({
      selectedState: stateId,
      formData: {
        ...state.formData,
        state: stateId,
        city: "", // clear city when state changes
      },
      isCityInputDisabled: !stateId,
    })),

  setCountries: (countries) => set({ countries }),
  setStates: (states) => set({ states }),
  setIsFetchingStates: (loading) => set({ isFetchingStates: loading }),

  setErrors: (errors) => set({ errors }),

  clearFieldError: (field) =>
    set((state) => {
      const updated = { ...state.errors };
      delete updated[field];
      return { errors: updated };
    }),

  // Resets form state but preserves the countries reference data (already fetched once)
  resetStore: () =>
    set((state) => ({
      ...defaultState,
      countries: state.countries,
    })),
}));
