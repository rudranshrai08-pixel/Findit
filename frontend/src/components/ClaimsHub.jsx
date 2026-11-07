import { useEffect, useState } from "react";
import authApi from "../api/auth.js";
import Icon from "./Icon.jsx";

function ClaimStatus({ status }) {
  const label = status === "accepted" ? "Accepted" : status === "rejected" ? "Declined" : "Awaiting review";
  return <span className={"claim-status " + status}>{label}</span>;
}

export default function ClaimsHub({ onClose, onOpenListing }) {
  const [activeTab, setActiveTab] = useState("matches");
  const [claimDirection, setClaimDirection] = useState("incoming");
  const [matches, setMatches] = useState([]);
  const [hasLostReports, setHasLostReports] = useState(false);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function getHubData() {
    return Promise.all([authApi.matches(), authApi.claims()]);
  }

  function storeHubData([matchResult, claimResult]) {
    setMatches(matchResult.matches || []);
    setHasLostReports(Boolean(matchResult.hasLostReports));
    setClaims(claimResult || []);
  }

  async function loadHub() {
    setError("");
    setLoading(true);
    try {
      storeHubData(await getHubData());
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    getHubData()
      .then((data) => { if (!cancelled) storeHubData(data); })
      .catch((loadError) => { if (!cancelled) setError(loadError.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  const incoming = claims.filter((claim) => claim.direction === "incoming");
  const outgoing = claims.filter((claim) => claim.direction === "outgoing");
  const pendingIncoming = incoming.filter((claim) => claim.status === "pending").length;
  const visibleClaims = claimDirection === "incoming" ? incoming : outgoing;

  async function reviewClaim(claim, status) {
    setError("");
    setMessage("");
    setBusyId(claim.id);
    try {
      const result = await authApi.reviewClaim(claim.id, status);
      setMessage(result.message);
      await loadHub();
    } catch (reviewError) {
      setError(reviewError.message);
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal claims-hub" role="dialog" aria-modal="true" aria-labelledby="claims-heading">
        <button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        <div className="claims-hub-header">
          <div className="modal-kicker">Find the right way home</div>
          <h2 id="claims-heading">Matches &amp; claims</h2>
          <p>Compare likely finds and handle ownership details privately.</p>
        </div>
        <div className="claims-tabs" role="tablist" aria-label="Matches and claims">
          <button role="tab" aria-selected={activeTab === "matches"} className={activeTab === "matches" ? "active" : ""} onClick={() => { setActiveTab("matches"); setMessage(""); setError(""); }}>
            Potential matches <span>{matches.length}</span>
          </button>
          <button role="tab" aria-selected={activeTab === "claims"} className={activeTab === "claims" ? "active" : ""} onClick={() => { setActiveTab("claims"); setMessage(""); setError(""); }}>
            Claim requests {pendingIncoming > 0 && <span>{pendingIncoming}</span>}
          </button>
        </div>

        {error && <p className="account-message error claims-hub-message" role="alert">{error}</p>}
        {message && <p className="account-message success claims-hub-message" role="status">{message}</p>}

        {loading ? (
          <div className="claims-hub-loading" role="status">Loading your matches and claims…</div>
        ) : activeTab === "matches" ? (
          <div className="claims-hub-list">
            {matches.length === 0 ? (
              <div className="account-empty">
                <span>🔎</span>
                <b>{hasLostReports ? "No likely finds yet" : "Start with a Lost report"}</b>
                <p>{hasLostReports ? "We will compare your active Lost reports with new Found posts. Check back as the campus board changes." : "Add a Lost report and FindIt will compare it with active Found posts from the campus board."}</p>
              </div>
            ) : matches.map((match) => (
              <article className="match-result-card" key={match.lostListing.id + "-" + match.foundListing.id}>
                <div className="match-card-top">
                  <span className="match-score-label">Similarity score</span>
                  <b>{match.score}%</b>
                </div>
                <div className="match-listing-summary">
                  <span className="match-result-emoji">{match.foundListing.emoji || "📦"}</span>
                  <div><small>Found report</small><h3>{match.foundListing.title}</h3><p>{match.foundListing.category} · {match.foundListing.place}</p></div>
                </div>
                <div className="match-own-report"><span>Compared with your Lost report</span><b>{match.lostListing.title}</b></div>
                <div className="match-reasons">{match.reasons.map((reason) => <span key={reason}>{reason}</span>)}</div>
                <button className="button button-primary match-review-button" onClick={() => onOpenListing(match.foundListing)}>Review found item <Icon name="arrow" size={15} /></button>
              </article>
            ))}
          </div>
        ) : (
          <>
            <div className="claim-direction-tabs" role="tablist" aria-label="Claim direction">
              <button role="tab" aria-selected={claimDirection === "incoming"} className={claimDirection === "incoming" ? "active" : ""} onClick={() => setClaimDirection("incoming")}>Received ({incoming.length})</button>
              <button role="tab" aria-selected={claimDirection === "outgoing"} className={claimDirection === "outgoing" ? "active" : ""} onClick={() => setClaimDirection("outgoing")}>Sent ({outgoing.length})</button>
            </div>
            <div className="claims-hub-list">
              {visibleClaims.length === 0 ? (
                <div className="account-empty"><span>🔐</span><b>{claimDirection === "incoming" ? "No claims to review" : "No claims sent yet"}</b><p>{claimDirection === "incoming" ? "Private ownership details from students will appear here for your Found reports." : "When you privately claim a Found item, its review status will appear here."}</p></div>
              ) : visibleClaims.map((claim) => (
                <article className="claim-request-card" key={claim.id}>
                  <div className="claim-request-top">
                    <div><small>{claimDirection === "incoming" ? "Claim for your found report" : "Your private claim"}</small><h3>{claim.listing?.title || "FindIt item"}</h3></div>
                    <ClaimStatus status={claim.status} />
                  </div>
                  <p className="claim-other-party">{claimDirection === "incoming" ? "From" : "Reported by"} <b>{claim.otherParty.name}</b> · {claim.otherParty.college}</p>
                  <div className="claim-private-details"><span>Private ownership detail</span><p>{claim.privateDetails}</p></div>
                  {claim.otherParty.email && <a className="claim-contact-link" href={"mailto:" + claim.otherParty.email}>Contact {claim.otherParty.name} securely about the handoff <Icon name="arrow" size={14} /></a>}
                  {claimDirection === "incoming" && claim.status === "pending" && (
                    <div className="claim-review-actions">
                      <button className="button button-outline" disabled={busyId === claim.id} onClick={() => reviewClaim(claim, "rejected")}>Decline</button>
                      <button className="button button-primary" disabled={busyId === claim.id} onClick={() => reviewClaim(claim, "accepted")}>{busyId === claim.id ? "Saving…" : "Accept claim"}</button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </>
        )}
        <div className="claims-hub-footer"><span>Private details are visible only to the claimant and found-item reporter.</span><button className="button button-quiet" onClick={loadHub} disabled={loading}>Refresh</button></div>
      </section>
    </div>
  );
}