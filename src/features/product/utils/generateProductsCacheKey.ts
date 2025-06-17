import { Request } from "express";

export function generateProductsCacheKey(req: Request): string {
  const {
    category,
    specialOfferPrice,
    isSpecialOffer,
    isBestDeal,
    isTopSelling,
    page = "1",
    limit = "10",
  } = req.query;

  const keyParts = ["products"];

  if (category) keyParts.push(`category=${category}`);
  if (specialOfferPrice) keyParts.push(`price=${specialOfferPrice}`);
  if (isSpecialOffer === "true") keyParts.push("specialOffer");
  if (isBestDeal === "true") keyParts.push("bestDeal");
  if (isTopSelling === "true") keyParts.push("topSelling");

  keyParts.push(`page=${page}`);
  keyParts.push(`limit=${limit}`);

  return keyParts.join(":");
}
