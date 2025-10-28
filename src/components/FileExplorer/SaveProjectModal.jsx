import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { saveProject as apiSaveProject, updateProject as apiUpdateProject } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import Text from '../Text';
import Button from '../Button';

const SaveProjectModal = ({ isOpen, onClose, existingId, initialName = '', initialDescription = '' }) => {
  const { createProjectPayload } = useProject();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const { push } = useNotifications();

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setDescription(initialDescription);
      setError(null);
      setSaving(false);
    }
  }, [isOpen, initialName, initialDescription]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if (!name || !name.trim()) throw new Error('Project name is required');
      if (!description || !String(description).trim()) throw new Error('Project description is required');
      const payload = createProjectPayload(name, description);
      let res;
      if (existingId) {
        res = await apiUpdateProject(existingId, payload);
        push({ title: 'Saved', message: 'Project updated' });
        onClose(res);
      } else {
        res = await apiSaveProject(payload);
        push({ title: 'Saved', message: 'Project created: ' + res.id });
        onClose(res);
      }
    } catch (err) {
      // If server returns conflict (409) indicate duplicate name and keep modal open
      const status = err?.response?.status;
      const message = err?.response?.data?.message || err.message || 'Save failed';
      if (status === 409) {
        setError(message || 'A project with this name already exists');
      } else {
        setError(message);
      }
      push({ title: 'Error', message: message });
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="card p-6 w-96">
        <Text as="h3" variant="heading" className="text-lg font-semibold mb-2 text-center">{existingId ? 'Edit Project' : 'New Project'}</Text>
        <Text as="label" variant="label" className="block text-sm mb-2">Project Name</Text>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="input mb-2"
          aria-label="Project name"
        />
        <Text as="label" variant="label" className="block text-sm mb-2">Short Description</Text>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="input mb-2 h-20"
          aria-label="Project description"
        />
        {error && <Text as="p" variant="small" className="text-sm text-red-400 mb-2">{error}</Text>}
        <div className="flex justify-end gap-2">
          <Button className="" variant="primary" onClick={() => onClose(null)} disabled={saving}><Text as="span" variant="label">Cancel</Text></Button>
          <Button className="" variant="primary" onClick={handleSave} disabled={saving || !name.trim() || !String(description).trim()}>{saving ? <Text as="span" variant="label" allowColorOverride>Saving...</Text> : <Text as="span" variant="label" allowColorOverride>Save</Text>}</Button>
        </div>
      </div>
    </div>
  );
};

export default SaveProjectModal;
