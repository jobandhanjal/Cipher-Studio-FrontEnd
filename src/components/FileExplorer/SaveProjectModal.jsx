import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { saveProject as apiSaveProject, updateProject as apiUpdateProject } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

const SaveProjectModal = ({ isOpen, onClose, existingId }) => {
  const { createProjectPayload } = useProject();
  const [name, setName] = useState('CipherProject');
  const { push } = useNotifications();

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      const payload = createProjectPayload(name);
      let res;
      if (existingId) {
        res = await apiUpdateProject(existingId, payload);
        push({ title: 'Saved', message: 'Project updated' });
      } else {
        res = await apiSaveProject(payload);
        push({ title: 'Saved', message: 'Project created: ' + res.id });
      }
      onClose(res);
    } catch (err) {
      push({ title: 'Error', message: err.message || 'Save failed' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-gray-800 rounded p-6 w-96">
        <h3 className="text-lg font-semibold mb-2">Save Project</h3>
        <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 mb-4 bg-gray-700 rounded" />
        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 bg-gray-600 rounded" onClick={() => onClose(null)}>Cancel</button>
          <button className="px-3 py-1 bg-blue-600 rounded" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default SaveProjectModal;
