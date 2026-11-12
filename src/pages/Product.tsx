import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { money, products } from "../data/catalog";
import { useStore } from "../context/StoreContext";

type ProductTab = "details" | "reviews" | "shipping";
type ReviewForm = {
  rating: number;
  name: string;
  email: string;
  message: string;
};
const emptyReview: ReviewForm = { rating: 0, name: "", email: "", message: "" };

export function ProductPage() {
  const { id } = useParams();
  const p =
    products.find((product) => product.id === Number(id)) || products[0];
  const store = useStore();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<ProductTab>("details");
  const [selectedImage, setSelectedImage] = useState(p.image);
  const [viewerCount, setViewerCount] = useState<number | null>(null);
  const [review, setReview] = useState<ReviewForm>(emptyReview);
  const [reviewErrors, setReviewErrors] = useState<
    Partial<Record<keyof ReviewForm, string>>
  >({});
  const [reviewStatus, setReviewStatus] = useState<
    "idle" | "loading" | "error"
  >("idle");
  const [reviewError, setReviewError] = useState("");
  const relatedRef = useRef<HTMLDivElement>(null);
  const images = useMemo(() => [...new Set([p.image])], [p.image]);
  const related = useMemo(
    () =>
      products
        .filter((item) => item.id !== p.id)
        .sort(
          (a, b) =>
            Number(b.category === p.category) -
            Number(a.category === p.category),
        )
        .slice(0, 8),
    [p],
  );
  const discount = p.originalPrice
    ? Math.round((1 - p.price / p.originalPrice) * 100)
    : 0;
  const wished = store.wishlist.includes(p.id);
  useEffect(() => {
    setQty(1);
    setSelectedImage(p.image);
    setTab("details");
    setReview(emptyReview);
    setReviewErrors({});
    setReviewStatus("idle");
    setReviewError("");
  }, [p.id, p.image]);

  useEffect(() => {
    const endpoint = import.meta.env.VITE_PRODUCT_VIEWERS_ENDPOINT as
      | string
      | undefined;
    if (!endpoint) {
      setViewerCount(null);
      return;
    }

    let active = true;
    const loadViewerCount = async () => {
      try {
        const url = new URL(endpoint, window.location.origin);
        url.searchParams.set("productId", String(p.id));
        const response = await fetch(url, {
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error("Viewer count unavailable");
        const data = (await response.json()) as {
          count?: unknown;
          viewerCount?: unknown;
        };
        const count = Number(data.viewerCount ?? data.count);
        if (active) {
          setViewerCount(
            Number.isInteger(count) && count >= 0 ? count : null,
          );
        }
      } catch {
        if (active) setViewerCount(null);
      }
    };

    loadViewerCount();
    const timer = window.setInterval(loadViewerCount, 30_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [p.id]);

  const addToCart = () => {
    if (!p.stock) return;
    for (let index = 0; index < qty; index++) store.add(p);
  };
  const scrollRelated = (direction: -1 | 1) =>
    relatedRef.current?.scrollBy({
      left: direction * relatedRef.current.clientWidth * 0.82,
      behavior: "smooth",
    });
  const validateReview = () => {
    const errors: Partial<Record<keyof ReviewForm, string>> = {};
    if (!review.rating) errors.rating = "Choose a star rating.";
    if (!review.name.trim()) errors.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(review.email))
      errors.email = "Enter a valid email address.";
    if (review.message.trim().length < 10)
      errors.message = "Write at least 10 characters.";
    setReviewErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const submitReview = async (event: FormEvent) => {
    event.preventDefault();
    if (!validateReview()) return;
    const endpoint = import.meta.env.VITE_WOOCOMMERCE_REVIEWS_ENDPOINT as
      string | undefined;
    if (!endpoint) {
      setReviewStatus("error");
      setReviewError(
        "Review submission is not connected yet. Please contact our team to leave your review.",
      );
      return;
    }
    setReviewStatus("loading");
    setReviewError("");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: p.id, ...review }),
      });
      if (!response.ok) throw new Error("Review submission failed.");
      setReview(emptyReview);
      setReviewStatus("idle");
    } catch (error) {
      setReviewStatus("error");
      setReviewError(
        error instanceof Error
          ? error.message
          : "Unable to submit your review right now.",
      );
    }
  };

  return (
    <div className="container page product-page">
      <div className="breadcrumb">
        <Link to="/">Home</Link> /{" "}
        <Link to={`/category/${p.category}`}>{p.category}</Link> / {p.name}
      </div>
      <section className="pd-layout" aria-labelledby="product-title">
        <div className="pd-gallery">
          <div className="pd-thumbnails" aria-label="Product images">
            {images.map((image, index) => (
              <button
                type="button"
                key={image}
                className={selectedImage === image ? "active" : ""}
                onClick={() => setSelectedImage(image)}
                aria-label={`View product image ${index + 1}`}
                aria-pressed={selectedImage === image}
              >
                <img src={image} alt="" width="84" height="84" loading="lazy" />
              </button>
            ))}
          </div>
          <div
            className="pd-main-image"
            onMouseMove={(event) => {
              const bounds = event.currentTarget.getBoundingClientRect();
              const x = ((event.clientX - bounds.left) / bounds.width) * 100;
              const y = ((event.clientY - bounds.top) / bounds.height) * 100;
              event.currentTarget.style.setProperty("--zoom-x", `${x}%`);
              event.currentTarget.style.setProperty("--zoom-y", `${y}%`);
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.setProperty("--zoom-x", "50%");
              event.currentTarget.style.setProperty("--zoom-y", "50%");
            }}
          >
            {discount > 0 && <span className="pd-discount">-{discount}%</span>}
            <img
              src={selectedImage}
              alt={p.name}
              width="680"
              height="620"
              fetchPriority="high"
            />
          </div>
        </div>
        <div className="pd-summary">
          <span className="pd-brand">{p.brand}</span>
          <div className="pd-title-row">
            <h1 id="product-title">{p.name}</h1>
          {viewerCount !== null && viewerCount > 0 && (
            <span className="pd-viewers" role="status">
              <Eye aria-hidden="true" />
              <b>{viewerCount}</b>
              {viewerCount === 1 ? "person is" : "people are"} viewing this
              product now
            </span>
          )}
          </div>
          <div className="pd-rating" aria-label={`${p.rating} out of 5 stars`}>
            <span>
              {[1, 2, 3, 4, 5].map((number) => (
                <Star
                  key={number}
                  fill={number <= p.rating ? "currentColor" : "none"}
                />
              ))}
            </span>
            <b>{p.rating.toFixed(1)}</b>
          </div>
          <div className="pd-price">
            {p.originalPrice && <del>{money(p.originalPrice)}</del>}
            <strong>{money(p.price)}</strong>
            {discount > 0 && <span>-{discount}%</span>}
          </div>
          <p className="pd-description">{p.description}</p>
          <div className={`pd-stock ${p.stock ? "available" : "unavailable"}`}>
            <i />
            {p.stock ? "In stock" : "Out of stock"}
          </div>
          <div
            className="pd-payments"
            aria-label="Installment payment estimates"
          >
            <div>
              or 3 × <b>{money(p.price / 3)}</b> with{" "}
              <img
                src="/assets/brands/koko.png"
                alt="KOKO"
                width="50"
                height="24"
              />
            </div>
            <div>
              or up to 4 × <b>{money(p.price / 4)}</b> with{" "}
              <img
                src="/assets/brands/payzy.png"
                alt="Payzy"
                width="56"
                height="20"
              />
            </div>
          </div>
          {p.options && (
            <label className="pd-variation">
              Choose option
              <select defaultValue="">
                <option value="" disabled>
                  Select an option
                </option>
              </select>
              <small>
                Product option details are not currently available online.
              </small>
            </label>
          )}
          <div className="pd-buy-row">
            <div className="pd-quantity">
              <button
                type="button"
                onClick={() => setQty((value) => Math.max(1, value - 1))}
                aria-label="Decrease quantity"
              >
                <Minus />
              </button>
              <span aria-live="polite">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((value) => value + 1)}
                aria-label="Increase quantity"
              >
                <Plus />
              </button>
            </div>
            <button
              type="button"
              className="pd-add"
              disabled={!p.stock}
              onClick={addToCart}
            >
              <ShoppingCart />
              Add to Cart
            </button>
            <button
              type="button"
              className={`pd-wish ${wished ? "active" : ""}`}
              onClick={() => store.toggleWish(p.id)}
              aria-label={`${wished ? "Remove from" : "Add to"} wishlist`}
              aria-pressed={wished}
            >
              <Heart fill={wished ? "currentColor" : "none"} />
            </button>
          </div>
          <div className="pd-assurances">
            <span>
              <Truck />
              Islandwide delivery
            </span>
            <span>
              <ShieldCheck />
              Secure payments
            </span>
            <span>
              <RotateCcw />
              Easy returns
            </span>
          </div>
          <div className="pd-meta">
            SKU: AAS-{p.id.toString().padStart(4, "0")} · Category:{" "}
            <Link to={`/category/${p.category}`}>{p.category}</Link>
          </div>
        </div>
      </section>

      <section className="pd-info-panel">
        <div
          className="pd-tabs"
          role="tablist"
          aria-label="Product information"
        >
          {(
            [
              { id: "details", label: "Product Details" },
              { id: "reviews", label: "Reviews" },
              { id: "shipping", label: "Shipping & Returns" },
            ] as { id: ProductTab; label: string }[]
          ).map((item) => (
            <button
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={tab === item.id ? "active" : ""}
              onClick={() => setTab(item.id)}
              key={item.id}
            >
              {item.label}
            </button>
          ))}
        </div>
        {tab === "details" && (
          <div className="pd-tab-content pd-details" role="tabpanel">
            <div>
              <h2>Product Details</h2>
              <p>{p.description}</p>
            </div>
            <dl>
              <div>
                <dt>Brand</dt>
                <dd>{p.brand}</dd>
              </div>
              <div>
                <dt>Availability</dt>
                <dd>{p.stock ? "In stock" : "Out of stock"}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{p.category}</dd>
              </div>
            </dl>
          </div>
        )}
        {tab === "reviews" && (
          <div className="pd-tab-content pd-reviews" role="tabpanel">
            <div className="pd-review-summary">
              <h2>Review Summary</h2>
              <strong>
                {p.rating.toFixed(1)} <small>/ 5</small>
              </strong>
              <div className="pd-summary-stars">
                {[1, 2, 3, 4, 5].map((number) => (
                  <Star
                    key={number}
                    fill={number <= p.rating ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <p>
                No verified review count or rating distribution is available
                yet.
              </p>
              {[5, 4, 3, 2, 1].map((number) => (
                <div className="pd-rating-bar" key={number}>
                  <span>
                    {number} <Star />
                  </span>
                  <i>
                    <b style={{ width: "0%" }} />
                  </i>
                  <em>—</em>
                </div>
              ))}
            </div>
            <div className="pd-review-list">
              <h2>Customer Reviews</h2>
              <div className="pd-review-empty">
                <Star />
                <h3>No customer reviews yet</h3>
                <p>
                  Verified customer reviews will appear here when available.
                </p>
              </div>
            </div>
            <form className="pd-review-form" onSubmit={submitReview} noValidate>
              <h2>Write a Review</h2>
              <fieldset>
                <legend>Your rating</legend>
                <div className="pd-star-input">
                  {[1, 2, 3, 4, 5].map((number) => (
                    <button
                      type="button"
                      key={number}
                      onClick={() =>
                        setReview((value) => ({ ...value, rating: number }))
                      }
                      aria-label={`${number} star${number > 1 ? "s" : ""}`}
                      aria-pressed={review.rating === number}
                    >
                      <Star
                        fill={number <= review.rating ? "currentColor" : "none"}
                      />
                    </button>
                  ))}
                </div>
                {reviewErrors.rating && <small>{reviewErrors.rating}</small>}
              </fieldset>
              <label>
                Name
                <input
                  value={review.name}
                  onChange={(event) =>
                    setReview((value) => ({
                      ...value,
                      name: event.target.value,
                    }))
                  }
                  aria-invalid={Boolean(reviewErrors.name)}
                />
                {reviewErrors.name && <small>{reviewErrors.name}</small>}
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={review.email}
                  onChange={(event) =>
                    setReview((value) => ({
                      ...value,
                      email: event.target.value,
                    }))
                  }
                  aria-invalid={Boolean(reviewErrors.email)}
                />
                {reviewErrors.email && <small>{reviewErrors.email}</small>}
              </label>
              <label>
                Review
                <textarea
                  rows={4}
                  value={review.message}
                  onChange={(event) =>
                    setReview((value) => ({
                      ...value,
                      message: event.target.value,
                    }))
                  }
                  aria-invalid={Boolean(reviewErrors.message)}
                />
                {reviewErrors.message && <small>{reviewErrors.message}</small>}
              </label>
              {reviewStatus === "error" && (
                <p className="pd-form-error" role="alert">
                  {reviewError}
                </p>
              )}
              <button className="primary" disabled={reviewStatus === "loading"}>
                {reviewStatus === "loading" ? "Submitting…" : "Submit Review"}
              </button>
            </form>
          </div>
        )}
        {tab === "shipping" && (
          <div className="pd-tab-content pd-shipping" role="tabpanel">
            <div>
              <Truck />
              <h2>Islandwide Delivery</h2>
              <p>
                Delivery availability and timing are confirmed during checkout.
              </p>
            </div>
            <div>
              <RotateCcw />
              <h2>Returns</h2>
              <p>
                See our published returns policy for eligibility and
                instructions.
              </p>
              <Link to="/returns-policy">View returns policy</Link>
            </div>
          </div>
        )}
      </section>

      <section className="pd-related" aria-labelledby="related-title">
        <div className="pd-related-head">
          <h2 id="related-title">You May Be Interested In…</h2>
          <div>
            <button
              type="button"
              onClick={() => scrollRelated(-1)}
              aria-label="Previous related products"
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              onClick={() => scrollRelated(1)}
              aria-label="Next related products"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
        <div className="pd-related-track" ref={relatedRef}>
          {related.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
      </section>
    </div>
  );
}
