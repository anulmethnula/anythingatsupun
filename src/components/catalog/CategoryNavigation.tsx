import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { CategoryNode } from "../../data/catalog";

type CategoryNavigationProps =
  | { mode: "main"; categories: CategoryNode[] }
  | {
      mode: "links";
      items: Array<{
        id: string;
        name: string;
        image: string;
        productCount: number;
        to: string;
        active: boolean;
      }>;
      label: string;
    }
  | {
      mode: "children";
      categories: CategoryNode[];
      parent: CategoryNode;
      selectedSlug: string;
    };

function CategoryCard({
  category,
  to,
  label,
  active = false,
  eager = false,
}: {
  category: CategoryNode;
  to: string;
  label?: string;
  active?: boolean;
  eager?: boolean;
}) {
  const count = category.productCount || 0;
  return (
    <Link
      className={`catalog-subcategory-card ${active ? "active" : ""}`}
      to={to}
      aria-current={active ? "page" : undefined}
    >
      <img
        src={category.image}
        alt=""
        width="58"
        height="58"
        loading={eager ? "eager" : "lazy"}
      />
      <span className="catalog-subcategory-copy">
        <b>{label || category.name}</b>
        <small>{count} {count === 1 ? "Product" : "Products"}</small>
      </span>
      <ChevronRight aria-hidden="true" />
    </Link>
  );
}

export function CategoryNavigation(props: CategoryNavigationProps) {
  if (props.mode === "links") {
    if (!props.items.length) return null;
    return (
      <nav className="catalog-subcategories" aria-label={props.label}>
        {props.items.map((item, index) => (
          <Link
            className={`catalog-subcategory-card ${item.active ? "active" : ""}`}
            to={item.to}
            key={item.id}
            aria-current={item.active ? "page" : undefined}
          >
            <img src={item.image} alt="" width="58" height="58" loading={index === 0 ? "eager" : "lazy"}/>
            <span className="catalog-subcategory-copy"><b>{item.name}</b><small>{item.productCount} {item.productCount === 1 ? "Product" : "Products"}</small></span>
            <ChevronRight aria-hidden="true" />
          </Link>
        ))}
      </nav>
    );
  }

  if (props.mode === "main") {
    if (!props.categories.length) return null;
    return (
      <nav className="catalog-subcategories" aria-label="Product categories">
        {props.categories.map((category, index) => (
          <CategoryCard
            key={category.id}
            category={category}
            to={`/category/${category.slug}`}
            eager={index < 4}
          />
        ))}
      </nav>
    );
  }

  if (!props.categories.length) return null;
  return (
    <nav
      className="catalog-subcategories"
      aria-label={`${props.parent.name} subcategories`}
    >
      <CategoryCard
        category={props.parent}
        label={`All ${props.parent.name}`}
        to={`/category/${props.parent.slug}`}
        active={!props.selectedSlug}
        eager
      />
      {props.categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          to={`/category/${props.parent.slug}?subcategory=${category.slug}`}
          active={props.selectedSlug === category.slug}
        />
      ))}
    </nav>
  );
}
