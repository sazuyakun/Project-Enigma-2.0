import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface KeywordData {
  keyword: string;
  count: number;
  trend: number;
}

interface KeywordMonitorProps {
  keywords: KeywordData[];
}

const KeywordMonitor: React.FC<KeywordMonitorProps> = ({ keywords }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {keywords.map((item, index) => (
        <motion.div
          key={item.keyword}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between"
        >
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-300">
              {item.keyword.replace(/_/g, ' ')}
            </h3>
            <p className="text-2xl font-semibold text-white mt-1">{item.count}</p>
          </div>
          <div className={`flex items-center ${
            item.trend > 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {item.trend > 0 ? (
              <TrendingUp className="w-5 h-5 mr-2" />
            ) : (
              <TrendingDown className="w-5 h-5 mr-2" />
            )}
            <span className="font-medium">{Math.abs(item.trend)}%</span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default KeywordMonitor;