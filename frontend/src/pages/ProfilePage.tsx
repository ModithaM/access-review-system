import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  BadgeCheck,
  Camera,
  CheckCircle,
  Edit2,
  Home,
  LogOut,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';

import AuthService from '@/services/auth.service';
import UsersService from '@/services/users.service';
import { Button } from '@/components/shared/Button';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email?: string;
  surname?: string;
  isLoggedIn: boolean;
  userType: string;
}

const profileValidationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  name: Yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  surname: Yup.string().min(2, 'Surname must be at least 2 characters'),
});

function ProfileCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        'rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-slate-950 dark:shadow-black/20',
        className,
      )}
    >
      <div className="mb-5">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
        {description && <p className="mt-1 text-[13px] text-gray-600 dark:text-slate-400">{description}</p>}
      </div>
      {children}
    </motion.section>
  );
}

function ProfileSidebar({
  user,
  fullName,
  initials,
  profileCompletion,
  completionItems,
  onEdit,
}: {
  user: User;
  fullName: string;
  initials: string;
  profileCompletion: number;
  completionItems: Array<{ label: string; complete: boolean }>;
  onEdit: () => void;
}) {
  const quickStats = [
    { label: 'Profile fields', value: `${completionItems.filter((item) => item.complete).length}/3` },
    { label: 'Account role', value: user.userType || 'User' },
    { label: 'Session status', value: user.isLoggedIn ? 'Active' : 'Inactive' },
  ];

  return (
    <ProfileCard title="Profile Summary" description="Your AccessAble account at a glance." className="sticky top-28">
      <div className="space-y-5">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="rounded-[1.75rem] bg-gradient-to-br from-[#FF0080] via-[#7928CA] to-[#0070F3] p-[3px] shadow-[0_18px_45px_rgba(121,40,202,0.22)]">
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.4rem] bg-white text-xl font-semibold text-gray-900 dark:bg-slate-900 dark:text-white">
                {initials}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
              <Camera className="h-4 w-4 text-[#7928CA]" />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">{fullName}</h1>
            <div className="flex items-center justify-center gap-2 text-[13px] text-gray-600 dark:text-slate-400">
              <Mail className="h-4 w-4 text-[#7928CA]" />
              <span>{user.email || 'No email provided'}</span>
            </div>
            <span className="inline-flex rounded-full bg-gradient-to-r from-[#FF0080]/10 via-[#7928CA]/10 to-[#0070F3]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#7928CA]">
              {user.userType}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3.5 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-slate-500">
                Profile Completion
              </p>
              <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{profileCompletion}%</p>
            </div>
            <BadgeCheck className="h-8 w-8 text-[#7928CA]" />
          </div>
          <div className="mt-3 h-2 rounded-full bg-gray-200 dark:bg-white/10">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-[#FF0080] via-[#7928CA] to-[#0070F3] transition-all duration-300"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
          <div className="mt-3 space-y-2">
            {completionItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-[13px]">
                <span className="text-gray-600 dark:text-slate-400">{item.label}</span>
                <span
                  className={cn(
                    'font-medium',
                    item.complete ? 'text-emerald-600' : 'text-gray-400',
                  )}
                >
                  {item.complete ? 'Complete' : 'Missing'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {quickStats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-slate-500">
                {stat.label}
              </p>
              <p className="mt-1.5 text-[13px] font-semibold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <Button
          type="button"
          onClick={onEdit}
          className="h-10 w-full rounded-xl bg-gradient-to-r from-[#FF0080] via-[#7928CA] to-[#0070F3] text-sm text-white shadow-[0_18px_40px_rgba(121,40,202,0.22)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_24px_50px_rgba(121,40,202,0.26)]"
        >
          <Edit2 className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>
    </ProfileCard>
  );
}

function ProfileInfoRow({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 dark:border-white/10 dark:bg-white/5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-slate-500">{label}</p>
      <p className="mt-1.5 text-[13px] font-medium text-gray-900 dark:text-white">{value || 'Not provided'}</p>
    </div>
  );
}

function ProfileField({
  label,
  name,
  type,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  touched,
}: {
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
  placeholder: string;
  error?: string;
  touched?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-[13px] font-semibold text-gray-700 dark:text-slate-300">
        {label}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-[13px] text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-[#7928CA] focus:bg-white focus:ring-2 focus:ring-[#7928CA]/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#38BDF8] dark:focus:bg-slate-900 dark:focus:ring-[#38BDF8]/20',
          touched && error && 'border-rose-300 focus:border-rose-400 focus:ring-rose-200',
        )}
      />
      {touched && error && <p className="text-[11px] font-medium text-rose-500">{error}</p>}
    </div>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false);
  const navigate = useNavigate();
  const { success, error } = useToast();

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();

    if (!currentUser?.user || !currentUser?.token) {
      navigate('/login');
      return;
    }

    setUser(currentUser.user);
    setLoading(false);
  }, [navigate]);

  const formik = useFormik({
    initialValues: {
      email: user?.email || '',
      name: user?.name || '',
      surname: user?.surname || '',
    },
    validationSchema: profileValidationSchema,
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      if (!user?.id) return;

      setIsSaving(true);
      try {
        const updateData = {
          email: values.email,
          name: values.name,
          surname: values.surname,
        };

        const response = await UsersService.updateUser(user.id, updateData);

        const currentUserData = AuthService.getCurrentUser();
        if (currentUserData && response.data?.result) {
          const updatedUser = {
            ...currentUserData.user,
            email: response.data.result.email ?? currentUserData.user.email,
            name: response.data.result.name ?? currentUserData.user.name,
            surname: response.data.result.surname ?? currentUserData.user.surname,
            userType: response.data.result.userType ?? currentUserData.user.userType,
          };
          currentUserData.user = updatedUser;
          localStorage.setItem('user', JSON.stringify(currentUserData));
        }

        if (response.data?.result) {
          setUser((prev) =>
            prev
              ? {
                  ...prev,
                  email: response.data.result.email ?? prev.email,
                  name: response.data.result.name ?? prev.name,
                  surname: response.data.result.surname ?? prev.surname,
                  userType: response.data.result.userType ?? prev.userType,
                }
              : prev,
          );
        }

        success('Profile updated successfully');
        setIsEditing(false);
      } catch (err) {
        error('Failed to update profile. Please try again.');
        console.error(err);
      } finally {
        setIsSaving(false);
      }
    },
  });

  const passwordFormik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
    }),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, helpers) => {
      if (!user?.id) return;

      setIsPasswordSaving(true);
      try {
        await UsersService.updatePassword(user.id, values.password);
        success('Password updated successfully');
        helpers.resetForm();
        setIsPasswordFormOpen(false);
      } catch (err) {
        error('Failed to update password. Please try again.');
        console.error(err);
      } finally {
        setIsPasswordSaving(false);
        helpers.setSubmitting(false);
      }
    },
  });

  const handleLogout = () => {
    AuthService.logout();
    navigate('/');
  };

  const fullName = useMemo(() => {
    if (!user) return '';
    return [user.name, user.surname].filter(Boolean).join(' ');
  }, [user]);

  const initials = useMemo(() => {
    const source = fullName || user?.email || 'AA';
    return source
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }, [fullName, user?.email]);

  const completionItems = useMemo(
    () => [
      { label: 'First name', complete: Boolean(user?.name) },
      { label: 'Last name', complete: Boolean(user?.surname) },
      { label: 'Email address', complete: Boolean(user?.email) },
    ],
    [user],
  );

  const profileCompletion = Math.round(
    (completionItems.filter((item) => item.complete).length / completionItems.length) * 100,
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafcff] pt-24 dark:bg-slate-950">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-[#7928CA]" />
          <p className="mt-4 font-semibold text-gray-900 dark:text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fafcff] px-4 pb-12 pt-32 dark:bg-slate-950">
        <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-slate-950">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">Access Denied</h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-slate-400">Unable to load profile information.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-8 rounded-xl bg-gradient-to-r from-[#FF0080] via-[#7928CA] to-[#0070F3] px-8 py-3 font-semibold text-white shadow-[0_16px_36px_rgba(121,40,202,0.2)] transition-all duration-300 hover:scale-[1.01]"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbfdff_0%,#ffffff_48%,#f8fbff_100%)] px-4 pb-10 pt-28 transition-colors duration-300 dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_48%,#111827_100%)]">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
          <div>
            <ProfileSidebar
              user={user}
              fullName={fullName}
              initials={initials}
              profileCompletion={profileCompletion}
              completionItems={completionItems}
              onEdit={() => setIsEditing(true)}
            />
          </div>

          <div className="space-y-5">
            <ProfileCard
              title="Personal Information"
              description="Update your account details while keeping your existing profile data intact."
            >
              {isEditing ? (
                <form onSubmit={formik.handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <ProfileField
                      label="First Name"
                      name="name"
                      type="text"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="John"
                      touched={formik.touched.name}
                      error={formik.errors.name}
                    />
                    <ProfileField
                      label="Last Name"
                      name="surname"
                      type="text"
                      value={formik.values.surname}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Doe"
                      touched={formik.touched.surname}
                      error={formik.errors.surname}
                    />
                  </div>

                  <ProfileField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="your@email.com"
                    touched={formik.touched.email}
                    error={formik.errors.email}
                  />

                  <div className="grid gap-3 border-t border-gray-200 pt-4 dark:border-white/10 sm:grid-cols-2 xl:grid-cols-3">
                    <Button
                      type="submit"
                      disabled={!formik.isValid || isSaving}
                      className="h-10 rounded-xl bg-gradient-to-r from-[#FF0080] via-[#7928CA] to-[#0070F3] text-sm text-white shadow-[0_18px_40px_rgba(121,40,202,0.22)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_24px_50px_rgba(121,40,202,0.26)] disabled:opacity-50"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>

                    <Button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        formik.resetForm();
                      }}
                      className="h-10 rounded-xl bg-gray-100 text-sm text-gray-700 transition-all duration-200 hover:bg-gray-200 dark:bg-white/8 dark:text-slate-200 dark:hover:bg-white/12"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>

                    <Button
                      type="button"
                      onClick={() => navigate('/')}
                      className="h-10 rounded-xl bg-gray-100 text-sm text-gray-700 transition-all duration-200 hover:bg-gray-200 dark:bg-white/8 dark:text-slate-200 dark:hover:bg-white/12"
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Home
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  <ProfileInfoRow label="Full Name" value={fullName} />
                  <ProfileInfoRow label="Email" value={user.email} />
                  <ProfileInfoRow label="First Name" value={user.name} />
                  <ProfileInfoRow label="Last Name" value={user.surname} />
                </div>
              )}
            </ProfileCard>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
              <ProfileCard
                title="Account Settings"
                description="Core identity and access information for your account."
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3.5 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-[#7928CA]/10 p-2 text-[#7928CA]">
                        <UserRound className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-gray-900 dark:text-white">User ID</p>
                        <p className="mt-1 break-all text-[12px] text-gray-600 dark:text-slate-400">{user.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3.5 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-[#0070F3]/10 p-2 text-[#0070F3]">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-gray-900 dark:text-white">Role</p>
                        <p className="mt-1 text-[12px] text-gray-600 dark:text-slate-400">{user.userType}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3.5 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
                        {user.isLoggedIn ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-gray-900 dark:text-white">Login Status</p>
                        <p className="mt-1 text-[12px] text-gray-600 dark:text-slate-400">
                          {user.isLoggedIn ? 'Logged in and active' : 'Currently logged out'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3.5 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-[#FF0080]/10 p-2 text-[#FF0080]">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-gray-900 dark:text-white">Password Update</p>
                        <a
                          href="#profile-password"
                          className="mt-1 inline-block text-[12px] font-medium text-[#7928CA] transition hover:text-[#FF0080] dark:text-[#38BDF8]"
                        >
                          Update your password below
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3 border-t border-gray-200 pt-4 dark:border-white/10">
                  {!isEditing && (
                    <Button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="h-10 rounded-xl bg-gradient-to-r from-[#FF0080] via-[#7928CA] to-[#0070F3] text-sm text-white shadow-[0_18px_40px_rgba(121,40,202,0.22)] transition-all duration-300 hover:scale-[1.01]"
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={() => navigate('/')}
                    className="h-10 rounded-xl bg-gray-100 text-sm text-gray-700 transition-all duration-200 hover:bg-gray-200 dark:bg-white/8 dark:text-slate-200 dark:hover:bg-white/12"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Back Home
                  </Button>
                  <Button
                    type="button"
                    onClick={handleLogout}
                    className="h-10 rounded-xl bg-gray-100 text-sm text-gray-700 transition-all duration-200 hover:bg-gray-200 dark:bg-white/8 dark:text-slate-200 dark:hover:bg-white/12"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </ProfileCard>

              <ProfileCard
                title="Security"
                description="Update your password and keep your account secure."
              >
                {isPasswordFormOpen ? (
                  <form
                    id="profile-password"
                    onSubmit={passwordFormik.handleSubmit}
                    className="space-y-4"
                  >
                    <ProfileField
                      label="New Password"
                      name="password"
                      type="password"
                      value={passwordFormik.values.password}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                      placeholder="Enter a new password"
                      touched={passwordFormik.touched.password}
                      error={passwordFormik.errors.password}
                    />

                    <ProfileField
                      label="Confirm Password"
                      name="confirmPassword"
                      type="password"
                      value={passwordFormik.values.confirmPassword}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                      placeholder="Re-enter your new password"
                      touched={passwordFormik.touched.confirmPassword}
                      error={passwordFormik.errors.confirmPassword}
                    />

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3.5 dark:border-white/10 dark:bg-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-gray-700 dark:text-slate-300">
                          Password requirements
                        </span>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-slate-500">
                          8+ characters
                        </span>
                      </div>
                      <div className="mt-3 space-y-1.5 text-[12px] text-gray-600 dark:text-slate-400">
                        <p>Choose a password with at least 8 characters.</p>
                        <p>Both password fields must match before saving.</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-4 dark:border-white/10">
                      <Button
                        type="submit"
                        disabled={!passwordFormik.isValid || isPasswordSaving}
                        className="h-10 rounded-xl bg-gradient-to-r from-[#FF0080] via-[#7928CA] to-[#0070F3] text-sm text-white shadow-[0_18px_40px_rgba(121,40,202,0.22)] transition-all duration-300 hover:scale-[1.01] disabled:opacity-50"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {isPasswordSaving ? 'Updating...' : 'Update Password'}
                      </Button>

                      <Button
                        type="button"
                        onClick={() => {
                          passwordFormik.resetForm();
                          setIsPasswordFormOpen(false);
                        }}
                        className="h-10 rounded-xl bg-gray-100 text-sm text-gray-700 transition-all duration-200 hover:bg-gray-200 dark:bg-white/8 dark:text-slate-200 dark:hover:bg-white/12"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3.5 dark:border-white/10 dark:bg-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-gray-700 dark:text-slate-300">
                          Password protection
                        </span>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-slate-500">
                          Secure
                        </span>
                      </div>
                      <div className="mt-3 space-y-1.5 text-[12px] text-gray-600 dark:text-slate-400">
                        <p>Keep your account secure by updating your password when needed.</p>
                        <p>Click below only if you want to change your current password.</p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={() => setIsPasswordFormOpen(true)}
                      className="h-10 rounded-xl bg-gradient-to-r from-[#FF0080] via-[#7928CA] to-[#0070F3] text-sm text-white shadow-[0_18px_40px_rgba(121,40,202,0.22)] transition-all duration-300 hover:scale-[1.01] disabled:opacity-50"
                    >
                      Change Password
                    </Button>
                  </div>
                )}
              </ProfileCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
