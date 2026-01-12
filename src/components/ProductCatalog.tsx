import { useState, useEffect } from 'react';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ProductCard from './ProductCard';
import BrandShowcase from './BrandShowcase';
import ProductModal from './ProductModal';

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
  created_at?: any;
}

export default function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    material: '',
    color: '',
    collection: '',
  });

  const [sortBy, setSortBy] = useState('newest');

  const [materials, setMaterials] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [collections, setCollections] = useState<string[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [products, filters, sortBy]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'products'), orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate ? doc.data().created_at.toDate().toISOString() : doc.data().created_at
      })) as Product[];

      setProducts(data);

      const uniqueMaterials = [...new Set(data.map((p) => p.material))];
      const uniqueColors = [...new Set(data.map((p) => p.color))];
      const uniqueCollections = [...new Set(data.map((p) => p.collection))];

      setMaterials(uniqueMaterials);
      setColors(uniqueColors);
      setCollections(uniqueCollections);
    } catch (error) {
      console.error("Error loading products:", error);
    }

    setLoading(false);
  };

  const applyFiltersAndSort = () => {
    let filtered = [...products];

    if (filters.material) {
      filtered = filtered.filter((p) => p.material === filters.material);
    }

    if (filters.color) {
      filtered = filtered.filter((p) => p.color === filters.color);
    }

    if (filters.collection) {
      filtered = filtered.filter((p) => p.collection === filters.collection);
    }

    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateB - dateA;
        });
        break;
    }

    setFilteredProducts(filtered);
  };

  const clearFilters = () => {
    setFilters({
      material: '',
      color: '',
      collection: '',
    });
  };

  return (
    <>
      <BrandShowcase />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-primary dark:text-accent mb-2">
              Our Collection
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-primary-light rounded-lg hover:bg-gray-50 dark:hover:bg-primary-light transition-smooth"
            >
              <Filter className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <span className="text-gray-700 dark:text-gray-300">Filters</span>
            </button>

            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-primary-light rounded-lg bg-white dark:bg-primary text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary dark:focus:ring-accent transition-smooth"
              >
                <option value="newest">Newest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="mb-8 p-6 bg-gray-50 dark:bg-primary-light rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Material
                </label>
                <select
                  value={filters.material}
                  onChange={(e) => setFilters({ ...filters, material: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-primary rounded-lg bg-white dark:bg-primary text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary dark:focus:ring-accent transition-smooth"
                >
                  <option value="">All Materials</option>
                  {materials.map((material) => (
                    <option key={material} value={material}>
                      {material}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <select
                  value={filters.color}
                  onChange={(e) => setFilters({ ...filters, color: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-primary rounded-lg bg-white dark:bg-primary text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary dark:focus:ring-accent transition-smooth"
                >
                  <option value="">All Colors</option>
                  {colors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Collection
                </label>
                <select
                  value={filters.collection}
                  onChange={(e) => setFilters({ ...filters, collection: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-primary rounded-lg bg-white dark:bg-primary text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary dark:focus:ring-accent transition-smooth"
                >
                  <option value="">All Collections</option>
                  {collections.map((collection) => (
                    <option key={collection} value={collection}>
                      {collection}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={clearFilters}
              className="text-sm text-primary dark:text-accent hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-accent"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        )}

        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </div>
    </>
  );
}
