import { useState, useEffect } from 'react';
import type { Guest, GuestInput } from '../../types/guest';
import { slugify } from '../../lib/utils';
import { Modal } from 'antd';

interface GuestFormProps {
  guest: Guest | null;
  saving: boolean;
  onSave: (input: GuestInput) => void;
  onCancel: () => void;
}

export default function GuestForm({ guest, saving, onSave, onCancel }: GuestFormProps) {
  const [name, setName] = useState(guest?.name || '');
  const [slug, setSlug] = useState(guest?.slug || '');
  const [autoSlug, setAutoSlug] = useState(guest?.slug === '');
  const [gender, setGender] = useState(guest?.gender || 'other');
  const [title, setTitle] = useState(guest?.title || '');
  const [role, setRole] = useState(guest?.role || 'Bridesmaid');
  const [message, setMessage] = useState(guest?.message || '');

  useEffect(() => {
    if (autoSlug && name) {
      setSlug(slugify(name));
    }
  }, [name, autoSlug]);

  const handleSubmit = () => {
    onSave({ name, slug, gender: gender as any, title, role: role as any, message });
  };

  const isValid = slug && name && message;

  return (
    <Modal
      title={
        <span className="font-display text-2xl text-burgundy block pb-2 border-b border-burgundy/10">
          {guest ? 'Edit Guest' : 'Add New Guest'}
        </span>
      }
      open={true} // Managed by conditional mounting in parent page (admin.tsx)
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={saving}
      okButtonProps={{ disabled: !isValid }}
      okText={guest ? 'Save Changes' : 'Add Guest'}
      cancelText="Cancel"
      centered
      width={480}
    >
      <div className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <label className="block">
          <span className="mb-1 block text-xs tracking-wide uppercase text-burgundy/60">Name</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs tracking-wide uppercase text-burgundy/60">Gender</span>
          <select className="input" value={gender} onChange={(e) => setGender(e.target.value as any)}>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs tracking-wide uppercase text-burgundy/60">URL slug</span>
          <input
            className="input"
            value={slug}
            onChange={(e) => { setAutoSlug(false); setSlug(slugify(e.target.value)); }}
            placeholder="jane-doe"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs tracking-wide uppercase text-burgundy/60">Personal title</span>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Day One"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs tracking-wide uppercase text-burgundy/60">Role</span>
          <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
            <option>Bridesmaid</option>
            <option>Groomsman</option>
            <option>Asoebi Lady</option>
            <option>Asoebi Gentleman</option>
            <option>Family</option>
            <option>VIP</option>
            <option>Guest</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs tracking-wide uppercase text-burgundy/60">Personal message</span>
          <textarea
            className="input min-h-[120px]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </label>
      </div>
    </Modal>
  );
}
