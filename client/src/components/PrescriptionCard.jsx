import Badge from "./Badge";
import { useLanguage } from "../context/LanguageContext";
import { formatDate } from "../utils/format";

const PrescriptionCard = ({
  prescription,
  showQr = false,
  showToken = false,
  actions = null,
}) => {
  const { t } = useLanguage();
  const patient = prescription.patientId ?? {};
  const doctor = prescription.doctorId ?? {};

  return (
    <article className="prescription-card">
      <div className="prescription-top">
        <div>
          <p className="eyebrow">Prescription</p>
          <h3>{patient.name ?? t("unknownPatient")}</h3>
        </div>
        <Badge tone={prescription.status === "used" ? "danger" : "success"}>
          {prescription.status}
        </Badge>
      </div>

      <div className="meta-grid">
        <div>
          <span>ID</span>
          <strong>{prescription._id}</strong>
        </div>
        <div>
          <span>{t("created")}</span>
          <strong>{formatDate(prescription.createdAt)}</strong>
        </div>
        <div>
          <span>{t("patient")}</span>
          <strong>
            {patient.name} / {patient.age ?? "?"} yrs
          </strong>
        </div>
        <div>
          <span>{t("doctor")}</span>
          <strong>{doctor.name ?? "N/A"}</strong>
        </div>
        <div>
          <span>{t("email")}</span>
          <strong>{patient.email ?? t("notLinked")}</strong>
        </div>
        <div>
          <span>{t("usedAt")}</span>
          <strong>{formatDate(prescription.usedAt)}</strong>
        </div>
      </div>

      <div className="stack-sm">
        <p className="detail-title">{t("medications")}</p>
        <div className="stack-sm">
          {prescription.medications?.map((medication) => (
            <div className="medication-preview" key={medication._id}>
              <strong>
                {medication.name} / {medication.dosage}
              </strong>
              <span>{medication.instructions}</span>
            </div>
          ))}
        </div>
      </div>

      {showToken ? (
        <div className="stack-sm">
          <p className="detail-title">{t("qrPayloadToken")}</p>
          <code className="token-box">{prescription.token}</code>
        </div>
      ) : null}

      {showQr && prescription.qrCode ? (
        <div className="qr-panel">
          <img alt="Prescription QR code" src={prescription.qrCode} />
        </div>
      ) : null}

      {actions ? <div className="card-actions">{actions}</div> : null}
    </article>
  );
};

export default PrescriptionCard;
