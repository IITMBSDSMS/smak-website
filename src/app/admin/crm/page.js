"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function AdminCRM() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCRMData();
  }, []);

  const fetchCRMData = async () => {
    try {
      // For a real production app, you would join tables: users_mentee, enrollments, certificates, attendance
      // For MVP, we'll just fetch users_mentee and display a generalized CRM list.
      const { data, error } = await supabase.from('users_mentee').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data);
    } catch (err) {
      console.error('Error fetching CRM logic:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerEligibility = async (userId) => {
    // Calls the eligibility engine manually from the admin panel (mock endpoint or direct DB call)
    alert(`Triggering Eligibility evaluation for user ${userId}. (Mock action)`);
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-gray-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Main CRM Pipeline</h1>
            <p className="text-sm text-gray-500">Manage SMAK LMS admissions, enrollments, and LOR tracking.</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4">
            <button className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition">
              Export Data CSV
            </button>
            <button className="bg-[#ff4e4e] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#ff4e4e]/80 transition">
              View Analytics
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input type="text" placeholder="Search Mentee..." className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:ring-1 focus:ring-[#ff4e4e] outline-none" />
          <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none">
            <option>All Funnel Stages</option>
            <option>Lead Captured</option>
            <option>Paid & Active</option>
            <option>Completed</option>
          </select>
        </div>

        {/* Table View */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-xs uppercase tracking-wider text-gray-400 border-b border-white/10">
                  <th className="p-4">Name / Contact</th>
                  <th className="p-4">College</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Enrolled Course</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">Loading LMS Data...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">No applicants yet.</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={user.id} 
                      className="border-b border-white/5 hover:bg-white/5 transition"
                    >
                      <td className="p-4">
                        <div className="font-medium text-white">{user.full_name}</div>
                        <div className="text-xs text-gray-500">{user.email} • {user.phone}</div>
                      </td>
                      <td className="p-4 text-sm text-gray-300">{user.college_name}</td>
                      <td className="p-4">
                        <span className="bg-green-500/10 text-green-400 text-xs px-2 py-1 rounded-full border border-green-500/20">
                          {user.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-sm">{user.course_enrolled || 'N/A'}</td>
                      <td className="p-4 space-x-2">
                        <button 
                          onClick={() => triggerEligibility(user.id)}
                          className="text-xs border border-white/10 hover:border-[#ff4e4e] text-gray-300 hover:text-white px-3 py-1 rounded transition"
                        >
                          Check LOR
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
