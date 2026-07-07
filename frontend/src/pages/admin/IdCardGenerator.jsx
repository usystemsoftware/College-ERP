import React, { useState, useEffect } from 'react';
import { getDepartments, getBatches } from '../../api/academic.api';
import { getStudentsAPI } from '../../api/students.api';
import IdCardTemplate from '../../components/admin/IdCardTemplate';
import { Loader2, Printer, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const IdCardGenerator = () => {
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  
  const [filters, setFilters] = useState({
    department: '',
    batch: '',
  });

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // You can fetch this from an API or context in a real scenario
  const collegeInfo = {
    name: 'State Institute of Technology',
    address: '123 Tech Campus, Knowledge City, ST 54321',
    logo: '' // Provide a default logo path if available
  };

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [deptRes, batchRes] = await Promise.all([
          getDepartments(),
          getBatches()
        ]);
        if (deptRes.data?.success) setDepartments(deptRes.data.data);
        if (batchRes.data?.success) setBatches(batchRes.data.data);
      } catch (err) {
        toast.error('Failed to load filters');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchDropdowns();
  }, []);

  const handleGenerate = async () => {
    if (!filters.department) {
      toast.error('Please select a department');
      return;
    }
    
    setLoading(true);
    try {
      const res = await getStudentsAPI({ 
        department: filters.department, 
        batch: filters.batch,
        limit: 100 // Limit for bulk generation per batch
      });
      if (res.data?.success) {
        setStudents(res.data.data.students);
        if (res.data.data.students.length === 0) {
          toast('No students found for this filter', { icon: 'ℹ️' });
        } else {
          toast.success(`Generated cards for ${res.data.data.students.length} students`);
        }
      }
    } catch (err) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Non-printable header and filters */}
      <div className="no-print">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">ID Card Generator</h1>
            <p className="text-sm text-gray-500">Generate and print ID cards for students bulk-wise.</p>
          </div>
          <button 
            onClick={handlePrint}
            disabled={students.length === 0}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              students.length > 0 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Printer className="w-5 h-5 mr-2" />
            Print Cards
          </button>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-8 flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Department <span className="text-red-500">*</span></label>
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch (Optional)</label>
            <select
              value={filters.batch}
              onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="">All Batches</option>
              {batches.map((batch) => (
                <option key={batch._id} value={batch._id}>{batch.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center font-medium h-[42px]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
            {loading ? 'Generating...' : 'Generate Cards'}
          </button>
        </div>
      </div>

      {/* Printable Area - Grid of ID Cards */}
      <div className="print-container">
        {students.length > 0 && (
          <div className="flex flex-wrap gap-8 justify-center id-card-grid">
            {students.map((student) => (
              <IdCardTemplate 
                key={student._id} 
                student={student} 
                collegeName={collegeInfo.name}
                collegeAddress={collegeInfo.address}
                collegeLogo={collegeInfo.logo}
              />
            ))}
          </div>
        )}

        {students.length === 0 && !loading && (
          <div className="text-center py-20 text-gray-400 no-print">
            <div className="bg-gray-50 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
              <Printer className="w-10 h-10 text-gray-300" />
            </div>
            <p>Select a department and click generate to view ID cards.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdCardGenerator;
