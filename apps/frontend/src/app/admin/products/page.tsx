'use client';

import { useEffect, useState } from 'react';
import { getAdminProducts, deleteAdminProduct } from '@/lib/admin-api';
import { Plus, Edit2, Trash2, Search, Filter, Package } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const data = await getAdminProducts();
            setProducts(data);
        } catch (err) {
            toast.error('Failed to load products');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
        
        try {
            await deleteAdminProduct(id);
            toast.success('Product deleted successfully');
            fetchProducts();
        } catch (err) {
            toast.error('Failed to delete product');
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 md:p-8">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-seasons text-3xl text-[#86162f]">Products</h1>
                    <p className="font-poppins text-gray-500 text-sm mt-1">Manage your product catalog</p>
                </div>
                <Link 
                    href="/admin/products/create" 
                    className="inline-flex items-center gap-2 bg-[#86162f] text-white px-6 py-2.5 rounded-sm font-poppins text-xs uppercase tracking-wider hover:bg-[#a82043] transition-colors"
                >
                    <Plus size={16} />
                    Add Product
                </Link>
            </div>

            <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#fcf9f8]/50">
                    <div className="relative w-full sm:w-72">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search products..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-sm font-poppins text-sm focus:outline-none focus:border-[#86162f]/30"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left font-poppins text-sm">
                        <thead className="bg-[#fcf9f8] text-gray-500 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Product</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Category</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Status</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Featured</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Created</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-10 w-48 bg-gray-200 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-8 w-16 bg-gray-200 rounded ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No products found.</td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-[#fcf9f8]/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-sm overflow-hidden flex items-center justify-center shrink-0">
                                                    {product.images && product.images.length > 0 ? (
                                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package size={20} className="text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{product.name}</div>
                                                    <div className="text-xs text-gray-500">{product.slug}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-[10px] font-medium tracking-wider uppercase">
                                                {product.category?.name || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wider uppercase ${product.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {product.isAvailable ? 'Available' : 'Unavailable'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.isFeatured ? (
                                                <span className="inline-flex px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-medium tracking-wider uppercase">
                                                    Featured
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(product.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link 
                                                    href={`/admin/products/edit/${product.id}`}
                                                    className="p-1.5 text-gray-400 hover:text-[#86162f] hover:bg-[#86162f]/5 rounded-sm transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(product.id, product.name)}
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
