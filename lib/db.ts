import booksFile from "@/app/data/books.json";
import reviewsFile from "@/app/data/reviews.json";
import { Book, Review, NewBookInput, NewReviewInput } from "./types";

type BooksJson = { books: Book[] };
type ReviewsJson = { reviews: Review[] };

// In-memory stores (ephemeral; reset on server restart/redeploy)
let books: Book[] = (booksFile as unknown as BooksJson).books.slice();
let reviews: Review[] = (reviewsFile as unknown as ReviewsJson).reviews.slice();

export function getBooks(): Book[] {
    return books.slice();
}

export function getBookById(id: string): Book | undefined {
    return books.find((b) => b.id === id);
}

export function getReviewsByBookId(bookId: string): Review[] {
    return reviews.filter((r) => r.bookId === bookId);
}

export function getFeaturedBooks(): Book[] {
    return books.filter((b) => b.featured === true);
}

export function getBooksPublishedBetween(start: Date, end: Date): Book[] {
    const startMs = start.getTime();
    const endMs = end.getTime();
    return books.filter((b) => {
        const t = new Date(b.datePublished).getTime();
        return t >= startMs && t <= endMs;
    });
}

export function getTopRatedBooks(limit = 10): Book[] {
    return books
        .slice()
        .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount)
        .slice(0, limit);
}

export function addBook(input: NewBookInput): Book {
    const id = crypto.randomUUID();
    const book: Book = {
        id,
        title: input.title,
        author: input.author,
        description: input.description,
        price: input.price,
        image: input.image,
        isbn: input.isbn,
        genre: input.genre ?? [],
        tags: input.tags ?? [],
        datePublished: input.datePublished,
        pages: input.pages,
        language: input.language,
        publisher: input.publisher,
        rating: input.rating ?? 0,
        reviewCount: input.reviewCount ?? 0,
        inStock: input.inStock,
        featured: input.featured ?? false,
    };
    books.unshift(book);
    return book;
}

export function addReview(input: NewReviewInput): Review {
    // Validate book existence
    const book = getBookById(input.bookId);
    if (!book) {
        throw new Error("Book not found for the provided bookId");
    }

    const id = crypto.randomUUID();
    const review: Review = {
        id,
        bookId: input.bookId,
        author: input.author,
        rating: input.rating,
        title: input.title,
        comment: input.comment,
        timestamp: input.timestamp ?? new Date().toISOString(),
        verified: input.verified ?? false,
    };
    reviews.unshift(review);

    // Update aggregate rating/reviewCount
    const related = getReviewsByBookId(input.bookId);
    const total = related.length;
    const avg = total === 0 ? 0 : related.reduce((s, r) => s + r.rating, 0) / total;
    book.reviewCount = total;
    book.rating = Math.round(avg * 100) / 100;

    return review;
}
