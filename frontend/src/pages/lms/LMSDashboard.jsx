import React, { useState, useEffect } from 'react';
import { BookOpen, Video, FileText, Download, Plus, Search, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import materialService from '../../features/materials/materialService';
import MaterialUploadModal from '../../components/lms/MaterialUploadModal';

const LMSDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const roleName = typeof user?.role === 'object' ? user?.role?.name : user?.role;
  const isFacultyOrAdmin = ['Faculty', 'Super Admin', 'College Admin'].includes(roleName);

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract unique subjects from materials
  const subjects = [...new Set(materials.map(m => m.subject))];

  async function fetchMaterials() {
    try {
      setLoading(true);
      const data = await materialService.getMaterials({
        search: searchTerm,
        subject: activeSubject !== 'All' ? activeSubject : undefined
      });
      setMaterials(data.data || []);
    } catch (error) {
      console.error('Failed to fetch materials', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [activeSubject, searchTerm]);

  const handleDownload = async (material) => {
    try {
      await materialService.incrementDownload(material._id);
      
      // Update UI optimistically
      setMaterials(prev => prev.map(m => 
        m._id === material._id ? { ...m, downloadCount: (m.downloadCount || 0) + 1 } : m
      ));

      // Trigger file download
      // The fileUrl path needs to be correct depending on backend static serving
      // Assuming backend runs on http://localhost:5050
      const baseUrl = 'http://localhost:5050';
      const downloadUrl = material.fileUrl.startsWith('http') ? material.fileUrl : `${baseUrl}${material.fileUrl}`;
      
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Download failed', error);
      alert('Failed to download file.');
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'PDF':
      case 'DOCX':
      case 'Notes': 
        return <FileText size={20} className="text-blue-500" />;
      case 'Video': 
        return <Video size={20} className="text-red-500" />;
      default: 
        return <BookOpen size={20} className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Study Materials</h1>
          <p className="text-sm text-slate-500">Access course resources, lecture notes, and videos.</p>
        </div>
        {isFacultyOrAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700 transition"
          >
            <Plus size={16} /> Upload Material
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar / Subject Filter */}
        <div className="w-full md:w-64 shrink-0">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-dark-900">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Filter by Subject</h3>
            <div className="space-y-1">
              <button 
                onClick={() => setActiveSubject('All')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${activeSubject === 'All' ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-dark-800'}`}
              >
                All Subjects
              </button>
              {subjects.map((sub, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveSubject(sub)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${activeSubject === sub ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-dark-800'}`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="flex-1">
          <div className="mb-4 relative">
             <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search materials by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-dark-900 dark:text-white shadow-sm transition"
              />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="animate-spin text-brand-500" size={32} />
            </div>
          ) : materials.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-48 bg-white dark:bg-dark-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500">
              <BookOpen size={48} className="mb-4 text-slate-300 dark:text-slate-700" />
              <p>No materials found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map((resource) => (
                <div key={resource._id} className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-dark-900 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="rounded-lg bg-slate-50 p-2 dark:bg-dark-800">
                        {getIcon(resource.materialType)}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-dark-800 px-2 py-1 rounded">
                        {resource.subject}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2" title={resource.title}>
                      {resource.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2">
                      By {resource.facultyName || 'Faculty'} • {new Date(resource.createdAt).toLocaleDateString()}
                    </p>
                    {resource.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                        {resource.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-slate-500">{resource.materialType}</span>
                      <span className="text-[10px] text-slate-400">{(resource.fileSize / (1024 * 1024)).toFixed(2)} MB • {resource.downloadCount || 0} downloads</span>
                    </div>
                    <button 
                      onClick={() => handleDownload(resource)}
                      className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-50 text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition dark:bg-dark-800 dark:text-slate-400 dark:hover:text-brand-400"
                      title="Download Material"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <MaterialUploadModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchMaterials();
          alert('Material uploaded successfully!');
        }}
      />
    </div>
  );
};

export default LMSDashboard;
