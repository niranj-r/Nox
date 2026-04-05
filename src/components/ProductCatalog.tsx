import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Helmet } from 'react-helmet-async';
import { db } from '../lib/firebase';
import AlternateHero from './AlternateHero';
import AlternateCollections from './AlternateCollections';
import About from './About';


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
  ring_sizes?: string[];
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
    <div className="relative w-full">
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "ItemList",
            "itemListElement": products.map((product, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Product",
                "name": product.name,
                "description": product.description,
                "image": product.primary_image,
                "offers": {
                  "@type": "Offer",
                  "price": product.price,
                  "priceCurrency": "INR",
                  "availability": product.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
                }
              }
            }))
          })}
        </script>
      </Helmet>
      <div className="sticky top-0 z-0 w-full">

        <AlternateHero
          products={products}
          onProductClick={handleHeroItemClick}
        />
      </div>

      <div className="relative z-10 w-full shadow-[0_-20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_-20px_50px_rgba(0,0,0,0.5)] bg-[#F6F6F6] dark:bg-[#121212]">
        <About />
        <div ref={collectionsRef} id="collections" className="w-full">
          <AlternateCollections
            products={products}
            externalSelectedIndex={heroSelectedIndex}
            onSelectionChange={setHeroSelectedIndex}
          />
        </div>
      </div>
    </div>
  );
}
