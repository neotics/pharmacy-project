import { useEffect, useState } from "react";

import DashboardLayout from "../components/DashboardLayout";
import PrescriptionCard from "../components/PrescriptionCard";
import SectionCard from "../components/SectionCard";
import { useLanguage } from "../context/LanguageContext";
import { fetchPrescriptions } from "../services/prescriptionService";
import { extractApiError } from "../utils/format";

const PatientDashboard = () => {
  const { t } = useLanguage();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadPrescriptions = async () => {
      try {
        const response = await fetchPrescriptions();

        if (!ignore) {
          setPrescriptions(response.prescriptions);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(extractApiError(requestError));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadPrescriptions();

    return () => {
      ignore = true;
    };
  }, []);

  const stats = [
    {
      label: t("statsTotalPrescriptions"),
      value: prescriptions.length,
      hint: "Linked to your account",
    },
    {
      label: t("statsActive"),
      value: prescriptions.filter((item) => item.status === "active").length,
      hint: "Still valid at pharmacy",
    },
    {
      label: t("statsUsed"),
      value: prescriptions.filter((item) => item.status === "used").length,
      hint: "Already dispensed",
    },
  ];

  return (
    <DashboardLayout
      description={t("patientDashboardDesc")}
      stats={stats}
      title={t("patientDashboard")}
    >
      <SectionCard
        className="span-2"
        description={t("myPrescriptionsDesc")}
        title={t("myPrescriptions")}
      >
        {error ? <p className="form-error">{error}</p> : null}
        {loading ? <p className="empty-state">{t("loadingPrescriptions")}</p> : null}

        <div className="card-list">
          {prescriptions.map((prescription) => (
            <PrescriptionCard
              key={prescription._id}
              prescription={prescription}
              showQr
              showToken
            />
          ))}

          {!loading && prescriptions.length === 0 ? (
            <p className="empty-state">{t("noLinkedPrescriptions")}</p>
          ) : null}
        </div>
      </SectionCard>
    </DashboardLayout>
  );
};

export default PatientDashboard;
