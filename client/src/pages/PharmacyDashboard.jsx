import { useState } from "react";

import DashboardLayout from "../components/DashboardLayout";
import PrescriptionCard from "../components/PrescriptionCard";
import SectionCard from "../components/SectionCard";
import { useLanguage } from "../context/LanguageContext";
import {
  usePrescription as markPrescriptionUsed,
  verifyPrescription,
} from "../services/prescriptionService";
import { extractApiError } from "../utils/format";

const PharmacyDashboard = () => {
  const { t } = useLanguage();
  const [token, setToken] = useState("");
  const [verifiedPrescription, setVerifiedPrescription] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [usingPrescription, setUsingPrescription] = useState(false);

  const handleVerify = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setVerifying(true);

    try {
      const response = await verifyPrescription({ token });
      setVerifiedPrescription(response.prescription);
      setMessage(response.message);
    } catch (requestError) {
      setVerifiedPrescription(null);
      setError(extractApiError(requestError));
    } finally {
      setVerifying(false);
    }
  };

  const handleUsePrescription = async () => {
    setMessage("");
    setError("");
    setUsingPrescription(true);

    try {
      const response = await markPrescriptionUsed({ token });
      setVerifiedPrescription(response.prescription);
      setMessage(response.message);
    } catch (requestError) {
      setError(extractApiError(requestError));
    } finally {
      setUsingPrescription(false);
    }
  };

  const stats = [
    {
      label: t("verify"),
      value: verifiedPrescription ? "Ready" : "Awaiting scan",
      hint: "Paste QR payload or scanner output",
    },
    {
      label: t("statsActive"),
      value: verifiedPrescription?.status ?? "Unknown",
      hint: "Only active prescriptions can be consumed",
    },
  ];

  return (
    <DashboardLayout
      description={t("pharmacyDashboardDesc")}
      stats={stats}
      title={t("pharmacyDashboard")}
    >
      <SectionCard
        description={t("verifyQrPayloadDesc")}
        title={t("verifyQrPayload")}
      >
        <form className="stack-lg" onSubmit={handleVerify}>
          <label>
            {t("token")}
            <textarea
              onChange={(event) => setToken(event.target.value)}
              placeholder={t("tokenPlaceholder")}
              rows="6"
              value={token}
            />
          </label>

          {message ? <p className="form-success">{message}</p> : null}
          {error ? <p className="form-error">{error}</p> : null}

          <div className="inline-actions">
            <button className="button" disabled={verifying} type="submit">
              {verifying ? t("checking") : t("verify")}
            </button>
            <button
              className="button button-ghost"
              onClick={() => {
                setToken("");
                setVerifiedPrescription(null);
                setMessage("");
                setError("");
              }}
              type="button"
            >
              {t("clear")}
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard
        className="span-2"
        description={t("prescriptionResultDesc")}
        title={t("prescriptionResult")}
      >
        {verifiedPrescription ? (
          <PrescriptionCard
            actions={
              verifiedPrescription.status === "active" ? (
                <button
                  className="button"
                  disabled={usingPrescription}
                  onClick={handleUsePrescription}
                  type="button"
                >
                  {usingPrescription ? t("updating") : t("confirmDispense")}
                </button>
              ) : null
            }
            prescription={verifiedPrescription}
          />
        ) : (
          <p className="empty-state">{t("scanOrPaste")}</p>
        )}
      </SectionCard>
    </DashboardLayout>
  );
};

export default PharmacyDashboard;
