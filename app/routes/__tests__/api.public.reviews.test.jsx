// Mock dependencies — must be before imports
// IMPORTANT: The actual route imports from publicReview.server, NOT review.server
jest.mock("../../shopify.server", () => ({
    authenticate: {
        public: {
            appProxy: jest.fn(),
        },
    },
}));

jest.mock("../../services/publicReview.server", () => ({
    getPublishedReviews: jest.fn(),
    createPublicReview: jest.fn(),
    voteReview: jest.fn(),
}));

import { authenticate } from "../../shopify.server";
import { getPublishedReviews, createPublicReview } from "../../services/publicReview.server";

// Polyfill Response for JSDOM
if (typeof global.Response === 'undefined') {
    global.Response = class {
        constructor(body, init) {
            this.body = body;
            this.init = init;
            this.status = init?.status || 200;
        }
        async json() {
            return JSON.parse(this.body);
        }
        static json(data, init) {
            return new Response(JSON.stringify(data), init);
        }
    };
} else if (!Response.json) {
    Response.json = (data, init) => new Response(JSON.stringify(data), init);
}

import { loader, action } from "../api.public.reviews";

describe("Public Reviews API", () => {
    const mockRequest = (url) => ({
        url,
        json: jest.fn(),
    });

    beforeEach(() => {
        jest.clearAllMocks();
        // Ensure authenticate.public.appProxy resolves
        authenticate.public.appProxy.mockResolvedValue({});
    });

    describe("loader", () => {
        test("returns STORE reviews if productId is missing", async () => {
            const request = mockRequest("https://example.com/api/public/reviews");
            
            getPublishedReviews.mockResolvedValue({
                reviews: [],
                stats: { totalReviews: 0, averageRating: 0, distribution: {} },
                pagination: {}
            });

            const response = await loader({ request });
            const data = await response.json();

            expect(getPublishedReviews).toHaveBeenCalledWith(
                "STORE",
                expect.any(Number),
                expect.any(Number),
                "PRODUCT",
                "Newest",
                ""
            );
        });

        test("returns reviews if productId is provided", async () => {
            const request = mockRequest("https://example.com/api/public/reviews?productId=123");

            getPublishedReviews.mockResolvedValue({
                reviews: [{
                    id: "1",
                    rating: 5,
                    comment: "Good",
                    username: "User",
                    customerName: "User",
                    photos: [],
                    createdAt: new Date(),
                }],
                stats: {
                    totalReviews: 1,
                    averageRating: 5,
                    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 },
                },
                pagination: {
                    currentPage: 1,
                    totalPages: 1,
                    limit: 3,
                    totalReviews: 1,
                },
            });

            const response = await loader({ request });
            const data = await response.json();

            expect(data.reviews).toHaveLength(1);
            expect(data.reviews[0].customerName).toBe("User");
            expect(data.stats.averageRating).toBe(5);
        });
    });

    describe("action", () => {
        test("creates a new review with valid data", async () => {
            const request = mockRequest("https://example.com/api/public/reviews?shop=test.myshopify.com");
            const reviewData = {
                productId: "123",
                rating: 5,
                comment: "Love it",
                customerName: "Alice",
                email: "alice@example.com",
            };
            request.json.mockResolvedValue(reviewData);

            createPublicReview.mockResolvedValue({ id: "new-review-id" });

            await action({ request });

            expect(createPublicReview).toHaveBeenCalledWith(
                expect.objectContaining({
                    productId: "123",
                    rating: 5,
                    customerName: "Alice",
                    email: "alice@example.com",
                })
            );
        });
    });
});
