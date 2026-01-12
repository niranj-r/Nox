import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

const sampleProducts = [
    {
        name: "Obsidian Signet Ring",
        description: "A bold statement piece featuring a hand-polished black obsidian stone set in brushed sterling silver. The signet shape is modernized with sharp angles and a matte finish.",
        price: 185.00,
        material: "Sterling Silver & Obsidian",
        color: "Silver/Black",
        collection: "Noir",
        stock_quantity: 15,
        is_limited_edition: false,
        is_low_stock: false,
        primary_image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&q=80&w=800",
        hover_image: "https://images.unsplash.com/photo-1617038224538-4089b6574a42?auto=format&fit=crop&q=80&w=800",
        detail_images: [
            "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1617038224538-4089b6574a42?auto=format&fit=crop&q=80&w=800"
        ]
    },
    {
        name: "Eclipse Cuff",
        description: "Minimalist open bangle design crafted from matte black titanium. Lightweight yet incredibly durable, perfect for daily wear.",
        price: 120.00,
        material: "Black Titanium",
        color: "Black",
        collection: "Eclipse",
        stock_quantity: 25,
        is_limited_edition: false,
        is_low_stock: false,
        primary_image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800",
        hover_image: "https://images.unsplash.com/photo-1611591437294-460bfbe1220a?auto=format&fit=crop&q=80&w=800",
        detail_images: []
    },
    {
        name: "Viper Chain Necklace",
        description: "A 5mm oxidized silver chain with a unique snake scale texture. Features a custom locking clasp mechanism.",
        price: 240.00,
        material: "Oxidized Silver",
        color: "Dark Grey",
        collection: "Solstice",
        stock_quantity: 8,
        is_limited_edition: true,
        is_low_stock: true,
        primary_image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=800",
        hover_image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=800",
        detail_images: []
    },
    {
        name: "Onyx Bead Bracelet",
        description: "Matte black onyx beads paired with a single 18k gold plated accent bead. Strung on high-strength elastic cord.",
        price: 85.00,
        material: "Onyx & Gold Plated",
        color: "Black/Gold",
        collection: "Noir",
        stock_quantity: 50,
        is_limited_edition: false,
        is_low_stock: false,
        primary_image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800",
        hover_image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=800",
        detail_images: []
    },
    {
        name: "Apex Geometric Ring",
        description: "Architectural ring design featuring sharp facets and a brushed finish. Inspired by brutalist architecture.",
        price: 145.00,
        material: "Stainless Steel",
        color: "Silver",
        collection: "Apex",
        stock_quantity: 20,
        is_limited_edition: false,
        is_low_stock: false,
        primary_image: "https://images.unsplash.com/photo-1605100804763-ebea2407a97c?auto=format&fit=crop&q=80&w=800",
        hover_image: "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&q=80&w=800",
        detail_images: []
    },
    {
        name: "Carbon Fiber Inlay Ring",
        description: "Sleek tungsten carbide band with a real carbon fiber inlay. Scratch-resistant and hypoallergenic.",
        price: 160.00,
        material: "Tungsten & Carbon Fiber",
        color: "Black/Grey",
        collection: "Eclipse",
        stock_quantity: 12,
        is_limited_edition: false,
        is_low_stock: false,
        primary_image: "https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?auto=format&fit=crop&q=80&w=800",
        hover_image: "https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?auto=format&fit=crop&q=80&w=800",
        detail_images: []
    },
    {
        name: "Leather Wrap Anchor Bracelet",
        description: "Premium Italian leather cord wraps twice around the wrist, secured by a solid brass anchor hook.",
        price: 95.00,
        material: "Leather & Brass",
        color: "Brown/Gold",
        collection: "Solstice",
        stock_quantity: 30,
        is_limited_edition: false,
        is_low_stock: false,
        primary_image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800",
        hover_image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=800",
        detail_images: []
    },
    {
        name: "Meteorite Pendant",
        description: "Genuine Muonionalusta meteorite slice set in a silver bezel. Each piece has a unique widmanstätten pattern.",
        price: 320.00,
        material: "Meteorite & Silver",
        color: "Silver/Grey",
        collection: "Eclipse",
        stock_quantity: 5,
        is_limited_edition: true,
        is_low_stock: true,
        primary_image: "https://images.unsplash.com/photo-1599643477877-5313557d7d89?auto=format&fit=crop&q=80&w=800",
        hover_image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&q=80&w=800",
        detail_images: []
    },
    {
        name: "Minimal Bar Necklace",
        description: "A vertical bar pendant on a box chain. Clean lines and a polished rose gold finish.",
        price: 135.00,
        material: "Rose Gold Plated",
        color: "Rose Gold",
        collection: "Apex",
        stock_quantity: 18,
        is_limited_edition: false,
        is_low_stock: false,
        primary_image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=800",
        hover_image: "https://images.unsplash.com/photo-1562207137-b67773229b0b?auto=format&fit=crop&q=80&w=800",
        detail_images: []
    },
    {
        name: "Tiger Eye Stone Ring",
        description: "Vintage-inspired setting holding a chatoyant tiger eye stone. The band features intricate scrollwork engravings.",
        price: 155.00,
        material: "Bronze & Tiger Eye",
        color: "Bronze/Brown",
        collection: "Solstice",
        stock_quantity: 22,
        is_limited_edition: false,
        is_low_stock: false,
        primary_image: "https://images.unsplash.com/photo-1587326463991-314b9c59c5d1?auto=format&fit=crop&q=80&w=800",
        hover_image: "https://images.unsplash.com/photo-1587326463991-314b9c59c5d1?auto=format&fit=crop&q=80&w=800",
        detail_images: []
    },
    {
        name: "Cuban Link Bracelet",
        description: "Classic 8mm Cuban link bracelet with a high-shine finish. A timeless staple for any wardrobe.",
        price: 210.00,
        material: "Sterling Silver",
        color: "Silver",
        collection: "Noir",
        stock_quantity: 14,
        is_limited_edition: false,
        is_low_stock: false,
        primary_image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=800",
        hover_image: "https://images.unsplash.com/photo-1611591437294-460bfbe1220a?auto=format&fit=crop&q=80&w=800",
        detail_images: []
    },
    {
        name: "Skull Stud Earrings",
        description: "Small, detailed skull studs. Subtle edge for the modern rebel to wear every day.",
        price: 65.00,
        material: "Oxidized Silver",
        color: "Dark Grey",
        collection: "Noir",
        stock_quantity: 40,
        is_limited_edition: false,
        is_low_stock: false,
        primary_image: "https://images.unsplash.com/photo-1635767798638-3e252329d38b?auto=format&fit=crop&q=80&w=800",
        hover_image: "https://images.unsplash.com/photo-1635767798638-3e252329d38b?auto=format&fit=crop&q=80&w=800",
        detail_images: []
    },
    {
        name: "Braided Leather Bracelet",
        description: "Double-braided leather in deep navy blue, finished with a magnetic stainless steel clasp.",
        price: 75.00,
        material: "Leather & Steel",
        color: "Navy/Silver",
        collection: "Eclipse",
        stock_quantity: 35,
        is_limited_edition: false,
        is_low_stock: false,
        primary_image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800",
        hover_image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=800",
        detail_images: []
    },
    {
        name: "Damascus Steel Ring",
        description: "Forged Damascus steel band revealing a wood-grain pattern. Acid etched to enhance contrast.",
        price: 195.00,
        material: "Damascus Steel",
        color: "Grey/Black",
        collection: "Apex",
        stock_quantity: 9,
        is_limited_edition: false,
        is_low_stock: true,
        primary_image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&q=80&w=800",
        hover_image: "https://images.unsplash.com/photo-1617038224538-4089b6574a42?auto=format&fit=crop&q=80&w=800",
        detail_images: []
    },
    {
        name: "Lapis Lazuli Pendant",
        description: "Deep blue Lapis Lazuli stone with natural golden pyrite flecks. Set in a rugged silver casing.",
        price: 170.00,
        material: "Silver & Lapis",
        color: "Blue/Silver",
        collection: "Solstice",
        stock_quantity: 16,
        is_limited_edition: false,
        is_low_stock: false,
        primary_image: "https://images.unsplash.com/photo-1599643477877-5313557d7d89?auto=format&fit=crop&q=80&w=800",
        hover_image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&q=80&w=800",
        detail_images: []
    }
];

export const seedProducts = async () => {
    try {
        const collectionRef = collection(db, 'products');

        // Check if products already exist to avoid duplicates
        const q = query(collectionRef, where("name", "in", sampleProducts.map(p => p.name).slice(0, 10))); // query limit check
        const existingDocs = await getDocs(collectionRef);

        if (!existingDocs.empty) {
            console.log("Database looks already populated. Skipping seed.");
            return { success: false, message: "Database already populated" };
        }

        let count = 0;
        for (const product of sampleProducts) {
            await addDoc(collectionRef, {
                ...product,
                created_at: new Date()
            });
            count++;
        }
        return { success: true, message: `Successfully added ${count} products` };
    } catch (error) {
        console.error("Error seeding products:", error);
        return { success: false, message: "Error seeding products: " + (error as Error).message };
    }
};
