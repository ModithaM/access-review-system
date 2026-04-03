import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/admin/Button';
import DataTable, { type Column } from '../../components/admin/DataTable';
import Badge from '../../components/admin/Badge';

const DATA = [
  {
    id: 1,
    name: 'Alice Admin',
    email: 'alice@accessify.com',
    role: 'Admin',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Bob Reviewer',
    email: 'bob@example.com',
    role: 'User',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Charlie Mod',
    email: 'charlie@accessify.com',
    role: 'Moderator',
    status: 'Active',
  },
  {
    id: 4,
    name: 'Dave Suspended',
    email: 'dave@example.com',
    role: 'User',
    status: 'Suspended',
  },
];

const COLUMNS: Column[] = [
  {
    key: 'name',
    header: 'Name',
    render: (row) => (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs transition-colors">
          {row.name.charAt(0)}
        </div>
        <span className="font-medium text-gray-900 dark:text-white transition-colors">
          {row.name}
        </span>
      </div>
    ),
  },
  {
    key: 'email',
    header: 'Email',
    render: (row) => (
      <span className="text-gray-500 dark:text-gray-400 transition-colors">{row.email}</span>
    ),
  },
  {
    key: 'role',
    header: 'Role',
    render: (row) => (
      <Badge
        variant={row.role === 'Admin' ? 'warning' : row.role === 'Moderator' ? 'info' : 'default'}
      >
        {row.role}
      </Badge>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Badge variant={row.status === 'Active' ? 'success' : 'danger'}>{row.status}</Badge>
    ),
  },
];

export default function UsersPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-end">
        <Button variant="primary" gradient>
          <Plus size={18} className="mr-2" />
          Add User
        </Button>
      </div>

      <DataTable
        title="Users Management"
        columns={COLUMNS}
        data={DATA}
        onEdit={(row) => console.log('Edit', row)}
        onDelete={(row) => console.log('Delete', row)}
      />
    </motion.div>
  );
}
