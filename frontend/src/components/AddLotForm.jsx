import { useEffect, useRef, useState, useCallback } from "react";

import {
  predictImage,
  uploadImage,
} from "../api/lots";

import { useLanguage } from "../LanguageContext";
import { useVoiceAssistant } from "../hooks/useVoiceAssistant";

import "./AddLotForm.css";

function AddLotForm({
  onLotCreated,
  location = "",
}) {
  const { language } = useLanguage();

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [material, setMaterial] = useState("");
  const [weight, setWeight] = useState("");

  const [selectedLocation, setSelectedLocation] =
    useState(location);

  const [prediction, setPrediction] =
    useState(null);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Step state for visual guidance
  // 1: Photo, 2: AI Identified, 3: Weight & Location, 4: Ready to create
  const currentStep = !image ? 1 : !material ? 2 : !weight ? 3 : 4;

  const text = {
    en: {
      title: "📦 Add E-Waste",
      subtitle:
        "Take a photo and enter the weight.",
      photo: "Photo",
      takePhoto: "Take Photo",
      takePhotoSub: "Use camera",
      gallery: "Choose Photo",
      gallerySub: "From gallery",
      changePhoto: "Change Photo",
      material: "Material",
      detecting: "AI is identifying...",
      identified: "AI Identified",
      confidence: "Confidence",
      weight: "Weight",
      weightPlaceholder:
        "Enter weight in kg",
      location: "Location",
      locationPlaceholder:
        "Enter your location",
      create: "Create Lot",
      creating: "Creating Lot...",
      success:
        "Lot created successfully.",
      photoRequired:
        "Please take or select a photo.",
      weightRequired:
        "Please enter the weight.",
      locationRequired:
        "Please enter the location.",
      predictionFailed:
        "Could not identify the material.",
      createFailed:
        "Could not create the lot.",
    },

    hi: {
      title: "📦 ई-वेस्ट जोड़ें",
      subtitle:
        "फोटो लें और वजन दर्ज करें।",
      photo: "फोटो",
      takePhoto: "फोटो लें",
      takePhotoSub: "कैमरा इस्तेमाल करें",
      gallery: "फोटो चुनें",
      gallerySub: "गैलरी से चुनें",
      changePhoto: "फोटो बदलें",
      material: "सामान",
      detecting:
        "AI सामान की पहचान कर रहा है...",
      identified: "AI ने पहचाना",
      confidence: "विश्वास",
      weight: "वजन",
      weightPlaceholder:
        "वजन किलो में डालें",
      location: "स्थान",
      locationPlaceholder:
        "अपना स्थान डालें",
      create: "लॉट बनाएं",
      creating:
        "लॉट बनाया जा रहा है...",
      success:
        "लॉट सफलतापूर्वक बन गया।",
      photoRequired:
        "कृपया फोटो लें या चुनें।",
      weightRequired:
        "कृपया वजन डालें।",
      locationRequired:
        "कृपया स्थान डालें।",
      predictionFailed:
        "सामान की पहचान नहीं हो सकी।",
      createFailed:
        "लॉट नहीं बन सका।",
    },

    mr: {
      title: "📦 ई-वेस्ट जोडा",
      subtitle:
        "फोटो घ्या आणि वजन नोंदवा.",
      photo: "फोटो",
      takePhoto: "फोटो घ्या",
      takePhotoSub:
        "कॅमेरा वापरा",
      gallery: "फोटो निवडा",
      gallerySub:
        "गॅलरीमधून निवडा",
      changePhoto: "फोटो बदला",
      material: "सामान",
      detecting:
        "AI सामान ओळखत आहे...",
      identified: "AI ने ओळखले",
      confidence: "विश्वास",
      weight: "वजन",
      weightPlaceholder:
        "वजन किलोमध्ये टाका",
      location: "ठिकाण",
      locationPlaceholder:
        "आपले ठिकाण टाका",
      create: "लॉट तयार करा",
      creating:
        "लॉट तयार होत आहे...",
      success:
        "लॉट यशस्वीरित्या तयार झाला.",
      photoRequired:
        "कृपया फोटो घ्या किंवा निवडा.",
      weightRequired:
        "कृपया वजन टाका.",
      locationRequired:
        "कृपया ठिकाण टाका.",
      predictionFailed:
        "सामान ओळखता आले नाही.",
      createFailed:
        "लॉट तयार करता आला नाही.",
    },
  };

  const t =
    text[language] || text.en;

  // Voice Assistant helper inside AddLotForm
  const { speak } = useVoiceAssistant({ language });


  /*
   * Clean up old preview URL
   */
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);


  /*
   * IMAGE SELECTION
   */
  async function handleImageChange(event) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image."
      );
      return;
    }

    setImage(file);

    const imageUrl =
      URL.createObjectURL(file);

    setPreview(imageUrl);

    setPrediction(null);
    setMaterial("");
    setMessage("");
    setError("");

    try {
      setLoading(true);

      const result =
        await predictImage(file);

      setPrediction(result);

      if (result?.predicted_class) {
        setMaterial(
          result.predicted_class
        );

        // Optional spoken feedback
        const confVal = Number(result?.confidence || 0);
        const confPct = (confVal > 1 ? confVal : confVal * 100).toFixed(0);
        if (language === "hi") {
          speak(`सामान ${result.predicted_class} है। AI विश्वास ${confPct} प्रतिशत है।`);
        } else if (language === "mr") {
          speak(`सामान ${result.predicted_class} आहे. AI विश्वास ${confPct} टक्के आहे.`);
        } else {
          speak(`Item identified as ${result.predicted_class} with ${confPct} percent confidence.`);
        }
      }
    } catch (err) {
      console.error(err);

      setError(
        t.predictionFailed
      );
    } finally {
      setLoading(false);
    }
  }


  /*
   * CHANGE PHOTO
   */
  function handleChangePhoto() {
    cameraInputRef.current?.click();
  }


  /*
   * CREATE LOT
   */
  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!image) {
      setError(t.photoRequired);
      return;
    }

    if (
      !weight ||
      Number(weight) <= 0
    ) {
      setError(t.weightRequired);
      return;
    }

    if (
      !selectedLocation.trim()
    ) {
      setError(t.locationRequired);
      return;
    }

    if (!material) {
      setError(t.predictionFailed);
      return;
    }

    try {
      setLoading(true);

      const uploaded =
        await uploadImage(image);

      const lot = {
        material_category:
          material,

        material_subcategory:
          material,

        weight_kg:
          Number(weight),

        location:
          selectedLocation.trim(),

        image_id:
          uploaded.image_id,

        ai_prediction:
          prediction?.predicted_class ||
          material,

        ai_confidence:
          Number(
            prediction?.confidence || 0
          ),
      };

      if (onLotCreated) {
        await onLotCreated(lot);
      }

      setMessage(t.success);

      if (language === "hi") {
        speak("ई-वेस्ट लॉट सफलतापूर्वक बन गया है।");
      } else if (language === "mr") {
        speak("ई-वेस्ट लॉट यशस्वीरित्या तयार झाला आहे.");
      } else {
        speak("E-waste lot created successfully.");
      }

      setImage(null);
      setPreview("");
      setMaterial("");
      setWeight("");
      setPrediction(null);

      if (cameraInputRef.current) {
        cameraInputRef.current.value =
          "";
      }

      if (galleryInputRef.current) {
        galleryInputRef.current.value =
          "";
      }
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        t.createFailed
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="add-lot-card">

      {/* HEADER */}

      <div className="add-lot-header">

        <div className="add-lot-header-icon">
          📦
        </div>

        <div>
          <h2>
            {t.title}
          </h2>

          <p>
            {t.subtitle}
          </p>
        </div>

      </div>


      {/* VISUAL STEPS INDICATOR (LOW-LITERACY FRIENDLY) */}
      <div className="add-lot-steps" aria-label="Step progress">
        <div className={`lot-step-item ${currentStep >= 1 ? "active" : ""}`}>
          <div className="step-badge">1</div>
          <span>📷 {language === "hi" ? "फोटो" : language === "mr" ? "फोटो" : "Photo"}</span>
        </div>
        <div className="step-divider"></div>
        <div className={`lot-step-item ${currentStep >= 2 ? "active" : ""}`}>
          <div className="step-badge">2</div>
          <span>🤖 {language === "hi" ? "पहचान" : language === "mr" ? "ओळख" : "AI"}</span>
        </div>
        <div className="step-divider"></div>
        <div className={`lot-step-item ${currentStep >= 3 ? "active" : ""}`}>
          <div className="step-badge">3</div>
          <span>⚖️ {language === "hi" ? "वजन" : language === "mr" ? "वजन" : "Weight"}</span>
        </div>
        <div className="step-divider"></div>
        <div className={`lot-step-item ${currentStep >= 4 ? "active" : ""}`}>
          <div className="step-badge">4</div>
          <span>✅ {language === "hi" ? "लॉट तैयार" : language === "mr" ? "तयार" : "Done"}</span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="add-lot-form"
      >

        {/* =================================================
            PHOTO
        ================================================= */}

        <div className="form-section">

          <label className="form-label">
            📸 {t.photo}
          </label>


          {!preview ? (

            <div className="image-source-container">

              {/* CAMERA */}

              <button
                type="button"
                className="image-source-card camera-card"
                onClick={() =>
                  cameraInputRef.current?.click()
                }
              >
                <div className="image-source-icon">
                  📷
                </div>

                <div className="image-source-content">
                  <strong>
                    {t.takePhoto}
                  </strong>

                  <small>
                    {t.takePhotoSub}
                  </small>
                </div>

                <span className="source-arrow">
                  →
                </span>
              </button>


              {/* GALLERY */}

              <button
                type="button"
                className="image-source-card gallery-card"
                onClick={() =>
                  galleryInputRef.current?.click()
                }
              >
                <div className="image-source-icon">
                  🖼️
                </div>

                <div className="image-source-content">
                  <strong>
                    {t.gallery}
                  </strong>

                  <small>
                    {t.gallerySub}
                  </small>
                </div>

                <span className="source-arrow">
                  →
                </span>
              </button>

            </div>

          ) : (

            /* IMAGE PREVIEW */

            <div className="image-preview-container">

              <div className="image-preview-wrapper">

                <img
                  src={preview}
                  alt="Selected e-waste"
                  className="image-preview"
                />

                <div className="preview-overlay">
                  <span>
                    ✓ Photo selected
                  </span>
                </div>

              </div>


              <button
                type="button"
                onClick={handleChangePhoto}
                className="change-photo-btn"
              >
                📷 {t.changePhoto}
              </button>

            </div>
          )}


          {/* HIDDEN CAMERA INPUT */}

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={
              handleImageChange
            }
            className="hidden-file-input"
          />


          {/* HIDDEN GALLERY INPUT */}

          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            onChange={
              handleImageChange
            }
            className="hidden-file-input"
          />

        </div>


        {/* =================================================
            AI LOADING
        ================================================= */}

        {loading && image && (

          <div className="ai-loading-box">

            <div className="ai-loader">

              <div className="ai-loader-ring"></div>

              <span>
                🤖
              </span>

            </div>

            <div>
              <strong>
                {t.detecting}
              </strong>

              <small>
                Analyzing your e-waste image
              </small>
            </div>

          </div>
        )}


        {/* =================================================
            AI RESULT
        ================================================= */}

        {prediction &&
          !loading && (

            <div className="ai-result-box">

              <div className="ai-result-icon">
                🤖
              </div>

              <div className="ai-result-content">

                <span className="ai-result-label">
                  {t.identified}
                </span>

                <strong className="ai-material">
                  ♻️ {material}
                </strong>

                {prediction.confidence !==
                  undefined &&
                  !isNaN(Number(prediction.confidence)) && (

                  <div className="confidence-row">

                    <span>
                      {t.confidence}
                    </span>

                    <strong>
                      {(Number(prediction.confidence) > 1
                        ? Number(prediction.confidence)
                        : Number(prediction.confidence) * 100
                      ).toFixed(2)}%
                    </strong>

                  </div>
                )}

                {prediction.confidence !==
                  undefined &&
                  !isNaN(Number(prediction.confidence)) && (

                  <div className="confidence-bar">

                    <div
                      className="confidence-fill"
                      style={{
                        width: `${Math.min(
                          Number(prediction.confidence) > 1
                            ? Number(prediction.confidence)
                            : Number(prediction.confidence) * 100,
                          100
                        )}%`,
                      }}
                    />

                  </div>
                )}

              </div>

              <div className="ai-success-check">
                ✓
              </div>

            </div>
          )}


        {/* =================================================
            MATERIAL
        ================================================= */}

        <div className="form-section">

          <label className="form-label">
            ♻️ {t.material}
          </label>

          <div className="input-wrapper">

            <span className="input-icon">
              ♻️
            </span>

            <input
              type="text"
              value={material}
              onChange={(event) =>
                setMaterial(
                  event.target.value
                )
              }
              placeholder={t.material}
              className="form-input with-icon"
            />

          </div>

        </div>


        {/* =================================================
            WEIGHT
        ================================================= */}

        <div className="form-section">

          <label className="form-label">
            ⚖️ {t.weight}
          </label>

          <div className="input-wrapper">

            <span className="input-icon">
              ⚖️
            </span>

            <input
              type="number"
              min="0.01"
              step="0.01"
              value={weight}
              onChange={(event) =>
                setWeight(
                  event.target.value
                )
              }
              placeholder={
                t.weightPlaceholder
              }
              className="form-input with-icon"
            />

            <span className="input-unit">
              kg
            </span>

          </div>

        </div>


        {/* =================================================
            LOCATION
        ================================================= */}

        <div className="form-section">

          <label className="form-label">
            📍 {t.location}
          </label>

          <div className="input-wrapper">

            <span className="input-icon">
              📍
            </span>

            <input
              type="text"
              value={selectedLocation}
              onChange={(event) =>
                setSelectedLocation(
                  event.target.value
                )
              }
              placeholder={
                t.locationPlaceholder
              }
              className="form-input with-icon"
            />

          </div>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="form-alert error-alert">

            <span className="alert-icon">
              ⚠️
            </span>

            <span>
              {error}
            </span>

          </div>
        )}


        {/* =================================================
            SUCCESS
        ================================================= */}

        {message && (

          <div className="form-alert success-alert">

            <span className="alert-icon">
              ✓
            </span>

            <span>
              {message}
            </span>

          </div>
        )}


        {/* =================================================
            CREATE LOT
        ================================================= */}

        <button
          type="submit"
          disabled={loading}
          className="create-lot-btn"
        >

          {loading ? (

            <>
              <span className="button-spinner"></span>
              {t.creating}
            </>

          ) : (

            <>
              <span>
                📦
              </span>

              {t.create}

              <span className="button-arrow">
                →
              </span>
            </>
          )}

        </button>

      </form>

    </div>
  );
}

export default AddLotForm;