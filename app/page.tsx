'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface School {
  id: string;
  name: string;
  slug: string;
}

export default function LandingPage() {
  const [showModal, setShowModal] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Show modal after animation
    const timer = setTimeout(() => {
      setShowModal(true);
    }, 3000); // 3 seconds for animation

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showModal) {
      fetchSchools();
    }
  }, [showModal]);

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/schools');
      const data = await response.json();
      setSchools(data);
    } catch (error) {
      console.error('Failed to fetch schools:', error);
    }
  };

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSchoolSelect = (school: School) => {
    setSelectedSchool(school);
    localStorage.setItem('selectedSchool', JSON.stringify(school));
    setLoading(true);
    setTimeout(() => {
      router.push('/login');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      {/* Animated Classora */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-center"
      >
        <motion.h1
          className="text-6xl font-bold text-indigo-600 mb-4"
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Classora
        </motion.h1>
        <motion.p
          className="text-xl text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          Smart School Management System
        </motion.p>
      </motion.div>

      {/* School Selection Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              Select Your School
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Search for your school..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <div className="max-h-48 overflow-y-auto">
                {filteredSchools.map((school) => (
                  <button
                    key={school.id}
                    onClick={() => handleSchoolSelect(school)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    {school.name}
                  </button>
                ))}
              </div>
              {loading && (
                <div className="text-center text-indigo-600">
                  Redirecting to login...
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

