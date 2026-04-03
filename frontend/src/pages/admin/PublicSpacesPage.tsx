import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/admin/Button';
import DataTable, { type Column } from '../../components/admin/DataTable';
import Badge from '../../components/admin/Badge';

const DATA = [
  {
    id: 1,
    name: 'City Mall',
    location: 'Colombo',
    category: 'Shopping',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Central Park',
    location: 'Kandy',
    category: 'Park',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Metro Hub',
    location: 'Galle',
    category: 'Transport',
    status: 'Pending',
  },
];

const COLUMNS: Column[] = [
  {
    key: 'name',
    header: 'Name',
    render: (row) => (
      <span className="font-medium text-gray-900 dark:text-white transition-colors">
        {row.name}
      </span>
    ),
  },
  { key: 'location', header: 'Location' },
  { key: 'category', header: 'Category' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Badge variant={row.status === 'Active' ? 'success' : 'warning'}>{row.status}</Badge>
    ),
  },
];

export default function PublicSpacesPage() {
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
          Add Public Space
        </Button>
      </div>

      <DataTable
        title="All Public Spaces"
        columns={COLUMNS}
        data={DATA}
        onView={(row) => console.log('View', row)}
        onEdit={(row) => console.log('Edit', row)}
        onDelete={(row) => console.log('Delete', row)}
      />
    </motion.div>
  );
}
