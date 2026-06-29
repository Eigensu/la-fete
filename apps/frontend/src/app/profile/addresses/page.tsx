'use client';

import { useEffect, useState } from 'react';
import { Address, getAddresses, deleteAddress, setDefaultAddress, createAddress, updateAddress, AddressInput } from '@/lib/addresses-api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, MapPin, CheckCircle } from 'lucide-react';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<AddressInput>({
    label: 'Home',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await getAddresses();
      setAddresses(data);
    } catch (err) {
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    try {
      await deleteAddress(id);
      toast.success('Address deleted');
      fetchAddresses();
    } catch {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
      toast.success('Default address updated');
      fetchAddresses();
    } catch {
      toast.error('Failed to update default address');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateAddress(editingId, formData);
        toast.success('Address updated');
      } else {
        await createAddress(formData);
        toast.success('Address added');
      }
      setShowForm(false);
      setEditingId(null);
      fetchAddresses();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save address');
    }
  };

  const handleEdit = (addr: Address) => {
    setFormData({
      label: addr.label,
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.isDefault,
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Addresses</h1>
        {!showForm && (
          <button
            onClick={() => {
              setFormData({ label: 'Home', fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', isDefault: false });
              setEditingId(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            <Plus size={16} /> Add Address
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-8 border">
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Address' : 'Add New Address'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Label</label>
              <input required value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} className="w-full border rounded p-2" placeholder="Home, Work, etc." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input required value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address Line 1</label>
              <input required value={formData.addressLine1} onChange={e => setFormData({ ...formData, addressLine1: e.target.value })} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address Line 2</label>
              <input value={formData.addressLine2} onChange={e => setFormData({ ...formData, addressLine2: e.target.value })} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input required value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <input required value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pincode</label>
              <input required value={formData.pincode} onChange={e => setFormData({ ...formData, pincode: e.target.value })} className="w-full border rounded p-2" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <input type="checkbox" id="isDefault" checked={formData.isDefault} onChange={e => setFormData({ ...formData, isDefault: e.target.checked })} className="mr-2" />
            <label htmlFor="isDefault">Set as default address</label>
          </div>
          <div className="mt-6 flex gap-4">
            <button type="submit" className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 border rounded hover:bg-gray-100">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse bg-gray-100 h-32 rounded-lg" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border rounded-lg border-dashed">
          <MapPin className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>No addresses found. Add one for faster checkout!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map(addr => (
            <div key={addr.id} className={`p-4 border rounded-lg relative ${addr.isDefault ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
              {addr.isDefault && (
                <span className="absolute top-4 right-4 text-xs font-semibold bg-black text-white px-2 py-1 rounded">Default</span>
              )}
              <h3 className="font-bold text-lg mb-1">{addr.fullName} <span className="text-gray-500 text-sm font-normal ml-2">({addr.label})</span></h3>
              <p className="text-gray-600 mb-1">{addr.phone}</p>
              <p className="text-gray-600 text-sm">
                {addr.addressLine1} {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                {addr.city}, {addr.state} {addr.pincode}
              </p>
              <div className="mt-4 pt-4 border-t flex gap-4 text-sm">
                <button onClick={() => handleEdit(addr)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1"><Edit2 size={14} /> Edit</button>
                <button onClick={() => handleDelete(addr.id)} className="text-red-600 hover:text-red-800 flex items-center gap-1"><Trash2 size={14} /> Delete</button>
                {!addr.isDefault && (
                  <button onClick={() => handleSetDefault(addr.id)} className="text-green-600 hover:text-green-800 flex items-center gap-1 ml-auto"><CheckCircle size={14} /> Set Default</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
