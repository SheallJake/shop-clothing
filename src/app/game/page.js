"use client";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

export default function PromoGamePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [promo, setPromo] = useState(null);
  const [discount, setDiscount] = useState(null);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [nextAttemptTime, setNextAttemptTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Отримання початкової кількості спроб
  useEffect(() => {
    const checkAttempts = async () => {
      try {
        const res = await fetch("/api/promocode/generate", {
          method: "POST",
        });
        const data = await res.json();

        if (res.status === 401) {
          setError("Будь ласка, увійдіть в систему, щоб грати");
          setAttemptsLeft(0);
        } else if (res.status === 429) {
          setError(data.error);
          setNextAttemptTime(new Date(data.nextAttemptTime).getTime());
          setAttemptsLeft(0);
        } else if (res.ok) {
          setAttemptsLeft(data.attemptsLeft);
        }
      } catch (err) {
        console.error("Error checking attempts:", err);
      } finally {
        setInitialLoading(false);
      }
    };

    checkAttempts();
  }, []);

  // Update timer
  useEffect(() => {
    if (!nextAttemptTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now >= nextAttemptTime) {
        setNextAttemptTime(null);
        setTimeLeft(null);
        setAttemptsLeft(3);
      } else {
        setTimeLeft(Math.ceil((nextAttemptTime - now) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextAttemptTime]);

  // Rotation animation
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setRotation((prev) => (prev + 10) % 360);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 999,
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const playGame = async () => {
    try {
      setError(null);
      setLoading(true);

      const res = await fetch("/api/promocode/generate", {
        method: "POST",
      });
      const data = await res.json();

      if (res.status === 401) {
        setError("Будь ласка, увійдіть в систему, щоб грати");
        setAttemptsLeft(0);
        return;
      }

      if (res.status === 429) {
        setError(data.error);
        setNextAttemptTime(new Date(data.nextAttemptTime).getTime());
        setAttemptsLeft(0);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Помилка генерації промокоду");
      }

      setPromo(data.promo);
      setDiscount(data.discountPercent);
      setAttemptsLeft(data.attemptsLeft);
      triggerConfetti();
    } catch (err) {
      setError(err.message || "Сталася помилка. Спробуйте ще раз пізніше.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8">
        <div className="max-w-md w-full bg-[var(--card-bg)] backdrop-blur-lg rounded-2xl p-8 shadow-2xl text-center border border-[var(--card-border)]">
          <p className="text-lg">Завантаження...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8">
      <div className="max-w-md w-full bg-[var(--card-bg)] backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-[var(--card-border)]">
        <h1 className="text-3xl font-bold mb-6 text-center">
          🎁 Мiнi-гра: Виграй знижку!
        </h1>

        {error && (
          <div className="bg-red-500/20 text-[var(--foreground)] p-4 rounded-lg mb-6 text-center border border-[var(--card-border)]">
            {error}
            {error.includes("увійдіть в систему") && (
              <button
                onClick={() => router.push("/login")}
                className="block w-full mt-2 px-4 py-2 bg-[var(--card-bg)] text-[var(--foreground)] rounded-lg hover:bg-[var(--hover-bg)] transition border border-[var(--card-border)]"
              >
                Увійти
              </button>
            )}
          </div>
        )}

        {nextAttemptTime && timeLeft && (
          <div className="bg-[var(--card-bg)] p-4 rounded-lg mb-6 text-center border border-[var(--card-border)]">
            <p className="text-sm mb-2">Наступна спроба буде доступна через:</p>
            <p className="font-mono text-xl">
              {Math.floor(timeLeft / 3600)}:
              {Math.floor((timeLeft % 3600) / 60)
                .toString()
                .padStart(2, "0")}
              :{(timeLeft % 60).toString().padStart(2, "0")}
            </p>
          </div>
        )}

        {promo ? (
          <div className="text-center">
            <div className="bg-[var(--card-bg)] text-[var(--foreground)] p-6 rounded-lg shadow-inner mb-4 border border-[var(--card-border)]">
              <p className="text-sm mb-2">Ваш промокод:</p>
              <p className="text-2xl font-mono font-bold tracking-wider">
                {promo}
              </p>
              {discount && (
                <p className="text-sm mt-2 text-green-600">
                  Знижка: {discount}%
                </p>
              )}
            </div>
            <button
              onClick={() => {
                setPromo(null);
                setDiscount(null);
              }}
              className="text-sm underline hover:text-[var(--muted)] transition"
            >
              Спробувати ще раз
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-6 text-sm opacity-80">
              У вас залишилось спроб сьогодні: {attemptsLeft}
            </p>
            <button
              onClick={playGame}
              disabled={loading || attemptsLeft <= 0}
              className="relative px-8 py-4 bg-[var(--card-bg)] text-[var(--foreground)] font-semibold rounded-lg shadow-lg text-lg transition transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 border border-[var(--card-border)]"
              style={{
                transform: loading ? `rotate(${rotation}deg)` : "none",
              }}
            >
              {loading ? "🎲" : "Натисни, щоб виграти промокод!"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
