import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FileText, Plus, Book, BookOpen, Calendar, Edit2, Trash2 } from 'lucide-react';
import Modal from '../../components/common/Modal';

const mockAcademicData = {
  college: "State Institute of Technology",
  departments: [
    {
      id: "dept1",
      name: "Computer Science",
      code: "CS",
      courses: [
        {
          id: "crs1",
          name: "B.Tech Computer Engineering",
          code: "BTECH-CE",
          batches: [
            { id: "batch1", name: "2021-2025" },
            { id: "batch2", name: "2022-2026" }
          ]
        },
        {
          id: "crs2",
          name: "M.Tech Data Science",
          code: "MTECH-DS",
          batches: [
            { id: "batch3", name: "2023-2025" }
          ]
        }
      ]
    },
    {
      id: "dept2",
      name: "Mechanical Engineering",
      code: "ME",
      courses: [
        {
          id: "crs3",
          name: "B.Tech Mechanical",
          code: "BTECH-ME",
          batches: [
            { id: "batch4", name: "2021-2025" }
          ]
        }
      ]
    }
  ]
};

const TreeNode = ({ label, icon: Icon, children, onAdd, onEdit, onDelete, colorClass }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = children && React.Children.count(children) > 0;

  return (
    <div className="ml-4 mt-2">
      <div 
        className={`group flex items-center justify-between rounded-lg border border-transparent p-2 transition-all hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-800 dark:hover:bg-dark-800/50 ${isOpen ? 'bg-slate-50/50 dark:bg-dark-800/30' : ''}`}
      >
        <div 
          className="flex flex-1 cursor-pointer items-center gap-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex h-5 w-5 items-center justify-center text-slate-400">
            {hasChildren ? (
              isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
            ) : <span className="w-4"></span>}
          </div>
          <Icon size={18} className={colorClass} />
          <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
        </div>
        
        {/* Actions (Hidden by default, shown on hover) */}
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {onAdd && (
            <button onClick={onAdd} className="rounded p-1.5 text-slate-400 hover:bg-white hover:text-brand-500 hover:shadow-sm dark:hover:bg-dark-700" title="Add Child">
              <Plus size={14} />
            </button>
          )}
          {onEdit && (
            <button onClick={onEdit} className="rounded p-1.5 text-slate-400 hover:bg-white hover:text-blue-500 hover:shadow-sm dark:hover:bg-dark-700" title="Edit">
              <Edit2 size={14} />
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="rounded p-1.5 text-slate-400 hover:bg-white hover:text-red-500 hover:shadow-sm dark:hover:bg-dark-700" title="Delete">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      
      {/* Children Container */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="ml-5 border-l-2 border-slate-100 pl-2 dark:border-slate-800/50">
          {children}
        </div>
      </div>
    </div>
  );
};

const AcademicStructure = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');

  const handleOpenModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Academic Structure</h1>
          <p className="text-sm text-slate-500">Manage Departments, Courses, and Batches hierarchy.</p>
        </div>
        <button 
          onClick={() => handleOpenModal('Add Department')}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-700"
        >
          <Plus size={16} />
          Add Department
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-dark-900">
        
        {/* Root Node (College) */}
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 border border-slate-100 dark:bg-dark-800/80 dark:border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600">
            <BookOpen size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">{mockAcademicData.college}</h3>
            <p className="text-xs text-slate-500">Root Institution</p>
          </div>
        </div>

        {/* Tree Render */}
        <div className="mt-4">
          {mockAcademicData.departments.map(dept => (
            <TreeNode 
              key={dept.id} 
              label={`${dept.name} (${dept.code})`} 
              icon={Folder} 
              colorClass="text-brand-500"
              onAdd={() => handleOpenModal('Add Course')}
              onEdit={() => handleOpenModal('Edit Department')}
            >
              {dept.courses.map(course => (
                <TreeNode 
                  key={course.id} 
                  label={`${course.name} (${course.code})`} 
                  icon={Book} 
                  colorClass="text-indigo-500"
                  onAdd={() => handleOpenModal('Add Batch')}
                  onEdit={() => handleOpenModal('Edit Course')}
                >
                  {course.batches.map(batch => (
                    <TreeNode 
                      key={batch.id} 
                      label={`Batch: ${batch.name}`} 
                      icon={Calendar} 
                      colorClass="text-emerald-500"
                      onEdit={() => handleOpenModal('Edit Batch')}
                      onDelete={() => handleOpenModal('Delete Batch')}
                    />
                  ))}
                </TreeNode>
              ))}
            </TreeNode>
          ))}
        </div>

      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalType}>
        <div className="space-y-4 py-4">
          <p>Please fill out the details for {modalType}.</p>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
            <input type="text" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-900 dark:text-white" placeholder="Enter name..." />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AcademicStructure;
