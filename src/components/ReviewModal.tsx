import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, CheckCircle2, User, Building, MessageSquare, Sparkles } from 'lucide-react';

export interface NewReviewData {
  name: string;
  role: string;
  testimonial: string;
  rating: number;
  avatar: string;
}

const AVATAR_OPTIONS = [
  { id: '1', label: 'Tech Lead', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
  { id: '2', label: 'VP Product', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80' },
  { id: '3', label: 'Founder', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
  { id: '4', label: 'Engineering Dir', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
  { id: '5', label: 'CTO', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80' },
  { id: '6', label: 'Architect', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80' }
];

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (review: NewReviewData) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmitReview
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [testimonial, setTestimonial] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0].url);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!testimonial.trim()) {
      setError('Please write your review / feedback.');
      return;
    }

    setError('');
    setSubmitted(true);

    setTimeout(() => {
      onSubmitReview({
        name: name.trim(),
        role: role.trim() || 'Verified Partner',
        testimonial: testimonial.trim(),
        rating,
        avatar: selectedAvatar
      });

      // Reset form
      setName('');
      setRole('');
      setTestimonial('');
      setRating(5);
      setSubmitted(false);
      onClose();
    }, 900);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg bg-[#111116] border border-neutral-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden z-10 my-8"
          >
            {/* Red Accent Top Border */}
            <div className="h-1 w-full bg-gradient-to-r from-[#e61e2b] via-red-500 to-[#e61e2b]" />

            {/* Header */}
            <div className="p-5 sm:p-6 pb-4 flex items-start justify-between border-b border-neutral-800/80">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#e61e2b] font-semibold mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Verified Endorsement</span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl text-white font-bold tracking-tight">
                  Write a Client Review
                </h3>
                <p className="text-neutral-400 text-xs sm:text-sm mt-0.5">
                  Share your collaboration experience with Bikram Ghosh & Tech Base Axis.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors"
                aria-label="Close review dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              /* Success State */
              <div className="p-8 sm:p-10 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-red-950/60 border border-red-800 text-[#e61e2b] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-white">Review Submitted!</h4>
                <p className="text-neutral-300 text-sm max-w-sm mx-auto">
                  Thank you for your feedback. Your review is now live in the Client Reviews section.
                </p>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-950/50 border border-red-900/80 text-xs text-red-200 font-mono">
                    {error}
                  </div>
                )}

                {/* Rating selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-neutral-300 block">
                    Your Rating
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((starVal) => {
                      const active = (hoverRating || rating) >= starVal;
                      return (
                        <button
                          key={starVal}
                          type="button"
                          onMouseEnter={() => setHoverRating(starVal)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(starVal)}
                          className="p-1 text-neutral-600 hover:scale-110 transition-transform cursor-pointer"
                          aria-label={`${starVal} Star`}
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              active
                                ? 'fill-[#e61e2b] text-[#e61e2b]'
                                : 'text-neutral-700'
                            }`}
                          />
                        </button>
                      );
                    })}
                    <span className="text-xs font-mono text-neutral-400 ml-2">
                      {rating === 5 ? '5.0 (Outstanding)' : `${rating}.0 / 5.0`}
                    </span>
                  </div>
                </div>

                {/* Name & Role Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Full Name *</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-900/90 border border-neutral-800 text-sm text-white focus:outline-none focus:border-[#e61e2b] transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Role & Company</span>
                    </label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-900/90 border border-neutral-800 text-sm text-white focus:outline-none focus:border-[#e61e2b] transition-colors"
                    />
                  </div>
                </div>

                {/* Avatar Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-neutral-300 block">
                    Select Profile Avatar
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {AVATAR_OPTIONS.map((av) => {
                      const isSelected = selectedAvatar === av.url;
                      return (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setSelectedAvatar(av.url)}
                          className={`relative shrink-0 rounded-lg p-0.5 border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#e61e2b] scale-105 shadow-[0_0_12px_rgba(230,30,43,0.5)]'
                              : 'border-neutral-800 opacity-60 hover:opacity-100'
                          }`}
                          title={av.label}
                        >
                          <img
                            src={av.url}
                            alt={av.label}
                            className="w-9 h-9 object-cover rounded-md"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Testimonial Text */}
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Your Review / Feedback *</span>
                  </label>
                  <textarea
                    rows={4}
                    value={testimonial}
                    onChange={(e) => setTestimonial(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-900/90 border border-neutral-800 text-sm text-white focus:outline-none focus:border-[#e61e2b] transition-colors resize-none"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-800/80">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg border border-neutral-800 text-xs font-mono text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#e61e2b] hover:bg-[#c81924] text-white font-semibold text-xs font-mono uppercase tracking-wider shadow-[0_0_20px_rgba(230,30,43,0.45)] transition-all cursor-pointer"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
