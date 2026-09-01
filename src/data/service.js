import { supabase } from "./supabase";

// ==================== AUTH ====================

export const getSession = () => supabase.auth.getSession();

export const getUser = () => supabase.auth.getUser();

export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password });

export const signUp = (email, password, redirectUrl) =>
  supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectUrl } });

export const signOut = () => supabase.auth.signOut();

export const updateUserPassword = (password) =>
  supabase.auth.updateUser({ password });

export const resetPasswordForEmail = (email, redirectTo) =>
  supabase.auth.resetPasswordForEmail(email, { redirectTo });

export const onAuthStateChange = (callback) =>
  supabase.auth.onAuthStateChange(callback);

// Sends a 6-digit OTP code to an existing email via Supabase Auth (no new user created).
export const sendEmailOtp = (email) =>
  supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });

export const verifyEmailOtp = (email, token) =>
  supabase.auth.verifyOtp({ email, token, type: "email" });

// Updates the email on the auth.users record (subject to Supabase's own email-change confirmation settings).
export const updateUserEmail = (newEmail) =>
  supabase.auth.updateUser({ email: newEmail });

// Applies the email change immediately via the update-email edge function (service role),
// bypassing Supabase's double email-change confirmation. Use after verifying the old-email OTP.
export const updateUserEmailImmediate = async (newEmail) => {
  const { data, error } = await supabase.functions.invoke("update-email", {
    body: { newEmail },
  });

  if (error) {
    return { data, error: { message: data?.error || error.message } };
  }

  return { data, error: null };
};

// ==================== MFA ====================

export const mfaListFactors = () => supabase.auth.mfa.listFactors();

export const mfaEnroll = (factorType, friendlyName) =>
  supabase.auth.mfa.enroll({ factorType, friendlyName });

export const mfaChallenge = (factorId) =>
  supabase.auth.mfa.challenge({ factorId });

export const mfaVerify = (factorId, challengeId, code) =>
  supabase.auth.mfa.verify({ factorId, challengeId, code });

export const mfaUnenroll = (factorId) =>
  supabase.auth.mfa.unenroll({ factorId });

export const mfaGetAssuranceLevel = () =>
  supabase.auth.mfa.getAuthenticatorAssuranceLevel();

// ==================== PROFILES ====================

export const getProfile = (userId) =>
  supabase.from("profiles").select("*").eq("userid", userId).single();

export const getProfileField = (userId, field) =>
  supabase.from("profiles").select(field).eq("userid", userId).maybeSingle();

export const getProfileFieldSingle = (userId, field) =>
  supabase.from("profiles").select(field).eq("userid", userId).single();

export const getProfilesByIds = (userIds) =>
  supabase
    .from("profiles")
    .select("userid, companyname, city, industry, company_logo_url")
    .in("userid", userIds);

export const checkProfileByUserId = (userId) =>
  supabase.from("profiles").select("userid").eq("userid", userId).maybeSingle();

export const insertProfile = (data) =>
  supabase.from("profiles").insert([data]);

export const updateProfile = (userId, data) =>
  supabase.from("profiles").update(data).eq("userid", userId);

// ==================== CAMPAIGNS ====================

export const getCampaignsByOwner = (ownerId) =>
  supabase.from("campaigns").select("*").eq("ownerid", ownerId);

export const getCampaignNamesByOwner = (ownerId) =>
  supabase.from("campaigns").select("id, name").eq("ownerid", ownerId);

export const getCampaignsByIds = (ids) =>
  supabase
    .from("campaigns")
    .select("id, name, status, created_at, duration, original_start_at, effective_start_at")
    .in("id", ids);

export const getAllCampaigns = () => supabase.from("campaigns").select("*");

export const getAllCampaignsByIds = (ids) =>
  supabase.from("campaigns").select("*").in("id", ids);

export const insertCampaign = (data) =>
  supabase.from("campaigns").insert([data]).select();

