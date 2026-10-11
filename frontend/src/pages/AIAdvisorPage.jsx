import { useEffect, useRef, useState } from "react";
import axios from "axios";

import api from "../services/api";
import { getApiError } from "../services/apiError";
import { aiPromptSchema } from "../validators/aiForms";
import RecommendationCard from "../components/RecommendationCard";

export default function AIAdvisorPage() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const controllerRef = useRef(null);

  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    // Validate prompt
    const result = aiPromptSchema.safeParse(prompt);

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    const userPrompt = result.data;
    const messageId = crypto.randomUUID();

    // Add student message
    setMessages((prev) => [
      ...prev,
      {
        id: messageId,
        role: "user",
        text: userPrompt,
      },
    ]);

    setPrompt("");
    setLoading(true);

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const { data } = await api.post(
        "/ai/recommendations",
        { prompt: userPrompt },
        {
          signal: controller.signal,
          timeout: 35000,
        },
      );

      if (controller.signal.aborted) return;
      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          id: messageId + "-reply",
          role: "assistant",
          text: data.reply,
          recommendations: data.recommendations || [],
        },
      ]);
    } catch (err) {
      if (!controller.signal.aborted && !axios.isCancel(err)) {
        setError(getApiError(err));
        setPrompt(userPrompt);

        // Remove failed user message
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      }
    } finally {
      controllerRef.current = null;
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  const clearChat = () => {
    if (loading) return;
    setMessages([]);
    setError("");
    setPrompt("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1>AI learning advisor</h1>
          <p className="mt-2 text-sm text-pine-700">
            Describe what you want to learn to get course suggestions.
          </p>
        </div>
        <button
          className="button-secondary"
          type="button"
          onClick={clearChat}
          disabled={loading || messages.length === 0}
        >
          Clear chat
        </button>
      </div>
      <section
        aria-label="Learning advice"
        className="border-y border-pine-700/20 py-6"
      >
        {messages.length === 0 && (
          <div>
            <h2>What do you want to learn?</h2>
            <p className="mt-2 text-sm text-pine-700">
              For example: "I know basic JavaScript and want to learn React."
            </p>
          </div>
        )}
        <div
          role="log"
          aria-label="Conversation"
          aria-live="polite"
          className="space-y-6"
        >
          {messages.map((message) => (
            <article
              key={message.id}
              className={
                message.role === "user" ? "bg-pine-100/30 p-4" : "py-2"
              }
            >
              <p className="mb-2 text-sm font-semibold">
                {message.role === "user" ? "You" : "Advisor"}
              </p>
              <p className="whitespace-pre-wrap break-words text-sm">
                {message.text}
              </p>
              {message.recommendations?.length > 0 && (
                <div className="mt-5 space-y-5">
                  {message.recommendations.map((item) => (
                    <RecommendationCard
                      key={item.courseId}
                      recommendation={item}
                    />
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
        {loading && (
          <p className="mt-4 text-sm text-pine-700" role="status">
            Looking for relevant courses...
          </p>
        )}
      </section>
      {error && (
        <p className="error-message" id="ai-error" role="alert">
          {error}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <label htmlFor="ai-prompt">Your learning goal</label>
        <textarea
          id="ai-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Tell us the topic and your current experience."
          rows={4}
          maxLength={500}
          disabled={loading}
          aria-describedby={error ? "ai-error prompt-help" : "prompt-help"}
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span id="prompt-help" className="text-xs text-pine-700">
            {prompt.length}/500 characters &middot; At least 10 characters
          </span>
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="button-primary"
          >
            {loading ? "Getting suggestions..." : "Get suggestions"}
          </button>
        </div>
        <p className="mt-4 text-xs text-pine-700">
          Each request uses the available course catalog. Chat history clears
          when you leave this page.
        </p>
      </form>
    </div>
  );
}
