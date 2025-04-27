import React, { useState } from "react";

export default function PredictPage() {
  const [form, setForm] = useState({
    material: "Plastic",
    weight: 1.0,
    transport: "Air",
    recyclability: "Low",
    origin: "China",
  });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setResult(data);
  };

  const sendFeedback = async (vote) => {
    const feedback = {
      vote, // "up" or "down"
      prediction: result.predicted_label,
      confidence: result.confidence,
      raw_input: result.raw_input,
      encoded_input: result.encoded_input,
      feature_impact: result.feature_impact,
      timestamp: new Date().toISOString()
    };

    await fetch("http://localhost:5000/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feedback)
    });

    alert("✅ Thanks for your feedback!");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">🔍 Eco Score Predictor</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        {["material", "weight", "transport", "recyclability", "origin"].map((field) => (
          <div key={field}>
            <label className="block capitalize">{field}:</label>
            <input
              className="border p-2 w-full"
              name={field}
              type={field === "weight" ? "number" : "text"}
              value={form[field]}
              onChange={handleChange}
            />
          </div>
        ))}
        <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded">Predict</button>
      </form>

      {result && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-medium">🎯 Prediction Result</h3>
          <p>Label: <strong>{result.predicted_label}</strong></p>
          <p>Confidence: <strong>{result.confidence}</strong></p>

          <div className="mt-4 flex gap-4 items-center">
            <span className="text-sm">Was this prediction helpful?</span>
            <button
              onClick={() => sendFeedback("up")}
              className="text-xl hover:scale-110 transition"
            >👍</button>
            <button
              onClick={() => sendFeedback("down")}
              className="text-xl hover:scale-110 transition"
            >👎</button>
          </div>
        </div>
      )}
    </div>
  );
}
