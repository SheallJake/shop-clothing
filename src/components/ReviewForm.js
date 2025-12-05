import { useState, useEffect } from "react";
import { BiStar } from "react-icons/bi";
import { useAuthModal } from "@/context/AuthModalContext";

export default function ReviewForm({ productId, onReviewSubmitted }) {
  const [session, setSession] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/session");
        const data = await response.json();
        setSession(data.user);
      } catch (error) {
        console.error("Session check error:", error);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          rating,
          comment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      setRating(0);
      setComment("");
      if (onReviewSubmitted) {
        onReviewSubmitted(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="text-center py-4">
        <p className="text-zinc-600 dark:text-zinc-400">
          Будь ласка,{" "}
          <button
            onClick={() => openAuthModal("login")}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            увійдіть
          </button>{" "}
          щоб залишити відгук
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
          Оцінка
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none p-1"
            >
              <BiStar
                className={`w-6 h-6 ${
                  star <= rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-zinc-300 dark:text-zinc-600"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="comment"
          className="block text-sm font-medium text-zinc-900 dark:text-white mb-2"
        >
          Коментар
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Напишіть ваш відгук..."
        />
      </div>

      {error && (
        <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || rating === 0}
        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          isSubmitting || rating === 0
            ? "bg-zinc-400 dark:bg-zinc-600 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        }`}
      >
        {isSubmitting ? "Відправляємо..." : "Відправити відгук"}
      </button>
    </form>
  );
}
