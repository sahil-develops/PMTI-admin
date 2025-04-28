'use client'
import React, { useState, useEffect } from 'react';
import { UserPlus, AlertCircle, Trash2, X,Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Student {
  id: string;
  name: string;
  email: string;
  companyName: string;
  profession: string;
  city: string;
  state: string;
  active: boolean;
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  student: Student | null;
}

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Modal = ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        {children}
      </div>
    </div>
  );
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, student }: ConfirmModalProps) => {
  return (
    <Modal isOpen={isOpen}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium text-gray-900">Confirm Delete</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-2">
        <p className="text-sm text-gray-500">
          Are you sure you want to delete this student?
        </p>
        {student && (
          <div className="mt-2 bg-gray-50 p-3 rounded-md">
            <p className="text-sm font-medium text-gray-900">{student.name}</p>
            <p className="text-sm text-gray-500">{student.email}</p>
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </Modal>
  );
};

const SuccessModal = ({ isOpen, onClose }: SuccessModalProps) => {
  return (
    <Modal isOpen={isOpen}>
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mt-2 text-lg font-medium text-gray-900">Student Successfully Deleted</h3>
        <div className="mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-zinc-800 rounded-md hover:bg-zinc-900"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

const TableShimmer = () => (
  <tbody className="bg-white divide-y divide-gray-200">
    {[...Array(5)].map((_, index) => (
      <tr key={index}>
        {[...Array(7)].map((_, cellIndex) => (
          <td key={cellIndex} className="px-6 py-4 whitespace-nowrap">
            <div className="animate-pulse flex">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </td>
        ))}
      </tr>
    ))}
  </tbody>
);

const EmptyState = () => (
  <tr>
    <td colSpan={7} className="px-6 py-12 text-center">
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="relative rounded-full bg-gray-100 p-6">
          <UserPlus className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-sm font-medium text-gray-900">No students found</h3>
        <p className="text-sm text-gray-500">Get started by adding a new student.</p>
      </div>
    </td>
  </tr>
);

const ErrorState = ({ message }: { message: string }) => (
  <tr>
    <td colSpan={7} className="px-6 py-12 text-center">
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="relative rounded-full bg-red-100 p-6">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-sm font-medium text-gray-900">Something went wrong</h3>
        <p className="text-sm text-red-500">{message}</p>
      </div>
    </td>
  </tr>
);

const StudentTable = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`https://61ab-2405-201-a40c-488f-c543-4559-5d8c-8c9b.ngrok-free.app/students`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setStudents(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setError(error instanceof Error ? error.message : 'Server Error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDeleteClick = (student: Student) => {
    setSelectedStudent(student);
    setShowConfirmModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStudent) return;

    try {
      setDeletingId(selectedStudent.id);
      const response = await fetch(`https://61ab-2405-201-a40c-488f-c543-4559-5d8c-8c9b.ngrok-free.app/students/${selectedStudent.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setShowConfirmModal(false);
        setShowSuccessModal(true);
        // Refresh the student list
        await fetchStudents();
      } else {
        throw new Error(data.error || 'Failed to delete student');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete student. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-0">
      <div className="sm:flex sm:items-center py-6">
        <div className="sm:flex-auto">
          <h2 className="text-xl font-semibold text-gray-900">Students</h2>
          <p className="mt-2 text-sm text-gray-700">
            A list of all students in the system including their details.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0">
          <button 
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white text-sm font-medium rounded-md hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 transition-colors"
            onClick={() => router.push("/students")}
          >
            <UserPlus className="h-4 w-4" />
            Add Student
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto pb-40">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profession
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            {loading ? (
              <TableShimmer />
            ) : error ? (
              <tbody>
                <ErrorState message={error} />
              </tbody>
            ) : students.length === 0 ? (
              <tbody>
                <EmptyState />
              </tbody>
            ) : (
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr 
                    key={student.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.companyName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.profession}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {`${student.city}, ${student.state}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        student.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                        onClick={() => handleDeleteClick(student)}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        disabled={deletingId === student.id}
                      >
                        {deletingId === student.id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleDeleteConfirm}
        student={selectedStudent}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
};

export default StudentTable;