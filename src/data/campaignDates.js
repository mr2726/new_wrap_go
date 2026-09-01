const DEFAULT_LEAD_TIME_DAYS = 7;

const startOfDay = (date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const isValidDate = (date) => !Number.isNaN(date.getTime());

export const getOriginalCampaignStartDate = (campaign) => {
  const configuredStart = new Date(campaign?.original_start_at);
  if (campaign?.original_start_at && isValidDate(configuredStart)) {
    return startOfDay(configuredStart);
  }

  const postedAt = new Date(campaign?.created_at);
  return isValidDate(postedAt) ? addDays(startOfDay(postedAt), DEFAULT_LEAD_TIME_DAYS) : null;
};

export const getEffectiveCampaignStartDate = (campaign, now = new Date()) => {
  const frozenStart = new Date(campaign?.effective_start_at);
  if (campaign?.effective_start_at && isValidDate(frozenStart)) {
    return startOfDay(frozenStart);
  }

  const originalStart = getOriginalCampaignStartDate(campaign);
  const postedAt = new Date(campaign?.created_at);
  if (!originalStart || !isValidDate(postedAt)) return null;

  const leadTimeDays = Math.max(
    0,
    Math.round((originalStart.getTime() - startOfDay(postedAt).getTime()) / 86400000)
  );
  const rollingStart = addDays(startOfDay(now), leadTimeDays);

  return rollingStart > originalStart ? rollingStart : originalStart;
};

export const getCampaignEndDate = (campaign, now) => {
  const startDate = getEffectiveCampaignStartDate(campaign, now);
  if (!startDate) return null;

  const match = String(campaign?.duration || "").match(/^(\d+)([mdhw])$/i);
  if (!match) return startDate;

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const endDate = new Date(startDate);

  if (unit === "m") endDate.setMonth(endDate.getMonth() + value);
  else if (unit === "w") endDate.setDate(endDate.getDate() + value * 7);
  else if (unit === "d") endDate.setDate(endDate.getDate() + value);
  else endDate.setHours(endDate.getHours() + value);

  return endDate;
};