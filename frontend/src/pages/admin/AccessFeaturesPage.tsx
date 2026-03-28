
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/admin/Button';
import DataTable, { type Column } from '../../components/admin/DataTable';

const DATA = [
  { id: 1, name: 'Wheelchair Ramp', category: 'Physical Access', locations: 45 },
  { id: 2, name: 'Braille Signage', category: 'Sensory Access', locations: 12 },
  { id: 3, name: 'Elevator', category: 'Physical Access', locations: 30 },
  { id: 4, name: 'Accessible Parking', category: 'Physical Access', locations: 80 },
];

const COLUMNS: Column[] = [
  { key: 'name', header: 'Feature Name', render: (row) => <span className="font-medium text-gray-900">{row.name}</span> },
  { key: 'category', header: 'Category', render: (row) => <span className="text-gray-600">{row.category}</span> },
  { key: 'locations', header: 'Used in Locations' }
];

export default function AccessFeaturesPage() {
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
          Add Feature
        </Button>
      </div>

      <DataTable 
        title="Access Features"
        columns={COLUMNS}
        data={DATA}
        onEdit={(row) => console.log('Edit', row)}
        onDelete={(row) => console.log('Delete', row)}
      />
    </motion.div>
  );
}
