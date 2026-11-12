import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  Download,
  Heart,
  Home,
  LogOut,
  MapPin,
  Package,
  PackageOpen,
  Pencil,
  Plus,
  KeyRound,
  Save,
  CheckCircle2,
  Trash2,
  ShoppingBag,
  UserRound,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import {
  changeAccountPassword,
  deleteAccountAddress,
  saveAccountAddress,
  saveAccountDetails,
  setDefaultAccountAddress,
  type AccountAddress,
  type AccountOrder,
  type AccountSession,
} from "../../services/accountService";
import { sriLankanProvinces } from "../../data/locations";

type AccountSection =
  | "dashboard"
  | "orders"
  | "downloads"
  | "addresses"
  | "details";

const navigation = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "orders", label: "Orders", icon: Package },
  { id: "downloads", label: "Downloads", icon: Download },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "details", label: "Account Details", icon: UserRound },
] as const;

function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="account-empty">
      <span><PackageOpen /></span>
      <h3>{title}</h3>
      <p>{body}</p>
      {action}
    </div>
  );
}

function OrderList({ orders, limit }: { orders: AccountOrder[]; limit?: number }) {
  const visibleOrders = typeof limit === "number" ? orders.slice(0, limit) : orders;
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  return (
    <div className="account-order-list">
      {visibleOrders.map((order) => (
        <article id={`order-${order.id}`} key={order.id}>
          <div className="account-order-heading"><b>#{order.number}</b><span>{order.date}</span></div>
          <strong>{order.total}</strong>
          <button type="button" onClick={()=>setExpandedOrderId(current=>current===order.id?null:order.id)} aria-expanded={expandedOrderId===order.id}>{expandedOrderId===order.id?"Hide Details":"View Details"}</button>
          {expandedOrderId===order.id && order.items?.length ? (
            <div className="account-order-items">
              {order.items.map((item) => (
                <Link to={`/product/${item.productId}`} key={`${order.id}-${item.productId}`} aria-label={`View ${item.name}`}>
                  <img src={item.image} alt="" width="48" height="48" loading="lazy"/>
                  <span><b>{item.name}</b><small>Quantity: {item.quantity}</small></span>
                  <strong>{item.total}</strong>
                </Link>
              ))}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export function AccountDashboard({
  session,
  onLogout,
}: {
  session: AccountSession;
  onLogout: () => Promise<void>;
}) {
  const store = useStore();
  const [section, setSection] = useState<AccountSection>("dashboard");
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [customer, setCustomer] = useState(session.customer);
  const [addresses, setAddresses] = useState(session.addresses);
  const [editingAddress, setEditingAddress] = useState<AccountAddress | null>(null);
  const [addressStatus, setAddressStatus] = useState("");
  const [detailsStatus, setDetailsStatus] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");
  const { orders, downloads } = session;
  const preview = customer.id === 0;

  const logout = async () => {
    setLoggingOut(true);
    setLogoutError("");
    try {
      await onLogout();
    } catch {
      setLogoutError("We could not log you out. Please try again.");
      setLoggingOut(false);
    }
  };

  const heading = navigation.find((item) => item.id === section)?.label || "Dashboard";

  const editNewAddress = () => setEditingAddress({
    id: `new-${Date.now()}`,
    label: "Delivery Address",
    formatted: "",
    firstName: "",
    lastName: "",
    address1: "",
    city: "",
    district: "",
    postalCode: "",
    phone: "",
    isDefault: addresses.length === 0,
  });

  const submitAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingAddress) return;
    const form = new FormData(event.currentTarget);
    const next: AccountAddress = {
      ...editingAddress,
      label: String(form.get("label") || "Delivery Address"),
      firstName: String(form.get("firstName") || ""),
      lastName: String(form.get("lastName") || ""),
      address1: String(form.get("address1") || ""),
      city: String(form.get("city") || ""),
      district: String(form.get("district") || ""),
      postalCode: String(form.get("postalCode") || ""),
      phone: String(form.get("phone") || ""),
      isDefault: form.get("isDefault") === "on",
      formatted: "",
    };
    next.formatted = `${next.address1}\n${next.city}, ${next.district} ${next.postalCode}`;
    setAddressStatus("Saving…");
    try {
      const saved = preview ? next : await saveAccountAddress(session, next);
      setAddresses((current) => {
        const normalized = saved.isDefault
          ? current.map((item) => ({ ...item, isDefault: false }))
          : current;
        return normalized.some((item) => item.id === saved.id)
          ? normalized.map((item) => item.id === saved.id ? saved : item)
          : [...normalized, saved];
      });
      setEditingAddress(null);
      setAddressStatus(preview ? "Saved for this preview." : "Address saved.");
    } catch {
      setAddressStatus("Address could not be saved. Please try again.");
    }
  };

  const selectDefaultAddress = async (address: AccountAddress) => {
    if (address.isDefault) return;
    setAddressStatus("Updating checkout address…");
    try {
      if (!preview) await setDefaultAccountAddress(session, address.id);
      setAddresses((current) => current.map((item) => ({ ...item, isDefault: item.id === address.id })));
      setAddressStatus(preview ? "Default address updated for this preview." : "Default checkout address updated.");
    } catch {
      setAddressStatus("Default address could not be updated.");
    }
  };

  const removeAddress = async (address: AccountAddress) => {
    if (!window.confirm(`Delete ${address.label}?`)) return;
    setAddressStatus("Deleting address…");
    try {
      if (!preview) await deleteAccountAddress(session, address.id);
      const remaining = addresses.filter((item) => item.id !== address.id);
      if (address.isDefault && remaining.length) {
        const replacement = remaining[0];
        if (!preview) await setDefaultAccountAddress(session, replacement.id);
        remaining[0] = { ...replacement, isDefault: true };
      }
      setAddresses(remaining);
      setAddressStatus(preview ? "Address deleted from this preview." : "Address deleted.");
    } catch {
      setAddressStatus("Address could not be deleted.");
    }
  };

  const submitDetails = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const details = { name: String(form.get("name") || ""), email: String(form.get("email") || "") };
    setDetailsStatus("Saving…");
    try {
      const saved = preview ? details : await saveAccountDetails(session, details);
      setCustomer((current) => ({ ...current, ...saved }));
      setDetailsStatus(preview ? "Saved for this preview." : "Account details saved.");
    } catch {
      setDetailsStatus("Account details could not be saved.");
    }
  };

  const submitPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const currentPassword = String(form.get("currentPassword") || "");
    const newPassword = String(form.get("newPassword") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");
    if (newPassword !== confirmPassword) {
      setPasswordStatus("New passwords do not match.");
      return;
    }
    setPasswordStatus("Updating…");
    try {
      if (!preview) await changeAccountPassword(session, { currentPassword, newPassword });
      event.currentTarget.reset();
      setPasswordStatus(preview ? "Password form validated in preview mode." : "Password changed successfully.");
    } catch {
      setPasswordStatus("Password could not be changed. Check your current password.");
    }
  };

  return (
    <main className="account-dashboard-page">
      <div className="container account-dashboard-shell">
        <aside className="account-sidebar" aria-label="My Account navigation">
          <div className="account-profile-card">
            <span><UserRound /></span>
            <div><h2>{customer.name}</h2><p>{customer.email}</p></div>
          </div>
          <nav>
            {navigation.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={section === id ? "active" : ""}
                onClick={() => setSection(id)}
                aria-current={section === id ? "page" : undefined}
              >
                <Icon /><span>{label}</span>
              </button>
            ))}
            <Link to="/wishlist"><Heart /><span>Wishlist</span></Link>
            <button type="button" onClick={logout} disabled={loggingOut}>
              <LogOut /><span>{loggingOut ? "Logging out…" : "Logout"}</span>
            </button>
          </nav>
          {logoutError && <p className="account-logout-error" role="alert">{logoutError}</p>}
        </aside>

        <section className="account-dashboard-content">
          <header className="account-dashboard-hero">
            <div><span>MY ACCOUNT</span><h1>{heading}</h1><p>Welcome, {customer.name}. Manage your orders, details and preferences.</p></div>
            <img src="/assets/login-shopping-bags-logo.png" alt="" aria-hidden="true" />
          </header>

          {section === "dashboard" && (
            <>
              <div className="account-summary-grid">
                <button type="button" onClick={() => setSection("orders")}><Package /><span>Total Orders<strong>{orders.length}</strong></span><ArrowRight /></button>
                <Link to="/wishlist"><Heart /><span>Wishlist Items<strong>{store.wishlist.length}</strong></span><ArrowRight /></Link>
                <button type="button" onClick={() => setSection("addresses")}><MapPin /><span>Saved Addresses<strong>{addresses.length}</strong></span><ArrowRight /></button>
              </div>
              <div className="account-dashboard-columns">
                <section className="account-panel account-orders-panel">
                  <header><h2><Package />Recent Orders</h2><button type="button" onClick={() => setSection("orders")}>View all <ArrowRight /></button></header>
                  {orders.length ? (
                    <OrderList orders={orders} limit={3}/>
                  ) : (
                    <EmptyState title="No orders yet" body="You haven’t placed any orders yet." action={<Link className="account-primary-action" to="/shop"><ShoppingBag />Start Shopping</Link>} />
                  )}
                </section>
                <section className="account-panel account-quick-panel">
                  <header><h2><Zap />Quick Actions</h2></header>
                  <div className="account-quick-grid">
                    <Link to="/shop"><ShoppingBag /><span>Shop Products</span><ArrowRight /></Link>
                    <Link to="/wishlist"><Heart /><span>My Wishlist</span><ArrowRight /></Link>
                    <button type="button" onClick={() => setSection("addresses")}><MapPin /><span>Manage Addresses</span><ArrowRight /></button>
                    <button type="button" onClick={() => setSection("details")}><UserRound /><span>Account Details</span><ArrowRight /></button>
                  </div>
                </section>
              </div>
            </>
          )}

          {section === "orders" && <section className="account-panel account-section-panel"><header><h2><Package />Order History</h2></header>{orders.length?<OrderList orders={orders}/>:<EmptyState title="No orders yet" body="Your completed orders will appear here." action={<Link className="account-primary-action" to="/shop"><ShoppingBag />Start Shopping</Link>}/>}</section>}
          {section === "downloads" && <section className="account-panel account-section-panel"><header><h2><Download />Downloads</h2></header>{downloads.length?<div className="account-download-list">{downloads.map(item=><a key={item.id} href={item.downloadUrl}><Download /><span>{item.name}</span><ArrowRight /></a>)}</div>:<EmptyState title="No downloads available" body="Your purchased digital downloads will appear here."/>}</section>}
          {section === "addresses" ? (
            <section className="account-panel account-section-panel account-editor-panel">
              <header><h2><MapPin />Saved Addresses</h2><button type="button" onClick={editNewAddress}><Plus/>Add Address</button></header>
              {addressStatus ? <p className="account-form-status" role="status">{addressStatus}</p> : null}
              {editingAddress ? (
                <form className="account-edit-form" onSubmit={submitAddress}>
                  <div className="account-form-grid">
                    <label>Address label<input name="label" defaultValue={editingAddress.label} required/></label>
                    <label>First name<input name="firstName" autoComplete="given-name" defaultValue={editingAddress.firstName} required/></label>
                    <label>Last name<input name="lastName" autoComplete="family-name" defaultValue={editingAddress.lastName} required/></label>
                    <label className="full">Street address<input name="address1" autoComplete="street-address" defaultValue={editingAddress.address1} required/></label>
                    <label>City<input name="city" autoComplete="address-level2" defaultValue={editingAddress.city} required/></label>
                    <label>Province<select name="district" autoComplete="address-level1" defaultValue={sriLankanProvinces.some(province=>province===editingAddress.district)?editingAddress.district:""} required><option value="" disabled>Select province</option>{sriLankanProvinces.map(province=><option key={province} value={province}>{province}</option>)}</select></label>
                    <label>Postal code<input name="postalCode" autoComplete="postal-code" inputMode="numeric" defaultValue={editingAddress.postalCode} required/></label>
                    <label>Phone<input name="phone" autoComplete="tel" defaultValue={editingAddress.phone} required/></label>
                  </div>
                  <label className="account-default-check"><input type="checkbox" name="isDefault" defaultChecked={editingAddress.isDefault}/>Use this address by default at checkout</label>
                  <div className="account-form-actions"><button type="button" onClick={()=>setEditingAddress(null)}>Cancel</button><button type="submit"><Save/>Save Address</button></div>
                </form>
              ) : addresses.length ? (
                <div className="account-address-grid">{addresses.map(address=><article className={address.isDefault?"is-default":""} key={address.id}><MapPin/><div><h3>{address.label}{address.isDefault?<small>Default</small>:null}</h3><p>{address.formatted}</p><span>{address.phone}</span></div><div className="account-address-actions"><button type="button" className={address.isDefault?"selected":""} onClick={()=>selectDefaultAddress(address)} disabled={address.isDefault} aria-label={`${address.label} ${address.isDefault?"is used at checkout":"use at checkout"}`}><CheckCircle2/></button><button type="button" onClick={()=>setEditingAddress(address)} aria-label={`Edit ${address.label}`}><Pencil/></button><button type="button" className="delete" onClick={()=>removeAddress(address)} aria-label={`Delete ${address.label}`}><Trash2/></button></div></article>)}</div>
              ) : <EmptyState title="No saved addresses" body="Add an address to make checkout faster." action={<button className="account-primary-action" type="button" onClick={editNewAddress}><Plus/>Add Address</button>}/>} 
            </section>
          ) : null}
          {section === "details" && <div className="account-details-panels"><section className="account-panel account-editor-panel"><header><h2><UserRound />Account Details</h2></header>{detailsStatus?<p className="account-form-status" role="status">{detailsStatus}</p>:null}<form className="account-edit-form" onSubmit={submitDetails}><div className="account-form-grid"><label>Display name<input name="name" autoComplete="name" defaultValue={customer.name} required/></label><label>Email address<input type="email" name="email" autoComplete="email" defaultValue={customer.email} required/></label></div><div className="account-form-actions"><button type="submit"><Save/>Save Details</button></div></form></section><section className="account-panel account-editor-panel"><header><h2><KeyRound/>Change Password</h2></header>{passwordStatus?<p className="account-form-status" role="status">{passwordStatus}</p>:null}<form className="account-edit-form" onSubmit={submitPassword}><div className="account-form-grid"><label className="full">Current password<input type="password" name="currentPassword" autoComplete="current-password" required={!preview}/></label><label>New password<input type="password" name="newPassword" autoComplete="new-password" minLength={8} required/></label><label>Confirm new password<input type="password" name="confirmPassword" autoComplete="new-password" minLength={8} required/></label></div><small className="account-password-help">Use at least 8 characters. Passwords are sent only to the secure same-origin account endpoint.</small><div className="account-form-actions"><button type="submit"><KeyRound/>Change Password</button></div></form></section></div>}
        </section>
      </div>
    </main>
  );
}
