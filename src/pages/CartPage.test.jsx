import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSelector } from "react-redux";
import CartPage from "./CartPage";
import '@testing-library/jest-dom';

const mockNavigate = vi.fn();
const mockDispatch = vi.fn();

vi.mock("react-redux", () => ({
  useSelector: vi.fn(),
  useDispatch: () => mockDispatch,
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../components/layout/Header", () => ({
  default: () => <div>Header</div>,
}));

vi.mock("../components/layout/Footer", () => ({
  default: () => <div>Footer</div>,
}));

vi.mock("./CartAISuggestions", () => ({
  default: () => <div>AI Suggestions</div>,
}));

vi.mock("../store/cartSlice", () => ({
  fetchCart: vi.fn(() => ({ type: "cart/fetch" })),
  removeFromCart: vi.fn((id) => ({ type: "cart/remove", payload: id })),
  updateCartItem: vi.fn((payload) => ({
    type: "cart/update",
    payload,
  })),
  clearCartApi: vi.fn(() => ({
    type: "cart/clear",
  })),
  selectCartItems: (state) => state.cart.items,
  selectCartTotal: (state) => state.cart.total,
  selectCartLoading: (state) => state.cart.loading,
  selectCartError: (state) => state.cart.error,
}));

vi.mock("../store/authSlice", () => ({
  selectCurrentUser: (state) => state.auth.user,
  selectIsLoggedIn: (state) => state.auth.isLoggedIn,
}));

const cartItem = {
  id: 1,
  quantity: 2,
  product: {
    id: 10,
    name: "iPhone",
    category: "Electronics",
    price: 1000,
    discount: 10,
    image: "iphone.jpg",
  },
};

beforeEach(() => {
  vi.clearAllMocks();
});

function mockState(state) {
  useSelector.mockImplementation((selector) =>
    selector(state)
  );
}

describe("CartPage", () => {

  it("shows empty cart message", () => {
    mockState({
      auth: {
        isLoggedIn: true,
        user: { id: 1 },
      },
      cart: {
        items: [],
        total: 0,
        loading: false,
        error: null,
      },
    });
    const { container } = render(<CartPage />);

    screen.debug();   

    expect(
      screen.getByText("Your cart is empty")
    ).to.exist;
  });

  it("shows loading state", () => {
    mockState({
      auth: {
        isLoggedIn: true,
        user: { id: 1 },
      },
      cart: {
        items: [],
        total: 0,
        loading: true,
        error: null,
      },
    });

    const { container } = render(<CartPage />);

screen.debug();

    expect(
      screen.getByText("Loading cart...")
    ).toBeInTheDocument();
  });

  it("redirects user to login when not authenticated", () => {
    mockState({
      auth: {
        isLoggedIn: false,
        user: null,
      },
      cart: {
        items: [],
        total: 0,
        loading: false,
        error: null,
      },
    });

    const { container } = render(<CartPage />);

    screen.debug();

    expect(mockNavigate)
      .toHaveBeenCalledWith("/login");
  });

  it("increases quantity", async () => {
    const user = userEvent.setup();

    mockState({
      auth: {
        isLoggedIn: true,
        user: { id: 1 },
      },
      cart: {
        items: [cartItem],
        total: 1800,
        loading: false,
        error: null,
      },
    });

    const { container } = render(<CartPage />);

    const btn =
      screen.getByLabelText(
        "Increase quantity"
      );

    await user.click(btn);

    expect(mockDispatch)
      .toHaveBeenCalled();
  });

  it("decreases quantity", async () => {
    const user = userEvent.setup();

    mockState({
      auth: {
        isLoggedIn: true,
        user: { id: 1 },
      },
      cart: {
        items: [cartItem],
        total: 1800,
        loading: false,
        error: null,
      },
    });

    const { container } = render(<CartPage />);

    const btn =
      screen.getByLabelText(
        "Decrease quantity"
      );

    await user.click(btn);

    expect(mockDispatch)
      .toHaveBeenCalled();
  });

  it("removes item from cart", async () => {
    const user = userEvent.setup();

    mockState({
      auth: {
        isLoggedIn: true,
        user: { id: 1 },
      },
      cart: {
        items: [cartItem],
        total: 1800,
        loading: false,
        error: null,
      },
    });

    const { container } = render(<CartPage />);

    const btn =
      screen.getByLabelText(
        "Remove item"
      );

    await user.click(btn);

    expect(mockDispatch)
      .toHaveBeenCalled();
  });

  it("navigates to checkout", async () => {
    const user = userEvent.setup();

    mockState({
      auth: {
        isLoggedIn: true,
        user: { id: 1 },
      },
      cart: {
        items: [cartItem],
        total: 1800,
        loading: false,
        error: null,
      },
    });

    const { container } = render(<CartPage />);

    const btn =
      screen.getByLabelText(
        "Proceed to checkout"
      );

    await user.click(btn);

    expect(mockNavigate)
      .toHaveBeenCalledWith(
        "/checkout"
      );
  });
});