import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const Title: React.FC = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setShow(false);
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
        >
          <div className="text-center">
            <h1 className="text-5xl font-serif text-slate-200 tracking-widest font-light opacity-90 drop-shadow-2xl">
              نوژا
            </h1>
            <p className="mt-4 text-slate-400 font-serif italic text-sm tracking-widest">
              صورت فلکی افکار
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
