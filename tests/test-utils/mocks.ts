import { vi } from "vitest";

export function createMockReply() {
  return {
    code: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };
}