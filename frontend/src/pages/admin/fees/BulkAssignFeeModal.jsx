import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import { getFeeStructuresAPI, bulkCreateFeesAPI } from '../../../api/fees.api';
import { getStudentsAPI } from '../../../api/students.api';
import { getBatches } from '../../../api/academic.api';

const BulkAssignFeeModal = ({ isOpen, onClose, onSuccess }) => {
  const [structures, setStructures] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  
  const [formData, setFormData] = useState({
    feeStructureId: '',
    batchId: '',
    assignTo: 'batch', // 'batch' or 'students'
    studentIds: [],
    discountAmount: 0,
    discountRemarks: '',
    installmentsBreakdown: []
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) fetchData();
  }, [isOpen]);

  useEffect(() => {
    // Auto-fetch students when batch changes
    if (formData.batchId && formData.assignTo === 'students') {
      fetchStudents(formData.batchId);
    }
  }, [formData.batchId, formData.assignTo]);

  const fetchData = async () => {
    try {
      const [strRes, batRes] = await Promise.all([
        getFeeStructuresAPI(),
        getBatches()
      ]);
      setStructures(strRes.data?.data || []);
      setBatches(batRes.data?.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchStudents = async (batchId) => {
    try {
      const selectedBatch = batches.find(b => b._id === batchId);
      // Student model stores batch as String (e.g. "2024-2026"), so we must pass the name, not the ID
      const res = await getStudentsAPI({ batch: selectedBatch?.name || batchId, limit: 1000 });
      setStudents(res.data?.data?.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleStructureSelect = (structureId) => {
    const structure = structures.find(s => s._id === structureId);
    if (!structure) {
      setFormData({ ...formData, feeStructureId: '', installmentsBreakdown: [] });
      return;
    }
    
    // Default to 1 installment of full amount
    setFormData({
      ...formData,
      feeStructureId: structureId,
      installmentsBreakdown: [{
        amount: structure.totalAmount,
        dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
      }]
    });
  };

  const handleAddInstallment = () => {
    setFormData({
      ...formData,
      installmentsBreakdown: [
        ...formData.installmentsBreakdown,
        { amount: 0, dueDate: '' }
      ]
    });
  };

  const handleRemoveInstallment = (index) => {
    const newInst = [...formData.installmentsBreakdown];
    newInst.splice(index, 1);
    setFormData({ ...formData, installmentsBreakdown: newInst });
  };

  const handleInstallmentChange = (index, field, value) => {
    const newInst = [...formData.installmentsBreakdown];
    newInst[index][field] = value;
    setFormData({ ...formData, installmentsBreakdown: newInst });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalStudentIds = [];
      if (formData.assignTo === 'batch') {
        const selectedBatch = batches.find(b => b._id === formData.batchId);
        const res = await getStudentsAPI({ batch: selectedBatch?.name || formData.batchId, limit: 1000 });
        finalStudentIds = (res.data?.data?.students || []).map(s => s._id);
      } else {
        finalStudentIds = formData.studentIds;
      }

      if (finalStudentIds.length === 0) {
        alert('No students selected to assign fees!');
        setLoading(false);
        return;
      }

      const payload = {
        studentIds: finalStudentIds,
        feeStructureId: formData.feeStructureId,
        discountAmount: Number(formData.discountAmount),
        discountRemarks: formData.discountRemarks,
        installmentsBreakdown: formData.installmentsBreakdown
      };

      await bulkCreateFeesAPI(payload);
      alert(`Successfully generated fees for ${finalStudentIds.length} students.`);
      onSuccess();
    } catch (error) {
      console.error('Error generating fees:', error);
      alert(error.response?.data?.message || 'Failed to generate fees');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Fees to Students" hideFooter={true}>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4 max-h-[75vh] overflow-y-auto px-1">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Fee Structure</label>
          <select 
            required
            value={formData.feeStructureId}
            onChange={(e) => handleStructureSelect(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white"
          >
            <option value="">Select Fee Structure</option>
            {structures.map(s => <option key={s._id} value={s._id}>{s.name} (₹{s.totalAmount?.toLocaleString()})</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Target Batch</label>
            <select 
              required
              value={formData.batchId}
              onChange={(e) => setFormData({...formData, batchId: e.target.value, studentIds: []})}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white"
            >
              <option value="">Select Batch</option>
              {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Assign To</label>
            <select 
              value={formData.assignTo}
              onChange={(e) => setFormData({...formData, assignTo: e.target.value})}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white"
            >
              <option value="batch">Entire Batch</option>
              <option value="students">Specific Students</option>
            </select>
          </div>
        </div>

        {formData.assignTo === 'students' && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Select Students (Ctrl+Click to select multiple)</label>
            <select 
              multiple
              required
              value={formData.studentIds}
              onChange={(e) => {
                const options = Array.from(e.target.selectedOptions);
                setFormData({...formData, studentIds: options.map(o => o.value)});
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white h-32"
            >
              {students.map(s => <option key={s._id} value={s._id}>{s.personalDetails?.fullName} ({s.rollNumber})</option>)}
            </select>
          </div>
        )}

        {formData.feeStructureId && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Installment Breakdown</h3>
              <button type="button" onClick={handleAddInstallment} className="text-xs font-semibold text-brand-500 hover:text-brand-600 flex items-center gap-1">
                <Plus size={14} /> Add Installment
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.installmentsBreakdown.map((inst, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <div className="w-8 text-xs font-medium text-slate-500">#{index + 1}</div>
                  <input 
                    type="number" required min="1"
                    value={inst.amount} 
                    onChange={e => handleInstallmentChange(index, 'amount', Number(e.target.value))}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white"
                    placeholder="Amount (₹)"
                  />
                  <input 
                    type="date" required
                    value={inst.dueDate} 
                    onChange={e => handleInstallmentChange(index, 'dueDate', e.target.value)}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white"
                  />
                  {formData.installmentsBreakdown.length > 1 && (
                    <button type="button" onClick={() => handleRemoveInstallment(index)} className="text-red-500 hover:text-red-600"><Trash2 size={16} /></button>
                  )}
                </div>
              ))}
              
              <div className="flex justify-between text-sm font-semibold pt-2 text-slate-800 dark:text-white">
                <span>Selected Structure Total: ₹{structures.find(s => s._id === formData.feeStructureId)?.totalAmount?.toLocaleString()}</span>
                <span className={formData.installmentsBreakdown.reduce((sum, i) => sum + i.amount, 0) !== (structures.find(s => s._id === formData.feeStructureId)?.totalAmount || 0) ? 'text-red-500' : 'text-green-500'}>
                  Installments Total: ₹{formData.installmentsBreakdown.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Discount Amount (₹)</label>
            <input 
              type="number" min="0"
              value={formData.discountAmount}
              onChange={e => setFormData({...formData, discountAmount: e.target.value})}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Discount Remarks</label>
            <input 
              type="text" 
              value={formData.discountRemarks}
              onChange={e => setFormData({...formData, discountRemarks: e.target.value})}
              placeholder="e.g. Scholarship"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-dark-800 dark:text-white"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700 pt-4">
          <button 
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={loading || !formData.feeStructureId || !formData.batchId || formData.installmentsBreakdown.reduce((sum, i) => sum + i.amount, 0) !== (structures.find(s => s._id === formData.feeStructureId)?.totalAmount || 0)}
            className="rounded-lg bg-brand-500 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Assign Fees'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BulkAssignFeeModal;
