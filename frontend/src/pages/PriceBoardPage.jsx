import { useNavigate } from "react-router-dom";
import PriceBoard from "../components/PriceBoard";

import "./PriceBoardPage.css";

function PriceBoardPage() {
  const navigate = useNavigate();

  return (
    <div className="page-container price-board-page">
      <div className="page-header">
        <div>
          <h1>💰 Price Board</h1>
          <p>
            Check current e-waste buying prices and understand recent price trends.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/create-lot")}
        >
          📦 Create Lot
        </button>
      </div>

      <div className="price-board-page-content">
        <div className="price-board-info-grid">
          <div className="price-info-card">
            <div className="price-info-icon">💰</div>
            <div>
              <h3>Current Market Price</h3>
              <p>
                See the latest available buying price for different e-waste
                materials.
              </p>
            </div>
          </div>

          <div className="price-info-card">
            <div className="price-info-icon">📈</div>
            <div>
              <h3>Price Trend</h3>
              <p>
                Select a material to view its historical price movement.
              </p>
            </div>
          </div>

          <div className="price-info-card">
            <div className="price-info-icon">⚖️</div>
            <div>
              <h3>Better Selling Decision</h3>
              <p>
                Use the price information before deciding when and where to
                sell your e-waste.
              </p>
            </div>
          </div>
        </div>

        <div className="price-board-main-card">
          <PriceBoard />
        </div>
      </div>
    </div>
  );
}

export default PriceBoardPage;