import { useNavigate, useParams } from "react-router-dom";
import DigitalHandoverRecord from "../components/DigitalHandoverRecord";

import "./HandoverRecordPage.css";

function HandoverRecordPage() {
  const navigate = useNavigate();
  const { handoverId } = useParams();

  return (
    <div className="page-container handover-record-page">
      <div className="page-header handover-record-header">
        <div>
          <h1>📋 Digital Handover Record</h1>
          <p>
            View the verified digital record of your e-waste handover.
          </p>
        </div>

        <div className="page-header-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/handovers")}
          >
            ← Back to Handovers
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

      <div className="handover-record-content">
        <DigitalHandoverRecord handoverId={handoverId} />
      </div>
    </div>
  );
}

export default HandoverRecordPage;