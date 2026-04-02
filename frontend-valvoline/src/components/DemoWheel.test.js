import {
  render,
  fireEvent,
  waitFor,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import LuckyWheel from "./LuckyWheel";
import "@testing-library/jest-dom";
import axios from "axios";

// 1. Mock لـ Axios باش ما يخرجش 400 Error
jest.mock("axios");

// 2. Mock للصوت والميديا
window.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
window.HTMLMediaElement.prototype.pause = jest.fn();
window.HTMLMediaElement.prototype.load = jest.fn();

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const mockPrizes = [
  { _id: "1", name: "TV 55", isAvailable: false, stockRestant: 1 },
  { _id: "2", name: "Kit National", isAvailable: true, stockRestant: 29 },
  { _id: "3", name: "tirage au sort", isAvailable: true, stockRestant: 999 },
];

describe("LuckyWheel Component Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // إقناع السيرفر إنو كل شيء مريغل
    axios.get.mockResolvedValue({ data: { success: true, data: mockPrizes } });
    axios.put.mockResolvedValue({ data: { success: true } });

    // Mock لـ fetch زادة للأمان
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockPrizes }),
      }),
    );
  });

  it("يجب أن لا تكون نتيجة الربح كادو غير متاح", async () => {
    render(<LuckyWheel prizes={mockPrizes} />);

    // نستناو الـ Loading يوفى
    await waitForElementToBeRemoved(() => screen.queryByText(/جاري تحميل/i));

    const spinButton = screen.getByText(/إضغط للربح!/i);
    fireEvent.click(spinButton);

    await waitFor(
      () => {
        // نثبتو إنو الـ Popup متاع SweetAlert ظهرت
        const swalPopup = document.querySelector(".swal2-popup");
        expect(swalPopup).toBeInTheDocument();

        // نثبتو إنو النص اللي داخل الـ Popup (النتيجة) ماهوش TV 55
        const resultText = document.querySelector(
          "#swal2-html-container",
        )?.textContent;
        // التيست ينجح لو النتيجة موش TV 55
        expect(resultText).not.toBe("TV 55");
      },
      { timeout: 10000 },
    );
  }, 15000);

  it("يجب أن تظهر رسالة الربح عند توقف العجلة", async () => {
    render(<LuckyWheel prizes={mockPrizes} />);

    await waitForElementToBeRemoved(() => screen.queryByText(/جاري تحميل/i));

    const spinButton = screen.getByText(/إضغط للربح!/i);
    fireEvent.click(spinButton);

    await waitFor(
      () => {
        expect(document.querySelector(".swal2-popup")).toBeInTheDocument();
      },
      { timeout: 10000 },
    );
  }, 15000);
});
