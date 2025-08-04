import { relations } from "drizzle-orm/relations";
import { shops, variations, products, productCategories, importBatches, importErrors } from "./schema";

export const variationsRelations = relations(variations, ({one}) => ({
	shop: one(shops, {
		fields: [variations.shopId],
		references: [shops.id]
	}),
	product: one(products, {
		fields: [variations.productId],
		references: [products.id]
	}),
}));

export const shopsRelations = relations(shops, ({many}) => ({
	variations: many(variations),
	productCategories: many(productCategories),
	products: many(products),
	importBatches: many(importBatches),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	variations: many(variations),
	shop: one(shops, {
		fields: [products.shopId],
		references: [shops.id]
	}),
}));

export const productCategoriesRelations = relations(productCategories, ({one}) => ({
	shop: one(shops, {
		fields: [productCategories.shopId],
		references: [shops.id]
	}),
}));

export const importBatchesRelations = relations(importBatches, ({one, many}) => ({
	shop: one(shops, {
		fields: [importBatches.shopId],
		references: [shops.id]
	}),
	importErrors: many(importErrors),
}));

export const importErrorsRelations = relations(importErrors, ({one}) => ({
	importBatch: one(importBatches, {
		fields: [importErrors.batchId],
		references: [importBatches.id]
	}),
}));