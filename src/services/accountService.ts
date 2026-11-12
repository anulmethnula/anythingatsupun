export type AccountOrder = {
  id: number;
  number: string;
  date: string;
  status: string;
  total: string;
  viewUrl: string;
  items?: Array<{
    productId: number;
    name: string;
    image: string;
    quantity: number;
    total: string;
  }>;
};

export type AccountAddress = {
  id: string;
  label: string;
  formatted: string;
  firstName: string;
  lastName: string;
  address1: string;
  city: string;
  district: string;
  postalCode: string;
  phone: string;
  isDefault?: boolean;
};

export type AccountDownload = {
  id: string;
  name: string;
  downloadUrl: string;
};

export type AccountSession = {
  customer: {
    id: number;
    name: string;
    email: string;
  };
  orders: AccountOrder[];
  addresses: AccountAddress[];
  downloads: AccountDownload[];
  logoutUrl: string;
  api?: {
    addressUrl: string;
    detailsUrl: string;
    passwordUrl: string;
    nonce: string;
  };
};

export type AccountDetailsUpdate = { name: string; email: string };
export type PasswordUpdate = {
  currentPassword: string;
  newPassword: string;
};

function isAccountSession(value: unknown): value is AccountSession {
  if (!value || typeof value !== "object") return false;
  const session = value as Partial<AccountSession>;
  return Boolean(
    session.customer &&
      typeof session.customer.id === "number" &&
      typeof session.customer.name === "string" &&
      typeof session.customer.email === "string" &&
      Array.isArray(session.orders) &&
      Array.isArray(session.addresses) &&
      Array.isArray(session.downloads) &&
      typeof session.logoutUrl === "string" &&
      (!session.api ||
        (typeof session.api.addressUrl === "string" &&
          typeof session.api.detailsUrl === "string" &&
          typeof session.api.passwordUrl === "string" &&
          typeof session.api.nonce === "string")),
  );
}

// WordPress can inject this JSON script only after validating its secure
// customer session. No account information is persisted in localStorage.
export function getCurrentAccountSession(): AccountSession | null {
  const element = document.getElementById("aas-account-session");
  if (!element?.textContent) return null;
  try {
    const value: unknown = JSON.parse(element.textContent);
    return isAccountSession(value) ? value : null;
  } catch {
    return null;
  }
}

export async function logoutAccount(session: AccountSession): Promise<void> {
  const url = new URL(session.logoutUrl, window.location.origin);
  if (url.origin !== window.location.origin) {
    throw new Error("Invalid logout URL");
  }
  const response = await fetch(url, {
    method: "POST",
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Logout failed");
}

async function accountRequest<T>(
  session: AccountSession,
  endpoint: keyof NonNullable<AccountSession["api"]>,
  body: unknown,
): Promise<T> {
  if (!session.api || endpoint === "nonce") {
    throw new Error("Account API is not configured");
  }
  const url = new URL(session.api[endpoint], window.location.origin);
  if (url.origin !== window.location.origin) throw new Error("Invalid account API URL");
  const response = await fetch(url, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-WP-Nonce": session.api.nonce,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("Account update failed");
  return response.json() as Promise<T>;
}

export const saveAccountAddress = (session: AccountSession, address: AccountAddress) =>
  accountRequest<AccountAddress>(session, "addressUrl", { action: "save", address });

export const deleteAccountAddress = (session: AccountSession, id: string) =>
  accountRequest<{ success: boolean }>(session, "addressUrl", { action: "delete", id });

export const setDefaultAccountAddress = (session: AccountSession, id: string) =>
  accountRequest<{ success: boolean }>(session, "addressUrl", { action: "set-default", id });

export const saveAccountDetails = (session: AccountSession, details: AccountDetailsUpdate) =>
  accountRequest<AccountDetailsUpdate>(session, "detailsUrl", details);

export const changeAccountPassword = (session: AccountSession, passwords: PasswordUpdate) =>
  accountRequest<{ success: boolean }>(session, "passwordUrl", passwords);
