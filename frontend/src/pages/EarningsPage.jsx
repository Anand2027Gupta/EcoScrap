import { useNavigate } from "react-router-dom";
import EarningsLedger from "../components/EarningsLedger";

import "./EarningsPage.css";

function EarningsPage() {
  const navigate = useNavigate();

  return (
    <div className="page-container earnings-page">
      <div className="page-header earnings-page-header">
        <div>
          <h1>💳 Earnings</h1>
          <p>
            Track your received payments, pending amounts,
            and e-waste transactions.
          </p>
        </div>

        <div className="page-header-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/handovers")}
          >
            🤝 Handovers
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={() => navigate("/dashboard")}
          >
            🏠 Dashboard
          </button>
        </div>
      </div>

      <div className="earnings-content">
        <EarningsLedger />
      </div>
    </div>
  );
}

export default EarningsPage;