import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// שלבי הטעינה של ה-AI
const AI_STEPS = [
  { icon: "🧠", title: "מנתח את העסק שלך...", sub: "קורא את כל הפרטים שמסרת" },
  { icon: "🌍", title: "מחפש מיצוב בשוק...", sub: "בודק מה יבדל אותך מהמתחרים" },
  { icon: "✏️", title: "ממציא שמות מותג...", sub: "יוצר שמות עם Instant Recognition" },
  { icon: "🎨", title: "בונה פלטות צבעים...", sub: "מתאים צבעים לאופי העסק" },
  { icon: "💡", title: "מנסח אסטרטגיה...", sub: "מסביר למה כל שם עובד" },
  { icon: "✨", title: "מסיים ומלטש...", sub: "עוד רגע ו-3 קונספטים יוצגו" },
];

export default function BrandOptions() {
  const location = useLocation();
  const navigate = useNavigate();

  // 👈 השם שהגיע מה-Home
  const businessName = location.state?.businessName || "";

  const [formData, setFormData] = useState({
    essence: "",
    audience: "",
    style: "",
    tone: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState(null);
  const stepTimerRef = useRef(null);

  // מחלפים שלב כל 4 שניות
  useEffect(() => {
    if (loading) {
      setLoadingStep(0);
      stepTimerRef.current = setInterval(() => {
        setLoadingStep(prev => Math.min(prev + 1, AI_STEPS.length - 1));
      }, 4000);
    } else {
      clearInterval(stepTimerRef.current);
    }
    return () => clearInterval(stepTimerRef.current);
  }, [loading]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch((process.env.REACT_APP_API_URL || "http://127.0.0.1:5000") + "/api/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          ...formData,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `שגיאת שרת (${response.status})`);
      }

      const data = await response.json();

      navigate("/results", {
        state: {
          brandingResult: data.result,
          userInput: {
            businessName,
            ...formData,
          },
        },
      });
    } catch (error) {
      console.error("Branding error:", error);
      if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
        setError('השרת אינו זמין כרגע. ודאי שה-backend פעיל ונסי שוב.');
      } else {
        setError(error.message || 'אירעה שגיאה ביצירת המיתוג. נסי שוב.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ===== מסך טעינה מלא =====
  if (loading) {
    const step = AI_STEPS[loadingStep];
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 flex flex-col items-center justify-center px-4" dir="rtl">
        <div className="text-center max-w-md w-full">
          {/* אייקון גדול עם אנימציה */}
          <div className="relative w-28 h-28 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-r-purple-400 border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
            <div className="absolute inset-0 flex items-center justify-center text-4xl">
              {step.icon}
            </div>
          </div>

          {/* כותרת */}
          <h2 className="text-2xl font-black text-white mb-2">{step.title}</h2>
          <p className="text-indigo-200 text-sm mb-8">{step.sub}</p>

          {/* Progress bar */}
          <div className="w-full bg-white/10 rounded-full h-1.5 mb-6">
            <div
              className="bg-gradient-to-r from-indigo-400 to-purple-400 h-1.5 rounded-full transition-all duration-1000"
              style={{ width: `${((loadingStep + 1) / AI_STEPS.length) * 100}%` }}
            />
          </div>

          {/* נקודות שלבים */}
          <div className="flex justify-center gap-2">
            {AI_STEPS.map((s, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  i < loadingStep ? 'bg-indigo-400' :
                  i === loadingStep ? 'bg-white scale-125' :
                  'bg-white/20'
                }`}
              />
            ))}
          </div>

          <p className="text-white/40 text-xs mt-8">
            Gemini AI בונה עבורך 3 קונספטים שלמים — זה לוקח 15–30 שניות
          </p>
        </div>
      </div>
    );
  }

  // ===== טופס רגיל =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-start justify-center py-20 px-4 text-white">
      <div className="w-full max-w-3xl bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-10 text-gray-900">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-indigo-700 mb-3">
            Create Your Brand
          </h1>

          {businessName && (
            <p className="text-gray-500 text-lg">
              Brand name: <span className="font-semibold">{businessName}</span>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block font-semibold mb-2">מהות העסק</label>
            <textarea
              name="essence"
              rows={3}
              onChange={handleChange}
              className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">קהל יעד</label>
            <textarea
              name="audience"
              rows={3}
              onChange={handleChange}
              className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold mb-2">סגנון ויזואלי</label>
              <input
                name="style"
                onChange={handleChange}
                className="w-full p-4 rounded-xl border border-gray-300"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">טון דיבור</label>
              <input
                name="tone"
                onChange={handleChange}
                className="w-full p-4 rounded-xl border border-gray-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-6 rounded-2xl font-bold text-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60"
          >
            Generate Branding →
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-right">
              <p className="text-red-700 font-medium text-sm">{error}</p>
              <button
                type="button"
                onClick={() => setError(null)}
                className="mt-2 text-xs text-red-500 underline"
              >
                סגור
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
