import { AlertCircle, MapPin, Type } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFormik } from 'formik';
import * as Yup from 'yup';
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
    <div className="min-h-dvh bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 pt-32 pb-16 px-4">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <AlertCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Report an Issue</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Help us improve accessibility by reporting barriers you've encountered
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-8 transition-colors duration-300"
        >
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Name/Reporter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Your Name *
              </label>
              <input
                type="text"
                {...formik.getFieldProps('reporter')}
                placeholder="e.g., John Doe"
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-gray-700 transition-all text-gray-900 dark:text-white ${
                  isFieldInvalid('reporter')
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-200 dark:border-gray-700 focus:border-blue-500'
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
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Email (Optional)
              </label>
              <input
                type="email"
                {...formik.getFieldProps('reporterEmail')}
                placeholder="your.email@example.com"
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-gray-700 transition-all text-gray-900 dark:text-white ${
                  isFieldInvalid('reporterEmail')
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-200 dark:border-gray-700 focus:border-blue-500'
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
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Issue Title *{' '}
                <span className="text-xs text-gray-500">({formik.values.title.length}/200)</span>
              </label>
              <div className="relative">
                <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input
                  type="text"
                  {...formik.getFieldProps('title')}
                  placeholder="e.g., Wheelchair ramp blocked at main entrance"
                  className={`w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-gray-700 transition-all text-gray-900 dark:text-white ${
                    isFieldInvalid('title')
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-gray-200 dark:border-gray-700 focus:border-blue-500'
                  }`}
                />
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
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Location *{' '}
                <span className="text-xs text-gray-500">({formik.values.location.length}/300)</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <input
                  type="text"
                  {...formik.getFieldProps('location')}
                  placeholder="e.g., City Mall, Main Entrance"
                  className={`w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-gray-700 transition-all text-gray-900 dark:text-white ${
                    isFieldInvalid('location')
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-gray-200 dark:border-gray-700 focus:border-blue-500'
                  }`}
                />
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

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Category *
              </label>
              <select
                {...formik.getFieldProps('category')}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-gray-700 transition-all text-gray-900 dark:text-white ${
                  isFieldInvalid('category')
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-200 dark:border-gray-700 focus:border-blue-500'
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

            {/* Severity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">
                Severity Level *
              </label>
              <div className="space-y-2">
                {severityLevels.map((level) => (
                  <label
                    key={level.value}
                    className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${
                      isFieldInvalid('severity') && !formik.values.severity
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <input
                      type="radio"
                      {...formik.getFieldProps('severity')}
                      value={level.value}
                      className="w-4 h-4 text-blue-600 dark:text-blue-400"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {level.label}
                    </span>
                  </label>
                ))}
              </div>
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

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Description *{' '}
                <span className="text-xs text-gray-500">
                  ({formik.values.description.length}/2000)
                </span>
              </label>
              <textarea
                {...formik.getFieldProps('description')}
                placeholder="Provide detailed information about the accessibility issue..."
                rows={6}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-gray-700 transition-all text-gray-900 dark:text-white resize-none ${
                  isFieldInvalid('description')
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-200 dark:border-gray-700 focus:border-blue-500'
                }`}
              />
              {getFieldError('description') && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 dark:text-red-400"
                >
                  {getFieldError('description')}
                </motion.p>
              )}
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-xl">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                <span className="font-semibold">💡 Tip:</span> Include specific details about when
                and where the issue occurs. This helps our team address it faster.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={formik.isSubmitting || !formik.isValid}
                className="flex-1 h-12 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {formik.isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            {
              title: 'Quick Response',
              description: 'We prioritize critical issues and respond within 24 hours',
            },
            {
              title: 'Transparency',
              description: 'Track your report status and see updates in real-time',
            },
            {
              title: 'Community Impact',
              description: 'Your reports help us create more accessible spaces for everyone',
            },
          ].map((item, index) => (
            <div
              key={index}
              className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors duration-300"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
