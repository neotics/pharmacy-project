export const formatDate = (value) => {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

export const getHomeRouteForRole = (role) => {
  if (role === "doctor") {
    return "/doctor";
  }

  if (role === "pharmacy") {
    return "/pharmacy";
  }

  return "/patient";
};

export const getRoleLabel = (role, t = null) => {
  const labels = t
    ? {
        doctor: t("roleDoctor"),
        pharmacy: t("rolePharmacy"),
        patient: t("rolePatient"),
      }
    : {
        doctor: "Doctor",
        pharmacy: "Pharmacy",
        patient: "Patient",
      };

  return labels[role] ?? role;
};

export const extractApiError = (error) =>
  error?.response?.data?.message ??
  error?.message ??
  "Something went wrong. Please try again.";
