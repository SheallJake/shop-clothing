import { useState, useEffect } from "react";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";

export default function ReviewSection({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?productId=${productId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleReviewSubmitted = (newReview) => {
    setReviews((prevReviews) => [newReview, ...prevReviews]);
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <p className="text-zinc-600 dark:text-zinc-400">
          Завантаження відгуків...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-zinc-900 dark:text-white">
          Відгуки
        </h2>
        <ReviewForm
          productId={productId}
          onReviewSubmitted={handleReviewSubmitted}
        />
      </div>

      <div>
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
          Всі відгуки ({reviews.length})
        </h3>
        <ReviewList reviews={reviews} />
      </div>
    </div>
  );
}
