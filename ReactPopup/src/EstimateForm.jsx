import { useEffect, useState } from "react";
//import MLChart from "./components/MLChart";


export default function EstimateForm() {
  const [url, setUrl] = useState("");
  const [postcode, setPostcode] = useState(localStorage.getItem("postcode") || "");
  const [quantity, setQuantity] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [includePackaging, setIncludePackaging] = useState(true);
  const [equivalenceView, setEquivalenceView] = useState(0);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0]?.url || "";
      if (currentUrl.includes("amazon.co.uk")) {
        setUrl(currentUrl);
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    localStorage.setItem("postcode", postcode);

    try {
      const res = await fetch("http://127.0.0.1:5000/estimate_emissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amazon_url: url,
          postcode,
          include_packaging: includePackaging,
          override_transport_mode: result?.selected_mode || null,
        }),
      });

      const data = await res.json();
      const attr = data?.data?.attributes;
      const treesToOffset = parseFloat((attr.carbon_kg / 21).toFixed(5));

      const finalResult = {
        ...attr,
        quantity,
        trees: treesToOffset,
        title: data?.title || "Amazon Product",
        mode: "Mixed",
        distance_from_origin_km: Number(attr?.distance_from_origin_km) || 0,
        distance_from_uk_hub_km: Number(attr?.distance_from_uk_hub_km) || 0,        
      };

      console.log("🧾 ATTR:", attr);
      console.log("✅ FinalResult before setting:", finalResult);


      setResult(finalResult);
    } catch (err) {
      console.error(err);
      setError("Failed to contact backend.");
    } finally {
      setLoading(false);
    }
  };

  setTimeout(() => {
    console.log("🧠 State result after setResult:", result);
  }, 100);
  

  console.log("🔍 result.distance_from_origin_km:", result?.distance_from_origin_km);
  console.log("🔍 result.distance_from_uk_hub_km:", result?.distance_from_uk_hub_km);


  return (
    <div style={{ padding: "1rem", fontFamily: "Arial" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
        <button onClick={() => document.body.classList.toggle("dark-mode")}>🌓 Toggle Theme</button>
      </div>

      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "10px" }}>
        Amazon Shipping Emissions Estimator
      </h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Amazon product URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ display: "block", marginBottom: "6px", width: "100%" }}
        />
        <input
          type="text"
          placeholder="Enter your postcode"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          style={{ display: "block", marginBottom: "6px", width: "100%" }}
        />
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          style={{ display: "block", marginBottom: "6px", width: "100%" }}
        />
        <label style={{ display: "block", marginBottom: "6px" }}>
          <input
            type="checkbox"
            checked={includePackaging}
            onChange={(e) => setIncludePackaging(e.target.checked)}
          /> Include packaging weight
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Estimating..." : "Estimate Emissions"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: "1rem", fontSize: "14px" }}>
          <h3>📦 <strong>{result.title}</strong></h3>
          <p><strong>Eco Score (ML):</strong> {result.eco_score_ml || "N/A"}</p>
          <p><strong>Eco Score (Rule-Based):</strong> {result.eco_score || "N/A"}</p>
          <p><strong>Material Type:</strong> {result.material_type || "N/A"}</p>
          <p><strong>Transport Mode:</strong> {result.selected_mode || result.transport_mode}</p>
          <p><strong>Weight (incl. packaging):</strong> {result.weight_kg} kg</p>
          <p><strong>Carbon Emissions:</strong> {result.carbon_kg} kg CO₂</p>

          <p><strong>Raw Distance from Origin:</strong> {JSON.stringify(result?.distance_from_origin_km)}</p>
          <p><strong>Type:</strong> {typeof result?.distance_from_origin_km}</p>
          <p><strong>Parsed + Fixed:</strong> {
            Number.isFinite(parseFloat(result?.distance_from_origin_km))
              ? `${parseFloat(result.distance_from_origin_km).toFixed(1)} km`
              : "❌ Invalid"
          }</p>



          <p><strong>Raw Distance from UK Hub:</strong> {JSON.stringify(result?.distance_from_uk_hub_km)}</p>
          <p><strong>Type:</strong> {typeof result?.distance_from_uk_hub_km}</p>
          <p><strong>Parsed + Fixed:</strong> {
            Number.isFinite(parseFloat(result?.distance_from_uk_hub_km))
              ? `${parseFloat(result.distance_from_uk_hub_km).toFixed(1)} km`
              : "❌ Invalid"
          }</p>





          <pre style={{ fontSize: "12px", backgroundColor: "#f9f9f9", padding: "0.5rem" }}>
            {JSON.stringify(result, null, 2)}
          </pre>

          <MLChart mlScore={result.eco_score_ml} carbonKg={result.carbon_kg} />

          <div style={{ marginTop: "10px" }}>
            <button onClick={() => setEquivalenceView((prev) => (prev + 1) % 3)}>
              🔁 Show another comparison
            </button>
            {equivalenceView === 0 && <p>≈ {result.trees} trees to offset</p>}
            {equivalenceView === 1 && <p>≈ {(result.carbon_kg * 4.6).toFixed(1)} km driven</p>}
            {equivalenceView === 2 && <p>≈ {Math.round(result.carbon_kg / 0.011)} kettles boiled</p>}
          </div>
        </div>
      )}
    </div>
  );
}