export const updateCampaign = (id, data) =>
  supabase.from("campaigns").update(data).eq("id", id);

// ==================== DRIVERS ====================

export const getDriversByCarIds = (carIds) =>
  supabase.from("drivers").select("*").in("carid", carIds);

export const getDriverCarIdsByContractId = (contractId) =>
  supabase.from("drivers").select("carid").eq("contractid", contractId);

export const updateDriverContract = (driverId, contractId) =>
  supabase.from("drivers").update({ contractid: contractId }).eq("id", driverId);

export const insertFleetSignedContract = (data) =>
  supabase.from("fleet_signed_contracts").insert([data]);

export const getDriversByContractIds = (contractIds) =>
  supabase
    .from("drivers")
    .select("*")
    .in("contractid", contractIds)
    .order("created_at", { ascending: false });

export const getFleetSignedContractsByContractIds = (contractIds) =>
  supabase
    .from("fleet_signed_contracts")
    .select("contract_id, driver_email, signed_at, created_at, status")
    .in("contract_id", contractIds)
    .order("signed_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

export const getActiveFleetSignedContractsByContractIds = (contractIds) =>
  supabase
    .from("fleet_signed_contracts")
    .select("contract_id, driver_email, signed_at, created_at, status")
    .in("contract_id", contractIds)
    .eq("status", "active")
    .order("signed_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

export const getLatestDriverLocationsByEmails = async (driverEmails) => {
  const trimmedEmails = (driverEmails || [])
    .map((email) => (email || "").trim().toLowerCase())
    .filter(Boolean);

  if (!trimmedEmails.length) {
    return { data: [], error: null };
  }

  // Some environments use recorded_at, others only keep bare coordinates.
  let response = await supabase
    .from("driver_location_updates")
    .select("driver_email, latitude, longitude")
    .in("driver_email", trimmedEmails)
    .order("recorded_at", { ascending: false });

  if (!response.error) {
    return response;
  }

  response = await supabase
    .from("driver_location_updates")
    .select("driver_email, latitude, longitude")
    .in("driver_email", trimmedEmails)
    .order("created_at", { ascending: false });

  if (!response.error) {
    return response;
  }

  return supabase
    .from("driver_location_updates")
    .select("driver_email, latitude, longitude")
    .in("driver_email", trimmedEmails);
};

export const getLatestDriverLocations = async () => {
  let response = await supabase
    .from("driver_location_updates")
    .select("driver_email, latitude, longitude")
    .order("recorded_at", { ascending: false })
    .limit(200);

  if (!response.error) {
    return response;
  }

  response = await supabase
    .from("driver_location_updates")
    .select("driver_email, latitude, longitude")
    .order("created_at", { ascending: false })
    .limit(200);

  if (!response.error) {
    return response;
  }

  return supabase
    .from("driver_location_updates")
    .select("driver_email, latitude, longitude")
    .limit(200);
};

export const getDriverDistancesByContractIds = (contractIds) =>
  supabase
    .from("drivers")
    .select("contractid, totaldistance")
    .in("contractid", contractIds);

export const getDriverByUserId = (userId) =>
  supabase.from("drivers").select("id").eq("userid", userId).maybeSingle();

export const getDriverByEmail = (email) =>
  supabase.from("drivers").select("id").eq("email", email).maybeSingle();

// ==================== FLEETS ====================

export const getFleet = (userId) =>
  supabase.from("fleets").select("*").eq("userid", userId).single();

export const getFleetContracts = (userId) =>
  supabase.from("fleets").select("contracts").eq("userid", userId).single();

export const getFleetBalance = (userId) =>
  supabase.from("fleets").select("contracts, balance").eq("userid", userId);

export const checkFleetByUserId = (userId) =>
  supabase.from("fleets").select("userid").eq("userid", userId).maybeSingle();

export const checkFleetByEmail = (email) =>
  supabase.from("fleets").select("email").eq("email", email).maybeSingle();

export const insertFleet = (data) => supabase.from("fleets").insert([data]);

export const updateFleet = (userId, data) =>
  supabase.from("fleets").update(data).eq("userid", userId);

// ==================== INVOICES ====================

export const getLastInvoiceByPrefix = (prefix) =>
  supabase
    .from("invoices")
    .select("invoiceid")
    .ilike("invoiceid", `${prefix}%`)
    .order("invoiceid", { ascending: false })
    .limit(1);

export const getInvoicesByOwner = (ownerId) =>
  supabase
    .from("invoices")
    .select("id, invoiceid, campaign_id, amount, status, created_at")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

export const insertInvoice = (data) =>
  supabase.from("invoices").insert([data]);

export const updateInvoice = (id, data) =>
  supabase.from("invoices").update(data).eq("id", id);

// ==================== ANALITICS ====================

export const getAnalitics = (ownerId, campaignId) =>
  supabase
    .from("analitics")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("campaign_id", campaignId);

export const insertAnalitics = (data) =>
  supabase.from("analitics").insert([data]);

// ==================== VEHICLES ====================

export const getVehiclesByFleet = (fleetOwnerId) =>
  supabase.from("vehicles").select("*").eq("fleetownerid", fleetOwnerId);

export const getVehiclesByInviteCodes = (inviteCodes) =>
  supabase.from("vehicles").select("invite_code, year, mark, model").in("invite_code", inviteCodes);

export const getVehicleImagesBySignedDriverEmails = (emails) => {
  const normalizedEmails = (emails || [])
    .map((email) => (email || "").trim().toLowerCase())
    .filter(Boolean);

  if (!normalizedEmails.length) {
    return Promise.resolve({ data: [], error: null });
  }

  return supabase
    .from("vehicles")
    .select("signeddriveremail, left_img, right_img")
    .in("signeddriveremail", normalizedEmails);
};

export const updateVehicle = (vehicleId, data) =>
  supabase.from("vehicles").update(data).eq("id", vehicleId);

export const insertVehicle = (data) =>
  supabase.from("vehicles").insert(data);

// ==================== TRANSFERS ====================

export const getTransfers = (ownerId) =>
  supabase.from("transfers").select("*").eq("owner_id", ownerId);

export const getEarnings = (ownerId) =>
  supabase
    .from("transfers")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("type", "Earning");

export const insertTransfer = (data) =>
  supabase.from("transfers").insert(data).select("*").single();

// ==================== BANK DATA ====================

export const getBankData = (ownerId) =>
  supabase.from("bankdata").select("*").eq("owner_id", ownerId);

export const deleteBankData = (id, ownerId) =>
  supabase.from("bankdata").delete().eq("id", id).eq("owner_id", ownerId);

export const insertBankData = (data) =>
  supabase.from("bankdata").insert(data).select("*").single();

// ==================== ACTIVE ZONE ====================

export const getActiveZone = () =>
  supabase.from("active_zone").select("activezone");

// ==================== STORAGE ====================

export const uploadDocument = (filePath, file) =>
  supabase.storage
    .from("documents")
    .upload(filePath, file, { contentType: file.type });

export const getDocumentUrl = (filePath) =>
  supabase.storage.from("documents").getPublicUrl(filePath);

export const uploadStorageFile = (bucketName, filePath, file) =>
  supabase.storage.from(bucketName).upload(filePath, file, { upsert: true });

export const getStorageFileUrl = (bucketName, filePath) =>
  supabase.storage.from(bucketName).getPublicUrl(filePath);

// ==================== REALTIME ====================

export const subscribeToDriversAndCampaigns = (callback) =>
  supabase
    .channel("drivers-live-updates")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "drivers" },
      callback
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "campaigns" },
      callback
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "driver_location_updates" },
      callback
    )
    .subscribe();

export const removeRealtimeChannel = (channel) =>
  supabase.removeChannel(channel);
