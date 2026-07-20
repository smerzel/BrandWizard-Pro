import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";

// שלבי הטעינה של ה-AI
const POSTER_STEPS = [
  { icon: "📸", title: "מכוון עדשות...", sub: "מכין מצלמה וירטואלית" },
  { icon: "🎨", title: "מערבב צבעים...", sub: "מושך את צבעי המותג שלך" },
  { icon: "🪄", title: "יוצר קונספט מינימליסטי...", sub: "פוסטר ראשון בתהליך" },
  { icon: "🌆", title: "מעצב סצנה אדריכלית...", sub: "פוסטר שני בתהליך" },
  { icon: "✨", title: "מלטש פרטים...", sub: "זה לוקח טיפה זמן, אנחנו בסוף" },
];

export default function PosterGenerator() {
  const location = useLocation();
  const navigate = useNavigate();
  const brandingData = location.state;
  const { logo, tagline, businessName, colors } = brandingData || {};

  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  const [selectedPosterId, setSelectedPosterId] = useState(null);
  const stepTimerRef = useRef(null);

  useEffect(() => {
    if (loading) {
      setLoadingStep(0);
      stepTimerRef.current = setInterval(() => {
        setLoadingStep(prev => Math.min(prev + 1, POSTER_STEPS.length - 1));
      }, 5000);
    } else {
      clearInterval(stepTimerRef.current);
    }
    return () => clearInterval(stepTimerRef.current);
  }, [loading]);

  const primaryColor = colors?.[0] || "#6366f1";

  const generatePosters = async () => {
    if (!brandingData?.businessName) {
      setError("שגיאה: חסרים נתונים ליצירת פוסטרים");
      return;
    }

    setLoading(true);
    setError("");
    setPosters([]);
    setSelectedPosterId(null);

    try {
      const res = await fetch((process.env.REACT_APP_API_URL || "http://127.0.0.1:5000") + "/api/posters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brandingData),
      });

      if (!res.ok) throw new Error(`שגיאת שרת: ${res.status}`);
      const data = await res.json();

      if (data.posters?.length) {
        setPosters(data.posters);
      } else {
        throw new Error("לא התקבלו פוסטרים מהשרת");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (posterId) => {
    const element = document.getElementById(`poster-card-${posterId}`);
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        useCORS: true,
        scale: 2,
      });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${businessName}-Poster-${posterId}.png`;
      link.click();
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  if (!brandingData)
    return (
      <div className="text-center py-24 text-xl">
        לא נמצא מידע מיתוגי
      </div>
    );

  return (
    <>
      {/* LOADING OVERLAY */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center px-4" dir="rtl">
          <div className="bg-white rounded-[2.5rem] p-10 md:p-14 shadow-2xl text-center max-w-md w-full">
            
            {/* אייקון אנימטיבי */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-4xl">
                {POSTER_STEPS[loadingStep].icon}
              </div>
            </div>

            <h2 className="text-2xl font-black mb-2 text-slate-800">
              {POSTER_STEPS[loadingStep].title}
            </h2>
            <p className="text-slate-500 mb-8 font-medium">
              {POSTER_STEPS[loadingStep].sub}
            </p>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 mb-6">
              <div
                className="bg-indigo-500 h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${((loadingStep + 1) / POSTER_STEPS.length) * 100}%` }}
              />
            </div>

            <p className="text-slate-400 text-sm">
              יצירת תמונות ברזולוציה גבוהה לוקחת כ-30 עד 40 שניות
            </p>
          </div>
        </div>
      )}

      <div
        className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-20 text-right"
        dir="rtl"
      >
        {/* HERO */}
        <div className="max-w-6xl mx-auto text-center mb-20">
          <h1 className="text-5xl font-black mb-6 tracking-tight">
            הקמפיין הפרסומי שלך
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
            בחר את הפוסטר שמייצג אותך בצורה הכי חזקה —  
            משם נבנה דף נחיתה מדויק וממיר
          </p>

          <div className="flex justify-center gap-6 flex-wrap">
            {/* CREATE POSTERS */}
            <button
              onClick={generatePosters}
              disabled={loading}
              className={`
                px-10 py-4 rounded-full font-bold shadow-xl transition-all
                ${
                  loading
                    ? "bg-slate-400 text-white cursor-wait"
                    : "text-white hover:scale-105"
                }
              `}
              style={!loading ? { backgroundColor: primaryColor } : {}}
            >
              {loading ? "מעצב קמפיין…" : "צור פוסטרים"}
            </button>

            {/* CONTINUE */}
            <button
              onClick={() => {
                const selected =
                  posters.find((p) => p.id === selectedPosterId) ||
                  posters[0];
                navigate("/landingBuilder", {
                  state: { ...brandingData, selectedPoster: selected },
                });
              }}
              disabled={!posters.length || loading}
              className={`
                px-10 py-4 rounded-full font-bold shadow-xl transition-all
                ${
                  posters.length && !loading
                    ? "bg-emerald-600 text-white hover:scale-105"
                    : "bg-slate-300 text-slate-500 cursor-not-allowed"
                }
              `}
            >
              {loading
                ? "טוען פוסטרים…"
                : posters.length
                ? "המשך לדף הנחיתה"
                : "יש ליצור פוסטרים תחילה"}
            </button>
          </div>

          {error && (
            <p className="text-red-500 mt-6 font-medium">
              {error}
            </p>
          )}
        </div>

        {/* GRID */}
        <div className="max-w-7xl mx-auto grid gap-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {posters.map((poster) => (
            <div key={poster.id} className="group">
              <div
                id={`poster-card-${poster.id}`}
                onClick={() => setSelectedPosterId(poster.id)}
                className={`
                  relative aspect-[3/4] rounded-[2.5rem] overflow-hidden cursor-pointer
                  transition-all duration-300 shadow-xl bg-white
                  ${
                    selectedPosterId === poster.id
                      ? "ring-8 ring-emerald-500 scale-[1.04]"
                      : "hover:scale-[1.02] hover:shadow-2xl"
                  }
                `}
              >
                <img
                  src={`data:image/png;base64,${poster.imageBase64}`}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/70 z-10 flex flex-col justify-between p-10">
                  {/* LOGO */}
                  <div className="flex justify-center">
                    {logo && (
                      <div className="bg-white/90 p-4 rounded-2xl shadow-lg">
                        <img
                          src={`data:image/png;base64,${logo}`}
                          className="w-20 h-20 object-contain"
                          alt="לוגו עסק"
                        />
                      </div>
                    )}
                  </div>

                  {/* TEXT */}
                  <div className="text-center">
                    <div className="backdrop-blur-md bg-white/10 border border-white/20 p-6 rounded-3xl">
                      <h3 className="text-3xl font-black text-white mb-2 leading-tight">
                        {tagline}
                      </h3>
                      <p className="text-xs tracking-widest text-white/90 uppercase">
                        {businessName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* DOWNLOAD */}
              <button
                onClick={() => handleDownload(poster.id)}
                className="mt-5 w-full py-4 rounded-full bg-slate-900 text-white font-bold transition-all hover:bg-black"
              >
                הורד פוסטר
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
