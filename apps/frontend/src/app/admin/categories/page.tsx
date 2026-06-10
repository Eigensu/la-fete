'use client';

import { useEffect, useState } from 'react';
import { getAdminCategories, deleteAdminCategory } from '@/lib/admin-api';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const data = await getAdminCategories();
            setCategories(data);
        } catch (err) {
            toast.error('Failed to load categories');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
        
        try {
            await deleteAdminCategory(id);
            toast.success('Category deleted successfully');
            fetchCategories();
        } catch (err) {
            toast.error('Failed to delete category');
        }
    };

    return (
        <div className="p-6 md:p-8">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-seasons text-3xl text-[#86162f]">Categories</h1>
                    <p className="font-poppins text-gray-500 text-sm mt-1">Manage product categories</p>
                </div>
                <Link 
                    href="/admin/categories/create"
                    className="inline-flex items-center gap-2 bg-[#86162f] text-white px-6 py-2.5 rounded-sm font-poppins text-xs uppercase tracking-wider hover:bg-[#a82043] transition-colors"
                >
                    <Plus size={16} />
                    Add Category
                </Link>
            </div>

            <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-poppins text-sm">
                        <thead className="bg-[#fcf9f8] text-gray-500 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Category Name</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Slug</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Status</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 rounded"></div><div className="h-3 w-48 bg-gray-200 rounded mt-2"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-8 w-16 bg-gray-200 rounded ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No categories found.</td>
                                </tr>
                            ) : (
                                categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-[#fcf9f8]/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{cat.name}</div>
                                            {cat.description && <div className="text-xs text-gray-500 truncate max-w-xs">{cat.description}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">{cat.slug}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wider uppercase ${cat.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {cat.isActive !== false ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    className="p-1.5 text-gray-400 hover:text-[#86162f] hover:bg-[#86162f]/5 rounded-sm transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(cat.id, cat.name)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
