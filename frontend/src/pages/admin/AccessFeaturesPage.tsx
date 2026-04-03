import React, { useState, useEffect } from 'react';
import { Plus, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/admin/Button';
import DataTable, { type Column } from '../../components/admin/DataTable';
import accessFeaturesService, { type AccessFeature } from '../../services/access-features.service';

export default function AccessFeaturesPage() {
  const [features, setFeatures] = useState<AccessFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<AccessFeature | null>(null);
  const [formData, setFormData] = useState<Omit<AccessFeature, '_id'>>({
    name: '',
    description: '',
    category: 'Mobility',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const res = await accessFeaturesService.getAllAccessFeatures();
      setFeatures(res.data.data);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to fetch features');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const handleOpenModal = (feature?: AccessFeature) => {
    if (feature) {
      setCurrentFeature(feature);
      setFormData({
        name: feature.name,
        description: feature.description,
        category: feature.category,
        isActive: feature.isActive,
      });
    } else {
      setCurrentFeature(null);
      setFormData({
        name: '',
        description: '',
        category: 'Mobility',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentFeature(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      setError('Name and description are required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (currentFeature?._id) {
        await accessFeaturesService.updateAccessFeature(currentFeature._id, formData);
      } else {
        await accessFeaturesService.createAccessFeature(formData);
      }

      handleCloseModal();
      await fetchFeatures();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row: AccessFeature) => {
    if (window.confirm(`Are you sure you want to delete "${row.name}"? This cannot be undone.`)) {
      try {
        setLoading(true);
        await accessFeaturesService.deleteAccessFeature(row._id!);
        await fetchFeatures();
      } catch (err: any) {
        setError(err?.response?.data?.message || err.message || 'Failed to delete feature');
        setLoading(false);
      }
    }
  };

  const COLUMNS: Column[] = [
    {
      key: 'name',
      header: 'Feature Name',
      render: (row: AccessFeature) => (
        <span className="font-medium text-gray-900 dark:text-white transition-colors">
          {row.name}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (row: AccessFeature) => (
        <span className="text-gray-600 dark:text-gray-300 transition-colors">{row.category}</span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (row: AccessFeature) => (
        <span
          className="text-gray-500 dark:text-gray-400 truncate max-w-[250px] inline-block transition-colors"
          title={row.description}
        >
          {row.description}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (row: AccessFeature) => (
        <span
          className={`px-2 py-1 text-xs rounded-full font-medium transition-colors ${row.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}
        >
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 relative"
    >
      <div className="flex justify-between items-center">
        <div>
          {error && !isModalOpen && (
            <div className="text-red-500 dark:text-red-400 text-sm flex items-center bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg border border-red-100 dark:border-red-800/30 transition-colors">
              <AlertCircle size={16} className="mr-2 shrink-0" />
              {error}
            </div>
          )}
        </div>
        <Button variant="primary" gradient onClick={() => handleOpenModal()}>
          <Plus size={18} className="mr-2" />
          Add Feature
        </Button>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center text-gray-500 dark:text-gray-400 transition-colors">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-500 mx-auto mb-4"></div>
          Loading access features...
        </div>
      ) : (
        <DataTable
          title="Access Features"
          columns={COLUMNS}
          data={features}
          onEdit={(row) => handleOpenModal(row)}
          onDelete={handleDelete}
        />
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-40"
              onClick={handleCloseModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl z-50 overflow-hidden transition-colors"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center transition-colors">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">
                  {currentFeature ? 'Edit Feature' : 'Add New Feature'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && isModalOpen && (
                  <div className="text-red-600 dark:text-red-400 text-sm flex items-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800/30 transition-colors">
                    <AlertCircle size={16} className="mr-2 shrink-0" />
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                    Feature Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 transition-all text-sm text-gray-900 dark:text-white"
                    placeholder="e.g., Wheelchair Ramp"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 transition-all text-sm text-gray-900 dark:text-white"
                  >
                    <option value="Mobility">Mobility</option>
                    <option value="Visual">Visual</option>
                    <option value="Auditory">Auditory</option>
                    <option value="Cognitive">Cognitive</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                    Description
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 transition-all text-sm text-gray-900 dark:text-white resize-none"
                    placeholder="Describe the access feature..."
                  />
                </div>

                <div className="flex items-center pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2 transition-colors"
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    Active (visible to reviewers)
                  </label>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                  <Button type="button" variant="outline" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={submitting}>
                    {submitting ? 'Saving...' : currentFeature ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
