import { MapPinned, Star, UserRound, Accessibility } from 'lucide-react';
import { motion } from 'framer-motion';
import SummaryCard from '../../components/admin/SummaryCard';
import DataTable, { type Column } from '../../components/admin/DataTable';
import Badge from '../../components/admin/Badge';

const PUBLIC_SPACES_DATA = [
  {
    id: 1,
    name: 'City Mall',
    location: 'Colombo',
    score: 4.5,
    reviews: 120,
    status: 'Active',
  },
  {
    id: 2,
    name: 'Central Park',
    location: 'Kandy',
    score: 4.8,
    reviews: 98,
    status: 'Active',
  },
  {
    id: 3,
    name: 'Metro Hub',
    location: 'Galle',
    score: 4.2,
    reviews: 76,
    status: 'Pending',
  },
];

const COLUMNS: Column[] = [
  {
    key: 'name',
    header: 'Name',
    render: (row) => <span className="font-medium text-gray-900 dark:text-white">{row.name}</span>,
  },
  {
    key: 'location',
    header: 'Location',
    render: (row) => <span className="text-gray-700 dark:text-gray-300">{row.location}</span>,
  },
  {
    key: 'score',
    header: 'Accessibility Score',
    render: (row) => (
      <span className="text-gray-900 dark:text-white font-medium">{row.score} / 5</span>
    ),
  },
  {
    key: 'reviews',
    header: 'Reviews',
    render: (row) => <span className="text-gray-700 dark:text-gray-300">{row.reviews}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Badge variant={row.status === 'Active' ? 'success' : 'warning'}>{row.status}</Badge>
    ),
  },
];

const RECENT_ACTIVITY = [
  {
    id: 1,
    user: 'John Doe',
    action: 'left a review on City Mall',
    time: '2 hours ago',
    avatar: 'J',
  },
  {
    id: 2,
    user: 'Sarah Smith',
    action: 'added a new space Metro Hub',
    time: '5 hours ago',
    avatar: 'S',
  },
  {
    id: 3,
    user: 'Mike Johnson',
    action: 'updated accessibility features',
    time: '1 day ago',
    avatar: 'M',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="Total Public Spaces" value={120} icon={MapPinned} delay={0.1} />
        <SummaryCard title="Total Reviews" value={860} icon={Star} delay={0.2} />
        <SummaryCard title="Total Users" value={540} icon={UserRound} delay={0.3} />
        <SummaryCard title="Total Access Features" value={35} icon={Accessibility} delay={0.4} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Data Table Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="xl:col-span-2"
        >
          <DataTable
            title="Recent Public Spaces"
            columns={COLUMNS}
            data={PUBLIC_SPACES_DATA}
            onView={(row) => console.log('View', row)}
            onEdit={(row) => console.log('Edit', row)}
            onDelete={(row) => console.log('Delete', row)}
          />
        </motion.div>

        {/* Recent Activity Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white dark:bg-gray-900 transition-colors duration-300 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-800"
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
            Recent Activity
          </h2>
          <div className="space-y-6">
            {RECENT_ACTIVITY.map((activity) => (
              <div key={activity.id} className="flex gap-4 group cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0 group-hover:bg-brand-gradient group-hover:text-white transition-all duration-300">
                  {activity.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-gray-100 truncate transition-colors duration-300">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {activity.user}
                    </span>{' '}
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
