import { describe, expect, it } from "vitest";

import QueryFilterRegex from "../../src/regexs/QueryFilterRegex.js";

describe("QueryFilterRegex", () => {
  it("accepts common text symbols in filter values", () => {
    const validFilters = [
      "email;eq;user+tag@example.com",
      "name;like;O'Connor",
      'title;like;"quoted text"',
      "formula;eq;(a+b)=c",
      "path;eq;/folder/file_name.txt",
      "windowsPath;eq;C:\\folder\\file.txt",
      "price;eq;$100.50",
      "discount;eq;50%",
      "tag;eq;#important!",
      "question;like;what?",
      "html;like;<strong>text</strong>",
      "json;like;{\"enabled\":true}",
      "range;eq;[1,2,3]",
      "math;eq;2*3^4~5",
      "code;like;`value`",
      "compound;like;A&B+C=100%@example.com<>",
      "name;like;José Álvarez",
      "field;eq;plain|email;like;user@test.com"
    ];

    validFilters.forEach((filter) => {
      expect(QueryFilterRegex.test(filter), filter).toBe(true);
    });
  });

  it("accepts the optional orGroup after the value", () => {
    expect(QueryFilterRegex.test("text;like;hello;group1")).toBe(true);
  });

  it("rejects delimiters that break the filter structure", () => {
    const invalidFilters = [
      "text;like;hello;group1;extra",
      "text;like;hello|world"
    ];

    invalidFilters.forEach((filter) => {
      expect(QueryFilterRegex.test(filter), filter).toBe(false);
    });
  });
});
