import { AlertCircle, MapPin, Type, Loader2, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/admin/Button';
import issueService from '@/services/issue.service';
import { useToast } from '@/hooks/useToast';

const validationSchema = Yup.object().shape({
  title: Yup.string()
    .required('Issue title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),
  location: Yup.string()
    .required('Location is required')
    .min(3, 'Location must be at least 3 characters')
    .max(300, 'Location must not exceed 300 characters')
    .trim(),
  description: Yup.string()
    .required('Description is required')
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must not exceed 2000 characters')
    .trim(),
  reporter: Yup.string()
    .required('Your name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
    .trim(),
  reporterEmail: Yup.string()
    .email('Please enter a valid email address')
    .max(254, 'Email must not exceed 254 characters')
    .nullable(),
  category: Yup.string()
    .required('Please select a category')
    .oneOf(
      [
        'Mobility Access',
        'Visual Access',
        'Hearing Access',
        'Parking',
        'Restrooms',
        'Signage',
        'Elevators',
        'Other',
      ],
      'Invalid category selected',
    ),
  severity: Yup.string()
    .required('Please select a severity level')
    .oneOf(['Low', 'Medium', 'High', 'Critical'], 'Invalid severity level'),
});

export default function ReportIssuePage() {
  const navigate = useNavigate();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  const formik = useFormik({
    initialValues: {
      title: '',
      location: '',
      description: '',
      reporter: '',
      reporterEmail: '',
      severity: 'Medium',
      category: 'Other',
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        await issueService.createIssue({
          title: values.title,
          location: values.location,
          description: values.description,
          reporter: values.reporter,
          reporterEmail: values.reporterEmail || undefined,
          severity: values.severity as 'Low' | 'Medium' | 'High' | 'Critical',
          category: values.category,
        });
        showSuccessToast(
          'Issue reported successfully! Thank you for helping us improve accessibility.',
        );
        formik.resetForm();
      } catch (error) {
        const apiError = error as { response?: { data?: { message?: string } } };
        const message =
          apiError.response?.data?.message || 'Failed to submit issue. Please try again.';
        showErrorToast(message);
      }
    },
  });

  const categories = [
    'Mobility Access',
    'Visual Access',
    'Hearing Access',
    'Parking',
    'Restrooms',
    'Signage',
    'Elevators',
    'Other',
  ];

  const severityLevels = [
    { value: 'Low', label: 'Low - Minor issue' },
    { value: 'Medium', label: 'Medium - Noticeable issue' },
    { value: 'High', label: 'High - Significant accessibility barrier' },
    { value: 'Critical', label: 'Critical - Severe accessibility barrier' },
  ];

  const getFieldError = (fieldName: keyof typeof formik.values): string | undefined => {
    return formik.touched[fieldName] && formik.errors[fieldName]
      ? formik.errors[fieldName]
      : undefined;
  };

  const isFieldInvalid = (fieldName: keyof typeof formik.values): boolean => {
    return !!(formik.touched[fieldName] && formik.errors[fieldName]);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300 pt-28 pb-16 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Back Button */}
        <motion.button
          type="button"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors group"
        >
          <Home className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Homepage
        </motion.button>

        {/* Two Column Layout - Like ProfilePage */}
        <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* Benefits Section - Left Sticky Sidebar */}
          <div className="space-y-5 lg:sticky lg:top-28">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5 shadow-sm transition-all duration-300"
            >
              <div className="mb-5">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Why Report?
                </h2>
                <p className="mt-1 text-[13px] text-gray-600 dark:text-slate-400">
                  Help us create more accessible spaces
                </p>
              </div>
              <div className="space-y-3">
                {[
                  {
                    icon: '⚡',
                    title: 'Quick Response',
                    description: 'We prioritize critical issues and respond within 24 hours',
                  },
                  {
                    icon: '👁️',
                    title: 'Transparency',
                    description: 'Track your report status and see updates in real-time',
                  },
                  {
                    icon: '🤝',
                    title: 'Community Impact',
                    description: 'Your reports help create more accessible spaces for everyone',
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-500/30 hover:shadow-sm dark:hover:shadow-blue-500/5"
                  >
                    <div className="text-xl mb-2">{item.icon}</div>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Main Form - Right Content Area */}
          <div className="space-y-5">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5 shadow-sm transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 dark:from-blue-500/30 dark:to-cyan-500/30 flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                    Report an Accessibility Issue
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Help us improve accessibility by reporting barriers you've encountered
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Main Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5 shadow-sm transition-all duration-300"
            >
              <form onSubmit={formik.handleSubmit} className="space-y-4">
                {/* Name/Reporter and Email - Two Columns */}
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...formik.getFieldProps('reporter')}
                      placeholder="John Doe"
                      className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-[13px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                        isFieldInvalid('reporter')
                          ? 'border-red-300 dark:border-red-500/50'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    />
                    {getFieldError('reporter') && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-xs text-red-600 dark:text-red-400"
                      >
                        {getFieldError('reporter')}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      Email{' '}
                      <span className="text-gray-400 text-[11px] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      {...formik.getFieldProps('reporterEmail')}
                      placeholder="your.email@example.com"
                      className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-[13px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                        isFieldInvalid('reporterEmail')
                          ? 'border-red-300 dark:border-red-500/50'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    />
                    {getFieldError('reporterEmail') && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-xs text-red-600 dark:text-red-400"
                      >
                        {getFieldError('reporterEmail')}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Title and Location - Two Columns */}
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      Issue Title <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                      <input
                        type="text"
                        {...formik.getFieldProps('title')}
                        placeholder="Wheelchair ramp blocked"
                        maxLength={200}
                        className={`w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-[13px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                          isFieldInvalid('title')
                            ? 'border-red-300 dark:border-red-500/50'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 dark:text-gray-500">
                        {formik.values.title.length}/200
                      </span>
                    </div>
                    {getFieldError('title') && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-xs text-red-600 dark:text-red-400"
                      >
                        {getFieldError('title')}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                      <input
                        type="text"
                        {...formik.getFieldProps('location')}
                        placeholder="City Mall, Main Entrance"
                        maxLength={300}
                        className={`w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-[13px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                          isFieldInvalid('location')
                            ? 'border-red-300 dark:border-red-500/50'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 dark:text-gray-500">
                        {formik.values.location.length}/300
                      </span>
                    </div>
                    {getFieldError('location') && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-xs text-red-600 dark:text-red-400"
                      >
                        {getFieldError('location')}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Category and Severity - Two Columns */}
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...formik.getFieldProps('category')}
                      className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-[13px] text-gray-900 dark:text-white ${
                        isFieldInvalid('category')
                          ? 'border-red-300 dark:border-red-500/50'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {getFieldError('category') && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-xs text-red-600 dark:text-red-400"
                      >
                        {getFieldError('category')}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      Severity Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...formik.getFieldProps('severity')}
                      className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-[13px] text-gray-900 dark:text-white ${
                        isFieldInvalid('severity')
                          ? 'border-red-300 dark:border-red-500/50'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {severityLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                    {getFieldError('severity') && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-xs text-red-600 dark:text-red-400"
                      >
                        {getFieldError('severity')}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...formik.getFieldProps('description')}
                    placeholder="Provide detailed information about the accessibility issue..."
                    rows={3}
                    maxLength={2000}
                    className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-[13px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none ${
                      isFieldInvalid('description')
                        ? 'border-red-300 dark:border-red-500/50'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {getFieldError('description') && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-600 dark:text-red-400"
                      >
                        {getFieldError('description')}
                      </motion.p>
                    )}
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-auto">
                      {formik.values.description.length}/2000
                    </span>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate('/')}
                    className="flex-1 h-9 text-sm rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    gradient
                    disabled={formik.isSubmitting || !formik.isValid}
                    className="flex-1 h-9 text-sm rounded-lg"
                  >
                    <div className="flex items-center justify-center gap-2">
                      {formik.isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>{formik.isSubmitting ? 'Submitting...' : 'Submit Report'}</span>
                    </div>
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
