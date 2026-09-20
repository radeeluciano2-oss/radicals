import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { createRoot } from "react-dom/client";
import "./styles.css";

const voices = ["alloy", "ash", "coral", "echo", "fable", "onyx", "nova", "sage", "shimmer"];

const supabase = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
  ? createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
  : null;

function App() {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("alloy");
  const [speed, setSpeed] = useState(1);
  const [style, setStyle] = useState("Warm and professional");
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [usage, setUsage] = useState(null);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState("studio");
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!supabase) return undefined;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.access_token) {
      const headers = { Authorization: `Bearer ${session.access_token}` };
      fetch("/api/usage", { headers }).then((response) => response.json()).then(setUsage).catch(() => {});
      fetch("/api/history", { headers }).then((response) => response.json()).then((data) => setHistory(data.generations || [])).catch(() => {});
    } else {
      setUsage(null);
      setHistory([]);
    }
  }, [session]);

  useEffect(() => {
    fetch("/api/config").then((response) => response.json()).then(setStatus).catch(() => {});
  }, []);

  async function signIn() {
    if (!supabase) return alert("Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  }

  async function signUp() {
    if (!supabase) return alert("Configure Supabase first.");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("Check your email to confirm your account.");
  }

  async function signOut() {
    await supabase?.auth.signOut();
  }

  async function generate() {
    setLoading(true);
    setAudioUrl("");
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ text, voice, speed }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Generation failed");
      }
      setAudioUrl(URL.createObjectURL(await response.blob()));
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function openBillingPortal() {
    if (!session?.access_token) return alert("Sign in to manage billing.");
    const response = await fetch("/api/billing-portal", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
    });
    const data = await response.json();
    if (!response.ok) return alert(data.error || "Billing portal unavailable.");
    window.location.href = data.url;
  }

  async function checkout(priceId) {
    if (!session?.access_token) return alert("Sign in to choose a plan.");
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ priceId }),
    });
    const data = await response.json();
    if (!response.ok) return alert(data.error || "Checkout unavailable");
    window.location.href = data.url;
  }

  return (
    <main className="shell">
      <nav><div className="brand">Chenie<span>Voice</span></div><div className="nav-pill">Commercial workspace</div></nav>
      <section className="auth panel">
        {session ? <><span>Signed in as {session.user.email}</span><button onClick={signOut}>Sign out</button></> : <>
          <h2>Account access</h2><div className="auth-grid">
            <input placeholder="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            <input placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            <button onClick={signIn}>Sign in</button><button onClick={signUp}>Create account</button>
          </div>
        </>}
      </section>
      {session && usage?.configured && <div className="usage panel"><strong>{usage.remaining?.toLocaleString()} characters remaining</strong><span>Plan: {usage.plan}</span></div>}
      <div className="tabs"><button className={tab === "studio" ? "" : "secondary"} onClick={() => setTab("studio")}>Studio</button><button className={tab === "dashboard" ? "" : "secondary"} onClick={() => setTab("dashboard")}>Dashboard</button></div>
      {tab === "dashboard" ? <section className="dashboard-grid">
        <div className="panel"><h2>Account overview</h2><p>{session ? session.user.email : "Sign in to view your account."}</p>{session && <button onClick={openBillingPortal}>Manage billing</button>}</div>
        <div className="panel"><h2>Generation history</h2>{history.length ? history.map((item) => <div className="history-row" key={item.id}><span>{item.voice}</span><span>{item.character_count?.toLocaleString()} characters</span><span>{new Date(item.created_at).toLocaleString()}</span></div>) : <p>No generations yet.</p>}</div>
      </section> : <>
        <section className="status-row"><span className={status.ttsConfigured ? "ok" : "warn"}>{status.ttsConfigured ? "TTS connected" : "TTS key needed"}</span><span className={status.authConfigured ? "ok" : "warn"}>{status.authConfigured ? "Auth configured" : "Auth setup pending"}</span><span className={status.billingConfigured ? "ok" : "warn"}>{status.billingConfigured ? "Billing connected" : "Billing setup pending"}</span></section>
        <section className="workspace"><div className="panel editor"><div className="panel-head"><h2>Script editor</h2><span>{text.length}/5000</span></div><textarea maxLength="5000" value={text} onChange={(event) => setText(event.target.value)} placeholder="Write or paste your script here..." /><button onClick={generate} disabled={loading || !text.trim()}>{loading ? "Generating..." : "Generate voice"}</button>{audioUrl && <audio controls src={audioUrl} />}</div><aside className="panel settings"><h2>Voice settings</h2><label>Voice<select value={voice} onChange={(event) => setVoice(event.target.value)}>{voices.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label>Style<input value={style} onChange={(event) => setStyle(event.target.value)} /></label><label>Speed<input type="range" min="0.25" max="4" step="0.25" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} /><span>{speed}x</span></label></aside></section>
        <section className="pricing"><h2>Simple plans</h2><div className="plans"><Plan title="Starter" price="$9" detail="For personal projects" onClick={() => checkout("STRIPE_PRICE_STARTER")} /><Plan title="Creator" price="$19" detail="For growing businesses" onClick={() => checkout("STRIPE_PRICE_CREATOR")} /></div></section>
      </>}
      <footer>© 2026 Chenie Voice · Built for creators and small businesses</footer>
    </main>
  );
}

function Plan({ title, price, detail, onClick }) {
  return <div className="plan"><h3>{title}</h3><strong>{price}<small>/month</small></strong><p>{detail}</p><button onClick={onClick}>Choose plan</button></div>;
}

createRoot(document.getElementById("root")).render(<App />);
