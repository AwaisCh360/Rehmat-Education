import { describe, expect, it } from "vitest";

import { getFiltersFromSearchParams, toSingleSearchParamRecord } from "@/lib/programs/filters";

describe("filter helpers", () => {
  it("hydrates filter state from URLSearchParams", () => {
    const params = new URLSearchParams({
      search: "dentistry",
      university: "altinbas-university",
      quota: "available",
      sort: "price-asc"
    });

    expect(getFiltersFromSearchParams(params)).toMatchObject({
      search: "dentistry",
      university: "altinbas-university",
      quota: "available",
      sort: "price-asc"
    });
  });

  it("normalizes Next.js search params to flat strings", () => {
    const params = {
      search: ["dentistry"],
      page: ["2"],
      degree: "master"
    };

    expect(toSingleSearchParamRecord(params)).toEqual({
      search: "dentistry",
      page: "2",
      degree: "master"
    });
  });
});
