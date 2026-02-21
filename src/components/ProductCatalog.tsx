import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import AlternateHero from './AlternateHero';
import AlternateCollections from './AlternateCollections';

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
  rating?: number;
  review_count?: number;
}

export default function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [heroSelectedIndex, setHeroSelectedIndex] = useState(0);
  const collectionsRef = useRef<HTMLDivElement>(null);

  const handleHeroItemClick = (index: number) => {
    setHeroSelectedIndex(index);
    if (collectionsRef.current) {
      collectionsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const q = query(collection(db, 'products'), orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate ? doc.data().created_at.toDate().toISOString() : doc.data().created_at
      })) as Product[];

      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  return (
    <>
      <AlternateHero
        products={products}
        onProductClick={handleHeroItemClick}
      />
      <div ref={collectionsRef}>
        <AlternateCollections
          products={products}
          externalSelectedIndex={heroSelectedIndex}
          onSelectionChange={setHeroSelectedIndex}
        />
      </div>
    </>
  );
}
