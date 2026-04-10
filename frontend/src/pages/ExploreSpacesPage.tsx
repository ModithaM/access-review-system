import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Search,
  MapPin,
  X,
  Building2,
  Leaf,
  Activity,
  CloudSun,
  Train,
  Loader2,
  Navigation,
  AlertTriangle,
  Tag,
  ChevronRight,
  Info,
  LayoutList,
  MessageSquare,
  Star,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthService from '@/services/auth.service';
import publicSpaceService from '@/services/public-space.service';
import reviewService from '@/services/review.service';
import type { PublicSpace, SpaceCategory } from '@/types/publicSpace.type';
import type { AccessibilityReview } from '@/types/review.type';

// Category config

const CATEGORY_COLOR: Record<SpaceCategory, string> = {
  Mall: '#7928CA',
  Park: '#16a34a',
  Hospital: '#ef4444',
  Station: '#0070F3',
  Other: '#6b7280',
};

const CATEGORY_BG: Record<SpaceCategory, string> = {
  Mall: '#f3e8ff',
  Park: '#dcfce7',
  Hospital: '#fee2e2',
  Station: '#dbeafe',
  Other: '#f3f4f6',
};

const CATEGORY_ICON: Record<SpaceCategory, React.ReactNode> = {
  Mall: <Building2 className="w-4 h-4" />,
  Park: <Leaf className="w-4 h-4" />,
  Hospital: <Activity className="w-4 h-4" />,
  Station: <Train className="w-4 h-4" />,
  Other: <MapPin className="w-4 h-4" />,
};

const FEATURE_CATEGORY_COLOR: Record<string, string> = {
  Mobility: '#0070F3',
  Visual: '#7928CA',
  Auditory: '#16a34a',
  Cognitive: '#f59e0b',
  Other: '#6b7280',
};

const WEATHER_CODE_LABELS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  80: 'Rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

// Helpers

