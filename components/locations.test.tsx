import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Locations } from "./locations";

const mocks = vi.hoisted(() => ({ trackWhatsAppClick: vi.fn() }));

vi.mock("@/lib/data", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/data")>()),
  trackWhatsAppClick: mocks.trackWhatsAppClick,
}));

describe("Locations", () => {
  let container: HTMLDivElement | undefined;

  afterEach(() => {
    container?.remove();
    container = undefined;
    mocks.trackWhatsAppClick.mockReset();
  });

  it("captures the stable branch ID before the WhatsApp handoff", () => {
    container = document.createElement("div");
    const root = createRoot(container);

    act(() => root.render(<Locations />));
    const contactButton = container.querySelector("button");
    expect(contactButton).not.toBeNull();

    act(() =>
      contactButton?.dispatchEvent(new MouseEvent("click", { bubbles: true })),
    );

    expect(mocks.trackWhatsAppClick).toHaveBeenCalledWith(
      "Roma Norte",
      expect.stringContaining("wa.me"),
      undefined,
      { branchId: "condesa" },
    );
    act(() => root.unmount());
  });
});
