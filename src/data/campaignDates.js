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
  // Early wrap always wins: an actual wrap date overrides the locked booking date.
  const actualWrap = new Date(campaign?.actual_wrap_at);
  if (campaign?.actual_wrap_at && isValidDate(actualWrap)) {
    return startOfDay(actualWrap);
  }

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

// Progress % strictly bounded between 0-100, measured against fixed effective start/finish dates.
export const getCampaignProgressPercent = (campaign, now = new Date()) => {
  const startDate = getEffectiveCampaignStartDate(campaign, now);
  const endDate = getCampaignEndDate(campaign, now);
  if (!startDate || !endDate) return 0;

  const total = endDate.getTime() - startDate.getTime();
  if (total <= 0) return 100;

  const elapsed = now.getTime() - startDate.getTime();
  if (elapsed <= 0) return 0;
  if (elapsed >= total) return 100;

  return Math.min(100, Math.max(0, Math.floor((elapsed / total) * 100)));
};

// Whole days remaining until the fixed finish date, floored at 0.
export const getCampaignDaysRemaining = (campaign, now = new Date()) => {
  const endDate = getCampaignEndDate(campaign, now);
  if (!endDate) return 0;

  const remainingMs = endDate.getTime() - now.getTime();
  return Math.max(Math.ceil(remainingMs / 86400000), 0);
};