const hasValidCoords = (space: PublicSpace): boolean => {
  const { lat, lng } = space.locationDetails.coordinates;
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    (lat !== 0 || lng !== 0) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

// Custom map marker

const createMarkerIcon = (category: SpaceCategory, isSelected = false) => {
  const color = isSelected ? '#FF0080' : (CATEGORY_COLOR[category] ?? '#6b7280');
  const size = isSelected ? 42 : 34;
  const innerSize = Math.round(size * 0.32);

  return L.divIcon({
    className: '',
    html: `<div style="position:relative;width:${size}px;height:${size}px">
      <div style="width:${size}px;height:${size}px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 14px rgba(0,0,0,0.25)"></div>
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-60%);width:${innerSize}px;height:${innerSize}px;background:white;border-radius:50%;opacity:0.85"></div>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -(size + 6)],
  });
};

// Map fly-to controller

function MapController({ target }: { target: { coords: [number, number]; id: string } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo(target.coords, 16, { duration: 1.2, easeLinearity: 0.35 });
    }
  }, [target, map]);
  return null;
}

//Space card

interface SpaceCardProps {
  space: PublicSpace;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

function SpaceCard({ space, isSelected, onClick, index }: SpaceCardProps) {
  const color = CATEGORY_COLOR[space.category] ?? '#6b7280';
  const bg = CATEGORY_BG[space.category] ?? '#f3f4f6';
  const icon = CATEGORY_ICON[space.category];

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: Math.min(index * 0.035, 0.4) }}
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-3 transition-all group ${
        isSelected
          ? 'border-[#7928CA]/50 bg-white dark:bg-gray-800 shadow-md shadow-[#7928CA]/10'
          : 'border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800/40 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
          style={{ background: `linear-gradient(135deg, ${color}cc, ${color})` }}
        >
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-bold truncate leading-snug ${
              isSelected ? 'text-[#7928CA] dark:text-purple-400' : 'text-gray-900 dark:text-white'
            }`}
          >
            {space.name}
          </p>

          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-1 inline-flex items-center gap-1"
            style={{ color, backgroundColor: bg }}
          >
            {space.category}
          </span>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-start gap-1 leading-tight">
            <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-gray-400" />
            <span className="line-clamp-2">{space.locationDetails.address}</span>
          </p>

          {space.accessFeatures && space.accessFeatures.length > 0 && (
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
              {space.accessFeatures.length} accessibility feature
              {space.accessFeatures.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        <ChevronRight
          className={`shrink-0 w-4 h-4 mt-1 transition-all ${
            isSelected
              ? 'text-[#7928CA]'
              : 'text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400'
          }`}
        />
      </div>
    </motion.button>
  );
}

// detail modal

function SpaceDetailModal({ space, onClose }: { space: PublicSpace; onClose: () => void }) {
  const color = CATEGORY_COLOR[space.category] ?? '#6b7280';
  const icon = CATEGORY_ICON[space.category];
  const coords = space.locationDetails.coordinates;
  const mapsUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
  const currentUserId = AuthService.getCurrentUser()?.user?.id;

  const [reviews, setReviews] = useState<AccessibilityReview[]>([]);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [averageRating, setAverageRating] = useState('0.00');
  const [weatherText, setWeatherText] = useState<string | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [isDeletingReview, setIsDeletingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    title: '',
    comment: '',
    rating: 5,
  });

  const ownReview = useMemo(() => {
    if (!currentUserId) {
      return null;
    }

    return (
      reviews.find((review) => {
        if (typeof review.userId === 'string') {
          return review.userId === currentUserId;
        }

        return review.userId?._id === currentUserId;
      }) || null
    );
  }, [reviews, currentUserId]);

  const getReviewerLabel = (reviewer: AccessibilityReview['userId']) => {
    if (typeof reviewer === 'string') {
      return reviewer;
    }

    const name = [reviewer?.name, reviewer?.surname].filter(Boolean).join(' ').trim();
    return name || reviewer?.email || 'Anonymous';
  };

  const loadSpaceReviews = useCallback(async () => {
    if (!space._id) {
      return;
    }

    setReviewsLoading(true);
    setReviewsError(null);
    setWeatherText('Loading weather context...');

    try {
      const [reviewsRes, summaryRes, weatherRes] = await Promise.all([
        reviewService.getReviewsBySpace(space._id, 1, 20),
        reviewService.getSpaceSummary(space._id),
        reviewService.getSpaceWeather(space._id).catch(() => null),
      ]);

      setReviews(reviewsRes.data.result || []);
      setReviewsCount(summaryRes.data.result?.reviewsCount ?? 0);
      setAverageRating(summaryRes.data.result?.averageRating ?? '0.00');

      if (weatherRes?.data?.result?.weather) {
        const weather = weatherRes.data.result.weather;
        const units = weatherRes.data.result.units;
        const weatherCode = weather?.weather_code ?? -1;
        const weatherLabel = WEATHER_CODE_LABELS[weatherCode] || 'Weather unavailable';
        const temperature = weather?.temperature_2m;
        const windSpeed = weather?.wind_speed_10m;
        const tempUnit = units?.temperature_2m || 'degC';
        const windUnit = units?.wind_speed_10m || 'km/h';

        setWeatherText(
          `${weatherLabel} · ${temperature ?? 'N/A'}${tempUnit} · Wind ${windSpeed ?? 'N/A'} ${windUnit}`,
        );
      } else {
        setWeatherText('Weather context is currently unavailable for this space.');
      }
    } catch (err: unknown) {
      setReviewsError('Failed to load space reviews.');
      console.error(err);
    } finally {
      setReviewsLoading(false);
    }
  }, [space._id]);

  useEffect(() => {
    loadSpaceReviews();
  }, [loadSpaceReviews]);

  useEffect(() => {
    if (!ownReview) {
      setReviewForm({ title: '', comment: '', rating: 5 });
      return;
    }

    setReviewForm({
      title: ownReview.title || '',
      comment: ownReview.comment || '',
      rating: ownReview.rating || 5,
    });
  }, [ownReview?._id, ownReview?.title, ownReview?.comment, ownReview?.rating]);

  const submitReview = async () => {
    if (!space._id || !currentUserId) {
      return;
    }

    if (reviewForm.comment.trim().length < 10) {
      setReviewsError('Review comment must be at least 10 characters.');
      return;
    }

    setIsSavingReview(true);
    setReviewsError(null);

    try {
      if (ownReview?._id) {
        await reviewService.updateReview(ownReview._id, {
          title: reviewForm.title,
          comment: reviewForm.comment,
          rating: reviewForm.rating,
        });
      } else {
        await reviewService.createReview({
          spaceId: space._id,
          title: reviewForm.title,
          comment: reviewForm.comment,
          rating: reviewForm.rating,
        });
      }

      await loadSpaceReviews();
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setReviewsError(message || 'Failed to save your review.');
      console.error(err);
    } finally {
      setIsSavingReview(false);
    }
  };

  const deleteOwnReview = async () => {
    if (!ownReview?._id) {
      return;
    }

    const confirmed = window.confirm('Delete your review for this space?');
    if (!confirmed) {
      return;
    }

    setIsDeletingReview(true);
    setReviewsError(null);

    try {
      await reviewService.deleteReview(ownReview._id);
      setReviewForm({ title: '', comment: '', rating: 5 });
      await loadSpaceReviews();
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setReviewsError(message || 'Failed to delete your review.');
      console.error(err);
    } finally {
      setIsDeletingReview(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-9999 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" />

      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 80, opacity: 0, scale: 0.97 }}
        transition={{ type: 'spring', damping: 28, stiffness: 340 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col"
      >
        {/* Brand stripe */}
        <div
          className="h-1.5 w-full shrink-0"
          style={{ background: 'linear-gradient(90deg,#FF0080,#7928CA,#0070F3)' }}
        />

        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
          <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>

        {/* Header image or gradient */}
        {space.imageUrl ? (
          <div className="shrink-0 h-44 overflow-hidden">
            <img src={space.imageUrl} alt={space.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div
            className="shrink-0 h-28 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${color}1a, ${color}0d)` }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg"
              style={{ background: `linear-gradient(135deg, ${color}cc, ${color})` }}
            >
              <span className="scale-150">{icon}</span>
            </div>
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Title */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                {space.name}
              </h2>
              <span
                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {icon}
                {space.category}
              </span>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Address */}
          <div className="flex items-start gap-3 p-3.5 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <MapPin className="w-4 h-4 text-[#7928CA] dark:text-purple-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-0.5">
                Location
              </p>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                {space.locationDetails.address}
              </p>
              {hasValidCoords(space) && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          {space.description && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-1.5">
                <Info className="w-3 h-3" />
                About
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {space.description}
              </p>
            </div>
          )}

          <div className="rounded-xl border border-sky-100 dark:border-sky-800/40 bg-linear-to-r from-sky-50/90 to-cyan-50/70 dark:from-sky-900/20 dark:to-cyan-900/15 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-9 w-9 shrink-0 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-sky-200/60 dark:border-sky-700/60 flex items-center justify-center">
                <CloudSun className="w-4 h-4 text-sky-600 dark:text-sky-300" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-sky-700/80 dark:text-sky-300/80">
                  Weather Context
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
                  {weatherText || 'Loading weather context...'}
                </p>
              </div>
            </div>
          </div>

          {/* Access features */}
          {space.accessFeatures && space.accessFeatures.length > 0 ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2.5 flex items-center gap-1.5">
                <Tag className="w-3 h-3" />
                Accessibility Features ({space.accessFeatures.length})
              </p>
              <div className="space-y-2">
                {space.accessFeatures.map((feature) => {
                  const fColor = FEATURE_CATEGORY_COLOR[feature.category ?? 'Other'] ?? '#6b7280';
                  return (
                    <div
                      key={feature._id}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60"
                    >
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: fColor }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {feature.name}
                        </p>
                        {feature.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                            {feature.description}
                          </p>
                        )}
                        {feature.category && (
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-1.5 inline-block"
                            style={{ color: fColor, backgroundColor: fColor + '22' }}
                          >
                            {feature.category}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                No accessibility features have been recorded for this space yet.
              </p>
            </div>
          )}

          <div className="rounded-xl border border-gray-100 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-800/70 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Review Snapshot
              </p>
              <button
                onClick={loadSpaceReviews}
                className="text-[11px] font-semibold text-[#7928CA] dark:text-purple-300 hover:underline"
              >
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 p-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Average Rating
                </p>
                <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                  {averageRating}/5
                </p>
              </div>
              <div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 p-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Total Reviews
                </p>
                <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                  {reviewsCount}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#7928CA]" />
              <p className="text-sm font-bold text-gray-900 dark:text-white">Community Reviews</p>
            </div>

            {reviewsLoading ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No reviews yet. Be the first to share your accessibility experience.
              </p>
            ) : (
              <div className="space-y-2.5">
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className="rounded-lg border border-gray-100 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-800 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                          {review.title?.trim() || 'Untitled review'}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                          {getReviewerLabel(review.userId)}
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {review.rating}/5
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3 rounded-xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-900 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {ownReview ? 'Update Your Review' : 'Write a Review'}
              </p>
              {!currentUserId && (
                <Link
                  to="/login"
                  className="text-[11px] font-semibold text-[#7928CA] dark:text-purple-300 hover:underline"
                >
                  Login to review
                </Link>
              )}
            </div>

            <input
              type="text"
              disabled={!currentUserId || isSavingReview || isDeletingReview}
              value={reviewForm.title}
              onChange={(event) =>
                setReviewForm((prev) => ({ ...prev, title: event.target.value }))
              }
              placeholder="Title (optional)"
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-900 dark:text-white outline-none focus:border-[#7928CA]"
            />

            <textarea
              rows={4}
              disabled={!currentUserId || isSavingReview || isDeletingReview}
              value={reviewForm.comment}
              onChange={(event) =>
                setReviewForm((prev) => ({ ...prev, comment: event.target.value }))
              }
              placeholder="Share details about accessibility, access features, and your experience."
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-900 dark:text-white outline-none focus:border-[#7928CA]"
            />

            <div className="flex items-center gap-2">
              <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                Rating
              </label>
              <select
                disabled={!currentUserId || isSavingReview || isDeletingReview}
                value={reviewForm.rating}
                onChange={(event) =>
                  setReviewForm((prev) => ({ ...prev, rating: Number(event.target.value) }))
                }
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:border-[#7928CA]"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </div>

            {reviewsError && (
              <p className="text-xs text-rose-600 dark:text-rose-300">{reviewsError}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={submitReview}
                disabled={!currentUserId || isSavingReview || isDeletingReview}
                className="flex-1 h-10 rounded-lg text-xs font-bold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#FF0080,#7928CA)' }}
              >
                {isSavingReview ? 'Saving...' : ownReview ? 'Update Review' : 'Submit Review'}
              </button>
              {ownReview && (
                <button
                  onClick={deleteOwnReview}
                  disabled={isSavingReview || isDeletingReview}
                  className="h-10 px-3 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50 inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {isDeletingReview ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="shrink-0 p-4 border-t border-gray-100 dark:border-gray-800 flex gap-2.5">
          {hasValidCoords(space) && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg,#0070F3,#7928CA)' }}
            >
              <Navigation className="w-4 h-4" />
              Get Directions
            </a>
          )}
          <Link
            to="/report-issue"
            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl font-bold text-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            Report Issue
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

//  Main page

type ViewMode = 'split' | 'list' | 'map';
type CategoryFilter = SpaceCategory | 'All';

const CATEGORIES: CategoryFilter[] = ['All', 'Mall', 'Park', 'Hospital', 'Station', 'Other'];

// Standard OSM tiles - no API key required
const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export default function ExploreSpacesPage() {
  const [spaces, setSpaces] = useState<PublicSpace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [view, setView] = useState<ViewMode>('split');

  const [selectedSpace, setSelectedSpace] = useState<PublicSpace | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [flyTarget, setFlyTarget] = useState<{ coords: [number, number]; id: string } | null>(null);

  // Load all spaces
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await publicSpaceService.getAllPublicSpaces();
        setSpaces(data);
      } catch {
        setError('Failed to load spaces. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Filtered list
  const filteredSpaces = useMemo(() => {
    let result = spaces;
    if (selectedCategory !== 'All') {
      result = result.filter((s) => s.category === selectedCategory);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.locationDetails.address.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q),
      );
    }
    return result;
  }, [spaces, selectedCategory, searchQuery]);

  // Only spaces with valid coordinates are shown as map markers
  const validSpaces = useMemo(() => filteredSpaces.filter(hasValidCoords), [filteredSpaces]);

  // Default map center: average of all valid coords, fallback Colombo, Sri Lanka
  const defaultCenter = useMemo<[number, number]>(() => {
    const valid = spaces.filter(hasValidCoords);
    if (valid.length === 0) return [6.9271, 79.8612];
    const avgLat =
      valid.reduce((s, sp) => s + sp.locationDetails.coordinates.lat, 0) / valid.length;
    const avgLng =
      valid.reduce((s, sp) => s + sp.locationDetails.coordinates.lng, 0) / valid.length;
    return [avgLat, avgLng];
  }, [spaces]);

  const handleSelectSpace = useCallback((space: PublicSpace) => {
    setSelectedSpace(space);
    setIsDetailOpen(true);
    if (hasValidCoords(space)) {
      setFlyTarget({
        coords: [space.locationDetails.coordinates.lat, space.locationDetails.coordinates.lng],
        id: space._id + Date.now(),
      });
    }
  }, []);

  const closeDetail = useCallback(() => {
    setIsDetailOpen(false);
  }, []);

  // Category chip counts
  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<SpaceCategory, number>> = {};
    for (const sp of spaces) {
      counts[sp.category] = (counts[sp.category] ?? 0) + 1;
    }
    return counts;
  }, [spaces]);

  const showSidebar = view === 'list' || view === 'split';
  const showMap = view === 'map' || view === 'split';

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="h-32 shrink-0" />

      {/* Control bar */}
      <div className="shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Title */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-linear-to-br from-[#FF0080] via-[#7928CA] to-[#0070F3] shadow-lg shadow-[#7928CA]/20">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-black tracking-tight text-gray-900 dark:text-white leading-none">
                  Explore Spaces
                </h1>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                  {isLoading
                    ? 'Loading…'
                    : `${filteredSpaces.length} space${filteredSpaces.length !== 1 ? 's' : ''} found`}
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or address…"
                className="w-full pl-9 pr-9 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7928CA]/25 focus:border-[#7928CA] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 shrink-0">
              {(
                [
                  { value: 'split', label: 'Both' },
                  { value: 'list', label: 'List' },
                  { value: 'map', label: 'Map' },
                ] as { value: ViewMode; label: string }[]
              ).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setView(value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    view === value
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Category filter chips */}
          <div className="flex gap-1.5 mt-2.5 flex-wrap">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              const color = cat === 'All' ? '#374151' : (CATEGORY_COLOR[cat] ?? '#6b7280');
              const count = cat === 'All' ? spaces.length : (categoryCounts[cat] ?? 0);
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    isActive
                      ? 'text-white border-transparent shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-transparent'
                  }`}
                  style={isActive ? { backgroundColor: color, borderColor: color } : {}}
                >
                  {cat !== 'All' && CATEGORY_ICON[cat]}
                  {cat}
                  <span
                    className={`text-[10px] font-semibold ${
                      isActive ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {showSidebar && (
          <div
            className={`shrink-0 flex-col border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 overflow-hidden ${
              view === 'list' ? 'flex flex-1' : 'hidden md:flex w-80 xl:w-96'
            }`}
          >
            <div className="flex-1 overflow-y-auto p-3">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-24">
                  <Loader2 className="w-8 h-8 text-[#7928CA] animate-spin" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loading spaces…</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-24">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                  <p className="text-sm text-red-500 dark:text-red-400 text-center">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-xs font-bold text-[#7928CA] dark:text-purple-400 hover:underline"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredSpaces.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-24">
                  <MapPin className="w-9 h-9 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center font-medium">
                    No spaces found
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                    Try adjusting your search or filters
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="mt-1 text-xs font-bold text-[#7928CA] dark:text-purple-400 hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredSpaces.map((space, i) => (
                    <SpaceCard
                      key={space._id}
                      space={space}
                      isSelected={selectedSpace?._id === space._id}
                      onClick={() => handleSelectSpace(space)}
                      index={i}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer count */}
            {!isLoading && !error && filteredSpaces.length > 0 && (
              <div className="shrink-0 px-4 py-2.5 border-t border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-900">
                <p className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                  <LayoutList className="w-3 h-3" />
                  {filteredSpaces.length} space{filteredSpaces.length !== 1 ? 's' : ''} listed
                  {validSpaces.length < filteredSpaces.length && (
                    <span>· {validSpaces.length} on map</span>
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Map*/}
        {showMap && (
          <div
            className="flex-1 relative overflow-hidden min-h-0 bg-[#e8eaed]"
            style={{ colorScheme: 'light' }}
          >
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-[#7928CA] animate-spin" />
                  <p className="text-sm text-gray-500">Loading map…</p>
                </div>
              </div>
            ) : (
              <MapContainer
                center={defaultCenter}
                zoom={spaces.filter(hasValidCoords).length > 0 ? 13 : 8}
                style={{ width: '100%', height: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} />
                <MapController target={flyTarget} />

                {validSpaces.map((space) => (
                  <Marker
                    key={space._id}
                    position={[
                      space.locationDetails.coordinates.lat,
                      space.locationDetails.coordinates.lng,
                    ]}
                    icon={createMarkerIcon(space.category, selectedSpace?._id === space._id)}
                    eventHandlers={{ click: () => handleSelectSpace(space) }}
                  >
                    <Popup>
                      <div className="min-w-42.5 p-1">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: CATEGORY_COLOR[space.category] ?? '#6b7280' }}
                        >
                          {space.category}
                        </span>
                        <p className="font-bold text-gray-900 text-sm mt-1 leading-tight">
                          {space.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 flex items-start gap-1">
                          <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                          {space.locationDetails.address}
                        </p>
                        <button
                          onClick={() => handleSelectSpace(space)}
                          className="mt-2 w-full text-xs font-bold py-1.5 px-3 rounded-lg text-white transition-opacity hover:opacity-90"
                          style={{ background: 'linear-gradient(135deg,#FF0080,#7928CA)' }}
                        >
                          View Details
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}

            {/* No valid coordinates notice */}
            {!isLoading && filteredSpaces.length > 0 && validSpaces.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100/75 backdrop-blur-sm pointer-events-none">
                <div className="bg-white rounded-2xl p-6 shadow-xl text-center max-w-xs mx-4">
                  <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="font-semibold text-gray-700 text-sm">No map locations available</p>
                  <p className="text-xs text-gray-500 mt-1">
                    The filtered spaces don't have coordinates set yet
                  </p>
                </div>
              </div>
            )}

            {/* Mobile: "view list" button in split mode */}
            {view === 'split' && (
              <button
                onClick={() => setView('list')}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 md:hidden flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-gray-200 shadow-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors z-1000"
              >
                <LayoutList className="w-4 h-4" />
                View List ({filteredSpaces.length})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {isDetailOpen && selectedSpace && (
          <SpaceDetailModal space={selectedSpace} onClose={closeDetail} />
        )}
      </AnimatePresence>
    </div>
  );
}
