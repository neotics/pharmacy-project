import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../components/DashboardLayout";
import PrescriptionCard from "../components/PrescriptionCard";
import SectionCard from "../components/SectionCard";
import { useLanguage } from "../context/LanguageContext";
import {
  fetchAdminLogs,
  fetchAdminOverview,
  fetchAdminPrescriptions,
  fetchAdminUsers,
  resetAdminUserPassword,
  syncAdminPatientLinks,
  updateAdminUser,
} from "../services/adminService";
import { extractApiError, formatDate, getRoleLabel } from "../utils/format";

const createUserDraft = (user) => ({
  role: user.role,
  status: user.status ?? "active",
  isApproved: Boolean(user.isApproved),
});

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [userDrafts, setUserDrafts] = useState({});
  const [passwordDrafts, setPasswordDrafts] = useState({});
  const [userFilters, setUserFilters] = useState({
    search: "",
    role: "",
    status: "",
    approved: "",
  });
  const [prescriptionFilters, setPrescriptionFilters] = useState({
    search: "",
    status: "",
  });
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [syncingPatients, setSyncingPatients] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState("");
  const [resettingUserId, setResettingUserId] = useState("");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const loadOverview = async () => {
    setLoadingOverview(true);

    try {
      const response = await fetchAdminOverview();
      setOverview(response);
    } catch (requestError) {
      setError(extractApiError(requestError));
    } finally {
      setLoadingOverview(false);
    }
  };

  const loadUsers = async (filters = userFilters) => {
    setLoadingUsers(true);

    try {
      const response = await fetchAdminUsers(filters);
      setUsers(response.users);
      setUserDrafts(
        response.users.reduce((accumulator, user) => {
          accumulator[user._id] = createUserDraft(user);
          return accumulator;
        }, {})
      );
    } catch (requestError) {
      setError(extractApiError(requestError));
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadPrescriptions = async (filters = prescriptionFilters) => {
    setLoadingPrescriptions(true);

    try {
      const response = await fetchAdminPrescriptions(filters);
      setPrescriptions(response.prescriptions);
    } catch (requestError) {
      setError(extractApiError(requestError));
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  const loadLogs = async () => {
    setLoadingLogs(true);

    try {
      const response = await fetchAdminLogs({ limit: 20 });
      setLogs(response.logs);
    } catch (requestError) {
      setError(extractApiError(requestError));
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadOverview();
    loadUsers();
    loadPrescriptions();
    loadLogs();
  }, []);

  const pendingApprovals = useMemo(
    () => users.filter((user) => ["doctor", "pharmacy"].includes(user.role) && !user.isApproved),
    [users]
  );

  const stats = overview
    ? [
        {
          label: t("adminTotalUsers"),
          value: overview.stats.totalUsers,
          hint: "All accounts in the system",
        },
        {
          label: t("adminPendingApprovals"),
          value: overview.stats.pendingApprovals,
          hint: "Doctors and pharmacies waiting for approval",
        },
        {
          label: t("statsPrescriptions"),
          value: overview.stats.totalPrescriptions,
          hint: "All prescriptions in the database",
        },
        {
          label: t("statsActive"),
          value: overview.stats.activePrescriptions,
          hint: "Still valid at pharmacy",
        },
        {
          label: t("statsUsed"),
          value: overview.stats.usedPrescriptions,
          hint: "Already dispensed",
        },
        {
          label: t("adminBlockedUsers"),
          value: overview.stats.blockedUsers,
          hint: "Accounts currently blocked",
        },
      ]
    : [];

  const refreshEverything = async () => {
    await Promise.all([loadOverview(), loadUsers(), loadPrescriptions(), loadLogs()]);
  };

  const handleUserDraftChange = (userId, field, value) => {
    setUserDrafts((current) => ({
      ...current,
      [userId]: {
        ...current[userId],
        [field]: value,
      },
    }));
  };

  const handleUpdateUser = async (userId) => {
    setFeedback("");
    setError("");
    setUpdatingUserId(userId);

    try {
      const draft = userDrafts[userId];
      const response = await updateAdminUser(userId, draft);
      setFeedback(response.message);
      await Promise.all([loadOverview(), loadUsers(), loadLogs()]);
    } catch (requestError) {
      setError(extractApiError(requestError));
    } finally {
      setUpdatingUserId("");
    }
  };

  const handleResetPassword = async (userId) => {
    setFeedback("");
    setError("");
    setResettingUserId(userId);

    try {
      const password = passwordDrafts[userId] ?? "";
      const response = await resetAdminUserPassword(userId, { password });
      setFeedback(response.message);
      setPasswordDrafts((current) => ({
        ...current,
        [userId]: "",
      }));
      await loadLogs();
    } catch (requestError) {
      setError(extractApiError(requestError));
    } finally {
      setResettingUserId("");
    }
  };

  const handleSyncPatients = async () => {
    setFeedback("");
    setError("");
    setSyncingPatients(true);

    try {
      const response = await syncAdminPatientLinks();
      setFeedback(response.message);
      await Promise.all([loadOverview(), loadLogs()]);
    } catch (requestError) {
      setError(extractApiError(requestError));
    } finally {
      setSyncingPatients(false);
    }
  };

  const submitUserFilters = async (event) => {
    event.preventDefault();
    await loadUsers();
  };

  const submitPrescriptionFilters = async (event) => {
    event.preventDefault();
    await loadPrescriptions();
  };

  return (
    <DashboardLayout
      description={t("adminDashboardDesc")}
      stats={stats}
      title={t("adminDashboard")}
    >
      <SectionCard
        description={t("adminSystemToolsDesc")}
        title={t("adminSystemTools")}
      >
        <div className="inline-actions">
          <button className="button" onClick={refreshEverything} type="button">
            {t("adminRefreshData")}
          </button>
          <button
            className="button button-ghost"
            disabled={syncingPatients}
            onClick={handleSyncPatients}
            type="button"
          >
            {syncingPatients ? t("updating") : t("adminSyncPatients")}
          </button>
        </div>

        {feedback ? <p className="form-success">{feedback}</p> : null}
        {error ? <p className="form-error">{error}</p> : null}
      </SectionCard>

      <SectionCard
        description={t("adminPendingApprovalsDesc")}
        title={t("adminPendingApprovals")}
      >
        {loadingUsers ? <p className="empty-state">{t("loadingDashboard")}</p> : null}

        <div className="card-list">
          {pendingApprovals.map((user) => {
            const draft = userDrafts[user._id] ?? createUserDraft(user);

            return (
              <article className="admin-user-card" key={user._id}>
                <div className="admin-user-header">
                  <div>
                    <strong>{user.name}</strong>
                    <p>{user.email}</p>
                  </div>
                  <span className="badge badge-neutral">{getRoleLabel(user.role, t)}</span>
                </div>

                <div className="admin-control-grid">
                  <label>
                    {t("role")}
                    <select
                      onChange={(event) =>
                        handleUserDraftChange(user._id, "role", event.target.value)
                      }
                      value={draft.role}
                    >
                      <option value="doctor">{t("roleDoctor")}</option>
                      <option value="pharmacy">{t("rolePharmacy")}</option>
                      <option value="patient">{t("rolePatient")}</option>
                    </select>
                  </label>

                  <label>
                    {t("adminStatus")}
                    <select
                      onChange={(event) =>
                        handleUserDraftChange(user._id, "status", event.target.value)
                      }
                      value={draft.status}
                    >
                      <option value="active">{t("adminStatusActive")}</option>
                      <option value="blocked">{t("adminStatusBlocked")}</option>
                    </select>
                  </label>

                  <label>
                    {t("adminApproval")}
                    <select
                      onChange={(event) =>
                        handleUserDraftChange(
                          user._id,
                          "isApproved",
                          event.target.value === "true"
                        )
                      }
                      value={String(draft.isApproved)}
                    >
                      <option value="true">{t("adminApproved")}</option>
                      <option value="false">{t("adminPending")}</option>
                    </select>
                  </label>
                </div>

                <div className="inline-actions">
                  <button
                    className="button"
                    disabled={updatingUserId === user._id}
                    onClick={() => handleUpdateUser(user._id)}
                    type="button"
                  >
                    {updatingUserId === user._id ? t("saving") : t("adminSaveChanges")}
                  </button>
                </div>
              </article>
            );
          })}

          {!loadingUsers && pendingApprovals.length === 0 ? (
            <p className="empty-state">{t("adminNoPendingApprovals")}</p>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard
        className="span-2"
        description={t("adminUserManagementDesc")}
        title={t("adminUserManagement")}
      >
        <form className="admin-filter-grid" onSubmit={submitUserFilters}>
          <label>
            {t("search")}
            <input
              onChange={(event) =>
                setUserFilters((current) => ({
                  ...current,
                  search: event.target.value,
                }))
              }
              placeholder={t("adminUserSearchPlaceholder")}
              type="text"
              value={userFilters.search}
            />
          </label>

          <label>
            {t("role")}
            <select
              onChange={(event) =>
                setUserFilters((current) => ({
                  ...current,
                  role: event.target.value,
                }))
              }
              value={userFilters.role}
            >
              <option value="">{t("adminAllRoles")}</option>
              <option value="admin">{t("roleAdmin")}</option>
              <option value="doctor">{t("roleDoctor")}</option>
              <option value="pharmacy">{t("rolePharmacy")}</option>
              <option value="patient">{t("rolePatient")}</option>
            </select>
          </label>

          <label>
            {t("adminStatus")}
            <select
              onChange={(event) =>
                setUserFilters((current) => ({
                  ...current,
                  status: event.target.value,
                }))
              }
              value={userFilters.status}
            >
              <option value="">{t("adminAnyStatus")}</option>
              <option value="active">{t("adminStatusActive")}</option>
              <option value="blocked">{t("adminStatusBlocked")}</option>
            </select>
          </label>

          <label>
            {t("adminApproval")}
            <select
              onChange={(event) =>
                setUserFilters((current) => ({
                  ...current,
                  approved: event.target.value,
                }))
              }
              value={userFilters.approved}
            >
              <option value="">{t("adminAnyApproval")}</option>
              <option value="true">{t("adminApproved")}</option>
              <option value="false">{t("adminPending")}</option>
            </select>
          </label>

          <button className="button" type="submit">
            {t("adminApplyFilters")}
          </button>
        </form>

        {loadingUsers ? <p className="empty-state">{t("loadingDashboard")}</p> : null}

        <div className="card-list">
          {users.map((user) => {
            const draft = userDrafts[user._id] ?? createUserDraft(user);

            return (
              <article className="admin-user-card" key={user._id}>
                <div className="admin-user-header">
                  <div>
                    <strong>{user.name}</strong>
                    <p>{user.email}</p>
                    <span className="admin-user-meta">
                      {getRoleLabel(user.role, t)} · {t("adminCreatedOn")} {formatDate(user.createdAt)}
                    </span>
                  </div>
                  <span className={`badge ${user.status === "blocked" ? "badge-danger" : "badge-success"}`}>
                    {user.status}
                  </span>
                </div>

                <div className="admin-control-grid">
                  <label>
                    {t("role")}
                    <select
                      disabled={user.role === "admin"}
                      onChange={(event) =>
                        handleUserDraftChange(user._id, "role", event.target.value)
                      }
                      value={draft.role}
                    >
                      {user.role === "admin" ? (
                        <option value="admin">{t("roleAdmin")}</option>
                      ) : null}
                      <option value="doctor">{t("roleDoctor")}</option>
                      <option value="pharmacy">{t("rolePharmacy")}</option>
                      <option value="patient">{t("rolePatient")}</option>
                    </select>
                  </label>

                  <label>
                    {t("adminStatus")}
                    <select
                      disabled={user.role === "admin"}
                      onChange={(event) =>
                        handleUserDraftChange(user._id, "status", event.target.value)
                      }
                      value={draft.status}
                    >
                      <option value="active">{t("adminStatusActive")}</option>
                      <option value="blocked">{t("adminStatusBlocked")}</option>
                    </select>
                  </label>

                  <label>
                    {t("adminApproval")}
                    <select
                      disabled={user.role === "admin"}
                      onChange={(event) =>
                        handleUserDraftChange(
                          user._id,
                          "isApproved",
                          event.target.value === "true"
                        )
                      }
                      value={String(draft.isApproved)}
                    >
                      <option value="true">{t("adminApproved")}</option>
                      <option value="false">{t("adminPending")}</option>
                    </select>
                  </label>
                </div>

                <div className="admin-password-row">
                  <label>
                    {t("adminResetPassword")}
                    <input
                      onChange={(event) =>
                        setPasswordDrafts((current) => ({
                          ...current,
                          [user._id]: event.target.value,
                        }))
                      }
                      placeholder={t("adminPasswordPlaceholder")}
                      type="text"
                      value={passwordDrafts[user._id] ?? ""}
                    />
                  </label>
                </div>

                <div className="inline-actions">
                  <button
                    className="button"
                    disabled={updatingUserId === user._id || user.role === "admin"}
                    onClick={() => handleUpdateUser(user._id)}
                    type="button"
                  >
                    {updatingUserId === user._id ? t("saving") : t("adminSaveChanges")}
                  </button>
                  <button
                    className="button button-ghost"
                    disabled={
                      resettingUserId === user._id ||
                      !(passwordDrafts[user._id] ?? "").trim()
                    }
                    onClick={() => handleResetPassword(user._id)}
                    type="button"
                  >
                    {resettingUserId === user._id ? t("updating") : t("adminResetPassword")}
                  </button>
                </div>
              </article>
            );
          })}

          {!loadingUsers && users.length === 0 ? (
            <p className="empty-state">{t("adminNoUsersFound")}</p>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard
        className="span-2"
        description={t("adminPrescriptionOverviewDesc")}
        title={t("adminPrescriptionOverview")}
      >
        <form className="admin-filter-grid" onSubmit={submitPrescriptionFilters}>
          <label>
            {t("search")}
            <input
              onChange={(event) =>
                setPrescriptionFilters((current) => ({
                  ...current,
                  search: event.target.value,
                }))
              }
              placeholder={t("searchPlaceholder")}
              type="text"
              value={prescriptionFilters.search}
            />
          </label>

          <label>
            {t("adminPrescriptionStatus")}
            <select
              onChange={(event) =>
                setPrescriptionFilters((current) => ({
                  ...current,
                  status: event.target.value,
                }))
              }
              value={prescriptionFilters.status}
            >
              <option value="">{t("adminAllStatuses")}</option>
              <option value="active">{t("statsActive")}</option>
              <option value="used">{t("statsUsed")}</option>
            </select>
          </label>

          <button className="button" type="submit">
            {t("adminApplyFilters")}
          </button>
        </form>

        {loadingPrescriptions ? (
          <p className="empty-state">{t("loadingDashboard")}</p>
        ) : null}

        <div className="card-list">
          {prescriptions.map((prescription) => (
            <PrescriptionCard key={prescription._id} prescription={prescription} />
          ))}

          {!loadingPrescriptions && prescriptions.length === 0 ? (
            <p className="empty-state">{t("adminNoPrescriptionsFound")}</p>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard
        className="span-2"
        description={t("adminAuditLogsDesc")}
        title={t("adminAuditLogs")}
      >
        {loadingLogs ? <p className="empty-state">{t("loadingDashboard")}</p> : null}

        <div className="card-list">
          {logs.map((log) => (
            <article className="audit-log-card" key={log._id}>
              <div className="admin-user-header">
                <div>
                  <strong>{log.message}</strong>
                  <p>
                    {(log.actorId?.name ?? t("adminSystem"))} · {log.actorRole}
                  </p>
                </div>
                <span className="badge badge-neutral">{formatDate(log.createdAt)}</span>
              </div>
              <p className="admin-log-meta">
                {log.action} · {log.entityType}
                {log.entityId ? ` · ${log.entityId}` : ""}
              </p>
            </article>
          ))}

          {!loadingLogs && logs.length === 0 ? (
            <p className="empty-state">{t("adminNoLogs")}</p>
          ) : null}
        </div>
      </SectionCard>
    </DashboardLayout>
  );
};

export default AdminDashboard;
