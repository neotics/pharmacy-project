import { useDeferredValue, useEffect, useState } from "react";

import DashboardLayout from "../components/DashboardLayout";
import MedicationFields from "../components/MedicationFields";
import PrescriptionCard from "../components/PrescriptionCard";
import SectionCard from "../components/SectionCard";
import { useLanguage } from "../context/LanguageContext";
import { createPatient, fetchPatients } from "../services/patientService";
import {
  createPrescription,
  fetchPrescriptions,
} from "../services/prescriptionService";
import { extractApiError } from "../utils/format";

const createBlankPatient = () => ({
  name: "",
  age: "",
  email: "",
});

const createBlankPrescription = () => ({
  patientId: "",
  medications: [
    {
      name: "",
      dosage: "",
      instructions: "",
    },
  ],
});

const DoctorDashboard = () => {
  const { t } = useLanguage();
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patientForm, setPatientForm] = useState(createBlankPatient());
  const [prescriptionForm, setPrescriptionForm] = useState(
    createBlankPrescription()
  );
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingPatient, setSavingPatient] = useState(false);
  const [savingPrescription, setSavingPrescription] = useState(false);

  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      try {
        const [patientsResponse, prescriptionsResponse] = await Promise.all([
          fetchPatients(),
          fetchPrescriptions(),
        ]);

        if (ignore) {
          return;
        }

        setPatients(patientsResponse.patients);
        setPrescriptions(prescriptionsResponse.prescriptions);
        setSelectedPrescription(prescriptionsResponse.prescriptions[0] ?? null);
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

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  const handlePatientSubmit = async (event) => {
    event.preventDefault();
    setFeedback("");
    setError("");
    setSavingPatient(true);

    try {
      const response = await createPatient({
        ...patientForm,
        age: Number(patientForm.age),
      });

      setPatients((current) => {
        const exists = current.some((patient) => patient._id === response.patient._id);

        if (exists) {
          return current.map((patient) =>
            patient._id === response.patient._id ? response.patient : patient
          );
        }

        return [response.patient, ...current];
      });

      setPatientForm(createBlankPatient());
      setFeedback(t("patientSaved"));
    } catch (requestError) {
      setError(extractApiError(requestError));
    } finally {
      setSavingPatient(false);
    }
  };

  const handlePrescriptionSubmit = async (event) => {
    event.preventDefault();
    setFeedback("");
    setError("");
    setSavingPrescription(true);

    try {
      const response = await createPrescription(prescriptionForm);
      setPrescriptions((current) => [response.prescription, ...current]);
      setSelectedPrescription(response.prescription);
      setPrescriptionForm(createBlankPrescription());
      setFeedback(t("prescriptionCreated"));
    } catch (requestError) {
      setError(extractApiError(requestError));
    } finally {
      setSavingPrescription(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const searchValue = deferredSearch.trim().toLowerCase();

    if (!searchValue) {
      return true;
    }

    return (
      prescription.patientId?.name?.toLowerCase()?.includes(searchValue) ||
      prescription._id.toLowerCase().includes(searchValue)
    );
  });

  const stats = [
    {
      label: t("statsPatients"),
      value: patients.length,
      hint: "Profiles linked to you",
    },
    {
      label: t("statsPrescriptions"),
      value: prescriptions.length,
      hint: "All prescriptions you created",
    },
    {
      label: t("statsActive"),
      value: prescriptions.filter((item) => item.status === "active").length,
      hint: "Still valid at pharmacy",
    },
  ];

  return (
    <DashboardLayout
      description={t("doctorDashboardDesc")}
      stats={stats}
      title={t("doctorDashboard")}
    >
      <SectionCard
        description={t("addPatientDesc")}
        title={t("addPatient")}
      >
        <form className="stack-lg" onSubmit={handlePatientSubmit}>
          <div className="form-grid">
            <label>
              {t("name")}
              <input
                onChange={(event) =>
                  setPatientForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Patient full name"
                type="text"
                value={patientForm.name}
              />
            </label>
            <label>
              {t("age")}
              <input
                min="1"
                onChange={(event) =>
                  setPatientForm((current) => ({
                    ...current,
                    age: event.target.value,
                  }))
                }
                placeholder="32"
                type="number"
                value={patientForm.age}
              />
            </label>
            <label className="full-span">
              {t("email")}
              <input
                onChange={(event) =>
                  setPatientForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="Optional, helps patient login link"
                type="email"
                value={patientForm.email}
              />
            </label>
          </div>
          <button className="button" disabled={savingPatient} type="submit">
            {savingPatient ? t("saving") : t("savePatient")}
          </button>
        </form>
      </SectionCard>

      <SectionCard
        description={t("createPrescriptionDesc")}
        title={t("createPrescription")}
      >
        <form className="stack-lg" onSubmit={handlePrescriptionSubmit}>
          <label>
            {t("patient")}
            <select
              onChange={(event) =>
                setPrescriptionForm((current) => ({
                  ...current,
                  patientId: event.target.value,
                }))
              }
              value={prescriptionForm.patientId}
            >
              <option value="">{t("selectPatient")}</option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.name} / {patient.age} yrs
                </option>
              ))}
            </select>
          </label>

          <MedicationFields
            medications={prescriptionForm.medications}
            onChange={(medications) =>
              setPrescriptionForm((current) => ({
                ...current,
                medications,
              }))
            }
          />

          <button
            className="button"
            disabled={
              savingPrescription ||
              patients.length === 0 ||
              !prescriptionForm.patientId
            }
            type="submit"
          >
            {savingPrescription ? t("generating") : t("createPrescriptionBtn")}
          </button>
        </form>
      </SectionCard>

      <SectionCard
        className="span-2"
        description={t("latestQrDesc")}
        title={t("latestQr")}
      >
        {selectedPrescription ? (
          <PrescriptionCard
            prescription={selectedPrescription}
            showQr
            showToken
          />
        ) : (
          <p className="empty-state">
            {t("noPrescriptionYet")}
          </p>
        )}
      </SectionCard>

      <SectionCard
        className="span-2"
        description={t("prescriptionHistoryDesc")}
        title={t("prescriptionHistory")}
      >
        <div className="stack-lg">
          <label>
            {t("search")}
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("searchPlaceholder")}
              type="text"
              value={search}
            />
          </label>

          {feedback ? <p className="form-success">{feedback}</p> : null}
          {error ? <p className="form-error">{error}</p> : null}
          {loading ? <p className="empty-state">{t("loadingDashboard")}</p> : null}

          <div className="card-list">
            {filteredPrescriptions.map((prescription) => (
              <PrescriptionCard
                actions={
                  <button
                    className="button button-ghost"
                    onClick={() => setSelectedPrescription(prescription)}
                    type="button"
                  >
                    {t("showQr")}
                  </button>
                }
                key={prescription._id}
                prescription={prescription}
              />
            ))}

            {!loading && filteredPrescriptions.length === 0 ? (
              <p className="empty-state">
                {t("noSearchMatch")}
              </p>
            ) : null}
          </div>
        </div>
      </SectionCard>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
