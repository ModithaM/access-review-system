import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Download,
  Loader2,
  X,
  MapPin,
  Tag,
  FileText,
  Image,
  Navigation,
  ListChecks,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import Button from '../../components/admin/Button';
import DataTable, { type Column } from '../../components/admin/DataTable';
import accessFeaturesService, { type AccessFeature } from '../../services/access-features.service';
import publicSpaceService from '../../services/public-space.service';
import { useToast } from '../../hooks/useToast';
import type { PublicSpace, SpaceCategory } from '../../types/publicSpace.type';

// types
type ModalMode = 'add' | 'edit' | 'view' | null;
type FeatureCategoryFilter = AccessFeature['category'] | 'All';

interface FormValues {
  name: string;
  category: SpaceCategory;
  address: string;
  lat: string;
  lng: string;
  imageUrl: string;
  description: string;
  accessFeatures: string[];
}

const CATEGORIES: SpaceCategory[] = ['Mall', 'Park', 'Hospital', 'Station', 'Other'];
const FEATURE_CATEGORY_OPTIONS: FeatureCategoryFilter[] = [
  'All',
  'Mobility',
  'Visual',
  'Auditory',
  'Cognitive',
  'Other',
];

const CATEGORY_COLORS: Record<SpaceCategory, string> = {
  Mall: 'text-purple-400',
  Park: 'text-green-400',
  Hospital: 'text-red-400',
  Station: 'text-blue-400',
  Other: 'text-gray-400',
};

//Validations
const validationSchema = Yup.object({
  name: Yup.string()
    .required('Space name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  category: Yup.string().required('Category is required').oneOf(CATEGORIES, 'Invalid category'),
  address: Yup.string()
    .required('Address is required')
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must not exceed 200 characters')
    .trim(),
  lat: Yup.number()
    .typeError('Latitude must be a number')
    .required('Latitude is required')
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  lng: Yup.number()
    .typeError('Longitude must be a number')
    .required('Longitude is required')
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  imageUrl: Yup.string().url('Must be a valid URL').optional(),
  description: Yup.string().max(500, 'Description must not exceed 500 characters').optional(),
  accessFeatures: Yup.array().of(Yup.string().trim()),
});

const blankValues = (): FormValues => ({
  name: '',
  category: 'Mall',
  address: '',
  lat: '',
  lng: '',
  imageUrl: '',
  description: '',
  accessFeatures: [],
});

const spaceToFormValues = (space: PublicSpace): FormValues => ({
  name: space.name,
  category: space.category,
  address: space.locationDetails.address,
  lat: String(space.locationDetails.coordinates.lat),
  lng: String(space.locationDetails.coordinates.lng),
  imageUrl: space.imageUrl ?? '',
  description: space.description ?? '',
  accessFeatures: space.accessFeatures?.map((feature) => feature._id) ?? [],
});

//PDF Download───
function downloadPDF(spaces: PublicSpace[]) {
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(16);
  doc.text('Public Spaces Directory', 14, 16);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 23);

  autoTable(doc, {
    startY: 28,
    head: [['#', 'Name', 'Category', 'Address', 'Latitude', 'Longitude', 'Description']],
    body: spaces.map((s, i) => [
      i + 1,
      s.name,
      s.category,
      s.locationDetails.address,
      s.locationDetails.coordinates.lat,
      s.locationDetails.coordinates.lng,
      s.description ?? '—',
    ]),
    headStyles: { fillColor: [139, 92, 246] },
    alternateRowStyles: { fillColor: [245, 245, 250] },
    styles: { fontSize: 9 },
  });

  doc.save('public-spaces.pdf');
}

//Shared input
const inputCls = (invalid: boolean) =>
  `w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 transition-all duration-200
   placeholder:text-gray-400 hover:bg-white focus:bg-white focus:outline-none focus:ring-2
   dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500
   dark:hover:bg-gray-700 dark:focus:bg-gray-800
   focus:ring-[#7928CA]/20 focus:border-[#7928CA]
   ${invalid ? 'border-red-300 focus:border-red-400 focus:ring-red-200 dark:border-red-500/60' : 'border-gray-200'}`;

