import { Plus, Lock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Button from '../../components/admin/Button';
import DataTable, { type Column } from '../../components/admin/DataTable';
import Badge from '../../components/admin/Badge';
import UserFormModal from '../../components/admin/users/UserFormModal';
import PasswordModal from '../../components/admin/users/PasswordModal';
import usersService, { type User } from '../../services/users.service';
import { useToast } from '../../hooks/useToast';

export default function UsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const itemsPerPage = 10;

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await usersService.listUsers({ page, items: itemsPerPage });
      setUsers(res.data.result);
      setCurrentPage(res.data.pagination.page);
      setTotalPages(res.data.pagination.pages);
      setTotalUsers(res.data.pagination.count);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message || 'Failed to fetch users';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(1);
  }, []);

  const handleOpenAddModal = () => {
    setSelectedUser(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setIsFormModalOpen(true);
  };

  const handleOpenPasswordModal = (user: User) => {
    setSelectedUser(user);
    setIsPasswordModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedUser(null);
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setSelectedUser(null);
  };

  const handleFormSubmit = async (data: Partial<User>) => {
    try {
      setIsSubmitting(true);
      if (selectedUser?._id) {
        await usersService.updateUser(selectedUser._id, data);
        toast.success(`User ${data.name} updated successfully`);
      }
      handleCloseFormModal();
      await loadUsers(currentPage);
    } catch (err: any) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (password: string) => {
    try {
      setIsSubmitting(true);
      if (selectedUser?._id) {
        await usersService.updatePassword(selectedUser._id, password);
        toast.success('Password updated successfully');
      }
      handleClosePasswordModal();
      await loadUsers(currentPage);
    } catch (err: any) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${user.name} ${user.surname}? This cannot be undone.`,
      )
    ) {
      try {
        setLoading(true);
        await usersService.deleteUser(user._id);
        toast.success('User deleted successfully');
        await loadUsers(currentPage);
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || err.message || 'Failed to delete user';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    }
  };

  const COLUMNS: Column[] = [
    {
      key: 'name',
      header: 'Name',
      render: (row: User) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs transition-colors">
            {row.name.charAt(0)}
          </div>
          <span className="font-medium text-gray-900 dark:text-white transition-colors">
            {row.name} {row.surname}
          </span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (row: User) => (
        <span className="text-gray-500 dark:text-gray-400 transition-colors">{row.email}</span>
      ),
    },
    {
      key: 'userType',
      header: 'Role',
      render: (row: User) => {
        const roleVariants: Record<string, 'warning' | 'info' | 'default' | 'success' | 'danger'> =
          {
            admin: 'warning',
            moderator: 'info',
            guest: 'default',
          };
        return (
          <Badge variant={roleVariants[row.userType?.toLowerCase()] || 'default'}>
            {row.userType || 'User'}
          </Badge>
        );
      },
    },
    {
      key: 'enabled',
      header: 'Status',
      render: (row: User) => (
        <Badge variant={row.enabled ? 'success' : 'danger'}>
          {row.enabled ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: User) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenEditModal(row)}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            title="Edit user"
          >
            Edit
          </button>
          <button
            onClick={() => handleOpenPasswordModal(row)}
            className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors flex items-center gap-1"
            title="Reset password"
          >
            <Lock size={16} />
            Reset
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            title="Delete user"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
          <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-medium text-red-900 dark:text-red-300">Error</h3>
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Users ({totalUsers})
          </h2>
        </div>
        <Button variant="primary" gradient onClick={handleOpenAddModal}>
          <Plus size={18} className="mr-2" />
          Add User
        </Button>
      </div>

      {loading && users.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
          </div>
        </div>
      ) : (
        <>
          <DataTable title="Users Management" columns={COLUMNS} data={users} />

          {totalPages > 1 && (
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages} • Showing {users.length} of {totalUsers} users
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => loadUsers(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft size={16} />
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => loadUsers(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        user={selectedUser || undefined}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={handleClosePasswordModal}
        user={selectedUser}
        onSubmit={handlePasswordSubmit}
        isSubmitting={isSubmitting}
      />
    </motion.div>
  );
}
