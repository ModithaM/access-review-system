import { motion, type Variants } from 'framer-motion';
import { Search, MapPin, Star, Accessibility } from 'lucide-react';
import { Iphone } from '../ui/iphone';

const CARDS = [
  {
    id: 1,
    name: 'City Mall',
    rating: 4.8,
    distance: '1.2 km',
    tags: ['Ramp', 'Elevator', 'Braille'],
    verified: true,
  },
  {
    id: 2,
    name: 'Central Park',
    rating: 4.5,
    distance: '3.0 km',
    tags: ['Ramp', 'Quiet Zone'],
    verified: true,
  },
  {
    id: 3,
    name: 'Metro Hub',
    rating: 4.2,
    distance: '5.5 km',
    tags: ['Elevator'],
    verified: false,
  },
];

export default function CtaSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const phoneAppVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.5 },
    },
  };

  const phoneItemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <section className="relative w-full overflow-hidden bg-white px-4 py-24 transition-colors duration-300 dark:bg-slate-950 sm:px-6 lg:px-8">
      {/* Decorative Blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-[#FF0080]/10 via-[#7928CA]/10 to-[#38BDF8]/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto">
        <motion.div
          className="relative overflow-hidden rounded-[3rem] border border-white/50 bg-white/60 shadow-2xl shadow-[#7928CA]/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75 dark:shadow-black/25"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Subtle inner gradient highlight */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF0080]/5 via-[#7928CA]/5 to-[#38BDF8]/10 pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-16 items-center p-8 lg:p-16 relative z-10">
            {/* Left Content */}
            <motion.div
              variants={containerVariants}
              className="max-w-2xl text-left space-y-8 pb-12 lg:pb-0"
            >
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center space-x-2 rounded-full border border-blue-100 bg-blue-50/80 px-4 py-2 backdrop-blur-sm dark:border-blue-400/20 dark:bg-blue-400/10"
              >
                <Accessibility className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
                  Built for Inclusive Exploration
                </span>
              </motion.div>

              <motion.h2
                variants={itemVariants}
                className="text-5xl font-extrabold leading-[1.15] tracking-tight text-gray-900 dark:text-white lg:text-6xl"
              >
                Help Build More <br />
                <span className="bg-brand-gradient text-transparent bg-clip-text pr-2">
                  Accessible Public Spaces
                </span>
              </motion.h2>

              <motion.p
                variants={itemVariants}
                className="max-w-xl text-lg leading-relaxed text-gray-600 dark:text-slate-300"
              >
                Discover accessible places, share real experiences, and help others navigate public
                spaces with confidence. Your review can make every journey easier.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
                <motion.a
                  href="/spaces"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0px 10px 30px -10px rgba(0, 112, 243, 0.5)',
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex justify-center items-center px-8 py-4 text-base font-semibold text-white bg-brand-gradient rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/25 transition-all"
                >
                  Explore Spaces
                </motion.a>
                <motion.a
                  href="/write-review"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white/80 px-8 py-4 text-base font-semibold text-gray-700 shadow-sm transition-all backdrop-blur-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 dark:border-white/10 dark:bg-white/8 dark:text-slate-100 dark:hover:bg-white/12"
                >
                  Write a Review
                </motion.a>
              </motion.div>

              {/* Floating trust badges below */}
              <motion.div variants={itemVariants} className="flex items-center gap-6 pt-8 pb-2">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">1,200+</span>
                  <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Real Reviews</span>
                </div>
                <div className="h-10 w-px bg-gray-200 dark:bg-white/10"></div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">250+</span>
                  <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Accessible Spaces</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Side - Phone Mockup */}
            <motion.div
              className="relative flex justify-center lg:justify-end items-center"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Floating Mini Card Outside Phone */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute top-24 -left-16 z-20 hidden items-center gap-4 rounded-2xl border border-white bg-white/90 p-4 shadow-xl shadow-[#7928CA]/10 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/90 dark:shadow-black/20 md:flex lg:top-32 lg:-left-24"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  JS
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    "Perfect wheelchair access!"
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Jane S. reviewed City Mall</p>
                </div>
              </motion.div>

              <div className="w-[280px] sm:w-[320px] lg:w-[340px] drop-shadow-2xl">
                <Iphone className="w-full h-auto">
                  {/* Internal Phone App UI */}
                  <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#f8fafc] px-4 pt-12 pb-6 dark:bg-slate-950">
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={phoneAppVariants}
                      className="space-y-4"
                    >
                      {/* Search Bar */}
                      <motion.div
                        variants={phoneItemVariants}
                        className="flex items-center gap-3 rounded-full border border-gray-100 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-slate-900"
                      >
                        <Search className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                        <span className="text-sm text-gray-400 dark:text-slate-500">Search accessible places...</span>
                      </motion.div>

                      {/* Animated Tag Row */}
                      <motion.div
                        variants={phoneItemVariants}
                        className="flex gap-2 p-1 overflow-hidden"
                      >
                        <span className="px-3 py-1 bg-brand-gradient text-white text-[10px] rounded-full font-medium whitespace-nowrap shadow-md shadow-pink-500/20">
                          All
                        </span>
                        <span className="whitespace-nowrap rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] font-medium text-gray-600 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
                          Ramp
                        </span>
                        <span className="whitespace-nowrap rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] font-medium text-gray-600 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
                          Braille
                        </span>
                      </motion.div>

                      {/* Map Pin Pulse animation */}
                      <motion.div
                        variants={phoneItemVariants}
                        className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/50 dark:border-blue-400/20 dark:bg-blue-400/8"
                      >
                        <div className="absolute inset-0 bg-[url('https://maps.gstatic.com/tactile/basemap/roadmap-2x.png')] bg-cover opacity-20 filter grayscale"></div>

                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center absolute z-10"
                        >
                          <MapPin className="w-6 h-6 text-blue-600 fill-blue-600" />
                        </motion.div>
                      </motion.div>

                      {/* List of Places */}
                      <div className="space-y-3 relative z-20">
                        {CARDS.map((card, i) => (
                          <motion.div
                            key={card.id}
                            variants={phoneItemVariants}
                            className="group relative flex flex-col gap-2 overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-slate-900"
                          >
                            {/* Shimmer effect inside phone */}
                            <motion.div
                              animate={{ x: ['-100%', '200%'] }}
                              transition={{
                                duration: 3,
                                delay: i * 0.5,
                                repeat: Infinity,
                                ease: 'linear',
                              }}
                              className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 z-10"
                            />

                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="pb-1 text-sm font-bold text-gray-900 dark:text-white">
                                  {card.name}
                                </h4>
                                <p className="text-[10px] text-gray-500 dark:text-slate-400">{card.distance} away</p>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="flex items-center rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-600 text-gray-900 dark:bg-amber-500/12 dark:text-amber-300">
                                  {card.rating}{' '}
                                  <Star className="w-3 h-3 ml-1 fill-amber-400 text-amber-400" />
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1 pt-1">
                              {card.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-md border border-gray-100 bg-gray-50 px-2 py-0.5 text-[9px] text-gray-600 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300"
                                >
                                  {tag}
                                </span>
                              ))}
                              {card.verified && (
                                <motion.span
                                  animate={{ opacity: [0.8, 1, 0.8] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="flex items-center rounded-md border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[9px] font-semibold text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-300"
                                >
                                  Verified Access
                                </motion.span>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </Iphone>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
