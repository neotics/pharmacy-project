import { useLanguage } from "../context/LanguageContext";

const createBlankMedication = () => ({
  name: "",
  dosage: "",
  instructions: "",
});

const MedicationFields = ({ medications, onChange }) => {
  const { t } = useLanguage();

  const updateMedication = (index, field, value) => {
    onChange(
      medications.map((medication, currentIndex) =>
        currentIndex === index
          ? { ...medication, [field]: value }
          : medication
      )
    );
  };

  const addMedication = () => {
    onChange([...medications, createBlankMedication()]);
  };

  const removeMedication = (index) => {
    if (medications.length === 1) {
      return;
    }

    onChange(
      medications.filter((_, currentIndex) => currentIndex !== index)
    );
  };

  return (
    <div className="stack-lg">
      {medications.map((medication, index) => (
        <div className="medication-card" key={`medication-${index}`}>
          <div className="medication-header">
            <strong>
              {t("medication")} #{index + 1}
            </strong>
            <button
              className="button button-ghost button-small"
              onClick={() => removeMedication(index)}
              type="button"
            >
              {t("remove")}
            </button>
          </div>
          <div className="form-grid">
            <label>
              {t("name")}
              <input
                onChange={(event) =>
                  updateMedication(index, "name", event.target.value)
                }
                placeholder="Paracetamol"
                type="text"
                value={medication.name}
              />
            </label>
            <label>
              {t("dosage")}
              <input
                onChange={(event) =>
                  updateMedication(index, "dosage", event.target.value)
                }
                placeholder="500mg"
                type="text"
                value={medication.dosage}
              />
            </label>
            <label className="full-span">
              {t("instructions")}
              <textarea
                onChange={(event) =>
                  updateMedication(index, "instructions", event.target.value)
                }
                placeholder="Take one tablet after meals"
                rows="3"
                value={medication.instructions}
              />
            </label>
          </div>
        </div>
      ))}

      <button className="button button-ghost" onClick={addMedication} type="button">
        {t("addMedication")}
      </button>
    </div>
  );
};

export default MedicationFields;
