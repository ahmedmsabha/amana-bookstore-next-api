export type Book = {
    id: string;
    title: string;
    author: string;
    description: string;
    price: number;
    image: string;
    isbn: string;
    genre: string[];
    tags: string[];
    datePublished: string; // ISO date (YYYY-MM-DD)
    pages: number;
    language: string;
    publisher: string;
    rating: number; // 0..5
    reviewCount: number; // integer
    inStock: boolean;
    featured: boolean;
};

export type Review = {
    id: string;
    bookId: string;
    author: string;
    rating: number; // 0..5
    title: string;
    comment: string;
    timestamp: string; // ISO datetime
    verified: boolean;
};

export type NewBookInput = Omit<Book, "id" | "rating" | "reviewCount" | "featured"> & {
    featured?: boolean;
    rating?: number;
    reviewCount?: number;
};

export type NewReviewInput = Omit<Review, "id" | "timestamp" | "verified"> & {
    timestamp?: string;
    verified?: boolean;
};
