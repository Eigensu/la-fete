'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAdminCategory } from '@/lib/admin-api';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CreateCategoryPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [category, setCategory] = useState({
        name: '',
        slug: '',
        description: '',
        imageUrl: '',
        isActive: true
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            await createAdminCategory(category);
            toast.success('Category created successfully');
            router.push('/admin/categories');
        } catch (err: any) {
            toast.error(err.message || 'Failed to create category');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-2xl mx-auto">
            <div className="mb-8">
                <Link href="/admin/categories" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#86162f] font-poppins text-xs uppercase tracking-wider mb-4 transition-colors">
                    <ArrowLeft size={16} /> Back to Categories
                </Link>
                <h1 className="font-seasons text-3xl text-[#86162f]">Create Category</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-gray-100 space-y-6">
                <div className="space-y-2">
                    <label className="block font-poppins text-xs font-medium text-gray-700">Category Name *</label>
                    <input 
                        type="text" required value={category.name}
                        onChange={e => setCategory({...category, name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-200 rounded-sm font-poppins text-sm focus:outline-none focus:border-[#86162f]/30"
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="block font-poppins text-xs font-medium text-gray-700">Slug *</label>
                    <input 
                        type="text" required value={category.slug}
                        onChange={e => setCategory({...category, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                        className="w-full px-4 py-2 border border-gray-200 rounded-sm font-poppins text-sm focus:outline-none focus:border-[#86162f]/30"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block font-poppins text-xs font-medium text-gray-700">Description</label>
                    <textarea 
                        rows={3} value={category.description}
                        onChange={e => setCategory({...category, description: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-200 rounded-sm font-poppins text-sm focus:outline-none focus:border-[#86162f]/30"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block font-poppins text-xs font-medium text-gray-700">Image URL</label>
                    <input 
                        type="text" value={category.imageUrl}
                        onChange={e => setCategory({...category, imageUrl: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-200 rounded-sm font-poppins text-sm focus:outline-none focus:border-[#86162f]/30"
                    />
                </div>

                <div className="flex items-center gap-2 pt-2">
                    <label className="flex items-center gap-2 font-poppins text-sm text-gray-700 cursor-pointer">
                        <input type="checkbox" checked={category.isActive} onChange={e => setCategory({...category, isActive: e.target.checked})} className="rounded text-[#86162f]" /> Active
                    </label>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-[#86162f] to-[#a82043] text-white px-8 py-3 rounded-sm font-poppins font-medium tracking-wide hover:shadow-lg transition-all disabled:opacity-50">
                        {isSubmitting ? 'Creating...' : 'Create Category'}
                    </button>
                </div>
            </form>
        </div>
    );
}
