import { describe, it, expect, vi, beforeEach } from "vitest";
import cartReducer, {
  clearCart,
  fetchCart,
  removeFromCart,
} from "./cartSlice";
import api from "../api/api";
import { configureStore } from "@reduxjs/toolkit";


vi.mock("../api/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));
const createMockStore = () => {
  return configureStore({
    reducer: {
      cart: cartReducer,
    },
  });
};
//await api.get('/api/cart');
it("fetchCart success", async () => {

  api.get.mockResolvedValue({
    cartItems: [
      {
        id: "1",
        quantity: 2,
      },
    ],
    total: 500,
    itemCount: 1,
  });

  const store = createMockStore();

  await store.dispatch(fetchCart());

  const state = store.getState().cart;

  expect(api.get)
    .toHaveBeenCalledWith("/api/cart");

  expect(state.items).toHaveLength(1);

  expect(state.total).toBe(500);

  expect(state.itemCount).toBe(1);

});

describe("cartSlice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return initial state", () => {
    const state = cartReducer(undefined, {
      type: "unknown",
    });

    expect(state).toEqual({
      items: [],
      total: 0,
      itemCount: 0,
      loading: false,
      error: null,
    });
  });

  it("should clear cart", () => {
    const previousState = {
      items: [
        {
          id: "1",
          quantity: 2,
        },
      ],
      total: 1000,
      itemCount: 1,
      loading: false,
      error: null,
    };

    const state = cartReducer(
      previousState,
      clearCart()
    );

    expect(state.items).toEqual([]);
    expect(state.total).toBe(0);
    expect(state.itemCount).toBe(0);
  });

  it("should handle fetchCart.pending", () => {
    const state = cartReducer(
      undefined,
      fetchCart.pending()
    );

    expect(state.loading).toBe(true);
    expect(state.error).toBe(null);
  });

  it("should handle fetchCart.fulfilled", () => {
    const payload = {
      cartItems: [
        {
          id: "1",
          quantity: 2,
        },
      ],
      total: 500,
      itemCount: 1,
    };

    const state = cartReducer(
      undefined,
      fetchCart.fulfilled(payload)
    );

    expect(state.loading).toBe(false);
    expect(state.items).toHaveLength(1);
    expect(state.total).toBe(500);
    expect(state.itemCount).toBe(1);
  });

  it("should handle fetchCart.rejected", () => {
    const state = cartReducer(
      undefined,
      fetchCart.rejected(
        null,
        "",
        null,
        "Failed to load cart"
      )
    );

    expect(state.loading).toBe(false);
    expect(state.error).toBe(
      "Failed to load cart"
    );
  });

  it("should remove item from cart", () => {
    const previousState = {
      items: [
        {
          id: "1",
        },
        {
          id: "2",
        },
      ],
      total: 500,
      itemCount: 2,
      loading: false,
      error: null,
    };

    const state = cartReducer(
      previousState,
      removeFromCart.fulfilled("1")
    );

    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe("2");
    expect(state.itemCount).toBe(1);
  });
});