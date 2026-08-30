'use client';

import { useEffect, useState } from 'react';
import { getAdminProducts } from '@/lib/admin-api';
import { Package, Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { toTitleCase } from '@/utils/format';
import toast from 'react-hot-toast';

export default function AdminVariantsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchVariants = async () => {
            try {
                setIsLoading(true);
                const data = await getAdminProducts();
                setProducts(data);
            } catch (err) {
                toast.error('Failed to load variants');
            } finally {
                setIsLoading(false);
            }
        };
        fetchVariants();
    }, []);

    const allVariants = products.flatMap(p => 
        (p.variants || []).map((v: any) => ({ ...v, product: p }))
    );

    const filteredVariants = allVariants.filter(v => 
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        v.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 md:p-8">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-seasons text-3xl text-[#86162f]">Variants</h1>
                    <p className="font-poppins text-gray-500 text-sm mt-1">Manage product variants and inventory</p>
                </div>
            </div>

            <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#fcf9f8]/50">
                    <div className="relative w-full sm:w-72">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search variants or SKUs..." 
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
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Variant</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Product</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">SKU</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px] text-right">Price</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px] text-right">Stock</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-[10px]">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-4 w-16 bg-gray-200 rounded ml-auto"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-4 w-8 bg-gray-200 rounded ml-auto"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
                                    </tr>
                                ))
                            ) : filteredVariants.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No variants found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredVariants.map((v) => (
                                    <tr key={v.id} className="hover:bg-[#fcf9f8]/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{v.sku}</td>
                                        <td className="px-6 py-4 text-gray-500">{toTitleCase(v.product.name)}</td>
                                        <td className="px-6 py-4 text-gray-500">{v.name}</td>
                                        <td className="px-6 py-4 text-right">
                                            {v.discountPrice ? (
                                                <div>
                                                    <span className="line-through text-gray-400 text-xs mr-2">₹{v.price}</span>
                                                    <span className="text-[#86162f] font-medium">₹{v.discountPrice}</span>
                                                </div>
                                            ) : (
                                                <span>₹{v.price}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-medium ${v.stockQuantity < 10 ? 'text-red-500' : 'text-gray-900'}`}>{v.stockQuantity}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wider uppercase ${v.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {v.isAvailable ? 'Available' : 'Unavailable'}
                                            </span>
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
