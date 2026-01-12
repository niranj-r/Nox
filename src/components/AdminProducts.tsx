import { useState, useEffect } from 'react';
import { Plus, Trash, Search, X, Pencil } from 'lucide-react';
import { collection, getDocs, addDoc, deleteDoc, doc, query, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    material: string;
    color: string;
    collection: string;
    stock_quantity: number;
    is_limited_edition: boolean;
    is_low_stock: boolean;
    primary_image: string;
    hover_image: string;
    detail_images: string[];
}

export default function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        material: '',
        color: '',
        collection: '',
        stock_quantity: '',
        is_limited_edition: false,
        is_low_stock: false,
        primary_image: '',
        hover_image: '',
        detail_images_str: '' // Temporary string for input
    });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'products')); // Removed orderBy to avoid index issues if created_at missing
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
            setProducts(data);
        } catch (error) {
            console.error("Error loading products:", error);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const detailImages = formData.detail_images_str
                .split(',')
                .map(url => url.trim())
                .filter(url => url.length > 0);

            const productData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                material: formData.material,
                color: formData.color,
                collection: formData.collection,
                stock_quantity: parseInt(formData.stock_quantity),
                is_limited_edition: formData.is_limited_edition,
                is_low_stock: formData.is_low_stock,
                primary_image: formData.primary_image,
                hover_image: formData.hover_image,
                detail_images: detailImages,
            };

            if (editingId) {
                await updateDoc(doc(db, 'products', editingId), productData);
                alert('Product updated successfully!');
            } else {
                await addDoc(collection(db, 'products'), {
                    ...productData,
                    created_at: new Date().toISOString(),
                    rating: 0,
                    review_count: 0
                });
                alert('Product created successfully!');
            }

            resetForm();
            loadProducts();
        } catch (error) {
            console.error("Error saving product:", error);
            alert('Failed to save product');
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            material: '',
            color: '',
            collection: '',
            stock_quantity: '',
            is_limited_edition: false,
            is_low_stock: false,
            primary_image: '',
            hover_image: '',
            detail_images_str: ''
        });
    };

    const handleEdit = (product: Product) => {
        setEditingId(product.id);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            material: product.material,
            color: product.color,
            collection: product.collection,
            stock_quantity: product.stock_quantity.toString(),
            is_limited_edition: product.is_limited_edition,
            is_low_stock: product.is_low_stock,
            primary_image: product.primary_image,
            hover_image: product.hover_image,
            detail_images_str: product.detail_images.join(', ')
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await deleteDoc(doc(db, 'products', id));
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error("Error deleting product:", error);
            alert('Failed to delete product');
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.collection.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-gray-100">
                    Product Catalog
                </h2>
                <button
                    onClick={() => {
                        if (showForm) resetForm();
                        else setShowForm(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary dark:bg-accent text-white dark:text-primary rounded-lg hover:bg-primary-light dark:hover:bg-accent-dark transition-smooth"
                >
                    {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{showForm ? 'Cancel' : 'Add Product'}</span>
                </button>
            </div>

            {showForm && (
                <div className="bg-gray-50 dark:bg-primary p-6 rounded-lg mb-8 border border-gray-200 dark:border-primary-light">
                    <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">
                        {editingId ? 'Edit Product' : 'New Product Details'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border dark:bg-primary-light dark:border-primary border-gray-300"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Collection</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.collection}
                                    onChange={e => setFormData({ ...formData, collection: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border dark:bg-primary-light dark:border-primary border-gray-300"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border dark:bg-primary-light dark:border-primary border-gray-300"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Price ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border dark:bg-primary-light dark:border-primary border-gray-300"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Stock Quantity</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.stock_quantity}
                                    onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border dark:bg-primary-light dark:border-primary border-gray-300"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Material</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.material}
                                    onChange={e => setFormData({ ...formData, material: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border dark:bg-primary-light dark:border-primary border-gray-300"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Color</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.color}
                                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border dark:bg-primary-light dark:border-primary border-gray-300"
                                />
                            </div>

                            <div className="col-span-2 space-y-4 border-t border-gray-200 dark:border-primary pt-4 mt-2">
                                <h4 className="font-medium dark:text-gray-200">Images (URLs)</h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Primary Image URL</label>
                                        <input
                                            type="url"
                                            required
                                            placeholder="https://..."
                                            value={formData.primary_image}
                                            onChange={e => setFormData({ ...formData, primary_image: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border dark:bg-primary-light dark:border-primary border-gray-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Hover Image URL</label>
                                        <input
                                            type="url"
                                            required
                                            placeholder="https://..."
                                            value={formData.hover_image}
                                            onChange={e => setFormData({ ...formData, hover_image: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border dark:bg-primary-light dark:border-primary border-gray-300"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Detail Images (Comma separated URLs)</label>
                                    <textarea
                                        rows={2}
                                        placeholder="https://image1.jpg, https://image2.jpg"
                                        value={formData.detail_images_str}
                                        onChange={e => setFormData({ ...formData, detail_images_str: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border dark:bg-primary-light dark:border-primary border-gray-300"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-6 mt-2">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_limited_edition}
                                        onChange={e => setFormData({ ...formData, is_limited_edition: e.target.checked })}
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="dark:text-gray-300">Limited Edition</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_low_stock}
                                        onChange={e => setFormData({ ...formData, is_low_stock: e.target.checked })}
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="dark:text-gray-300">Low Stock Flag</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-smooth"
                            >
                                Create Product
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Product List */}
            <div className="bg-white dark:bg-primary-light rounded-lg shadow-md overflow-hidden">
                {loading && (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-accent"></div>
                    </div>
                )}
                <div className="p-4 border-b border-gray-200 dark:border-primary">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-primary rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-accent bg-white dark:bg-primary text-gray-900 dark:text-gray-100"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-primary border-b border-gray-200 dark:border-primary">
                            <tr>
                                <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Product</th>
                                <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Price</th>
                                <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Stock</th>
                                <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-primary">
                            {filteredProducts.map(product => (
                                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-primary transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={product.primary_image} alt={product.name} className="w-10 h-10 rounded object-cover" />
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">{product.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{product.collection}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">${product.price.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{product.stock_quantity}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="text-blue-500 hover:text-blue-700 p-2 mr-2"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="text-red-500 hover:text-red-700 p-2"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
