
import { useNavigate } from "react-router-dom";

import AddLotForm from "../components/AddLotForm";
import { createLot } from "../api/lots";

import "./CreateLotPage.css";

function CreateLotPage() {
  const navigate = useNavigate();

  async function handleLotCreated(lotData) {
    try {
      const result = await createLot(lotData);

      const createdLot = result?.lot || result;

      if (!createdLot) {
        throw new Error("Lot creation failed.");
      }

      // Store latest lot temporarily for AI Result page
      sessionStorage.setItem(
        "latestLot",
        JSON.stringify(createdLot)
      );

      // Go to separate AI Result page
      navigate("/ai-result");
    } catch (error) {
      console.error("Create lot error:", error);
      throw error;
    }
  }

  return (
    <div className="page-container create-lot-page">
      <div className="page-header">
        <div>
          <span className="create-lot-eyebrow">
            ♻️ EcoScrap
          </span>

          <h1>📦 Create E-Waste Lot</h1>

          <p>
            Add your e-waste details and upload an
            image for AI classification.
          </p>
        </div>
      </div>

      <div className="create-lot-layout">
        <div className="create-lot-main">
          <AddLotForm
            onLotCreated={handleLotCreated}
          />
        </div>

        <aside className="create-lot-info">
          <div className="info-card">
            <div className="info-icon">🤖</div>

            <div className="info-card-content">
              <h3>AI Classification</h3>

              <p>
                Upload a clear photo of your e-waste.
                Our AI model will identify the material.
              </p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">💰</div>

            <div className="info-card-content">
              <h3>Price Estimation</h3>

              <p>
                After creating the lot, you can view
                its estimated value based on current
                prices.
              </p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">♻️</div>

            <div className="info-card-content">
              <h3>Find Recycler</h3>

              <p>
                Once your lot is created, find suitable
                authorized recyclers nearby.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CreateLotPage;

