import React from 'react';
import { motion } from 'framer-motion';

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700/50"
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-100 tracking-tight">{title}</h2>
      {children}
    </motion.div>
  );
};

export default DashboardCard;