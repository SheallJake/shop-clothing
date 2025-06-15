"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Trash2,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import React from "react";

const ReviewResponseForm = ({ review, onSubmit, onCancel }) => {
  const [response, setResponse] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ comment: response });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-[var(--card-bg)] rounded-lg p-6 max-w-md w-full shadow-[0_0_2px_var(--glow-color)]">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-[var(--foreground)]">
              Відгук від користувача
            </h3>
            <p className="text-[var(--foreground)] opacity-70">
              {review.comment}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]">
                Відповідь адміністратора
              </label>
              <textarea
                className="mt-1 block w-full rounded-md border-[var(--border)] bg-[var(--input-bg)] text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-[var(--accent)]"
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
                className="px-4 py-2 border border-[var(--border)] rounded-md text-[var(--foreground)] hover:bg-[var(--hover-bg)]"
              >
                Скасувати
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[var(--accent)] text-[var(--background)] rounded-md hover:bg-[var(--accent-hover)]"
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
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const router = useRouter();
  const hasShownToast = useRef(false);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/session");
      if (!res.ok) throw new Error("Session check failed");
      const data = await res.json();

      if (!data.user || data.user.role.toLowerCase() !== "admin") {
        if (!hasShownToast.current) {
          hasShownToast.current = true;
          toast.error("Доступ заборонено");
          router.push("/");
        }
        return;
      }
    } catch (err) {
      console.error("Помилка перевірки сесії:", err);
      if (!hasShownToast.current) {
        hasShownToast.current = true;
        toast.error("Помилка перевірки сесії");
        router.push("/");
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append("query", searchQuery);

      const response = await fetch(`/api/admin/reviews?${queryParams}`);

      if (response.status === 401) {
        if (!hasShownToast.current) {
          hasShownToast.current = true;
          toast.error("Доступ заборонено");
          router.push("/");
        }
        return;
      }

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
      if (err.message.includes("Unauthorized")) {
        if (!hasShownToast.current) {
          hasShownToast.current = true;
          toast.error("Доступ заборонено");
          router.push("/");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [searchQuery]);

  const handleResponseSubmit = async (reviewId, data) => {
    try {
      const response = await fetch(`/api/admin/reviews?id=${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Не вдалося оновити відповідь на відгук"
        );
      }

      await fetchReviews();
      setSelectedReview(null);
      toast.success("Відповідь успішно додано");
    } catch (err) {
      console.error("Error updating review:", err);
      toast.error(err.message || "Помилка при оновленні відгуку");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Ви впевнені, що хочете видалити цей відгук?")) return;

    try {
      const response = await fetch(`/api/admin/reviews?id=${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401) {
          toast.error("Доступ заборонено");
          router.push("/");
          return;
        }

        if (response.status === 404) {
          toast.error("Відгук не знайдено");
          return;
        }

        throw new Error(
          errorData.error ||
            `Помилка при видаленні відгуку (${response.status})`
        );
      }

      await fetchReviews();
      toast.success("Відгук успішно видалено");
    } catch (err) {
      console.error("Error deleting review:", err);
      toast.error(
        err.message || "Помилка при видаленні відгуку. Спробуйте пізніше."
      );
    }
  };

  const toggleRow = (reviewId) => {
    setExpandedRowId((prev) => (prev === reviewId ? null : reviewId));
  };

  if (error) {
    toast.error(error);
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">
          Управління відгуками
        </h1>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Пошук відгуків за товаром або користувачем..."
            className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--input-bg)] text-[var(--foreground)]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--foreground)] opacity-50 w-5 h-5" />
        </div>
      </div>

      <div className="bg-[var(--card-bg)] rounded-lg shadow-[0_0_2px_var(--glow-color)] overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--border)]">
          <thead className="bg-[var(--card-bg)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] opacity-70 uppercase tracking-wider">
                Користувач
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] opacity-70 uppercase tracking-wider">
                Товар
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] opacity-70 uppercase tracking-wider">
                Відгук
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] opacity-70 uppercase tracking-wider">
                Оцінка
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] opacity-70 uppercase tracking-wider">
                Дата
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] opacity-70 uppercase tracking-wider">
                Дії
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {isLoading ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-4 text-center text-[var(--foreground)]"
                >
                  Завантаження...
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-4 text-center text-[var(--foreground)]"
                >
                  Відгуки не знайдено
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <React.Fragment key={review.id}>
                  <tr
                    onClick={() => toggleRow(review.id)}
                    className={`cursor-pointer transition-all duration-200 ease-in-out ${
                      expandedRowId === review.id
                        ? "bg-[var(--hover-bg)]"
                        : "hover:bg-[var(--hover-bg)]"
                    }`}
                  >
                    <td className="px-6 py-4 text-[var(--foreground)]">
                      <div>
                        <div className="font-medium">{review.user.name}</div>
                        <div className="text-sm opacity-70">
                          {review.user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--foreground)]">
                      {review.product.name}
                    </td>
                    <td className="px-6 py-4 text-[var(--foreground)]">
                      <div className="flex items-center gap-2">
                        <p className="text-sm line-clamp-1">{review.comment}</p>
                        <div
                          className={`transform transition-transform duration-200 ${
                            expandedRowId === review.id ? "rotate-180" : ""
                          }`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--foreground)]">
                      {review.rating} / 5
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--foreground)]">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(review.id);
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors duration-200"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr
                    className={`transition-all duration-500 ease-in-out ${
                      expandedRowId === review.id
                        ? "opacity-100 max-h-[500px]"
                        : "opacity-0 max-h-0 hidden"
                    }`}
                  >
                    <td
                      colSpan="6"
                      className={`overflow-hidden transition-all duration-500 ease-in-out ${
                        expandedRowId === review.id ? "py-4" : "py-0"
                      }`}
                    >
                      <div
                        className={`pl-6 border-l-2 border-[var(--accent)] transition-all duration-500 ease-in-out ${
                          expandedRowId === review.id
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 -translate-x-4"
                        }`}
                      >
                        <h4
                          className={`font-medium text-[var(--foreground)] mb-2 transition-all duration-300 ${
                            expandedRowId === review.id
                              ? "opacity-100 translate-y-0"
                              : "opacity-0 -translate-y-2"
                          }`}
                        >
                          Повний текст відгуку:
                        </h4>
                        <p
                          className={`text-[var(--foreground)] whitespace-pre-wrap transition-all duration-300 delay-100 ${
                            expandedRowId === review.id
                              ? "opacity-100 translate-y-0"
                              : "opacity-0 translate-y-2"
                          }`}
                        >
                          {review.comment}
                        </p>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
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
