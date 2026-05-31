import { useQuizStore} from "../store/quizStore.js"
import { useState } from "react";

// ── QUIZ MODAL COMPONENT ──
const QuizModal = ({ quiz, onClose }) => {
  const { submitQuiz, quizResult, loading } = useQuizStore();
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleAnswer = (questionId, answerIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleSubmit = async () => {
    const formattedAnswers = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
      questionId,
      selectedAnswer,
    }));
    await submitQuiz(quiz._id, formattedAnswers);
    setSubmitted(true);
  };

  const allAnswered = quiz?.questions?.every((q) => answers[q._id] !== undefined);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-xl">{quiz.title}</h2>
            <p className="text-gray-500 text-sm mt-1">
              {quiz.questions?.length} questions · Pass with {quiz.passingScore}%
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* result screen */}
          {submitted && quizResult ? (
            <div className="text-center py-8">
              <div className={`text-6xl mb-4 ${quizResult.passed ? "text-emerald-500" : "text-red-400"}`}>
                {quizResult.passed ? "🎉" : "😔"}
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {quizResult.passed ? "You Passed!" : "Not Quite"}
              </h3>
              <p className="text-gray-400 mb-6">
                You scored{" "}
                <span className={`font-bold text-xl ${quizResult.passed ? "text-emerald-500" : "text-red-400"}`}>
                  {quizResult.score}%
                </span>
                {" "}({quizResult.correctCount}/{quizResult.totalQuestions} correct)
              </p>

              {/* per question results */}
              <div className="text-left flex flex-col gap-4 mb-6">
                {quizResult.results?.map((result, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border ${
                      result.isCorrect
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-red-500/30 bg-red-500/5"
                    }`}
                  >
                    <p className="text-white text-sm font-medium mb-2">
                      {i + 1}. {result.questionText}
                    </p>
                    <p className={`text-xs ${result.isCorrect ? "text-emerald-400" : "text-red-400"}`}>
                      {result.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                    </p>
                    {!result.isCorrect && result.explanation && (
                      <p className="text-gray-500 text-xs mt-1">{result.explanation}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-gray-800 border border-gray-700 text-white rounded-xl text-sm hover:bg-gray-700 transition-all"
                >
                  Close
                </button>
                {!quizResult.passed && (
                  <button
                    onClick={() => { setSubmitted(false); setAnswers({}); }}
                    className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-all"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          ) : (
            // questions screen
            <div className="flex flex-col gap-6">
              {quiz.questions?.map((question, i) => (
                <div key={question._id}>
                  <p className="text-white font-medium text-sm mb-3">
                    {i + 1}. {question.questionText}
                  </p>
                  <div className="flex flex-col gap-2">
                    {question.options?.map((option, optIndex) => (
                      <button
                        key={optIndex}
                        onClick={() => handleAnswer(question._id, optIndex)}
                        className={`text-left px-4 py-3 rounded-xl border text-sm transition-all
                          ${answers[question._id] === optIndex
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                            : "border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"
                          }`}
                      >
                        <span className="font-semibold mr-2">
                          {String.fromCharCode(65 + optIndex)}.
                        </span>
                        {option}
                    </button>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={handleSubmit}
                disabled={!allAnswered || loading}
                className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </div>
                ) : `Submit Quiz (${Object.keys(answers).length}/${quiz.questions?.length} answered)`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;