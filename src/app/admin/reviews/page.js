"use client";

import { useState, useEffect } from "react";
import { Search, Trash2, MessageSquare } from "lucide-react";

const REVIEW_STATUSES = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

const STATUS_LABELS = {
  PENDING: "Очікує",
  APPROVED: "Схвалено",
  REJECTED: "Відхилено",
};

const ReviewResponseForm = ({ review, onSubmit, onCancel }) => {
  const [response, setResponse] = useState(review?.adminResponse || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ adminResponse: response });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Відгук від користувача</h3>
            <p className="text-gray-600">{review.comment}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Відповідь адміністратора
              </label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                rows="4"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Введіть вашу відповідь..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Скасувати
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Відправити
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function ReviewsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append("query", searchQuery);
      if (statusFilter) queryParams.append("status", statusFilter);

      const response = await fetch(`/api/admin/reviews?${queryParams}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }
      const data = await response.json();
      setReviews(data.reviews);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [searchQuery, statusFilter]);

  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/reviews?id=${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update review status");

      fetchReviews();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResponseSubmit = async (reviewId, data) => {
    try {
      const response = await fetch(`/api/admin/reviews?id=${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update review response");

      fetchReviews();
      setSelectedReview(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Ви впевнені, що хочете видалити цей відгук?")) return;

    try {
      const response = await fetch(`/api/admin/reviews?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete review");

      fetchReviews();
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) {
    return <div className="text-red-500 text-center py-4">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Управління відгуками
        </h1>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Пошук відгуків за товаром або користувачем..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-black"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-4 py-2 text-black"
        >
          <option value="">Всі статуси</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Користувач
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Товар
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Відгук
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Оцінка
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дії
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center">
                  Завантаження...
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center">
                  Відгуки не знайдено
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review.id}>
                  <td className="px-6 py-4 text-black">
                    <div>
                      <div className="font-medium">{review.user.name}</div>
                      <div className="text-sm text-gray-500">
                        {review.user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-black">
                    {review.product.name}
                  </td>
                  <td className="px-6 py-4 text-black">
                    <div>
                      <p className="text-sm">{review.comment}</p>
                      {review.adminResponse && (
                        <div className="mt-2 text-sm text-gray-500">
                          <p className="font-medium">Відповідь:</p>
                          <p>{review.adminResponse}</p>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {review.rating} / 5
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={review.status}
                      onChange={(e) =>
                        handleStatusChange(review.id, e.target.value)
                      }
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        STATUS_COLORS[review.status]
                      }`}
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedReview(review)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedReview && (
        <ReviewResponseForm
          review={selectedReview}
          onSubmit={(data) => handleResponseSubmit(selectedReview.id, data)}
          onCancel={() => setSelectedReview(null)}
        />
      )}
    </div>
  );
}
