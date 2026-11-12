import {
  buildCategoryTree,
  categoryRecords,
  type Category,
  type CategoryNode,
} from "../data/catalog";
import {fallbackProducts} from '../data/fallback/catalog';

export interface CategoryRepository {
  getPublishedCategories(): Promise<CategoryNode[]>;
}

class LocalCategoryRepository implements CategoryRepository {
  async getPublishedCategories(): Promise<CategoryNode[]> {
    const recordsWithCounts = categoryRecords.map((category) => ({
      ...category,
      productCount: fallbackProducts.filter((product) =>
        category.parentId === null
          ? product.category === category.slug
          : product.subcategory === category.slug,
      ).length,
    }));
    return buildCategoryTree(recordsWithCounts)
      .filter(
        (category) =>
          (category.productCount || 0) > 0 || category.showWhenEmpty,
      )
      .map((category) => ({
        ...category,
        children: category.children.filter(
          (child) => (child.productCount || 0) > 0 || child.showWhenEmpty,
        ),
      }));
  }
}

// Replace this repository with a WooCommerce REST implementation when the
// WordPress endpoint is available. Components do not need to change.
const categoryRepository: CategoryRepository = new LocalCategoryRepository();

export const getPublishedCategories = () =>
  categoryRepository.getPublishedCategories();

export function flattenCategories(categories: CategoryNode[]): Category[] {
  return categories.flatMap((category) => [
    category,
    ...flattenCategories(category.children),
  ]);
}
