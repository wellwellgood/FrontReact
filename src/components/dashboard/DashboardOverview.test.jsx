import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { Simulate } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";
import DashboardOverview from "./DashboardOverview";
import { githubRequest } from "../github/api";
jest.mock("../navigation/DashboardHeader.jsx", () => () => null);
jest.mock("../github/api", () => ({
  githubRequest: jest.fn(),
  connectGithub: jest.fn(),
}));
jest.mock("../../util/api.js", () => ({ post: jest.fn() }));
const fixture = () => ({
  profile: { login: "tester", name: "Tester" },
  repos: [
    {
      id: 1,
      name: "alpha-web",
      description: "portfolio",
      language: "JavaScript",
      stars: 1,
      forks: 0,
    },
    {
      id: 2,
      name: "beta-ui",
      description: "react dashboard",
      language: "TypeScript",
      stars: 0,
      forks: 0,
    },
    {
      id: 3,
      name: "gamma-api",
      description: "react service",
      language: "JavaScript",
      stars: 0,
      forks: 0,
    },
  ],
  favorites: [2],
  warnings: [],
  issues: [],
  pullRequests: [],
  events: [],
  issueCount: 0,
  prCount: 0,
  fetchedAt: "2026-10-27T00:00:00Z",
});
const defer = () => {
  let resolve, reject;
  const promise = new Promise((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
};
let root, container;
beforeEach(() => {
  sessionStorage.clear();
  sessionStorage.setItem("username", "tester");
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  jest.restoreAllMocks();
});
const mount = async () => {
  await act(async () =>
    root.render(
      <MemoryRouter>
        <DashboardOverview view="projects" />
      </MemoryRouter>,
    ),
  );
};
const rows = () =>
  [...container.querySelectorAll("article h3")].map((e) => e.textContent);
const mockData = (data = fixture()) =>
  githubRequest.mockImplementation((method, path) =>
    Promise.resolve({
      data:
        path === "/status"
          ? { connected: true, configured: true, login: "tester" }
          : data,
    }),
  );
const change = async (el, value) =>
  act(async () => Simulate.change(el, { target: { value } }));
test("pending request displays loading and disables connection action", async () => {
  const pending = defer();
  githubRequest.mockReturnValue(pending.promise);
  await mount();
  expect(container.querySelector('[role="status"]').textContent).toContain(
    "불러오는 중",
  );
  expect(
    [...container.querySelectorAll("button")].find((b) =>
      b.textContent.includes("GitHub 연결"),
    ).disabled,
  ).toBe(true);
  expect(rows()).toEqual([]);
});
test("failed dashboard request shows error without demo repositories", async () => {
  githubRequest.mockImplementation((method, path) =>
    path === "/status"
      ? Promise.resolve({
          data: { connected: true, configured: true, login: "tester" },
        })
      : Promise.reject({ response: { data: { message: "조회 실패 재현" } } }),
  );
  await mount();
  expect(container.querySelector('[role="alert"]').textContent).toContain(
    "조회 실패 재현",
  );
  expect(container.textContent).toContain("데이터를 불러오지 못했습니다");
  expect(container.textContent).not.toContain("portfolio-web");
  expect(rows()).toEqual([]);
  expect(container.querySelector('[role="status"]')).toBeNull();
});
test("unconnected account gets connection guidance without dashboard fetch", async () => {
  githubRequest.mockResolvedValue({
    data: { connected: false, configured: true },
  });
  await mount();
  expect(container.textContent).toContain("아직 연결된 프로젝트가 없습니다");
  expect(githubRequest.mock.calls.map((c) => c[1])).toEqual(["/status"]);
});
test("empty successful response shows empty state instead of error", async () => {
  mockData({ ...fixture(), repos: [], favorites: [] });
  await mount();
  expect(container.textContent).toContain(
    "조건에 맞는 공개 프로젝트가 없습니다",
  );
  expect(container.querySelector('[role="alert"]')).toBeNull();
  expect(rows()).toEqual([]);
});
test("search matches name and description case-insensitively", async () => {
  mockData();
  await mount();
  const search = container.querySelector('input[placeholder="이름 또는 설명"]');
  await change(search, "ALPHA");
  expect(rows()).toEqual(["alpha-web"]);
  await change(search, "dashboard");
  expect(rows()).toEqual(["beta-ui"]);
  await change(search, "missing");
  expect(rows()).toEqual([]);
  expect(container.textContent).toContain(
    "조건에 맞는 공개 프로젝트가 없습니다",
  );
  await change(search, "");
  expect(rows()).toHaveLength(3);
});
test("language and favorites combine with search, then reset correctly", async () => {
  mockData();
  await mount();
  await change(container.querySelector("select"), "TypeScript");
  expect(rows()).toEqual(["beta-ui"]);
  await act(async () =>
    Simulate.change(container.querySelector('input[type="checkbox"]'), {
      target: { checked: true },
    }),
  );
  expect(rows()).toEqual(["beta-ui"]);
  await change(
    container.querySelector('input[placeholder="이름 또는 설명"]'),
    "alpha",
  );
  expect(rows()).toEqual([]);
  await change(
    container.querySelector('input[placeholder="이름 또는 설명"]'),
    "",
  );
  await change(container.querySelector("select"), "all");
  expect(rows()).toEqual(["beta-ui"]);
  await act(async () =>
    Simulate.change(container.querySelector('input[type="checkbox"]'), {
      target: { checked: false },
    }),
  );
  expect(rows()).toHaveLength(3);
});
test("failed favorite save retains prior selection and enables retry", async () => {
  const pending = defer();
  const data = fixture();
  githubRequest.mockImplementation((method, path) =>
    method === "put"
      ? pending.promise
      : Promise.resolve({
          data:
            path === "/status"
              ? { connected: true, configured: true, login: "tester" }
              : data,
        }),
  );
  await mount();
  const button = () =>
    container.querySelector('[aria-label="alpha-web 즐겨찾기"]');
  await act(async () => button().click());
  expect(button().disabled).toBe(true);
  expect(button().getAttribute("aria-pressed")).toBe("false");
  await act(async () => pending.reject(new Error("offline")));
  expect(container.querySelector('[role="alert"]').textContent).toContain(
    "즐겨찾기를 저장하지 못했습니다",
  );
  expect(button().getAttribute("aria-pressed")).toBe("false");
  expect(button().disabled).toBe(false);
  githubRequest.mockResolvedValueOnce({ data: { favorites: [1, 2] } });
  await act(async () => button().click());
  expect(button().getAttribute("aria-pressed")).toBe("true");
  expect(container.querySelector('[role="alert"]')).toBeNull();
});
test("late dashboard response after unmount does not update another mount", async () => {
  const pending = defer();
  githubRequest.mockImplementation((method, path) =>
    path === "/status"
      ? Promise.resolve({
          data: { connected: true, configured: true, login: "tester" },
        })
      : pending.promise,
  );
  await mount();
  act(() => root.unmount());
  root = createRoot(container);
  mockData({ ...fixture(), repos: [], favorites: [] });
  await mount();
  await act(async () => pending.resolve({ data: fixture() }));
  expect(rows()).toEqual([]);
});
