import { useState } from 'react';
import { AlertCircle, ChevronDown, Check } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Modal from '../Modal';
import Button from '../Button';
import type { User } from '@/services/users.service.ts';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
  onSubmit: (data: Partial<User>) => Promise<void>;
  isSubmitting?: boolean;
}

const ROLES = ['admin', 'user', 'guest'] as const;

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  name: Yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  surname: Yup.string()
    .min(2, 'Surname must be at least 2 characters')
    .required('Surname is required'),
  userType: Yup.string()
    .oneOf(['admin', 'user', 'guest'], 'Invalid role')
    .required('Role is required'),
});

export default function UserFormModal({
  isOpen,
  onClose,
  user,
  onSubmit,
  isSubmitting = false,
}: UserFormModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: user?.email || '',
      name: user?.name || '',
      surname: user?.surname || '',
      userType: user?.userType || 'user',
    },
    validationSchema,
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        setError(null);
        await onSubmit({
          email: values.email,
          name: values.name,
          surname: values.surname,
          userType: values.userType,
        });
        formik.resetForm();
      } catch (err: any) {
        setError(err?.response?.data?.message || err.message || 'An error occurred');
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    setError(null);
    setIsRoleMenuOpen(false);
    onClose();
  };

  const getRoleLabel = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'from-orange-500 to-red-500';
      case 'user':
        return 'from-blue-500 to-cyan-500';
      case 'guest':
        return 'from-gray-500 to-slate-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={user ? 'Edit User' : 'Add New User'}
      size="md"
    >
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-2">
            <AlertCircle
              className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
              size={18}
            />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            {...formik.getFieldProps('email')}
            disabled={!!user}
            className={`w-full px-4 py-2 rounded-lg border transition-colors ${
              formik.touched.email && formik.errors.email
                ? 'border-red-300 dark:border-red-600'
                : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
              formik.touched.email && formik.errors.email
                ? 'focus:ring-red-500'
                : 'focus:ring-blue-500'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formik.errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            First Name
          </label>
          <input
            type="text"
            {...formik.getFieldProps('name')}
            className={`w-full px-4 py-2 rounded-lg border transition-colors ${
              formik.touched.name && formik.errors.name
                ? 'border-red-300 dark:border-red-600'
                : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
              formik.touched.name && formik.errors.name
                ? 'focus:ring-red-500'
                : 'focus:ring-blue-500'
            }`}
          />
          {formik.touched.name && formik.errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formik.errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Last Name
          </label>
          <input
            type="text"
            {...formik.getFieldProps('surname')}
            className={`w-full px-4 py-2 rounded-lg border transition-colors ${
              formik.touched.surname && formik.errors.surname
                ? 'border-red-300 dark:border-red-600'
                : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
              formik.touched.surname && formik.errors.surname
                ? 'focus:ring-red-500'
                : 'focus:ring-blue-500'
            }`}
          />
          {formik.touched.surname && formik.errors.surname && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formik.errors.surname}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Role
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className={`w-full px-4 py-2 rounded-lg border transition-colors flex items-center justify-between ${
                formik.touched.userType && formik.errors.userType
                  ? 'border-red-300 dark:border-red-600'
                  : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                formik.touched.userType && formik.errors.userType
                  ? 'focus:ring-red-500'
                  : 'focus:ring-blue-500'
              }`}
            >
              <span className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full bg-gradient-to-r ${getRoleColor(formik.values.userType)}`}
                />
                {getRoleLabel(formik.values.userType)}
              </span>
              <ChevronDown
                size={18}
                className={`transition-transform ${isRoleMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isRoleMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10">
                {ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      formik.setFieldValue('userType', role);
                      setIsRoleMenuOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      role === formik.values.userType ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full bg-gradient-to-r ${getRoleColor(role)}`}
                      />
                      {getRoleLabel(role)}
                    </span>
                    {role === formik.values.userType && (
                      <Check size={18} className="text-blue-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          {formik.touched.userType && formik.errors.userType && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formik.errors.userType}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            gradient
            disabled={isSubmitting || !formik.isValid}
          >
            {isSubmitting ? 'Saving...' : user ? 'Update User' : 'Add User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
