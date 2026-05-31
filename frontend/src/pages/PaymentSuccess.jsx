import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { usePaymentStore } from "../store/paymentStore.js";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyPayment, loading } = usePaymentStore();

  const [payment, setPayment] = useState(null);
  const [courseId, setCourseId] = useState(null);
  const [error, setError] = useState(false);
  const [confetti, setConfetti] = useState([]);

  const sessionId = searchParams.get("session_id");

  // generate confetti pieces
  useEffect(() => {
    const piecesFuc = ()=>{
        const pieces = Array.from({ length: 80 }, (_, i) => ({
          id: i,
          x: Math.random() * 100,
          delay: Math.random() * 3,
          duration: 2 + Math.random() * 3,
          color: [
            "#10b981", "#3b82f6", "#f59e0b", "#ef4444",
            "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16",
          ][Math.floor(Math.random() * 8)],
          size: 6 + Math.random() * 10,
          rotation: Math.random() * 360,
        }));
        setConfetti(pieces);
    }
    piecesFuc();
  }, []);

  useEffect(() => {
    if (!sessionId) {
      navigate("/");
      return;
    }

    const handleVerify = async () => {
        try {
        const data = await verifyPayment(sessionId);
        if (data?.payment) {
            setPayment(data.payment);
            setCourseId(data.courseId || data.payment?.course?._id);
        } else {
            setError(true);
        }
        } catch {
        setError(true);
        }
    };

    handleVerify();
  }, [sessionId, verifyPayment, navigate]);


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm animate-pulse">
            Verifying your payment...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-3xl">✕</span>
          </div>
          <h1 className="text-white font-bold text-xl mb-2">Payment Issue</h1>
          <p className="text-gray-400 text-sm mb-4">
            We could not verify your payment. If you were charged please contact support.
          </p>
          <p className="text-gray-600 text-xs bg-gray-800 rounded-lg p-3 mb-6 break-all">
            Session: {sessionId}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/courses")}
              className="flex-1 bg-gray-800 border border-gray-700 text-white py-3 rounded-xl text-sm hover:bg-gray-700 transition-all"
            >
              Browse Courses
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm hover:bg-emerald-600 transition-all"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1f1a] flex items-center justify-center px-4 relative overflow-hidden">

      {/* confetti animation */}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .confetti-piece {
          position: fixed;
          top: -20px;
          animation: confettiFall linear infinite;
          pointer-events: none;
          z-index: 0;
        }
        .success-card {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>

      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.x}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            // borderRadius: Math.random() > 0.5 ? "50%" : "0",
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}

      {/* main card */}
      <div className="success-card bg-gray-900/95 backdrop-blur border border-gray-700 rounded-2xl p-8 w-full max-w-md relative z-10 shadow-2xl">

        {/* success icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-emerald-500 flex items-center justify-center">
              <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            {/* glow ring */}
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping" />
          </div>
        </div>

        {/* title */}
        <h1 className="text-white font-bold text-2xl text-center mb-2">
          Purchase Successful!
        </h1>
        <p className="text-gray-400 text-sm text-center mb-1">
          Thank you for your purchase. You are now enrolled!
        </p>
        <p className="text-emerald-400 text-xs text-center mb-6">
          Check your email for order details and updates.
        </p>

        {/* order details */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400 text-sm">Course</span>
            <span className="text-white text-sm font-medium text-right max-w-50 line-clamp-1">
              {payment?.course?.title || "Course"}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400 text-sm">Amount paid</span>
            <span className="text-emerald-400 font-bold">${payment?.amount || 0}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="text-gray-400 text-sm">Student</span>
            <span className="text-white text-sm">{payment?.student?.name}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-400 text-sm">Date</span>
            <span className="text-white text-sm">
              {payment?.createdAt
                ? new Date(payment.createdAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric"
                  })
                : new Date().toLocaleDateString()
              }
            </span>
          </div>
        </div>

        {/* action buttons */}
        <button
          onClick={() => navigate(`/learn/${courseId}`)}
          className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl hover:bg-emerald-600 transition-all mb-3 flex items-center justify-center gap-2 text-sm"
        >
          🎓 Start Learning Now →
        </button>

        <button
          onClick={() => navigate("/dashboard")}
          className="w-full bg-gray-800 border border-gray-700 text-gray-300 font-medium py-3 rounded-xl hover:bg-gray-700 transition-all text-sm"
        >
          Go to My Dashboard
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;