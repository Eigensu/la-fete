'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getAdminProducts, updateAdminProduct, getAdminCategories, createAdminVariant, updateAdminVariant, deleteAdminVariant } from '@/lib/admin-api';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;
    
    const [categories, setCategories] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    const [product, setProduct] = useState({
        name: '',
        description: '',
        categoryId: '',
        images: '',
        isAvailable: true,
        isFeatured: false,
        tag: ''
    });

    const [variants, setVariants] = useState<any[]>([]);
    const [variantsToDelete, setVariantsToDelete] = useState<string[]>([]);

    useEffect(() => {
        Promise.all([
            getAdminCategories(),
            getAdminProducts()
        ]).then(([cats, prods]) => {
            setCategories(cats);
            const p = prods.find((x: any) => x.id === productId);
            if (p) {
                setProduct({
                    name: p.name,
                    description: p.description,
                    categoryId: p.category?.id || '',
                    images: p.images ? p.images.join(', ') : '',
                    isAvailable: p.isAvailable,
                    isFeatured: p.isFeatured,
                    tag: p.tag || ''
                });
                setVariants(p.variants || []);
            } else {
                toast.error('Product not found');
                router.push('/admin/products');
            }
            setIsLoading(false);
        }).catch(() => {
            toast.error('Failed to load product');
            setIsLoading(false);
        });
    }, [productId, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const productData = {
                ...product,
                slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                categoryId: product.categoryId || undefined,
                images: product.images ? product.images.split(',').map(s => s.trim()) : []
            };
            
            await updateAdminProduct(productId, productData);
            
            // Delete variants
            for (const id of variantsToDelete) {
                await deleteAdminVariant(id);
            }

            // Update/Create variants
            for (const variant of variants) {
                const generatedSku = variant.sku && variant.sku.trim() !== '' ? variant.sku : `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
                const payload = {
                    name: variant.name,
                    sku: generatedSku,
                    price: Number(variant.price) || 0,
                    discountPrice: variant.discountPrice ? Number(variant.discountPrice) : undefined,
                    stockQuantity: Number(variant.stockQuantity) || 0,
                    weight: Number(variant.weight) || 0.01,
                    isAvailable: Boolean(variant.isAvailable)
                };
                if (variant.id && !variant.isNew) {
                    await updateAdminVariant(variant.id, payload);
                } else {
                    await createAdminVariant(productId, payload);
                }
            }
            
            toast.success('Product updated successfully');
            router.push('/admin/products');
        } catch (err: any) {
            toast.error(err.message || 'Failed to update product');
        } finally {
            setIsSubmitting(false);
        }
    };

    const addVariant = () => {
        setVariants([...variants, {
            isNew: true,
            name: '',
            sku: `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            price: 0,
            discountPrice: 0,
            weight: 100,
            stockQuantity: 100,
            isAvailable: true
        }]);
    };

    const updateVariant = (index: number, field: string, value: any) => {
        const newVariants = [...variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setVariants(newVariants);
    };

    const removeVariant = (index: number) => {
        if (variants.length <= 1) {
            toast.error('Product must have at least one variant');
            return;
        }
        const variantToRemove = variants[index];
        if (variantToRemove.id && !variantToRemove.isNew) {
            setVariantsToDelete([...variantsToDelete, variantToRemove.id]);
        }
        setVariants(variants.filter((_, i) => i !== index));
    };

    if (isLoading) return <div className="p-8 text-center text-[#86162f]">Loading product...</div>;

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <Link href="/admin/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#86162f] font-poppins text-xs uppercase tracking-wider mb-4 transition-colors">
                    <ArrowLeft size={16} /> Back to Products
                </Link>
                <h1 className="font-seasons text-3xl text-[#86162f]">Edit Product</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-gray-100">
                    <h2 className="font-seasons text-xl text-[#86162f] mb-6">Basic Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block font-poppins text-xs font-medium text-gray-700">Product Name *</label>
                            <input 
                                type="text" required value={product.name}
                                onChange={e => setProduct({...product, name: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-200 rounded-sm font-poppins text-sm focus:outline-none focus:border-[#86162f]/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block font-poppins text-xs font-medium text-gray-700">Category</label>
                            <select 
                                value={product.categoryId}
                                onChange={e => setProduct({...product, categoryId: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-200 rounded-sm font-poppins text-sm focus:outline-none focus:border-[#86162f]/30"
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="block font-poppins text-xs font-medium text-gray-700">Description *</label>
                            <textarea 
                                required rows={4} value={product.description}
                                onChange={e => setProduct({...product, description: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-200 rounded-sm font-poppins text-sm focus:outline-none focus:border-[#86162f]/30"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="block font-poppins text-xs font-medium text-gray-700">Image URLs (comma separated)</label>
                            <input 
                                type="text" value={product.images}
                                onChange={e => setProduct({...product, images: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-200 rounded-sm font-poppins text-sm focus:outline-none focus:border-[#86162f]/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block font-poppins text-xs font-medium text-gray-700">Badge/Tag</label>
                            <input 
                                type="text" value={product.tag}
                                onChange={e => setProduct({...product, tag: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-200 rounded-sm font-poppins text-sm focus:outline-none focus:border-[#86162f]/30"
                            />
                        </div>
                        <div className="flex items-center gap-6 mt-4">
                            <label className="flex items-center gap-2 font-poppins text-sm text-gray-700 cursor-pointer">
                                <input type="checkbox" checked={product.isAvailable} onChange={e => setProduct({...product, isAvailable: e.target.checked})} className="rounded text-[#86162f]" /> Available
                            </label>
                            <label className="flex items-center gap-2 font-poppins text-sm text-gray-700 cursor-pointer">
                                <input type="checkbox" checked={product.isFeatured} onChange={e => setProduct({...product, isFeatured: e.target.checked})} className="rounded text-[#86162f]" /> Featured Product
                            </label>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-seasons text-xl text-[#86162f]">Variants</h2>
                        <button type="button" onClick={addVariant} className="text-[#86162f] hover:bg-[#86162f]/5 px-4 py-2 rounded-sm font-poppins text-xs font-medium uppercase tracking-wider flex items-center gap-2">
                            <Plus size={16} /> Add Variant
                        </button>
                    </div>

                    <div className="space-y-6">
                        {variants.map((variant, index) => (
                            <div key={index} className="p-4 border border-gray-100 rounded-sm relative bg-[#fcf9f8]/30">
                                {variants.length > 1 && (
                                    <button type="button" onClick={() => removeVariant(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="block font-poppins text-[10px] uppercase text-gray-500">Variant Name</label>
                                        <input type="text" required value={variant.name} onChange={e => updateVariant(index, 'name', e.target.value)} className="w-full px-3 py-1.5 border border-gray-200 rounded-sm font-poppins text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block font-poppins text-[10px] uppercase text-gray-500">SKU</label>
                                        <input type="text" required value={variant.sku} onChange={e => updateVariant(index, 'sku', e.target.value)} className="w-full px-3 py-1.5 border border-gray-200 rounded-sm font-poppins text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block font-poppins text-[10px] uppercase text-gray-500">Price (₹)</label>
                                        <input type="number" required min="0" step="0.01" value={variant.price} onChange={e => updateVariant(index, 'price', e.target.value)} className="w-full px-3 py-1.5 border border-gray-200 rounded-sm font-poppins text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block font-poppins text-[10px] uppercase text-gray-500">Discount Price (₹)</label>
                                        <input type="number" min="0" step="0.01" value={variant.discountPrice || ''} onChange={e => updateVariant(index, 'discountPrice', e.target.value)} className="w-full px-3 py-1.5 border border-gray-200 rounded-sm font-poppins text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block font-poppins text-[10px] uppercase text-gray-500">Weight (g)</label>
                                        <input type="number" required min="0.01" step="0.01" value={variant.weight} placeholder="e.g. 500" onChange={e => updateVariant(index, 'weight', e.target.value)} className="w-full px-3 py-1.5 border border-gray-200 rounded-sm font-poppins text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block font-poppins text-[10px] uppercase text-gray-500">Stock Qty</label>
                                        <input type="number" required min="0" value={variant.stockQuantity} onChange={e => updateVariant(index, 'stockQuantity', e.target.value)} className="w-full px-3 py-1.5 border border-gray-200 rounded-sm font-poppins text-sm" />
                                    </div>
                                    <div className="space-y-1 flex items-center pt-5">
                                        <label className="flex items-center gap-2 font-poppins text-sm text-gray-700 cursor-pointer">
                                            <input type="checkbox" checked={variant.isAvailable} onChange={e => updateVariant(index, 'isAvailable', e.target.checked)} className="rounded text-[#86162f]" /> Available
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-[#86162f] to-[#a82043] text-white px-8 py-3 rounded-sm font-poppins font-medium tracking-wide hover:shadow-lg transition-all disabled:opacity-50">
                        {isSubmitting ? 'Updating...' : 'Update Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}
