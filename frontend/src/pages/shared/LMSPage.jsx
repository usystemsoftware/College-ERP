import React, { useState, useEffect } from 'react';
import { BookOpen, Download, FileText, Filter, PlayCircle, Search, Upload, MoreVertical, Folder, Loader2 } from 'lucide-react';
import MaterialUploadModal from '../../components/lms/MaterialUploadModal';
import materialService from '../../features/materials/materialService';

const getIconForType = (type) => {
  switch(type) {
    case 'PDF': return <FileText className="text-red-500" />;
    case 'Video': return <PlayCircle className="text-blue-500" />;
    case 'PPT': return <BookOpen className="text-orange-500" />;
    default: return <FileText className="text-slate-500" />;
  }
};

const LMSPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState('All Subjects');
  const [activeType, setActiveType] = useState('All Types');

  async function fetchMaterials() {
    try {
      setLoading(true);
      const data = await materialService.getMaterials({
        search: searchTerm,
        subject: activeSubject !== 'All Subjects' ? activeSubject : undefined,
        materialType: activeType !== 'All Types' ? activeType : undefined
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
  }, [searchTerm, activeSubject, activeType]);

  const handleDownload = async (material) => {
    try {
      await materialService.incrementDownload(material._id);
      setMaterials(prev => prev.map(m => 
        m._id === material._id ? { ...m, downloadCount: (m.downloadCount || 0) + 1 } : m
      ));
      const baseUrl = 'http://localhost:5050';
      const downloadUrl = material.fileUrl?.startsWith('http') ? material.fileUrl : `${baseUrl}${material.fileUrl}`;
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Download failed', error);
      alert('Failed to download file.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Learning Management System</h1>
          <p className="text-sm text-slate-500">Access study materials, lecture notes, and assignments.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600"
          >
            <Upload size={16} />
            Upload Material
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-dark-800">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Folder size={18}/> Subjects
            </h3>
            <div className="space-y-2">
              {['All Subjects', 'Data Structures', 'Operating Systems', 'Computer Networks', 'DBMS'].map((sub, i) => (
                <label key={i} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="subject" 
                    className="w-4 h-4 text-brand-500 border-slate-300 focus:ring-brand-500" 
                    checked={activeSubject === sub}
                    onChange={() => setActiveSubject(sub)}
                  />
                  <span className="text-sm text-slate-600 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white">{sub}</span>
                </label>
              ))}
            </div>

            <hr className="my-6 border-slate-200 dark:border-slate-700" />

            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Material Type</h3>
            <div className="space-y-2">
              {['All Types', 'PDF', 'Video', 'PPT', 'DOCX', 'Notes'].map((type, i) => (
                <label key={i} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="materialType" 
                    className="w-4 h-4 text-brand-500 border-slate-300 focus:ring-brand-500" 
                    checked={activeType === type}
                    onChange={() => setActiveType(type)}
                  />
                  <span className="text-sm text-slate-600 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white">{type === 'All Types' ? type : type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search materials, notes, videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm outline-none focus:border-brand-500 shadow-sm dark:border-slate-800 dark:bg-dark-800 dark:focus:border-brand-500"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="font-medium text-slate-900 dark:text-white">Sort by:</span>
              <select className="bg-transparent font-medium text-brand-600 outline-none cursor-pointer">
                <option>Newest First</option>
                <option>Most Downloaded</option>
                <option>A-Z</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full flex justify-center items-center h-48">
                <Loader2 className="animate-spin text-brand-500" size={32} />
              </div>
            ) : materials.length === 0 ? (
              <div className="col-span-full flex flex-col justify-center items-center h-48 bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500">
                <BookOpen size={48} className="mb-4 text-slate-300 dark:text-slate-700" />
                <p>No materials found.</p>
              </div>
            ) : materials.map((note) => (
              <div key={note._id} className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-dark-800 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-10 w-10 rounded-lg bg-slate-50 dark:bg-dark-700 flex items-center justify-center">
                      {getIconForType(note.materialType)}
                    </div>
                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                  
                  <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-2 min-h-[40px]">{note.title}</h4>
                  <p className="mt-1 text-xs text-slate-500 font-medium">{note.subject}</p>
                </div>
                
                <div className="mt-6 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5"><Folder size={12}/> {(note.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                    <span className="flex items-center gap-1.5"><Download size={12}/> {note.downloadCount || 0} dl</span>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span>{note.facultyName || 'Faculty'}</span>
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Overlay Action */}
                <div className="absolute inset-0 bg-white/60 dark:bg-dark-900/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-xl gap-3">
                  <button onClick={() => handleDownload(note)} className="h-10 w-10 rounded-full bg-brand-500 text-white shadow-lg flex items-center justify-center hover:bg-brand-600 transition hover:scale-110">
                    <Download size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

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

export default LMSPage;