const featurePickerInputCls =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 ' +
  'transition-all duration-200 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 ' +
  'focus:ring-[#7928CA]/20 focus:border-[#7928CA] dark:border-gray-700 dark:bg-gray-800 ' +
  'dark:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-800';

export default function PublicSpacesPage() {
  const { success: showSuccess, error: showError } = useToast();

  const [spaces, setSpaces] = useState<PublicSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedSpace, setSelectedSpace] = useState<PublicSpace | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PublicSpace | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [featureCatalog, setFeatureCatalog] = useState<AccessFeature[]>([]);
  const [featureLoading, setFeatureLoading] = useState(true);
  const [selectedFeatureCategory, setSelectedFeatureCategory] =
    useState<FeatureCategoryFilter>('All');

  //  Fetch all spaces
  const fetchSpaces = useCallback(async () => {
    try {
      setLoading(true);
      const data = await publicSpaceService.getAllPublicSpaces();
      setSpaces(data);
    } catch {
      showError('Failed to load public spaces.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpaces();
  }, [fetchSpaces]);

  const fetchAccessFeatures = useCallback(async () => {
    try {
      setFeatureLoading(true);
      const response = await accessFeaturesService.getAllAccessFeatures();
      setFeatureCatalog(response.data.data);
    } catch {
      showError('Failed to load access features.');
    } finally {
      setFeatureLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccessFeatures();
  }, [fetchAccessFeatures]);

  const formik = useFormik<FormValues>({
    initialValues: blankValues(),
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      const payload = {
        name: values.name.trim(),
        category: values.category,
        locationDetails: {
          address: values.address.trim(),
          coordinates: {
            lat: parseFloat(values.lat),
            lng: parseFloat(values.lng),
          },
        },
        imageUrl: values.imageUrl.trim() || undefined,
        description: values.description.trim() || undefined,
        accessFeatures: values.accessFeatures,
      };

      try {
        if (modalMode === 'add') {
          await publicSpaceService.createPublicSpace(payload);
          showSuccess('Public space created successfully!');
        } else if (modalMode === 'edit' && selectedSpace) {
          await publicSpaceService.updatePublicSpace(selectedSpace._id, payload);
          showSuccess('Public space updated successfully!');
        }
        closeModal();
        fetchSpaces();
      } catch (err) {
        const e = err as { response?: { data?: { message?: string } } };
        showError(e.response?.data?.message ?? 'Something went wrong. Please try again.');
      }
    },
  });

  const openAdd = () => {
    formik.resetForm({ values: blankValues() });
    setSelectedFeatureCategory('All');
    setSelectedSpace(null);
    setModalMode('add');
  };

  const openEdit = (space: PublicSpace) => {
    formik.resetForm({ values: spaceToFormValues(space) });
    setSelectedFeatureCategory('All');
    setSelectedSpace(space);
    setModalMode('edit');
  };

  const openView = (space: PublicSpace) => {
    setSelectedSpace(space);
    setModalMode('view');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedSpace(null);
    setSelectedFeatureCategory('All');
    formik.resetForm();
  };

  // Delete
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await publicSpaceService.deletePublicSpace(deleteTarget._id);
      showSuccess('Public space deleted successfully!');
      setDeleteTarget(null);
      fetchSpaces();
    } catch {
      showError('Failed to delete public space.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Table columns
  const columns: Column[] = [
    {
      key: 'name',
      header: 'Name',
      render: (row) => <span className="font-medium text-white">{row.name}</span>,
    },
    {
      key: 'locationDetails',
      header: 'Address',
      render: (row) => (
        <span className="text-gray-300 max-w-50 truncate block">{row.locationDetails.address}</span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (row: PublicSpace) => (
        <span className={`font-medium ${CATEGORY_COLORS[row.category]}`}>{row.category}</span>
      ),
    },
    {
      key: 'coordinates',
      header: 'Coordinates',
      render: (row) => (
        <span className="font-mono text-xs text-gray-400">
          {row.locationDetails.coordinates.lat.toFixed(4)},{' '}
          {row.locationDetails.coordinates.lng.toFixed(4)}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (row) => (
        <span className="text-gray-400 text-xs max-w-40 truncate block">
          {row.description || '—'}
        </span>
      ),
    },
    {
      key: 'accessFeatures',
      header: 'Access Features',
      render: (row: PublicSpace) => {
        const features = row.accessFeatures ?? [];

        if (features.length === 0) {
          return <span className="text-gray-500 text-xs">None selected</span>;
        }

        const featureList = features.map((feature) => feature.name).join(', ');

        return (
          <span className="text-gray-300 text-xs max-w-56 truncate block" title={featureList}>
            {featureList}
          </span>
        );
      },
    },
  ];

  const fieldErr = (k: keyof FormValues) =>
    formik.touched[k] && formik.errors[k] ? formik.errors[k] : undefined;

  const isInvalid = (k: keyof FormValues) => !!(formik.touched[k] && formik.errors[k]);

  const toggleFeatureSelection = (featureId: string) => {
    const isSelected = formik.values.accessFeatures.includes(featureId);
    const nextSelected = isSelected
      ? formik.values.accessFeatures.filter((id) => id !== featureId)
      : [...formik.values.accessFeatures, featureId];

    formik.setFieldValue('accessFeatures', nextSelected);
  };

  const filteredFeatureCatalog = featureCatalog.filter(
    (feature) =>
      selectedFeatureCategory === 'All' || feature.category === selectedFeatureCategory,
  );

  const selectedFeatureDetails = formik.values.accessFeatures
    .map((featureId) => featureCatalog.find((feature) => feature._id === featureId))
    .filter((feature): feature is AccessFeature & { _id: string } => Boolean(feature?._id));

  //PDF download button (passed as toolbarActions to DataTable)
  const pdfButton = (
    <button
      onClick={() => downloadPDF(spaces)}
      aria-label="Download PDF"
      title="Download as PDF"
      className="p-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white
                 transition-colors flex items-center gap-1.5 text-xs"
    >
      <Download size={14} />
      <span className="hidden sm:inline">PDF</span>
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="space-y-6"
    >
      {/* Top bar  */}
      <div className="flex justify-end">
        <Button variant="primary" gradient onClick={openAdd}>
          <Plus size={16} className="mr-1.5" />
          Add Public Space
        </Button>
      </div>

      {/* Loading skeleton */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-10 rounded-lg bg-gray-700/50 animate-pulse"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      ) : (
        /* DataTable */
        <DataTable
          title="All Public Spaces"
          columns={columns}
          data={spaces}
          onView={(row) => openView(row as PublicSpace)}
          onEdit={(row) => openEdit(row as PublicSpace)}
          onDelete={(row) => setDeleteTarget(row as PublicSpace)}
          toolbarActions={pdfButton}
        />
      )}

      {/* Add/EDIT Modal */}
      <AnimatePresence>
        {(modalMode === 'add' || modalMode === 'edit') && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={closeModal}
            />

            {/* Modal panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="relative z-10 w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-8 pb-4 pt-8 dark:border-gray-800 md:px-10">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                  {modalMode === 'add' ? 'Add New Public Space' : 'Edit Public Space'}
                </h2>
                <button
                  onClick={closeModal}
                  className="rounded-full p-2 text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={formik.handleSubmit} className="space-y-6 px-8 py-8 md:px-10 md:py-10">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Space Name */}
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Space Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Tag
                        size={14}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        {...formik.getFieldProps('name')}
                        placeholder="e.g., City Mall"
                        className={`${inputCls(isInvalid('name'))} pl-11`}
                      />
                    </div>
                    {fieldErr('name') && (
                      <p className="mt-1 text-xs text-red-400">{fieldErr('name')}</p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Category <span className="text-red-400">*</span>
                    </label>
                    <select
                      {...formik.getFieldProps('category')}
                      className={inputCls(isInvalid('category'))}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                          {cat}
                        </option>
                      ))}
                    </select>
                    {fieldErr('category') && (
                      <p className="mt-1 text-xs text-red-400">{fieldErr('category')}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="lg:col-span-2">
                    <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Address <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <MapPin
                        size={14}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        {...formik.getFieldProps('address')}
                        placeholder="e.g., No. 01, Galle Road, Colombo 03"
                        className={`${inputCls(isInvalid('address'))} pl-11`}
                      />
                    </div>
                    {fieldErr('address') && (
                      <p className="mt-1 text-xs text-red-400">{fieldErr('address')}</p>
                    )}
                  </div>

                  {/* Coordinates row */}
                  <div className="grid grid-cols-2 gap-4 lg:col-span-2">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Latitude <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Navigation
                          size={14}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="number"
                          step="any"
                          {...formik.getFieldProps('lat')}
                          placeholder="6.9271"
                          className={`${inputCls(isInvalid('lat'))} pl-11`}
                        />
                      </div>
                      {fieldErr('lat') && (
                        <p className="mt-1 text-xs text-red-400">{fieldErr('lat')}</p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Longitude <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Navigation
                          size={14}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 rotate-90 text-gray-400"
                        />
                        <input
                          type="number"
                          step="any"
                          {...formik.getFieldProps('lng')}
                          placeholder="79.8612"
                          className={`${inputCls(isInvalid('lng'))} pl-11`}
                        />
                      </div>
                      {fieldErr('lng') && (
                        <p className="mt-1 text-xs text-red-400">{fieldErr('lng')}</p>
                      )}
                    </div>
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Image URL <span className="text-xs font-normal text-gray-500">(optional)</span>
                    </label>
                    <div className="relative">
                      <Image
                        size={14}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="url"
                        {...formik.getFieldProps('imageUrl')}
                        placeholder="https://example.com/image.jpg"
                        className={`${inputCls(isInvalid('imageUrl'))} pl-11`}
                      />
                    </div>
                    {fieldErr('imageUrl') && (
                      <p className="mt-1 text-xs text-red-400">{fieldErr('imageUrl')}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Description{' '}
                      <span className="text-xs font-normal text-gray-500">
                        ({formik.values.description.length}/500, optional)
                      </span>
                    </label>
                    <div className="relative">
                      <FileText
                        size={14}
                        className="pointer-events-none absolute left-4 top-3.5 text-gray-400"
                      />
                      <textarea
                        rows={3}
                        {...formik.getFieldProps('description')}
                        placeholder="Brief description of the space..."
                        className={`${inputCls(isInvalid('description'))} resize-none pl-11`}
                      />
                    </div>
                    {fieldErr('description') && (
                      <p className="mt-1 text-xs text-red-400">{fieldErr('description')}</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Access Features
                    </label>
                    <span className="text-sm text-gray-400 dark:text-gray-500">
                      {formik.values.accessFeatures.length} selected
                    </span>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/60">
                    <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <ListChecks size={14} className="mt-0.5 shrink-0 text-[#0070F3]" />
                      <p>Filter by category, then add the relevant accessibility features.</p>
                    </div>

                    {featureLoading ? (
                      <div className="flex items-center gap-2 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <Loader2 size={14} className="animate-spin text-[#0070F3]" />
                        Loading access features...
                      </div>
                    ) : featureCatalog.length === 0 ? (
                      <p className="mt-4 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-4 text-center text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500">
                        No access features have been created yet.
                      </p>
                    ) : (
                      <div className="mt-4 space-y-4">
                        <div className="flex flex-col gap-3 md:flex-row">
                          <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Category
                            </label>
                            <select
                              value={selectedFeatureCategory}
                              onChange={(e) =>
                                setSelectedFeatureCategory(
                                  e.target.value as FeatureCategoryFilter,
                                )
                              }
                              className={`${featurePickerInputCls} min-w-[220px]`}
                            >
                              {FEATURE_CATEGORY_OPTIONS.map((category) => (
                                <option
                                  key={category}
                                  value={category}
                                  className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"
                                >
                                  {category === 'All' ? 'All categories' : category}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex-1">
                            <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Access Feature
                            </label>
                            <select
                              value=""
                              onChange={(e) => {
                                const featureId = e.target.value;
                                if (!featureId) return;
                                if (!formik.values.accessFeatures.includes(featureId)) {
                                  toggleFeatureSelection(featureId);
                                }
                                e.target.value = '';
                              }}
                              className={featurePickerInputCls}
                            >
                              <option value="" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                {filteredFeatureCatalog.length > 0
                                  ? 'Select an access feature'
                                  : 'No features in this category'}
                              </option>
                              {filteredFeatureCatalog.map((feature) => (
                                <option
                                  key={feature._id ?? feature.name}
                                  value={feature._id}
                                  className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white"
                                >
                                  {feature.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {selectedFeatureDetails.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedFeatureDetails.map((feature) => (
                              <button
                                key={feature._id}
                                type="button"
                                onClick={() => toggleFeatureSelection(feature._id)}
                                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 transition-all duration-200 hover:border-[#7928CA]/30 hover:bg-[#7928CA]/5 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-[#7928CA]/10"
                                title={feature.description}
                              >
                                <span>{feature.name}</span>
                                <span className="text-gray-400 dark:text-gray-500">
                                  ({feature.category})
                                </span>
                                <X size={12} />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-4 text-center text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500">
                            No access features selected yet.
                          </p>
                        )}

                        {filteredFeatureCatalog.length === 0 && (
                          <p className="text-sm text-amber-500 dark:text-amber-300">
                            No access features match the selected category.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl bg-gray-100 px-5 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formik.isSubmitting}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF0080] via-[#7928CA] to-[#0070F3] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-[1.01] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {formik.isSubmitting && <Loader2 size={14} className="animate-spin" />}
                    {modalMode === 'add' ? 'Create' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View modal*/}
      <AnimatePresence>
        {modalMode === 'view' && selectedSpace && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-full max-w-md bg-gray-800 border border-gray-700/60 rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/50">
                <h2 className="text-base font-semibold text-white">Space Details</h2>
                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-5 space-y-4">
                {/* Image */}
                {selectedSpace.imageUrl && (
                  <img
                    src={selectedSpace.imageUrl}
                    alt={selectedSpace.name}
                    className="w-full h-40 object-cover rounded-xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}

                <div className="space-y-3">
                  <DetailRow label="Name" value={selectedSpace.name} />
                  <DetailRow
                    label="Category"
                    value={
                      <span className={`font-medium ${CATEGORY_COLORS[selectedSpace.category]}`}>
                        {selectedSpace.category}
                      </span>
                    }
                  />
                  <DetailRow label="Address" value={selectedSpace.locationDetails.address} />
                  <DetailRow
                    label="Coordinates"
                    value={
                      <span className="font-mono text-xs">
                        {selectedSpace.locationDetails.coordinates.lat},{' '}
                        {selectedSpace.locationDetails.coordinates.lng}
                      </span>
                    }
                  />
                  {selectedSpace.description && (
                    <DetailRow label="Description" value={selectedSpace.description} />
                  )}
                  <DetailRow
                    label="Access Features"
                    value={
                      selectedSpace.accessFeatures && selectedSpace.accessFeatures.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedSpace.accessFeatures.map((feature) => (
                            <span
                              key={feature._id}
                              className="rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-xs text-purple-200"
                            >
                              {feature.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        'None selected'
                      )
                    }
                  />
                  {selectedSpace.createdAt && (
                    <DetailRow
                      label="Added"
                      value={new Date(selectedSpace.createdAt).toLocaleDateString()}
                    />
                  )}
                </div>

                {/* Footer buttons */}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      closeModal();
                      openEdit(selectedSpace);
                    }}
                    className="px-4 py-2 text-sm rounded-lg bg-yellow-500/10 text-yellow-400
                               hover:bg-yellow-500/20 transition-colors border border-yellow-500/20"
                  >
                    Edit
                  </button>
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-sm rounded-lg border border-gray-600 text-gray-300
                               hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION DIALOG */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setDeleteTarget(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.18 }}
              className="relative z-10 w-full max-w-sm bg-gray-800 border border-gray-700/60 rounded-2xl shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Delete Space</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Are you sure you want to delete{' '}
                    <span className="font-medium text-white">"{deleteTarget.name}"</span>? This
                    action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3 w-full pt-1">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    disabled={deleteLoading}
                    className="flex-1 py-2 text-sm rounded-lg border border-gray-600 text-gray-300
                               hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleteLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-lg
                               bg-red-500/90 text-white hover:bg-red-500 transition-colors
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteLoading && <Loader2 size={14} className="animate-spin" />}
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Small helper component
function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="text-xs font-medium text-gray-500 w-24 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-200 flex-1">{value}</span>
    </div>
  );
}
