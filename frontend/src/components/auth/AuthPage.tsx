import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ErrorMessage, Field, Form, Formik, type FormikHelpers } from 'formik';
import { ArrowRight, LockKeyhole, Mail, Sparkles, UserRound, CheckCircle2 } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import AuthService from '@/services/auth.service.ts';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

type AuthMode = 'login' | 'signup';

type AuthPageProps = {
  initialMode?: AuthMode;
};

type LoginValues = {
  email: string;
  password: string;
  rememberMe: boolean;
};

type SignupValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const brandPalette = ['#FF0080', '#7928CA', '#0070F3', '#38BDF8'] as const;

const formMotion = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

const shellMotion = {
  initial: { opacity: 0, y: 24, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] as const },
};

const brandPanelMotion = {
  initial: { opacity: 0, x: 18 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -18 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

const loginSchema = Yup.object({
  email: Yup.string().email('Enter a valid email address').required('Email is required'),
  password: Yup.string().required('Password is required'),
  rememberMe: Yup.boolean(),
});

const signupSchema = Yup.object({
  fullName: Yup.string()
    .min(2, 'Full name must be at least 2 characters')
    .required('Full name is required'),
  email: Yup.string().email('Enter a valid email address').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .max(40, 'Password must be 40 characters or less')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

const loginInitialValues: LoginValues = {
  email: '',
  password: '',
  rememberMe: true,
};

const signupInitialValues: SignupValues = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

function splitFullName(fullName: string) {
  const [first, ...rest] = fullName.trim().split(/\s+/);

  return {
    name: first ?? '',
    surname: rest.join(' '),
  };
}

function getRedirectPath() {
  const currentUser = AuthService.getCurrentUser();

  if (!currentUser) {
    return null;
  }

  return currentUser.user?.userType === 'admin' ? '/admin' : '/profile';
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null) {
    const maybeMessage = (error as { response?: { data?: { message?: string } }; message?: string })
      .response?.data?.message;

    if (maybeMessage) {
      return maybeMessage;
    }

    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
  }

  return fallback;
}

function AuthInput({
  icon: Icon,
  label,
  name,
  type,
  placeholder,
}: {
  icon: typeof Mail;
  label: string;
  name: string;
  type: string;
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-[13px] font-semibold text-gray-900 dark:text-slate-100">
        {label}
      </label>
      <div className="group relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 transition-colors group-focus-within:text-[#7928CA] dark:text-slate-500 dark:group-focus-within:text-[#38BDF8]">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <Field
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          className="h-10.5 w-full rounded-xl border border-gray-200 bg-white/90 pl-9 pr-3.5 text-[13px] text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#7928CA]/40 dark:border-white/10 dark:bg-slate-900/85 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-[#38BDF8]/30"
        />
      </div>
      <ErrorMessage name={name} component="p" className="text-[12px] text-rose-500" />
    </div>
  );
}

function AuthPage({ initialMode = 'login' }: AuthPageProps) {
  const navigate = useNavigate();
  const redirectPath = useMemo(() => getRedirectPath(), []);
  const { isDark, toggleTheme } = useTheme();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(
    null,
  );
  const [prefilledEmail, setPrefilledEmail] = useState('');

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const isLogin = mode === 'login';
  const isSignup = mode === 'signup';

  const brandCopy = isLogin
    ? {
        eyebrow: 'AccessAble',
        title: 'Review public spaces with confidence.',
        body: 'Sign in to continue exploring accessibility insights, trusted reviews, and inclusive space recommendations.',
        accent: 'Returning users',
      }
    : {
        eyebrow: 'Join AccessAble',
        title: 'Discover accessible spaces together.',
        body: 'Create your account to contribute reviews, save places, and help make public spaces easier to navigate for everyone.',
        accent: 'New contributors',
      };

  const brandStats = isLogin
    ? [
        { label: 'Trusted reviews', value: '2.3k+' },
        { label: 'Saved destinations', value: '860+' },
      ]
    : [
        { label: 'New voices monthly', value: '410+' },
        { label: 'Access signals tracked', value: '94%' },
      ];

  async function handleLogin(values: LoginValues, helpers: FormikHelpers<LoginValues>) {
    setFeedback(null);
    setIsSubmitting(true);

    try {
      await AuthService.login(values.email, values.password);
      navigate(getRedirectPath() ?? '/profile', { replace: true });
    } catch (error: unknown) {
      setFeedback({
        type: 'error',
        text: getErrorMessage(error, 'Unable to log in right now.'),
      });
    } finally {
      setIsSubmitting(false);
      helpers.setSubmitting(false);
    }
  }

  async function handleSignup(values: SignupValues, helpers: FormikHelpers<SignupValues>) {
    setFeedback(null);
    setIsSubmitting(true);

    try {
      const { name, surname } = splitFullName(values.fullName);

      await AuthService.register(
        values.email,
        name,
        values.password,
        surname || undefined,
        values.confirmPassword,
      );

      setPrefilledEmail(values.email);
      setMode('login');
      setFeedback({
        type: 'success',
        text: 'Account created successfully. You can sign in now.',
      });
      helpers.resetForm();
    } catch (error: unknown) {
      setFeedback({
        type: 'error',
        text: getErrorMessage(error, 'Unable to create your account.'),
      });
    } finally {
      setIsSubmitting(false);
      helpers.setSubmitting(false);
    }
  }

  function switchMode(nextMode: AuthMode) {
    if (nextMode === mode) {
      return;
    }

    setFeedback(null);
    setMode(nextMode);
  }

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(255,0,128,0.16),_transparent_30%),linear-gradient(180deg,#f7faff_0%,#ffffff_42%,#fdf2f8_100%)] px-4 py-6 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(255,0,128,0.16),_transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_42%,#111827_100%)] sm:px-6 lg:px-8 lg:py-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute left-[-8rem] top-[-8rem] h-64 w-64 rounded-full bg-[#38BDF8]/20 blur-3xl dark:bg-[#38BDF8]/18"
          animate={{ x: [0, 24, -12, 0], y: [0, 20, -12, 0] }}
          transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[-7rem] right-[-4rem] h-80 w-80 rounded-full bg-[#FF0080]/15 blur-3xl dark:bg-[#FF0080]/12"
          animate={{ x: [0, -18, 14, 0], y: [0, -20, 16, 0] }}
          transition={{ duration: 14, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
        />
      </div>

      <div className="absolute right-4 top-4 z-40 sm:right-6 sm:top-6">
        <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
      </div>

      <motion.main
        {...shellMotion}
        layout
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] as const }}
        className="relative mx-auto flex w-full max-w-[1120px] overflow-hidden rounded-[2rem] border border-white/70 bg-white/65 shadow-[0_28px_84px_rgba(18,38,63,0.15)] backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-slate-950/50 dark:shadow-[0_30px_100px_rgba(2,6,23,0.55)] lg:min-h-[620px]"
      >
        <div className="relative grid min-h-full w-full lg:grid-cols-2">
          <motion.section
            layout
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] as const }}
            initial={false}
            animate={{ x: 0, opacity: 1 }}
            className={cn(
              'relative hidden overflow-hidden px-5 py-5 text-white lg:flex lg:min-h-[620px] xl:px-8 xl:py-7',
              isSignup ? 'order-1' : 'order-2',
            )}
          >
            <div className="absolute inset-0 bg-[linear-gradient(150deg,#18062f_0%,#2a0d52_18%,#7928CA_52%,#0070F3_78%,#0a335f_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,0,128,0.28),transparent_24%),radial-gradient(circle_at_82%_16%,rgba(56,189,248,0.22),transparent_22%),radial-gradient(circle_at_50%_86%,rgba(0,112,243,0.24),transparent_26%)]" />
            <motion.div
              className="absolute -top-10 h-56 w-56 rounded-full bg-[#FF0080]/20 blur-3xl"
              animate={{ y: [0, 22, 0], x: [0, -18, 0] }}
              transition={{ duration: 13, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
              style={isSignup ? { right: '5rem' } : { left: '5rem' }}
            />
            <motion.div
              className="absolute bottom-10 h-72 w-72 rounded-full bg-[#38BDF8]/16 blur-3xl"
              animate={{ y: [0, -22, 0], x: [0, 20, 0] }}
              transition={{ duration: 14, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
              style={isSignup ? { left: '2rem' } : { right: '2rem' }}
            />
            <motion.div
              className="absolute top-[18%] h-28 w-28 rounded-[2.15rem] border border-white/15 bg-white/10 backdrop-blur-md"
              animate={{ y: [0, -18, 0], rotate: [0, 8, 0] }}
              transition={{ duration: 9, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
              style={isSignup ? { left: '3.5rem' } : { right: '3.5rem' }}
            />
            <div
              className={cn(
                'absolute inset-y-0 z-10 hidden w-44 lg:block',
                isSignup
                  ? 'right-[-3.5rem] bg-[linear-gradient(270deg,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.15)_44%,transparent_100%)]'
                  : 'left-[-3.5rem] bg-[linear-gradient(90deg,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.15)_44%,transparent_100%)]',
              )}
            />

            <div
              className={cn(
                'relative z-20 flex w-full flex-col justify-between',
                isLogin && 'items-end text-right',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 backdrop-blur-md">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold">AccessAble</p>
                    <p className="text-[11px] text-white/70">Inclusive public space reviews</p>
                  </div>
                </div>

                <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white/80">
                  {brandCopy.accent}
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={mode} {...brandPanelMotion} className="max-w-[23rem] space-y-5">
                  <div className="space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/65">
                      {brandCopy.eyebrow}
                    </p>
                    <h2 className="text-[1.95rem] font-semibold leading-[1.08] tracking-tight xl:text-[2.2rem]">
                      {brandCopy.title}
                    </h2>
                    <p className="max-w-md text-[13px] leading-5 text-white/78">{brandCopy.body}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {brandStats.map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12 * index + 0.12, duration: 0.45 }}
                        className="rounded-[1.25rem] border border-white/15 bg-white/10 p-3 shadow-[0_14px_34px_rgba(4,11,33,0.14)] backdrop-blur-md"
                      >
                        <p className="text-[15px] font-semibold">{stat.value}</p>
                        <p className="mt-1 text-[11px] text-white/72">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                className="relative max-w-[18rem] rounded-[1.4rem] border border-white/15 bg-white/10 p-3 shadow-[0_14px_40px_rgba(4,11,33,0.18)] backdrop-blur-xl"
              >
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#FF0080]/20 blur-2xl" />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[#FF0080]" />
                      <div className="h-3 w-3 rounded-full bg-white/55" />
                      <div className="h-3 w-3 rounded-full bg-[#38BDF8]" />
                    </div>
                    <span className="rounded-full bg-white/12 px-2.5 py-1 text-[10px] text-white/75">
                      Live community signal
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between rounded-[1.1rem] border border-white/10 bg-black/10 px-3 py-2">
                      <div>
                        <p className="text-[12px] font-medium text-white/90">Step-free access</p>
                        <p className="text-[10px] text-white/60">Verified by recent reviews</p>
                      </div>
                      <span className="rounded-full bg-emerald-400/20 px-2.5 py-1 text-[10px] font-medium text-emerald-100">
                        Strong
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {brandPalette.slice(0, 2).map((color) => (
                        <div
                          key={color}
                          className="h-14 rounded-[0.95rem] border border-white/10"
                          style={{
                            background: `linear-gradient(160deg, ${color}AA, rgba(255,255,255,0.08))`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.section>

          <motion.section
            layout
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] as const }}
            initial={false}
            animate={{ x: 0, opacity: 1 }}
            className={cn(
              'relative z-30 flex items-center py-4 lg:min-h-[620px] lg:py-7',
              isSignup
                ? 'order-2 justify-start pl-4 pr-4 sm:pl-6 lg:-ml-16 lg:pl-0 lg:pr-6 xl:-ml-18'
                : 'order-1 justify-end pl-4 pr-4 sm:pr-6 lg:-mr-16 lg:pl-6 lg:pr-0 xl:-mr-18',
            )}
          >
            <div className="w-full max-w-[650px] xl:max-w-[690px]">
              <motion.div
                layout
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] as const }}
                className="relative overflow-hidden rounded-[1.9rem] border border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.97))] px-5 py-5.5 shadow-[0_24px_76px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.94))] dark:shadow-[0_24px_80px_rgba(2,6,23,0.5)] sm:px-6 sm:py-6 lg:min-h-[520px] lg:px-8 lg:py-7 xl:min-h-[550px] xl:rounded-[2.1rem] xl:px-9 xl:py-8"
              >
                <div className="pointer-events-none absolute inset-x-10 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(121,40,202,0.14),transparent_68%)] dark:bg-[radial-gradient(circle_at_top,rgba(121,40,202,0.22),transparent_68%)]" />
                <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 bg-[radial-gradient(circle,rgba(56,189,248,0.14),transparent_68%)] dark:bg-[radial-gradient(circle,rgba(56,189,248,0.18),transparent_68%)]" />

                <div className="relative z-10 mx-auto flex h-full w-full max-w-[24rem] flex-col justify-center">
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="mb-5"
                  >
                    <Link
                      to="/"
                      className="inline-flex items-center gap-2 rounded-full border border-[#7928CA]/15 bg-white px-3 py-1.5 text-[12px] font-semibold text-gray-600 shadow-sm transition hover:border-[#7928CA]/30 hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                      <span className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-brand-gradient text-white shadow-lg">
                        <Sparkles className="h-3.5 w-3.5" />
                      </span>
                      AccessAble
                    </Link>
                  </motion.div>

                  <AnimatePresence mode="wait">
                    <motion.div key={mode} {...formMotion} className="space-y-5">
                      <div className="space-y-2">
                        <span className="inline-flex rounded-full bg-[#7928CA]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7928CA]">
                          {isLogin ? 'Member Login' : 'Create Your Account'}
                        </span>
                        <div className="space-y-2">
                          <h1 className="text-[1.5rem] font-semibold tracking-tight text-gray-900 dark:text-white sm:text-[1.8rem]">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                          </h1>
                          <p className="max-w-md text-[12px] leading-5 text-gray-600 dark:text-slate-400">
                            {isLogin
                              ? 'Sign in to continue reviewing public spaces, tracking accessibility, and saving your trusted destinations.'
                              : 'Set up your profile to discover inclusive places, share reviews, and make every visit more predictable.'}
                          </p>
                        </div>
                      </div>

                      {feedback && (
                        <div
                          className={cn(
                            'rounded-[1.15rem] border px-3 py-2.5 text-[12px] shadow-sm',
                            feedback.type === 'success'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border-rose-200 bg-rose-50 text-rose-700',
                          )}
                        >
                          {feedback.type === 'success' && (
                            <span className="mr-2 inline-flex align-middle">
                              <CheckCircle2 className="h-4 w-4" />
                            </span>
                          )}
                          <span>{feedback.text}</span>
                        </div>
                      )}

                      {isLogin ? (
                        <Formik<LoginValues>
                          initialValues={{ ...loginInitialValues, email: prefilledEmail }}
                          enableReinitialize
                          validationSchema={loginSchema}
                          onSubmit={handleLogin}
                        >
                          {({ values }) => (
                            <Form className="space-y-4.5">
                              <AuthInput
                                icon={Mail}
                                label="Email"
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                              />
                              <AuthInput
                                icon={LockKeyhole}
                                label="Password"
                                name="password"
                                type="password"
                                placeholder="Enter your password"
                              />

                              <div className="flex flex-col gap-2.5 text-sm text-gray-600 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                                <label className="inline-flex items-center gap-3">
                                  <Field
                                    type="checkbox"
                                    name="rememberMe"
                                    className="h-4 w-4 rounded border-gray-300 text-[#7928CA] focus:ring-[#7928CA]/40 dark:border-white/10 dark:bg-slate-900"
                                  />
                                  <span>Remember me</span>
                                </label>
                                <a
                                  href="mailto:support@accessable.app?subject=Password%20Reset"
                                  className="font-medium text-[#7928CA] transition hover:text-[#FF0080] dark:text-[#38BDF8] dark:hover:text-[#FF0080]"
                                >
                                  Forgot password?
                                </a>
                              </div>

                              <motion.button
                                whileHover={{ scale: 1.01, y: -1 }}
                                whileTap={{ scale: 0.99 }}
                                type="submit"
                                disabled={isSubmitting}
                                className="flex h-11.5 w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#FF0080_0%,#7928CA_35%,#0070F3_72%,#38BDF8_100%)] px-5 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(121,40,202,0.32)] transition duration-300 hover:shadow-[0_24px_60px_rgba(121,40,202,0.38)] disabled:opacity-60"
                              >
                                <span>{isSubmitting ? 'Signing In...' : 'Login'}</span>
                                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                              </motion.button>

                              <p className="text-center text-sm text-gray-600 dark:text-slate-400">
                                Don&apos;t have an account?{' '}
                                <button
                                  type="button"
                                  onClick={() => switchMode('signup')}
                                  className="font-semibold text-[#7928CA] transition hover:text-[#FF0080] dark:text-[#38BDF8] dark:hover:text-[#FF0080]"
                                >
                                  Sign Up
                                </button>
                              </p>

                              {values.rememberMe && (
                                <p className="text-xs leading-6 text-gray-400 dark:text-slate-500">
                                  Your session is stored locally so you can come back without
                                  starting over.
                                </p>
                              )}
                            </Form>
                          )}
                        </Formik>
                      ) : (
                        <Formik<SignupValues>
                          initialValues={signupInitialValues}
                          validationSchema={signupSchema}
                          onSubmit={handleSignup}
                        >
                          <Form className="space-y-4.5">
                            <AuthInput
                              icon={UserRound}
                              label="Full Name"
                              name="fullName"
                              type="text"
                              placeholder="Alex Morgan"
                            />
                            <AuthInput
                              icon={Mail}
                              label="Email"
                              name="email"
                              type="email"
                              placeholder="name@example.com"
                            />
                            <div className="grid gap-4 sm:grid-cols-2">
                              <AuthInput
                                icon={LockKeyhole}
                                label="Password"
                                name="password"
                                type="password"
                                placeholder="Create a password"
                              />
                              <AuthInput
                                icon={LockKeyhole}
                                label="Confirm Password"
                                name="confirmPassword"
                                type="password"
                                placeholder="Re-enter password"
                              />
                            </div>

                            <motion.button
                              whileHover={{ scale: 1.01, y: -1 }}
                              whileTap={{ scale: 0.99 }}
                              type="submit"
                              disabled={isSubmitting}
                              className="flex h-11.5 w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#FF0080_0%,#7928CA_35%,#0070F3_72%,#38BDF8_100%)] px-5 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(121,40,202,0.32)] transition duration-300 hover:shadow-[0_24px_60px_rgba(121,40,202,0.38)] disabled:opacity-60"
                            >
                              <span>{isSubmitting ? 'Creating Account...' : 'Sign Up'}</span>
                              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                            </motion.button>

                            <p className="text-center text-sm text-gray-600 dark:text-slate-400">
                              Already have an account?{' '}
                              <button
                                type="button"
                                onClick={() => switchMode('login')}
                                className="font-semibold text-[#7928CA] transition hover:text-[#FF0080] dark:text-[#38BDF8] dark:hover:text-[#FF0080]"
                              >
                                Login
                              </button>
                            </p>
                          </Form>
                        </Formik>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </motion.section>
        </div>
      </motion.main>
    </div>
  );
}

export default AuthPage;
