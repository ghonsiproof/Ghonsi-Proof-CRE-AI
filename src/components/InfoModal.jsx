import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * InfoModal - A reusable modal component for displaying information, alerts, and confirmations
 * 
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Function to close the modal
 * @param {string} title - Modal title
 * @param {string} message - Modal message/content
 * @param {string} type - Type of modal: 'info' | 'success' | 'warning' | 'error'
 * @param {Array} actions - Array of action buttons [{ label, onClick, primary? }]
 * @param {React.ReactNode} children - Optional children to render instead of message
 * @param {boolean} showCloseButton - Whether to show close button (default true)
 */
const InfoModal = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  actions = [],
  children,
  showCloseButton = true,
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'fa-check-circle',
          iconColor: 'text-green-400',
          iconBg: 'bg-green-500/20',
          borderColor: 'from-green-500 via-[#C19A4A] to-blue-500',
          borderHex: '#22c55e',
        };
      case 'warning':
        return {
          icon: 'fa-triangle-exclamation',
          iconColor: 'text-yellow-400',
          iconBg: 'bg-yellow-500/20',
          borderColor: 'from-yellow-500 via-orange-500 to-red-500',
          borderHex: '#eab308',
        };
      case 'error':
        return {
          icon: 'fa-circle-xmark',
          iconColor: 'text-red-400',
          iconBg: 'bg-red-500/20',
          borderColor: 'from-red-500 via-red-600 to-red-700',
          borderHex: '#ef4444',
        };
      case 'info':
      default:
        return {
          icon: 'fa-circle-info',
          iconColor: 'text-blue-400',
          iconBg: 'bg-blue-500/20',
          borderColor: 'from-[#C19A4A] via-[#d9b563] to-blue-500',
          borderHex: '#C19A4A',
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#0B0F1B]/90 backdrop-blur-sm z-[70] flex items-center justify-center px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && showCloseButton) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className={`relative p-[2px] rounded-2xl bg-gradient-to-br ${typeStyles.borderColor} max-w-sm w-full shadow-2xl`}
          >
            <div className="bg-[#111625] rounded-[14px] p-6 relative overflow-hidden">
              {/* Background glow */}
              <div 
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(193,154,74,0.1)_0%,transparent_70%)]" 
                style={{ 
                  background: `radial-gradient(circle at center, ${typeStyles.borderHex}15 0%, transparent 70%)` 
                }} 
              />

              {/* Close button */}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors z-20"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}

              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
                    className={`w-14 h-14 rounded-full ${typeStyles.iconBg} flex items-center justify-center`}
                  >
                    <i className={`fa-solid ${typeStyles.icon} ${typeStyles.iconColor} text-2xl`}></i>
                  </motion.div>
                </div>

                {/* Title */}
                {title && (
                  <h3 className="text-lg font-bold text-white text-center mb-2">
                    {title}
                  </h3>
                )}

                {/* Message or Children */}
                {message && (
                  <p className="text-gray-400 text-sm text-center leading-relaxed mb-4">
                    {message}
                  </p>
                )}
                
                {children && <div className="mb-4">{children}</div>}

                {/* Actions */}
                {actions.length > 0 && (
                  <div className={`flex gap-3 ${actions.length === 1 ? 'justify-center' : ''}`}>
                    {actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={action.onClick}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
                          action.primary
                            ? 'bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-[#030712] hover:shadow-[0_0_20px_rgba(193,154,74,0.4)]'
                            : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                        }`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Close button at bottom if no actions */}
                {actions.length === 0 && showCloseButton && (
                  <div className="flex justify-center mt-2">
                    <button
                      onClick={onClose}
                      className="py-2 px-8 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-bold hover:bg-white/10 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InfoModal;
