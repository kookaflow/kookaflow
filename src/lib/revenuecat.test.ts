import { describe, it, expect } from "vitest";
import { selectNativePlans } from "./revenuecat";

const pkg = (id: string, price = "$1") => ({ identifier: id, product: { identifier: `p.${id}`, priceString: price, title: id } });

describe("selectNativePlans", () => {
  it("orders all four packages", () => {
    const r = selectNativePlans([pkg("lifetime"), pkg("basic_monthly"), pkg("pro_yearly"), pkg("pro_monthly")]);
    expect(r.map((p) => p.identifier)).toEqual(["pro_monthly", "pro_yearly", "lifetime", "basic_monthly"]);
  });
  it("works without basic", () => {
    expect(selectNativePlans([pkg("lifetime"), pkg("pro_yearly"), pkg("pro_monthly")]).map((p) => p.identifier)).toEqual(["pro_monthly", "pro_yearly", "lifetime"]);
  });
  it("handles a missing plan", () => {
    expect(selectNativePlans([pkg("lifetime"), pkg("pro_monthly")]).map((p) => p.identifier)).toEqual(["pro_monthly", "lifetime"]);
  });
  it("drops packages without price or product, and unknown ones", () => {
    const r = selectNativePlans([pkg("pro_monthly", ""), { identifier: "pro_yearly", product: null }, pkg("test_pkg"), pkg("lifetime")]);
    expect(r.map((p) => p.identifier)).toEqual(["lifetime"]);
  });
  it("empty offering", () => {
    expect(selectNativePlans([])).toEqual([]);
    expect(selectNativePlans(undefined)).toEqual([]);
  });
});
