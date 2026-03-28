
import { motion } from 'framer-motion';
import DataTable, { type Column } from '../../components/admin/DataTable';
import Badge from '../../components/admin/Badge';
import { Star } from 'lucide-react';

const DATA = [
  { id: 1, user: 'John Doe', space: 'City Mall', rating: 5, status: 'Published', date: '2023-10-24' },
  { id: 2, user: 'Sarah Smith', space: 'Central Park', rating: 4, status: 'Published', date: '2023-10-23' },
  { id: 3, user: 'Mike Johnson', space: 'Metro Hub', rating: 2, status: 'Flagged', date: '2023-10-22' },
];

const COLUMNS: Column[] = [
  { key: 'user', header: 'User', render: (row) => <span className="font-medium text-gray-900">{row.user}</span> },
  { key: 'space', header: 'Public Space' },
  { key: 'rating', header: 'Rating', render: (row) => (
    <div className="flex items-center space-x-1">
      <span className="font-medium">{row.rating}</span>
      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
    </div>
  )},
  { key: 'date', header: 'Date', render: (row) => <span className="text-gray-500">{row.date}</span> },
  { key: 'status', header: 'Status', render: (row) => (
    <Badge variant={row.status === 'Published' ? 'info' : 'danger'}>{row.status}</Badge>
  )}
];

export default function ReviewsPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <DataTable 
        title="Recent Reviews"
        columns={COLUMNS}
        data={DATA}
        onView={(row) => console.log('View', row)}
        onDelete={(row) => console.log('Delete', row)}
      />
    </motion.div>
  );
}
