import { Star } from "lucide-react";

export default function ReviewList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600">Поки що немає відгуків</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">{review.user.name}</span>
              <span className="text-gray-500 text-sm">
                {new Date(review.createdAt).toLocaleDateString("uk-UA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className={`w-4 h-4 ${
                    index < review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
          {review.comment && (
            <p className="text-gray-700 whitespace-pre-wrap">
              {review.comment}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
