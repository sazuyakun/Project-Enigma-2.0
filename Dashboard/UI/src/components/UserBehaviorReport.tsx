import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, MapPin, Mail, Shield, User, Activity, Search } from 'lucide-react';
import { format } from 'date-fns';

// Default values for missing data
const DEFAULT_VALUES = {
  dummyBehaviors: ["No recent suspicious activity", "Standard account usage"],
  dummyRiskFactors: [
    { factor: "Transaction Volume", score: 0 },
    { factor: "Location Risk", score: 0 },
    { factor: "Behavioral Pattern", score: 0 },
    { factor: "Network Analysis", score: 0 },
  ],
  dummyName: "Unknown User"
};

const UserBehaviorReport = () => {
  const [accountsData, setAccountsData] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://127.0.0.1:8080/database/users");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Process and normalize the data
        const updatedData = data.map(account => ({
          id: account.id || "N/A",
          username: account.username || "Unknown",
          riskScore: typeof account.riskScore === 'number' ? account.riskScore : 0,
          lastActive: account.lastActive ? new Date(account.lastActive) : new Date(),
          location: account.location || "Unknown",
          details: [{
            id: account.id || "N/A",
            name: account.name || DEFAULT_VALUES.dummyName,
            email: account.email || "unknown@example.com",
          }],
          behaviors: Array.isArray(account.behaviors) && account.behaviors.length > 0 
            ? account.behaviors 
            : DEFAULT_VALUES.dummyBehaviors,
          riskFactors: Array.isArray(account.riskFactors) && account.riskFactors.length > 0 
            ? account.riskFactors 
            : DEFAULT_VALUES.dummyRiskFactors,
        }));

        setAccountsData(updatedData);
        // Only set selected account if there's data and none is currently selected
        if (updatedData.length > 0 && !selectedAccount) {
          setSelectedAccount(updatedData[0]);
        }
      } catch (error) {
        console.error("Error fetching accounts data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array since we only want to fetch once on mount

  // Filter and sort accounts
  const filteredAccounts = accountsData
    .filter(account => {
      const searchLower = searchTerm.toLowerCase();
      return (
        account.id.toLowerCase().includes(searchLower) ||
        account.username.toLowerCase().includes(searchLower) ||
        account.location.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 3); // Show only top 3 highest risk accounts

  if (isLoading) {
    return <div className="text-center p-6">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
        <p className="text-red-500">Error loading data: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Account List */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by ID, name, or location..."
            className="w-full bg-gray-700 text-white pl-12 pr-4 py-3 rounded-lg border border-gray-600 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAccounts.map((account) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`cursor-pointer p-4 rounded-lg border-2 transition-colors ${
                selectedAccount?.id === account.id
                  ? 'bg-gray-700 border-emerald-400'
                  : 'bg-gray-700/50 border-transparent hover:border-gray-600'
              }`}
              onClick={() => setSelectedAccount(account)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm text-gray-400">{account.id}</p>
                  <p className="font-semibold">{account.username}</p>
                </div>
                <div className={`px-2 py-1 rounded text-sm font-medium ${
                  account.riskScore >= 90 ? 'bg-red-500/20 text-red-400' :
                  account.riskScore >= 80 ? 'bg-orange-500/20 text-orange-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  Risk: {account.riskScore}
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <MapPin className="w-4 h-4 mr-1" />
                {account.location}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {selectedAccount && (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedAccount.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Header Section */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 flex items-start space-x-4">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-semibold text-red-500">High-Risk Account Detected</h2>
                <p className="text-gray-300 mt-1">This account has been flagged for suspicious activities related to drug trafficking.</p>
              </div>
            </div>

            {/* Account Overview */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Username Card */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                <div className="flex items-center space-x-2 text-gray-400 mb-2">
                  <User className="w-4 h-4" />
                  <span>Username</span>
                </div>
                <p className="text-xl font-semibold">{selectedAccount.username}</p>
              </motion.div>

              {/* Risk Score Card */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                <div className="flex items-center space-x-2 text-gray-400 mb-2">
                  <Shield className="w-4 h-4" />
                  <span>Risk Score</span>
                </div>
                <p className="text-xl font-semibold text-red-500">{selectedAccount.riskScore}/100</p>
              </motion.div>

              {/* Last Active Card */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                <div className="flex items-center space-x-2 text-gray-400 mb-2">
                  <Clock className="w-4 h-4" />
                  <span>Last Active</span>
                </div>
                <p className="text-xl font-semibold">
                  {format(selectedAccount.lastActive, 'MMM d, HH:mm')}
                </p>
              </motion.div>

              {/* Location Card */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                <div className="flex items-center space-x-2 text-gray-400 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>Location</span>
                </div>
                <p className="text-xl font-semibold">{selectedAccount.location}</p>
              </motion.div>
            </div>

            {/* Profile Information */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-emerald-400" />
                Suspect Profile
              </h3>
              <div className="space-y-4">
                {selectedAccount.details.map((profile) => (
                  <div key={profile.id} className="space-y-4">
                    {/* ID Box */}
                    <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                      <p className="font-medium">{profile.id}</p>
                      <span className="w-5 h-5 text-emerald-400">ID</span>
                    </div>
                    
                    {/* Name Box */}
                    <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                      <p className="font-medium">{profile.name}</p>
                      <User className="w-5 h-5 text-emerald-400" />
                    </div>
                    
                    {/* Email Box */}
                    <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                      <p className="font-medium">{profile.email}</p>
                      <Mail className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Risk Analysis */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Suspicious Behaviors */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-emerald-400" />
                  Suspicious Behaviors
                </h3>
                <ul className="space-y-3">
                  {selectedAccount.behaviors.map((behavior, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-1" />
                      <span>{behavior}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Risk Factor Breakdown */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <h3 className="text-lg font-semibold mb-4">Risk Factor Breakdown</h3>
                <div className="space-y-4">
                  {selectedAccount.riskFactors.map((factor, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-400">{factor.factor}</span>
                        <span className="text-sm font-medium">{factor.score}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${factor.score}%` }}
                          transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                          className="bg-emerald-400 h-2 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default UserBehaviorReport;