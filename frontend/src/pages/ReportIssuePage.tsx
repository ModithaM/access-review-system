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
    <div className="min-h-dvh bg-white dark:bg-slate-950 transition-colors duration-300 pt-28 pb-16 px-4">
      <div className="container mx-auto max-w-3xl">
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

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 dark:from-blue-500/30 dark:to-cyan-500/30 flex-shrink-0">
              <AlertCircle className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">
                Report an Accessibility Issue
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
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
          className="bg-white dark:bg-gray-900/50 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 md:p-10 mb-8 transition-colors duration-300 backdrop-blur-sm"
        >
          <form onSubmit={formik.handleSubmit} className="space-y-8">
            {/* Name/Reporter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...formik.getFieldProps('reporter')}
                placeholder="John Doe"
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                  isFieldInvalid('reporter')
                    ? 'border-red-300 dark:border-red-500/50'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {getFieldError('reporter') && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 dark:text-red-400"
                >
                  {getFieldError('reporter')}
                </motion.p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                Email <span className="text-gray-400 text-xs font-normal">(Optional)</span>
              </label>
              <input
                type="email"
                {...formik.getFieldProps('reporterEmail')}
                placeholder="your.email@example.com"
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                  isFieldInvalid('reporterEmail')
                    ? 'border-red-300 dark:border-red-500/50'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {getFieldError('reporterEmail') && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 dark:text-red-400"
                >
                  {getFieldError('reporterEmail')}
                </motion.p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                Issue Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input
                  type="text"
                  {...formik.getFieldProps('title')}
                  placeholder="Wheelchair ramp blocked at main entrance"
                  className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                    isFieldInvalid('title')
                      ? 'border-red-300 dark:border-red-500/50'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500">
                  {formik.values.title.length}/200
                </span>
              </div>
              {getFieldError('title') && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 dark:text-red-400"
                >
                  {getFieldError('title')}
                </motion.p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input
                  type="text"
                  {...formik.getFieldProps('location')}
                  placeholder="City Mall, Main Entrance"
                  className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                    isFieldInvalid('location')
                      ? 'border-red-300 dark:border-red-500/50'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500">
                  {formik.values.location.length}/300
                </span>
              </div>
              {getFieldError('location') && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 dark:text-red-400"
                >
                  {getFieldError('location')}
                </motion.p>
              )}
            </div>

            {/* Two Column Layout for Category and Severity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  {...formik.getFieldProps('category')}
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-gray-900 dark:text-white ${
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
                    className="mt-2 text-sm text-red-600 dark:text-red-400"
                  >
                    {getFieldError('category')}
                  </motion.p>
                )}
              </div>

              {/* Severity - Radio Cards */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                  Severity Level <span className="text-red-500">*</span>
                </label>
                <select
                  {...formik.getFieldProps('severity')}
                  className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-gray-900 dark:text-white ${
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
                    className="mt-2 text-sm text-red-600 dark:text-red-400"
                  >
                    {getFieldError('severity')}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                {...formik.getFieldProps('description')}
                placeholder="Provide detailed information about the accessibility issue. Include specific details about when and where the issue occurs."
                rows={5}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none ${
                  isFieldInvalid('description')
                    ? 'border-red-300 dark:border-red-500/50'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              <div className="flex justify-between items-center mt-2">
                {getFieldError('description') && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 dark:text-red-400"
                  >
                    {getFieldError('description')}
                  </motion.p>
                )}
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                  {formik.values.description.length}/2000
                </span>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-2xl">
              <p className="text-sm text-blue-900 dark:text-blue-200 flex items-start gap-3">
                <span className="text-lg mt-0.5">💡</span>
                <span>
                  <strong>Pro Tip:</strong> Include specific details about when and where the issue
                  occurs. This helps our team address it faster and more effectively.
                </span>
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                gradient
                disabled={formik.isSubmitting || !formik.isValid}
                className="flex-1"
              >
                <div className="flex items-center justify-center gap-2">
                  {formik.isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{formik.isSubmitting ? 'Submitting...' : 'Submit Report'}</span>
                </div>
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
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
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="group p-6 bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-500/30 hover:shadow-sm dark:hover:shadow-blue-500/5"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
