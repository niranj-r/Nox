import { useState, useEffect } from 'react';
import { Star, User } from 'lucide-react';
import { collection, query, where, getDocs, doc, runTransaction } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

interface Review {
    id: string;
    user_id: string;
    user_name: string;
    rating: number;
    comment: string;
    created_at: string;
}

interface ProductReviewsProps {
    productId: string;
    onReviewAdded: (newRating: number, newCount: number) => void;
}

export default function ProductReviews({ productId, onReviewAdded }: ProductReviewsProps) {
    const { user, profile } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadReviews();
    }, [productId]);

    const loadReviews = async () => {
        try {
            const q = query(
                collection(db, 'reviews'),
                where('product_id', '==', productId)
                // orderBy('created_at', 'desc') // Requires index, doing client sort temporarily
            );
            const querySnapshot = await getDocs(q);
            const reviewsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                created_at: doc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString()
            })) as Review[];

            reviewsData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setReviews(reviewsData);
        } catch (error) {
            console.error("Error loading reviews:", error);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !profile) return;

        setSubmitting(true);
        try {
            const productRef = doc(db, 'products', productId);

            await runTransaction(db, async (transaction) => {
                const productDoc = await transaction.get(productRef);
                if (!productDoc.exists()) throw "Product does not exist!";

                const productData = productDoc.data();
                const currentRating = productData.rating || 0;
                const currentCount = productData.review_count || 0;

                const newCount = currentCount + 1;
                const newRating = ((currentRating * currentCount) + rating) / newCount;

                // Create review
                const reviewRef = doc(collection(db, 'reviews'));
                transaction.set(reviewRef, {
                    product_id: productId,
                    user_id: user.uid,
                    user_name: profile.name || 'Anonymous',
                    rating: rating,
                    comment: comment,
                    created_at: new Date()
                });

                // Update product
                transaction.update(productRef, {
                    rating: newRating,
                    review_count: newCount
                });

                return { newRating, newCount };
            }).then((result) => {
                setReviews([
                    {
                        id: 'temp-' + Date.now(),
                        user_id: user.uid,
                        user_name: profile.name || 'Anonymous',
                        rating: rating,
                        comment: comment,
                        created_at: new Date().toISOString()
                    },
                    ...reviews
                ]);
                setComment('');
                setRating(5);
                onReviewAdded(result.newRating, result.newCount);
            });

        } catch (error) {
            console.error("Error adding review:", error);
            alert("Failed to submit review");
        }
        setSubmitting(false);
    };

    return (
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-[#4A4A4A]">
            <h3 className="text-xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-6">
                Customer Reviews
            </h3>

            {/* Add Review Form */}
            {user ? (
                <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 dark:bg-[#363636] p-6 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Write a Review</h4>

                    <div className="flex items-center mb-4">
                        <span className="mr-3 text-sm text-gray-600 dark:text-gray-400">Rating:</span>
                        <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-6 h-6 ${star <= rating
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300 dark:text-gray-600'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your thoughts about this product..."
                            required
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-[#4A4A4A] rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-white bg-white dark:bg-[#424242] text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2 bg-primary dark:bg-white text-white dark:text-[#363636] rounded-lg hover:bg-primary-light dark:hover:bg-gray-300 transition-smooth disabled:opacity-50"
                    >
                        {submitting ? 'Submitting...' : 'Post Review'}
                    </button>
                </form>
            ) : (
                <div className="mb-8 p-4 bg-gray-50 dark:bg-[#363636] rounded-lg text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        Please sign in to write a review.
                    </p>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-white"></div>
                    </div>
                ) : reviews.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                        No reviews yet. Be the first to review!
                    </p>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-100 dark:border-[#4A4A4A] pb-6 last:border-0">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#363636] mr-3 flex items-center justify-center">
                                        <User className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                            {review.user_name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < review.rating
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-300 dark:text-gray-600'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                {review.comment}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
