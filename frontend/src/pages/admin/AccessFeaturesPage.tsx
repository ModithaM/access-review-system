import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  X,
  AlertCircle,
  ChevronDown,
  Tags,
  Check,
  Type,
  AlignLeft,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/admin/Button';
import DataTable, { type Column } from '../../components/admin/DataTable';
import accessFeaturesService, { type AccessFeature } from '../../services/access-features.service';
import GenerateReportButton from '@/components/admin/access-features/GenerateReportButton';
import GenerateReportModal from '@/components/admin/access-features/GenerateReportModal';

const ACCESS_FEATURE_CATEGORIES: AccessFeature['category'][] = [
  'Mobility',
  'Visual',
  'Auditory',
  'Cognitive',
  'Other',
];

const ACCESS_FEATURE_CATEGORIES: AccessFeature['category'][] = [
  'Mobility',
  'Visual',
  'Auditory',
  'Cognitive',
  'Other',
];

export default function AccessFeaturesPage() {
  const [features, setFeatures] = useState<AccessFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | AccessFeature['category']>('All');
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const [isFormCategoryMenuOpen, setIsFormCategoryMenuOpen] = useState(false);
  const formCategoryMenuRef = useRef<HTMLDivElement>(null);

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
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

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

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!categoryMenuRef.current?.contains(event.target as Node)) {
        setIsCategoryMenuOpen(false);
      }

      if (!formCategoryMenuRef.current?.contains(event.target as Node)) {
        setIsFormCategoryMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCategoryMenuOpen(false);
        setIsFormCategoryMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
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
    setIsFormCategoryMenuOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentFeature(null);
    setError(null);
    setIsFormCategoryMenuOpen(false);
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

  const filteredFeatures = features.filter((feature) => {
    const matchesCategory =
      selectedCategory === 'All' || feature.category === selectedCategory;

    return matchesCategory;
  });

  const categoryOptions: Array<'All' | AccessFeature['category']> = [
    'All',
    ...ACCESS_FEATURE_CATEGORIES,
  ];

  const categoryFilter = (
    <div ref={categoryMenuRef} className="relative">
      <motion.button
        type="button"
        whileTap={{ scale: 0.99 }}
        onClick={() => setIsCategoryMenuOpen((open) => !open)}
        className={`group relative flex h-11 min-w-[210px] items-center justify-between gap-3 rounded-2xl border bg-white/95 px-4 text-sm text-gray-900 shadow-[0_8px_24px_rgba(15,23,42,0.06)] outline-none transition-all duration-300 hover:-translate-y-0.5 hover:border-[#7928CA]/25 hover:shadow-[0_12px_30px_rgba(121,40,202,0.10)] focus-visible:border-[#7928CA]/35 focus-visible:shadow-[0_0_0_4px_rgba(121,40,202,0.12),0_14px_32px_rgba(0,112,243,0.10)] dark:border-gray-700 dark:bg-gray-800/95 dark:text-white dark:hover:border-[#38BDF8]/30 dark:hover:shadow-[0_12px_30px_rgba(56,189,248,0.10)] dark:focus-visible:border-[#38BDF8]/40 dark:focus-visible:shadow-[0_0_0_4px_rgba(56,189,248,0.12),0_14px_32px_rgba(56,189,248,0.10)] ${
          isCategoryMenuOpen ? 'border-[#7928CA]/30 shadow-[0_0_0_4px_rgba(121,40,202,0.10),0_14px_32px_rgba(0,112,243,0.10)] dark:border-[#38BDF8]/35 dark:shadow-[0_0_0_4px_rgba(56,189,248,0.12),0_14px_32px_rgba(56,189,248,0.10)]' : 'border-gray-200 dark:border-gray-700'
        }`}
        aria-haspopup="menu"
        aria-expanded={isCategoryMenuOpen}
        aria-label="Filter access features by category"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-linear-to-br from-[#FF0080]/10 via-[#7928CA]/10 to-[#0070F3]/10 text-[#7928CA] transition-colors duration-300 group-hover:from-[#FF0080]/15 group-hover:via-[#7928CA]/15 group-hover:to-[#0070F3]/15 dark:text-[#38BDF8]">
            <Tags className="h-4 w-4" />
          </span>
          <div className="flex min-w-0 flex-col items-start text-left">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
              Category
            </span>
            <span className="truncate font-medium text-gray-900 dark:text-white">
              {selectedCategory === 'All' ? 'All Categories' : selectedCategory}
            </span>
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 dark:text-gray-500 ${
            isCategoryMenuOpen ? 'rotate-180' : ''
          }`}
        />
      </motion.button>

      <AnimatePresence>
        {isCategoryMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute right-0 z-30 mt-3 w-full min-w-[240px] overflow-hidden rounded-2xl border border-gray-200 bg-white/98 p-2 shadow-[0_20px_60px_rgba(15,23,42,0.14)] backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/98"
            role="menu"
            aria-label="Access feature categories"
          >
            <div className="mb-1 px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
              Filter By Category
            </div>
            <div className="space-y-1">
              {categoryOptions.map((category) => {
                const isSelected = selectedCategory === category;
                const label = category === 'All' ? 'All Categories' : category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsCategoryMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7928CA]/30 dark:focus-visible:ring-[#38BDF8]/30 ${
                      isSelected
                        ? 'bg-linear-to-r from-[#FF0080]/8 via-[#7928CA]/10 to-[#0070F3]/8 text-[#7928CA] shadow-[inset_0_0_0_1px_rgba(121,40,202,0.14)] dark:text-[#38BDF8] dark:shadow-[inset_0_0_0_1px_rgba(56,189,248,0.18)]'
                        : 'text-gray-600 hover:bg-linear-to-r hover:from-[#FF0080]/6 hover:via-[#7928CA]/8 hover:to-[#0070F3]/6 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                    }`}
                    role="menuitemradio"
                    aria-checked={isSelected}
                  >
                    <span className="font-medium">{label}</span>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 ${
                        isSelected
                          ? 'bg-linear-to-r from-[#FF0080] via-[#7928CA] to-[#0070F3] text-white shadow-sm'
                          : 'text-transparent'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const surfaceInputClassName =
    'w-full rounded-2xl border border-gray-200 bg-white/95 text-sm text-gray-900 shadow-[0_8px_24px_rgba(15,23,42,0.06)] outline-none transition-all duration-300 placeholder:text-gray-400 hover:border-[#7928CA]/25 hover:shadow-[0_12px_30px_rgba(121,40,202,0.10)] focus:border-[#7928CA]/35 focus:shadow-[0_0_0_4px_rgba(121,40,202,0.12),0_14px_32px_rgba(0,112,243,0.10)] dark:border-gray-700 dark:bg-gray-800/95 dark:text-white dark:placeholder:text-gray-500 dark:hover:border-[#38BDF8]/30 dark:hover:shadow-[0_12px_30px_rgba(56,189,248,0.10)] dark:focus:border-[#38BDF8]/40 dark:focus:shadow-[0_0_0_4px_rgba(56,189,248,0.12),0_14px_32px_rgba(56,189,248,0.10)]';

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
        <div className="flex items-center gap-3">
          <GenerateReportButton onClick={() => setIsReportModalOpen(true)} />
          <Button variant="primary" gradient onClick={() => handleOpenModal()}>
            <Plus size={18} className="mr-2" />
            Add Feature
          </Button>
        </div>
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
          data={filteredFeatures}
          onEdit={(row) => handleOpenModal(row)}
          onDelete={handleDelete}
          searchPlaceholder="Search by feature name..."
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          customFilter={(row: AccessFeature, term) =>
            row.name.toLowerCase().includes(term.trim().toLowerCase())
          }
          hideFilterButton
          toolbarActions={categoryFilter}
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
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[28px] border border-white/60 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.18)] transition-colors dark:border-gray-800/80 dark:bg-gray-900/95"
            >
              <div className="border-b border-gray-100 bg-linear-to-r from-[#FF0080]/[0.03] via-[#7928CA]/[0.04] to-[#0070F3]/[0.03] px-6 py-5 transition-colors dark:border-gray-800 dark:from-[#FF0080]/[0.06] dark:via-[#7928CA]/[0.08] dark:to-[#0070F3]/[0.06]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-[#FF0080]/12 via-[#7928CA]/12 to-[#0070F3]/12 text-[#7928CA] dark:text-[#38BDF8]">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-400 dark:text-gray-500">
                        AccessAble Admin
                      </p>
                      <h3 className="mt-1 text-xl font-bold text-gray-900 transition-colors dark:text-white">
                        {currentFeature ? 'Edit Feature' : 'Add New Feature'}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Keep your accessibility feature catalog polished and consistent.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="rounded-2xl border border-gray-200/80 bg-white/80 p-2.5 text-gray-400 shadow-sm transition-all duration-200 hover:border-[#7928CA]/20 hover:bg-white hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7928CA]/20 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-500 dark:hover:border-[#38BDF8]/20 dark:hover:bg-gray-800 dark:hover:text-gray-300 dark:focus-visible:ring-[#38BDF8]/20"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 p-6">
                {error && isModalOpen && (
                  <div className="flex items-center rounded-2xl border border-red-100 bg-red-50/90 p-3.5 text-sm text-red-600 shadow-sm transition-colors dark:border-red-800/30 dark:bg-red-900/20 dark:text-red-400">
                    <AlertCircle size={16} className="mr-2 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 transition-colors dark:text-gray-300">
                    Feature Name
                  </label>
                  <div className="group relative">
                    <Type className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors duration-200 group-focus-within:text-[#7928CA] dark:text-gray-500 dark:group-focus-within:text-[#38BDF8]" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`${surfaceInputClassName} h-12 pl-11 pr-4`}
                      placeholder="e.g., Wheelchair Ramp"
                    />
                  </div>
                </div>

                <div className="space-y-2" ref={formCategoryMenuRef}>
                  <label className="block text-sm font-medium text-gray-700 transition-colors dark:text-gray-300">
                    Category
                  </label>
                  <div className="relative">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setIsFormCategoryMenuOpen((open) => !open)}
                      className={`group flex h-12 w-full items-center justify-between rounded-2xl border bg-white/95 px-4 text-left text-sm shadow-[0_8px_24px_rgba(15,23,42,0.06)] outline-none transition-all duration-300 hover:border-[#7928CA]/25 hover:shadow-[0_12px_30px_rgba(121,40,202,0.10)] focus-visible:border-[#7928CA]/35 focus-visible:shadow-[0_0_0_4px_rgba(121,40,202,0.12),0_14px_32px_rgba(0,112,243,0.10)] dark:border-gray-700 dark:bg-gray-800/95 dark:hover:border-[#38BDF8]/30 dark:hover:shadow-[0_12px_30px_rgba(56,189,248,0.10)] dark:focus-visible:border-[#38BDF8]/40 dark:focus-visible:shadow-[0_0_0_4px_rgba(56,189,248,0.12),0_14px_32px_rgba(56,189,248,0.10)] ${
                        isFormCategoryMenuOpen
                          ? 'border-[#7928CA]/30 shadow-[0_0_0_4px_rgba(121,40,202,0.10),0_14px_32px_rgba(0,112,243,0.10)] dark:border-[#38BDF8]/35 dark:shadow-[0_0_0_4px_rgba(56,189,248,0.12),0_14px_32px_rgba(56,189,248,0.10)]'
                          : 'border-gray-200'
                      }`}
                      aria-haspopup="menu"
                      aria-expanded={isFormCategoryMenuOpen}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-[#FF0080]/10 via-[#7928CA]/10 to-[#0070F3]/10 text-[#7928CA] dark:text-[#38BDF8]">
                          <Tags className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
                            Selected Category
                          </p>
                          <p className="truncate font-medium text-gray-900 dark:text-white">
                            {formData.category}
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform duration-200 dark:text-gray-500 ${
                          isFormCategoryMenuOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </motion.button>

                    <AnimatePresence>
                      {isFormCategoryMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          className="absolute left-0 right-0 z-30 mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white/98 p-2 shadow-[0_20px_60px_rgba(15,23,42,0.14)] backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/98"
                          role="menu"
                          aria-label="Select feature category"
                        >
                          <div className="space-y-1">
                            {ACCESS_FEATURE_CATEGORIES.map((category) => {
                              const isSelected = formData.category === category;

                              return (
                                <button
                                  key={category}
                                  type="button"
                                  onClick={() => {
                                    setFormData({
                                      ...formData,
                                      category,
                                    });
                                    setIsFormCategoryMenuOpen(false);
                                  }}
                                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7928CA]/30 dark:focus-visible:ring-[#38BDF8]/30 ${
                                    isSelected
                                      ? 'bg-linear-to-r from-[#FF0080]/8 via-[#7928CA]/10 to-[#0070F3]/8 text-[#7928CA] shadow-[inset_0_0_0_1px_rgba(121,40,202,0.14)] dark:text-[#38BDF8] dark:shadow-[inset_0_0_0_1px_rgba(56,189,248,0.18)]'
                                      : 'text-gray-600 hover:bg-linear-to-r hover:from-[#FF0080]/6 hover:via-[#7928CA]/8 hover:to-[#0070F3]/6 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                                  }`}
                                  role="menuitemradio"
                                  aria-checked={isSelected}
                                >
                                  <span className="font-medium">{category}</span>
                                  <span
                                    className={`flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 ${
                                      isSelected
                                        ? 'bg-linear-to-r from-[#FF0080] via-[#7928CA] to-[#0070F3] text-white shadow-sm'
                                        : 'text-transparent'
                                    }`}
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 transition-colors dark:text-gray-300">
                    Description
                  </label>
                  <div className="group relative">
                    <AlignLeft className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-gray-400 transition-colors duration-200 group-focus-within:text-[#7928CA] dark:text-gray-500 dark:group-focus-within:text-[#38BDF8]" />
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={`${surfaceInputClassName} resize-none pl-11 pr-4 pt-3.5 pb-3`}
                      placeholder="Describe the access feature..."
                    />
                  </div>
                </div>

                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-linear-to-r from-white to-[#F8FAFF] px-4 py-3 shadow-sm transition-all duration-300 hover:border-[#7928CA]/20 hover:shadow-[0_12px_30px_rgba(121,40,202,0.08)] dark:border-gray-700 dark:from-gray-800/95 dark:to-gray-900 dark:hover:border-[#38BDF8]/20 dark:hover:shadow-[0_12px_30px_rgba(56,189,248,0.08)]">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Active status
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Visible to reviewers when enabled.
                    </p>
                  </div>
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="peer sr-only"
                    />
                    <div className="h-7 w-12 rounded-full bg-gray-200 transition-all duration-300 peer-checked:bg-linear-to-r peer-checked:from-[#FF0080] peer-checked:via-[#7928CA] peer-checked:to-[#0070F3] peer-focus-visible:ring-4 peer-focus-visible:ring-[#7928CA]/15 dark:bg-gray-700 dark:peer-focus-visible:ring-[#38BDF8]/15" />
                    <div className="absolute left-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-300 peer-checked:translate-x-5" />
                  </div>
                </label>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                    className="rounded-2xl border-gray-200 bg-white/90 px-5 hover:border-[#7928CA]/25 hover:bg-white dark:border-gray-700 dark:bg-gray-800/90"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    gradient
                    disabled={submitting}
                    className="rounded-2xl px-5 shadow-[0_14px_30px_rgba(121,40,202,0.18)] hover:shadow-[0_18px_36px_rgba(121,40,202,0.22)]"
                  >
                    {submitting ? 'Saving...' : currentFeature ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <GenerateReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        features={features}
      />
    </motion.div>
  );
}
