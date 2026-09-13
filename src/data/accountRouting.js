import {
  checkFleetByUserId,
  getDriverByEmail,
  getDriverByUserId,
  getProfileField,
} from "./service";

const isMissingColumnError = (error) => {
  const message = (error?.message || "").toLowerCase();
  return message.includes("column") || message.includes("does not exist");
};

export const getAccountDestination = async (user) => {
  if (user.user_metadata?.role === "fleet-owner") {
    const { data: existingFleet } = await checkFleetByUserId(user.id);
    return existingFleet ? "fleet-content" : "fleet-signup";
  }

  const { data: fleet, error: fleetError } = await checkFleetByUserId(user.id);

  if (!fleetError && fleet) {
    return "fleet-content";
  }

  const { data: driverByUserId, error: driverByUserIdError } = await getDriverByUserId(user.id);

  if (!driverByUserIdError && driverByUserId) {
    return "drivers-download";
  }

  if (driverByUserIdError && !isMissingColumnError(driverByUserIdError)) {
    return "signin";
  }

  const { data: driverByEmail, error: driverByEmailError } = await getDriverByEmail((user.email || "").toLowerCase());

  if (!driverByEmailError && driverByEmail) {
    return "drivers-download";
  }

  if (driverByEmailError && !isMissingColumnError(driverByEmailError)) {
    return "signin";
  }

  const { data: profile, error: profileError } = await getProfileField(user.id, "auntufication");

  if (!profileError && profile) {
    return "content";
  }

  return "company-info";
};

export const resolveAuthPage = async (session) => {
  if (!session?.user) {
    return "signin";
  }

  if (!session.user.email_confirmed_at) {
    return "confirm-email";
  }

  return getAccountDestination(session.user);
};
