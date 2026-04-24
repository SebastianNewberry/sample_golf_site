import { Metadata } from "next";
import GiftCardPurchaseClient from "./GiftCardPurchaseClient";

export const metadata: Metadata = {
  title: "Gift Cards | Toski Golf Academy",
  description:
    "Purchase a gift card for Toski Golf Academy. The perfect gift for golfers of all skill levels. Redeemable for any program or lesson.",
};

export default function GiftCardsPage() {
  return <GiftCardPurchaseClient />;
}
