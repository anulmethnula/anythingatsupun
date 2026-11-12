import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid3X3,
  Home,
  List,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { products, type CategoryNode, type Product } from "../data/catalog";
import { ProductCard } from "../components/ProductCard";
import { CategoryNavigation } from "../components/catalog/CategoryNavigation";
import { getPublishedCategories } from "../services/categoryService";

type SortOption = "default" | "low" | "high" | "rating" | "newest";
type ViewOption = "grid" | "list";
const pageSize = 9;
const shopCollections = [
  {id:"hot-deals",name:"Hot Deals",image:"/assets/perfume.png",matches:(product:Product)=>typeof product.originalPrice==="number"&&product.originalPrice>product.price},
  {id:"top-rated",name:"Top Rated Items",image:"/assets/watch.png",matches:(product:Product)=>product.rating===5},
] as const;

export function Catalog({ search = false }: { search?: boolean }) {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = search ? (searchParams.get("q") || "").trim() : "";
  const collectionSlug = !search && !slug ? searchParams.get("collection") || "" : "";
  const shopCollection = shopCollections.find((item) => item.id === collectionSlug);
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  useEffect(() => {
    let active = true;
    getPublishedCategories().then((items) => {
      if (active) setCategoryTree(items);
    });
    return () => {
      active = false;
    };
  }, []);
  const category = categoryTree.find((item) => item.slug === slug);
  const subcategorySlug = searchParams.get("subcategory") || "";
  const subcategory = category?.children?.find(
    (item) => item.slug === subcategorySlug,
  );
  useEffect(() => {
    if (categoryTree.length && slug && !category) {
      navigate("/shop", { replace: true });
    }
  }, [categoryTree.length, slug, category, navigate]);
  useEffect(() => {
    if (!category || !subcategorySlug || subcategory) return;
    const next = new URLSearchParams(searchParams);
    next.delete("subcategory");
    setSearchParams(next, { replace: true });
  }, [category, subcategorySlug, subcategory, searchParams, setSearchParams]);
  useEffect(() => {
    if (!collectionSlug || shopCollection) return;
    const next = new URLSearchParams(searchParams);
    next.delete("collection");
    setSearchParams(next, { replace: true });
  }, [collectionSlug, shopCollection, searchParams, setSearchParams]);
  const [brands, setBrands] = useState<string[]>([]);
  const [sale, setSale] = useState(false);
  const [stock, setStock] = useState(false);
  const [sort, setSort] = useState<SortOption>("default");
  const [view, setView] = useState<ViewOption>("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const scopeProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          (!slug || product.category === slug) &&
          (!subcategory || product.subcategory === subcategory.slug) &&
          (!shopCollection || shopCollection.matches(product)) &&
          (!query ||
            `${product.name} ${product.brand}`
              .toLowerCase()
              .includes(query.toLowerCase())),
      ),
    [slug, query, subcategory, shopCollection],
  );
  const availableBrands = useMemo(
    () => [...new Set(scopeProducts.map((product) => product.brand))].sort(),
    [scopeProducts],
  );
  const scopeMax = Math.max(
    0,
    ...scopeProducts.map((product) => product.price),
  );
  const [priceMax, setPriceMax] = useState(320000);

  useEffect(() => {
    setBrands([]);
    setSale(false);
    setStock(false);
    setSort("default");
    setPage(1);
    setPriceMax(scopeMax);
  }, [slug, query, subcategorySlug, collectionSlug, scopeMax]);
  const filtered = useMemo(() => {
    const result = scopeProducts.filter(
      (product) =>
        (!brands.length || brands.includes(product.brand)) &&
        (!sale || Boolean(product.originalPrice)) &&
        (!stock || product.stock) &&
        product.price <= priceMax,
    );
    if (sort === "low") result.sort((a, b) => a.price - b.price);
    if (sort === "high") result.sort((a, b) => b.price - a.price);
    if (sort === "rating")
      result.sort((a, b) => b.rating - a.rating || b.id - a.id);
    if (sort === "newest") result.sort((a, b) => b.id - a.id);
    return result;
  }, [scopeProducts, brands, sale, stock, priceMax, sort]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const first = filtered.length ? (currentPage - 1) * pageSize + 1 : 0;
  const last = Math.min(currentPage * pageSize, filtered.length);
  const title = search
    ? `Search results for “${query}”`
    : category?.name || "Shop All Products";
  const description = search
    ? `Products matching “${query}” from the current catalogue.`
    : category
      ? category.description
      : "Browse the complete Anything at Supun product catalogue.";
  const hasFilters = brands.length > 0 || sale || stock || priceMax < scopeMax;
  const resetFilters = () => {
    setBrands([]);
    setSale(false);
    setStock(false);
    setPriceMax(scopeMax);
    setPage(1);
  };
  const toggleBrand = (brand: string) => {
    setBrands((current) =>
      current.includes(brand)
        ? current.filter((item) => item !== brand)
        : [...current, brand],
    );
    setPage(1);
  };
  const brandCounts = useMemo(
    () =>
      new Map(
        availableBrands.map((brand) => [
          brand,
          scopeProducts.filter((product) => product.brand === brand).length,
        ]),
      ),
    [availableBrands, scopeProducts],
  );

  const sidebar = (
    <aside
      id="catalog-filters"
      className={`catalog-filters ${filtersOpen ? "show" : ""}`}
      aria-label="Product filters"
    >
      <div className="catalog-filter-head">
        <span>
          <SlidersHorizontal />
          Filters
        </span>
        <button
          type="button"
          onClick={() => setFiltersOpen(false)}
          aria-label="Close filters"
        >
          <X />
        </button>
      </div>
      <div className="catalog-filter-block">
        <div className="catalog-filter-label">
          <h3>Price range</h3>
          <b>Up to Rs. {priceMax.toLocaleString("en-LK")}</b>
        </div>
        <input
          className="catalog-price-range"
          type="range"
          min="0"
          max={scopeMax || 1}
          step="100"
          value={priceMax}
          onChange={(event) => {
            setPriceMax(Number(event.target.value));
            setPage(1);
          }}
          aria-label="Maximum product price"
        />
        <div className="catalog-range-values">
          <span>Rs. 0</span>
          <span>Rs. {scopeMax.toLocaleString("en-LK")}</span>
        </div>
      </div>
      <div className="catalog-filter-block">
        <h3>Brand</h3>
        <div className="catalog-filter-options">
          {availableBrands.map((brand) => (
            <label key={brand}>
              <input
                type="checkbox"
                checked={brands.includes(brand)}
                onChange={() => toggleBrand(brand)}
              />
              <span>{brand}</span>
              <small>{brandCounts.get(brand)}</small>
            </label>
          ))}
        </div>
      </div>
      <div className="catalog-filter-block">
        <h3>Availability</h3>
        <div className="catalog-filter-options">
          <label>
            <input
              type="checkbox"
              checked={sale}
              onChange={(event) => {
                setSale(event.target.checked);
                setPage(1);
              }}
            />
            <span>On sale</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={stock}
              onChange={(event) => {
                setStock(event.target.checked);
                setPage(1);
              }}
            />
            <span>In stock</span>
          </label>
        </div>
      </div>
      <button
        className="catalog-clear"
        type="button"
        onClick={resetFilters}
        disabled={!hasFilters}
      >
        <RotateCcw />
        Clear filters
      </button>
    </aside>
  );

  return (
    <main className="catalog-page">
      <section className="catalog-hero">
        <div className="container">
          <div>
            <span>{search ? "PRODUCT SEARCH" : "SHOP COLLECTION"}</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {category && <img src={category.image} alt="" aria-hidden="true" />}
        </div>
      </section>
      <div className="container catalog-shell">
        <nav className="catalog-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">
            <Home />
            Home
          </Link>
          <ChevronRight />
          <span>{title}</span>
        </nav>
        {!search && !slug ? (
          <CategoryNavigation
            mode="links"
            label="Featured product collections"
            items={shopCollections.map((item) => {
              const active = item.id === collectionSlug;
              return {
                id: item.id,
                name: item.name,
                image: item.image,
                productCount: products.filter(item.matches).length,
                to: active ? "/shop" : `/shop?collection=${item.id}`,
                active,
              };
            })}
          />
        ) : null}
        {!search && category ? (
          <CategoryNavigation
            mode="children"
            categories={category.children}
            parent={category}
            selectedSlug={subcategorySlug}
          />
        ) : null}
        <div className="catalog-toolbar">
          <p>
            Showing{" "}
            <b>
              {first}–{last}
            </b>{" "}
            of <b>{filtered.length}</b> results
          </p>
          <button
            className="catalog-filter-trigger"
            type="button"
            onClick={() => setFiltersOpen(true)}
            aria-controls="catalog-filters"
            aria-expanded={filtersOpen}
          >
            <Filter />
            Filters{hasFilters && <i />}
          </button>
          {hasFilters && (
            <button
              className="catalog-toolbar-clear"
              type="button"
              onClick={resetFilters}
            >
              <RotateCcw />
              Clear filters
            </button>
          )}
          <div className="catalog-view-toggle" aria-label="Product view">
            <button
              type="button"
              className={view === "grid" ? "active" : ""}
              onClick={() => setView("grid")}
              aria-label="Grid view"
              aria-pressed={view === "grid"}
            >
              <Grid3X3 />
            </button>
            <button
              type="button"
              className={view === "list" ? "active" : ""}
              onClick={() => setView("list")}
              aria-label="List view"
              aria-pressed={view === "list"}
            >
              <List />
            </button>
          </div>
          <label className="catalog-sort">
            <span>Sort by</span>
            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as SortOption);
                setPage(1);
              }}
            >
              <option value="default">Default sorting</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
              <option value="rating">Most popular</option>
              <option value="newest">Newest</option>
            </select>
          </label>
        </div>
        <div className="catalog-layout">
          {sidebar}
          <section className="catalog-results" aria-live="polite">
            {visible.length ? (
              <div
                className={`product-grid catalog-product-grid ${view === "list" ? "list-view" : ""}`}
              >
                {visible.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="catalog-empty">
                <Filter />
                <h2>No matching products</h2>
                <p>Try changing or clearing your current filters.</p>
                <button type="button" onClick={resetFilters}>
                  Clear filters
                </button>
              </div>
            )}
            {pageCount > 1 && (
              <nav className="catalog-pagination" aria-label="Product pages">
                <button
                  type="button"
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft />
                </button>
                {Array.from({ length: pageCount }, (_, index) => index + 1).map(
                  (number) => (
                    <button
                      type="button"
                      key={number}
                      className={number === currentPage ? "active" : ""}
                      onClick={() => setPage(number)}
                      aria-current={number === currentPage ? "page" : undefined}
                    >
                      {number}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  onClick={() =>
                    setPage((value) => Math.min(pageCount, value + 1))
                  }
                  disabled={currentPage === pageCount}
                  aria-label="Next page"
                >
                  <ChevronRight />
                </button>
              </nav>
            )}
          </section>
        </div>
      </div>
      {filtersOpen && (
        <button
          className="catalog-filter-overlay"
          type="button"
          onClick={() => setFiltersOpen(false)}
          aria-label="Close filter drawer"
        />
      )}
    </main>
  );
}
